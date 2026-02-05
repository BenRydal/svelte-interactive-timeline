/**
 * Zoom Selection Layer
 *
 * Renders a selection rectangle during drag-to-zoom operation.
 */
import type { RenderLayer, RenderContext } from '../../core/types';
import type { TimelineColorScheme } from '../../config/colors';
export declare class ZoomSelectionLayer implements RenderLayer {
    name: string;
    visible: boolean;
    private colors;
    constructor(colors?: TimelineColorScheme);
    render(ctx: RenderContext): void;
    /**
     * Update colors at runtime
     */
    setColors(colors: TimelineColorScheme): void;
}
