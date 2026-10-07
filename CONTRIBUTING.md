# Working on NightView

Serve `dist` using Python 3, and use Node.js 22 or newer to run `npm test`. No npm install is needed.

Keep vehicle simulation independent of rendering. Physics uses SI units and fixed 1/120-second steps; add tests for meaningful dynamics changes and preserve deterministic tick-input replay. New location artwork must have documented sources and licensing. Keep promotional text out of the driving interface; place selectors in Options.

Use focused branches and commits. Check browser rendering, controls, pause/reset and the relevant Options settings after gameplay changes. Record actual validation and remaining limits without claiming untested geographic or physics fidelity. Update PHYSICS.md when solver assumptions or APIs change.

License terms are in LICENSE.md. Public visibility alone does not grant unrestricted reuse rights.
