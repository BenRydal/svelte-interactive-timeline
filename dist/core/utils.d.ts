/**
 * Timeline Utilities
 *
 * Helper functions for time/pixel conversions, formatting, and math.
 */
/**
 * Clamp a value between min and max
 */
export declare function clamp(value: number, min: number, max: number): number;
/**
 * Linear interpolation / mapping from one range to another
 */
export declare function mapRange(value: number, inStart: number, inEnd: number, outStart: number, outEnd: number): number;
/**
 * Format time in seconds to display string
 */
export declare function formatTime(seconds: number, format?: 'hms' | 'ms' | 'seconds'): string;
/**
 * Calculate nice grid interval for time axis
 * Returns interval in seconds that produces readable labels
 */
export declare function calculateGridInterval(visibleDuration: number, maxLabels?: number): number;
/**
 * Generate grid lines for visible time range
 */
export declare function generateGridLines(viewStart: number, viewEnd: number, maxLabels?: number): {
    time: number;
    label: string;
    isMajor: boolean;
}[];
/**
 * Calculate zoom parameters centered on a specific time
 */
export declare function zoomAtPoint(currentViewStart: number, currentViewEnd: number, zoomFactor: number, centerTime: number, dataStart: number, dataEnd: number, minDuration: number): {
    viewStart: number;
    viewEnd: number;
};
/**
 * Calculate pan offset
 */
export declare function panView(currentViewStart: number, currentViewEnd: number, deltaTime: number, dataStart: number, dataEnd: number): {
    viewStart: number;
    viewEnd: number;
};
/**
 * Get device pixel ratio for crisp canvas rendering
 */
export declare function getDevicePixelRatio(): number;
/**
 * Reset canvas shadow properties
 */
export declare function resetShadow(ctx: CanvasRenderingContext2D): void;
