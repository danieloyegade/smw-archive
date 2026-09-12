/**
 * Assertions against the built site in `dist/`. These guard the failures that
 * actually shipped before: a stale hand-built bundle, dangling image paths,
 * unoptimised originals, and pages reachable only through WebGL.
 *
 * Run with: npm test (builds first), or `node --test tests/` against an existing dist.
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const ASSET_BUDGET_BYTES = 1_500_000;

let index;
let projectSlugs;

before(async () => {
  assert.ok(existsSync(DIST), 'dist/ is missing — run `npm run build` first.');
  index = await readFile(join(DIST, 'index.html'), 'utf8');
  const contentDir = new URL('../src/content/projects/', import.meta.url).pathname;
  projectSlugs = (await readdir(contentDir))
    .filter((name) => name.endsWith('.md'))
    .map((name) => name.replace(/\.md$/, ''));
});

test('every archive entry is in the server-rendered homepage', () => {
  assert.ok(projectSlugs.length > 0, 'no content entries found');
  for (const slug of projectSlugs) {
    assert.match(
      index,
      new RegExp(`href="[^"]*/archive/${slug}/"`),
      `homepage HTML has no link to ${slug} — the archive must be browsable without WebGL`,
    );
  }
});

test('the homepage list is not hidden behind JavaScript', () => {
  // data-view is set by the globe script only; the built HTML must not pre-set it.
  assert.doesNotMatch(index, /data-archive-shell[^>]*data-view=/, 'list view starts hidden');
  assert.match(index, /<ol class="list-grid"/, 'the fallback list is missing from the HTML');
});

test('every archive page is built and carries canonical + social metadata', async () => {
  for (const slug of projectSlugs) {
    const page = await readFile(join(DIST, 'archive', slug, 'index.html'), 'utf8');
    assert.match(page, /<link rel="canonical"/, `${slug}: no canonical URL`);
    assert.match(page, /property="og:image"/, `${slug}: no og:image`);
    assert.match(page, /application\/ld\+json/, `${slug}: no structured data`);
  }
});

test('legacy slugs still resolve and point at a real page', async () => {
  const { legacySlugs } = await import('../src/lib/legacy-slugs.ts');
  for (const [from, to] of Object.entries(legacySlugs)) {
    const page = await readFile(join(DIST, 'archive', from, 'index.html'), 'utf8');
    assert.match(page, /http-equiv="refresh"/, `${from}: not a redirect`);
    assert.match(page, new RegExp(`/archive/${to}/`), `${from}: does not point at ${to}`);
    assert.match(page, /name="robots" content="noindex/, `${from}: redirect stub is indexable`);
    assert.ok(projectSlugs.includes(to), `${from} redirects to ${to}, which does not exist`);
  }
});

test('no single built asset exceeds the budget', async () => {
  const assetDir = join(DIST, '_astro');
  const oversized = [];
  for (const name of await readdir(assetDir)) {
    const { size } = await stat(join(assetDir, name));
    if (size > ASSET_BUDGET_BYTES) oversized.push(`${name} (${(size / 1e6).toFixed(1)}MB)`);
  }
  assert.deepEqual(oversized, [], `assets over ${ASSET_BUDGET_BYTES / 1e6}MB: ${oversized.join(', ')}`);
});

test('no unbundled globe script is served from public/', () => {
  assert.ok(
    !existsSync(join(DIST, 'archive-globe.js')),
    'dist/archive-globe.js exists — the globe must be bundled from src, not committed to public/',
  );
});

test('three.js is code-split out of the entry chunk', async () => {
  const assetDir = join(DIST, '_astro');
  const scripts = (await readdir(assetDir)).filter((name) => name.endsWith('.js'));
  const entry = scripts.find((name) => name.startsWith('ArchiveGlobe'));
  assert.ok(entry, 'no entry script was emitted for the globe component');

  const { size } = await stat(join(assetDir, entry));
  assert.ok(
    size < 50_000,
    `entry chunk is ${(size / 1000).toFixed(0)}kB — three.js must stay in a lazily loaded chunk ` +
      'so browsers without WebGL never download it',
  );
  assert.ok(
    scripts.some((name) => name.startsWith('globe-scene')),
    'the lazily loaded globe scene chunk is missing',
  );
});

test('sitemap, robots and 404 are generated', async () => {
  for (const file of ['sitemap-index.xml', 'robots.txt', '404.html']) {
    assert.ok(existsSync(join(DIST, file)), `${file} was not generated`);
  }
  const robots = await readFile(join(DIST, 'robots.txt'), 'utf8');
  assert.match(robots, /Sitemap: https?:\/\//, 'robots.txt does not advertise the sitemap');
});
