// Global-mode p5 typescript sketch with p5.transparency addon
import p5 from "p5";
import transparency from "p5.transparency";
(p5 as any).registerAddon(transparency);

new p5(sketch);

function sketch(p: p5) {
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
            const location = p5.Vector.random3D()
                .mult(sqrt(random()))
                .mult(300);
            arr.push(location);
        }
        return arr;
    }

    p.setup = setup;
    p.draw = draw;
}
