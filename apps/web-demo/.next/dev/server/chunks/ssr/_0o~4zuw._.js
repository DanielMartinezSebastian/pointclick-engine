module.exports = [
"[project]/packages/engine-core/dist/game/logic/rules/index.js [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
;
}),
"[project]/packages/engine-core/dist/game/logic/index.js [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$logic$2f$rules$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/game/logic/rules/index.js [app-ssr] (ecmascript) <locals>");
;
;
}),
"[project]/packages/engine-core/dist/game/state/sceneStore.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSceneState",
    ()=>getSceneState,
    "subscribeSceneState",
    ()=>subscribeSceneState,
    "useSceneStore",
    ()=>useSceneStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
;
const SHOULD_LOG_STATE_TRANSITIONS = ("TURBOPACK compile-time value", "development") !== "production";
function logSceneStore(event, payload) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    console.info(`[scene-store] ${event}`, payload);
}
function cloneWall(wall) {
    return {
        position: [
            ...wall.position
        ],
        rotationY: wall.rotationY,
        halfSize: [
            ...wall.halfSize
        ]
    };
}
function cloneInteraction(interaction) {
    return {
        ...interaction,
        position: [
            ...interaction.position
        ],
        halfSize: [
            ...interaction.halfSize
        ],
        acceptsItemIds: interaction.acceptsItemIds ? [
            ...interaction.acceptsItemIds
        ] : undefined,
        dialogKeys: {
            ...interaction.dialogKeys
        }
    };
}
function cloneScene(scene) {
    return {
        ...scene,
        playerSpawn: [
            ...scene.playerSpawn
        ],
        ground: {
            ...scene.ground
        },
        walls: scene.walls.map(cloneWall),
        interactions: scene.interactions.map(cloneInteraction)
    };
}
const useSceneStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        sceneId: "",
        scene: {
            id: "",
            label: "",
            background: "",
            playerSpawn: [
                0,
                0,
                0
            ],
            ground: {
                minX: 0,
                maxX: 0,
                minZ: 0,
                maxZ: 0,
                y: 0
            },
            walls: [],
            interactions: []
        },
        playerPosition: [
            0,
            0,
            0
        ],
        respawnSignal: 0,
        setScene: (id, scene)=>{
            const clonedScene = cloneScene(scene);
            logSceneStore("set-scene", {
                fromSceneId: get().sceneId,
                toSceneId: id,
                spawn: clonedScene.playerSpawn
            });
            set({
                sceneId: id,
                scene: clonedScene,
                playerPosition: [
                    ...clonedScene.playerSpawn
                ]
            });
        },
        updateGround: (updater)=>set((state)=>({
                    scene: {
                        ...state.scene,
                        ground: updater({
                            ...state.scene.ground
                        })
                    }
                })),
        appendWall: (wall)=>set((state)=>({
                    scene: {
                        ...state.scene,
                        walls: [
                            ...state.scene.walls,
                            cloneWall(wall)
                        ]
                    }
                })),
        removeWall: (index)=>set((state)=>({
                    scene: {
                        ...state.scene,
                        walls: state.scene.walls.filter((_, i)=>i !== index)
                    }
                })),
        updateWall: (index, updater)=>set((state)=>({
                    scene: {
                        ...state.scene,
                        walls: state.scene.walls.map((wall, i)=>i !== index ? wall : updater(cloneWall(wall)))
                    }
                })),
        updateInteraction: (id, updater)=>set((state)=>({
                    scene: {
                        ...state.scene,
                        interactions: state.scene.interactions.map((interaction)=>{
                            if (interaction.id !== id) return interaction;
                            return updater(cloneInteraction(interaction));
                        })
                    }
                })),
        resetInteractionsFromSceneConfig: ()=>set((state)=>{
                logSceneStore("reset-interactions", {
                    sceneId: state.sceneId,
                    interactionCount: state.scene.interactions.length
                });
                return {
                    scene: {
                        ...state.scene,
                        interactions: state.scene.interactions.map(cloneInteraction)
                    }
                };
            }),
        setPlayerPosition: (position)=>set({
                playerPosition: position
            }),
        requestRespawn: ()=>set((state)=>{
                const nextRespawnSignal = state.respawnSignal + 1;
                logSceneStore("request-respawn", {
                    sceneId: state.sceneId,
                    previousRespawnSignal: state.respawnSignal,
                    nextRespawnSignal,
                    currentPlayerPosition: state.playerPosition
                });
                return {
                    respawnSignal: nextRespawnSignal
                };
            })
    }));
function getSceneState() {
    return useSceneStore.getState();
}
function subscribeSceneState(listener) {
    return useSceneStore.subscribe(listener);
}
}),
"[project]/packages/engine-core/dist/game/state/index.js [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/game/state/sceneStore.js [app-ssr] (ecmascript)");
;
}),
"[project]/packages/engine-core/dist/index.js [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VERSION",
    ()=>VERSION
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$logic$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/game/logic/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/game/state/index.js [app-ssr] (ecmascript) <locals>");
;
;
;
;
const VERSION = "0.1.0";
}),
"[project]/apps/web-demo/app/components/PixelLoader.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PixelLoader",
    ()=>PixelLoader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function PixelLoader({ ready }) {
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    // "filling" arranca con un delay mínimo para que la transición CSS se active
    const [filling, setFilling] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const t = setTimeout(()=>setFilling(true), 60);
        return ()=>clearTimeout(t);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!ready) return;
        const t = setTimeout(()=>setVisible(false), 750);
        return ()=>clearTimeout(t);
    }, [
        ready
    ]);
    if (!visible) return null;
    const barWidth = ready ? "100%" : filling ? "78%" : "0%";
    const barTransition = ready ? "width 0.18s steps(5, end)" : filling ? "width 3s steps(22, end)" : "none";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "aria-label": "Cargando…",
        style: {
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#070d1f",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2rem",
            opacity: ready ? 0 : 1,
            transition: "opacity 0.65s ease",
            pointerEvents: ready ? "none" : "all",
            fontFamily: "var(--font-pixel), 'Courier New', monospace",
            imageRendering: "pixelated"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    textAlign: "center",
                    lineHeight: 1.3,
                    userSelect: "none"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            margin: 0,
                            fontSize: "clamp(1.8rem, 6vw, 2.8rem)",
                            color: "#84e6ff",
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            textShadow: "0 0 24px rgba(132,230,255,0.55), 0 0 48px rgba(132,230,255,0.2)"
                        },
                        children: "POINT & CLICK"
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/PixelLoader.tsx",
                        lineNumber: 65,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            margin: "4px 0 0",
                            fontSize: "0.72rem",
                            color: "rgba(132,230,255,0.45)",
                            letterSpacing: "0.42em",
                            textTransform: "uppercase"
                        },
                        children: "ENGINE DEMO"
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/PixelLoader.tsx",
                        lineNumber: 75,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/components/PixelLoader.tsx",
                lineNumber: 64,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                    width: "clamp(200px, 48vw, 320px)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: "100%",
                            height: "20px",
                            background: "rgb(8 18 36)",
                            border: "3px solid rgba(132,230,255,0.72)",
                            boxShadow: [
                                "inset 0 2px 0 rgba(0,0,0,0.55)",
                                "inset 0 -1px 0 rgba(255,255,255,0.06)",
                                "0 4px 0 rgba(0,0,0,0.55)",
                                "0 0 14px rgba(132,230,255,0.12)"
                            ].join(","),
                            padding: "3px",
                            boxSizing: "border-box"
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                height: "100%",
                                width: barWidth,
                                background: [
                                    "linear-gradient(90deg,",
                                    "  rgb(16 56 90) 0%,",
                                    "  rgb(32 108 160) 40%,",
                                    "  rgb(84 190 235) 75%,",
                                    "  rgb(132 230 255) 100%",
                                    ")"
                                ].join(""),
                                transition: barTransition,
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.3)"
                            }
                        }, void 0, false, {
                            fileName: "[project]/apps/web-demo/app/components/PixelLoader.tsx",
                            lineNumber: 111,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/PixelLoader.tsx",
                        lineNumber: 96,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            margin: 0,
                            fontSize: "0.82rem",
                            color: "rgba(132,230,255,0.65)",
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            userSelect: "none"
                        },
                        children: ready ? "LISTO" : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                "CARGANDO",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "px-dot1",
                                    children: "."
                                }, void 0, false, {
                                    fileName: "[project]/apps/web-demo/app/components/PixelLoader.tsx",
                                    lineNumber: 139,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "px-dot2",
                                    children: "."
                                }, void 0, false, {
                                    fileName: "[project]/apps/web-demo/app/components/PixelLoader.tsx",
                                    lineNumber: 140,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "px-dot3",
                                    children: "."
                                }, void 0, false, {
                                    fileName: "[project]/apps/web-demo/app/components/PixelLoader.tsx",
                                    lineNumber: 141,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/PixelLoader.tsx",
                        lineNumber: 128,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/components/PixelLoader.tsx",
                lineNumber: 87,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "absolute",
                    inset: 0,
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
                    pointerEvents: "none"
                }
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/PixelLoader.tsx",
                lineNumber: 148,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-glow",
                style: {
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(132,230,255,0.04) 0%, transparent 70%)",
                    pointerEvents: "none"
                }
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/PixelLoader.tsx",
                lineNumber: 156,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web-demo/app/components/PixelLoader.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web-demo/app/lib/platform-web.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * platform-web – Capa de interoperabilidad web.
 *
 * Define puertos (interfaces) para las capacidades de plataforma web:
 * storage, routing, clipboard, network, timers y entorno del navegador.
 *
 * El runtime consume estos puertos en lugar de llamar directamente a APIs
 * web (localStorage, navigator.clipboard, fetch, etc.), lo que permite:
 * - Fallback seguro en SSR/entornos sin window.
 * - Sustituir adapters en tests sin mockear globals.
 * - Ampliar hacia otras plataformas sin cambiar código del motor.
 *
 * Uso:
 * ```ts
 * import { localStorageAdapter, browserClipboardAdapter } from "@/lib/platform-web";
 * ```
 */ // ---------------------------------------------------------------------------
// StoragePort – persistencia clave/valor
// ---------------------------------------------------------------------------
/** Puerto de almacenamiento persistente (clave/valor). */ __turbopack_context__.s([
    "BrowserClipboardAdapter",
    ()=>BrowserClipboardAdapter,
    "BrowserEnvironmentAdapter",
    ()=>BrowserEnvironmentAdapter,
    "BrowserRoutingAdapter",
    ()=>BrowserRoutingAdapter,
    "BrowserTimerAdapter",
    ()=>BrowserTimerAdapter,
    "FetchNetworkAdapter",
    ()=>FetchNetworkAdapter,
    "LocalStorageAdapter",
    ()=>LocalStorageAdapter,
    "NoopStorageAdapter",
    ()=>NoopStorageAdapter,
    "browserClipboardAdapter",
    ()=>browserClipboardAdapter,
    "browserEnvironmentAdapter",
    ()=>browserEnvironmentAdapter,
    "browserRoutingAdapter",
    ()=>browserRoutingAdapter,
    "browserTimerAdapter",
    ()=>browserTimerAdapter,
    "fetchNetworkAdapter",
    ()=>fetchNetworkAdapter,
    "localStorageAdapter",
    ()=>localStorageAdapter,
    "webPlatform",
    ()=>webPlatform
]);
class LocalStorageAdapter {
    get store() {
        if ("TURBOPACK compile-time truthy", 1) return null;
        //TURBOPACK unreachable
        ;
    }
    getItem(key) {
        return this.store?.getItem(key) ?? null;
    }
    setItem(key, value) {
        this.store?.setItem(key, value);
    }
    removeItem(key) {
        this.store?.removeItem(key);
    }
}
const localStorageAdapter = new LocalStorageAdapter();
class NoopStorageAdapter {
    _data = new Map();
    getItem(key) {
        return this._data.get(key) ?? null;
    }
    setItem(key, value) {
        this._data.set(key, value);
    }
    removeItem(key) {
        this._data.delete(key);
    }
}
class BrowserClipboardAdapter {
    async writeText(text) {
        if (typeof navigator === "undefined" || !navigator.clipboard) {
            return;
        }
        await navigator.clipboard.writeText(text);
    }
}
const browserClipboardAdapter = new BrowserClipboardAdapter();
class BrowserRoutingAdapter {
    navigate(path) {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }
    getCurrentPath() {
        if ("TURBOPACK compile-time truthy", 1) return "/";
        //TURBOPACK unreachable
        ;
    }
}
const browserRoutingAdapter = new BrowserRoutingAdapter();
class FetchNetworkAdapter {
    async request(url, options = {}) {
        try {
            const response = await fetch(url, {
                method: options.method ?? "GET",
                headers: options.headers,
                body: options.body
            });
            let data = null;
            try {
                data = await response.json();
            } catch  {
                data = null;
            }
            return {
                ok: response.ok,
                status: response.status,
                data
            };
        } catch  {
            return {
                ok: false,
                status: 0,
                data: null
            };
        }
    }
}
const fetchNetworkAdapter = new FetchNetworkAdapter();
class BrowserTimerAdapter {
    setTimeout(callback, delayMs) {
        return globalThis.setTimeout(callback, delayMs);
    }
    clearTimeout(handle) {
        if (handle == null) return;
        globalThis.clearTimeout(handle);
    }
    setInterval(callback, delayMs) {
        return globalThis.setInterval(callback, delayMs);
    }
    clearInterval(handle) {
        if (handle == null) return;
        globalThis.clearInterval(handle);
    }
}
const browserTimerAdapter = new BrowserTimerAdapter();
class BrowserEnvironmentAdapter {
    matchMedia(query) {
        if ("TURBOPACK compile-time truthy", 1) {
            return {
                matches: false,
                subscribe: ()=>()=>{}
            };
        }
        //TURBOPACK unreachable
        ;
        const mediaQuery = undefined;
    }
    getInnerHeight(fallback = 800) {
        if ("TURBOPACK compile-time truthy", 1) return fallback;
        //TURBOPACK unreachable
        ;
    }
    requestAnimationFrame(callback) {
        if ("TURBOPACK compile-time truthy", 1) {
            return Number(globalThis.setTimeout(callback, 16));
        }
        //TURBOPACK unreachable
        ;
    }
    cancelAnimationFrame(handle) {
        if (handle == null) return;
        if ("TURBOPACK compile-time truthy", 1) {
            globalThis.clearTimeout(handle);
            return;
        }
        //TURBOPACK unreachable
        ;
    }
    addWindowEventListener(eventName, listener, options) {
        if ("TURBOPACK compile-time truthy", 1) return ()=>{};
        //TURBOPACK unreachable
        ;
    }
    addDocumentEventListener(eventName, listener, options) {
        if (typeof document === "undefined") return ()=>{};
        document.addEventListener(eventName, listener, options);
        return ()=>{
            document.removeEventListener(eventName, listener, options);
        };
    }
    mountStyleTag(attributeName, attributeValue, cssText) {
        if (typeof document === "undefined") return ()=>{};
        const styleEl = document.createElement("style");
        styleEl.setAttribute(attributeName, attributeValue);
        styleEl.innerHTML = cssText;
        document.head.appendChild(styleEl);
        return ()=>{
            styleEl.remove();
        };
    }
}
const browserEnvironmentAdapter = new BrowserEnvironmentAdapter();
const webPlatform = {
    storage: localStorageAdapter,
    clipboard: browserClipboardAdapter,
    routing: browserRoutingAdapter,
    network: fetchNetworkAdapter,
    timer: browserTimerAdapter,
    env: browserEnvironmentAdapter
};
}),
"[project]/apps/web-demo/app/components/InventoryUI.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DraggedInventoryGhost",
    ()=>DraggedInventoryGhost,
    "InventoryUI",
    ()=>InventoryUI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/gsap/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/platform-web.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
