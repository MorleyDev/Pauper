#ifndef DUKSFML_SFMLEXTENSIONS_HPP
#define DUKSFML_SFMLEXTENSIONS_HPP

#include <map>
#include <vector>
#include <string>
#include <memory>

#include <SFML/Graphics/RenderWindow.hpp>
#include <SFML/Graphics/View.hpp>

#include "../Sfml/SfmlAssetStore.hpp"
#include "../Concurrent/TaskQueue.hpp"

#include "DukJavascriptEngine.hpp"
#ifdef GAM_CHAKRA_ENABLE
#include "ChakraJavascriptEngine.hpp"
#endif//GAM_CHAKRA_ENABLE

struct Sfml {
	Sfml(std::string title, sf::VideoMode video, TaskQueue& tasks, TaskQueue& mainThreadTasks);

	sf::RenderWindow window;
	std::vector<sf::Transform> stack;
	SfmlAssetStore assetStore;
	std::vector<std::unique_ptr<sf::Sound>> activeSoundEffects;
	std::map<std::string, std::shared_ptr<sf::RenderTexture>> renderTextures;
	std::vector<std::pair<std::shared_ptr<sf::RenderTexture>, std::vector<sf::Transform>>> renderStack;
	sf::View view;
};

extern void attachSfml(DukJavascriptEngine &engine, Sfml &sfml);
extern void pollEvents(DukJavascriptEngine &engine, Sfml &sfml);

#ifdef GAM_CHAKRA_ENABLE
extern void attachSfml(ChakraJavascriptEngine &engine, Sfml &sfml);
extern void pollEvents(ChakraJavascriptEngine &engine, Sfml &sfml);
#endif

#endif //DUKSFML_SFMLEXTENSIONS_HPP
