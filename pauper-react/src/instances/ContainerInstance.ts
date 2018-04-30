import { FrameCollection } from "@morleydev/pauper-render/render-frame.model";
import { HasChildrenInstance } from "./HasChildrenInstance";

export default class ContainerInstance extends HasChildrenInstance<undefined> {
	draw(): FrameCollection {
		return this.children.map(child => child.draw());
	}

	shouldInvalidate(originalProps: undefined, newProps: undefined): boolean {
		return false;
	}
}
