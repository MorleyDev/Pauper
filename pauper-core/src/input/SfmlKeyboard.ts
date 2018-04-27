import { SfmlEventType, SfmlKeyboardEvent, sfml } from "../engine/sfml";
import { filter, map } from "rxjs/operators";

import { Key } from "../models/keys.model";
import { Keyboard } from "./Keyboard";
import { Observable } from "rxjs";

export class SfmlKeyboard implements Keyboard {
	public keyDown(): Observable<Key> {
		return sfml.input.events$.pipe(
			filter(event => event.type === SfmlEventType.KeyPressed),
			map(event => (event as SfmlKeyboardEvent).key)
		)
	}
	public keyUp(): Observable<Key> {
		return sfml.input.events$.pipe(
			filter(event => event.type === SfmlEventType.KeyReleased),
			map(event => (event as SfmlKeyboardEvent).key)
		)
	}
}
