<script lang="ts">
	import { onMount } from 'svelte';
	import TimelineCanvas from './TimelineCanvas.svelte';
	import TimelineControls from './TimelineControls.svelte';
	import type { TimelineStore } from '../core/store.svelte';
	import type { TimelineColorScheme } from '../config/colors';
	import type { TimelineLayoutConfig } from '../config/layout';
	import type { RenderLayer } from '../core/types';

	interface Props {
		/** Timeline store instance */
		store: TimelineStore;
		/** Initial end time (optional - can also use store.initialize()) */
		endTime?: number;
		/** Initial start time */
		startTime?: number;
		/** Height of the canvas area in pixels */
		height?: number;
		/** Whether to show controls */
		showControls?: boolean;
		/** Show zoom controls in the controls bar */
		showZoomControls?: boolean;
		/** Show time display in the controls bar */
		showTimeDisplay?: boolean;
		/** Time format for display */
		timeFormat?: 'hms' | 'ms' | 'seconds';
		/** Embedded mode - removes border/shadow for use inside other containers */
		embedded?: boolean;
		/** Custom color scheme */
		colors?: TimelineColorScheme;
		/** Custom layout configuration */
		layout?: TimelineLayoutConfig;
		/** Custom render layers */
		layers?: RenderLayer[];
		/** Called when current time changes */
		onTimeChange?: (time: number) => void;
		/** Called when view changes (zoom/pan) */
		onViewChange?: (viewStart: number, viewEnd: number) => void;
		/** Called when playhead drag starts */
		onPlayheadDragStart?: () => void;
		/** Called when playhead drag ends */
		onPlayheadDragEnd?: () => void;
	}

	let {
		store,
		endTime = 0,
		startTime = 0,
		height = 80,
		showControls = true,
		showZoomControls = true,
		showTimeDisplay = true,
		timeFormat = 'hms',
		embedded = false,
		colors,
		layout,
		layers,
		onTimeChange,
		onViewChange,
		onPlayheadDragStart,
		onPlayheadDragEnd
	}: Props = $props();

	onMount(() => {
		// Initialize with provided times if specified
		if (endTime > startTime) {
			store.initialize(endTime, startTime);
		}
	});
</script>

<div
	class="flex flex-col w-full overflow-hidden border border-base-300 {embedded
		? 'rounded-md bg-base-100'
		: 'rounded-lg bg-base-200 shadow-sm'}"
>
	<div class="flex-shrink-0 border-b border-base-300" style="height: {height}px">
		<TimelineCanvas
			{store}
			{colors}
			{layout}
			{layers}
			{onTimeChange}
			{onViewChange}
			{onPlayheadDragStart}
			{onPlayheadDragEnd}
		/>
	</div>
	{#if showControls}
		<TimelineControls
			{store}
			{showZoomControls}
			{showTimeDisplay}
			{timeFormat}
			onZoom={() => onViewChange?.(store.viewStart, store.viewEnd)}
		/>
	{/if}
</div>
