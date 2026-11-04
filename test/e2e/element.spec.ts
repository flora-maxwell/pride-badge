import { test, expect, type Page } from '@playwright/test';

// The element itself: markup, look, attributes, accessibility (spec: docs/superpowers/specs/2026-11-02-pride-badge-package-design.md in floramaxwell.de).
const button = (page: Page, id: string) => page.locator(`#${id}`).getByRole('button');
// The flag's alt text is part of the name, as on floramaxwell.de (spec: "Die Flagge hat einen Alternativtext").
const EN = 'Intersex-inclusive Progress Pride flag ';
const DE = 'Intersex-inklusive Progress-Pride-Flagge ';
const style = (page: Page, sel: string, prop: string) =>
  page.locator(sel).evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

test.describe('basic page', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/test/pages/basic.html'); });

  test('is a button named after the sentence and what it does', async ({ page }) => {
    await expect(button(page, 'plain')).toHaveAccessibleName(EN + 'Stronger together. Throw some flags.');
    await expect(page.locator('#plain')).toHaveAttribute('data-key', 'stronger-together');
    await expect(page.locator('#plain').getByRole('img')).toHaveAccessibleName('Intersex-inclusive Progress Pride flag');
  });

  test('texts picks the first sentence; unknown words fall back', async ({ page }) => {
    await expect(button(page, 'safe')).toHaveAccessibleName(EN + "You’re safe with me. Throw some flags.");
    await expect(button(page, 'nonsense')).toHaveAccessibleName(EN + 'Stronger together. Throw some flags.');
  });

  test('speaks German with lang="de"', async ({ page }) => {
    await expect(button(page, 'de')).toHaveAccessibleName(DE + 'Gemeinsam stärker. Wirf ein paar Flaggen.');
    await expect(page.locator('#de').getByRole('img')).toHaveAccessibleName('Intersex-inklusive Progress-Pride-Flagge');
  });

  test('re-renders when attributes change later', async ({ page }) => {
    await page.locator('#plain').evaluate((el) => { el.setAttribute('texts', 'love-is-love'); el.setAttribute('lang', 'de'); });
    await expect(button(page, 'plain')).toHaveAccessibleName(DE + 'Liebe ist Liebe. Wirf ein paar Flaggen.');
    await expect(page.locator('#plain').getByRole('img')).toHaveAccessibleName('Intersex-inklusive Progress-Pride-Flagge');
  });

  test('looks like the Figma badge at 16px', async ({ page }) => {
    const b = '#plain >> button';
    expect(await style(page, b, 'background-color')).toBe('rgb(250, 250, 250)');
    expect(await style(page, b, 'color')).toBe('rgb(24, 24, 27)');
    expect(await style(page, b, 'padding')).toBe('8px 16px 8px 8px');
    expect((await page.locator(b).boundingBox())!.height).toBeCloseTo(40, 0);
    const flag = page.locator('#plain').getByRole('img');
    const box = (await flag.boundingBox())!;
    expect([Math.round(box.width), Math.round(box.height)]).toEqual([39, 24]);
    expect(await flag.evaluate((el) => getComputedStyle(el).borderRadius)).toBe('4px');
    const shadow = await style(page, b, 'box-shadow');
    expect(shadow).toContain('rgba(0, 0, 0, 0.07) 0px 0px 0px 1px');
    expect(shadow).toContain('rgba(0, 0, 0, 0.08) 0px 4px 14px');
  });

  test('grows with the font size', async ({ page }) => {
    expect((await page.locator('#big >> button').boundingBox())!.height).toBeCloseTo(80, 0);
    const flag = page.locator('#big').getByRole('img');
    const box = (await flag.boundingBox())!;
    expect([Math.round(box.width), Math.round(box.height)]).toEqual([78, 48]);
    expect(await flag.evaluate((el) => getComputedStyle(el).borderRadius)).toBe('8px');
  });

  test('takes its colours from CSS variables', async ({ page }) => {
    expect(await style(page, '#dark >> button', 'background-color')).toBe('rgb(24, 24, 27)');
    expect(await style(page, '#dark >> button', 'color')).toBe('rgb(250, 250, 250)');
  });

  test('shadow="off" keeps only the contour', async ({ page }) => {
    const shadow = await style(page, '#noshadow >> button', 'box-shadow');
    expect(shadow).toContain('0px 0px 0px 1px');
    expect(shadow).not.toContain('4px 14px');
  });

  test('can be reached with the keyboard and shows a focus ring', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit on iOS does not tab to buttons');
    await page.keyboard.press('Tab');
    await expect(button(page, 'plain')).toBeFocused();
    expect(await style(page, '#plain >> button', 'outline-style')).not.toBe('none');
    expect(await style(page, '#plain >> button', 'outline-offset')).toBe('2px');
  });

  test("takes the site's focus style from the three focus variables", async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit on iOS does not tab to buttons');
    await page.keyboard.press('Tab');
    await page.locator('#ownfocus').getByRole('button').focus();
    const s = await page.locator('#ownfocus >> button').evaluate((el) => {
      const c = getComputedStyle(el);
      return { style: c.outlineStyle, width: c.outlineWidth, color: c.outlineColor, offset: c.outlineOffset, glow: c.boxShadow.includes('5px'), contour: c.boxShadow.includes('0px 0px 0px 1px') };
    });
    expect(s).toEqual({ style: 'dashed', width: '3px', color: 'rgb(109, 40, 217)', offset: '6px', glow: false, contour: true });
  });
});

