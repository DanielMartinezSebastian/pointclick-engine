export class EventBus {
    constructor() {
        this.listeners = new Map();
    }
    on(event, handler) {
        if (!this.listeners.has(event))
            this.listeners.set(event, []);
        const handlers = this.listeners.get(event);
        handlers.push(handler);
        return () => {
            const i = handlers.indexOf(handler);
            if (i > -1)
                handlers.splice(i, 1);
        };
    }
    emit(event, data) {
        this.listeners.get(event)?.forEach((h) => h(data));
    }
    clear() {
        this.listeners.clear();
    }
}
//# sourceMappingURL=EventBus.js.map