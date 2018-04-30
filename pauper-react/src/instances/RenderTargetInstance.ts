import * as React from "react";

import { FrameCommand, RenderTarget } from "@morleydev/pauper-render/render-frame.model";
import { Point2, Rectangle } from "@morleydev/pauper-core/models/shapes.model";

import { HasChildrenInstance } from "./HasChildrenInstance";
import { RGB } from "@morleydev/pauper-core/models/colour.model";
import { Vector2 } from "@morleydev/pauper-core/maths/vector.maths";
import { shallowCompare } from "../util/shallowCompare";
import { uniqueId } from "@morleydev/pauper-core/utility/unique-id";
import { FrameRendererHooks } from "../FrameRendererHooks";

export type RenderTargetProps = {
	readonly id?: string;
	readonly dst: Rectangle;
	readonly size?: Vector2;
};

export default class RenderTargetInstance extends HasChildrenInstance<RenderTargetProps> {
	private frame?: FrameCommand;
	private id: string = this.props.id || uniqueId().toString();

	replaceProps(props: RenderTargetProps) {
		if (props.id !== this.props.id) {
			this.hooks.onDestroyRenderTarget(this.id);
			this.id = props.id || uniqueId().toString();
		}
		super.replaceProps({ ...props });
	}

	invalidate(fromChild: boolean) {
		if (fromChild) {
			this.frame = undefined;
		}
		this.parent && this.parent.invalidate(true);
	}

	draw(): FrameCommand {
		if (this.frame == null) {
			this.frame = RenderTarget(this.id, this.props.dst, this.children.map(child => child.draw()), this.props.size);
			return this.frame;
		} else {
			return RenderTarget(this.id, this.props.dst);
		}
	}

	shouldInvalidate(lhs: RenderTargetProps, rhs: RenderTargetProps): boolean {
		return lhs.id !== rhs.id
			|| !shallowCompare(lhs.dst, rhs.dst)
			|| !shallowCompare(lhs.size, rhs.size);
	}

	dispose() {
		this.hooks.onDestroyRenderTarget(this.id);
	}
}
