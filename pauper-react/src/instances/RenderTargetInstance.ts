import * as React from "react";

import { FrameCommand, RenderTarget } from "@morleydev/pauper-render/render-frame.model";
import { Point2, Rectangle } from "@morleydev/pauper-core/models/shapes.model";

import { HasChildrenInstance } from "./HasChildrenInstance";
import { RGB } from "@morleydev/pauper-core/models/colour.model";
import { Vector2 } from "@morleydev/pauper-core/maths/vector.maths";
import { shallowCompare } from "../util/shallowCompare";

export type RenderTargetProps = {
	id: string;
	dst: Rectangle;
	size?: Vector2;
};

export default class RenderTargetInstance extends HasChildrenInstance<RenderTargetProps> {
	frame?: FrameCommand;

	invalidate(fromChild: boolean) {
		if (!fromChild) {
			this.parent && this.parent.invalidate(true);
		} else {
			this.frame = undefined;
		}
	}

	draw(): FrameCommand {
		if (this.frame == null) {
			this.frame = RenderTarget(this.props.id, this.props.dst, this.children.map(child => child.draw()), this.props.size);
			return this.frame;
		} else {
			return RenderTarget(this.props.id, this.props.dst);
		}
	}

	shouldInvalidate(lhs: RenderTargetProps, rhs: RenderTargetProps): boolean {
		return lhs.id !== rhs.id
			|| !shallowCompare(lhs.dst, rhs.dst)
			|| !shallowCompare(lhs.size, rhs.size);
	}
}
