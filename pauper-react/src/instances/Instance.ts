import * as React from 'react';
import { Shape2 } from '@morleydev/pauper-core/models/shapes.model';
import { RGB, RGBA } from '@morleydev/pauper-core/models/colour.model';
import { FrameCommand, Stroke, Frame, FrameCollection } from '@morleydev/pauper-render/render-frame.model';

export abstract class Instance<T> {
    parent: any;

    constructor(public props: T) {
    }

    invalidate() {
        this.parent.invalidate();
    }

    replaceProps(newProps: T) {
        const prevProps = this.props;
        this.props = newProps;
        if (areDifferent(prevProps, newProps)) {
            this.invalidate();
        }
    }

    abstract draw(): FrameCommand | FrameCollection;

    compareProps(originalProps: T, newProps: T) {
        return areDifferent(originalProps, newProps);
    }
}

function areDifferent(lhs: any, rhs: any): boolean {
    for (const key in lhs) if (!(key in rhs)) return true;
    for (const key in rhs) {
        const lv = lhs[key];
        const rv = rhs[key];
        if (lv instanceof Object && rv instanceof Object) {
            return areDifferent(lv, rhs);
        } else if (lv !== rv) {
            return true;
        }
    }
    return false;
}
