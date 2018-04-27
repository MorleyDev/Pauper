import { Circle, Point2, Rectangle, Shape2, Text2 } from "../models/shapes.model";
import { Degree, Radian } from "../maths/angles.maths";
import { NamedImageAsset, NamedMusicAsset, NamedSoundEffectAsset } from "../assets/asset.model";
import { Observable, ReplaySubject } from "rxjs";
import { RGB, RGBA, RGBAo } from "../models/colour.model";

import { Key } from "../models/keys.model";
import { MouseButton } from "../models/mouse-button.model";
import { Vector2 } from "../maths/vector.maths";

export enum VsyncStatus {
	Enabled,
	Disabled
}

export type SfmlSimpleEvent = { readonly type: SfmlEventType.Closed | SfmlEventType.Resized | SfmlEventType.LostFocus | SfmlEventType.GainedFocus | SfmlEventType.MouseEntered | SfmlEventType.MouseLeft };
export type SfmlKeyboardEvent = { readonly type: SfmlEventType.TextEntered | SfmlEventType.KeyPressed | SfmlEventType.KeyReleased; readonly key: Key };
export type SfmlMouseWheelEvent = { readonly type: SfmlEventType.MouseWheelScrolled; readonly delta: number };
export type SfmlMouseButtonEvent = { readonly type: SfmlEventType.MouseButtonPressed | SfmlEventType.MouseButtonReleased; readonly button: MouseButton; readonly position: Point2 };
export type SfmlMouseMoveEvent = { readonly type: SfmlEventType.MouseMoved; readonly position: Point2 };

export type SfmlEvent
	= SfmlSimpleEvent
	| SfmlKeyboardEvent
	| SfmlMouseWheelEvent
	| SfmlMouseButtonEvent
	| SfmlMouseMoveEvent;

export enum SfmlEventType {
	Closed,
	Resized,
	LostFocus,
	GainedFocus,
	TextEntered,
	KeyPressed,
	KeyReleased,
	MouseWheelScrolled,
	MouseButtonPressed,
	MouseButtonReleased,
	MouseMoved,
	MouseEntered,
	MouseLeft,
	JoystickButtonPressed,
	JoystickButtonReleased,
	JoystickMoved,
	JoystickConnected,
	JoystickDisconnected,
	TouchBegan,
	TouchMoved,
	TouchEnded,
	SensorChanged
}

const simpleFileLoadingRequests: { [id: number]: (() => void) | undefined } = {};
const imageFileLoadingRequests: { [id: number]: ((width: number, height: number) => void) | undefined } = {};
if (typeof SFML_OnLoadSound !== "undefined") {
	SFML_OnLoadSound = (id: number) => (simpleFileLoadingRequests[id] || (() => { }))();
}
if (typeof SFML_OnLoadFont !== "undefined") {
	SFML_OnLoadFont = (id: number) => (simpleFileLoadingRequests[id] || (() => { }))();
}
if (typeof SFML_OnLoadImage == "undefined") {
	SFML_OnLoadImage = (id: number, width: number, height: number) => (imageFileLoadingRequests[id] || (() => { }))(width, height);
}

let nextId = 0;
const getId = () => (nextId++);

const sfmlRenderTextures: { [key: string]: Rectangle } = {};
const events$ = new ReplaySubject<SfmlEvent>();

function pullEvents() {
	const result: SfmlEvent[] = [];
	SFML_FlushEvents(h => {
		const e = SFMLEventToSfmlEvent(h);
		if (e) { result.push(e); }
	});
	return result;
}

function setView(rect: Vector2, size: Vector2, rotation?: Degree): void;
function setView(rect: Rectangle, rotation?: Degree): void;
function setView(a: Rectangle | Vector2, b?: Vector2 | Degree, c?: Degree): void {
	if (Rectangle.is(a)) {
		const rect = a;
		const rotation = (b as Degree | undefined) || 0;
		SFML_SetView_FloatRect(rect.x, rect.y, rect.width, rect.height, rotation);	
	} else {
		const center = a;
		const size = b as Vector2;
		const rotation = c || 0;
		SFML_SetView_VectorVector(center.x, center.y, size.x, size.y, rotation);
	}
};

