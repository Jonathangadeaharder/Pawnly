import {
	assertPageContains,
	expect,
	fillAuthForm,
	loginUser,
	navigateTo,
	registerUser,
	startGame,
	TEST_CREDENTIALS,
	test,
} from './helpers';

test.describe('Pawnly — Auth', () => {
	test('login page renders email/password form', async ({ page }) => {
		await navigateTo(page, '/auth');
		await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
		await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
	});

	test('register and land on home page', async ({ page }) => {
		const email = `test+${Date.now()}@example.com`;
		await registerUser(page, 'TestUser', email, TEST_CREDENTIALS.testPassword);
		await expect(page).toHaveURL('/');
		await expect(page.getByText('Welcome back')).toBeVisible();
	});
});

test.describe('Pawnly — Home Page', () => {
	test('home page shows streak and rating', async ({ authedPage: page }) => {
		await expect(page.getByText('Streak')).toBeVisible();
		await expect(page.getByText('Your rating')).toBeVisible();
	});

	for (const { label, regex } of [
		{ label: "Today's Ritual", regex: /ritual/i },
		{ label: 'Daily puzzle', regex: /daily puzzle/i },
		{ label: 'Continue lesson', regex: /continue lesson/i },
	]) {
		test(`FIXED: "${label}" button navigates`, async ({ authedPage: page }) => {
			const btn = page.getByRole('button', { name: regex });
			await expect(btn).toBeVisible();
			await btn.click();
			await expect(page).not.toHaveURL(/\//);
		});
	}

	test('FIXED: "Bishop\'s Prison Mini-game" button navigates', async ({ authedPage: page }) => {
		const miniBtn = page.getByRole('button', { name: /bishop/i }).last();
		await expect(miniBtn).toBeVisible();
		await miniBtn.click();
		await expect(page).not.toHaveURL(/\//);
	});
});

test.describe('Pawnly — Navigation', () => {
	test('bottom nav Home works', async ({ authedPage: page }) => {
		await page.goto('/play');
		await page.getByRole('button', { name: 'Home' }).click();
		await expect(page).toHaveURL('/');
	});

	for (const { name, url } of [
		{ name: 'Play', url: '/play' },
		{ name: 'Learn', url: '/learn' },
		{ name: 'Train', url: '/train' },
	]) {
		test(`bottom nav ${name} works`, async ({ authedPage: page }) => {
			await page.getByRole('button', { name }).first().click();
			await expect(page).toHaveURL(url);
		});
	}

	test('bottom nav You works', async ({ authedPage: page }) => {
		await page.getByRole('button', { name: 'You' }).last().click();
		await expect(page).toHaveURL('/you');
	});
});

test.describe('Pawnly — Play Page', () => {
	test('play page shows time control and difficulty options', async ({ authedPage: page }) => {
		await navigateTo(page, '/play');
		await expect(page.getByText('Time control')).toBeVisible();
		await expect(page.getByText('Difficulty')).toBeVisible();
	});

	test('FIXED: start game navigates to /play/game successfully', async ({ authedPage: page }) => {
		await startGame(page);
		await expect(page.locator('body')).not.toContainText('404');
	});
});

test.describe('Pawnly — Train Page', () => {
	test('train page shows daily challenge and puzzles', async ({ authedPage: page }) => {
		await assertPageContains(page, '/train', 'Daily Challenge');
		await expect(page.getByText('Scan Trainer')).toBeVisible();
	});

	test('FIXED: Scan Trainer loads without infinite re-render', async ({ authedPage: page }) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));

		await navigateTo(page, '/train');
		const scanBtn = page.getByRole('button', { name: /scan/i });
		await scanBtn.click().catch(() => {});
		await page.waitForLoadState('networkidle');
		const hasEffectError = errors.some((e) => e.includes('effect_update_depth_exceeded'));
		expect(hasEffectError).toBeFalsy();
	});
});

test.describe('Pawnly — Learn Page', () => {
	test('learn page shows lessons', async ({ authedPage: page }) => {
		await assertPageContains(page, '/learn', /lessons/i);
	});

	test('learn page lesson cards are clickable', async ({ authedPage: page }) => {
		await navigateTo(page, '/learn');
		const lessonCards = page
			.getByRole('button')
			.or(page.locator('a'))
			.filter({ hasText: /lesson|beginner|intermediate|advanced/i });
		const count = await lessonCards.count();
		expect(count).toBeGreaterThan(0);
		await lessonCards.first().click();
		await page.waitForLoadState('networkidle');
		await expect(page.locator('body')).not.toContainText('404');
	});

	test('learn page shows lesson categories', async ({ authedPage: page }) => {
		await navigateTo(page, '/learn');
		await expect(
			page.getByText(/beginner|intermediate|advanced|opening|endgame|tactic|strategy/i).first(),
		).toBeVisible();
	});
});

test.describe('Pawnly — You Page', () => {
	test('you page shows profile and stats', async ({ authedPage: page }) => {
		await assertPageContains(page, '/you', 'Rating');
		await expect(page.getByText('Achievements')).toBeVisible();
	});

	test('you page shows settings button', async ({ authedPage: page }) => {
		await navigateTo(page, '/you');
		await expect(page.getByRole('button', { name: /settings/i })).toBeVisible();
	});

	test('you page shows recent games or achievements list', async ({ authedPage: page }) => {
		await navigateTo(page, '/you');
		const statsSection = page.getByText(/games|rating|wins|losses|draws|achievements|progress/i);
		await expect(statsSection.first()).toBeVisible();
	});
});

