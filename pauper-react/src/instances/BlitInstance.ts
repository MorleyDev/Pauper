import * as React from "react";

import { Blit, FrameCommand } from "@morleydev/pauper-render/render-frame.model";
import { Point2, Rectangle } from "@morleydev/pauper-core/models/shapes.model";

import { Instance } from "./Instance";
import { RGB } from "@morleydev/pauper-core/models/colour.model";
import { shallowCompare } from "../util/shallowCompare";

export type BlitProps = {
	image: string;
	dst: Point2 | Rectangle;
	src?: Rectangle;
};

export default class BlitInstance extends Instance<BlitProps> {
	draw(): FrameCommand {
		return Blit(this.props.image, this.props.dst, this.props.src);
	}

	shouldInvalidate(lhs: BlitProps, rhs: BlitProps): boolean {
		return lhs.image !== rhs.image || !shallowCompare(lhs.dst, rhs.dst) || !shallowCompare(lhs.src, rhs.src);
	}
}
