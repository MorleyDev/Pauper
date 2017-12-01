import { Howl } from "howler";

import { AssetLoader } from "./asset-loader.service";
import { SoundEffectAsset, ImageAsset, MusicAsset } from "./asset.model";

export class WebAssetLoader implements AssetLoader {
	private images: { [id: string]: ImageAsset | undefined } = {};
	private soundeffects: { [id: string]: SoundEffectAsset | undefined } = {};
	private music: { [id: string]: MusicAsset | undefined } = {};
	private jsons: { [id: string]: any | undefined } = {};

	public loadFont(id: string, path?: string): Promise<void> {
		return Promise.resolve();
	}

	public getSoundEffect(id: string, path?: string): SoundEffectAsset {
		const audio = this.soundeffects[id];
		if (audio) {
			return audio;
		} else {
			const howl = new Howl({ src: path || [`./assets/${id}.ogg`, `./assets/${id}.flac`, `./assets/${id}.mp3`, `./assets/${id}.wav`] });
			return this.soundeffects[id] = { howl, name: id };
		}
	}

	public async loadSoundEffect(id: string, path: string): Promise<SoundEffectAsset> {
		const audio = this.soundeffects[id];
		if (audio) {
			return audio;
		} else {
			const howl = await loadAudioFromUrl(path);
			return this.soundeffects[id] = { howl, name: id };
		}
	}

	public getImage(id: string, path?: string): ImageAsset {
		const image = this.images[id];
		if (image != null) {
			return image;
		} else {
			const img = new Image();
			img.src = path || `./assets/${id}.png`;
			this.images[id] = img;
			return img;
		}
	}

	public async loadImage(id: string, path: string): Promise<ImageAsset> {
		const imageAlreadyLoaded = this.images[id];
		if (imageAlreadyLoaded != null) {
			return imageAlreadyLoaded;
		} else {
			const image = await loadImageFromUrl(path);
			this.images[id] = image;
			return image;
		}
	}

	public getMusic(id: string, path?: string): MusicAsset {
		const audio = this.music[id];
		if (audio) {
			return audio;
		} else {
			const howl = new Howl({ src: path || [`./assets/${id}.ogg`, `./assets/${id}.flac`, `./assets/${id}.mp3`, `./assets/${id}.wav`] });
			return this.music[id] = { howl, name: id };
		}
	}

	public async loadMusic(id: string, path: string): Promise<MusicAsset> {
		const audio = this.music[id];
		if (audio) {
			return audio;
		} else {
			const howl = await loadAudioFromUrl(path);
			return this.music[id] = { howl, name: id };
		}
	}

	public getJson<T>(id: string, path?: string, notFound?: T): T | undefined {
		const asset = this.jsons[id];
		if (asset != null) {
			return asset;
		} else {
			if (notFound != null) {
				this.jsons[id] = notFound;
			}
			return notFound;
		}
	}

	public async loadJson<T>(id: string, path: string, notFound?: T): Promise<T> {
		const asset = this.jsons[id];
		if (asset != null) {
			return asset;
		}

		const result = await fetch(path);
		if (result.status < 200 || result.status >= 300) {
			if (notFound != null) {
				this.jsons[id] = notFound;
				return notFound;
			} else {
				throw new Error(`Could not find json object ${id} (${path})`);
			}
		} else {
			const body = await result.json();
			this.jsons[id] = body;
			return body;
		}
	}
}

function loadImageFromUrl(path: string): Promise<HTMLImageElement> {
	return new Promise<HTMLImageElement>((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject();
		img.src = path;
	});
}

function loadAudioFromUrl(path: string): Promise<Howl> {
	return new Promise<Howl>((resolve, reject) => {
		const howl = new Howl({ src: [path], html5: true });
		if (howl.state() === "loaded") {
			return howl;
		} else {
			howl.once("load", () => resolve(howl));
			howl.once("loaderror", (id, err) => reject(err));
			howl.load();
			return howl;
		}
	});
}
