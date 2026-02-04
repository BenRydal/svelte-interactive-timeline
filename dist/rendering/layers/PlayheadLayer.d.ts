/**
 * Playhead Layer
 *
 * Renders the current time playhead indicator.
 */
import type { RenderContext, RenderLayer } from '../../core/types';
import type { TimelineColorScheme } from '../../config/colors';
import type { TimelineLayoutConfig } from '../../config/layout';
export declare class PlayheadLayer implements RenderLayer {
    name: string;
    visible: boolean;
    private colors;
    private layout;
    constructor(colors?: TimelineColorScheme, layout?: TimelineLayoutConfig);
    render(ctx: RenderContext): void;
    private drawPlayheadHead;
    /**
     * Update colors at runtime
     */
    setColors(colors: TimelineColorScheme): void;
    /**
     * Update layout at runtime
     */
    setLayout(layout: TimelineLayoutConfig): void;
}
