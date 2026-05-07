import { expect, TEST_CREDENTIALS, test } from './helpers';

test('Chess auth — invalid email rejected', async ({ authedPage: page }) => {
	await page.goto('/auth', { waitUntil: 'networkidle' });
	await page.getByPlaceholder('you@example.com').fill('not-an-email');
	await page.getByPlaceholder('••••••••').fill(TEST_CREDENTIALS.testPassword);
	await page.getByRole('button', { name: /log in/i }).click();
	await page.waitForLoadState('networkidle');
	expect(page.url()).toContain('/auth');
});

test('Chess auth — short password rejected', async ({ authedPage: page }) => {
	await page.goto('/auth', { waitUntil: 'networkidle' });
	await page.getByPlaceholder('you@example.com').fill('test@chess.com');
	await page.getByPlaceholder('••••••••').fill('12');
	await page.getByRole('button', { name: /log in/i }).click();
	await page.waitForLoadState('networkidle');
	expect(page.url()).toContain('/auth');
});

test('Chess — play page requires auth', async ({ page }) => {
	await page.goto('/play/game', { waitUntil: 'networkidle' });
	await page.waitForLoadState('networkidle');
	expect(page.url()).toContain('/auth');
});
