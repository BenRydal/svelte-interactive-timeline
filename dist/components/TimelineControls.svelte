<script lang="ts">
	import type { TimelineStore } from '../core/store.svelte';
	import { formatTime } from '../core/utils';

	interface Props {
		/** Timeline store instance */
		store: TimelineStore;
		/** Show zoom controls */
		showZoomControls?: boolean;
		/** Show time display */
		showTimeDisplay?: boolean;
		/** Time format for display */
		timeFormat?: 'hms' | 'ms' | 'seconds';
		/** Additional CSS classes */
		class?: string;
		/** Called after zoom operation */
		onZoom?: () => void;
	}

	let {
		store,
		showZoomControls = true,
		showTimeDisplay = true,
		timeFormat = 'hms',
		class: className = '',
		onZoom
	}: Props = $props();

	let currentTime = $derived(store.currentTime);
	let viewDuration = $derived(store.viewDuration);
	let isZoomed = $derived(store.isZoomed);
	let zoomLevel = $derived(store.zoomLevel);

	function zoomIn() {
		store.zoom(0.7);
		onZoom?.();
	}

	function zoomOut() {
		store.zoom(1.4);
		onZoom?.();
	}

	function zoomToFit() {
		store.zoomToFit();
		onZoom?.();
	}
</script>

<div class="flex items-center gap-2 px-2 py-1 bg-base-200 {className}">
	{#if showZoomControls}
		<!-- Zoom controls -->
		<div
			class="flex items-center gap-0.5 bg-base-100 border border-base-300 rounded-full px-0.5 py-0.5"
		>
			<button
				class="btn btn-ghost btn-square btn-xs"
				onclick={zoomOut}
				title="Zoom out (−)"
				aria-label="Zoom out"
			>
				<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"
					/>
					<path d="M7 9h5v1H7z" />
				</svg>
			</button>
			<button
				class="btn btn-ghost btn-square btn-xs"
				onclick={zoomToFit}
				title="Fit to view (0)"
				aria-label="Fit to view"
				disabled={!isZoomed}
			>
				<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M17 4h3c1.1 0 2 .9 2 2v3h-2V6h-3V4zM4 8V6h3V4H4c-1.1 0-2 .9-2 2v3h2V8zm16 8v3h-3v2h3c1.1 0 2-.9 2-2v-3h-2zM7 18H4v-3H2v3c0 1.1.9 2 2 2h3v-2z"
					/>
				</svg>
			</button>
			<button
				class="btn btn-ghost btn-square btn-xs"
				onclick={zoomIn}
				title="Zoom in (+)"
				aria-label="Zoom in"
			>
				<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"
					/>
					<path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z" />
				</svg>
			</button>
		</div>
		{#if isZoomed}
			<span class="text-xs text-base-content/60 font-medium">{zoomLevel.toFixed(1)}x</span>
		{:else}
			<span class="zoom-hint">Drag to zoom</span>
		{/if}
	{/if}

	{#if showTimeDisplay}
		<!-- Time display -->
		<div class="flex items-center gap-1 ml-auto font-mono text-xs">
			<span class="font-semibold text-error">{formatTime(currentTime, timeFormat)}</span>
			<span class="text-base-content/40">/</span>
			<span class="text-base-content/60">{formatTime(viewDuration, timeFormat)}</span>
		</div>
	{/if}
</div>

<style>
	.zoom-hint {
		font-size: 0.75rem;
		color: oklch(var(--bc) / 0.4);
		animation: fade-out 15s forwards;
	}

	@keyframes fade-out {
		0%,
		80% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
</style>
