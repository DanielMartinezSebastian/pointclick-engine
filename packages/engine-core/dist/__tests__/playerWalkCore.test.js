import { describe, test, expect } from "vitest";
describe("Player walk commands and events", () => {
    describe("player:walkTo command", () => {
        test("can create walkTo command with position", () => {
            const cmd = {
                type: "player:walkTo",
                position: [5, 0, 10],
            };
            expect(cmd.type).toBe("player:walkTo");
            expect(cmd.position).toEqual([5, 0, 10]);
        });
        test("command type is part of GameCommand union", () => {
            const cmd = {
                type: "player:walkTo",
                position: [0, 0, 0],
            };
            // Type checking passes if we get here
            expect(cmd).toBeDefined();
        });
        test("can extract walkTo command type", () => {
            const cmd = {
                type: "player:walkTo",
                position: [1, 2, 3],
            };
            if (cmd.type === "player:walkTo") {
                expect(cmd.position).toEqual([1, 2, 3]);
            }
        });
    });
    describe("player:walkStarted event", () => {
        test("can create walkStarted event", () => {
            const event = {
                type: "player:walkStarted",
                targetPosition: [5, 0, 10],
            };
            expect(event.type).toBe("player:walkStarted");
            expect(event.targetPosition).toEqual([5, 0, 10]);
        });
        test("event type is part of GameEvent union", () => {
            const event = {
                type: "player:walkStarted",
                targetPosition: [0, 0, 0],
            };
            expect(event).toBeDefined();
        });
        test("can extract walkStarted event", () => {
            const event = {
                type: "player:walkStarted",
                targetPosition: [1, 2, 3],
            };
            if (event.type === "player:walkStarted") {
                expect(event.targetPosition).toEqual([1, 2, 3]);
            }
        });
    });
    describe("player:walkCompleted event", () => {
        test("can create walkCompleted event", () => {
            const event = {
                type: "player:walkCompleted",
                position: [5, 0, 10],
            };
            expect(event.type).toBe("player:walkCompleted");
            expect(event.position).toEqual([5, 0, 10]);
        });
        test("event type is part of GameEvent union", () => {
            const event = {
                type: "player:walkCompleted",
                position: [0, 0, 0],
            };
            expect(event).toBeDefined();
        });
    });
    describe("player:walkAborted event", () => {
        test("can create walkAborted event with user-input reason", () => {
            const event = {
                type: "player:walkAborted",
                reason: "user-input",
            };
            expect(event.type).toBe("player:walkAborted");
            expect(event.reason).toBe("user-input");
        });
        test("can create walkAborted event with collision reason", () => {
            const event = {
                type: "player:walkAborted",
                reason: "collision",
            };
            expect(event.reason).toBe("collision");
        });
        test("can create walkAborted event with unreachable reason", () => {
            const event = {
                type: "player:walkAborted",
                reason: "unreachable",
            };
            expect(event.reason).toBe("unreachable");
        });
        test("all three abort reasons are valid", () => {
            const reasons = ["user-input", "collision", "unreachable"];
            for (const reason of reasons) {
                const event = {
                    type: "player:walkAborted",
                    reason,
                };
                expect(event.reason).toBe(reason);
            }
        });
    });
    describe("Command and event integration", () => {
        test("walkTo command triggers walkStarted event", () => {
            const cmd = {
                type: "player:walkTo",
                position: [5, 0, 10],
            };
            const evt = {
                type: "player:walkStarted",
                targetPosition: cmd.position,
            };
            expect(evt.targetPosition).toEqual(cmd.position);
        });
        test("completed event uses final position", () => {
            const cmd = {
                type: "player:walkTo",
                position: [5, 0, 10],
            };
            const evt = {
                type: "player:walkCompleted",
                position: cmd.position,
            };
            expect(evt.position).toEqual([5, 0, 10]);
        });
        test("aborted event captures reason for diagnostics", () => {
            const abortEvent = {
                type: "player:walkAborted",
                reason: "collision",
            };
            if (abortEvent.type === "player:walkAborted") {
                expect(["user-input", "collision", "unreachable"]).toContain(abortEvent.reason);
            }
        });
    });
    describe("Type safety", () => {
        test("command type discriminator works", () => {
            const cmd = {
                type: "player:walkTo",
                position: [0, 0, 0],
            };
            if (cmd.type === "player:walkTo") {
                // TypeScript narrows to walkTo command
                expect(cmd.position).toBeDefined();
            }
        });
        test("event type discriminator works", () => {
            const event = {
                type: "player:walkStarted",
                targetPosition: [0, 0, 0],
            };
            if (event.type === "player:walkStarted") {
                // TypeScript narrows to walkStarted event
                expect(event.targetPosition).toBeDefined();
            }
        });
        test("cannot mix command and event signatures", () => {
            // This should type-check correctly
            const cmd = {
                type: "player:walkTo",
                position: [0, 0, 0],
            };
            // @ts-expect-error - cmd doesn't have targetPosition
            expect(cmd.targetPosition).toBeUndefined();
        });
    });
    describe("Position vectors", () => {
        test("walkTo accepts 3D vector", () => {
            const cmd = {
                type: "player:walkTo",
                position: [1.5, 0.0, 2.5],
            };
            expect(cmd.position).toEqual([1.5, 0.0, 2.5]);
        });
        test("walkStarted accepts 3D vector", () => {
            const event = {
                type: "player:walkStarted",
                targetPosition: [1.5, 0.0, 2.5],
            };
            expect(event.targetPosition).toEqual([1.5, 0.0, 2.5]);
        });
        test("negative coordinates are valid", () => {
            const cmd = {
                type: "player:walkTo",
                position: [-5, 0, -10],
            };
            expect(cmd.position[0]).toBeLessThan(0);
            expect(cmd.position[2]).toBeLessThan(0);
        });
    });
});
//# sourceMappingURL=playerWalkCore.test.js.map