import type { GameEvent } from "./types";
import type { RuntimeEvent } from "../types";
/**
 * Mapea un RuntimeEvent legacy (onMove/onCollide/onDrop/onDialog)
 * al nuevo GameEvent equivalente. Permite mantener el callback
 * `onRuntimeEvent` mientras el bus es la fuente de verdad.
 */
export declare function legacyRuntimeEventToGameEvent(ev: RuntimeEvent): GameEvent;
/**
 * Inverso: GameEvent → RuntimeEvent (solo los 4 legacy soportados).
 * Retorna null para eventos sin equivalente legacy (ej. scene:changed).
 */
export declare function gameEventToLegacyRuntimeEvent(ev: GameEvent): RuntimeEvent | null;
//# sourceMappingURL=legacyAdapter.d.ts.map