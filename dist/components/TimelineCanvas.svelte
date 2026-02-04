<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { TimelineStore } from '../core/store.svelte';
	import { TimelineRenderer } from '../rendering/renderer';
	import type { HitTarget, TimelineState, RenderLayer } from '../core/types';
	import type { TimelineColorScheme } from '../config/colors';
	import type { TimelineLayoutConfig } from '../config/layout';
	import { defaultLayoutConfig } from '../config/layout';

	interface Props {
		/** Timeline store instance */
		store: TimelineStore;
		/** Custom color scheme */
		colors?: TimelineColorScheme;
		/** Custom layout configuration */
		layout?: TimelineLayoutConfig;
		/** Custom render layers (replaces defaults if provided) */
		layers?: RenderLayer[];
		/** Called when current time changes (e.g., during playhead drag) */
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
		colors,
		layout,
		layers,
		onTimeChange,
		onViewChange,
		onPlayheadDragStart,
		onPlayheadDragEnd
	}: Props = $props();

	const effectiveLayout = $derived(layout ?? defaultLayoutConfig);

	/** Canvas element reference */
	let canvas: HTMLCanvasElement;

	/** Renderer instance */
	let renderer: TimelineRenderer | null = null;

	/** Container for resize observer */
	let container: HTMLDivElement;

	/** Current state snapshot for hit testing */
	let currentState: TimelineState;

	/** Pan state */
	let panStartX = 0;
	let panStartViewStart = 0;
	let panStartViewEnd = 0;

	/** Zoom region state */
	let zoomStartX = 0;

	// Reactive update of state
	$effect(() => {
		currentState = store.getState();
		renderer?.setState(currentState);
	});

	onMount(() => {
		// Get initial state
		currentState = store.getState();

		// Initialize renderer
		renderer = new TimelineRenderer(canvas, currentState, {
			colors,
			layout,
			layers
		});

		// Setup resize observer
		const resizeObserver = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry) {
				const { width, height } = entry.contentRect;
				renderer?.resize(width, height);
				updateXPositions();
			}
		});
		resizeObserver.observe(container);

		// Initial size
		const rect = container.getBoundingClientRect();
		renderer.resize(rect.width, rect.height);

		// Initial X positions update
		updateXPositions();

		// Also update on window resize
		window.addEventListener('resize', updateXPositions);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('resize', updateXPositions);
		};
	});

	onDestroy(() => {
		renderer?.destroy();
	});

	/**
	 * Update the X positions for coordinate transforms.
	 */
	function updateXPositions(): void {
		if (!container) return;

		const rect = container.getBoundingClientRect();
		const leftX = rect.left;
		const rightX = rect.right;

		store.updateXPositions(leftX, rightX);
	}

	/**
	 * Set current time and notify via callback
	 */
	function setCurrentTime(time: number): void {
		store.setCurrentTime(time);
		onTimeChange?.(time);
	}

	/**
	 * Hit test to determine what element is at position
	 */
	function hitTest(x: number): HitTarget {
		if (!renderer || !currentState) return 'empty';

		const playheadX = renderer.timeToPixel(currentState.currentTime);

		// Playhead (full height, including handle area)
		if (Math.abs(x - playheadX) < effectiveLayout.playheadHitTolerance) {
			return 'playhead';
		}

		// Track area (clicking anywhere else seeks)
		return 'track';
	}

	/**
	 * Get cursor style for hit target
	 */
	function getCursor(target: HitTarget): string {
		switch (target) {
			case 'playhead':
				return 'grab';
			case 'track':
				return 'pointer';
			default:
				return 'default';
		}
	}

	/**
	 * Pointer down handler
	 */
	function onPointerDown(e: PointerEvent) {
		if (!renderer) return;

		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const time = renderer.pixelToTime(x);

		switch (hitTest(x)) {
			case 'playhead':
				store.setDragging('playhead');
				onPlayheadDragStart?.();
				canvas.style.cursor = 'grabbing';
				break;

			case 'track':
				// Middle click or alt+click to pan
				if (e.button === 1 || e.altKey) {
					store.setDragging('pan');
					panStartX = x;
					panStartViewStart = currentState.viewStart;
					panStartViewEnd = currentState.viewEnd;
					canvas.style.cursor = 'grabbing';
				} else {
					// Start potential zoom region (will become seek if no drag)
					store.setDragging('zoom-region');
					store.setZoomSelection(time, time);
					zoomStartX = x;
					canvas.style.cursor = 'crosshair';
				}
				break;

			case 'empty':
				break;
		}

		canvas.setPointerCapture(e.pointerId);
	}

	/**
	 * Pointer move handler
	 */
	function onPointerMove(e: PointerEvent) {
		if (!renderer) return;

		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const time = renderer.pixelToTime(x);

		if (currentState.isDragging) {
			switch (currentState.isDragging) {
				case 'playhead':
					setCurrentTime(time);
					break;

				case 'pan': {
					const deltaX = x - panStartX;
					const viewDuration = panStartViewEnd - panStartViewStart;
					const deltaTime = -(deltaX / renderer.width) * viewDuration;
					const newStart = panStartViewStart + deltaTime;
					const newEnd = panStartViewEnd + deltaTime;
					store.setView(newStart, newEnd);
					onViewChange?.(store.viewStart, store.viewEnd);
					break;
				}

				case 'zoom-region':
					store.setZoomSelection(currentState.zoomSelectionStart, time);
					break;
			}
		} else {
			// Update hover state
			if (y >= 0 && y <= renderer.height) {
				store.setHover(time);
			} else {
				store.setHover(null);
			}

			// Update cursor based on what's under mouse
			const target = hitTest(x);
			canvas.style.cursor = getCursor(target);
		}
	}

	/**
	 * Pointer up handler
	 */
	function onPointerUp(e: PointerEvent) {
		if (!renderer) return;

		if (currentState.isDragging) {
			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const wasDraggingPlayhead = currentState.isDragging === 'playhead';

			// Handle zoom-region completion
			if (currentState.isDragging === 'zoom-region') {
				const dragDistance = Math.abs(x - zoomStartX);

				if (dragDistance < effectiveLayout.dragThreshold) {
					// It was a click, not a drag - seek to this position
					const time = renderer.pixelToTime(x);
					setCurrentTime(time);
					store.setZoomSelection(null, null);
					store.setDragging(null);
				} else {
					// It was a drag - apply zoom
					store.applyZoomSelection();
					onViewChange?.(store.viewStart, store.viewEnd);
				}
			} else {
				store.setDragging(null);
			}

			if (wasDraggingPlayhead) {
				onPlayheadDragEnd?.();
			}

			canvas.releasePointerCapture(e.pointerId);

			// Reset cursor
			const target = hitTest(x);
			canvas.style.cursor = getCursor(target);
		}
	}

	/**
	 * Pointer leave handler
	 */
	function onPointerLeave() {
		if (!currentState.isDragging) {
			store.setHover(null);
		}
	}

	/**
	 * Wheel handler for zoom/pan
	 */
	function onWheel(e: WheelEvent) {
		if (!renderer) return;
		e.preventDefault();

		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const centerTime = renderer.pixelToTime(x);

		if (e.ctrlKey || e.metaKey) {
			// Zoom centered on mouse position
			const zoomFactor = e.deltaY > 0 ? 1.15 : 0.87;
			store.zoom(zoomFactor, centerTime);
		} else {
			// Pan - use deltaX for horizontal scroll, deltaY for vertical scroll wheel
			const viewDuration = currentState.viewEnd - currentState.viewStart;
			const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
			const panAmount = (delta / renderer.width) * viewDuration * 0.5;
			store.pan(panAmount);
		}

		onViewChange?.(store.viewStart, store.viewEnd);
	}
</script>

<div bind:this={container} class="w-full h-full min-h-10 relative">
	<canvas
		bind:this={canvas}
		class="block w-full h-full touch-none"
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointerleave={onPointerLeave}
		onwheel={onWheel}
	></canvas>
</div>
