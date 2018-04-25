import { AssetLoader } from "./asset-loader.service";
import { ImageAsset, SoundEffectAsset, MusicAsset } from "./asset.model";

export class NoOpAssetLoader implements AssetLoader {
	public loadFont(id: string, path?: string): Promise<void> {
		return Promise.resolve();
	}

	public getSoundEffect(id: string, path?: string): SoundEffectAsset {
		return { } as any;
	}

	public loadSoundEffect(id: string, path: string): Promise<SoundEffectAsset> {
		return Promise.resolve({ } as any);
	}

	public getImage(id: string, path?: string): ImageAsset {
		return { } as any;
	}

	public async loadImage(id: string, path: string): Promise<ImageAsset> {
		return Promise.resolve({ } as any);
	}

	public getMusic(id: string, path?: string): MusicAsset {
		return { } as any;
	}

	public loadMusic(id: string, path: string): Promise<MusicAsset> {
		return Promise.resolve({ } as any);
	}

	public getJson<T>(id: string, path?: string, notFound?: T): T | undefined {
		return notFound;
	}

	public loadJson<T>(id: string, path: string, notFound?: T): Promise<T> {
		return notFound != null
			? Promise.resolve(notFound)
			: Promise.reject(new Error("NoOp cannot load json, provide a sensible default"));
	}
}
