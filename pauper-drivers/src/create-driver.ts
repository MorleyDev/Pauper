import { Driver } from "./driver";
import { createSfmlDriver } from "./create-sfml-driver";
import { createWebDriver } from "./create-web-driver";
import { sfml } from "@morleydev/pauper-core/engine/sfml";

export const createDriver = (): Driver => {
	if (sfml.available) {
		return createSfmlDriver();
	} else if (typeof document !== "undefined" && typeof window !== "undefined" && document.body != null) {
		return createWebDriver();
	} else {
		throw new Error("Could not create driver")
	}
}