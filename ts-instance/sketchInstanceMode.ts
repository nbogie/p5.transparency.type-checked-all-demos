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
        p.createCanvas(400, 400, p.WEBGL);
        locations = makeRandomLocations();
        tex = p.createGraphics(p.width, p.height);
        tex.fill(255, 0, 0, 100);
        tex.circle(p.width / 2, p.height / 2, p.width / 2);
        p.createDiv("Instance-mode typescript");
    }

    function draw() {
        p.background(220);

        for (const { x, y, z } of locations) {
            p.push();
            p.translate(x, y, z);
            p.drawTransparent(() => {
                p.imageMode(p.CENTER);
                p.image(tex, 0, 0);
            });
            p.pop();
        }
    }
    function makeRandomLocations() {
        const arr = [];
        for (let i = 0; i < 10; i++) {
            const location = p5.Vector.random3D()
                .mult(p.sqrt(p.random()))
                .mult(300);
            arr.push(location);
        }
        return arr;
    }

    p.setup = setup;
    p.draw = draw;
}
