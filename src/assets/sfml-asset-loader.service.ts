import { AssetLoader } from "./asset-loader.service";
import { ImageAsset, SoundEffectAsset, MusicAsset } from "./asset.model";
import { sfml } from "../engine/sfml";

export class SfmlAssetLoader implements AssetLoader {
	private images: { [id: string]: ImageAsset | undefined } = {};
	private soundeffects: { [id: string]: SoundEffectAsset | undefined } = {};
	private music: { [id: string]: MusicAsset | undefined } = {};

	public async loadFont(name: string, path?: string): Promise<void> {
		await sfml.load.font(name, path || `./assets/fonts/${name}.ttf`);
	}

	public getSoundEffect(name: string, path?: string): SoundEffectAsset {
		const asset = this.soundeffects[name];
		if (asset != null) {
			return asset;
		} else {
			this.loadSoundEffect(name, path || `./assets/${name}.ogg`);
			return this.soundeffects[name]!;
		}
	}

	public async loadSoundEffect(name: string, path: string): Promise<SoundEffectAsset> {
		this.soundeffects[name] = { name, src: path };
		const sound = await sfml.load.sound(name, path);
		return sound;
	}

	public getImage(name: string, path?: string): ImageAsset {
		const asset = this.images[name];
		if (asset != null) {
			return asset;
		} else {
			this.loadImage(name, path || `./assets/${name}.png`);
			return this.images[name]!;
		}
	}

	public async loadImage(name: string, path: string): Promise<ImageAsset> {
		this.images[name] = { name, src: path, width: 512, height: 512 };
		const image = await sfml.load.image(name, path);
		this.images[name] = image;
		return image;
	}

	public getMusic(name: string, path?: string): MusicAsset {
		const asset = this.music[name];
		if (asset != null) {
			return asset;
		}
		this.loadMusic(name, path || `./assets/${name}.ogg`);
		return this.music[name]!;
	}

	public async loadMusic(name: string, path: string): Promise<MusicAsset> {
		this.music[name] = { name, src: path };
		return await sfml.load.music(name, path);
	}
}
