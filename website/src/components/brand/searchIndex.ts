/**
 * Search index adapter.
 *
 * The same shape the design prototype hand-wrote is produced from the site's
 * generated `public/data/search-index.json` plus the fixed top-level
 * destinations, so `TopNavSearch` searches the real catalog.
 */

export type SearchCategory = "Pages" | "Skills";

export type SearchItem = {
  title: string;
  description: string;
  category: SearchCategory;
  /** Resolved site URL for the result. */
  href: string;
};

/** Generated record shape from `scripts/generate-website-data.mjs`. */
export type GeneratedSearchRecord = {
  type: string;
  id: string;
  title: string;
  description?: string;
  path?: string;
};

const CATEGORY_BY_TYPE: Record<string, SearchCategory> = {
  skill: "Skills",
};

const DETAIL_ROUTE_BY_TYPE: Record<string, string> = {
  skill: "skill",
};

/** Top-level destinations so search always surfaces the main sections. */
export const staticPages = (base: string): SearchItem[] => {
  const at = (path: string) => `${base}${path}`.replace(/\/{2,}/g, "/");
  return [
    {
      title: "Home",
      description:
        "The Awesome Qwen skill library home — browse the catalog and quality scores.",
      category: "Pages",
      href: at("/"),
    },
    {
      title: "Skills",
      description:
        "Self-contained Qwen Code skills that bundle instructions and resources together.",
      category: "Pages",
      href: at("/skills/"),
    },
  ];
};

/** Convert generated records into `TopNavSearch` items. */
export function buildSearchIndex(
  records: GeneratedSearchRecord[],
  base = "/",
): SearchItem[] {
  const at = (path: string) => `${base}${path}`.replace(/\/{2,}/g, "/");
  const items: SearchItem[] = [];
  for (const record of records) {
    const category = CATEGORY_BY_TYPE[record.type];
    if (!category) continue;
    const route = DETAIL_ROUTE_BY_TYPE[record.type];
    items.push({
      title: record.title,
      description: record.description ?? "",
      category,
      href: route ? at(`/${route}/${record.id}/`) : at("/"),
    });
  }
  return [...staticPages(base), ...items];
}
