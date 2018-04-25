import * as React from 'react';

import { Instance } from './Instance';

export abstract class HasChildrenInstance<T> extends Instance<T> {
	children: any[] = [];

	// Append a child for the first render
	appendInitialChild(child: any) {
		child.parent = this;
		this.children.push(child);
	}

	// Add a child to the end of existing list of children
	appendChild(child: any) {
		child.parent = this;
		this.children.push(child);
		this.invalidate(false);
	}

	// Remove a child from the existing list of children
	removeChild(child: any) {
		this.children = this.children.filter(c => c !== child);
		this.invalidate(false);
	}

	// Insert a child before another child in the list of children
	insertBefore(child: any, childBefore: any) {
		this.children.splice(this.children.indexOf(childBefore), 0, child);
		this.invalidate(false);
	}
}
