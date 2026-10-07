
# NightView

NightView is a browser driving game set on NYU's Washington Square campus a hundred years from now. The campus has been abandoned for a long time. Trees have pushed through the paving, the lawns have gone to meadow and ivy has climbed the libraries. You drive through it alone: yours is the only vehicle. The place is not empty, though. People loiter everywhere, standing in the park, waiting on the library steps, facing walls, doing nobody knows what, and some of them turn to watch you go by. The billboards around the square make fun of the university.

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
- **Sidewalk sheds** where Street View showed long-standing ones in 2026.
- **An on-screen FPS counter** for checking performance.

Still to come, or only in a first draft: the other NYU buildings (they currently show as plain massing), colour and material for the non-NYU blocks, the decay, the night atmosphere, the crowds, the billboards and the soundtrack. See the roadmap.

## Roadmap

1. **Second-tier buildings.** The rest of NYU: the residence halls (Rubin, Brittany, Third North, University Hall, Palladium, Founders with the St. Ann's facade, Lipton, Hayden and others), the academic buildings (Meyer, Warren Weaver, Waverly, Goddard, Shimkin and others), the Global Center, the Card Center, the Health Center, the Washington Mews houses, Washington Square Village, the Puck Building and the Provincetown Playhouse. Each gets its real material, window rhythm, entrance and signature feature.
2. **Third-tier buildings.** The non-NYU blocks get the right material, colour and window rhythm, so the streets stop reading as grey boxes.
3. **Decay and reclamation.** A hundred years of neglect: meadows, huge trees, a dry green fountain, rust, stains, cracked glass, shredded banners, ivy. A "Dead of night" preset with dead and flickering lamps and drifting fog.
4. **The crowds.** No traffic at all, just a great many people loitering: queueing at locked doors, holding lanyards up to dead card readers, sitting in lecture formations on the grass, some in faded graduation gowns. They step aside or the car passes through them. Nobody gets hurt.
5. **Satirical billboards** grounded in Washington Square News reporting. They aim at the institution, never at individuals or at tragedies.
6. **The soundtrack.** Original music: a slow, detuned, haunted take on the feeling of a big brassy New York standard, without copying any copyrighted song.
7. **Later:** a walking character who can leave the car and go inside a few buildings.

The plan in detail, with every decision so far, is in [PROGRESS.md](PROGRESS.md). The research behind the campus is in [RESEARCH/campus-inventory.md](RESEARCH/campus-inventory.md).

## Running it locally

### System requirements

- A computer with a reasonably recent GPU and a browser that supports WebGL 2. The target is 60 fps in front of the Arch, the heaviest view.
- Python 3, to serve the files. macOS and most Linux systems already have it; check with `python3 --version`.
- Git, to get the code.
- Node.js 22 or newer, only if you want to run the tests. The game itself has no build step, no `npm install` and no API keys.

### From a fresh clone

```bash
git clone https://github.com/sormazi/NightView.git
cd NightView
python3 -m http.server 4173 --directory dist
```

If you have Node.js installed, `npm start` runs the same server command.

Leave that Terminal window open and go to **http://localhost:4173**. The game starts on Fifth Avenue facing the Arch. Click the page or press a driving key to turn on sound. Press **Ctrl+C** in the Terminal to stop the server. After pulling new commits, hard-reload the page (**Cmd+Shift+R** on a Mac, **Ctrl+Shift+R** elsewhere) so the browser does not keep old files.

To run the tests (needs Node.js):

```bash
npm test
```

### Controls

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

Touch buttons appear on small screens. Vehicle, location, transmission, atmosphere, sound and the FPS counter are in **Options** (top right).

### FPS counter

Open **http://localhost:4173/?fps=1**, or turn it on in **Options → Driving → FPS counter**; the browser remembers the setting. The counter sits under the NightView logo. It shows frames per second averaged over half a second, the slowest frame in that half second in milliseconds, and the draw calls and triangles of the last frame. It turns orange below 55 fps. For a fair reading, keep a laptop plugged in and close other heavy tabs.

## How the project handles accuracy

The campus is meant to be faithful, so every fact behind it is tagged by how it is known:

- **Measured**: taken from data, such as footprints and heights from the NYC 3D Building Model and NYC Open Data, or street geometry from OpenStreetMap.
- **Cited**: taken from a named source, such as a Landmarks Preservation Commission designation report, a Wikimedia Commons photo, or a Google Street View panorama with its capture date. Street View and Google Maps are looked at as references only; nothing from them is saved or bundled.
- **Estimated**: a judgment made where no source settles the question, labelled as an estimate so it can be corrected later.

Each detailed landmark has a checklist in [RESEARCH/checklists/](RESEARCH/checklists/) that marks every feature as modelled, approximated or open, with its source. Side-by-side comparisons of photos and renders from matching positions are in [RESEARCH/screenshots/detail/](RESEARCH/screenshots/detail/). Known limits are written down in [CAMPUS.md](CAMPUS.md).

### The Brown Building and the Triangle Fire memorial

On 25 March 1911, 146 garment workers, most of them young immigrant women, died in the Triangle Shirtwaist Factory fire on the top floors of what is now NYU's Brown Building. The memorial on its walls names them. In NightView the building and the memorial stay intact and clean while everything around them decays. The Bobst atrium screens are modelled as architecture only, and the Picasso sculpture at Silver Towers is shown only as a plain placeholder because the artwork itself is protected.

## Credits and data licences

Full credits are in [dist/credits.html](dist/credits.html), which is also linked in the game under **Options → Location credits**. Every data source, with the exact query used and its licence, is listed in [RESEARCH/data/SOURCES.md](RESEARCH/data/SOURCES.md).

- **OpenStreetMap**: map data © OpenStreetMap contributors, under the [Open Database License (ODbL 1.0)](https://opendatacommons.org/licenses/odbl/). The derived dataset `dist/campus/data/campus-data.js` is a Produced Work and, as far as it contains OSM data, is offered under the ODbL.
- **NYC Open Data**: building footprints, PLUTO, planimetric layers, street centerlines, street trees and more, under the NYC Open Data Terms of Use.
- **NYC 3D Building Model** (NYC Office of Technology and Innovation, 2014): building volumes, under the NYC Open Data Terms of Use. The roughly 900 MB download is not in the repository; SOURCES.md explains how to fetch it again.
- **Landmarks Preservation Commission** designation reports and Building Database: public records of the City of New York.
- **Wikimedia Commons**: 87 reference photographs under CC0, CC BY and CC BY-SA, each credited with author, licence and source page.
- **Three.js** is vendored under its MIT licence.

Licensing of the code and artwork is described in [LICENSE.md](LICENSE.md). To work on the project, start with [CONTRIBUTING.md](CONTRIBUTING.md) and [PROGRESS.md](PROGRESS.md).
