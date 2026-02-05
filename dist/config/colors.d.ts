/**
 * Timeline Color Configuration
 *
 * Factory function for creating customizable color schemes.
 */
export interface TimelineColorScheme {
    accent: string;
    accentLight: string;
    accentGlow: string;
    white: string;
    black: string;
    tooltipBg: string;
    gridMajor: string;
    gridMinor: string;
    labelText: string;
    labelBg: string;
    hoverLine: string;
    shadow: string;
    shadowDark: string;
    zoomFill: string;
    zoomStroke: string;
    dimmed: string;
}
/**
 * Create a color scheme with optional overrides
 */
export declare function createColorScheme(overrides?: Partial<TimelineColorScheme>): TimelineColorScheme;
/** Default exported color scheme */
export declare const defaultColorScheme: TimelineColorScheme;
