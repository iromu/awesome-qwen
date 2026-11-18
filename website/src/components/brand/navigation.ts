import type { PrototypePageProps } from "./pageHref";

export type SitePage = "skills" | "rules";

const destinations = [
  { label: "Skills", page: "skills" },
  { label: "Rules", page: "rules" },
] as const;

export function getNavLinks(
  pageHref: PrototypePageProps["pageHref"],
  currentPage?: SitePage,
) {
  return destinations.map((destination) => ({
    label: destination.label,
    href: pageHref(destination.page),
    current: destination.page === currentPage,
  }));
}
