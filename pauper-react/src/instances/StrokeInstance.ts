import * as React from 'react';
import { Shape2 } from '@morleydev/pauper-core/models/shapes.model';
import { RGB, RGBA } from '@morleydev/pauper-core/models/colour.model';
import { FrameCommand, Stroke, Frame } from '@morleydev/pauper-render/render-frame.model';
import { Instance } from './Instance';

export type StrokeInstanceProps = {
	readonly shape: Shape2;
	readonly colour: RGB | RGBA;
};

export default class StrokeInstance extends Instance<StrokeInstanceProps> {
	draw(): any {
		return Stroke(this.props.shape, this.props.colour);
	}
}
