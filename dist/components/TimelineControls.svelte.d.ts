import type { TimelineStore } from '../core/store.svelte';
interface Props {
    /** Timeline store instance */
    store: TimelineStore;
    /** Show zoom controls */
    showZoomControls?: boolean;
    /** Show time display */
    showTimeDisplay?: boolean;
    /** Time format for display */
    timeFormat?: 'hms' | 'ms' | 'seconds';
    /** Additional CSS classes */
    class?: string;
    /** Called after zoom operation */
    onZoom?: () => void;
}
declare const TimelineControls: import("svelte").Component<Props, {}, "">;
type TimelineControls = ReturnType<typeof TimelineControls>;
export default TimelineControls;
