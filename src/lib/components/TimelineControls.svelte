<script lang="ts">
	import { timelineStore, isZoomed, zoomLevel } from '../store';
	import { formatTime } from '../utils';
	import type { PlaybackState, PlaybackCallbacks } from '../types';

	interface Props {
		/** Current playback state (passed in by consumer) */
		playback?: PlaybackState;
		/** Callbacks for playback control actions */
		playbackCallbacks?: PlaybackCallbacks;
		/** Callback when zoom changes (to trigger external redraw) */
		onRequestRedraw?: () => void;
		/** Callback when view window changes (zoom buttons) */
		onViewChange?: (viewStart: number, viewEnd: number) => void;
		/** Whether to show the activity gradient toggle */
		showGradientToggle?: boolean;
		/** Whether the gradient is currently active */
		gradientActive?: boolean;
		/** Callback when gradient toggle is clicked */
		onGradientToggle?: () => void;
	}

	const DEFAULT_SPEED_PRESETS = [
		{ value: 0.025, label: '0.5x' },
		{ value: 0.05, label: '1x' },
		{ value: 0.1, label: '2x' },
		{ value: 0.25, label: '5x' },
		{ value: 0.5, label: '10x' },
		{ value: 1.0, label: '20x' }
	];

	let {
		playback = {
			isPlaying: false,
			speedIndex: 1,
			speedPresets: DEFAULT_SPEED_PRESETS
		},
		playbackCallbacks = {},
		onRequestRedraw,
		onViewChange,
		showGradientToggle = false,
		gradientActive = false,
		onGradientToggle
	}: Props = $props();

	let currentTime = $derived($timelineStore.currentTime);
	let duration = $derived($timelineStore.viewEnd - $timelineStore.viewStart);

	function reset() {
		playbackCallbacks.onPause?.();
		timelineStore.setCurrentTime($timelineStore.viewStart);
	}

	function cycleSpeed(e: MouseEvent) {
		const presets = playback.speedPresets;
		const newIdx = e.shiftKey
			? (playback.speedIndex <= 0 ? presets.length - 1 : playback.speedIndex - 1)
			: (playback.speedIndex >= presets.length - 1 ? 0 : playback.speedIndex + 1);

		playbackCallbacks.onSpeedChange?.(newIdx);
	}

	function notifyViewChange() {
		const state = timelineStore.getState();
		onViewChange?.(state.viewStart, state.viewEnd);
		onRequestRedraw?.();
	}

	function zoomIn() {
		timelineStore.zoom(0.7);
		notifyViewChange();
	}

	function zoomOut() {
		timelineStore.zoom(1.4);
		notifyViewChange();
	}

	function zoomToFit() {
		timelineStore.zoomToFit();
		notifyViewChange();
	}
</script>

