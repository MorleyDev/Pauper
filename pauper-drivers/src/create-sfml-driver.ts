import * as React from "react";

import { Driver } from "./driver";
import { Rectangle } from "@morleydev/pauper-core/models/shapes.model";
import { SfmlAssetLoader } from "@morleydev/pauper-core/assets/sfml-asset-loader.service";
import { SfmlAudioService } from "@morleydev/pauper-core/audio/sfml-audio.service";
import { SfmlKeyboard } from "@morleydev/pauper-core/input/SfmlKeyboard";
import { SfmlMouse } from "@morleydev/pauper-core/input/SfmlMouse";
import { SfmlSystem } from "@morleydev/pauper-core/input/SfmlSystem";
import { Vector2 } from "@morleydev/pauper-core/maths/vector.maths";
import { render } from "@morleydev/pauper-react/render";
import { renderToSfml } from "@morleydev/pauper-render/render-to-sfml.func";
import { sfml } from "@morleydev/pauper-core/engine/sfml";

export const createSfmlDriver = (): Driver => {
	const assets = new SfmlAssetLoader();
	const input = {
		keyboard: new SfmlKeyboard(),
		mouse: new SfmlMouse(),
		system: new SfmlSystem()
	};
	const audio = new SfmlAudioService();

	return ({
		assets,
		input,
		audio,
		start: elem => {
			const renderer = render(elem);
			let cancel = requestAnimationFrame(function draw() {
				const frames = renderer();
				renderToSfml(assets, frames);
				cancel = requestAnimationFrame(draw);
			});
			sfml.input.start();

			return () => cancelAnimationFrame(cancel);
		},
		close: () => sfml.close(),
		resize: (size: Vector2) => {
			sfml.screen.setSize(size);
			sfml.screen.setView(Rectangle(0, 0, size.x, size.y));
		}
	});
};

