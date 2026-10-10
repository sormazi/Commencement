# Subway entrances

All 51 entrances inside the study area, from the MTA "Subway Entrances and Exits: 2024" dataset (data.ny.gov, i9wp-a4ja, NY Open Data, fetched 9 Oct 2026), in `dist/campus/data/subway-entrances.js`; built by `dist/campus/subway.js`.

| Station | Routes | Entrances in the map |
| :--- | :--- | :--- |
| W 4 St-Wash Sq | A C E B D F M | 3 stairs, 1 elevator, 2 inside buildings |
| 8 St-NYU | R W | 8 stairs |
| Astor Pl | 6 | 2 stairs; the uptown one is the cast-iron kiosk |
| Broadway-Lafayette St/Bleecker St | 6 B D F M | 5 stairs, 1 inside a building |
| Christopher St-Stonewall | 1 | 2 stairs (at the west edge of the map) |
| 14 St-Union Sq | 4 5 6 L N Q R W | 10 stairs, 2 inside buildings |
| 14 St/6 Av | 1 2 3 L F M | 9 stairs (one exit-only, red globes), 1 elevator |
| 3 Av | L | 4 stairs |

- Stairs: dark stairwell opening, stone curb, painted iron railings on three sides, two globe lamps at the head (green for entry, red for exit-only), and the black Subway sign with the station and routes in plain lettering (no route bullets). Each stairway and its folding gate are separate records in `world.subway.entrances`, so they can later lead down into stations.
- Elevators: a small glass and steel lift house. Entrances inside buildings get the sign only.
- Rules still to check on Street View: the direction each stair runs (taken along the nearest street, descending away from the nearest corner), the kiosk's exact form, and which entrances are in sidewalk bump-outs.
- 2126: railings rust, globes go dark and about half are broken, gates are pulled shut.
