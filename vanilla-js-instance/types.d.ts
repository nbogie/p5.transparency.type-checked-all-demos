export {};

/// <reference types="p5/global" />
/// <reference types="p5.transparency" />

// Module augmentation so p.drawTransparent() / p.drawTwoSided() are typed on
// imported p5 instances. p5.transparency ships only a global interface augmentation
// (works for global mode); instance mode also needs a module augmentation.
declare module 'p5' {
  interface p5 {
    drawTransparent(cb: () => void): void;
    drawTwoSided(cb: () => void): void;
  }
}

declare global {
  // p5 v2's `export default` + `export as namespace` leaves the UMD global as a
  // module namespace with no construct signatures. Window['p5'] has the correct
  // class type; use it to derive the instance type and fix `new p5(sketch)`.
  type P5Instance = InstanceType<Window['p5']>;
  var p5: Window['p5'];
}