export const sfml = {
	available: typeof SFML_Clear !== "undefined",
	screen: {
		setSize({ x, y }: Vector2) {
			SFML_SetSize(x, y);
		},
		setView,
		getSize(): Vector2 {
			return SFML_GetSize();
		},
		setVSync(vsync: VsyncStatus) {
			SFML_SetVSync(vsync === VsyncStatus.Enabled);
		},

		clear({ r, g, b }: RGB = RGB(0, 0, 0)) {
			SFML_Clear(r, g, b);
		},
		fill,
		stroke,
		blit
	},
	renderTarget: {
		create(key: string, { x, y }: Vector2) {
			if (!SFML_CreateRenderTexture(key, x, y)) {
				throw new Error(`Could not create render texture ${key}`);
			}
			sfmlRenderTextures[key] = Rectangle(0, 0, x, y);
		},
		push(key: string) {
			SFML_PushRenderTexture(key);
		},
		pop() {
			SFML_PopRenderTexture();
		},
		blit: blitRenderTexture
	},
	state: {
		push: {
			translate({ x, y }: Vector2) {
				SFML_Push_Translate(x, y);
			},
			scale({ x, y }: Vector2) {
				SFML_Push_Scale(x, y);
			},
			rotate(degrees: Degree) {
				SFML_Push_Rotate(degrees);
			},
		},
		pop() {
			SFML_Pop();
		}
	},
	load: {
		sound(name: string, src: string) {
			return new Promise<NamedSoundEffectAsset>(resolve => {
				const asyncLoaderId = getId();
				simpleFileLoadingRequests[asyncLoaderId] = () => resolve({ name, src });
				SFML_LoadSound(name, src, asyncLoaderId);
			});
		},
		music(name: string, src: string) {
			return new Promise<NamedMusicAsset>(resolve => {
				const asyncLoaderId = getId();
				simpleFileLoadingRequests[asyncLoaderId] = () => resolve({ name, src });
				SFML_LoadMusic(name, src);
				resolve({ name, src });
			});
		},
		font(name: string, src: string) {
			return new Promise<{ readonly name: string; readonly src: string }>(resolve => {
				const asyncLoaderId = getId();
				simpleFileLoadingRequests[asyncLoaderId] = () => resolve({ name, src });
				SFML_LoadFont(name, src, asyncLoaderId);
			});
		},
		image(name: string, src: string) {
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
		events$: events$ as Observable<SfmlEvent>,
		start() {
			requestAnimationFrame(function pull() {
				pullEvents().forEach(e => events$.next(e));
				requestAnimationFrame(pull);
			});
		}
	},
	audio: {
		sound: {
			play(asset: NamedSoundEffectAsset, volume: number = 1) {
				SFML_PlaySound(asset.name, volume);
			}
		},
		music: {
			play(asset: NamedMusicAsset, { volume, loop }: { readonly volume?: number; readonly loop?: boolean } = {}) {
				SFML_PlayMusic(asset.name, volume != null ? volume : 1, loop != null ? loop : true);
			},
			pause(asset: NamedMusicAsset) {
				SFML_PauseMusic(asset.name);
			},
			stop(asset: NamedMusicAsset) {
				SFML_StopMusic(asset.name);
			}
		}
	},
	close() {
		SFML_Close();
	}
};

function fill(shape: Shape2, { r, g, b, a }: RGBAo) {
	const alpha = a != null ? a : 1;
	if (Array.isArray(shape)) {
		if (shape.length === 2) {
			SFML_Draw_Line(shape[0].x, shape[0].y, shape[1].x, shape[1].y, r, g, b, alpha);
		} else if (shape.length === 3) {
			SFML_Fill_Triangle(shape[0].x, shape[0].y, shape[1].x, shape[1].y, shape[2].x, shape[2].y, r, g, b, alpha);
		}
	} else {
		if (Rectangle.is(shape)) {
			SFML_Fill_Rectangle(shape.x, shape.y, shape.width, shape.height, r, g, b, alpha);
		} else if (Circle.is(shape)) {
			SFML_Fill_Circle(shape.x, shape.y, shape.radius, r, g, b, alpha);
		} else if (Text2.is(shape)) {
			SFML_Fill_Text(shape.fontFamily || "sans-serif", shape.text, shape.fontSize || 16, shape.x, shape.y, r, g, b, alpha);
		} else {
			SFML_Fill_Rectangle(shape.x, shape.y, 1, 1, r, g, b, alpha);
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
		}
	} else {
		if (Rectangle.is(shape)) {
			SFML_Stroke_Rectangle(shape.x, shape.y, shape.width, shape.height, r, g, b, alpha);
		} else if (Circle.is(shape)) {
			SFML_Stroke_Circle(shape.x, shape.y, shape.radius, r, g, b, alpha);
		} else if (Text2.is(shape)) {
			SFML_Stroke_Text(shape.fontFamily || "sans-serif", shape.text, shape.fontSize || 16, shape.x, shape.y, r, g, b, alpha);
		} else {
			SFML_Fill_Rectangle(shape.x, shape.y, 1, 1, r, g, b, alpha);
		}
	}
}

function blit(dst: Point2 | Rectangle, blittable: NamedImageAsset, src?: Rectangle) {
	const s = src != null ? src : Rectangle(0, 0, blittable.width, blittable.height);
	const d = Rectangle.is(dst) ? dst : Rectangle(dst.x, dst.y, blittable.width, blittable.height);

	SFML_Blit(blittable.name, s.x, s.y, s.width, s.height, d.x, d.y, d.width, d.height);
}

function blitRenderTexture(dst: Point2 | Rectangle, key: string, src?: Rectangle) {
	const blittable = sfmlRenderTextures[key];
	const { s, d } = (() => {
		if (blittable != null) {
			const s = src != null ? src : Rectangle(0, 0, blittable.width, blittable.height);
			const d = Rectangle.is(dst) ? dst : Rectangle(dst.x, dst.y, blittable.width, blittable.height);
			return { s, d };
		} else {
			const wh = SFML_GetSize();
			const s = src != null ? src : Rectangle(0, 0, wh.x, wh.y);
			const d = Rectangle.is(dst) ? dst : Rectangle(dst.x, dst.y, wh.x, wh.y);
			return { s, d }
		}
	})();
	SFML_BlitRenderTexture(key, s.x, s.y, s.width, s.height, d.x, d.y, d.width, d.height);
}

function SFMLEventToSfmlEvent(e: SFML_Event): SfmlEvent | undefined {
	switch (e.type) {
		case 0: return { type: SfmlEventType.Closed };
		case 1: return { type: SfmlEventType.Resized };
		case 2: return { type: SfmlEventType.LostFocus };
		case 3: return { type: SfmlEventType.GainedFocus };
		case 12: return { type: SfmlEventType.MouseEntered };
		case 13: return { type: SfmlEventType.MouseLeft };
		case 4: return { type: SfmlEventType.TextEntered, key: sfmlKeyToKeyCode(e.parameters[0]) };
		case 5: return { type: SfmlEventType.KeyPressed, key: sfmlKeyToKeyCode(e.parameters[0]) };
		case 6: return { type: SfmlEventType.KeyReleased, key: sfmlKeyToKeyCode(e.parameters[0]) };
		case 8: return { type: SfmlEventType.MouseWheelScrolled, delta: e.parameters[0] };
		case 9: return { type: SfmlEventType.MouseButtonPressed, button: sfmlButtonToMouseButton(e.parameters[0]), position: Point2(e.parameters[1], e.parameters[2]) };
		case 10: return { type: SfmlEventType.MouseButtonReleased, button: sfmlButtonToMouseButton(e.parameters[0]), position: Point2(e.parameters[1], e.parameters[2]) };
		case 11: return { type: SfmlEventType.MouseMoved, position: Point2(e.parameters[0], e.parameters[1]) };
		default: return undefined;
	}
}

function sfmlButtonToMouseButton(button: number): MouseButton {
	switch (button) {
		case 0: return MouseButton.Left;
		case 1: return MouseButton.Right;
		case 2: return MouseButton.Middle;
		default: return MouseButton.Left;
	}
}

function sfmlKeyToKeyCode(key: number): Key {
	switch (key) {
		case SFML_Keys.A: return Key.A;
		case SFML_Keys.B: return Key.B;
		case SFML_Keys.C: return Key.C;
		case SFML_Keys.D: return Key.D;
		case SFML_Keys.E: return Key.E;
		case SFML_Keys.F: return Key.F;
		case SFML_Keys.G: return Key.G;
		case SFML_Keys.H: return Key.H;
		case SFML_Keys.I: return Key.I;
		case SFML_Keys.J: return Key.J;
		case SFML_Keys.K: return Key.K;
		case SFML_Keys.L: return Key.L;
		case SFML_Keys.M: return Key.M;
		case SFML_Keys.N: return Key.N;
		case SFML_Keys.O: return Key.O;
		case SFML_Keys.P: return Key.P;
		case SFML_Keys.Q: return Key.Q;
		case SFML_Keys.R: return Key.R;
		case SFML_Keys.S: return Key.S;
		case SFML_Keys.T: return Key.T;
		case SFML_Keys.U: return Key.U;
		case SFML_Keys.V: return Key.V;
		case SFML_Keys.W: return Key.W;
		case SFML_Keys.X: return Key.X;
		case SFML_Keys.Y: return Key.Y;
		case SFML_Keys.Z: return Key.Z;
		case SFML_Keys.Num0: return Key.Zero;
		case SFML_Keys.Num1: return Key.One;
		case SFML_Keys.Num2: return Key.Two;
		case SFML_Keys.Num3: return Key.Three;
		case SFML_Keys.Num4: return Key.Four;
		case SFML_Keys.Num5: return Key.Five;
		case SFML_Keys.Num6: return Key.Six;
		case SFML_Keys.Num7: return Key.Seven;
		case SFML_Keys.Num8: return Key.Eight;
		case SFML_Keys.Num9: return Key.Nine;
		case SFML_Keys.Escape: return Key.Escape;
		case SFML_Keys.LSystem: return Key.LeftWindowKey;
		case SFML_Keys.RSystem: return Key.RightWindowKey;
		case SFML_Keys.LBracket: return Key.OpenBracket;
		case SFML_Keys.RBracket: return Key.ClosedBracket;
		case SFML_Keys.SemiColon: return Key.SemiColon;
		case SFML_Keys.Comma: return Key.Comma;
		case SFML_Keys.Period: return Key.Period;
		case SFML_Keys.Quote: return Key.Quote;
		case SFML_Keys.Slash: return Key.ForwardSlash;
		// case SFML_Keys.BackSlash: return Key.;
		case SFML_Keys.Tilde: return Key.Tilde;
		case SFML_Keys.Equal: return Key.Equals;
		case SFML_Keys.Dash: return Key.Dash;
		case SFML_Keys.Space: return Key.Space;
		case SFML_Keys.Return: return Key.Enter;
		case SFML_Keys.BackSpace: return Key.Backspace;
		case SFML_Keys.Tab: return Key.Tab;
		case SFML_Keys.PageUp: return Key.PageUp;
		case SFML_Keys.PageDown: return Key.PageDown;
		case SFML_Keys.End: return Key.End;
		case SFML_Keys.Home: return Key.Home;
		case SFML_Keys.Insert: return Key.Insert;
		case SFML_Keys.Delete: return Key.Delete;
		case SFML_Keys.Add: return Key.Add;
		case SFML_Keys.Subtract: return Key.Subtract;
		case SFML_Keys.Multiply: return Key.Multiply;
		case SFML_Keys.Divide: return Key.Divide;
		case SFML_Keys.Left: return Key.LeftArrow;
		case SFML_Keys.Right: return Key.RightArrow;
		case SFML_Keys.Up: return Key.UpArrow;
		case SFML_Keys.Down: return Key.DownArrow;
		case SFML_Keys.Numpad0: return Key.Numpad0;
		case SFML_Keys.Numpad1: return Key.Numpad1;
		case SFML_Keys.Numpad2: return Key.Numpad2;
		case SFML_Keys.Numpad3: return Key.Numpad3;
		case SFML_Keys.Numpad4: return Key.Numpad4;
		case SFML_Keys.Numpad5: return Key.Numpad5;
		case SFML_Keys.Numpad6: return Key.Numpad6;
		case SFML_Keys.Numpad7: return Key.Numpad7;
		case SFML_Keys.Numpad8: return Key.Numpad8;
		case SFML_Keys.Numpad9: return Key.Numpad9;
		case SFML_Keys.F1: return Key.F1;
		case SFML_Keys.F2: return Key.F2;
		case SFML_Keys.F3: return Key.F3;
		case SFML_Keys.F4: return Key.F4;
		case SFML_Keys.F5: return Key.F5;
		case SFML_Keys.F6: return Key.F6;
		case SFML_Keys.F7: return Key.F7;
		case SFML_Keys.F8: return Key.F8;
		case SFML_Keys.F9: return Key.F9;
		case SFML_Keys.F10: return Key.F10;
		case SFML_Keys.F11: return Key.F11;
		case SFML_Keys.F12: return Key.F12;
		// case SFML_Keys.F13: return Key.F13;
		// case SFML_Keys.F14: return Key.F14;
		// case SFML_Keys.F15: return Key.F15;
		case SFML_Keys.Pause: return Key.PauseBreak;
		default:
			return 0;
		// case SFML_Keys.Menu: ;
		// case SFML_Keys.LControl: ;
		// case SFML_Keys.LShift: ;
		// case SFML_Keys.LAlt: ;
		// case SFML_Keys.RControl: ;
		// case SFML_Keys.RShift: ;
		// case SFML_Keys.RAlt: ;
	}
}
