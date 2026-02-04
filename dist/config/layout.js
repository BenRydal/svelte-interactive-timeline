/**
 * Timeline Layout Configuration
 *
 * Factory function for creating customizable layout settings.
 */
/** Default layout configuration */
const defaultLayout = {
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
export function createLayoutConfig(overrides) {
    return { ...defaultLayout, ...overrides };
}
/** Default exported layout configuration */
export const defaultLayoutConfig = defaultLayout;