const BACKPACK_ROTATION_FRAMES = [
    "/assets/backpack/rotations/south.png",
    "/assets/backpack/rotations/south-west.png",
    "/assets/backpack/rotations/west.png",
    "/assets/backpack/rotations/north-west.png",
    "/assets/backpack/rotations/north.png",
    "/assets/backpack/rotations/north-east.png",
    "/assets/backpack/rotations/east.png",
    "/assets/backpack/rotations/south-east.png"
];
const BACKPACK_NORMAL_FRAME_INDEX = 0;
function slotStyle(occupied) {
    return {
        width: "100%",
        aspectRatio: "1 / 1",
        minWidth: 0,
        border: "3px solid rgb(132 230 255 / 78%)",
        borderRadius: "4px",
        background: occupied ? "linear-gradient(180deg, rgb(26 82 112 / 100%) 0%, rgb(10 32 48 / 100%) 100%)" : "linear-gradient(180deg, rgb(8 18 30 / 100%) 0%, rgb(5 11 20 / 100%) 100%)",
        boxShadow: "inset 0 0 0 2px rgb(255 255 255 / 6%), inset 0 -3px 0 rgb(0 0 0 / 24%), 0 3px 0 rgb(0 0 0 / 24%)",
        display: "grid",
        placeItems: "center",
        position: "relative",
        padding: "0",
        cursor: occupied ? "grab" : "default",
        touchAction: "none"
    };
}
function InventoryUI({ isOpen, slots, onToggle, onStartDrag }) {
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isBackpackHovered, setIsBackpackHovered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [backpackFrameIndex, setBackpackFrameIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(BACKPACK_NORMAL_FRAME_INDEX);
    const [isMobileOpenSpinRunning, setIsMobileOpenSpinRunning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isMobileCloseSpinRunning, setIsMobileCloseSpinRunning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isBackpackHoverSpinRunning, setIsBackpackHoverSpinRunning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isPickupSpinRunning, setIsPickupSpinRunning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isPanelRendered, setIsPanelRendered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(isOpen);
    const previousOpenRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(isOpen);
    const previousItemCountRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const backpackSpinIntervalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const backpackSpinStartTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const backpackSpinTokenRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const panelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const panelTweenRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const media = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserEnvironmentAdapter"].matchMedia("(max-width: 768px)");
        const apply = (matches)=>setIsMobile(matches ?? media.matches);
        apply();
        return media.subscribe(apply);
    }, []);
    const handlePointerDown = (event, slotIndex)=>{
        if (event.button !== 0) return;
        event.preventDefault();
        onStartDrag(slotIndex, event.clientX, event.clientY);
    };
    const clearBackpackSpinInterval = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (backpackSpinIntervalRef.current !== null) {
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserTimerAdapter"].clearInterval(backpackSpinIntervalRef.current);
            backpackSpinIntervalRef.current = null;
        }
    }, []);
    const resetBackpackSpinFlags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setIsMobileOpenSpinRunning(false);
        setIsMobileCloseSpinRunning(false);
        setIsBackpackHoverSpinRunning(false);
        setIsPickupSpinRunning(false);
    }, []);
    const animatePanel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((open)=>{
        if (!panelRef.current) return;
        panelTweenRef.current?.kill();
        const transformOrigin = isMobile ? "50% 100%" : "0% 100%";
        panelTweenRef.current = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].fromTo(panelRef.current, {
            opacity: open ? 0 : 1,
            y: open ? 18 : 0,
            scale: open ? 0.92 : 1,
            transformOrigin
        }, {
            opacity: open ? 1 : 0,
            y: open ? 0 : 18,
            scale: open ? 1 : 0.92,
            duration: open ? 0.34 : 0.24,
            ease: open ? "back.out(1.7)" : "back.in(1.7)",
            onComplete: ()=>{
                if (!open) {
                    setIsPanelRendered(false);
                }
            }
        });
    }, [
        isMobile
    ]);
    const startBackpackSpin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((direction, setRunning)=>{
        backpackSpinTokenRef.current += 1;
        const spinToken = backpackSpinTokenRef.current;
        clearBackpackSpinInterval();
        if (backpackSpinStartTimeoutRef.current !== null) {
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserTimerAdapter"].clearTimeout(backpackSpinStartTimeoutRef.current);
            backpackSpinStartTimeoutRef.current = null;
        }
        backpackSpinStartTimeoutRef.current = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserTimerAdapter"].setTimeout(()=>{
            if (backpackSpinTokenRef.current !== spinToken) {
                return;
            }
            resetBackpackSpinFlags();
            setRunning(true);
            let steps = 0;
            const totalSteps = BACKPACK_ROTATION_FRAMES.length;
            const intervalId = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserTimerAdapter"].setInterval(()=>{
                if (backpackSpinTokenRef.current !== spinToken) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserTimerAdapter"].clearInterval(intervalId);
                    return;
                }
                steps += 1;
                setBackpackFrameIndex((current)=>(current + direction + BACKPACK_ROTATION_FRAMES.length) % BACKPACK_ROTATION_FRAMES.length);
                if (steps >= totalSteps) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserTimerAdapter"].clearInterval(intervalId);
                    backpackSpinIntervalRef.current = null;
                    setBackpackFrameIndex(BACKPACK_NORMAL_FRAME_INDEX);
                    setRunning(false);
                }
            }, 75);
            backpackSpinIntervalRef.current = intervalId;
            backpackSpinStartTimeoutRef.current = null;
        }, 0);
        return ()=>{
            if (backpackSpinTokenRef.current !== spinToken) {
                return;
            }
            if (backpackSpinStartTimeoutRef.current !== null) {
                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserTimerAdapter"].clearTimeout(backpackSpinStartTimeoutRef.current);
                backpackSpinStartTimeoutRef.current = null;
            }
            clearBackpackSpinInterval();
            setBackpackFrameIndex(BACKPACK_NORMAL_FRAME_INDEX);
            setRunning(false);
        };
    }, [
        clearBackpackSpinInterval,
        resetBackpackSpinFlags
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isMobile || isOpen || !isBackpackHovered || isMobileOpenSpinRunning || isMobileCloseSpinRunning || isPickupSpinRunning || isBackpackHoverSpinRunning) {
            return;
        }
        return startBackpackSpin(1, setIsBackpackHoverSpinRunning);
    }, [
        isBackpackHoverSpinRunning,
        isBackpackHovered,
        isMobile,
        isMobileCloseSpinRunning,
        isMobileOpenSpinRunning,
        isOpen,
        isPickupSpinRunning,
        startBackpackSpin
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const wasOpen = previousOpenRef.current;
        if (!isMobile || wasOpen === isOpen) {
            return;
        }
        previousOpenRef.current = isOpen;
        if (isOpen) {
            return startBackpackSpin(1, setIsMobileOpenSpinRunning);
        }
        return startBackpackSpin(-1, setIsMobileCloseSpinRunning);
    }, [
        isMobile,
        isOpen,
        startBackpackSpin
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const totalItems = slots.reduce((count, slot)=>count + (slot ? slot.quantity : 0), 0);
        const previousItemCount = previousItemCountRef.current;
        previousItemCountRef.current = totalItems;
        if (previousItemCount === null || totalItems <= previousItemCount) {
            return;
        }
        return startBackpackSpin(1, setIsPickupSpinRunning);
    }, [
        slots,
        startBackpackSpin
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isOpen) {
            if (!isPanelRendered) {
                const animationFrameId = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserEnvironmentAdapter"].requestAnimationFrame(()=>{
                    setIsPanelRendered(true);
                });
                return ()=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserEnvironmentAdapter"].cancelAnimationFrame(animationFrameId);
                };
            }
            animatePanel(true);
            return;
        }
        if (isPanelRendered) {
            animatePanel(false);
        }
    }, [
        animatePanel,
        isOpen,
        isPanelRendered
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>{
            panelTweenRef.current?.kill();
        };
    }, []);
    const backpackSpriteSrc = isMobileOpenSpinRunning || isMobileCloseSpinRunning || isBackpackHoverSpinRunning || isPickupSpinRunning || !isOpen && isBackpackHovered ? BACKPACK_ROTATION_FRAMES[backpackFrameIndex] : BACKPACK_ROTATION_FRAMES[BACKPACK_NORMAL_FRAME_INDEX];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: onToggle,
                onPointerEnter: ()=>setIsBackpackHovered(true),
                onPointerLeave: ()=>setIsBackpackHovered(false),
                "aria-label": isOpen ? "Cerrar inventario" : "Abrir inventario",
                style: {
                    position: "absolute",
                    left: isMobile ? "22px" : "18px",
                    bottom: isMobile ? "30px" : "18px",
                    transform: undefined,
                    width: isMobile ? "84px" : "126px",
                    height: isMobile ? "84px" : "126px",
                    border: "none",
                    borderRadius: "0",
                    background: "transparent",
                    boxShadow: "none",
                    display: "grid",
                    placeItems: "center",
                    zIndex: 40,
                    cursor: "pointer"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    src: backpackSpriteSrc,
                    alt: "Inventario",
                    width: isMobile ? 62 : 93,
                    height: isMobile ? 62 : 93,
                    unoptimized: true,
                    style: {
                        width: isMobile ? "62px" : "93px",
                        height: isMobile ? "62px" : "93px",
                        imageRendering: "pixelated"
                    }
                }, void 0, false, {
                    fileName: "[project]/apps/web-demo/app/components/InventoryUI.tsx",
                    lineNumber: 318,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/InventoryUI.tsx",
                lineNumber: 295,
                columnNumber: 7
            }, this),
            isPanelRendered && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "absolute",
                    left: isMobile ? "50%" : "18px",
                    bottom: isMobile ? "118px" : "118px",
                    transform: isMobile ? "translateX(-50%)" : undefined,
                    zIndex: 41
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: panelRef,
                    style: {
                        position: "relative",
                        border: "4px solid rgb(140 227 255 / 88%)",
                        borderRadius: isMobile ? "8px" : "6px",
                        background: "linear-gradient(180deg, rgb(10 29 45 / 100%) 0%, rgb(4 11 18 / 100%) 100%)",
                        boxShadow: "0 16px 0 rgb(0 0 0 / 26%), 0 18px 36px rgb(0 0 0 / 35%), inset 0 0 0 2px rgb(255 255 255 / 8%), inset 0 -4px 0 rgb(0 0 0 / 18%)",
                        padding: isMobile ? "16px 18px" : "14px",
                        width: isMobile ? "min(calc(100vw - 56px), 420px)" : "236px"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: onToggle,
                            "aria-label": "Cerrar inventario",
                            style: {
                                position: "absolute",
                                top: isMobile ? "-18px" : "-16px",
                                right: isMobile ? "-18px" : "-16px",
                                width: isMobile ? "34px" : "30px",
                                height: isMobile ? "34px" : "30px",
                                border: "3px solid rgb(95 16 20 / 100%)",
                                borderRadius: "999px",
                                background: "linear-gradient(180deg, rgb(255 110 120 / 100%) 0%, rgb(173 31 44 / 100%) 100%)",
                                color: "#fff3f3",
                                boxShadow: "0 3px 0 rgb(0 0 0 / 26%), inset 0 0 0 2px rgb(255 255 255 / 16%)",
                                display: "grid",
                                placeItems: "center",
                                fontSize: isMobile ? "18px" : "16px",
                                lineHeight: 1,
                                fontWeight: 900,
                                textShadow: "0 2px 0 rgb(0 0 0 / 35%)",
                                cursor: "pointer",
                                zIndex: 3,
                                padding: 0
                            },
                            children: "X"
                        }, void 0, false, {
                            fileName: "[project]/apps/web-demo/app/components/InventoryUI.tsx",
                            lineNumber: 354,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            style: {
                                color: "#bff4ff",
                                fontSize: "18px",
                                letterSpacing: "1.5px",
                                display: "block",
                                width: "100%",
                                textAlign: "center",
                                textTransform: "uppercase",
                                textShadow: "0 3px 0 rgb(0 0 0 / 36%)",
                                borderBottom: "2px solid rgb(132 230 255 / 75%)",
                                paddingBottom: "4px"
                            },
                            children: "Inventario"
                        }, void 0, false, {
                            fileName: "[project]/apps/web-demo/app/components/InventoryUI.tsx",
                            lineNumber: 383,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginTop: "10px",
                                display: "grid",
                                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                                gap: isMobile ? "10px" : "9px"
                            },
                            children: slots.map((stack, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onPointerDown: (event)=>handlePointerDown(event, index),
                                    style: slotStyle(Boolean(stack)),
                                    "aria-label": stack ? `Slot ${index + 1}: ${stack.name}` : `Slot ${index + 1} vacio`,
                                    children: stack && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    position: "relative",
                                                    width: isMobile ? "62%" : "44px",
                                                    height: isMobile ? "62%" : "44px",
                                                    pointerEvents: "none"
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    src: stack.spriteUrl,
                                                    alt: stack.name,
                                                    fill: true,
                                                    sizes: isMobile ? "62px" : "44px",
                                                    unoptimized: true,
                                                    style: {
                                                        objectFit: "contain",
                                                        imageRendering: "pixelated",
                                                        pointerEvents: "none"
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web-demo/app/components/InventoryUI.tsx",
                                                    lineNumber: 426,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web-demo/app/components/InventoryUI.tsx",
                                                lineNumber: 418,
                                                columnNumber: 23
                                            }, this),
                                            stack.quantity > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    position: "absolute",
                                                    right: "4px",
                                                    bottom: "3px",
                                                    fontSize: "12px",
                                                    color: "#d9fbff",
                                                    textShadow: "0 2px 0 rgb(0 0 0 / 50%)",
                                                    pointerEvents: "none"
                                                },
                                                children: [
                                                    "x",
                                                    stack.quantity
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web-demo/app/components/InventoryUI.tsx",
                                                lineNumber: 440,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true)
                                }, `slot-${index}`, false, {
                                    fileName: "[project]/apps/web-demo/app/components/InventoryUI.tsx",
                                    lineNumber: 409,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/apps/web-demo/app/components/InventoryUI.tsx",
                            lineNumber: 400,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web-demo/app/components/InventoryUI.tsx",
                    lineNumber: 341,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/InventoryUI.tsx",
                lineNumber: 332,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
function DraggedInventoryGhost({ stack, initialPointerX, initialPointerY }) {
    const [pointer, setPointer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        x: initialPointerX,
        y: initialPointerY
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handlePointerMove = (event)=>{
            const pointerEvent = event;
            setPointer({
                x: pointerEvent.clientX,
                y: pointerEvent.clientY
            });
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserEnvironmentAdapter"].addWindowEventListener("pointermove", handlePointerMove);
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: "fixed",
            left: `${pointer.x}px`,
            top: `${pointer.y}px`,
            transform: "translate(-50%, -50%)",
            width: "92px",
            height: "92px",
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
            zIndex: 90
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            src: stack.spriteUrl,
            alt: stack.name,
            width: 64,
            height: 64,
            unoptimized: true,
            style: {
                width: "64px",
                height: "64px",
                objectFit: "contain",
                imageRendering: "pixelated",
                pointerEvents: "none"
            }
        }, void 0, false, {
            fileName: "[project]/apps/web-demo/app/components/InventoryUI.tsx",
            lineNumber: 504,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web-demo/app/components/InventoryUI.tsx",
        lineNumber: 490,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web-demo/app/components/inventory/SceneDropTargets.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SceneDropTargets",
    ()=>SceneDropTargets
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/rapier/dist/react-three-rapier.esm.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/platform-web.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function SceneDropTarget({ interaction, draggedStack, onDropHit, onDropMiss, onInspect, markDropHandled }) {
    const acceptsDraggedItem = !draggedStack || !interaction.acceptsItemIds || interaction.acceptsItemIds.includes(draggedStack.stack.id);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RigidBody"], {
        type: "fixed",
        colliders: false,
        position: interaction.position,
        rotation: [
            0,
            interaction.rotationY ?? 0,
            0
        ],
        children: [
            interaction.hasCollision && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CuboidCollider"], {
                args: interaction.halfSize
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/inventory/SceneDropTargets.tsx",
                lineNumber: 52,
                columnNumber: 36
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    0,
                    0,
                    0
                ],
                onPointerUp: (event)=>{
                    event.stopPropagation();
                    if (!draggedStack) {
                        // Click sin arrastre: mostrar diálogo de inspección / pista
                        onInspect?.(interaction);
                        return;
                    }
                    markDropHandled();
                    if (!acceptsDraggedItem) {
                        onDropMiss(draggedStack, interaction);
                        return;
                    }
                    onDropHit(interaction, draggedStack);
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                        args: [
                            interaction.halfSize[0] * 2.2,
                            interaction.halfSize[1] * 2.2,
                            interaction.halfSize[2] * 2.2
                        ]
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/inventory/SceneDropTargets.tsx",
                        lineNumber: 73,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                        transparent: true,
                        opacity: 0.01,
                        depthWrite: false
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/inventory/SceneDropTargets.tsx",
                        lineNumber: 74,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/components/inventory/SceneDropTargets.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        position: [
                            0,
                            -interaction.halfSize[1] * 0.15,
                            0
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("cylinderGeometry", {
                                args: [
                                    interaction.halfSize[0] * 0.84,
                                    interaction.halfSize[0] * 0.92,
                                    interaction.halfSize[1] * 0.55,
                                    4
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/components/inventory/SceneDropTargets.tsx",
                                lineNumber: 78,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                                color: "#3a4f75",
                                roughness: 0.9,
                                metalness: 0.1
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/components/inventory/SceneDropTargets.tsx",
                                lineNumber: 79,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/components/inventory/SceneDropTargets.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        position: [
                            0,
                            interaction.halfSize[1] * 0.15,
                            0
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                args: [
                                    interaction.halfSize[0] * 1.1,
                                    interaction.halfSize[1] * 0.42,
                                    interaction.halfSize[2] * 1.1
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/components/inventory/SceneDropTargets.tsx",
                                lineNumber: 82,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                                color: "#7fb7ff",
                                emissive: "#3f74d2",
                                emissiveIntensity: 0.35,
                                roughness: 0.45,
                                metalness: 0.2
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/components/inventory/SceneDropTargets.tsx",
                                lineNumber: 83,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/components/inventory/SceneDropTargets.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/components/inventory/SceneDropTargets.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web-demo/app/components/inventory/SceneDropTargets.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
function SceneDropTargets({ targets, draggedStack, onDropHit, onDropMiss, onInspect, playerDropTarget }) {
    const dropHandledRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        dropHandledRef.current = false;
        if (!draggedStack) {
            return;
        }
        const handleWindowPointerUp = ()=>{
            if (dropHandledRef.current) return;
            dropHandledRef.current = true;
            onDropMiss(draggedStack);
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserEnvironmentAdapter"].addWindowEventListener("pointerup", handleWindowPointerUp);
    }, [
        draggedStack,
        onDropMiss
    ]);
    if (targets.length === 0 && !playerDropTarget) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            targets.map((interaction)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SceneDropTarget, {
                    interaction: interaction,
                    draggedStack: draggedStack,
                    onDropHit: onDropHit,
                    onDropMiss: onDropMiss,
                    onInspect: onInspect,
                    markDropHandled: ()=>{
                        dropHandledRef.current = true;
                    }
                }, interaction.id, false, {
                    fileName: "[project]/apps/web-demo/app/components/inventory/SceneDropTargets.tsx",
                    lineNumber: 126,
                    columnNumber: 9
                }, this)),
            playerDropTarget && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    playerDropTarget.position[0],
                    playerDropTarget.position[1] + 1.5,
                    playerDropTarget.position[2]
                ],
                onPointerUp: (event)=>{
                    event.stopPropagation();
                    if (!draggedStack) return;
                    dropHandledRef.current = true;
                    playerDropTarget.onDrop(draggedStack);
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                        args: [
                            1.7,
                            4.5,
                            1.2
                        ]
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/inventory/SceneDropTargets.tsx",
                        lineNumber: 152,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                        transparent: true,
                        opacity: 0.01,
                        depthWrite: false
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/inventory/SceneDropTargets.tsx",
                        lineNumber: 153,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/components/inventory/SceneDropTargets.tsx",
                lineNumber: 139,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/apps/web-demo/app/components/inventory/PlacedSceneItems.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PlacedSceneItems",
    ()=>PlacedSceneItems
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/rapier/dist/react-three-rapier.esm.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function PlacedSceneItemMesh({ item, onPickup, canPickup }) {
    const [texture, setTexture] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [spriteAspectRatio, setSpriteAspectRatio] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const collisionHalfSize = item.collisionHalfSize ?? [
        0.34,
        0.34,
        0.34
    ];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let mounted = true;
        const loader = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextureLoader"]();
        let loadedTexture = null;
        loader.load(item.spriteUrl, (nextTexture)=>{
            if (!mounted) {
                nextTexture.dispose();
                return;
            }
            loadedTexture = nextTexture;
            const image = nextTexture.image;
            const width = image?.width ?? 1;
            const height = image?.height ?? 1;
            setSpriteAspectRatio(height > 0 ? width / height : 1);
            setTexture(nextTexture);
        }, undefined, ()=>{
        // Silenciar errores de carga para no romper la interacción del juego.
        });
        return ()=>{
            mounted = false;
            if (loadedTexture) {
                loadedTexture.dispose();
            }
        };
    }, [
        item.spriteUrl
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RigidBody"], {
        type: "fixed",
        colliders: false,
        position: item.worldPosition,
        children: [
            item.hasCollision && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CuboidCollider"], {
                args: collisionHalfSize
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/inventory/PlacedSceneItems.tsx",
                lineNumber: 57,
                columnNumber: 29
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                onPointerDown: (event)=>{
                    event.stopPropagation();
                    if (!canPickup) return;
                    onPickup(item);
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                        args: [
                            1.6,
                            1.6,
                            1.6
                        ]
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/inventory/PlacedSceneItems.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                        transparent: true,
                        opacity: 0.01,
                        depthWrite: false
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/inventory/PlacedSceneItems.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/components/inventory/PlacedSceneItems.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this),
            texture && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("sprite", {
                scale: [
                    1.35 * spriteAspectRatio,
                    1.35,
                    1
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("spriteMaterial", {
                    map: texture,
                    transparent: true
                }, void 0, false, {
                    fileName: "[project]/apps/web-demo/app/components/inventory/PlacedSceneItems.tsx",
                    lineNumber: 70,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/inventory/PlacedSceneItems.tsx",
                lineNumber: 69,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web-demo/app/components/inventory/PlacedSceneItems.tsx",
        lineNumber: 56,
        columnNumber: 5
    }, this);
}
function PlacedSceneItems({ items, onPickup, canPickup }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PlacedSceneItemMesh, {
                item: item,
                onPickup: onPickup,
                canPickup: canPickup
            }, item.id, false, {
                fileName: "[project]/apps/web-demo/app/components/inventory/PlacedSceneItems.tsx",
                lineNumber: 89,
                columnNumber: 9
            }, this))
    }, void 0, false);
}
}),
"[project]/apps/web-demo/app/components/scene/SceneBackgroundPlane.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SceneBackgroundPlane",
    ()=>SceneBackgroundPlane
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-ssr] (ecmascript) <export D as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/game/state/sceneStore.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function SceneBackgroundPlane({ url }) {
    const [texture, setTexture] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const meshRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const ground = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.scene.ground);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!url) return;
        const loader = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextureLoader"]();
        let mounted = true;
        let loadedTexture = null;
        loader.load(url, (tex)=>{
            if (!mounted) {
                tex.dispose();
                return;
            }
            loadedTexture = tex;
            setTexture(tex);
        }, undefined, (err)=>{
            console.warn("SceneBackgroundPlane: texture load error", err);
        });
        return ()=>{
            mounted = false;
            if (loadedTexture) {
                loadedTexture.dispose();
            }
        };
    }, [
        url
    ]);
    let aspect = 16 / 9;
    const textureImage = texture?.image;
    if (textureImage?.width && textureImage?.height) {
        aspect = textureImage.width / textureImage.height;
    }
    const height = 19.28;
    const groundCenterX = (ground.minX + ground.maxX) / 2;
    const width = height * aspect;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])(({ camera })=>{
        if (!meshRef.current) return;
        const dir = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"]();
        camera.getWorldDirection(dir);
        const distance = 10;
        meshRef.current.position.copy(camera.position).addScaledVector(dir, distance);
        meshRef.current.position.x = groundCenterX;
        meshRef.current.quaternion.copy(camera.quaternion);
    });
    if (!url) return null;
    if (!texture) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
        ref: meshRef,
        frustumCulled: false,
        renderOrder: -100,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("planeGeometry", {
                args: [
                    width,
                    height
                ]
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/scene/SceneBackgroundPlane.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                map: texture,
                side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DoubleSide"],
                depthTest: false,
                depthWrite: false
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/scene/SceneBackgroundPlane.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web-demo/app/components/scene/SceneBackgroundPlane.tsx",
        lineNumber: 70,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web-demo/app/components/scene/SceneCameraControllers.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CameraController",
    ()=>CameraController,
    "CameraFitHeight",
    ()=>CameraFitHeight
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-ssr] (ecmascript) <export D as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/platform-web.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/game/state/sceneStore.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function CameraController() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])(({ camera, size })=>{
        const { playerPosition, scene: { ground } } = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"].getState();
        const zoom = camera.zoom;
        const halfViewW = size.width / (2 * zoom);
        const groundCenterX = (ground.minX + ground.maxX) / 2;
        const minCamX = ground.minX + halfViewW;
        const maxCamX = ground.maxX - halfViewW;
        const targetX = playerPosition[0];
        const clampedX = minCamX <= maxCamX ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].clamp(targetX, minCamX, maxCamX) : groundCenterX;
        camera.position.setX(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].lerp(camera.position.x, clampedX, 0.1));
    });
    return null;
}
function CameraFitHeight({ desiredWorldHeight = 19.28 }) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])(({ camera, size })=>{
        const cam = camera;
        if (!cam) return;
        const pixelHeight = Math.max(1, size.height || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserEnvironmentAdapter"].getInnerHeight(800));
        const targetZoom = pixelHeight / desiredWorldHeight;
        if (Math.abs(cam.zoom - targetZoom) <= 0.0001) return;
        cam.zoom = targetZoom;
        cam.updateProjectionMatrix();
    });
    return null;
}
}),
"[project]/apps/web-demo/app/components/PixelSelect.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PixelSelect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pixelarticons$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/pixelarticons/react/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pixelarticons$2f$react$2f$ChevronDown$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pixelarticons/react/ChevronDown.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/platform-web.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function PixelSelect({ value, onChange, options, label }) {
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const selectedOption = options.find((opt)=>opt.value === value);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleClickOutside = (event)=>{
            const mouseEvent = event;
            if (containerRef.current && !containerRef.current.contains(mouseEvent.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserEnvironmentAdapter"].addDocumentEventListener("mousedown", handleClickOutside);
        }
    }, [
        isOpen
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "grid",
            gap: "6px"
        },
        ref: containerRef,
        children: [
            label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                style: {
                    fontSize: "11px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    fontWeight: "bold"
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/PixelSelect.tsx",
                lineNumber: 47,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "relative"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setIsOpen(!isOpen),
                        style: {
                            width: "100%",
                            borderRadius: "2px",
                            border: "2px solid #00ff41",
                            background: "rgb(8 12 32 / 90%)",
                            color: "#00ff41",
                            padding: "0.6rem 0.8rem",
                            fontSize: "12px",
                            fontFamily: "var(--font-pixel), monospace",
                            letterSpacing: "1px",
                            boxShadow: "inset 0 0 4px rgba(0, 255, 65, 0.2), 0 0 8px rgba(0, 255, 65, 0.2)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "8px",
                            textAlign: "left",
                            cursor: "pointer"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: selectedOption?.label || "Seleccionar..."
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/components/PixelSelect.tsx",
                                lineNumber: 81,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pixelarticons$2f$react$2f$ChevronDown$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ChevronDown"], {
                                width: 16,
                                height: 16,
                                fill: "#00ff41",
                                style: {
                                    transform: isOpen ? "rotateZ(180deg)" : "rotateZ(0deg)",
                                    transition: "transform 0.2s"
                                }
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/components/PixelSelect.tsx",
                                lineNumber: 82,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/components/PixelSelect.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            marginTop: "4px",
                            border: "2px solid #00ff41",
                            borderRadius: "2px",
                            background: "rgb(8 12 32 / 95%)",
                            boxShadow: "0 0 16px rgba(0, 255, 65, 0.3), inset 0 0 4px rgba(0, 255, 65, 0.1)",
                            zIndex: 1000,
                            maxHeight: "200px",
                            overflowY: "auto"
                        },
                        children: options.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    onChange(option.value);
                                    setIsOpen(false);
                                },
                                style: {
                                    width: "100%",
                                    padding: "0.6rem 0.8rem",
                                    border: "none",
                                    background: option.value === value ? "rgba(0, 255, 65, 0.2)" : "transparent",
                                    color: "#00ff41",
                                    fontSize: "12px",
                                    fontFamily: "var(--font-pixel), monospace",
                                    letterSpacing: "1px",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    transition: "background 0.1s"
                                },
                                onMouseEnter: (e)=>{
                                    e.currentTarget.style.background = "rgba(0, 255, 65, 0.15)";
                                },
                                onMouseLeave: (e)=>{
                                    if (option.value !== value) {
                                        e.currentTarget.style.background = "transparent";
                                    }
                                },
                                children: option.label
                            }, option.value, false, {
                                fileName: "[project]/apps/web-demo/app/components/PixelSelect.tsx",
                                lineNumber: 112,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/PixelSelect.tsx",
                        lineNumber: 94,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/components/PixelSelect.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web-demo/app/components/PixelSelect.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DebugOverlayPanel",
    ()=>DebugOverlayPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$PixelSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/PixelSelect.tsx [app-ssr] (ecmascript)");
"use client";
;
;
function OverlayButton({ label, onClick, disabled }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: onClick,
        disabled: disabled,
        style: {
            borderRadius: "2px",
            border: "2px solid #00ff41",
            background: disabled ? "rgb(8 12 32 / 40%)" : "rgb(8 12 32 / 90%)",
            color: disabled ? "rgb(0 255 65 / 45%)" : "#00ff41",
            padding: "0.55rem 0.7rem",
            fontSize: "11px",
            fontFamily: "var(--font-pixel), monospace",
            letterSpacing: "1px",
            cursor: disabled ? "not-allowed" : "pointer"
        },
        children: label
    }, void 0, false, {
        fileName: "[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
function OverlayNumberInput({ label, value, step = 1, onChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        style: {
            display: "grid",
            gap: "4px",
            fontSize: "11px",
            textTransform: "uppercase"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: label
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "number",
                value: Number.isFinite(value) ? value : 1,
                step: step,
                onChange: (e)=>onChange(Number(e.target.value)),
                style: {
                    width: "100%",
                    borderRadius: "2px",
                    border: "2px solid #00ff41",
                    background: "rgb(8 12 32 / 90%)",
                    color: "#00ff41",
                    padding: "0.5rem 0.6rem",
                    fontSize: "12px",
                    fontFamily: "var(--font-pixel), monospace",
                    letterSpacing: "1px",
                    outline: "none",
                    cursor: "auto"
                }
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, this);
}
function DebugOverlayPanel({ isDebug, debugPanelSide, onTogglePanelSide, isDebugGroundVisible, onToggleGround, isDebugWallsVisible, onToggleWalls, sceneId, onSceneChange, sceneOptions, readyMessage, onRespawn, editorMode, onEditorModeChange, speechDraft, onSpeechDraftChange, speechCharsPerSecond, onSpeechCharsPerSecondChange, onRunSpeech, onHideSpeech, speechVisible, editorContent }) {
    if (!isDebug) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: "fixed",
            top: "16px",
            left: debugPanelSide === "left" ? "16px" : undefined,
            right: debugPanelSide === "right" ? "16px" : undefined,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            zIndex: 10001,
            padding: "1rem 1.2rem",
            borderRadius: "2px",
            border: "3px solid #00ff41",
            background: "rgb(12 19 48 / 95%)",
            color: "#00ff41",
            backdropFilter: "blur(4px)",
            minWidth: "260px",
            maxWidth: "420px",
            maxHeight: "calc(100vh - 32px)",
            overflowY: "auto",
            boxShadow: "0 0 16px rgba(0, 255, 65, 0.3), inset 0 0 8px rgba(0, 255, 65, 0.1)",
            fontFamily: "var(--font-pixel), monospace",
            fontSize: "13px",
            letterSpacing: "1px",
            textShadow: "0 0 10px rgba(0, 255, 65, 0.4)",
            pointerEvents: "auto"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(OverlayButton, {
                        label: isDebugGroundVisible ? "Ocultar suelo" : "Mostrar suelo",
                        onClick: onToggleGround
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx",
                        lineNumber: 163,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(OverlayButton, {
                        label: isDebugWallsVisible ? "Ocultar paredes" : "Mostrar paredes",
                        onClick: onToggleWalls
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx",
                        lineNumber: 167,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx",
                lineNumber: 162,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(OverlayButton, {
                label: debugPanelSide === "left" ? "Panel a derecha" : "Panel a izquierda",
                onClick: onTogglePanelSide
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx",
                lineNumber: 173,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$PixelSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                label: "Escenario",
                value: sceneId,
                onChange: onSceneChange,
                options: sceneOptions
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx",
                lineNumber: 178,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    letterSpacing: "1px",
                    lineHeight: "1.6"
                },
                children: readyMessage
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx",
                lineNumber: 185,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(OverlayButton, {
                label: "Reaparecer en spawn",
                onClick: onRespawn
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx",
                lineNumber: 196,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$PixelSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                label: "Modo editor",
                value: editorMode,
                onChange: (value)=>onEditorModeChange(value),
                options: [
                    {
                        label: "Editar paredes",
                        value: "walls"
                    },
                    {
                        label: "Editar suelo",
                        value: "ground"
                    },
                    {
                        label: "Editar items",
                        value: "items"
                    },
                    {
                        label: "Editar targets",
                        value: "targets"
                    }
                ]
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx",
                lineNumber: 198,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gap: "8px",
                    paddingTop: "6px",
                    borderTop: "2px solid rgb(0 255 65 / 30%)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        style: {
                            fontSize: "12px",
                            lineHeight: "1.4"
                        },
                        children: "Bocadillo de dialogo"
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx",
                        lineNumber: 218,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        value: speechDraft,
                        onChange: (e)=>onSpeechDraftChange(e.target.value),
                        placeholder: "Escribe el texto para el personaje",
                        rows: 4,
                        style: {
                            width: "100%",
                            minHeight: "84px",
                            borderRadius: "2px",
                            border: "2px solid #00ff41",
                            background: "rgb(8 12 32 / 90%)",
                            color: "#00ff41",
                            padding: "0.6rem",
                            fontSize: "11px",
                            fontFamily: "var(--font-pixel), monospace",
                            letterSpacing: "0.5px",
                            resize: "vertical",
                            outline: "none",
                            cursor: "auto"
                        }
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx",
                        lineNumber: 221,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(OverlayNumberInput, {
                        label: "Velocidad (chars/seg)",
                        value: speechCharsPerSecond,
                        onChange: onSpeechCharsPerSecondChange
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx",
                        lineNumber: 243,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "8px"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(OverlayButton, {
                                label: "Hablar",
                                onClick: onRunSpeech,
                                disabled: speechDraft.trim().length === 0
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx",
                                lineNumber: 250,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(OverlayButton, {
                                label: "Ocultar",
                                onClick: onHideSpeech,
                                disabled: !speechVisible
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx",
                                lineNumber: 255,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx",
                        lineNumber: 249,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx",
                lineNumber: 210,
                columnNumber: 7
            }, this),
            editorContent
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx",
        lineNumber: 133,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web-demo/app/store/sceneEditorStore.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSceneEditorStore",
    ()=>useSceneEditorStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/game/state/sceneStore.js [app-ssr] (ecmascript)");
;
;
const useSceneEditorStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])()((set, get)=>({
        selectedWallIndex: null,
        selectWall: (index)=>set({
                selectedWallIndex: index
            }),
        addWall: ()=>{
            const sceneState = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"].getState();
            const groundY = sceneState.scene.ground.y;
            const playerPosition = sceneState.playerPosition;
            const newWall = {
                position: [
                    playerPosition[0],
                    groundY + 2,
                    playerPosition[2]
                ],
                halfSize: [
                    2,
                    2,
                    0.25
                ],
                rotationY: 0
            };
            sceneState.appendWall(newWall);
            set({
                selectedWallIndex: sceneState.scene.walls.length
            });
        },
        addWallWithData: (wall)=>{
            const sceneState = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"].getState();
            sceneState.appendWall(wall);
            set({
                selectedWallIndex: sceneState.scene.walls.length
            });
        },
        removeSelectedWall: ()=>{
            const { selectedWallIndex } = get();
            if (selectedWallIndex == null) return;
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"].getState().removeWall(selectedWallIndex);
            const newWalls = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"].getState().scene.walls;
            set({
                selectedWallIndex: newWalls.length === 0 ? null : Math.min(selectedWallIndex, newWalls.length - 1)
            });
        },
        updateSelectedWall: (updater)=>{
            const { selectedWallIndex } = get();
            if (selectedWallIndex == null) return;
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"].getState().updateWall(selectedWallIndex, updater);
        },
        updateGround: (updater)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"].getState().updateGround(updater);
        },
        _syncWallSelection: (wallsLength)=>{
            set({
                selectedWallIndex: wallsLength > 0 ? 0 : null
            });
        }
    }));
// Sincroniza la selección de muro cuando cambia la escena.
// Usa suscripción sin selector para evitar requerir middleware en sceneStore.
// sceneStore no conoce sceneEditorStore (sin acoplamiento circular).
let _lastSceneId = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"].getState().sceneId;
__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"].subscribe((state)=>{
    if (state.sceneId !== _lastSceneId) {
        _lastSceneId = state.sceneId;
        useSceneEditorStore.getState()._syncWallSelection(state.scene.walls.length);
    }
});
}),
"[project]/apps/web-demo/app/components/debug/controls.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DebugButton",
    ()=>DebugButton,
    "DebugNumberInput",
    ()=>DebugNumberInput
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
function DebugNumberInput({ label, value, step = 0.1, onChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        style: {
            display: "grid",
            gap: "4px",
            fontSize: "11px",
            textTransform: "uppercase"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: label
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/debug/controls.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "number",
                value: Number.isFinite(value) ? value : 0,
                step: step,
                onChange: (e)=>onChange(Number(e.target.value)),
                style: {
                    width: "100%",
                    borderRadius: "2px",
                    border: "2px solid #00ff41",
                    background: "rgb(8 12 32 / 90%)",
                    color: "#00ff41",
                    padding: "0.5rem 0.6rem",
                    fontSize: "12px",
                    fontFamily: "var(--font-pixel), monospace",
                    letterSpacing: "1px",
                    outline: "none",
                    cursor: "auto"
                }
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/debug/controls.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web-demo/app/components/debug/controls.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
function DebugButton({ label, onClick, disabled }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: onClick,
        disabled: disabled,
        style: {
            borderRadius: "2px",
            border: "2px solid #00ff41",
            background: disabled ? "rgb(8 12 32 / 40%)" : "rgb(8 12 32 / 90%)",
            color: disabled ? "rgb(0 255 65 / 45%)" : "#00ff41",
            padding: "0.55rem 0.7rem",
            fontSize: "11px",
            fontFamily: "var(--font-pixel), monospace",
            letterSpacing: "1px",
            cursor: disabled ? "not-allowed" : "pointer"
        },
        children: label
    }, void 0, false, {
        fileName: "[project]/apps/web-demo/app/components/debug/controls.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web-demo/app/components/debug/GroundEditorPanel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GroundEditorPanel",
    ()=>GroundEditorPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/platform-web.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/game/state/sceneStore.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$sceneEditorStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/store/sceneEditorStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/debug/controls.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function GroundEditorPanel() {
    const sceneId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.sceneId);
    const ground = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.scene.ground);
    const updateGround = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$sceneEditorStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneEditorStore"])((s)=>s.updateGround);
    const [copyLabel, setCopyLabel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("Copiar JSON suelo");
    const setGroundValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((key, value)=>{
        updateGround((currentGround)=>{
            const nextGround = {
                ...currentGround,
                [key]: value
            };
            if (nextGround.minX >= nextGround.maxX) {
                if (key === "minX") nextGround.minX = nextGround.maxX - 0.1;
                if (key === "maxX") nextGround.maxX = nextGround.minX + 0.1;
            }
            if (nextGround.minZ >= nextGround.maxZ) {
                if (key === "minZ") nextGround.minZ = nextGround.maxZ - 0.1;
                if (key === "maxZ") nextGround.maxZ = nextGround.minZ + 0.1;
            }
            return nextGround;
        });
    }, [
        updateGround
    ]);
    const groundJson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>JSON.stringify(ground, null, 2), [
        ground
    ]);
    const handleCopyJson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserClipboardAdapter"].writeText(groundJson);
            setCopyLabel("Copiado");
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserTimerAdapter"].setTimeout(()=>setCopyLabel("Copiar JSON suelo"), 1200);
        } catch  {
            setCopyLabel("Sin portapapeles");
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserTimerAdapter"].setTimeout(()=>setCopyLabel("Copiar JSON suelo"), 1200);
        }
    }, [
        groundJson
    ]);
    const width = (ground.maxX - ground.minX).toFixed(2);
    const depth = (ground.maxZ - ground.minZ).toFixed(2);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "grid",
            gap: "10px",
            paddingTop: "6px",
            borderTop: "2px solid rgb(0 255 65 / 30%)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                style: {
                    fontSize: "12px",
                    lineHeight: "1.4"
                },
                children: [
                    "Editor de suelo (",
                    sceneId,
                    ")"
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/components/debug/GroundEditorPanel.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontSize: "10px",
                    lineHeight: "1.5",
                    opacity: 0.85
                },
                children: "Cambios en vivo para ajustar el plano. Incluye limites y altura Y."
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/debug/GroundEditorPanel.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "8px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                        label: "minX",
                        value: ground.minX,
                        onChange: (value)=>setGroundValue("minX", value)
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/debug/GroundEditorPanel.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                        label: "maxX",
                        value: ground.maxX,
                        onChange: (value)=>setGroundValue("maxX", value)
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/debug/GroundEditorPanel.tsx",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                        label: "minZ",
                        value: ground.minZ,
                        onChange: (value)=>setGroundValue("minZ", value)
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/debug/GroundEditorPanel.tsx",
                        lineNumber: 59,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                        label: "maxZ",
                        value: ground.maxZ,
                        onChange: (value)=>setGroundValue("maxZ", value)
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/debug/GroundEditorPanel.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/components/debug/GroundEditorPanel.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                label: "Y suelo",
                value: ground.y,
                onChange: (value)=>setGroundValue("y", value)
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/debug/GroundEditorPanel.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: "10px",
                            opacity: 0.85
                        },
                        children: [
                            "Ancho: ",
                            width
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/components/debug/GroundEditorPanel.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: "10px",
                            opacity: 0.85
                        },
                        children: [
                            "Fondo: ",
                            depth
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/components/debug/GroundEditorPanel.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/components/debug/GroundEditorPanel.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                readOnly: true,
                value: groundJson,
                style: {
                    width: "100%",
                    minHeight: "90px",
                    borderRadius: "2px",
                    border: "2px solid #00ff41",
                    background: "rgb(8 12 32 / 90%)",
                    color: "#00ff41",
                    padding: "0.6rem",
                    fontSize: "11px",
                    fontFamily: "var(--font-pixel), monospace",
                    letterSpacing: "0.5px",
                    resize: "vertical",
                    cursor: "auto"
                }
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/debug/GroundEditorPanel.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugButton"], {
                label: copyLabel,
                onClick: ()=>{
                    void handleCopyJson();
                }
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/debug/GroundEditorPanel.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web-demo/app/components/debug/GroundEditorPanel.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InteractionTargetsEditorPanel",
    ()=>InteractionTargetsEditorPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/platform-web.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$PixelSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/PixelSelect.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/debug/controls.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function InteractionTargetsEditorPanel({ interactions, onSetPosition, onSetHalfSize, onSetRotationDeg, onMoveToPlayer, onResetFromSceneConfig }) {
    const [selectedInteractionId, setSelectedInteractionId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const effectiveSelectedInteractionId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (interactions.length === 0) return "";
        const stillExists = interactions.some((interaction)=>interaction.id === selectedInteractionId);
        return stillExists ? selectedInteractionId : interactions[0].id;
    }, [
        interactions,
        selectedInteractionId
    ]);
    const selectedInteraction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>interactions.find((interaction)=>interaction.id === effectiveSelectedInteractionId) ?? null, [
        effectiveSelectedInteractionId,
        interactions
    ]);
    const interactionOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>interactions.map((interaction, index)=>({
                label: `${index + 1}. ${interaction.label}`,
                value: interaction.id
            })), [
        interactions
    ]);
    const interactionsJson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>JSON.stringify(interactions, null, 2), [
        interactions
    ]);
    const [copyLabel, setCopyLabel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("Copiar JSON targets");
    const handleCopyJson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserClipboardAdapter"].writeText(interactionsJson);
            setCopyLabel("Copiado");
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserTimerAdapter"].setTimeout(()=>setCopyLabel("Copiar JSON targets"), 1200);
        } catch  {
            setCopyLabel("Sin portapapeles");
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserTimerAdapter"].setTimeout(()=>setCopyLabel("Copiar JSON targets"), 1200);
        }
    }, [
        interactionsJson
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "grid",
            gap: "10px",
            paddingTop: "6px",
            borderTop: "2px solid rgb(0 255 65 / 30%)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                style: {
                    fontSize: "12px",
                    lineHeight: "1.4"
                },
                children: "Editor de targets de drop"
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontSize: "10px",
                    lineHeight: "1.5",
                    opacity: 0.85
                },
                children: "Ajusta la zona donde se detecta y se permite colocar el item (posicion y tamano del detector)."
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontSize: "10px",
                    lineHeight: "1.5",
                    opacity: 0.85
                },
                children: "Con hasCollision activo, el editor limita automaticamente la Y minima para evitar perder colision con el jugador."
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugButton"], {
                label: "Reiniciar targets (scenes.ts)",
                onClick: onResetFromSceneConfig
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this),
            interactions.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontSize: "10px",
                    lineHeight: "1.5",
                    opacity: 0.85
                },
                children: "No hay targets de drop en esta escena."
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
                lineNumber: 75,
                columnNumber: 9
            }, this),
            interactions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$PixelSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        label: "Target seleccionado",
                        value: effectiveSelectedInteractionId,
                        onChange: (value)=>setSelectedInteractionId(value),
                        options: interactionOptions
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
                        lineNumber: 82,
                        columnNumber: 11
                    }, this),
                    selectedInteraction && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3, 1fr)",
                                    gap: "8px"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                                        label: "Pos X",
                                        value: selectedInteraction.position[0],
                                        onChange: (value)=>onSetPosition(selectedInteraction.id, 0, value)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
                                        lineNumber: 92,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                                        label: "Pos Y",
                                        value: selectedInteraction.position[1],
                                        onChange: (value)=>onSetPosition(selectedInteraction.id, 1, value)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
                                        lineNumber: 97,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                                        label: "Pos Z",
                                        value: selectedInteraction.position[2],
                                        onChange: (value)=>onSetPosition(selectedInteraction.id, 2, value)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
                                        lineNumber: 102,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
                                lineNumber: 91,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3, 1fr)",
                                    gap: "8px"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                                        label: "Half X",
                                        value: selectedInteraction.halfSize[0],
                                        onChange: (value)=>onSetHalfSize(selectedInteraction.id, 0, value)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
                                        lineNumber: 110,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                                        label: "Half Y",
                                        value: selectedInteraction.halfSize[1],
                                        onChange: (value)=>onSetHalfSize(selectedInteraction.id, 1, value)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
                                        lineNumber: 115,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                                        label: "Half Z",
                                        value: selectedInteraction.halfSize[2],
                                        onChange: (value)=>onSetHalfSize(selectedInteraction.id, 2, value)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
                                        lineNumber: 120,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
                                lineNumber: 109,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "8px"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                                        label: "Rot Y deg",
                                        value: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].radToDeg(selectedInteraction.rotationY ?? 0),
                                        step: 1,
                                        onChange: (value)=>onSetRotationDeg(selectedInteraction.id, value)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
                                        lineNumber: 128,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "grid",
                                            alignItems: "end"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugButton"], {
                                            label: "Mover al jugador",
                                            onClick: ()=>onMoveToPlayer(selectedInteraction.id)
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
                                            lineNumber: 135,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
                                        lineNumber: 134,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
                                lineNumber: 127,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        readOnly: true,
                        value: interactionsJson,
                        style: {
                            width: "100%",
                            minHeight: "90px",
                            borderRadius: "2px",
                            border: "2px solid #00ff41",
                            background: "rgb(8 12 32 / 90%)",
                            color: "#00ff41",
                            padding: "0.6rem",
                            fontSize: "11px",
                            fontFamily: "var(--font-pixel), monospace",
                            letterSpacing: "0.5px",
                            resize: "vertical",
                            cursor: "auto"
                        }
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
                        lineNumber: 141,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugButton"], {
                        label: copyLabel,
                        onClick: ()=>{
                            void handleCopyJson();
                        }
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
                        lineNumber: 160,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx",
        lineNumber: 64,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web-demo/app/components/debug/PlacedItemsEditorPanel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PlacedItemsEditorPanel",
    ()=>PlacedItemsEditorPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/platform-web.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$PixelSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/PixelSelect.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/debug/controls.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function PlacedItemsEditorPanel({ items, onSetPosition, onMoveToPlayer, onRemove }) {
    const [selectedItemId, setSelectedItemId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const effectiveSelectedItemId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (items.length === 0) return "";
        const stillExists = items.some((item)=>item.id === selectedItemId);
        return stillExists ? selectedItemId : items[0].id;
    }, [
        items,
        selectedItemId
    ]);
    const selectedItem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>items.find((item)=>item.id === effectiveSelectedItemId) ?? null, [
        effectiveSelectedItemId,
        items
    ]);
    const itemOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>items.map((item, index)=>({
                label: `${index + 1}. ${item.name}`,
                value: item.id
            })), [
        items
    ]);
    const itemsJson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>JSON.stringify(items, null, 2), [
        items
    ]);
    const [copyLabel, setCopyLabel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("Copiar JSON items");
    const handleCopyJson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserClipboardAdapter"].writeText(itemsJson);
            setCopyLabel("Copiado");
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserTimerAdapter"].setTimeout(()=>setCopyLabel("Copiar JSON items"), 1200);
        } catch  {
            setCopyLabel("Sin portapapeles");
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserTimerAdapter"].setTimeout(()=>setCopyLabel("Copiar JSON items"), 1200);
        }
    }, [
        itemsJson
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "grid",
            gap: "10px",
            paddingTop: "6px",
            borderTop: "2px solid rgb(0 255 65 / 30%)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                style: {
                    fontSize: "12px",
                    lineHeight: "1.4"
                },
                children: "Editor de items colocados"
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/debug/PlacedItemsEditorPanel.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontSize: "10px",
                    lineHeight: "1.5",
                    opacity: 0.85
                },
                children: "Reubica items ya colocados en vivo para ajustar su encaje exacto en la escena."
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/debug/PlacedItemsEditorPanel.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this),
            items.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontSize: "10px",
                    lineHeight: "1.5",
                    opacity: 0.85
                },
                children: "No hay items colocados en esta escena todavia."
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/debug/PlacedItemsEditorPanel.tsx",
                lineNumber: 66,
                columnNumber: 9
            }, this),
            items.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$PixelSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        label: "Item seleccionado",
                        value: effectiveSelectedItemId,
                        onChange: (value)=>setSelectedItemId(value),
                        options: itemOptions
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/debug/PlacedItemsEditorPanel.tsx",
                        lineNumber: 73,
                        columnNumber: 11
                    }, this),
                    selectedItem && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3, 1fr)",
                                    gap: "8px"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                                        label: "Pos X",
                                        value: selectedItem.worldPosition[0],
                                        onChange: (value)=>onSetPosition(selectedItem.id, 0, value)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web-demo/app/components/debug/PlacedItemsEditorPanel.tsx",
                                        lineNumber: 83,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                                        label: "Pos Y",
                                        value: selectedItem.worldPosition[1],
                                        onChange: (value)=>onSetPosition(selectedItem.id, 1, value)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web-demo/app/components/debug/PlacedItemsEditorPanel.tsx",
                                        lineNumber: 88,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                                        label: "Pos Z",
                                        value: selectedItem.worldPosition[2],
                                        onChange: (value)=>onSetPosition(selectedItem.id, 2, value)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web-demo/app/components/debug/PlacedItemsEditorPanel.tsx",
                                        lineNumber: 93,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web-demo/app/components/debug/PlacedItemsEditorPanel.tsx",
                                lineNumber: 82,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "8px"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugButton"], {
                                        label: "Mover al jugador",
                                        onClick: ()=>onMoveToPlayer(selectedItem.id)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web-demo/app/components/debug/PlacedItemsEditorPanel.tsx",
                                        lineNumber: 101,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugButton"], {
                                        label: "Borrar item",
                                        onClick: ()=>onRemove(selectedItem.id)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web-demo/app/components/debug/PlacedItemsEditorPanel.tsx",
                                        lineNumber: 102,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web-demo/app/components/debug/PlacedItemsEditorPanel.tsx",
                                lineNumber: 100,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        readOnly: true,
                        value: itemsJson,
                        style: {
                            width: "100%",
                            minHeight: "90px",
                            borderRadius: "2px",
                            border: "2px solid #00ff41",
                            background: "rgb(8 12 32 / 90%)",
                            color: "#00ff41",
                            padding: "0.6rem",
                            fontSize: "11px",
                            fontFamily: "var(--font-pixel), monospace",
                            letterSpacing: "0.5px",
                            resize: "vertical",
                            cursor: "auto"
                        }
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/debug/PlacedItemsEditorPanel.tsx",
                        lineNumber: 107,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugButton"], {
                        label: copyLabel,
                        onClick: ()=>{
                            void handleCopyJson();
                        }
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/debug/PlacedItemsEditorPanel.tsx",
                        lineNumber: 126,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web-demo/app/components/debug/PlacedItemsEditorPanel.tsx",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WallEditorPanel",
    ()=>WallEditorPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$PixelSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/PixelSelect.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/platform-web.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/game/state/sceneStore.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$sceneEditorStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/store/sceneEditorStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/debug/controls.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