test('follows the page language (de-AT → German)', async ({ page }) => {
  await page.goto('/test/pages/page-de.html');
  await expect(page.getByRole('button')).toHaveAccessibleName(DE + 'Gemeinsam stärker. Wirf ein paar Flaggen.');
});

test('keeps its own spacing on a page with odd inherited text styles', async ({ page }) => {
  await page.goto('/test/pages/hostile.html');
  const b = page.getByRole('button');
  await expect(b).toBeVisible();
  await expect(b).toHaveAccessibleName(EN + 'Stronger together. Throw some flags.');
  const s = await b.evaluate((el) => {
    const c = getComputedStyle(el);
    return { ls: c.letterSpacing, tt: c.textTransform, ws: c.wordSpacing, font: c.fontFamily, style: c.fontStyle, variant: c.fontVariantCaps,
      shadow: c.textShadow, fill: c.getPropertyValue('-webkit-text-fill-color'), color: c.color, dir: c.direction };
  });
  expect(s).toEqual({ ls: 'normal', tt: 'none', ws: '0px', font: 'Georgia, serif', style: 'normal', variant: 'normal', shadow: 'none', fill: 'rgb(24, 24, 27)', color: 'rgb(24, 24, 27)', dir: 'ltr' });
  const flag = (await page.getByRole('img').boundingBox())!;
  const words = (await page.locator('pride-badge >> .text').boundingBox())!;
  expect(flag.x).toBeLessThan(words.x); // the flag stays on the left
  expect((await b.boundingBox())!.height).toBeCloseTo(40, 0);
});

test('tells screen readers which language the sentence is in', async ({ page }) => {
  await page.goto('/test/pages/page-fr.html');
  expect(await page.locator('#plain >> button').getAttribute('lang')).toBe('en');
  expect(await page.locator('#es >> button').getAttribute('lang')).toBe('en');
  expect(await page.locator('#de >> button').getAttribute('lang')).toBe('de');
  expect(await page.locator('#de >> .live').getAttribute('lang')).toBe('de');
});

test('says nothing about flags when none fly', async ({ page }) => {
  await page.goto('/test/pages/page-fr.html');
  await expect(page.locator('#off').getByRole('button')).toHaveAccessibleName(EN + 'Stronger together.');
  await page.locator('#off').evaluate((el) => el.removeAttribute('effects'));
  await expect(page.locator('#off').getByRole('button')).toHaveAccessibleName(EN + 'Stronger together. Throw some flags.');
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test("no flags fly, so the button doesn't promise any", async ({ page }) => {
    await page.goto('/test/pages/page-fr.html');
    await expect(page.locator('#plain').getByRole('button')).toHaveAccessibleName(EN + 'Stronger together.');
  });
});
