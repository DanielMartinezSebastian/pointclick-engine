import type { GameCommand, GameCommandType } from "./types";
type Executor<T extends GameCommandType> = (cmd: Extract<GameCommand, {
    type: T;
}>) => void;
/**
 * Despachador de comandos tipo-seguro.
 *
 * Completamente agnóstico: no importa nada de sceneStore, React ni R3F.
 * El cableado a stores concretos se realiza desde el runtime (createGameRuntime)
 * registrando executors via `register()`.
 *
 * Behavior:
 * - Comando sin executor: invoca `onUnknown` (default: console.warn) y retorna.
 * - Múltiples `register()` para el mismo tipo: el último gana.
 * - `register()` retorna un `unsubscribe` para quitar el executor.
 *
 * Ver ADR-0006 para decisiones de diseño.
 */
export declare class CommandHandler {
    private executors;
    private unknownLogger;
    constructor(opts?: {
        onUnknown?: (cmd: GameCommand) => void;
    });
    /**
     * Registra un executor para un tipo de comando.
     * Sobrescribe si ya existía uno para ese tipo.
     * @returns unsubscribe — llámalo para eliminar el executor.
     */
    register<T extends GameCommandType>(type: T, executor: Executor<T>): () => void;
    /**
     * Ejecuta un comando. Sync, fire-and-forget.
     * Si no hay executor registrado para el tipo, invoca `onUnknown`.
     */
    execute(cmd: GameCommand): void;
    /** Para tests e introspección: lista de tipos con executor registrado. */
    registeredTypes(): GameCommandType[];
    /** Elimina todos los executors registrados. */
    clear(): void;
}
export {};
//# sourceMappingURL=CommandHandler.d.ts.map