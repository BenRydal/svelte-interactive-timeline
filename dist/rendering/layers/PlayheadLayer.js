/**
 * Playhead Layer
 *
 * Renders the current time playhead indicator.
 */
import { resetShadow } from '../../core/utils';
import { defaultColorScheme } from '../../config/colors';
import { defaultLayoutConfig } from '../../config/layout';
export class PlayheadLayer {
    name = 'playhead';
    visible = true;
    colors;
    layout;
    constructor(colors, layout) {
        this.colors = colors ?? defaultColorScheme;
        this.layout = layout ?? defaultLayoutConfig;
    }
    render(ctx) {
        const { ctx: c, height, state, timeToX } = ctx;
        const { colors, layout } = this;
        const x = timeToX(state.currentTime);
        const isActive = state.isDragging === 'playhead';
        // Don't render if outside visible area
        const halfWidth = layout.playheadHeadWidth / 2;
        if (x < -halfWidth || x > ctx.width + halfWidth)
            return;
        // Glow effect
        c.strokeStyle = colors.accentGlow;
        c.lineWidth = layout.playheadGlowWidth;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(x, layout.playheadHeadHeight);
        c.lineTo(x, height);
        c.stroke();
        // Main line
        c.strokeStyle = colors.accent;
        c.lineWidth = layout.playheadLineWidth;
        c.beginPath();
        c.moveTo(x, layout.playheadHeadHeight);
        c.lineTo(x, height);
        c.stroke();
        // Playhead head (triangle pointing down) at top
        this.drawPlayheadHead(c, x, 0, isActive);
    }
    drawPlayheadHead(c, x, y, isActive) {
        const { colors, layout } = this;
        const halfWidth = layout.playheadHeadWidth / 2;
        // Shadow
        c.shadowColor = colors.shadowDark;
        c.shadowBlur = 4;
        c.shadowOffsetY = 2;
        // Head shape (rounded top, pointed bottom)
        c.fillStyle = isActive ? colors.accentLight : colors.accent;
        c.beginPath();
        c.moveTo(x - halfWidth, y);
        c.lineTo(x + halfWidth, y);
        c.lineTo(x + halfWidth, y + layout.playheadHeadHeight - 6);
        c.lineTo(x, y + layout.playheadHeadHeight);
        c.lineTo(x - halfWidth, y + layout.playheadHeadHeight - 6);
        c.closePath();
        c.fill();
        // Reset shadow
        resetShadow(c);
        // Border
        c.strokeStyle = colors.white;
        c.lineWidth = 1.5;
        c.stroke();
        // Inner circle indicator
        c.fillStyle = colors.white;
        c.beginPath();
        c.arc(x, y + 5, 2, 0, Math.PI * 2);
        c.fill();
    }
    /**
     * Update colors at runtime
     */
    setColors(colors) {
        this.colors = colors;
    }
    /**
     * Update layout at runtime
     */
    setLayout(layout) {
        this.layout = layout;
    }
}
