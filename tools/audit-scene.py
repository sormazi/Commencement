"""Pole audit of the built scene (Avi, 15 Oct 2026): loads the game headless with ?audit=poles, walks every mesh and
instance, and fails if any upright object (pole, post, sign, hydrant, bollard, rack, trunk ...) stands in the roadway.
Usage: serve dist (npm start), then: python3 tools/audit-scene.py [base-url]   (needs Python Playwright)
"""
import sys, json, asyncio
from playwright.async_api import async_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:4173/'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 640, 'height': 400}); pg.set_default_timeout(600000)
        await pg.route('**fonts.googleapis.com**', lambda r: r.abort())
        await pg.goto(BASE + '?audit=poles&time=12:00', wait_until='load')
        while json.loads(await pg.evaluate("JSON.stringify(window.Commencement.getState().opening)")) != 'prompt': await pg.wait_for_timeout(1000)
        await pg.mouse.click(320, 200); await pg.wait_for_timeout(5000)
        r = await pg.evaluate("window.__auditPoles()")
        await b.close()
    print(json.dumps(r, indent=1))
    n = sum(o['count'] for o in r['objects'])
    print(f"checked {r['checked']} upright objects; {n} in the roadway")
    sys.exit(1 if n else 0)
asyncio.run(main())
