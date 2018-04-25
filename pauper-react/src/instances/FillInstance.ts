import * as React from 'react';

import { Fill, FrameCommand } from '@morleydev/pauper-render/render-frame.model';
import { RGB, RGBA } from '@morleydev/pauper-core/models/colour.model';

import { Instance } from './Instance';
import { Shape2 } from '@morleydev/pauper-core/models/shapes.model';
import { shallowCompare } from '../util/shallowCompare';

export type FillInstanceProps = {
	readonly shape: Shape2;
	readonly colour: RGB | RGBA;
};

export default class FillInstance extends Instance<FillInstanceProps> {
	public draw(): FrameCommand {
		return Fill(this.props.shape, this.props.colour);
	}

	public shouldInvalidate(lhs: FillInstanceProps, rhs: FillInstanceProps): boolean {
		return !shallowCompare(lhs.shape, rhs.shape) || !shallowCompare(lhs.colour, rhs.colour);
	}
}
