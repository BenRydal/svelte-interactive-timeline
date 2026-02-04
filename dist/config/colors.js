/**
 * Timeline Color Configuration
 *
 * Factory function for creating customizable color schemes.
 */
/** Default color scheme using Tailwind color palette values */
const defaultColors = {
    // Accent colors (red - for playhead)
    accent: '#ef4444', // red-500
    accentLight: '#f87171', // red-400
    accentGlow: 'rgba(239, 68, 68, 0.4)',
    // Base colors
    white: '#ffffff',
    black: '#000000',
    tooltipBg: 'rgba(31, 41, 55, 0.95)', // gray-800
    // Grid and labels
    gridMajor: 'rgba(0, 0, 0, 0.12)',
    gridMinor: 'rgba(0, 0, 0, 0.05)',
    labelText: 'rgba(0, 0, 0, 0.5)',
    labelBg: 'rgba(255, 255, 255, 0.85)',
    // Interaction
    hoverLine: 'rgba(0, 0, 0, 0.2)',
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.15)',
    shadowDark: 'rgba(0, 0, 0, 0.3)',
    // Zoom selection (blue)
    zoomFill: 'rgba(59, 130, 246, 0.15)',
    zoomStroke: 'rgba(59, 130, 246, 0.6)',
    // Background
    dimmed: 'rgba(0, 0, 0, 0.04)'
};
/**
 * Create a color scheme with optional overrides
 */
export function createColorScheme(overrides) {
    return { ...defaultColors, ...overrides };
}
/** Default exported color scheme */
export const defaultColorScheme = defaultColors;
