/**
 * Timeline Types
 *
 * Core type definitions for the timeline component.
 */
/** What the user is currently dragging */
export type DragTarget = 'playhead' | 'pan' | 'zoom-region' | null;
/** Hit test result */
export type HitTarget = 'playhead' | 'track' | 'empty';
/** Complete timeline state */
export interface TimelineState {
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
/** Context passed to render layers */
export interface RenderContext {
    ctx: CanvasRenderingContext2D;
    state: TimelineState;
    width: number;
    height: number;
    dpr: number;
    timeToX: (time: number) => number;
    xToTime: (x: number) => number;
}
/** Base interface for render layers */
export interface RenderLayer {
    name: string;
    visible: boolean;
    render(ctx: RenderContext): void;
}
