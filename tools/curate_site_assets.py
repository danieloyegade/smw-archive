"""Build web derivatives from the reviewed SMW originals; never modifies sources."""
from pathlib import Path
import concurrent.futures
import json
import subprocess
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = Path('/Volumes/T7 Shield/SEE MY WORLD ARCHIVE')
CURATION = ARCHIVE / 'outputs/dropbox_curation_20261007'
READY = CURATION / 'ready_to_upload/Archive Highlights'
OUT = ROOT / 'public/media/curated'
OUT.mkdir(parents=True, exist_ok=True)
manifest = []

def photo(source, name, origin='T7 Shield'):
    source = Path(source)
    with Image.open(source) as original:
        im = ImageOps.exif_transpose(original).convert('RGB')
        dimensions = list(im.size)
        im.thumbnail((2200, 2200))
        im.save(OUT / (name + '.webp'), 'WEBP', quality=86, method=6)
    manifest.append(dict(file=name + '.webp', source=str(source), origin=origin,
                         original_dimensions=dimensions, dimensions=list(im.size)))

credits = ARCHIVE / 'SEE MY WORLD 23/FINAL END CREDITS PHOTOS'
for name, filename in {
    'lagos-street': 'See My World BW (Market + Galleries)-58.jpg',
    'lagos-football': 'See My World BW (Ballers)-3.jpg',
    'lagos-hands': 'See My World BW (Akwa Ibom + Femi Israel)-111.jpg',
    'lagos-together': 'See My World BW (Akwa Ibom + Femi Israel)-130.jpg',
    'lagos-portrait': 'Unilag-43.jpg',
    'lagos-conversation': 'See My World BW (Akwa Ibom + Femi Israel)-3.jpg',
}.items():
    photo(credits / filename, name)
photo('/private/tmp/smw-curation/dropbox-documentary-69.jpg', 'lagos-filmmaking', 'Dropbox: Archive Highlights/2023 - Documentary/Photos/See My World BW (Akwa Ibom + Femi Israel)-69.jpg')
photo('/private/tmp/smw-curation/r2-portico-13.jpg', 'portico-together', 'Cloudflare R2: see-my-world-archive/smw-2025/portico-library-supper-club/photos/13.jpg')
for number in ['14', '43', '45-2', '48', '60']:
    photo(READY / ('2025 - Portico Supper Club/Photos/' + number + '.jpg'), 'portico-' + number,
          'Cloudflare R2 original, verified local working copy')
for number in ['17', '20', '6', '24', '9']:
    photo(READY / ('2024 - TEMNE/Photos/SMW (' + number + ').jpg'), 'temne-' + number,
          'Cloudflare R2 original, verified local working copy')

videos = [
    ('festival-2021', '2021 - Wrap-up/Clips/See my world - Wrap Up_2.mp4', 10),
    ('documentary-trailer', '2023 - Documentary/Clips/Final Trailer 4.mp4', 5),
    ('connected-fragments', '2024 - Connected Fragments/Clips/See my world final grade.mov', 30),
    ('temne', '2024 - TEMNE/Clips/SMW final.mp4', 20),
    ('workshop', '2024 - TEMNE/Clips/workshop wide.mp4', 40),
    ('movement', '2020 - Recorded Sessions/Clips/2020 - Day 3 movement excerpt - 47m00s.mp4', 12),
    ('collaborative-movement', '2020 - Recorded Sessions/Clips/2020 - Day 4 collaborative movement excerpt - 14m00s.mp4', 18),
]

def run(command):
    subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

def video(job):
    name, relative, frame_time = job
    source = READY / relative
    target = OUT / (name + '.mp4')
    if not target.exists():
        run(['ffmpeg', '-nostdin', '-y', '-i', str(source), '-map', '0:v:0', '-map', '0:a:0?',
             '-vf', 'scale=1280:960:force_original_aspect_ratio=decrease:force_divisible_by=2',
             '-c:v', 'libx264', '-preset', 'fast', '-crf', '25', '-maxrate', '1600k', '-bufsize', '3200k', '-r', '25', '-pix_fmt', 'yuv420p',
             '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-map_metadata', '-1', str(target)])
    poster = OUT / (name + '-poster.jpg')
    run(['ffmpeg', '-nostdin', '-y', '-ss', str(frame_time), '-i', str(source), '-frames:v', '1',
         '-vf', 'scale=1600:1200:force_original_aspect_ratio=decrease', '-q:v', '2', str(poster)])
    photo(poster, name + '-poster', 'Frame from ' + relative)
    manifest[-1].update(source=str(source), frame_seconds=frame_time)
    poster.unlink()
    details = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries',
                         'format=duration:stream=codec_type,width,height', '-of', 'json', str(target)]))
    manifest.append(dict(file=name + '.mp4', source=str(source), origin=relative,
                         duration=float(details['format']['duration']), streams=details['streams'],
                         bytes=target.stat().st_size))
    print('Prepared', name, flush=True)

with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    list(pool.map(video, videos))

music = ARCHIVE / 'SEE MY WORLD 23/pquaye_smw_music/stwerburghs (guide).mp3'
run(['ffmpeg', '-nostdin', '-y', '-i', str(music), '-t', '60', '-vn', '-af',
     'afade=t=out:st=57:d=3', '-c:a', 'libmp3lame', '-b:a', '160k', '-map_metadata', '-1',
     str(OUT / 'soundtrack-sketch.mp3')])
manifest.append(dict(file='soundtrack-sketch.mp3', source=str(music), origin='T7 Shield',
                     start_seconds=0, duration=60, note='Guide soundtrack; labelled as a work-in-progress sketch.'))
(ROOT / 'outputs').mkdir(exist_ok=True)
(ROOT / 'outputs/curated-assets.json').write_text(json.dumps(manifest, indent=2) + '\n')
print('Finished', len(manifest), 'derivatives', flush=True)
