# Washington Square · NYU: campus inventory (Phase 1 draft for review)

Status: **draft 1, 2026-10-06.** Nothing in Phase 2 gets built from this until you have corrected it.

This file is the reference for building the Washington Square location. It lists every NYU building and public space I could identify inside the study area (14th Street to Houston Street, Sixth Avenue to Third Avenue / Lafayette Street), with what the open data says about each one and what I still don't know.

## How to read this

Every fact carries a tag saying where it came from, so you can tell at a glance what to trust.

| Tag | Meaning |
|---|---|
| **[D]** | Measured from open data on disk (NYC Building Footprints roof heights, PLUTO, NYC Centerline, OSM). Reproducible with `tools/build-campus-data.mjs` and `tools/inventory-table.mjs`. |
| **[S]** | From a cited published source (Wikipedia article text, NYU's residence-hall pages). Source listed in the entry. |
| **[K]** | From my general knowledge. Plausible, **not yet verified**. Treat as a guess until you or a source confirms it. |
| **[?]** | Unknown. A question for you is listed at the end. |

**What has not been done yet, honestly:**

- **No Street View pass yet.** You allowed Google Maps / Street View as look-only reference. The in-app browser only granted google.com for a single page load per approval, so I could not do a systematic facade walk this round. Facade colours, window counts and signage positions below are therefore mostly [K] or [?]. I'd rather ask you than invent them. If you approve google.com for the session (or drop photos in `RESEARCH/my-photos/`), I'll do a block-by-block facade pass and fill the window counts in before Phase 2's facade step.
- **NYC 3D Building Model not ingested yet.** The download is city-wide (`DA_WISE_GML.zip`, OTI, 2014 aerial survey). I've located it but not pulled it; it will be the starting geometry for roof forms and setbacks in Phase 2. It predates the Paulson Center (2022), so Paulson must come from footprints plus your photos.
- **LPC designation reports not read yet.** They are the best source for the Row, Judson, the Brown Building, Silver Towers and the Puck Building, and I'll pull the PDFs before the facade pass.
- **Washington Square News research** belongs to Phase 5 and has not started.

## Sources on disk

All raw extracts live in `RESEARCH/data/raw/` (fetched 2026-10-07 UTC through the in-app browser, since this session's own network can't reach those hosts). Licences:

| Dataset | ID / query | Licence | Used for |
|---|---|---|---|
| OpenStreetMap via Overpass API | highways, buildings, leisure, barriers, trees, amenities, bbox 40.7225,-74.0035,40.7395,-73.9855 | ODbL 1.0, © OpenStreetMap contributors | park paths, lawns, fences, benches, lamps, monuments, building names |
| NYC Building Footprints | `5zhs-2jue`, 4,257 footprints | NYC Open Data Terms of Use | every footprint, roof height, ground elevation, BIN |
| PLUTO | `64uk-42ks`, 4,023 lots | NYC Open Data Terms of Use | address, block/lot, owner, floors, year built, landmark status |
| NYC Planimetric: Roadbed, Sidewalk, Median, Curbs, Pavement Edge, Public Plazas, Open Space | `i36f-5ih7`, `52n9-sdep`, `ees7-4ufv`, `5xvt-8cbk`, `vs44-rznx`, `ue2e-9jm2`, `y6ja-fw4f` | NYC Open Data Terms of Use | carriageways, curbs, sidewalks, medians, plazas |
| NYC Centerline (LION-derived) | `inkn-q76z` | NYC Open Data Terms of Use | street graph, names, curb-to-curb widths, lanes, direction |
| NYC Parks Forestry Tree Points | `hn5i-inap` | NYC Open Data Terms of Use | tree positions, trunk diameter, species |
| Hydrants, Bus Stop Shelters, Parks Properties, Dog Runs | `5bgh-vtsn`, `t4f2-8md7`, `enfh-gkve`, `hxx3-bwgv` | NYC Open Data Terms of Use | street furniture |
| NYC 3D Building Model (not yet downloaded) | `tnru-abg2` → `s-media.nyc.gov/agencies/oti/DA_WISE_GML.zip` | NYC Open Data Terms of Use | Phase 2 roof forms |
| NYU residence hall pages | nyu.edu/students/.../residence-halls | read for names, addresses, current status | residence halls |
| Wikipedia article text | cited per entry | CC BY-SA (facts only, no text copied) | dates, architects, dimensions |

No Google imagery, tiles or data are on disk or will be.

## Coordinate system

Origin is the centroid of the Washington Square Arch (OSM way 248166269): **40.7312347 N, 73.9971025 W**. Map metres are `[east, north]`; the renderer uses `z = -north`. Local equirectangular projection, tested against great-circle distance to better than 0.3 % across the study area [D].

Useful reference points in map metres [D]: Fountain centre (-30, -46). Bobst centroid (-5, -203). Kimmel (-66, -151). Silver Center (134, -109). Weinstein (196, -31). Paulson Center (-37, -515). Silver Towers I/II (-72, -476) and (-126, -502). Rubin (181, 250). Founders (658, 95). Astor Place cube (514, -150).

---

## 1. Streets

The free-roam street graph is built from NYC Centerline: 112 named streets, 577 segments, 349 nodes, one connected network [D]. Widths are NYC's curb-to-curb figures. Selected streets [D]:

| Street | Curb-to-curb (m) | Direction / lanes | Notes |
|---|---|---|---|
| Fifth Avenue | 12.2 to 16.5 | one-way, 2 to 3 lanes | Ends at Washington Square North. The Centerline's last node sits 23 m north of the Arch centre. |
| Washington Square North | 9.8 | one lane | Two segments either side of Fifth |
| Washington Square South (W 4th) | 9.1 | one-way, 1 lane | |
| Washington Square East | 7.3 | one-way, 1 lane | Meets University Pl, Waverly Pl and Washington Sq N at one node (130, -57) |
| Washington Square West | 7.3 | one-way, 1 lane | |
| University Place | 11.6 | 2 lanes | Continues Washington Sq E northward. **The two are within 1° of collinear in the data**; see question Q1 about "the angle". |
| LaGuardia Place | 11.0 to 15.8 | two-way, 2 lanes | |
| Broadway | 12.8 to 14.0 | one-way, 2 lanes | |
| E 14th St | 12.2 to 16.8 | two-way, 4 lanes | |
| Third Avenue | 21.3 | two-way, 4 lanes | widest street in the area |
| Washington Mews | 6.1 | private | gated both ends [S Wikipedia: Washington Mews] |
| MacDougal Alley | 4.9 | private cul-de-sac | |

Also present [D]: Washington Pl, Waverly Pl, W 4th, MacDougal, Sullivan, Thompson, Mercer, Greene, Wooster, Bleecker, W 3rd, W & E Houston, W & E 8th, Astor Pl, E 10th to E 14th, Lafayette, Cooper Sq, Bowery, Sixth Avenue, Fourth Avenue, Patchin Place (2.4 m).

Street furniture in the area from open data [D]: 318 traffic signals, 866 hydrants, 26 bus shelters, 53 Citi Bike stations, 524 bike racks, 28 mailboxes, 82 trash cans (OSM, incomplete), 364 OSM street lamps.

---

## 2. Washington Square Park and the public spaces

### 2.1 Washington Square Arch

- **Location** [D]: footprint 19.1 m × 7.0 m, long axis perpendicular to Fifth Avenue's axis. NYC footprint BIN 1088400.
- **Height**: 77 ft (23.5 m) total; opening 30 ft (9.1 m) wide between the piers and 47 ft (14.3 m) high [S Wikipedia: Washington Square Arch]. NYC photogrammetric roof height reads 20.4 m [D] and Wikipedia's infobox says 73.5 ft; I'm using 23.5 m until you or the LPC report say otherwise.
- **Built** 1890–92; architect Stanford White; white Tuckahoe marble; modelled on Roman triumphal arches [S]. Temporary plaster-and-wood arch over Fifth Avenue 1889 [S].
- **Sculpture** [S]: north face of the east pier, *Washington as Commander-in-Chief, Accompanied by Fame and Valor* by Hermon A. MacNeil (1916); west pier, *Washington as President, Accompanied by Wisdom and Justice* by A. Stirling Calder (1918). Spandrel winged Victories by Frederick MacMonnies. Keystone eagles by Philip Martiny. Frieze of 13 large and 42 small stars with "W"s.
- **Inscription** on the north attic [S]: "LET US RAISE A STANDARD TO WHICH THE WISE AND THE HONEST CAN REPAIR. THE EVENT IS IN THE HAND OF GOD." [K for the second sentence]. South attic carries a dedication inscription [K, wording to confirm].
- **Signature details someone walking past would miss:**
  1. The two Washington statues on the north piers only, south piers plain [S].
  2. The deep coffered soffit inside the opening with rosettes [K].
  3. Flying Victories in the spandrels and the eagle over the keystone [S].
  4. The star-and-W frieze band above the arch [S].
  5. The low stone/iron surround and the plaza pavement circle around the base; people sit on the pier bases [K].
  6. Black iron fence enclosing the base [K, ask].
- **Collision**: two piers solid, 9.14 m opening drivable. Built and tested in Phase 0.

### 2.2 The park as a whole [D unless tagged]

- OSM park polygon: 42,945 m²; centroid (-51, -40). Opened as a park 1827; redesigned 1871 with curving paths [S Wikipedia: Washington Square Park]. Last major renovation 2007–2014, which moved the fountain to align with the Arch, replaced the perimeter fence with a taller one, and shrank the central plaza [S].
- **Inside the polygon**: 394 benches (OSM nodes) plus 8 mapped bench runs; 132 lamp posts; 504 trees (350 NYC Parks Forestry records, 154 OSM-only); 1,159 m of fence; 87 m of retaining wall around the fountain plaza; ~120 lawn polygons, many of them 3–4 m² tree pits.
- **Tree species, most common** (Forestry): London planetree 31, pin oak 31, Deodar cedar 27, dawn redwood 24, ginkgo 22, Japanese flowering cherry 19, northern red oak 11, American elm 9, willow oak 9, Japanese pagoda tree 9. 153 OSM trees have no species.
- **Lamps** [?]: OSM has 132 lamp positions but no style tag. My understanding [K] is that the park uses a cast-iron post with a single acorn or "Flushing Meadows"-type globe, distinct from the cobra-heads on the surrounding streets. This needs your eyes or a photo; see Q4.
- **Fences** [K]: low black hoop-topped fences around the lawns and the taller black perimeter fence from the 2014 renovation [S that a taller perimeter fence was added].
- **Benches** [K]: long runs of NYC Parks slatted wooden benches with iron arms along the paths; granite benches around the fountain plaza that reportedly heat to 52 °C in summer sun [S].

### 2.3 Fountain (Tisch Fountain)

- OSM polygon area 427 m², centre (-30, -46), mean radius ~11.7 m [D]. First fountain 1852, replaced 1872; renovated 1934 as a wading pool; named Tisch Fountain 2005; moved to align with the Arch during the 2007–09 work [S].
- Ring of granite/stone steps descending to the rim [K]; central jet plus ring of plumes [S "ornamental water plumes"].
- **Signature details**: 1) on-axis view of the Arch from the far side; 2) the circle of step seating used as an amphitheatre; 3) the outer ring of jets; 4) people sitting on the rim with feet in the water in summer [K].
- **Question**: is the fountain plaza sunken (steps down) or flush with the paths? The OSM retaining walls suggest a step. I've made the retaining walls non-solid for now. See Q2.

