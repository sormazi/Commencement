"""Fetch the NYC planimetric layers for the study area into RESEARCH/data/raw/nightview-nyc-planimetrics.json.

Surface sweep, 14 Oct 2026: the first extract (7 Oct) used within_box(), which on Socrata keeps only features lying
wholly inside the box, so every sidewalk, roadbed or median polygon crossing the box edge was missing (86 sidewalk
and 94 roadbed polygons): whole blocks near the edges had no sidewalk. This uses intersects() with the same box.
Usage: python3 tools/fetch-planimetrics.py
"""
import json, os, urllib.parse, urllib.request, datetime
ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'RESEARCH', 'data', 'raw', 'nightview-nyc-planimetrics.json')
N, W, S, E = 40.7395, -74.0035, 40.7225, -73.9855
BOX = f'POLYGON(({W} {N},{E} {N},{E} {S},{W} {S},{W} {N}))'
LAYERS = {  # name: (dataset id, geometry column)
    'roadbed': ('i36f-5ih7', 'the_geom'), 'sidewalk': ('52n9-sdep', 'the_geom'), 'median': ('ees7-4ufv', 'the_geom'),
    'curbs': ('5xvt-8cbk', 'the_geom'), 'pavement_edge': ('vs44-rznx', 'the_geom'), 'openspace_parks': ('y6ja-fw4f', 'the_geom'),
    'openspace_other': ('b7j8-z8a7', 'the_geom'), 'plazas': ('ue2e-9jm2', 'the_geom'), 'elevation': ('9uxf-ng6q', 'the_geom'),
    'misc_structures': ('92m5-3pwp', 'the_geom'), 'retaining_wall': ('s2pi-ccum', 'the_geom'), 'centerline': ('inkn-q76z', 'the_geom'),
    'hydrants': ('5bgh-vtsn', 'the_geom'), 'shelters': ('t4f2-8md7', 'location1'), 'parks': ('enfh-gkve', 'multipolygon'),
    'forestry_trees': ('hn5i-inap', 'location'), 'dog_runs': ('hxx3-bwgv', 'the_geom')}
POINTS = {'hydrants', 'shelters', 'forestry_trees', 'elevation'}
out = {'_meta': {'fetched': datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), 'bbox': f'{N},{W},{S},{E}',
                 'source': 'NYC Open Data (data.cityofnewyork.us), Socrata SODA API', 'datasets': {}}}
for name, (ds, geom) in LAYERS.items():
    where = f"within_box({geom},{N},{W},{S},{E})" if name in POINTS else f"intersects({geom},'{BOX}')"
    url = f'https://data.cityofnewyork.us/resource/{ds}.json?' + urllib.parse.urlencode({'$where': where, '$limit': 50000})
    rows = json.loads(urllib.request.urlopen(url, timeout=120).read())
    out[name] = rows
    out['_meta']['datasets'][name] = {'id': ds, 'geom': geom, 'count': len(rows), 'url': url}
    print(name, len(rows))
json.dump(out, open(OUT, 'w'))
