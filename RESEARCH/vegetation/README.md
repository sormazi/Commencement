# Vegetation survey (from 13 Oct 2026)

Avi's brief: every street tree from the NYC Street Tree Census and NYC Parks forestry data, at its position, with its species and a size from its trunk diameter; each species modelled distinctly and no two trees alike; a full survey of Washington Square Park (every tree, hedge, shrub bed, lawn and planting, the Hangman's Elm); 2026 exactly as it is, with extra growth only in the 2126 layer; shrubs, hedges, tree pits, planters and window boxes where they really are.

## Sources

| What | Source | Licence |
| :--- | :--- | :--- |
| Street and park trees: position, species, trunk diameter (DBH, inches), structure, condition | NYC Parks Forestry Tree Points `hn5i-inap` (in `nightview-nyc-planimetrics.json`, fetched 7 Oct 2026) | NYC Open Data Terms of Use |
| Park trees not in the forestry data, the Hangman's Elm, hedges, shrubberies, flower beds, gardens, lawns | OpenStreetMap (ODbL 1.0) | ODbL 1.0 |
| Checking | Street View and NYS ITS orthoimagery, look-only | reference only |

## Done

- **(a) Cleanup** (13 Oct). Forestry points inside a building footprint are data errors and are dropped, the Arch's among them: a 1 in "Unknown" record sat under the Arch, where there is no tree. Trees the forestry inventory marks as dead are taken as removed. 4,991 trees became 4,910. Only trees with structure "Full" were ever used (retired sites, stumps and shafts are not trees).

## Next

Species models (shape, branching, leaf colour and season for each species; size from DBH; per-tree variation), then the park survey (hedges, shrub beds, plantings, tree pits), then planters and window boxes from Street View.
