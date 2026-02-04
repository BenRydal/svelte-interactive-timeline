/**
 * Timeline Store
 *
 * Reactive timeline state management using Svelte 5 runes.
 * Includes backwards compatibility with Svelte store subscribe pattern.
 */
import type { TimelineState, DragTarget } from './types';
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
/**
 * Create a new timeline store instance
 */
export declare function createTimelineStore(config?: TimelineStoreConfig): {
    readonly dataStart: number;
    readonly dataEnd: number;
    readonly viewStart: number;
    readonly viewEnd: number;
    readonly currentTime: number;
    readonly leftX: number;
    readonly rightX: number;
    readonly hoveredTime: number | null;
    readonly isDragging: DragTarget;
    readonly zoomSelectionStart: number | null;
    readonly zoomSelectionEnd: number | null;
    readonly viewDuration: number;
    readonly dataDuration: number;
    readonly zoomLevel: number;
    readonly isZoomed: boolean;
    /**
     * Get current state as an object (for rendering)
     */
    getState: () => TimelineState;
    /**
     * Subscribe to state changes (Svelte store compatible)
     */
    subscribe(subscriber: Subscriber<TimelineState>): Unsubscriber;
    /**
     * Initialize timeline with data range
     */
    initialize(endTime: number, startTime?: number): void;
    /**
     * Reset to initial empty state (preserves pixel bounds)
     */
    reset(): void;
    /**
     * Check if timeline has data
     */
    hasData(): boolean;
    /**
     * Set current playhead time
     */
    setCurrentTime(time: number): void;
    /**
     * Set view window directly
     */
    setView(start: number, end: number): void;
    /**
     * Zoom in/out centered on a time point
     */
    zoom(factor: number, centerTime?: number): void;
    /**
     * Reset view to show all data
     */
    zoomToFit(): void;
    /**
     * Pan view by time delta
     */
    pan(deltaTime: number): void;
    /**
     * Set hover state
     */
    setHover(time: number | null): void;
    /**
     * Set drag state
     */
    setDragging(target: DragTarget): void;
    /**
     * Set zoom selection range (for drag-to-zoom)
     */
    setZoomSelection(start: number | null, end: number | null): void;
    /**
     * Apply zoom selection and clear it
     */
    applyZoomSelection(): void;
    /**
     * Update pixel positions (called when timeline canvas resizes)
     */
    updateXPositions(newLeftX: number, newRightX: number): void;
    /**
     * Convert pixel position to time (full data range)
     */
    pixelToTime(pixel: number): number;
    /**
     * Convert time to pixel position (full data range)
     */
    timeToPixel(time: number): number;
    /**
     * Get view start pixel position
     */
    getViewStartPixel(): number;
    /**
     * Get view end pixel position
     */
    getViewEndPixel(): number;
    /**
     * Convert pixel to view-space pixel
     */
    pixelToViewPixel(pixel: number): number;
    /**
     * Convert view-space pixel to pixel
     */
    viewPixelToPixel(pixel: number): number;
    /**
     * Check if pixel value is within view range
     */
    overAxis(pixel: number): boolean;
};
/** Type for the timeline store */
export type TimelineStore = ReturnType<typeof createTimelineStore>;
export {};
