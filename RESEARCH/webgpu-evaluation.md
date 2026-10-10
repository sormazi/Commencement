# WebGPU evaluation (Step A.7, 10 Oct 2026)

**Decision: stay on WebGL 2 for now.** The Three.js WebGPU renderer (`WebGPURenderer`, with its own WebGL 2 fallback backend) was evaluated against how Commencement is built. Switching is not possible without rewriting most of the look, so the rule "switch only if stable and faster" is not met yet.

## Why not now

`WebGPURenderer` draws only node materials (TSL). It does not run GLSL `onBeforeCompile` patches, `ShaderMaterial`, or `ShaderChunk` overrides, on either of its backends. Commencement's look is built almost entirely from those:

- 18 `onBeforeCompile` GLSL patches in 11 files: the decay layer and instance blending (decay.js), tier-3 facades, baked AO, physically based detail, night lamps and halos, crowds, signage and street signs, the car, the tree crowns and the grass field.
- 3 `ShaderMaterial`s: the post pass (SSAO, wet-ground reflections, light shafts, grade, bloom composite, grain), the bloom chain, and the interior-mapped shop windows.
- 4 fog-chunk overrides (the height fog).

Every one of those would have to be rewritten in TSL before a single frame could be compared. Mixing is not possible: one renderer draws the whole scene.

## What WebGPU would bring

- Lower CPU cost per draw call. That matters if the real-GPU benchmark shows the game is CPU-bound by draw calls (it issues about 550 to 650 at the Arch).
- Compute shaders for the grass field, rain and snow particles (Step B) and culling.
- Browser support is now broad but not universal, so the WebGL path has to stay either way.

## Revisit when

- The real-GPU benchmark (`window.Commencement.runBench()` on GitHub Pages) shows the game is CPU-bound on draw calls at High on a mid-range machine; or
- Step B's particle weather needs more particles than WebGL instancing allows at acceptable cost.

If so, the order would be: post pass and bloom first (self-contained), then the material patches one family at a time behind a `?renderer=webgpu` test switch, comparing frame times at the four benchmark views before making it the default.
