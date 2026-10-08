# Immersive archive sphere — design QA

## Comparison setup

- Source visual truth: `/Users/danieloyegade/.codex/generated_images/01a11610-bcbf-7321-acab-e0fe38f95b2b/exec-e26c7dc1-218e-4d03-91fd-946cc4e9e2ac.png`
- Implementation capture: `outputs/immersive-sphere-final.jpg`
- Focused interaction capture: `outputs/immersive-sphere-focused.jpg`
- Comparison capture: `outputs/sphere-visual-comparison.jpg`
- Source pixels: 1487 × 1058
- Implementation pixels: 1280 × 720, browser viewport 1280 × 720 at device scale factor 1
- State: desktop immersive archive view with all 15 archive stories available in the side rail; focused-story state was separately checked for Sampha.

## Findings

No actionable P0, P1 or P2 findings remain.

- Typography: the implementation keeps the archive's compact uppercase editorial hierarchy. The selected design's large central title is represented by the accessible story focus card so the actual archive name, date, summary and route remain live content instead of an image treatment.
- Layout rhythm: the orbiting sphere occupies the primary visual field in immersive mode, while the story rail stays available without obscuring the core interaction. At a 390px viewport the canvas and page measure 390px wide with no horizontal overflow.
- Colours and visual tokens: black space, layered wine-red wireframes, red particles and lime interaction accents carry the selected direction while retaining the established site palette.
- Image quality: the floating portals use the existing original web derivatives rather than generated images. Individual portrait focus values are preserved in the archive UI and the selected-story card uses the full supplied asset.
- Copy and content: all 15 archive projects, search, year filters, format filters, story rail controls, direct story links, zoom controls and keyboard navigation remain present.

## Interaction evidence

- Full-screen mode opens with the story rail available.
- Selecting Sampha brings forward a live story card with its title, description, event metadata and `Open this story` route.
- Browser console: no warnings or errors after the final render.
- Build checks: `npm run build`, `tsc --noEmit`, and `git diff --check` passed.

## Follow-up polish

- P3: a later production pass could add GPU bloom through a post-processing pipeline, subject to performance testing on the event hardware.

final result: passed