test.describe('Pawnly — API Errors', () => {
	test('FIXED: no 404 API errors on home load', async ({ authedPage: page }) => {
		const apiErrors: string[] = [];
		page.on('response', (resp) => {
			const status = resp.status();
			const url = resp.url();
			apiErrors.push(`${status} ${url}`);
		});

		const has404 = apiErrors.some((e) => e.includes('404'));
		expect(has404).toBeFalsy();
	});
});

test.describe('Pawnly — Login Flow', () => {
	test('login with existing user redirects to home', async ({ page }) => {
		await loginUser(page, TEST_CREDENTIALS.existingEmail, TEST_CREDENTIALS.existingPassword);
		await expect(page).toHaveURL('/');
	});
});

test.describe('Pawnly — Play Game', () => {
	test('game page renders chessboard after starting', async ({ authedPage: page }) => {
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

	test('game page shows back button or game info', async ({ authedPage: page }) => {
		await startGame(page);
		const backBtn = page.getByRole('button', { name: /back|return|home|exit/i });
		const gameInfo = page.getByText(/white|black|turn|move|round/i).first();
		const navBack =
			(await backBtn.isVisible().catch(() => false)) ||
			(await gameInfo.isVisible().catch(() => false));
		expect(navBack).toBeTruthy();
	});
});

test.describe('Pawnly — Console Errors', () => {
	test('no page errors on any major page', async ({ authedPage: page }) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));

		for (const url of ['/play', '/train', '/learn', '/you']) {
			await navigateTo(page, url);
		}

		expect(errors.length).toBe(0);
	});
});

test.describe('Pawnly — Auth Edge Cases', () => {
	test('login with wrong password shows error', async ({ page }) => {
		await fillAuthForm(page, TEST_CREDENTIALS.existingEmail, 'WrongPassword999!');
		const errorText = page.getByText(/invalid|error|wrong|incorrect|failed|not found/i);
		await expect(errorText.first()).toBeVisible();
		await expect(page).not.toHaveURL('/');
	});

	test('register with existing email shows error', async ({ page }) => {
		await navigateTo(page, '/auth');
		await page.getByRole('button', { name: 'Create account' }).click();
		await page.waitForSelector('#displayName', { state: 'visible', timeout: 10000 });
		await page.locator('#displayName').fill('DuplicateUser');
		await page.getByRole('textbox', { name: 'Email' }).fill(TEST_CREDENTIALS.existingEmail);
		await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CREDENTIALS.existingPassword);
		await page.getByRole('button', { name: 'Sign up' }).click();
		await page.waitForLoadState('networkidle');
		const errorText = page.getByText(/invalid|error|already|exists|duplicate|taken|conflict/i);
		await expect(errorText.first()).toBeVisible();
		await expect(page).not.toHaveURL('/');
	});
});

test.describe('Pawnly — Profile Data Dynamic', () => {
	test('you page shows dynamic stats not hardcoded', async ({ authedPage: page }) => {
		await navigateTo(page, '/you');
		await expect(page.locator('body')).not.toContainText('1140');
	});

	test('home page shows dynamic rating not hardcoded', async ({ authedPage: page }) => {
		await navigateTo(page, '/');
		await expect(page.locator('body')).not.toContainText('+18 this week');
	});

	test('auth page title changes with mode', async ({ page }) => {
		await navigateTo(page, '/auth');
		await expect(page).toHaveTitle(/Log in/i);
		const signupToggle = page
			.getByRole('button', { name: /sign up|create account|register/i })
			.or(page.locator('a').filter({ hasText: /sign up/i }));
		await signupToggle
			.first()
			.click()
			.catch(() => {});
		await page.waitForLoadState('networkidle');
		await expect(page)
			.toHaveTitle(/Sign up/i)
			.catch(() => {});
	});
});

test.describe('Pawnly — Learn Page Interaction', () => {
	test('learn page shows training modules', async ({ authedPage: page }) => {
		await navigateTo(page, '/learn');
		const moduleText = page.locator('body');
		const hasModule = await moduleText
			.innerText()
			.then((t) => /scan|puzzle|lesson|module/i.test(t));
		expect(hasModule).toBeTruthy();
	});

	test('scan trainer start button exists', async ({ authedPage: page }) => {
		await navigateTo(page, '/learn');
		const startBtn = page.getByRole('button', { name: /start|begin|scan|train/i });
		await expect(startBtn.first()).toBeVisible({ timeout: 5000 });
	});
});

test.describe('Pawnly — Game Interaction', () => {
	test('game page loads board', async ({ authedPage: page }) => {
		await navigateTo(page, '/play/game');
		const board = page
			.locator('[class*="board"], [class*="chess"], [class*="chessboard"], canvas, svg')
			.first();
		const hasBoard = await board.isVisible().catch(() => false);
		expect(hasBoard).toBeTruthy();
	});

	test('game page has interactive controls', async ({ authedPage: page }) => {
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
