"""Check the built event selection and local media contracts without a browser."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re,subprocess,struct
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist';BASE='/smw-archive'
class Page(HTMLParser):
 def __init__(self):super().__init__();self.refs=[];self.ids=set();self.data='';self.in_data=False;self.autoplay=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.add(a['id'])
  for key in ['src','href','poster']:
   if a.get(key):self.refs.append(a[key])
  if tag in ['video','audio'] and 'autoplay' in a:self.autoplay+=1
  if tag=='script' and a.get('id')=='archive-project-data':self.in_data=True
 def handle_endtag(self,tag):
  if tag=='script':self.in_data=False
 def handle_data(self,data):
  if self.in_data:self.data+=data
pages={}
for p in DIST.rglob('*.html'):
 if p.name.startswith('._'):continue
 parser=Page();parser.feed(p.read_text());pages[p]=parser
errors=[];links=0
for path,page in pages.items():
 if page.autoplay:errors.append(f'Autoplay: {path}')
 for ref in page.refs:
  u=urlsplit(ref)
  if u.netloc or u.scheme:continue
  if u.path.startswith(BASE+'/'):target=DIST/unquote(u.path[len(BASE)+1:])
  elif u.path.startswith('/'):target=DIST/unquote(u.path[1:])
  elif not u.path:target=path
  else:target=path.parent/unquote(u.path)
  if target.is_dir():target=target/'index.html'
  if not target.exists():errors.append(f'Missing: {path.relative_to(DIST)} -> {ref}');continue
  if u.fragment and target in pages and u.fragment not in pages[target].ids:errors.append(f'Missing anchor: {ref}')
  links+=1
projects=json.loads(pages[DIST/'index.html'].data)
assert len(projects)==23
assert len({p['id'] for p in projects})==23 and len({p['slug'] for p in projects})==23
original={'sampha-we-out-here','homage-manchester-moves','closer-to-my-dreams','yaya-bey-we-out-here','manchester-lagos-me','corinne-bailey-rae-we-out-here','we-out-here-2024','isaiah-hull-at-soup','sainte-we-out-here','haus-x-dance-workshop','temne-making-together','liberation-speakeasy','portico-supper-club','connected-fragments-exhibition','movement-across-distance'}
assert original <= {p['slug'] for p in projects}
assets=json.load(open(ROOT/'src/data/event-assets.json'));transcripts=json.load(open(ROOT/'src/data/event-transcripts.json'))
video=audio=0
for name,a in assets.items():
 file=ROOT/'public'/a['src'].lstrip('/')
 assert file.exists() and file.stat().st_size==a['bytes']
 assert file.stat().st_size<100_000_000
 if a['kind'] not in ['video','audio']:continue
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_type,codec_name,width,height','-of','json',str(file)]))
 assert abs(float(probe['format']['duration'])-a['duration'])<.05
 if a['kind']=='video':
  video+=1;assert any(s.get('codec_name')=='h264' for s in probe['streams'])
  atoms=[]
  with open(file,'rb') as f:
   while f.tell()<file.stat().st_size:
    position=f.tell();head=f.read(8)
    if len(head)<8:break
    size,kind=struct.unpack('>I4s',head)
    if size==1:size=struct.unpack('>Q',f.read(8))[0]
    if size==0:break
    atoms.append(kind);f.seek(position+size)
  assert atoms.index(b'moov')<atoms.index(b'mdat')
 else:audio+=1
 if name in transcripts:
  assert all(0<=s['start']<a['duration'] and s['text'].strip() for s in transcripts[name])
  if a['kind']=='video':
   text=(file.with_suffix('.vtt')).read_text();assert text.startswith('WEBVTT')
   def sec(t):h,m,s=t.split(':');return int(h)*3600+int(m)*60+float(s)
   for start,end in re.findall(r'(\d\d:\d\d:\d\d\.\d{3}) --> (\d\d:\d\d:\d\d\.\d{3})',text):assert 0<=sec(start)<sec(end)<=a['duration']+.001
result=dict(stories=len(projects),original_stories_retained=len(original),pages=len(pages),local_links_checked=links,new_videos=video,new_audio=audio,automatic_transcripts=len(transcripts),new_media_bytes=sum(a['bytes'] for a in assets.values()),errors=errors)
report=ROOT.parent/'outputs/globe-content-review-2026-10-13/event-build-validation.json';report.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2));assert not errors
