/**
 * Zoom Selection Layer
 *
 * Renders a selection rectangle during drag-to-zoom operation.
 */

import type { RenderLayer, RenderContext } from '../../core/types';
import type { TimelineColorScheme } from '../../config/colors';
import { defaultColorScheme } from '../../config/colors';

export class ZoomSelectionLayer implements RenderLayer {
	name = 'zoom-selection';
	visible = true;

	private colors: TimelineColorScheme;

	constructor(colors?: TimelineColorScheme) {
		this.colors = colors ?? defaultColorScheme;
	}

	render(ctx: RenderContext): void {
		const { state, timeToX, height } = ctx;
		const { colors } = this;

		if (state.zoomSelectionStart === null || state.zoomSelectionEnd === null) {
			return;
		}

		const x1 = timeToX(state.zoomSelectionStart);
		const x2 = timeToX(state.zoomSelectionEnd);
		const left = Math.min(x1, x2);
		const width = Math.abs(x2 - x1);

		// Draw selection rectangle
		ctx.ctx.fillStyle = colors.zoomFill;
		ctx.ctx.fillRect(left, 0, width, height);

		// Draw selection borders
		ctx.ctx.strokeStyle = colors.zoomStroke;
		ctx.ctx.lineWidth = 2;
		ctx.ctx.setLineDash([4, 4]);
		ctx.ctx.strokeRect(left, 0, width, height);
		ctx.ctx.setLineDash([]);
	}

	/**
	 * Update colors at runtime
	 */
	setColors(colors: TimelineColorScheme): void {
		this.colors = colors;
	}
}
