import { hardBodyPostReducer, hardBodyPreReducer } from "./hardbody.reducer";

import { $$ } from "@morleydev/functional-pipe";
import { EntitiesState } from "../../ecs/entities.state";
import { GenericAction } from "../../redux/generic.action";
import { HardBodyComponent } from "../component/HardBodyComponent";
import { PhysicsUpdateResult } from "../update.model";
import { Seconds } from "../../models/time.model";
import { Vector2 } from "../../maths/vector.maths";

export type SetGravityAction = {
	readonly type: "@@PHYSICS/SET_GRAVITY";
	readonly gravity: Vector2;
};
export const SetGravityAction = (gravity: Vector2): SetGravityAction => ({ type: "@@PHYSICS/SET_GRAVITY", gravity });

export type AdvancePhysicsAction = {
	readonly type: "@@PHYSICS/TICK";
	readonly deltaTime: number;
};
export const AdvancePhysicsAction = (deltaTime: number): AdvancePhysicsAction => ({ type: "@@PHYSICS/TICK", deltaTime });

export const createPhysicsReducer = <TState extends EntitiesState>(
	advancePhysics: (deltaTime: Seconds) => PhysicsUpdateResult,
	syncComponent: (hardbody: HardBodyComponent) => HardBodyComponent,
	applyForce: (c: HardBodyComponent, location: Vector2, force: Vector2) => void,
	setGravity: (gravity: Vector2) => void
) => {
	return (onUpdate: (state: TState, result: PhysicsUpdateResult) => TState) =>
		(state: TState, action: GenericAction): TState => {
			if (action.type === "@@PHYSICS/SET_GRAVITY") {
				const { gravity } = action as SetGravityAction;
				setGravity(gravity);
				return state;
			} else if (action.type !== "@@PHYSICS/TICK") {
				return state;
			}
			const {deltaTime} = action as AdvancePhysicsAction;
			return $$(state)
				.$(state => hardBodyPreReducer(applyForce)(state, action) as TState)
				.$(state => onUpdate(state, advancePhysics(action.deltaTime)))
				.$$(state => hardBodyPostReducer(syncComponent)(state, action) as TState);
		};
};
