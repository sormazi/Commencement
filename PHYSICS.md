# NightView vehicle dynamics

NightView has one vehicle, the NYU Facilities electric utility van (fleet 07), defined as `VEHICLE` in `dist/physics.js` and driven by a force-based solver. `dist/physics.js` has no DOM, Three.js, Google Maps, panorama, timer or rendering dependencies. Units are metres, seconds, kilograms, radians, newtons and newton metres. World +Z is forward, +X right and +Y up. Positive yaw turns right.

## Simulation and rendering

`FixedVehicleLoop.advance(elapsed, input, afterStep)` accumulates wall-clock time and runs `simulate` at 1/120 second. At most 12 steps run per frame; elapsed time above 100 ms is discarded and recorded in `droppedTime`. This deliberately slows simulation during severe stalls instead of spiralling into unbounded catch-up. `previous` and `state` are independent snapshots. The return value interpolates position, velocity, orientation, wheel angles and suspension compression. The renderer never advances authoritative vehicle state.

Determinism means identical configuration, initial state, surface/contact data and per-tick input sequences produce identical state in the same JavaScript runtime. This is not a promise of cross-engine bit-identical floating-point results. For event-timed replay, supply input by physics tick; browser keyboard events are sampled at the next simulation tick. The render-rate test uses identical held inputs at 30, 60 and 144 Hz and verifies exact authoritative-state equality after 1,200 steps.

The game resolves contacts with the campus collision grid (buildings, fences, the Arch piers, the fountain rim, trees and monuments; `dist/campus/collision.js`) inside the fixed-step callback. The van is three circles of 0.7 m radius along its axis. There is no traffic. The game has no Google integration.

## Vehicle model

- Planar rigid-body translation and yaw use accumulated tire forces, drag, rolling resistance, mass and yaw inertia. Body heave, small-angle pitch and roll use gravity, four spring-damper supports, their lever arms, inertial excitation and stabilising spring/damping terms.
- Axle distances are derived from wheelbase and front static weight fraction. CG height drives longitudinal and lateral load transfer. Mass, CG height, axle distribution, wheelbase, track and inertias are configurable.
- Each wheel stores spin speed/angle, steering angle, compression, compression velocity, suspension load, tire normal load, longitudinal slip ratio, lateral slip angle and tire forces.
- Longitudinal contact uses an implicit wheel/tire stiffness solve coupled to wheel inertia. Drive torque, brake torque and tire reaction torque determine spin. Brake locking prevents angular zero-crossing, rather than reversing a stopped wheel.
- Lateral tire force derives from slip angle and corner stiffness. A combined friction circle limits longitudinal and lateral force to normal load times surface grip and tire friction. Handbraking reduces rear grip; traction control reduces drive torque when wheelspin grows.
- Drive is electric (`electric: true`): a single fixed reduction (one forward gear and reverse, final drive 8.5) to the rear wheels, with motor torque tapering to zero over the last 1.2 m/s below the governed top speed (6.7 m/s forward, 2.5 m/s reverse). There is no clutch, no idle, no shifting, no boost and no burnout; the solver ignores those inputs for an electric vehicle. Damage trims motor torque by up to a quarter.
- Speed-sensitive steering limits wheel angle. A capped yaw-assist torque provides stability. It does not assign orientation or velocity.
- Contacts apply normal and bounded friction impulses using mass, yaw inertia and contact lever arms. They correct penetration, generate angular response and persistent damage. Obstacles are static.

## State and APIs

`initial(config)` creates explicit `position`, `velocity`, `acceleration`, `orientation`, `angularVelocity`, `angularAcceleration`, `localVelocity`, `wheels`, steering, control inputs, motor speed, gear, and damage. Existing HUD aliases (`speed`, `lateral`, `roadPosition`, `rpm`, `gear`) are derived from this state.

`simulate(state, input, config, dt, surface)` accepts analog throttle/brake/handbrake in [0,1], steering in [-1,1], and a reverse request. The optional surface callback receives world X/Z and returns `{height, grip}`. Normal use must keep dt at 1/120 second; steps above 20 ms are rejected.

`resolveContact(state, config, contact)` accepts a horizontal normal, body-local contact point, penetration, obstacle velocity and restitution. `interpolate` creates a visual state without changing either authoritative snapshot. `inputFromKeys` maps browser controls into inputs.

## Scope and remaining limits

This is an arcade solver, not a validated general-purpose six-degree-of-freedom vehicle simulator. Pitch/roll assume small angles; there are no rollovers, banked contact normals, wheel unsprung-mass bodies, suspension linkage geometry, tire temperature, calibrated Pacejka coefficients or deformable collision meshes. Road contacts and obstacles use simplified horizontal geometry. Catch-up discards time during stalls. Production handling still needs broad device testing, playtesting, track-specific tuning and measured performance profiling.

## The van's tuning

The van is meant for crawling and looking, not racing. Mass 780 kg, wheelbase 1.95 m, track 1.2 m, CG 0.66 m high, wheel radius 0.27 m, soft springs (21 kN/m) with travel of 0.15 m, peak motor torque 36 N·m, brakes 650 N·m. In the solver it accelerates at about 1 m/s², settles at about 6.5 m/s (23 km/h) forward and 2.1 m/s in reverse, and rolls about 0.08 rad in a full-lock turn at speed. Roll and pitch stiffness scale with mass, and the stability assist is clamped. The old arcade cars, gearbox and boost were removed in Step 10 and remain in git history and on the main branch.

## Validation

`tests/physics.test.js` covers the van: gentle acceleration and the governed top speed, no effect from boost, clutch or shift inputs, slow braking and reverse, soft but stable body roll, deterministic replay and render-rate equivalence, passive-wall energy and off-centre impulses, and a long mixed replay that stays finite. `tests/campus.test.js` drives it through the campus collision world. These tests establish regression coverage, not production certification.
