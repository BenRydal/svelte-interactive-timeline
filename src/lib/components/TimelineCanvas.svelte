<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { timelineStore } from '../store';
	import { TimelineRenderer } from '../rendering/renderer';
	import type { HitTarget, TimelineState, RenderLayer, TimelineCallbacks } from '../types';
	import { PLAYHEAD_HIT_TOLERANCE } from '../constants';

	interface Props {
		/** Custom render layers to add between background and playhead */
		customLayers?: RenderLayer[];
		/** Callbacks for external integration */
		callbacks?: TimelineCallbacks;
	}

	let { customLayers = [], callbacks = {} }: Props = $props();

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
	const DRAG_THRESHOLD = 5; // pixels - distinguishes click from drag

	/** Subscribe to store changes */
	const unsubscribe = timelineStore.subscribe((state) => {
		currentState = state;
		renderer?.setState(state);
	});

	/**
	 * Update the X positions for coordinate transforms.
	 */
	function updateXPositions(): void {
		if (!container) return;

		const rect = container.getBoundingClientRect();
		timelineStore.updateXPositions(rect.left, rect.right);
		callbacks.onRequestRedraw?.();
	}

	function syncCurrentTime(time: number): void {
		timelineStore.setCurrentTime(time);
		callbacks.onSeek?.(time);
		callbacks.onRequestRedraw?.();
	}

	onMount(() => {
		// Initialize renderer with custom layers
		renderer = new TimelineRenderer(canvas, currentState, customLayers);

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

		const rect = container.getBoundingClientRect();
		renderer.resize(rect.width, rect.height);
		updateXPositions();

		window.addEventListener('resize', updateXPositions);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('resize', updateXPositions);
		};
	});

	onDestroy(() => {
		unsubscribe();
		renderer?.destroy();
	});

	/**
	 * Get the renderer instance (for external access, e.g., custom layer updates)
	 */
	export function getRenderer(): TimelineRenderer | null {
		return renderer;
	}

	/**
	 * Hit test to determine what element is at position
	 */
	function hitTest(x: number): HitTarget {
		if (!renderer || !currentState) return 'empty';

		const playheadX = renderer.timeToPixel(currentState.currentTime);
		if (Math.abs(x - playheadX) < PLAYHEAD_HIT_TOLERANCE) return 'playhead';
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
				timelineStore.setDragging('playhead');
				canvas.style.cursor = 'grabbing';
				break;

			case 'track':
				// Middle click or alt+click to pan
				if (e.button === 1 || e.altKey) {
					timelineStore.setDragging('pan');
					panStartX = x;
					panStartViewStart = currentState.viewStart;
					panStartViewEnd = currentState.viewEnd;
					canvas.style.cursor = 'grabbing';
				} else {
					// Start potential zoom region (will become seek if no drag)
					timelineStore.setDragging('zoom-region');
					timelineStore.setZoomSelection(time, time);
					zoomStartX = x;
					canvas.style.cursor = 'crosshair';
				}
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
					syncCurrentTime(time);
					break;

				case 'pan': {
					const deltaX = x - panStartX;
					const viewDuration = panStartViewEnd - panStartViewStart;
					const deltaTime = -(deltaX / renderer.width) * viewDuration;
					const newStart = panStartViewStart + deltaTime;
					const newEnd = panStartViewEnd + deltaTime;
					timelineStore.setView(newStart, newEnd);
					callbacks.onViewChange?.(newStart, newEnd);
					callbacks.onRequestRedraw?.();
					break;
				}

				case 'zoom-region':
					timelineStore.setZoomSelection(currentState.zoomSelectionStart, time);
					break;
			}
		} else {
			// Update hover state
			if (y >= 0 && y <= renderer.height) {
				timelineStore.setHover(time);
			} else {
				timelineStore.setHover(null);
			}

			// Update cursor based on what's under mouse
			canvas.style.cursor = getCursor(hitTest(x));
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

			// Handle zoom-region completion
			if (currentState.isDragging === 'zoom-region') {
				const dragDistance = Math.abs(x - zoomStartX);

				if (dragDistance < DRAG_THRESHOLD) {
					// It was a click, not a drag - seek to this position
					const time = renderer.pixelToTime(x);
					syncCurrentTime(time);
					timelineStore.setZoomSelection(null, null);
					timelineStore.setDragging(null);
				} else {
					// It was a drag - apply zoom
					timelineStore.applyZoomSelection();
					const state = timelineStore.getState();
					callbacks.onViewChange?.(state.viewStart, state.viewEnd);
					callbacks.onRequestRedraw?.();
				}
			} else {
				timelineStore.setDragging(null);
			}
			canvas.releasePointerCapture(e.pointerId);
			canvas.style.cursor = getCursor(hitTest(x));
		}
	}

	/**
	 * Pointer leave handler
	 */
	function onPointerLeave() {
		if (!currentState.isDragging) {
			timelineStore.setHover(null);
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
			timelineStore.zoom(zoomFactor, centerTime);
		} else {
			// Pan - use deltaX for horizontal scroll, deltaY for vertical scroll wheel
			const viewDuration = currentState.viewEnd - currentState.viewStart;
			const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
			const panAmount = (delta / renderer.width) * viewDuration * 0.5;
			timelineStore.pan(panAmount);
		}

		// Notify consumer of view change
		const state = timelineStore.getState();
		callbacks.onViewChange?.(state.viewStart, state.viewEnd);
		callbacks.onRequestRedraw?.();
	}
</script>

<div bind:this={container} class="itl-canvas-container">
	<canvas
		bind:this={canvas}
		class="itl-canvas"
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointerleave={onPointerLeave}
		onwheel={onWheel}
	></canvas>
</div>

<style>
	.itl-canvas-container {
		width: 100%;
		height: 100%;
		min-height: 40px;
		position: relative;
	}

	.itl-canvas {
		display: block;
		width: 100%;
		height: 100%;
		touch-action: none;
	}
</style>
