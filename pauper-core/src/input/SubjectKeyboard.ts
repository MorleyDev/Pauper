import { Observable, Subject } from "rxjs";

import { Key } from "../models/keys.model";
import { Keyboard } from "./Keyboard";

export class SubjectKeyboard implements Keyboard {
	public keyDown$ = new Subject<Key>();
	public keyUp$ = new Subject<Key>();

	public keyDown(): Observable<Key> {
		return this.keyDown$;
	}

	public keyUp(): Observable<Key> {
		return this.keyUp$;
	}
}
