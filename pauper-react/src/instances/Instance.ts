import * as React from "react";

import { Frame, FrameCollection, FrameCommand, Stroke } from "@morleydev/pauper-render/render-frame.model";
import { RGB, RGBA } from "@morleydev/pauper-core/models/colour.model";

import { Shape2 } from "@morleydev/pauper-core/models/shapes.model";
import { shallowCompare } from "../util/shallowCompare";
import { FrameRendererHooks } from "../FrameRendererHooks";

export abstract class Instance<T> {
    parent?: Instance<T>;

    constructor(public name: string, public props: T, public hooks: FrameRendererHooks) {
    }

    invalidate(fromChild: boolean) {
        this.parent && this.parent.invalidate(true);
    }

    replaceProps(newProps: T) {
        const prevProps = this.props;
        this.props = newProps;
        if (this.shouldInvalidate(prevProps, newProps)) {
            this.invalidate(false);
        }
    }

    abstract draw(): FrameCommand | FrameCollection;

    abstract shouldInvalidate(originalProps: T, newProps: T): boolean;

    dispose() { }
}
