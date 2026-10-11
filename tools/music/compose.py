# "Washington Square, After Hours": original medium-swing ballad in F for Commencement (Step 7).
# Writes a type-1 MIDI file of the whole arrangement played twice (the second pass is cut out after
# rendering, so the loop point carries the first pass's reverb tail).
import mido, random, math
import sys, os
OUT=(sys.argv[1] if len(sys.argv)>1 else 'build/music').rstrip('/')+'/';os.makedirs(OUT,exist_ok=True)
random.seed(7)
BPM=100; TPB=480; PPQ=TPB
NOTE={'C':0,'D':2,'E':4,'F':5,'G':7,'A':9,'B':11}
def nn(s):
    if s=='r': return None
    p=NOTE[s[0]];i=1
    while i<len(s) and s[i] in '#b': p+=1 if s[i]=='#' else -1;i+=1
    return p+12*(int(s[i:])+1)
# chord symbols -> pitch classes relative to root
Q={'maj7':[0,4,7,11,14],'6':[0,4,7,9,14],'m7':[0,3,7,10,14],'7':[0,4,7,10,14],'7b9':[0,4,7,10,13],'m6':[0,3,7,9,14],'m7b5':[0,3,6,10]}
def chord(sym):
    r=sym[0];k=1
    if len(sym)>1 and sym[1] in '#b': r+=sym[1];k=2
    root=nn(r+'2')%12;q=sym[k:] or 'maj7'
    return root,Q[q]
# ---- form: harmony as (bar -> [chords, 2 beats each or 4]) ----
A1=[['Fmaj7'],['D7b9'],['Gm7'],['C7'],['Am7','D7'],['Gm7','C7'],['Fmaj7','Bb7'],['Am7','D7']]
A2=A1[:6]+[['Gm7','C7'],['F6']]
B=[['Cm7'],['F7'],['Bbmaj7'],['Bbm6','Eb7'],['Am7'],['D7'],['Gm7'],['C7']]
INTRO=[['Gm7','C7'],['Am7','D7'],['Gm7','C7'],['Gm7','C7b9']]
TAG=[['Gm7','C7'],['Am7','D7'],['Gm7','C7'],['F6']]
# ---- melody, [note, beats] per bar ----
MA=[[('r',1),('A4',.5),('C5',.5),('E5',1.5),('D5',.5)],
    [('C5',1),('A4',.5),('F#4',.5),('Eb5',2)],
    [('D5',1.5),('Bb4',.5),('G4',1),('A4',.5),('Bb4',.5)],
    [('C5',1),('E4',.5),('G4',.5),('Bb4',2)],
    [('A4',1),('C5',.5),('E5',.5),('F#5',1),('E5',.5),('D5',.5)],
    [('D5',1),('Bb4',1),('G4',.5),('A4',.5),('Bb4',.5),('C5',.5)]]
MA1=MA+[[('A4',2),('Ab4',1),('G4',1)],[('A4',.5),('G4',.5),('F4',.5),('E4',.5),('F#4',1),('C5',1)]]
MA2=MA+[[('Bb4',1),('D5',.5),('F5',.5),('E5',1),('Bb4',1)],[('A4',3),('r',1)]]
MB=[[('Eb5',1.5),('D5',.5),('C5',1),('Bb4',1)],[('A4',1),('C5',.5),('Eb5',.5),('G5',2)],
    [('F5',2),('D5',1),('Bb4',1)],[('Db5',1.5),('C5',.5),('Bb4',1),('G4',1)],
    [('C5',1.5),('B4',.5),('C5',1),('E5',1)],[('F#5',2),('E5',.5),('D5',.5),('C5',1)],
    [('Bb4',1),('A4',.5),('G4',.5),('D5',2)],[('C5',1),('Bb4',.5),('G4',.5),('E4',1),('r',1)]]
MTAG=[[('Bb4',1),('D5',.5),('F5',.5),('E5',1),('Bb4',1)],[('C5',1),('A4',.5),('F#4',.5),('C5',2)],
      [('Bb4',1),('D5',.5),('F5',.5),('E5',1),('G5',1)],[('F5',3),('r',1)]]
# sections: (name, harmony bars, melody bars or None, style)
SECTIONS=[('intro',INTRO,None,'intro'),
 ('A1',A1,MA1,'c1'),('A2',A2,MA2,'c1'),('B',B,MB,'c1b'),('A3',A2,MA2,'c1'),
 ('A1',A1,MA1,'c2'),('A2',A2,MA2,'c2'),('B',B,MB,'c2b'),('A3',A2,MA2,'c2'),
 ('tag',TAG,MTAG,'tag')]
