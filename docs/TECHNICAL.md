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
- **A.5 reflections.** (1) Wet ground, in the post pass (`renderer3d.js`): position and normal are rebuilt from the depth buffer, so no material changes; flat surfaces at street level (not grass) get damp patches and puddles from a world-space noise mask that grows with the wetness. Wet ground darkens; puddles reflect the scene by marching the mirrored view ray across the depth buffer with a short binary refinement (24 steps on High, 12 on Medium; Low reflects the sky colour only), weighted by Fresnel so reflections are strongest at grazing angles. Wetness: `?wet=0..1` overrides; otherwise 0.26 of standing water in 2126 and, from Step B, the live weather (`renderer.weatherWet`). Dry 2026 has none. (2) Glass, `dist/campus/atmosphere/envprobe.js`: a 128 px cube camera follows the view and renders the real surroundings one face at a time (shadows frozen, 260 m far plane); after six faces three.js re-filters it. It is given only to shiny materials (roughness under 0.35 with some metalness, or transmissive): the glass on Kimmel and the Paulson Center, storefront vestibules, polished metal and the car. Everything else keeps the static environment, whose soft light the night look depends on (a truthful night cube is nearly black). The interior-mapped shop windows (`interiors.js`) sample the same cube for their pane reflection. High refreshes the cube about three times a second, Medium about every two seconds, Low keeps the static map.
- **A.6 vegetation.** (1) Trees, `dist/campus/atmosphere/foliage.js`: every crown is a lumpy icosphere (320 triangles, displaced by smooth noise into clumps, flatter underneath, soft normals) instead of the faceted 80-triangle ball. The leaf shader adds clump-scale colour variation, a darker and cooler underside, a lighter sky-lit top and a two-octave leaf grain in the normal, so crowns read as foliage up close. Wind: crowns sway with three sine waves whose phase comes from each tree's position (a gust rolls across the park), scaled by `WIND` (0 calm to 1 gale; a light breeze until Step B's weather sets it) along `WIND_DIR`. Trunks and shadows stay still. (2) Dense grass, `dist/campus/atmosphere/grassfield.js`: one instanced draw of thin three-segment blades in a square field that follows the camera; each blade keeps a fixed place in the world (the field wraps by whole widths) and a lawn mask baked from the map's grass and pitch areas collapses every blade off a lawn. Blades grow with the decay layer (none on the mown 2026 lawns, a meadow in 2126), bend in the wind and fade out towards the edge of the field. (3) Distance limits: the field is 72,000 blades within about 42 m on High, 26,000 within about 28 m on Medium, none on Low; beyond it the existing per-tile tufts carry the meadow and cull with their tiles, and trees cull with the tile view distance. Standing water in 2126 lowered to 0.26.
- **A.7 WebGPU.** Evaluated and not adopted for now: the Three.js WebGPU renderer only draws node (TSL) materials, and Commencement's look is 18 GLSL material patches, 3 `ShaderMaterial`s and 4 fog-chunk overrides, which would all need rewriting before any comparison. Details and the conditions for revisiting in `RESEARCH/webgpu-evaluation.md`.
- **Frame rates (real GPU).** Measured in Chrome on Avi's MacBook (Apple M3, ANGLE Metal) at a 1710 x 985 window, 6 s per view after warm-up, only while the window was on screen (a hidden window draws no frames, so any interrupted view is redone). Build: A.0 to A.7 on GitHub Pages.

  | Preset | Arch | Bobst | The Row | Astor Place |
  | :--- | ---: | ---: | ---: | ---: |
  | Low | 32.8 fps (1% low 13.1) | 40.3 (13.4) | 36.9 (11.1) | 57.0 (31.7) |
  | Medium | pending | pending | pending | pending |
  | High | pending | pending | pending | pending |

  Low is slower than an M3 should manage with shadows, SSAO, bloom and the probe all off, and the 1% lows of 11 to 13 fps show hitches, so the park views look limited by something other than pixels: most likely draw calls and per-frame work on the CPU (about 550 to 650 calls at the Arch), or tile streaming. To investigate once Medium and High are in: draw calls and triangles per view from the FPS counter, and a performance profile in Chrome. Medium, High and the Step B runs (heavy rain and snow at the Arch) are still to be measured; they need a Chrome window that stays visible for about three minutes.
- Before and after screenshots for each step are in `RESEARCH/screenshots/stepA/` (A0 = before Step A; A1 = after ambient occlusion; A2 = after physically based textures; A3 = after grading and bloom, plus A3_arch_2126 for the 2126 grade; A4 = after height fog and light shafts, plus A4_park_sun at 17:40 on High and Low for the shafts; A5 = after reflections, plus A5_arch_wet at wetness 0.6 and A5_kimmel_glass; A6 = after trees and grass, plus A6_*_2126 for the grass field), at the Arch, Bobst, the Row and Astor Place, at noon and at half past midnight, High preset.

## Live weather (Step B)

`dist/campus/atmosphere/weather.js` makes the weather follow the real current weather at Washington Square, the way the light follows the real time.

