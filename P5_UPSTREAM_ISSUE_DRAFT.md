# Draft: GitHub issue for processing/p5.js

Target repo: https://github.com/processing/p5.js
Title: `Generated types: export the p5 class/namespace so addons can augment instance types`

---

## Summary

p5 v2's generated `types/p5.d.ts` exposes the `p5` class only via `export default`, not as a named export. This makes it impossible for addon packages to augment the p5 instance type through standard TypeScript module augmentation. Adding the `export` keyword to the class and its merged namespace is a small, backwards-compatible change that unblocks addon type authors.

## Repro

`node_modules/p5/types/p5.d.ts` (v2.2.3), simplified:

```ts
declare class p5 {
  constructor(sketch?: (p: p5) => void, node?: HTMLElement, sync?: boolean);
  // ... all the instance methods
}

declare const __p5: typeof p5;

declare namespace p5 {
  const p5: typeof __p5;
  // ... "global" constants, and nested classes like Vector, Graphics, etc.
  class Vector {}
  // ...
}

export default p5;
export as namespace p5;
```

An addon author attempting the standard augmentation pattern:

```ts
// my-addon.d.ts (as a module — has `export default` for the addon fn)
export default function myAddon(p5: Function): void;

declare module 'p5' {
  interface p5 {
    myMethod(): void;
  }
}
```

...does not produce the expected merge. In a consumer:

```ts
import p5 from 'p5';
function sketch(p: p5) {
  p.myMethod(); // error TS2339: Property 'myMethod' does not exist on type 'p5'.
}
```

## Why this happens

In TypeScript, module augmentation's `interface X { ... }` adds a *named* export `X` to the augmented module. Declaration merging between a class and an interface of the same name only happens when both are in the same scope and the class is resolvable under the same export name. Since `class p5` in p5's `.d.ts` has no `export` keyword — it reaches consumers only as the default export — the augmentation's `interface p5` does not merge with the class. The addon methods are effectively invisible to consumers using `import p5 from 'p5'`.

Minimal reproduction outside p5 (confirms it is a general constraint, not something specific to this codebase):

```ts
// mod.d.ts
declare class Foo { existing(): void; }
export default Foo;

// aug.d.ts (a module)
export {};
declare module './mod' {
  interface Foo { added(): void; }
}

// consumer.ts
import Foo from './mod';
declare const f: Foo;
f.added(); // error TS2339 — augmentation not applied
```

Switching `mod.d.ts` to `export declare class Foo { ... } export default Foo;` (named + default) makes `f.added()` type-check cleanly. This matches the TypeScript spec: augmentation members merge with *named* exports of the augmented module.

## Proposed fix

In the generator that produces `types/p5.d.ts` (`utils/typescript.mjs` per `package.json`), emit `export` on both the class and the merged namespace:

```diff
- declare class p5 {
+ export declare class p5 {
    constructor(sketch?: (p: p5) => void, node?: HTMLElement, sync?: boolean);
    // ...
  }

  declare const __p5: typeof p5;

- declare namespace p5 {
+ export declare namespace p5 {
    const p5: typeof __p5;
    // ...
  }

  export default p5;
  export as namespace p5;
```

Both must be exported together so that class + namespace merging (the static-side members and nested classes like `p5.Vector`) continues to work.

### Verification

I applied exactly these two line edits to v2.2.3's `types/p5.d.ts` in a local test project with a p5 addon that ships `declare module 'p5' { interface p5 { ... } }`. After the patch:

- TS instance-mode sketch (`import p5 from 'p5'; function sketch(p: p5) { p.addonMethod(); ... }`) type-checks with no error.
- `new p5(sketch)` still constructable.
- `p5.Vector`, static members, and all pre-existing consumers still work.
- Global-mode setups using `/// <reference types="p5/global" />` continue to work.

### Backwards-compatibility

- `export default p5` is unchanged → existing `import p5 from 'p5'` keeps working.
- `export as namespace p5` is unchanged → existing script-tag / UMD use keeps working.
- Adding named exports for an entity already reachable via default is additive; I'm not aware of a way this breaks an existing consumer. (Happy to dig further if there's a specific concern, e.g. around the emit from the generator.)

## Impact

Any addon that wants to add instance methods (and there are many: transparency, sound, dom, etc. in the p5 1.x ecosystem that are being ported to v2) currently has no clean way to express this in types. Workarounds (augmenting only globals, shipping a `P5WithAddon` helper type for consumers to use instead of `p5`) are ugly and don't compose when multiple addons are used.

Happy to open a PR against the type generator if this sounds right.
