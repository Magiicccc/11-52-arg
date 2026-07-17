export type AppTier = "A" | "B" | "C";
export type ReferenceMode = "direct_real" | "derived_real" | "system_inherited";

export interface AppManifest {
  id: string;
  displayName: string;
  tier: AppTier;
  iconAsset: string;
  deviceAvailability: ("investigation" | "player")[];
  initialRoute: string;
  routes: AppRoute[];
  capabilities: string[];
  reference: {
    packVersion: "1.0-full";
    appSlug: string;
    stateIds: string[];
    modeByState: Record<string, ReferenceMode>;
  };
}

export interface AppRoute {
  id: string;
  path: string;
  scrollRestoration: boolean;
  requiresUnlock?: string[];
}
