import * as React from 'react';
import { Clear, Frame } from '@morleydev/pauper-render/render-frame.model';
import { RGB } from '@morleydev/pauper-core/models/colour.model';
import { HasChildrenInstance } from './HasChildrenInstance';

export type ClearProps = {
	colour?: RGB;
	children?: React.ReactNode,
};

export default class ClearInstance extends HasChildrenInstance<ClearProps> {
	draw() {
		return [
			Clear(this.props.colour),
			this.children.map(child => child.draw())
		];
	}
}
