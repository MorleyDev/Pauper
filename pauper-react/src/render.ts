import * as React from "react";
import FrameRenderer from "./FrameRenderer";
import ContainerInstance from "./instances/ContainerInstance";
import { Frame } from "@morleydev/pauper-render/render-frame.model";
import { RGB, RGBA } from "@morleydev/pauper-core/models/colour.model";
import { Shape2, Rectangle, Point2 } from "@morleydev/pauper-core/models/shapes.model";
import { Vector2 } from "@morleydev/pauper-core/maths/vector.maths";
import { Radian } from "@morleydev/pauper-core/maths/angles.maths";

export function render(element: React.ReactNode, callback?: Function): () => Frame {
	const instance = new ContainerInstance();
	const container = FrameRenderer.createContainer(instance);

	FrameRenderer.updateContainer(element, container, null, callback);
	return () => instance.draw();
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			clear: { key?: string | number; colour: RGB; children?: any };
			fill: { key?: string | number; shape: Shape2; colour: RGB | RGBA };
			stroke: { key?: string | number; shape: Shape2; colour: RGB | RGBA };
			blit: { key?: string | number; image: string; dst: Point2 | Rectangle; src?: Rectangle };
			rendertarget: { key?: string | number; id: string; dst: Rectangle; size?: Vector2; children?: any };
			origin: { key?: string | number; coords: Vector2; children?: any };
			rotate: { key?: string | number; radians: Radian; children?: any };
			scale: { key?: string | number; by: Vector2; children?: any };
		}
	}
}
