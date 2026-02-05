/**
 * Timeline Renderer
 *
 * Orchestrates rendering of all timeline layers onto a canvas.
 */

import type { TimelineState, RenderLayer, RenderContext } from '../core/types';
import { mapRange, getDevicePixelRatio } from '../core/utils';
import type { TimelineColorScheme } from '../config/colors';
import type { TimelineLayoutConfig } from '../config/layout';
import { defaultColorScheme } from '../config/colors';
import { defaultLayoutConfig } from '../config/layout';
import { BackgroundLayer } from './layers/BackgroundLayer';
import { PlayheadLayer } from './layers/PlayheadLayer';
import { HoverLayer } from './layers/HoverLayer';
import { ZoomSelectionLayer } from './layers/ZoomSelectionLayer';

export interface TimelineRendererConfig {
	/** Custom layers (replaces default layers if provided) */
	layers?: RenderLayer[];
	/** Color scheme */
	colors?: TimelineColorScheme;
	/** Layout configuration */
	layout?: TimelineLayoutConfig;
}

export class TimelineRenderer {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private layers: RenderLayer[];
	private animationFrame: number | null = null;
	private _state: TimelineState;
	private _width: number = 0;
	private _height: number = 0;
	private dpr: number;

	constructor(
		canvas: HTMLCanvasElement,
		initialState: TimelineState,
		config?: TimelineRendererConfig
	) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d')!;
		this._state = initialState;
		this.dpr = getDevicePixelRatio();

		const colors = config?.colors ?? defaultColorScheme;
		const layout = config?.layout ?? defaultLayoutConfig;

		// Use provided layers or create default layer stack
		if (config?.layers) {
			this.layers = config.layers;
		} else {
			// Default layer stack (render order: bottom to top)
			this.layers = [
				new BackgroundLayer(colors, layout),
				new PlayheadLayer(colors, layout),
				new ZoomSelectionLayer(colors),
				new HoverLayer(colors, layout)
			];
		}
	}

	/**
	 * Update canvas dimensions (call on resize)
	 */
	resize(width: number, height: number): void {
		this._width = width;
		this._height = height;
		this.dpr = getDevicePixelRatio();

		// Set actual size in memory (scaled for DPI)
		this.canvas.width = width * this.dpr;
		this.canvas.height = height * this.dpr;

		// Set display size
		this.canvas.style.width = `${width}px`;
		this.canvas.style.height = `${height}px`;

		// Request re-render
		this.requestRender();
	}

	/**
	 * Update state and request re-render
	 */
	setState(state: TimelineState): void {
		this._state = state;
		this.requestRender();
	}

	/**
	 * Request a render on next animation frame (debounced)
	 */
	requestRender(): void {
		if (this.animationFrame !== null) return;
		this.animationFrame = requestAnimationFrame(() => this.render());
	}

	/**
	 * Main render loop
	 */
	private render(): void {
		this.animationFrame = null;

		const { ctx, _width: width, _height: height, _state: state, dpr } = this;

		if (width === 0 || height === 0) return;

		// Save state and scale for DPI
		ctx.save();
		ctx.scale(dpr, dpr);

		// Clear canvas
		ctx.clearRect(0, 0, width, height);

		// Create render context with coordinate helpers
		const renderCtx: RenderContext = {
			ctx,
			state,
			width,
			height,
			dpr,
			timeToX: (time: number) => this.timeToPixel(time),
			xToTime: (x: number) => this.pixelToTime(x)
		};

		// Render each visible layer
		for (const layer of this.layers) {
			if (layer.visible) {
				ctx.save();
				layer.render(renderCtx);
				ctx.restore();
			}
		}

		ctx.restore();
	}

	/**
	 * Convert time to pixel X position (respects zoom/pan)
	 */
	timeToPixel(time: number): number {
		const { viewStart, viewEnd } = this._state;
		return mapRange(time, viewStart, viewEnd, 0, this._width);
	}

	/**
	 * Convert pixel X to time (respects zoom/pan)
	 */
	pixelToTime(x: number): number {
		const { viewStart, viewEnd } = this._state;
		return mapRange(x, 0, this._width, viewStart, viewEnd);
	}

	/**
	 * Get a layer by name
	 */
	getLayer(name: string): RenderLayer | undefined {
		return this.layers.find((l) => l.name === name);
	}

	/**
	 * Add a layer to the stack
	 */
	addLayer(layer: RenderLayer, index?: number): void {
		if (index !== undefined) {
			this.layers.splice(index, 0, layer);
		} else {
			this.layers.push(layer);
		}
		this.requestRender();
	}

	/**
	 * Remove a layer by name
	 */
	removeLayer(name: string): boolean {
		const index = this.layers.findIndex((l) => l.name === name);
		if (index !== -1) {
			this.layers.splice(index, 1);
			this.requestRender();
			return true;
		}
		return false;
	}

	/**
	 * Set layer visibility
	 */
	setLayerVisible(name: string, visible: boolean): void {
		const layer = this.getLayer(name);
		if (layer) {
			layer.visible = visible;
			this.requestRender();
		}
	}

	/**
	 * Cleanup
	 */
	destroy(): void {
		if (this.animationFrame !== null) {
			cancelAnimationFrame(this.animationFrame);
			this.animationFrame = null;
		}
	}

	/**
	 * Get current dimensions
	 */
	get width(): number {
		return this._width;
	}

	get height(): number {
		return this._height;
	}

	/**
	 * Get all layers
	 */
	get allLayers(): RenderLayer[] {
		return this.layers;
	}
}
