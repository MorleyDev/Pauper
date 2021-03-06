import { Observable, Subject } from "rxjs";

const receiveHotReload$ = new Subject<string>();
if (typeof ENGINE_Reloaded !== "undefined") {
	ENGINE_Reloaded = msg => receiveHotReload$.next(msg);
}
if (typeof ENGINE_Reloading !== "undefined") {
	ENGINE_Reloading = () => ENGINE_Stash("{}");
}

export const engine = {
	available: typeof ENGINE_Stash !== "undefined",
	hotreload: {
		onStash: typeof ENGINE_Stash !== "undefined"
			? (msg: () => string) => ENGINE_Reloading = () => ENGINE_Stash(msg())
			: (msg: () => string) => { },
		receive$: receiveHotReload$ as Observable<string>,
	}
};

const workerJoins: ((name: string) => void)[] = [];
if (typeof WORKER_Join !== "undefined") {
	WORKER_Join = (name: string) => workerJoins.forEach(w => w(name));
}

const workerReceive$ = new Subject<string>();
if (typeof WORKER_Receive !== "undefined") {
	WORKER_Receive = msg => workerReceive$.next(msg);
}

export const worker = {
	available: typeof WORKER_Emit !== "undefined",
	send: typeof WORKER_Emit !== "undefined" ? (msg: string) => WORKER_Emit(msg) : (msg: string) => { },
	receive$: workerReceive$ as Observable<string>,
	onJoin: (handler: (name: string) => void) => workerJoins.push(handler)
};

const secondaryJoins: ((name: string) => void)[] = [];
if (typeof SECONDARY_Join !== "undefined") {
	SECONDARY_Join = (name: string) => secondaryJoins.forEach(w => w(name));
}

const secondaryReceive$ = new Subject<string>();
if (typeof SECONDARY_Receive !== "undefined") {
	SECONDARY_Receive = msg => secondaryReceive$.next(msg);
}

export const secondary = {
	available: typeof SECONDARY_Emit !== "undefined",
	send: typeof SECONDARY_Emit !== "undefined" ? (msg: string) => SECONDARY_Emit(msg) : (msg: string) => { },
	receive$: secondaryReceive$ as Observable<string>,
	onJoin: (handler: (name: string) => void) => secondaryJoins.push(handler)
};

export const utility = {
	available: typeof UTILITY_GetUnique !== "undefined",
	unique: () => UTILITY_GetUnique()
};
