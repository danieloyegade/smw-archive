from pathlib import Path
from html.parser import HTMLParser
from PIL import Image,ImageOps
import json
ROOT=Path(__file__).resolve().parents[1]
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.collect=False;self.data=[]
 def handle_starttag(self,tag,attrs):
  if tag=='script' and dict(attrs).get('id')=='archive-project-data':self.collect=True
 def handle_endtag(self,tag):
  if tag=='script':self.collect=False
 def handle_data(self,data):
  if self.collect:self.data.append(data)
p=Parser();p.feed((ROOT/'dist/index.html').read_text());projects=json.loads(''.join(p.data))
for x in projects:
 path=x['image'];path=path.removeprefix('/smw-archive/').removeprefix('/')
 with Image.open(ROOT/'public'/path) as original:
  im=ImageOps.exif_transpose(original).convert('RGB');im.thumbnail((600,600));im.save(ROOT/'public/media/event'/('globe-'+x['slug']+'.webp'),'WEBP',quality=82,method=4)
print('Prepared',len(projects),'small globe textures')
