import type { TimelineStore } from '../core/store.svelte';
import type { TimelineColorScheme } from '../config/colors';
import type { TimelineLayoutConfig } from '../config/layout';
import type { RenderLayer } from '../core/types';
interface Props {
    /** Timeline store instance */
    store: TimelineStore;
    /** Initial end time (optional - can also use store.initialize()) */
    endTime?: number;
    /** Initial start time */
    startTime?: number;
    /** Height of the canvas area in pixels */
    height?: number;
    /** Whether to show controls */
    showControls?: boolean;
    /** Show zoom controls in the controls bar */
    showZoomControls?: boolean;
    /** Show time display in the controls bar */
    showTimeDisplay?: boolean;
    /** Time format for display */
    timeFormat?: 'hms' | 'ms' | 'seconds';
    /** Embedded mode - removes border/shadow for use inside other containers */
    embedded?: boolean;
    /** Custom color scheme */
    colors?: TimelineColorScheme;
    /** Custom layout configuration */
    layout?: TimelineLayoutConfig;
    /** Custom render layers */
    layers?: RenderLayer[];
    /** Called when current time changes */
    onTimeChange?: (time: number) => void;
    /** Called when view changes (zoom/pan) */
    onViewChange?: (viewStart: number, viewEnd: number) => void;
    /** Called when playhead drag starts */
    onPlayheadDragStart?: () => void;
    /** Called when playhead drag ends */
    onPlayheadDragEnd?: () => void;
}
declare const Timeline: import("svelte").Component<Props, {}, "">;
type Timeline = ReturnType<typeof Timeline>;
export default Timeline;
