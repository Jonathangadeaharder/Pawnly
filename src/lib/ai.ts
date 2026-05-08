import { env } from '$env/dynamic/public';

export type AIProvider = 'ollama' | 'openrouter' | 'groq' | 'mini';

const OLLAMA_BASE = 'http://localhost:11434';

function getProvider(): AIProvider {
	return (env.PUBLIC_AI_PROVIDER as AIProvider | undefined) ?? 'ollama';
}

function getBaseUrl(provider: AIProvider): string {
	switch (provider) {
		case 'mini':
		case 'ollama':
			return OLLAMA_BASE;
		case 'openrouter':
			return 'https://openrouter.ai/api/v1';
		case 'groq':
			return 'https://api.groq.com/openai/v1';
	}
}

function getDefaultModel(provider: AIProvider): string {
	switch (provider) {
		case 'mini':
			return 'phi3:mini';
		case 'ollama':
			return 'mistral';
		case 'openrouter':
			return 'openai/gpt-4o-mini';
		case 'groq':
			return 'llama3-70b-8192';
	}
}

interface GenerateOptions {
	model?: string;
	prompt: string;
	system?: string;
	temperature?: number;
	maxTokens?: number;
}

interface EmbedOptions {
	model?: string;
	input: string | string[];
}

interface ChatMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

interface ChatOptions {
	model?: string;
	messages: ChatMessage[];
	temperature?: number;
	maxTokens?: number;
}

async function ollamaRequest(path: string, body: Record<string, unknown>): Promise<Response> {
	return fetch(`${OLLAMA_BASE}/api/${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
}

async function openAICompatible(path: string, body: Record<string, unknown>): Promise<Response> {
	const provider = getProvider();
	const baseUrl = getBaseUrl(provider);
	const apiKey = getAPIKey(provider);

	if (!apiKey) {
		throw new Error(`No API key configured for provider "${provider}". Set the key in your edge function or proxy.`);
	}

	return fetch(`${baseUrl}/${path}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify(body),
	});
}

function getAPIKey(provider: AIProvider): string | null {
	switch (provider) {
		case 'mini':
		case 'ollama':
			return null;
		case 'openrouter':
			return import.meta.env.VITE_OPENROUTER_API_KEY || null;
		case 'groq':
			return import.meta.env.VITE_GROQ_API_KEY || null;
	}
}

/**
 * Generate a text completion.
 *
 * For cloud providers (openrouter, groq), API keys must be provided
 * through a Supabase Edge Function or backend proxy — never expose
 * secret keys in client-side bundles.
 */
export async function generate(opts: GenerateOptions): Promise<string> {
	const provider = getProvider();
	const model = opts.model ?? getDefaultModel(provider);

	if (provider === 'ollama' || provider === 'mini') {
		const res = await ollamaRequest('generate', {
			model,
			prompt: opts.prompt,
			system: opts.system,
			stream: false,
			options: {
				temperature: opts.temperature ?? 0.7,
				num_predict: opts.maxTokens,
			},
		});
		const json = await res.json();
		return json.response as string;
	}

	const res = await openAICompatible('chat/completions', {
		model,
		messages: [
			...(opts.system ? [{ role: 'system' as const, content: opts.system }] : []),
			{ role: 'user' as const, content: opts.prompt },
		],
		temperature: opts.temperature ?? 0.7,
		max_tokens: opts.maxTokens,
	});
	const json = await res.json();
	return json.choices?.[0]?.message?.content ?? '';
}

/**
 * Generate embeddings for semantic search or recommendations.
 *
 * Uses Ollama locally; for cloud providers, the `/embeddings` OpenAI-compatible
 * endpoint is used (supported by both OpenRouter and Groq).
 */
export async function embed(opts: EmbedOptions): Promise<number[][]> {
	const provider = getProvider();
	const model = opts.model ?? (provider === 'mini' ? 'nomic-embed-text' : getDefaultModel(provider));
	const inputs = Array.isArray(opts.input) ? opts.input : [opts.input];

	if (provider === 'ollama' || provider === 'mini') {
		const results: number[][] = [];
		for (const input of inputs) {
			const res = await ollamaRequest('embeddings', { model, prompt: input });
			const json = await res.json();
			results.push(json.embedding as number[]);
		}
		return results;
	}

	const res = await openAICompatible('embeddings', { model, input: inputs });
	const json = await res.json();
	return (json.data as Array<{ embedding: number[] }>).map((d) => d.embedding);
}

/**
 * Multi-turn chat completion for AI coach conversations.
 */
export async function chat(opts: ChatOptions): Promise<string> {
	const provider = getProvider();
	const model = opts.model ?? getDefaultModel(provider);

	if (provider === 'ollama' || provider === 'mini') {
		const res = await ollamaRequest('chat', {
			model,
			messages: opts.messages,
			stream: false,
			options: {
				temperature: opts.temperature ?? 0.7,
				num_predict: opts.maxTokens,
			},
		});
		const json = await res.json();
		return json.message?.content as string;
	}

	const res = await openAICompatible('chat/completions', {
		model,
		messages: opts.messages,
		temperature: opts.temperature ?? 0.7,
		max_tokens: opts.maxTokens,
	});
	const json = await res.json();
	return json.choices?.[0]?.message?.content ?? '';
}
