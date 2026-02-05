/**
 * Hover Layer
 *
 * Renders hover indicator and tooltip guide line.
 */

import type { RenderContext, RenderLayer } from '../../core/types';
import { formatTime, resetShadow } from '../../core/utils';
import type { TimelineColorScheme } from '../../config/colors';
import type { TimelineLayoutConfig } from '../../config/layout';
import { defaultColorScheme } from '../../config/colors';
import { defaultLayoutConfig } from '../../config/layout';

export class HoverLayer implements RenderLayer {
	name = 'hover';
	visible = true;

	private colors: TimelineColorScheme;
	private layout: TimelineLayoutConfig;

	constructor(colors?: TimelineColorScheme, layout?: TimelineLayoutConfig) {
		this.colors = colors ?? defaultColorScheme;
		this.layout = layout ?? defaultLayoutConfig;
	}

	render(ctx: RenderContext): void {
		const { ctx: c, width, height, state, timeToX } = ctx;
		const { colors } = this;

		if (state.hoveredTime === null) return;
		if (state.isDragging) return; // Hide during drag

		const x = timeToX(state.hoveredTime);

		// Skip if outside visible area
		if (x < 0 || x > width) return;

		// Dashed vertical line (full height)
		c.strokeStyle = colors.hoverLine;
		c.lineWidth = 1;
		c.setLineDash([4, 4]);
		c.beginPath();
		c.moveTo(x, 0);
		c.lineTo(x, height);
		c.stroke();
		c.setLineDash([]);

		// Time tooltip
		this.drawTooltip(c, x, state.hoveredTime, width);
	}

	private drawTooltip(c: CanvasRenderingContext2D, x: number, time: number, canvasWidth: number) {
		const { colors, layout } = this;
		const text = formatTime(time);

		// Measure text
		c.font = `${layout.tooltipFontSize}px ${layout.monoFont}`;
		const metrics = c.measureText(text);
		const tooltipWidth = metrics.width + layout.tooltipPadding * 2;

		// Position tooltip (keep within bounds)
		let tooltipX = x - tooltipWidth / 2;
		if (tooltipX < 4) tooltipX = 4;
		if (tooltipX + tooltipWidth > canvasWidth - 4) {
			tooltipX = canvasWidth - tooltipWidth - 4;
		}

		const tooltipY = layout.tooltipTopOffset;

		// Shadow
		c.shadowColor = colors.shadow;
		c.shadowBlur = 6;
		c.shadowOffsetY = 2;

		// Background
		c.fillStyle = colors.tooltipBg;
		c.beginPath();
		c.roundRect(tooltipX, tooltipY, tooltipWidth, layout.tooltipHeight, 4);
		c.fill();

		// Reset shadow
		resetShadow(c);

		// Text
		c.fillStyle = colors.white;
		c.textAlign = 'center';
		c.textBaseline = 'middle';
		c.fillText(text, tooltipX + tooltipWidth / 2, tooltipY + layout.tooltipHeight / 2);
	}

	/**
	 * Update colors at runtime
	 */
	setColors(colors: TimelineColorScheme): void {
		this.colors = colors;
	}

	/**
	 * Update layout at runtime
	 */
	setLayout(layout: TimelineLayoutConfig): void {
		this.layout = layout;
	}
}
