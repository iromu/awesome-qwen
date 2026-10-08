import type { PrototypePageProps } from "./pageHref";

export type SitePage = "skills";

const destinations = [{ label: "Skills", page: "skills" }] as const;

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
