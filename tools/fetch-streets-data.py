# Fetch NYC DOT / MTA / Citi Bike street data for the study box into one raw file (Step: roads survey, 11 Oct 2026).
import json, urllib.request, urllib.parse, sys, time
sys.path.insert(0,'/home/claude/cm/tools'); import stateplane as sp
BOX=(40.7395,-74.0035,40.7225,-73.9855)  # N, W, S, E as used for the planimetrics
def soda(id,where,limit=50000):
    url=f"https://data.cityofnewyork.us/resource/{id}.json?$where={urllib.parse.quote(where)}&$limit={limit}"
    d=json.load(urllib.request.urlopen(url,timeout=120));return d,url
out={'_meta':{'fetched':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'bbox':','.join(map(str,BOX)),'datasets':{}}}
wb=f"within_box(the_geom,{BOX[0]},{BOX[1]},{BOX[2]},{BOX[3]})"
for key,id in [('bike_routes','mzxg-pwib'),('bus_lanes','ycrg-ses3'),('barnes_dance','8kuj-2n3u'),('ped_ramps','ufzp-rrqu')]:
    d,url=soda(id,wb);out[key]=d;out['_meta']['datasets'][key]={'id':id,'count':len(d),'url':url,'licence':'NYC Open Data Terms of Use'};print(key,len(d))
xs,ys=zip(*[sp.forward(la,lo) for la in (BOX[0],BOX[2]) for lo in (BOX[1],BOX[3])])
w=f"sign_x_coord between '{int(min(xs))}' and '{int(max(xs))}' AND sign_y_coord between '{int(min(ys))}' and '{int(max(ys))}' AND borough='Manhattan'"
d,url=soda('nfid-uabd',w);d=[r for r in d if r.get('sign_x_coord') and min(xs)<=float(r['sign_x_coord'])<=max(xs) and min(ys)<=float(r['sign_y_coord'])<=max(ys)]
for r in d:
    la,lo=sp.inverse(float(r['sign_x_coord']),float(r['sign_y_coord']));r['lat']=round(la,7);r['lon']=round(lo,7)
out['parking_signs']=d;out['_meta']['datasets']['parking_signs']={'id':'nfid-uabd','count':len(d),'url':url,'licence':'NYC Open Data Terms of Use','note':'positions converted from EPSG:2263 with tools/stateplane.py'};print('signs',len(d))
cb=json.load(urllib.request.urlopen('https://gbfs.citibikenyc.com/gbfs/en/station_information.json',timeout=60))['data']['stations']
cb=[s for s in cb if BOX[2]<=s['lat']<=BOX[0] and BOX[1]<=s['lon']<=BOX[3]]
out['citibike']=cb;out['_meta']['datasets']['citibike']={'url':'https://gbfs.citibikenyc.com/gbfs/en/station_information.json','count':len(cb),'licence':'Citi Bike Data License Agreement (https://ride.citibikenyc.com/data-sharing-policy)'};print('citibike',len(cb))
json.dump(out,open('nightview-nyc-streets.json','w'))
