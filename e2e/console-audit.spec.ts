import { test, expect } from '@playwright/test';

const APPS = [
  { name: 'Chess', base: 'http://localhost:5175', routes: ['/', '/play', '/play/game', '/puzzles', '/you', '/auth'] },
  { name: 'Poker', base: 'http://localhost:5174', routes: ['/', '/home', '/quiz', '/you', '/auth'] },
  { name: 'Notflix', base: 'http://localhost:5176', routes: ['/', '/login', '/profile', '/studio', '/studio/upload', '/dictionary'] },
];

for (const app of APPS) {
  for (const route of app.routes) {
    test(`${app.name} ${route} — no console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (err) => errors.push(err.message));

      const resp = await page.goto(`${app.base}${route}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);

      const filtered = errors.filter(
        (e) =>
          !e.includes('favicon') &&
          !e.includes('DevTools') &&
          !e.includes('Download the React DevTools') &&
          !e.includes('net::ERR_CONNECTION_REFUSED') &&
          !e.includes('401') &&
          !e.includes('404') &&
          !e.includes('Failed to fetch') &&
          !e.includes('ResizeObserver') &&
          !e.includes('Non-Error promise rejection') &&
          !e.includes('504') &&
          !e.includes('Outdated Optimize Dep') &&
          !e.includes('Stockfish') &&
          !e.includes('WebAssembly') &&
          !e.includes('CompileError') &&
          !e.includes('magic word')
      );

      expect(filtered).toEqual([]);
    });
  }
}
