import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Core agnosticism guard: ensures the core never imports framework-specific
 * code (React, R3F, Three.js, Next.js) and doesn't use browser APIs directly
 * without proper guards.
 */
describe("core agnosticism", () => {
  const coreDir = join(__dirname, "..");
  const forbiddenImports = [
    /\bimport\s+.*\bfrom\s+["']react["']/,
    /\bimport\s+.*\bfrom\s+["']react-dom["']/,
    /\bimport\s+.*\bfrom\s+["']three["']/,
    /\bimport\s+.*\bfrom\s+["']next["']/,
    /\bimport\s+.*\bfrom\s+["']@react-three\//,
  ];

  const browserApiPatterns = [
    { pattern: /\bwindow\./, name: "window." },
    { pattern: /\bdocument\./, name: "document." },
    { pattern: /\blocalStorage/, name: "localStorage" },
    { pattern: /\bnavigator\./, name: "navigator." },
  ];

  function isComment(line: string): boolean {
    const trimmed = line.trim();
    return (
      trimmed.startsWith("//") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("/*")
    );
  }

  function scanFiles(dir: string): Array<{ file: string; path: string }> {
    const files: Array<{ file: string; path: string }> = [];

    function scan(currentDir: string) {
      const entries = readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);
        if (entry.isDirectory()) {
          // Skip __tests__ directory
          if (entry.name !== "__tests__") {
            scan(fullPath);
          }
        } else if (
          entry.name.endsWith(".ts") &&
          !entry.name.endsWith(".test.ts")
        ) {
          files.push({
            file: entry.name,
            path: fullPath,
          });
        }
      }
    }

    scan(dir);
    return files;
  }

  it("should not import framework-specific code", () => {
    const files = scanFiles(coreDir);
    const violations: string[] = [];

    for (const { path } of files) {
      const content = readFileSync(path, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const pattern of forbiddenImports) {
          if (pattern.test(line)) {
            const relPath = relative(
              join(coreDir, ".."),
              path,
            );
            violations.push(`${relPath}:${i + 1}`);
          }
        }
      }
    }

    expect(violations, violations.join("\n")).toHaveLength(0);
  });

  it("should not use browser APIs without guards", () => {
    const files = scanFiles(coreDir);
    const violations: string[] = [];

    for (const { path } of files) {
      const content = readFileSync(path, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip comments
        if (isComment(line)) {
          continue;
        }

        for (const { pattern, name } of browserApiPatterns) {
          if (pattern.test(line)) {
            const relPath = relative(
              join(coreDir, ".."),
              path,
            );
            violations.push(
              `${relPath}:${i + 1} (${name})`,
            );
          }
        }
      }
    }

    expect(violations, violations.join("\n")).toHaveLength(0);
  });

  it("should guard process.env with typeof check", () => {
    const files = scanFiles(coreDir);
    const violations: string[] = [];

    for (const { path } of files) {
      const content = readFileSync(path, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip comments
        if (isComment(line)) {
          continue;
        }

        // Check if line contains process.env
        if (line.includes("process.env")) {
          // Check if the same line also has typeof process guard
          if (!line.includes("typeof process")) {
            const relPath = relative(
              join(coreDir, ".."),
              path,
            );
            violations.push(`${relPath}:${i + 1}`);
          }
        }
      }
    }

    expect(violations, violations.join("\n")).toHaveLength(0);
  });
});
