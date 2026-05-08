import { env } from '$env/dynamic/private';

export type AIProvider = 'ollama' | 'openrouter' | 'groq' | 'mini';

const VALID_PROVIDERS: AIProvider[] = ['ollama', 'mini', 'openrouter', 'groq'];
const AI_REQUEST_TIMEOUT_MS = 30000;

function getProvider(): AIProvider {
	const provider = (env.AI_PROVIDER || 'ollama') as AIProvider;
	if (!VALID_PROVIDERS.includes(provider)) {
		console.warn(`Invalid AI_PROVIDER "${env.AI_PROVIDER}", falling back to "ollama"`);
		return 'ollama';
	}
	return provider;
}

function getOllamaBase(): string {
	return env.LOCAL_AI_BASE_URL || 'http://localhost:11434';
}

function getBaseUrl(provider: AIProvider): string {
	switch (provider) {
		case 'mini':
		case 'ollama':
			return getOllamaBase();
		case 'openrouter':
			return 'https://openrouter.ai/api/v1';
		case 'groq':
			return 'https://api.groq.com/openai/v1';
		default:
			return getOllamaBase();
	}
}

function getDefaultModel(provider: AIProvider): string {
	switch (provider) {
		case 'mini':
			return env.MINI_MODEL || 'phi3:mini';
		case 'ollama':
			return env.OLLAMA_MODEL || 'mistral';
		case 'openrouter':
			return env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
		case 'groq':
			return env.GROQ_MODEL || 'llama3-70b-8192';
		default:
			return env.OLLAMA_MODEL || 'mistral';
	}
}

function getAPIKey(provider: AIProvider): string | null {
	switch (provider) {
		case 'mini':
		case 'ollama':
			return null;
		case 'openrouter':
			return env.OPENROUTER_API_KEY || null;
		case 'groq':
			return env.GROQ_API_KEY || null;
		default:
			return null;
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

interface ChatCompletionResponse {
	choices?: Array<{ message?: { content?: string } }>;
}

interface OllamaGenerateResponse {
	response?: string;
}

interface OllamaChatResponse {
	message?: { content?: string };
}

interface OllamaEmbedResponse {
	embedding?: number[];
}

interface OpenAIEmbedResponse {
	data?: Array<{ embedding: number[] }>;
}

async function parseJsonOrThrow(res: Response): Promise<Record<string, unknown>> {
	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(`AI request failed: ${res.status} ${res.statusText}. ${body}`);
	}
	return res.json().catch(() => ({}));
}

function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);
	return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timeoutId));
}

async function ollamaRequest(path: string, body: Record<string, unknown>): Promise<Response> {
	return fetchWithTimeout(`${getOllamaBase()}/api/${path}`, {
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

	return fetchWithTimeout(`${baseUrl}/${path}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify(body),
	});
}

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
		const json = (await parseJsonOrThrow(res)) as OllamaGenerateResponse;
		const content = json.response;
		if (typeof content !== 'string') {
			throw new Error('Invalid AI response: missing response content');
		}
		return content;
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
	const json = (await parseJsonOrThrow(res)) as ChatCompletionResponse;
	const content = json.choices?.[0]?.message?.content;
	if (typeof content !== 'string') {
		throw new Error('Invalid AI response: missing message content');
	}
	return content;
}

export async function embed(opts: EmbedOptions): Promise<number[][]> {
	const provider = getProvider();
	const model =
		opts.model ?? (provider === 'mini' || provider === 'ollama' ? 'nomic-embed-text' : getDefaultModel(provider));
	const inputs = Array.isArray(opts.input) ? opts.input : [opts.input];

	if (provider === 'ollama' || provider === 'mini') {
		return Promise.all(
			inputs.map(async (input) => {
				const res = await ollamaRequest('embeddings', { model, prompt: input });
				const json = (await parseJsonOrThrow(res)) as OllamaEmbedResponse;
				return json.embedding as number[];
			}),
		);
	}

	const res = await openAICompatible('embeddings', { model, input: inputs });
	const json = (await parseJsonOrThrow(res)) as OpenAIEmbedResponse;
	return (json.data ?? []).map((d) => d.embedding);
}

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
		const json = (await parseJsonOrThrow(res)) as OllamaChatResponse;
		const content = json.message?.content;
		if (typeof content !== 'string') {
			throw new Error('Invalid AI response: missing message content');
		}
		return content;
	}

	const res = await openAICompatible('chat/completions', {
		model,
		messages: opts.messages,
		temperature: opts.temperature ?? 0.7,
		max_tokens: opts.maxTokens,
	});
	const json = (await parseJsonOrThrow(res)) as ChatCompletionResponse;
	const content = json.choices?.[0]?.message?.content;
	if (typeof content !== 'string') {
		throw new Error('Invalid AI response: missing message content');
	}
	return content;
}
