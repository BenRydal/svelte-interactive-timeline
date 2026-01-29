/**
 * Zoom Selection Layer
 *
 * Renders a selection rectangle during drag-to-zoom operation.
 */

import type { RenderLayer, RenderContext } from '../../types';

export class ZoomSelectionLayer implements RenderLayer {
	name = 'zoom-selection';
	visible = true;

	render(ctx: RenderContext): void {
		const { ctx: c, state, timeToX, height } = ctx;

		if (state.zoomSelectionStart === null || state.zoomSelectionEnd === null) {
			return;
		}

		const x1 = timeToX(state.zoomSelectionStart);
		const x2 = timeToX(state.zoomSelectionEnd);
		const left = Math.min(x1, x2);
		const width = Math.abs(x2 - x1);

		c.fillStyle = 'rgba(59, 130, 246, 0.15)';
		c.fillRect(left, 0, width, height);

		c.strokeStyle = 'rgba(59, 130, 246, 0.6)';
		c.lineWidth = 2;
		c.setLineDash([4, 4]);
		c.strokeRect(left, 0, width, height);
		c.setLineDash([]);
	}
}
