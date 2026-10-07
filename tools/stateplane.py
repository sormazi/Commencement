# NAD83 / New York Long Island (ftUS), EPSG:2263: Lambert Conformal Conic 2SP on GRS80.
import math
a=6378137.0; f=1/298.257222101; e=math.sqrt(2*f-f*f); FT=0.3048006096012192
lat1,lat2,lat0,lon0=map(math.radians,(40.66666666666666,41.03333333333333,40.16666666666666,-74.0)); FE=984250.0*FT; FN=0.0
m=lambda p: math.cos(p)/math.sqrt(1-(e*math.sin(p))**2)
t=lambda p: math.tan(math.pi/4-p/2)/((1-e*math.sin(p))/(1+e*math.sin(p)))**(e/2)
n=(math.log(m(lat1))-math.log(m(lat2)))/(math.log(t(lat1))-math.log(t(lat2))); F=m(lat1)/(n*t(lat1)**n); r0=a*F*t(lat0)**n
def forward(lat,lon):
    p=math.radians(lat); r=a*F*t(p)**n; th=n*(math.radians(lon)-lon0)
    return ((FE+r*math.sin(th))/FT,(FN+r0-r*math.cos(th))/FT)
def inverse(x,y):
    x=x*FT-FE; y=r0-(y*FT-FN); r=math.copysign(math.hypot(x,y),n); th=math.atan2(x,y); tt=(r/(a*F))**(1/n)
    p=math.pi/2-2*math.atan(tt)
    for _ in range(8): p=math.pi/2-2*math.atan(tt*((1-e*math.sin(p))/(1+e*math.sin(p)))**(e/2))
    return math.degrees(p),math.degrees(th/n+lon0)
if __name__=='__main__':
    print(forward(40.7312347,-73.9971025)); print(inverse(*forward(40.7312347,-73.9971025)))
    for la,lo in [(40.7228,-74.0030),(40.7392,-73.9860)]: print(forward(la,lo))
