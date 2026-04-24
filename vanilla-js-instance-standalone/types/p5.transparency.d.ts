import type {} from 'p5';  // required to activate the module augmentation below

declare function transparency(p5: Function, fn?: object): void;
export default transparency;

// Module augmentation for instance-mode TypeScript: adds drawTransparent/drawTwoSided
// to imported p5 instances. The global augmentation below covers global-mode usage.
declare module 'p5' {
  interface p5 {
    drawTransparent(cb: () => void): void;
    drawTwoSided(cb: () => void): void;
  }
}

declare global {
  interface p5 {
    drawTransparent(cb: () => void): void;
    drawTwoSided(cb: () => void): void;
  }
  interface Window {
    drawTransparent(cb: () => void): void;
    drawTwoSided(cb: () => void): void;
  }
  function drawTransparent(cb: () => void): void;
  function drawTwoSided(cb: () => void): void;
}
