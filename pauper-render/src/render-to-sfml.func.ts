import { Blit, Clear, Fill, Frame, FrameCollection, FrameCommandType, Origin, RenderTarget, Rotate, Scale, Stroke } from "./render-frame.model";
import { Circle, Rectangle, Text2 } from "@morleydev/pauper-core/models/shapes.model";
import { RGB, RGBA } from "@morleydev/pauper-core/models/colour.model";

import { AssetLoader } from "@morleydev/pauper-core/assets/asset-loader.service";
import { NamedImageAsset } from "@morleydev/pauper-core/assets/asset.model";
import { sfml } from "@morleydev/pauper-core/engine/sfml";
import { toDegrees } from "@morleydev/pauper-core/maths/angles.maths";

export function renderToSfml(assets: AssetLoader, frame: FrameCollection): void {
	for (const command of frame) {
		RenderCommand(assets, command);
	}
}

function RenderCommand(assets: AssetLoader, command: Frame): void {
	const commandType = command[0];
	if (!Array.isArray(commandType)) {
		switch (commandType) {
			case FrameCommandType.Clear:
				return renderClear(assets, command as Clear);

			case FrameCommandType.Origin:
				return renderOrigin(assets, command as Origin);

			case FrameCommandType.RenderTarget:
				return renderRenderTarget(assets, command as RenderTarget);

			case FrameCommandType.Rotate:
				return renderRotate(assets, command as Rotate);

			case FrameCommandType.Scale:
				return renderScale(assets, command as Scale);

			case FrameCommandType.Fill:
				return renderFill(assets, command as Fill);

			case FrameCommandType.Stroke:
				return renderStroke(assets, command as Stroke);

			case FrameCommandType.Blit:
				return renderBlit(assets, command as Blit);
		}
	} else {
		return (command as FrameCollection).forEach(cmd => RenderCommand(assets, cmd));
	}
}

function renderOrigin(assets: AssetLoader, command: Origin): void {
	const origin = command[1];
	const children = command[2];
	sfml.state.push.translate(origin);
	renderToSfml(assets, children);
	sfml.state.pop();
}

function renderRotate(assets: AssetLoader, command: Rotate): void {
	const radians = command[1];
	const children = command[2];
	sfml.state.push.rotate(toDegrees(radians));
	renderToSfml(assets, children);
	sfml.state.pop();
}

function renderScale(assets: AssetLoader, command: Scale): void {
	const scale = command[1];
	const children = command[2];
	sfml.state.push.scale(scale);
	renderToSfml(assets, children);
	sfml.state.pop();
}

function renderBlit(assets: AssetLoader, command: Blit): void {
	const image = command[1];
	const dst = command[2];
	const src = command[3] as Rectangle | undefined;
	const imgAsset = assets.getImage(image) as { readonly width: number; readonly height: number; readonly name: string };

	sfml.screen.blit(dst, imgAsset as NamedImageAsset, src);
}

function renderFill(assets: AssetLoader, fill: Fill): void {
	const shape = fill[1];
	const colour = fill[2] as RGB & { a?: number };
	sfml.screen.fill(shape, colour);
}

function renderStroke(assets: AssetLoader, fill: Stroke): void {
	const shape = fill[1];
	const colour = fill[2] as RGB & { a?: number };
	sfml.screen.stroke(shape, colour);
}

function renderClear(assets: AssetLoader, clear: Clear): void {
	const colour = (clear[1] as RGB | undefined);

	sfml.screen.clear(colour);
}

function renderRenderTarget(assets: AssetLoader, [_, key, dst, frames, size]: RenderTarget): void {
	if (frames != null) {
		// Redraw render target
		sfml.renderTarget.create(key, size || sfml.screen.getSize());
		sfml.renderTarget.push(key);
		renderToSfml(assets, frames);
		sfml.renderTarget.pop();
	}
	sfml.renderTarget.blit(dst, key);
}
