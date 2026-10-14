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
