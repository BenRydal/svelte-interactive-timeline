<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Timeline,
		TimelineCanvas,
		TimelineControls,
		createTimelineStore,
		createColorScheme,
		createLayoutConfig,
		BackgroundLayer,
		PlayheadLayer,
		HoverLayer,
		ZoomSelectionLayer,
		type RenderLayer,
		type RenderContext
	} from '$lib';

	// Create a store instance for the basic demo
	const basicStore = createTimelineStore();

	// Create a store for the custom colors demo
	const customColorsStore = createTimelineStore();

	// Create a store for the custom layers demo
	const customLayersStore = createTimelineStore();

	// Custom color scheme (blue accent)
	const blueColors = createColorScheme({
		accent: '#3b82f6',
		accentLight: '#60a5fa',
		accentGlow: 'rgba(59, 130, 246, 0.4)',
		zoomFill: 'rgba(16, 185, 129, 0.15)',
		zoomStroke: 'rgba(16, 185, 129, 0.6)'
	});

	// Custom layout (larger playhead)
	const largeLayout = createLayoutConfig({
		playheadHeadHeight: 18,
		playheadHeadWidth: 16,
		playheadLineWidth: 3,
		labelFontSize: 11
	});

	// Custom layer example: adds markers at specific times
	class MarkersLayer implements RenderLayer {
		name = 'markers';
		visible = true;
		markers: number[] = [];

		constructor(markers: number[]) {
			this.markers = markers;
		}

		render(ctx: RenderContext): void {
			const { ctx: c, height, timeToX } = ctx;

			for (const marker of this.markers) {
				const x = timeToX(marker);
				if (x < 0 || x > ctx.width) continue;

				// Draw marker line
				c.strokeStyle = 'rgba(16, 185, 129, 0.8)';
				c.lineWidth = 2;
				c.setLineDash([]);
				c.beginPath();
				c.moveTo(x, 0);
				c.lineTo(x, height);
				c.stroke();

				// Draw marker dot
				c.fillStyle = '#10b981';
				c.beginPath();
				c.arc(x, 6, 4, 0, Math.PI * 2);
				c.fill();
			}
		}
	}

	// Create custom layers with markers
	const customLayers: RenderLayer[] = [
		new BackgroundLayer(),
		new MarkersLayer([10, 30, 45, 60, 90]), // Markers at specific seconds
		new PlayheadLayer(),
		new ZoomSelectionLayer(),
		new HoverLayer()
	];

	// Initialize stores
	onMount(() => {
		basicStore.initialize(120); // 2 minutes
		customColorsStore.initialize(180); // 3 minutes
		customLayersStore.initialize(120); // 2 minutes
	});

	// Code example for display
	const usageExample = `<script lang="ts">
  import { Timeline, createTimelineStore } from 'svelte-interactive-timeline';

  const store = createTimelineStore();
<\/script>

<Timeline
  {store}
  endTime={120}
  height={80}
  onTimeChange={(time) => console.log(time)}
/>`;

	// Event handlers
	function handleTimeChange(time: number) {
		console.log('Time changed:', time.toFixed(2));
	}

	function handleViewChange(viewStart: number, viewEnd: number) {
		console.log('View changed:', viewStart.toFixed(2), '-', viewEnd.toFixed(2));
	}
</script>

<svelte:head>
	<title>svelte-interactive-timeline Demo</title>
</svelte:head>

