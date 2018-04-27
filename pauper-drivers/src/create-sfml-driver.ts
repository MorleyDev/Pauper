import * as React from "react";

import { Driver } from "./driver";
import { SfmlAssetLoader } from "@morleydev/pauper-core/assets/sfml-asset-loader.service";
import { SfmlKeyboard } from "@morleydev/pauper-core/input/SfmlKeyboard";
import { SfmlMouse } from "@morleydev/pauper-core/input/SfmlMouse";
import { SfmlSystem } from "@morleydev/pauper-core/input/SfmlSystem";
import { render } from "@morleydev/pauper-react/render";
import { renderToSfml } from "@morleydev/pauper-render/render-to-sfml.func";

export const createSfmlDriver = (): Driver => {
	const assets = new SfmlAssetLoader();
	const input = {
		keyboard: new SfmlKeyboard(),
		mouse: new SfmlMouse(),
		system: new SfmlSystem()
	};

	return ({
		assets,
		input,
		start: elem => {
			const renderer = render(elem);
			let cancel = requestAnimationFrame(function draw() {
				const frames = renderer();
				renderToSfml(assets, frames);
				cancel = requestAnimationFrame(draw);
			});
			return () => cancelAnimationFrame(cancel);
		}
	});
};

