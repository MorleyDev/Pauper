import "poly-decomp";

import { Bodies, Body, Engine, Events, IChamferableBodyDefinition, Vector, World } from "matter-js";
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

function makeEngine(): Engine {
	const engine = Engine.create();
	// engine.enableSleeping = true;
	engine.world.gravity = { x: 0, y: 9.8, scale: 0.0001 };
	return engine;
}

const collisionStartEvents: Collision[] = [];
const collisionEndEvents: Collision[] = [];

function attachEvents(engine: Engine): Engine {
	Events.off(engine, "collisionStart", undefined as any);
	Events.off(engine, "collisionEnd", undefined as any);

	Events.on(engine, "collisionStart", (collision) => {
		const a = (collision.pairs[0].bodyA as any).name;
		const b = (collision.pairs[0].bodyB as any).name;
		collisionStartEvents.push({ a, b });
	});
	Events.on(engine, "collisionEnd", (collision) => {
		const a = (collision.pairs[0].bodyA as any).name;
		const b = (collision.pairs[0].bodyB as any).name;
		collisionEndEvents.push({ a, b });
	});
	return engine;
}

const setGravity = (engine: Engine) => (gravity: Vector2): void => {
	engine.world.gravity = ({
		scale: engine.world.gravity.scale,
		x: gravity.x,
		y: gravity.y
	});
};

const applyForce = (component: HardBodyComponent): HardBodyComponent => {
	if (component.pendingForces.length === 0) {
		return component;
	} else {
		for (const f of component.pendingForces) {
			Body.applyForce((component._body as any)!, Vector.create(f.location.x, f.location.y), Vector.create(f.force.x, f.force.y));
		}
		return {
			...component,
			pendingForces: []
		};
	}
};

const attachHardBodyToPhysics = (entityId: EntityId, component: HardBodyComponent): HardBodyComponent => {
	component._body = shapeToBody(Shape2.add(component.shape, component.position), {
		restitution: component.elasticity,
		angularVelocity: component.angularVelocity,
		angle: component.rotation,
		velocity: component.velocity,
		position: component.position,
		density: component.density,
		name: entityId,
		isStatic: false
	});
	World.add(matterJsPhysicsEngine.world, (component._body as any)!);
	return component;
};

const attachStaticBodyToPhysics = (entityId: EntityId, component: StaticBodyComponent): StaticBodyComponent => {
	component._body = shapeToBody(Shape2.add(component.shape, component.position), {
		position: component.position,
		name: entityId,
		isStatic: true
	});
	World.add(matterJsPhysicsEngine.world, component._body!);
	return component;
};

const syncComponent = (hardbody: HardBodyComponent): HardBodyComponent => {
	if (hardbody._body == null) {
		return hardbody;
	}

	const body = hardbody._body as any;
	const motion = body.speed * body.speed + body.angularSpeed * body.angularSpeed;
	const isResting = motion < 1;

	return {
		...hardbody,
		isResting,
		position: {
			x: body.position.x,
			y: body.position.y
		},
		velocity: {
			x: body.velocity.x,
			y: body.velocity.y,
		},
		angularVelocity: body.angularVelocity,
		rotation: body.angle
	};
};

const shapeToBody = (shape: Shape2, props: IChamferableBodyDefinition & { readonly name: string }): Body => {
	if (Array.isArray(shape)) {
		const centre = Shape2.getCentre(shape);
		return Bodies.fromVertices(centre.x, centre.y, [shape.map(({ x, y }) => Vector.create(x, y))], props);
	} else if (Rectangle.is(shape)) {
		return Bodies.rectangle(shape.x + shape.width / 2, shape.y + shape.height / 2, shape.width, shape.height, props);
	} else if (Circle.is(shape)) {
		return Bodies.circle(shape.x, shape.y, shape.radius, props);
	} else {
		throw new Error();
	}
};

const detachPhysics = (id: EntityId, component: HardBodyComponent | StaticBodyComponent) => {
	World.remove(matterJsPhysicsEngine.world, component._body!);
};

export const matterJsPhysicsEcsEvents: EntityComponentReducerEvents = createPhysicsEcsEvents(
	attachHardBodyToPhysics,
	attachStaticBodyToPhysics,
	detachPhysics,
	detachPhysics
);

const matterJsPhysicsEngine = attachEvents(makeEngine());

export const matterJsAdvancePhysicsEngine = (deltaTime: Seconds): PhysicsUpdateResult => {
	Engine.update(matterJsPhysicsEngine, deltaTime * 1000);
	return {
		collisionStarts: collisionStartEvents.splice(0, collisionStartEvents.length),
		collisionEnds: collisionEndEvents.splice(0, collisionEndEvents.length)
	};
};

export const matterJsPhysicsReducer = createPhysicsReducer(
	matterJsAdvancePhysicsEngine,
	syncComponent,
	applyForce,
	setGravity(matterJsPhysicsEngine)
);
