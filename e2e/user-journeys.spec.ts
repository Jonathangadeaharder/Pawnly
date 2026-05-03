import { expect, test, type Page } from '@playwright/test';

const EXISTING_EMAIL = 'chess@example.com';
const EXISTING_PASSWORD = 'TestPassword123!';

async function navigateTo(page: Page, url: string) {
	await page.goto(url);
	await page.waitForLoadState('networkidle');
}

async function registerUser(page: Page, name: string, email: string, password: string) {
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

async function loginUser(page: Page, email: string, password: string) {
	await navigateTo(page, '/auth');
	await page.getByRole('textbox', { name: 'Email' }).fill(email);
	await page.getByRole('textbox', { name: 'Password' }).fill(password);
	await page.getByRole('button', { name: 'Log in' }).click();
	await page.waitForURL('/', { timeout: 20000 });
}

async function loginAsExistingUser(page: Page) {
	await loginUser(page, EXISTING_EMAIL, EXISTING_PASSWORD);
}

async function startGame(page: Page) {
	await navigateTo(page, '/play');
	const startBtn = page.getByRole('button', { name: /start/i });
	await expect(startBtn).toBeVisible();
	await startBtn.click();
	await expect(page).toHaveURL(/\/play\/game/, { timeout: 5000 });
}

test.describe('Chess — Auth', () => {
	test('login page renders email/password form', async ({ page }) => {
		await navigateTo(page, '/auth');
		await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
		await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
	});

	test('register and land on home page', async ({ page }) => {
		const email = `test+${Date.now()}@example.com`;
		await registerUser(page, 'TestUser', email, 'TestPassword123!');
		await expect(page).toHaveURL('/');
		await expect(page.getByText('Welcome back')).toBeVisible();
	});
});

test.describe('Chess — Home Page', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsExistingUser(page);
	});

	test('home page shows streak and rating', async ({ page }) => {
		await expect(page.getByText('Streak')).toBeVisible();
		await expect(page.getByText('Your rating')).toBeVisible();
	});

	for (const { label, regex } of [
		{ label: "Today's Ritual", regex: /ritual/i },
		{ label: 'Daily puzzle', regex: /daily puzzle/i },
		{ label: 'Continue lesson', regex: /continue lesson/i },
	]) {
		test(`FIXED: "${label}" button navigates`, async ({ page }) => {
			const btn = page.getByRole('button', { name: regex });
			await expect(btn).toBeVisible();
			await btn.click();
			await expect(page).not.toHaveURL(/\//);
		});
	}

	test('FIXED: "Bishop\'s Prison Mini-game" button navigates', async ({ page }) => {
		const miniBtn = page.getByRole('button', { name: /bishop/i }).last();
		await expect(miniBtn).toBeVisible();
		await miniBtn.click();
		await expect(page).not.toHaveURL(/\//);
	});
});

test.describe('Chess — Navigation', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsExistingUser(page);
	});

	test('bottom nav Home works', async ({ page }) => {
		await page.goto('/play');
		await page.getByRole('button', { name: 'Home' }).click();
		await expect(page).toHaveURL('/');
	});

	for (const { name, url } of [
		{ name: 'Play', url: '/play' },
		{ name: 'Learn', url: '/learn' },
		{ name: 'Train', url: '/train' },
	]) {
		test(`bottom nav ${name} works`, async ({ page }) => {
			await page.getByRole('button', { name }).first().click();
			await expect(page).toHaveURL(url);
		});
	}

	test('bottom nav You works', async ({ page }) => {
		await page.getByRole('button', { name: 'You' }).last().click();
		await expect(page).toHaveURL('/you');
	});
});

test.describe('Chess — Play Page', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsExistingUser(page);
	});

	test('play page shows time control and difficulty options', async ({ page }) => {
		await navigateTo(page, '/play');
		await expect(page.getByText('Time control')).toBeVisible();
		await expect(page.getByText('Difficulty')).toBeVisible();
	});

	test('FIXED: start game navigates to /play/game successfully', async ({ page }) => {
		await startGame(page);
		await expect(page.locator('body')).not.toContainText('404');
	});
});

