import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), svelteTesting()],
	test: {
		environment: 'jsdom',
		setupFiles: ['./tests/setup.ts'],
		exclude: ['e2e/**', 'node_modules/**'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'clover'],
			thresholds: {
				lines: 85,
				branches: 80,
				functions: 85,
			},
		},
	},
});
