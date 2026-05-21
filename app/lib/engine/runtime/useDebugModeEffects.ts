"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const DEBUG_ROUTE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true";

export function useDebugModeEffects() {
  const pathname = usePathname();
  const isDebug = DEBUG_ROUTE_ENABLED && pathname === "/debug";

  useEffect(() => {
    console.log("GameTouchCanvas: debug mode ->", isDebug, { pathname });
  }, [isDebug, pathname]);

  useEffect(() => {
    if (!isDebug) return;

    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-debug-cursor-override", "true");
    styleEl.innerHTML = "* { cursor: auto !important; }";
    document.head.appendChild(styleEl);

    return () => {
      styleEl.remove();
    };
  }, [isDebug]);

  return {
    isDebug,
  };
}
