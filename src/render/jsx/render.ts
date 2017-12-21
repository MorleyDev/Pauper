import * as React from "react";

import { Blit, Clear, Fill, Frame, FrameCollection, FrameCommand, Origin, RenderTarget, Rotate, Scale, Stroke } from "../render-frame.model";
import { Point2, Rectangle, Shape2 } from "../../models/shapes.model";
import { RGB, RGBA } from "../../models/colour.model";
import { ReactTestRenderer, ReactTestRendererJSON, create } from "react-test-renderer";

import { Radian } from "../../maths/angles.maths";
import { Vector2 } from "../../maths/vector.maths";

export class ReactRenderer {
	private renderer: ReactTestRenderer;

	constructor(element: JSX.Element) {
		this.renderer = create(element);
	}

	public frame(): Frame {
		const json = this.renderer.toJSON();
		return json != null ? jsonToFrame(json) : [];
	}
}

function jsonToFrame(json: ReactTestRendererJSON): FrameCommand | FrameCollection {
	switch (json.type) {
		case "clear":
			return [
				Clear(json.props["colour"] || RGB(0, 0, 0)),
				(json.children || []).map(jsonToFrame)
			];
		case "origin":
			return Origin(json.props["coords"], (json.children || []).map(jsonToFrame));
		case "rotate":
			return Rotate(json.props["radians"], (json.children || []).map(jsonToFrame));
		case "scale":
			return Scale(json.props["by"], (json.children || []).map(jsonToFrame));
		case "fill":
			return Fill(json.props["shape"], json.props["colour"]);
		case "stroke":
			return Stroke(json.props["shape"], json.props["colour"]);
		case "blit":
			return Blit(json.props["image"], json.props["dst"], json.props["src"]);
		case "renderTarget":
			return RenderTarget(json.props["dst"], (json.children || []).map(jsonToFrame), json.props["size"]);
		default:
			return (json.children || []).map(jsonToFrame);
	}
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			clear: { colour: RGB; children?: any };
			origin: { coords: Vector2; children?: any };
			rotate: { radians: Radian; children?: any };
			scale: { by: Vector2; children?: any };
			fill: { shape: Shape2; colour: RGB | RGBA };
			stroke: { shape: Shape2; colour: RGB | RGBA };
			blit: { image: string; dst: Point2 | Rectangle; src?: Rectangle };
			renderTarget: { dst: Rectangle; size?: Vector2; children?: any };
		}
	}
}
