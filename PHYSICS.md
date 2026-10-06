# NightView vehicle dynamics

The live game now uses a force-based vehicle solver instead of key-driven speed and lateral movement. `dist/physics.js` has no DOM, Three.js, Google Maps, panorama, timer or rendering dependencies. Units are metres, seconds, kilograms, radians, newtons and newton metres. World +Z is forward, +X right and +Y up. Positive yaw turns right.

## Simulation and rendering

`FixedVehicleLoop.advance(elapsed, input, afterStep)` accumulates wall-clock time and runs `simulate` at 1/120 second. At most 12 steps run per frame; elapsed time above 100 ms is discarded and recorded in `droppedTime`. This deliberately slows simulation during severe stalls instead of spiralling into unbounded catch-up. `previous` and `state` are independent snapshots. The return value interpolates position, velocity, orientation, wheel angles and suspension compression. The renderer never advances authoritative vehicle state.

Determinism means identical configuration, initial state, surface/contact data and per-tick input sequences produce identical state in the same JavaScript runtime. This is not a promise of cross-engine bit-identical floating-point results. For event-timed replay, supply input by physics tick; browser keyboard events are sampled at the next simulation tick. The render-rate test uses identical held inputs at 30, 60 and 144 Hz and verifies exact authoritative-state equality after 1,200 steps.

The game resolves traffic, wreck and road-edge contacts inside the fixed-step callback. Traffic poses use the simulation clock. Wreck collision locations come from location metadata, not renderer meshes. Panorama transitions or replacing the visual provider do not modify position or velocity. The current game has no Google integration.

## Vehicle model

- Planar rigid-body translation and yaw use accumulated tire forces, drag, rolling resistance, mass and yaw inertia. Body heave, small-angle pitch and roll use gravity, four spring-damper supports, their lever arms, inertial excitation and stabilising spring/damping terms.
- Axle distances are derived from wheelbase and front static weight fraction. CG height drives longitudinal and lateral load transfer. Mass, CG height, axle distribution, wheelbase, track and inertias are configurable.
- Each wheel stores spin speed/angle, steering angle, compression, compression velocity, suspension load, tire normal load, longitudinal slip ratio, lateral slip angle and tire forces.
- Longitudinal contact uses an implicit wheel/tire stiffness solve coupled to wheel inertia. Drive torque, brake torque and tire reaction torque determine spin. Brake locking prevents angular zero-crossing, rather than reversing a stopped wheel.
- Lateral tire force derives from slip angle and corner stiffness. A combined friction circle limits longitudinal and lateral force to normal load times surface grip and tire friction. Handbraking reduces rear grip; traction control reduces drive torque when wheelspin grows.
- Engine flywheel inertia, a torque curve, idle governor, limiter, clutch torque, shift interruption, six forward ratios, reverse ratio, final drive and configurable front/rear torque split deliver wheel torque. There is no speed clamp standing in for gearing. Clutch revving disconnects propulsion. Power braking uses rear torque bias and front brake locking for a rolling burnout.
- Speed-sensitive steering limits wheel angle. A capped yaw-assist torque provides arcade stability. It does not assign orientation or velocity. Boost modifies engine torque, so available tire grip still limits acceleration.
- Contacts apply normal and bounded friction impulses using mass, yaw inertia and contact lever arms. They correct penetration, generate angular response and persistent damage. Traffic is a kinematic obstacle; its velocity affects relative impact speed, but it does not receive a reciprocal impulse.

## State and APIs

`initial(config)` creates explicit `position`, `velocity`, `acceleration`, `orientation`, `angularVelocity`, `angularAcceleration`, `localVelocity`, `wheels`, steering, control inputs, engine speed/RPM, gear, shift timer, boost and damage. Existing HUD aliases (`speed`, `lateral`, `roadPosition`, `rpm`, `gear`) are derived from this state.

`simulate(state, input, config, dt, surface)` accepts analog throttle/brake/handbrake in [0,1], steering in [-1,1], clutch/boost flags, manual mode and a shift direction. The optional surface callback receives world X/Z and returns `{height, grip}`. Normal use must keep dt at 1/120 second; steps above 20 ms are rejected.

`resolveContact(state, config, contact)` accepts a horizontal normal, body-local contact point, penetration, obstacle velocity and restitution. `interpolate` creates a visual state without changing either authoritative snapshot. `inputFromKeys` maps browser controls into inputs.

## Scope and remaining limits

This is an arcade solver, not a validated general-purpose six-degree-of-freedom vehicle simulator. Pitch/roll assume small angles; there are no rollovers, banked contact normals, wheel unsprung-mass bodies, suspension linkage geometry, tire temperature, calibrated Pacejka coefficients or deformable collision meshes. Road contacts and obstacles use simplified horizontal geometry. Catch-up discards time during stalls. Production handling still needs broad device testing, playtesting, track-specific tuning and measured performance profiling.

## Validation

Automated tests cover differentiated vehicles, braking/reverse, drift, friction bounds, deterministic replay, render-rate equivalence, frame-stall limits, interpolation, passive-wall energy, clutch revs, damage persistence, no traction on a zero-grip surface, unloaded airborne tires, rearward acceleration load transfer, first-gear speed limits, configuration validation and a 200-second aggressive replay. World builder/destruction tests also pass. These tests establish regression coverage, not premium-game production certification.
