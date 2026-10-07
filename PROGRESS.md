# NightView · Washington Square progress

Read this file and `RESEARCH/campus-inventory.md` first when picking the work back up.

## Current phase
Phase 2 massing pass done; stopped for Avi's review of the four skyline views.

## Finished
- Phase 0: free-roam campus world (projection, street graph, collision, curbs/surfaces, streamed tiles, minimap, spawn/reset). Default location is Washington Square · NYU. Corridor locations unchanged. Tests pass. See CAMPUS.md.
- Phase 1 draft: RESEARCH/campus-inventory.md with 24 questions; reviewed by Avi 2026-10-07.

- Research completion (2026-10-07): NYC 3D Building Model (DA12) ingested; LPC reports read (Arch and Row via GVHD LP-0489, Brown LP-2128, Judson LP-0196, University Village LP-2300, plus Building Database materials); Street View pass on 12 priority landmarks. Inventory is now draft 2 with a "Research update 2" section and a question status table.
- Phase 2 massing pass: 4,110 buildings from 3D-model roof pieces, 138 extrusions, Paulson estimated. Screenshots in RESEARCH/screenshots/phase2-massing/.

## In progress
- Nothing; waiting for review.

## Next (after Avi's review)
- Phase 2 facades, starting with the NYU landmarks, using the LPC descriptions and Street View observations; per-landmark checklists in RESEARCH/checklists/.
- When Avi's photos land in RESEARCH/my-photos/: update fountain plaza, chess tables, lamp posts, banners.

## Decisions from Avi
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

## Commit log
| Date | Commit | Summary |
|---|---|---|
| 2026-10-07 | efa26be | Phase 0: Washington Square free-roam location, campus data pipeline, tests, Phase 1 inventory draft |
