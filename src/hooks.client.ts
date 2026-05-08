import type { HandleClientError } from '@sveltejs/kit';
import { init, captureError } from '$lib/telemetry';

init();

export const handleError: HandleClientError = async ({ error, status, message }) => {
	captureError(error);
	return { message, status };
};
