# NightView · Washington Square progress

Read this file and `RESEARCH/campus-inventory.md` first when picking the work back up.

## Current phase
Avi's plan of 7 Oct 2026, steps 1 to 8 with three stop points. Step 0 (README rewrite, atmosphere slice) is done. Steps 1 to 3 are done and committed (real New York time of day, 73 second-tier NYU buildings, third-tier facades for every other building). Stopped at Stop point 1 for Avi's review; next is Step 4, park details (noon and midnight street screenshots, numbers at the Arch).

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
  - Everything weathers in the decay pass. Real businesses are never satirised and never appear on the Step 8 billboards.
  - Performance: texture atlases and instancing for awnings, signs and shop windows; storefront detail only within a few hundred metres; measure calls and triangles at the Arch, Astor Place and on MacDougal after each batch.
  - Commits per landmark and per block of storefronts. Stop point 2 adds Astor Place, Cooper Union, the MacDougal and Bleecker corner and a stretch of Broadway, each at noon and midnight.
- Step 5: decay across the whole study area. Step 6: crowds across the campus. Stop point 2. Step 7: finish the soundtrack. Step 8: satirical billboards (NYU policy only). Stop point 3.

## Decisions from Avi
- Scope is the Washington Square neighbourhood, not only NYU (8 Oct 2026): non-NYU landmarks and real storefronts get the same faithfulness (Step 4B). Real businesses are never satirised.
- Lighting on Washington Square follows the real time in New York by default (7 Oct 2026). Other locations stay on Dead of night under that setting.
- 2026-10-07 First detail batch approved; keep the same level of detail. Resolve the open questions myself from Street View and photos (record observations and capture dates; label estimates). Weinstein: street-visible only. Commit after each landmark; stop once after Brown for review.
- 2026-10-07 Massing pass approved. Detail pass order: Arch, Bobst, Silver Center, Kimmel, Judson, the Row, Weinstein, Brown + memorial, Silver Towers + Sylvette, Vanderbilt, Tisch + KMC, Paulson. Stop after the first three for review.
- 2026-10-07 Detail rules: real geometry for anything that projects or casts shadows; textures only for fine surface detail; reusable kits; proportions from counts and measurements; side-by-side comparisons in RESEARCH/screenshots/detail/; clean and intact until Phase 3.
- 2026-10-07 Carlyle Court: signage only (outside study area).
- 2026-10-07 Bobst atrium screens: research and model as architecture only; never a subject for satire or billboards.
- 2026-10-07 Resolve Paulson heights, Mercer–Houston dog run, Mews paving, Glucksman Ireland House, Gould Welcome Center, 29/37 WSW, Grey Art Museum myself from Street View, OSM, NYU pages and news.
- 2026-10-07 Q1: Washington Sq E and University Pl are a straight continuation, as the city data shows. The "angle" in the original prompt was a mistake.
- 2026-10-07 Q3–Q6 (fountain plaza level, chess tables, lamp posts, banners): leave as unverified placeholders, not modelled in detail, until Avi's photos and notes land in RESEARCH/my-photos. Those photos are then authoritative.
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

