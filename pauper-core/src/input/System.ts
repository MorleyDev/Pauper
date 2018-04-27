import { Observable } from "rxjs";

export abstract class System {
    public abstract entered(): Observable<{}>;

    public abstract leaved(): Observable<{}>;

    public abstract closed(): Observable<{}>;
}
