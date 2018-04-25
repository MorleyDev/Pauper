import { Frame } from "@morleydev/pauper-render/render-frame.model";

export default class ContainerInstance {
	children: any[] = [];

	invalidate() {
	}

	// Add a child to the end of existing list of children
	appendChild(child: any) {
		child.parent = this;

		this.children.push(child);
	}

	// Remove a child from the list of children
	removeChild(child: any) {
		this.children = this.children.filter(c => c !== child);
	}

	// Insert a child before another child in the list of children
	insertBefore(child: any, childBefore: any) {
		child.parent = this;

		this.children.splice(this.children.indexOf(childBefore), 0, child);
	}

	draw() {
		return this.children.map(child => child.draw());	
	}
}