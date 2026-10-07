<p align="center">
  <img src="docs/media/nightview.svg" alt="NightView — arcade driving through overgrown cities" width="100%">
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#washington-square--nyu-work-in-progress">Washington Square · NYU</a> ·
  <a href="#the-world">Locations</a> ·
  <a href="#controls">Controls</a> ·
  <a href="PHYSICS.md">Vehicle dynamics</a> ·
  <a href="#roadmap">Roadmap</a>
</p>

<p align="center">
  <img alt="Status: playable prototype" src="https://img.shields.io/badge/status-playable_prototype-9aaf89?style=flat-square&labelColor=1a2627">
  <img alt="Renderer: Three.js" src="https://img.shields.io/badge/renderer-Three.js-9cb8bf?style=flat-square&labelColor=1a2627">
  <img alt="Physics: 120 Hz" src="https://img.shields.io/badge/physics-120_Hz-bbb898?style=flat-square&labelColor=1a2627">
  <img alt="No API keys required" src="https://img.shields.io/badge/API_keys-none-a1b89b?style=flat-square&labelColor=1a2627">
</p>

NightView is a browser arcade driving game set in cities overtaken by foliage, fog and decay. The default location is a free-roam reconstruction of NYU's Washington Square campus a hundred years from now (work in progress, see below); three corridor districts (Times Square, SoHo and Shibuya) have traffic, police patrols, pedestrians and collapsing facades. A brief **GitHub / sormazi** introduction fades directly into driving; vehicle and location selection live in **Options**.

Built with original procedural scenes, a vendored Three.js renderer and a standalone force-based vehicle simulation. The project is actively being developed.

<p align="center"><img src="docs/media/gameplay.jpg" alt="Current NightView gameplay: weathered facades, ivy and fog in Times Square" width="760"></p>

## Quick start

You need:

- **Python 3** (any recent version) to serve the game. On macOS it is already installed; check with `python3 --version`.
- A browser with **WebGL 2** (current Chrome, Edge, Firefox or Safari).
- **Node.js 22 or newer**, only for the tests (`node --version`; tested on 22.22 and 22.23). The game itself has no build step, no `npm install` and no API keys.

From a fresh clone of the `nyu-campus` branch (the Washington Square work; `main` does not have it yet):

```bash
git clone -b nyu-campus https://github.com/sormazi/NightView.git
cd NightView
npm start                 # same as: python3 -m http.server 4173 --directory dist
```

Leave that Terminal window open, then open **http://localhost:4173** in your browser. The game starts in **Washington Square · NYU**. Click the game or press a driving key to enable sound. Press **Ctrl+C** in the Terminal to stop the server. After pulling new commits, hard-reload the page (**Cmd+Shift+R** on a Mac, **Ctrl+Shift+R** elsewhere) so the browser does not keep old files.

To run the tests, from the repository root:

```bash
npm test
```

The app is static: everything it needs is in `dist/`. GitHub Pages deployment is not configured.

### Frame-rate counter

Open **http://localhost:4173/?fps=1**, or turn it on in **Options → Driving → FPS counter** (the setting is remembered in that browser). The counter sits under the NightView logo and shows frames per second averaged over half a second, the slowest frame in that window in milliseconds, and the last frame's draw calls and triangles as WebGL reports them. It turns orange below 55 fps. The heaviest view is in front of the Washington Square Arch, facing south; the target there is 60 fps. Step-by-step test instructions are in [PROGRESS.md](PROGRESS.md#how-to-run-the-game-locally-and-check-the-frame-rate).

## Washington Square · NYU (work in progress)

The default location is a free-roam reconstruction of NYU's campus around Washington Square, imagined a century from now and in ruin. The street grid, curbs, sidewalks, park paths and trees come from OpenStreetMap and NYC Open Data, and every building stands on its real footprint at its surveyed height. You can drive anywhere the streets go. It is not affiliated with or endorsed by New York University.

Where it stands (details in [CAMPUS.md](CAMPUS.md) and [PROGRESS.md](PROGRESS.md)):

