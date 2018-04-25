import * as React from "react";

import { ReactTestRenderer, ReactTestRendererJSON, create } from "react-test-renderer";

import { AnimationCycleFrame } from "./AnimationCycle";
import { test } from "tap";

test("render/jsx/components/AnimationCycle", test => {
	test.test("AnimationCycleFrame :: ({ children :: (Number -> JSX.Element), frame :: Number }) -> JSX.Element", test => {
		const element = React.createElement(AnimationCycleFrame, {
			frame: 2,
			children: (frame: number): JSX.Element => React.createElement("p", {}, `Frame: ${frame}`)
		});
		const renderer = create(element);
		const json = renderer.toJSON();
		test.equal(json!.type, "p");
		test.equal(json!.children!.length, 1);
		test.equal(json!.children![0], "Frame: 2");
		test.end();
	});
	test.test("AnimationCycle :: ({ children :: JSX.Element[], frame :: Number }) -> JSX.Element", test => {
		const element = React.createElement(AnimationCycleFrame, {
			frame: 2,
			children: [
				React.createElement("p", {}, `Frame: 0`),
				React.createElement("p", {}, `Frame: 1`),
				React.createElement("p", {}, `Frame: 2`)
			]
		});
		const renderer = create(element);
		const json = renderer.toJSON();
		test.equal(json!.type, "p");
		test.equal(json!.children!.length, 1);
		test.equal(json!.children![0], "Frame: 2");
		test.end();
	});
	test.end();
});
