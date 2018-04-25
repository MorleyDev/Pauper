import * as React from 'react';
import { Shape2 } from '@morleydev/pauper-core/models/shapes.model';
import { RGB, RGBA } from '@morleydev/pauper-core/models/colour.model';
import { FrameCommand, Fill, Frame } from '@morleydev/pauper-render/render-frame.model';
import { Instance } from './Instance';

export type FillInstanceProps = {
	readonly shape: Shape2;
	readonly colour: RGB | RGBA;
};

export default class FillInstance extends Instance<FillInstanceProps> {
	draw(): any {
		return Fill(this.props.shape, this.props.colour);
	}
}
