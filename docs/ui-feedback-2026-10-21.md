# Archive UI feedback — 21 October 2026

## Photography

Use original photography for story covers, search results and globe cards where
the subject and occasion are verified. Keep film-specific posters on the video
players. Film frames can still appear in galleries, with captions identifying
them as frames.

TEMNE now leads with the existing original `temne-20.webp` photograph. All five
original photographs and the workshop frame remain in its six-image gallery;
the two films and their posters remain available. The globe texture was resized
from that same photograph, and the cover's alt text and gallery captions were
updated to match the new order.

Junior Akinola remains pending source selection. The connected Cloudflare R2
bucket `see-my-world-archive` was checked. Its folder
`SEE_MY_WORLD_ARCHIVE/04_ORAL_HISTORIES_AND_PROFILES/JUNIOR_AKINOLA/`
contains `JUNIOR TALK.mp4` and three reels, with no photographs. A recursive
listing found 4,843 JPG/JPEG/PNG/WebP object keys across the bucket, with no
Junior/Akinola/Homecoming name match. Photos may be held under camera filenames
in another collection; this does not establish that the photographs are absent.
A specific object key, folder, or filename is needed to select the right source.
Do not substitute an unrelated event photograph or identify a subject from a face.

## Copy draft for Latifa

Keep the poetic invitation, then make the available material concrete.

**Headline:** A world of stories.

**Invitation:** A voice carries. A memory moves. A world opens. Follow the
people, places and creative connections of See My World, from Manchester to
Lagos and beyond.

**What is inside:** Step inside for artist films, live performances, recorded
conversations, photographs and artwork. Watch, listen or look at your own pace.

The introduction, trail guidance, collection introduction, About page and default
search description now follow this direction. Existing artist accounts and
historical claims are retained.

For the wider editorial review:

- Retain short, evocative headlines and invitations; pair them with a clear
  account of the actual films, recordings and images in each story.
- Keep an artist's words distinct from editorial interpretation.
- Distinguish event dates, export dates and unknown recording dates.
- Describe photographs and extracted film frames accurately.
- Treat access here as watching, listening and looking; do not imply visitors
  can download or reuse originals.

## Surprise me

The existing function chooses uniformly at random from the stories matching the
current search, year, experience and theme filters. With no filters it chooses
from all 23 stories. It opens the selected story directly; repeated visits can
choose the same story again.

Visible help beside the button now explains the active pool. It describes a
single remaining match explicitly and disables the button when there are no
matches. Search and random discovery also initialise when WebGL is unavailable.

## Globe movement

Previously left/right rotation was unrestricted, while vertical tilt was capped
at ±0.9 radians. Rotation now uses quaternions and follows the screen axes, so
dragging and arrow keys can complete full turns in either direction. Story
selection smoothly centres both latitude and longitude from the current
orientation; Reset cancels any pending focus and restores the starting view.

Focused regression checks live in `tests/globe-motion.test.mjs` (`npm test`).

## Verification

- `npm test`: three rotation and story-focus regressions passed (Node 22.18+).
- `npx tsc --noEmit`: passed.
- `npm run build`: 33 pages generated.
- All 767 local links, media references and referenced anchors resolve.
- Chrome checks passed on desktop and a 390px mobile viewport: repeated pointer
  drags, keyboard turns and reset, immersive story selection, filtered random
  navigation, single/empty results, WebGL fallback and the TEMNE gallery.
- No browser script errors were reported. Desktop and mobile screenshots were
  inspected for wrapping, overflow and photo cropping.

Reports, screenshots and the browser check script are in
`outputs/ui-feedback-2026-10-21/`. To repeat the browser check, start
`npm run preview -- --host 127.0.0.1 --port 4329`, then run
`node outputs/ui-feedback-2026-10-21/check-browser.mjs` with Chrome installed.

## Brand colour

The accent red is now the single token `--red: #FF0000` (green stays `#01A640`)
in `BaseLayout.astro`. Archive page borders, eyebrows, programme numbers and the
photo viewer chrome use the tokens instead of one-off dark reds. The favicon,
globe component, story media and About page were updated to match.

## Back-button navigation and reflection prompts

Going Back to the archive could restore a stale page from the browser's
back/forward cache: a half-finished page transition, a locked immersive globe,
or an open photo viewer.

- The globe resets its navigation state on `pagehide` and on a persisted
  `pageshow`, so Back returns to a usable globe with controls and Exit working.
- Story pages close the photo viewer on `pagehide` and on a persisted
  `pageshow`, so Back and Forward no longer land inside a stale viewer.
- The reflection prompt help now reads: "Take a moment for yourself. If you're
  exploring with someone, you can share your thoughts."

Verified with `npm run check:navigation` against a production preview
(`npm run preview -- --host 127.0.0.1 --port 4329`, Chrome installed). It covers
collection pages, repeated entry, immersive globe return, the photo viewer and
all 23 reflection prompts on desktop and a 390px mobile viewport, with no browser
script errors. The report and before/after screenshots are in
`outputs/yemaya-feedback-2026-10-21/`.
