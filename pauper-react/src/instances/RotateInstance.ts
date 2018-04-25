import * as React from 'react';
import { Rotate, Frame } from '@morleydev/pauper-render/render-frame.model';
import { Vector2 } from '@morleydev/pauper-core/maths/vector.maths';
import { Radian } from '@morleydev/pauper-core/maths/angles.maths';
import { HasChildrenInstance } from './HasChildrenInstance';

export type RotateProps = {
	radians: Radian;
	children?: React.ReactNode,
};

export default class RotateInstance extends HasChildrenInstance<RotateProps> {
	draw(): any {
		return Rotate(this.props.radians, this.children.map(child => child.draw()))
	}
}
