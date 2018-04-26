

export type Driver = {
    readonly assets: AssetLoader;
    readonly input: {
        readonly mouse: Mouse;
        readonly keyboard: Keyboard;
        readonly system: Keyboard;
    };
    readonly start: (elem: React.ReactNode) => void;
};