### 2.4 Monuments and features

| Feature | Position (map m) | Facts | Tag |
|---|---|---|---|
| Garibaldi statue | (23, -71) | Bronze by Giovanni Turini on a granite pedestal, dedicated 4 June 1888; moved 15 ft east in 1970 | [D] position, [S] |
| Alexander Lyman Holley Monument | (-88, 5) | Bust by John Quincy Adams Ward | [D][S] |
| Hangman's Elm | northwest corner, OSM node 5927576885 | English elm, recorded height 41 m in an earlier survey; OSM says 10 m (likely a tagging error); start date 1679 in OSM; Wikipedia notes the hanging legend is doubtful | [D][S] |
| Margaret Loeb Kempner memorial | (-43, -94) | OSM artwork node, no detail | [D][?] |
| Flagpole | (7, -23) | south of the Arch | [D] |
| Washington Square Park House | 3 Washington Sq N per PLUTO, (-102, -53) | 4.3 m high, built 2013, comfort station | [D] |

### 2.5 Play areas, dog runs, mounds, lawns, chess

| Feature | OSM name | Area m² | Centre | Surface |
|---|---|---|---|---|
| Large playground | Washington Square Park Playground | 854 | (36, -45) | asphalt |
| Toddler playground | (Toddler Playground) | 204 | (-39, 32) | rubber |
| The mounds | (Play Hills) | 359 | (-140, -23) | artificial turf |
| Big dog run | Washington Square Park Dog Run | 742 | (-114, -60) | ground |
| Small dog run | Robin Kovary Run for Small Dogs | 135 | (-37, -115) | not tagged |

