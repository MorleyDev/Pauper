import { SoundEffectAsset, MusicAsset, NamedMusicAsset, NamedSoundEffectAsset } from "../assets/asset.model";
import { AudioService } from "./audio.service";
import { sfml } from "../engine/sfml";

export class SfmlAudioService implements AudioService {
	public playMusic(audio: MusicAsset, volume: number, loop: boolean): AudioService {
		sfml.audio.music.play(audio as NamedMusicAsset, { volume, loop });
		return this;
	}

	public pauseMusic(audio: MusicAsset): AudioService {
		sfml.audio.music.pause(audio as NamedMusicAsset);
		return this;
	}

	public stopMusic(audio: MusicAsset): AudioService {
		sfml.audio.music.stop(audio as NamedMusicAsset);
		return this;
	}

	public playSoundEffect(audio: SoundEffectAsset, volume: number): this {
		sfml.audio.sound.play(audio as NamedSoundEffectAsset, volume);
		return this;
	}
}
