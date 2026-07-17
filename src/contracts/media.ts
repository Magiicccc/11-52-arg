export interface MediaAssetManifest {
  id: string;
  type: "image" | "audio" | "video" | "document";
  file: string;
  sourceMode: "captured" | "generated" | "edited" | "composite";
  baseAssetId?: string;
  personReferenceIds: string[];
  locationReferenceIds: string[];
  correctionVariant: "R0" | "R1" | "R2" | "R3" | "R4" | "R5";
  storyDate?: string;
  qa: {
    continuity: "pending" | "pass" | "fail";
    artifactCheck: "pending" | "pass" | "fail";
    textAndLogoCheck: "pending" | "pass" | "fail";
  };
  fallback?: {
    type: "text" | "image" | "transcript";
    contentId: string;
  };
}
