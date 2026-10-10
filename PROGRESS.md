# Commencement · Washington Square progress

The game was renamed from NightView to Commencement on 8 Oct 2026 (repository rename on GitHub pending, done by Avi).

Read this file and `RESEARCH/campus-inventory.md` first when picking the work back up.

## Current phase
Avi's plan of 7 Oct 2026, steps 1 to 8 with three stop points. Step 0 (README rewrite, atmosphere slice) is done. Steps 1 to 3 done; Stop point 1 approved 8 Oct. Since then (8 Oct): night pushed darker with screen-edge falloff; real bay and storey counts on 16 NYU buildings and 70 of 73 specs observed on Street View; Step 4 (park details and the signage decal system) done; Step 5 first pass (decay across the area) and Step 6 (crowds across the area) done, built while the Street View pane was unavailable. Decay is now a separate runtime layer (2026 clean / 2126 ruin, blendable), per Avi's 8 Oct direction. In progress: Step 4B (inventory written; storefront kit and sign atlas built; Grace Church and Jefferson Market first passes; the rest of Tier A and Tier B need Street View). Then Stop point 2.

Opening sequence (Avi, 9 Oct): the diploma title card and torch slot are gone. After the GitHub splash, smoke gathers into "Commencement" as the loading screen (at least 4 s, until assets and shaders are ready), then on click it drifts apart into the 2026 scene while the music rises. Favicon and app icons are a smoky C. The game now opens in 2026; the shift to 2126 during play is still to come. Details in docs/TECHNICAL.md.

Step 10 Part 1 was pulled forward by Avi (8 Oct) and is done: one location and one vehicle. On 8 Oct Avi replaced the utility van with NYU Campus Safety unit 4 (electric crossover, livery from his reference photos, each part a decal in `assets/signage/livery.js`); done, screenshots sent.

**Plan changes from Avi (9 Oct):**
- No satirical billboards. Step 8 is now research only, with no in-game content: `RESEARCH/nyu-history.md`, a sourced timeline of significant, well-documented events in NYU's history tied to places in the study area (Washington Square News, other reputable press, court records, NYU's own publications, historical sources). Each entry: what happened, when, where (linked to the building or space in the inventory), why it mattered, source links, and the physical traces that could plausibly remain in 2126 (a banner, a sign, a cordoned-off space, a boarded doorway), as raw material for Avi's story. Documented facts only; no private individuals named; no invented quotes or actions for real people; contested events marked contested with the main positions summarised fairly; events involving deaths or tragedy flagged; Brown Building and Bobst atrium rules apply. Covers expansion and land disputes, student and worker activism, housing and dining controversies, buildings demolished or altered, and older history of the park and neighbourhood. Stop point 3 is now the dossier's table of contents and a few sample entries.
- Step 9 (3), minimal interface, amended: the speedometer is replaced by a patrol terminal strip at the bottom of the screen, a worn in-car Campus Safety display (dim green or amber text on a dark, slightly scratched screen), not a game overlay. Left: nearest intersection (e.g. "University Pl & Waverly Pl") with a small compass heading, updated as the car moves. Right: real New York time matching the lighting, with the date shown as today's day and month in 2126. Middle: empty, reserved for dispatch calls when missions arrive; built so text can be shown there easily. Fades out when the car is stopped or the player is on foot looking around, back in when driving. Clean and crisp in 2026, flickering and degraded in 2126. The speedometer stays as a menu option, off by default. This replaces the plan for street names flashing at street signs. The passenger-seat map stays.
- Street signs (during Step 4B, alongside the storefronts): real street name signs throughout the study area, on the lampposts and poles at the intersections where they really are, in the standard New York style (rectangular boards, white lettering, white border). Green for regular signs, brown where they really are brown in the Greenwich Village Historic District and other historic districts, checked corner by corner on Street View. Block number ranges where the real signs show them. Weathered by the decay layer in 2126: faded, bent, rusted, some missing or hanging by one bracket. Decals in the signage manifest.
- Subway entrances (during Step 4B): every entrance in the study area at its real position with its real design (stairs, railings, globes or signs, the Astor Place kiosks), including West 4th St–Washington Square, 8th St–NYU, Astor Place, Bleecker St, Broadway–Lafayette, Christopher St and 14th St–Union Square where inside the map. Each entrance's stairway and gate are separate objects, like the building doors, so they can later lead down into stations.
- Step 10, walking: the player can leave the car and explore on foot, first-person by default with a third-person option in the menu. Both views built fully, with a simple, believable third-person model: a Campus Safety officer in uniform, matching the car.
- Order: pick up the main plan exactly where it left off (Step 4B Tier A, then Tier B with the street signs and subway entrances, Stop point 2, Step 7, Step 8 dossier, Stop point 3, Step 9, Stop point 4, Step 10, Stop point 5), then the README redesign with fresh screenshots.

**Future work (recorded 9 Oct, not to be built yet):**
- Narrative and missions: after Step 10, Avi writes a story built on the history dossier, delivered through dispatch calls on the patrol terminal and traces found in the world. Keep systems flexible for it: the dispatch slot, places that can hold objects and notes, and triggers on location, time of day and the 2026/2126 state.
- Personal memories: easter eggs from Avi's own memories of NYU and New York, placed where they happened (Zinc Bar, a Hudson River pier). Most pier locations are outside the study area, so the map will need to extend west to the Hudson. Avi's notes about these memories go only in `private/memories.md`, which is git-ignored and never committed; only the finished in-game objects are committed.
- Subway: later, probably a few station interiors you can walk into from the existing entrances, with travel between them, not the whole system.

**Work order from Avi (8 Oct, limited usage; finish each before the next, most-seen parts first, commit after every small piece):** the car (done) → Step 4B Tier A landmarks → Tier B storefronts on the limited streets below, with street signs and subway entrances → Stop point 2 → Step 7 (soundtrack, revised below) → Step 8 (history dossier, research only) → Stop point 3 (dossier contents and sample entries) → Step 9 (with the patrol terminal) → Stop point 4 → rest of Step 10 → Stop point 5. Keep stop-point screenshots to the essential views. If usage runs out, stop at a clean point, commit, and write what's next here.

