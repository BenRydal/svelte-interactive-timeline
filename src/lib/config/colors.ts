/**
 * Timeline Color Configuration
 *
 * Factory function for creating customizable color schemes.
 */

export interface TimelineColorScheme {
	// Accent colors (for playhead)
	accent: string;
	accentLight: string;
	accentGlow: string;

	// Base colors
	white: string;
	black: string;
	tooltipBg: string;

	// Grid and labels
	gridMajor: string;
	gridMinor: string;
	labelText: string;
	labelBg: string;

	// Interaction
	hoverLine: string;

	// Shadows
	shadow: string;
	shadowDark: string;

	// Zoom selection
	zoomFill: string;
	zoomStroke: string;

	// Background
	dimmed: string;
}

/** Default color scheme using Tailwind color palette values */
const defaultColors: TimelineColorScheme = {
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
export function createColorScheme(overrides?: Partial<TimelineColorScheme>): TimelineColorScheme {
	return { ...defaultColors, ...overrides };
}

/** Default exported color scheme */
export const defaultColorScheme = defaultColors;
