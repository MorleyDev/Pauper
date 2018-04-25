import { System } from "./System";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { fromEvent } from "rxjs/observable/fromEvent";
import { map } from "rxjs/operators";

export class HtmlWindowSystem implements System {
    constructor(private window: Window) {
    }

    public entered(): Observable<{}> {
		return (fromEvent(this.window, "focus") as Observable<FocusEvent>).pipe(map(event => ({ })));
    }

    public leaved(): Observable<{}> {
		return (fromEvent(this.window, "blur") as Observable<FocusEvent>).pipe(map(event => ({ })));
    }

    public closed(): Observable<{}> {
        return new Subject<{}>();
    }
}