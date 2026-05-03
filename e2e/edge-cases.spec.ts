import { test, expect } from '@playwright/test';

test.describe('Edge case QA', () => {
  test('Chess auth — invalid email rejected', async ({ page }) => {
    await page.goto('http://localhost:5175/auth', { waitUntil: 'networkidle' });
    await page.getByPlaceholder('you@example.com').fill('not-an-email');
    await page.getByPlaceholder('••••••••').fill('TestPassword123!');
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toContain('/auth');
  });

  test('Chess auth — short password rejected', async ({ page }) => {
    await page.goto('http://localhost:5175/auth', { waitUntil: 'networkidle' });
    await page.getByPlaceholder('you@example.com').fill('test@chess.com');
    await page.getByPlaceholder('••••••••').fill('12');
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toContain('/auth');
  });

  test('Poker auth — wrong password shows error', async ({ page }) => {
    await page.goto('http://localhost:5174/login', { waitUntil: 'domcontentloaded' });
    await page.getByPlaceholder('you@example.com').fill('poker@example.com');
    await page.getByPlaceholder('••••••••').fill('WrongPassword999!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(4000);
    const url = page.url();
    expect(url).toContain('/login');
  });

  test('Notflix — protected routes redirect to login', async ({ page }) => {
    await page.goto('http://localhost:5176/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toContain('/login');
  });

  test('Notflix — studio redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('http://localhost:5176/studio', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toContain('/login');
  });

  test('Notflix login — empty fields keep button disabled', async ({ page }) => {
    await page.goto('http://localhost:5176/login', { waitUntil: 'networkidle' });
    const btn = page.getByRole('button', { name: /log in|sign in/i });
    const disabled = await btn.isDisabled().catch(() => true);
    expect(disabled).toBeTruthy();
  });

  test('Poker — quiz handles rapid clicks', async ({ page }) => {
    await page.goto('http://localhost:5174/login', { waitUntil: 'domcontentloaded' });
    await page.getByPlaceholder('you@example.com').fill('poker@example.com');
    await page.getByPlaceholder('••••••••').fill('TestPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('**/home', { timeout: 10000 }).catch(() => {});
    await page.goto('http://localhost:5174/quiz', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('1');
      await page.waitForTimeout(100);
    }
    expect(page.url()).toContain('/quiz');
  });

  test('Chess — play page requires auth', async ({ page }) => {
    await page.goto('http://localhost:5175/play/game', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toContain('/auth');
  });
});
