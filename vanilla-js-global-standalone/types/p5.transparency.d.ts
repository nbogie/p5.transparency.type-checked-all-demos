declare function transparency(p5: Function, fn?: object): void;
export default transparency;

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
