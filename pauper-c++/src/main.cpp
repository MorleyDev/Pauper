#include "Javascript/JavascriptEngine.hpp"
#include "Javascript/TimerExtensions.hpp"
#include "Javascript/ConsoleExtensions.hpp"
#include "Javascript/WorkerExtensions.hpp"
#include "Javascript/SfmlExtensions.hpp"
#include "Javascript/Box2dExtensions.hpp"
#include "Javascript/UtilityExtensions.hpp"
#include "Profile/Profiler.hpp"
#include "Concurrent/TaskQueue.hpp"

#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>

#include <string>
#include <iostream>
#include <chrono>
#include <unordered_map>
#include <vector>
#include <fstream>

int run(std::vector<std::string> arguments);

int main_synchronous(std::vector<std::string> arguments);
int main_concurrent(std::vector<std::string> arguments);

int main(int argc, char** argv) {
	std::vector<std::string> args;
	args.resize(argc);
	for (auto i = 0; i < argc; ++i) args[i] = std::string(argv[i]);
	return run(args);
}

int run(std::vector<std::string> arguments) {
	if (std::find(arguments.begin(), arguments.end(), "--multithreaded") != arguments.end()) {
		return main_concurrent(arguments);
	}
	else {
		return main_synchronous(arguments);
	}
}

auto startsWith(std::string prefix) {
	return [prefix](std::string whole) {
		return whole.length() >= prefix.length() && whole.substr(0, prefix.length()) == prefix;
	};
}


template<typename TB, typename TR>
std::string findArg(TB start, TR end, std::string argname, std::string defaultValue)
{
	const auto prefixLen = argname.length() + 3;
	const auto found = std::find_if(start, end, startsWith("--" + argname + "="));

	return (found == end) ? defaultValue : found->substr(prefixLen, found->size() - prefixLen);
}

int main_synchronous(std::vector<std::string> arguments) {
	TaskQueue mainThreadTasks;
	TaskQueue tasks;

	std::ofstream cerr("./stderr.log");
	std::ofstream profilerOutput("./profiler.log");

	Sfml sfml("GAM", sf::VideoMode(512, 512), tasks, mainThreadTasks);
	Box2d box2d;

	Profiler mainProfiler("Engine");
	JavascriptEngine primaryEngine(mainProfiler, [&sfml, &box2d](JavascriptEngine& engine) {
		attachConsole(engine);
		attachTimers(engine);
		attachUtility(engine);

		attachSfml(engine, sfml);
		attachBox2d(engine, box2d);
	});

	std::atomic<bool> cancellationToken(false);
	auto threads = spawnTaskProcessorPool(tasks, cancellationToken);

	try {
		const auto primaryjs = findArg(arguments.begin(), arguments.end(), "main", "./dist/engine/sfml/index.js");
		primaryEngine.load(primaryjs);

		const auto startTime = std::chrono::system_clock::now();
		auto previousSecond = startTime;
		auto previousTime = startTime;
		auto previousFrame = startTime - std::chrono::milliseconds(5);
		auto fps = 0;
		while (sfml.window.isOpen()) {
			auto currentTime = std::chrono::system_clock::now();
			auto diffMilliseconds = std::chrono::duration<double>(currentTime - previousTime).count() * 1000;
			if (diffMilliseconds >= 1) {
				previousTime = currentTime;

				mainProfiler.profile("Tick", [&]() { tick(primaryEngine, diffMilliseconds); });
				mainProfiler.profile("PollEvents", [&]() { pollEvents(primaryEngine, sfml); });
			} else {
				mainProfiler.profile("Idle(Yield)", [&]() { primaryEngine.idle(); });
				std::this_thread::yield();
			}

			if (std::chrono::duration<double>(currentTime - previousFrame).count() >= 0.005) {
				mainProfiler.profile("Animate", [&]() { animate(primaryEngine); sfml.window.display(); ++fps; });

				previousFrame = currentTime;
			}

			if (std::chrono::duration<double>(currentTime - previousSecond).count() >= 1) {
				sfml.window.setTitle(std::string("FPS: ") + std::to_string(fps / std::chrono::duration<double>(currentTime - previousSecond).count()));
				fps = 0;

				mainProfiler.profile("Idle(Forced)", [&]() { primaryEngine.idle(); });
				primaryEngine.checkFileSystem();
				std::this_thread::yield();

				previousSecond = currentTime;
			};

			const auto stoppedSound = std::find_if(sfml.activeSoundEffects.begin(), sfml.activeSoundEffects.end(), [](const std::unique_ptr<sf::Sound>& sound) { return sound->getStatus() == sf::SoundSource::Stopped; });
			if (stoppedSound != sfml.activeSoundEffects.end()) {
				sfml.activeSoundEffects.erase(stoppedSound);
			}

			mainThreadTasks.consume(100);
		}
		cancellationToken.store(true);

		std::for_each(threads.begin(), threads.end(), [](std::thread& thread) { thread.join(); });
		mainProfiler.iodump(profilerOutput);
		return 0;
	}
	catch (const std::exception &err)
	{
		cerr << "UNHANDLED EXCEPTION: " << err.what() << std::endl;

		cancellationToken.store(true);
		std::for_each(threads.begin(), threads.end(), [](std::thread& thread) { thread.join(); });
		return 1;
	}
}

