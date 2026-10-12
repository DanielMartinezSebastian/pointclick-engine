"use client";

// Mochila de /adventure. Variante de `app/components/InventoryUI.tsx`: aquel módulo importa
// `gamePersistence` (que hidrata los stores con la partida de `/` y borra sus claves al reiniciar),
// así que la aventura trae la suya, con «nueva partida» sobre su propia partida.
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

import { LocaleSwitcher, useI18n } from "@pointclick-engine/engine-renderer-r3f";

import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { MuteToggle } from "../components/MuteToggle";
import { adventureAudioSettings, clearAdventureProgress } from "./adventureRuntime";

export type InventoryStack = {
  id: string;
  name: string;
  spriteUrl: string;
  quantity: number;
};

function slotStyle(occupied: boolean): CSSProperties {
  return {
    width: "100%",
    aspectRatio: "1 / 1",
    minWidth: 0,
    border: "3px solid rgb(132 230 255 / 78%)",
    borderRadius: "4px",
    background: occupied
      ? "linear-gradient(180deg, rgb(26 82 112 / 100%) 0%, rgb(10 32 48 / 100%) 100%)"
      : "linear-gradient(180deg, rgb(8 18 30 / 100%) 0%, rgb(5 11 20 / 100%) 100%)",
    boxShadow: "inset 0 0 0 2px rgb(255 255 255 / 6%), inset 0 -3px 0 rgb(0 0 0 / 24%), 0 3px 0 rgb(0 0 0 / 24%)",
    display: "grid",
    placeItems: "center",
    position: "relative",
    padding: 0,
    cursor: occupied ? "grab" : "default",
    touchAction: "none",
  };
}

