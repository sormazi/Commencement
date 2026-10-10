# Commencement: technical notes

The README is for players. This page is for anyone working on the game. The campus itself (data, buildings, decay, crowds, the car) is documented in [CAMPUS.md](../CAMPUS.md), the driving model in [PHYSICS.md](../PHYSICS.md), and the plan and its history in [PROGRESS.md](../PROGRESS.md).

The game was called NightView until October 2026. Old commits, the `main` branch and a few raw data file names still use that name.

## Running it

The game is static files in `dist/`: no build step, no `npm install`, no API keys. It needs a browser with WebGL 2.

```bash
python3 tools/serve.py          # or: npm start
python3 tools/serve.py 4180     # another port, if 4173 is taken
```

`tools/serve.py` prints the folder it serves and sends `Cache-Control: no-store`, so a normal reload always picks up new files. If it says the port is in use, another server (usually an older copy of the game) is still running: stop it with `lsof -ti:4173 | xargs kill` or use another port. Module URLs also carry a version query (`?v=24`), bumped whenever many files change at once.

Tests need Node.js 22 or newer: `npm test`.

## Publishing

`.github/workflows/pages.yml` uploads `dist/` to GitHub Pages on every push to `nyu-campus` (the default branch). Pages is set to deploy from GitHub Actions in the repository settings. All paths in the game are relative, so it works under any base path; after the repository rename the site lives at https://sormazi.github.io/Commencement/.

## The opening

1. The publisher splash (github/sormazi), about 2.4 seconds.
2. The smoke title, which is also the loading screen (`dist/smoke.js`). A wisp drifts in from the lower left and gathers into "Commencement" in IM Fell English, pale bone on near-black; once formed, the letters keep curling gently at the edges. It is a plain 2D canvas of about 2,600 soft sprites drawn from one pre-rendered puff texture. Behind it the game renders the 2026 opening scene, blurred, the whole time; `renderer.compileAsync` compiles every material in view and `dist/preload.js` counts the signage and livery images still loading. The smoke grows a little denser as loading completes. The title stays at least 4 seconds and until all of that has been ready for 400 ms, then "click or tap to begin" fades in.
3. On a click, tap or key press the letters loosen back into smoke that drifts outward and thins, the dark background and the blur ease away over about 3.2 seconds, the drive starts, and the music rises slowly (its gain eases in with a 1.5 second time constant). Nothing flashes: every brightness change is a slow ease.

Timing lives in `dist/game.js` (`showTitle`, `openingTick`, `beginPlay`); markup in `dist/index.html` (`#title`); styles at the end of `dist/style.css`.

The game starts in 2026 (`?era=2126` or the Era option shows the ruin). The permanent shift from 2026 to 2126 during play is still to come.

## Icons and fonts

- Favicon and app icons (`favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`) are in `dist/assets/branding/`: a smoky C on near-black. `dist/manifest.webmanifest` lists them.
- The title font, IM Fell English (roman and italic), is bundled in `dist/assets/fonts/` under the SIL Open Font License 1.1, licence text alongside.

## Saved settings

Everything the game keeps in browser storage lives under the `commencement.` prefix (`dist/storage.js`). On every load, `migrateStorage()` moves any key saved under the old `nightview.` prefix to the new one, never overwriting a newer value, then removes the old key. Today that is only the FPS counter setting (`commencement.fps`); future progress, such as whether the 2026 to 2126 shift has already happened, goes through the same helper.

## URL parameters

- `?fps=1` shows the FPS counter (frames per second, slowest frame, draw calls, triangles).
- `?quality=low|medium|high|auto` picks the graphics preset (Options > Graphics; saved in the browser). Each preset sets the pixel ratio, sun shadows and shadow map size, bloom in the post pass and the far clipping distance (`dist/quality.js`); every Step A effect reads its settings from the same preset. Auto starts at Medium, samples about four seconds of frames and steps down below 42 fps (or a 90th-percentile frame under 30 fps) or up above 58 fps, at most once a minute.
- `window.Commencement.runBench(['low','medium','high'])` holds the camera at four fixed views (the Arch, Bobst, the Row, Astor Place) for six seconds each per preset and returns the mean frame rate and the 1% low for each; the results are also logged to the console and kept on `window.Commencement.bench`.
- `?time=19:30`, `?date=2026-12-21&time=16:15`, `&speed=600` preview another New York time, or run a time-lapse.
- `?era=2026` (the default) or `?era=2126` (or a number between 0 and 1) sets the decay layer.

## Console helpers

`window.Commencement` exposes `start`, `pause`, `reset`, `teleport(x, z, yaw)`, `viewFrom({x, y, n, lx, ly, ln, fov})`, `era(t, seconds)`, `sky()`, `renderInfo()` and `getState()`, in map metres (x east, z north, yaw 0 = north). `window.NightView` is kept as an alias for older scripts.

## Raw data

`tools/build-campus-data.mjs` reads the raw extracts in `RESEARCH/data/raw/` (not in git). Their file names still start with `nightview-`; they are left as they are so existing downloads keep working. Sources and licences are listed in `RESEARCH/data/SOURCES.md`.

## Graphics upgrade (Step A)

