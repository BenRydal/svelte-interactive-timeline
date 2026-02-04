/**
 * svelte-interactive-timeline
 *
 * A reusable timeline component library for Svelte 5 with canvas rendering.
 */
export type { DragTarget, HitTarget, TimelineState, RenderContext, RenderLayer } from './core/types';
export { clamp, mapRange, formatTime, calculateGridInterval, generateGridLines, zoomAtPoint, panView, getDevicePixelRatio, resetShadow } from './core/utils';
export { createTimelineStore, type TimelineStore, type TimelineStoreConfig } from './core/store.svelte';
export { createColorScheme, defaultColorScheme, type TimelineColorScheme } from './config/colors';
export { createLayoutConfig, defaultLayoutConfig, type TimelineLayoutConfig } from './config/layout';
export { BackgroundLayer, PlayheadLayer, HoverLayer, ZoomSelectionLayer } from './rendering/layers/index';
export { TimelineRenderer, type TimelineRendererConfig } from './rendering/renderer';
export { default as Timeline } from './components/Timeline.svelte';
export { default as TimelineCanvas } from './components/TimelineCanvas.svelte';
export { default as TimelineControls } from './components/TimelineControls.svelte';
