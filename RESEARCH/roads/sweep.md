# Road surface sweep

Avi, 14 Oct 2026: "strange shapes on the roads ... stretches of sidewalk material in the roadway, odd lines and patches". Method: tools/sweep-surfaces.mjs checks every surface in the study area automatically, and contact sheets put the game's ground plan (drawn from the data) beside NYS orthoimagery, tile by tile (120 m tiles over the core, crops for every flagged spot). Sheets are look-only and not saved.

## Fixed

| What | Where | Cause | Fix |
|---|---|---|---|
| Whole blocks with no sidewalk, buildings standing in asphalt | Edges of the study area: 86 sidewalk, 94 roadbed, 16 median and 2 plaza polygons, e.g. x 330..450 n 760..880, x 795..915 n -315..-195, x 800..920 n -775..-655, x 780..900 n -940..-820 | The 7 Oct planimetric extract used Socrata's within_box(), which keeps only polygons lying wholly inside the box | tools/fetch-planimetrics.py refetches with intersects(); campus data, markings and furniture rebuilt. Bare roadside ground fell from 14,150 m2 to 3,020 m2 |
| Flicker where a sidewalk meets a median or traffic island | 59 places (37 curb medians, 22 islands), e.g. x -370 n -392, x 161 n -686 | Two raised slabs overlapping at exactly the same height | Plazas sit 3 mm and medians 6 mm above sidewalks |
| Odd lines on sidewalks and through buildings | 16 markings, e.g. a 57 m line along Washington Sq W inside the park edge (x -177 n -38), x 363 n -47, x 756 n -924 | Lane lines laid along centre lines that run off the planimetric roadway | build-markings.mjs drops any marking more than half of whose length lies on a sidewalk, plaza, raised median or building |
| Plazas missing from the planimetric plazas | OSM pedestrian areas (31; most already had a planimetric plaza, e.g. Gould Plaza, which looked the same before and after) | OSM pedestrian areas were never drawn | Paved to the sidewalk, 2 mm above any overlapping slab (asphalt-surfaced ones darker) |
| Sign posts and lamps in lanes | see the pole audit in README.md | | |

## Found, not yet fixed

- Union Square's north and south plazas (x 565..675 n 560..670 and round x 500..600 n 380..480) are planimetric roadbed with a centre line through them, so they render as asphalt with a few traffic islands. Needs the plazas drawn from their real outlines (NYC DOT plaza program or OSM) and the old roadway centre lines removed.
- Washington Square Village and Silver Towers courtyards (x -74..46 n -408..-288 and x -184..-64 n -513..-393): roadbed polygons cover the raised gardens, so the courtyards are asphalt with lawn patches. Needs the garden decks modelled.
- Union Sq E: the bike lane is laid against the east curb; the real green lane curves along the west side (bike-paint.json notes).
- Cooper Square fork (x 520..610 n -75..15): two green lane pieces splay into a V across the roadway where the bike route follows the fork. Needs a hand-drawn lane there.
- Slivers of bare asphalt (0.5 to 2 m) between some roadbed and sidewalk polygons, mostly at curbs (50 clusters, 3,020 m2). Read as gutters from the street; left for now.
- Block interiors (yards behind buildings) are bare asphalt at street level; hidden by the buildings from the streets, left for now.

Before and after (top-down, noon): RESEARCH/screenshots/sweep-edge-block-before-after-2026-10-14.png (a block at the study area's north-east edge, x 389 n 818, which had no sidewalks).