All [D]. The two largest lawns are ~3,000 m² north of the fountain (-64, 19) and ~2,100 m² west (-106, -38). The northwest lawn reopened in 2020 after restoration (39,000 sq ft of turf) [S].

**Chess and checkers tables, southwest corner**: not mapped in OSM at all. [K] They sit in the plaza at the park's southwest corner by MacDougal Street and Washington Square South, stone tables with inlaid boards and fixed stools. I need position and count from you or a photo (Q3).

### 2.6 Other public spaces

| Space | What the data gives | Signature details | Tags |
|---|---|---|---|
| **Gould Plaza** (W 4th between Mercer and Washington Sq E/LaGuardia) | Bounded by Stern's Tisch Hall and Kaufman Management Center, and Warren Weaver Hall | Stone slab floor crossed by a walkway of horizontal glass panes; named alumni benches on one side; purple NYU flags on the buildings; buskers [S Wikipedia: Gould Plaza]. The steel sculpture in the plaza [K: a stainless-steel abstract sculpture, artist?] Q6 | [S][K] |
| **LaGuardia Place gardens + statue** | Fiorello La Guardia statue at (-90, -287); 547 LaGuardia Pl, between Bleecker and W 3rd | Bronze by Neil Estern, 1994, mid-stride figure [S]; community garden and the LaGuardia Corner Gardens behind fences [K] | [D][S][K] |
| **Mercer–Houston dog run** | Not separately identified in the Dog Runs dataset query; there are only 3 dog-run polygons in the box | Q7 | [?] |
| **Washington Mews** | Street 147 m long, 6.1 m wide; NYU-owned houses at 58, 60, 62 Washington Mews (2 floors, built 1833) [D] | Belgian-block cobbles [K]; gates at both ends, the Fifth Avenue gate designed by Abraham Bloch, 1988 [S]; stucco-faced former stables, many painted cream and pastel [K]; house plaques for Maison Française, Deutsches Haus, Glucksman Ireland House [K] | [D][S][K] |
| **MacDougal Alley** | 79 m, 4.9 m wide [D] | Private cul-de-sac created 1833 for the stables of Washington Sq N and W 8th St houses [S]; gas lamps [K] | [D][S][K] |
| **Astor Place cube (Alamo)** | (514, -150) [D] | Tony Rosenthal, 1967; black Cor-Ten steel, 8 ft on a side, standing on one corner; rotates on a hidden pivot (locked 2022, returned Aug 2023) [S] | [D][S] |
| **Union Square, south edge** | outside the 14th St boundary except the south sidewalk | Gandhi statue at (488, 479) and the Metronome artwork on One Union Square South at (572, 353) are inside the box [D] | [D] |

---

## 3. Core NYU buildings

Measured data for every building below is in `RESEARCH/data/nyu-buildings-table.md` and the per-footprint list `RESEARCH/data/footprints-named.txt`. Roof heights are NYC photogrammetric `height_roof` (to the main roof, not parapets or bulkheads) [D].

### 3.1 Elmer Holmes Bobst Library, 70 Washington Square South

- **Lot / footprint** [D]: PLUTO lists it as **567 LaGuardia Place, block 535 lot 8** (not "70 WSS"); BIN 1008626; footprint 3,604 m²; roof 47.4 m (156 ft); 12 floors; built 1973.
- **History** [S Wikipedia: Bobst]: Philip Johnson and Richard Foster; built 1967–72, opened 12 Sept 1973; 12 stories, 425,000 sq ft.
- **Materials** [K]: red sandstone cladding on a near-cubic mass; tall bays of deeply recessed glazing behind the stone piers; a dark, deep recessed ground floor and entrance; the full-height interior atrium (about 150 ft) open to the sky-lit roof [K].
- **Atrium floor** [S]: marble in a "stereogram" pattern that reads as three-dimensional from above.
- **Signature details**:
  1. The blocky red stone mass that faces the park across Washington Square South, with double-height study rooms on the north side behind floor-to-ceiling windows [S].
  2. Deeply recessed windows set back behind the stone grid [K].
  3. The patterned black/white/grey marble atrium floor [S].
  4. Open crossways at every level around the atrium, now screened [S]; the 2012 metal screens [K: perforated aluminium, Joel Sanders?] Q8.
  5. Card-swipe turnstiles and the Public Safety desk inside the entrance [K].
  6. The library's name in metal letters over the entrance [K].

