import * as React from 'react';

import { Frame, FrameCommand, Stroke } from '@morleydev/pauper-render/render-frame.model';
import { RGB, RGBA } from '@morleydev/pauper-core/models/colour.model';

import { Instance } from './Instance';
import { Shape2 } from '@morleydev/pauper-core/models/shapes.model';
import { compareColour } from '../util/compareRGB';
import { shallowCompare } from '../util/shallowCompare';

export type StrokeInstanceProps = {
	readonly shape: Shape2;
	readonly colour: RGB | RGBA;
};

export default class StrokeInstance extends Instance<StrokeInstanceProps> {
	draw(): any {
		return Stroke(this.props.shape, this.props.colour);
	}

	shouldInvalidate(lhs: StrokeInstanceProps, rhs: StrokeInstanceProps): boolean {
		return !compareColour(lhs.colour, rhs.colour) || !shallowCompare(lhs.shape, rhs.shape);
	}
}
