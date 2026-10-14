# Archive curation verification — 7 October 2026

- Production Astro build succeeded: 15 pages (home, about and 13 archive stories).
- TypeScript check succeeded: `tsc --noEmit`.
- `git diff --check` succeeded.
- Parsed all generated pages: 325 local asset/link references resolve; all 33 curated derivatives are present in the production build and match their source web files.
- Every manifest source path exists. FFprobe confirmed video dimensions/durations and audio streams during conversion.
- Browser verification: first trail advances through stories 1–3 and returns to trail selection; gallery next and Escape work; opening the gallery pauses the film.
- Native browser playback succeeded for the documentary trailer, guide audio and both TEMNE films. Starting the second TEMNE film paused the first.
- Year, theme search and listening filters returned the expected stories. The full-screen globe lists all 13 stories and opens the TEMNE preview.
- At a 390 × 844 viewport, the trail entry page and listening story had no horizontal overflow. Visible images loaded. Media starts paused and loads on demand.
- Saved browser captures: `curated-desktop.jpg`, `curated-mobile.jpg`.

This is the local site iteration. It has not been committed, pushed or publicly deployed. Older galleries still include website-derived photographs. Films have summaries, but verified dialogue captions/transcripts were not added. Timing labels are suggested visits, not enforced durations.
