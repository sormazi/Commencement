# Street name signs

Built by `dist/campus/streetsigns.js` from the street graph: one assembly per intersection where two named streets meet (290 in the study area), two boards crossed, one parallel to each street, lettered on both faces with a white border. Each board is a decal in the signage manifest (kind `street`, 162 distinct name and colour pairs, PNGs `dist/assets/signage/street-*.png`).

Rules used until each corner is checked on Street View:

- Colour: brown when the nearest building is in a city historic district (Greenwich Village, South Village, NoHo, SoHo-Cast Iron and the others in the building data), otherwise green. 173 brown, 117 green.
- Corner: the corner with a lamp post within 4 m (signs mounted on the lamp, 26 assemblies), otherwise the first corner, on a plain galvanised pole. Never the corner by the Brown Building.
- Lettering: the city's short form from the street data (W 4 St, 6 Av, Washington Sq N).
- Not yet: block number ranges, honorary co-name signs, and which corners really carry the signs. These come with the Street View survey, block by block alongside the storefronts.
- 2126: faded toward grey and spotted with rust; about one board in four bent, one in seven hanging by one bracket, one in eight gone.

## Sampled checks (10 Oct 2026)

Avi chose to sample corners along the historic-district boundaries rather than check all 290. Checked corners are listed in `SIGNS_CHECKED` in `dist/campus/streetsigns.js` and override the rule.

- Broadway & E 8 St (north edge of the NoHo Historic District): green, not brown (Street View, Apr 2026, E 8 St blade on the signal mast arm). Changed to green. This suggests the district rule over-counts brown at district edges.
- Every other corner is unchecked and still follows the rule above.
