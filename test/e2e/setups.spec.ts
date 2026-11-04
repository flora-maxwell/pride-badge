import { test, expect } from '@playwright/test';

// Other people's sites: a strict Content-Security-Policy, the script loaded more than once.
test('works under a strict Content-Security-Policy with Trusted Types', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/test/pages/csp.html');
  const b = page.getByRole('button');
  await expect(b).toHaveCSS('background-color', 'rgb(250, 250, 250)');
  await b.click();
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => (window as unknown as { violations: string[] }).violations)).toEqual([]);
  expect(errors).toEqual([]);
});

test('loading the script twice (and the module) is harmless', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/test/pages/twice.html');
  await expect(page.getByRole('button')).toBeVisible();
  await page.waitForTimeout(300);
  expect(errors).toEqual([]);
});

test('the CDN file and the module carry the MIT notice', async ({ request }) => {
  for (const f of ['/dist/pride-badge.js', '/dist/pride-badge.mjs']) {
    const head = (await (await request.get(f)).text()).slice(0, 200);
    expect(head).toMatch(/^\/\*! pride-badge \d+\.\d+\.\d+ \| MIT © Flora Maxwell/);
  }
});
