# Washington Square Park furniture survey

Started 13 Oct 2026 for the multiplayer demo (Avi's order of 13 Oct, step b1). Positions come from OpenStreetMap, which maps the park object by object; looks come from Street View user photospheres (looked at, never saved) and will be checked against Avi's photos in RESEARCH/my-photos/ when they arrive.

## Counts inside the park (OSM, retrieved 7 Oct 2026)

| Object | Count | OSM tags | Status |
|---|---|---|---|
| Wooden benches with backs | 390 (+4 backless) | amenity=bench, material=wood | placed, oriented, sittable |
| Granite benches | 8 runs | amenity=bench (ways), material=granite, backrest=no | placed, sittable from both sides |
| Litter baskets | 55 | amenity=waste_basket | placed |
| Drinking fountains | 7 | amenity=drinking_water, fountain=bubbler | placed |
| Lamp posts | 145 | highway=street_lamp | already placed (park.js, three kinds) |
| Fences and railings | 22 ways | barrier=fence, height 1 or 2 m, metal | done: post-and-chain (1 m and lower), black pickets (taller) |
| Hedge | 1 | barrier=hedge | done: clipped green box |
| Chess tables | 13 | counted on photospheres | already placed (park.js) |
| Planters, park signs | not in OSM | | still to do, from Street View |

Three benches carry memorial plaques in OSM (openbenches.org ids 36389 to 36395); the plaques are not modelled.

## Looks (Street View user photospheres)

- Wooden benches, Jan 2018, north edge of the fountain plaza (40.73124, -73.99718) and Jul 2017 on the paths: pale weathered slats for seat and back on black cast-iron end frames with armrests, about 1.9 m long, in rows along the path and plaza edges with their backs to the lawns and beds.
- Granite benches, Jan 2018: long, low, backless dark grey granite blocks on short plinths, on the inner edge of the fountain plaza.
- Litter baskets, Jan 2018: round black ribbed cans on a flared foot.
- Drinking fountains, Jul 2017, by the north-east playground (40.73093, -73.99662): dark cast-iron pedestals with a bowl, and a low step bowl at the side.
- Lawn fences, Jul 2017, same place: low black posts with drooping chains between them round the lawns; tall black picket fences round the playgrounds and dog runs.

## Orientation

OSM gives each bench as a point. Each bench runs along the nearest footway and faces it; where neighbours within 3.5 m line up, the bench follows the row. Benches are shortened where mapped neighbours are closer than 1.9 m. Checked on renders at the plaza's north edge and on the west paths (benches face the walk, backs to the beds).

## Still to do

Open question for Avi's photos: OSM maps only about 18 fences in the park, but the Jul 2017 photospheres show chains along lawn edges in several places, so many lawn chains are probably unmapped. They are not added until checked, lawn by lawn. Also still to do: planters and park signs, a pass on bench rows that OSM maps with odd spacing, and a check of every row against the orthoimagery.

## Fences (done 13 Oct)

Inside the park, fences tagged 1 m or lower are low black posts (about 0.7 m, every 2.2 m, ball tops) with drooping chains; every other fence in the study area is a black picket railing at its OSM height (1.2 m where untagged), drawn as one cut-out panel mesh. Hedges are clipped privet boxes. Walls are unchanged.

## From Avi's photo (Oct 2026, fountain plaza looking north)

Avi's own photo is reference only and is not saved in the repository.
- Benches: rebuilt with curved cast-iron frames (seat dipping to the back, back curving up and back) and armrests ending in a scroll; pale weathered slats.
- Chains: Avi confirms the beds and lawns are edged with low black posts and drooping chains. Every lawn and planting-bed edge in the park that faces a walk now has them (99 runs, about 4.1 km), 0.15 m out from the edge; edges between two plantings have none. Still to confirm edge by edge on Street View.
- Paths: hexagonal asphalt paving blocks on the park walks; the fountain plaza (30.5 m round the fountain) is smoother light granite in rings with darker radial bands.
- Shrubs: in the park's planting beds, the scattered mound shrubs are replaced by low ground cover and rows of clipped round boxwoods along each bed's walk side (1,400, about 2 m apart, clear of trunks), as in the photo. Flower beds keep their flowers. This is a rule, not yet a bed-by-bed survey: which beds really have boxwood rows, and what else is planted, needs Street View and more photos.
- Lamp glow: halos at night are tighter and softer (1.7 m across in clear air, faster falloff, about two thirds the brightness).
- Lamp styles: still to settle. The plaza posts are drawn with a cluster of five globes (Sep 2015 photospheres); Avi mentions double-globe posts. A close photo of one plaza post would settle it.
