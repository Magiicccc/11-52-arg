import { openDB } from "idb";
import type { SaveAdapter, SaveEnvelope } from "@/contracts/save";

const DB_NAME = "11-52-save";
const STORE = "slots";

async function db() {
  return openDB(DB_NAME, 1, { upgrade(database) { if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE); } });
}

export const indexedDbSaveAdapter: SaveAdapter = {
  async load(slotId) { return (await db()).get(STORE, slotId) as Promise<SaveEnvelope | null>; },
  async commit(slotId, save) { await (await db()).put(STORE, save, slotId); },
  async clear(slotId) { await (await db()).delete(STORE, slotId); },
  async list() {
    const database = await db();
    const keys = await database.getAllKeys(STORE);
    const entries = await Promise.all(keys.map(async (key) => ({ slotId: String(key), save: await database.get(STORE, key) as SaveEnvelope })));
    return entries.map(({slotId,save}) => ({slotId,updatedAt:save.updatedAt}));
  }
};
