
import { SfmlAssetLoader } from "@morleydev/pauper-core/assets/sfml-asset-loader.service";
import { SfmlAudioService } from "@morleydev/pauper-core/audio/sfml-audio.service";
import { SfmlKeyboard } from "@morleydev/pauper-core/input/SfmlKeyboard";
import { SfmlMouse } from "@morleydev/pauper-core/input/SfmlMouse";
import { SfmlSystem } from "@morleydev/pauper-core/input/SfmlSystem";
import { sfml } from "@morleydev/pauper-core/engine/sfml";
import { Point2, Line2, Rectangle } from "@morleydev/pauper-core/models/shapes.model";
import { RGB } from "@morleydev/pauper-core/models/colour.model";
import { filter } from "rxjs/operators";
import { MouseButton } from "@morleydev/pauper-core/models/mouse-button.model";
import { Vector2 } from "@morleydev/pauper-core/maths/vector.maths";

const audio = new SfmlAudioService();
const loader = new SfmlAssetLoader();
const mouse = new SfmlMouse();
const keyboard = new SfmlKeyboard();
const system = new SfmlSystem();

const state = {
    startPoint: null as Point2 | null,
    tempEndPoint: null as Point2 | null,
    lines: [] as Line2[],
    background: RGB(0, 0, 0)
};

mouse.mouseDown(MouseButton.Left).subscribe(pos => {
    state.startPoint = pos;
    state.tempEndPoint = pos;
});
mouse.mouseUp(MouseButton.Left).subscribe(pos => {
    state.lines.push(Line2(state.startPoint!, state.tempEndPoint!));
    state.startPoint = null;
    state.tempEndPoint = null;
});
mouse.mouseMove().pipe(filter(_ => state.startPoint != null)).subscribe(pos => state.tempEndPoint = pos);

system.closed().subscribe(() => {
    sfml.close();
});

sfml.screen.setSize(Vector2(640, 480));
sfml.screen.setView(Rectangle(0, 0, 640, 480), 0);
sfml.input.start();

requestAnimationFrame(function draw() {
    sfml.screen.clear(state.background);

    state.lines.forEach(line => sfml.screen.stroke(line, RGB(255, 255, 255)));
    if (state.startPoint != null && state.tempEndPoint != null) {
        sfml.screen.stroke(Line2(state.startPoint, state.tempEndPoint), RGB(255, 0, 0));
    }
    requestAnimationFrame(draw);
});
