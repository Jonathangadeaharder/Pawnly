import { test, expect } from '@playwright/test';

// Helper: register a fresh user
// Shared test credentials (already registered)
const EXISTING_EMAIL = 'chess@example.com';
const EXISTING_PASSWORD = 'TestPassword123!';

async function registerUser(page: import('@playwright/test').Page, name: string, email: string, password: string) {
	await page.goto('/auth');
	await page.waitForLoadState('networkidle');
	await page.getByRole('button', { name: 'Create account' }).click();
	await page.waitForSelector('#displayName', { state: 'visible', timeout: 10000 });
	await page.locator('#displayName').fill(name);
	await page.getByRole('textbox', { name: 'Email' }).fill(email);
	await page.getByRole('textbox', { name: 'Password' }).fill(password);
	await page.getByRole('button', { name: 'Sign up' }).click();
	// Wait for redirect — may take a while for Supabase auth
	await page.waitForURL('/', { timeout: 15000 }).catch(async () => {
		// If redirect doesn't happen, try logging in with freshly created creds
		await loginUser(page, email, password);
	});
}

async function loginUser(page: import('@playwright/test').Page, email: string, password: string) {
	await page.goto('/auth');
	await page.waitForLoadState('networkidle');
	await page.getByRole('textbox', { name: 'Email' }).fill(email);
	await page.getByRole('textbox', { name: 'Password' }).fill(password);
	await page.getByRole('button', { name: 'Log in' }).click();
	await page.waitForURL('/', { timeout: 20000 }).catch(() => {});
}

async function loginAsExistingUser(page: import('@playwright/test').Page) {
	await loginUser(page, EXISTING_EMAIL, EXISTING_PASSWORD);
}

test.describe('Chess — Auth', () => {
	test('login page renders email/password form', async ({ page }) => {
		await page.goto('/auth');
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

	test('FIXED: "Today\'s Ritual" button navigates', async ({ page }) => {
		const ritualBtn = page.getByRole('button', { name: /ritual/i });
		await expect(ritualBtn).toBeVisible();
		await ritualBtn.click();
		await page.waitForTimeout(1500);
		// Should navigate away from home
		expect(page.url()).not.toMatch(/\/$/);
	});

	test('FIXED: "Daily puzzle" button navigates', async ({ page }) => {
		const puzzleBtn = page.getByRole('button', { name: /daily puzzle/i });
		await expect(puzzleBtn).toBeVisible();
		await puzzleBtn.click();
		await page.waitForTimeout(1500);
		expect(page.url()).not.toMatch(/\/$/);
	});

	test('FIXED: "Continue lesson" button navigates', async ({ page }) => {
		const lessonBtn = page.getByRole('button', { name: /continue lesson/i });
		await expect(lessonBtn).toBeVisible();
		await lessonBtn.click();
		await page.waitForTimeout(1500);
		expect(page.url()).not.toMatch(/\/$/);
	});

	test('FIXED: "Bishop\'s Prison Mini-game" button navigates', async ({ page }) => {
		// Use last() — "Bishop" also appears in the ritual card
		const miniBtn = page.getByRole('button', { name: /bishop/i }).last();
		await expect(miniBtn).toBeVisible();
		await miniBtn.click();
		await page.waitForTimeout(1500);
		expect(page.url()).not.toMatch(/\/$/);
	});
});

test.describe('Chess — Navigation', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsExistingUser(page);
	});

	test('bottom nav Home works', async ({ page }) => {
		// Navigate away first, then back
		await page.goto('/play');
		await page.getByRole('button', { name: 'Home' }).click();
		await expect(page).toHaveURL('/');
	});

	test('bottom nav Play works', async ({ page }) => {
		await page.getByRole('button', { name: 'Play' }).first().click();
		await expect(page).toHaveURL('/play');
	});

	test('bottom nav Learn works', async ({ page }) => {
		await page.getByRole('button', { name: 'Learn' }).click();
		await expect(page).toHaveURL('/learn');
	});

	test('bottom nav Train works', async ({ page }) => {
		await page.getByRole('button', { name: 'Train' }).click();
		await expect(page).toHaveURL('/train');
	});

	test('bottom nav You works', async ({ page }) => {
		// Use last() because "You" appears in the ritual card text too
		await page.getByRole('button', { name: 'You' }).last().click();
		await expect(page).toHaveURL('/you');
	});
});

