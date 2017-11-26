import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";

/*
declare function UTILITY_GetUnique(): number;
*/

const receiveHotReload$ = new Subject<string>();
ENGINE_Reloaded = msg => receiveHotReload$.next(msg);
ENGINE_Reloading = () => ENGINE_Stash("{}");

export const engine = {
	hotreload: {
		onStash: (msg: () => string) => ENGINE_Reloading = () => ENGINE_Stash(msg()),
		receive$: receiveHotReload$ as Observable<string>,
	}
};

const workerJoins: ((name: string) => void)[] = [];
WORKER_Join = (name: string) => workerJoins.forEach(w => w(name));

const workerReceive$ = new Subject<string>();
WORKER_Receive = msg => workerReceive$.next(msg);

export const worker = {
	send: (msg: string) => WORKER_Emit(msg),
	receive$: workerReceive$ as Observable<string>,
	onJoin: (handler: (name: string) => void) => workerJoins.push(handler)
};

const secondaryJoins: ((name: string) => void)[] = [];
SECONDARY_Join = (name: string) => secondaryJoins.forEach(w => w(name));

const secondaryReceive$ = new Subject<string>();
SECONDARY_Receive = msg => secondaryReceive$.next(msg);

export const secondary = {
	send: (msg: string) => SECONDARY_Emit(msg),
	receive$: secondaryReceive$ as Observable<string>,
	onJoin: (handler: (name: string) => void) => secondaryJoins.push(handler)
};

export const utility = {
	unique: UTILITY_GetUnique
};
