import { Observable, Subject } from "rxjs";
import { SfmlEventType, sfml } from "../engine/sfml";
import { filter, map } from "rxjs/operators";

import { System } from "./System";

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