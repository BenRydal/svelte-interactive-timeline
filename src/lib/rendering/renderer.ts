/**
 * Timeline Renderer
 *
 * Orchestrates rendering of all timeline layers onto a canvas.
 * Accepts optional custom layers for extensibility.
 */

import type { TimelineState, RenderLayer, RenderContext } from '../types';
import { mapRange, getDevicePixelRatio } from '../utils';
import { BackgroundLayer } from './layers/background';
import { PlayheadLayer } from './layers/playhead';
import { HoverLayer } from './layers/hover';
import { ZoomSelectionLayer } from './layers/zoom-selection';

export class TimelineRenderer {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private layers: RenderLayer[];
	private animationFrame: number | null = null;
	private _state: TimelineState;
	private _width: number = 0;
	private _height: number = 0;
	private dpr: number;

	/**
	 * @param canvas - The canvas element to render onto
	 * @param initialState - Initial timeline state
	 * @param customLayers - Optional custom layers inserted between background and playhead
	 */
	constructor(canvas: HTMLCanvasElement, initialState: TimelineState, customLayers?: RenderLayer[]) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d')!;
		this._state = initialState;
		this.dpr = getDevicePixelRatio();

		// Render order: background -> custom layers -> playhead -> zoom selection -> hover
		this.layers = [
			new BackgroundLayer(),
			...(customLayers ?? []),
			new PlayheadLayer(),
			new ZoomSelectionLayer(),
			new HoverLayer()
		];
	}

	/**
	 * Add a layer dynamically (inserted before PlayheadLayer)
	 */
	addLayer(layer: RenderLayer): void {
		const playheadIndex = this.layers.findIndex((l) => l.name === 'playhead');
		if (playheadIndex >= 0) {
			this.layers.splice(playheadIndex, 0, layer);
		} else {
			this.layers.push(layer);
		}
		this.requestRender();
	}

	/**
	 * Remove a layer by name
	 */
	removeLayer(name: string): void {
		this.layers = this.layers.filter((l) => l.name !== name);
		this.requestRender();
	}

	/**
	 * Get a layer by name (for external state updates)
	 */
	getLayer<T extends RenderLayer>(name: string): T | undefined {
		return this.layers.find((l) => l.name === name) as T | undefined;
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
	 * Render a single frame
	 */
	private render(): void {
		this.animationFrame = null;

		const { ctx, _width: width, _height: height, _state: state, dpr } = this;

		if (width === 0 || height === 0) return;

		ctx.save();
		ctx.scale(dpr, dpr);
		ctx.clearRect(0, 0, width, height);

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
}
