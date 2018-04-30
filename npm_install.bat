pushd .\pauper-core
	del node_modules
	call yarn
	call yarn run compile
popd

pushd .\pauper-render
	del node_modules
	call yarn
	call yarn run compile
popd

pushd .\pauper-react
	del node_modules
	call yarn
	call yarn run compile
popd

pushd .\pauper-drivers
	del node_modules
	call yarn
	call yarn run compile
popd

pushd .\pauper-c++
	pushd testscripts
		del node_modules
		call yarn
		call yarn run compile:dev
	popd
popd
