import * as React from "react";

import { Clear, FrameCollection } from "@morleydev/pauper-render/render-frame.model";

import { HasChildrenInstance } from "./HasChildrenInstance";
import { RGB } from "@morleydev/pauper-core/models/colour.model";
import { compareRGB } from "../util/compareRGB";
import { shallowCompare } from "../util/shallowCompare";

export type ClearProps = {
	colour?: RGB;
	children?: React.ReactNode,
};

export default class ClearInstance extends HasChildrenInstance<ClearProps> {
	draw(): FrameCollection {
		return [
			Clear(this.props.colour),
			this.children.map(child => child.draw())
		];
	}

	shouldInvalidate(lhs: ClearProps, rhs: ClearProps): boolean {
		return !compareRGB(lhs.colour, rhs.colour);
	}
}
