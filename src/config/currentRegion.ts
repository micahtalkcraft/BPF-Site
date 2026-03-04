import { regions, type RegionCode, type RegionConfig } from "./regions";
import type { CollectionEntry } from "astro:content";

const envRegion = (import.meta.env.REGION ?? "us") as RegionCode;

export const currentRegion: RegionConfig = regions[envRegion] ?? regions.us;

/** Keep only firms visible in the current REGION (or global if no regions set). */
export function filterFirmsByRegion(
  firms: CollectionEntry<"prop-firms">[],
): CollectionEntry<"prop-firms">[] {
  return firms.filter(
    (f) => !f.data.regions || f.data.regions.includes(currentRegion.code),
  );
}
