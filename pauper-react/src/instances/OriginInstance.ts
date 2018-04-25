import * as React from 'react';
import { Origin, Frame } from '@morleydev/pauper-render/render-frame.model';
import { Vector2 } from '@morleydev/pauper-core/maths/vector.maths';
import { HasChildrenInstance } from './HasChildrenInstance';

export type OriginProps = {
	coords: Vector2;
	children?: React.ReactNode,
};

export default class OriginInstance extends HasChildrenInstance<OriginProps> {
	draw(): any {
		return Origin(this.props.coords, this.children.map(child => child.draw()));
	}
}
