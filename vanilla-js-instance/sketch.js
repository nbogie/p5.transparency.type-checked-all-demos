/** @param {P5Instance} p */
const sketch = (p) => {
    // p5.Vector / p5.Graphics as JSDoc type annotations don't resolve cleanly in
    // script-mode checkJs: p5 v2's `export as namespace` creates competing namespace
    // declarations that TypeScript can't reconcile for nested class types here.
    /** @type {any[]} */
    let locations;
    /** @type {any} */
    let tex;

    p.setup = function () {
        p.createCanvas(400, 400, p.WEBGL);
        locations = makeRandomLocations();
        tex = p.createGraphics(p.width, p.height);
        tex.fill(255, 0, 0, 100);
        tex.circle(p.width / 2, p.height / 2, p.width / 2);
    };

    p.draw = function () {
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
    };

    function makeRandomLocations() {
        const arr = [];
        for (let i = 0; i < 10; i++) {
            const location = p5.Vector.random3D().mult(p.sqrt(p.random())).mult(300);
            arr.push(location);
        }
        return arr;
    }
};

new p5(sketch);