- **Data.** Open-Meteo (CC BY 4.0, credited in credits.html and the README): current conditions, plus the last six hours of precipitation and snow depth so the ground starts wet or white when it should. Fallback: the National Weather Service's latest Central Park observation (KNYC, api.weather.gov, public domain). Refreshed every 12 minutes, fetched in the browser, never awaited: until data arrives, and silently if both sources fail (a retry follows in 3 minutes), the sky is a plain overcast. The first live data and any fixed sky chosen at load appear at once; later changes glide in over about a minute (rain starts and stops a little faster, and wet ground dries over several minutes).
- **State.** Cloud, rain, snow, fog, storm (0 to 1), wind speed and direction, temperature, ground wetness and snow cover, from the WMO weather code, cloud cover, visibility (under 5 km reads as fog), wind, and the last hours of rain and snow depth. Freezing rain codes below 0 C with snowfall are treated as snow.
- **Look.** Applied after the sky driver each frame (`Weather.apply`), so nothing accumulates. Cloud dims the sun (and its shadows), greys the sky and haze and adds a little desaturation. Rain and snow thicken the haze and the low fog layer, less at night, when the night haze is already thick; fog thickens both strongly and pales the air. On overcast nights the low cloud glows a dull orange with the city's light, which lights the scene faintly from above (not in 2126). 2126 adds an olive haze on top. Wind drives the tree sway and grass bend (`WIND`, `WIND_DIR` in foliage.js) and slants rain and snow. Wetness drives the puddles (A.5).
- **Rain and snow,** `precip.js`: one instanced draw of thin quads in a box that wraps round the camera, so drops keep fixed places in the world. Rain falls at about 9 m/s as faint streaks along their motion; snow at about 1 m/s as soft flakes that wander. Count follows intensity up to the preset limit: 2,500 on Low, 7,000 on Medium, 16,000 on High.
- **Settling snow,** `snow.js`: `SNOW_COVER` whitens pavements, the park floor, lawns, roofs and the tops of tree crowns in uneven drifts; streets get grey slush at about half strength.
- **Storms.** Lightning is photosensitivity-safe: single soft flashes (0.1 s rise, about 0.6 s fall), never a strobe, at least 7 s apart and usually 10 to 30 s. Options > Lightning: Normal, Soft (a gentle sky glow only, about a third as bright) or Off. Tested in `tests/weather.test.js`.
- **Manhole steam,** `steam.js`: on cold days (strength grows below about 6 C, more when the street is wet, fainter in 2126) plumes rise from 44 manholes near about one intersection in six. There is no open dataset of the real vents, so these positions are an approximation and are recorded as unchecked.
- **Options.** Options > Weather: Live NYC weather (default), Clear, Overcast, Rain, Heavy rain, Snow, Fog, Thunderstorm; the note under it says what the live sky is showing and from which source. `?weather=live|clear|overcast|rain|heavyrain|snow|fog|storm` overrides, like `?time=`. `window.Commencement.weather()` returns the current state.
- **Screenshots** in `RESEARCH/screenshots/stepB/`: rain at night, snow, fog, a thunderstorm at night and a live sky. In the cloud review renderer the headless browser cannot reach Open-Meteo, so the live shot shows the National Weather Service fallback; a real browser gets Open-Meteo first.

## Performance (after Step B)

Target from Avi (10 Oct): on his M3 in Chrome at full window size, Low at least 60 fps average with 1% lows above 45, High at least 45 with 1% lows above 30, and no visible hitches while driving round the park.

**Measuring.** `?bench=auto` (dist/dev/bench.js) starts real play, then for each preset measures the four review views, heavy rain and snow at the Arch, and a 30 s camera loop round the park. Per frame it records CPU time in the frame callback, GPU time (EXT_disjoint_timer_query_webgl2, sampled), draw calls, program switches, texture binds, uploads, shader compiles and JS heap growth. It measures only while the page is visible (a covered window draws nothing) and redoes interrupted views. Results go to the console, `window.__Q.results` and a panel on screen. `window.Commencement.drawBreakdown()` lists the draw calls at the current view by kind.

**A correction first.** The earlier Step A numbers (Low 32.8 fps at the Arch) were taken while the game was still on its title screen: the smoke title animates over the world and `body.booting` blurs the whole WebGL canvas with a CSS filter. In real play the same view runs faster, but still far short of the target.

**Baseline in real play** (M3, Chrome 154, 1710 x 985 window, device pixel ratio 2, build da39a55; Avi was working on the same machine, so expect some noise). CPU = time in the frame callback; GPU = timer-query time per frame.

