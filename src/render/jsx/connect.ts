import * as React from "react";

import { map, scan } from "rxjs/operators";

import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { from } from "rxjs/observable/from";
import { merge } from "rxjs/observable/merge";

export function connectStream<TProperties, T>(
	Inner: React.Component<T & TProperties, any> | ((props: T & TProperties) => JSX.Element),
	observables: ({[x in keyof T]: Observable<T[x]> }) | ((subject: Subject<TProperties>, context: any) => Observable<T>),
	defaults?: {[x in keyof T]: T[x]} | ((prop: TProperties, context: any) => {[x in keyof T]: T[x]}),
	contextTypes?: any
) {
	// Extracts the observable mappings from a function or individual
	const extractObservableMap = (props: TProperties, subject: Subject<TProperties>, context: any): Observable<Partial<T>> => {
		if (typeof observables === "function") {
			return observables(subject, context);
		} else {
			return from(Object.keys(observables))
				.pipe(
					map(key => ({ [key as keyof T]: observables[key as keyof T] }) ),
					scan((state, kv) => ({ ...state, ...kv }), {})
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
		public propertySubject = new Subject<TProperties>();

		public subscriptions = extractObservableMap(this.props, this.propertySubject, this.context)
			.subscribe(pair => this.setState(state => ({ ...(state as any), ...(pair as any) })));

		public componentWillMount() {
			this.propertySubject.next(this.props);
		}

		public componentWillReceiveProps(props: TProperties) {
			if (typeof observables !== "function" || props === this.props) {
				return;
			}
			this.propertySubject.next(props);
		}

		public render() {
			return this.state != null && React.createElement(Inner as any, this.state, this.props.children);
		}

		public componentWillUnmount() {
			this.subscriptions.unsubscribe();
		}

		public static contextTypes = contextTypes;
	}
	return (props: TProperties): JSX.Element => React.createElement(Wrapper, props);
}