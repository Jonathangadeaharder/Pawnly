<script lang="ts">
import { goto } from '$app/navigation';
import { Brand } from '$lib/brand';
import Button from '$lib/components/Button.svelte';
import Mascot from '$lib/components/Mascot.svelte';
import Wordmark from '$lib/components/Wordmark.svelte';
import { auth } from '$lib/stores/auth.svelte';

let mode: 'login' | 'signup' = $state('login');
let email = $state('');
let password = $state('');
let displayName = $state('');
let error = $state<string | null>(null);
let loading = $state(false);
let magicLinkSent = $state(false);

async function handleSubmit(e: Event) {
	e.preventDefault();
	error = null;
	loading = true;

	try {
		if (mode === 'login') {
			const result = await auth.signInWithEmail(email, password);
			if (result.error) {
				error = result.error;
			} else {
				goto('/');
			}
		} else {
			const result = await auth.signUpWithEmail(email, password, displayName);
			if (result.error) {
				error = result.error;
			} else {
				goto('/');
			}
		}
	} finally {
		loading = false;
	}
}

async function handleMagicLink() {
	error = null;
	loading = true;

	try {
		const result = await auth.signInWithMagicLink(email);
		if (result.error) {
			error = result.error;
		} else {
			magicLinkSent = true;
		}
	} finally {
		loading = false;
	}
}
</script>

<svelte:head>
	<title>{Brand.name} — {mode === 'login' ? 'Log in' : 'Sign up'}</title>
</svelte:head>

<div class="auth-page" style:background-color={Brand.colors.cream}>
	<div class="auth-container">
		<div class="brand-section">
			<Mascot size={80} mood={magicLinkSent ? 'celebrating' : 'happy'} />
			<Wordmark size={36} />
			<p class="tagline" style:font-family={Brand.fonts.body} style:color={Brand.colors.inkMuted}>
				{Brand.tagline}
			</p>
		</div>

		{#if magicLinkSent}
			<div class="magic-link-success">
				<p style:font-family={Brand.fonts.body} style:color={Brand.colors.moss}>
					Check your email for a magic link!
				</p>
				<Button kind="ghost" onclick={() => { magicLinkSent = false; }}>
					Back to login
				</Button>
			</div>
		{:else}
			<form class="auth-form" onsubmit={handleSubmit}>
				{#if mode === 'signup'}
					<div class="field">
						<label for="displayName" style:font-family={Brand.fonts.body}>Display name</label>
						<input
							id="displayName"
							type="text"
							bind:value={displayName}
							placeholder="Your name"
							required
							style:font-family={Brand.fonts.body}
						/>
					</div>
				{/if}

				<div class="field">
					<label for="email" style:font-family={Brand.fonts.body}>Email</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="you@example.com"
						required
						style:font-family={Brand.fonts.body}
					/>
				</div>

				<div class="field">
					<label for="password" style:font-family={Brand.fonts.body}>Password</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						placeholder="••••••••"
						required
						minlength="6"
						style:font-family={Brand.fonts.body}
					/>
				</div>

				{#if error}
					<p class="error" style:font-family={Brand.fonts.body}>{error}</p>
				{/if}

				<Button kind="moss" full onclick={() => {}}>{loading ? 'Loading...' : (mode === 'login' ? 'Log in' : 'Sign up')}</Button>

				<button
					type="button"
					class="magic-link-btn"
					onclick={handleMagicLink}
					disabled={!email || loading}
					style:font-family={Brand.fonts.body}
					style:color={Brand.colors.inkMuted}
				>
					Continue with magic link
				</button>

				<div class="toggle-section">
					{#if mode === 'login'}
						<p style:font-family={Brand.fonts.body} style:color={Brand.colors.inkMuted}>
							Don't have an account?
							<button type="button" class="toggle-btn" onclick={() => { mode = 'signup'; error = null; }} style:color={Brand.colors.moss}>
								Create account
							</button>
						</p>
					{:else}
						<p style:font-family={Brand.fonts.body} style:color={Brand.colors.inkMuted}>
							Already have an account?
							<button type="button" class="toggle-btn" onclick={() => { mode = 'login'; error = null; }} style:color={Brand.colors.moss}>
								Log in instead
							</button>
						</p>
					{/if}
				</div>
			</form>
		{/if}
	</div>
</div>

<style>
	.auth-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
	}

	.auth-container {
		width: 100%;
		max-width: 380px;
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	.brand-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.tagline {
		font-size: 14px;
		text-align: center;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.field label {
		font-size: 14px;
		font-weight: 600;
		color: #1F2417;
	}

	.field input {
		padding: 12px 14px;
		border-radius: 12px;
		border: 1.5px solid rgba(31, 36, 23, 0.15);
		background: white;
		font-size: 15px;
		outline: none;
		transition: border-color 0.15s;
	}

	.field input:focus {
		border-color: #3F6B43;
	}

	.error {
		font-size: 14px;
		color: #D86B5A;
		text-align: center;
	}

	.magic-link-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 14px;
		text-decoration: underline;
		padding: 4px;
	}

	.magic-link-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.toggle-section {
		text-align: center;
		font-size: 14px;
	}

	.toggle-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-weight: 600;
		text-decoration: underline;
		padding: 0;
		font-size: inherit;
	}

	.magic-link-success {
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 16px;
		align-items: center;
	}

	.magic-link-success p {
		font-size: 16px;
		font-weight: 600;
	}
</style>
