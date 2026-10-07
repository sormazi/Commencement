# Streams an NYC 3D Building Model CityGML file (DA_WISE, EPSG:2263, feet) and keeps the buildings
# that touch the campus study box. Output: JSON with, per building, BIN and its Ground/Wall/Roof
# polygons as flat [x,y,z,...] lists in state-plane feet. Usage: extract-3d-model.py in.gml out.json
import re,sys,json
X0,Y0,X1,Y1=983300,202500,988300,208700
src,dst=sys.argv[1],sys.argv[2]
bld=re.compile(r'<bldg:Building gml:id="([^"]+)">(.*?)</bldg:Building>',re.S)
binre=re.compile(r'<gen:stringAttribute name="BIN">\s*<gen:value>(\d+)</gen:value>')
surf=re.compile(r'<bldg:(GroundSurface|WallSurface|RoofSurface)\b.*?</bldg:\1>',re.S)
poly=re.compile(r'<gml:posList[^>]*>([^<]+)</gml:posList>')
out=[];buf='';kept=0;seen=0
with open(src,'r',encoding='utf-8') as fh:
    while True:
        chunk=fh.read(1<<24)
        buf+=chunk
        last=0
        for m in bld.finditer(buf):
            last=m.end();seen+=1;body=m.group(2)
            first=poly.search(body)
            if not first: continue
            v=first.group(1).split()
            xs=[float(v[i]) for i in range(0,len(v),3)];ys=[float(v[i+1]) for i in range(0,len(v),3)]
            if max(xs)<X0 or min(xs)>X1 or max(ys)<Y0 or min(ys)>Y1: continue
            b=binre.search(body);rec={'id':m.group(1),'bin':int(b.group(1)) if b else None,'g':[],'w':[],'r':[]}
            for s in surf.finditer(body):
                key={'GroundSurface':'g','WallSurface':'w','RoofSurface':'r'}[s.group(1)]
                for p in poly.finditer(s.group(0)):
                    rec[key].append([round(float(t),2) for t in p.group(1).split()])
            out.append(rec);kept+=1
        buf=buf[last:]
        if not chunk: break
json.dump(out,open(dst,'w'))
print('seen',seen,'kept',kept)
