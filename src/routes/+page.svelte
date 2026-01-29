<script lang="ts">
	import { onMount } from 'svelte';
	import { TimelineContainer, timelineStore } from '$lib';
	import type { TimelineCallbacks, PlaybackState, PlaybackCallbacks } from '$lib';

	// --- Playback state ---
	let isPlaying = $state(false);
	let speedIndex = $state(1);
	let animationFrame: number | null = null;
	let lastFrameTime: number = 0;

	const SPEED_PRESETS = [
		{ value: 0.5, label: '0.5x' },
		{ value: 1, label: '1x' },
		{ value: 2, label: '2x' },
		{ value: 5, label: '5x' },
		{ value: 10, label: '10x' },
		{ value: 20, label: '20x' }
	];

	let playback: PlaybackState = $derived({
		isPlaying,
		speedIndex,
		speedPresets: SPEED_PRESETS
	});

	const playbackCallbacks: PlaybackCallbacks = {
		onTogglePlayback() {
			if (isPlaying) {
				stopAnimation();
			} else {
				startAnimation();
			}
		},
		onPause() {
			stopAnimation();
		},
		onSpeedChange(idx: number) {
			speedIndex = idx;
		}
	};

	function startAnimation() {
		isPlaying = true;
		lastFrameTime = performance.now();
		animationFrame = requestAnimationFrame(animationLoop);
	}

	function stopAnimation() {
		isPlaying = false;
		if (animationFrame !== null) {
			cancelAnimationFrame(animationFrame);
			animationFrame = null;
		}
	}

	function animationLoop(now: number) {
		if (!isPlaying) return;

		const deltaMs = Math.min(now - lastFrameTime, 100); // Cap delta to prevent jumps
		lastFrameTime = now;

		const state = timelineStore.getState();
		const speed = SPEED_PRESETS[speedIndex].value;
		const newTime = state.currentTime + (speed * deltaMs) / 1000;

		if (newTime >= state.viewEnd) {
			// Reached end - reset to start
			timelineStore.setCurrentTime(state.viewStart);
			stopAnimation();
		} else {
			timelineStore.setCurrentTime(newTime);
			animationFrame = requestAnimationFrame(animationLoop);
		}
	}

	// --- Timeline callbacks ---
	const callbacks: TimelineCallbacks = {};

	// --- Initialize ---
	onMount(() => {
		// Initialize with a 2-minute timeline
		timelineStore.initialize(120);
		timelineStore.setCurrentTime(15);

		return () => stopAnimation();
	});
</script>

<div class="demo">
	<h1>Interactive Timeline</h1>
	<p class="subtitle">
		A canvas-based interactive timeline with zoom, pan, drag-to-zoom, and pluggable rendering layers.
	</p>

	<div class="timeline-wrapper">
		<TimelineContainer
			height={60}
			showControls={true}
			{callbacks}
			{playback}
			{playbackCallbacks}
		/>
	</div>

	<div class="instructions">
		<h2>Interactions</h2>
		<ul>
			<li><strong>Click</strong> anywhere on the timeline to seek</li>
			<li><strong>Drag the playhead</strong> (red triangle) to scrub</li>
			<li><strong>Drag on the track</strong> to create a zoom selection</li>
			<li><strong>Ctrl/Cmd + scroll</strong> to zoom at mouse position</li>
			<li><strong>Scroll</strong> to pan when zoomed</li>
			<li><strong>Alt + drag</strong> to pan</li>
			<li>Use the <strong>zoom buttons</strong> (+, −, fit) in the controls</li>
			<li>Click <strong>speed</strong> to cycle presets (Shift+click for slower)</li>
		</ul>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: system-ui, -apple-system, sans-serif;
		background: #fafafa;
	}

	.demo {
		max-width: 800px;
		margin: 2rem auto;
		padding: 0 1rem;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #111;
		margin-bottom: 0.25rem;
	}

	.subtitle {
		color: #6b7280;
		margin-bottom: 1.5rem;
	}

	.timeline-wrapper {
		margin-bottom: 2rem;
	}

	.instructions {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1rem 1.5rem;
	}

	h2 {
		font-size: 1rem;
		font-weight: 600;
		margin-top: 0;
		margin-bottom: 0.5rem;
	}

	ul {
		margin: 0;
		padding-left: 1.5rem;
		color: #374151;
		line-height: 1.8;
	}

	li strong {
		color: #111;
	}
</style>
