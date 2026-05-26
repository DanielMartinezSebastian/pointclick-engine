/**
 * Viewport abstraction. Renderer-agnostic contract.
 *
 * Provides dimensions and world-to-screen coordinate mapping so that
 * non-renderer code (UI overlays, positioning logic) can work independently
 * of the rendering technology used.
 *
 * Note: Full R3F implementation deferred to Phase 4. This is the interface
 * definition only (as per ADR-0005).
 */
export interface ViewportPort {
    /** Returns the current viewport width in CSS pixels. */
    getWidth(): number;
    /** Returns the current viewport height in CSS pixels. */
    getHeight(): number;
    /**
     * Maps a world-space coordinate to screen space (CSS pixels).
     * Returns null if the position is outside the view frustum.
     */
    worldToScreen(worldX: number, worldY: number, worldZ: number): {
        x: number;
        y: number;
    } | null;
}
//# sourceMappingURL=viewport.d.ts.map