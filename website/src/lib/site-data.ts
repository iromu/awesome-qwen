/**
 * Build-time accessors for the generated catalog data in `public/data/`.
 *
 * Pages import these rather than reading the JSON directly, so the shape used
 * by the React components is defined in exactly one place. The JSON files are
 * produced by `scripts/generate-website-data.mjs` (run `npm run data` before
 * `astro dev`/`astro build`; `npm run build` chains both).
 */
import searchIndexData from "../../public/data/search-index.json";
import skillsData from "../../public/data/skills.json";

import {
  buildSearchIndex,
  type GeneratedSearchRecord,
  type SearchItem,
} from "../components/brand/searchIndex";

const BASE = import.meta.env.BASE_URL ?? "/";

export const skills = skillsData.items;

/** Live catalog count, injected into the home page and nav. */
export const counts = {
  skills: skills.length,
};

/** Site-wide search index for `TopNavSearch`, shared by every page. */
export const searchIndex: SearchItem[] = buildSearchIndex(
  searchIndexData as GeneratedSearchRecord[],
  BASE,
);
