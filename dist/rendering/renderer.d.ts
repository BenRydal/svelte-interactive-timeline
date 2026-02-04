/**
 * Timeline Renderer
 *
 * Orchestrates rendering of all timeline layers onto a canvas.
 */
import type { TimelineState, RenderLayer } from '../core/types';
import type { TimelineColorScheme } from '../config/colors';
import type { TimelineLayoutConfig } from '../config/layout';
export interface TimelineRendererConfig {
    /** Custom layers (replaces default layers if provided) */
    layers?: RenderLayer[];
    /** Color scheme */
    colors?: TimelineColorScheme;
    /** Layout configuration */
    layout?: TimelineLayoutConfig;
}
export declare class TimelineRenderer {
    private canvas;
    private ctx;
    private layers;
    private animationFrame;
    private _state;
    private _width;
    private _height;
    private dpr;
    constructor(canvas: HTMLCanvasElement, initialState: TimelineState, config?: TimelineRendererConfig);
    /**
     * Update canvas dimensions (call on resize)
     */
    resize(width: number, height: number): void;
    /**
     * Update state and request re-render
     */
    setState(state: TimelineState): void;
    /**
     * Request a render on next animation frame (debounced)
     */
    requestRender(): void;
    /**
     * Main render loop
     */
    private render;
    /**
     * Convert time to pixel X position (respects zoom/pan)
     */
    timeToPixel(time: number): number;
    /**
     * Convert pixel X to time (respects zoom/pan)
     */
    pixelToTime(x: number): number;
    /**
     * Get a layer by name
     */
    getLayer(name: string): RenderLayer | undefined;
    /**
     * Add a layer to the stack
     */
    addLayer(layer: RenderLayer, index?: number): void;
    /**
     * Remove a layer by name
     */
    removeLayer(name: string): boolean;
    /**
     * Set layer visibility
     */
    setLayerVisible(name: string, visible: boolean): void;
    /**
     * Cleanup
     */
    destroy(): void;
    /**
     * Get current dimensions
     */
    get width(): number;
    get height(): number;
    /**
     * Get all layers
     */
    get allLayers(): RenderLayer[];
}
