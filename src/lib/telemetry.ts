// Telemetry abstraction — PostHog backend with no-op fallback.
// When PUBLIC_POSTHOG_PROJECT_TOKEN is unset, all calls become no-ops.
// Server-side calls are always no-ops (posthog-js is client-only).
// Call init() from hooks.client.ts to activate.

import { browser } from '$app/environment';
import { PUBLIC_POSTHOG_PROJECT_TOKEN } from '$env/static/public';

type PostHogClient = typeof import('posthog-js').default;

let client: PostHogClient | null = null;

export function init(): void {
	if (!browser || !PUBLIC_POSTHOG_PROJECT_TOKEN) return;

	import('posthog-js').then(({ default: posthog }) => {
		client = posthog;
		client.init(PUBLIC_POSTHOG_PROJECT_TOKEN, {
			api_host: '/ingest',
			ui_host: 'https://eu.posthog.com',
			capture_exceptions: true,
			person_profiles: 'identified_only',
		});
	});
}

export function track(event: string, props?: Record<string, unknown>): void {
	client?.capture(event, props);
}

export function pageview(route: string): void {
	client?.capture('$pageview', { $current_url: route });
}

export function captureError(err: unknown, ctx?: Record<string, unknown>): void {
	client?.captureException(err, ctx);
}

export function identify(userId: string, traits?: Record<string, unknown>): void {
	client?.identify(userId, traits);
}

export function reset(): void {
	client?.reset();
}