**Next:** Tier B storefronts on the limited streets, block by block, checking the street signs at each corner on the way; then the edge of Union Square and the subway entrances. Done: MacDougal St from Bleecker to W 3rd, both sides (RESEARCH/storefronts/macdougal.md); Bleecker St from LaGuardia to Sullivan, first pass, with Le Poisson Rouge and the Bitter End (bleecker.md); W 3rd St west of MacDougal, first pass, with the Blue Note (w3rd.md); W 4th St west of the park, first pass (w4th.md, mostly residential); Broadway Houston to 9th, University Pl and W 8th St, first passes (broadway.md, university-8th.md); the streets facing the park are NYU buildings with no storefronts; street name signs at all 290 intersections by rule (RESEARCH/storefronts/street-signs.md), still to be checked corner by corner; subway entrances, all 51 from MTA open data, with the Astor Place kiosk (RESEARCH/storefronts/subway.md). **Stop point 2 approved (9 Oct), with fixes and a second pass before the soundtrack.** Standing rule from Avi: this is a one-to-one recreation; everything matches reality exactly. Order now:
1. Fixes: rebuild the Astor Place uptown kiosk faithfully (ironwork, glass, roof, finials, lamps, signage; Commons photos and Street View, side-by-side comparison) and check the downtown entrance; remove the Stern sidewalk shed along W 4th St (Kaufman / Gould Plaza), with a simple placeholder for the new gate until Avi's photos appear in RESEARCH/my-photos/stern/.
2. Businesses come alive in 2026: a lit interior behind every storefront's windows (interior mapping or shallow geometry; deeper interiors for big stores like Wegmans), matching what each business looks like inside; signs with the real name, colours, shape, size and placement, lettering close in spirit; no logos or logo-like art, each logo a manifest slot for Avi's own files (Wegmans included); lit windows and signs at night in 2026; dark, dead and decayed in 2126. No people yet. **Done 10 Oct:** every storefront has an interior-mapped room behind its glass (per-business kind and colours in `dist/campus/storefronts/insides.js`; grocery 14 m deep, pharmacy 10 m); shop and subway signs are lit at night; each shop has an empty logo slot (`assets/signage/logo-<id>.png`); 2126 rooms are dead and dark with grime and broken panes. Fixed on the way: shopfronts on MacDougal west, W 3rd, Broadway and University Pl sat 0.6 to 0.8 m inside the rendered walls (the 3D model stands proud of the tax-lot lines), so they were hidden since Stop point 2; they now sit on the visible wall. Awning signs are lettered on the valance. Wegmans comes with the Astor Place pass. Notes in RESEARCH/storefronts/interiors.md.
   **Second pass, 10 Oct:** Astor Place (both sides, Broadway to Lafayette) and 770 Broadway done from Apr 2026 Street View: Pret, DashMart, the boarded Clinton Hall pavilion, Raising Cane's, Juice Generation, TMPL Fitness; Wegmans along the Lafayette front (green glazing, gold italic lettering on the stone, green vestibule, a 26 m deep grocery interior, logo slot); Bank of America and the 770 lobby on Broadway (RESEARCH/storefronts/astor.md). Shopfronts now follow a wall that is not parallel to the lot line. E 8th St from University Pl to Mercer St done (RESEARCH/storefronts/e8th.md). 60 E 8th St has no shops on E 8th. University Pl, 30 E 9th St front done. University Pl 40 and 41 done (Sep 2024 imagery). W 8th St done (Sep 2024 imagery). Broadway Houston St to E 4th St and 661 done. Broadway east side E 4th to E 8th St done. Broadway done from Houston St to 14th St; University Pl and W 8th St gaps done. **Next:** the edge of Union Square (Tier A), and the street sign and subway stair checks; then Step A, Step B, Step 7.
3. Second pass on Step 4B: Astor Place and E 8th St, the gaps on Broadway, University Pl and W 8th St (RESEARCH/storefronts/), the edge of Union Square; every street sign corner and every subway stair direction checked on Street View (link format, then Mapillary).
4. Then Step A (graphics upgrade), Step B (live NYC weather), then Step 7 (soundtrack) as planned. Steps A and B are from Avi, 10 Oct; details below.

**Step A, graphics upgrade (Avi, 10 Oct; after the 4B second pass).** A meaningful jump in visual quality, still in the browser with Three.js. In order of impact; after each one, measure frame rate at every preset, and tie every effect into Low / Medium / High / Auto. Commit each improvement separately.
1. Ambient occlusion baked into all static buildings, the Arch, the park and street furniture (near-zero runtime cost), plus a light screen-space pass on High for moving things and fine detail.
2. Physically based textures (colour, normal, roughness) for brick, brownstone, limestone, sandstone, concrete, cast iron, asphalt, sidewalk and cobbles, from public-domain libraries (Poly Haven, ambientCG), credited in credits.html, with texture compression to keep memory reasonable.
3. Cinematic finishing: proper tone mapping and colour grading, a warm rich grade for 2026 and a sickly washed-out grade for 2126, blending during the shift; soft bloom on working lamps, lit shop windows and signs; subtle film grain and vignette.
4. Atmosphere: height fog that thickens with distance and sits low in the streets, glow around lamps in fog, light shafts through the trees and the Arch when the sun is low.
5. Reflections: puddles and wet patches reflecting buildings and lamps; reflective glass on Kimmel, the Paulson Center and storefronts.
6. Vegetation: better trees with wind sway, dense grass on overgrown lawns, with distance limits.
7. WebGPU: evaluate Three.js's WebGPU renderer where supported, WebGL as fallback; switch only if stable and faster.
Deliverable: before and after screenshots at the Arch, Bobst, the Row and Astor Place, at noon and midnight, with frame rates at each preset.

**Step B, live NYC weather (Avi, 10 Oct; after Step A).** The weather mirrors the real current weather in New York, the way lighting follows the real time. Commit separately.
- Current conditions for Washington Square Park (40.7308 N, 73.9973 W) from Open-Meteo (no key, works from the browser), National Weather Service API as fallback. Refresh every 10 to 15 minutes; blend changes in gradually, never abruptly.
- Offline or both services down: fall back silently to a default overcast sky. The game never breaks or waits on the weather.
- Mirror, in priority order: rain (falling rain, wet reflective streets, puddles that grow and dry over time, rain sound that changes under trees, awnings and the Arch); cloud cover (dimmer, greyer light and sky); fog and mist; wind (trees sway, banners and flags flap harder, leaves and litter blow); snow (falling snow that settles gradually on ledges, cornices, the Arch, cars, benches and lawns, muffled sound); thunderstorms (distant lightning and thunder under the photosensitivity rules: no rapid flashing, plus an option to soften lightning). Steam from manholes on cold days.
- Same weather in 2026 and 2126; 2126 always adds a light haze on top.
- Options menu: "Live NYC weather" (default) plus manual clear, overcast, rain, heavy rain, fog, snow, storm. A ?weather= URL option for testing, like ?time=.
- Rain and snow particle counts and settled snow tied into the quality presets; frame rate measured in heavy rain and snow at the Arch.
- Credit the weather data source in credits.html as its terms require; document in the README and docs/TECHNICAL.md.
Deliverable: screenshots at the Arch in rain at night, in snow, and in fog.

