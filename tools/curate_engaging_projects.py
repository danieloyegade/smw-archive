"""Web copies of reviewed artist films and original event photographs. Sources stay untouched."""
from pathlib import Path
from PIL import Image, ImageOps
import subprocess, json, concurrent.futures
ROOT=Path(__file__).resolve().parents[1]
ARCHIVE=Path('/Volumes/T7 Shield/SEE MY WORLD ARCHIVE')
OUT=ROOT/'public/media/curated'; OUT.mkdir(parents=True,exist_ok=True)
manifest=[]
VIDEOS=[
 ('we-out-here','we out here 2024/See My World X We Out Here/Vids/Main Edit.mp4',[36.4,6.6,96.5]),
 ('sampha','we out here 2024/See My World X We Out Here/Vids/Sampha.mp4',[45.7,65.3,91.4]),
 ('yaya-bey','we out here 2024/See My World X We Out Here/Vids/Yaya Bey.mp4',[8.3,48.1,121]),
 ('corinne-bailey-rae','we out here 2024/See My World X We Out Here/Vids/Corrine Bailey Rae.mp4',[33.9,17.4,67.8]),
 ('sainte','we out here 2024/See My World X We Out Here/Vids/Saint.mp4',[17.3,67.2,48]),
 ('haus-x','Haus x - workshopo/Dance Workshop .mp4',[6.2,24.3,30.5]),
 ('closer-to-my-dreams','Chad Taylor - closer to my dreams/closer to my dreams intro cred fix.mp4',[21.7,180.7,280]),
]
def run(args): subprocess.run(args,check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
def still(source,name,frame=None,origin='Samsung T7 Shield'):
 target=OUT/(name+'.webp')
 if frame is not None:
  temp=OUT/(name+'.jpg')
  run(['ffmpeg','-nostdin','-y','-ss',str(frame),'-i',str(source),'-frames:v','1','-vf','scale=1600:1600:force_original_aspect_ratio=decrease','-threads','1',str(temp)])
  image_source=temp
 else:image_source=source
 with Image.open(image_source) as original:
  im=ImageOps.exif_transpose(original).convert('RGB');original_dimensions=list(im.size);im.thumbnail((2200,2200));im.save(target,'WEBP',quality=86,method=4)
 if frame is not None:temp.unlink()
 manifest.append(dict(file=target.name,source=str(source),origin=origin,frame_seconds=frame,original_dimensions=original_dimensions,dimensions=list(im.size),bytes=target.stat().st_size))
def film(job):
 name,rel,frames=job; source=ARCHIVE/rel;target=OUT/(name+'.mp4')
 if not target.exists():
  run(['ffmpeg','-nostdin','-y','-i',str(source),'-map','0:v:0','-map','0:a:0?','-vf','scale=1280:960:force_original_aspect_ratio=decrease:force_divisible_by=2','-r','25','-c:v','libx264','-preset','veryfast','-threads','2','-filter_threads','1','-crf','25','-maxrate','1400k','-bufsize','2800k','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart','-map_metadata','-1',str(target)])
 for i,t in enumerate(frames): still(source,name+('-poster' if i==0 else '-still-'+str(i)),t)
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_type,codec_name,width,height','-of','json',str(target)]))
 manifest.append(dict(file=target.name,source=str(source),origin='Samsung T7 Shield',duration=float(probe['format']['duration']),streams=probe['streams'],bytes=target.stat().st_size))
 print('Prepared',name,flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool: list(pool.map(film,VIDEOS))
for item in json.loads((ROOT/'outputs/engaging-source-selection.json').read_text()):
 still(Path(item['source']),item['name'],origin=item['origin'])
(ROOT/'outputs').mkdir(exist_ok=True)
(ROOT/'outputs/engaging-assets.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Finished',len(manifest),'derivatives',flush=True)
