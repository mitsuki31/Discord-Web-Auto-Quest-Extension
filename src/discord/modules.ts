import type { ModuleFilter, WebpackRequire } from "../types";

export function findModule<T>(
  webpackRequire: WebpackRequire,
  filter: ModuleFilter<T>,
): T | null {
  for (const module of Object.values(webpackRequire.c)) {
    const exports = module.exports;

    if (!exports || typeof exports !== "object") {
      continue;
    }

    const record = exports as Record<string, unknown>;

    const candidates = [
      record.A,
      record.Ay,
      record.ZP,
      exports,
    ];

    for (const candidate of candidates) {
      if (filter(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}
