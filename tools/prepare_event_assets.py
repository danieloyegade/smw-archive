"""Prepare small, traceable event access copies on T7; never alter originals."""
from pathlib import Path
from PIL import Image,ImageOps
import json,subprocess,concurrent.futures,os,sys
ROOT=Path(__file__).resolve().parents[1]
REVIEW=ROOT.parent/'outputs/globe-content-review-2026-10-13'
OUT=ROOT/'public/media/event';OUT.mkdir(parents=True,exist_ok=True)
os.environ['TMPDIR']=str(REVIEW/'tmp')
sources={x['id']:x for x in json.load(open(REVIEW/'media-review.json'))}
force=set(sys.argv[1:])
# Excerpts are selected at complete statements; original short edits remain intact.
jobs=[
 ('gloria-design','m35',0,None),('gloria-ambition','m34',0,None),('gloria-portrait','m18',0,None),
 ('linford-childhood','m01',121.1,42.55),('linford-mentors','m01',665.9,40.5),('linford-places','m01',1285.0,40.4),
 ('shirley-belonging','m26',830.6,77.5),('shirley-making','m26',231.3,41.2),('shirley-mother','m26',726.0,31.3),
 ('hakim-finding-history','m19',109.4,84.65),('hakim-manchester','m19',310.0,88.5),('hakim-portrait','m19',0,None),
 ('pie-opportunities','m46',0,None),('pie-school','m45',0,None),('pie-community','m44',0,None),
 ('misha-live-2','m39',0,None),('misha-live-3','m38',0,None),('misha-live-1','m40',0,None),
 ('junior-dialogue','m24',0,None),('junior-identity','m22',0,None),('junior-between-places','m23',0,None),
 ('naina-roots','m07',82.0,38.1),('g33-community','m05',227.0,80.7),('ahsan-identity','m02',57.8,28.3),
 ('dhruva-open','m04',212.0,26.3),('mya-access','m06',237.8,34.6),('balraj-learning','m03',519.7,26.5),
 ('chad-short','m36',0,None),('chad-voice','m37',0,None),('isaiah-lounge-1','m43',0,None),('isaiah-lounge-2','m42',0,None),
]
def execute(args):
 subprocess.run(args,check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,timeout=240)
def prepare(job):
 name,id,start,length=job;entry=sources[id];source=Path(entry['local_path']);length=length or entry['duration']
 is_video=any(x['codec_type']=='video' for x in entry['metadata']['streams'])
 target=OUT/(name+('.mp4' if is_video else '.mp3'))
 if not target.exists() or name in force:
  args=['ffmpeg','-nostdin','-v','error','-y','-ss',str(start),'-i',str(source),'-t',str(length)]
  if is_video:
   bound='960:720' if length<200 else '854:480'
   args+=['-map','0:v:0','-map','0:a:0?','-vf',f'scale={bound}:force_original_aspect_ratio=decrease:force_divisible_by=2','-c:v','libx264','-preset','veryfast','-threads','1','-filter_threads','1','-crf','26','-maxrate','900k','-bufsize','1800k','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart']
  else:args+=['-vn','-c:a','libmp3lame','-b:a','128k']
  args+=['-map_metadata','-1',str(target)];execute(args)
 images=[]
 if is_video:
  for n,fraction in enumerate([.28,.64]):
   dest=OUT/(name+('-poster' if n==0 else '-still')+'.webp')
   if not dest.exists() or name in force:
    temp=REVIEW/'tmp'/(name+f'-{n}.jpg');execute(['ffmpeg','-nostdin','-v','error','-y','-ss',str(start+length*fraction),'-i',str(source),'-frames:v','1','-vf','scale=1600:1200:force_original_aspect_ratio=decrease','-threads','1',str(temp)])
    with Image.open(temp) as im:im=ImageOps.exif_transpose(im).convert('RGB');im.save(dest,'WEBP',quality=85,method=4)
   images.append('/media/event/'+dest.name)
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_type,width,height','-of','json',str(target)]))
 record=dict(name=name,kind='video' if is_video else 'audio',src='/media/event/'+target.name,seconds=round(float(probe['format']['duration'])),duration=float(probe['format']['duration']),source=entry['r2_path'],source_start=start,source_seconds=length,bytes=target.stat().st_size,images=images,portrait=is_video and any(s.get('height',0)>s.get('width',0) for s in probe['streams']))
 print('Prepared',name,record['seconds'],'seconds',flush=True);return record
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:records=list(pool.map(prepare,jobs))
# Full scans and existing archive details make close-looking useful.
photos=json.load(open(REVIEW/'photo-review.json'))
artworks=[('fragments-blue','p18-01'),('fragments-new-life','p18-02'),('fragments-vanitas','p18-03'),('fragments-canoe','p18-06'),('fragments-vanitas-detail','p18-10'),('fragments-canoe-detail','p18-13')]
for name,id in artworks:
 entry=next(x for x in photos if x['review_id']==id);dest=OUT/(name+'.webp')
 with Image.open(entry['local_source']) as original:
  im=ImageOps.exif_transpose(original).convert('RGB');im.thumbnail((2600,2600));im.save(dest,'WEBP',quality=90,method=4)
 records.append(dict(name=name,kind='image',src='/media/event/'+dest.name,source=entry['Path'],dimensions=im.size,bytes=dest.stat().st_size))
raw=json.load(open(REVIEW/'raw-review.json'))
for i,frame in enumerate(['r03'],start=1):
 entry=next(x for x in raw if Path(x['frame']).stem==frame);dest=OUT/f'dialled-room-{i}.webp';temp=REVIEW/'tmp'/f'dialled-room-{i}.jpg'
 execute(['ffmpeg','-nostdin','-v','error','-y','-ss',str(entry['frame_time']),'-i',entry['local_source'],'-frames:v','1','-vf','scale=1600:1200:force_original_aspect_ratio=decrease','-threads','1',str(temp)])
 with Image.open(temp) as im:im=ImageOps.exif_transpose(im).convert('RGB');im.save(dest,'WEBP',quality=85,method=4)
 records.append(dict(name=f'dialled-room-{i}',kind='image',src='/media/event/'+dest.name,source=entry['Path'],frame_seconds=entry['frame_time'],bytes=dest.stat().st_size))
(ROOT/'src/data/event-assets.json').write_text(json.dumps({r['name']:r for r in records},indent=2)+'\n')
(ROOT/'tools/event-asset-provenance.json').write_text(json.dumps(records,indent=2)+'\n')
print('Finished',len(records),'event assets',flush=True)
