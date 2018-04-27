import * as React from "react";

import { Driver } from "./driver";
import { HtmlDocumentKeyboard } from "@morleydev/pauper-core/input/HtmlDocumentKeyboard";
import { HtmlElementMouse } from "@morleydev/pauper-core/input/HtmlElementMouse";
import { HtmlWindowSystem } from "@morleydev/pauper-core/input/HtmlWindowSystem";
import { WebAssetLoader } from "@morleydev/pauper-core/assets/web-asset-loader.service";
import { WebAudioService } from "@morleydev/pauper-core/audio/web-audio.service";
import { render } from "@morleydev/pauper-react/render";
import { renderToCanvas } from "@morleydev/pauper-render/render-to-canvas.func";

export const createWebDriver = (): Driver => {
	const canvas = document.getElementById("pauper-canvas") as HTMLCanvasElement | null;
	if (canvas == null) {
		throw new Error("Could not find #pauper-canvas element");
	}
	const context = canvas.getContext("2d");
	if (context == null) {
		throw new Error("Could not get 2d rendering context");
	}
	const assets = new WebAssetLoader();
	const input = {
		keyboard: new HtmlDocumentKeyboard(document),
		mouse: new HtmlElementMouse(canvas),
		system: new HtmlWindowSystem(window)
	};
	const audio = new WebAudioService();

	return ({
		assets,
		input,
		audio,
		start: elem => {
			const renderer = render(elem);
			let cancel = requestAnimationFrame(function draw() {
				const frames = renderer();
				renderToCanvas({ assets, canvas, context, document }, frames);
				cancel = requestAnimationFrame(draw);
			});
			return () => cancelAnimationFrame(cancel);
		}
	});
};

