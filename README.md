NightView is a browser driving game set on NYU's Washington Square campus a hundred years from now. The campus has been abandoned for a long time. Trees have pushed through the paving, the lawns have gone to meadow and ivy has climbed the libraries. You drive through it alone: yours is the only vehicle. The place is not empty, though. People loiter everywhere, standing in the park, waiting on the library steps, facing walls, doing nobody knows what, and some of them turn to watch you go by. The billboards around the square make fun of the university, and the soundtrack is slow, brassy and out of tune.

The campus is built from real data. The streets, curbs and park paths are where they are today, and every building stands on its real footprint at its real height. The landmarks are being rebuilt one by one from photographs, city records and Landmarks Preservation Commission reports.

It is a work in progress. Some of what is described above is built, some of it is a first draft and some of it is still to come; the sections below say which. NightView is not affiliated with or endorsed by New York University.

## What is built so far

- **The real street network.** Streets, curbs, sidewalks, medians, plazas and the paths of Washington Square Park come from OpenStreetMap and NYC Open Data, at their real widths and positions. You can drive anywhere the streets go, and onto the sidewalks and the park if you want to. Curbs, buildings, trees, the Arch and the fountain are solid.
- **Every building's real massing.** About 4,100 buildings in the area are built from the NYC 3D Building Model, with their real footprints, roof heights, setbacks and light courts. The Paulson Center, finished after the model was made, is built from its footprint, published heights and photos.
- **Detailed landmarks.** These have been rebuilt with real geometry for anything that projects (cornices, columns, arches, canopies, sculpture) and textures only for fine detail:
  - the Washington Square Arch, with both Washington statues and the eagle
  - Bobst Library
  - the Silver Center
  - the Kimmel Center, with its curved glass canopy
  - Judson Memorial Church and its campanile
  - the Row on Washington Square North
  - Weinstein Hall
  - the Brown Building and the Triangle Shirtwaist Factory Fire memorial
  - Silver Towers and 505 LaGuardia Place
  - Vanderbilt Hall
  - Tisch Hall and the Kaufman Management Center
  - the John A. Paulson Center
