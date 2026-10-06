# Environmental transformation pipeline

`dist/environment.js` transforms an existing LocationWorld after streets and landmarks have been built. It uses seeded, location-specific profiles for aging, moisture, vegetation density and environmental story cues. The source architecture and street positions remain the base layer.

## Surface aging

`weatherMaterial` clones a PBR material and injects object-relative metric noise masks into the standard lighting shader. Masks blend grime, water streaks, crack lines and ground-level moss into base color and roughness. They remain attached to surfaces when the camera-relative world recycles; no per-frame random texture changes are used. Architecture receives less emissive light, physical ledges, shuttered shops and facade-attached ivy. Window textures include broken glass silhouettes. Display panels have aged steel frames and supports, muted color and limited residual illumination.

## Reclamation

Instanced tapered grasses grow along curb and pavement seams. A vertex shader applies wind bending; per-instance colors vary the vegetation. Ivy is anchored to existing facade planes. Transparent moss decals and shallow reflective puddles concentrate near road edges. The central racing corridor stays clear. Density comes from the location profile, not a uniform global plant scatter.

## Story and lighting

Subtle barriers, weathered shelving, boxes and shelter tarps vary by location. These complement the existing wrecks, boards, facade collapse, debris and original city features. Natural lighting now pairs a cool sky fill with warm directional light and a less green fog palette. Road markings are faded; asphalt contains branching fractures. Fog strength still varies by atmosphere preset.

## Limits

This remains an original procedural browser prototype. It is not AAA photorealism or a one-to-one reconstruction. There is no active Street View provider, photogrammetry, surveyed city topology, high-resolution scanned material library, lightmap/global-illumination bake or full vegetation LOD pipeline. The surface shader modifies color and roughness; its crack masks do not displace geometry or replace a detailed normal-map asset set. Puddles use environment reflections. Added story props are scenic rather than additional physics obstacles.

Realistic asset production, accurate geographic base scenes, geometry/detail passes, optimized vegetation assets, render profiling and wider GPU testing are still required to reach the requested quality. No proprietary locations, artwork or assets from The Last of Us are included.
