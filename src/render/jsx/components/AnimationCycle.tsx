import * as React from "react";

import { map, switchMap } from "rxjs/operators";

import { Subject } from "rxjs/Subject";
import { connectStream } from "../connect";
import { interval } from "rxjs/observable/interval";

type AnimationCycleProps = {
	readonly framerate: number;
	readonly framecount?: number;
	readonly children: ((frame: number) => JSX.Element) | JSX.Element[];
};

type AnimationCycleState = {
	readonly frame: number;
};

export const AnimationCycle = connectStream(
	(props: AnimationCycleProps & AnimationCycleState) => typeof props.children === "function"
		? props.children(props.frame)
		: props.children[props.frame],
	(props: Subject<AnimationCycleProps>) => props.pipe(switchMap(props => {
		const framecount = props.framecount || props.children.length;
		return interval(1000 / props.framerate).pipe(
			map(f => f % framecount),
			map(frame => ({ frame }))
		);
	})),
	{ frame: 0 }
);