| Phase | Status |
| :--- | :--- |
| 0. Free roam over the real street grid, curbs, collision, minimap | Done |
| 1. Research inventory of the campus ([RESEARCH/campus-inventory.md](RESEARCH/campus-inventory.md)) | Done |
| 2. Build the campus | In progress. Massing of about 4,100 buildings from the NYC 3D Building Model is done. Detailed landmarks so far: the Arch, Bobst Library, Silver Center, Kimmel Center, Judson Memorial Church, the Row on Washington Square North, Weinstein Hall, the Brown Building and Triangle Fire memorial, Silver Towers, Vanderbilt Hall, Tisch Hall and the Kaufman Management Center, and the Paulson Center. Still to come: a pass on the other NYU buildings, then material, colour and window rhythm for the non-NYU blocks, which still read as plain massing. |
| 3. Decay and a "Dead of night" preset | Not started |
| 4. No traffic; many pedestrians who are never hit | Not started |
| 5. Satirical billboards grounded in student-newspaper reporting | Not started |
| 6. Original haunted soundtrack | Not started |

Known limits: the 3D model dates from 2014, so newer buildings rely on footprints and photos; some details are labelled estimates in the per-landmark checklists in [RESEARCH/checklists/](RESEARCH/checklists/); comparison renders are in [RESEARCH/screenshots/detail/](RESEARCH/screenshots/detail/). The Brown Building and the Triangle Shirtwaist Fire memorial are kept intact and dignified, and are never part of any joke or billboard.

## The world

| Location | District features |
| :--- | :--- |
| **Washington Square · NYU** (default) | Free roam over the real street grid, curbs and park of NYU's Washington Square campus, built from OpenStreetMap and NYC Open Data. Work in progress, see [CAMPUS.md](CAMPUS.md) |
| **Times Square · New York** | Illuminated tower, damaged displays, plaza steps and avenue crossings |
| **SoHo · New York** | Cast-iron facades, storefronts, fire escapes and a narrower cobbled corridor |
| **Shibuya · Tokyo** | Scramble crossing, glass towers, rounded commercial corner and dense signage |

| Times Square | SoHo | Shibuya |
| :---: | :---: | :---: |
| ![Times Square gameplay](docs/media/gameplay.jpg) | ![SoHo gameplay](docs/media/soho.jpg) | ![Shibuya gameplay](docs/media/shibuya.jpg) |

Screenshots captured from the current playable build.

The three corridor districts feature overgrowth, masonry debris, wrecks, animated pedestrians, cycling signals and moving traffic. Police vehicles patrol with flashing roof lights. Choose **Overgrown daylight**, **Ash storm** or **Dusty dawn** in Options.

The three corridor districts are original arcade interpretations based on licensed reference photos, **not one-to-one geographic replicas**. Billboard artwork, dimensions and routes are approximate or invented. Each is a repeating driving corridor; side streets are scenic. No Google Maps or Street View integration is used. [Reference credits →](dist/credits.html)

## Driving and presentation

- **Three vehicles** with distinct mass, torque, grip and drivetrain configurations.
- **120 Hz physics** with independent interpolated rendering and bounded frame-stall catch-up.
- **Force-based handling:** wheel inertia, tire slip, combined traction limits, load transfer, spring-damper suspension, engine/clutch/gears and impulse contacts.
- **Arcade tuning:** speed-sensitive steering, capped stability assistance, boost, handbrake drifts and rolling burnouts.
- **Persistent damage**, impact sparks, skid marks and synthesized engine/tire audio.
- **Atmosphere:** dense fog, facade sections that fall as you approach, foliage and speed-driven motion blur.

The custom solver is documented in [PHYSICS.md](PHYSICS.md). It is **not Unreal Engine or Chaos**. Suspension and collision geometry are simplified; production handling still needs playtesting and tuning. Falling facade debris is currently cosmetic. Police patrols do not implement pursuit AI.

## Controls

| Action | Keyboard |
| :--- | :--- |
| Accelerate / brake / reverse | **W / S** or **↑ / ↓** |
| Steer | **A / D** or **← / →** |
| Handbrake | **Space** |
| Boost | **Shift** |
| Clutch / free rev | **C + W** |
| Rolling burnout | **W + S** |
| Shift down / up in manual mode | **Q / E** |
| Reset and repair | **R** |
| Pause | **Esc** |

