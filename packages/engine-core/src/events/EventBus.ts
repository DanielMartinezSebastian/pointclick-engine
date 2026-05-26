type EventHandler<T = unknown> = (data: T) => void;

export class EventBus {
  private listeners = new Map<string, EventHandler[]>();

  on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    const handlers = this.listeners.get(event)!;
    handlers.push(handler as EventHandler);
    return () => {
      const i = handlers.indexOf(handler as EventHandler);
      if (i > -1) handlers.splice(i, 1);
    };
  }

  emit<T = unknown>(event: string, data: T): void {
    this.listeners.get(event)?.forEach((h) => h(data));
  }

  clear(): void {
    this.listeners.clear();
  }
}
