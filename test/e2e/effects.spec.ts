import { test, expect, type Page } from '@playwright/test';

// Throw, plop and rainbow trail, lifted from floramaxwell.de (scripts/pride.ts, confetti.ts; Flo 2026-10-29).
const FLAGS = '[data-pride-flag]';
const TRAIL = '[data-pride-trail]';
const LAYER = '[data-pride-layer]';

const box = async (page: Page, id: string) => {
  await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  return (await page.locator(`#${id}`).boundingBox())!;
};
const thrown = (page: Page) => page.locator(FLAGS).evaluateAll((els) => els.map((e) => e.textContent));
const drag = (page: Page, id: string) => page.locator(`#${id}`).evaluate((el) => {
  const r = el.getBoundingClientRect();
  const ev = (type: string, x: number) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, composed: true, pointerId: 3, pointerType: 'touch', isPrimary: true, clientX: x, clientY: r.y + r.height / 2, buttons: 1 }));
  ev('pointerdown', r.x + 20);
  return new Promise<void>((done) => { let x = r.x + 20; const step = () => { x += 12; ev('pointermove', x); if (x < r.x + 200) setTimeout(step, 20); else { ev('pointerup', x); done(); } }; step(); });
});

test.beforeEach(async ({ page }) => { await page.goto('/test/pages/effects.html'); });

test('a click throws 12 pride flags that are gone shortly after', async ({ page }) => {
  const b = await box(page, 'a');
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  const flags = await thrown(page);
  expect(flags.length).toBe(12);
  expect(new Set(flags)).toEqual(new Set(['🏳️‍🌈', '🏳️‍⚧️']));
  await expect(page.locator(FLAGS)).toHaveCount(0, { timeout: 2000 });
  await expect(page.locator(LAYER)).toHaveCSS('pointer-events', 'none');
  await expect(page.locator(LAYER)).toHaveAttribute('aria-hidden', 'true');
});

test('Enter and Space throw them too', async ({ page }) => {
  await page.locator('#a').getByRole('button').focus();
  await page.keyboard.press('Enter');
  expect((await thrown(page)).length).toBe(12);
  await expect(page.locator(FLAGS)).toHaveCount(0, { timeout: 2000 });
  await page.keyboard.press(' ');
  expect((await thrown(page)).length).toBe(12);
});

test('flags start at the badge that was clicked', async ({ page }) => {
  const b = await box(page, 'b');
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  const start = await page.locator(FLAGS).first().evaluate((el) => ({ x: parseFloat(el.style.left), y: parseFloat(el.style.top) }));
  expect(Math.abs(start.x - (b.x + b.width / 2))).toBeLessThan(6);
  expect(Math.abs(start.y - (b.y + b.height / 2))).toBeLessThan(6);
});

test('flags start at the badge inside a transformed, scrolled box', async ({ page }) => {
  await page.locator('#box').evaluate((el) => { el.scrollTop = 50; });
  const b = await box(page, 'boxed');
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  const start = await page.locator(FLAGS).first().evaluate((el) => ({ x: parseFloat(el.style.left), y: parseFloat(el.style.top) }));
  expect(Math.abs(start.x - (b.x + b.width / 2))).toBeLessThan(6);
  expect(Math.abs(start.y - (b.y + b.height / 2))).toBeLessThan(6);
  expect(await page.locator(LAYER).evaluate((el) => el.parentElement === document.body)).toBe(true);
});

test('the mouse leaves a rainbow trail within 60px, not further away', async ({ page, isMobile }) => {
  test.skip(isMobile, 'mouse');
  const b = await box(page, 'a');
  const y = b.y + b.height / 2;
  await page.mouse.move(b.x + b.width + 160, y);
  await page.mouse.move(b.x + b.width + 100, y, { steps: 4 });
  await expect(page.locator(TRAIL)).toHaveCount(0);
  await page.mouse.move(b.x + b.width + 40, y, { steps: 1 });
  expect(await page.locator(TRAIL).count()).toBeGreaterThan(0);
  const colours = await page.locator(TRAIL).evaluateAll((els) => [...new Set(els.map((e) => getComputedStyle(e).backgroundColor))]);
  expect(colours.length).toBe(6);
  await expect(page.locator(TRAIL)).toHaveCount(0, { timeout: 2000 });
});

test('a finger dragged from the badge leaves the trail; the badge holds the page still', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'touch');
  await box(page, 'a');
  await drag(page, 'a');
  expect(await page.locator(TRAIL).count()).toBeGreaterThan(0);
  await expect(page.locator('#a')).toHaveCSS('touch-action', 'none');
});

test('touch-trail="off": no trail from a finger, and the page scrolls', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'touch');
  await box(page, 'notouch');
  await drag(page, 'notouch');
  expect(await page.locator(TRAIL).count()).toBe(0);
  await expect(page.locator('#notouch')).not.toHaveCSS('touch-action', 'none');
});

test('trail="off": no trail from mouse or finger, the page scrolls, flags still fly', async ({ page, isMobile }) => {
  const b = await box(page, 'notrail');
  if (!isMobile) {
    const y = b.y + b.height / 2;
    await page.mouse.move(b.x + b.width + 100, y);
    await page.mouse.move(b.x + b.width + 20, y, { steps: 4 });
  } else {
    await drag(page, 'notrail');
    await expect(page.locator('#notrail')).not.toHaveCSS('touch-action', 'none');
  }
  await page.waitForTimeout(100);
  expect(await page.locator(TRAIL).count()).toBe(0); // counted at once: a trail fades on its own within 0.7s
  const c = await box(page, 'notrail');
  await page.mouse.click(c.x + c.width / 2, c.y + c.height / 2);
  expect(await page.locator(FLAGS).count()).toBeGreaterThan(0);
});

test('effects="off": nothing flies, no trail', async ({ page, isMobile }) => {
  const b = await box(page, 'off');
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  if (!isMobile) await page.mouse.move(b.x - 20, b.y + 10, { steps: 4 });
  else await drag(page, 'off');
  await page.waitForTimeout(100);
  expect(await page.locator(FLAGS).count()).toBe(0);
  expect(await page.locator(TRAIL).count()).toBe(0);
});

test('a badge removed and added again throws 12 flags, not 24; no layer is left behind', async ({ page }) => {
  await page.locator('#a').evaluate((el) => { const p = el.parentElement!; el.remove(); p.append(el); });
  const b = await box(page, 'a');
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  expect((await thrown(page)).length).toBe(12);
  await page.evaluate(() => document.querySelectorAll('pride-badge').forEach((el) => el.remove()));
  await expect(page.locator(LAYER)).toHaveCount(0);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('nothing flies and there is no trail', async ({ page, isMobile }) => {
    const b = await box(page, 'a');
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    if (!isMobile) await page.mouse.move(b.x - 20, b.y + 10, { steps: 4 });
    else await drag(page, 'a');
    await page.waitForTimeout(100);
    await expect(page.locator(FLAGS)).toHaveCount(0);
    await expect(page.locator(TRAIL)).toHaveCount(0);
  });
});
