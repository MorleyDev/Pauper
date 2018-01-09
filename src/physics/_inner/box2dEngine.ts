import { Box2dBodyId, box2d } from "../../engine/box2d";
import { Circle, Rectangle, Shape2 } from "../../models/shapes.model";

import { Collision } from "../collision.model";
import { EntityComponentReducerEvents } from "../../ecs/entity-component.reducer";
import { EntityId } from "../../ecs/entity-base.type";
import { HardBodyComponent } from "../component/HardBodyComponent";
import { PhysicsUpdateResult } from "../update.model";
import { Seconds } from "../../models/time.model";
import { StaticBodyComponent } from "../component/StaticBodyComponent";
import { Vector2 } from "../../maths/vector.maths";
import { createPhysicsEcsEvents } from "../reducer/ecs-events.func";
import { createPhysicsReducer } from "../reducer/physics-body.reducer";

const applyForce = (component: HardBodyComponent): HardBodyComponent => {
	if (component.pendingForces.length === 0) {
		return component;
	} else {
		for (const f of component.pendingForces) {
			box2d.applyForce(component._body as Box2dBodyId, f.location, f.force);
		}
		return {
			...component,
			pendingForces: []
		};
	}
};

const bodyEntityIdMap: { [body: number]: EntityId | undefined } = {};

const attachHardBodyToPhysics = (entityId: EntityId, component: HardBodyComponent): HardBodyComponent => {
	const shape = Shape2.add(component.shape, component.position);
	component._body = box2d.createBody(shape, {
		density: component.density,
		elasticity: component.elasticity,
		static: false
	});
	bodyEntityIdMap[(component._body as Box2dBodyId)] = entityId;
	return component;
};

const attachStaticBodyToPhysics = (entityId: EntityId, component: StaticBodyComponent): StaticBodyComponent => {
	const shape = Shape2.add(component.shape, component.position);
	component._body = box2d.createBody(shape, { static: true });
	bodyEntityIdMap[component._body] = entityId;
	return component;
};

const syncComponent = (hardbody: HardBodyComponent): HardBodyComponent => {
	if (hardbody._body == null) {
		return hardbody;
	}
	const ref = (hardbody._body as Box2dBodyId);
	const def = box2d.getDefinition(ref);

	const speedSquared = Vector2.magnitudeSquared(def.velocity);
	const angularSpeedSquared = def.angularVelocity * def.angularVelocity;
	const motion = speedSquared + angularSpeedSquared;
	const isResting = motion < 1;

	return {
		...hardbody,
		isResting,
		position: def.position,
		velocity: def.velocity,
		angularVelocity: def.angularVelocity,
		rotation: def.rotation
	};
};

const detachPhysics = (id: EntityId, component: HardBodyComponent | StaticBodyComponent) => {
	const ref = (component._body as Box2dBodyId);
	box2d.destroyBody(ref);
	bodyEntityIdMap[component._body.id] = undefined;
};

export const box2dPhysicsEcsEvents: EntityComponentReducerEvents = createPhysicsEcsEvents(
	attachHardBodyToPhysics,
	attachStaticBodyToPhysics,
	detachPhysics,
	detachPhysics
);

export const box2dAdvancePhysicsEngine = (deltaTime: Seconds): PhysicsUpdateResult => {
	const result = box2d.advance(deltaTime);
	return {
		collisionStarts: result.collision.starts.map(({ a, b }) => ({
			a: bodyEntityIdMap[a]!,
			b: bodyEntityIdMap[b]!
		})),
		collisionEnds: result.collision.ends.map(({ a, b }) => ({
			a: bodyEntityIdMap[a]!,
			b: bodyEntityIdMap[b]!
		}))
	};
};

const setGravity = (gravity: Vector2): void => box2d.setGravity(Vector2.multiply(gravity, 100));

export const box2dPhysicsReducer = createPhysicsReducer(
	box2dAdvancePhysicsEngine,
	syncComponent,
	applyForce,
	setGravity
);

box2d.setGravity(Vector2(0.0, 980.0));
