import { Observable, fromEvent } from "rxjs";

import { Key } from "../models/keys.model";
import { Keyboard } from "./Keyboard";
import { map } from "rxjs/operators";

export class HtmlDocumentKeyboard implements Keyboard {
	constructor(private document: Document) {
	}

	public keyDown(): Observable<Key> {
		return (fromEvent(this.document, "keydown") as Observable<KeyboardEvent>).pipe(
			map((event: KeyboardEvent) => event.keyCode)
		);
	}

	public keyUp(): Observable<Key> {
		return (fromEvent(this.document, "keyup") as Observable<KeyboardEvent>).pipe(
			map((event: KeyboardEvent) => event.keyCode)
		);
	}
}