function WallEditorPanel({ wallToolMode, setWallToolMode, onResetPointTool }) {
    const sceneId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.sceneId);
    const walls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.scene.walls);
    const groundY = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.scene.ground.y);
    const playerPosition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.playerPosition);
    const selectedWallIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$sceneEditorStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneEditorStore"])((s)=>s.selectedWallIndex);
    const selectWall = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$sceneEditorStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneEditorStore"])((s)=>s.selectWall);
    const addWall = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$sceneEditorStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneEditorStore"])((s)=>s.addWall);
    const removeSelectedWall = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$sceneEditorStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneEditorStore"])((s)=>s.removeSelectedWall);
    const updateSelectedWall = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$sceneEditorStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneEditorStore"])((s)=>s.updateSelectedWall);
    const [copyLabel, setCopyLabel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("Copiar JSON");
    const selectedWall = selectedWallIndex == null ? null : walls[selectedWallIndex] ?? null;
    const wallOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>walls.map((_, index)=>({
                label: `Muro ${index + 1}`,
                value: String(index)
            })), [
        walls
    ]);
    const wallsJson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>JSON.stringify(walls, null, 2), [
        walls
    ]);
    const setWallPosition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((axis, value)=>{
        updateSelectedWall((wall)=>{
            const position = [
                ...wall.position
            ];
            position[axis] = value;
            return {
                ...wall,
                position
            };
        });
    }, [
        updateSelectedWall
    ]);
    const setWallHalfSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((axis, value)=>{
        updateSelectedWall((wall)=>{
            const halfSize = [
                ...wall.halfSize
            ];
            halfSize[axis] = Math.max(0.05, value);
            return {
                ...wall,
                halfSize
            };
        });
    }, [
        updateSelectedWall
    ]);
    const setWallRotationDeg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((value)=>{
        updateSelectedWall((wall)=>({
                ...wall,
                rotationY: value * Math.PI / 180
            }));
    }, [
        updateSelectedWall
    ]);
    const moveWallToPlayer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        updateSelectedWall((wall)=>({
                ...wall,
                position: [
                    playerPosition[0],
                    groundY + wall.halfSize[1],
                    playerPosition[2]
                ]
            }));
    }, [
        groundY,
        playerPosition,
        updateSelectedWall
    ]);
    const handleCopyJson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserClipboardAdapter"].writeText(wallsJson);
            setCopyLabel("Copiado");
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserTimerAdapter"].setTimeout(()=>setCopyLabel("Copiar JSON"), 1200);
        } catch  {
            setCopyLabel("Sin portapapeles");
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserTimerAdapter"].setTimeout(()=>setCopyLabel("Copiar JSON"), 1200);
        }
    }, [
        wallsJson
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "grid",
            gap: "10px",
            paddingTop: "6px",
            borderTop: "2px solid rgb(0 255 65 / 30%)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                style: {
                    fontSize: "12px",
                    lineHeight: "1.4"
                },
                children: [
                    "Editor de muros (",
                    sceneId,
                    ")"
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                lineNumber: 83,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontSize: "10px",
                    lineHeight: "1.5",
                    opacity: 0.85
                },
                children: "Edicion en vivo solo en navegador. Usa copiar JSON para pegar el resultado en scenes.ts."
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                lineNumber: 84,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontSize: "10px",
                    lineHeight: "1.5",
                    opacity: 0.85
                },
                children: "Arrastra el wireframe amarillo para mover. Los cubos azules cambian el largo y los rosas el grosor."
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$PixelSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                label: "Herramienta",
                value: wallToolMode,
                onChange: (value)=>setWallToolMode(value),
                options: [
                    {
                        label: "Manual",
                        value: "manual"
                    },
                    {
                        label: "Por puntos",
                        value: "points"
                    }
                ]
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                lineNumber: 91,
                columnNumber: 7
            }, this),
            wallToolMode === "points" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: "10px",
                            lineHeight: "1.5",
                            opacity: 0.85
                        },
                        children: "Click 1: punto inicial. Click 2: punto final y se crea el muro. El punto final queda como nuevo inicio."
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                        lineNumber: 103,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugButton"], {
                        label: "Cancelar trazo",
                        onClick: onResetPointTool
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                        lineNumber: 106,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugButton"], {
                        label: "Nuevo muro",
                        onClick: addWall
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                        lineNumber: 111,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugButton"], {
                        label: "Borrar muro",
                        onClick: removeSelectedWall,
                        disabled: selectedWall == null
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this),
            walls.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$PixelSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                label: "Muro seleccionado",
                value: selectedWallIndex == null ? "0" : String(selectedWallIndex),
                onChange: (value)=>selectWall(Number(value)),
                options: wallOptions
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                lineNumber: 116,
                columnNumber: 9
            }, this),
            selectedWall && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "8px"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                                label: "Pos X",
                                value: selectedWall.position[0],
                                onChange: (value)=>setWallPosition(0, value)
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                                lineNumber: 127,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                                label: "Pos Y",
                                value: selectedWall.position[1],
                                onChange: (value)=>setWallPosition(1, value)
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                                lineNumber: 128,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                                label: "Pos Z",
                                value: selectedWall.position[2],
                                onChange: (value)=>setWallPosition(2, value)
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                                lineNumber: 129,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                        lineNumber: 126,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "8px"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                                label: "Half X",
                                value: selectedWall.halfSize[0],
                                onChange: (value)=>setWallHalfSize(0, value)
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                                lineNumber: 133,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                                label: "Half Y",
                                value: selectedWall.halfSize[1],
                                onChange: (value)=>setWallHalfSize(1, value)
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                                lineNumber: 134,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                                label: "Half Z",
                                value: selectedWall.halfSize[2],
                                onChange: (value)=>setWallHalfSize(2, value)
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                                lineNumber: 135,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                        lineNumber: 132,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "8px"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugNumberInput"], {
                                label: "Rot Y deg",
                                value: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].radToDeg(selectedWall.rotationY ?? 0),
                                step: 1,
                                onChange: setWallRotationDeg
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                                lineNumber: 139,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "grid",
                                    alignItems: "end"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugButton"], {
                                    label: "Mover al jugador",
                                    onClick: moveWallToPlayer
                                }, void 0, false, {
                                    fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                                    lineNumber: 146,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                                lineNumber: 145,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                        lineNumber: 138,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                readOnly: true,
                value: wallsJson,
                style: {
                    width: "100%",
                    minHeight: "120px",
                    borderRadius: "2px",
                    border: "2px solid #00ff41",
                    background: "rgb(8 12 32 / 90%)",
                    color: "#00ff41",
                    padding: "0.6rem",
                    fontSize: "11px",
                    fontFamily: "var(--font-pixel), monospace",
                    letterSpacing: "0.5px",
                    resize: "vertical",
                    cursor: "auto"
                }
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                lineNumber: 152,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$controls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugButton"], {
                label: copyLabel,
                onClick: ()=>{
                    void handleCopyJson();
                }
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
                lineNumber: 171,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx",
        lineNumber: 82,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web-demo/app/components/debug/DebugOverlayRuntimePanel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DebugOverlayRuntimePanel",
    ()=>DebugOverlayRuntimePanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$DebugOverlayPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/DebugOverlayPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$GroundEditorPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/debug/GroundEditorPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$InteractionTargetsEditorPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/debug/InteractionTargetsEditorPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$PlacedItemsEditorPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/debug/PlacedItemsEditorPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$WallEditorPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/debug/WallEditorPanel.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
function DebugOverlayRuntimePanel({ isDebug, debugPanelSide, setDebugPanelSide, isDebugGroundVisible, setIsDebugGroundVisible, isDebugWallsVisible, setIsDebugWallsVisible, sceneId, setScene, sceneOptions, readyMessage, requestRespawn, editorMode, setEditorMode, wallToolMode, handleWallToolModeChange, resetWallPointTool, speechDraft, setSpeechDraft, speechCharsPerSecond, setSpeechCharsPerSecond, showSpeechBubble, hideSpeechBubble, speechVisible, sceneInteractions, updateInteractionPosition, updateInteractionHalfSize, updateInteractionRotationDeg, moveInteractionToPlayer, resetInteractionsFromSceneConfig, placedItems, updatePlacedItemPosition, movePlacedItemToPlayer, removePlacedItemById }) {
    const runSpeechBubble = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const nextText = speechDraft.trim();
        if (!nextText) return;
        showSpeechBubble(nextText);
    }, [
        showSpeechBubble,
        speechDraft
    ]);
    const editorContent = editorMode === "walls" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$WallEditorPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WallEditorPanel"], {
        wallToolMode: wallToolMode,
        setWallToolMode: handleWallToolModeChange,
        onResetPointTool: resetWallPointTool
    }, void 0, false, {
        fileName: "[project]/apps/web-demo/app/components/debug/DebugOverlayRuntimePanel.tsx",
        lineNumber: 96,
        columnNumber: 7
    }, this) : editorMode === "ground" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$GroundEditorPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GroundEditorPanel"], {}, void 0, false, {
        fileName: "[project]/apps/web-demo/app/components/debug/DebugOverlayRuntimePanel.tsx",
        lineNumber: 102,
        columnNumber: 7
    }, this) : editorMode === "targets" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$InteractionTargetsEditorPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["InteractionTargetsEditorPanel"], {
        interactions: sceneInteractions,
        onSetPosition: updateInteractionPosition,
        onSetHalfSize: updateInteractionHalfSize,
        onSetRotationDeg: updateInteractionRotationDeg,
        onMoveToPlayer: moveInteractionToPlayer,
        onResetFromSceneConfig: resetInteractionsFromSceneConfig
    }, void 0, false, {
        fileName: "[project]/apps/web-demo/app/components/debug/DebugOverlayRuntimePanel.tsx",
        lineNumber: 104,
        columnNumber: 7
    }, this) : editorMode === "items" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$PlacedItemsEditorPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlacedItemsEditorPanel"], {
        items: placedItems,
        onSetPosition: updatePlacedItemPosition,
        onMoveToPlayer: movePlacedItemToPlayer,
        onRemove: removePlacedItemById
    }, void 0, false, {
        fileName: "[project]/apps/web-demo/app/components/debug/DebugOverlayRuntimePanel.tsx",
        lineNumber: 113,
        columnNumber: 7
    }, this) : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$DebugOverlayPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugOverlayPanel"], {
        isDebug: isDebug,
        debugPanelSide: debugPanelSide,
        onTogglePanelSide: ()=>setDebugPanelSide((side)=>side === "left" ? "right" : "left"),
        isDebugGroundVisible: isDebugGroundVisible,
        onToggleGround: ()=>setIsDebugGroundVisible((visible)=>!visible),
        isDebugWallsVisible: isDebugWallsVisible,
        onToggleWalls: ()=>setIsDebugWallsVisible((visible)=>!visible),
        sceneId: sceneId,
        onSceneChange: setScene,
        sceneOptions: sceneOptions,
        readyMessage: readyMessage,
        onRespawn: requestRespawn,
        editorMode: editorMode,
        onEditorModeChange: setEditorMode,
        speechDraft: speechDraft,
        onSpeechDraftChange: setSpeechDraft,
        speechCharsPerSecond: speechCharsPerSecond,
        onSpeechCharsPerSecondChange: (value)=>setSpeechCharsPerSecond(Math.max(1, Math.round(value))),
        onRunSpeech: runSpeechBubble,
        onHideSpeech: hideSpeechBubble,
        speechVisible: speechVisible,
        editorContent: editorContent
    }, void 0, false, {
        fileName: "[project]/apps/web-demo/app/components/debug/DebugOverlayRuntimePanel.tsx",
        lineNumber: 122,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web-demo/app/lib/engine/render/SpeechBubble.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SpeechBubble
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$RoundedBox$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/RoundedBox.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Text.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/platform-web.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/game/state/sceneStore.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
const SPRITE_HALF_WIDTH_WORLD = 0.62;
const BUBBLE_GAP_WORLD = 0.22;
const DEPTH_FAR_Z = -16;
const DEPTH_NEAR_Z = 8;
const SPRITE_MIN_SCALE = 1.4;
const SPRITE_MAX_SCALE = 2.94;
const SPRITE_HALF_WIDTH_FACTOR = 0.36;
const BORDER_PADDING = 0.09;
const SPRITE_CENTER_Y_OFFSET = -0.95;
const BUBBLE_HEADROOM = -1;
const TEXT_PADDING_X = 0.2;
const TEXT_PADDING_Y = 0.16;
const FONT_SIZE = 0.2;
const LINE_HEIGHT = 1.18;
const AVG_CHAR_WIDTH_WORLD = 0.096;
const MIN_BUBBLE_WIDTH = 0.6;
const MAX_BUBBLE_WIDTH = 5.2;
const MIN_BUBBLE_HEIGHT = 0.45;
const MAX_BUBBLE_HEIGHT = 3.8;
const MS_PER_WORD_READ = 286;
const MIN_READ_MS = 2080;
const MAX_READ_MS = 10400;
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function lerp(start, end, t) {
    return start + (end - start) * t;
}
function wrapParagraphByWords(paragraph, maxCharsPerLine) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return [
        ""
    ];
    const lines = [];
    let currentLine = words[0];
    for(let index = 1; index < words.length; index += 1){
        const candidate = `${currentLine} ${words[index]}`;
        if (candidate.length <= maxCharsPerLine) {
            currentLine = candidate;
        } else {
            lines.push(currentLine);
            currentLine = words[index];
        }
    }
    lines.push(currentLine);
    return lines;
}
function SpeechBubble({ text, visible, trigger, charsPerSecond = 30, onDismiss }) {
    const playerPosition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((state)=>state.playerPosition);
    const ground = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((state)=>state.scene.ground);
    const normalizedText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>text.trim(), [
        text
    ]);
    const [displayedText, setDisplayedText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const dismissTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // ── Layout estático: calculado UNA vez por diálogo (dep: normalizedText) ──
    // wrappedText: el texto con \n explícitos en los saltos de línea.
    //   - El efecto tipea sobre wrappedText → cada palabra aparece ya en su
    //     línea final desde el primer carácter. Nunca salta de línea.
    // bubbleWidth / textMaxWidth fijos desde el inicio → troika nunca
    //   re-envuelve mientras se tipea, eliminando el baile de palabras.
    // NOTA: los espacios entre palabras que se convierten en \n tienen la
    //   misma longitud (1 char) → los índices del tipeo coinciden exactamente.
    const { bubbleWidth, textMaxWidth, fullBubbleHeight, wrappedText } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const fullText = normalizedText.length > 0 ? normalizedText : " ";
        const totalChars = Math.max(1, fullText.length);
        const targetCPL = clamp(Math.round(Math.sqrt(totalChars) * 2.4), 18, 36);
        const paragraphs = fullText.split("\n");
        const wrappedFull = paragraphs.flatMap((p)=>p.trim().length === 0 ? [
                ""
            ] : wrapParagraphByWords(p, targetCPL));
        const longestChars = Math.max(1, ...wrappedFull.map((l)=>l.length));
        const rawTextWidth = clamp(longestChars * AVG_CHAR_WIDTH_WORLD, MIN_BUBBLE_WIDTH - TEXT_PADDING_X * 2, MAX_BUBBLE_WIDTH - TEXT_PADDING_X * 2);
        const bw = clamp(rawTextWidth + TEXT_PADDING_X * 2, MIN_BUBBLE_WIDTH, MAX_BUBBLE_WIDTH);
        const fullLineCount = Math.max(1, wrappedFull.length);
        const fbh = clamp(fullLineCount * FONT_SIZE * LINE_HEIGHT + TEXT_PADDING_Y * 2, MIN_BUBBLE_HEIGHT, MAX_BUBBLE_HEIGHT);
        return {
            bubbleWidth: bw,
            textMaxWidth: bw - TEXT_PADDING_X * 2,
            fullBubbleHeight: fbh,
            wrappedText: wrappedFull.join("\n")
        };
    }, [
        normalizedText
    ]);
    // ── Efecto de tipeo ────────────────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!visible || wrappedText.length === 0) return;
        let index = 0;
        const msPerChar = Math.max(14, Math.floor(1000 / Math.max(1, charsPerSecond)));
        const timer = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserTimerAdapter"].setInterval(()=>{
            index += 1;
            setDisplayedText(wrappedText.slice(0, index));
            if (index >= wrappedText.length) {
                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserTimerAdapter"].clearInterval(timer);
                if (onDismiss) {
                    const wordCount = normalizedText.trim().split(/\s+/).filter(Boolean).length;
                    const readMs = clamp(wordCount * MS_PER_WORD_READ, MIN_READ_MS, MAX_READ_MS);
                    dismissTimerRef.current = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserTimerAdapter"].setTimeout(onDismiss, readMs);
                }
            }
        }, msPerChar);
        return ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserTimerAdapter"].clearInterval(timer);
            if (dismissTimerRef.current !== null) {
                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserTimerAdapter"].clearTimeout(dismissTimerRef.current);
                dismissTimerRef.current = null;
            }
        };
    }, [
        charsPerSecond,
        wrappedText,
        normalizedText,
        onDismiss,
        trigger,
        visible
    ]);
    const shouldShowLeft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const worldEdgePadding = 0.9;
        const spaceLeft = playerPosition[0] - ground.minX - worldEdgePadding;
        const spaceRight = ground.maxX - playerPosition[0] - worldEdgePadding;
        return spaceLeft > spaceRight;
    }, [
        ground.maxX,
        ground.minX,
        playerPosition
    ]);
    const depthFactor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return clamp((playerPosition[2] - DEPTH_FAR_Z) / (DEPTH_NEAR_Z - DEPTH_FAR_Z), 0, 1);
    }, [
        playerPosition
    ]);
    const spriteScale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return lerp(SPRITE_MIN_SCALE, SPRITE_MAX_SCALE, depthFactor);
    }, [
        depthFactor
    ]);
    // ── Alto dinámico: displayedText ya tiene \n → solo contar líneas ─────────
    const bubbleHeight = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const lineCount = Math.max(1, displayedText.split("\n").length);
        const textHeight = lineCount * FONT_SIZE * LINE_HEIGHT;
        return clamp(textHeight + TEXT_PADDING_Y * 2, MIN_BUBBLE_HEIGHT, MAX_BUBBLE_HEIGHT);
    }, [
        displayedText
    ]);
    if (!visible || normalizedText.length === 0) {
        return null;
    }
    const spriteHalfWidthWorld = Math.max(SPRITE_HALF_WIDTH_WORLD, spriteScale * SPRITE_HALF_WIDTH_FACTOR);
    const sideOffset = spriteHalfWidthWorld + BUBBLE_GAP_WORLD;
    const offsetX = shouldShowLeft ? -sideOffset : sideOffset;
    // offsetY = borde SUPERIOR del bocadillo. Crece hacia abajo desde aquí.
    const offsetY = 2 * spriteScale + SPRITE_CENTER_Y_OFFSET + BUBBLE_HEADROOM;
    const bubbleCenterX = shouldShowLeft ? offsetX - bubbleWidth / 2 : offsetX + bubbleWidth / 2;
    const arrowBaseX = shouldShowLeft ? offsetX + 0.07 : offsetX - 0.07;
    const arrowRotationZ = shouldShowLeft ? -Math.PI / 2 : Math.PI / 2;
    return(// Grupo anclado al borde superior del bocadillo
    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        position: [
            0,
            offsetY,
            0
        ],
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                position: [
                    bubbleCenterX,
                    -bubbleHeight / 2,
                    0.03
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$RoundedBox$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RoundedBox"], {
                        args: [
                            1,
                            1,
                            0.02
                        ],
                        scale: [
                            bubbleWidth + BORDER_PADDING,
                            bubbleHeight + BORDER_PADDING,
                            1
                        ],
                        radius: 0.14,
                        smoothness: 4,
                        position: [
                            0,
                            0,
                            -0.003
                        ],
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                            color: "#ffffff",
                            toneMapped: false
                        }, void 0, false, {
                            fileName: "[project]/apps/web-demo/app/lib/engine/render/SpeechBubble.tsx",
                            lineNumber: 199,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/SpeechBubble.tsx",
                        lineNumber: 192,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$RoundedBox$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RoundedBox"], {
                        args: [
                            1,
                            1,
                            0.018
                        ],
                        scale: [
                            bubbleWidth,
                            bubbleHeight,
                            1
                        ],
                        radius: 0.12,
                        smoothness: 4,
                        position: [
                            0,
                            0,
                            0
                        ],
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                            color: "#ffffff",
                            toneMapped: false
                        }, void 0, false, {
                            fileName: "[project]/apps/web-demo/app/lib/engine/render/SpeechBubble.tsx",
                            lineNumber: 208,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/SpeechBubble.tsx",
                        lineNumber: 201,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Text"], {
                        position: [
                            -(bubbleWidth / 2) + TEXT_PADDING_X,
                            0,
                            0.012
                        ],
                        color: "#121212",
                        anchorX: "left",
                        anchorY: "middle",
                        maxWidth: textMaxWidth,
                        lineHeight: LINE_HEIGHT,
                        fontSize: FONT_SIZE,
                        textAlign: "left",
                        outlineWidth: 0.005,
                        outlineColor: "#ffffff",
                        children: displayedText
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/SpeechBubble.tsx",
                        lineNumber: 214,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/lib/engine/render/SpeechBubble.tsx",
                lineNumber: 191,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    arrowBaseX,
                    -fullBubbleHeight * 0.3,
                    0.027
                ],
                rotation: [
                    0,
                    0,
                    arrowRotationZ
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("coneGeometry", {
                        args: [
                            0.16,
                            0.27,
                            3
                        ]
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/SpeechBubble.tsx",
                        lineNumber: 233,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                        color: "#ffffff",
                        toneMapped: false
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/SpeechBubble.tsx",
                        lineNumber: 234,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/lib/engine/render/SpeechBubble.tsx",
                lineNumber: 232,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    arrowBaseX,
                    -fullBubbleHeight * 0.3,
                    0.028
                ],
                rotation: [
                    0,
                    0,
                    arrowRotationZ
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("coneGeometry", {
                        args: [
                            0.13,
                            0.22,
                            3
                        ]
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/SpeechBubble.tsx",
                        lineNumber: 237,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                        color: "#ffffff",
                        toneMapped: false
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/SpeechBubble.tsx",
                        lineNumber: 238,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/lib/engine/render/SpeechBubble.tsx",
                lineNumber: 236,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web-demo/app/lib/engine/render/SpeechBubble.tsx",
        lineNumber: 189,
        columnNumber: 5
    }, this));
}
}),
"[project]/apps/web-demo/app/lib/engine/render/sprite/DavidSprite.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-ssr] (ecmascript) <export D as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__G__as__useLoader$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-ssr] (ecmascript) <export G as useLoader>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-ssr] (ecmascript) <export C as useThree>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const SHOULD_LOG_SPRITE_STATE = ("TURBOPACK compile-time value", "development") !== "production";
let spriteInstanceCounter = 0;
function logSpriteState(event, payload) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    console.info(`[sprite-state] ${event}`, payload);
}
function cloneTexture(sourceTexture) {
    const clonedTexture = sourceTexture.clone();
    clonedTexture.colorSpace = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SRGBColorSpace"];
    clonedTexture.magFilter = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NearestFilter"];
    clonedTexture.minFilter = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NearestFilter"];
    clonedTexture.wrapS = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ClampToEdgeWrapping"];
    clonedTexture.wrapT = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ClampToEdgeWrapping"];
    clonedTexture.generateMipmaps = false;
    clonedTexture.needsUpdate = true;
    return clonedTexture;
}
const DavidSprite = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ animation, preloadAnimations, meshRef, scale = [
    2.2,
    2.2,
    1
], isPaused = false }, ref)=>{
    const spriteInstanceIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    if (spriteInstanceIdRef.current == null) {
        spriteInstanceIdRef.current = ++spriteInstanceCounter;
    }
    const internalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const targetRef = meshRef ?? internalRef;
    const materialRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const renderer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"])((state)=>state.gl);
    const preloadedFrames = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!preloadAnimations?.length) {
            return null;
        }
        const uniqueFrames = new Set();
        preloadAnimations.forEach((clip)=>{
            clip.frames.forEach((frame)=>{
                uniqueFrames.add(frame);
            });
        });
        return Array.from(uniqueFrames);
    }, [
        preloadAnimations
    ]);
    const framesToLoad = preloadedFrames ?? animation.frames;
    const sourceTextures = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__G__as__useLoader$3e$__["useLoader"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextureLoader"], framesToLoad);
    const texturesByFrame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const byFrame = new Map();
        framesToLoad.forEach((frame, index)=>{
            const sourceTexture = sourceTextures[index];
            if (!sourceTexture) return;
            byFrame.set(frame, cloneTexture(sourceTexture));
        });
        return byFrame;
    }, [
        framesToLoad,
        sourceTextures
    ]);
    const textures = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>animation.frames.map((frame)=>texturesByFrame.get(frame)).filter((texture)=>Boolean(texture)), [
        animation.frames,
        texturesByFrame
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const initTexture = renderer.initTexture;
        if (!initTexture) return;
        texturesByFrame.forEach((texture)=>{
            initTexture(texture);
        });
    }, [
        renderer,
        texturesByFrame
    ]);
    const frameAspect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const image = textures[0]?.image;
        if (!image?.width || !image?.height) {
            return 1;
        }
        return image.width / image.height;
    }, [
        textures
    ]);
    const frameCursorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const frameTimeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const instanceId = spriteInstanceIdRef.current;
        logSpriteState("mount", {
            instanceId,
            preloadClipCount: preloadAnimations?.length ?? 1,
            loadedFrameCount: framesToLoad.length
        });
        return ()=>{
            logSpriteState("unmount", {
                instanceId
            });
        };
    }, [
        framesToLoad.length,
        preloadAnimations
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        logSpriteState("animation-change", {
            instanceId: spriteInstanceIdRef.current,
            fps: animation.fps,
            frameCount: animation.frames.length,
            firstFrame: animation.frames[0]
        });
    }, [
        animation
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        frameCursorRef.current = 0;
        frameTimeRef.current = 0;
        const firstTexture = textures[0];
        const material = materialRef.current;
        if (material && firstTexture) {
            material.map = firstTexture;
            material.needsUpdate = true;
        }
    }, [
        animation,
        textures
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, ()=>({
            nextFrame: ()=>{
                if (textures.length <= 1) {
                    return;
                }
                const clipLength = textures.length;
                frameCursorRef.current = animation.loop ?? true ? (frameCursorRef.current + 1) % clipLength : Math.min(frameCursorRef.current + 1, clipLength - 1);
                const material = materialRef.current;
                const nextTexture = textures[frameCursorRef.current];
                if (material && nextTexture) {
                    material.map = nextTexture;
                    material.needsUpdate = true;
                }
            }
        }), [
        animation.loop,
        textures
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])((_, delta)=>{
        if (isPaused || textures.length <= 1) {
            return;
        }
        frameTimeRef.current += delta;
        const stepTime = 1 / animation.fps;
        if (frameTimeRef.current < stepTime) {
            return;
        }
        const steps = Math.floor(frameTimeRef.current / stepTime);
        frameTimeRef.current -= steps * stepTime;
        frameCursorRef.current = animation.loop ?? true ? (frameCursorRef.current + steps) % textures.length : Math.min(frameCursorRef.current + steps, textures.length - 1);
        const material = materialRef.current;
        const nextTexture = textures[frameCursorRef.current];
        if (material && nextTexture) {
            material.map = nextTexture;
            material.needsUpdate = true;
        }
    });
    const [sx, sy, sz] = scale;
    const meshScale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            animation.flipX ? -Math.abs(sx) : Math.abs(sx),
            sy,
            sz
        ], [
        animation.flipX,
        sx,
        sy,
        sz
    ]);
    const planeWidth = 2 * frameAspect;
    const planeHeight = 2;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
        ref: targetRef,
        scale: meshScale,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("planeGeometry", {
                args: [
                    planeWidth,
                    planeHeight
                ]
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/lib/engine/render/sprite/DavidSprite.tsx",
                lineNumber: 221,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                ref: materialRef,
                map: textures[0],
                transparent: true,
                toneMapped: false,
                side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FrontSide"]
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/lib/engine/render/sprite/DavidSprite.tsx",
                lineNumber: 222,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web-demo/app/lib/engine/render/sprite/DavidSprite.tsx",
        lineNumber: 220,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
DavidSprite.displayName = "DavidSprite";
const __TURBOPACK__default__export__ = DavidSprite;
}),
"[project]/apps/web-demo/app/lib/engine/render/sprite/clips.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DAVE_IDLE_SPEAKING",
    ()=>DAVE_IDLE_SPEAKING,
    "DAVE_SPRITES",
    ()=>DAVE_SPRITES,
    "GAME_CHARACTERS",
    ()=>GAME_CHARACTERS,
    "GAME_CHARACTER_SPRITES",
    ()=>GAME_CHARACTER_SPRITES
]);
const DAVE_SPRITE_ROOT = "/assets/sprites/david";
const createFrameUrls = (prefix, count, startIndex = 1)=>Array.from({
        length: count
    }, (_, index)=>`${DAVE_SPRITE_ROOT}/${prefix}_${String(startIndex + index).padStart(4, "0")}.png`);
