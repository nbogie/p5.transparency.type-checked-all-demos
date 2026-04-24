// Script-mode .d.ts — no export, so declarations here are plain globals.
//
// p5 v2's `export default` + `export as namespace` leaves the UMD global as a
// module namespace with no construct signatures. We intersect our constructor
// overload (sketch param typed as P5Instance) with the full class type so that
// static members like p5.Vector are preserved.
type P5Instance = InstanceType<typeof import('p5').default> & {
    drawTransparent(cb: () => void): void;
    drawTwoSided(cb: () => void): void;
};
declare var p5: typeof import('p5').default & {
    new(sketch?: (p: P5Instance) => void, node?: HTMLElement, sync?: boolean): P5Instance;
};