BARS=sum(len(s[1]) for s in SECTIONS)
# ---- helpers ----
CH={'piano':0,'bass':1,'strings':2,'trumpet':3,'alto':4,'tenor':5,'trombone':6,'vib':7,'drums':9,'horn':8,'strhi':10}
PROG={'piano':0,'bass':32,'strings':48,'trumpet':59,'alto':65,'tenor':66,'trombone':57,'vib':11,'horn':60,'strhi':49}
PAN={'piano':52,'bass':64,'strings':40,'trumpet':74,'alto':84,'tenor':48,'trombone':30,'vib':92,'drums':64,'horn':36,'strhi':88}
VOL={'piano':96,'bass':110,'strings':78,'trumpet':92,'alto':78,'tenor':80,'trombone':82,'vib':70,'drums':92,'horn':70,'strhi':66}
events=[]  # (tick, kind, chan, a, b)
def swing(beat):
    # swing the off-beat eighths (2:1 feel)
    whole=math.floor(beat+1e-6);frac=beat-whole
    if abs(frac-.5)<1e-3: frac=.62
    return whole+frac
def note(ch,beat,dur,pitch,vel,human=.012,swing_it=True):
    if pitch is None: return
    b=swing(beat) if swing_it else beat
    t=int(round((b+random.gauss(0,human))*PPQ));t=max(t,0)
    d=max(int(dur*PPQ),30)
    v=max(1,min(127,int(vel+random.gauss(0,4))))
    events.append((t,'on',ch,pitch,v));events.append((t+d,'off',ch,pitch,0))
def cc(ch,beat,num,val): events.append((int(beat*PPQ),'cc',ch,num,int(val)))
def voicing(sym,low=52,n=4,kind='rootless'):
    root,q=chord(sym)
    if kind=='rootless': pcs=[(root+i)%12 for i in ([q[1],q[3],q[4],q[2]] if len(q)>4 else [q[1],q[3],q[2],q[0]])]
    else: pcs=[(root+i)%12 for i in q[:4]]
    out=[];p=low
    for pc in pcs[:n]:
        while p%12!=pc: p+=1
        out.append(p);p+=1
    return out
def lead(prev,sym,low,n=4,kind='close'):
    # voice-led voicing: choose the inversion closest to prev
    root,q=chord(sym);pcs=[(root+i)%12 for i in (q[:4] if kind=='close' else [q[1],q[3],q[4] if len(q)>4 else q[0],q[2]])]
    best=None
    for start in range(low,low+12):
        v=[];p=start
        for k in range(n):
            pc=pcs[k%len(pcs)] if k==0 else None
        # build ascending from each rotation
    cands=[]
    for rot in range(len(pcs)):
        order=pcs[rot:]+pcs[:rot];
        for base in range(low,low+12):
            if base%12!=order[0]: continue
            v=[base];p=base
            for pc in order[1:n]:
                p+=1
                while p%12!=pc: p+=1
                v.append(p)
            cands.append(v)
    if prev is None: return min(cands,key=lambda v:abs(sum(v)/len(v)-(low+8)))
    return min(cands,key=lambda v:sum(abs(a-b) for a,b in zip(sorted(v),sorted(prev))))
# ---- build ----
bar0=0
chordlist=[]  # (startbeat, durbeats, sym)
melodies=[]   # (startbeat, pitch, dur, section style)
for name,harm,mel,style in SECTIONS:
    for i,b in enumerate(harm):
        start=(bar0+i)*4;d=4/len(b)
        for k,sym in enumerate(b): chordlist.append((start+k*d,d,sym,style,bar0+i))
        if mel:
            t=start
            for s,dur in mel[i]:
                melodies.append((t,nn(s),dur,style));t+=dur
    bar0+=len(harm)
TOTAL_BEATS=BARS*4
def chord_at(beat):
    for c in chordlist:
        if c[0]<=beat<c[0]+c[1]: return c
    return chordlist[-1]
