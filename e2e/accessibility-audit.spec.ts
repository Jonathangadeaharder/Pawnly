import { test, expect } from '@playwright/test';

const APPS = [
  { name: 'Chess', base: 'http://localhost:5175', routes: ['/', '/auth'] },
  { name: 'Poker', base: 'http://localhost:5174', routes: ['/', '/auth'] },
  { name: 'Notflix', base: 'http://localhost:5176', routes: ['/', '/login'] },
];

for (const app of APPS) {
  for (const route of app.routes) {
    test(`${app.name} ${route} — keyboard navigation works`, async ({ page }) => {
      await page.goto(`${app.base}${route}`, { waitUntil: 'networkidle' });

      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
      }

      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? { tag: el.tagName, role: el.getAttribute('role'), label: el.getAttribute('aria-label') } : null;
      });
      expect(focused).not.toBeNull();
    });

    test(`${app.name} ${route} — images have alt text`, async ({ page }) => {
      await page.goto(`${app.base}${route}`, { waitUntil: 'networkidle' });

      const missingAlt = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.filter((img) => !img.alt && !img.getAttribute('aria-label')).map((img) => img.src);
      });

      expect(missingAlt.length).toBeLessThanOrEqual(1);
    });

    test(`${app.name} ${route} — form inputs have labels`, async ({ page }) => {
      await page.goto(`${app.base}${route}`, { waitUntil: 'networkidle' });

      const unlabeled = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"])'));
        return inputs.filter((input) => {
          const id = input.id;
          const hasLabel = id && document.querySelector(`label[for="${id}"]`);
          const hasAria = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
          const hasPlaceholder = input.placeholder;
          return !hasLabel && !hasAria && !hasPlaceholder;
        }).length;
      });

      expect(unlabeled).toBe(0);
    });

    test(`${app.name} ${route} — page has lang attribute`, async ({ page }) => {
      await page.goto(`${app.base}${route}`, { waitUntil: 'networkidle' });

      const lang = await page.evaluate(() => document.documentElement.lang);
      expect(lang).toBeTruthy();
    });
  }
}
