type SFML_Event
	= { type: 0 | 1 | 2 | 3 | 12 | 13; }
	| { type: 4 | 5 | 6; parameters: [number /*SFML_Keys*/] }
	| { type: 8; parameters: [number /*delta*/] }
	| { type: 9 | 10; parameters: [number /*button*/, number /*x*/, number /*y*/] }
	| { type: 11; parameters: [number /*x*/, number /*y*/] };

declare function SFML_Close(): void;
declare function SFML_SetSize(width: number, height: number): void;
declare function SFML_SetVSync(enabled: boolean): void;

declare function SFML_GetSize(): { readonly x: number; readonly y: number; };

declare function SFML_SetView_FloatRect(x: number, y: number, width: number, height: number, rotation: number): void;
declare function SFML_SetView_VectorVector(cx: number, cy: number, width: number, height: number, rotation: number): void;

declare function SFML_CreateRenderTexture(key: string, width: number, height: number): boolean;
declare function SFML_PushRenderTexture(key: string): boolean;
declare function SFML_PopRenderTexture(): number;
declare function SFML_BlitRenderTexture(key: string, srcX: number, srcY: number, srcWidth: number, srcHeight: number, dstX: number, dstY: number, dstWidth: number, dstHeight: number): void;

declare function SFML_LoadFont(name: string, src: string, id: number): { readonly name: string; readonly src: string };
declare let SFML_OnLoadFont: (id: number) => void;

declare function SFML_LoadImage(name: string, src: string, id: number): { readonly width: number; readonly height: number; readonly src: string; readonly name: string };
declare let SFML_OnLoadImage: (id: number, width: number, height: number) => void;

declare function SFML_LoadSound(name: string, src: string, id: number): { readonly name: string; readonly src: string };
declare let SFML_OnLoadSound: (id: number) => void;

declare function SFML_LoadMusic(name: string, src: string): { readonly name: string; readonly src: string };

declare function SFML_FlushEvents(handler: (event: SFML_Event) => void): void;

declare function SFML_Clear(r: number, g: number, b: number): void;
declare function SFML_Fill_Circle(x: number, y: number, radius: number, r: number, g: number, b: number, a: number): void;
declare function SFML_Fill_Rectangle(x: number, y: number, width: number, height: number, r: number, g: number, b: number, a: number): void;
declare function SFML_Fill_Triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, r: number, g: number, b: number, a: number): void;
declare function SFML_Stroke_Circle(x: number, y: number, radius: number, r: number, g: number, b: number, a: number): void;
declare function SFML_Stroke_Rectangle(x: number, y: number, width: number, height: number, r: number, g: number, b: number, a: number): void;
declare function SFML_Stroke_Triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, r: number, g: number, b: number, a: number): void;
declare function SFML_Draw_Line(x1: number, y1: number, x2: number, y2: number, r: number, g: number, b: number, a: number): void;

declare function SFML_Stroke_Text(name: string, text: string, size: number, x: number, y: number, r: number, g: number, b: number, a: number): void;
declare function SFML_Fill_Text(name: string, text: string, size: number, x: number, y: number, r: number, g: number, b: number, a: number): void;

declare function SFML_Blit(name: string, srcX: number, srcY: number, srcWidth: number, srcHeight: number, dstX: number, dstY: number, dstWidth: number, dstHeight: number): void;

declare function SFML_Push_Translate(x: number, y: number): void;
declare function SFML_Push_Scale(x: number, y: number): void;
declare function SFML_Push_Rotate(radians: number): void;
declare function SFML_Pop(): void;

declare function SFML_PlaySound(name: string, volume: number): void;
declare function SFML_PlayMusic(name: string, volume: number, loop: boolean): void;
declare function SFML_PauseMusic(name: string): void;
declare function SFML_StopMusic(name: string): void;

