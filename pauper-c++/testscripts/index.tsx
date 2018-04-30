import "@morleydev/pauper-react/render";

import * as React from "react";

import { Line2, Point2, Rectangle } from "@morleydev/pauper-core/models/shapes.model";

import { FrameCollection } from "@morleydev/pauper-render/render-frame.model";
import { MouseButton } from "@morleydev/pauper-core/models/mouse-button.model";
import { RGB } from "@morleydev/pauper-core/models/colour.model";
import { Vector2 } from "@morleydev/pauper-core/maths/vector.maths";
import { createDriver } from "@morleydev/pauper-drivers/create-driver";
import { filter } from "rxjs/operators";

const drivers = createDriver();

drivers.input.system.closed().subscribe(() => drivers.close());

drivers.resize(Vector2(640, 480));

type GameAppState = {
	readonly startPoint: Point2 | null;
	readonly tempEndPoint: Point2 | null;
	readonly lines: ReadonlyArray<Line2>;
	readonly background: RGB;
};

class GameApp extends React.Component<{}, GameAppState> {
	public readonly state: GameAppState = {
		startPoint: null,
		tempEndPoint: null,
		lines: [],
		background: RGB(0, 0, 0)
	};

	public componentWillMount() {
		drivers.input.mouse.mouseDown(MouseButton.Left).subscribe(pos => {
			this.setState(state => ({ startPoint: pos, tempEndPoint: pos }));
		});
		drivers.input.mouse.mouseUp(MouseButton.Left).subscribe(pos => {
			this.setState(state => ({
				startPoint: null,
				tempEndPoint: null,
				lines: [...state.lines, Line2(state.startPoint || pos, pos)]
			}));
		});
		drivers.input.mouse.mouseMove()
			.pipe(filter(_ => this.state.startPoint != null))
			.subscribe(pos => this.setState(state => ({ ...state, tempEndPoint: pos })));
	}

	public render() {
		return (
			<clear colour={this.state.background}>
				<rendertarget id="lines" dst={Rectangle(0, 0, 640, 480)} size={Vector2(640, 480)}>
					<clear colour={RGB(0, 0, 0)}>
						{this.state.lines.map((line, index) => <stroke key={index} shape={line} colour={RGB(255, 255, 255)} />)}
					</clear>
				</rendertarget>
				{this.state.startPoint != null
					&& this.state.tempEndPoint != null
					&& (
						<stroke
							shape={Line2(this.state.startPoint, this.state.tempEndPoint)}
							colour={RGB(255, 0, 0)} />
					)}
			</clear>
		);
	}
}

drivers.start(<GameApp />);
