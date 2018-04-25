import * as React from 'react';
import { Scale, Frame } from '@morleydev/pauper-render/render-frame.model';
import { Vector2 } from '@morleydev/pauper-core/maths/vector.maths';
import { HasChildrenInstance } from './HasChildrenInstance';

export type ScaleProps = {
	by: Vector2;
	children?: React.ReactNode,
};

export default class ScaleInstance extends HasChildrenInstance<ScaleProps> {
	draw(): any {
		return Scale(this.props.by, this.children.map(child => child.draw()))
	}
}
