import * as React from 'react';

import { FrameCommand, Scale } from '@morleydev/pauper-render/render-frame.model';

import { HasChildrenInstance } from './HasChildrenInstance';
import { Vector2 } from '@morleydev/pauper-core/maths/vector.maths';
import { shallowCompare } from '../util/shallowCompare';

export type ScaleProps = {
	by: Vector2;
	children?: React.ReactNode,
};

export default class ScaleInstance extends HasChildrenInstance<ScaleProps> {
	draw(): FrameCommand {
		return Scale(this.props.by, this.children.map(child => child.draw()));
	}

	shouldInvalidate(lhs: ScaleProps, rhs: ScaleProps): boolean {
		return lhs.by.x != rhs.by.x || lhs.by.y !== rhs.by.y;
	}
}
