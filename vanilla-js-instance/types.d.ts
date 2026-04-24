export {};

/// <reference types="p5/global" />
// p5.transparency module augmentation (`declare module 'p5'`) now ships in the
// library's own .d.ts — no local repeat needed.

declare global {
  // p5 v2's `export default` + `export as namespace` leaves the UMD global as a
  // module namespace with no construct signatures. Window['p5'] has the correct
  // class type; use it to derive the instance type and fix `new p5(sketch)`.
  type P5Instance = InstanceType<Window['p5']>;
  var p5: Window['p5'];
}
