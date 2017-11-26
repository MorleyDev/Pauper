import { Shape2, Rectangle, Circle, Text2, Point2 } from "../models/shapes.model";
import { RGBA, RGB } from "../models/colour.model";
import { NamedImageAsset, NamedSoundEffectAsset, NamedMusicAsset } from "../assets/asset.model";
import { Vector2 } from "../maths/vector.maths";
import { Radian } from "../maths/angles.maths";

export enum VsyncStatus {
	Enabled,
	Disabled
}

const simpleFileLoadingRequests: { [id: number]: (() => void) | undefined } = {};
const imageFileLoadingRequests: { [id: number]: ((width: number, height: number) => void) | undefined } = {};
SFML_OnLoadSound = (id: number) => (simpleFileLoadingRequests[id] || (() => { }))();
SFML_OnLoadFont = (id: number) => (simpleFileLoadingRequests[id] || (() => { }))();
SFML_OnLoadImage = (id: number, width: number, height: number) => (imageFileLoadingRequests[id] || (() => { }))(width, height);

let nextId = 0;
const getId = () => (nextId++);

export const sfml = {
	screen: {
		setSize: ({ x, y }: Vector2) => SFML_SetSize(x, y),
		setVSync: (vsync: VsyncStatus) => SFML_SetVSync(vsync === VsyncStatus.Enabled),

		clear,
		fill,
		stroke,
		blit
	},
	state: {
		push: {
			translate: ({ x, y }: Vector2) => SFML_Push_Translate(x, y),
			scale: ({ x, y }: Vector2) => SFML_Push_Scale(x, y),
			rotate: (radians: Radian) => SFML_Push_Rotate(radians),
		},
		pop: SFML_Pop
	},
	load: {
		sound: (name: string, src: string) => {
			return new Promise<NamedSoundEffectAsset>(resolve => {
				const asyncLoaderId = getId();
				simpleFileLoadingRequests[asyncLoaderId] = () => resolve({ name, src });
				SFML_LoadSound(name, src, asyncLoaderId);
			});
		},
		music: (name: string, src: string) => {
			return new Promise<NamedMusicAsset>(resolve => {
				const asyncLoaderId = getId();
				simpleFileLoadingRequests[asyncLoaderId] = () => resolve({ name, src });
				SFML_LoadMusic(name, src);
				resolve({ name, src });
			});
		},
		font: (name: string, src: string) => {
			return new Promise<{ readonly name: string; readonly src: string }>(resolve => {
				const asyncLoaderId = getId();
				simpleFileLoadingRequests[asyncLoaderId] = () => resolve({ name, src });
				SFML_LoadFont(name, src, asyncLoaderId);
			});
		},
		image: (name: string, src: string) => {
			return new Promise<NamedImageAsset>(resolve => {
				const asyncLoaderId = getId();
				imageFileLoadingRequests[asyncLoaderId] = (width, height) => resolve({
					width, height, name, src
				});
				SFML_LoadImage(name, src, asyncLoaderId);
			});
		},
	},
	input: {
		pullEvents: () => {
			const result: SfmlEvent[] = [];
			SFML_FlushEvents(h => result.push(h));
			return result;
		},
		events: SFML_Events,
		keys: SFML_Keys,
	},
	audio: {
		sound: {
			play: (asset: NamedSoundEffectAsset, volume: number = 1) => SFML_PlaySound(asset.name, volume)
		},
		music: {
			play: (asset: NamedMusicAsset, { volume, loop }: { readonly volume?: number; readonly loop?: boolean }) => SFML_PlayMusic(asset.name, volume != null ? volume : 1, loop != null ? loop : true),
			pause: (asset: NamedMusicAsset) => SFML_PauseMusic(asset.name),
			stop: (asset: NamedMusicAsset) => SFML_StopMusic(asset.name)
		}
	},
	close: SFML_Close,
};

function clear({ r, g, b }: RGB = RGB(0, 0, 0)) {
	SFML_Clear(r, g, b);
}

function fill(shape: Shape2, { r, g, b, a }: RGB & { readonly a?: number }) {
	const alpha = a != null ? a : 1;
	if (Array.isArray(shape)) {
		if (shape.length === 2) {
			SFML_Draw_Line(shape[0].x, shape[0].y, shape[1].x, shape[1].y, r, g, b, alpha);
		} else if (shape.length === 3) {
			SFML_Fill_Triangle(shape[0].x, shape[0].y, shape[1].x, shape[1].y, shape[2].x, shape[2].y, r, g, b, alpha);
		} else {
			// TODO
		}
	} else {
		if (Rectangle.is(shape)) {
			SFML_Fill_Rectangle(shape.x, shape.y, shape.width, shape.height, r, g, b, alpha);
		} else if (Circle.is(shape)) {
			SFML_Fill_Circle(shape.x, shape.y, shape.radius, r, g, b, alpha);
		} else if (Text2.is(shape)) {
			SFML_Fill_Text(shape.fontFamily || "sans-serif", shape.text, shape.fontSize || 16, shape.x, shape.y, r, g, b, alpha);
		}
	}
}

function stroke(shape: Shape2, { r, g, b, a }: RGB & { readonly a?: number }) {
	const alpha = a != null ? a : 1;
	if (Array.isArray(shape)) {
		if (shape.length === 2) {
			SFML_Draw_Line(shape[0].x, shape[0].y, shape[1].x, shape[1].y, r, g, b, alpha);
		} else if (shape.length === 3) {
			SFML_Stroke_Triangle(shape[0].x, shape[0].y, shape[1].x, shape[1].y, shape[2].x, shape[2].y, r, g, b, alpha);
		} else {
		}
	} else {
		if (Rectangle.is(shape)) {
			SFML_Stroke_Rectangle(shape.x, shape.y, shape.width, shape.height, r, g, b, alpha);
		} else if (Circle.is(shape)) {
			SFML_Stroke_Circle(shape.x, shape.y, shape.radius, r, g, b, alpha);
		} else if (Text2.is(shape)) {
			SFML_Stroke_Text(shape.fontFamily || "sans-serif", shape.text, shape.fontSize || 16, shape.x, shape.y, r, g, b, alpha);
		} else {
		}
	}
}

function blit(dst: Point2 | Rectangle, blittable: NamedImageAsset, src?: Rectangle) {
	const s = src != null ? src : Rectangle(0, 0, blittable.width, blittable.height);
	const d = Rectangle.is(dst) ? dst : Rectangle(dst.x, dst.y, blittable.width, blittable.height);

	SFML_Blit(blittable.name, s.x, s.y, s.width, s.height, d.x, d.y, d.width, d.height);
}
