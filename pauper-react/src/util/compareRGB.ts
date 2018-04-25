import { RGB, RGBA, RGBAo } from "@morleydev/pauper-core/models/colour.model";

export const compareRGB = (lhs?: RGB, rhs?: RGB) => lhs == rhs || (lhs != null && rhs != null && _compareRGB(lhs, rhs));
const _compareRGB = (lhs: RGB, rhs: RGB) => lhs.r != rhs.r || lhs.g != rhs.g || lhs.b != rhs.b;

export const compareRGBA = (lhs?: RGBA, rhs?: RGBA) => lhs == rhs || (lhs != null && rhs != null && _compareRGBA(lhs, rhs));
const _compareRGBA = (lhs: RGBA, rhs: RGBA) => lhs.r == rhs.r && lhs.g == rhs.g && lhs.b == rhs.b && lhs.a == rhs.a;

export const compareColour = (lhs?: RGB | RGBA, rhs?: RGB | RGBA) => lhs == rhs || (lhs != null && rhs != null && _compareColour(lhs, rhs));
const _compareColour = (lhs: RGBAo, rhs: RGBAo) => _getAlpha(lhs.a) == _getAlpha(rhs.a) && lhs.r == rhs.r && lhs.g == rhs.g && lhs.b == rhs.b;
const _getAlpha = (value?: number) => value != null ? value : 1;
