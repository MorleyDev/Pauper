import { Observable, Subject } from "rxjs";
import { filter, map, tap } from "rxjs/operators";

import { Mouse } from "./Mouse";
import { MouseButton } from "../models/mouse-button.model";
import { Point2Type } from "../models/point/point.model.type";

export class SubjectMouse implements Mouse {
	public mouseDown$ = new Subject<[MouseButton, Point2Type]>();
	public mouseUp$ = new Subject<[MouseButton, Point2Type]>();
	public mouseMove$ = new Subject<Point2Type>();

	public mouseDown(type?: MouseButton): Observable<Point2Type> {
		return this.mouseDown$.pipe(
			filter(([button, pos]) => type == null || button === type),
			map(([button, pos]) => pos)
		);
	}

	public mouseUp(type?: MouseButton): Observable<Point2Type> {
		return this.mouseUp$.pipe(
			filter(([button, pos]) => type == null || button === type),
			map(([button, pos]) => pos),
		);
	}

	public mouseMove(): Observable<Point2Type> {
		return this.mouseMove$;
	}
}
