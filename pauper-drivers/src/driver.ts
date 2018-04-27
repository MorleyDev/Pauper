import * as React from "react";

import { AssetLoader } from "@morleydev/pauper-core/assets/asset-loader.service";
import { Keyboard } from "@morleydev/pauper-core/input/Keyboard";
import { Mouse } from "@morleydev/pauper-core/input/Mouse";
import { System } from "@morleydev/pauper-core/input/System";

export type Driver = {
	readonly assets: AssetLoader;
	readonly input: {
		readonly mouse: Mouse;
		readonly keyboard: Keyboard;
		readonly system: System;
	};
	readonly start: (elem: React.ReactNode) => () => void;
};