declare const SFML_Events: {
	readonly Closed: 0;
	readonly Resized: 1;
	readonly LostFocus: 2;
	readonly GainedFocus: 3;
	readonly TextEntered: 4;
	readonly KeyPressed: 5;
	readonly KeyReleased: 6;
	readonly MouseWheelScrolled: 8;
	readonly MouseButtonPressed: 9;
	readonly MouseButtonReleased: 10;
	readonly MouseMoved: 11;
	readonly MouseEntered: 12;
	readonly MouseLeft: 13;
	readonly JoystickButtonPressed: 14;
	readonly JoystickButtonReleased: 15;
	readonly JoystickMoved: 16;
	readonly JoystickConnected: 17;
	readonly JoystickDisconnected: 18;
	readonly TouchBegan: 19;
	readonly TouchMoved: 20;
	readonly TouchEnded: 21;
	readonly SensorChanged: 22;
};

declare const SFML_Mouse: {
	readonly LeftButton: 0;
	readonly MiddleButton: 1;
	readonly RightButton: 2;
};

declare const SFML_Keys: {
	readonly A: 0;
	readonly B: 1;
	readonly C: 2;
	readonly D: 3;
	readonly E: 4;
	readonly F: 5;
	readonly G: 6;
	readonly H: 7;
	readonly I: 8;
	readonly J: 9;
	readonly K: 10;
	readonly L: 11;
	readonly M: 12;
	readonly N: 13;
	readonly O: 14;
	readonly P: 15;
	readonly Q: 16;
	readonly R: 17;
	readonly S: 18;
	readonly T: 19;
	readonly U: 20;
	readonly V: 21;
	readonly W: 22;
	readonly X: 23;
	readonly Y: 24;
	readonly Z: 25;
	readonly Num0: 26;
	readonly Num1: 27;
	readonly Num2: 28;
	readonly Num3: 29;
	readonly Num4: 30;
	readonly Num5: 31;
	readonly Num6: 32;
	readonly Num7: 33;
	readonly Num8: 34;
	readonly Num9: 35;
	readonly Escape: 36;
	readonly LControl: 37;
	readonly LShift: 38;
	readonly LAlt: 39;
	readonly LSystem: 40;
	readonly RControl: 40;
	readonly RShift: 41;
	readonly RAlt: 42;
	readonly RSystem: 43;
	readonly Menu: 44;
	readonly LBracket: 45;
	readonly RBracket: 46;
	readonly SemiColon: 47;
	readonly Comma: 48;
	readonly Period: 49;
	readonly Quote: 50;
	readonly Slash: 51;
	readonly BackSlash: 52;
	readonly Tilde: 53;
	readonly Equal: 54;
	readonly Dash: 55;
	readonly Space: 56;
	readonly Return: 57;
	readonly BackSpace: 58;
	readonly Tab: 59;
	readonly PageUp: 60;
	readonly PageDown: 61;
	readonly End: 62;
	readonly Home: 63;
	readonly Insert: 64;
	readonly Delete: 65;
	readonly Add: 66;
	readonly Subtract: 67;
	readonly Multiply: 68;
	readonly Divide: 69;
	readonly Left: 70;
	readonly Right: 71;
	readonly Up: 72;
	readonly Down: 73;
	readonly Numpad0: 74;
	readonly Numpad1: 75;
	readonly Numpad2: 76;
	readonly Numpad3: 77;
	readonly Numpad4: 78;
	readonly Numpad5: 79;
	readonly Numpad6: 80;
	readonly Numpad7: 81;
	readonly Numpad8: 82;
	readonly Numpad9: 83;
	readonly F1: 84;
	readonly F2: 85;
	readonly F3: 86;
	readonly F4: 87;
	readonly F5: 88;
	readonly F6: 89;
	readonly F7: 90;
	readonly F8: 91;
	readonly F9: 92;
	readonly F10: 93;
	readonly F11: 94;
	readonly F12: 95;
	readonly F13: 96;
	readonly F14: 97;
	readonly F15: 98;
	readonly Pause: 99;
};