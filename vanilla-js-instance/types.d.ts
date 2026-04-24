export {};

/// <reference types="p5/global" />

declare global {
    // p5 v2's `export default` + `export as namespace` leaves the UMD global as a
    // module namespace with no construct signatures. Window['p5'] has the correct
    // class type; use it to derive the instance type and fix `new p5(sketch)`.
    type P5Instance = InstanceType<Window["p5"]>;
    var p5: Window["p5"];
}