const DAVE_CHARACTER_SPRITES = {
    idle: {
        frames: [
            `${DAVE_SPRITE_ROOT}/david_idle.png`
        ],
        fps: 1,
        loop: true
    },
    north: {
        frames: createFrameUrls("david-walk-north", 9).slice().reverse(),
        fps: 16,
        loop: true
    },
    south: {
        frames: createFrameUrls("david-walk-south", 8, 3),
        fps: 16,
        loop: true
    },
    west: {
        frames: createFrameUrls("david-walk-west", 9).slice().reverse(),
        fps: 16,
        loop: true,
        flipX: true
    },
    east: {
        frames: createFrameUrls("david-walk-west", 9).slice().reverse(),
        fps: 16,
        loop: true
    }
};
const DAVE_IDLE_SPEAKING = {
    frames: createFrameUrls("david_speaking", 8),
    fps: 8,
    loop: true
};
const GAME_CHARACTERS = [
    {
        name: "Dave",
        column: 0,
        row: 0
    }
];
const GAME_CHARACTER_SPRITES = Object.fromEntries(GAME_CHARACTERS.map((character)=>[
        character.name,
        DAVE_CHARACTER_SPRITES
    ]));
const DAVE_SPRITES = DAVE_CHARACTER_SPRITES;
}),
"[project]/apps/web-demo/app/lib/engine/render/sprite/speakingAnimation.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildSpeakingAnimation",
    ()=>buildSpeakingAnimation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$render$2f$sprite$2f$clips$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/render/sprite/clips.ts [app-ssr] (ecmascript)");
;
const BASE_FRAMES = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$render$2f$sprite$2f$clips$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DAVE_IDLE_SPEAKING"].frames;
const FRAME_COUNT = BASE_FRAMES.length;
function buildSpeakingAnimation(seed, charsPerSecond) {
    const result = [];
    let pos = seed % FRAME_COUNT;
    // 6 chunks → roughly 15–20 frames before the loop point
    for(let chunk = 0; chunk < 6; chunk++){
        const chunkSize = 2 + (seed * 7 + chunk * 3) % 2; // 2 or 3
        const repeats = 1 + (seed * 5 + chunk * 11) % 2; // 1 or 2
        for(let r = 0; r < repeats; r++){
            for(let i = 0; i < chunkSize; i++){
                result.push(BASE_FRAMES[(pos + i) % FRAME_COUNT]);
            }
        }
        // Advance by chunkSize + a small irregular offset (1 or 2)
        const jump = chunkSize + 1 + (seed * 3 + chunk * 7) % 2;
        pos = (pos + jump) % FRAME_COUNT;
    }
    // Sync fps to text reveal speed: ~1 mouth move per 4 characters,
    // clamped so it always looks natural regardless of text speed.
    const fps = Math.max(4, Math.min(10, Math.round(charsPerSecond * 0.25)));
    return {
        frames: result,
        fps,
        loop: true
    };
}
}),
"[project]/apps/web-demo/app/lib/engine/movement/useClickToMoveController.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useClickToMoveController",
    ()=>useClickToMoveController
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
"use client";
;
;
const DEFAULT_CONFIG = {
    arrivalThreshold: 0.15,
    stuckMovementEpsilon: 0.015,
    stuckTimeoutMs: 550
};
function useClickToMoveController(config = {}) {
    const mergedConfig = {
        ...DEFAULT_CONFIG,
        ...config
    };
    const routeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const progressRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const cancelTarget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        routeRef.current = null;
        progressRef.current = null;
    }, []);
    const setTarget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((x, z)=>{
        routeRef.current = [
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](x, z)
        ];
        progressRef.current = null;
    }, []);
    const setRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((points)=>{
        routeRef.current = points.map((point)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](point.x, point.z));
        progressRef.current = null;
    }, []);
    const resolveDirection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((positionX, positionZ, delta, manualInputActive)=>{
        if (manualInputActive || !routeRef.current?.length) {
            if (manualInputActive) {
                cancelTarget();
            }
            return {
                horizontal: 0,
                vertical: 0
            };
        }
        let route = routeRef.current;
        const step = 2.5 * delta;
        while(route?.length){
            const currentTarget = route[0];
            const dx = currentTarget.x - positionX;
            const dz = currentTarget.y - positionZ;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist > step && dist >= mergedConfig.arrivalThreshold) {
                return {
                    horizontal: dx / dist,
                    vertical: dz / dist
                };
            }
            if (route.length === 1) {
                const snapToTarget = {
                    x: currentTarget.x,
                    z: currentTarget.y
                };
                cancelTarget();
                return {
                    horizontal: 0,
                    vertical: 0,
                    snapToTarget
                };
            }
            route = route.slice(1);
            routeRef.current = route;
            progressRef.current = null;
        }
        cancelTarget();
        return {
            horizontal: 0,
            vertical: 0
        };
    }, [
        cancelTarget,
        mergedConfig.arrivalThreshold
    ]);
    const registerProgress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((positionX, positionZ, delta, manualInputActive)=>{
        if (manualInputActive || !routeRef.current?.length) {
            progressRef.current = null;
            return {
                stuck: false
            };
        }
        const currentTarget = routeRef.current[0];
        const dx = currentTarget.x - positionX;
        const dz = currentTarget.y - positionZ;
        const distToTarget = Math.sqrt(dx * dx + dz * dz);
        if (distToTarget <= mergedConfig.arrivalThreshold) {
            progressRef.current = null;
            return {
                stuck: false
            };
        }
        const previousProgress = progressRef.current ?? {
            x: positionX,
            z: positionZ,
            stuckMs: 0
        };
        const moved = Math.hypot(positionX - previousProgress.x, positionZ - previousProgress.z);
        const nextProgress = {
            x: positionX,
            z: positionZ,
            stuckMs: moved < mergedConfig.stuckMovementEpsilon ? previousProgress.stuckMs + delta * 1000 : 0
        };
        progressRef.current = nextProgress;
        if (nextProgress.stuckMs >= mergedConfig.stuckTimeoutMs) {
            cancelTarget();
            return {
                stuck: true
            };
        }
        return {
            stuck: false
        };
    }, [
        cancelTarget,
        mergedConfig.arrivalThreshold,
        mergedConfig.stuckMovementEpsilon,
        mergedConfig.stuckTimeoutMs
    ]);
    return {
        setTarget,
        setRoute,
        cancelTarget,
        resolveDirection,
        registerProgress
    };
}
}),
"[project]/apps/web-demo/app/lib/engine/movement/useKeyboardMovementInput.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useKeyboardMovementInput",
    ()=>useKeyboardMovementInput
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/platform-web.ts [app-ssr] (ecmascript)");
"use client";
;
;
const MOVEMENT_KEYS = new Set([
    "arrowleft",
    "arrowright",
    "arrowup",
    "arrowdown",
    "a",
    "d",
    "w",
    "s"
]);
function useKeyboardMovementInput() {
    const keysPressedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Set());
    const clearPressedKeys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        keysPressedRef.current.clear();
    }, []);
    const getKeyboardMovement = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const pressed = keysPressedRef.current;
        const moveLeft = pressed.has("arrowleft") || pressed.has("a");
        const moveRight = pressed.has("arrowright") || pressed.has("d");
        const moveUp = pressed.has("arrowup") || pressed.has("w");
        const moveDown = pressed.has("arrowdown") || pressed.has("s");
        return {
            moveLeft,
            moveRight,
            moveUp,
            moveDown,
            anyKeyPressed: moveLeft || moveRight || moveUp || moveDown
        };
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleKeyDown = (event)=>{
            const keyboardEvent = event;
            const normalizedKey = keyboardEvent.key.toLowerCase();
            if (MOVEMENT_KEYS.has(normalizedKey)) {
                keyboardEvent.preventDefault();
                keysPressedRef.current.add(normalizedKey);
            }
        };
        const handleKeyUp = (event)=>{
            const keyboardEvent = event;
            const normalizedKey = keyboardEvent.key.toLowerCase();
            if (MOVEMENT_KEYS.has(normalizedKey)) {
                keyboardEvent.preventDefault();
                keysPressedRef.current.delete(normalizedKey);
            }
        };
        const disposeKeyDown = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserEnvironmentAdapter"].addWindowEventListener("keydown", handleKeyDown, {
            passive: false
        });
        const disposeKeyUp = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserEnvironmentAdapter"].addWindowEventListener("keyup", handleKeyUp, {
            passive: false
        });
        return ()=>{
            disposeKeyDown();
            disposeKeyUp();
        };
    }, []);
    return {
        clearPressedKeys,
        getKeyboardMovement
    };
}
}),
"[project]/apps/web-demo/app/lib/engine/movement/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$movement$2f$useClickToMoveController$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/movement/useClickToMoveController.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$movement$2f$useKeyboardMovementInput$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/movement/useKeyboardMovementInput.ts [app-ssr] (ecmascript)");
;
;
;
}),
"[project]/packages/engine-core/dist/game/logic/pathfinding/findPath.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "findPath",
    ()=>findPath
]);
const DEFAULT_CELL_SIZE = 0.9;
const DEFAULT_OBSTACLE_PADDING = 0.72;
const DEFAULT_SEGMENT_SAMPLE_STEP = 0.35;
const DEFAULT_MAX_ITERATIONS = 5000;
const NEIGHBOR_OFFSETS = [
    [
        -1,
        -1
    ],
    [
        -1,
        0
    ],
    [
        -1,
        1
    ],
    [
        0,
        -1
    ],
    [
        0,
        1
    ],
    [
        1,
        -1
    ],
    [
        1,
        0
    ],
    [
        1,
        1
    ]
];
function findPath({ start, goal, bounds, walls, interactions, cellSize = DEFAULT_CELL_SIZE, obstaclePadding = DEFAULT_OBSTACLE_PADDING, segmentSampleStep = DEFAULT_SEGMENT_SAMPLE_STEP, maxIterations = DEFAULT_MAX_ITERATIONS }) {
    const obstacles = [
        ...walls.map((wall)=>toObstacle(wall.position[0], wall.position[2], wall.halfSize[0], wall.halfSize[2], wall.rotationY)),
        ...interactions.filter((interaction)=>interaction.hasCollision).map((interaction)=>toObstacle(interaction.position[0], interaction.position[2], interaction.halfSize[0], interaction.halfSize[2], interaction.rotationY ?? 0))
    ];
    if (isSegmentClear(start, goal, bounds, obstacles, obstaclePadding, segmentSampleStep)) {
        return [
            goal
        ];
    }
    const width = Math.max(1, Math.floor((bounds.maxX - bounds.minX) / cellSize) + 1);
    const height = Math.max(1, Math.floor((bounds.maxZ - bounds.minZ) / cellSize) + 1);
    const blocked = new Array(width * height);
    for(let gridZ = 0; gridZ < height; gridZ += 1){
        for(let gridX = 0; gridX < width; gridX += 1){
            const point = gridToPoint(gridX, gridZ, bounds, cellSize);
            blocked[gridIndex(gridX, gridZ, width)] = isPointBlocked(point, bounds, obstacles, obstaclePadding);
        }
    }
    const startCell = findNearestOpenCell(pointToGrid(start, bounds, cellSize), width, height, blocked);
    const goalCell = findNearestOpenCell(pointToGrid(goal, bounds, cellSize), width, height, blocked);
    if (!startCell || !goalCell) {
        return null;
    }
    const startIndex = gridIndex(startCell.x, startCell.z, width);
    const goalIndex = gridIndex(goalCell.x, goalCell.z, width);
    const gScore = new Array(width * height).fill(Number.POSITIVE_INFINITY);
    const fScore = new Array(width * height).fill(Number.POSITIVE_INFINITY);
    const openSet = new Set([
        startIndex
    ]);
    const cameFrom = new Map();
    gScore[startIndex] = 0;
    fScore[startIndex] = heuristic(startCell, goalCell);
    let iterations = 0;
    while(openSet.size > 0 && iterations < maxIterations){
        iterations += 1;
        const currentIndex = findLowestScore(openSet, fScore);
        if (currentIndex == null) {
            break;
        }
        if (currentIndex === goalIndex) {
            const gridPath = reconstructPath(cameFrom, currentIndex, width);
            const rawPoints = [
                start,
                ...gridPath.map((cell)=>gridToPoint(cell.x, cell.z, bounds, cellSize)),
                goal
            ];
            return smoothPath(rawPoints, bounds, obstacles, obstaclePadding, segmentSampleStep);
        }
        openSet.delete(currentIndex);
        const currentCell = indexToGrid(currentIndex, width);
        for (const [offsetX, offsetZ] of NEIGHBOR_OFFSETS){
            const nextX = currentCell.x + offsetX;
            const nextZ = currentCell.z + offsetZ;
            if (nextX < 0 || nextX >= width || nextZ < 0 || nextZ >= height) {
                continue;
            }
            const neighborIndex = gridIndex(nextX, nextZ, width);
            if (blocked[neighborIndex]) {
                continue;
            }
            if (offsetX !== 0 && offsetZ !== 0) {
                const horizontalIndex = gridIndex(currentCell.x + offsetX, currentCell.z, width);
                const verticalIndex = gridIndex(currentCell.x, currentCell.z + offsetZ, width);
                if (blocked[horizontalIndex] || blocked[verticalIndex]) {
                    continue;
                }
            }
            const tentativeGScore = gScore[currentIndex] + Math.hypot(offsetX, offsetZ);
            if (tentativeGScore >= gScore[neighborIndex]) {
                continue;
            }
            cameFrom.set(neighborIndex, currentIndex);
            gScore[neighborIndex] = tentativeGScore;
            fScore[neighborIndex] = tentativeGScore + heuristic({
                x: nextX,
                z: nextZ
            }, goalCell);
            openSet.add(neighborIndex);
        }
    }
    return null;
}
function toObstacle(x, z, halfX, halfZ, rotationY) {
    return {
        x,
        z,
        halfX,
        halfZ,
        rotationY: rotationY ?? 0
    };
}
function pointToGrid(point, bounds, cellSize) {
    return {
        x: Math.round((point.x - bounds.minX) / cellSize),
        z: Math.round((point.z - bounds.minZ) / cellSize)
    };
}
function gridToPoint(gridX, gridZ, bounds, cellSize) {
    return {
        x: bounds.minX + gridX * cellSize,
        z: bounds.minZ + gridZ * cellSize
    };
}
function gridIndex(gridX, gridZ, width) {
    return gridZ * width + gridX;
}
function indexToGrid(index, width) {
    return {
        x: index % width,
        z: Math.floor(index / width)
    };
}
function findLowestScore(openSet, fScore) {
    let bestIndex = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const index of openSet){
        if (fScore[index] < bestScore) {
            bestScore = fScore[index];
            bestIndex = index;
        }
    }
    return bestIndex;
}
function heuristic(a, b) {
    return Math.hypot(a.x - b.x, a.z - b.z);
}
function reconstructPath(cameFrom, currentIndex, width) {
    const path = [
        indexToGrid(currentIndex, width)
    ];
    let cursor = currentIndex;
    while(cameFrom.has(cursor)){
        cursor = cameFrom.get(cursor);
        path.push(indexToGrid(cursor, width));
    }
    path.reverse();
    return path.slice(1, -1);
}
function smoothPath(points, bounds, obstacles, obstaclePadding, segmentSampleStep) {
    if (points.length <= 2) {
        return [
            points[points.length - 1]
        ];
    }
    const result = [];
    let anchorIndex = 0;
    while(anchorIndex < points.length - 1){
        let nextIndex = points.length - 1;
        while(nextIndex > anchorIndex + 1){
            if (isSegmentClear(points[anchorIndex], points[nextIndex], bounds, obstacles, obstaclePadding, segmentSampleStep)) {
                break;
            }
            nextIndex -= 1;
        }
        result.push(points[nextIndex]);
        anchorIndex = nextIndex;
    }
    return result;
}
function findNearestOpenCell(cell, width, height, blocked) {
    const clampedX = clamp(cell.x, 0, width - 1);
    const clampedZ = clamp(cell.z, 0, height - 1);
    const startIndex = gridIndex(clampedX, clampedZ, width);
    if (!blocked[startIndex]) {
        return {
            x: clampedX,
            z: clampedZ
        };
    }
    const maxRadius = Math.max(width, height);
    for(let radius = 1; radius < maxRadius; radius += 1){
        for(let offsetZ = -radius; offsetZ <= radius; offsetZ += 1){
            for(let offsetX = -radius; offsetX <= radius; offsetX += 1){
                if (Math.max(Math.abs(offsetX), Math.abs(offsetZ)) !== radius) {
                    continue;
                }
                const nextX = clampedX + offsetX;
                const nextZ = clampedZ + offsetZ;
                if (nextX < 0 || nextX >= width || nextZ < 0 || nextZ >= height) {
                    continue;
                }
                if (!blocked[gridIndex(nextX, nextZ, width)]) {
                    return {
                        x: nextX,
                        z: nextZ
                    };
                }
            }
        }
    }
    return null;
}
function isSegmentClear(start, goal, bounds, obstacles, obstaclePadding, segmentSampleStep) {
    const distance = Math.hypot(goal.x - start.x, goal.z - start.z);
    const samples = Math.max(1, Math.ceil(distance / segmentSampleStep));
    for(let index = 0; index <= samples; index += 1){
        const t = index / samples;
        const point = {
            x: lerp(start.x, goal.x, t),
            z: lerp(start.z, goal.z, t)
        };
        if (isPointBlocked(point, bounds, obstacles, obstaclePadding)) {
            return false;
        }
    }
    return true;
}
function isPointBlocked(point, bounds, obstacles, obstaclePadding) {
    if (point.x < bounds.minX || point.x > bounds.maxX || point.z < bounds.minZ || point.z > bounds.maxZ) {
        return true;
    }
    return obstacles.some((obstacle)=>isPointInsideObstacle(point, obstacle, obstaclePadding));
}
function isPointInsideObstacle(point, obstacle, obstaclePadding) {
    const localX = point.x - obstacle.x;
    const localZ = point.z - obstacle.z;
    const cos = Math.cos(-obstacle.rotationY);
    const sin = Math.sin(-obstacle.rotationY);
    const rotatedX = localX * cos - localZ * sin;
    const rotatedZ = localX * sin + localZ * cos;
    return Math.abs(rotatedX) <= obstacle.halfX + obstaclePadding && Math.abs(rotatedZ) <= obstacle.halfZ + obstaclePadding;
}
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function lerp(start, end, amount) {
    return start + (end - start) * amount;
}
}),
"[project]/apps/web-demo/app/store/mobileInputStore.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useMobileInputStore",
    ()=>useMobileInputStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