def render(offset):
    o=offset
    # bass: walking quarters (two-feel in the intro and first A sections)
    for i,(st,d,sym,style,bar) in enumerate(chordlist):
        root,q=chord(sym);nxt=chordlist[(i+1)%len(chordlist)][2];nroot,_=chord(nxt)
        r=36+root if root>=4 else 48+root
        if r>47: r-=12
        two=style in ('intro','c1')
        beats=int(d)
        tones=[r,r+q[2] if q[2]<12 else r+7,r+q[1],r+q[2]]
        for k in range(beats):
            if two and k%2==1: continue
            if k==0: p=r
            elif k==beats-1 and not two:
                tgt=36+nroot if nroot>=4 else 48+nroot
                if tgt>47: tgt-=12
                p=tgt+random.choice([-1,1])
            else: p=random.choice([r+q[1],r+q[2],r+q[2]-12 if r+q[2]-12>=28 else r+q[2],r+12 if r+12<=50 else r+q[1]])
            note(CH['bass'],o+st+k,(2 if two else 1)*.92,p,92 if k==0 else 80,swing_it=False)
    # piano comping: Charleston-ish, rootless voicings; sparse when it carries the bridge
    prev=None
    for st,d,sym,style,bar in chordlist:
        v=voicing(sym,low=53)
        if style=='intro':
            for x in v: note(CH['piano'],o+st,d*.95,x,58)
            note(CH['piano'],o+st+d-.5,.5,v[-1]+12,46)
        else:
            pat=[(0,1.2,62),(1.5,.5,54)] if d==4 else [(0,1,60)]
            if d==4 and random.random()<.5: pat=[(0,.4,60),(1.5,1,56),(3.5,.4,48)]
            for b,l,vel in pat:
                for x in v: note(CH['piano'],o+st+b,l,x,vel-(8 if style.startswith('c2') else 0))
    # strings: sustained, voice-led pads; swell CC11
    prev=None
    for st,d,sym,style,bar in chordlist:
        v=lead(prev,sym,low=55,n=4);prev=v
        vel=48 if style in ('intro','c1') else (64 if style!='tag' else 70)
        for x in v: note(CH['strings'],o+st,d*.99,x,vel,human=.004,swing_it=False)
    # bridge 1: strings take the tune; chorus 2 bridge: high strings sing above the piano
    # melody voices
    for st,p,dur,style in melodies:
        if p is None: continue
        if style=='c1': note(CH['trumpet'],o+st,dur*.92,p,80)
        elif style=='c1b': note(CH['strhi'],o+st,dur*.98,p+12,74,swing_it=True)
        elif style=='c2b':
            note(CH['piano'],o+st,dur*.9,p+12,84);note(CH['piano'],o+st,dur*.9,p,70)
            note(CH['vib'],o+st,dur*.9,p+12,52)
        elif style in ('c2','tag'):
            # four-way close brass soli: trumpet lead, alto, tenor, trombone below from the chord
            c=chord_at(st);root,q=chord(c[2]);pcs=sorted(set((root+i)%12 for i in q[:4]))
            stack=[p];x=p
            for k in range(3):
                x-=1
                while x%12 not in pcs: x-=1
                stack.append(x)
            for chn,pp,vel in zip(['trumpet','alto','tenor','trombone'],stack,[92,74,74,76]):
                note(CH[chn],o+st,dur*.9,pp,vel)
    # horns: soft background pads in chorus 2 bridge and the tag
    for st,d,sym,style,bar in chordlist:
        if style in ('c2b','tag'):
            v=voicing(sym,low=50,kind='close')[:3]
            for x in v: note(CH['horn'],o+st,d*.98,x,52,human=.005,swing_it=False)
    # drums: brushes (GS Brush kit). 38 tap, 40 swirl, 44 hat pedal, 51 ride, 35 kick
    D=CH['drums']
    for bar in range(BARS):
        st,_,_,style,_=chord_at(bar*4)
        base=o+bar*4
        for k in range(4):
            note(D,base+k,.9,40,40 if style in('intro','c1') else 48,human=.006,swing_it=False)
            if k in (1,3): note(D,base+k,.2,38,46 if style in('intro','c1') else 58);note(D,base+k,.2,44,40)
            if style not in ('intro',):
                if style in ('c2','c2b','tag'):
                    note(D,base+k,.3,51,56);
                    if k in (1,3): note(D,base+k+.5,.2,51,44)
            if k==0 and style!='intro': note(D,base,.3,35,34)
    return
for pas in range(2): render(pas*TOTAL_BEATS)
# ---- write ----
mid=mido.MidiFile(type=1,ticks_per_beat=TPB)
meta=mido.MidiTrack();mid.tracks.append(meta);meta.append(mido.MetaMessage('set_tempo',tempo=mido.bpm2tempo(BPM)))
for name,ch in CH.items():
    tr=mido.MidiTrack();mid.tracks.append(tr)
    if ch==9: tr.append(mido.Message('control_change',channel=9,control=0,value=1,time=0));tr.append(mido.Message('program_change',channel=9,program=40,time=0))
    else: tr.append(mido.Message('program_change',channel=ch,program=PROG[name],time=0))
    tr.append(mido.Message('control_change',channel=ch,control=10,value=PAN[name],time=0))
    tr.append(mido.Message('control_change',channel=ch,control=7,value=VOL[name],time=0))
    tr.append(mido.Message('control_change',channel=ch,control=91,value=70 if name!='bass' else 40,time=0))
    evs=sorted([e for e in events if e[2]==ch],key=lambda e:(e[0],0 if e[1]=='off' else 1))
    last=0
    for t,kind,c,a,b in evs:
        dt=t-last;last=t
        if kind=='on': tr.append(mido.Message('note_on',channel=c,note=a,velocity=b,time=dt))
        elif kind=='off': tr.append(mido.Message('note_off',channel=c,note=a,velocity=0,time=dt))
        else: tr.append(mido.Message('control_change',channel=c,control=a,value=b,time=dt))
mid.save(OUT+'piece.mid')
sec=TOTAL_BEATS*60/BPM
open(OUT+'length.txt','w').write(repr(sec))
print('bars',BARS,'seconds',sec)
