# See My World image sources

The assets in `public/images/events/` are WebP copies of imagery served by the official [See My World](https://seemyworld.co.uk/) website. They are kept local so the interactive archive does not depend on third-party image loading. Story content is presented directly in this archive.

| Local asset group | Original page |
| --- | --- |
| `see-my-world-logo.webp` | https://seemyworld.co.uk/archive |
| `connected-fragments-private-viewing-*.webp` | https://seemyworld.co.uk/archive/connected-fragments-exhibition |
| `connected-fragments-closing-party-*.webp` | https://seemyworld.co.uk/archive/connected-fragments-closing-party |
| `lagos-premiere-*.webp` | https://seemyworld.co.uk/archive/lagos-premiere-2024 |
| `manchester-premiere-*.webp` | https://seemyworld.co.uk/archive/manchester-premiere-of-see-my-world-manchester-lagos-me |
| `abuja-premiere-*.webp` | https://seemyworld.co.uk/archive/abuja-premier-of-see-my-world-manchester-lagos-me |
| `lagos-trip-*.webp` | https://seemyworld.co.uk/archive/lagos-trip |
| `festival-2021-*.webp` | https://seemyworld.co.uk/archive/festival-programme-2021 |
| `festival-2020-*.webp` | https://seemyworld.co.uk/archive/festival-programme-2020 |

Earlier prototype images and its prebuilt globe script were moved to `reference-assets/legacy/` so they remain available without inflating the deployed site.

## Curated originals (October 2026 iteration)

`public/media/curated/` contains 33 web derivatives: 18 original photographs, seven film posters, seven films and one audio excerpt. Full-resolution source files are retained in their original storage. `outputs/curated-assets.json` records the source, dimensions, duration and byte size for each derivative.

| Selection | Source | Presentation |
| --- | --- | --- |
| Manchester, Lagos & Me / Lagos documentary photographs | T7 Shield documentary collection; one original downloaded from Dropbox's shared SMW Media Files | 30-second finished trailer and original black-and-white photographs |
| Portico supper club | Big People Music Cloudflare R2, `see-my-world-archive/smw-2025/portico-library-supper-club/photos/`; selected originals also retained in the T7 curation working set | Six photographs, from the shared table to kitchen preparation |
| TEMNE | Cloudflare-origin originals in the verified T7 curation working set | Two finished highlights films and five original photographs |
| Movement across distance | T7 curation working set, 2020 recorded-session excerpts | Two 30-second selections, from Day 3 at 47:00 and Day 4 at 14:00 |
| 2021 festival | T7 curation working set, finished wrap-up film | Approximately one minute of festival highlights |
| Connected Fragments | T7 curation working set, finished vertical exhibition reel | Approximately 68 seconds, alongside the existing gallery |
| Soundtrack sketch | T7 Shield, `SEE MY WORLD 23/pquaye_smw_music/stwerburghs (guide).mp3` | First minute with a three-second fade; explicitly labelled a work-in-progress guide |

The documentary collection year is 2023; its trailer export is from 2024. The soundtrack is presented as a working sketch, rather than a final release or field recording. Interview recordings with an uncertain event date and undated archive-launch footage were left out of this selection. Existing website images remain in older event galleries where a verified replacement was not selected.

The three visitor trails balance short films, quieter looking and participation. They give event visitors a suggested route without imposing playback or a time limit. Players load on demand, pause when the page is hidden, and pause when the photograph viewer opens. The films have descriptive summaries; this iteration does not add verified dialogue captions or transcripts.

`tools/curate_site_assets.py` produces derivatives with Pillow and FFmpeg. It requires the mounted T7 Shield source tree and the two staged downloads under `/private/tmp/smw-curation/`; these staging paths can be changed to new downloads of the same originals when regenerating. Originals are never overwritten. The three largest clips were additionally compressed to 960-pixel bounds for this iteration; the manifest describes the resulting files.

## Expanded project selection (second October 2026 iteration)

The current discovery selection contains **15 projects**, with **10 new additions**. Programme listings, the repeated premiere/closing-event galleries and the work-in-progress soundtrack sketch are no longer included in discovery. Their previous URLs redirect to related selected projects. Original event records and source assets remain available locally.

The additions are four artist films (Sampha, Yaya Bey, Corinne Bailey Rae and Sainté), the complete See My World × We Out Here main edit, Haus X’s workshop film, Chad Taylor’s *Closer to My Dreams*, and original photo stories from HOMAGE, Isaiah Hull at SOUP and the Liberation Pan-African Speakeasy. Full artist edits are retained, including their existing captions and credits, rather than cut at arbitrary points. The longer dance film lasts six minutes; all playback is optional.

`outputs/engaging-assets.json` records the new derivatives. `outputs/engaging-source-selection.json` records the exact selected original photo paths. `tools/curate_engaging_projects.py` regenerates the selection from the mounted T7 Shield and the staged Dropbox photograph. The HOMAGE gathering photograph was downloaded directly from Dropbox, `/SMW Media Files/October 2025 Events/Homage/Homage Photography/Daniel/Digital/Homage digital, edited/DSC_4055.jpg`; other new originals come from the mounted drive. The existing Portico selection continues to use verified Big People Music Cloudflare R2 originals.

Visual review covered frame sheets from nine candidate films, sampled original photo sheets from Liberation, SOUP and HOMAGE, and a separate HOMAGE stage photo sheet. The dark Venna clip and the much longer Courtney Hayles event recording were not selected for this iteration. Draft Poetic Justice material, family archive folders and unrelated partner rushes were not used.

The 2024 We Out Here label comes from the source collection. Haus X and Closer to My Dreams are indexed under their verified 2021 export year, with export dates and recording/release-date uncertainty stated on their pages. The dates for SOUP and Liberation come from dated original collection folders. These supporting public sources were also checked:

- [Chad Taylor’s project page](https://www.chadtaylor.co.uk/closer-to-my-dreams) describes the brothers, artistic ambition and the mix of hip-hop, poetry and rap.
- [Royal Exchange Pan-African Speakeasy](https://www.royalexchange.co.uk/event/pan-african-speakeasy/) confirms 15 July 2025 and See My World’s Great Hall music/networking role.
- [See My World’s official links](https://linktr.ee/SEE_MY_WORLD) identify HOMAGE on 16 October 2025 and the SOUP event.
- [We Out Here’s 2024 programme announcement](https://weoutherefestival.com/2024/02/our-2024-lineup-announce/) provides festival context.

Portrait films now retain a tall viewing area suited to their original format and to phone use. Film galleries contain extracted frames; photo stories contain original photographs. No new dialogue transcription is invented, and original film captions remain intact where present.


## Event globe edition (14 October 2026)

The current selection contains **23 projects**. The existing 15 remain, with eight additional stories: Gloria Rose, Linford (Everyday People), Shirley May, Hakim Adi, PIE Radio, Misha B, Junior Akinola and DIALLED IN. The selection balances complete short archive edits, spoken interview chapters, six audio encounters and detailed artwork images. Chad Taylor and Isaiah Hull also gain existing short performance edits.

The read-only R2 review inventoried 3,023 objects (460.75 GB). Selection evidence, frame sheets, source transcripts and the ranked editorial review are stored on T7 under `outputs/globe-content-review-2026-10-13/` outside this website checkout. Nothing in R2 was changed. Matching originals on T7 supply the access copies; the audit records their corresponding R2 object keys.

`src/data/event-assets.json` and `tools/event-asset-provenance.json` record each source, excerpt start, duration and derivative size. `tools/prepare_event_assets.py` creates H.264/AAC MP4, MP3 and WebP access copies without changing originals. Complete short archive edits remain intact. Newly selected interview excerpts begin and end at complete statements. Two longer portraits remain optional behind expandable complete-film controls. Recording dates that cannot be established are indexed as **Undated**, with export dates described separately. Linford belongs to the 2026 Everyday People source collection.

The artwork titles follow source filenames; no unverified artist attribution is added to individual scans. The SOUP photographs and earlier Isaiah live-lounge footage are identified as separate occasions. Junior's answer and another participant's answers are labelled separately. The DIALLED IN image shows the gathering and is not used as an individual portrait.

`tools/prepare_event_captions.py` uses the locally cached Whisper base.en model on T7. The 24 spoken access copies have explicitly labelled **automatic** transcripts; 18 spoken videos also have automatic English WebVTT captions. These are machine drafts, may contain wording errors and require a final human wording review for event use. Performance/music clips do not receive invented lyric transcripts. Media checksums invalidate caption caches when cuts change. All players load on demand; playback is user initiated and one player plays at a time.

The globe retains its existing Three.js constellation, with small WebP textures (maximum 600 × 600) and full-size images on story pages. This is a story constellation, not a map of verified recording locations. Visitors can search people and places, filter Watch/Listen/Look, select themes, follow three trails and zoom into artwork.

Supporting public context:

- [Big People Community's 2026 heritage trail](https://www.eventbrite.co.uk/e/see-my-world-pan-african-legacies-heritage-trail-tickets-1989827475544?aff=ebdssbpointsofinterest) identifies Linford Sweeney in Manchester community history work. The archive story uses the recorded first name, Linford.
- [Oxford Road Corridor's heritage trail listing](https://oxfordroadcorridor.com/events/see-my-world-pan-african-legacies-heritage-trail/) provides organiser and project context.
- [Manchester Library's Connected Fragments listing](https://librarylive.co.uk/event/see-my-world-connected-fragments/) confirms the exhibition dates and artists.

### Event access-copy source windows

| Access copy | Kind | Original start (seconds) | Selected length (seconds) | R2 source or ZIP member |
| --- | --- | ---: | ---: | --- |
| gloria-design | video | 0 | 46.56 | `SEE_MY_WORLD_ARCHIVE/00_ADMIN_AND_GOVERNANCE/ROOT_FILES/social skits 1.zip::GLORIA CLIP 2.mp4` |
| gloria-ambition | video | 0 | 67.44 | `SEE_MY_WORLD_ARCHIVE/00_ADMIN_AND_GOVERNANCE/ROOT_FILES/social skits 1.zip::GLORIA CLIP 3.mp4` |
| gloria-portrait | video | 0 | 432.8 | `SEE_MY_WORLD_ARCHIVE/04_ORAL_HISTORIES_AND_PROFILES/GLORIA_X_CLINTS/GLORIA CLIP 1.mp4` |
| linford-childhood | video | 121.1 | 42.55 | `SEE_MY_WORLD_ARCHIVE/01_SEE_MY_WORLD_PROGRAMMES/2026/Everyday_People/Lindford full interview .mov` |
| linford-mentors | video | 665.9 | 40.5 | `SEE_MY_WORLD_ARCHIVE/01_SEE_MY_WORLD_PROGRAMMES/2026/Everyday_People/Lindford full interview .mov` |
| linford-places | video | 1285.0 | 40.4 | `SEE_MY_WORLD_ARCHIVE/01_SEE_MY_WORLD_PROGRAMMES/2026/Everyday_People/Lindford full interview .mov` |
| shirley-belonging | video | 830.6 | 77.5 | `SEE_MY_WORLD_ARCHIVE/04_ORAL_HISTORIES_AND_PROFILES/SHIRLEY_MAY/Shirley May 18.01.mp4` |
| shirley-making | video | 231.3 | 41.2 | `SEE_MY_WORLD_ARCHIVE/04_ORAL_HISTORIES_AND_PROFILES/SHIRLEY_MAY/Shirley May 18.01.mp4` |
| shirley-mother | video | 726.0 | 31.3 | `SEE_MY_WORLD_ARCHIVE/04_ORAL_HISTORIES_AND_PROFILES/SHIRLEY_MAY/Shirley May 18.01.mp4` |
| hakim-finding-history | video | 109.4 | 84.65 | `SEE_MY_WORLD_ARCHIVE/04_ORAL_HISTORIES_AND_PROFILES/HAKIM_ADI_ARCHIVE/09. Dr. Hakim Adi 18.01.mp4` |
| hakim-manchester | video | 310.0 | 88.5 | `SEE_MY_WORLD_ARCHIVE/04_ORAL_HISTORIES_AND_PROFILES/HAKIM_ADI_ARCHIVE/09. Dr. Hakim Adi 18.01.mp4` |
| hakim-portrait | video | 0 | 558.72 | `SEE_MY_WORLD_ARCHIVE/04_ORAL_HISTORIES_AND_PROFILES/HAKIM_ADI_ARCHIVE/09. Dr. Hakim Adi 18.01.mp4` |
| pie-opportunities | video | 0 | 59.72 | `SEE_MY_WORLD_ARCHIVE/00_ADMIN_AND_GOVERNANCE/ROOT_FILES/social skits 1.zip::PIE RADIO CLIP.mp4` |
| pie-school | video | 0 | 28.08 | `SEE_MY_WORLD_ARCHIVE/00_ADMIN_AND_GOVERNANCE/ROOT_FILES/social skits 1.zip::PIE RADIO CLIP 3.mp4` |
| pie-community | video | 0 | 65.32 | `SEE_MY_WORLD_ARCHIVE/00_ADMIN_AND_GOVERNANCE/ROOT_FILES/social skits 1.zip::PIE RADIO CLIP 2.mp4` |
| misha-live-2 | video | 0 | 42.4 | `SEE_MY_WORLD_ARCHIVE/00_ADMIN_AND_GOVERNANCE/ROOT_FILES/social skits 1.zip::MISHA LIVE LOUNGE CLIP 2.mp4` |
| misha-live-3 | video | 0 | 33.16 | `SEE_MY_WORLD_ARCHIVE/00_ADMIN_AND_GOVERNANCE/ROOT_FILES/social skits 1.zip::MISHA LIVE LOUNGE CLIP 3.mp4` |
| misha-live-1 | video | 0 | 57.4 | `SEE_MY_WORLD_ARCHIVE/00_ADMIN_AND_GOVERNANCE/ROOT_FILES/social skits 1.zip::MISHA LIVE LOUNGE CLIP 1.mp4` |
| junior-dialogue | video | 0 | 24.2 | `SEE_MY_WORLD_ARCHIVE/04_ORAL_HISTORIES_AND_PROFILES/JUNIOR_AKINOLA/REELS/JUNIOR REEL 3.mp4` |
| junior-identity | video | 0 | 28.08 | `SEE_MY_WORLD_ARCHIVE/04_ORAL_HISTORIES_AND_PROFILES/JUNIOR_AKINOLA/REELS/JUNIOR REEL 1.mp4` |
| junior-between-places | video | 0 | 44.52 | `SEE_MY_WORLD_ARCHIVE/04_ORAL_HISTORIES_AND_PROFILES/JUNIOR_AKINOLA/REELS/JUNIOR REEL 2.mp4` |
| naina-roots | audio | 82.0 | 38.1 | `SEE_MY_WORLD_ARCHIVE/02_PARTNER_AND_COMMUNITY_PROJECTS/BPM/DIALLED_INDUSTRY x BPM/SOUND /Nainas interview.m4a` |
| g33-community | audio | 227.0 | 80.7 | `SEE_MY_WORLD_ARCHIVE/02_PARTNER_AND_COMMUNITY_PROJECTS/BPM/DIALLED_INDUSTRY x BPM/SOUND /G33 interview.m4a` |
| ahsan-identity | audio | 57.8 | 28.3 | `SEE_MY_WORLD_ARCHIVE/02_PARTNER_AND_COMMUNITY_PROJECTS/BPM/DIALLED_INDUSTRY x BPM/SOUND /Ahsan interview.m4a` |
| dhruva-open | audio | 212.0 | 26.3 | `SEE_MY_WORLD_ARCHIVE/02_PARTNER_AND_COMMUNITY_PROJECTS/BPM/DIALLED_INDUSTRY x BPM/SOUND /DHRUVA - interview.m4a` |
| mya-access | audio | 237.8 | 34.6 | `SEE_MY_WORLD_ARCHIVE/02_PARTNER_AND_COMMUNITY_PROJECTS/BPM/DIALLED_INDUSTRY x BPM/SOUND /Myas interview (pxssy palace).m4a` |
| balraj-learning | audio | 519.7 | 26.5 | `SEE_MY_WORLD_ARCHIVE/02_PARTNER_AND_COMMUNITY_PROJECTS/BPM/DIALLED_INDUSTRY x BPM/SOUND /Balraj interview.m4a` |
| chad-short | video | 0 | 37.4 | `SEE_MY_WORLD_ARCHIVE/00_ADMIN_AND_GOVERNANCE/ROOT_FILES/social skits 1.zip::CHAD TAYLOR CLIP 2.mp4` |
| chad-voice | video | 0 | 47.68 | `SEE_MY_WORLD_ARCHIVE/00_ADMIN_AND_GOVERNANCE/ROOT_FILES/social skits 1.zip::CHAD TAYLOR CLIP.mp4` |
| isaiah-lounge-1 | video | 0 | 28.88 | `SEE_MY_WORLD_ARCHIVE/00_ADMIN_AND_GOVERNANCE/ROOT_FILES/social skits 1.zip::ISAIAH LIVE LOUNGE CLIP 1.mp4` |
| isaiah-lounge-2 | video | 0 | 66.16 | `SEE_MY_WORLD_ARCHIVE/00_ADMIN_AND_GOVERNANCE/ROOT_FILES/social skits 1.zip::ISIAIH LIVE LOUNGE CLIP 2.mp4` |
| fragments-blue | image | — | — | `SEE_MY_WORLD_ARCHIVE/01_SEE_MY_WORLD_PROGRAMMES/2024/See my World - allistair - connected fragments /denzel painting/Scans/Get out: goodbyes #scan.JPG` |
| fragments-new-life | image | — | — | `SEE_MY_WORLD_ARCHIVE/01_SEE_MY_WORLD_PROGRAMMES/2024/See my World - allistair - connected fragments /denzel painting/Scans/New life #scan.jpg` |
| fragments-vanitas | image | — | — | `SEE_MY_WORLD_ARCHIVE/01_SEE_MY_WORLD_PROGRAMMES/2024/See my World - allistair - connected fragments /denzel painting/Scans/Vanitas sanguinem I #scan.jpg` |
| fragments-canoe | image | — | — | `SEE_MY_WORLD_ARCHIVE/01_SEE_MY_WORLD_PROGRAMMES/2024/See my World - allistair - connected fragments /denzel painting/Scans/canto 3 #scan.jpg` |
| fragments-vanitas-detail | image | — | — | `SEE_MY_WORLD_ARCHIVE/01_SEE_MY_WORLD_PROGRAMMES/2024/See my World - allistair - connected fragments /denzel painting/detail/Vanitas sanguinem I #detail.JPG` |
| fragments-canoe-detail | image | — | — | `SEE_MY_WORLD_ARCHIVE/01_SEE_MY_WORLD_PROGRAMMES/2024/See my World - allistair - connected fragments /denzel painting/detail/canto 3 #detail.jpg` |
| dialled-room-1 | image | 8.232 | — | `SEE_MY_WORLD_ARCHIVE/02_PARTNER_AND_COMMUNITY_PROJECTS/BPM/DIALLED_INDUSTRY x BPM/HARRY CAM/C0007.MP4` |