;
const useMobileInputStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set)=>({
        x: 0,
        z: 0,
        active: false,
        setAxes: (x, z)=>set({
                x,
                z,
                active: true
            }),
        deactivate: ()=>set({
                x: 0,
                z: 0,
                active: false
            })
    }));
}),
"[project]/apps/web-demo/app/demo/content/dialogs/index.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "dialogs",
    ()=>dialogs
]);
const dialogs = {
    es: {
        boundaryHit: {
            phrases: [
                "¡Aquí hay una pared invisible y yo sin gafas!",
                "¿Ves ese borde? Yo tampoco, pero duele.",
                "El mapa termina aquí. El programador fue muy vago.",
                "¡No hay nada más allá! Solo oscuridad y bugs.",
                "Mis piernas dicen que sí, el motor dice que no.",
                "He encontrado el fin del mundo. Sin spoilers.",
                "Prohibido el paso. Firma: El motor de físicas.",
                "¡Límite alcanzado! Esto no es un bug, es una feature.",
                "Aquí termina mi aventura... y mi dignidad.",
                "Esto es como intentar salir de Google Maps."
            ]
        },
        personalRoomWelcome: {
            phrases: [
                "¡Bienvenido a tu habitación personal! No olvides limpiar.",
                "Este es tu espacio. Hazlo tuyo, pero sin romper nada.",
                "¡Qué acogedor! ¿Es nueva la decoración?",
                "Tu habitación, tus reglas. Pero no te pases.",
                "¡Bienvenido! Aquí puedes ser tú mismo, o alguien más."
            ]
        },
        inventoryDropHit: {
            phrases: [
                "¡Exacto! El Gameboy va ahí.",
                "Perfecto, ese era el sitio.",
                "Bien colocado. Queda mejor ahí.",
                "Sí, ahí estaba esperando ese objeto."
            ]
        },
        inventoryDropMiss: {
            phrases: [
                "No, ese no es el sitio correcto.",
                "Casi, pero no va ahí.",
                "Eso no encaja en ese soporte.",
                "Prueba a soltarlo un poco más cerca del objetivo."
            ]
        },
        "item.gameboy.drop.personal-room-gameboy-drop-target.hit": {
            phrases: [
                "Perfecto, la Gameboy se queda colocada.",
                "Encaja de lujo. Queda puesta en el soporte."
            ]
        },
        "item.gameboy.drop.personal-room-gameboy-drop-target.miss": {
            phrases: [
                "No encaja en ese soporte.",
                "Ese no es el sitio de la Gameboy."
            ]
        },
        "item.gameboy.drop.default.miss": {
            phrases: [
                "La Gameboy vuelve al inventario.",
                "No se puede colocar ahí. La guardo otra vez."
            ]
        },
        "item.gameboy.pickup.personal-room-gameboy-drop-target.allowed": {
            phrases: [
                "Recogida. La Gameboy vuelve al inventario.",
                "La guardo en la mochila otra vez."
            ]
        },
        "item.gameboy.pickup.personal-room-gameboy-drop-target.blocked": {
            phrases: [
                "Esta Gameboy está fija. No se puede recoger.",
                "No sale del soporte, está bloqueada."
            ]
        },
        "item.gameboy.description": {
            phrases: [
                "Una Gameboy clásica. Pantalla monocroma, nostalgia instantánea y pilas que duran menos de lo que recuerdas.",
                "Mi Gameboy: portátil, retro y perfecta para perder la tarde en pixel-art."
            ]
        },
        "interaction.gameboy-base.empty": {
            phrases: [
                "Aquí falta algo. Un hueco con forma de nostalgia.",
                "Este soporte parece vacío... como mi agenda.",
                "Hmm, aquí debería haber algo. Lo noto en los píxeles.",
                "El soporte está solo. Igual que yo los domingos.",
                "Hay algo que encajaría perfectamente aquí.",
                "El soporte espera pacientemente. Tiene más paciencia que yo."
            ]
        },
        "interaction.gameboy-base.occupied": {
            phrases: [
                "La Gameboy descansa en su soporte. Como debe ser.",
                "Ahí está, bien colocada. El orden tiene su magia.",
                "La Gameboy en reposo. Lista para la próxima partida.",
                "Perfectamente colocada. Casi da pena moverla.",
                "Mira eso. Todo en su sitio. No suele pasar."
            ]
        }
    },
    en: {
        boundaryHit: {
            phrases: [
                "There's an invisible wall here and I forgot my glasses!",
                "See that edge? Me neither, but it hurts.",
                "The map ends here. The developer was very lazy.",
                "Nothing beyond this point! Just darkness and bugs.",
                "My legs say yes, the engine says no.",
                "I found the edge of the world. No spoilers.",
                "No trespassing. Signed: The physics engine.",
                "Limit reached! This is not a bug, it's a feature.",
                "My adventure ends here... and so does my dignity.",
                "This is like trying to leave Google Maps."
            ]
        },
        personalRoomWelcome: {
            phrases: [
                "Welcome to your personal room! Don't forget to clean up.",
                "This is your space. Make it yours, but don't break anything.",
                "So cozy! Is that new decor?",
                "Your room, your rules. But don't go overboard.",
                "Welcome! Be yourself here, or someone else."
            ]
        },
        inventoryDropHit: {
            phrases: [
                "Perfect. The Gameboy goes there.",
                "Exactly, that was the spot.",
                "Nicely placed. It fits there.",
                "Yes, that is where it wanted to be."
            ]
        },
        inventoryDropMiss: {
            phrases: [
                "No, that is not the right spot.",
                "Close, but it does not go there.",
                "That does not fit that support.",
                "Try dropping it a little closer to the target."
            ]
        },
        "item.gameboy.drop.personal-room-gameboy-drop-target.hit": {
            phrases: [
                "Perfect. The Gameboy stays placed there.",
                "Great fit. The Gameboy is now on the stand."
            ]
        },
        "item.gameboy.drop.personal-room-gameboy-drop-target.miss": {
            phrases: [
                "That does not fit this stand.",
                "That is not the correct spot for the Gameboy."
            ]
        },
        "item.gameboy.drop.default.miss": {
            phrases: [
                "The Gameboy goes back to the inventory.",
                "Cannot place it there. Returning it to the bag."
            ]
        },
        "item.gameboy.pickup.personal-room-gameboy-drop-target.allowed": {
            phrases: [
                "Picked up. The Gameboy is back in inventory.",
                "Got it. Putting the Gameboy back in the bag."
            ]
        },
        "item.gameboy.pickup.personal-room-gameboy-drop-target.blocked": {
            phrases: [
                "This Gameboy is fixed here. Cannot pick it up.",
                "It is locked to the stand."
            ]
        },
        "item.gameboy.description": {
            phrases: [
                "A classic Gameboy. Monochrome screen, instant nostalgia, and batteries that fade faster than you remember.",
                "My Gameboy: portable, retro, and perfect for a pixel-art afternoon."
            ]
        },
        "interaction.gameboy-base.empty": {
            phrases: [
                "Something is missing here. A gap shaped like nostalgia.",
                "This stand looks empty... like my schedule.",
                "Hmm, something should go here. I can feel it in the pixels.",
                "The stand is lonely. Just like me on Sundays.",
                "There is something that would fit perfectly here.",
                "The stand waits patiently. More patience than I have."
            ]
        },
        "interaction.gameboy-base.occupied": {
            phrases: [
                "The Gameboy rests on its stand. As it should.",
                "There it is, neatly placed. Order has its magic.",
                "The Gameboy at rest. Ready for the next session.",
                "Perfectly placed. Almost a shame to move it.",
                "Look at that. Everything in its place. Doesn't happen often."
            ]
        }
    }
};
}),
"[project]/apps/web-demo/app/demo/content/dialogs/getRandomPhrase.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getRandomPhrase",
    ()=>getRandomPhrase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$dialogs$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/demo/content/dialogs/index.ts [app-ssr] (ecmascript)");
