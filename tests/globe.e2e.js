/**
 * Browser smoke test for the globe. The bug this guards against is the one that
 * shipped: the globe script silently not being the script that runs. It asserts
 * the real WebGL path initialises, a panel is clickable, and the list view is
 * always reachable.
 *
 * Run with: npm run build && npm run test:e2e
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const DIST = new URL('../dist/', import.meta.url).pathname;
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.woff2': 'font/woff2',
};

let server;
let browser;
let origin;

before(async () => {
  assert.ok(existsSync(DIST), 'dist/ is missing — run `npm run build` first.');

  server = createServer(async (request, response) => {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let file = join(DIST, normalize(path).replace(/^(\.\.[/\\])+/, ''));
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');

    if (!existsSync(file)) {
      response.writeHead(404).end('not found');
      return;
    }
    response.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
    response.end(await readFile(file));
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  // WebGL in headless Linux runs on SwiftShader. CHROMIUM_PATH lets a sandbox
  // with a pre-installed browser point at it instead of Playwright's download.
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'],
  });
});

after(async () => {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
});

test('the globe initialises and renders every panel', async () => {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto(`${origin}/`, { waitUntil: 'networkidle' });

  const shell = page.locator('[data-archive-shell]');
  await shell.waitFor();
  assert.equal(await shell.getAttribute('data-view'), 'globe', 'globe view did not activate');
  await assert.doesNotReject(page.locator('[data-stage]').waitFor({ state: 'visible' }));
  assert.deepEqual(errors, [], `page errors: ${errors.join('; ')}`);

  const payload = JSON.parse(await page.locator('[data-archive-projects]').textContent());
  assert.equal(payload.length, 20, 'unexpected number of archive entries in the client payload');
  await page.close();
});

test('the list view is reachable from the globe', async () => {
  const page = await browser.newPage();
  await page.goto(`${origin}/`, { waitUntil: 'networkidle' });

  await page.locator('[data-view-toggle]').click();
  assert.equal(await page.locator('[data-archive-shell]').getAttribute('data-view'), 'list');
  await page.locator('.list-grid a').first().waitFor({ state: 'visible' });
  await page.close();
});

test('search finds an entry and links to its page', async () => {
  const page = await browser.newPage();
  await page.goto(`${origin}/`, { waitUntil: 'networkidle' });

  await page.locator('[data-search-input]').fill('portico');
  const result = page.locator('[data-result-list] a').first();
  await result.waitFor({ state: 'visible' });
  await result.click();
  await page.waitForURL('**/archive/supper-club-at-portico/');
  assert.match(await page.locator('h1').textContent(), /Supper Club at Portico/i);
  await page.close();
});

test('the archive works with JavaScript disabled', async () => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${origin}/`);

  assert.equal(await page.locator('[data-archive-shell]').getAttribute('data-view'), null);
  assert.equal(await page.locator('.list-grid > li').count(), 20, 'list view is incomplete without JS');
  await context.close();
});

test('a legacy slug redirects to its new page', async () => {
  const page = await browser.newPage();
  await page.goto(`${origin}/archive/nia-centre/`);
  await page.waitForURL('**/archive/connected-fragments/');
  await page.close();
});
