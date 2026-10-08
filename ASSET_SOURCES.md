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
