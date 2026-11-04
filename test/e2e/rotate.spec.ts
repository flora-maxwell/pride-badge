import { test, expect, type Page } from '@playwright/test';

// A click moves on to the next sentence of `texts` with Flo's "Rollen" (prototype, 2026-11-03).
const EN = 'Intersex-inclusive Progress Pride flag ';
const button = (page: Page, id: string) => page.locator(`#${id}`).getByRole('button');
const text = (page: Page, id: string) => page.locator(`#${id} >> .text`).evaluate((el) => el.textContent!.trim());
const live = (page: Page, id: string) => page.locator(`#${id} >> .live`).evaluate((el) => el.textContent);
const settle = (page: Page, id: string) => page.locator(`#${id}`).evaluate((el) =>
  Promise.all(el.shadowRoot!.getAnimations({ subtree: true } as never).map((a) => a.finished.catch(() => {}))));

test.beforeEach(async ({ page }) => { await page.goto('/test/pages/rotate.html'); });

test('each click shows the next sentence and wraps after the fourth', async ({ page }) => {
  await button(page, 'all').click();
  await expect(button(page, 'all')).toHaveAccessibleName(EN + "You’re safe with me. Throw some flags.");
  await expect(page.locator('#all')).toHaveAttribute('data-key', 'safe-with-me');
  for (let i = 0; i < 3; i++) await button(page, 'all').click();
  await settle(page, 'all');
  await expect(page.locator('#all')).toHaveAttribute('data-key', 'stronger-together');
  expect(await text(page, 'all')).toBe('Stronger together.');
});

test('texts sets the sentences and their order', async ({ page }) => {
  await expect(page.locator('#two')).toHaveAttribute('data-key', 'you-belong');
  await button(page, 'two').click();
  await settle(page, 'two');
  expect(await text(page, 'two')).toBe("You’re safe with me.");
  await button(page, 'two').click();
  await settle(page, 'two');
  expect(await text(page, 'two')).toBe('You belong here.');
});

test('one sentence: no change, but the flags still fly', async ({ page }) => {
  await button(page, 'one').click();
  expect(await page.locator('[data-pride-flag]').count()).toBe(12);
  await settle(page, 'one');
  expect(await text(page, 'one')).toBe('Love is love.');
  expect(await live(page, 'one')).toBe('');
});

test('German: the next sentence is announced politely', async ({ page }) => {
  await button(page, 'de').click();
  await settle(page, 'de');
  expect(await text(page, 'de')).toBe('Bei mir bist du sicher.');
  expect(await live(page, 'de')).toBe('Bei mir bist du sicher.');
  await expect(page.locator('#de >> .live')).toHaveAttribute('aria-live', 'polite');
});

test('effects="off": the sentence stays', async ({ page }) => {
  await button(page, 'off').click();
  await page.waitForTimeout(500);
  expect(await text(page, 'off')).toBe('Stronger together.');
  expect(await live(page, 'off')).toBe('');
});

test('the sentence rolls: the new one comes in from below, the pill glides to its width', async ({ page }) => {
  await button(page, 'all').click();
  const kinds = await page.locator('#all').evaluate((el) =>
    el.shadowRoot!.getAnimations({ subtree: true } as never).map((a) => JSON.stringify((a.effect as KeyframeEffect).getKeyframes().map((k) => k.transform ?? k.width ?? null))));
  expect(kinds.some((k) => k.includes('translateY(70%)'))).toBe(true);
  expect(kinds.some((k) => k.includes('translateY(-70%)'))).toBe(true);
  expect(kinds.some((k) => k.includes('px'))).toBe(true);
});

test('rapid clicks: one sentence per click, at most 40 flags, the right width at the end', async ({ page }) => {
  await button(page, 'all').evaluate((b) => { for (let i = 0; i < 5; i++) (b as HTMLElement).click(); });
  expect(await page.locator('[data-pride-flag]').count()).toBeLessThanOrEqual(40);
  await settle(page, 'all');
  await expect(page.locator('#all')).toHaveAttribute('data-key', 'safe-with-me');
  const [w, ref] = await Promise.all([button(page, 'all').boundingBox(), button(page, 'ref').boundingBox()]);
  expect(Math.abs(w!.width - ref!.width)).toBeLessThanOrEqual(1);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('the sentence still changes, without animation', async ({ page }) => {
    await button(page, 'all').click();
    expect(await text(page, 'all')).toBe("You’re safe with me.");
    expect(await page.locator('#all').evaluate((el) => el.shadowRoot!.getAnimations({ subtree: true } as never).length)).toBe(0);
    expect(await page.locator('[data-pride-flag]').count()).toBe(0);
  });
});

test('a second click mid-glide carries on from the width on screen, without a jump', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'one engine is enough for the timing');
  const jump = await button(page, 'all').evaluate(async (b) => {
    (b as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 150));
    const before = parseFloat(getComputedStyle(b).width);
    (b as HTMLElement).click();
    const after = parseFloat(getComputedStyle(b).width);
    return Math.abs(after - before);
  });
  expect(jump).toBeLessThan(2);
});
