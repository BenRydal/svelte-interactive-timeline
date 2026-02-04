# Creating Custom Layers

The timeline supports a pluggable layer system for custom rendering. Each layer implements the `RenderLayer` interface and is rendered in order from bottom to top.

## Layer Interface

```typescript
interface RenderLayer {
  name: string;
  visible: boolean;
  render(ctx: RenderContext): void;
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
```

## Built-in Layers

The library provides these built-in layers (render order):

1. **BackgroundLayer** - Grid lines and time labels
2. **PlayheadLayer** - Current time indicator
3. **ZoomSelectionLayer** - Drag-to-zoom selection rectangle
4. **HoverLayer** - Hover indicator and tooltip

## Creating a Custom Layer

### Basic Example: Markers Layer

```typescript
import type { RenderLayer, RenderContext } from 'svelte-interactive-timeline';

class MarkersLayer implements RenderLayer {
  name = 'markers';
  visible = true;
  markers: { time: number; label: string; color: string }[] = [];

  constructor(markers: { time: number; label: string; color: string }[]) {
    this.markers = markers;
  }

  render(ctx: RenderContext): void {
    const { ctx: c, height, timeToX, width } = ctx;

    for (const marker of this.markers) {
      const x = timeToX(marker.time);

      // Skip if outside visible area
      if (x < 0 || x > width) continue;

      // Draw vertical line
      c.strokeStyle = marker.color;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, height);
      c.stroke();

      // Draw label
      c.fillStyle = marker.color;
      c.font = '10px sans-serif';
      c.textAlign = 'center';
      c.fillText(marker.label, x, 12);
    }
  }
}
```

### Advanced Example: Activity Gradient Layer (from IGS)

This layer visualizes movement activity intensity over time. It's a good example of a layer that:
- Processes external data (user movement trails)
- Caches computed results
- Uses smooth color interpolation

```typescript
import type { RenderLayer, RenderContext } from 'svelte-interactive-timeline';

interface ActivityBucket {
  startTime: number;
  endTime: number;
  totalSpeed: number;
  count: number;
  activity: number; // 0-1 normalized
}

interface DataPoint {
  time: number;
  x: number;
  y: number;
}

class ActivityGradientLayer implements RenderLayer {
  name = 'activity-gradient';
  visible = true;

  private data: DataPoint[][] = []; // Array of trails
  private cachedBuckets: ActivityBucket[] = [];
  private cacheKey: string = '';

  // Configuration
  private numBuckets = 200;
  private barHeight = 14;
  private barBottomMargin = 2;
  private minOpacity = 0.08;
  private maxOpacity = 0.4;

  setData(trails: DataPoint[][]): void {
    this.data = trails;
    this.cacheKey = ''; // Invalidate cache
  }

  render(ctx: RenderContext): void {
    const { ctx: c, width, height, state, timeToX } = ctx;

    if (this.data.length === 0) return;

    // Create cache key
    const newCacheKey = `${state.dataStart}-${state.dataEnd}-${this.data.length}`;

    // Recompute if cache invalid
    if (this.cacheKey !== newCacheKey) {
      this.cachedBuckets = this.computeBuckets(state.dataStart, state.dataEnd);
      this.cacheKey = newCacheKey;
    }

    // Render gradient bar at bottom
    const barY = height - this.barHeight - this.barBottomMargin;

    for (const bucket of this.cachedBuckets) {
      const x1 = timeToX(bucket.startTime);
      const x2 = timeToX(bucket.endTime);

      if (x2 < 0 || x1 > width) continue;

      const drawX = Math.max(0, x1);
      const drawWidth = Math.min(width, x2) - drawX;

      if (drawWidth <= 0) continue;

      c.fillStyle = this.getActivityColor(bucket.activity, bucket.count > 0);
      c.fillRect(drawX, barY, drawWidth + 1, this.barHeight);
    }
  }

  private computeBuckets(dataStart: number, dataEnd: number): ActivityBucket[] {
    const duration = dataEnd - dataStart;
    if (duration <= 0) return [];

    const bucketDuration = duration / this.numBuckets;
    const buckets: ActivityBucket[] = [];

    // Initialize buckets
    for (let i = 0; i < this.numBuckets; i++) {
      buckets.push({
        startTime: dataStart + i * bucketDuration,
        endTime: dataStart + (i + 1) * bucketDuration,
        totalSpeed: 0,
        count: 0,
        activity: 0
      });
    }

    // Collect speeds from all trails
    for (const trail of this.data) {
      if (trail.length < 2) continue;

      for (let i = 1; i < trail.length; i++) {
        const prev = trail[i - 1];
        const curr = trail[i];

        const dt = curr.time - prev.time;
        if (dt <= 0) continue;

        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const speed = Math.sqrt(dx * dx + dy * dy) / dt;

        // Find buckets this segment spans
        const startBucket = Math.floor(((prev.time - dataStart) / duration) * this.numBuckets);
        const endBucket = Math.floor(((curr.time - dataStart) / duration) * this.numBuckets);

        const minBucket = Math.max(0, startBucket);
        const maxBucket = Math.min(this.numBuckets - 1, endBucket);

        for (let b = minBucket; b <= maxBucket; b++) {
          buckets[b].totalSpeed += speed;
          buckets[b].count += 1;
        }
      }
    }

    // Normalize using 95th percentile
    const averages: number[] = [];
    for (const bucket of buckets) {
      if (bucket.count > 0) {
        bucket.activity = bucket.totalSpeed / bucket.count;
        averages.push(bucket.activity);
      }
    }

    if (averages.length > 0) {
      averages.sort((a, b) => a - b);
      const p95 = averages[Math.floor(averages.length * 0.95)] || averages[averages.length - 1];

      if (p95 > 0) {
        for (const bucket of buckets) {
          if (bucket.count > 0) {
            bucket.activity = Math.min(1, bucket.activity / p95);
          }
        }
      }
    }

    return buckets;
  }

  private getActivityColor(activity: number, hasData: boolean): string {
    if (!hasData) return 'rgba(0, 0, 0, 0.03)';
    const opacity = this.minOpacity + activity * (this.maxOpacity - this.minOpacity);
    return `rgba(0, 0, 0, ${opacity.toFixed(3)})`;
  }
}
```

