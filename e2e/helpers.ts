import { test as base, expect, type Page } from '@playwright/test';

export const TEST_CREDENTIALS = {
	existingEmail: process.env.E2E_USER_EMAIL ?? 'pawnly@example.com',
	existingPassword: process.env.E2E_USER_PASSWORD ?? '',
	testPassword: process.env.E2E_TEST_PASSWORD ?? '',
};

const { existingEmail: EXISTING_EMAIL, existingPassword: EXISTING_PASSWORD } = TEST_CREDENTIALS;

export async function navigateTo(page: Page, url: string) {
	await page.goto(url);
	await page.waitForLoadState('networkidle');
}

export async function loginUser(page: Page, email: string, password: string) {
	await navigateTo(page, '/auth');
	await page.getByRole('textbox', { name: 'Email' }).fill(email);
	await page.getByRole('textbox', { name: 'Password' }).fill(password);
	await page.getByRole('button', { name: 'Log in' }).click();
	await page.waitForURL('/', { timeout: 20000 });
}

export async function registerUser(page: Page, name: string, email: string, password: string) {
	await navigateTo(page, '/auth');
	await page.getByRole('button', { name: 'Create account' }).click();
	await page.waitForSelector('#displayName', { state: 'visible', timeout: 10000 });
	await page.locator('#displayName').fill(name);
	await page.getByRole('textbox', { name: 'Email' }).fill(email);
	await page.getByRole('textbox', { name: 'Password' }).fill(password);
	await page.getByRole('button', { name: 'Sign up' }).click();
	await page.waitForURL('/', { timeout: 15000 }).catch(async () => {
		await loginUser(page, email, password);
	});
}

export async function fillAuthForm(
	page: Page,
	email: string,
	password: string,
	{ submit = true }: { submit?: boolean } = {},
) {
	await navigateTo(page, '/auth');
	await page.getByRole('textbox', { name: 'Email' }).fill(email);
	await page.getByRole('textbox', { name: 'Password' }).fill(password);
	if (submit) {
		await page.getByRole('button', { name: 'Log in' }).click();
		await page.waitForLoadState('networkidle');
	}
}

export async function startGame(page: Page) {
	await navigateTo(page, '/play');
	const startBtn = page.getByRole('button', { name: /start/i });
	await expect(startBtn).toBeVisible();
	await startBtn.click();
	await expect(page).toHaveURL(/\/play\/game/, { timeout: 5000 });
}

export async function assertPageContains(page: Page, url: string, text: string | RegExp) {
	await navigateTo(page, url);
	await expect(page.getByText(text).first()).toBeVisible();
}

type AuthFixture = { authedPage: Page };

export const test = base.extend<AuthFixture>({
	authedPage: async ({ page }, use) => {
		await loginUser(page, EXISTING_EMAIL, EXISTING_PASSWORD);
		await use(page);
	},
});

export const APPS = [
	{
		name: 'Pawnly',
		base: 'http://localhost:5175',
		routes: ['/', '/play', '/play/game', '/puzzles', '/you', '/auth'] as const,
	},
];

export { EXISTING_EMAIL, EXISTING_PASSWORD, expect };
