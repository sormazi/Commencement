# NightView validation

## The Campus Safety car (8 Oct 2026)

- The utility van was replaced by NYU Campus Safety unit 4, an electric crossover with the livery from Avi's reference photos, as separate decals. `npm test` passes, including a new livery test (every part has its own PNG, a size, a source note and placements; plain lettering only).
- Rendered from the front, side, rear and the driver's seat in 2026 and 2126; checked for the livery, fading and peeling, rust, moss in the seals, the cracked windshield, the dimmer left headlamp and the map on the seat. Draw calls at the start position in daylight went from about 880 to 780 once the car's meshes were merged by material.
- The faint green patch seen beside the van's front wheel did not appear under the new car by day or at night.

## Step 10 Part 1: one place, one van (8 Oct 2026)

- Times Square, SoHo, Shibuya, the old cars, the archival advertising, traffic and the corridor effects removed from the game, code, assets and tests. Washington Square is the only location; the Options menu has no location or vehicle choice.
- `npm test` passes: physics (rewritten for the van), campus, landmarks, atmosphere, sky, tier 2, tier 3 and park suites.
- The van rendered in the browser from the front, side, rear and inside the cab, in 2026 and 2126; screenshots checked for paint, rust, dents, moss, the cracked windshield, the dimmer left headlamp and the map on the passenger seat. Software renderer, so performance is counted in draw calls and triangles only.

The sections below are the earlier record. They describe the corridor locations and systems that Step 10 removed and are kept as history.

- Physics suite passed: vehicle differences, braking/reverse, drifting, boost limits and manual gears.
- Location module syntax check passed.
- Browser rendered Times Square, SoHo and Shibuya at localhost:4173; each was selected through Options → Location → Apply.
- Separate location widths, building profiles and landmarks rendered; screenshots saved alongside source archive.
- Browser console reported no errors after all three scene switches.
- Startup mark and automatic fade remain in place; selection panels are accessed through Options.
- Google provider scripts, API configuration and integration-only tests were removed from the delivered game.
- Reference credits and scene accuracy notes are included in credits.html.
- Geometry is approximate; routes repeat as driving corridors and side streets are scenic. No surveyed accuracy or AAA fidelity is claimed.
- Local preview verified. External publishing has not been completed.

## Dystopian mechanics update

- Existing physics tests passed after the steering upgrade.
- New tests passed for clutch revving without movement, stationary burnout, persistent damage, crash recovery, grip recovery and continuous traffic positions through stop/start transitions.
- All three location builders passed CPU construction, wreck collider alignment and scene wrapping tests.
- Browser verified overgrown Times Square and SoHo, updated atmosphere/sound/control options and additional damage HUD. Final Times Square leaf geometry and daylight shadows rendered; console errors were empty.
- Final Shibuya visual pass was not completed after the foliage refinement; its CPU builder/collider checks passed.
- Audio sources are synthesized, not recorded car audio. Audio perceptual quality was not independently assessed.
- No Unreal build was created or tested; Unreal is absent from the checked installation locations. One-to-one geographic accuracy remains unimplemented.

## Collapse and motion effects

- All three CPU world checks now simulate driving and assert that facade panels detach, cavities appear, chunks stay finite and stationary play does not trigger further collapse. Passed.
- Browser rendered the updated dense fog and postprocessing shader without console errors. Saved nightview-fog.jpg.
- Falling debris is cosmetic. Screen-space blur is speed driven and disabled when paused; its perceptual appearance at full speed was not separately captured.

## Force-based vehicle solver

- New physics regression suite passed: force/grip limits, braking/reverse, drift, differentiated configurations, exact 30/60/144 Hz authoritative-state equivalence, deterministic tick replay, frame-stall protection, passive impact energy, off-centre angular impulses, interpolation and a 200-second aggressive replay.
- Additional tests passed: engine revs without propulsion, persistent collision damage, zero-grip acceleration prevention, airborne unloaded tires, rearward load transfer, manual first-gear behavior and invalid configuration/time rejection.
- World/destruction suite passed alongside the vehicle replacement.
- Live browser loaded the updated solver and renderer without console errors; driving HUD showed 34 MPH and the scene rendered traffic contacts, wheel/body movement and facade debris. Screenshot saved as nightview-physics.jpg. This is an integration observation, not controlled handling validation.
- No Unreal/Chaos implementation is claimed. Detailed solver assumptions and remaining physical limits are documented in PHYSICS.md.

## Environmental transformation

- Physics, traffic/damage and three-world construction/destruction tests passed with the new pipeline.
- Browser rendered Times Square with material shader masks, ledges, grass, faded markings and revised daylight palette; console errors were empty.
- Shader masks and dense instancing were checked in the local WebGL browser. Broad GPU performance testing and photographic fidelity validation remain incomplete.

## Environmental advertising (2026-10-06)

All four Node suites passed, including asset-file hashes, geographic eligibility, Japanese-language preservation, fallback, deterministic surface policy and the sustained-power budget. World construction checks now cover advertising surface IDs, global disabling and selected-surface weather/illumination overrides. Browser verification: atlas artwork loaded, shaders compiled without reported warnings/errors, and the real-brand switch changed Coca-Cola to the original unbranded fallback and back. Performance has not been profiled across devices.
