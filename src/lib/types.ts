/**
 * Timeline Types
 *
 * Core type definitions for the interactive timeline component.
 */

/** What the user is currently dragging */
export type DragTarget = 'playhead' | 'pan' | 'zoom-region' | null;

/** Hit test result */
export type HitTarget = 'playhead' | 'track' | 'empty';

/** Complete timeline state */
export interface TimelineState {
	// Time bounds (full data range)
	dataStart: number;
	dataEnd: number;

	// View window (what's visible - controls playback bounds)
	viewStart: number;
	viewEnd: number;

	// Playhead
	currentTime: number;

	// Pixel bounds (for coordinate conversion)
	leftX: number;
	rightX: number;

	// UI state
	hoveredTime: number | null;
	isDragging: DragTarget;

	// Zoom selection (for drag-to-zoom)
	zoomSelectionStart: number | null;
	zoomSelectionEnd: number | null;
}

/** Context passed to render layers */
export interface RenderContext {
	ctx: CanvasRenderingContext2D;
	state: TimelineState;
	width: number;
	height: number;
	dpr: number; // Device pixel ratio
	timeToX: (time: number) => number;
	xToTime: (x: number) => number;
}

/** Base interface for render layers */
export interface RenderLayer {
	name: string;
	visible: boolean;
	render(ctx: RenderContext): void;
}

/** Callbacks for integrating timeline with external systems */
export interface TimelineCallbacks {
	/** Called when user seeks (clicks track or drags playhead) */
	onSeek?: (time: number) => void;
	/** Called when view window changes (zoom/pan) */
	onViewChange?: (viewStart: number, viewEnd: number) => void;
	/** Called to request a redraw of external visualization */
	onRequestRedraw?: () => void;
}

/** Props for playback control integration */
export interface PlaybackState {
	isPlaying: boolean;
	speedIndex: number;
	speedPresets: { value: number; label: string }[];
}

/** Callbacks for playback controls */
export interface PlaybackCallbacks {
	onTogglePlayback?: () => void;
	onPause?: () => void;
	onSpeedChange?: (presetIndex: number) => void;
}