- **A.0 presets.** `dist/quality.js`: Low, Medium, High and Auto (see the URL options above). Real frame rates come from `window.Commencement.runBench()` in a real browser; the cloud review renderer is software GL and runs at well under 1 fps, so its numbers only compare presets with each other.
- **A.1 ambient occlusion.** `dist/campus/atmosphere/ao.js`. (1) Ground contact AO: one texture baked at load over the whole map (about 1.4 px per metre) from the building footprints (a wide faint layer for tall street walls and a tight contact layer), the Arch, tree canopies and trunks, benches, lamps and monuments, each layer blurred once; ground materials (asphalt, slabs, park floor, lawns) sample it by world x/z. (2) Wall-base AO: every static, non-instanced lit material darkens over its lowest 2.6 m and slightly up to 14 m. Both multiply the ambient light fully and the sun partly, so lamps and lit windows keep their strength at night; strength 0.75 on Low, 1 on Medium and High. Both are applied before the decay layer, which chains them. (3) Screen-space AO on High only: eight depth taps in the post pass (`renderer3d.js`), about 0.6 m across in the world, fading out by 180 m, for creases, contact points and moving things the bake cannot know about.
- **A.2 physically based textures.** `dist/campus/atmosphere/pbr.js`, built by `tools/build-pbr.mjs` from CC0 ambientCG materials (credits.html). The game keeps its own colours; the maps add what flat colour cannot: brick courses and mortar, the grain of brownstone, limestone, concrete and painted iron, and roughness that varies across a surface. Walls: one 2048 x 1024 atlas of eight 512 px tiles (concrete, two bricks, brownstone, limestone, cast iron, flat for glass, plain concrete), as a UASTC normal map and an ETC1S map holding roughness, albedo detail and AO. Each tier-3 building's PLUTO-derived material picks its tile (`MATERIAL_TILE` in `tier3/facades.js`, packed into the facade code as 256 x tile); the shader maps it with planar world UVs and `textureGrad`, only on wall texels (not windows) and fading out on roofs. Brick tiles are sized to the US course of about 6.8 cm. Ground: asphalt (4 m repeat) on the street plane and concrete flags (2.5 m) on slabs and the park floor. About 5.5 MB on disk, compressed on the GPU too. Loaded asynchronously after start; surfaces stay plain until the files arrive or if KTX2 is unsupported. Off on Low, on at Medium and High. Note: KTX2 textures are not flipped on upload, so atlas v = 0 is the top row. The detail is clearest within about 15 m; further out it mips down to a slight change in tone, as real masonry does.
- **A.3 cinematic finishing.** `dist/post-bloom.js` and the post pass in `dist/renderer3d.js`. Bloom: a soft-threshold bright pass at half resolution (Karis-weighted so single hot pixels do not flicker), then a dual-filter blur down and back up the mip chain, each level added, so glow is tight at the source and wide and faint further out. The threshold follows the sky's lamp level: at night lamps, lit windows and signs pass; by day only real highlights do. Off on Low, 4 levels on Medium, 5 on High. Grade: before tone mapping, white balance and saturation; after ACES tone mapping, contrast and toe. 2026 is warm and rich (warm white balance, saturation 1.12, a gentle S-curve, half the sky's daytime desaturation); 2126 is drained (saturation 0.52, yellow-green white balance, lifted olive blacks, less contrast). The decay uniform blends the two, so the grade crossfades with the world during the shift. At night 2026 split-tones cool shadows under warm lamps; 2126 goes cold green, with the black lift mostly removed so nights stay dark. A subtle vignette always, the stronger night falloff as before, and film grain in display space, strongest in the mid-tones (off on Low). Lamp halo sprites (night.js) are unchanged.
- **A.4 atmosphere.** (1) Height fog, `dist/campus/atmosphere/heightfog.js`: three.js's fog chunks are replaced once at load, so every material gets it. The exponential-squared distance haze stays (at 0.8 of the sky's density) and a layer of fog is added that is densest at street level and falls to a third over about 9 m; the amount along each view ray is the exact integral of that profile between the camera and the surface, so streets and the park sit in mist while upper floors stay clearer. Its two numbers ride in the linear-fog uniforms (`HeightFog.density` and `.height`); the sky driver sets the ground density from the sky's density, the ground-fog card level and the decay layer (thicker in 2126). All presets (it costs a few instructions). (2) Lamp glow in fog: the halo on each live lamp (night.js) spreads wider and a little brighter as the low fog thickens. (3) Light shafts: in the post pass, when the sun is below about 30 degrees and near the frame, each pixel marches towards the sun's screen position across the depth buffer and counts open sky (anything past about 300 m counts, since the haze has turned it to sky); trees, the Arch and near buildings block it, so beams fan out through the gaps. 24 steps on High, 12 on Medium, off on Low. Weaker in 2126.
- Before and after screenshots for each step are in `RESEARCH/screenshots/stepA/` (A0 = before Step A; A1 = after ambient occlusion; A2 = after physically based textures; A3 = after grading and bloom, plus A3_arch_2126 for the 2126 grade; A4 = after height fog and light shafts, plus A4_park_sun at 17:40 on High and Low for the shafts), at the Arch, Bobst, the Row and Astor Place, at noon and at half past midnight, High preset.

