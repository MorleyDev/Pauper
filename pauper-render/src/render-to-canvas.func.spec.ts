import * as test from "tap";
import * as fs from "fs";
import { renderToCanvas } from "./render-to-canvas.func";
import { WebAssetLoader } from "@morleydev/pauper-core/assets/web-asset-loader.service";
import { JSDOM } from "jsdom";
import * as draw from "./render-frame.model";
import { RGB, RGBA } from "@morleydev/pauper-core/models/colour.model";
import * as shape from "@morleydev/pauper-core/models/shapes.model";
import { toRadians } from "@morleydev/pauper-core/maths/angles.maths";

test.test("render-to-canvas", test => {
	test.test("renderToCanvas :: Frame -> Eff (() -> Canvas)", async test => {
		const dom = new JSDOM(`<html><body><canvas id="test-target" width="320" height="240"></canvas></body></html>`);

		const canvas = dom.window.document.getElementById("test-target") as HTMLCanvasElement;
		renderToCanvas({
			document: dom.window.document,
			canvas,
			context: canvas.getContext("2d")!,
			assets: new WebAssetLoader()
		}, draw.Frame(
			draw.Origin(
				shape.Point2(160, 120),
				draw.Frame(
					draw.Rotate(
						toRadians(90),
						draw.Frame(
							draw.Clear(RGB(0, 255, 0)),
							draw.Fill(shape.Rectangle(10, 26, 29, 32), RGB(0, 0, 0)),
							draw.Fill(shape.Triangle2(shape.Point2(5, 5), shape.Point2(10, 25), shape.Point2(50, 50)), RGBA(255, 0, 0, 0.25)),
							draw.Fill(shape.Circle(0, 0, 15), RGBA(255, 100, 60, 0.75)),
							draw.Stroke(shape.Circle(0, 0, 20), RGBA(255, 100, 160))
						)
					)
				)
			)
		));

		const blob = await new Promise<Blob>(resolve => canvas.toBlob(blob => resolve(blob!)));
		const dataArrayBuffer = await new Promise<ArrayBuffer>(resolve => {
			const reader = new (dom.window as any).FileReader();
			reader.onload = () => resolve(reader.result);
			reader.readAsArrayBuffer(blob);
		});
		const data = new Buffer(dataArrayBuffer);
		const snapshot = `${__filename}.snapshot.png`;
		if (fs.existsSync(snapshot)) {
			const snapshotBuffer = fs.readFileSync(snapshot);
			test.true(data.equals(snapshotBuffer), "should match snapshot");
		} else {
			fs.writeFileSync(snapshot, data);
			test.fail("No snapshot. Check snapshot and rerun tests.")
		}
		test.end();
	});
	test.end();
});
