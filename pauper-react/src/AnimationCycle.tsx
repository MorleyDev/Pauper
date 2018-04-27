import * as React from "react";

import { Observable, combineLatest, interval, of } from "rxjs";
import { distinctUntilChanged, map, switchMap, switchMapTo } from "rxjs/operators";

import { connectStream } from "./connect";

export type AnimationCycleProps = {
	readonly framerate: number;
	readonly framecount?: number;
	readonly children: ((frame: number) => JSX.Element) | JSX.Element[];
};

export type AnimationCycleState = {
	readonly frame: number;
};

export const AnimationCycleFrame = (props: Partial<AnimationCycleProps> & AnimationCycleState): JSX.Element => {
	if (props.frame != null) {
		if (typeof props.children === "function") {
			return props.children(props.frame);
		} else if (props.children != null) {
			return props.children[props.frame];
		} else {
			return <span />;
		}
	} else {
		return <span />;
	}
};

export const AnimationCycle = connectStream<AnimationCycleProps, AnimationCycleState>(
	AnimationCycleFrame,
	({ children, framecount, framerate }) => getFrame(framerate, framecount, children)
);

function getFrame(
	framerate: Observable<number>,
	framecount?: Observable<number | undefined>,
	children?: Observable<((frame: number) => JSX.Element) | JSX.Element[]>
): Observable<AnimationCycleState> {
	return framerate.pipe(
		switchMap(framerate => interval(1000 / framerate)),
		switchMapTo(getFrameCount(framecount, children), (counter, framecount) => [framecount, counter]),
		map(([framecount, counter]) => ({ frame: counter % framecount }))
	);
}

function getFrameCount(framecount?: Observable<number | undefined>, children?: Observable<JSX.Element[] | ((frame: number) => JSX.Element) | undefined>): Observable<number> {
	const framecount$ = framecount || of(undefined);
	const children$ = children || of(undefined);

	return combineLatest(framecount$, children$).pipe(
		map(([framecount, children]) => framecount != null
			? framecount
			: children != null && typeof children !== "function"
				? children.length
				: 0)
	);
}