export function AdventureInventory({
  isOpen,
  slots,
  onToggle,
  onStartDrag,
  isDragging = false,
  onDropOnSlot,
}: {
  isOpen: boolean;
  slots: Array<InventoryStack | null>;
  onToggle: () => void;
  onStartDrag: (slotIndex: number, clientX: number, clientY: number) => void;
  /** Hay un ítem arrastrado: el panel se queda visible para poder soltarlo sobre otro slot. */
  isDragging?: boolean;
  /** Se suelta el ítem arrastrado sobre un slot; `true` si lo ha consumido (combinación). */
  onDropOnSlot?: (slotIndex: number) => boolean;
}) {
  const { t } = useI18n();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const audio = useSyncExternalStore(
    adventureAudioSettings.subscribe,
    adventureAudioSettings.getState,
    adventureAudioSettings.getState,
  );
  const isPanelOpen = isOpen || isDragging;

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>, slotIndex: number) => {
    if (event.button !== 0) return;
    event.preventDefault();
    onStartDrag(slotIndex, event.clientX, event.clientY);
  };

  return (
    <>
      <ConfirmationDialog
        isOpen={isResetConfirmOpen}
        title={t("adv.newGame")}
        message={t("adv.newGame.confirm")}
        confirmText={t("adv.newGame")}
        cancelText={t("adv.cancel")}
        isDangerous
        onConfirm={() => {
          clearAdventureProgress();
          window.location.reload();
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? t("adv.inventory.close") : t("adv.inventory.open")}
        style={{
          position: "absolute",
          left: "18px",
          bottom: "18px",
          width: "126px",
          height: "126px",
          border: "none",
          background: "transparent",
          display: "grid",
          placeItems: "center",
          zIndex: 40,
          cursor: "pointer",
        }}
      >
        <Image
          src="/assets/backpack/rotations/south.png"
          alt={t("adv.inventory")}
          width={93}
          height={93}
          unoptimized
          style={{ width: "93px", height: "93px", imageRendering: "pixelated" }}
        />
      </button>
      {isPanelOpen && (
        <div style={{ position: "absolute", left: "18px", bottom: "118px", zIndex: 41 }}>
          <div
            style={{
              position: "relative",
              border: "4px solid rgb(140 227 255 / 88%)",
              borderRadius: "6px",
              background: "linear-gradient(180deg, rgb(10 29 45 / 100%) 0%, rgb(4 11 18 / 100%) 100%)",
              boxShadow: "0 16px 0 rgb(0 0 0 / 26%), 0 18px 36px rgb(0 0 0 / 35%), inset 0 0 0 2px rgb(255 255 255 / 8%)",
              padding: "14px",
              width: "236px",
            }}
          >
            <button
              type="button"
              onClick={onToggle}
              aria-label={t("adv.inventory.close")}
              style={{
                position: "absolute",
                top: "-16px",
                right: "-16px",
                width: "30px",
                height: "30px",
                border: "3px solid rgb(95 16 20 / 100%)",
                borderRadius: "999px",
                background: "linear-gradient(180deg, rgb(255 110 120 / 100%) 0%, rgb(173 31 44 / 100%) 100%)",
                color: "#fff3f3",
                fontSize: "16px",
                fontWeight: 900,
                cursor: "pointer",
                padding: 0,
                zIndex: 3,
              }}
            >
              X
            </button>
            <strong
              style={{
                color: "#bff4ff",
                fontSize: "18px",
                letterSpacing: "1.5px",
                display: "block",
                width: "100%",
                textAlign: "center",
                textTransform: "uppercase",
                borderBottom: "2px solid rgb(132 230 255 / 75%)",
                paddingBottom: "4px",
              }}
            >
              {t("adv.inventory")}
            </strong>
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "8px 12px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#fff3f3",
                backgroundColor: "rgb(173 31 44 / 100%)",
                border: "2px solid rgb(95 16 20 / 100%)",
                borderRadius: "4px",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {t("adv.newGame")}
            </button>
            <div style={{ display: "grid", gap: "6px", marginTop: "10px" }}>
              <MuteToggle
                icon={audio.masterMuted ? "🔇" : "🔊"}
                label={audio.masterMuted ? t("adv.sound.off") : t("adv.sound")}
                pressed={audio.masterMuted}
                onClick={() => adventureAudioSettings.setMasterMuted(!audio.masterMuted)}
              />
            </div>
            <div style={{ display: "flex", gap: "4px", alignItems: "center", justifyContent: "center", marginTop: "10px" }}>
              <LocaleSwitcher
                ariaLabel={t("adv.language")}
                renderOption={({ locale, isActive, onClick }) => (
                  <button
                    key={locale}
                    type="button"
                    onClick={onClick}
                    aria-current={isActive ? "true" : undefined}
                    aria-label={locale === "es" ? "Español" : "English"}
                    style={{
                      fontSize: "22px",
                      lineHeight: 1,
                      padding: "3px 5px",
                      border: "2px solid",
                      borderColor: isActive ? "rgb(132 230 255 / 88%)" : "transparent",
                      borderRadius: "4px",
                      background: isActive ? "rgb(26 82 112 / 60%)" : "transparent",
                      cursor: "pointer",
                      opacity: isActive ? 1 : 0.45,
                    }}
                  >
                    {locale === "es" ? "🇪🇸" : "🇬🇧"}
                  </button>
                )}
              />
            </div>
            <div style={{ marginTop: "10px", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "9px" }}>
              {slots.map((stack, index) => (
                <button
                  key={`slot-${index}`}
                  type="button"
                  onPointerDown={(event) => handlePointerDown(event, index)}
                  onPointerUp={(event) => {
                    // Soltar sobre otro slot ocupado combina; el evento no debe llegar al
                    // "suelta fuera de una diana" de la escena (escucha en window).
                    if (onDropOnSlot?.(index)) event.nativeEvent.stopPropagation();
                  }}
                  style={slotStyle(Boolean(stack))}
                  aria-label={
                    stack ? `Slot ${index + 1}: ${t(stack.name)}` : t("adv.slot.empty", { vars: { n: index + 1 } })
                  }
                >
                  {stack && (
                    <div style={{ position: "relative", width: "44px", height: "44px", pointerEvents: "none" }}>
                      <Image
                        src={stack.spriteUrl}
                        alt={t(stack.name)}
                        fill
                        sizes="44px"
                        unoptimized
                        style={{ objectFit: "contain", imageRendering: "pixelated", pointerEvents: "none" }}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Copia del ítem arrastrado siguiendo al puntero. */
export function AdventureDragGhost({
  stack,
  pointerX,
  pointerY,
}: {
  stack: InventoryStack;
  pointerX: number;
  pointerY: number;
}) {
  const [pointer, setPointer] = useState({ x: pointerX, y: pointerY });
  useEffect(() => {
    const move = (event: PointerEvent) => setPointer({ x: event.clientX, y: event.clientY });
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        left: `${pointer.x}px`,
        top: `${pointer.y}px`,
        transform: "translate(-50%, -50%)",
        width: "92px",
        height: "92px",
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
        zIndex: 90,
      }}
    >
      <Image
        src={stack.spriteUrl}
        alt={stack.name}
        width={64}
        height={64}
        unoptimized
        style={{ width: "64px", height: "64px", objectFit: "contain", imageRendering: "pixelated" }}
      />
    </div>
  );
}
