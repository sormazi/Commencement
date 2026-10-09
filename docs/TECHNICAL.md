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
- `?time=19:30`, `?date=2026-12-21&time=16:15`, `&speed=600` preview another New York time, or run a time-lapse.
- `?era=2026` (the default) or `?era=2126` (or a number between 0 and 1) sets the decay layer.

## Console helpers

`window.Commencement` exposes `start`, `pause`, `reset`, `teleport(x, z, yaw)`, `viewFrom({x, y, n, lx, ly, ln, fov})`, `era(t, seconds)`, `sky()`, `renderInfo()` and `getState()`, in map metres (x east, z north, yaw 0 = north). `window.NightView` is kept as an alias for older scripts.

## Raw data

`tools/build-campus-data.mjs` reads the raw extracts in `RESEARCH/data/raw/` (not in git). Their file names still start with `nightview-`; they are left as they are so existing downloads keep working. Sources and licences are listed in `RESEARCH/data/SOURCES.md`.
