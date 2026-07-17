import type { GameState } from "@/contracts/game-state";
import type { EventReceipt, StoryEvent } from "@/contracts/story-event";
import type { SaveEnvelope } from "@/contracts/save";
import { indexedDbSaveAdapter } from "./indexed-db";

const SLOT = "main";

type PendingSave = {
  state: GameState;
  journal: StoryEvent[];
  receipts: EventReceipt[];
};

let pendingSave: PendingSave | null = null;
let drainPromise: Promise<void> | null = null;
let createdAtCache: string | null = null;

async function hash(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((v) => v.toString(16).padStart(2,"0")).join("");
}

async function writeSave(payload: PendingSave): Promise<void> {
  const now = new Date().toISOString();
  if (!createdAtCache) {
    const current = await indexedDbSaveAdapter.load(SLOT);
    createdAtCache = current?.createdAt ?? now;
  }
  const body = JSON.stringify({state: payload.state, journal: payload.journal, receipts: payload.receipts});
  const envelope: SaveEnvelope = {
    schemaVersion: 1,
    contentPackVersion: "0.1.0",
    createdAt: createdAtCache,
    updatedAt: now,
    snapshot: payload.state,
    journal: payload.journal,
    receipts: payload.receipts,
    integrityHash: await hash(body),
    migrationsApplied: []
  };
  await indexedDbSaveAdapter.commit(SLOT, envelope);
}

async function drainSaveQueue(): Promise<void> {
  try {
    while (pendingSave) {
      const next = pendingSave;
      pendingSave = null;
      await writeSave(next);
    }
  } finally {
    drainPromise = null;
    if (pendingSave) drainPromise = drainSaveQueue();
  }
}

export async function loadSave(): Promise<SaveEnvelope | null> {
  const save = await indexedDbSaveAdapter.load(SLOT);
  createdAtCache = save?.createdAt ?? null;
  return save;
}

/**
 * Coalesces rapid UI updates into the latest durable snapshot.
 * This prevents dozens of overlapping IndexedDB transactions when a player
 * quickly opens and interacts with many apps.
 */
export function commitSave(state: GameState, journal: StoryEvent[], receipts: EventReceipt[]): Promise<void> {
  pendingSave = {
    state: structuredClone(state),
    journal: structuredClone(journal),
    receipts: structuredClone(receipts)
  };
  if (!drainPromise) drainPromise = drainSaveQueue();
  return drainPromise;
}

export async function clearSave(): Promise<void> {
  pendingSave = null;
  if (drainPromise) await drainPromise.catch(() => undefined);
  await indexedDbSaveAdapter.clear(SLOT);
  createdAtCache = null;
}
