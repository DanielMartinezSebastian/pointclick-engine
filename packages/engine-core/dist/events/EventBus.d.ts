type EventHandler<T = unknown> = (data: T) => void;
export declare class EventBus {
    private listeners;
    on<T = unknown>(event: string, handler: EventHandler<T>): () => void;
    emit<T = unknown>(event: string, data: T): void;
    clear(): void;
}
export {};
//# sourceMappingURL=EventBus.d.ts.map