<div class="min-h-screen bg-base-100 p-8">
	<div class="max-w-4xl mx-auto space-y-8">
		<header>
			<h1 class="text-3xl font-bold mb-2">svelte-interactive-timeline</h1>
			<p class="text-base-content/60">
				A reusable timeline component library for Svelte 5 with canvas rendering.
			</p>
		</header>

		<!-- Basic Usage -->
		<section class="space-y-4">
			<h2 class="text-xl font-semibold">Basic Usage</h2>
			<p class="text-sm text-base-content/60">
				Default timeline with all standard features. Click to seek, drag playhead to scrub, drag on
				track to zoom, scroll to pan, Ctrl+scroll to zoom.
			</p>
			<Timeline
				store={basicStore}
				endTime={120}
				height={80}
				onTimeChange={handleTimeChange}
				onViewChange={handleViewChange}
			/>
		</section>

		<!-- Custom Colors -->
		<section class="space-y-4">
			<h2 class="text-xl font-semibold">Custom Colors</h2>
			<p class="text-sm text-base-content/60">
				Timeline with custom blue accent color and green zoom selection.
			</p>
			<Timeline store={customColorsStore} endTime={180} height={80} colors={blueColors} />
		</section>

		<!-- Custom Layout -->
		<section class="space-y-4">
			<h2 class="text-xl font-semibold">Custom Layout</h2>
			<p class="text-sm text-base-content/60">
				Timeline with larger playhead and font sizes.
			</p>
			<Timeline
				store={basicStore}
				height={100}
				layout={largeLayout}
				showZoomControls={true}
				showTimeDisplay={true}
			/>
		</section>

		<!-- Custom Layers -->
		<section class="space-y-4">
			<h2 class="text-xl font-semibold">Custom Layers</h2>
			<p class="text-sm text-base-content/60">
				Timeline with custom marker layer showing events at specific times.
			</p>
			<Timeline store={customLayersStore} endTime={120} height={80} layers={customLayers} />
		</section>

		<!-- Embedded Mode -->
		<section class="space-y-4">
			<h2 class="text-xl font-semibold">Embedded Mode</h2>
			<p class="text-sm text-base-content/60">
				Minimal styling for embedding in other components.
			</p>
			<div class="p-4 bg-base-200 rounded-lg">
				<Timeline store={basicStore} height={60} embedded={true} showControls={false} />
			</div>
		</section>

		<!-- Canvas Only -->
		<section class="space-y-4">
			<h2 class="text-xl font-semibold">Canvas Only</h2>
			<p class="text-sm text-base-content/60">
				Just the canvas component without the container or controls.
			</p>
			<div class="border border-base-300 rounded-lg overflow-hidden" style="height: 60px;">
				<TimelineCanvas store={basicStore} onTimeChange={handleTimeChange} />
			</div>
		</section>

		<!-- Controls Only -->
		<section class="space-y-4">
			<h2 class="text-xl font-semibold">Controls Only</h2>
			<p class="text-sm text-base-content/60">
				Just the controls component for custom layouts.
			</p>
			<TimelineControls
				store={basicStore}
				showZoomControls={true}
				showTimeDisplay={true}
				timeFormat="hms"
			/>
		</section>

		<!-- Time Formats -->
		<section class="space-y-4">
			<h2 class="text-xl font-semibold">Time Formats</h2>
			<div class="grid grid-cols-3 gap-4">
				<div>
					<p class="text-xs text-base-content/60 mb-2">HMS (default)</p>
					<TimelineControls
						store={basicStore}
						showZoomControls={false}
						showTimeDisplay={true}
						timeFormat="hms"
					/>
				</div>
				<div>
					<p class="text-xs text-base-content/60 mb-2">Minutes:Seconds</p>
					<TimelineControls
						store={basicStore}
						showZoomControls={false}
						showTimeDisplay={true}
						timeFormat="ms"
					/>
				</div>
				<div>
					<p class="text-xs text-base-content/60 mb-2">Seconds</p>
					<TimelineControls
						store={basicStore}
						showZoomControls={false}
						showTimeDisplay={true}
						timeFormat="seconds"
					/>
				</div>
			</div>
		</section>

		<!-- Usage Code -->
		<section class="space-y-4">
			<h2 class="text-xl font-semibold">Usage</h2>
			<pre class="bg-base-200 p-4 rounded-lg text-sm overflow-x-auto"><code>{usageExample}</code
				></pre>
		</section>
	</div>
</div>
