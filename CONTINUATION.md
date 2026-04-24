# Continuation notes — mixed-p5-typedecls-demo

Working notes for the next session. Not a README.

## What this project is

A learning/demo project exploring how p5.js v2 types and p5.transparency addon types integrate across different sketch setups. Multiple sibling folders each demonstrate a variant:

- `ts-instance/` — Vite + TypeScript, p5 instance mode. Currently the active TS target via root tsconfig's `include`.
- `ts-global/` — Vite + TypeScript, p5 global mode. Swap by uncommenting in root tsconfig.
- `vanilla-js-global/` — plain JS + jsconfig `checkJs`, p5 global mode, script tags (CDN).
- `vanilla-js-instance/` — plain JS + jsconfig `checkJs`, p5 instance mode, script tags (CDN). `jsconfig` needs `types: ["p5", "p5.transparency"]`, so node_modules must exist.
- `vanilla-js-instance-standalone/` — same as above but fully standalone (bundled type files in `types/`, no node_modules for type checks).

Root `tsconfig.json` switches which TS folder is active via commented `include` lines; `exclude` covers the vanilla-js folders.

## Current install shape (as of this session)

- **p5** is installed normally (`^2.2.3`) with a **pnpm patch** registered in `pnpm-workspace.yaml` at `patches/p5.patch`. The patch adds the `export` keyword to `class p5` and `namespace p5` in `types/p5.d.ts` — required for addon module augmentation to merge into the instance type (see "Root causes" below).
- **p5.transparency** is installed from a **tarball** built from the local clone: `file:../../p5.transparency/p5.transparency-0.0.17.tgz`. Not a symlink. This mirrors what a real npm consumer would get.
- **Refresh flow** after editing the local clone: `pnpm run refresh-p5-transparency` (runs `build && pack` in the clone, then `pnpm install --force` here).

Local p5.transparency clone: `/Users/neill/Developer/native/p5.transparency`. Changes from upstream currently present:

1. `src/index.js`: `const result` → `let result` near line 124. Fixes a genuine JS bug (const reassignment) that rolldown catches as a hard error. Worth a PR.
2. `p5.transparency.d.ts`: rewritten as a module-style `.d.ts` with module augmentation (`declare module 'p5' { interface p5 { drawTransparent; drawTwoSided } }`) for instance mode, plus `declare global { interface p5; interface Window; function drawTransparent; function drawTwoSided }` for global mode.
3. `rollup.config.js` + `package.json`: ESM build output, `module`, `exports` map with `types` condition, shipped files list, `peerDependencies: { p5: "^2.0.0" }`.

## Root causes we proved (both real, independent)

There are two separate issues. The earlier session's single-hypothesis note was wrong — it's both.

### Issue A — p5 v2 default-only-exports its class, blocking addon augmentation

`types/p5.d.ts` has `declare class p5 { ... }` (no `export`) and `export default p5`. Module augmentation's `declare module 'p5' { interface p5 { ... } }` adds a *named* export `p5` (interface) to the module. Declaration merging between a class and an interface of the same name requires both to be in the same scope *and* the class to be reachable by the same name — a default-only export isn't. So the addon's added methods are invisible to `import p5 from 'p5'` consumers.

Proven with a minimal four-line repro (see the session we just had). Fix: add `export` to the class and its merged namespace. Both are needed so class+namespace merging (nested `p5.Vector`, static members) keeps working.

**Status:** draft upstream issue at `P5_UPSTREAM_ISSUE_DRAFT.md` — not yet posted to processing/p5.js. Project uses the pnpm patch locally.

### Issue B — pnpm `link:` put the addon's `.d.ts` outside the project's node_modules tree

When we had `p5.transparency: link:/Users/neill/Developer/native/p5.transparency`, the symlink in `node_modules/p5.transparency` pointed at the external clone dir. TS resolved `'p5'` from the symlink's *real* path, walked up the filesystem looking for `node_modules/p5`, found nothing, and silently dropped the augmentation.

**Status:** avoided by switching to a tarball install. No longer a concern here. Real npm consumers never hit it. We also added `peerDependencies: { p5: "^2.0.0" }` to the local clone as correct library hygiene (doesn't solve Issue B on its own for `link:` installs — pnpm doesn't materialize peer deps into external link targets).

## Separate (known) gotcha — not related to the above

`vanilla-js-instance/types.d.ts` defines `type P5Instance = InstanceType<Window["p5"]>` and `var p5: Window["p5"]`. It's working around a different p5 v2 design choice: `export as namespace p5` makes the UMD global `p5` resolve to the module namespace (no construct signatures), so `new p5(sketch)` isn't constructable globally. The pnpm patch doesn't touch this — tried simplifying; can't. File stays as-is.

Would be a separate upstream issue if you want to pursue it.

## What's done this session

- Confirmed both root causes with isolated repros.
- `patches/p5.patch` + `pnpm-workspace.yaml` `patchedDependencies` entry.
- Switched p5.transparency install from `link:` to tarball + added `refresh-p5-transparency` script.
- `preserveSymlinks` no longer set in root tsconfig.
- `p5.transparency/.gitignore` now excludes `*.tgz`.
- `P5_UPSTREAM_ISSUE_DRAFT.md` — reviewed by user, pending post.
- All four variants type-check; `pnpm run build` succeeds.

## Open / next steps

1. **Post the upstream p5 issue** (draft at `P5_UPSTREAM_ISSUE_DRAFT.md`) and, if accepted, offer a PR against the type generator `utils/typescript.mjs`. Until that lands, the pnpm patch stays.
2. **PR to p5.transparency upstream** with the local clone's changes (const→let, real `.d.ts`, package.json metadata, peerDependencies). Coordinate with whether p5's own type fix has landed — the `.d.ts` augmentation pattern only works once Issue A is fixed in p5.
3. **Optional second p5 issue** about the UMD global namespace shape (see "Separate gotcha").

## Commands

```
cd /Users/neill/Developer/native/neillplay/mixed-p5-typedecls-demo

# All four type-check passes
pnpm exec tsc --noEmit                                                       # ts-instance (active)
pnpm exec tsc --project vanilla-js-global/jsconfig.json --noEmit
pnpm exec tsc --project vanilla-js-instance/jsconfig.json --noEmit
pnpm exec tsc --project vanilla-js-instance-standalone/jsconfig.json --noEmit

# Full build
pnpm run build

# Rebuild + repack + reinstall p5.transparency from local clone
pnpm run refresh-p5-transparency
```

## User preferences observed

- Don't silently patch published library source. Surface library gaps as library issues or PRs; if a local workaround is needed, make it visible (pnpm patch, project-level shim with a comment, etc.).
- Prefers Read over `cat`/`head`/`sed` via Bash for viewing files.
- Uses pnpm, not npm.
- Wants rationale explained, not just answers — reads generated `.d.ts` carefully.
- Trust but verify: happy to let me run minimal repros to prove a hypothesis before committing to a fix.