| Preset | View | fps | 1% low | CPU ms | GPU ms | draws | alloc KB/frame |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| Low | Arch | 48.6 | 19.6 | 16.7 | 14.1 | 452 | 229 |
| Low | Bobst | 40.0 | 12.0 | 16.5 | 11.6 | 346 | 178 |
| Low | The Row | 47.1 | 19.5 | 13.7 | 10.3 | 331 | 188 |
| Low | Astor Place | 57.3 | 29.2 | 5.4 | 9.7 | 257 | 66 |
| Low | Arch, heavy rain | 59.0 | 30.3 | 6.9 | 12.2 | 401 | 122 |
| Low | Arch, snow | 56.7 | 29.2 | 13.5 | 10.3 | 404 | 148 |
| Low | Park loop (30 s) | 54.9 | 29.2 | 12.4 | 11.4 | 392 | 206 |
| Medium | Arch | 44.1 | 20.4 | 19.8 | 22.4 | 518 | 377 |
| Medium | Bobst | 45.2 | 29.1 | 19.1 | 24.9 | 455 | 364 |
| Medium | The Row | 45.1 | 20.0 | 18.5 | 27.3 | 449 | 328 |
| Medium | Astor Place | 50.3 | 29.2 | 15.0 | 20.7 | 336 | 196 |
| Medium | Arch, heavy rain | 44.3 | 20.0 | 19.8 | 22.6 | 518 | 379 |
| Medium | Arch, snow | 43.2 | 29.2 | 20.3 | 20.0 | 518 | 384 |
| Medium | Park loop | 43.9 | 29.0 | 19.3 | 22.1 | 490 | 393 |
| High | Arch | 22.5 | 19.6 | 14.3 | 79.7 | 610 | 363 |
| High | Bobst | 22.3 | 15.0 | 14.3 | 80.7 | 555 | 357 |
| High | The Row | 21.8 | 19.6 | 12.0 | 83.7 | 543 | 311 |
| High | Astor Place | 24.6 | 19.6 | 10.6 | 73.7 | 396 | 181 |
| High | Arch, heavy rain | 21.7 | 19.6 | 18.7 | 79.9 | 611 | 347 |
| High | Arch, snow | 22.3 | 14.9 | 21.3 | 75.6 | 624 | 383 |
| High | Park loop | 21.8 | 15.0 | 16.5 | 81.2 | 592 | 364 |

**Where the frame time goes** (profiled live on the M3 at the Arch on Low, then by switching things off one at a time and timing each pass with GPU timer queries; window 1200 x 886 at that point):

1. **The canvas is multisampled for nothing (GPU, the biggest single cost).** The renderer asks for a 4x MSAA canvas, but the 3D scene renders into its own non-multisampled target, so the only thing drawn into the multisampled canvas is the final full-screen post quad. That quad costs 11.5 ms of GPU time into the canvas against 3.4 ms into a plain target; even an empty clear of the canvas costs 2.5 ms. The waste grows with pixel count, so High (pixel ratio 2, four times the pixels) pays the most. Turning it off changes nothing visible.
2. **High is fill-bound.** About 80 ms of GPU per frame: pixel ratio 2 (about 6.7 million pixels at full window), the multisampled canvas above, SSAO, puddle reflections, light shafts, bloom, physically based detail, a 2048 shadow map and the reflection probe.
3. **Every object's matrix is recomputed every frame (CPU).** The scene holds 3,977 objects (3,381 meshes, 1,477 of them instanced, 211,984 instances) and 3,933 of them have automatic matrix updates, though almost all never move. The walk costs 2 to 4 ms per frame.
4. **Draw submission is reasonable (CPU).** About 450 draws on Low, 520 on Medium and 610 on High (shadow pass and probe included), 211 shader programs with about 94 program switches per frame: about 3.3 ms of CPU to submit the main scene when the matrix walk is excluded. The game's own per-frame logic is small: minimap 0.6 ms, world update 0.4, lamps 0.15, crowd 0.06, sky and weather under 0.1.
5. **"CPU time" was mostly waiting on the GPU.** The frame callback took 14 to 20 ms, but most of that was the CPU blocked behind a GPU queue that was already full; the real CPU work is about 7 to 9 ms. Fixing the GPU side brings the CPU number down with it.
6. **Scene GPU cost on Low** is about 8 ms at 1200 x 886: walls and roofs about 3.5 ms, instanced props (trees, lamps, fences, people) about 3.5 ms, ground about 1 ms. 2026 still draws the 2126 meadow tufts and ivy at zero size (32 draws and about 90,000 triangles at the Arch).
7. **Not the cause:** shader compilation (none during play: the title screen already compiles shaders up front), map tile loading (all tiles are built at load, nothing streams while driving; the park loop shows no upload or compile spikes, 1 to 1.6 uploads per frame), and garbage collection (0.1 to 0.7 collections per second; allocation of 180 to 390 KB per frame is worth trimming but no long frame lined up with a collection). The long frames in the logs line up with GPU time.
8. **Minor:** the Options button's `backdrop-filter: blur` makes the compositor blur the live canvas behind it every frame.

**Plan, in order of payoff:** (1) a plain, non-multisampled canvas and no backdrop blur over the canvas; (2) static objects stop recomputing their matrices; (3) skip what cannot be seen (2126-only meadow and ivy in 2026, and similar); (4) bring High's fill cost down within its look (cheaper SSAO and reflections at lower resolution, effects at reduced resolution where they cannot be told apart); (5) fewer draw calls and program switches where it pays; (6) trim per-frame allocations. Each fix is benchmarked at all three presets and committed on its own; no visual feature is removed without asking first.
