/** Run against a production preview: npm run preview -- --host 127.0.0.1 --port 4329 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const base = (process.env.ARCHIVE_PREVIEW_URL ?? 'http://127.0.0.1:4329/').replace(/\/?$/, '/');
const output = fileURLToPath(new URL('../outputs/yemaya-feedback-2026-10-21/', import.meta.url));
const reflectionHelp = 'Take a moment for yourself. If you’re exploring with someone, you can share your thoughts.';
const report = { base, devices: [], errors: [] };
await fs.mkdir(output, { recursive: true });
// Playwright normally disables the exact browser feature involved in this bug.
const browser = await chromium.launch({ channel: 'chrome', headless: true, ignoreDefaultArgs: ['--disable-back-forward-cache'] });
try {
  for (const mobile of [false, true]) {
    const device = { name: mobile ? 'mobile' : 'desktop', checks: [], history: [], prompts: [] };
    report.devices.push(device);
    const context = await browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      isMobile: mobile, hasTouch: mobile,
    });
    await context.addInitScript(() => {
      window.__pageShows = [];
      addEventListener('pageshow', event => window.__pageShows.push({ persisted: event.persisted }));
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.setDefaultNavigationTimeout(15000);
    page.on('pageerror', error => report.errors.push(error.message));
    const cdp = mobile ? await context.newCDPSession(page) : null;
    async function ready(url) {
      await page.waitForURL(url, { waitUntil: 'commit' });
      await page.waitForFunction(() => window.__pageShows?.length > 0);
    }
    async function visit(path = '') {
      await page.goto(base + path, { waitUntil: 'load' });
      await ready(base + path);
    }
    async function travel(direction, url, requireCache = true) {
      await page[direction]({ waitUntil: 'commit' });
      await ready(url);
      if (requireCache) await page.waitForFunction(() => window.__pageShows.at(-1).persisted);
      device.history.push({ direction, url, persisted: await page.evaluate(() => window.__pageShows.at(-1).persisted) });
    }
    async function gesture() {
      if (cdp) {
        await cdp.send('Input.synthesizeScrollGesture', { x: 190, y: 650, yDistance: -500, speed: 1000, gestureSourceType: 'touch' });
      } else {
        await page.mouse.move(700, 700);
        await page.mouse.wheel(0, 650);
      }
    }
    async function scrollable(label) {
      assert.equal(await page.locator(':modal').count(), 0, label + ': unexpected modal');
      const state = await page.evaluate(() => ({
        overflow: getComputedStyle(document.body).overflowY,
        inert: document.querySelectorAll('[inert]').length,
        transition: !!document.querySelector('[data-story-transition].is-active'),
      }));
      assert.notEqual(state.overflow, 'hidden', label + ': scroll lock');
      assert.equal(state.inert, 0, label + ': inert background');
      assert.equal(state.transition, false, label + ': story cover still active');
      await page.evaluate(() => scrollTo(0, 0));
      await gesture();
      await page.waitForFunction(() => scrollY > 100);
      await page.locator('.reflection').scrollIntoViewIfNeeded();
      assert.equal(await page.locator('.reflection small').textContent(), reflectionHelp);
      await page.locator('footer').scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => scrollY + innerHeight >= document.scrollingElement.scrollHeight - 100), label + ': footer unreachable');
      device.checks.push(label);
    }
    async function homeUnlocked(label) {
      await page.locator('#globe-canvas[tabindex="0"]').waitFor();
      assert.equal(await page.locator('[data-story-transition]').isHidden(), true, label);
      assert.equal(await page.locator('.is-immersive').count(), 0, label);
      assert.equal(await page.locator('[inert]').count(), 0, label);
      assert.notEqual(await page.evaluate(() => getComputedStyle(document.body).overflowY), 'hidden', label);
      device.checks.push(label);
    }
    async function openImmersive(cssFallback = false) {
      if (cssFallback) await page.evaluate(() => {
        document.querySelector('.globe-side').requestFullscreen = () => Promise.reject(new Error('Fullscreen unavailable for fallback regression check'));
      });
      await page.locator('[data-enter-immersive]').click();
      await page.waitForFunction(() => document.querySelector('.globe-side.is-immersive'));
      assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
      assert.ok(await page.locator('[inert]').count() > 0);
    }
    async function openFromRail(slug) {
      if (await page.locator('[data-toggle-rail]').getAttribute('aria-expanded') === 'false') await page.locator('[data-toggle-rail]').click();
      await page.locator(`[data-immersive-story="${slug}"]`).click();
      await page.locator('[data-preview-link]').click();
      await ready(base + 'archive/' + slug + '/');
    }

    // Exact collection → another page/collection → return sequence, plus Forward.
    for (const slug of ['temne-making-together', 'portico-supper-club']) {
      const path = 'archive/' + slug + '/';
      await visit(path);
      await scrollable(slug + ': initial scroll');
      await page.locator('header nav a[href$="about/"]').click();
      await ready(base + 'about/');
      await travel('goBack', base + path);
      await scrollable(slug + ': About → Back');
      await travel('goForward', base + 'about/');
      await travel('goBack', base + path);
      await scrollable(slug + ': Forward → Back');
      const next = await page.locator('[data-next-story]').getAttribute('href');
      await page.locator('[data-next-story]').click();
      await ready(new URL(next, base).href);
      await scrollable(slug + ': next collection');
      await travel('goBack', base + path);
      await scrollable(slug + ': next collection → Back');
      console.log(device.name + ': collection history passed for ' + slug);
    }

    // Repeated archive entries reproduce the cached departing-cover defect.
    await visit();
    for (const slug of ['temne-making-together', 'portico-supper-club', 'temne-making-together']) {
      await homeUnlocked('archive available before ' + slug);
      await page.locator(`[data-project-card][data-slug="${slug}"]`).click();
      await ready(base + 'archive/' + slug + '/');
      await scrollable(slug + ': repeated entry');
      await travel('goBack', base);
      await homeUnlocked('cached archive restored after ' + slug);
      await travel('goForward', base + 'archive/' + slug + '/');
      await scrollable(slug + ': Forward to collection');
      await travel('goBack', base);
    }
    await page.locator('[data-search-input]').fill('Temne');
    assert.match(await page.locator('[data-result-count]').textContent(), /1 story/);
    await page.screenshot({ path: output + '/after-' + device.name + '-archive-return.png' });
    console.log(device.name + ': repeated archive entry and browser Back/Forward passed');

    // Native fullscreen and the CSS fallback both release only their own locks.
    for (const fallback of [false, true]) {
      await visit();
      await openImmersive(fallback);
      await openFromRail('temne-making-together');
      await scrollable('Temne from ' + (fallback ? 'CSS' : 'native') + ' immersive globe');
      await travel('goBack', base, fallback);
      await homeUnlocked('immersive return: ' + (fallback ? 'CSS' : 'native'));
      await openImmersive(fallback);
      if (await page.locator('[data-toggle-rail]').getAttribute('aria-expanded') === 'true') await page.locator('[data-toggle-rail]').click();
      await page.locator('#globe-canvas').focus();
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('0');
      await page.locator('[data-close-immersive]').click();
      await homeUnlocked('immersive controls and Exit after history restore');
    }
    console.log(device.name + ': immersive locks, restore and controls passed');

    // Leave during the animation; its old timer must not redirect a restored page.
    await visit();
    await page.locator('[data-project-card][data-slug="temne-making-together"]').click();
    await page.locator('[data-story-transition].is-active').waitFor();
    await page.goto(base + 'about/');
    await travel('goBack', base);
    await page.waitForTimeout(800);
    assert.equal(page.url(), base);
    await homeUnlocked('interrupted navigation does not resume on Back');

    // A cached native modal must not leave a returned collection inert.
    for (const slug of ['temne-making-together', 'portico-supper-club']) {
      const path = 'archive/' + slug + '/';
      await visit('about/');
      await visit(path);
      await page.locator('.hero-bottom [data-photo-index]').click();
      assert.equal(await page.locator('dialog:modal').count(), 1);
      await travel('goBack', base + 'about/');
      await travel('goForward', base + path);
      await scrollable(slug + ': image viewer history restore');
      await page.locator('.hero-bottom [data-photo-index]').click();
      await page.locator('[data-photo-next]').click();
      assert.match(await page.locator('[data-photo-count]').textContent(), /^02/);
      await page.locator('[data-photo-zoom-in]').click();
      assert.equal(await page.locator('[data-photo-zoom]').textContent(), '150%');
      await page.keyboard.press('Escape');
      await scrollable(slug + ': viewer Escape cleanup');
    }
    console.log(device.name + ': photo viewer history, next, zoom and Escape passed');

    // Review every live reflection question in its actual collection, not transcripts.
    await visit();
    const projects = await page.locator('#archive-project-data').evaluate(element => JSON.parse(element.textContent));
    for (const project of projects) {
      await visit('archive/' + project.slug + '/');
      await page.locator('.reflection').scrollIntoViewIfNeeded();
      const question = await page.locator('.reflection p').textContent();
      assert.equal(question, project.invitation);
      assert.equal(await page.locator('.reflection small').textContent(), reflectionHelp);
      assert.doesNotMatch(await page.locator('main').textContent(), /person next to|someone beside you/i);
      device.prompts.push({ slug: project.slug, question, help: reflectionHelp });
    }
    await visit('archive/temne-making-together/');
    await page.locator('.reflection').scrollIntoViewIfNeeded();
    await page.screenshot({ path: output + '/after-' + device.name + '-reflection.png' });
    device.checks.push('All ' + projects.length + ' collection prompts checked in context');
    console.log(device.name + ': all ' + projects.length + ' reflection prompts passed');
    await context.close();
  }
  assert.deepEqual(report.errors, []);
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = String(error.stack ?? error);
  throw error;
} finally {
  await fs.writeFile(output + '/after-navigation.json', JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
console.log('Collection navigation and reflection checks passed on desktop and mobile.');
