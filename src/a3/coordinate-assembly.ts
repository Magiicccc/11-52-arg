export const coordinateSources = [
  { value: "IMG_0612_145237.HEIC", label: "IMG_0612_145237.HEIC · EXIF" },
  { value: "NW01_original_image", label: "NW01_original_image · 论坛原图末位" },
  { value: "CY_MAP_CACHE_0714", label: "CY_MAP_CACHE_0714 · 通话/号码残片" }
] as const;

export interface CoordinateAssembly {
  latitudeSource: string;
  longitudeTailSource: string;
  directionSource: string;
}

export function validateCoordinateAssembly(value: CoordinateAssembly): boolean {
  return value.latitudeSource === "IMG_0612_145237.HEIC"
    && value.longitudeTailSource === "NW01_original_image"
    && value.directionSource === "CY_MAP_CACHE_0714";
}
