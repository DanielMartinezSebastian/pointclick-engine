(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/apps/web-demo/app/components/Joystick.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Joystick
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/platform-web.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$mobileInputStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/store/mobileInputStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function Joystick() {
    _s();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const managerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // window está garantizado: este componente solo se monta en cliente
    // gracias al dynamic import con ssr:false en GameTouchCanvas.
    // Solo `pointer: coarse` identifica dispositivos táctiles reales;
    // `maxTouchPoints > 0` puede ser true en Windows/Chrome con ratón.
    const [isTouchDevice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Joystick.useState": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["browserEnvironmentAdapter"].matchMedia("(pointer: coarse)").matches
    }["Joystick.useState"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Joystick.useEffect": ()=>{
            if (!isTouchDevice) return;
            const el = containerRef.current;
            if (!el) return;
            let cancelled = false;
            // Importación dinámica: nipplejs accede a `window` en module load,
            // por lo que no se puede importar estáticamente en un entorno SSR.
            void __turbopack_context__.A("[project]/node_modules/nipplejs/dist/index.mjs [app-client] (ecmascript, async loader)").then({
                "Joystick.useEffect": ({ create })=>{
                    if (cancelled || !containerRef.current) return;
                    const manager = create({
                        zone: containerRef.current,
                        mode: "static",
                        position: {
                            right: "20%",
                            bottom: "20%"
                        },
                        color: "#84e6ff",
                        size: 72,
                        restJoystick: true,
                        threshold: 0.08
                    });
                    managerRef.current = manager;
                    const baseElement = containerRef.current.querySelector(".nipple .back");
                    const nippleElement = containerRef.current.querySelector(".nipple .front");
                    const nippleRoot = containerRef.current.querySelector(".nipple");
                    if (baseElement instanceof HTMLElement) {
                        baseElement.style.background = "radial-gradient(circle at 35% 35%, rgb(132 230 255 / 24%) 0%, rgb(10 29 45 / 10%) 45%, rgb(4 11 18 / 0%) 72%)";
                        baseElement.style.border = "3px solid rgb(140 227 255 / 34%)";
                        baseElement.style.boxShadow = "inset 0 0 0 2px rgb(255 255 255 / 8%), 0 0 0 4px rgb(4 11 18 / 55%)";
                    }
                    if (nippleElement instanceof HTMLElement) {
                        nippleElement.style.background = "linear-gradient(180deg, rgb(255 255 255 / 88%) 0%, rgb(132 230 255 / 78%) 45%, rgb(42 132 175 / 100%) 100%)";
                        nippleElement.style.border = "3px solid rgb(255 255 255 / 24%)";
                        nippleElement.style.boxShadow = "0 0 0 3px rgb(10 29 45 / 60%), 0 6px 18px rgb(0 0 0 / 28%)";
                    }
                    if (nippleRoot instanceof HTMLElement) {
                        nippleRoot.style.filter = "drop-shadow(0 0 8px rgb(132 230 255 / 18%))";
                    }
                    // trigger() llama al handler con { type, target, data: JoystickEventData }
                    // JoystickEventData.vector: { x, y } normalizados en [-1, 1]
                    manager.on("move", {
                        "Joystick.useEffect": (evt)=>{
                            const vector = evt?.data?.vector;
                            if (!vector) return;
                            // nipplejs y positivo = pantalla arriba = norte en el juego = z negativo
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$mobileInputStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMobileInputStore"].getState().setAxes(vector.x, -vector.y);
                        }
                    }["Joystick.useEffect"]);
                    manager.on("end", {
                        "Joystick.useEffect": ()=>{
                            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$mobileInputStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMobileInputStore"].getState().deactivate();
                        }
                    }["Joystick.useEffect"]);
                }
            }["Joystick.useEffect"]);
            return ({
                "Joystick.useEffect": ()=>{
                    cancelled = true;
                    if (managerRef.current) {
                        managerRef.current.destroy();
                        managerRef.current = null;
                    }
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$mobileInputStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMobileInputStore"].getState().deactivate();
                }
            })["Joystick.useEffect"];
        }
    }["Joystick.useEffect"], [
        isTouchDevice
    ]);
    // Nada que renderizar si no es un dispositivo táctil
    if (!isTouchDevice) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        style: {
            position: "fixed",
            bottom: "42px",
            right: "34px",
            width: "144px",
            height: "144px",
            zIndex: 100,
            // Evita que el navegador intercepte los toques del joystick
            touchAction: "none"
        }
    }, void 0, false, {
        fileName: "[project]/apps/web-demo/app/components/Joystick.tsx",
        lineNumber: 114,
        columnNumber: 5
    }, this);
}
_s(Joystick, "fvQffwNCccjCMX9RmAnDkcOmmis=");
_c = Joystick;
var _c;
__turbopack_context__.k.register(_c, "Joystick");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web-demo/app/components/Joystick.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/apps/web-demo/app/components/Joystick.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=apps_web-demo_app_components_Joystick_tsx_0-mw-h5._.js.map