**Future work (9 Oct, record only):** beyond the Bobst atrium in Step 10, every NYU building and many neighbourhood businesses (Wegmans and places that matter to Avi) become enterable, from Avi's own interior photos when we start. The Step 10 interior system must scale to many buildings, and every door and entrance stays a separate object at its real position.

**Tier B limit (8 Oct):** storefront records only on the streets facing the park, MacDougal and Bleecker, West 4th, Broadway from Houston to 14th, University Place, 8th Street and Astor Place. Every other block keeps the facade kits. Future work: storefronts on the remaining blocks of the study area.

**Step 7 revised (8 Oct):** one original composition in two arrangements that play in sync: 2026 as a rich orchestral New York jazz arrangement (strings, brass, piano, upright bass, brushed drums), rendered to audio with an open-source synthesizer and a freely licensed soundfont (licence in credits.html); 2126 as the same piece on a worn cassette (hiss, wow and flutter, muffled highs, gentle saturation, rare eerie touches: a pitch sag, a dropout, a dragging bar, a faint second voice). Every 2026/2126 switch crossfades between them at the same point in the piece. Original only; "The Sidewalks of New York" (1894, public domain) is allowed as a melody source. The in-car camera on C waits for Step 9.

## Finished
- Phase 0: free-roam campus world (projection, street graph, collision, curbs/surfaces, streamed tiles, minimap, spawn/reset). Default location is Washington Square · NYU. Corridor locations unchanged. Tests pass. See CAMPUS.md.
- Phase 1 draft: RESEARCH/campus-inventory.md with 24 questions; reviewed by Avi 2026-10-07.

- Research completion (2026-10-07): NYC 3D Building Model (DA12) ingested; LPC reports read (Arch and Row via GVHD LP-0489, Brown LP-2128, Judson LP-0196, University Village LP-2300, plus Building Database materials); Street View pass on 12 priority landmarks. Inventory is now draft 2 with a "Research update 2" section and a question status table.
- Phase 2 massing pass: 4,110 buildings from 3D-model roof pieces, 138 extrusions, Paulson estimated. Screenshots in RESEARCH/screenshots/phase2-massing/.

## In progress
- **Step 3 done: third-tier non-NYU buildings** (8 Oct 2026). All 4,113 non-NYU buildings get a material colour and window rhythm from their NYC data: PLUTO class, year built, floors and height pick an upper-floor type (tenement, loft, cast iron, apartment, post-war, curtain wall, town house, solid), a ground storey (storefront, residential, stoop) and a colour from a per-material palette. The facade is a cell of a 4 x 3 texture atlas on the existing massing walls (dist/campus/tier3/facades.js), so it adds no triangles or draw calls. Committed in 12 batches of tax blocks. No individual detail work, by design; types are inferred, not checked building by building.
- **Stop point 1** reached: waiting for Avi's review of noon and midnight street screenshots and the Arch numbers (screenshots in RESEARCH/screenshots/stop1/).
  Numbers at the start position facing the Arch (cloud software renderer, real WebGL calls and triangles incl. the shadow pass): noon 663 calls / 903k triangles, midnight 564 / 698k. Before Steps 2 and 3: noon 608 / 772k, midnight 513 / 571k. Fountain view: noon 456 / 739k, midnight 353 / 520k. The third tier costs nothing; the second-tier kit adds about 55 calls and 130k triangles at the Arch, within budget, so no distant simplification beyond the 260 m kit cutoff yet.
