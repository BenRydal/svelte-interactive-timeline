<script lang="ts">
	import { onMount } from 'svelte';
	import TimelineCanvas from './TimelineCanvas.svelte';
	import TimelineControls from './TimelineControls.svelte';
	import { timelineStore } from '../store';
	import type { RenderLayer, TimelineCallbacks, PlaybackState, PlaybackCallbacks } from '../types';

	interface Props {
		/** Initial end time (optional - can also use initialize() method) */
		endTime?: number;
		/** Height of the canvas area in pixels */
		height?: number;
		/** Whether to show controls */
		showControls?: boolean;
		/** Embedded mode - removes border/shadow for use inside other containers */
		embedded?: boolean;
		/** Custom render layers */
		customLayers?: RenderLayer[];
		/** Callbacks for external integration */
		callbacks?: TimelineCallbacks;
		/** Current playback state */
		playback?: PlaybackState;
		/** Callbacks for playback controls */
		playbackCallbacks?: PlaybackCallbacks;
		/** Whether to show the activity gradient toggle */
		showGradientToggle?: boolean;
		/** Whether the gradient is currently active */
		gradientActive?: boolean;
		/** Callback when gradient toggle is clicked */
		onGradientToggle?: () => void;
	}

	let {
		endTime = 0,
		height = 80,
		showControls = true,
		embedded = false,
		customLayers = [],
		callbacks = {},
		playback = undefined,
		playbackCallbacks = {},
		showGradientToggle = false,
		gradientActive = false,
		onGradientToggle = undefined
	}: Props = $props();

	let canvasComponent: TimelineCanvas;

	onMount(() => {
		// Initialize with provided endTime if specified
		if (endTime > 0) {
			timelineStore.initialize(endTime);
		}
	});

	// Expose store methods for external use
	export function initialize(end: number, start: number = 0) {
		timelineStore.initialize(end, start);
	}

	export function setCurrentTime(time: number) {
		timelineStore.setCurrentTime(time);
	}

	export function getRenderer() {
		return canvasComponent?.getRenderer();
	}
</script>

<div class="itl-container" class:itl-embedded={embedded}>
	<div class="itl-canvas-wrapper" style="height: {height}px">
		<TimelineCanvas bind:this={canvasComponent} {customLayers} {callbacks} />
	</div>
	{#if showControls}
		<TimelineControls
			{playback}
			{playbackCallbacks}
			onRequestRedraw={callbacks.onRequestRedraw}
			onViewChange={callbacks.onViewChange}
			{showGradientToggle}
			{gradientActive}
			{onGradientToggle}
		/>
	{/if}
</div>

<style>
	.itl-container {
		display: flex;
		flex-direction: column;
		width: 100%;
		overflow: hidden;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		background: #f6f5f3;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.itl-embedded {
		border-radius: 6px;
		background: white;
		box-shadow: none;
	}

	.itl-canvas-wrapper {
		flex-shrink: 0;
		border-bottom: 1px solid #e5e7eb;
	}
</style>
