"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo } from "react";
export function SceneWallPointPreview({ preview, groundY, }) {
    const pointPreviewLength = useMemo(() => {
        if (!preview)
            return 0;
        return Math.sqrt((preview.end.x - preview.start.x) ** 2 + (preview.end.y - preview.start.y) ** 2);
    }, [preview]);
    const pointPreviewMidX = preview ? (preview.start.x + preview.end.x) / 2 : 0;
    const pointPreviewMidZ = preview ? (preview.start.y + preview.end.y) / 2 : 0;
    const pointPreviewRotationY = preview
        ? -Math.atan2(preview.end.y - preview.start.y, preview.end.x - preview.start.x)
        : 0;
    if (!preview)
        return null;
    return (_jsxs(_Fragment, { children: [_jsxs("mesh", { position: [preview.start.x, groundY + 0.12, preview.start.y], children: [_jsx("boxGeometry", { args: [0.22, 0.22, 0.22] }), _jsx("meshBasicMaterial", { color: "#00ff41" })] }), _jsxs("mesh", { position: [preview.end.x, groundY + 0.12, preview.end.y], children: [_jsx("boxGeometry", { args: [0.2, 0.2, 0.2] }), _jsx("meshBasicMaterial", { color: "#00d8ff" })] }), pointPreviewLength >= 0.01 && (_jsxs("mesh", { position: [pointPreviewMidX, groundY + 0.1, pointPreviewMidZ], rotation: [0, pointPreviewRotationY, 0], children: [_jsx("boxGeometry", { args: [pointPreviewLength, 0.08, 0.08] }), _jsx("meshBasicMaterial", { color: "#00d8ff", transparent: true, opacity: 0.85 })] }))] }));
}
//# sourceMappingURL=SceneWallPointPreview.js.map