- **Step 2 done: second-tier NYU buildings** (8 Oct 2026). 73 buildings built from short specs (dist/campus/tier2/b/*.js) by the kit in dist/campus/tier2/kit.js: wall material, window rhythm, ground storey, stone base, cornice, entrances, banners, and a signature feature where one exists (Provincetown Playhouse front, St. Ann's facade and fence at Founders, the Puck Building's arched windows and name, Washington Square Village's glazed brick panels and balcony bands, Pless's arched top storey, the Waverly Building's name panel). One commit per building. About 25 were checked on Street View or Google Maps user panoramas (looked at, not saved); the rest are labelled estimates in each spec's `source`. Entrance doors are separate instances listed in world.doors (80 doors). Kit facades show within 260 m and fall back to plain massing beyond. 37 Washington Sq W has no Street View imagery on the park side. Brittany Hall is matched to PLUTO's 787 Broadway lot by position, height and date (Q19, estimate).
- Measured at 13:00 (daylight, shadows on): start position facing the Arch 670 calls / 930k triangles (was 608 / 772k), fountain view 458 / 749k (was 414 / 642k), Bobst steps 382 / 611k. The kit adds about 60 calls and 160k triangles at the Arch.
- **Real New York time of day** (7 Oct 2026, Avi's request). Washington Square's light follows the real time in New York: NOAA sun position for the park, moon at its real phase, lamps on at dusk and off at dawn, Dead of night after dark, hazy washed-out daylight. "Real NYC time" is the default atmosphere; the old presets are manual overrides. Preview with `?time=19:30`, `?date=2026-12-21`, `?speed=600`. Tests in `tests/sky.test.js` (sunrise and sunset against published New York tables, both sides of the November clock change; the March change checked on the clock jump). Measured: start position 608 calls / 772k triangles in daylight (same as the old daylight preset), 513 / 571k at night; fountain view 414 / 642k by day, 317 / 438k at night. Shadow cost at the Arch: about 95 draw calls and 200k triangles while the sun is up (the shadow pass), nothing at night. Before this change the default (Dead of night) was 513 / 571k, so nights are unchanged and days cost what the old daylight preset did. Avi checked the game on his laptop at the Arch (7 Oct): runs and looks good. Fixed on the way: the realtime path had left the road reflector on, which doubled the draw calls. Screenshots in RESEARCH/screenshots/time-of-day/.
- **Stopped for Avi's review after the atmosphere slice** (7 Oct 2026). Five commits: decay round the park, the "Dead of night" preset (now the default), no traffic on campus, the loiterers, and the first draft of the soundtrack. Screenshots in RESEARCH/screenshots/atmosphere/.
- Performance, measured in the cloud software renderer with the FPS counter (real WebGL draw calls and triangles per frame, shadow pass included):

| View | Before (daylight, the old default) | After, Dead of night (new default) | After, daylight |
|---|---|---|---|
| Start position facing the Arch | 538 calls, 675k triangles | 513 calls, 571k | 609 calls, 773k |
| Fountain from the Arch | 395 calls, 448k | 317 calls, 438k | 406 calls, 553k |
| Bobst steps from Washington Sq S | 326 calls, 291k | 250 calls, 291k | 337 calls, 402k |

  The new content costs roughly 10 to 70 draw calls and 100k triangles in daylight (mostly meadow grass, the crowd and ivy, each one instanced mesh). At night the moon casts no shadows, which removes the shadow pass, so the default is lighter than before. The night does add three point lights that follow the nearest working lamps; their cost is per pixel and does not show in these counts, so it needs Avi's frame-rate check on real hardware.

## Next (after Avi's review)
- Step 4: park details (fountain plaza level, chess tables, lamp posts, banner locations from Street View).
- **Step 4B (added 8 Oct 2026): the whole neighbourhood, not just NYU.** Recognisable non-NYU buildings and storefronts as faithful as NYU's. Comes after Step 4 and before decay, so the decay pass covers everything.
  - Tier A, neighbourhood landmarks at full detail (same method as the NYU priority landmarks: expanded checklist, real geometry, measured proportions, side-by-side Street View comparisons, one commit each). Start with: Cooper Union Foundation Building and 41 Cooper Square; Astor Place (the Wegmans building, the Alamo cube, the subway kiosks); Grace Church; Jefferson Market Library; Church of the Ascension and First Presbyterian; One Fifth Avenue; the Strand; the Angelika; the MacDougal and Bleecker strip (Caffe Reggio, Cafe Wha?, Comedy Cellar, Minetta Tavern, Le Poisson Rouge, Blue Note and other long-standing venues); the edge of Union Square. Then every other building a regular passerby would recognise (churches, theatres, corner banks, historic buildings, famous restaurants and bars), found through Street View, OSM tags and the LPC database and listed in the inventory before modelling; Avi reviews that list at the next stop point.
  - Tier B, real storefronts on the core blocks (about 14th St to Houston, Sixth Ave to Third Ave and the Bowery; first the streets around the park, Broadway, University Pl, MacDougal, Bleecker, W 4th, W 3rd, 8th St and Astor Pl): the real ground floor from Street View (shop width, door position, awning shape and colour, window layout, business name), found through OSM shop and amenity tags. Record the Street View capture date for each. Upper floors keep the facade kits.
  - Signage and branding: NYU branding wherever it really exists (violet flags and banners on the buildings and lampposts that carry them, NYU lettering and building names, plaques at real positions, violet accents), in NYU violet with plain lettering, never the torch or any logo artwork. Storefront signs carry the real business names, matching colour, shape, size, placement and lettering style without reproducing logo artwork or trademark graphics.
  - Every flag, banner, sign and plaque is a separate decal with its own texture slot and a clear file name (e.g. assets/signage/nyu-flag.png, assets/signage/wegmans-main.png), listed with its location in a signage manifest, so Avi can swap in his own images. Documented in CAMPUS.md.
  - Everything weathers in the decay pass. Real businesses are never satirised. (The Step 8 billboards were dropped on 9 Oct.)
  - Performance: texture atlases and instancing for awnings, signs and shop windows; storefront detail only within a few hundred metres; measure calls and triangles at the Arch, Astor Place and on MacDougal after each batch.
  - Commits per landmark and per block of storefronts. Stop point 2 adds Astor Place, Cooper Union, the MacDougal and Bleecker corner and a stretch of Broadway, each at noon and midnight.
- Step 5: decay across the whole study area. Step 6: crowds across the campus. Stop point 2. Step 7: finish the soundtrack. Step 8: ~~satirical billboards~~ replaced on 9 Oct by the history dossier, research only (see Plan changes at the top). Stop point 3: the dossier's contents and sample entries.
- **Step 9 (added 8 Oct 2026), after Stop point 3: the environment is the star.** One commit each, measuring performance as I go: (1) camera pulled back and up with a wider field of view, easing toward a landmark and tilting up when the car slows below walking pace near it, free look on mouse and right stick, a hood-cam option; (2) slow, quiet driving: lower top speed, gentler acceleration, a quiet electric motor (already in place from Step 10 Part 1), damage off by default here (still an option), wider and more realistic headlight beams at night; (3) minimal interface: no damage display by default here, the speedometer replaced by the patrol terminal strip (amended 9 Oct, see the top of this file; it replaces street names flashing at signs), and the minimap replaced by a worn NYU campus map on the passenger seat with the car's position, glanced at with one button; (4) a field guide: entries unlock when passing a landmark slowly or stopping, with real history first (sourced and cited in a manifest) then a line on 2126; every Tier A and priority NYU landmark plus a selection of second-tier buildings; a menu screen of found and missing entries; the content rules apply (Brown Building and memorial factual and dignified, Bobst atrium architecture only, no named individuals, real businesses factual only); (5) at least 30 small discoveries tied to real places, in a manifest; (6) then and now: hold a button to fade from 2126 to 2026 (clean buildings, fresh banners, running fountain, working lamps, ordinary walking crowds) in about a second each way, checked for performance at the Arch; (7) place-based ambient sound (original or synthesized) and a radio that picks up original announcements and soundtrack fragments; (8) photo mode: pause, free-fly near the car, hide it, scrub the time of day, toggle 2026/2126, save a screenshot. Stop point 4: push, and show the new camera at the Arch, the camera easing toward Bobst, the map on the seat, three field guide entries, five discoveries, the then-and-now pair at the Arch and a photo mode shot; README updated for the new experience.
- **Step 10 (added 8 Oct 2026), after Stop point 4: a car that belongs here, walking, and making it eerie.** Supersedes anything earlier about keeping the other three locations.
  - One place, one car: remove location and car selection from every menu; remove Times Square, SoHo and Shibuya and all existing cars from the game and code (assets, ad pools, tests); Washington Square is the only location; README, CAMPUS.md and credits updated, and the README notes they live on in git history and on main. One new original vehicle: a small, boxy campus utility vehicle from NYU's facilities fleet, the last working vehicle on campus; no real make, brand or logo; faded NYU violet with "NYU" and a fleet number in plain lettering; clean in 2026 and dented, rust-streaked, mossy, one headlight dimmer, windshield cracked in 2126 (same decay layer); a modelled interior (worn dashboard, the campus map on the passenger seat); a quiet electric motor (faint whine, ticks, creaks) replacing every engine-idle reference; physics retuned slow, light and soft. **Internal stop: screenshots of the car front, side, rear and interior in 2026 and 2126 before the rest of Step 10.**
  - The shift: the game opens in an ordinary 2026 Washington Square (clean, fresh banners, fountain running, lamps working, ordinary crowds walking, normal sounds; real NYC time). After a random 3 to 6 minutes, one violent, wrong, few-second shift tears the streets into 2126 permanently (audio distorts and cuts, the image smears and tears, crowds freeze mid-step and change, light drains). A separate shorter jolt the first time the player gets out of the car. Each building interior is 2026 on first entry, then shifts after a random 2 to 4 minutes, permanently. Shifts persist between sessions; a "Start over" option resets to the 2026 opening. The hold-to-view then-and-now toggle and the Era menu option leave normal play; the 2026/2126 switch stays in photo mode only. Photosensitivity: no strobing, never more than three flashes in any second, and an option to soften all shift effects to a slow fade.
  - Walking: stop, get out (door opens and closes), walk anywhere outdoors, get back in; first person by default, third person optional; real eye height, walking speed and a slow jog; collisions with buildings, railings, benches, kerbs and stairs, climbing stairs and stoops (the Row, the Bobst steps, the fountain plaza). The parked car keeps humming with headlights on at night, its sound fading with distance. Footsteps by surface (stone, asphalt, grass, Washington Mews cobbles, gravel, puddles) with echo between tall buildings. Crowds never touch or permanently block the player. Field guide, discoveries and photo mode work on foot; discoveries can be close-up. Locked doors rattle; some card readers beep and flash red; only Part 4 buildings open.
  - Interiors: the system first with the Bobst ground floor and atrium (openly licensed photos, published descriptions and plans; Street View or user photos as reference only; the atrium screens architecture only). Kimmel's lobby and staircase, Weinstein's lobby and dining hall, the Silver Center entrance hall and the Paulson Center main floor wait for Avi's photos and notes in RESEARCH/interior-photos/, which are then authoritative. Only recognisable spaces; the rest sealed off. Every interior has a clean 2026 and a decayed 2126 state.
  - Eeriness, uncanny and familiar, never gory, no loud jump scares: loiterers move only when unseen and are often facing the player on turning round; one grey-gowned figure reappears in different places through a session; on foot, heads turn to follow and some drift closer while unseen, stopping at a fixed distance. Rare, subtle 2026 leaks after the shift (reflections of the lit 2026 street, a building clean at the edge of the screen for half a second, a moment of ordinary crowd noise, a lit window), under the same photosensitivity rules and switchable off. Wrongness: lights on one floor, a different floor next time; every clock stopped at the same time; a Kimmel PA announcement repeating with one word changed; music dropping out in certain places. A narrow phone flashlight on foot at night. The Brown Building and the memorial stay calm, with no eerie effects on or around them.
  - Performance: frame rate and draw calls on foot at the Arch, in the Bobst atrium, during the street shift and during a reflection effect.
  - Stop point 5: push, and show the 2026 opening at the Arch, the street shift as a sequence, getting out of the car, walking up the Bobst steps, the atrium in 2026 and 2126, a reflection effect, the grey-gown figure in two places, and the car's headlights from down the street at night; README and PROGRESS.md updated.

## Decisions from Avi
- 2026-10-08 **Step 10 direction** (8 Oct): Washington Square becomes the only location with one original campus vehicle; the game opens in 2026 and shifts permanently to 2126; walking, interiors and eeriness. The 2026/2126 switch leaves normal play (photo mode only) when Step 10 lands; until then the Era option and NightView.era stay as review tools.
- 2026-10-08 **The environment is the star, not the car** (Washington Square only; at the time the other three locations stayed as they were, superseded by Step 10). All decay, overgrowth, damage, banner weathering, crowd changes and decay lighting are one separate layer on top of the clean campus, never baked into the clean models or textures. The whole study area switches between the clean 2026 state and the decayed 2126 state at runtime and blends between them (`world.setDecay(t)`, `world.eraTo(t)`, `Commencement.era(t)`, `?era=2026|2126`, the Era option). Then the plan continues through Stop point 3, and Step 9 (below) follows it.
- Scope is the Washington Square neighbourhood, not only NYU (8 Oct 2026): non-NYU landmarks and real storefronts get the same faithfulness (Step 4B). Real businesses are never satirised.
- Lighting on Washington Square follows the real time in New York by default (7 Oct 2026).
- 2026-10-07 First detail batch approved; keep the same level of detail. Resolve the open questions myself from Street View and photos (record observations and capture dates; label estimates). Weinstein: street-visible only. Commit after each landmark; stop once after Brown for review.
- 2026-10-07 Massing pass approved. Detail pass order: Arch, Bobst, Silver Center, Kimmel, Judson, the Row, Weinstein, Brown + memorial, Silver Towers + Sylvette, Vanderbilt, Tisch + KMC, Paulson. Stop after the first three for review.
- 2026-10-07 Detail rules: real geometry for anything that projects or casts shadows; textures only for fine surface detail; reusable kits; proportions from counts and measurements; side-by-side comparisons in RESEARCH/screenshots/detail/; clean and intact until Phase 3.
- 2026-10-07 Carlyle Court: signage only (outside study area).
- 2026-10-07 Bobst atrium screens: research and model as architecture only; never a subject for satire or billboards.
- 2026-10-07 Resolve Paulson heights, Mercer–Houston dog run, Mews paving, Glucksman Ireland House, Gould Welcome Center, 29/37 WSW, Grey Art Museum myself from Street View, OSM, NYU pages and news.
- 2026-10-07 Q1: Washington Sq E and University Pl are a straight continuation, as the city data shows. The "angle" in the original prompt was a mistake.
- 2026-10-07 Q3–Q6 (fountain plaza level, chess tables, lamp posts, banners): leave as unverified placeholders until Avi's photos land in RESEARCH/my-photos. Superseded by the 7 Oct plan's Step 4 (take them from Street View), done 8 Oct; Avi's photos, if added, still override.
- 2026-10-08 Copyrighted sculptures (the Alamo cube at Astor Place, the Metronome at Union Square, the Gay Liberation Monument) are not modelled; their sites are.
- 2026-10-07 Brown Building and Triangle Fire memorial: kept intact and dignified while everything around them decays; excluded from every joke, billboard and banner.
- 2026-10-07 Remaining questions: resolve from 3D model, LPC reports and other sources where possible; ask what's left in one batch.
- 2026-10-07 Commit at the end of every phase and after large changes; log each commit here.

## Open questions for Avi (one batch, 2026-10-07)
1. Weinstein (Q2 template came through unfilled): exterior now observed. Still need: security desk and card-reader positions, the dining-hall entrance, how the East and West towers read from the street.
2. Paulson Center: confirm the two towers sit at the Bleecker and Houston ends and roughly how tall they look next to Silver Towers (estimate 84 m vs 89 m).
3. Bobst: main entrance (LaGuardia Pl or Washington Sq S corner?) and what the atrium screens are now.
4. Mercer–Houston dog run: where exactly?
5. Washington Mews: cobbles or smooth? Which house is Glucksman Ireland House?
6. Carlyle Court (north of 14th St): model it or signage only?
7. Public Safety booths: which corners?
8. Sidewalk sheds: any long-standing ones besides Kimmel (WSS) and Tisch Hall (Greene St)?
9. Low priority: Gould Welcome Center location; current use of 29 and 37 Washington Sq W; Grey Art Museum signage at 18 Cooper Sq.
- Waiting on photos: Q3–Q6 (fountain plaza level, chess tables, lamp posts, banners).

## Notes
- LPC 2300 says Silver Towers are smooth cast-in-place buff concrete from fiberglass forms, not board-formed; facades will follow the report.

## Detail pass, part 1: Arch, Bobst, Silver Center (7 Oct 2026)

Finished
- Landmark construction kit (`dist/campus/landmarks/kit.js`): faces, recesses, mitred moulding sweeps along straight and arched paths, extruded reliefs, lathes, coursed-stone, brick, Greek-key and inscription textures with normal maps, footprint frames.
- Sculpture kit (`sculpture.js`): Washington figures in two poses, standing relief figures with attributes, heraldic eagle, spandrel Victory.
- Washington Square Arch in full geometry (`arch.js`), replacing the massing: statue groups, Victories, eagles, keystones, trophy panels, coffered soffit, impost with Greek key, archivolts, three-fascia architrave, wreath frieze, dentil and modillion cornice, attic with both inscriptions. Statue pedestals added to collision.
- Bobst Library (`bobst.js`), replacing its massing: recessed glazed ground floor, spandrel band, round-fronted piers with quarter-dome feet, glazed and solid bays, attic openings, entrance with revolving doors and topiary planters, lobby floor and the atrium screen visible through the glass.
- Silver Center (`silver-center.js`): 3D-model volume plus full facades on Washington Sq E, Washington Pl and Waverly Pl: rusticated base, framed windows, dentilled cornice, brick shaft with quoins, crowning cornice, Tuscan loggia at the Waverly end, entrances on Washington Sq E and Waverly, plain violet banners.
- Paulson Center massing now uses published tower heights (68.6 m north, 91 m south).
- Side-by-side comparisons and driver's-eye close-ups in `RESEARCH/screenshots/detail/`.
- Tests: `tests/landmarks.test.js` (dimensions, clear opening, crown height, statue placement, coffers, inscriptions, pedestal collision, Bobst frame and height, Silver fronts). Dev helper `NightView.renderInfo()`.
- Cache-busting bumped to v=18.

Decisions
- Landmarks are built as real geometry in their own frames and replace the footprint massing by BIN (`landmarks/index.js`).
- Plain violet NYU banners: the torch emblem is a logo and is not drawn.
- Bobst atrium screen is modelled as architecture only and stays off-limits for satire.

Performance
- Scene at the Fifth Avenue spawn looking south at the Arch: about 450 draw calls and 360k triangles inside the view frustum (Arch alone 83k). Frame rate could not be measured in the cloud renderer (software GL); please check fps on your machine with the Arch in view.

Open questions for Avi (batch)
1. Silver Center loggia: now at the Waverly Pl (north) end of the Washington Sq E front, from the street sign in a 2021 photo. A 2015 photo seems to disagree; please confirm.
2. Bobst main entrance: which bays of the park front?
3. Weinstein (security desk, card readers, dining entrance, East/West towers), Public Safety booths and sidewalk sheds: the answers arrived as unfilled templates.

Next (after review)
- Kimmel, Judson, the Row, Weinstein, Brown + memorial, Silver Towers + Picasso, Vanderbilt, Tisch + Kaufman, Paulson.

## How to hear the soundtrack

Play Washington Square with Options > Driving > Sound and Music both On, and press any driving key or click once (browsers only start audio after a gesture). The music is muffled and echoing everywhere on the campus. Drive to the Arch: the broken loudspeaker on a pole just south of it plays it clearer and tinnier, panned to its side, and it cuts out now and then.

## How to run the game locally and check the frame rate

1. Open Terminal and go to your local copy of the repository (`cd ~/NightView` on Avi's Mac, until the folder is renamed)
2. Start the local server: `npm start` (runs `tools/serve.py`, which serves dist/ and turns browser caching off so updates always load). Leave this window open; press Ctrl+C to stop it.
3. In Chrome, open **http://localhost:4173/?fps=1**. The `?fps=1` turns the counter on straight away. Without it: Options (top right) > FPS counter > On > Apply. The setting is remembered in that browser.
4. The counter sits at the top left: frames per second (averaged over half a second), the slowest frame in that half second in ms, and the last frame's draw calls and triangles as WebGL reports them (shadow pass included). It turns orange below 55 fps.
5. Washington Square · NYU is the only location and you start on Fifth Avenue facing the Arch. Drive up to it and round it (W/S, A/D), and stop in front of it facing south into the square: that is the heaviest view.
6. After pulling new commits, hard-reload (Cmd+Shift+R) so the browser does not keep old files.
7. For a fair reading: laptop on mains power, other heavy tabs closed, and Chrome hardware acceleration on (chrome://gpu should list WebGL as "Hardware accelerated").

Target is 60 fps at the Arch. My own checks run in a software renderer in the cloud (about 1 fps), so they only count draw calls and triangles, not real frame time: about 470 draw calls and 570k triangles at the start position facing the Arch.

## Commit log
| Date | Commit | Summary |
|---|---|---|
| 2026-10-07 | e86399e | Phase 0: Washington Square free-roam location, campus data pipeline, tests, Phase 1 inventory draft |
| 2026-10-07 | 899e198 | Phase 2 massing from NYC 3D model, Paulson estimate, inventory draft 2 (LPC + Street View), skyline screenshots |
| 2026-10-07 | e55174f | Phase 2 detail pass: Arch, Bobst, Silver Center in full geometry; kits, checklists, Commons references, comparisons, landmark tests |
| 2026-10-07 | 8ffc807 | Kimmel Center detail; shared facade kit |
| 2026-10-07 | 485e3dc | Judson Memorial Church and campanile |
| 2026-10-07 | 68b95b0 | The Row (Nos. 1-13 and 19-26 Washington Sq N) |
| 2026-10-07 | 37c8bb3 | Weinstein Hall (street-visible); inventory update 4 |
| 2026-10-07 | 99db1c8 | Brown Building and Triangle Fire Memorial (preserved) |
| 2026-10-07 | ec0bfbe | Open questions resolved (inventory update 4); sidewalk sheds |
| 2026-10-07 | 1444a97 | Kimmel canopy: curved vault (review fix) |
| 2026-10-07 | bfcbbd7 | FPS counter + how to test locally |
| 2026-10-07 | b26b5f9 | W 4th shed realigned (review fix) + refs |
| 2026-10-07 | aa44d62 | Silver Towers + Sylvette placeholder |
| 2026-10-07 | 2b2da44 | Vanderbilt Hall + masonry kit |
| 2026-10-07 | 8a1a3ab | Tisch Hall + KMC (Stern) |
| 2026-10-07 | dd40091 | Paulson Center |
| 2026-10-07 | beda931 | PROGRESS review stop |
| 2026-10-07 | 719af74 | README + credits for the nyu-campus branch |
| 2026-10-07 | 32addb6 | CONTRIBUTING Node version |
| 2026-10-07 | 3ff28d0 | README clone command |
| 2026-10-07 | d628e85 | README rewrite |
| 2026-10-07 | 2598eb6 | Atmosphere: decay (park slice) |
| 2026-10-07 | e1b50f6 | Atmosphere: Dead of night preset |
| 2026-10-07 | 78b3a19 | Atmosphere: no traffic on campus |
| 2026-10-07 | 866d921 | Atmosphere: loiterers |
| 2026-10-07 | 2e10077 | Atmosphere: soundtrack draft |
| 2026-10-07 | c758b93 | PROGRESS atmosphere review stop |
| 2026-10-07 | 4f6c23c | README/credits point at main |
| 2026-10-07 | de5fcbc | Real NYC time of day: NOAA sun, moon phase, continuous lamps and fog, ?time/?date preview, sky tests |
| 2026-10-08 | 40b6da1 | Second-tier kit: spec-driven facades for NYU buildings |
| 2026-10-08 | 47dd814 | Second tier: Rubin Hall |
| 2026-10-08 | 6f2c5ab | Second tier: Lipton Hall |
| 2026-10-08 | cad9916 | Second tier: 37 Washington Square West |
| 2026-10-08 | 0d6c0a6 | Second tier: 29 Washington Square West |
| 2026-10-08 | 70c61ab | Second tier: Hayden Hall, 240 Mercer St |
| 2026-10-08 | a432beb | Second tier: Filomen D'Agostino Hall |
| 2026-10-08 | 3d2a260 | Second tier: Furman Hall |
| 2026-10-08 | e92eb38 | Second tier: Wilf Hall and the Provincetown Playhouse |
| 2026-10-08 | a2f4202 | Second tier: Kevorkian Center |
| 2026-10-08 | 2198ad9 | Second tier: Heyman Hall, 51 Washington Square South |
| 2026-10-08 | c6eb512 | Second tier: Global Center for Academic and Spiritual Life |
| 2026-10-08 | 79a9aa2 | Second tier: Warren Weaver Hall |
| 2026-10-08 | 6b15cd4 | Second tier: Meyer Hall |
| 2026-10-08 | 1c04024 | Second tier: Department of Psychology, 707 Broadway |
| 2026-10-08 | 05ce270 | Second tier: Center for Neural Science, 4 Washington Pl |
| 2026-10-08 | 2b76486 | Second tier: Waverly Building |
| 2026-10-08 | 08318b9 | Second tier: Goddard Hall |
| 2026-10-08 | 7d85ac1 | Second tier: Pless Building |
| 2026-10-08 | f958fb1 | Second tier: Pless Annex |
| 2026-10-08 | 5706cb4 | Second tier: Academic Resource Center |
| 2026-10-08 | 7c6ddee | Second tier: 35 West 4th Street (Frederick Loewe Theatre) |
| 2026-10-08 | dac6562 | Second tier: Leslie eLab, 14 Washington Pl |
| 2026-10-08 | 5caea5e | Second tier: Arthur L. Carter Hall, 10 Washington Pl |
| 2026-10-08 | 1abb81b | Second tier: 19 West 4th Street (Politics) |
| 2026-10-08 | 02aad22 | Second tier: Bonomi Family Admissions Center |
| 2026-10-08 | 4c9eb45 | Second tier: 31 West 4th Street |
| 2026-10-08 | ad980cd | Second tier: Hebrew Union College, 1 W 4th St |
| 2026-10-08 | d5c13f1 | Second tier: Kimball Hall |
| 2026-10-08 | 7636d09 | Second tier: Center for Genomics and Systems Biology, 12 Waverly Pl |
| 2026-10-08 | d071b7b | Second tier: 285 Mercer St / 10 Waverly Pl |
| 2026-10-08 | 526431d | Second tier: Department of Public Safety and Card Center, 7 Washington Pl |
| 2026-10-08 | 7080b32 | Second tier: 15 Washington Place |
| 2026-10-08 | 88c0fc2 | Second tier: Department of English, 244 Greene St |
| 2026-10-08 | a15ccc8 | Second tier: Department of Philosophy, 3 Washington Pl |
| 2026-10-08 | 2abc428 | Second tier: Rufus D. Smith Hall, 25 Waverly Pl |
| 2026-10-08 | 841fb58 | Second tier: Languages and Literature, 13 University Pl |
| 2026-10-08 | 9e24d73 | Second tier: Cantor Film Center, 36 E 8th St |
| 2026-10-08 | 9dca29e | Second tier: Tisch School of the Arts, 721 Broadway |
| 2026-10-08 | 7b7a4ce | Second tier: Gallatin School, 1 Washington Pl (715 Broadway) |
| 2026-10-08 | 27dbc90 | Second tier: NYU Health Center, 726 Broadway |
| 2026-10-08 | 23552a7 | Second tier: School of Global Public Health, 708 Broadway |
| 2026-10-08 | c656f72 | Second tier: 400 Lafayette St |
| 2026-10-08 | 2db4a48 | Second tier: 383 Lafayette St (Admissions Office) |
| 2026-10-08 | 11bd814 | Second tier: 14 E 4th St (NYU Shanghai office) |
| 2026-10-08 | ad47971 | Second tier: 16 Cooper Square |
| 2026-10-08 | 7fd758f | Second tier: 60 Fifth Avenue |
| 2026-10-08 | c7b20d4 | Second tier: 7 East 12th Street |
| 2026-10-08 | 2420f95 | Second tier: Brittany Hall, 55 E 10th St |
| 2026-10-08 | dcff5cd | Second tier: Bronfman Center, 7 E 10th St |
| 2026-10-08 | 504f36c | Second tier: Barney Building, 28 Stuyvesant St |
| 2026-10-08 | e302109 | Second tier: 107 Second Avenue |
| 2026-10-08 | 35d06c4 | Second tier: 509 and 543 LaGuardia Place |
| 2026-10-08 | cefb802 | Second tier: 21 Washington Square North, rear parts |
| 2026-10-08 | 8de0be5 | Second tier: 22 Washington Square North, rear part |
| 2026-10-08 | 7bd88c7 | Second tier: 27 Washington Square North |
| 2026-10-08 | 4ed2165 | Second tier: Washington Mews, north side (58, 60, 62) |
| 2026-10-08 | 2cbe10c | Second tier: Washington Mews, south side |
| 2026-10-08 | b086e98 | Second tier: East 8th Street houses (6-22 E 8th St) |
| 2026-10-08 | 91c7c29 | Second tier: Casa Italiana Zerilli-Marimò, 24 W 12th St |
| 2026-10-08 | 758cc52 | Second tier: Lillian Vernon Creative Writers House, 58 W 10th St |
| 2026-10-08 | c53acba | Second tier: Senior House at 13th Street |
| 2026-10-08 | 7107788 | Second tier: University Hall |
| 2026-10-08 | d7fefc1 | Second tier: Palladium Hall |
| 2026-10-08 | caf5322 | Second tier: Third North |
| 2026-10-08 | 61f7007 | Second tier: Alumni Hall |
| 2026-10-08 | 71d01d2 | Second tier: Founders Hall and the St. Ann's facade |
| 2026-10-08 | d3e417b | Second tier: Seventh Street Residence |
| 2026-10-08 | d05f0a4 | Second tier: Sixth Street Residence |
| 2026-10-08 | c0cbf60 | Second tier: Second Street Residence |
| 2026-10-08 | 81566c4 | Second tier: Coral Tower |
| 2026-10-08 | b9f5dbb | Second tier: Carlyle Court |
| 2026-10-08 | 44b56ee | Second tier: Washington Square Village |
| 2026-10-08 | 9021c7d | Second tier: Puck Building |
| 2026-10-08 | 32e7162 | Third-tier facades: kit and classification |
| 2026-10-08 | 5c4a15c | Third tier: blocks 397-446 (1 Av, E 2 St, E Houston St) |
| 2026-10-08 | ec93250 | Third tier: blocks 447-463 (E 7 St, E 6 St, 2 Av) |
| 2026-10-08 | 047b621 | Third tier: blocks 464-489 (3 Av, E 10 St, Spring St) |
| 2026-10-08 | abfb456 | Third tier: blocks 493-509 (Prince St, Mulberry St, Spring St) |
| 2026-10-08 | 5724e11 | Third tier: blocks 510-524 (W Houston St, Prince St, MacDougal St) |
| 2026-10-08 | 5fb5377 | Third tier: blocks 525-543 (MacDougal St, Sullivan St, W Houston St) |
| 2026-10-08 | f11d586 | Third tier: blocks 544-560 (3 Av, Washington Pl, MacDougal Alley) |
| 2026-10-08 | 8893035 | Third tier: blocks 561-575 (W 9 St, University Pl, W 12 St) |
| 2026-10-08 | 7834109 | Third tier: blocks 576-612 (6 Av · Av of the Americas, Bleecker St, Jones St) |
| 2026-10-08 | 0a1f3b7 | Third tier: blocks 613-816 (W 15 St, Bank St, Greenwich Av) |
| 2026-10-08 | 8a9c63b | Third tier: blocks 817-870 (E 18 St, W 15 St, 6 Av · Av of the Americas) |
| 2026-10-08 | 8dea942 | Third tier: blocks 871-897 (Irving Pl, E 19 St, E 17 St) |
| 2026-10-07 | 72ef760 | Night fill light dimmed; stop point 1 screenshots and numbers |
| 2026-10-08 | 965b128 | Plan: Step 4B neighbourhood landmarks and storefronts |
| 2026-10-08 | af25b0c | Darker night: lower ambient, night vignette, stronger headlights and lamps |
| 2026-10-07 | 48d7154..e8bfc3b | Kit: real bay and storey counts; Real bay and storey counts for 16 buildings; 54 more checked on Street View and marked observed; 3 remain estimates (East 8th Street houses (6-22 E 8th St), 21 Washington Square North, rear parts, 22 Washington Square North, rear part) |
| 2026-10-08 | 68408b6 | Step 4 park details: fountain rim and steps, 3 lamp types, 13 chess tables, banners where seen; signage decal system and manifest |
| 2026-10-08 | 3f46a3b | Step 4B inventory: Tier A list plus candidates for review |
| 2026-10-08 | 8315faf | Step 5: decay everywhere (facades, NYU buildings, lawns, ivy, trees) |
| 2026-10-08 | b02aa65 | Step 6: crowds across the area (door queues, plazas, strip), about 800 figures |
| 2026-10-08 | 73d9f3f | Docs for Steps 5 and 6 |
| 2026-10-08 | d959fd5 | Tier B tooling: storefront kit, sign atlas, blockface survey tool |
| 2026-10-08 | c558dd0 | Decay as a separate runtime layer (2026/2126 blend) |
| 2026-10-08 | e436903 | Step 10 Part 1: campus is the only location; NYU Facilities electric van replaces all cars; old locations, ads and tests removed |
| 2026-10-08 | 10b2be9 | Cache-bust to v22 after Step 10 Part 1 (splash-screen hang from stale cached modules) |
| 2026-10-08 | a589711 | NYU Campus Safety unit 4 replaces the van (livery decals, electric sound, physics, docs) |
| 2026-10-08 | 1feaf36 | No-cache local server (tools/serve.py) and v23 asset bump; fixes stale-module splash hang |
| 2026-10-08 | d0fc4a1 | Tier A: One Fifth observed (buff brick, piers); Tier A drafts wired into the world, unverified ones marked estimate |
| 2026-10-08 | abd63cd | Tier A: Grace Church observed (position, warmer marble) |
| 2026-10-08 | b4c8a5b | Tier A: Cooper Union (warmer stone) and Wanamaker observed |
| 2026-10-08 | d8881fc | Tier A: 826 Broadway (the Strand) observed, pale cream |
| 2026-10-09 | 280d92f | Rename the game to Commencement |
| 2026-10-09 | 73414cd | Smoke title: Commencement forms out of smoke as the loading screen and dissolves into the 2026 opening |
