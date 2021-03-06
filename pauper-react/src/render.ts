import * as React from "react";

import { Point2, Rectangle, Shape2 } from "@morleydev/pauper-core/models/shapes.model";
import { RGB, RGBA } from "@morleydev/pauper-core/models/colour.model";

import ContainerInstance from "./instances/ContainerInstance";
import { FrameCollection } from "@morleydev/pauper-render/render-frame.model";
import { createFrameRenderer } from "./FrameRenderer";
import { Radian } from "@morleydev/pauper-core/maths/angles.maths";
import { Vector2 } from "@morleydev/pauper-core/maths/vector.maths";
import { FrameRendererHooks } from "./FrameRendererHooks";

export function render(element: React.ReactNode, hooks?: Partial<FrameRendererHooks>, callback?: Function): () => FrameCollection {
	const h = {
		onDestroyRenderTarget: (id: string) => { },
		...(hooks || { }),
	};
	const renderer = createFrameRenderer(h);
	const instance = new ContainerInstance("container", undefined, h);
	const container = renderer.createContainer(instance);

	renderer.updateContainer(element, container, null, callback);
	return () => instance.draw();
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			clear: { key?: string | number; colour: RGB; children?: any };
			fill: { key?: string | number; shape: Shape2; colour: RGB | RGBA };
			stroke: { key?: string | number; shape: Shape2; colour: RGB | RGBA };
			blit: { key?: string | number; image: string; dst: Point2 | Rectangle; src?: Rectangle };
			rendertarget: { key?: string | number; id?: string; dst: Rectangle; size?: Vector2; children?: any };
			origin: { key?: string | number; coords: Vector2; children?: any };
			rotate: { key?: string | number; radians: Radian; children?: any };
			scale: { key?: string | number; by: Vector2; children?: any };
			group: { key?: string | number; children?: any };
		}
	}
}
