# Campus data sources and how to re-fetch them

Fetched 2026-10-07 (UTC). The raw files are large (about 35 MB) and are not committed; `dist/campus/data/campus-data.js` is the committed, derived dataset. To rebuild it, re-fetch into `RESEARCH/data/raw/` and run `node tools/build-campus-data.mjs`.

Study box used for every query: south 40.7225, west -74.0035, north 40.7395, east -73.9855.

| File | Source | Query | Licence |
|---|---|---|---|
| `nightview-osm-washington-square.json` | OpenStreetMap, Overpass API (`https://overpass-api.de/api/interpreter`) | `[out:json];( way[highway]; way[building]; relation[building]; way[leisure]; way[landuse]; way[barrier]; way[natural]; node[natural=tree]; node[amenity]; node[highway]; node[historic]; node[tourism]; node[man_made]; way[amenity]; way[man_made]; way[historic]; way["area:highway"]; relation[leisure]; relation[amenity]; )(bbox); out body; >; out skel qt;` | ODbL 1.0, © OpenStreetMap contributors |
| `nightview-nyc-footprints.json` | NYC Open Data Building Footprints `5zhs-2jue` | `/resource/5zhs-2jue.json?$where=within_box(the_geom,40.7395,-74.0035,40.7225,-73.9855)&$limit=50000` | NYC Open Data Terms of Use |
| `nightview-nyc-pluto.json` | NYC Open Data PLUTO `64uk-42ks` | `latitude between 40.7225 and 40.7395 and longitude between -74.0035 and -73.9855` | NYC Open Data Terms of Use |
| `nightview-nyc-planimetrics.json` | Roadbed `i36f-5ih7`, Sidewalk `52n9-sdep`, Median `ees7-4ufv`, Curbs `5xvt-8cbk`, Pavement Edge `vs44-rznx`, Open Space Parks `y6ja-fw4f`, Open Space Other `b7j8-z8a7`, Public Plazas `ue2e-9jm2`, Elevation Points `9uxf-ng6q`, Misc Structures `92m5-3pwp`, Centerline `inkn-q76z`, Hydrants `5bgh-vtsn`, Bus Stop Shelters `t4f2-8md7`, Parks Properties `enfh-gkve`, Forestry Tree Points `hn5i-inap`, Dog Runs `hxx3-bwgv` | `within_box(<geometry column>, 40.7395,-74.0035,40.7225,-73.9855)`; exact URLs are stored in the file's `_meta.datasets` | NYC Open Data Terms of Use |

Not yet fetched: NYC 3D Building Model (`tnru-abg2`, CityGML at `https://s-media.nyc.gov/agencies/oti/DA_WISE_GML.zip`), LPC designation reports, Mapillary imagery, Wikimedia Commons photos.

Google Maps / Street View are used only as look-only references; nothing from them is saved.
