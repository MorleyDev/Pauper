import { MouseButton } from "../models/mouse-button.model";
import { Observable } from "rxjs";
import { Point2Type } from "../models/point/point.model.type";

export abstract class Mouse {
	public abstract mouseDown(type?: MouseButton): Observable<Point2Type>;
	public abstract mouseUp(type?: MouseButton): Observable<Point2Type>;
	public abstract mouseMove(): Observable<Point2Type>;
}