### 3.2 Kimmel Center for University Life, 60 Washington Square South, and Skirball Center

- **Lot** [D]: block 538 lot 40, PLUTO address 566 LaGuardia Place; BIN 1008662; footprint 2,102 m²; roof 50.0 m (164 ft); 11 floors per PLUTO; built 2000 per PLUTO (opened 2003 [S]).
- **Architect** [S]: Kevin Roche John Dinkeloo and Associates (Skirball Center). Skirball: 850 seats, completed October 2003, entrance on LaGuardia Place [S].
- **Massing** [K]: red stone to match Bobst on the side streets, a glass curtain wall stepping toward the park on the north face; the Eisner–Lubin Auditorium high up behind the glass [S for the 560-seat auditorium, K for its position].
- **Controversy** [S]: critics said it would ruin the Fifth Avenue view through the Arch and shade the park.
- **Signature details**: 1) the big glass face to the park; 2) the stepped terraces; 3) the Skirball marquee/canopy on LaGuardia [K]; 4) turnstile lobby on Washington Square South [K]; 5) the dining hall and Market Place at Kimmel [D OSM node "The Market Place at Kimmel"].
- **Neighbour on the same block** [D]: *Global Center for Academic and Spiritual Life*, 58 Washington Square South, block 538 lot 7501, 40.4 m, 7 floors, built 2010, with the Islamic Center at NYU and the Catholic Center (Generoso Pope) [D OSM]. Not in your list; NYU-operated, so added.

### 3.3 Silver Center for Arts and Science (Main Building), 100 Washington Square East

- **Lot** [D]: PLUTO **32 Waverly Place, block 547 lot 1**; BIN 1008820; footprint 1,817 m²; roof 49.4 m (162 ft); 10 floors; built 1900 per PLUTO (1894–95 per [K]).
- **Neighbours on the block** [D]: Waverly Building, 24 Waverly Pl (lot 5, 49.7 m, 11 floors, 1906); Brown Building (lot 8). The block runs Waverly Pl to Washington Pl, Washington Sq E to Greene.
- **Materials** [K]: neo-Renaissance, buff brick and limestone over a rusticated base, arched ground-floor openings on Washington Square East; replaced the 1835 Gothic University Building, whose marble was cut by Sing Sing prisoners [S].
- **Signature details**: 1) the long Washington Square East front facing the park; 2) the corner entrances and NYU purple flags; 3) Grey Art Gallery storefront at the corner (moved to 18 Cooper Square as the Grey Art Museum [S, OSM]); 4) the cornice line shared with the Waverly Building [K]. Q9 asks you to confirm the facade colour.

### 3.4 John A. Paulson Center, 181 Mercer Street

- **Lot** [D]: shares **block 524 lot 66 (100 Bleecker Street)** with Silver Towers; BIN 1090263; NYC footprint 7,484 m² with a single roof height of **60.4 m**. PLUTO still shows the old lot 535/20 as vacant. The footprint dataset has not split the two towers, so their true heights are missing.
- **History** [S]: completed 2021 (opened 2022), $1.3 billion, replaced the Coles Sports Center; 23 stories at the towers; sports centre, academic space, faculty apartments and first-year dormitory (Residential College, 400+ first-years) [S NYU].
- **Architect** [K]: Davis Brody Bond with KieranTimberlake. Q10.
- **Signature details** [K]: glass curtain walls with a terracotta-coloured fin/baguette rhythm; a multi-storey glass base showing the gyms and pool; two towers set back from the base. All need verification.

### 3.5 Weinstein Hall, 5–11 University Place

- **Lot** [D]: block 548 lot 4; BIN 1080105; footprint 1,787 m²; roof 31.4 m (103 ft); 9 floors; built 1962.
- [S]: the only pre-1980 NYU residence hall built as one; ~575–600 first-years; East Tower and West Tower; dining (Weinstein Dining, "Sidestein" market) [S NYU, D OSM].
- Architect, facade material and window rhythm: [?]. You live and work in this one; you'll know more than any source I can reach. Q11.

### 3.6 Brown Building, 23–29 Washington Place

- **Lot** [D]: block 547 lot 8 (PLUTO 23 Washington Place); BIN 1008823; footprint 956 m²; roof 43.7 m; 10 floors; individual landmark.
- [S]: built 1900–01, John Woolley, neo-Renaissance, iron and steel frame; site of the 1911 Triangle Shirtwaist Factory fire; National Historic Landmark 1991.
- **Triangle Fire Memorial** [S]: by Richard Joon Yoo and Uri Wegman, opened 2023. A steel ribbon descends from the building and splits into two horizontal ribbons 12 ft above the sidewalk at the corner of Washington Place and Greene Street, with the names and ages of the 146 victims cut through the steel and a reflective panel below. A vertical ribbon added in June 2024 climbs to the ninth floor.
- **How I'll treat it**: modelled faithfully and with respect. It stays out of every joke, billboard and decay gag, and the memorial ages more slowly than its surroundings rather than being shown ruined. If you'd rather it not decay at all, say so (Q12).

### 3.7 Law School: Vanderbilt Hall, Furman Hall, D'Agostino Hall, Wilf Hall

