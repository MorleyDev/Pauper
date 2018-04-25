import { map, filter, tap } from "rxjs/operators";
import { Observable } from "rxjs/Observable";

import { MouseButton } from "../models/mouse-button.model";
import { Point2Type } from "../models/point/point.model.type";
import { Mouse } from "./Mouse";
import { sfml, SfmlEventType, SfmlMouseButtonEvent } from "../engine/sfml";

export class SfmlMouse implements Mouse {
    public mouseDown(type?: MouseButton | undefined): Observable<Point2Type> {
		return sfml.input.events$.pipe(
			filter(event => event.type === SfmlEventType.MouseButtonPressed),
			filter(event =>  type == null || (event as SfmlMouseButtonEvent).button === type),
            map(event => (event as SfmlMouseButtonEvent).position)
		);
    }

    public mouseUp(type?: MouseButton | undefined): Observable<Point2Type> {
		return sfml.input.events$.pipe(
			filter(event => event.type === SfmlEventType.MouseButtonReleased),
			filter(event =>  type == null || (event as SfmlMouseButtonEvent).button === type),
            map(event => (event as SfmlMouseButtonEvent).position)
		);
    }

    public mouseMove(): Observable<Point2Type> {
		return sfml.input.events$.pipe(
			filter(event => event.type === SfmlEventType.MouseMoved),
            map(event => (event as SfmlMouseButtonEvent).position)
		);
    }
}
