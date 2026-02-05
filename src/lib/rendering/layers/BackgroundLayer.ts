/**
 * Background Layer
 *
 * Renders grid lines and time labels on the timeline.
 */

import type { RenderContext, RenderLayer } from '../../core/types';
import { generateGridLines } from '../../core/utils';
import type { TimelineColorScheme } from '../../config/colors';
import type { TimelineLayoutConfig } from '../../config/layout';
import { defaultColorScheme } from '../../config/colors';
import { defaultLayoutConfig } from '../../config/layout';

export class BackgroundLayer implements RenderLayer {
	name = 'background';
	visible = true;

	private colors: TimelineColorScheme;
	private layout: TimelineLayoutConfig;

	constructor(colors?: TimelineColorScheme, layout?: TimelineLayoutConfig) {
		this.colors = colors ?? defaultColorScheme;
		this.layout = layout ?? defaultLayoutConfig;
	}

	render(ctx: RenderContext): void {
		const { ctx: c, width, height, state, timeToX } = ctx;
		const { colors, layout } = this;

		// Fill background
		c.fillStyle = colors.white;
		c.fillRect(0, 0, width, height);

		// Generate grid lines based on visible range
		const maxLabels = Math.floor(width / layout.gridLabelSpacing);
		const gridLines = generateGridLines(state.viewStart, state.viewEnd, maxLabels);

		// Draw grid lines (full height)
		for (const line of gridLines) {
			const x = timeToX(line.time);

			// Skip if outside visible area
			if (x < 0 || x > width) continue;

			// Vertical grid line - full height
			c.strokeStyle = line.isMajor ? colors.gridMajor : colors.gridMinor;
			c.lineWidth = line.isMajor ? 1 : 0.5;
			c.beginPath();
			c.moveTo(x, 0);
			c.lineTo(x, height);
			c.stroke();
		}

		// Draw time labels on top of timeline (after grid lines so labels are on top)
		c.font = `${layout.labelFontSize}px ${layout.monoFont}`;
		c.textAlign = 'center';
		c.textBaseline = 'middle';

		for (const line of gridLines) {
			if (!line.isMajor) continue;

			const x = timeToX(line.time);
			if (x < 0 || x > width) continue;

			// Measure text for background
			const textWidth = c.measureText(line.label).width;
			const padding = 3;

			// Draw subtle background behind label
			c.fillStyle = colors.labelBg;
			c.fillRect(
				x - textWidth / 2 - padding,
				layout.labelTopOffset - 6,
				textWidth + padding * 2,
				12
			);

			// Draw label
			c.fillStyle = colors.labelText;
			c.fillText(line.label, x, layout.labelTopOffset);
		}
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