| Building | Lot / BIN | Roof (m) | Floors | Built | Facts |
|---|---|---|---|---|---|
| Vanderbilt Hall, 40 Washington Sq S | 541/1, BIN 1008716 | 24.1 | 5 | 1951 | Whole block between W 3rd, Washington Sq S, MacDougal and Sullivan [S]; Eggers & Higgins [S, Wikipedia University Village notes Eggers & Higgins for the WSS project]. Neo-Georgian red brick with limestone trim around an interior courtyard [K]. |
| Furman Hall, 245 Sullivan / 89 W 3rd | 541/7501, BIN 1086188 | 44.2 | 10 | opened 22 Jan 2004 | Rebuilt elements of two historic buildings on the facade, one of them Edgar Allan Poe's 85 W 3rd house [S]. Architect [K: Kohn Pedersen Fox]. |
| D'Agostino Hall, 110 W 3rd St | OSM puts "Filomen D'Agostino Residence Hall" on lot 540/14, 130 MacDougal, 45.6 m, 14 floors | 45.6 | 14 | | Law residence at the corner of W 3rd and MacDougal [S]. Wikipedia also calls 130 MacDougal the "Alcott Houses"; Q13 |
| Wilf Hall, 139 MacDougal | 543/53 | 26.8 | 6 | 2011 | Morris Adjmi Architects; contains the Provincetown Playhouse [S] |
| Kevorkian Center, 50 WSS / 249 Sullivan | 541/33 | 20.4 | 4 | 1972 | Philip Johnson and Richard Foster [S Campus of NYU] |
| 22 Washington Sq N | 551/11 | 20.5 | 3.5 | | Jean Monnet Center etc. in an 1830s Row house [S] |

### 3.8 Judson Memorial Church, campanile, King Juan Carlos I Center

- **Lots** [D]: church 541/23 (owner Judson Memorial Church), roof 20.5 m, 1893; NYU lot 541/18 at 51 Washington Square South (KJC Center / Heyman Hall), two parts 17.3 m and 21.1 m.
- [S]: sanctuary by Stanford White, 1888–93; campanile by McKim, Mead & White, 1895–96; Judson Hall 1877 by John G. Prague; Italian Renaissance details on an Italianate form, likened to Santa Maria Maggiore; 14 John La Farge stained-glass windows; Saint-Gaudens marble frieze in the baptistery; NYC landmark 1966, National Register 1974.
- **Signature details** [K unless noted]: 1) yellow Roman brick with white terra cotta trim; 2) the tall square campanile with arched loggia at the top; 3) the arched entrance portal on Washington Square South [S that it's inspired by San Alessandro, Lucca]; 4) round-arched windows; 5) terra cotta cornice.
- **Height question**: the campanile is taller than either footprint height (it reads as about 10 stories). The NYC footprint probably merges it. Q14.

### 3.9 Stern School of Business

| Building | Lot / BIN | Roof (m) | Floors | Built | Notes |
|---|---|---|---|---|---|
| Henry Kaufman Management Center, 44 W 4th | 535/1, BIN 1078952 | 50.5 | 11 | 1990 per PLUTO (1992 [K]) | [D] |
| Tisch Hall, 40 W 4th | 535/1, BIN 1077346 | 45.0 | | 1972 [S] | Philip Johnson and Richard Foster, same style as Bobst and Meyer [S] |
| Shimkin Hall / Gould Welcome Center | [?] | | | | I can't place Shimkin and the Gould Welcome Center on a footprint yet. Q15 |

### 3.10 Science and arts blocks

| Building | Address / lot | Roof (m) | Floors | Built | Notes |
|---|---|---|---|---|---|
| Warren Weaver Hall (Courant) | 251 Mercer; PLUTO 17 W 3rd St, 535/36, BIN 1008627 | 49.6 | 13 | 1965–66 [K], PLUTO 1975 | Lecture halls on floors 1–2, Courant library on 12, lounge on 13 [S]. Precast concrete and brick [K]. Natural gas cogeneration plant underneath, 2011 [S] |
| Meyer Hall (Andre and Bella Meyer Hall of Physics) | 4 Washington Pl; OSM puts the name on 713 Broadway, 546/33 | 50.0 | 10 | 1971 | Johnson and Foster, red sandstone [S style, K material] |
| Center for Neural Science, 4 Washington Pl | 546/31 | 44.0 | 11 | 1904 | [D] |
| Waverly Building, 24 Waverly Pl | 547/5 | 49.7 | 11 | 1906 | [D] |
| Goddard Hall, 79 Washington Sq E | 546/1, BIN 1076069 | 25.5 | 7 | 1900 | Former first-year residence hall [S]; now Steinhardt [K] |
| Pless Building, 82 Washington Sq E | 546/5 | 25.9 | 7 | 1900 | Steinhardt [D OSM] |
| Pless Annex, 26 Washington Pl | 546/8 | 26.2 | 7 | 1900 | [D] |
| Academic Resource Center, 18 Washington Pl | 546/10 | 35.4 | 8 | 1910 | [D] |
| Frederick Loewe Theatre / 35 W 4th | 546/11 | 58.2 | 13 | 1930 | Faces Gould Plaza [S] |
| Leslie eLab, 14 Washington Pl | 546/15 | 43.4 | 14 | 1931 | [D] |
| Carter Hall, 10 Washington Pl | 546/20 | 24.8 | 6 | 1900 | [D] |
| 19 W 4th (Politics) | 546/21 | 42.1 | 8 | 1900 | [D] |
| Bonomi Admissions Center, 21–27 W 4th | 546/26 | 24.5 | 6 | 1920 | [D OSM name] |
| Psychology, 707 Broadway | 546/35 | 44.5 | 10 | 1971 | [D] |
| Hebrew Union College, 699 Broadway | 546/40 | 22.9 | 5 | 1979 | NYU-owned lot, non-NYU tenant [D] |
| Kimball Hall, 18 Waverly / 246 Greene | 547/14 | 35.5 | 6 | 1900 | [D] |
| Genomics, 12 Waverly | 547/15 | 45.4 | 8 | | [D] |
| 285 Mercer / 10 Waverly | 547/18 | 37.9 | 10 | 1910 | [D] |
| Public Safety and ID Card Center, 7 Washington Pl | 547/19 | 17.1 | 4 | 1900 | [D OSM name]. The card center matters for Phase 4's lanyard crowds. |
| English, 244 Greene / 21 Washington Pl | 547/25 | 32.2 | 8 | 1900 | [D] |
| Philosophy, 3 Washington Pl | 547/26 | 24.1 | 6 | 1891 | NoHo Historic District [D] |
| Rufus D. Smith Hall, 25 Waverly | 548/21 | 36.0 | 9 | 1900 | [D] |
| Languages and Literature, 13 University Pl | 548/9 | 29.9 | 6 | 1930 | [D] |

### 3.11 Silver Towers and Washington Square Village

- **Silver Towers** [D]: lot 524/66 at 100 Bleecker; Tower I BIN 1087825, 88.7 m; Tower II BIN 1083218, 89.6 m; 30 floors; built 1964–67 [S]; the third tower, 505 LaGuardia Place, is a co-op (524/1, 89.9 m), not NYU. Individual landmark (2008) [S].
- [S]: I.M. Pei & Associates with James Ingo Freed as primary architect; Brutalist board-formed concrete facades with recessed windows; pinwheel arrangement around a courtyard; foundation pads 80 × 113 ft.
- **Bust of Sylvette** [S]: at (-143, -596) [D]; Carl Nesjar after Picasso, 1968; 36 ft high, 20 ft wide, 12.5 in thick; Betograve concrete (sandblasted, basalt aggregate showing through buff cement).
- **Signature details**: 1) the deep concrete window reveals forming a waffle grid [S]; 2) the three-tower pinwheel [S]; 3) Sylvette on the lawn [S]; 4) the low concrete plaza walls and lawn [S "pathways and lawns"]; 5) the windows' asymmetric mullion pattern [K].
- **Washington Square Village** [D]: block 533 lot 1, two long slabs each split into two buildings (BINs 1077833–1077836), 47.7 to 48.6 m, 17 floors, built 1959–60. A 5,347 m² 2.7 m-high podium between them (the garden deck over the garage). Architects S. J. Kessler & Sons with Paul Lester Wiener; garden by Hideo Sasaki [S]. Vertical panels of bold primary-colour glazed brick [S]. "BOB HOVELL STOOD HERE" plaque in the asphalt by Building 2 [S].

