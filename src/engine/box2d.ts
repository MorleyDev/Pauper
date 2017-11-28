import { Vector2 } from "../maths/vector.maths";
import { Shape2, Rectangle, Circle, Point2 } from "../models/shapes.model";
import { Radian } from "../maths/angles.maths";
import { Seconds } from "../models/time.model";

export type BodyProperties = {
	readonly static: boolean;
	readonly friction: number;
	readonly elasticity: number;
	readonly density: number;
};

export type BodyDefinition = {
	readonly position: Point2;
	readonly velocity: Vector2;
	readonly angularVelocity: number;
	readonly rotation: Radian;
};

export type CollisionRecord = {
	readonly a: Box2dBodyId;
	readonly b: Box2dBodyId;
};

export type Box2dBodyId = number;

export const box2d = {
	setGravity: ({ x, y }: Vector2) => BOX2D_SetGravity(x, y),
	createBody: (shape: Shape2, props?: Partial<BodyProperties>): Box2dBodyId => {
		const defaultProps: BodyProperties = {
			density: 1,
			friction: 1,
			elasticity: 0,
			static: false
		};
		const pprops = props != null ? { ...defaultProps, ...props } : defaultProps;
		if (Array.isArray(shape)) {
			if (shape.length === 3) {
				return BOX2D_CreateBody_Tri(shape[0].x, shape[0].y, shape[1].x, shape[1].y, shape[2].x, shape[2].y, pprops.static, pprops.density, pprops.friction, pprops.elasticity);
			} else {
				// TODO
				throw new Error();
			}
		} else if (Rectangle.is(shape)) {
			return BOX2D_CreateBody_Box(shape.x, shape.y, shape.width, shape.height, pprops.static, pprops.density, pprops.friction, pprops.elasticity);
		} else if (Circle.is(shape)) {
			return BOX2D_CreateBody_Ball(shape.x, shape.y, shape.radius, pprops.static, pprops.density, pprops.friction, pprops.elasticity);
		} else {
			// TODO
			throw new Error();
		}
	},
	getDefinition: (id: number): BodyDefinition => {
		const def = BOX2D_GetBody(id);
		return {
			angularVelocity: def.angularVelocity,
			position: Point2(def.positionX, def.positionY),
			rotation: def.angle,
			velocity: Vector2(def.velocityX, def.velocityY)
		};
	},
	applyForce: (id: number, location: Point2, force: Vector2) => {
		BOX2D_ApplyForce(id, location.x, location.y, force.x, force.y);
	},
	destroyBody: (id: number) => {
		BOX2D_DestroyBody(id);
	},
	advance: (deltaTime: Seconds) => {
		BOX2D_Advance(deltaTime);
		const csCount = BOX2D_GetCollisionStartCount();
		const ceCount = BOX2D_GetCollisionEndCount();
		const collisionStarts: CollisionRecord[] = Array(csCount);
		const collisionEnds: CollisionRecord[] = Array(ceCount);
		for (let i = 0; i < csCount; ++i) {
			const c = BOX2D_PullCollisionStart()!;
			collisionStarts[i] = { a: c.a, b: c.b };
		}
		for (let i = 0; i < ceCount; ++i) {
			const c = BOX2D_PullCollisionEnd()!;
			collisionEnds[i] = { a: c.a, b: c.b };
		}
		return {
			collision: {
				starts: collisionStarts,
				ends: collisionEnds
			}
		};
	}
};