1. Open Terminal and go to the repository: `cd ~/NightView`
2. Start the local server: `npm start` (the same as `python3 -m http.server 4173 --directory dist`). Leave this window open; press Ctrl+C to stop it.
3. In Chrome, open **http://localhost:4173/?fps=1**. The `?fps=1` turns the counter on straight away. Without it: Options (top right) > Driving > FPS counter > On > Apply. The setting is remembered in that browser.
4. The counter sits under the NightView logo: frames per second (averaged over half a second), the slowest frame in that half second in ms, and the last frame's draw calls and triangles as WebGL reports them (shadow pass included). It turns orange below 55 fps.
5. Washington Square · NYU is the default location and you start on Fifth Avenue facing the Arch. Drive up to it and round it (W/S, A/D), and stop in front of it facing south into the square: that is the heaviest view.
6. After pulling new commits, hard-reload (Cmd+Shift+R) so the browser does not keep old files.
7. For a fair reading: laptop on mains power, other heavy tabs closed, and Chrome hardware acceleration on (chrome://gpu should list WebGL as "Hardware accelerated").

Target is 60 fps at the Arch. My own checks run in a software renderer in the cloud (about 1 fps), so they only count draw calls and triangles, not real frame time: about 470 draw calls and 570k triangles at the start position facing the Arch.

## Commit log
| Date | Commit | Summary |
|---|---|---|
| 2026-10-07 | efa26be | Phase 0: Washington Square free-roam location, campus data pipeline, tests, Phase 1 inventory draft |
| 2026-10-07 | 18718a2 | Phase 2 massing from NYC 3D model, Paulson estimate, inventory draft 2 (LPC + Street View), skyline screenshots |
| 2026-10-07 | 13e9200 | Phase 2 detail pass: Arch, Bobst, Silver Center in full geometry; kits, checklists, Commons references, comparisons, landmark tests |
| 2026-10-07 | 8d48dcd | Kimmel Center detail; shared facade kit |
| 2026-10-07 | 6ddb53a | Judson Memorial Church and campanile |
| 2026-10-07 | fd969d5 | The Row (Nos. 1-13 and 19-26 Washington Sq N) |
| 2026-10-07 | e9658eb | Weinstein Hall (street-visible); inventory update 4 |
| 2026-10-07 | c557397 | Brown Building and Triangle Fire Memorial (preserved) |
| 2026-10-07 | 8c58c76 | Open questions resolved (inventory update 4); sidewalk sheds |
| 2026-10-07 | a873e18 | Kimmel canopy: curved vault (review fix) |
| 2026-10-07 | 496e8fc | FPS counter + how to test locally |
| 2026-10-07 | 190f7b1 | W 4th shed realigned (review fix) + refs |
| 2026-10-07 | 8e83ef6 | Silver Towers + Sylvette placeholder |
| 2026-10-07 | f81d904 | Vanderbilt Hall + masonry kit |
| 2026-10-07 | 84950cb | Tisch Hall + KMC (Stern) |
| 2026-10-07 | 7031b08 | Paulson Center |
| 2026-10-07 | ae1c4ea | PROGRESS review stop |
| 2026-10-07 | e923d99 | README + credits for the nyu-campus branch |
| 2026-10-07 | 416d350 | CONTRIBUTING Node version |
| 2026-10-07 | 9dfcbe7 | README clone command |
| 2026-10-07 | fcf269e | README rewrite |
| 2026-10-07 | cf46a10 | Atmosphere: decay (park slice) |
| 2026-10-07 | 1a21caa | Atmosphere: Dead of night preset |
| 2026-10-07 | a080a2f | Atmosphere: no traffic on campus |
| 2026-10-07 | ecea1cf | Atmosphere: loiterers |
| 2026-10-07 | f0e00e5 | Atmosphere: soundtrack draft |
| 2026-10-07 | 70d6885 | PROGRESS atmosphere review stop |
| 2026-10-07 | f1bf788 | README/credits point at main |
| 2026-10-07 | 09b609c | Real NYC time of day: NOAA sun, moon phase, continuous lamps and fog, ?time/?date preview, sky tests |
| 2026-10-08 | 09266ef | Second-tier kit: spec-driven facades for NYU buildings |
| 2026-10-08 | 7bc36a9 | Second tier: Rubin Hall |
| 2026-10-08 | 1e4bb75 | Second tier: Lipton Hall |
| 2026-10-08 | bfb01bf | Second tier: 37 Washington Square West |
| 2026-10-08 | 51b9b09 | Second tier: 29 Washington Square West |
| 2026-10-08 | 64a579d | Second tier: Hayden Hall, 240 Mercer St |
| 2026-10-08 | 34e6123 | Second tier: Filomen D'Agostino Hall |
| 2026-10-08 | 4b2ba26 | Second tier: Furman Hall |
| 2026-10-08 | cbd061e | Second tier: Wilf Hall and the Provincetown Playhouse |
| 2026-10-08 | 3122fbc | Second tier: Kevorkian Center |
| 2026-10-08 | 94cfe9d | Second tier: Heyman Hall, 51 Washington Square South |
| 2026-10-08 | 5d4f02b | Second tier: Global Center for Academic and Spiritual Life |
| 2026-10-08 | d137287 | Second tier: Warren Weaver Hall |
| 2026-10-08 | 31013c7 | Second tier: Meyer Hall |
| 2026-10-08 | f80441a | Second tier: Department of Psychology, 707 Broadway |
| 2026-10-08 | 82ea80b | Second tier: Center for Neural Science, 4 Washington Pl |
| 2026-10-08 | d758221 | Second tier: Waverly Building |
| 2026-10-08 | 9f34dfe | Second tier: Goddard Hall |
| 2026-10-08 | 6a704a9 | Second tier: Pless Building |
| 2026-10-08 | 7a69436 | Second tier: Pless Annex |
| 2026-10-08 | 57db0bf | Second tier: Academic Resource Center |
| 2026-10-08 | 1333f4a | Second tier: 35 West 4th Street (Frederick Loewe Theatre) |
| 2026-10-08 | 543754f | Second tier: Leslie eLab, 14 Washington Pl |
| 2026-10-08 | 87dc8e3 | Second tier: Arthur L. Carter Hall, 10 Washington Pl |
| 2026-10-08 | 3ebd88e | Second tier: 19 West 4th Street (Politics) |
| 2026-10-08 | bf9e248 | Second tier: Bonomi Family Admissions Center |
| 2026-10-08 | 1d0c053 | Second tier: 31 West 4th Street |
| 2026-10-08 | 7379914 | Second tier: Hebrew Union College, 1 W 4th St |
| 2026-10-08 | dac9b6e | Second tier: Kimball Hall |
| 2026-10-08 | e9cf427 | Second tier: Center for Genomics and Systems Biology, 12 Waverly Pl |
| 2026-10-08 | 5abb54b | Second tier: 285 Mercer St / 10 Waverly Pl |
| 2026-10-08 | a263b1d | Second tier: Department of Public Safety and Card Center, 7 Washington Pl |
| 2026-10-08 | cbf4106 | Second tier: 15 Washington Place |
| 2026-10-08 | 694c1f2 | Second tier: Department of English, 244 Greene St |
| 2026-10-08 | 2eae3a3 | Second tier: Department of Philosophy, 3 Washington Pl |
| 2026-10-08 | 689093f | Second tier: Rufus D. Smith Hall, 25 Waverly Pl |
| 2026-10-08 | 91933b0 | Second tier: Languages and Literature, 13 University Pl |
| 2026-10-08 | 7ad4c1f | Second tier: Cantor Film Center, 36 E 8th St |
| 2026-10-08 | ec6a822 | Second tier: Tisch School of the Arts, 721 Broadway |
| 2026-10-08 | 92bd011 | Second tier: Gallatin School, 1 Washington Pl (715 Broadway) |
| 2026-10-08 | a9e5421 | Second tier: NYU Health Center, 726 Broadway |
| 2026-10-08 | 9ca0a26 | Second tier: School of Global Public Health, 708 Broadway |
| 2026-10-08 | b89415c | Second tier: 400 Lafayette St |
| 2026-10-08 | fa87604 | Second tier: 383 Lafayette St (Admissions Office) |
| 2026-10-08 | 0909000 | Second tier: 14 E 4th St (NYU Shanghai office) |
| 2026-10-08 | 2189f23 | Second tier: 16 Cooper Square |
| 2026-10-08 | 0867533 | Second tier: 60 Fifth Avenue |
| 2026-10-08 | dbc0ad2 | Second tier: 7 East 12th Street |
| 2026-10-08 | d6f1251 | Second tier: Brittany Hall, 55 E 10th St |
| 2026-10-08 | 59a8a69 | Second tier: Bronfman Center, 7 E 10th St |
| 2026-10-08 | 457b3fc | Second tier: Barney Building, 28 Stuyvesant St |
| 2026-10-08 | 8aa222c | Second tier: 107 Second Avenue |
| 2026-10-08 | 2b95669 | Second tier: 509 and 543 LaGuardia Place |
| 2026-10-08 | 71fce20 | Second tier: 21 Washington Square North, rear parts |
| 2026-10-08 | bf67483 | Second tier: 22 Washington Square North, rear part |
| 2026-10-08 | aa9437d | Second tier: 27 Washington Square North |
| 2026-10-08 | 329ae5e | Second tier: Washington Mews, north side (58, 60, 62) |
| 2026-10-08 | 82a7b81 | Second tier: Washington Mews, south side |
| 2026-10-08 | c874f5e | Second tier: East 8th Street houses (6-22 E 8th St) |
| 2026-10-08 | fdc4139 | Second tier: Casa Italiana Zerilli-Marimò, 24 W 12th St |
| 2026-10-08 | 9627a5b | Second tier: Lillian Vernon Creative Writers House, 58 W 10th St |
| 2026-10-08 | 9897525 | Second tier: Senior House at 13th Street |
| 2026-10-08 | 2d49503 | Second tier: University Hall |
| 2026-10-08 | b09d1a8 | Second tier: Palladium Hall |
| 2026-10-08 | 5594a00 | Second tier: Third North |
| 2026-10-08 | 89b44e5 | Second tier: Alumni Hall |
| 2026-10-08 | cc6195c | Second tier: Founders Hall and the St. Ann's facade |
| 2026-10-08 | e14e7ff | Second tier: Seventh Street Residence |
| 2026-10-08 | f006757 | Second tier: Sixth Street Residence |
| 2026-10-08 | 767988b | Second tier: Second Street Residence |
| 2026-10-08 | f1a702c | Second tier: Coral Tower |
| 2026-10-08 | 0dc9179 | Second tier: Carlyle Court |
| 2026-10-08 | abeed23 | Second tier: Washington Square Village |
| 2026-10-08 | f8a1459 | Second tier: Puck Building |
| 2026-10-08 | 5233d4f | Third-tier facades: kit and classification |
| 2026-10-08 | 5c8b247 | Third tier: blocks 397-446 (1 Av, E 2 St, E Houston St) |
| 2026-10-08 | 6f3efab | Third tier: blocks 447-463 (E 7 St, E 6 St, 2 Av) |
| 2026-10-08 | 28aec12 | Third tier: blocks 464-489 (3 Av, E 10 St, Spring St) |
| 2026-10-08 | 70027c2 | Third tier: blocks 493-509 (Prince St, Mulberry St, Spring St) |
| 2026-10-08 | ed9d18c | Third tier: blocks 510-524 (W Houston St, Prince St, MacDougal St) |
| 2026-10-08 | b3eb4a8 | Third tier: blocks 525-543 (MacDougal St, Sullivan St, W Houston St) |
| 2026-10-08 | baeee57 | Third tier: blocks 544-560 (3 Av, Washington Pl, MacDougal Alley) |
| 2026-10-08 | aa41567 | Third tier: blocks 561-575 (W 9 St, University Pl, W 12 St) |
| 2026-10-08 | cdcd31d | Third tier: blocks 576-612 (6 Av · Av of the Americas, Bleecker St, Jones St) |
| 2026-10-08 | 269d3a0 | Third tier: blocks 613-816 (W 15 St, Bank St, Greenwich Av) |
| 2026-10-08 | 675476a | Third tier: blocks 817-870 (E 18 St, W 15 St, 6 Av · Av of the Americas) |
| 2026-10-08 | 5b4d72e | Third tier: blocks 871-897 (Irving Pl, E 19 St, E 17 St) |
| 2026-10-07 | db10350 | Night fill light dimmed; stop point 1 screenshots and numbers |
| 2026-10-08 | f364b1d | Plan: Step 4B neighbourhood landmarks and storefronts |
