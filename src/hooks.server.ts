import type { Handle } from '@sveltejs/kit';
import { pageview } from '$lib/telemetry';

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	pageview(pathname);

	const isIngestPath = pathname === '/ingest' || pathname.startsWith('/ingest/');
	if (isIngestPath) {
		const useAssetHost =
			pathname.startsWith('/ingest/static/') || pathname.startsWith('/ingest/array/');
		const hostname = useAssetHost ? 'eu-assets.i.posthog.com' : 'eu.i.posthog.com';

		const url = new URL(event.request.url);
		url.protocol = 'https:';
		url.hostname = hostname;
		url.port = '443';
		url.pathname = pathname.replace(/^\/ingest/, '');

		const headers = new Headers();
		for (const name of ['accept', 'content-type', 'origin', 'referer', 'user-agent']) {
			const value = event.request.headers.get(name);
			if (value) headers.set(name, value);
		}
		headers.set('host', hostname);

		const clientIp = event.request.headers.get('x-forwarded-for') || event.getClientAddress();
		if (clientIp) {
			headers.set('x-forwarded-for', clientIp);
		}

		try {
			const response = await fetch(url.toString(), {
				method: event.request.method,
				headers,
				body: event.request.method !== 'GET' && event.request.method !== 'HEAD'
					? event.request.body
					: null,
				// @ts-expect-error - duplex is required for streaming request bodies
				duplex: 'half'
			});

			return response;
		} catch {
			return new Response(null, { status: 200 });
		}
	}

	return resolve(event);
};
