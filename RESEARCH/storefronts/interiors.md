# Shop interiors and night lighting (10 Oct 2026)

What you see through every shop window in 2026, how it lights at night, and how it dies in 2126.

## How it works
- `dist/campus/interiors.js` draws each shopfront's glass as a pane with an interior-mapped room behind it: the shader traces the view ray into a box (back wall, side walls, floor, ceiling with light panels) and adds the things the kind of shop has. No extra geometry; all panes in a tile are one draw call.
- Kinds: shop, bar, cafe or restaurant, deli, apparel, music venue, grocery, pharmacy, bank, other. Each has its own furniture: shelves of goods, a bar back with bottles, a counter and tables, a menu board, deli fridges, clothes racks, grocery aisles.
- `dist/campus/storefronts/insides.js` gives every storefront record its kind, wall, floor, light and accent colours, and depth where it differs (grocery 14 m, pharmacy 10 m, default 5.5 m). Colours follow what Street View shows through the windows; where the inside is not visible, the kind's default is used and the entry says so.
- Day: rooms are dimmer than the street, with a pale sky reflection at grazing angles. Night (2026): rooms light up with their light colour, ceiling panels glow, and shop and subway signs glow (lit atlas pages, `lit:true` on the decal). 2126: rooms go dark and dusty, signs go out, about half the panes are broken through to the dark room and the rest are grimed.

## Logo slots
Every shop with a sign has an empty, transparent logo decal at the left end of its sign band: `dist/assets/signage/logo-<id>.png`, kind `logo` in the manifest. The game draws no logos or logo-like art. Drop a logo file in under that name (same size and aspect as the placeholder) and it shows on the shopfront, lit at night like the sign.

## Wall alignment
The rendered building walls come from the NYC 3D Building Model, which in places stands 0.5 to 0.8 m proud of the tax-lot footprint the frontage is measured on. `wallSetOut()` in `dist/campus/storefronts.js` casts rays from the frontage to the nearest 3D-model wall and moves each shopfront onto it. A record can set `setOut` to override.

## Still to do
- Wegmans at 770 Broadway with a deep grocery interior (Astor Place pass).
- Step 10 enterable interiors replace these rooms building by building, from Avi's photos; the pane system stays for everything not yet enterable.
