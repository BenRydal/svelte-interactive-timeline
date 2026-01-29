# svelte-interactive-timeline

A canvas-based interactive timeline component for Svelte 5 with zoom, pan, scrub, and pluggable rendering layers.

Built for media playback interfaces, data visualization tools, and anywhere you need a high-performance timeline with rich interactions.

## Features

- **Canvas rendering** with DPI-aware scaling for crisp display on Retina screens
- **Zoom** via scroll wheel (Ctrl/Cmd + scroll), buttons, or drag-to-zoom selection
- **Pan** via scroll, Alt + drag, or middle-click drag
- **Scrub** by clicking anywhere or dragging the playhead
- **Playback controls** with play/pause, speed presets, and reset
- **Pluggable render layers** — add custom visualizations between the background and playhead
- **Responsive** — uses ResizeObserver, works at any width
- **Self-contained styles** — no Tailwind, DaisyUI, or external CSS required
- **TypeScript** throughout with full type exports

## Installation

```bash
npm install svelte-interactive-timeline
# or
yarn add svelte-interactive-timeline
```

Requires Svelte 5 as a peer dependency.

## Quick Start

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { TimelineContainer, timelineStore } from 'svelte-interactive-timeline';
  import type { TimelineCallbacks, PlaybackState, PlaybackCallbacks } from 'svelte-interactive-timeline';

  let isPlaying = $state(false);
  let speedIndex = $state(1);

  const SPEED_PRESETS = [
    { value: 0.5, label: '0.5x' },
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 5, label: '5x' },
    { value: 10, label: '10x' },
  ];

  let playback: PlaybackState = $derived({
    isPlaying,
    speedIndex,
    speedPresets: SPEED_PRESETS,
  });

  const playbackCallbacks: PlaybackCallbacks = {
    onTogglePlayback: () => (isPlaying = !isPlaying),
    onPause: () => (isPlaying = false),
    onSpeedChange: (idx) => (speedIndex = idx),
  };

  const callbacks: TimelineCallbacks = {
    onSeek: (time) => console.log('Seeked to', time),
    onViewChange: (start, end) => console.log('View changed', start, end),
  };

  onMount(() => {
    timelineStore.initialize(120); // 2-minute timeline
  });
</script>

<TimelineContainer
  height={60}
  showControls={true}
  {callbacks}
  {playback}
  {playbackCallbacks}
/>
```

## Components

### `<TimelineContainer>`

The main component. Composes the canvas and controls.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `endTime` | `number` | `0` | Initialize with this duration (alternative to calling `timelineStore.initialize()`) |
| `height` | `number` | `80` | Canvas height in pixels |
| `showControls` | `boolean` | `true` | Show the playback/zoom control bar |
| `embedded` | `boolean` | `false` | Embedded mode — removes border/shadow |
| `customLayers` | `RenderLayer[]` | `[]` | Custom render layers (inserted between background and playhead) |
| `callbacks` | `TimelineCallbacks` | `{}` | Event callbacks for seek, view change, redraw |
| `playback` | `PlaybackState` | — | Current playback state |
| `playbackCallbacks` | `PlaybackCallbacks` | `{}` | Playback control callbacks |
| `showGradientToggle` | `boolean` | `false` | Show an optional gradient toggle button |
| `gradientActive` | `boolean` | `false` | Gradient toggle state |
| `onGradientToggle` | `() => void` | — | Gradient toggle callback |

**Exported methods** (via `bind:this`):
- `initialize(end, start?)` — set data range
- `setCurrentTime(time)` — move playhead
- `getRenderer()` — access the `TimelineRenderer` instance

### `<TimelineCanvas>`

The canvas element with pointer/wheel event handling. Used internally by `TimelineContainer`, but can be used standalone for custom layouts.

### `<TimelineControls>`

The control bar (play/pause, speed, zoom buttons, time display). Also used internally but available for custom layouts.

## Store

```ts
import { timelineStore, createTimelineStore } from 'svelte-interactive-timeline';
```

`timelineStore` is a default singleton. Use `createTimelineStore()` if you need multiple independent timelines.

### Store Methods

| Method | Description |
|--------|-------------|
| `initialize(endTime, startTime?)` | Set data time range |
| `reset()` | Reset to empty state |
| `setCurrentTime(time)` | Move playhead (clamped to data range) |
| `setView(start, end)` | Set visible window |
| `zoom(factor, centerTime?)` | Zoom in (`< 1`) or out (`> 1`) around a point |
| `zoomToFit()` | Reset view to show full data range |
| `pan(deltaTime)` | Shift view by time offset |
| `getState()` | Get current `TimelineState` snapshot |
| `hasData()` | Whether timeline has been initialized |

### Derived Stores

```ts
import { viewDuration, dataDuration, zoomLevel, isZoomed } from 'svelte-interactive-timeline';
```

- `viewDuration` — current visible time span
- `dataDuration` — total data time span
- `zoomLevel` — ratio of data to view duration (1 = no zoom)
- `isZoomed` — whether the timeline is zoomed in

## Custom Render Layers

Add your own visualizations by implementing the `RenderLayer` interface:

```ts
import type { RenderLayer, RenderContext } from 'svelte-interactive-timeline';