## Using Custom Layers

```svelte
<script lang="ts">
  import {
    Timeline,
    createTimelineStore,
    BackgroundLayer,
    PlayheadLayer,
    HoverLayer,
    ZoomSelectionLayer
  } from 'svelte-interactive-timeline';

  const store = createTimelineStore();

  // Create custom layer stack
  const layers = [
    new BackgroundLayer(),
    new MarkersLayer([
      { time: 30, label: 'Start', color: '#10b981' },
      { time: 90, label: 'End', color: '#ef4444' }
    ]),
    new PlayheadLayer(),
    new ZoomSelectionLayer(),
    new HoverLayer()
  ];
</script>

<Timeline {store} endTime={120} {layers} />
```

## Layer Best Practices

1. **Check bounds** - Skip rendering for elements outside the visible area
2. **Use caching** - For expensive computations, cache results and invalidate when data changes
3. **Respect DPI** - The canvas is scaled for device pixel ratio; coordinates are in CSS pixels
4. **Use timeToX/xToTime** - These helpers handle zoom/pan transformations
5. **Order matters** - Layers render bottom to top; put overlays last
6. **Save/restore context** - The renderer calls `ctx.save()` before each layer

## Potential Library Additions

These layer types could be generalized and added to the library:

### 1. RegionsLayer
Render colored regions/ranges on the timeline:
```typescript
interface TimeRegion {
  start: number;
  end: number;
  color: string;
  label?: string;
}
```

### 2. WaveformLayer
Display audio waveform data:
```typescript
interface WaveformData {
  samples: Float32Array;
  duration: number;
}
```

### 3. AnnotationsLayer
Show point-in-time annotations with labels:
```typescript
interface Annotation {
  time: number;
  label: string;
  icon?: string;
}
```

### 4. ThumbnailsLayer
Display video thumbnails at intervals:
```typescript
interface ThumbnailConfig {
  getThumbnail: (time: number) => HTMLImageElement | null;
  interval: number;
  height: number;
}
```