Touch driving buttons are provided on smaller screens. Transmission, atmosphere, traffic density and sound settings are available in **Options → Driving**.

## Roadmap

- [x] Playable browser build and three procedural districts
- [x] Standalone fixed-step vehicle dynamics
- [x] Fog, foliage, facade destruction and motion effects
- [x] Free-roam Washington Square · NYU location on real map data
- [ ] More detailed location geometry and recognizable landmarks (Washington Square detail pass in progress)
- [ ] Better crowd navigation, traffic rules and police pursuit
- [ ] Handling playtests, wider device coverage and performance profiling
- [ ] Richer vehicle damage, suspension and collision geometry
- [ ] Additional districts and race modes
- [ ] Evaluate native Unreal or Pixel Streaming delivery

## Development

| Path | Purpose |
| :--- | :--- |
| `dist/physics.js` | Standalone vehicle solver and fixed-step loop |
| `dist/game.js` | Inputs, session state, contacts and UI |
| `dist/renderer3d.js` | Three.js vehicles, camera, lighting and postprocessing |
| `dist/locations.js` | Location metadata and streetscape builders |
| `dist/campus/` | Free-roam Washington Square campus: projection, street graph, collision, streamed world, minimap |
| `dist/campus/landmarks/` | Detailed landmark buildings and the reusable facade kits |
| `RESEARCH/` | Campus inventory, per-landmark checklists, reference photos with licences, comparison renders |
| `tools/build-campus-data.mjs` | Rebuilds the campus dataset from open-data extracts |
| `dist/aftermath.js` / `destruction.js` | World population, overgrowth and collapse effects |
| `dist/traffic.js` | Shared traffic poses for physics and rendering |
| `tests/` | Dynamics, timing, traffic and world regression checks |

Read [CONTRIBUTING.md](CONTRIBUTING.md) to keep working on the project. Test coverage includes deterministic replay, 30/60/144 Hz equivalence, tire force bounds, braking, load transfer, collision energy and a 200-second stability replay. [Validation notes →](VALIDATION.md)

## Reclamation pipeline

The development build now includes reusable surface weathering, facade ivy, seam grasses with wind, moss decals, puddles, shop shutters, physical billboard supports and location-specific story profiles. See [ENVIRONMENT.md](ENVIRONMENT.md) for implementation and remaining visual-quality limits.

## Environmental advertising

World-space advertisements now use documented archival Coca-Cola, Kodak and Mitsukoshi artwork, with location-aware placement, surface weathering and mostly failed digital displays. Inspect assets or disable real brands in **Options → Driving → Advertising inspector**. No companies sponsor or endorse NightView. These are fictional archival placements, not surveyed campaigns. [System and asset policy →](ADVERTISING.md) · [Asset manifest →](dist/assets/ads/manifest.json)

## Data sources and credits

The Washington Square · NYU location is built from open data. Full credits are in [dist/credits.html](dist/credits.html) (also linked in the game under Options → Location credits), and every source with its query and licence is listed in [RESEARCH/data/SOURCES.md](RESEARCH/data/SOURCES.md).

- **OpenStreetMap**: map data © OpenStreetMap contributors, under the [Open Database License (ODbL 1.0)](https://opendatacommons.org/licenses/odbl/). The derived dataset `dist/campus/data/campus-data.js` is a Produced Work and, as far as it contains OSM data, is offered under the ODbL.
- **NYC Open Data**: building footprints, PLUTO, planimetric layers, street centerlines, street trees and more, under the NYC Open Data Terms of Use.
- **NYC 3D Building Model** (Office of Technology and Innovation, 2014): building volumes, NYC Open Data Terms of Use. The roughly 900 MB download is not in the repository; `RESEARCH/data/SOURCES.md` explains how to fetch it again.
- **Landmarks Preservation Commission** designation reports and Building Database: public records of the City of New York, used for history and architectural detail. The PDFs are not in the repository.
- **Wikimedia Commons**: 87 reference photographs under CC0, CC BY and CC BY-SA licences, each credited with author, licence and source in `dist/credits.html` and `RESEARCH/reference/commons/ref-commons-meta.json`.
- Google Maps and Street View were only looked at as visual references; nothing from them is saved or bundled.
