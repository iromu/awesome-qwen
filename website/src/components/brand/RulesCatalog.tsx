import { ChevronDownIcon, CopyIcon, DownloadIcon, MarkGithubIcon } from "@primer/octicons-react";
import {
  Box,
  Button,
  CTABanner,
  Card,
  Checkbox,
  FormControl,
  Grid,
  Heading,
  Pagination,
  Section,
  Stack,
  Text,
  useTheme,
} from "@primer/react-brand";
import { clsx } from "clsx";
import React, { useMemo, useState } from "react";

import { PageShell } from "./PageShell";
import { CatalogSortControl, CATALOG_SORT_OPTIONS } from "./CatalogSortControl";
import { RulesIcon } from "./RulesIcon";
import { RuleGlob } from "./RuleGlob";
import {
  daysSince,
  toggleValue,
  updatedBuckets,
  updatedBucketOf,
} from "./catalogFilters";
import { pageHref } from "./pageHref";
import {
  ruleInstallCommand,
  ruleRawUrl,
  ruleSourceUrl,
} from "./ruleUrls";
import { downloadFile } from "./resourceActions";
import type { SearchItem } from "./searchIndex";
import styles from "./styles/catalog.module.css";

const CONTRIBUTE_URL =
  "https://github.com/iromu/awesome-qwen/blob/main/CONTRIBUTING.md";
const REQUEST_URL = "https://github.com/iromu/awesome-qwen/issues/new";

/** A rule record as emitted into public/data/rules.json. */
export type RuleItem = {
  id: string;
  title: string;
  description: string;
  /** `paths:` globs from the rule's frontmatter; empty means a baseline rule. */
  paths: string[];
  scope: "paths" | "baseline";
  /** Repo-relative path of the rule file. */
  path: string;
  size: number;
  lastUpdated: string;
};

type FilterGroupId = "scope" | "updated";

const filterGroups: { id: FilterGroupId; label: string; options: string[] }[] = [
  {
    id: "scope",
    label: "When it fires",
    options: ["Fires on file patterns", "Always applied"],
  },
  { id: "updated", label: "Last updated", options: updatedBuckets.map((b) => b.label) },
];

type FilterState = Record<FilterGroupId, string[]>;

const emptyFilters: FilterState = { scope: [], updated: [] };

type SortMode = "az" | "newest";

const scopeOf = (rule: RuleItem) =>
  rule.scope === "baseline" ? "Always applied" : "Fires on file patterns";

const PAGE_SIZE = 6;

/** Long facets collapse behind a "Show N more" toggle, as on the Skills catalog. */
const FILTER_COLLAPSE_LIMIT = 10;

/** How many globs a card shows before collapsing the rest into a count. */
const CARD_GLOB_LIMIT = 1;

/**
 * The Rules catalog: the repo's `rules/*.md` coding standards, browsable the
 * same way skills are. Shares the Skills catalog's layout and stylesheet —
 * only the data shape, the facets, and the install affordance differ.
 */