### 3.12 Arts, Gallatin, NoHo

| Building | Lot / BIN | Roof (m) | Floors | Built | Notes |
|---|---|---|---|---|---|
| Tisch School of the Arts, 721 Broadway | 547/30, BIN 1088447 | 58.5 | 12 | 1896, altered 1988/2001 | NoHo Historic District [D] |
| Gallatin, 1 Washington Pl (715 Broadway) | 547/30, BIN 1008831 | 56.7 | 12 | | Shares the lot with Tisch [D] |
| Cantor Film Center, 36 E 8th | 548/12 | 8.1 | 3 | 1940 | [D] |
| Puck Building, 295 Lafayette | 510/7502, BIN 1007941 | 44.6 | 10 | 1885–86, annex 1892–93 | Not NYU-owned (condo). NYU Wagner occupies space in it [K]. Albert Wagner, Romanesque Revival / Rundbogenstil; red brick in uniform bays separated by brick piers on granite pedestals; tiers of arcades; gilded Puck statues by Henry Baerer over the Lafayette entrance and at the Houston/Mulberry corner; "PUCK BUILDING" architrave; vaulted iron-and-glass sidewalks [S]. Outside the Houston boundary: it sits just south of Houston at (153, -732). |
| Provincetown Playhouse, 133 MacDougal | inside Wilf Hall | | | refaced 1940; NYU rebuilt behind the facade | Converted stable/bottling plant; the theatre opened here 1918 [S] |
| NYU Health Center, 726 Broadway | 545/15 | 47.6 | 10 | 1919 | [D] |
| School of Global Public Health, 708 Broadway | 545/6 | 41.0 | 10 | 1896 | [D] |
| 400 Lafayette | 545/53 | 23.1 | 6 | 1888 | [D] |
| 383 Lafayette | 531/20 | 17.1 | 4 | 1913 | OSM: NYU Admissions Office [D] |
| 14 E 4th St | 531/7501 | 50.6 | 12 | 1909 | OSM: NYU Shanghai (office); flagged NYU by OSM name only [D] |
| 16 Cooper Square | 544/50 | 29.8 | 7 | 1901 | NYU-owned [D] |
| Grey Art Museum, 18 Cooper Sq | not found in PLUTO by that address | | | | moved here from 100 WSE [S OSM] Q16 |
| 60 Fifth Avenue | 576/46 | 37.7 | 8 | 1924 | Courant CS and Center for Data Science [S] (former Forbes Building) |
| 7 E 12th St | 570/42 | 54.1 | 12 | 1947 | NYU-owned [D] |
| 787 Broadway | 562/30 | 50.6 | 16 | 1929 | NYU-owned [D] |
| Bronfman Center, 7 E 10th St | 568/32 | 17.9 | 5 | 1887 | [D OSM] |
| Barney Building, 28 Stuyvesant St | 465/37 | 27.1 | 6 | 1920 | Steinhardt art [K] |

### 3.13 The Row and the Mews houses

- **The Row, 1–13 Washington Square North** (east of Fifth) [D]: NYU-owned lots 550/1, /4, /5, /6, /13 (1½ Fifth Ave); front houses 17.2–19.6 m tall to the roof, with lower 7–10 m rear extensions; 3½ floors. Greenwich Village Historic District.
  - [S]: Greek Revival town houses of the 1830s; "the Row" presented a unified front of privilege; some at the Fifth Avenue end keep only their facades and are connected inside [S Wikipedia: Waverly Place].
  - [K]: red brick in Flemish bond; white marble stoops with iron railings; Doric or Ionic columned entrance porches; white marble lintels and sills; dormer attic; iron fences at the areaways. Count of houses, stoops and dormers per house needs a street-level pass (Q17).
