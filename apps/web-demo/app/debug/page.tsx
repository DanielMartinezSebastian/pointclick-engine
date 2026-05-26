import { notFound } from "next/navigation";
import GameTouchCanvas from "../components/GameTouchCanvas";

export default function DebugPage() {
  const isDebugEnabled = process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true";
  const isProduction = process.env.NODE_ENV === "production";

  if (!isDebugEnabled || isProduction) {
    notFound();
  }

  return <GameTouchCanvas />;
}