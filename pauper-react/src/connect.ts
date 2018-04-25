import * as React from "react";

import { map, scan, tap } from "rxjs/operators";

import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { distinctUntilChanged } from "rxjs/operators/distinctUntilChanged";
import { from } from "rxjs/observable/from";
import { merge } from "rxjs/observable/merge";

export type ObservableProperties<T> = {
	[x in keyof T]: Observable<T[x]>;
};

export function connectStream<TProperties, T>(
	Inner: React.Component<T & TProperties, any> | ((props: T & TProperties) => JSX.Element),
	observables: ObservableProperties<T> | ((subject: ObservableProperties<TProperties>, context: any) => Observable<T>),
	defaults?: {[x in keyof T]: T[x]} | ((prop: TProperties, context: any) => {[x in keyof T]: T[x]}),
	contextTypes?: any
) {
	// Extracts the observable mappings from a function or individual
	const extractObservableMap = (props: TProperties, subject: {[x in keyof TProperties]: Observable<TProperties[x]> }, context: any): Observable<Partial<T>> => {
		if (typeof observables === "function") {
			const distinctProps = Object.keys(subject)
				.map(key => ({ [key]: (subject as any)[key].pipe(distinctUntilChanged()) }))
				.reduce((prev, curr) => ({ ...prev, ...curr }), { });
			return observables(distinctProps as any, context);
		} else {
			return from(Object.keys(observables)).pipe(
				map(key => ({ [key as keyof T]: observables[key as keyof T] })),
				scan((state, kv) => ({ ...state, ...kv }), {}),
			);
		}
	};

	const extractDefaultState = (props: TProperties, context: any): Readonly<Partial<T>> =>
		typeof defaults === "function"
			? defaults(props, context)
			: (defaults || {}) as Readonly<Partial<T>>;

	// The wrapper class which manages mount/unmount and resubscribes to an observable if the property that drives it has changed
	class Wrapper extends React.Component<TProperties, Partial<T>> {
		public state: Readonly<Partial<T>> = extractDefaultState(this.props, this.context);
		public propertySubject = Object.keys(this.props)
			.map(key => ({ [key]: new Subject<any>() }))
			.reduce((prev, curr) => ({ ...prev, ...curr }));

		public subscriptions = extractObservableMap(this.props, this.propertySubject as any, this.context)
			.subscribe(pair => this.setState(state => ({ ...(state as any), ...(pair as any) })));

		public componentDidMount() {
			Object.keys(this.props).forEach(key => this.propertySubject[key].next((this.props as any)[key]));
		}

		public componentWillReceiveProps(props: TProperties) {
			if (typeof observables !== "function") {
				return;
			}

			Object.keys(this.props).forEach(key => this.propertySubject[key].next((this.props as any)[key]));
		}

		public render() {
			return this.state != null && React.createElement(Inner as any, { ...(this.props as any), ...(this.state as any) }, this.props.children);
		}

		public componentWillUnmount() {
			this.subscriptions.unsubscribe();
		}

		public static contextTypes = contextTypes;
	}
	return (props: TProperties): JSX.Element => React.createElement(Wrapper, props, (props as any).children);
}
