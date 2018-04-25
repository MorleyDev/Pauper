import { System } from "./System";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { map, filter } from "rxjs/operators";
import { sfml, SfmlEventType } from "../engine/sfml";

export class SfmlSystem implements System {
    constructor() {
    }

    public entered(): Observable<{}> {
		return sfml.input.events$.pipe(
            filter(event => event.type === SfmlEventType.GainedFocus),
            map(event => ({ }))
        );
    }

    public leaved(): Observable<{}> {
		return sfml.input.events$.pipe(
            filter(event => event.type === SfmlEventType.LostFocus),
            map(event => ({ }))
        );
    }

    public closed(): Observable<{}> {
		return sfml.input.events$.pipe(
            filter(event => event.type === SfmlEventType.Closed),
            map(event => ({ }))
        );
    }
}