int main_concurrent(std::vector<std::string> arguments) {
	TaskQueue mainThreadTasks;
	TaskQueue tasks;
	std::atomic<bool> cancellationToken(false);

	Profiler mainProfiler("Main");
	Profiler secondaryProfiler("Secondary");

	moodycamel::ConcurrentQueue<std::string> secondaryQueue;
	moodycamel::ConcurrentQueue<std::string> workQueue;

	const auto startTime = std::chrono::system_clock::now();

	Sfml sfml("GAM", sf::VideoMode(512, 512), tasks, mainThreadTasks);
	Box2d box2d;

	JavascriptEngine primaryEngine(mainProfiler, [&sfml, &box2d, &secondaryQueue, &workQueue](JavascriptEngine& engine) {
		attachConsole(engine);
		attachTimers(engine);
		attachUtility(engine);
		attachWorkers(engine, workQueue);

		attachSfml(engine, sfml);
		attachBox2d(engine, box2d);

		engine.add("secondary", "SECONDARY_Receive = function () { }; SECONDARY_Join = function () { };");
		engine.setGlobalFunction("SECONDARY_Emit", [&secondaryQueue](JavascriptEngine* engine) {
			secondaryQueue.enqueue(engine->getargstr(0));
			return false;
		}, 1);
	});
	primaryEngine.releaseCurrentThread();

	auto workers = spawnWorkers(primaryEngine, cancellationToken, mainThreadTasks, workQueue);
	auto threads = spawnTaskProcessorPool(tasks, cancellationToken);
	std::unique_ptr<std::thread> secondaryThread;
	try {
		const auto primaryjs = findArg(arguments.begin(), arguments.end(), "main", "./dist/engine/sfml/index.js");
		const auto secondaryjs = findArg(arguments.begin(), arguments.end(), "main", "./dist/engine/sfml/secondary.js");
		const auto workerjs = findArg(arguments.begin(), arguments.end(), "main", "./dist/engine/sfml/worker.js");

		std::for_each(workers.begin(), workers.end(), [workerjs](std::unique_ptr<JavascriptWorker>& worker) {
			worker->load(workerjs);
		});
		std::for_each(workers.begin(), workers.end(), [](std::unique_ptr<JavascriptWorker>& worker) {
			worker->start();
		});

		primaryEngine.bindToThread();
		primaryEngine.load(primaryjs);

		secondaryThread = std::make_unique<std::thread>([&cancellationToken, &secondaryProfiler, &box2d, &secondaryQueue, &mainThreadTasks, &primaryEngine, &workQueue, secondaryjs]() {
			JavascriptEngine secondaryEngine(secondaryProfiler, [&mainThreadTasks, &box2d, &primaryEngine, &workQueue](JavascriptEngine& engine) {
				attachConsole(engine);
				attachTimers(engine);
				attachUtility(engine);

				attachBox2d(engine, box2d);
				attachWorkers(engine, workQueue);

				engine.add("secondary", "SECONDARY_Receive = function () { }; SECONDARY_Join = function () { };");
				engine.setGlobalFunction("SECONDARY_Emit", [&mainThreadTasks, &primaryEngine](JavascriptEngine* ctx) {
					auto msg = ctx->getargstr(0);
					mainThreadTasks.push([msg, &primaryEngine]() { primaryEngine.trigger("SECONDARY_Receive", msg); });
					return false;
				}, 1);
			});
			try {
				secondaryEngine.load(secondaryjs);

				auto previousTime = std::chrono::system_clock::now();
				std::string msg;
				while (!cancellationToken) {
					auto currentTime = std::chrono::system_clock::now();
					auto deltaTime = std::chrono::duration<double>(currentTime - previousTime).count() * 1000;
					if (deltaTime >= 1) {
						secondaryProfiler.profile("Tick", [&]() { tick(secondaryEngine, deltaTime); });
						secondaryProfiler.profile("Animate", [&]() { animate(secondaryEngine); });
					}
					while (!cancellationToken && secondaryQueue.try_dequeue(msg)) {
						secondaryEngine.trigger("SECONDARY_Receive", msg);
					}
					secondaryEngine.checkFileSystem();
					secondaryEngine.idle();
					std::this_thread::yield();
				}
				secondaryEngine.trigger("SECONDARY_Join", secondaryProfiler.getName());
			}
			catch (const std::exception &err)
			{
				std::cerr << "UNHANDLED EXCEPTION IN SECONDARY THREAD: " << err.what() << std::endl;
			}
		});


		auto previousSecond = startTime;
		auto previousTime = startTime;
		auto previousFrame = startTime - std::chrono::milliseconds(5);

		auto fps = 0;
		while (sfml.window.isOpen()) {
			auto currentTime = std::chrono::system_clock::now();
			auto diffMilliseconds = std::chrono::duration<double>(currentTime - previousTime).count() * 1000;
			if (diffMilliseconds >= 1) {
				previousTime = currentTime;

				mainProfiler.profile("Tick", [&]() { tick(primaryEngine, diffMilliseconds); });
				mainProfiler.profile("PollEvents", [&]() { pollEvents(primaryEngine, sfml); });
			} else {
				mainProfiler.profile("Idle(Yield)", [&]() {
					primaryEngine.idle();
				});
			}

			if (std::chrono::duration<double>(currentTime - previousFrame).count() >= 0.005) {
				mainProfiler.profile("Animate", [&]() { animate(primaryEngine); sfml.window.display(); });
				++fps;

				previousFrame = currentTime;
			}

			if (std::chrono::duration<double>(currentTime - previousSecond).count() >= 1) {
				sfml.window.setTitle(std::string("FPS: ") + std::to_string(fps / std::chrono::duration<double>(currentTime - previousSecond).count()));
				fps = 0;

				mainProfiler.profile("Idle(Forced)", [&]() { primaryEngine.idle(); });
				primaryEngine.checkFileSystem();
				std::this_thread::yield();

				previousSecond = currentTime;
			};

			const auto stoppedSound = std::find_if(sfml.activeSoundEffects.begin(), sfml.activeSoundEffects.end(), [](const std::unique_ptr<sf::Sound>& sound) { return sound->getStatus() == sf::SoundSource::Stopped; });
			if (stoppedSound != sfml.activeSoundEffects.end()) {
				sfml.activeSoundEffects.erase(stoppedSound);
			}

			mainThreadTasks.consume(100);
		}
		cancellationToken.store(true);
		secondaryThread->join();
		std::for_each(threads.begin(), threads.end(), [](std::thread& thread) { thread.join(); });
		std::for_each(workers.begin(), workers.end(), [](std::unique_ptr<JavascriptWorker>& worker) { worker->join(); });

		mainProfiler.iodump(std::cout);
		secondaryProfiler.iodump(std::cout);
		std::for_each(workers.begin(), workers.end(), [](std::unique_ptr<JavascriptWorker>& worker) { worker->getProfiler().iodump(std::cout); });

		return 0;
	}
	catch (const std::exception &err)
	{
		std::cerr << "UNHANDLED EXCEPTION: " << err.what() << std::endl;
		cancellationToken.store(true);
		std::for_each(threads.begin(), threads.end(), [](std::thread& thread) { thread.join(); });
		std::for_each(workers.begin(), workers.end(), [](std::unique_ptr<JavascriptWorker>& worker) { worker->join(); });
		if (secondaryThread) secondaryThread->join();
		return 1;
	}
}