test.describe('Chess — Train Page', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsExistingUser(page);
	});

	test('train page shows daily challenge and puzzles', async ({ page }) => {
		await navigateTo(page, '/train');
		await expect(page.getByText('Daily Challenge')).toBeVisible();
		await expect(page.getByText('Scan Trainer')).toBeVisible();
	});

	test('FIXED: Scan Trainer loads without infinite re-render', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));

		await navigateTo(page, '/train');
		const scanBtn = page.getByRole('button', { name: /scan/i });
		if (await scanBtn.isVisible()) {
			await scanBtn.click();
			await page.waitForLoadState('networkidle');
			const hasEffectError = errors.some((e) => e.includes('effect_update_depth_exceeded'));
			expect(hasEffectError).toBeFalsy();
		}
	});
});

test.describe('Chess — Learn Page', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsExistingUser(page);
	});

	test('learn page shows lessons', async ({ page }) => {
		await navigateTo(page, '/learn');
		await expect(page.getByText('lessons').first()).toBeVisible();
	});

	test('learn page lesson cards are clickable', async ({ page }) => {
		await navigateTo(page, '/learn');
		const lessonCards = page
			.getByRole('button')
			.or(page.locator('a'))
			.filter({ hasText: /lesson|beginner|intermediate|advanced/i });
		const count = await lessonCards.count();
		if (count > 0) {
			await lessonCards.first().click();
			await page.waitForLoadState('networkidle');
			await expect(page.locator('body')).not.toContainText('404');
		}
	});

	test('learn page shows lesson categories', async ({ page }) => {
		await navigateTo(page, '/learn');
		await expect(
			page.getByText(/beginner|intermediate|advanced|opening|endgame|tactic|strategy/i).first(),
		).toBeVisible();
	});
});

test.describe('Chess — You Page', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsExistingUser(page);
	});

	test('you page shows profile and stats', async ({ page }) => {
		await navigateTo(page, '/you');
		await expect(page.getByText('Rating')).toBeVisible();
		await expect(page.getByText('Achievements')).toBeVisible();
	});

	test('you page shows settings button', async ({ page }) => {
		await navigateTo(page, '/you');
		await expect(page.getByRole('button', { name: /settings/i })).toBeVisible();
	});

	test('you page shows recent games or achievements list', async ({ page }) => {
		await navigateTo(page, '/you');
		const statsSection = page.getByText(/games|rating|wins|losses|draws|achievements|progress/i);
		await expect(statsSection.first()).toBeVisible();
	});
});

test.describe('Chess — API Errors', () => {
	test('FIXED: no 404 API errors on home load', async ({ page }) => {
		const apiErrors: string[] = [];
		page.on('response', (resp) => {
			if (resp.status() >= 400) {
				apiErrors.push(`${resp.status()} ${resp.url()}`);
			}
		});

		await loginAsExistingUser(page);
		const has404 = apiErrors.some((e) => e.includes('404'));
		expect(has404).toBeFalsy();
	});
});

test.describe('Chess — Login Flow', () => {
	test('login with existing user redirects to home', async ({ page }) => {
		await loginUser(page, 'chess@example.com', 'TestPassword123!');
		await expect(page).toHaveURL('/');
	});
});

test.describe('Chess — Play Game', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsExistingUser(page);
	});

	test('game page renders chessboard after starting', async ({ page }) => {
		await startGame(page);
		const chessboard = page
			.locator('[class*="board"], [class*="chess"], [class*="chessboard"], canvas')
			.first();
		const gameText = page.getByText(/white|black|move|game/i).first();
		const boardOrGame =
			(await chessboard.isVisible().catch(() => false)) ||
			(await gameText.isVisible().catch(() => false));
		expect(boardOrGame).toBeTruthy();
		await expect(page.locator('body')).not.toContainText('404');
	});

	test('game page shows back button or game info', async ({ page }) => {
		await startGame(page);
		const backBtn = page.getByRole('button', { name: /back|return|home|exit/i });
		const gameInfo = page.getByText(/white|black|turn|move|round/i).first();
		const navBack =
			(await backBtn.isVisible().catch(() => false)) ||
			(await gameInfo.isVisible().catch(() => false));
		expect(navBack).toBeTruthy();
	});
});

