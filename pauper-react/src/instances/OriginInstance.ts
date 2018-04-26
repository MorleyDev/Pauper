import * as React from "react";

import { FrameCommand, Origin } from "@morleydev/pauper-render/render-frame.model";

import { HasChildrenInstance } from "./HasChildrenInstance";
import { Vector2 } from "@morleydev/pauper-core/maths/vector.maths";

export type OriginProps = {
	coords: Vector2;
	children?: React.ReactNode,
};

export default class OriginInstance extends HasChildrenInstance<OriginProps> {
	draw(): FrameCommand {
		return Origin(this.props.coords, this.children.map(child => child.draw()));
	}

	shouldInvalidate(lhs: OriginProps, rhs: OriginProps): boolean {
		return lhs.coords.x !== rhs.coords.x || lhs.coords.y !== rhs.coords.y;
	}
}
