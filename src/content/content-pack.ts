import rawApps from "../../content/case-001/apps/app-manifests.json";
import rawItems from "../../content/case-001/apps/content-items.json";
import rawA3Items from "../../content/case-001/apps/a3-content-items.json";
import rawUiPass2Items from "../../content/case-001/apps/ui-pass2-content-items.json";
import rawTriggers from "../../content/case-001/triggers/triggers.json";
import rawA3Triggers from "../../content/case-001/triggers/a3-triggers.json";
import { appManifestSchema, contentItemSchema } from "./schemas";
import type { AppManifest } from "@/contracts/apps";
import type { ContentItem } from "@/contracts/content";
import type { TriggerDefinition } from "@/contracts/triggers";

export const appManifests = rawApps.map((value) => appManifestSchema.parse(value)) as AppManifest[];
export const contentItems = [...rawItems, ...rawA3Items, ...rawUiPass2Items].map((value) => contentItemSchema.parse(value)) as unknown as ContentItem[];
export const triggers = [...rawTriggers, ...rawA3Triggers] as TriggerDefinition[];

export const appById = new Map(appManifests.map((app) => [app.id, app]));
export const contentById = new Map(contentItems.map((item) => [item.id, item]));

export function contentForApp(appId: string): ContentItem[] {
  return contentItems.filter((item) => item.appId === appId);
}