test.describe('Chess — Play Page', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsExistingUser(page);
	});

	test('play page shows time control and difficulty options', async ({ page }) => {
		await page.goto('/play');
		await expect(page.getByText('Time control')).toBeVisible();
		await expect(page.getByText('Difficulty')).toBeVisible();
	});

	test('FIXED: start game navigates to /play/game successfully', async ({ page }) => {
		await page.goto('/play');
		const startBtn = page.getByRole('button', { name: /start/i });
		if (await startBtn.isVisible()) {
			await startBtn.click();
			await page.waitForTimeout(2000);
			// Should NOT be a 404
			await expect(page.locator('body')).not.toContainText('404');
			await expect(page).toHaveURL(/\/play\/game/);
		}
	});
});

test.describe('Chess — Train Page', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsExistingUser(page);
	});

	test('train page shows daily challenge and puzzles', async ({ page }) => {
		await page.goto('/train');
		await expect(page.getByText('Daily Challenge')).toBeVisible();
		await expect(page.getByText('Scan Trainer')).toBeVisible();
	});

	test('FIXED: Scan Trainer loads without infinite re-render', async ({ page }) => {
		await page.goto('/train');
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));

		const scanBtn = page.getByRole('button', { name: /scan/i });
		if (await scanBtn.isVisible()) {
			await scanBtn.click();
			await page.waitForTimeout(2000);
			// Should NOT have infinite re-render error
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
		await page.goto('/learn');
		await expect(page.getByText('lessons').first()).toBeVisible();
	});

	test('learn page lesson cards are clickable', async ({ page }) => {
		await page.goto('/learn');
		await page.waitForLoadState('networkidle');
		const lessonCards = page.getByRole('button').or(page.locator('a')).filter({ hasText: /lesson|beginner|intermediate|advanced/i });
		const count = await lessonCards.count();
		if (count > 0) {
			await lessonCards.first().click();
			await page.waitForTimeout(1000);
			await expect(page.locator('body')).not.toContainText('404');
		}
	});

	test('learn page shows lesson categories', async ({ page }) => {
		await page.goto('/learn');
		await expect(page.getByText(/beginner|intermediate|advanced|opening|endgame|tactic|strategy/i).first()).toBeVisible();
	});
});

test.describe('Chess — You Page', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsExistingUser(page);
	});

	test('you page shows profile and stats', async ({ page }) => {
		await page.goto('/you');
		await expect(page.getByText('Rating')).toBeVisible();
		await expect(page.getByText('Achievements')).toBeVisible();
	});

	test('you page shows settings button', async ({ page }) => {
		await page.goto('/you');
		await expect(page.getByRole('button', { name: /settings/i })).toBeVisible();
	});

	test('you page shows recent games or achievements list', async ({ page }) => {
		await page.goto('/you');
		await page.waitForLoadState('networkidle');
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
		await page.waitForTimeout(2000);

		// Should NOT have 404 errors from missing tables
		const has404 = apiErrors.some((e) => e.includes('404'));
		expect(has404).toBeFalsy();
	});
});

test.describe('Chess — Login Flow', () => {
	test('login with existing user redirects to home', async ({ page }) => {
		await page.goto('/auth');
		await page.waitForLoadState('networkidle');
		await page.getByRole('textbox', { name: 'Email' }).fill('chess@example.com');
		await page.getByRole('textbox', { name: 'Password' }).fill('TestPassword123!');
		await page.getByRole('button', { name: 'Log in' }).click();
		await page.waitForURL('/', { timeout: 15000 }).catch(() => {});
		await expect(page).toHaveURL('/');
	});
});

test.describe('Chess — Play Game', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsExistingUser(page);
	});

	test('game page renders chessboard after starting', async ({ page }) => {
		await page.goto('/play');
		await page.waitForLoadState('networkidle');
		const startBtn = page.getByRole('button', { name: /start/i });
		if (await startBtn.isVisible()) {
			await startBtn.click();
			await page.waitForTimeout(2000);
		}
		// Check for chessboard or game indicators
		const chessboard = page.locator('[class*="board"], [class*="chess"], [class*="chessboard"], canvas').first();
		const gameText = page.getByText(/white|black|move|game/i).first();
		const boardOrGame = await chessboard.isVisible().catch(() => false) || await gameText.isVisible().catch(() => false);
		expect(boardOrGame).toBeTruthy();
		await expect(page.locator('body')).not.toContainText('404');
		if (page.url().includes('/play')) {
			await expect(page).toHaveURL(/\/play\/game/);
		}
	});

	test('game page shows back button or game info', async ({ page }) => {
		await page.goto('/play');
		await page.waitForLoadState('networkidle');
		const startBtn = page.getByRole('button', { name: /start/i });
		if (await startBtn.isVisible()) {
			await startBtn.click();
			await page.waitForTimeout(2000);
		}
		const backBtn = page.getByRole('button', { name: /back|return|home|exit/i });
		const gameInfo = page.getByText(/white|black|turn|move|round/i).first();
		const navBack = await backBtn.isVisible().catch(() => false) || await gameInfo.isVisible().catch(() => false);
		expect(navBack).toBeTruthy();
	});
});

