/**
 * Background Layer
 *
 * Renders grid lines and time labels on the timeline.
 */
import type { RenderContext, RenderLayer } from '../../core/types';
import type { TimelineColorScheme } from '../../config/colors';
import type { TimelineLayoutConfig } from '../../config/layout';
export declare class BackgroundLayer implements RenderLayer {
    name: string;
    visible: boolean;
    private colors;
    private layout;
    constructor(colors?: TimelineColorScheme, layout?: TimelineLayoutConfig);
    render(ctx: RenderContext): void;
    /**
     * Update colors at runtime
     */
    setColors(colors: TimelineColorScheme): void;
    /**
     * Update layout at runtime
     */
    setLayout(layout: TimelineLayoutConfig): void;
}
