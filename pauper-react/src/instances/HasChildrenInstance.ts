import * as React from "react";

import { Instance } from "./Instance";

export abstract class HasChildrenInstance<T> extends Instance<T> {
	children: any[] = [];

	// Append a child for the first render
	appendInitialChild(child: Instance<T>) {
		child.parent = this;
		this.children.push(child);
	}

	// Add a child to the end of existing list of children
	appendChild(child: Instance<T>) {
		child.parent = this;
		this.children.push(child);
		this.invalidate(false);
	}

	// Remove a child from the existing list of children
	removeChild(child: Instance<T>) {
		const targetIndex = this.children.findIndex(c => c === child);
		this.children[targetIndex].dispose();
		this.children.splice(targetIndex, 1);
		this.invalidate(false);
	}

	// Insert a child before another child in the list of children
	insertBefore(child: Instance<T>, childBefore: Instance<T>) {
		this.children.splice(this.children.indexOf(childBefore), 0, child);
		this.invalidate(false);
	}

	dispose() {
		this.children.forEach(child => child.dispose());
	}
}