- **19–26 Washington Square North** (west of Fifth): NYU owns 19, 20 (NYU Abu Dhabi), 21, 22, 27 (7 floors, 1898). 23–26 are private [D].
- **Washington Mews houses** [D]: NYU lots at 58, 60, 62 Washington Mews (1833, 2 floors). OSM names inside lot 550/1 and 550/32: La Maison Française, Deutsches Haus, Africa House, Draper Program; Glucksman Ireland House [?] Q18.
- **Casa Italiana Zerilli-Marimò, 24 W 12th St** [D]: 575/40, 16.6 m, 5 floors, 1852; housed in the General Winfield Scott House [S].
- **Lillian Vernon Creative Writers House, 58 W 10th St** [D]: 573/13, 12.1 m, 3 floors, 1836.

---

## 4. Residence halls in the study area

Current list from NYU Housing [S, read 2026-10-07]. Halls outside the study area (Lafayette Hall, Broome Street, Greenwich Hall, Gramercy Green, Othmer, Clark Street) will appear only as faded signage.

| Hall | Address | Lot | Roof (m) | Floors | Built | Notes |
|---|---|---|---|---|---|---|
| Weinstein Hall | 5–11 University Pl | 548/4 | 31.4 | 9 | 1962 | first-year, ~575 [S] |
| Rubin Hall | 35 Fifth Avenue | 568/1 | 48.5 | 15 | 1925; Passive House retrofit 2023–24 | 600 first-years [S] |
| Brittany Hall | 55 E 10th St at Broadway | [?] not matched in PLUTO | | 17 [S] | pre-war Gothic high-rise [S] | Q19 |
| Founders Hall | 120 E 12th St | 556/48 | 75.3 | 26 | 2006 | 700 first-years; built on the site of St. Ann's Church, whose stone facade and fence stand free in the front courtyard [S]. Perkins Eastman [S]. St. Ann's: 1847 building, facade retained; French Gothic sanctuary by Napoleon LeBrun (1870) demolished 2005 [S]. |
| Lipton Hall | 33 Washington Sq W | 552/24 (PLUTO 35 WSW) | 60.8 | 16 | 1955 per PLUTO | first-year; Lipton Dining Hall; called Hayden Hall until 2016 [S] |
| 37 Washington Sq W | | 552/26 | 64.3 | 16 | 1929 | NYU-owned; is this part of Lipton? Q20 |
| 29 Washington Sq W | | 552/60 | 65.6 | 15 | 1927 | NYU-owned; faculty housing? Q20 |
| Hayden Hall (now) | 240 Mercer St | 532/8 (PLUTO 246 Mercer) | 55.4 | 20 | 1981 | law residence, ~500 [S] |
| Paulson Center | 181 Mercer St | 524/66 | 60.4* | 23 [S] | 2022 | Residential College, 400+ first-years [S]. *see 3.4 |
| University Hall | 110 E 14th St | 559/12 (PLUTO 106 E 14th) | 59.9 | 20 | 1998 | 600 residents; Dunkin' and UHall Commons [S] |
| Palladium Hall | 140 E 14th St | 559/22 (PLUTO 126 E 14th) | 50.6 | 16 | 1999–2001 | ~960 upper-years; dining hall and Palladium Athletic Facility; Wasserman Center on 2 [S]; site of the Academy of Music / Palladium club, demolished 1998 [S] |
| Third North | 75 Third Avenue | 467/1 (two BINs) | 45.9 | 14 | 1988 | three towers [S] |
| Alumni Hall | 33 Third Avenue | 465/1 | 54.3 | 16 | 1986 | singles only [S] |
| Coral Tower | 129 Third Ave at E 14th | 896/1 (PLUTO 125 3rd Ave, owner Coral Crystal LLC) | 48.0 | 16 | 1999 | leased [D] |
| Sixth Street | 6th St and Cooper Sq | 461/6 (35 Cooper Sq) | 40.5 | 13 | 2014–17 | 200 upper-years [S] |
| Seventh Street | 40 E 7th St | 462/18 (38 E 7th) | 16.2 | 3 | 1920 | ~90 residents [S]; east of 3rd Ave, edge of area |
| Second Street | 1 E 2nd St | 457/9 | 39.6 | 12 | 2001 | leased; south of Houston? it is north of Houston at the Bowery [D] |
| Carlyle Court | 25 Union Sq W | 843/22 | 34–38 | 12 | 1986 | three towers [S]; just north of 14th St, outside the boundary; Q21 |
| Senior House at 13th Street | 47 W 13th / 48 W 14th | 577/15 | 35.4 | 9 | 1910 | OSM name [D]; status unclear Q22 |
| Washington Square Village | 1–4 WSV | 533/1 | 48.6 | 17 | 1959–60 | grad and faculty [S] |
| Goddard Hall | 79 WSE | 546/1 | 25.5 | 7 | 1900 | **former** residence hall [S]; no longer on NYU's hall list |
| Alcott Houses / D'Agostino | 130 MacDougal / 110 W 3rd | 540/14 | 45.6 | 14 | | law residence [S] |

---

## 5. NYU-operated buildings I found that weren't on your list

