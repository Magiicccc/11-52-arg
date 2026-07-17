import rawApps from "../../content/case-001/apps/app-manifests.json";
import rawItems from "../../content/case-001/apps/content-items.json";
import rawTriggers from "../../content/case-001/triggers/triggers.json";
import { appManifestSchema, contentItemSchema } from "./schemas";
import type { AppManifest } from "@/contracts/apps";
import type { ContentItem } from "@/contracts/content";
import type { TriggerDefinition } from "@/contracts/triggers";

export const appManifests = rawApps.map((value) => appManifestSchema.parse(value)) as AppManifest[];
export const contentItems = rawItems.map((value) => contentItemSchema.parse(value)) as unknown as ContentItem[];
export const triggers = rawTriggers as TriggerDefinition[];

export const appById = new Map(appManifests.map((app) => [app.id, app]));
export const contentById = new Map(contentItems.map((item) => [item.id, item]));

export function contentForApp(appId: string): ContentItem[] {
  return contentItems.filter((item) => item.appId === appId);
}
