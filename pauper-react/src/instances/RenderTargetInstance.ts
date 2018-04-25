import * as React from 'react';
import { Frame, RenderTarget } from '@morleydev/pauper-render/render-frame.model';
import { RGB } from '@morleydev/pauper-core/models/colour.model';
import { Point2, Rectangle } from '@morleydev/pauper-core/models/shapes.model';
import { Vector2 } from '@morleydev/pauper-core/maths/vector.maths';

export type RenderTargetProps = {
	id: string;
    dst: Rectangle;
    size?: Vector2;
};

export default class RenderTargetInstance {
	children: any[] = [];
	parent: any;
	frame?: Frame;

	constructor(public props: RenderTargetProps) {
	}

	invalidate() {
		this.frame = undefined;
        this.parent.invalidate();
	}

	// Append a child for the first render
	appendInitialChild(child: any) {
		child.parent = this;
		this.children.push(child);
	}

	// Add a child to the end of existing list of children
	appendChild(child: any) {
		child.parent = this;
		this.children.push(child);
		this.invalidate();
	}

	// Remove a child from the existing list of children
	removeChild(child: any) {
		this.children = this.children.filter(c => c !== child);
		this.invalidate();
	}

	// Insert a child before another child in the list of children
	insertBefore(child: any, childBefore: any) {
		this.children.splice(this.children.indexOf(childBefore), 0, child);
		this.invalidate();
	}

	// Update the props with new props
	replaceProps(newProps: RenderTargetProps) {
		this.props = newProps;
	}

	draw(): any {
		if (this.frame == null) {
			this.frame = RenderTarget(this.props.id, this.props.dst, this.children.map(child => child.draw()), this.props.size);
    		return this.frame;
		} else {
			return RenderTarget(this.props.id, this.props.dst);
        }
	}
}
