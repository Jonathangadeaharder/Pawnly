import { expect, test } from '@playwright/test';

const APPS = [
	{
		name: 'Chess',
		base: 'http://localhost:5175',
		routes: ['/', '/play', '/play/game', '/puzzles', '/you', '/auth'],
	},
];

for (const app of APPS) {
	for (const route of app.routes) {
		test(`${app.name} ${route} — no console errors`, async ({ page }) => {
			const errors: string[] = [];
			page.on('console', (msg) => {
				if (msg.type() === 'error') errors.push(msg.text());
			});
			page.on('pageerror', (err) => errors.push(err.message));

			const _resp = await page.goto(`${app.base}${route}`, {
				waitUntil: 'networkidle',
				timeout: 15000,
			});
			await page.waitForTimeout(1000);

			const IGNORED_ERRORS = [
				'favicon',
				'DevTools',
				'Download the React DevTools',
				'net::ERR_CONNECTION_REFUSED',
				'401',
				'404',
				'Failed to fetch',
				'ResizeObserver',
				'Non-Error promise rejection',
				'504',
				'Outdated Optimize Dep',
				'magic word',
			];

			const filtered = errors.filter((e) => !IGNORED_ERRORS.some((ignored) => e.includes(ignored)));

			expect(filtered).toEqual([]);
		});
	}
}
