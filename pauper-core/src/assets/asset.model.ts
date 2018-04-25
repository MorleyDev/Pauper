import { Howl } from "howler";

export type BlittableAsset = ImageAsset | VideoAsset;

export type NamedImageAsset = { readonly width: number; readonly height: number; readonly name: string; readonly src: string  };
export type ImageAsset = HTMLImageElement | ImageBitmap | NamedImageAsset;
export type VideoAsset = HTMLVideoElement;

export type NamedSoundEffectAsset = { readonly name: string; readonly src: string };
export type SoundEffectAsset = { readonly name: string; readonly howl: Howl } | NamedSoundEffectAsset;

export type NamedMusicAsset = { readonly name: string; readonly src: string };
export type MusicAsset = { readonly name: string; readonly howl: Howl } | NamedMusicAsset;
