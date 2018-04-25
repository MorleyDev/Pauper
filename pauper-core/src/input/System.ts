import { Observable } from "rxjs/Observable";

export abstract class System {
    public abstract entered(): Observable<{}>;

    public abstract leaved(): Observable<{}>;

    public abstract closed(): Observable<{}>;
}
