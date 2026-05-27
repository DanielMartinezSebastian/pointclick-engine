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
export class CommandHandler {
    constructor(opts) {
        this.executors = {};
        this.unknownLogger =
            opts?.onUnknown ??
                ((cmd) => console.warn(`[CommandHandler] no executor for: ${cmd.type}`));
    }
    /**
     * Registra un executor para un tipo de comando.
     * Sobrescribe si ya existía uno para ese tipo.
     * @returns unsubscribe — llámalo para eliminar el executor.
     */
    register(type, executor) {
        this.executors[type] = executor;
        return () => {
            delete this.executors[type];
        };
    }
    /**
     * Ejecuta un comando. Sync, fire-and-forget.
     * Si no hay executor registrado para el tipo, invoca `onUnknown`.
     */
    execute(cmd) {
        const executor = this.executors[cmd.type];
        if (!executor) {
            this.unknownLogger(cmd);
            return;
        }
        executor(cmd);
    }
    /** Para tests e introspección: lista de tipos con executor registrado. */
    registeredTypes() {
        return Object.keys(this.executors);
    }
    /** Elimina todos los executors registrados. */
    clear() {
        this.executors = {};
    }
}
//# sourceMappingURL=CommandHandler.js.map