<div class="itl-controls">
	<!-- Playback controls -->
	<div class="itl-control-group itl-playback-group">
		<button
			class="itl-btn itl-btn-primary itl-btn-circle"
			onclick={() => playbackCallbacks.onTogglePlayback?.()}
			title={playback.isPlaying ? 'Pause' : 'Play'}
			aria-label={playback.isPlaying ? 'Pause' : 'Play'}
		>
			{#if playback.isPlaying}
				<!-- Pause icon -->
				<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
					<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
				</svg>
			{:else}
				<!-- Play icon -->
				<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
					<path d="M8 5v14l11-7z" />
				</svg>
			{/if}
		</button>
		<button
			class="itl-btn itl-btn-ghost"
			onclick={reset}
			title="Reset to start"
			aria-label="Reset"
		>
			<!-- Replay icon -->
			<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
				<path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
			</svg>
		</button>
		<span class="itl-divider"></span>
		<button
			class="itl-btn itl-btn-ghost itl-btn-speed"
			onclick={cycleSpeed}
			title="Click to change speed (Shift+click for slower)"
			aria-label="Playback speed"
		>
			{playback.speedPresets[playback.speedIndex]?.label ?? '1x'}
		</button>
	</div>

	<!-- Zoom controls -->
	<div class="itl-control-group">
		<button
			class="itl-btn itl-btn-ghost"
			onclick={zoomOut}
			title="Zoom out"
			aria-label="Zoom out"
		>
			<!-- Magnify minus icon -->
			<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
				<path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z" />
			</svg>
		</button>
		<button
			class="itl-btn itl-btn-ghost"
			onclick={zoomToFit}
			title="Fit to view"
			aria-label="Fit to view"
			disabled={!$isZoomed}
		>
			<!-- Fit to screen icon -->
			<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
				<path d="M17 4h-3V2h5v5h-2V4zM4 7V4h3V2H2v5h2zm13 10h3v-3h2v5h-5v-2zM4 14v3h3v2H2v-5h2zm13.5-4.5c0 .83-.67 1.5-1.5 1.5H8c-.83 0-1.5-.67-1.5-1.5v-3C6.5 5.67 7.17 5 8 5h10c.83 0 1.5.67 1.5 1.5v3zm-1.5.5V6H8v4h10z" />
			</svg>
		</button>
		<button
			class="itl-btn itl-btn-ghost"
			onclick={zoomIn}
			title="Zoom in"
			aria-label="Zoom in"
		>
			<!-- Magnify plus icon -->
			<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
				<path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm-2.5-4h2V8h1v2h2v1h-2v2H9v-2H7z" />
			</svg>
		</button>
	</div>

	{#if $isZoomed}
		<span class="itl-zoom-level">{$zoomLevel.toFixed(1)}x</span>
	{:else}
		<span class="itl-zoom-hint">Drag to zoom</span>
	{/if}

	<!-- Activity gradient toggle (optional) -->
	{#if showGradientToggle}
		<button
			class="itl-gradient-toggle"
			class:itl-gradient-inactive={!gradientActive}
			title={gradientActive ? 'Hide activity gradient' : 'Show activity gradient'}
			onclick={() => onGradientToggle?.()}
		>
			<span class="itl-gradient-label">stopped</span>
			<div class="itl-gradient-preview"></div>
			<span class="itl-gradient-label">moving</span>
		</button>
	{/if}

	<!-- Time display -->
	<div class="itl-time-display">
		<span class="itl-time-current">{formatTime(currentTime)}</span>
		<span class="itl-time-separator">/</span>
		<span class="itl-time-duration">{formatTime(duration)}</span>
	</div>
</div>

<style>
	.itl-controls {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 8px;
		background: #f6f5f3;
		font-family: system-ui, -apple-system, sans-serif;
		font-size: 12px;
	}

	.itl-control-group {
		display: flex;
		align-items: center;
		gap: 2px;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 9999px;
		padding: 2px;
	}

	.itl-playback-group {
		padding-left: 2px;
		padding-right: 4px;
	}

	.itl-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: none;
		cursor: pointer;
		padding: 0;
		color: #374151;
		border-radius: 4px;
		transition: background-color 0.15s;
	}

	.itl-btn:hover {
		background-color: #f3f4f6;
	}

	.itl-btn:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.itl-btn:disabled:hover {
		background-color: transparent;
	}

	.itl-btn-ghost {
		width: 24px;
		height: 24px;
		border-radius: 4px;
	}

	.itl-btn-circle {
		width: 24px;
		height: 24px;
		border-radius: 50%;
	}

	.itl-btn-primary {
		background-color: #3b82f6;
		color: white;
	}

	.itl-btn-primary:hover {
		background-color: #2563eb;
	}

	.itl-btn-speed {
		width: auto;
		padding: 0 4px;
		font-family: ui-monospace, SFMono-Regular, monospace;
		font-size: 11px;
		font-weight: 600;
	}

	.itl-divider {
		width: 1px;
		height: 12px;
		background-color: #e5e7eb;
	}

	.itl-zoom-level {
		font-size: 12px;
		color: #6b7280;
		font-weight: 500;
	}

	.itl-zoom-hint {
		font-size: 12px;
		color: #9ca3af;
		animation: itl-fade-out 15s forwards;
	}

	@keyframes itl-fade-out {
		0%,
		80% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	.itl-gradient-toggle {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 2px 6px;
		border: none;
		background: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.15s;
	}

	.itl-gradient-toggle:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.itl-gradient-inactive {
		opacity: 0.5;
	}

	.itl-gradient-label {
		font-size: 10px;
		color: #9ca3af;
	}

	.itl-gradient-preview {
		width: 40px;
		height: 6px;
		border-radius: 2px;
		background: linear-gradient(to right, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4));
	}

	.itl-time-display {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-left: auto;
		font-family: ui-monospace, SFMono-Regular, monospace;
		font-size: 12px;
	}

	.itl-time-current {
		font-weight: 600;
		color: #ef4444;
	}

	.itl-time-separator {
		color: #9ca3af;
	}

	.itl-time-duration {
		color: #6b7280;
	}
</style>
