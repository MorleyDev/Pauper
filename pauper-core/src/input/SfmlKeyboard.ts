import { Observable } from "rxjs/Observable";

import { Key } from "../models/keys.model";
import { Keyboard } from "./Keyboard";
import { sfml, SfmlEventType, SfmlKeyboardEvent } from "../engine/sfml";
import { map, filter } from "rxjs/operators";

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
