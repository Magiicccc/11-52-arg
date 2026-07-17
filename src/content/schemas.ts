import { z } from "zod";

export const narrativeMetadataSchema = z.object({
  primaryFunction: z.string().min(1),
  secondaryFunctions: z.array(z.string()),
  clueRole: z.enum(["none", "supporting", "direct", "misdirection"]),
  worldFactIds: z.array(z.string()),
  characterTraitIds: z.array(z.string()),
  relationshipBeatIds: z.array(z.string()),
  continuityLinkIds: z.array(z.string()),
  firstReadValue: z.string().min(8),
  recontextualizedValue: z.string().optional(),
  payoffPolicy: z.enum(["none", "optional", "required"])
});

export const contentVariantSchema = z.object({
  id: z.string().min(1), correctionStage: z.enum(["R0","R1","R2","R3","R4","R5"]),
  body: z.unknown(), replacesVariantId: z.string().optional(), reason: z.enum(["normal","player_action","H","A","P","C"]).optional()
});

export const contentItemSchema = z.object({
  id: z.string().min(1), appId: z.string().min(1), kind: z.string().min(1), ownerId: z.string().min(1),
  sourceRootId: z.string().min(1), initialVariantId: z.string().min(1), variants: z.array(contentVariantSchema).min(1),
  narrative: narrativeMetadataSchema, metadata: z.record(z.string(), z.unknown()).optional()
});

export const appManifestSchema = z.object({
  id: z.string(), displayName: z.string(), tier: z.enum(["A","B","C"]), iconAsset: z.string(),
  deviceAvailability: z.array(z.enum(["investigation","player"])), initialRoute: z.string(),
  routes: z.array(z.object({id:z.string(),path:z.string(),scrollRestoration:z.boolean(),requiresUnlock:z.array(z.string()).optional()})),
  capabilities: z.array(z.string()),
  reference: z.object({packVersion:z.literal("1.0-full"),appSlug:z.string(),stateIds:z.array(z.string()),modeByState:z.record(z.string(), z.enum(["direct_real","derived_real","system_inherited"]))})
});
