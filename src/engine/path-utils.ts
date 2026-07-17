import type { JsonValue } from "@/contracts/game-state";

export function getPath(root: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (value && typeof value === "object" && key in value) return (value as Record<string, unknown>)[key];
    return undefined;
  }, root);
}

export function setPath(root: Record<string, unknown>, path: string, value: JsonValue): void {
  const keys = path.split(".");
  let cursor: Record<string, unknown> = root;
  for (const key of keys.slice(0, -1)) {
    const next = cursor[key];
    if (!next || typeof next !== "object" || Array.isArray(next)) cursor[key] = {};
    cursor = cursor[key] as Record<string, unknown>;
  }
  const last = keys.at(-1);
  if (last) cursor[last] = value;
}
