# Environmental advertising

The procedural world now registers authored display meshes, storefront recesses, poster stands, construction panels and bus-shelter panels. `AdvertisingSystem` discovers surfaces through `userData.adSurface`, preserves the original procedural texture for inspection, selects eligible local artwork and renders it on world-space geometry. No Google APIs, panorama extraction, image detection, remote ad requests or tracking are involved.

## Content policy

Three bundled historical works provide the initial real-brand pool: Coca-Cola (c. 1900), Eastman Kodak (1909, published in New York) and Mitsukoshi (1911, original Japanese typography). Their source records document public-domain artwork. Sources, creators, dates, geography, copyright usage basis, modifications and file hashes are recorded in [`dist/assets/ads/manifest.json`](dist/assets/ads/manifest.json). Trademark ownership remains with the relevant companies; none sponsors, endorses or is affiliated with NightView. Public-domain status of US works is jurisdiction-specific; this manifest is not a worldwide clearance guarantee.

These are recognizable archival reproductions, not invented official campaigns. They are fictional archival set dressing, **not claims that these campaigns were installed at the modeled streets or twenty years before collapse**. The pool is deliberately small until more suitable assets are cleared. New York favors beverage and photography artwork; SoHo favors photography/arts retail; Tokyo uses Japanese department-store artwork. Local original, unbranded culture posters fill gaps, failed loads and the globally disabled layer. The game has no underlying Street View advertisements to preserve.

## Rendering

One per-world 2048×2048 atlas contains cached artwork and local fallbacks. Images are bundled locally, downscaled to at most 1024px and fitted without changing campaign text. Billboard shaders letterbox portrait content to preserve its aspect ratio on wide displays. Cached PBR materials share a single weathering shader program with quantized exposure and aspect variants. Mipmapping, anisotropic filtering and a 300m panel cutoff control distant detail; LOD is distance-based detail/culling, not a separate geometry-streaming system.

Surface age depends on exposure, shelter and district moisture. Ink fades, stains, ripped patches, cracks and dark panel failures are generated in surface UV space. Ivy geometry overlaps a subset of panels. Physical panels receive scene lighting, shadows and fog. Digital states include dark, shattered, unlit retained frames, fragmented output and intermittent flicker. At most one default display per district uses sustained power, with a visible solar panel, cable and battery cabinet. A small number of intermittent displays have their own visible solar/battery cabinets; unpowered frozen and corrupted surfaces emit no light. Nearby lights are distance-capped; developer overrides can exceed this default policy. This is fictional power infrastructure, not an engineering claim that original screens survive indefinitely.

## Inspection

Open **Options → Driving → Advertising inspector**. Select a surface to inspect the preserved original, enhanced content preview, company, source, usage status, geographic rationale, weathering, illumination and LOD. The preview approximates content treatment; the scene adds lighting, shader cracks and ivy occlusion. Weathering and illumination overrides apply to the selected surface for the current world instance. The real-brand switch persists locally and applies across location changes; turning it off replaces all brand content with original unbranded art.

To add a cleared asset, bundle the image, extend `ad-catalog.js`, document creator/source/usage and a SHA-256 in the manifest, then extend the geography policy and run tests. Do not treat a photo's Creative Commons license as automatically licensing the advertisement depicted inside it. Do not generate new slogans or campaign layouts for real brands.