;
function getRandomPhrase(key, locale = "es") {
    const dict = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$dialogs$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dialogs"][locale] ?? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$dialogs$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dialogs"].es;
    const entry = dict[key] ?? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$dialogs$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dialogs"].es[key];
    if (!entry || entry.phrases.length === 0) {
        return key;
    }
    const { phrases } = entry;
    return phrases[Math.floor(Math.random() * phrases.length)];
}
}),
"[project]/apps/web-demo/app/lib/engine/types/runtimeEvents.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "emitRuntimeEvent",
    ()=>emitRuntimeEvent
]);
function emitRuntimeEvent(handler, event) {
    if (!handler) return;
    handler(event);
}
}),
"[project]/apps/web-demo/app/lib/engine/render/scene/SceneCollisionSphere.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SceneCollisionSphere",
    ()=>SceneCollisionSphere
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__G__as__useLoader$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-ssr] (ecmascript) <export G as useLoader>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/rapier/dist/react-three-rapier.esm.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/game/state/sceneStore.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function SceneCollisionSphere() {
    const globeTexture = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__G__as__useLoader$3e$__["useLoader"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextureLoader"], "/globe.svg");
    const groundY = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.scene.ground.y);
    const posY = groundY + 0.1 + 0.5;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RigidBody"], {
        type: "dynamic",
        colliders: false,
        position: [
            -1.09,
            posY,
            13.01
        ],
        gravityScale: 1.2,
        linearDamping: 1.0,
        angularDamping: 0.8,
        ccd: true,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BallCollider"], {
                args: [
                    0.5
                ],
                friction: 1.5,
                restitution: 0.05
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneCollisionSphere.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                        args: [
                            0.5,
                            48,
                            48
                        ]
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneCollisionSphere.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                        map: globeTexture,
                        roughness: 0.55,
                        metalness: 0.02
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneCollisionSphere.tsx",
                        lineNumber: 27,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneCollisionSphere.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneCollisionSphere.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SceneGround",
    ()=>SceneGround
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/rapier/dist/react-three-rapier.esm.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/game/state/sceneStore.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const checkerVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const checkerFragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uCells;
  void main() {
    vec2 cell = floor(vUv * uCells);
    float checker = mod(cell.x + cell.y, 2.0);
    vec3 col = checker > 0.5 ? vec3(0.0, 1.0, 0.25) : vec3(0.0, 0.0, 0.0);
    float alpha = checker > 0.5 ? 0.28 : 0.04;
    gl_FragColor = vec4(col, alpha);
  }
`;
function SceneGround({ onClickWorld, onHoverWorld, debug, depthNearZ, depthFarZ }) {
    const ground = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.scene.ground);
    const width = ground.maxX - ground.minX;
    const depth = ground.maxZ - ground.minZ;
    const centerX = (ground.minX + ground.maxX) / 2;
    const centerZ = (ground.minZ + ground.maxZ) / 2;
    const segX = Math.round(width / 2);
    const segZ = Math.round(depth / 2);
    const gy = ground.y + 0.02;
    const t = 0.05;
    const borderWallHalfHeight = 3;
    const borderWallHalfThickness = 0.35;
    const borderWallCenterY = ground.y + borderWallHalfHeight;
    const cells = Math.max(segX, segZ);
    const checkerUniforms = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            uCells: {
                value: cells
            }
        }), [
        cells
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RigidBody"], {
                type: "fixed",
                position: [
                    centerX,
                    ground.y,
                    centerZ
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CuboidCollider"], {
                        args: [
                            width / 2,
                            0.2,
                            depth / 2
                        ],
                        friction: 2.8,
                        restitution: 0
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        rotation: [
                            -Math.PI / 2,
                            0,
                            0
                        ],
                        onPointerDown: (e)=>{
                            e.stopPropagation();
                            onClickWorld(e.point.x, e.point.z);
                        },
                        onPointerMove: (e)=>{
                            if (!onHoverWorld) return;
                            onHoverWorld(e.point.x, e.point.z);
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("planeGeometry", {
                                args: [
                                    width,
                                    depth
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 75,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                transparent: true,
                                opacity: 0,
                                depthWrite: false
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 76,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                        lineNumber: 64,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RigidBody"], {
                type: "fixed",
                position: [
                    centerX,
                    borderWallCenterY,
                    ground.minZ - borderWallHalfThickness
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CuboidCollider"], {
                    args: [
                        width / 2 + borderWallHalfThickness,
                        borderWallHalfHeight,
                        borderWallHalfThickness
                    ]
                }, void 0, false, {
                    fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                    lineNumber: 81,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                lineNumber: 80,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RigidBody"], {
                type: "fixed",
                position: [
                    centerX,
                    borderWallCenterY,
                    ground.maxZ + borderWallHalfThickness
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CuboidCollider"], {
                    args: [
                        width / 2 + borderWallHalfThickness,
                        borderWallHalfHeight,
                        borderWallHalfThickness
                    ]
                }, void 0, false, {
                    fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                    lineNumber: 84,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                lineNumber: 83,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RigidBody"], {
                type: "fixed",
                position: [
                    ground.minX - borderWallHalfThickness,
                    borderWallCenterY,
                    centerZ
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CuboidCollider"], {
                    args: [
                        borderWallHalfThickness,
                        borderWallHalfHeight,
                        depth / 2 + borderWallHalfThickness
                    ]
                }, void 0, false, {
                    fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                    lineNumber: 87,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RigidBody"], {
                type: "fixed",
                position: [
                    ground.maxX + borderWallHalfThickness,
                    borderWallCenterY,
                    centerZ
                ],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CuboidCollider"], {
                    args: [
                        borderWallHalfThickness,
                        borderWallHalfHeight,
                        depth / 2 + borderWallHalfThickness
                    ]
                }, void 0, false, {
                    fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                    lineNumber: 90,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this),
            debug && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        position: [
                            centerX,
                            gy,
                            centerZ
                        ],
                        rotation: [
                            -Math.PI / 2,
                            0,
                            0
                        ],
                        raycast: ()=>null,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("planeGeometry", {
                                args: [
                                    width,
                                    depth,
                                    segX,
                                    segZ
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 96,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("shaderMaterial", {
                                vertexShader: checkerVertexShader,
                                fragmentShader: checkerFragmentShader,
                                uniforms: checkerUniforms,
                                transparent: true,
                                depthWrite: false
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 97,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                        lineNumber: 95,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        position: [
                            centerX,
                            gy + 0.001,
                            centerZ
                        ],
                        rotation: [
                            -Math.PI / 2,
                            0,
                            0
                        ],
                        raycast: ()=>null,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("planeGeometry", {
                                args: [
                                    width,
                                    depth,
                                    segX,
                                    segZ
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 106,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                color: "#00ff41",
                                wireframe: true,
                                transparent: true,
                                opacity: 0.45,
                                depthWrite: false
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 107,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                        lineNumber: 105,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        position: [
                            centerX,
                            gy,
                            ground.minZ
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                args: [
                                    width + t,
                                    t,
                                    t
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 110,
                                columnNumber: 55
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                color: "#00ff88"
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 110,
                                columnNumber: 95
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                        lineNumber: 110,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        position: [
                            centerX,
                            gy,
                            ground.maxZ
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                args: [
                                    width + t,
                                    t,
                                    t
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 111,
                                columnNumber: 55
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                color: "#00ff88"
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 111,
                                columnNumber: 95
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                        lineNumber: 111,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        position: [
                            ground.minX,
                            gy,
                            centerZ
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                args: [
                                    t,
                                    t,
                                    depth
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 112,
                                columnNumber: 55
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                color: "#00ff88"
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 112,
                                columnNumber: 91
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                        lineNumber: 112,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        position: [
                            ground.maxX,
                            gy,
                            centerZ
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                args: [
                                    t,
                                    t,
                                    depth
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 113,
                                columnNumber: 55
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                color: "#00ff88"
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 113,
                                columnNumber: 91
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                        lineNumber: 113,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        position: [
                            ground.minX,
                            ground.y + 1.25,
                            ground.minZ
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                args: [
                                    t,
                                    2.5,
                                    t
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 115,
                                columnNumber: 72
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                color: "#ffff00"
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 115,
                                columnNumber: 106
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                        lineNumber: 115,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        position: [
                            ground.maxX,
                            ground.y + 1.25,
                            ground.minZ
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                args: [
                                    t,
                                    2.5,
                                    t
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 116,
                                columnNumber: 72
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                color: "#ffff00"
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 116,
                                columnNumber: 106
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                        lineNumber: 116,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        position: [
                            ground.minX,
                            ground.y + 1.25,
                            ground.maxZ
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                args: [
                                    t,
                                    2.5,
                                    t
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 117,
                                columnNumber: 72
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                color: "#ffff00"
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 117,
                                columnNumber: 106
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                        lineNumber: 117,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        position: [
                            ground.maxX,
                            ground.y + 1.25,
                            ground.maxZ
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                args: [
                                    t,
                                    2.5,
                                    t
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 118,
                                columnNumber: 72
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                color: "#ffff00"
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 118,
                                columnNumber: 106
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                        lineNumber: 118,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        position: [
                            centerX,
                            gy,
                            depthNearZ
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                args: [
                                    width,
                                    t,
                                    t
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 120,
                                columnNumber: 54
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                color: "#ff8800"
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 120,
                                columnNumber: 90
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                        lineNumber: 120,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        position: [
                            centerX,
                            gy,
                            depthFarZ
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                args: [
                                    width,
                                    t,
                                    t
                                ]
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 121,
                                columnNumber: 53
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                color: "#ff4400"
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                                lineNumber: 121,
                                columnNumber: 89
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx",
                        lineNumber: 121,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true);
}
}),
"[project]/apps/web-demo/app/lib/engine/render/scene/SceneWallPointPreview.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SceneWallPointPreview",
    ()=>SceneWallPointPreview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function SceneWallPointPreview({ preview, groundY }) {
    const pointPreviewLength = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!preview) return 0;
        return Math.sqrt((preview.end.x - preview.start.x) ** 2 + (preview.end.y - preview.start.y) ** 2);
    }, [
        preview
    ]);
    const pointPreviewMidX = preview ? (preview.start.x + preview.end.x) / 2 : 0;
    const pointPreviewMidZ = preview ? (preview.start.y + preview.end.y) / 2 : 0;
    const pointPreviewRotationY = preview ? -Math.atan2(preview.end.y - preview.start.y, preview.end.x - preview.start.x) : 0;
    if (!preview) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    preview.start.x,
                    groundY + 0.12,
                    preview.start.y
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                        args: [
                            0.22,
                            0.22,
                            0.22
                        ]
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWallPointPreview.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                        color: "#00ff41"
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWallPointPreview.tsx",
                        lineNumber: 35,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWallPointPreview.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    preview.end.x,
                    groundY + 0.12,
                    preview.end.y
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                        args: [
                            0.2,
                            0.2,
                            0.2
                        ]
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWallPointPreview.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                        color: "#00d8ff"
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWallPointPreview.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWallPointPreview.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            pointPreviewLength >= 0.01 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    pointPreviewMidX,
                    groundY + 0.1,
                    pointPreviewMidZ
                ],
                rotation: [
                    0,
                    pointPreviewRotationY,
                    0
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                        args: [
                            pointPreviewLength,
                            0.08,
                            0.08
                        ]
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWallPointPreview.tsx",
                        lineNumber: 43,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                        color: "#00d8ff",
                        transparent: true,
                        opacity: 0.85
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWallPointPreview.tsx",
                        lineNumber: 44,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWallPointPreview.tsx",
                lineNumber: 42,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/apps/web-demo/app/lib/engine/render/scene/SceneWalls.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SceneWalls",
    ()=>SceneWalls
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/rapier/dist/react-three-rapier.esm.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/game/state/sceneStore.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$sceneEditorStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/store/sceneEditorStore.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function SceneWalls({ debug, onStartWallMove, onStartWallResize }) {
    const walls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.scene.walls);
    const selectedWallIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$sceneEditorStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneEditorStore"])((s)=>s.selectedWallIndex);
    const selectWall = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$sceneEditorStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneEditorStore"])((s)=>s.selectWall);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: walls.map((wall, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RigidBody"], {
                type: "fixed",
                position: wall.position,
                rotation: [
                    0,
                    wall.rotationY ?? 0,
                    0
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CuboidCollider"], {
                        args: wall.halfSize
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWalls.tsx",
                        lineNumber: 28,
                        columnNumber: 11
                    }, this),
                    debug && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                onPointerDown: (e)=>{
                                    e.stopPropagation();
                                    selectWall(i);
                                    onStartWallMove(i, e.point.x, e.point.z);
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                        args: [
                                            wall.halfSize[0] * 2,
                                            wall.halfSize[1] * 2,
                                            wall.halfSize[2] * 2
                                        ]
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWalls.tsx",
                                        lineNumber: 38,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                        color: selectedWallIndex === i ? "#ffff00" : "#ff4400",
                                        wireframe: true
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWalls.tsx",
                                        lineNumber: 39,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWalls.tsx",
                                lineNumber: 31,
                                columnNumber: 15
                            }, this),
                            selectedWallIndex === i && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        position: [
                                            wall.halfSize[0],
                                            0,
                                            0
                                        ],
                                        onPointerDown: (e)=>{
                                            e.stopPropagation();
                                            onStartWallResize(i, "x+");
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                                args: [
                                                    0.35,
                                                    0.35,
                                                    0.35
                                                ]
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWalls.tsx",
                                                lineNumber: 51,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                                color: "#00d8ff"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWalls.tsx",
                                                lineNumber: 52,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWalls.tsx",
                                        lineNumber: 44,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        position: [
                                            -wall.halfSize[0],
                                            0,
                                            0
                                        ],
                                        onPointerDown: (e)=>{
                                            e.stopPropagation();
                                            onStartWallResize(i, "x-");
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                                args: [
                                                    0.35,
                                                    0.35,
                                                    0.35
                                                ]
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWalls.tsx",
                                                lineNumber: 61,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                                color: "#00d8ff"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWalls.tsx",
                                                lineNumber: 62,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWalls.tsx",
                                        lineNumber: 54,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        position: [
                                            0,
                                            0,
                                            wall.halfSize[2]
                                        ],
                                        onPointerDown: (e)=>{
                                            e.stopPropagation();
                                            onStartWallResize(i, "z+");
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                                args: [
                                                    0.35,
                                                    0.35,
                                                    0.35
                                                ]
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWalls.tsx",
                                                lineNumber: 71,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                                color: "#ff00aa"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWalls.tsx",
                                                lineNumber: 72,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWalls.tsx",
                                        lineNumber: 64,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                        position: [
                                            0,
                                            0,
                                            -wall.halfSize[2]
                                        ],
                                        onPointerDown: (e)=>{
                                            e.stopPropagation();
                                            onStartWallResize(i, "z-");
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                                                args: [
                                                    0.35,
                                                    0.35,
                                                    0.35
                                                ]
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWalls.tsx",
                                                lineNumber: 81,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                                color: "#ff00aa"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWalls.tsx",
                                                lineNumber: 82,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWalls.tsx",
                                        lineNumber: 74,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true)
                ]
            }, i, true, {
                fileName: "[project]/apps/web-demo/app/lib/engine/render/scene/SceneWalls.tsx",
                lineNumber: 27,
                columnNumber: 9
            }, this))
    }, void 0, false);
}
}),
"[project]/apps/web-demo/app/lib/engine/runtime/GameTouchSpriteRuntime.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GameTouchSpriteRuntime",
    ()=>GameTouchSpriteRuntime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-ssr] (ecmascript) <export D as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/rapier/dist/react-three-rapier.esm.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$render$2f$SpeechBubble$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/render/SpeechBubble.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$render$2f$sprite$2f$DavidSprite$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/render/sprite/DavidSprite.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$render$2f$sprite$2f$clips$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/render/sprite/clips.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$render$2f$sprite$2f$speakingAnimation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/render/sprite/speakingAnimation.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$movement$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/movement/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$logic$2f$pathfinding$2f$findPath$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/game/logic/pathfinding/findPath.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$movement$2f$useClickToMoveController$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/movement/useClickToMoveController.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$movement$2f$useKeyboardMovementInput$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/movement/useKeyboardMovementInput.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$mobileInputStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/store/mobileInputStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/game/state/sceneStore.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$sceneEditorStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/store/sceneEditorStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$dialogs$2f$getRandomPhrase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/demo/content/dialogs/getRandomPhrase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/platform-web.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$types$2f$runtimeEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/types/runtimeEvents.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$render$2f$scene$2f$SceneCollisionSphere$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/render/scene/SceneCollisionSphere.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$render$2f$scene$2f$SceneGround$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/render/scene/SceneGround.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$render$2f$scene$2f$SceneWallPointPreview$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/render/scene/SceneWallPointPreview.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$render$2f$scene$2f$SceneWalls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/render/scene/SceneWalls.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const VERTICAL_ANGLE_THRESHOLD = 55 * (Math.PI / 180);
const DEPTH_FAR_Z = -16;
const DEPTH_NEAR_Z = 8;
const SPRITE_MIN_SCALE = 1.4;
const SPRITE_MAX_SCALE = 2.94;
const MIN_WALL_HALF_EXTENT = 0.15;
const PLAYER_BOUND_MARGIN = 1.55;
const BOUNDARY_HIT_COOLDOWN_MS = 4000;
const CAMERA_POSITION = [
    0,
    5.4,
    25.0
];
const CAMERA_FRONT_PLAYABLE_MARGIN = 1.2;
const MOVEMENT_INPUT_DEADZONE = 0.12;
const SHOULD_LOG_STATE_TRANSITIONS = ("TURBOPACK compile-time value", "development") !== "production";
const DEV_DUPLICATE_RESET_WINDOW_MS = 500;
let lastRuntimeResetSnapshot = null;
function logRuntimeState(event, payload) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    console.info(`[runtime-state] ${event}`, payload);
}
function applyDeadzone(value, threshold) {
    return Math.abs(value) < threshold ? 0 : value;
}
function resolveAction(horizontal, vertical) {
    if (horizontal === 0 && vertical === 0) return "idle";
    const angle = Math.atan2(Math.abs(vertical), Math.abs(horizontal));
    if (angle >= VERTICAL_ANGLE_THRESHOLD) {
        return vertical < 0 ? "north" : "south";
    }
    return horizontal < 0 ? "west" : "east";
}
function getWallAxes(rotationY) {
    return {
        axisX: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](Math.cos(rotationY), -Math.sin(rotationY)),
        axisZ: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](Math.sin(rotationY), Math.cos(rotationY))
    };
}
function projectDistance(originX, originZ, pointX, pointZ, axis) {
    return (pointX - originX) * axis.x + (pointZ - originZ) * axis.y;
}
function GameTouchSpriteRuntime({ activeCharacter, debug, showDebugGround, showDebugWalls, wallToolMode, wallPointResetSignal, speechText, speechVisible, speechTrigger, speechCharsPerSecond, onBoundaryHit, onSpeechDismiss, onRuntimeEvent }) {
    const spriteRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const meshRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const characterBodyRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const currentActionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])("idle");
    const currentInputModeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])("auto");
    const hadManualInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const lastPublishedPositionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const lastResetRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [action, setAction] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [wallPointPreviewState, setWallPointPreviewState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const wallInteractionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const wallPointStartRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const lastBoundaryHitRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const lastStuckHitRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const playerSpawn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.scene.playerSpawn);
    const sceneId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.sceneId);
    const ground = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.scene.ground);
    const setPlayerPosition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.setPlayerPosition);
    const addWallWithData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$sceneEditorStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneEditorStore"])((s)=>s.addWallWithData);
    const respawnSignal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.respawnSignal);
    const { setTarget, setRoute, cancelTarget, resolveDirection, registerProgress } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$movement$2f$useClickToMoveController$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useClickToMoveController"])();
    const { clearPressedKeys, getKeyboardMovement } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$movement$2f$useKeyboardMovementInput$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useKeyboardMovementInput"])();
    const playableBounds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const minX = ground.minX + PLAYER_BOUND_MARGIN;
        const maxX = ground.maxX - PLAYER_BOUND_MARGIN;
        const minZ = ground.minZ + PLAYER_BOUND_MARGIN;
        const maxZByGround = ground.maxZ - PLAYER_BOUND_MARGIN;
        const maxZByCamera = CAMERA_POSITION[2] - CAMERA_FRONT_PLAYABLE_MARGIN;
        const maxZ = Math.min(maxZByGround, maxZByCamera);
        return {
            minX: Math.min(minX, maxX),
            maxX: Math.max(minX, maxX),
            minZ: Math.min(minZ, maxZ),
            maxZ: Math.max(minZ, maxZ)
        };
    }, [
        ground.maxX,
        ground.maxZ,
        ground.minX,
        ground.minZ
    ]);
    const clampToPlayableArea = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((x, z)=>{
        return {
            x: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].clamp(x, playableBounds.minX, playableBounds.maxX),
            z: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].clamp(z, playableBounds.minZ, playableBounds.maxZ)
        };
    }, [
        playableBounds.maxX,
        playableBounds.maxZ,
        playableBounds.minX,
        playableBounds.minZ
    ]);
    const handleClickWorld = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((x, z)=>{
        if (wallInteractionRef.current) return;
        if (debug && wallToolMode === "points") {
            const clamped = clampToPlayableArea(x, z);
            const clickedPoint = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](clamped.x, clamped.z);
            const startPoint = wallPointStartRef.current?.resetSignal === wallPointResetSignal ? wallPointStartRef.current.point : null;
            if (!startPoint) {
                wallPointStartRef.current = {
                    point: clickedPoint,
                    resetSignal: wallPointResetSignal
                };
                setWallPointPreviewState({
                    start: clickedPoint,
                    end: clickedPoint,
                    resetSignal: wallPointResetSignal
                });
                return;
            }
            const dx = clickedPoint.x - startPoint.x;
            const dz = clickedPoint.y - startPoint.y;
            const length = Math.sqrt(dx * dx + dz * dz);
            if (length < MIN_WALL_HALF_EXTENT * 2) {
                setWallPointPreviewState({
                    start: startPoint,
                    end: clickedPoint,
                    resetSignal: wallPointResetSignal
                });
                return;
            }
            const halfHeight = 2;
            const halfThickness = 0.25;
            const centerX = (startPoint.x + clickedPoint.x) / 2;
            const centerZ = (startPoint.y + clickedPoint.y) / 2;
            const rotationY = -Math.atan2(dz, dx);
            addWallWithData({
                position: [
                    centerX,
                    ground.y + halfHeight,
                    centerZ
                ],
                rotationY,
                halfSize: [
                    Math.max(MIN_WALL_HALF_EXTENT, length / 2),
                    halfHeight,
                    halfThickness
                ]
            });
            wallPointStartRef.current = {
                point: clickedPoint,
                resetSignal: wallPointResetSignal
            };
            setWallPointPreviewState({
                start: clickedPoint,
                end: clickedPoint,
                resetSignal: wallPointResetSignal
            });
            return;
        }
        const clamped = clampToPlayableArea(x, z);
        const body = characterBodyRef.current;
        const scene = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"].getState().scene;
        const startPosition = body?.translation() ?? {
            x: playerSpawn[0],
            z: playerSpawn[2]
        };
        const route = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$logic$2f$pathfinding$2f$findPath$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findPath"])({
            start: {
                x: startPosition.x,
                z: startPosition.z
            },
            goal: clamped,
            bounds: playableBounds,
            walls: scene.walls,
            interactions: scene.interactions
        });
        if (route && route.length > 0) {
            setRoute(route);
            return;
        }
        setTarget(clamped.x, clamped.z);
    }, [
        addWallWithData,
        clampToPlayableArea,
        debug,
        ground.y,
        playableBounds,
        playerSpawn,
        setRoute,
        setTarget,
        wallPointResetSignal,
        wallToolMode
    ]);
    const stopWallInteraction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        wallInteractionRef.current = null;
    }, []);
    const handleStartWallMove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((index, pointX, pointZ)=>{
        const wall = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"].getState().scene.walls[index];
        if (!wall) return;
        wallInteractionRef.current = {
            mode: "move",
            offsetX: pointX - wall.position[0],
            offsetZ: pointZ - wall.position[2]
        };
    }, []);
    const handleStartWallResize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((index, handle)=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$sceneEditorStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneEditorStore"].getState().selectWall(index);
        wallInteractionRef.current = {
            mode: "resize",
            handle
        };
    }, []);
    const handleHoverWorld = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((x, z)=>{
        const interaction = wallInteractionRef.current;
        if (!interaction) return;
        const sceneState = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"].getState();
        const editorState = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$sceneEditorStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneEditorStore"].getState();
        const selectedWallIndex = editorState.selectedWallIndex;
        if (selectedWallIndex == null) return;
        const wall = sceneState.scene.walls[selectedWallIndex];
        if (!wall) return;
        if (interaction.mode === "move") {
            editorState.updateSelectedWall((currentWall)=>({
                    ...currentWall,
                    position: [
                        x - interaction.offsetX,
                        sceneState.scene.ground.y + currentWall.halfSize[1],
                        z - interaction.offsetZ
                    ]
                }));
            return;
        }
        const rotationY = wall.rotationY ?? 0;
        const { axisX, axisZ } = getWallAxes(rotationY);
        const centerX = wall.position[0];
        const centerZ = wall.position[2];
        editorState.updateSelectedWall((currentWall)=>{
            const currentRotation = currentWall.rotationY ?? 0;
            const axes = getWallAxes(currentRotation);
            let nextPosition = [
                ...currentWall.position
            ];
            const nextHalfSize = [
                ...currentWall.halfSize
            ];
            if (interaction.handle === "x+") {
                const anchorX = centerX - axisX.x * wall.halfSize[0];
                const anchorZ = centerZ - axisX.y * wall.halfSize[0];
                const extent = Math.max(MIN_WALL_HALF_EXTENT * 2, projectDistance(anchorX, anchorZ, x, z, axes.axisX));
                const half = extent / 2;
                nextHalfSize[0] = half;
                nextPosition = [
                    anchorX + axes.axisX.x * half,
                    currentWall.position[1],
                    anchorZ + axes.axisX.y * half
                ];
            } else if (interaction.handle === "x-") {
                const negativeAxisX = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](-axes.axisX.x, -axes.axisX.y);
                const anchorX = centerX + axes.axisX.x * wall.halfSize[0];
                const anchorZ = centerZ + axes.axisX.y * wall.halfSize[0];
                const extent = Math.max(MIN_WALL_HALF_EXTENT * 2, projectDistance(anchorX, anchorZ, x, z, negativeAxisX));
                const half = extent / 2;
                nextHalfSize[0] = half;
                nextPosition = [
                    anchorX + negativeAxisX.x * half,
                    currentWall.position[1],
                    anchorZ + negativeAxisX.y * half
                ];
            } else if (interaction.handle === "z+") {
                const anchorX = centerX - axisZ.x * wall.halfSize[2];
                const anchorZ = centerZ - axisZ.y * wall.halfSize[2];
                const extent = Math.max(MIN_WALL_HALF_EXTENT * 2, projectDistance(anchorX, anchorZ, x, z, axes.axisZ));
                const half = extent / 2;
                nextHalfSize[2] = half;
                nextPosition = [
                    anchorX + axes.axisZ.x * half,
                    currentWall.position[1],
                    anchorZ + axes.axisZ.y * half
                ];
            } else if (interaction.handle === "z-") {
                const negativeAxisZ = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](-axes.axisZ.x, -axes.axisZ.y);
                const anchorX = centerX + axes.axisZ.x * wall.halfSize[2];
                const anchorZ = centerZ + axes.axisZ.y * wall.halfSize[2];
                const extent = Math.max(MIN_WALL_HALF_EXTENT * 2, projectDistance(anchorX, anchorZ, x, z, negativeAxisZ));
                const half = extent / 2;
                nextHalfSize[2] = half;
                nextPosition = [
                    anchorX + negativeAxisZ.x * half,
                    currentWall.position[1],
                    anchorZ + negativeAxisZ.y * half
                ];
            }
            return {
                ...currentWall,
                position: nextPosition,
                halfSize: nextHalfSize
            };
        });
    }, []);
    const handleHoverPointWallTool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((x, z)=>{
        if (!debug || wallToolMode !== "points") return;
        const startPoint = wallPointStartRef.current?.resetSignal === wallPointResetSignal ? wallPointStartRef.current.point : null;
        if (!startPoint) return;
        const clamped = clampToPlayableArea(x, z);
        setWallPointPreviewState({
            start: startPoint,
            end: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](clamped.x, clamped.z),
            resetSignal: wallPointResetSignal
        });
    }, [
        clampToPlayableArea,
        debug,
        wallPointResetSignal,
        wallToolMode
    ]);
    const characterClips = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$render$2f$sprite$2f$clips$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GAME_CHARACTER_SPRITES"][activeCharacter], [
        activeCharacter
    ]);
    const characterAnimations = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            ...Object.values(characterClips),
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$render$2f$sprite$2f$clips$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DAVE_IDLE_SPEAKING"]
        ], [
        characterClips
    ]);
    const activeAnimation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>speechVisible && action === "idle" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$render$2f$sprite$2f$speakingAnimation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildSpeakingAnimation"])(speechTrigger, speechCharsPerSecond) : characterClips[action], [
        speechVisible,
        action,
        characterClips,
        speechTrigger,
        speechCharsPerSecond
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const body = characterBodyRef.current;
        if (!body) return;
        const spawn = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"].getState().scene.playerSpawn;
        const previousReset = lastResetRef.current;
        const reason = !previousReset ? "initial-mount" : previousReset.sceneId !== sceneId ? "scene-change" : "respawn";
        logRuntimeState("player-reset", {
            reason,
            sceneId,
            respawnSignal,
            spawn
        });
        const now = Date.now();
        const duplicateDevMountReset = SHOULD_LOG_STATE_TRANSITIONS && (reason === "initial-mount" || reason === "respawn") && lastRuntimeResetSnapshot != null && now - lastRuntimeResetSnapshot.at < DEV_DUPLICATE_RESET_WINDOW_MS && lastRuntimeResetSnapshot.sceneId === sceneId && lastRuntimeResetSnapshot.respawnSignal === respawnSignal && lastRuntimeResetSnapshot.spawn[0] === spawn[0] && lastRuntimeResetSnapshot.spawn[1] === spawn[1] && lastRuntimeResetSnapshot.spawn[2] === spawn[2];
        if (duplicateDevMountReset) {
            logRuntimeState("player-reset-skipped", {
                reason: "duplicate-dev-reset",
                originalReason: reason,
                sceneId,
                respawnSignal,
                spawn
            });
            lastResetRef.current = {
                sceneId,
                respawnSignal
            };
            return;
        }
        body.setTranslation({
            x: spawn[0],
            y: spawn[1],
            z: spawn[2]
        }, true);
        body.setLinvel({
            x: 0,
            y: 0,
            z: 0
        }, true);
        cancelTarget();
        clearPressedKeys();
        setPlayerPosition([
            spawn[0],
            spawn[1],
            spawn[2]
        ]);
        lastPublishedPositionRef.current = {
            x: spawn[0],
            y: spawn[1],
            z: spawn[2]
        };
        lastResetRef.current = {
            sceneId,
            respawnSignal
        };
        lastRuntimeResetSnapshot = {
            sceneId,
            respawnSignal,
            spawn: [
                spawn[0],
                spawn[1],
                spawn[2]
            ],
            at: now
        };
    }, [
        cancelTarget,
        clearPressedKeys,
        sceneId,
        respawnSignal,
        setPlayerPosition
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserEnvironmentAdapter"].addWindowEventListener("pointerup", stopWallInteraction);
    }, [
        stopWallInteraction
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])((_, delta)=>{
        const body = characterBodyRef.current;
        if (!body) {
            return;
        }
        const { moveLeft, moveRight, moveUp, moveDown, anyKeyPressed } = getKeyboardMovement();
        const joystick = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$store$2f$mobileInputStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMobileInputStore"].getState();
        const manualInputActive = anyKeyPressed || joystick.active;
        const nextInputMode = joystick.active ? "joystick" : anyKeyPressed ? "keyboard" : "auto";
        if (currentInputModeRef.current !== nextInputMode) {
            logRuntimeState("input-mode-change", {
                from: currentInputModeRef.current,
                to: nextInputMode,
                sceneId
            });
            currentInputModeRef.current = nextInputMode;
        }
        // El primer input manual debe invalidar cualquier ruta pendiente de click-to-move.
        if (manualInputActive && !hadManualInputRef.current) {
            cancelTarget();
            logRuntimeState("click-move-cancelled", {
                reason: "manual-input",
                inputMode: nextInputMode,
                sceneId
            });
        }
        hadManualInputRef.current = manualInputActive;
        let horizontal = 0;
        let vertical = 0;
        if (joystick.active) {
            horizontal = joystick.x;
            vertical = joystick.z;
        } else if (anyKeyPressed) {
            horizontal = Number(moveRight) - Number(moveLeft);
            vertical = Number(moveDown) - Number(moveUp);
        } else {
            const currentPosition = body.translation();
            const autoMove = resolveDirection(currentPosition.x, currentPosition.z, delta, manualInputActive);
            horizontal = autoMove.horizontal;
            vertical = autoMove.vertical;
            if (autoMove.snapToTarget) {
                body.setTranslation({
                    x: autoMove.snapToTarget.x,
                    y: currentPosition.y,
                    z: autoMove.snapToTarget.z
                }, true);
            }
        }
        horizontal = applyDeadzone(horizontal, MOVEMENT_INPUT_DEADZONE);
        vertical = applyDeadzone(vertical, MOVEMENT_INPUT_DEADZONE);
        const nextAction = resolveAction(horizontal, vertical);
        if (currentActionRef.current !== nextAction) {
            logRuntimeState("action-change", {
                from: currentActionRef.current,
                to: nextAction,
                inputMode: currentInputModeRef.current,
                sceneId
            });
            currentActionRef.current = nextAction;
            setAction(nextAction);
        }
        const speed = 7;
        const currentVelocity = body.linvel();
        const verticalSpeed = vertical !== 0 ? speed * 3 : speed;
        const targetVelocity = {
            x: horizontal * speed,
            y: currentVelocity.y,
            z: vertical * verticalSpeed
        };
        if (horizontal === 0 && vertical === 0) {
            body.setLinvel({
                x: 0,
                y: currentVelocity.y,
                z: 0
            }, true);
        } else {
            body.setLinvel(targetVelocity, true);
        }
        const currentPosition = body.translation();
        const clampedPosition = clampToPlayableArea(currentPosition.x, currentPosition.z);
        const wasClampedX = clampedPosition.x !== currentPosition.x;
        const wasClampedZ = clampedPosition.z !== currentPosition.z;
        if (wasClampedX || wasClampedZ) {
            body.setTranslation({
                x: clampedPosition.x,
                y: currentPosition.y,
                z: clampedPosition.z
            }, true);
            const vel = body.linvel();
            body.setLinvel({
                x: wasClampedX ? currentPosition.x > clampedPosition.x ? Math.min(0, vel.x) : Math.max(0, vel.x) : vel.x,
                y: vel.y,
                z: wasClampedZ ? currentPosition.z > clampedPosition.z ? Math.min(0, vel.z) : Math.max(0, vel.z) : vel.z
            }, true);
            const now = performance.now();
            if (now - lastBoundaryHitRef.current > BOUNDARY_HIT_COOLDOWN_MS) {
                lastBoundaryHitRef.current = now;
                const phrase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$dialogs$2f$getRandomPhrase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRandomPhrase"])("boundaryHit");
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$types$2f$runtimeEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emitRuntimeEvent"])(onRuntimeEvent, {
                    type: "onCollide",
                    reason: "boundary",
                    position: [
                        clampedPosition.x,
                        currentPosition.y,
                        clampedPosition.z
                    ]
                });
                onBoundaryHit(phrase);
            }
        }
        const safePosition = body.translation();
        const { stuck } = registerProgress(safePosition.x, safePosition.z, delta, manualInputActive);
        if (stuck) {
            const vel = body.linvel();
            body.setLinvel({
                x: 0,
                y: vel.y,
                z: 0
            }, true);
            const now = performance.now();
            if (now - lastStuckHitRef.current > BOUNDARY_HIT_COOLDOWN_MS) {
                lastStuckHitRef.current = now;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$types$2f$runtimeEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emitRuntimeEvent"])(onRuntimeEvent, {
                    type: "onCollide",
                    reason: "stuck",
                    position: [
                        safePosition.x,
                        safePosition.y,
                        safePosition.z
                    ]
                });
            }
        }
        const depthFactor = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].clamp(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].inverseLerp(DEPTH_FAR_Z, DEPTH_NEAR_Z, safePosition.z), 0, 1);
        const roundedX = Number(safePosition.x.toFixed(2));
        const roundedY = Number(safePosition.y.toFixed(2));
        const roundedZ = Number(safePosition.z.toFixed(2));
        const lastLogged = lastPublishedPositionRef.current;
        if (!lastLogged || lastLogged.x !== roundedX || lastLogged.y !== roundedY || lastLogged.z !== roundedZ) {
            lastPublishedPositionRef.current = {
                x: roundedX,
                y: roundedY,
                z: roundedZ
            };
            setPlayerPosition([
                roundedX,
                roundedY,
                roundedZ
            ]);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$types$2f$runtimeEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emitRuntimeEvent"])(onRuntimeEvent, {
                type: "onMove",
                position: [
                    roundedX,
                    roundedY,
                    roundedZ
                ],
                action: nextAction
            });
        }
        const spriteScale = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].lerp(SPRITE_MIN_SCALE, SPRITE_MAX_SCALE, depthFactor);
        if (meshRef.current) {
            const flipX = action === "west" ? -1 : 1;
            meshRef.current.scale.set(spriteScale * flipX, spriteScale, 1);
            meshRef.current.position.y = spriteScale - 0.95;
        }
    });
    const wallPointPreview = debug && wallToolMode === "points" && wallPointPreviewState?.resetSignal === wallPointResetSignal ? wallPointPreviewState : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$render$2f$scene$2f$SceneGround$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SceneGround"], {
                onClickWorld: handleClickWorld,
                onHoverWorld: debug ? (x, z)=>{
                    handleHoverWorld(x, z);
                    handleHoverPointWallTool(x, z);
                } : undefined,
                debug: debug && showDebugGround,
                depthNearZ: DEPTH_NEAR_Z,
                depthFarZ: DEPTH_FAR_Z
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/lib/engine/runtime/GameTouchSpriteRuntime.tsx",
                lineNumber: 613,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$render$2f$scene$2f$SceneWalls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SceneWalls"], {
                debug: debug && showDebugWalls,
                onStartWallMove: handleStartWallMove,
                onStartWallResize: handleStartWallResize
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/lib/engine/runtime/GameTouchSpriteRuntime.tsx",
                lineNumber: 627,
                columnNumber: 7
            }, this),
            debug && wallToolMode === "points" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$render$2f$scene$2f$SceneWallPointPreview$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SceneWallPointPreview"], {
                preview: wallPointPreview,
                groundY: ground.y
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/lib/engine/runtime/GameTouchSpriteRuntime.tsx",
                lineNumber: 629,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$render$2f$scene$2f$SceneCollisionSphere$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SceneCollisionSphere"], {}, void 0, false, {
                fileName: "[project]/apps/web-demo/app/lib/engine/runtime/GameTouchSpriteRuntime.tsx",
                lineNumber: 631,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RigidBody"], {
                ref: characterBodyRef,
                type: "dynamic",
                colliders: false,
                position: playerSpawn,
                gravityScale: 1.2,
                linearDamping: 7,
                angularDamping: 20,
                ccd: true,
                enabledRotations: [
                    false,
                    false,
                    false
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CuboidCollider"], {
                        args: [
                            0.55,
                            0.95,
                            0.18
                        ],
                        friction: 2.2,
                        restitution: 0
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/runtime/GameTouchSpriteRuntime.tsx",
                        lineNumber: 643,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$render$2f$sprite$2f$DavidSprite$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        ref: spriteRef,
                        meshRef: meshRef,
                        animation: activeAnimation,
                        preloadAnimations: characterAnimations,
                        scale: [
                            SPRITE_MIN_SCALE,
                            SPRITE_MIN_SCALE,
                            1
                        ],
                        isPaused: false
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/runtime/GameTouchSpriteRuntime.tsx",
                        lineNumber: 644,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$render$2f$SpeechBubble$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        text: speechText,
                        visible: speechVisible,
                        trigger: speechTrigger,
                        charsPerSecond: speechCharsPerSecond,
                        onDismiss: onSpeechDismiss
                    }, speechTrigger, false, {
                        fileName: "[project]/apps/web-demo/app/lib/engine/runtime/GameTouchSpriteRuntime.tsx",
                        lineNumber: 652,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/lib/engine/runtime/GameTouchSpriteRuntime.tsx",
                lineNumber: 632,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/apps/web-demo/app/lib/engine/runtime/useProximityHintController.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useProximityHintController",
    ()=>useProximityHintController
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$dialogs$2f$getRandomPhrase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/demo/content/dialogs/getRandomPhrase.ts [app-ssr] (ecmascript)");
;
;
/**
 * Radio máximo (en unidades de mundo, XZ) para activar el hint de proximidad.
 * "Muy cercano" = dentro de 1.8 unidades del centro del target.
 */ const PROXIMITY_RADIUS = 1.8;
/**
 * Cooldown mínimo entre hints del MISMO target (ms).
 * Evita spam si el personaje se queda parado cerca.
 */ const HINT_COOLDOWN_MS = 10_000;
function useProximityHintController({ playerPosition, interactions, placedItems, showSpeechBubble }) {
    // Tracks si el jugador ESTABA dentro de cada zona en el tick anterior
    const wasInsideRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({});
    // Timestamp del último hint por interaction
    const lastHintAtRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({});
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const [px, , pz] = playerPosition;
        for (const interaction of interactions){
            if (!interaction.hintDialogKeys) continue;
            const [ix, , iz] = interaction.position;
            const dx = px - ix;
            const dz = pz - iz;
            const dist = Math.sqrt(dx * dx + dz * dz);
            const isInside = dist <= PROXIMITY_RADIUS;
            const wasInside = wasInsideRef.current[interaction.id] ?? false;
            // Solo dispara al entrar (flanco de subida)
            if (isInside && !wasInside) {
                const now = Date.now();
                const lastAt = lastHintAtRef.current[interaction.id] ?? 0;
                if (now - lastAt >= HINT_COOLDOWN_MS) {
                    const isOccupied = placedItems.some((item)=>item.interactionId === interaction.id);
                    const dialogKey = isOccupied ? interaction.hintDialogKeys.occupied : interaction.hintDialogKeys.empty;
                    showSpeechBubble((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$dialogs$2f$getRandomPhrase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRandomPhrase"])(dialogKey), {
                        dialogKey
                    });
                    lastHintAtRef.current[interaction.id] = now;
                }
            }
            wasInsideRef.current[interaction.id] = isInside;
        }
    }, [
        playerPosition,
        interactions,
        placedItems,
        showSpeechBubble
    ]);
}
}),
"[project]/apps/web-demo/app/items/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
;
}),
"[project]/apps/web-demo/app/demo/content/items/index.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ITEMS",
    ()=>ITEMS,
    "getItemDefinition",
    ()=>getItemDefinition,
    "resolveItemRule",
    ()=>resolveItemRule
]);
const ITEMS = {
    gameboy: {
        id: "gameboy",
        name: "Gameboy",
        spriteUrl: "/assets/gameboy/gameboy.png",
        descriptionDialogKey: "item.gameboy.description",
        interactionRules: {
            "personal-room-gameboy-drop-target": {
                outcome: "place",
                hitDialogKey: "item.gameboy.drop.personal-room-gameboy-drop-target.hit",
                missDialogKey: "item.gameboy.drop.personal-room-gameboy-drop-target.miss",
                placeCanPickup: true,
                placeHasCollision: true,
                placeCollisionHalfSize: [
                    0.38,
                    0.38,
                    0.38
                ],
                pickupSuccessDialogKey: "item.gameboy.pickup.personal-room-gameboy-drop-target.allowed",
                pickupBlockedDialogKey: "item.gameboy.pickup.personal-room-gameboy-drop-target.blocked"
            }
        },
        defaultRule: {
            outcome: "return",
            missDialogKey: "item.gameboy.drop.default.miss"
        }
    }
};
function getItemDefinition(itemId) {
    return ITEMS[itemId] ?? null;
}
function resolveItemRule(itemId, interactionId) {
    const item = getItemDefinition(itemId);
    if (!item) return null;
    return item.interactionRules[interactionId] ?? item.defaultRule;
}
}),
"[project]/apps/web-demo/app/lib/core/rules/inventoryRules.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addOneToInventory",
    ()=>addOneToInventory,
    "inventoryRuleMessages",
    ()=>inventoryRuleMessages,
    "removeOneFromSlot",
    ()=>removeOneFromSlot,
    "resolveInventoryDropHitDecision",
    ()=>resolveInventoryDropHitDecision,
    "resolveInventoryDropMissDialogKey",
    ()=>resolveInventoryDropMissDialogKey,
    "resolveInventoryDropOnPlayerMessage",
    ()=>resolveInventoryDropOnPlayerMessage,
    "resolvePickupPlacedItemDecision",
    ()=>resolvePickupPlacedItemDecision
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$items$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web-demo/app/items/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$items$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/demo/content/items/index.ts [app-ssr] (ecmascript)");
;
const UNKNOWN_ITEM_MESSAGE = "No conozco este item todavía.";
const DEFAULT_DROP_MISS_DIALOG_KEY = "inventoryDropMiss";
const DEFAULT_PICKUP_ALLOWED_DIALOG_KEY = "item.gameboy.pickup.personal-room-gameboy-drop-target.allowed";
const DEFAULT_PICKUP_BLOCKED_DIALOG_KEY = "item.gameboy.pickup.personal-room-gameboy-drop-target.blocked";
function removeOneFromSlot(slots, slotIndex) {
    const slot = slots[slotIndex];
    if (!slot) return slots;
    const next = [
        ...slots
    ];
    if (slot.quantity <= 1) {
        next[slotIndex] = null;
    } else {
        next[slotIndex] = {
            ...slot,
            quantity: slot.quantity - 1
        };
    }
    return next;
}
function addOneToInventory(slots, stack) {
    const existingIndex = slots.findIndex((current)=>current?.id === stack.id);
    if (existingIndex >= 0) {
        const next = [
            ...slots
        ];
        const existing = next[existingIndex];
        if (!existing) return {
            slots,
            added: false
        };
        next[existingIndex] = {
            ...existing,
            quantity: existing.quantity + 1
        };
        return {
            slots: next,
            added: true
        };
    }
    const emptyIndex = slots.findIndex((current)=>current == null);
    if (emptyIndex < 0) {
        return {
            slots,
            added: false
        };
    }
    const next = [
        ...slots
    ];
    next[emptyIndex] = {
        ...stack,
        quantity: 1
    };
    return {
        slots: next,
        added: true
    };
}
function resolveInventoryDropHitDecision({ interaction, payload, now }) {
    const itemDefinition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$items$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemDefinition"])(payload.stack.id);
    if (!itemDefinition) {
        return {
            kind: "unknown-item",
            message: UNKNOWN_ITEM_MESSAGE
        };
    }
    const rule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$items$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveItemRule"])(itemDefinition.id, interaction.id);
    if (!rule) {
        return {
            kind: "rule-miss",
            dialogKey: interaction.dialogKeys.miss
        };
    }
    if (rule.outcome === "place") {
        return {
            kind: "place",
            fromSlotIndex: payload.fromSlotIndex,
            placedItem: {
                id: `${itemDefinition.id}-${interaction.id}-${now}`,
                itemId: itemDefinition.id,
                interactionId: interaction.id,
                name: itemDefinition.name,
                spriteUrl: itemDefinition.spriteUrl,
                worldPosition: [
                    interaction.position[0],
                    interaction.position[1] + interaction.halfSize[1] + 0.175,
                    interaction.position[2]
                ],
                canPickup: rule.placeCanPickup ?? false,
                hasCollision: rule.placeHasCollision ?? false,
                collisionHalfSize: rule.placeCollisionHalfSize,
                pickupSuccessDialogKey: rule.pickupSuccessDialogKey,
                pickupBlockedDialogKey: rule.pickupBlockedDialogKey
            },
            dialogKey: rule.hitDialogKey ?? interaction.dialogKeys.hit
        };
    }
    if (rule.outcome === "consume") {
        return {
            kind: "consume",
            fromSlotIndex: payload.fromSlotIndex,
            dialogKey: rule.hitDialogKey ?? interaction.dialogKeys.hit
        };
    }
    return {
        kind: "return",
        dialogKey: rule.hitDialogKey ?? rule.missDialogKey ?? interaction.dialogKeys.miss
    };
}
function resolveInventoryDropMissDialogKey({ payload, interaction, sceneInteractions }) {
    const itemRule = interaction ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$items$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveItemRule"])(payload.stack.id, interaction.id) : null;
    return itemRule?.missDialogKey ?? interaction?.dialogKeys.miss ?? sceneInteractions.find((currentInteraction)=>currentInteraction.kind === "drop-target")?.dialogKeys.miss ?? DEFAULT_DROP_MISS_DIALOG_KEY;
}
function resolveInventoryDropOnPlayerMessage({ payload }) {
    const itemDefinition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$items$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemDefinition"])(payload.stack.id);
    if (!itemDefinition) {
        return {
            kind: "text",
            text: UNKNOWN_ITEM_MESSAGE
        };
    }
    if (itemDefinition.descriptionDialogKey) {
        return {
            kind: "dialog-key",
            dialogKey: itemDefinition.descriptionDialogKey
        };
    }
    return {
        kind: "text",
        text: `Es ${itemDefinition.name}.`
    };
}
function resolvePickupPlacedItemDecision({ placedItem }) {
    const itemDefinition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$items$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemDefinition"])(placedItem.itemId);
    if (!itemDefinition) {
        return {
            kind: "ignore"
        };
    }
    if (!placedItem.canPickup) {
        return {
            kind: "blocked",
            dialogKey: placedItem.pickupBlockedDialogKey ?? DEFAULT_PICKUP_BLOCKED_DIALOG_KEY
        };
    }
    return {
        kind: "allow",
        placedItemId: placedItem.id,
        stack: {
            id: itemDefinition.id,
            name: itemDefinition.name,
            spriteUrl: itemDefinition.spriteUrl
        },
        successDialogKey: placedItem.pickupSuccessDialogKey ?? DEFAULT_PICKUP_ALLOWED_DIALOG_KEY
    };
}
const inventoryRuleMessages = {
    unknownItem: UNKNOWN_ITEM_MESSAGE,
    inventoryFull: "Inventario lleno."
};
}),
"[project]/apps/web-demo/app/lib/engine/runtime/useInventoryRuntimeController.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useInventoryRuntimeController",
    ()=>useInventoryRuntimeController
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$dialogs$2f$getRandomPhrase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/demo/content/dialogs/getRandomPhrase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/platform-web.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$runtime$2f$useProximityHintController$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/runtime/useProximityHintController.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$types$2f$runtimeEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/types/runtimeEvents.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$core$2f$rules$2f$inventoryRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/core/rules/inventoryRules.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function createInitialInventorySlots() {
    return Array.from({
        length: 9
    }, (_, index)=>{
        if (index !== 0) return null;
        return {
            id: "gameboy",
            name: "Gameboy",
            spriteUrl: "/assets/gameboy/gameboy.png",
            quantity: 1
        };
    });
}
function useInventoryRuntimeController({ sceneId, sceneInteractions, playerPosition, onRuntimeEvent }) {
    const [speechText, setSpeechText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [speechVisible, setSpeechVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [speechTrigger, setSpeechTrigger] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isInventoryOpen, setIsInventoryOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [inventorySlots, setInventorySlots] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>createInitialInventorySlots());
    const [draggedStack, setDraggedStack] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [placedItems, setPlacedItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const pickupLockRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Set());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (pickupLockRef.current.size === 0) {
            return;
        }
        for (const lockedItemId of Array.from(pickupLockRef.current)){
            const stillExists = placedItems.some((item)=>item.id === lockedItemId);
            if (!stillExists) {
                pickupLockRef.current.delete(lockedItemId);
            }
        }
    }, [
        placedItems
    ]);
    const handleBoundaryHit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((phrase)=>{
        setSpeechText(phrase);
        setSpeechVisible(true);
        setSpeechTrigger((current)=>current + 1);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$types$2f$runtimeEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emitRuntimeEvent"])(onRuntimeEvent, {
            type: "onDialog",
            source: "boundary",
            text: phrase,
            dialogKey: "boundaryHit"
        });
    }, [
        onRuntimeEvent
    ]);
    const showSpeechBubble = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((nextText, meta)=>{
        setSpeechText(nextText);
        setSpeechVisible(true);
        setSpeechTrigger((current)=>current + 1);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$types$2f$runtimeEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emitRuntimeEvent"])(onRuntimeEvent, {
            type: "onDialog",
            source: meta?.source ?? "inventory",
            text: nextText,
            dialogKey: meta?.dialogKey
        });
    }, [
        onRuntimeEvent
    ]);
    const hideSpeechBubble = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setSpeechVisible(false);
    }, []);
    const handleInventoryDropHit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((interaction, payload)=>{
        const decision = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$core$2f$rules$2f$inventoryRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveInventoryDropHitDecision"])({
            interaction,
            payload,
            now: Date.now()
        });
        if (decision.kind === "unknown-item") {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$types$2f$runtimeEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emitRuntimeEvent"])(onRuntimeEvent, {
                type: "onDrop",
                outcome: "unknown-item",
                itemId: payload.stack.id,
                interactionId: interaction.id
            });
            showSpeechBubble(decision.message);
            setDraggedStack(null);
            return;
        }
        if (decision.kind === "rule-miss") {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$types$2f$runtimeEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emitRuntimeEvent"])(onRuntimeEvent, {
                type: "onDrop",
                outcome: "rule-miss",
                itemId: payload.stack.id,
                interactionId: interaction.id
            });
            showSpeechBubble((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$dialogs$2f$getRandomPhrase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRandomPhrase"])(decision.dialogKey), {
                dialogKey: decision.dialogKey
            });
            setDraggedStack(null);
            return;
        }
        if (decision.kind === "place") {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$types$2f$runtimeEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emitRuntimeEvent"])(onRuntimeEvent, {
                type: "onDrop",
                outcome: "place",
                itemId: payload.stack.id,
                interactionId: interaction.id
            });
            setInventorySlots((currentSlots)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$core$2f$rules$2f$inventoryRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeOneFromSlot"])(currentSlots, decision.fromSlotIndex));
            setPlacedItems((currentPlaced)=>[
                    ...currentPlaced,
                    decision.placedItem
                ]);
            showSpeechBubble((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$dialogs$2f$getRandomPhrase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRandomPhrase"])(decision.dialogKey), {
                dialogKey: decision.dialogKey
            });
            setDraggedStack(null);
            return;
        }
        if (decision.kind === "consume") {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$types$2f$runtimeEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emitRuntimeEvent"])(onRuntimeEvent, {
                type: "onDrop",
                outcome: "consume",
                itemId: payload.stack.id,
                interactionId: interaction.id
            });
            setInventorySlots((currentSlots)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$core$2f$rules$2f$inventoryRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeOneFromSlot"])(currentSlots, decision.fromSlotIndex));
            showSpeechBubble((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$dialogs$2f$getRandomPhrase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRandomPhrase"])(decision.dialogKey), {
                dialogKey: decision.dialogKey
            });
            setDraggedStack(null);
            return;
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$types$2f$runtimeEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emitRuntimeEvent"])(onRuntimeEvent, {
            type: "onDrop",
            outcome: "return",
            itemId: payload.stack.id,
            interactionId: interaction.id
        });
        showSpeechBubble((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$dialogs$2f$getRandomPhrase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRandomPhrase"])(decision.dialogKey), {
            dialogKey: decision.dialogKey
        });
        setDraggedStack(null);
    }, [
        onRuntimeEvent,
        showSpeechBubble
    ]);
    const handleInventoryDropMiss = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((payload, interaction)=>{
        const fallbackMiss = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$core$2f$rules$2f$inventoryRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveInventoryDropMissDialogKey"])({
            payload,
            interaction,
            sceneInteractions
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$types$2f$runtimeEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emitRuntimeEvent"])(onRuntimeEvent, {
            type: "onDrop",
            outcome: "return",
            itemId: payload.stack.id,
            interactionId: interaction?.id
        });
        showSpeechBubble((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$dialogs$2f$getRandomPhrase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRandomPhrase"])(fallbackMiss), {
            dialogKey: fallbackMiss
        });
        setDraggedStack(null);
    }, [
        onRuntimeEvent,
        sceneInteractions,
        showSpeechBubble
    ]);
    const handleInventoryDropOnPlayer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((payload)=>{
        const message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$core$2f$rules$2f$inventoryRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveInventoryDropOnPlayerMessage"])({
            payload
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$types$2f$runtimeEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emitRuntimeEvent"])(onRuntimeEvent, {
            type: "onDrop",
            outcome: "on-player",
            itemId: payload.stack.id
        });
        if (message.kind === "dialog-key") {
            showSpeechBubble((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$dialogs$2f$getRandomPhrase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRandomPhrase"])(message.dialogKey), {
                dialogKey: message.dialogKey
            });
        } else {
            showSpeechBubble(message.text);
        }
        setDraggedStack(null);
    }, [
        onRuntimeEvent,
        showSpeechBubble
    ]);
    const handlePickupPlacedItem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((placedItem)=>{
        if (isInventoryOpen) {
            return;
        }
        if (pickupLockRef.current.has(placedItem.id)) {
            return;
        }
        pickupLockRef.current.add(placedItem.id);
        const decision = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$core$2f$rules$2f$inventoryRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolvePickupPlacedItemDecision"])({
            placedItem
        });
        if (decision.kind === "ignore") {
            pickupLockRef.current.delete(placedItem.id);
            return;
        }
        if (decision.kind === "blocked") {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$types$2f$runtimeEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emitRuntimeEvent"])(onRuntimeEvent, {
                type: "onDrop",
                outcome: "pickup-blocked",
                itemId: placedItem.itemId,
                interactionId: placedItem.interactionId
            });
            showSpeechBubble((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$dialogs$2f$getRandomPhrase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRandomPhrase"])(decision.dialogKey), {
                dialogKey: decision.dialogKey
            });
            pickupLockRef.current.delete(placedItem.id);
            return;
        }
        let added = false;
        setInventorySlots((currentSlots)=>{
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$core$2f$rules$2f$inventoryRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addOneToInventory"])(currentSlots, decision.stack);
            added = result.added;
            return result.added ? result.slots : currentSlots;
        });
        if (!added) {
            showSpeechBubble(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$core$2f$rules$2f$inventoryRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["inventoryRuleMessages"].inventoryFull);
            pickupLockRef.current.delete(placedItem.id);
            return;
        }
        setPlacedItems((currentPlaced)=>currentPlaced.filter((currentItem)=>currentItem.id !== decision.placedItemId));
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$types$2f$runtimeEvents$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emitRuntimeEvent"])(onRuntimeEvent, {
            type: "onDrop",
            outcome: "pickup-success",
            itemId: placedItem.itemId,
            interactionId: placedItem.interactionId
        });
        showSpeechBubble((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$dialogs$2f$getRandomPhrase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRandomPhrase"])(decision.successDialogKey));
    }, [
        isInventoryOpen,
        onRuntimeEvent,
        showSpeechBubble
    ]);
    const updatePlacedItemPosition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id, axis, value)=>{
        setPlacedItems((currentPlaced)=>currentPlaced.map((item)=>{
                if (item.id !== id) return item;
                const worldPosition = [
                    ...item.worldPosition
                ];
                worldPosition[axis] = value;
                return {
                    ...item,
                    worldPosition
                };
            }));
    }, []);
    const movePlacedItemToPlayer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        setPlacedItems((currentPlaced)=>currentPlaced.map((item)=>{
                if (item.id !== id) return item;
                return {
                    ...item,
                    worldPosition: [
                        playerPosition[0],
                        item.worldPosition[1],
                        playerPosition[2]
                    ]
                };
            }));
    }, [
        playerPosition
    ]);
    const removePlacedItemById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        setPlacedItems((currentPlaced)=>currentPlaced.filter((item)=>item.id !== id));
    }, []);
    const handleStartInventoryDrag = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((slotIndex, clientX, clientY)=>{
        const stack = inventorySlots[slotIndex];
        if (!stack) return;
        setIsInventoryOpen(false);
        setDraggedStack({
            stack,
            fromSlotIndex: slotIndex,
            pointerX: clientX,
            pointerY: clientY
        });
    }, [
        inventorySlots
    ]);
    const handleInteractionInspect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((interaction)=>{
        if (!interaction.hintDialogKeys) return;
        // Si hay un ítem colocado que puede recogerse, no disparamos el hint:
        // el click será gestionado por el sistema de pickup, no por el de pistas.
        const hasPickableItem = placedItems.some((item)=>item.interactionId === interaction.id && item.canPickup);
        if (hasPickableItem) return;
        const isOccupied = placedItems.some((item)=>item.interactionId === interaction.id);
        const dialogKey = isOccupied ? interaction.hintDialogKeys.occupied : interaction.hintDialogKeys.empty;
        showSpeechBubble((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$dialogs$2f$getRandomPhrase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRandomPhrase"])(dialogKey), {
            dialogKey
        });
    }, [
        placedItems,
        showSpeechBubble
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$runtime$2f$useProximityHintController$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useProximityHintController"])({
        playerPosition,
        interactions: sceneInteractions,
        placedItems,
        showSpeechBubble
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (sceneId !== "personalRoom") return;
        // Double-rAF: el speech inicial dispara DESPUÉS de que R3F haya corrido
        // al menos un useFrame. setTimeout(0) se ejecutaba antes del primer
        // requestAnimationFrame, dejando el sprite en SPRITE_MIN_SCALE sin que
        // useFrame hubiera corregido aún la escala por profundidad.
        let outerHandle = null;
        let innerHandle = null;
        outerHandle = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserEnvironmentAdapter"].requestAnimationFrame(()=>{
            outerHandle = null;
            innerHandle = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserEnvironmentAdapter"].requestAnimationFrame(()=>{
                innerHandle = null;
                showSpeechBubble((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$dialogs$2f$getRandomPhrase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRandomPhrase"])("personalRoomWelcome"), {
                    dialogKey: "personalRoomWelcome"
                });
            });
        });
        return ()=>{
            if (outerHandle !== null) __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserEnvironmentAdapter"].cancelAnimationFrame(outerHandle);
            if (innerHandle !== null) __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserEnvironmentAdapter"].cancelAnimationFrame(innerHandle);
        };
    }, [
        sceneId,
        showSpeechBubble
    ]);
    return {
        speechText,
        speechVisible,
        speechTrigger,
        isInventoryOpen,
        inventorySlots,
        draggedStack,
        placedItems,
        setIsInventoryOpen,
        handleBoundaryHit,
        showSpeechBubble,
        hideSpeechBubble,
        handleInteractionInspect,
        handleInventoryDropHit,
        handleInventoryDropMiss,
        handleInventoryDropOnPlayer,
        handlePickupPlacedItem,
        updatePlacedItemPosition,
        movePlacedItemToPlayer,
        removePlacedItemById,
        handleStartInventoryDrag
    };
}
}),
"[project]/apps/web-demo/app/lib/engine/runtime/useInteractionEditorController.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useInteractionEditorController",
    ()=>useInteractionEditorController
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
const PLAYER_COLLIDER_HALF_HEIGHT = 0.95;
const DEBUG_INTERACTION_COLLISION_OVERLAP_MARGIN = 0.05;
function keepInteractionCollidable(interaction, playerSpawnY) {
    if (!interaction.hasCollision) return interaction;
    const minTopY = playerSpawnY - PLAYER_COLLIDER_HALF_HEIGHT + DEBUG_INTERACTION_COLLISION_OVERLAP_MARGIN;
    const minCenterY = minTopY - interaction.halfSize[1];
    if (interaction.position[1] >= minCenterY) return interaction;
    const position = [
        ...interaction.position
    ];
    position[1] = minCenterY;
    return {
        ...interaction,
        position
    };
}
function useInteractionEditorController({ playerPosition, scenePlayerSpawnY, updateInteraction }) {
    const updateInteractionPosition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id, axis, value)=>{
        updateInteraction(id, (interaction)=>{
            const position = [
                ...interaction.position
            ];
            position[axis] = value;
            return keepInteractionCollidable({
                ...interaction,
                position
            }, scenePlayerSpawnY);
        });
    }, [
        scenePlayerSpawnY,
        updateInteraction
    ]);
    const updateInteractionHalfSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id, axis, value)=>{
        updateInteraction(id, (interaction)=>{
            const halfSize = [
                ...interaction.halfSize
            ];
            halfSize[axis] = Math.max(0.05, value);
            return keepInteractionCollidable({
                ...interaction,
                halfSize
            }, scenePlayerSpawnY);
        });
    }, [
        scenePlayerSpawnY,
        updateInteraction
    ]);
    const updateInteractionRotationDeg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id, value)=>{
        updateInteraction(id, (interaction)=>({
                ...interaction,
                rotationY: value * Math.PI / 180
            }));
    }, [
        updateInteraction
    ]);
    const moveInteractionToPlayer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        updateInteraction(id, (interaction)=>({
                ...interaction,
                position: [
                    playerPosition[0],
                    interaction.position[1],
                    playerPosition[2]
                ]
            }));
    }, [
        playerPosition,
        updateInteraction
    ]);
    return {
        updateInteractionPosition,
        updateInteractionHalfSize,
        updateInteractionRotationDeg,
        moveInteractionToPlayer
    };
}
}),
"[project]/apps/web-demo/app/lib/engine/runtime/useDebugPanelController.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDebugPanelController",
    ()=>useDebugPanelController
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
function useDebugPanelController() {
    const [debugPanelSide, setDebugPanelSide] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("left");
    const [isDebugGroundVisible, setIsDebugGroundVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isDebugWallsVisible, setIsDebugWallsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [editorMode, setEditorMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("walls");
    const [wallToolMode, setWallToolMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("manual");
    const [wallPointResetSignal, setWallPointResetSignal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [speechDraft, setSpeechDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("Hola. Este es un bocadillo de prueba.");
    const [speechCharsPerSecond, setSpeechCharsPerSecond] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(28);
    const handleWallToolModeChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((mode)=>{
        setWallToolMode(mode);
        setWallPointResetSignal((signal)=>signal + 1);
    }, []);
    const resetWallPointTool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setWallPointResetSignal((signal)=>signal + 1);
    }, []);
    return {
        debugPanelSide,
        setDebugPanelSide,
        isDebugGroundVisible,
        setIsDebugGroundVisible,
        isDebugWallsVisible,
        setIsDebugWallsVisible,
        editorMode,
        setEditorMode,
        wallToolMode,
        wallPointResetSignal,
        handleWallToolModeChange,
        resetWallPointTool,
        speechDraft,
        setSpeechDraft,
        speechCharsPerSecond,
        setSpeechCharsPerSecond
    };
}
}),
"[project]/apps/web-demo/app/lib/engine/runtime/useDebugModeEffects.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDebugModeEffects",
    ()=>useDebugModeEffects
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/platform-web.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const DEBUG_ROUTE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true";
function useDebugModeEffects() {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const isDebug = DEBUG_ROUTE_ENABLED && pathname === "/debug";
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        console.log("GameTouchCanvas: debug mode ->", isDebug, {
            pathname
        });
    }, [
        isDebug,
        pathname
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isDebug) return;
        return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$platform$2d$web$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["browserEnvironmentAdapter"].mountStyleTag("data-debug-cursor-override", "true", "* { cursor: auto !important; }");
    }, [
        isDebug
    ]);
    return {
        isDebug
    };
}
}),
"[project]/apps/web-demo/app/demo/content/scenes.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_SCENE_ID",
    ()=>DEFAULT_SCENE_ID,
    "SCENES",
    ()=>SCENES
]);
const SCENES = {
    town: {
        id: "town",
        label: "Town",
        background: "/assets/background/town.jpg",
        playerSpawn: [
            3.08,
            1.05,
            13.44
        ],
        ground: {
            minX: -12,
            maxX: 17,
            minZ: -15,
            maxZ: 30,
            y: -3.25
        },
        walls: [
            {
                position: [
                    -11,
                    -0.1,
                    13.56
                ],
                halfSize: [
                    1.15,
                    2,
                    8
                ]
            },
            {
                position: [
                    -4.42,
                    0,
                    4
                ],
                rotationY: -2.9329,
                halfSize: [
                    5.8,
                    3,
                    2
                ]
            }
        ],
        interactions: []
    },
    dungeon: {
        id: "dungeon",
        label: "Dungeon",
        background: "/assets/background/mazmorra.jpg",
        playerSpawn: [
            0,
            -1.1,
            13.44
        ],
        ground: {
            minX: -14.4,
            maxX: 15.8,
            minZ: -20.6,
            maxZ: 60.6,
            y: -3.15
        },
        walls: [],
        interactions: []
    },
    volcano: {
        id: "volcano",
        label: "Volcano",
        background: "/assets/background/volcanico.jpg",
        playerSpawn: [
            0,
            -1.1,
            13.44
        ],
        ground: {
            minX: -17,
            maxX: 16.8,
            minZ: -7.6,
            maxZ: 69.7,
            y: -2.05
        },
        walls: [],
        interactions: []
    },
    personalRoom: {
        id: "personalRoom",
        label: "Personal Room",
        background: "/assets/background/personalRoom.png",
        playerSpawn: [
            0,
            -1.1,
            13.44
        ],
        ground: {
            minX: -16.9,
            maxX: 16.8,
            minZ: 2.9,
            maxZ: 71,
            y: -2.15
        },
        walls: [
            {
                position: [
                    2.830357142857149,
                    -0.1499999999999999,
                    2.730245406547893
                ],
                rotationY: -0.0071708760592677605,
                halfSize: [
                    1.9196922136228656,
                    2,
                    3.25
                ]
            },
            {
                position: [
                    5.446428571428572,
                    -0.1499999999999999,
                    4.463765756959228
                ],
                rotationY: 0.01926967431455731,
                halfSize: [
                    0.7144183492165584,
                    2,
                    0.25
                ]
            },
            {
                position: [
                    7.232142857142858,
                    -0.1499999999999999,
                    9.534627450726136
                ],
                rotationY: -1.3631154201876534,
                halfSize: [
                    5.196286702670595,
                    2,
                    0.25
                ]
            },
            {
                position: [
                    8.330357142857142,
                    -0.1499999999999999,
                    15.445617547843916
                ],
                rotationY: -1.538393677236328,
                halfSize: [
                    0.8267966484216037,
                    2,
                    0.25
                ]
            },
            {
                position: [
                    8.205357142857142,
                    -0.1499999999999999,
                    17.28615253298894
                ],
                rotationY: -1.7193582549907012,
                halfSize: [
                    1.0254679106406617,
                    2,
                    0.25
                ]
            },
            {
                position: [
                    8.214285714285714,
                    -0.1499999999999999,
                    18.826192010355186
                ],
                rotationY: -1.274193715137604,
                halfSize: [
                    0.549877558285058,
                    2,
                    0.25
                ]
            },
            {
                position: [
                    8.776785714285715,
                    -0.1499999999999999,
                    19.239373333551008
                ],
                rotationY: 0.27343750350584456,
                halfSize: [
                    0.41728869287375336,
                    2,
                    0.25
                ]
            },
            {
                position: [
                    9.25892857142857,
                    -0.1499999999999999,
                    19.953050164525607
                ],
                rotationY: -1.4738591227597666,
                halfSize: [
                    0.8302604975304805,
                    2,
                    0.25
                ]
            },
            {
                position: [
                    9.642857142857142,
                    -0.1499999999999999,
                    21.455527703419506
                ],
                rotationY: -1.1487794308716912,
                halfSize: [
                    0.7411389614021351,
                    2,
                    0.25
                ]
            },
            {
                position: [
                    10.357142857142858,
                    -0.1499999999999999,
                    21.417965764947162
                ],
                rotationY: 1.0485934493294642,
                halfSize: [
                    0.8234202108035373,
                    2,
                    0.25
                ]
            },
            {
                position: [
                    10.973214285714286,
                    -0.1499999999999999,
                    19.50230690285744
                ],
                rotationY: 1.4015813630179996,
                halfSize: [
                    1.2193983595388684,
                    2,
                    0.25
                ]
            },
            {
                position: [
                    11.857142857142854,
                    -0.1499999999999999,
                    18.503957057791094
                ],
                rotationY: 1.2202071255803169,
                halfSize: [
                    0.5199324221341752,
                    2,
                    0.25
                ]
            },
            {
                position: [
                    12.616071428571429,
                    -0.1499999999999999,
                    17.173466717571895
                ],
                rotationY: 0.13818596030360128,
                halfSize: [
                    1.090754758720428,
                    2,
                    0.25
                ]
            },
            {
                position: [
                    13.821428571428571,
                    -0.1499999999999999,
                    15.78367499409504
                ],
                rotationY: 1.470292557627663,
                halfSize: [
                    1.2458307479511985,
                    2,
                    0.25
                ]
            },
            {
                position: [
                    14.13392857142857,
                    -0.1499999999999999,
                    12.29041471616673
                ],
                rotationY: 1.487791562858048,
                halfSize: [
                    2.261502475895506,
                    2,
                    0.25
                ]
            },
            {
                position: [
                    14.678571428571429,
                    -0.1499999999999999,
                    9.961574530881187
                ],
                rotationY: 0.20732437622955813,
                halfSize: [
                    0.36495837748346754,
                    2,
                    0.25
                ]
            },
            {
                position: [
                    -11.312499999999998,
                    -0.1499999999999999,
                    8.205788866886982
                ],
                rotationY: -1.0596435082430542,
                halfSize: [
                    2.4275167104295474,
                    2,
                    0.25
                ]
            },
            {
                position: [
                    -7.580357142857152,
                    -0.1499999999999999,
                    7.442160939164886
                ],
                rotationY: 0.6933596001568646,
                halfSize: [
                    3.4210037104866,
                    2,
                    0.25
                ]
            },
            {
                position: [
                    -5.30357142857143,
                    -0.1499999999999999,
                    3.554260335104874
                ],
                rotationY: 0.5536898637028902,
                halfSize: [
                    0.4247267304702619,
                    2,
                    1.35
                ]
            },
            {
                position: [
                    -14.049999999999999,
                    -0.1499999999999999,
                    9.623517084630064
                ],
                rotationY: -1.9201626521419506,
                halfSize: [
                    3.7978106162299308,
                    2,
                    0.25
                ]
            },
            {
                position: [
                    -15.349999999999998,
                    -0.1499999999999999,
                    15.145122040065141
                ],
                rotationY: -1.5707963267948966,
                halfSize: [
                    1.9532208005620664,
                    2,
                    0.25
                ]
            }
        ],
        interactions: [
            {
                id: "personal-room-gameboy-drop-target",
                kind: "drop-target",
                label: "Soporte del Gameboy",
                position: [
                    3.27,
                    -1.65,
                    19.71
                ],
                halfSize: [
                    0.95,
                    0.55,
                    0.95
                ],
                hasCollision: true,
                acceptsItemIds: [
                    "gameboy"
                ],
                dialogKeys: {
                    hit: "inventoryDropHit",
                    miss: "inventoryDropMiss"
                },
                hintDialogKeys: {
                    empty: "interaction.gameboy-base.empty",
                    occupied: "interaction.gameboy-base.occupied"
                }
            }
        ]
    },
    lavaAnimated: {
        id: "lavaAnimated",
        label: "Lava Animated",
        background: "/assets/background/lava-animated.gif",
        playerSpawn: [
            0,
            -1.1,
            13.44
        ],
        ground: {
            minX: -17,
            maxX: 16.8,
            minZ: -7.6,
            maxZ: 69.7,
            y: -2.05
        },
        walls: [],
        interactions: []
    }
};
const DEFAULT_SCENE_ID = "personalRoom";
}),
"[project]/apps/web-demo/app/lib/engine/runtime/useSceneRuntimeController.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSceneRuntimeController",
    ()=>useSceneRuntimeController
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$scenes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/demo/content/scenes.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/game/state/sceneStore.js [app-ssr] (ecmascript)");
"use client";
;
;
;
function useSceneRuntimeController() {
    const sceneId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.sceneId);
    const sceneBackground = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.scene.background);
    const storeSetScene = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.setScene);
    const sceneInteractions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.scene.interactions);
    const requestRespawn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.requestRespawn);
    const playerPosition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.playerPosition);
    const scenePlayerSpawn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.scene.playerSpawn);
    const updateInteraction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.updateInteraction);
    const resetInteractionsFromSceneConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((s)=>s.resetInteractionsFromSceneConfig);
    const sceneOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$scenes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SCENES"]).map((s)=>({
                label: s.label,
                value: s.id
            })), []);
    const setScene = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(id)=>{
            const scene = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$demo$2f$content$2f$scenes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SCENES"][id];
            if (!scene) {
                console.warn(`Scene not found: ${id}`);
                return;
            }
            storeSetScene(id, scene);
        }, [
        storeSetScene
    ]);
    return {
        sceneId,
        sceneBackground,
        setScene,
        sceneInteractions,
        requestRespawn,
        playerPosition,
        scenePlayerSpawn,
        updateInteraction,
        resetInteractionsFromSceneConfig,
        sceneOptions
    };
}
}),
"[project]/apps/web-demo/app/components/GameTouchCanvas.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GameTouchCanvas
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/react-three-fiber.esm.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$OrthographicCamera$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/OrthographicCamera.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/rapier/dist/react-three-rapier.esm.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$PixelLoader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/PixelLoader.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$InventoryUI$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/InventoryUI.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$inventory$2f$SceneDropTargets$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/inventory/SceneDropTargets.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$inventory$2f$PlacedSceneItems$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/inventory/PlacedSceneItems.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$scene$2f$SceneBackgroundPlane$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/scene/SceneBackgroundPlane.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$scene$2f$SceneCameraControllers$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/scene/SceneCameraControllers.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$DebugOverlayRuntimePanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/debug/DebugOverlayRuntimePanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$runtime$2f$GameTouchSpriteRuntime$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/runtime/GameTouchSpriteRuntime.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$runtime$2f$useInventoryRuntimeController$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/runtime/useInventoryRuntimeController.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$runtime$2f$useInteractionEditorController$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/runtime/useInteractionEditorController.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$runtime$2f$useDebugPanelController$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/runtime/useDebugPanelController.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$runtime$2f$useDebugModeEffects$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/runtime/useDebugModeEffects.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$runtime$2f$useSceneRuntimeController$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/lib/engine/runtime/useSceneRuntimeController.ts [app-ssr] (ecmascript)");
;
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
// Carga el joystick solo en cliente (ssr: false); la detección de dispositivo
// táctil se realiza dentro del propio componente con window garantizado.
const Joystick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/apps/web-demo/app/components/Joystick.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
const CAMERA_POSITION = [
    0,
    5.4,
    25.0
];
/**
 * Se monta dentro del Suspense del runtime — cuando este componente llega al
 * DOM significa que useLoader ha resuelto todos los assets del personaje.
 * Llama onReady una sola vez para señalizar al PixelLoader.
 */ function SceneReadyReporter({ onReady }) {
    const onReadyRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(onReady);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        onReadyRef.current();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return null;
}
function GameTouchCanvas({ debug: debugOverride, onRuntimeEvent } = {}) {
    const selectedCharacter = "Dave";
    const [sceneReady, setSceneReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleSceneReady = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>setSceneReady(true), []);
    const { isDebug } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$runtime$2f$useDebugModeEffects$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDebugModeEffects"])();
    const runtimeDebug = typeof debugOverride === "boolean" ? debugOverride : isDebug;
    const handleRuntimeEvent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((event)=>{
        onRuntimeEvent?.(event);
        if (!runtimeDebug) return;
        console.debug("[runtime-event]", event);
    }, [
        onRuntimeEvent,
        runtimeDebug
    ]);
    const { debugPanelSide, setDebugPanelSide, isDebugGroundVisible, setIsDebugGroundVisible, isDebugWallsVisible, setIsDebugWallsVisible, editorMode, setEditorMode, wallToolMode, wallPointResetSignal, handleWallToolModeChange, resetWallPointTool, speechDraft, setSpeechDraft, speechCharsPerSecond, setSpeechCharsPerSecond } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$runtime$2f$useDebugPanelController$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDebugPanelController"])();
    const { sceneId, sceneBackground, setScene, sceneInteractions, requestRespawn, playerPosition, scenePlayerSpawn, updateInteraction, resetInteractionsFromSceneConfig, sceneOptions } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$runtime$2f$useSceneRuntimeController$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneRuntimeController"])();
    const { speechText, speechVisible, speechTrigger, isInventoryOpen, inventorySlots, draggedStack, placedItems, setIsInventoryOpen, handleBoundaryHit, showSpeechBubble, hideSpeechBubble, handleInteractionInspect, handleInventoryDropHit, handleInventoryDropMiss, handleInventoryDropOnPlayer, handlePickupPlacedItem, updatePlacedItemPosition, movePlacedItemToPlayer, removePlacedItemById, handleStartInventoryDrag } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$runtime$2f$useInventoryRuntimeController$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInventoryRuntimeController"])({
        sceneId,
        sceneInteractions,
        playerPosition,
        onRuntimeEvent: handleRuntimeEvent
    });
    const { updateInteractionPosition, updateInteractionHalfSize, updateInteractionRotationDeg, moveInteractionToPlayer } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$runtime$2f$useInteractionEditorController$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInteractionEditorController"])({
        playerPosition,
        scenePlayerSpawnY: scenePlayerSpawn[1],
        updateInteraction
    });
    const readyMessage = `${selectedCharacter} listo — flechas/WASD o click para moverse`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: "fixed",
            inset: 0,
            width: "100dvw",
            height: "100dvh",
            overflow: "hidden"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$PixelLoader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PixelLoader"], {
                ready: sceneReady
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/GameTouchCanvas.tsx",
                lineNumber: 142,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Canvas"], {
                gl: {
                    alpha: false,
                    antialias: true,
                    preserveDrawingBuffer: false
                },
                onPointerDownCapture: ()=>setIsInventoryOpen(false),
                onCreated: (state)=>{
                    try {
                        const glCtx = state.gl.getContext();
                        console.log("Three: renderer created", {
                            contextAttributes: glCtx?.getContextAttributes?.(),
                            version: glCtx?.getParameter?.(glCtx.VERSION),
                            shadingLanguageVersion: glCtx?.getParameter?.(glCtx.SHADING_LANGUAGE_VERSION)
                        });
                        state.gl.setClearColor(0x0f0f10, 1);
                        state.gl.clear();
                    } catch (err) {
                        console.error("Three: onCreated error", err);
                    }
                },
                style: {
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1,
                    background: "transparent",
                    display: "block"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$OrthographicCamera$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OrthographicCamera"], {
                        makeDefault: true,
                        position: CAMERA_POSITION,
                        rotation: [
                            -0.24,
                            0,
                            0
                        ],
                        near: 0.01,
                        far: 120
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/GameTouchCanvas.tsx",
                        lineNumber: 163,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$scene$2f$SceneCameraControllers$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CameraFitHeight"], {
                        desiredWorldHeight: 19.28
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/GameTouchCanvas.tsx",
                        lineNumber: 164,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ambientLight", {
                        intensity: 1.1,
                        color: "#8bc2ff"
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/GameTouchCanvas.tsx",
                        lineNumber: 166,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                        position: [
                            3,
                            9,
                            6
                        ],
                        intensity: 1.5,
                        color: "#d8ecff"
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/GameTouchCanvas.tsx",
                        lineNumber: 167,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$scene$2f$SceneBackgroundPlane$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SceneBackgroundPlane"], {
                        url: sceneBackground
                    }, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/GameTouchCanvas.tsx",
                        lineNumber: 168,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$scene$2f$SceneCameraControllers$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CameraController"], {}, void 0, false, {
                        fileName: "[project]/apps/web-demo/app/components/GameTouchCanvas.tsx",
                        lineNumber: 169,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$rapier$2f$dist$2f$react$2d$three$2d$rapier$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Physics"], {
                        gravity: [
                            0,
                            -20,
                            0
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Suspense"], {
                                fallback: null,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$lib$2f$engine$2f$runtime$2f$GameTouchSpriteRuntime$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GameTouchSpriteRuntime"], {
                                        activeCharacter: selectedCharacter,
                                        debug: runtimeDebug,
                                        showDebugGround: isDebugGroundVisible,
                                        showDebugWalls: isDebugWallsVisible,
                                        wallToolMode: wallToolMode,
                                        wallPointResetSignal: wallPointResetSignal,
                                        speechText: speechText,
                                        speechVisible: speechVisible,
                                        speechTrigger: speechTrigger,
                                        speechCharsPerSecond: speechCharsPerSecond,
                                        onBoundaryHit: handleBoundaryHit,
                                        onSpeechDismiss: hideSpeechBubble,
                                        onRuntimeEvent: handleRuntimeEvent
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web-demo/app/components/GameTouchCanvas.tsx",
                                        lineNumber: 172,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SceneReadyReporter, {
                                        onReady: handleSceneReady
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web-demo/app/components/GameTouchCanvas.tsx",
                                        lineNumber: 187,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web-demo/app/components/GameTouchCanvas.tsx",
                                lineNumber: 171,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$inventory$2f$SceneDropTargets$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SceneDropTargets"], {
                                targets: sceneInteractions,
                                draggedStack: draggedStack ? {
                                    stack: draggedStack.stack,
                                    fromSlotIndex: draggedStack.fromSlotIndex
                                } : null,
                                onDropHit: handleInventoryDropHit,
                                onDropMiss: handleInventoryDropMiss,
                                onInspect: handleInteractionInspect,
                                playerDropTarget: {
                                    position: playerPosition,
                                    onDrop: handleInventoryDropOnPlayer
                                }
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/components/GameTouchCanvas.tsx",
                                lineNumber: 189,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$inventory$2f$PlacedSceneItems$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlacedSceneItems"], {
                                items: placedItems,
                                onPickup: handlePickupPlacedItem,
                                canPickup: !isInventoryOpen
                            }, void 0, false, {
                                fileName: "[project]/apps/web-demo/app/components/GameTouchCanvas.tsx",
                                lineNumber: 200,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web-demo/app/components/GameTouchCanvas.tsx",
                        lineNumber: 170,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web-demo/app/components/GameTouchCanvas.tsx",
                lineNumber: 144,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Joystick, {}, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/GameTouchCanvas.tsx",
                lineNumber: 208,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$InventoryUI$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["InventoryUI"], {
                isOpen: isInventoryOpen,
                slots: inventorySlots,
                onToggle: ()=>setIsInventoryOpen((open)=>!open),
                onStartDrag: handleStartInventoryDrag
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/GameTouchCanvas.tsx",
                lineNumber: 209,
                columnNumber: 7
            }, this),
            draggedStack && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$InventoryUI$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DraggedInventoryGhost"], {
                stack: draggedStack.stack,
                initialPointerX: draggedStack.pointerX,
                initialPointerY: draggedStack.pointerY
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/GameTouchCanvas.tsx",
                lineNumber: 216,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$debug$2f$DebugOverlayRuntimePanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DebugOverlayRuntimePanel"], {
                isDebug: runtimeDebug,
                debugPanelSide: debugPanelSide,
                setDebugPanelSide: setDebugPanelSide,
                isDebugGroundVisible: isDebugGroundVisible,
                setIsDebugGroundVisible: setIsDebugGroundVisible,
                isDebugWallsVisible: isDebugWallsVisible,
                setIsDebugWallsVisible: setIsDebugWallsVisible,
                sceneId: sceneId,
                setScene: setScene,
                sceneOptions: sceneOptions,
                readyMessage: readyMessage,
                requestRespawn: requestRespawn,
                editorMode: editorMode,
                setEditorMode: setEditorMode,
                wallToolMode: wallToolMode,
                handleWallToolModeChange: handleWallToolModeChange,
                resetWallPointTool: resetWallPointTool,
                speechDraft: speechDraft,
                setSpeechDraft: setSpeechDraft,
                speechCharsPerSecond: speechCharsPerSecond,
                setSpeechCharsPerSecond: setSpeechCharsPerSecond,
                showSpeechBubble: showSpeechBubble,
                hideSpeechBubble: hideSpeechBubble,
                speechVisible: speechVisible,
                sceneInteractions: sceneInteractions,
                updateInteractionPosition: updateInteractionPosition,
                updateInteractionHalfSize: updateInteractionHalfSize,
                updateInteractionRotationDeg: updateInteractionRotationDeg,
                moveInteractionToPlayer: moveInteractionToPlayer,
                resetInteractionsFromSceneConfig: resetInteractionsFromSceneConfig,
                placedItems: placedItems,
                updatePlacedItemPosition: updatePlacedItemPosition,
                movePlacedItemToPlayer: movePlacedItemToPlayer,
                removePlacedItemById: removePlacedItemById
            }, void 0, false, {
                fileName: "[project]/apps/web-demo/app/components/GameTouchCanvas.tsx",
                lineNumber: 222,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web-demo/app/components/GameTouchCanvas.tsx",
        lineNumber: 140,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web-demo/app/lib/engine/publicApi.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GameViewport",
    ()=>GameViewport,
    "createGameRuntime",
    ()=>createGameRuntime,
    "getGameActions",
    ()=>getGameActions,
    "getGameState",
    ()=>getGameState,
    "registerItem",
    ()=>registerItem,
    "registerRule",
    ()=>registerRule,
    "registerScene",
    ()=>registerScene,
    "useGameActions",
    ()=>useGameActions,
    "useGameState",
    ()=>useGameState
]);
/**
 * Public API mínima del motor de juego.
 *
 * Este módulo expone contratos estables e independientes de demo/content.
 * Usa estos tipos y funciones para integrar el engine desde fuera sin
 * acoplar a imports internos de app/demo/content.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2f$shallow$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react/shallow.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/engine-core/dist/game/state/sceneStore.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$GameTouchCanvas$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web-demo/app/components/GameTouchCanvas.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function toGameState(state) {
    return {
        sceneId: state.sceneId,
        scene: state.scene,
        playerPosition: state.playerPosition,
        respawnSignal: state.respawnSignal
    };
}
// ---------------------------------------------------------------------------
// Registros internos (singleton)
// ---------------------------------------------------------------------------
const _sceneRegistry = new Map();
const _itemRegistry = new Map();
const _ruleRegistry = new Map();
function registerScene(config) {
    _sceneRegistry.set(config.id, config);
}
function registerItem(config) {
    _itemRegistry.set(config.id, config);
}
function registerRule(config) {
    _ruleRegistry.set(config.key, config);
}
function createGameRuntime(config = {}) {
    for (const scene of config.scenes ?? []){
        registerScene(scene);
    }
    for (const item of config.items ?? []){
        registerItem(item);
    }
    for (const rule of config.rules ?? []){
        registerRule(rule);
    }
    return {
        getScenes: ()=>Object.fromEntries(_sceneRegistry),
        getItems: ()=>Object.fromEntries(_itemRegistry),
        getRules: ()=>Object.fromEntries(_ruleRegistry)
    };
}
function getGameState() {
    return toGameState(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"].getState());
}
function getGameActions() {
    const state = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"].getState();
    return {
        setScene: (id)=>{
            const sceneConfig = _sceneRegistry.get(id);
            if (!sceneConfig) {
                console.warn(`Scene not registered: ${id}`);
                return;
            }
            state.setScene(id, {
                id: sceneConfig.id,
                label: sceneConfig.label,
                background: sceneConfig.background,
                playerSpawn: sceneConfig.playerSpawn,
                ground: sceneConfig.ground,
                walls: sceneConfig.walls,
                interactions: sceneConfig.interactions
            });
        },
        setPlayerPosition: state.setPlayerPosition,
        requestRespawn: state.requestRespawn
    };
}
function useGameState(selector) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((state)=>selector(toGameState(state)));
}
function useGameActions() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$engine$2d$core$2f$dist$2f$game$2f$state$2f$sceneStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSceneStore"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2f$shallow$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useShallow"])((state)=>({
            setScene: (id)=>{
                const sceneConfig = _sceneRegistry.get(id);
                if (!sceneConfig) {
                    console.warn(`Scene not registered: ${id}`);
                    return;
                }
                state.setScene(id, {
                    id: sceneConfig.id,
                    label: sceneConfig.label,
                    background: sceneConfig.background,
                    playerSpawn: sceneConfig.playerSpawn,
                    ground: sceneConfig.ground,
                    walls: sceneConfig.walls,
                    interactions: sceneConfig.interactions
                });
            },
            setPlayerPosition: state.setPlayerPosition,
            requestRespawn: state.requestRespawn
        })));
}
function GameViewport({ debug, onRuntimeEvent }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2d$demo$2f$app$2f$components$2f$GameTouchCanvas$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        debug,
        onRuntimeEvent
    });
}
}),
];

//# sourceMappingURL=_0o~4zuw._.js.map