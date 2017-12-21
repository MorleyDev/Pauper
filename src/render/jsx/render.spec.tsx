import * as React from "react";

import { Blit, Clear, Stroke } from "../render-frame.model";
import { Circle, Rectangle } from "../../models/shapes.model";
import { RGB, RGBA } from "../../models/colour.model";

import { ReactRenderer } from "./render";
import { createElement } from "react";
import { test } from "tap";

test("render/jsx/render", test => {
	const renderer = new ReactRenderer(
		<clear colour={RGB(0, 0, 0)}>
			<blit dst={Rectangle(-25, -25, 100, 50)} image="test_image.png"></blit>
			<stroke shape={Circle(0, 0, 25)} colour={RGBA(100, 200, 100, 0.5)}></stroke>
		</clear>
	);

	const frame = renderer.frame();
	test.deepEqual(frame, [
		Clear(RGB(0, 0, 0)),
		[
			Blit("test_image.png", Rectangle(-25, -25, 100, 50)),
			Stroke(Circle(0, 0, 25), RGBA(100, 200, 100, 0.5))
		]
	]);
	test.end();
});
