import rawSupplements from "../../content/case-001/apps/platform-prose-supplements.json";

interface PlatformProseSupplement {
  contentId: string;
  paragraphs: string[];
}

const supplements = rawSupplements as PlatformProseSupplement[];
const supplementById = new Map(supplements.map((item) => [item.contentId, item.paragraphs]));

export function completePlatformParagraphs(contentId: string, fallback: string[] = []): string[] {
  return supplementById.get(contentId) ?? fallback;
}

export const platformProseSupplementCount = supplements.length;