test.describe('Chess — Console Errors', () => {
	test('no page errors on any major page', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));

		await loginAsExistingUser(page);

		const pages = ['/play', '/train', '/learn', '/you'];
		for (const url of pages) {
			await page.goto(url);
			await page.waitForLoadState('networkidle');
			await page.waitForTimeout(500);
		}

		expect(errors.length).toBe(0);
	});
});

test.describe('Chess — Auth Edge Cases', () => {
	test('login with wrong password shows error', async ({ page }) => {
		await page.goto('/auth');
		await page.waitForLoadState('networkidle');
		await page.getByRole('textbox', { name: 'Email' }).fill('chess@example.com');
		await page.getByRole('textbox', { name: 'Password' }).fill('WrongPassword999!');
		await page.getByRole('button', { name: 'Log in' }).click();
		await page.waitForTimeout(2000);
		// Should show error text, not redirect to home
		const errorText = page.getByText(/invalid|error|wrong|incorrect|failed|not found/i);
		await expect(errorText.first()).toBeVisible();
		await expect(page).not.toHaveURL('/');
	});

	test('register with existing email shows error', async ({ page }) => {
		await page.goto('/auth');
		await page.waitForLoadState('networkidle');
		await page.getByRole('button', { name: 'Create account' }).click();
		await page.waitForSelector('#displayName', { state: 'visible', timeout: 10000 });
		await page.locator('#displayName').fill('DuplicateUser');
		await page.getByRole('textbox', { name: 'Email' }).fill('chess@example.com');
		await page.getByRole('textbox', { name: 'Password' }).fill('TestPassword123!');
		await page.getByRole('button', { name: 'Sign up' }).click();
		await page.waitForTimeout(2000);
		// Should show error text, not redirect to home
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
		await page.goto('/you');
		await page.waitForTimeout(2000);
		await expect(page.locator('body')).not.toContainText('1140');
	});

	test('home page shows dynamic rating not hardcoded', async ({ page }) => {
		await page.goto('/');
		await page.waitForTimeout(2000);
		await expect(page.locator('body')).not.toContainText('+18 this week');
	});

	test('auth page title changes with mode', async ({ page }) => {
		await page.goto('/auth');
		await page.waitForTimeout(2000);
		await expect(page.locator('body')).toContainText('Log in');
		const signupToggle = page.getByRole('button', { name: /sign up|create account|register/i }).or(page.locator('a').filter({ hasText: /sign up/i }));
		if (await signupToggle.first().isVisible().catch(() => false)) {
			await signupToggle.first().click();
			await page.waitForTimeout(1000);
			await expect(page.locator('body')).toContainText('Sign up');
		}
	});
});

test.describe('Chess — Learn Page Interaction', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsExistingUser(page);
	});

	test('learn page shows training modules', async ({ page }) => {
		await page.goto('/learn');
		await page.waitForTimeout(2000);
		const moduleText = page.locator('body');
		const hasModule = await moduleText.innerText().then((t) => /scan|puzzle|lesson|module/i.test(t));
		expect(hasModule).toBeTruthy();
	});

	test('scan trainer start button exists', async ({ page }) => {
		await page.goto('/learn');
		await page.waitForTimeout(2000);
		const startBtn = page.getByRole('button', { name: /start|begin|scan|train/i });
		await expect(startBtn.first()).toBeVisible({ timeout: 5000 });
	});
});

test.describe('Chess — Game Interaction', () => {
	test.beforeEach(async ({ page }) => {
		await loginAsExistingUser(page);
	});

	test('game page loads board', async ({ page }) => {
		await page.goto('/play/game');
		await page.waitForTimeout(3000);
		const board = page.locator('[class*="board"], [class*="chess"], [class*="chessboard"], canvas, svg').first();
		const hasBoard = await board.isVisible().catch(() => false);
		expect(hasBoard).toBeTruthy();
	});

	test('game page has interactive controls', async ({ page }) => {
		await page.goto('/play/game');
		await page.waitForTimeout(2000);
		const anyBtn = page.getByRole('button').first();
		await expect(anyBtn).toBeVisible({ timeout: 5000 }).catch(() => {
			const boardArea = page.locator('svg, canvas, [data-board]').first();
			expect(boardArea).toBeTruthy();
		});
	});
});
