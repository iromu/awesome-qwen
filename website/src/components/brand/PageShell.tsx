import { MarkGithubIcon } from "@primer/octicons-react";
import { Box, Button, ThemeProvider, useTheme } from "@primer/react-brand";
import type { ReactNode } from "react";

import { LargeFooter } from "./LargeFooter";
import { SkipLink } from "./SkipLink";
import { TopNav } from "./TopNav";
import { TopNavSearch } from "./TopNavSearch";
import { getNavLinks, type SitePage } from "./navigation";
import { pageHref } from "./pageHref";
import type { SearchItem } from "./searchIndex";

const CONTRIBUTING_URL =
  "https://github.com/iromu/awesome-qwen/blob/main/CONTRIBUTING.md";

export type PageShellProps = {
  /** Scoped CSS module for the page, providing the topBar/subNav class names. */
  styles: Record<string, string | undefined>;
  /** Catalog page to mark as current in the nav. */
  currentPage?: SitePage;
  /** Site-wide search index, injected from build-time data. */
  searchIndex?: SearchItem[];
  searchAriaLabel?: string;
  /**
   * Pages that scroll inside their own element (the detail chassis) must render
   * the footer *inside* that scroll region, otherwise it sits outside the
   * scrolling box and stays pinned over the content. Those pages opt out here
   * and render `<LargeFooter />` themselves.
   */
  renderFooter?: boolean;
  children: ReactNode;
};

/**
 * Shared chrome for every page: skip link, the combined top navigation (brand
 * mark, section links, search), the `<main>` landmark, and the footer.
 *
 * The prototype repeated this block verbatim at the top of each page; it is
 * extracted here so pages only own their content.
 */
export function PageShell({
  styles,
  currentPage,
  searchIndex = [],
  searchAriaLabel = "Search the library",
  renderFooter = true,
  children,
}: PageShellProps) {
  return (
    <ThemeProvider colorMode="auto">
      <PageShellBody
        styles={styles}
        currentPage={currentPage}
        searchIndex={searchIndex}
        searchAriaLabel={searchAriaLabel}
        renderFooter={renderFooter}
      >
        {children}
      </PageShellBody>
    </ThemeProvider>
  );
}

/**
 * Inner shell, rendered beneath the ThemeProvider so it can read the resolved
 * colour mode. The prototype mirrors that mode onto `data-mode`, which its CSS
 * modules key their light/dark treatments off.
 */
function PageShellBody({
  styles,
  currentPage,
  searchIndex = [],
  searchAriaLabel = "Search the library",
  renderFooter = true,
  children,
}: PageShellProps) {
  const { colorMode } = useTheme();
  const navLinks = getNavLinks(pageHref, currentPage);

  return (
    <Box className={styles.page} backgroundColor="default" data-mode={colorMode}>
      <SkipLink />
      <header className={styles.topBar}>
        <nav className={styles.topBarInner} aria-label="Primary">
          <a href={pageHref()} className={styles.subNavTitle}>
            <MarkGithubIcon size={24} />
            Awesome Qwen
          </a>
          <TopNav
            styles={styles}
            links={navLinks}
            searchIndex={searchIndex}
            searchAriaLabel={searchAriaLabel}
          />
          <div className={styles.topBarActions}>
            <TopNavSearch
              index={searchIndex}
              styles={styles}
              inputAriaLabel={searchAriaLabel}
            />
            <Button as="a" href={CONTRIBUTING_URL} variant="subtle" size="small">
              Contribute
            </Button>
          </div>
        </nav>
      </header>

      <main id="main-content" tabIndex={-1}>
        {children}
      </main>

      {renderFooter ? <LargeFooter /> : null}
    </Box>
  );
}
