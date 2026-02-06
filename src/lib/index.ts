/**
 * svelte-interactive-timeline
 *
 * A reusable timeline component library for Svelte 5 with canvas rendering.
 */

// Core typess
export type {
  DragTarget,
  HitTarget,
  TimelineState,
  RenderContext,
  RenderLayer,
} from "./core/types";

// Utilities
export {
  clamp,
  mapRange,
  formatTime,
  calculateGridInterval,
  generateGridLines,
  zoomAtPoint,
  panView,
  getDevicePixelRatio,
  resetShadow,
} from "./core/utils";

// Store
export {
  createTimelineStore,
  type TimelineStore,
  type TimelineStoreConfig,
} from "./core/store.svelte";

// Config
export {
  createColorScheme,
  defaultColorScheme,
  type TimelineColorScheme,
} from "./config/colors";

export {
  createLayoutConfig,
  defaultLayoutConfig,
  type TimelineLayoutConfig,
} from "./config/layout";

// Rendering layers
export {
  BackgroundLayer,
  PlayheadLayer,
  HoverLayer,
  ZoomSelectionLayer,
} from "./rendering/layers/index";

// Renderer
export {
  TimelineRenderer,
  type TimelineRendererConfig,
} from "./rendering/renderer";

// Components
export { default as Timeline } from "./components/Timeline.svelte";
export { default as TimelineCanvas } from "./components/TimelineCanvas.svelte";
export { default as TimelineControls } from "./components/TimelineControls.svelte";