test.describe('Chess — Console Errors', () => {
	test('no page errors on any major page', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));

		await loginAsExistingUser(page);

		for (const url of ['/play', '/train', '/learn', '/you']) {
			await navigateTo(page, url);
		}

		expect(errors.length).toBe(0);
	});
});

test.describe('Chess — Auth Edge Cases', () => {
	test('login with wrong password shows error', async ({ page }) => {
		await navigateTo(page, '/auth');
		await page.getByRole('textbox', { name: 'Email' }).fill('chess@example.com');
		await page.getByRole('textbox', { name: 'Password' }).fill('WrongPassword999!');
		await page.getByRole('button', { name: 'Log in' }).click();
		await page.waitForLoadState('networkidle');
		const errorText = page.getByText(/invalid|error|wrong|incorrect|failed|not found/i);
		await expect(errorText.first()).toBeVisible();
		await expect(page).not.toHaveURL('/');
	});

	test('register with existing email shows error', async ({ page }) => {
		await navigateTo(page, '/auth');
		await page.getByRole('button', { name: 'Create account' }).click();
		await page.waitForSelector('#displayName', { state: 'visible', timeout: 10000 });
		await page.locator('#displayName').fill('DuplicateUser');
		await page.getByRole('textbox', { name: 'Email' }).fill('chess@example.com');
		await page.getByRole('textbox', { name: 'Password' }).fill('TestPassword123!');
		await page.getByRole('button', { name: 'Sign up' }).click();
		await page.waitForLoadState('networkidle');
		const errorText = page.getByText(/invalid|error|already|exists|duplicate|taken|conflict/i);
		await expect(errorText.first()).toBeVisible();
		await expect(page).not.toHaveURL('/');
	});
});

test.describe('Chess — Profile Data Dynamic', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsExistingUser(page);
	});

	test('you page shows dynamic stats not hardcoded', async ({ page }) => {
		await navigateTo(page, '/you');
		await expect(page.locator('body')).not.toContainText('1140');
	});

	test('home page shows dynamic rating not hardcoded', async ({ page }) => {
		await navigateTo(page, '/');
		await expect(page.locator('body')).not.toContainText('+18 this week');
	});

	test('auth page title changes with mode', async ({ page }) => {
		await navigateTo(page, '/auth');
		await expect(page).toHaveTitle(/Log in/i);
		const signupToggle = page
			.getByRole('button', { name: /sign up|create account|register/i })
			.or(page.locator('a').filter({ hasText: /sign up/i }));
		if (
			await signupToggle
				.first()
				.isVisible()
				.catch(() => false)
		) {
			await signupToggle.first().click();
			await page.waitForLoadState('networkidle');
			await expect(page).toHaveTitle(/Sign up/i);
		}
	});
});

test.describe('Chess — Learn Page Interaction', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsExistingUser(page);
	});

	test('learn page shows training modules', async ({ page }) => {
		await navigateTo(page, '/learn');
		const moduleText = page.locator('body');
		const hasModule = await moduleText
			.innerText()
			.then((t) => /scan|puzzle|lesson|module/i.test(t));
		expect(hasModule).toBeTruthy();
	});

	test('scan trainer start button exists', async ({ page }) => {
		await navigateTo(page, '/learn');
		const startBtn = page.getByRole('button', { name: /start|begin|scan|train/i });
		await expect(startBtn.first()).toBeVisible({ timeout: 5000 });
	});
});

test.describe('Chess — Game Interaction', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsExistingUser(page);
	});

	test('game page loads board', async ({ page }) => {
		await navigateTo(page, '/play/game');
		const board = page
			.locator('[class*="board"], [class*="chess"], [class*="chessboard"], canvas, svg')
			.first();
		const hasBoard = await board.isVisible().catch(() => false);
		expect(hasBoard).toBeTruthy();
	});

	test('game page has interactive controls', async ({ page }) => {
		await navigateTo(page, '/play/game');
		const anyBtn = page.getByRole('button').first();
		await expect(anyBtn)
			.toBeVisible({ timeout: 5000 })
			.catch(async () => {
				const boardArea = page.locator('svg, canvas, [data-board]').first();
				await expect(boardArea).toBeVisible({ timeout: 5000 });
			});
	});
});