export function RulesCatalog({
  rules,
  searchIndex,
}: {
  rules: RuleItem[];
  searchIndex?: SearchItem[];
}) {
  const { colorMode } = useTheme();
  const [sortMode, setSortMode] = useState<SortMode>("az");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [expandedGroups, setExpandedGroups] = useState<
    Record<FilterGroupId, boolean>
  >({ scope: false, updated: false });
  const toggleGroupExpanded = (groupId: FilterGroupId) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const copyTimer = React.useRef<number | undefined>(undefined);

  React.useEffect(
    () => () => window.clearTimeout(copyTimer.current),
    [],
  );

  const copyInstall = async (rule: RuleItem) => {
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(ruleInstallCommand(rule));
    } catch {
      setCopyError(true);
      return;
    }
    setCopied(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  const sortedRules = useMemo(() => {
    const filtered = rules.filter((rule) => {
      const scopeOk =
        filters.scope.length === 0 || filters.scope.includes(scopeOf(rule));
      const updatedOk =
        filters.updated.length === 0 ||
        filters.updated.includes(updatedBucketOf(daysSince(rule.lastUpdated)));
      return scopeOk && updatedOk;
    });
    if (sortMode === "newest") {
      filtered.sort((a, b) => daysSince(a.lastUpdated) - daysSince(b.lastUpdated));
    } else {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }
    return filtered;
  }, [rules, filters, sortMode]);

  const toggleFilter = (groupId: FilterGroupId, option: string) => {
    setFilters((prev) => ({
      ...prev,
      [groupId]: toggleValue(prev[groupId], option),
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setCurrentPage(1);
  };

  const activeFilterCount = filters.scope.length + filters.updated.length;
  const hasActiveFilters = activeFilterCount > 0;
  const pageCount = Math.max(1, Math.ceil(sortedRules.length / PAGE_SIZE));
  const page = Math.min(currentPage, pageCount);
  const visibleRules = sortedRules.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PageShell
      styles={styles}
      currentPage="rules"
      searchIndex={searchIndex}
      searchAriaLabel="Search rules"
    >
      <Box className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroIcon} aria-hidden="true">
            <RulesIcon size={36} />
          </span>
          <Heading as="h1" size="3" className={styles.heroHeading}>
            Rules
          </Heading>
          <Text as="p" size="300" variant="muted" className={styles.heroText}>
            Coding standards Qwen Code loads automatically and injects into
            context — globally, per project, or from an extension. Each rule is
            a single markdown file scoped by file pattern, so it applies exactly
            where it is relevant.
          </Text>
        </div>
      </Box>

      <Section id="catalog" paddingBlockStart="none" paddingBlockEnd="none">
        <Box className={styles.catalog}>
          <aside className={styles.filterNav} aria-label="Filter rules">
            <button
              type="button"
              className={styles.filterToggle}
              aria-expanded={mobileFiltersOpen}
              onClick={() => setMobileFiltersOpen((open) => !open)}
            >
              <span>Filters{hasActiveFilters ? ` (${activeFilterCount})` : ""}</span>
              <ChevronDownIcon
                size={16}
                className={clsx(
                  styles.filterToggleChevron,
                  mobileFiltersOpen && styles.filterToggleChevronOpen,
                )}
              />
            </button>
            <div
              className={clsx(
                styles.filterBody,
                !mobileFiltersOpen && styles.filterBodyCollapsed,
              )}
            >
              {filterGroups.map((group) => {
                const isExpandable = group.options.length > FILTER_COLLAPSE_LIMIT;
                const expanded = expandedGroups[group.id];
                const visibleOptions =
                  isExpandable && !expanded
                    ? group.options.slice(0, FILTER_COLLAPSE_LIMIT)
                    : group.options;
                return (
                  <div className={styles.filterGroup} key={group.id}>
                    <Text as="h2" size="100" className={styles.filterHeading}>
                      {group.label}
                    </Text>
                    <div className={styles.filterOptions}>
                      {visibleOptions.map((option) => (
                        <div className={styles.filterOption} key={option}>
                          <FormControl>
                            <Checkbox
                              checked={filters[group.id].includes(option)}
                              onChange={() => toggleFilter(group.id, option)}
                            />
                            <FormControl.Label>{option}</FormControl.Label>
                          </FormControl>
                        </div>
                      ))}
                    </div>
                    {isExpandable ? (
                      <button
                        type="button"
                        className={styles.showMoreButton}
                        aria-expanded={expanded}
                        onClick={() => toggleGroupExpanded(group.id)}
                      >
                        {expanded
                          ? "Show less"
                          : `Show ${group.options.length - FILTER_COLLAPSE_LIMIT} more`}
                      </button>
                    ) : null}
                  </div>
                );
              })}
              {hasActiveFilters ? (
                <div className={styles.filterActions}>
                  <Button
                    variant="secondary"
                    size="medium"
                    hasArrow={false}
                    onClick={clearFilters}
                  >
                    Clear all ({activeFilterCount})
                  </Button>
                </div>
              ) : null}
            </div>
          </aside>

          <Box className={styles.catalogMain}>
            <Box className={styles.toolbar}>
              <CatalogSortControl
                ariaLabel="Sort rules"
                value={sortMode}
                options={CATALOG_SORT_OPTIONS}
                styles={styles}
                onChange={(value) => {
                  setSortMode(value);
                  setCurrentPage(1);
                }}
              />
            </Box>
            <Box className={styles.gridFrame} data-mode={colorMode}>
              <Box className={styles.gridContent}>
                <Grid
                  className={styles.threeUp}
                  columnGap="none"
                  rowGap="none"
                  enableGutters={false}
                >
                  {visibleRules.map((rule) => (
                    <Grid.Column
                      key={rule.id}
                      span={{ xsmall: 12, medium: 6, large: 6 }}
                      className={styles.col}
                    >
                      <Box className={clsx(styles.item, styles.itemHover)}>
                        <Card
                          href={pageHref(`rule/${rule.id}`)}
                          fullWidth
                          ctaVariant="none"
                          backgroundColor="none"
                          className={styles.card}
                        >
                          <Card.Heading as="h2">{rule.title}</Card.Heading>
                          <Card.Description>
                            <span className={styles.cardDescText}>
                              {rule.description}
                            </span>
                          </Card.Description>
                        </Card>
                        <div className={styles.cardMeta}>
                          {rule.scope === "baseline" ? (
                            <span className={styles.cardGlob}>
                              Every session (no file filter)
                            </span>
                          ) : (
                            <span className={styles.cardGlob}>
                              <RuleGlob glob={rule.paths[0]} />
                              {rule.paths.length > CARD_GLOB_LIMIT ? (
                                <span className={styles.cardMore}>
                                  {`+${rule.paths.length - CARD_GLOB_LIMIT} more`}
                                </span>
                              ) : null}
                            </span>
                          )}
                        </div>
                        <div className={styles.cardActions}>
                          <Button
                            variant="primary"
                            hasArrow={false}
                            leadingVisual={CopyIcon}
                            onClick={() => copyInstall(rule)}
                          >
                            Copy install
                          </Button>
                          <Button
                            as="button"
                            variant="secondary"
                            onClick={() =>
                              void downloadFile(ruleRawUrl(rule), `${rule.id}.md`)
                            }
                            aria-label={`Download the ${rule.title} rule file`}
                            className={styles.iconButton}
                          >
                            <DownloadIcon />
                          </Button>
                          <Button
                            as="a"
                            href={ruleSourceUrl(rule)}
                            variant="secondary"
                            aria-label={`View the ${rule.title} rule on GitHub`}
                            className={styles.iconButton}
                          >
                            <MarkGithubIcon />
                          </Button>
                        </div>
                      </Box>
                    </Grid.Column>
                  ))}
                </Grid>
              </Box>
            </Box>

            {sortedRules.length === 0 ? (
              <Box className={styles.emptyState}>
                <Text as="p" variant="muted">
                  No rules match the selected filters.
                </Text>
              </Box>
            ) : null}
          </Box>
        </Box>
      </Section>

      <div className={styles.rule} aria-hidden="true" />

      <Box className={styles.paginationRow}>
        <Stack direction="horizontal" justifyContent="center" padding="none">
          <Pagination
            className={styles.pagination}
            pageCount={pageCount}
            currentPage={page}
            onPageChange={(e, n) => {
              e.preventDefault();
              setCurrentPage(n);
            }}
          />
        </Stack>
      </Box>

      <div className={styles.rule} aria-hidden="true" />

      <Box className={styles.ctaFrame}>
        <Section paddingBlockStart="none" paddingBlockEnd="none">
          <Box className={styles.ctaFrameInner}>
            <CTABanner align="center" backgroundColor="subtle">
              <CTABanner.Heading>
                Standard missing from the list?
              </CTABanner.Heading>
              <CTABanner.Description>
                Rules are plain markdown, so contributing one is a single file.
                Share the convention your team enforces&mdash;or request the one
                you keep having to repeat.
              </CTABanner.Description>
              <CTABanner.ButtonGroup>
                <Button as="a" href={CONTRIBUTE_URL}>
                  Submit a rule
                </Button>
                <Button as="a" href={REQUEST_URL}>
                  Request a rule
                </Button>
              </CTABanner.ButtonGroup>
            </CTABanner>
          </Box>
        </Section>
      </Box>

      <div
        className={styles.toast}
        role={copyError ? "alert" : "status"}
        aria-live={copyError ? "assertive" : "polite"}
        data-visible={copied || copyError ? "true" : undefined}
      >
        {copyError
          ? "Unable to copy install command. Please try again."
          : "Install command copied!"}
      </div>
    </PageShell>
  );
}
