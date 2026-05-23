"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { browserEnvironmentAdapter } from "../../platform-web";

const DEBUG_ROUTE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true";

export function useDebugModeEffects() {
  const pathname = usePathname();
  const isDebug = DEBUG_ROUTE_ENABLED && pathname === "/debug";

  useEffect(() => {
    console.log("GameTouchCanvas: debug mode ->", isDebug, { pathname });
  }, [isDebug, pathname]);

  useEffect(() => {
    if (!isDebug) return;

    return browserEnvironmentAdapter.mountStyleTag(
      "data-debug-cursor-override",
      "true",
      "* { cursor: auto !important; }",
    );
  }, [isDebug]);

  return {
    isDebug,
  };
}
