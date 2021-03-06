import BlitInstance from "./instances/BlitInstance";
import ClearInstance from "./instances/ClearInstance";
import FillInstance from "./instances/FillInstance";
import OriginInstance from "./instances/OriginInstance";
import RenderTargetInstance from "./instances/RenderTargetInstance";
import RotateInstance from "./instances/RotateInstance";
import ScaleInstance from "./instances/ScaleInstance";
import StrokeInstance from "./instances/StrokeInstance";
import { Instance } from "./instances/Instance";
import { HasChildrenInstance } from "./instances/HasChildrenInstance";
import { FrameRendererHooks } from "./FrameRendererHooks";
import ContainerInstance from "./instances/ContainerInstance";

const Reconciler = require("react-reconciler");

const EMPTY_OBJECT = {};
const NOOP = () => { };

export const createFrameRenderer = (hooks: FrameRendererHooks) => {
	return Reconciler({
		// Create an instance of our primitive components
		createInstance(type: string, props: any) {
			switch (type) {
				case "clear":
					return new ClearInstance(type, props, hooks);
				case "blit":
					return new BlitInstance(type, props, hooks);
				case "stroke":
					return new StrokeInstance(type, props, hooks);
				case "fill":
					return new FillInstance(type, props, hooks);
				case "rendertarget":
					return new RenderTargetInstance(type, props, hooks);
				case "scale":
					return new ScaleInstance(type, props, hooks);
				case "origin":
					return new OriginInstance(type, props, hooks);
				case "rotate":
					return new RotateInstance(type, props, hooks);
				case "group":
					return new ContainerInstance(type, props, hooks);
				default:
					throw new Error(`Invalid component type: ${type}`);
			}
		},

		// Create a text node instance
		// We return plain text since we don"t care about text nodes
		createTextInstance(text: string) {
			return text;
		},

		// Append new children for the first time
		appendInitialChild(parentInstance: any, child: any) {
			parentInstance.appendInitialChild(child);
		},

		// Called before flushing the initial tree to the host
		finalizeInitialChildren() {
			return false;
		},

		// Identity function in most scenarios, i.e. returns the same instance
		// Added to support the `getNodeMock` functionality for the TestRenderers
		getPublicInstance(instance: any) {
			return instance;
		},

		// Computes diff for the update
		// Fiber can reuse the diff even if it pauses or aborts rendering a subset of the tree
		// We don"t care about the diff since we need to redraw everything
		prepareUpdate() {
			return EMPTY_OBJECT;
		},

		// Used to trigger global side-effects in the host environment
		// In ReactDOM this is used for things such as disabling the ReactDOM events to ensure no
		// callbacks are fired during DOM manipulations
		prepareForCommit: NOOP,
		resetAfterCommit: NOOP,

		// HostContext is an internal object for any bookkeeping the renderer may need to do
		// based on current location in the tree
		// In DOM this is necessary for calling the correct `document.createElement` calls
		// depending on being in an `html`, `svg`, `mathml`, or other context of the tree
		getRootHostContext() {
			return EMPTY_OBJECT;
		},

		getChildHostContext() {
			return EMPTY_OBJECT;
		},

		// Whether to set the text content for text nodes
		// We don"t implement this since we don"t have text node instances
		shouldSetTextContent() {
			return false;
		},

		resetTextContent: NOOP,

		// Whether to schedule updates synchronously
		// This is removed in https://github.com/facebook/react/pull/11771
		useSyncScheduling: true,

		// Used by Fiber to keep track of start and expiration time
		now: typeof performance !== "undefined" ? () => performance.now() : () => Date.now(),

		mutation: {
			// Append child to the container instance
			appendChildToContainer(container: HasChildrenInstance<any>, child: Instance<any>) {
				container.appendChild(child);
			},

			// Append child to an element instance
			appendChild(parentInstance: HasChildrenInstance<any>, child: any) {
				parentInstance.appendChild(child);
			},

			// Remove child from the container instance
			removeChildFromContainer(container: HasChildrenInstance<any>, child: Instance<any>) {
				container.removeChild(child);
			},

			// Remove child from an element instance
			removeChild(parentInstance: HasChildrenInstance<any>, child: Instance<any>) {
				parentInstance.removeChild(child);
			},

			// Insert child in the container instance
			insertInContainerBefore(container: HasChildrenInstance<any>, child: Instance<any>, childBefore: Instance<any>) {
				container.insertBefore(child, childBefore);
			},

			// Insert child in an element instance
			insertBefore(parentInstance: HasChildrenInstance<any>, child: Instance<any>, childBefore: Instance<any>) {
				parentInstance.insertBefore(child, childBefore);
			},

			// Commit the updates to an element
			// The diff calculated in `prepareUpdate` is received as the `updatePayload`
			commitUpdate(instance: Instance<any>, updatePayload: any, type: any, oldProps: any, newProps: any) {
				if (oldProps !== newProps) {
					instance.replaceProps(newProps);
				}
			},

			// Commit the updates to text node
			commitTextUpdate: NOOP,

			// Called for initial render if `initializeFinalChildren` returns true.
			commitMount: NOOP,
		},
	});
};