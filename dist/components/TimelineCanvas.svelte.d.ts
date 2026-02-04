import type { TimelineStore } from '../core/store.svelte';
import type { RenderLayer } from '../core/types';
import type { TimelineColorScheme } from '../config/colors';
import type { TimelineLayoutConfig } from '../config/layout';
interface Props {
    /** Timeline store instance */
    store: TimelineStore;
    /** Custom color scheme */
    colors?: TimelineColorScheme;
    /** Custom layout configuration */
    layout?: TimelineLayoutConfig;
    /** Custom render layers (replaces defaults if provided) */
    layers?: RenderLayer[];
    /** Called when current time changes (e.g., during playhead drag) */
    onTimeChange?: (time: number) => void;
    /** Called when view changes (zoom/pan) */
    onViewChange?: (viewStart: number, viewEnd: number) => void;
    /** Called when playhead drag starts */
    onPlayheadDragStart?: () => void;
    /** Called when playhead drag ends */
    onPlayheadDragEnd?: () => void;
}
declare const TimelineCanvas: import("svelte").Component<Props, {}, "">;
type TimelineCanvas = ReturnType<typeof TimelineCanvas>;
export default TimelineCanvas;