From PLUTO ownership plus OSM names [D]: Global Center for Academic and Spiritual Life (58 WSS); Public Safety and Card Center (7 Washington Pl); NYU Health Center (726 Broadway); School of Global Public Health (708 Broadway); 60 Fifth Avenue; Bronfman Center (7 E 10th); 7 E 12th St; 787 Broadway; 16 Cooper Square; 14 E 4th St; 383 and 400 Lafayette; Barney Building (28 Stuyvesant); 107 Second Avenue; the 509 and 543 LaGuardia Place one-storey NYU structures (5 m high, 1960–61: the commercial strip and the Morton Williams supermarket building [S University Village]); 19, 21 and 27 Washington Sq N; 6–22 E 8th St (NYU houses backing onto the Mews).

## 6. Non-NYU buildings

Every footprint in the study area (4,250 after removing the Arch) is already extruded to its surveyed roof height as Phase 0 massing. In Phase 2 they get the same massing accuracy with simpler facades. Neighbours that define the skylines in your three check views [D]:

- Looking south from the Arch: Bobst (47 m), Kimmel (50 m), Global Center (40 m), Silver Towers and 505 LaGuardia (89–90 m) behind, Paulson (60 m+).
- Looking south down Fifth through the Arch: the same, framed by the Row.
- Looking north from LaGuardia: WSV slabs (48 m), Kimmel and Bobst, the Arch, then One Fifth Avenue [K, 1 Fifth Ave, the Art Deco tower at Fifth and 8th; footprint to check], 2 Fifth Ave, and the Fifth Avenue wall up to 14th St.
- Others worth care: Church of the Ascension (36 Fifth, 1841), First Presbyterian (12 W 12th), Grace Church (788 Broadway), Cooper Union Foundation Building and 51 Astor Place, Wanamaker Annex (770 Broadway), Con Ed Building clock tower on E 14th (77 m), Zero Irving (87 m, 2021), Hilary Gardens (91.8 m) and Georgetown Plaza (99.4 m) east of Mercer, Jefferson Market Library on Sixth Avenue.

## 7. Data problems found so far

1. **Paulson Center** has one footprint and one height (60.4 m) for the whole block; the towers need their own heights (Q10).
2. **Arch height**: 20.4 m photogrammetric vs 23.5 m published. Using the published value.
3. **Brittany Hall, Grey Art Museum, Kevorkian (50 WSS), Bobst (70 WSS)** don't match their common addresses in PLUTO; Bobst is filed as 567 LaGuardia Pl. Brittany is still unmatched.
4. **Hangman's Elm** height in OSM (10 m) is far below the published 41 m; I'm using a 24 m-tall, 9 m-crown landmark tree until you tell me what it looks like now.
5. **Merged footprints**: Judson church + campanile, Silver Center block, and some Row houses carry one roof height for several masses.
6. **Chess tables, lamp style, bench layout and gate positions** are missing or untagged in OSM.

---

## 8. Questions for you

These are ordered by how much they change the build.

1. **Q1. "The angle where Washington Square East becomes University Place."** In NYC's centerline data the two are almost exactly collinear (within 1°) and meet at Waverly Place. What angle do you mean: a jog in the curb line, the way the street narrows (7.3 m to 11.6 m), or something else?
2. **Q2.** Is the fountain plaza sunken with steps down to the rim, or level with the paths? And do people sit on steps all the way round?
3. **Q3.** Chess tables: how many, and exactly where in the southwest corner? Are they stone with inlaid boards?
4. **Q4.** Park lamp posts: what do they look like (globe, acorn, bishop's crook, colour)? Same style everywhere in the park?
5. **Q5.** Purple banners and flags: which buildings carry them, on what (flagpoles over doors, vertical pole banners on lamp posts, or both), and roughly how many? Are there torch-logo banners on the park lamps?
6. **Q6.** Gould Plaza: what is the sculpture, and where exactly are the glass pavers?
7. **Q7.** The Mercer–Houston dog run: is it at the corner of Mercer and Houston inside the Coles/Paulson block?
8. **Q8.** Bobst atrium: what are the screens now (metal panels? glass?), and is the main entrance on LaGuardia Place or Washington Square South?
9. **Q9.** Silver Center facade colour and material from the park side.
10. **Q10.** Paulson Center: tower heights, cladding colour, and which side the main entrance is on.
11. **Q11.** Weinstein: facade material and colour, window type, how the two towers read from University Place, where the entrance and the card readers are, and where people stand outside.
12. **Q12.** Brown Building and the Triangle memorial: I plan to keep it intact and dignified while everything around it decays. OK, or should it be left untouched entirely?
13. **Q13.** Is D'Agostino Hall at 110 W 3rd the same building as 130 MacDougal / "Alcott Houses", or two buildings?
14. **Q14.** Judson's campanile: roughly how many storeys does it look from the park?
15. **Q15.** Where are Shimkin Hall and the Gould Welcome Center on W 4th?
16. **Q16.** Is the Grey Art Museum at 18 Cooper Square open and NYU-branded on the outside?
17. **Q17.** The Row: how many stoops can you count from Fifth to University, and which houses have columned porches?
18. **Q18.** Washington Mews: which house is Glucksman Ireland House, and are the cobbles still there (OSM says sand surface)?
19. **Q19.** Brittany Hall: exact corner and height as you see it.
20. **Q20.** Are 29 and 37 Washington Square West part of Lipton, faculty housing, or something else?
21. **Q21.** Carlyle Court is just north of 14th Street. Include it as a model or leave it as signage?
22. **Q22.** Is "Senior House at 13th Street" still an NYU hall?
23. **Q23.** NYU security kiosks: which corners have Public Safety booths today?
24. **Q24.** Sidewalk sheds: which buildings near the park have had scaffolding for as long as you remember?

## 9. Per-landmark checklists

`RESEARCH/checklists/` will hold one file per landmark (Arch, Fountain, Bobst, Kimmel, Silver Center, Paulson, Weinstein, Brown, Judson, Silver Towers, the Row) with the signature details above as unchecked boxes. I'll create them once your corrections are in, so they start from the corrected list.
