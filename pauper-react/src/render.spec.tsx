import * as React from "react";

import { Blit, Clear, Fill, Origin, RenderTarget, Rotate, Scale, Stroke } from "@morleydev/pauper-render/render-frame.model";
import { Circle, Rectangle } from "@morleydev/pauper-core/models/shapes.model";
import { RGB, RGBA } from "@morleydev/pauper-core/models/colour.model";

import { Vector2 } from "@morleydev/pauper-core/maths/vector.maths";
import { createElement } from "react";
import { render } from "./render";
import { test } from "tap";

test("render/jsx/render", test => {
	test.test("simple", test => {
		const renderer = render(
			<clear colour={RGB(0, 0, 0)}>
				<blit dst={Rectangle(-25, -25, 100, 50)} image="test_image.png" />
				<scale by={Vector2(2, 3)}>
					<stroke shape={Circle(0, 0, 25)} colour={RGBA(100, 200, 100, 0.5)} />
					<group>
						<rotate radians={0.2}>
							<fill shape={Circle(0, 0, 25)} colour={RGBA(100, 200, 100, 0.5)} />
						</rotate>
					</group>
				</scale>
				<origin coords={Vector2(20, -10)}>
					<>
						<stroke shape={Circle(0, 0, 25)} colour={RGBA(100, 200, 100, 0.5)} />
						{[
							<stroke key={0} shape={Circle(10, 0, 25)} colour={RGBA(100, 200, 100, 0.5)} />,
							<stroke key={1} shape={Circle(0, 20, 25)} colour={RGBA(100, 200, 100, 0.5)} />,
							<stroke key={2} shape={Circle(10, 10, 25)} colour={RGBA(100, 200, 100, 0.5)} />
						]}
					</>
				</origin>
			</clear>
		);

		const frame = renderer();
		test.deepEqual(frame, [[
			Clear(RGB(0, 0, 0)),
			[
				Blit("test_image.png", Rectangle(-25, -25, 100, 50)),
				Scale(Vector2(2, 3), [
					Stroke(Circle(0, 0, 25), RGBA(100, 200, 100, 0.5)),
					[
						Rotate(0.2, [
							Fill(Circle(0, 0, 25), RGBA(100, 200, 100, 0.5)),
						])
					]
				]),
				Origin(Vector2(20, -10), [
					Stroke(Circle(0, 0, 25), RGBA(100, 200, 100, 0.5)),
					Stroke(Circle(10, 0, 25), RGBA(100, 200, 100, 0.5)),
					Stroke(Circle(0, 20, 25), RGBA(100, 200, 100, 0.5)),
					Stroke(Circle(10, 10, 25), RGBA(100, 200, 100, 0.5))
				])
			]
		]]);
		test.end();
	});
	test.test("state", test => {
		let setY = (y: number) => { };
		class TestStateComponent extends React.Component<{ x: number }, { y: number }> {
			state = { y: 0 };
			componentWillMount() {
				setY = y => this.setState({ y });
			}

			render() {
				return (
					<origin coords={Vector2(5, 10)}>
						<rotate radians={0.25}>
							<scale by={Vector2(2, 3)}>
								<stroke shape={Rectangle(this.props.x, this.state.y, 50, 25)} colour={RGB(25, 50, 100)} />
							</scale>
						</rotate>
					</origin>
				);
			}
		}
		const renderer = render(
			<clear colour={RGB(0, 0, 0)}>
				<TestStateComponent x={10} />
			</clear>
		);
		const frame1 = renderer();
		test.deepEqual(frame1, [[
			Clear(RGB(0, 0, 0)),
			[
				Origin(Vector2(5, 10), [
					Rotate(0.25, [
						Scale(Vector2(2, 3), [
							Stroke(Rectangle(10, 0, 50, 25), RGB(25, 50, 100))
						])
					])
				])
			]
		]]);
		setY(20);
		const frame2 = renderer();
		test.deepEqual(frame2, [[
			Clear(RGB(0, 0, 0)),
			[

				Origin(Vector2(5, 10), [
					Rotate(0.25, [
						Scale(Vector2(2, 3), [
							Stroke(Rectangle(10, 20, 50, 25), RGB(25, 50, 100))
						])
					])
				])
			]
		]]);

		test.end();
	});
	test.test("renderTarget", test => {
		const renderer = render(
			<clear colour={RGB(0, 0, 0)}>
				<rendertarget id="test_rt" dst={Rectangle(25, 25, 100, 100)}>
					<blit dst={Rectangle(-25, -25, 100, 50)} image="test_image.png"></blit>
				</rendertarget>
			</clear>
		);

		const frame1 = renderer();
		test.deepEqual(frame1, [[
			Clear(RGB(0, 0, 0)),
			[
				RenderTarget("test_rt", Rectangle(25, 25, 100, 100), [
					Blit("test_image.png", Rectangle(-25, -25, 100, 50))
				])
			]]
		]);

		const frame2 = renderer();
		test.deepEqual(frame2, [[
			Clear(RGB(0, 0, 0)),
			[
				RenderTarget("test_rt", Rectangle(25, 25, 100, 100))
			]
		]]);
		test.end();
	});
	test.test("state with renderTarget", test => {
		let setY = (y: number) => { };
		let setZ = (z: number) => { };

		class TestStateComponent extends React.Component<{ x: number }, { y: number, z: number }> {
			public state = { y: 0, z: 0 };

			componentWillMount() {
				setZ = z => this.setState(state => ({ ...state, z }));
				setY = y => this.setState(state => ({ ...state, y }));
			}

			render() {
				return (
					<rendertarget id="test_id" dst={Rectangle(5, this.state.z, 25, 30)}>
						<origin coords={Vector2(5, 10)}>
							<rotate radians={0.25}>
								<scale by={Vector2(2, 3)}>
									<stroke shape={Rectangle(this.props.x, this.state.y, 50, 25)} colour={RGB(25, 50, 100)} />
								</scale>
							</rotate>
						</origin>
					</rendertarget>
				);
			}
		}
		const renderer = render(
			<clear colour={RGB(0, 0, 0)}>
				<TestStateComponent x={10} />
			</clear>
		);
		const frame1 = renderer();
		test.deepEqual(frame1, [[
			Clear(RGB(0, 0, 0)),
			[
				RenderTarget("test_id", Rectangle(5, 0, 25, 30), [
					Origin(Vector2(5, 10), [
						Rotate(0.25, [
							Scale(Vector2(2, 3), [
								Stroke(Rectangle(10, 0, 50, 25), RGB(25, 50, 100))
							])
						])
					])
				])
			]
		]]);
		const frame2 = renderer();
		test.deepEqual(frame2, [[
			Clear(RGB(0, 0, 0)),
			[
				RenderTarget("test_id", Rectangle(5, 0, 25, 30))
			]
		]]);
		setZ(10);
		const frame3 = renderer();
		test.deepEqual(frame3, [[
			Clear(RGB(0, 0, 0)),
			[
				RenderTarget("test_id", Rectangle(5, 10, 25, 30))
			]
		]]);
		setY(20);
		const frame4 = renderer();
		test.deepEqual(frame4, [[
			Clear(RGB(0, 0, 0)),
			[
				RenderTarget("test_id", Rectangle(5, 10, 25, 30), [
					Origin(Vector2(5, 10), [
						Rotate(0.25, [
							Scale(Vector2(2, 3), [
								Stroke(Rectangle(10, 20, 50, 25), RGB(25, 50, 100))
							])
						])
					])
				])
			]
		]]);

		test.end();
	});

	test.test("renderTarget nested", test => {
		let setY = (y: number) => { };
		let setZ = (z: number) => { };

		class TestStateComponent extends React.Component<{}, { y: number, z: number }> {
			public state = { y: 5, z: -25 };

			componentWillMount() {
				setZ = z => this.setState(state => ({ ...state, z }));
				setY = y => this.setState(state => ({ ...state, y }));
			}

			render() {
				return (
					<rendertarget id="test_rt" dst={Rectangle(25, 25, 100, 100)}>
						<rendertarget id="inner_rt" dst={Rectangle(2, this.state.y, 8, 9)}>
							<blit dst={Rectangle(-25, this.state.z, 100, 50)} image="test_image.png"></blit>
						</rendertarget>
					</rendertarget>
				);
			}
		}

		const renderer = render(
			<clear colour={RGB(0, 0, 0)}>
				<TestStateComponent />
			</clear>
		);

		const frame1 = renderer();
		test.deepEqual(frame1, [[
			Clear(RGB(0, 0, 0)),
			[
				RenderTarget("test_rt", Rectangle(25, 25, 100, 100), [
					RenderTarget("inner_rt", Rectangle(2, 5, 8, 9), [
						Blit("test_image.png", Rectangle(-25, -25, 100, 50))
					])
				])
			]]
		]);

		const frame2 = renderer();
		test.deepEqual(frame2, [[
			Clear(RGB(0, 0, 0)),
			[
				RenderTarget("test_rt", Rectangle(25, 25, 100, 100))
			]
		]]);

		setZ(25);
		const frame3 = renderer();
		test.deepEqual(frame3, [[
			Clear(RGB(0, 0, 0)),
			[
				RenderTarget("test_rt", Rectangle(25, 25, 100, 100), [
					RenderTarget("inner_rt", Rectangle(2, 5, 8, 9), [
						Blit("test_image.png", Rectangle(-25, 25, 100, 50))
					])
				])
			]]
		]);

		setY(25);
		const frame4 = renderer();
		test.deepEqual(frame4, [[
			Clear(RGB(0, 0, 0)),
			[
				RenderTarget("test_rt", Rectangle(25, 25, 100, 100), [
					RenderTarget("inner_rt", Rectangle(2, 25, 8, 9))
				])
			]]
		]);

		test.end();
	});

	test.end();
});
