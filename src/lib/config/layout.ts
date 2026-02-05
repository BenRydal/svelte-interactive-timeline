/**
 * Timeline Layout Configuration
 *
 * Factory function for creating customizable layout settings.
 */

export interface TimelineLayoutConfig {
	/** Monospace font stack for time labels and tooltips */
	monoFont: string;

	/** Height of the playhead triangle head */
	playheadHeadHeight: number;

	/** Width of the playhead head */
	playheadHeadWidth: number;

	/** Width of the playhead line */
	playheadLineWidth: number;

	/** Width of the playhead glow effect */
	playheadGlowWidth: number;

	/** Font size for time labels */
	labelFontSize: number;

	/** Vertical position for time labels from top */
	labelTopOffset: number;

	/** Vertical position for hover tooltip from top */
	tooltipTopOffset: number;

	/** Height of the tooltip */
	tooltipHeight: number;

	/** Padding inside tooltip */
	tooltipPadding: number;

	/** Font size for tooltip text */
	tooltipFontSize: number;

	/** Hit testing tolerance for playhead (in pixels) */
	playheadHitTolerance: number;

	/** Maximum number of grid labels to show */
	gridMaxLabels: number;

	/** Pixels between grid lines (used to calculate label count) */
	gridLabelSpacing: number;

	/** Drag threshold to distinguish click from drag (in pixels) */
	dragThreshold: number;
}

/** Default layout configuration */
const defaultLayout: TimelineLayoutConfig = {
	monoFont: 'ui-monospace, SFMono-Regular, monospace',
	playheadHeadHeight: 14,
	playheadHeadWidth: 12,
	playheadLineWidth: 2,
	playheadGlowWidth: 6,
	labelFontSize: 9,
	labelTopOffset: 10,
	tooltipTopOffset: 22,
	tooltipHeight: 22,
	tooltipPadding: 10,
	tooltipFontSize: 11,
	playheadHitTolerance: 10,
	gridMaxLabels: 10,
	gridLabelSpacing: 80,
	dragThreshold: 5
};

/**
 * Create a layout configuration with optional overrides
 */
export function createLayoutConfig(overrides?: Partial<TimelineLayoutConfig>): TimelineLayoutConfig {
	return { ...defaultLayout, ...overrides };
}

/** Default exported layout configuration */
export const defaultLayoutConfig = defaultLayout;
