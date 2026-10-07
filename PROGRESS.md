# NightView · Washington Square progress

Read this file and `RESEARCH/campus-inventory.md` first when picking the work back up.

## Current phase
Phase 2 detail pass, second batch (approved 2026-10-07 to continue): Kimmel, Judson, the Row, Weinstein, Brown + memorial, then a review stop; then Silver Towers + Picasso, Vanderbilt, Tisch + Kaufman, Paulson. One commit per landmark.

## Finished
- Phase 0: free-roam campus world (projection, street graph, collision, curbs/surfaces, streamed tiles, minimap, spawn/reset). Default location is Washington Square · NYU. Corridor locations unchanged. Tests pass. See CAMPUS.md.
- Phase 1 draft: RESEARCH/campus-inventory.md with 24 questions; reviewed by Avi 2026-10-07.

- Research completion (2026-10-07): NYC 3D Building Model (DA12) ingested; LPC reports read (Arch and Row via GVHD LP-0489, Brown LP-2128, Judson LP-0196, University Village LP-2300, plus Building Database materials); Street View pass on 12 priority landmarks. Inventory is now draft 2 with a "Research update 2" section and a question status table.
- Phase 2 massing pass: 4,110 buildings from 3D-model roof pieces, 138 extrusions, Paulson estimated. Screenshots in RESEARCH/screenshots/phase2-massing/.

## In progress
- Resolving the remaining open questions from Street View (Silver porch, Bobst entrance bays, Weinstein street frontage, Public Safety booths, sidewalk sheds); browser pane needed for Street View.
- Detail pass: Kimmel, Judson and the Row done; Weinstein next.

## Next (after Avi's review)
- Phase 2 detail pass continues with Kimmel, Judson, the Row, Weinstein, Brown + memorial, Silver Towers + Sylvette, Vanderbilt, Tisch + KMC, Paulson (checklists in RESEARCH/checklists/).
- When Avi's photos land in RESEARCH/my-photos/: update fountain plaza, chess tables, lamp posts, banners.

## Decisions from Avi
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

## Commit log
| Date | Commit | Summary |
|---|---|---|
| 2026-10-07 | efa26be | Phase 0: Washington Square free-roam location, campus data pipeline, tests, Phase 1 inventory draft |
| 2026-10-07 | 18718a2 | Phase 2 massing from NYC 3D model, Paulson estimate, inventory draft 2 (LPC + Street View), skyline screenshots |
| 2026-10-07 | 13e9200 | Phase 2 detail pass: Arch, Bobst, Silver Center in full geometry; kits, checklists, Commons references, comparisons, landmark tests |
| 2026-10-07 | 8d48dcd | Kimmel Center detail; shared facade kit |
| 2026-10-07 | 6ddb53a | Judson Memorial Church and campanile |
