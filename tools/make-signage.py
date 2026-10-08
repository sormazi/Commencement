# Renders every decal in dist/assets/signage/manifest.js (and the car livery in livery.js) to its PNG, using the same drawing code the game
# uses as a fallback (dist/campus/signage.js), so the files and the in-game fallback always match.
# Usage: serve dist on port 4173 (npm start), then: python3 tools/make-signage.py [id ...]
# Existing PNGs are left alone unless their id is named, so your own images are never overwritten.
import sys, os, base64, asyncio
from playwright.async_api import async_playwright
ROOT=os.path.join(os.path.dirname(__file__),'..','dist')
JS="""async (only)=>{const m=await import('/campus/signage.js');const out=[];for(const s of m.SIGNAGE){const [w,h]=m.decalPixels(s.size);const c=document.createElement('canvas');c.width=w;c.height=h;m.drawDecal(c.getContext('2d'),s,w,h);out.push([s.id,s.file,c.toDataURL('image/png')]);}
 const v=await import('/assets/signage/livery.js');for(const s of v.LIVERY){const [w,h]=v.liveryPixels(s.size);const c=document.createElement('canvas');c.width=w;c.height=h;s.draw(c.getContext('2d'),w,h,s);out.push([s.id,s.file,c.toDataURL('image/png')]);}return out;}"""
async def main():
    only=set(sys.argv[1:])
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page();await pg.goto('http://localhost:4173/index.html')
        for id_,f,url in await pg.evaluate(JS,list(only)):
            path=os.path.join(ROOT,f)
            if os.path.exists(path) and id_ not in only: continue
            os.makedirs(os.path.dirname(path),exist_ok=True);open(path,'wb').write(base64.b64decode(url.split(',',1)[1]));print('wrote',f)
        await b.close()
asyncio.run(main())
