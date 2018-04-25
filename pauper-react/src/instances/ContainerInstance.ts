import { Frame } from "@morleydev/pauper-render/render-frame.model";
import { HasChildrenInstance } from "./HasChildrenInstance";

export default class ContainerInstance extends HasChildrenInstance<undefined> {
	children: any[] = [];

	invalidate() {
	}

	draw() {
		return this.children.map(child => child.draw());	
	}

	shouldInvalidate(originalProps: undefined, newProps: undefined): boolean {
		return false;
	}
}
