<script lang="ts">
import type { Snippet } from 'svelte';

let {
	visible = false,
	onClose,
	showCloseButton = true,
	zIndex = 100,
	children,
}: {
	visible?: boolean;
	onClose?: () => void;
	showCloseButton?: boolean;
	zIndex?: number;
	children: Snippet;
} = $props();

function handleKeydown(e: KeyboardEvent) {
	if (e.key === 'Escape' && onClose) {
		onClose();
	}
}

function handleBackdropClick(e: MouseEvent) {
	if (e.target === e.currentTarget && onClose) {
		onClose();
	}
}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if visible}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		data-overlay-backdrop
		style:position="fixed"
		style:top="0"
		style:left="0"
		style:right="0"
		style:bottom="0"
		style:z-index={zIndex}
		style:background="rgba(0, 0, 0, 0.6)"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
	>
		<div class="overlay-content">
			{#if showCloseButton}
				<button aria-label="Close" class="overlay-close" onclick={onClose}>
					&times;
				</button>
			{/if}
			{@render children()}
		</div>
	</div>
{/if}

<style>
	.overlay-content {
		position: relative;
		width: 100%;
		height: 100%;
		animation: slide-up 0.3s ease-out;
	}

	.overlay-close {
		position: absolute;
		top: 12px;
		right: 12px;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.15);
		border: none;
		border-radius: 8px;
		color: white;
		font-size: 24px;
		cursor: pointer;
		z-index: 1;
		transition: background 0.15s ease;
	}

	.overlay-close:hover {
		background: rgba(255, 255, 255, 0.25);
	}

	@keyframes slide-up {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
</style>
