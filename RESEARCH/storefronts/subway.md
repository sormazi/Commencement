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
- Astor Place uptown kiosk (rebuilt 9 Oct 2026): checked side by side against Wikimedia Commons photos ("NYCS IRT LexAve AstorPl Kiosk.jpg", CC BY 2.0; "Astor Place Uptown.JPG", CC BY-SA 4.0) and Street View (Apr 2026). Head pavilion at the north-north-east end with paneled dado, glazing, fluted pilasters with consoles, Greek-key frieze, ENTRANCE / UPTOWN panels (a signage decal), cornice, bell-curved fish-scale roof with ridge cresting and urn finials, and a canopy on scrolled brackets over the entrance; the long glazed enclosure with a ribbed glass gable runs south-south-west over the stair. Still simplified: the cross-gable at the far end of the enclosure, the cast ornament detail, the exact canopy bracket scrollwork.
- Astor Place downtown entrance (west side of Lafayette St at Astor Pl): a standard stair with green railings in the Street View captures (Jul 2022, under a sidewalk shed at the time), as modelled.
- Rules still to check on Street View: the direction each stair runs (taken along the nearest street, descending away from the nearest corner), the kiosk's exact form, and which entrances are in sidewalk bump-outs.
- 2126: railings rust, globes go dark and about half are broken, gates are pulled shut.

## Sampled checks (10 Oct 2026)

- 8 St-NYU, north side of E 8 St west of Broadway (subway-30 and subway-32): two stairs in line along E 8 St, as modelled (Street View, Apr 2026); signs read "8 Street Station, Downtown & Brooklyn" with the R and W bullets, digital advertising screens on the railings, globe posts at the stair ends. Which end of each stair is open could not be read from the available car panoramas, so the descent direction stays as modelled and unchecked.
- Astor Pl: the uptown kiosk and the downtown stair were checked earlier (above).
- W 4 St-Wash Sq: not checked; panoramas near Sixth Ave and W 3rd St snap to user photo spheres.
- All other entrances: unchecked; the axis and direction rule stands.
