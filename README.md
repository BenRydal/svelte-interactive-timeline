# svelte-interactive-timeline

A reusable timeline component library for Svelte 5 with canvas rendering.

## Features

- **Canvas-based rendering** for smooth performance
- **Svelte 5 runes** for modern reactivity
- **Customizable** colors, layout, and layers
- **Interactive** - click to seek, drag to scrub, drag to zoom, scroll to pan
- **DaisyUI** compatible styling
- **TypeScript** support

## Installation

```bash
npm install svelte-interactive-timeline
```

## Quick Start

```svelte
<script lang="ts">
  import { Timeline, createTimelineStore } from 'svelte-interactive-timeline';

  const store = createTimelineStore();
</script>

<Timeline
  {store}
  endTime={120}
  height={80}
  onTimeChange={(time) => console.log('Time:', time)}
/>
```

## Components

### Timeline

The main container component with canvas and controls.

```svelte
<Timeline
  {store}
  endTime={120}
  startTime={0}
  height={80}
  showControls={true}
  showZoomControls={true}
  showTimeDisplay={true}
  timeFormat="hms"
  embedded={false}
  colors={customColors}
  layout={customLayout}
  layers={customLayers}
  onTimeChange={(time) => {}}
  onViewChange={(start, end) => {}}
  onPlayheadDragStart={() => {}}
  onPlayheadDragEnd={() => {}}
/>
```

### TimelineCanvas

Just the canvas for custom layouts.

```svelte
<TimelineCanvas
  {store}
  colors={customColors}
  layout={customLayout}
  layers={customLayers}
  onTimeChange={(time) => {}}
  onViewChange={(start, end) => {}}
/>
```

### TimelineControls

Just the controls bar for custom layouts.

```svelte
<TimelineControls
  {store}
  showZoomControls={true}
  showTimeDisplay={true}
  timeFormat="hms"
  onZoom={() => {}}
/>
```

## Store

Create a timeline store to manage state:

```typescript
import { createTimelineStore } from 'svelte-interactive-timeline';

const store = createTimelineStore({
  minZoomDuration: 1, // Minimum 1 second when zoomed in
  minZoomSelectionThreshold: 0.5 // Minimum selection to apply zoom
});

// Initialize with duration
store.initialize(120); // 120 seconds

// Programmatic control
store.setCurrentTime(30);
store.zoom(0.5); // Zoom in
store.zoom(2); // Zoom out
store.zoomToFit(); // Reset zoom
store.pan(10); // Pan by 10 seconds
store.setView(10, 60); // Set view window

// Read state (reactive)
console.log(store.currentTime);
console.log(store.viewStart, store.viewEnd);
console.log(store.isZoomed);
console.log(store.zoomLevel);
```

## Customization

### Custom Colors

```typescript
import { createColorScheme } from 'svelte-interactive-timeline';

const customColors = createColorScheme({
  accent: '#3b82f6', // Blue playhead
  accentLight: '#60a5fa',
  accentGlow: 'rgba(59, 130, 246, 0.4)',
  zoomFill: 'rgba(16, 185, 129, 0.15)',
  zoomStroke: 'rgba(16, 185, 129, 0.6)'
});
```

### Custom Layout

```typescript
import { createLayoutConfig } from 'svelte-interactive-timeline';

const customLayout = createLayoutConfig({
  playheadHeadHeight: 18,
  playheadHeadWidth: 16,
  playheadLineWidth: 3,
  labelFontSize: 11,
  playheadHitTolerance: 12
});
```

### Custom Layers

Add custom rendering layers:

```typescript
import type { RenderLayer, RenderContext } from 'svelte-interactive-timeline';
import {
  BackgroundLayer,
  PlayheadLayer,
  HoverLayer,
  ZoomSelectionLayer
} from 'svelte-interactive-timeline';

class MarkersLayer implements RenderLayer {
  name = 'markers';
  visible = true;
  markers: number[] = [];

  constructor(markers: number[]) {
    this.markers = markers;
  }

  render(ctx: RenderContext): void {
    const { ctx: c, height, timeToX } = ctx;

    for (const marker of this.markers) {
      const x = timeToX(marker);
      if (x < 0 || x > ctx.width) continue;

      c.fillStyle = '#10b981';
      c.beginPath();
      c.arc(x, 6, 4, 0, Math.PI * 2);
      c.fill();
    }
  }
}

const customLayers = [
  new BackgroundLayer(),
  new MarkersLayer([10, 30, 60]),
  new PlayheadLayer(),
  new ZoomSelectionLayer(),
  new HoverLayer()
];
```

## Interactions

| Interaction | Action |
|-------------|--------|
| Click | Seek to time |
| Drag playhead | Scrub through time |
| Drag on track | Zoom to selection |
| Scroll (horizontal) | Pan view |
| Ctrl/Cmd + Scroll | Zoom at cursor |
| Alt + Drag | Pan view |
| Middle click + Drag | Pan view |

## API Reference

### Types

```typescript
type DragTarget = 'playhead' | 'pan' | 'zoom-region' | null;
type HitTarget = 'playhead' | 'track' | 'empty';

interface TimelineState {
  dataStart: number;
  dataEnd: number;
  viewStart: number;
  viewEnd: number;
  currentTime: number;
  leftX: number;
  rightX: number;
  hoveredTime: number | null;
  isDragging: DragTarget;
  zoomSelectionStart: number | null;
  zoomSelectionEnd: number | null;
}

interface RenderContext {
  ctx: CanvasRenderingContext2D;
  state: TimelineState;
  width: number;
  height: number;
  dpr: number;
  timeToX: (time: number) => number;
  xToTime: (x: number) => number;
}

interface RenderLayer {
  name: string;
  visible: boolean;
  render(ctx: RenderContext): void;
}
```

### Utilities

```typescript
import {
  clamp,
  mapRange,
  formatTime,
  calculateGridInterval,
  generateGridLines,
  zoomAtPoint,
  panView,
  getDevicePixelRatio
} from 'svelte-interactive-timeline';
```

## License

MIT
