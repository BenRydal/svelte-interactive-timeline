/**
 * Svelte Interactive Timeline
 *
 * A canvas-based interactive timeline component for Svelte 5
 * with zoom, pan, and pluggable rendering layers.
 */

// Components
export { default as TimelineContainer } from './components/TimelineContainer.svelte';
export { default as TimelineCanvas } from './components/TimelineCanvas.svelte';
export { default as TimelineControls } from './components/TimelineControls.svelte';

// Store
export { timelineStore, createTimelineStore, viewDuration, dataDuration, zoomLevel, isZoomed } from './store';

// Types
export type {
	TimelineState,
	RenderContext,
	RenderLayer,
	DragTarget,
	HitTarget,
	TimelineCallbacks,
	PlaybackState,
	PlaybackCallbacks
} from './types';

// Renderer (for advanced use / custom layers)
export { TimelineRenderer } from './rendering/renderer';

// Built-in layers (for composition)
export { BackgroundLayer } from './rendering/layers/background';
export { PlayheadLayer } from './rendering/layers/playhead';
export { HoverLayer } from './rendering/layers/hover';
export { ZoomSelectionLayer } from './rendering/layers/zoom-selection';

// Utilities
export { formatTime, clamp, mapRange, generateGridLines, calculateGridInterval, resetShadow, getDevicePixelRatio } from './utils';

// Constants (for custom layer authors)
export * from './constants';
export * from './colors';
