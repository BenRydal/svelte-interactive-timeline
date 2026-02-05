/**
 * Timeline Store
 *
 * Reactive timeline state management using Svelte 5 runes.
 * Includes backwards compatibility with Svelte store subscribe pattern.
 */

import type { TimelineState, DragTarget } from './types';
import { clamp, mapRange, zoomAtPoint, panView } from './utils';

/** Configuration options for creating a timeline store */
export interface TimelineStoreConfig {
	/** Minimum duration when zoomed in (default: 1 second) */
	minZoomDuration?: number;
	/** Minimum zoom selection size to apply (default: 0.5 seconds) */
	minZoomSelectionThreshold?: number;
}

/** Subscriber function type */
type Subscriber<T> = (value: T) => void;

/** Unsubscribe function type */
type Unsubscriber = () => void;

/** Initial empty state */
const initialState: TimelineState = {
	dataStart: 0,
	dataEnd: 0,
	viewStart: 0,
	viewEnd: 0,
	currentTime: 0,
	leftX: 0,
	rightX: 0,
	hoveredTime: null,
	isDragging: null,
	zoomSelectionStart: null,
	zoomSelectionEnd: null
};

/**
 * Create a new timeline store instance
 */
export function createTimelineStore(config?: TimelineStoreConfig) {
	const minZoomDuration = config?.minZoomDuration ?? 1;
	const minZoomSelectionThreshold = config?.minZoomSelectionThreshold ?? 0.5;

	// State using Svelte 5 runes
	let dataStart = $state(initialState.dataStart);
	let dataEnd = $state(initialState.dataEnd);
	let viewStart = $state(initialState.viewStart);
	let viewEnd = $state(initialState.viewEnd);
	let currentTime = $state(initialState.currentTime);
	let leftX = $state(initialState.leftX);
	let rightX = $state(initialState.rightX);
	let hoveredTime = $state<number | null>(initialState.hoveredTime);
	let isDragging = $state<DragTarget>(initialState.isDragging);
	let zoomSelectionStart = $state<number | null>(initialState.zoomSelectionStart);
	let zoomSelectionEnd = $state<number | null>(initialState.zoomSelectionEnd);

	// Derived values
	const viewDuration = $derived(viewEnd - viewStart);
	const dataDuration = $derived(dataEnd - dataStart);
	const zoomLevel = $derived(viewDuration > 0 ? dataDuration / viewDuration : 1);
	const isZoomed = $derived(zoomLevel > 1.01);

	// Subscriber management for backwards compatibility
	const subscribers = new Set<Subscriber<TimelineState>>();
	let notifyScheduled = false;

	// Helper to get current state as object
	function getState(): TimelineState {
		return {
			dataStart,
			dataEnd,
			viewStart,
			viewEnd,
			currentTime,
			leftX,
			rightX,
			hoveredTime,
			isDragging,
			zoomSelectionStart,
			zoomSelectionEnd
		};
	}

	// Notify subscribers (debounced to batch updates)
	function notifySubscribers() {
		if (notifyScheduled) return;
		notifyScheduled = true;
		queueMicrotask(() => {
			notifyScheduled = false;
			const state = getState();
			for (const subscriber of subscribers) {
				subscriber(state);
			}
		});
	}

	// Wrapper to notify after state changes
	function withNotify<T>(fn: () => T): T {
		const result = fn();
		notifySubscribers();
		return result;
	}

	return {
		// State getters (reactive)
		get dataStart() { return dataStart; },
		get dataEnd() { return dataEnd; },
		get viewStart() { return viewStart; },
		get viewEnd() { return viewEnd; },
		get currentTime() { return currentTime; },
		get leftX() { return leftX; },
		get rightX() { return rightX; },
		get hoveredTime() { return hoveredTime; },
		get isDragging() { return isDragging; },
		get zoomSelectionStart() { return zoomSelectionStart; },
		get zoomSelectionEnd() { return zoomSelectionEnd; },

		// Derived getters
		get viewDuration() { return viewDuration; },
		get dataDuration() { return dataDuration; },
		get zoomLevel() { return zoomLevel; },
		get isZoomed() { return isZoomed; },

		/**
		 * Get current state as an object (for rendering)
		 */
		getState,

		/**
		 * Subscribe to state changes (Svelte store compatible)
		 */
		subscribe(subscriber: Subscriber<TimelineState>): Unsubscriber {
			subscribers.add(subscriber);
			// Immediately call with current state
			subscriber(getState());
			return () => {
				subscribers.delete(subscriber);
			};
		},

		/**
		 * Initialize timeline with data range
		 */
		initialize(endTime: number, startTime: number = 0) {
			withNotify(() => {
				dataStart = startTime;
				dataEnd = endTime;
				viewStart = startTime;
				viewEnd = endTime;
				currentTime = startTime;
			});
		},

		/**
		 * Reset to initial empty state (preserves pixel bounds)
		 */
		reset() {
			withNotify(() => {
				dataStart = initialState.dataStart;
				dataEnd = initialState.dataEnd;
				viewStart = initialState.viewStart;
				viewEnd = initialState.viewEnd;
				currentTime = initialState.currentTime;
				hoveredTime = initialState.hoveredTime;
				isDragging = initialState.isDragging;
				zoomSelectionStart = initialState.zoomSelectionStart;
				zoomSelectionEnd = initialState.zoomSelectionEnd;
			});
		},

		/**
		 * Check if timeline has data
		 */
		hasData(): boolean {
			return dataEnd > dataStart;
		},

		// ==================== Playhead ====================

		/**
		 * Set current playhead time
		 */
		setCurrentTime(time: number) {
			withNotify(() => {
				currentTime = clamp(time, dataStart, dataEnd);
			});
		},

		// ==================== View (Zoom/Pan) ====================

		/**
		 * Set view window directly
		 */
		setView(start: number, end: number) {
			withNotify(() => {
				viewStart = clamp(start, dataStart, dataEnd);
				viewEnd = clamp(end, dataStart, dataEnd);
			});
		},

		/**
		 * Zoom in/out centered on a time point
		 */
		zoom(factor: number, centerTime?: number) {
			withNotify(() => {
				const center = centerTime ?? (viewStart + viewEnd) / 2;
				const result = zoomAtPoint(
					viewStart,
					viewEnd,
					factor,
					center,
					dataStart,
					dataEnd,
					minZoomDuration
				);
				viewStart = result.viewStart;
				viewEnd = result.viewEnd;
			});
		},

		/**
		 * Reset view to show all data
		 */
		zoomToFit() {
			withNotify(() => {
				viewStart = dataStart;
				viewEnd = dataEnd;
			});
		},

		/**
		 * Pan view by time delta
		 */
		pan(deltaTime: number) {
			withNotify(() => {
				const result = panView(viewStart, viewEnd, deltaTime, dataStart, dataEnd);
				viewStart = result.viewStart;
				viewEnd = result.viewEnd;
			});
		},

		// ==================== UI State ====================

		/**
		 * Set hover state
		 */
		setHover(time: number | null) {
			withNotify(() => {
				hoveredTime = time;
			});
		},

		/**
		 * Set drag state
		 */
		setDragging(target: DragTarget) {
			withNotify(() => {
				isDragging = target;
			});
		},

		/**
		 * Set zoom selection range (for drag-to-zoom)
		 */
		setZoomSelection(start: number | null, end: number | null) {
			withNotify(() => {
				zoomSelectionStart = start;
				zoomSelectionEnd = end;
			});
		},

		/**
		 * Apply zoom selection and clear it
		 */
		applyZoomSelection() {
			withNotify(() => {
				if (zoomSelectionStart !== null && zoomSelectionEnd !== null) {
					const start = Math.min(zoomSelectionStart, zoomSelectionEnd);
					const end = Math.max(zoomSelectionStart, zoomSelectionEnd);
					// Only zoom if selection is meaningful
					if (end - start > minZoomSelectionThreshold) {
						viewStart = clamp(start, dataStart, dataEnd);
						viewEnd = clamp(end, dataStart, dataEnd);
					}
				}
				zoomSelectionStart = null;
				zoomSelectionEnd = null;
				isDragging = null;
			});
		},

		// ==================== Pixel Bounds ====================

		/**
		 * Update pixel positions (called when timeline canvas resizes)
		 */
		updateXPositions(newLeftX: number, newRightX: number) {
			withNotify(() => {
				leftX = newLeftX;
				rightX = newRightX;
			});
		},

		// ==================== Coordinate Conversion ====================

		/**
		 * Convert pixel position to time (full data range)
		 */
		pixelToTime(pixel: number): number {
			return mapRange(pixel, leftX, rightX, dataStart, dataEnd);
		},

		/**
		 * Convert time to pixel position (full data range)
		 */
		timeToPixel(time: number): number {
			return mapRange(time, dataStart, dataEnd, leftX, rightX);
		},

		/**
		 * Get view start pixel position
		 */
		getViewStartPixel(): number {
			return mapRange(viewStart, dataStart, dataEnd, leftX, rightX);
		},

		/**
		 * Get view end pixel position
		 */
		getViewEndPixel(): number {
			return mapRange(viewEnd, dataStart, dataEnd, leftX, rightX);
		},

		/**
		 * Convert pixel to view-space pixel
		 */
		pixelToViewPixel(pixel: number): number {
			const viewStartPx = this.getViewStartPixel();
			const viewEndPx = this.getViewEndPixel();
			return mapRange(pixel, leftX, rightX, viewStartPx, viewEndPx);
		},

		/**
		 * Convert view-space pixel to pixel
		 */
		viewPixelToPixel(pixel: number): number {
			const viewStartPx = this.getViewStartPixel();
			const viewEndPx = this.getViewEndPixel();
			return mapRange(pixel, viewStartPx, viewEndPx, leftX, rightX);
		},

		/**
		 * Check if pixel value is within view range
		 */
		overAxis(pixel: number): boolean {
			const viewStartPx = this.getViewStartPixel();
			const viewEndPx = this.getViewEndPixel();
			return pixel >= viewStartPx && pixel <= viewEndPx;
		}
	};
}

/** Type for the timeline store */
export type TimelineStore = ReturnType<typeof createTimelineStore>;
