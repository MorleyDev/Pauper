export type RGBA = { readonly r: number; readonly g: number; readonly b: number; readonly a: number }
export const RGBA = (r: number, g: number, b: number, a: number = 1) => ({ r, g, b, a })

export type RGB = { readonly r: number; readonly g: number; readonly b: number }
export const RGB = (r: number, g: number, b: number) => ({ r, g, b })

export type RGBAo = { readonly r: number; readonly g: number; readonly b: number; readonly a?: number };
export const RGBAo = (r: number, g: number, b: number, a?: number) => ({ r, g, b, a })
