import * as React from 'react';
import { Blit, Frame } from '@morleydev/pauper-render/render-frame.model';
import { RGB } from '@morleydev/pauper-core/models/colour.model';
import { Point2, Rectangle } from '@morleydev/pauper-core/models/shapes.model';
import { Instance } from './Instance';

export type BlitProps = {
	image: string;
	dst: Point2 | Rectangle;
	src?: Rectangle;
};

export default class BlitInstance extends Instance<BlitProps> {
	draw(): any {
		return Blit(this.props.image, this.props.dst, this.props.src);
	}
}
