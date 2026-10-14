"""Generate explicitly labelled automatic English captions locally on T7."""
from pathlib import Path
import json,os,subprocess,wave,textwrap,hashlib,sys
import numpy as np
from faster_whisper import WhisperModel
ROOT=Path(__file__).resolve().parents[1];REVIEW=ROOT.parent/'outputs/globe-content-review-2026-10-13';OUT=ROOT/'public/media/event'
os.environ['TMPDIR']=str(REVIEW/'tmp');os.environ['HF_HOME']=str(REVIEW/'model-cache')
model=WhisperModel('base.en',device='cpu',compute_type='int8',cpu_threads=4,download_root=str(REVIEW/'model-cache'),local_files_only=True)
records=json.load(open(ROOT/'src/data/event-assets.json'))
exclude={'misha-live-1','misha-live-2','misha-live-3','chad-short','chad-voice','isaiah-lounge-1','isaiah-lounge-2'}
cache=REVIEW/'event-caption-drafts';cache.mkdir(exist_ok=True)
transcripts={}
force=set(sys.argv[1:])
corrections={'Mosside':'Moss Side','Mossine':'Moss Side','Shabine':'shebeen','Jean Binter-Brieze':'Jean Binta Breeze','Daldin':'DIALLED IN','Dalled in':'DIALLED IN','Dald in':'DIALLED IN','Dalled':'DIALLED','Hoover Sound':'Hooversound','Pissi Palace':'Pxssy Palace','Mosling East':'Moss Lane East'}
def timestamp(value):
 n=round(max(0,value)*1000);h=n//3600000;m=n//60000%60;s=n//1000%60;ms=n%1000;return f'{h:02}:{m:02}:{s:02}.{ms:03}'
for name,record in records.items():
 if record['kind'] not in ['video','audio'] or name in exclude:continue
 draft=cache/(name+'.json')
 fingerprint=hashlib.sha256((ROOT/'public'/record['src'].lstrip('/')).read_bytes()).hexdigest()
 cached=json.load(open(draft)) if draft.exists() else None
 if cached is not None and name not in force and (isinstance(cached,list) or cached.get('media_sha256')==fingerprint):
  segments=cached if isinstance(cached,list) else cached['segments']
 else:
  wav=REVIEW/'tmp'/(name+'.wav')
  subprocess.run(['ffmpeg','-nostdin','-v','error','-y','-i',str(ROOT/'public'/record['src'].lstrip('/')),'-vn','-ac','1','-ar','16000',str(wav)],check=True)
  with wave.open(str(wav),'rb') as f:samples=np.frombuffer(f.readframes(f.getnframes()),dtype=np.int16).astype(np.float32)/32768
  result,info=model.transcribe(samples,language='en',beam_size=3,vad_filter=True,word_timestamps=True,condition_on_previous_text=False)
  segments=[dict(start=s.start,end=s.end,text=s.text.strip(),words=[dict(start=w.start,end=w.end,word=w.word) for w in (s.words or [])]) for s in result]
 draft.write_text(json.dumps(dict(media_sha256=fingerprint,segments=segments),indent=2))
 lines=[];cues=[]
 for segment in segments:
  text=segment['text']
  for a,b in corrections.items():text=text.replace(a,b)
  if segment['start']>=record['duration'] or not text:continue
  lines.append(dict(start=round(segment['start'],2),text=text))
  words=segment['words'];chunk=[];chunk_start=segment['start']
  for i,w in enumerate(words):
   if not chunk:chunk_start=w['start']
   chunk.append(w['word'].strip());is_last=i==len(words)-1
   if len(' '.join(chunk))>=64 or w['end']-chunk_start>=5 or is_last:
    cue_text=' '.join(chunk)
    for a,b in corrections.items():cue_text=cue_text.replace(a,b)
    if chunk_start<record['duration']:
     cues.append((chunk_start,min(record['duration'],max(chunk_start+.2,w['end'])),cue_text))
    chunk=[]
 transcripts[name]=lines
 if record['kind']=='video':
  vtt=['WEBVTT','']
  for start,end,text in cues:
   vtt.extend([timestamp(start)+' --> '+timestamp(end),'\n'.join(textwrap.wrap(text,width=42)),''])
  (OUT/(name+'.vtt')).write_text('\n'.join(vtt))
 print('Captioned',name,'—',len(lines),'speech segments',flush=True)
(ROOT/'src/data/event-transcripts.json').write_text(json.dumps(transcripts,indent=2)+'\n')
print('Finished',len(transcripts),'automatic transcripts',flush=True)