const myLayer: RenderLayer = {
  name: 'my-overlay',
  visible: true,
  render({ ctx, state, width, height, timeToX }: RenderContext) {
    // Draw a marker at time = 30s
    const x = timeToX(30);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.fillRect(x - 1, 0, 2, height);
  },
};
```

Pass custom layers via the `customLayers` prop — they render between the background grid and the playhead.

You can also add/remove layers dynamically via the renderer:

```ts
const renderer = containerRef.getRenderer();
renderer.addLayer(myLayer);    // inserted before playhead
renderer.removeLayer('my-overlay');
renderer.getLayer('my-overlay');
```

### RenderContext

Every layer's `render()` receives:

| Field | Type | Description |
|-------|------|-------------|
| `ctx` | `CanvasRenderingContext2D` | The canvas context (already DPI-scaled) |
| `state` | `TimelineState` | Full timeline state snapshot |
| `width` | `number` | Canvas width in CSS pixels |
| `height` | `number` | Canvas height in CSS pixels |
| `dpr` | `number` | Device pixel ratio |
| `timeToX(time)` | `(number) => number` | Convert time to X pixel (respects zoom/pan) |
| `xToTime(x)` | `(number) => number` | Convert X pixel to time (respects zoom/pan) |

## Types

All types are exported:

```ts
import type {
  TimelineState,
  RenderContext,
  RenderLayer,
  DragTarget,
  HitTarget,
  TimelineCallbacks,
  PlaybackState,
  PlaybackCallbacks,
} from 'svelte-interactive-timeline';
```

## Utilities

```ts
import {
  formatTime,       // (seconds, format?) => string
  clamp,            // (value, min, max) => number
  mapRange,         // (value, inStart, inEnd, outStart, outEnd) => number
  generateGridLines, // (viewStart, viewEnd, maxLabels?) => GridLine[]
  calculateGridInterval,
  getDevicePixelRatio,
  resetShadow,
} from 'svelte-interactive-timeline';
```

## Constants

Layout and color constants are exported for custom layer authors:

```ts
import { MONO_FONT, PLAYHEAD_HEAD_HEIGHT, LABEL_TOP_OFFSET } from 'svelte-interactive-timeline';
import { ACCENT, ACCENT_LIGHT, GRID_MAJOR, GRID_MINOR } from 'svelte-interactive-timeline';
```

## Interactions Reference

| Action | Effect |
|--------|--------|
| Click on track | Seek to position |
| Drag playhead | Scrub |
| Drag on track | Drag-to-zoom selection |
| Ctrl/Cmd + scroll | Zoom at cursor |
| Scroll (when zoomed) | Pan |
| Alt + drag | Pan |
| Middle-click + drag | Pan |
| Zoom +/- buttons | Step zoom in/out |
| Fit button | Reset to full view |
| Speed label click | Cycle speed presets (Shift+click for slower) |

## Development

```bash
git clone https://github.com/benshapiro/svelte-interactive-timeline.git
cd svelte-interactive-timeline
yarn install
yarn dev        # dev server with demo page
yarn check      # type checking
yarn package    # build distributable to dist/
```

## License

[MIT](LICENSE)
