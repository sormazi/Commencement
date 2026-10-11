import numpy as np, scipy.io.wavfile as W, scipy.signal as S
import sys, os
OUT=(sys.argv[1] if len(sys.argv)>1 else 'build/music').rstrip('/')+'/';os.makedirs(OUT,exist_ok=True)
rng=np.random.default_rng(2126)
r,d=W.read(OUT+'raw2026.wav');x=d.astype(np.float64)/32768
L=float(open(OUT+'length.txt').read());n=int(round(L*r));a=n  # second pass starts at n
loop=x[a:a+n].copy();over=x[a:a+r].copy()          # loop body + 1 s overrun (= the loop's own start)
def master(y,target_rms=.11,ceil=.89):
    y=y*(target_rms/np.sqrt((y**2).mean()))
    return np.tanh(y/ceil)*ceil                      # soft ceiling
# ---------- 2026: gentle EQ (warm low-mid lift, airy top) and master ----------
def shelf(y,f,g,kind):
    b,a_=S.iirfilter(2,f/(r/2),btype='low' if kind=='low' else 'high',ftype='butter')
    return y+(10**(g/20)-1)*S.lfilter(b,a_,y,axis=0)
full=np.concatenate([loop,over])
y26=shelf(shelf(full,180,1.5,'low'),7000,1.2,'high');y26=master(y26)
# ---------- 2126: the same take on a worn cassette ----------
t=np.arange(len(full))/r
m=full.mean(1,keepdims=True);s=(full[:,:1]-full[:,1:])/2
y=np.concatenate([m+.35*s,m-.35*s],1)              # narrow stereo, mostly mono
b,a_=S.butter(4,[70/(r/2),3400/(r/2)],'band');y=S.lfilter(b,a_,y,axis=0)
b,a_=S.butter(2,2600/(r/2));y=.6*y+.4*S.lfilter(b,a_,y,axis=0)   # extra dullness
# wow (0.55 Hz) and flutter (7.3 Hz) as a modulated delay around a fixed centre, so it stays in sync
dly=.012+.0022*np.sin(2*np.pi*(95/L)*t)+.00025*np.sin(2*np.pi*(1261/L)*t+1.)
# rare events (seconds into the loop): a pitch sag, a dragging bar that catches up
def bump(c,w,amp):return amp*np.exp(-((t-c)/w)**2)
dly+=bump(49.5,.9,.018)                             # pitch sag and recovery around bar 21
dly+=np.clip((t-118.0)/2.4,0,1)*np.clip((122.6-t)/1.0,0,1)*.03   # a bar that drags, then catches up
idx=np.clip(np.arange(len(full))-dly*r,0,len(full)-1);i0=idx.astype(int);fr=idx-i0;i1=np.minimum(i0+1,len(full)-1)
y=y[i0]*(1-fr[:,None])+y[i1]*fr[:,None]
y=np.tanh(y*2.2/np.abs(y).max())/np.tanh(2.2)          # saturation
# a faint second voice: print-through from the next layer of tape, the tune heard a few seconds early, very quiet
ghost=np.roll(y,-int(3.6*r),0);b,a_=S.butter(2,[300/(r/2),1800/(r/2)],'band');ghost=S.lfilter(b,a_,ghost,axis=0)
gate=np.zeros(len(t));
for c in (31.0,96.0,151.0): gate+=np.exp(-((t-c)/5.5)**2)
y=y+ghost*gate[:,None]*.06
# dropouts: brief level dips
for c,wd in ((72.3,.18),(140.8,.32),(163.1,.12)):
    g=1-.85*np.exp(-((t-c)/wd)**6);y*=g[:,None]
# hiss (pinkish, a little stereo) and the odd crackle
w=rng.standard_normal((len(t),2));b,a_=S.butter(1,4000/(r/2),'high');hiss=S.lfilter(b,a_,w,axis=0)*.012+S.lfilter(*S.butter(1,900/(r/2)),w,axis=0)*.006
y=y+hiss
y=master(y,target_rms=.095)
# keep the overrun identical in content to the loop start (so loopStart/loopEnd splice cleanly)
for z in (y26,y): z[n:]=z[:len(z)-n]
for name,z in (('commencement-2026',y26),('commencement-2126',y)):
    W.write(OUT+f'{name}.wav',r,(np.clip(z,-1,1)*32767).astype(np.int16))
print('loop seconds',L,'file seconds',len(full)/r)
