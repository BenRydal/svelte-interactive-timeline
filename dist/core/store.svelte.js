/**
 * Timeline Store
 *
 * Reactive timeline state management using Svelte 5 runes.
 * Includes backwards compatibility with Svelte store subscribe pattern.
 */
import { clamp, mapRange, zoomAtPoint, panView } from './utils';
/** Initial empty state */
const initialState = {
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
export function createTimelineStore(config) {
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
    let hoveredTime = $state(initialState.hoveredTime);
    let isDragging = $state(initialState.isDragging);
    let zoomSelectionStart = $state(initialState.zoomSelectionStart);
    let zoomSelectionEnd = $state(initialState.zoomSelectionEnd);
    // Derived values
    const viewDuration = $derived(viewEnd - viewStart);
    const dataDuration = $derived(dataEnd - dataStart);
    const zoomLevel = $derived(viewDuration > 0 ? dataDuration / viewDuration : 1);
    const isZoomed = $derived(zoomLevel > 1.01);
    // Subscriber management for backwards compatibility
    const subscribers = new Set();
    let notifyScheduled = false;
    // Helper to get current state as object
    function getState() {
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
        if (notifyScheduled)
            return;
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
    function withNotify(fn) {
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
        subscribe(subscriber) {
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
        initialize(endTime, startTime = 0) {
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
        hasData() {
            return dataEnd > dataStart;
        },
        // ==================== Playhead ====================
        /**
         * Set current playhead time
         */
        setCurrentTime(time) {
            withNotify(() => {
                currentTime = clamp(time, dataStart, dataEnd);
            });
        },
        // ==================== View (Zoom/Pan) ====================
        /**
         * Set view window directly
         */
        setView(start, end) {
            withNotify(() => {
                viewStart = clamp(start, dataStart, dataEnd);
                viewEnd = clamp(end, dataStart, dataEnd);
            });
        },
        /**
         * Zoom in/out centered on a time point
         */
        zoom(factor, centerTime) {
            withNotify(() => {
                const center = centerTime ?? (viewStart + viewEnd) / 2;
                const result = zoomAtPoint(viewStart, viewEnd, factor, center, dataStart, dataEnd, minZoomDuration);
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
        pan(deltaTime) {
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
        setHover(time) {
            withNotify(() => {
                hoveredTime = time;
            });
        },
        /**
         * Set drag state
         */
        setDragging(target) {
            withNotify(() => {
                isDragging = target;
            });
        },
        /**
         * Set zoom selection range (for drag-to-zoom)
         */
        setZoomSelection(start, end) {
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
        updateXPositions(newLeftX, newRightX) {
            withNotify(() => {
                leftX = newLeftX;
                rightX = newRightX;
            });
        },
        // ==================== Coordinate Conversion ====================
        /**
         * Convert pixel position to time (full data range)
         */
        pixelToTime(pixel) {
            return mapRange(pixel, leftX, rightX, dataStart, dataEnd);
        },
        /**
         * Convert time to pixel position (full data range)
         */
        timeToPixel(time) {
            return mapRange(time, dataStart, dataEnd, leftX, rightX);
        },
        /**
         * Get view start pixel position
         */
        getViewStartPixel() {
            return mapRange(viewStart, dataStart, dataEnd, leftX, rightX);
        },
        /**
         * Get view end pixel position
         */
        getViewEndPixel() {
            return mapRange(viewEnd, dataStart, dataEnd, leftX, rightX);
        },
        /**
         * Convert pixel to view-space pixel
         */
        pixelToViewPixel(pixel) {
            const viewStartPx = this.getViewStartPixel();
            const viewEndPx = this.getViewEndPixel();
            return mapRange(pixel, leftX, rightX, viewStartPx, viewEndPx);
        },
        /**
         * Convert view-space pixel to pixel
         */
        viewPixelToPixel(pixel) {
            const viewStartPx = this.getViewStartPixel();
            const viewEndPx = this.getViewEndPixel();
            return mapRange(pixel, viewStartPx, viewEndPx, leftX, rightX);
        },
        /**
         * Check if pixel value is within view range
         */
        overAxis(pixel) {
            const viewStartPx = this.getViewStartPixel();
            const viewEndPx = this.getViewEndPixel();
            return pixel >= viewStartPx && pixel <= viewEndPx;
        }
    };
}
