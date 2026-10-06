# NightView validation

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