- **The rest of NYU.** About seventy more NYU buildings (residence halls, academic buildings, the Mews, Washington Square Village, Founders Hall with the St. Ann's facade, the Puck Building, the Provincetown Playhouse front and others) have their own material, window rhythm, entrances and banners from a facade kit. Their entrance doors are separate objects, ready for a walking character.
- **Every other building** has a material colour and window rhythm chosen from city records: brick tenements, cast-iron lofts, town houses with stoops, post-war apartment blocks, glass towers.
- **Sidewalk sheds** where Street View showed long-standing ones in 2026.
- **First drafts of the atmosphere around the park:** decay on the park and the buildings facing it, the surviving street lamps and fog, no traffic, about two hundred loiterers, and the soundtrack.
- **Real New York time of day.** The light on Washington Square follows the real time in New York: the sun stands where it really is over the park right now, shadows fall off the Arch the way they really do at that hour, and the lamps come on at dusk. See below.
- **An on-screen FPS counter** for checking performance.

Still to come: the park details, the billboards, and the decay and crowds beyond the park. The decay, night, crowds and soundtrack are first drafts limited to the park and the buildings facing it. See the roadmap.

## Roadmap

1. **Second-tier buildings.** The rest of NYU: the residence halls (Rubin, Brittany, Third North, University Hall, Palladium, Founders with the St. Ann's facade, Lipton, Hayden and others), the academic buildings (Meyer, Warren Weaver, Waverly, Goddard, Shimkin and others), the Global Center, the Card Center, the Health Center, the Washington Mews houses, Washington Square Village, the Puck Building and the Provincetown Playhouse. Each gets its real material, window rhythm, entrance and signature feature.
2. **Third-tier buildings.** The non-NYU blocks get the right material, colour and window rhythm, so the streets stop reading as grey boxes.
3. **Decay and reclamation.** A hundred years of neglect: meadows, huge trees, a dry green fountain, rust, stains, cracked glass, shredded banners, ivy. A "Dead of night" preset with dead and flickering lamps and drifting fog.
4. **The crowds.** No traffic at all, just a great many people loitering: queueing at locked doors, holding lanyards up to dead card readers, sitting in lecture formations on the grass, some in faded graduation gowns. They step aside or the car passes through them. Nobody gets hurt.
5. **Satirical billboards** grounded in Washington Square News reporting. They aim at the institution, never at individuals or at tragedies.
6. **The soundtrack.** Original music: a slow, detuned, haunted take on the feeling of a big brassy New York standard, without copying any copyrighted song.
7. **Later:** a walking character who can leave the car and go inside a few buildings.


## Running it locally

### System requirements

- A computer with a reasonably recent GPU and a browser that supports WebGL 2: current Chrome, Edge, Firefox or Safari. The target is 60 fps in front of the Arch, the heaviest view.
- Python 3, to serve the files. macOS and most Linux systems already have it; check with `python3 --version`.
- Git, to get the code.
- Node.js 22 or newer, only if you want to run the tests. The game itself has no build step, no `npm install` and no API keys.

### From a fresh clone

The current game lives on the **`nyu-campus`** branch, which is the repository's default branch, so a plain clone gets it. The `main` branch keeps the old arcade version (Times Square, SoHo, Shibuya and the sports car). Naming the branch in the clone command makes sure:

```bash
git clone -b nyu-campus https://github.com/sormazi/NightView.git
cd NightView
python3 tools/serve.py
```

(`npm start` runs the same command if you have Node.js.) The server prints the folder it is serving and the address. Check that the folder ends in `NightView/dist`, then open **http://localhost:4173**. You should start on Fifth Avenue facing the Arch, in a white NYU Campus Safety car with a violet band. Click the page or press a driving key to turn on sound. Press **Ctrl+C** in the Terminal to stop the server.

The server tells the browser not to cache anything, so a normal reload always shows the newest files.

### If you already have a copy

Bring it up to date, then start it the same way:

```bash
cd NightView
git checkout nyu-campus
git pull
python3 tools/serve.py
```

### If the page sticks on the splash screen

Almost always another server is still running on the same port from an older copy, so your browser is talking to that one instead.

- If the server says `Port 4173 is already in use`, stop the old one with `lsof -ti:4173 | xargs kill` and start again, or run this copy on another port with `python3 tools/serve.py 4180` and open **http://localhost:4180**.
- Check the folder the server prints. It should be this repository's `dist` folder, not an older copy somewhere else.
- `git branch --show-current` should print `nyu-campus`.
- Then hard-reload once (**Cmd+Shift+R** on a Mac, **Ctrl+Shift+R** elsewhere).

To run the tests (needs Node.js):

```bash
npm test
```

### Controls

| Action | Keyboard |
| :--- | :--- |
| Accelerate / brake / reverse | **W / S** or **↑ / ↓** |
| Steer | **A / D** or **← / →** |
| Parking brake | **Space** |
| Reset to the street | **R** |
| Pause | **Esc** |

Touch buttons appear on small screens. Atmosphere, era, sound, music and the FPS counter are in **Options** (top right).

### FPS counter

Open **http://localhost:4173/?fps=1**, or turn it on in **Options → FPS counter**; the browser remembers the setting. The counter sits under the NightView logo. It shows frames per second averaged over half a second, the slowest frame in that half second in milliseconds, and the draw calls and triangles of the last frame. It turns orange below 55 fps. For a fair reading, keep a laptop plugged in and close other heavy tabs.

## Real New York time of day

On Washington Square the lighting matches the real time in New York, wherever you are playing from. **Real NYC time** is the default under **Options → Atmosphere**, and the note under it shows the New York time and where the sun is. The other atmosphere presets (Dead of night, Overgrown daylight, Ash storm, Dusty dawn) are still there as manual overrides.

- **Clock.** The browser's own time-zone data gives the time in America/New_York, so daylight saving time is handled automatically. Nothing is fetched from the internet; it works offline.
- **Sun and moon.** The sun's elevation and compass direction over the park (40.7308 N, 73.9973 W) come from NOAA's solar position equations. The moon is placed with a standard low-precision formula (good to about a degree) and drawn at its real phase.
- **Light.** The main light comes from the real sun, so shadows point the right way and grow long in the evening. Sky colour, ambient light, fog and colour grading blend continuously with the sun's height: hazy, washed-out daylight with thin fog, an amber haze when the sun is low, blue dusk, then the full Dead of night look with fog and flickering lamps. The surviving street lamps fade on as the sun drops from 2° above to 4° below the horizon, and off again at dawn. Daytime stays quiet: no birds, no city hum.
- **Smoothness.** The sky is recalculated every five seconds and every value glides to the new target over a few seconds, so there are no visible jumps.

To preview another time, add it to the address:

- `http://localhost:4173/?time=19:30` shows today at 7:30 pm New York time.
- `http://localhost:4173/?date=2026-12-21&time=16:15` shows a particular day.
- Add `&speed=600` for a time-lapse (600 times real speed). Without `speed`, a previewed time holds still.

**Performance.** Sun shadows are on whenever the sun is up, the same shadow pass the old daylight preset used: about 600 draw calls and 770k triangles at the start position in daylight, against about 510 calls and 570k triangles at night, when the shadow pass is off (cloud software renderer, so treat the numbers as relative). The moon adds one draw call. Switching shadows and lamp lights on or off at dusk and dawn makes the browser rebuild its shaders once, which can cause one short stutter.

Sunrise and sunset times from the model are tested against published New York tables (within three minutes), on dates either side of the November clock change; see `tests/sky.test.js`.

## How the project handles accuracy

The campus is meant to be faithful, so every fact behind it is tagged by how it is known:

- **Measured**: taken from data, such as footprints and heights from the NYC 3D Building Model and NYC Open Data, or street geometry from OpenStreetMap.
- **Cited**: taken from a named source, such as a Landmarks Preservation Commission designation report, a Wikimedia Commons photo, or a Google Street View panorama with its capture date. Street View and Google Maps are looked at as references only; nothing from them is saved or bundled.
- **Estimated**: a judgment made where no source settles the question, labelled as an estimate so it can be corrected later.

Each detailed landmark has a checklist in [RESEARCH/checklists/](RESEARCH/checklists/) that marks every feature as modelled, approximated or open, with its source. Side-by-side comparisons of photos and renders from matching positions are in [RESEARCH/screenshots/detail/](RESEARCH/screenshots/detail/). Known limits are written down in [CAMPUS.md](CAMPUS.md).

### The Brown Building and the Triangle Fire memorial

On 25 March 1911, 146 garment workers, most of them young immigrant women, died in the Triangle Shirtwaist Factory fire on the top floors of what is now NYU's Brown Building. The memorial on its walls names them. In NightView the building and the memorial stay intact and clean while everything around them decays, and they are left out of every joke, billboard and banner. A game about a ruined, satirised campus should not turn a real workplace disaster into scenery. The same care applies elsewhere: the satire aims at the institution, never at individuals, student deaths, mental-health tragedies or assault cases. The Bobst atrium screens are modelled as architecture only, and the Picasso sculpture at Silver Towers is shown only as a plain placeholder because the artwork itself is protected.

## Credits and data licences

Full credits are in [dist/credits.html](dist/credits.html), which is also linked in the game under **Options → Credits**. Every data source, with the exact query used and its licence, is listed in [RESEARCH/data/SOURCES.md](RESEARCH/data/SOURCES.md).

- **OpenStreetMap**: map data © OpenStreetMap contributors, under the [Open Database License (ODbL 1.0)](https://opendatacommons.org/licenses/odbl/). The derived dataset `dist/campus/data/campus-data.js` is a Produced Work and, as far as it contains OSM data, is offered under the ODbL.
- **NYC Open Data**: building footprints, PLUTO, planimetric layers, street centerlines, street trees and more, under the NYC Open Data Terms of Use.
- **NYC 3D Building Model** (NYC Office of Technology and Innovation, 2014): building volumes, under the NYC Open Data Terms of Use. The roughly 900 MB download is not in the repository; SOURCES.md explains how to fetch it again.
- **Landmarks Preservation Commission** designation reports and Building Database: public records of the City of New York.
- **Wikimedia Commons**: 87 reference photographs under CC0, CC BY and CC BY-SA, each credited with author, licence and source page.
- **Three.js** is vendored under its MIT licence.

