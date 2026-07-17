export function assetUrl(path: string | undefined): string | undefined {
  if (!path?.startsWith("/")) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}
