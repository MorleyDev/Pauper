import * as React from 'react';

import { FrameCommand, Rotate } from '@morleydev/pauper-render/render-frame.model';

import { HasChildrenInstance } from './HasChildrenInstance';
import { Radian } from '@morleydev/pauper-core/maths/angles.maths';
import { Vector2 } from '@morleydev/pauper-core/maths/vector.maths';

export type RotateProps = {
	radians: Radian;
	children?: React.ReactNode,
};

export default class RotateInstance extends HasChildrenInstance<RotateProps> {
	draw(): FrameCommand {
		return Rotate(this.props.radians, this.children.map(child => child.draw()))
	}

	shouldInvalidate(lhs: RotateProps, rhs: RotateProps): boolean {
		return lhs.radians !== rhs.radians;
	}
}
