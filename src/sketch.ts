// Global-mode p5 sketch with p5.transparency addon

// Load p5 in global mode: this registers all p5 APIs on window and the
// `declare global {}` block in p5/global brings types into scope globally.
import p5 from "p5/global";

// p5.transparency is a UMD addon loaded via <script defer> in index.html.
// defer guarantees it runs after this module (and thus after p5 is globally available)
// but before DOMContentLoaded, where p5 starts the sketch.
// Types come from tsconfig types: ["p5.transparency"].

// ----- sketch ----------------------------------------------------------------
let locations: any;
let tex: any;

function setup() {
    createCanvas(400, 400, WEBGL);
    locations = makeRandomLocations();
    tex = createGraphics(width, height);
    tex.fill(255, 0, 0, 100);
    tex.circle(width / 2, height / 2, width / 2);
}

function draw() {
    background(220);

    for (const { x, y, z } of locations) {
        push();
        translate(x, y, z);
        drawTransparent(() => {
            imageMode(CENTER);
            image(tex, 0, 0);
        });
        pop();
    }
}
function makeRandomLocations() {
    const arr = [];
    for (let i = 0; i < 10; i++) {
        const location = p5.Vector.random3D().mult(sqrt(random())).mult(300);
        arr.push(location);
    }
    return arr;
}

// p5 global mode picks up `setup` and `draw` from window.
window.setup = setup;
window.draw = draw;
