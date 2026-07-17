import type { GameState } from "./game-state";
import type { EventReceipt, StoryEvent } from "./story-event";

export interface SaveEnvelope {
  schemaVersion: number;
  contentPackVersion: string;
  createdAt: string;
  updatedAt: string;
  snapshot: GameState;
  journal: StoryEvent[];
  receipts: EventReceipt[];
  integrityHash: string;
  migrationsApplied: string[];
}

export interface SaveAdapter {
  load(slotId: string): Promise<SaveEnvelope | null>;
  commit(slotId: string, save: SaveEnvelope): Promise<void>;
  clear(slotId: string): Promise<void>;
  list(): Promise<{ slotId: string; updatedAt: string }[]>;
}
