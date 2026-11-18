import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  MarkGithubIcon,
} from "@primer/octicons-react";
import React from "react";

import { Button } from "@primer/react-brand";

import { DetailChassis, type DetailSibling } from "./DetailChassis";
import { ResourceMeta } from "./ResourceMeta";
import { SyntaxHighlightedCode } from "./SyntaxHighlightedCode";
import { pageHref } from "./pageHref";
import type { SearchItem } from "./searchIndex";
import type { RuleItem } from "./RulesCatalog";
import styles from "./styles/dotnet-upgrade.module.css";

export type RuleDetailProps = {
  item: RuleItem;
  /** Rendered, sanitised rule body with heading ids already stamped. */
  markdownHtml: string;
  /** "In this article" entries derived from the rendered body. */
  toc?: { id: string; label: string }[];
  /** GitHub blob URL for the rule file. */
  githubUrl: string;
  /** raw.githubusercontent.com URL — the download target. */
  rawUrl: string;
  /** The `curl … -o .qwen/rules/<file>` one-liner. */
  installCommand: string;
  /** Fallback content when the markdown body fails to render. */
  rawMarkdown: string;
  lastUpdated?: string | null;
  previous?: DetailSibling;
  next?: DetailSibling;
  searchIndex?: SearchItem[];
};

/**
 * Rule detail route.
 *
 * A rule is a single markdown file, so unlike the skill route there is no file
 * switcher — the body is the article. What the skill page spends its sidebar on
 * (file counts, bundled assets, Quality Score), this one spends on when the
 * rule fires, because that is the part you decide about.
 */
export function RuleDetail({
  item,
  markdownHtml,
  toc = [],
  githubUrl,
  rawUrl,
  installCommand,
  rawMarkdown,
  lastUpdated,
  previous,
  next,
  searchIndex,
}: RuleDetailProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopyInstall = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(installCommand);
      setCopied(true);
    } catch {
      /* clipboard unavailable */
    }
  }, [installCommand]);

  const install = (
    <>
      <Button
        variant="primary"
        onClick={handleCopyInstall}
        leadingVisual={copied ? CheckIcon : CopyIcon}
      >
        {copied ? "Copied" : "Copy install command"}
      </Button>
      <Button
        as="a"
        href={rawUrl}
        variant="secondary"
        className={styles.iconButton}
        download
        aria-label={`Download the ${item.title} rule file`}
      >
        <DownloadIcon size={16} />
      </Button>
      <Button
        as="a"
        href={githubUrl}
        variant="secondary"
        className={styles.iconButton}
        aria-label={`View the ${item.title} rule on GitHub`}
      >
        <MarkGithubIcon size={16} />
      </Button>
    </>
  );

  return (
    <DetailChassis
      title={item.title}
      description={item.description}
      breadcrumbs={[
        { label: "Rules", href: pageHref("rules") },
        { label: item.title },
      ]}
      install={install}
      heroExtras={
        <div className={styles.codeBlockWrap}>
          <span className={styles.codeLabel}>Set it up locally</span>
          <SyntaxHighlightedCode
            className={styles.codeBlock}
            code={installCommand}
            language="bash"
            lineClassName={styles.codeLine}
          />
        </div>
      }
      sidebar={
        <ResourceMeta
          kicker="Rule details"
          groups={[
            {
              label: item.scope === "baseline" ? "Scope" : "Fires on",
              items: item.scope === "baseline" ? ["Every session"] : item.paths,
            },
            { label: "File", items: [item.path] },
          ]}
          lastUpdated={lastUpdated}
          sourceUrl={githubUrl}
        />
      }
      toc={toc}
      previous={previous}
      next={next}
      currentPage="rules"
      searchIndex={searchIndex}
    >
      <section className={styles.articleSection}>
        {markdownHtml ? (
          <div dangerouslySetInnerHTML={{ __html: markdownHtml }} />
        ) : (
          <pre tabIndex={0} className={styles.codeBlock}>
            <code>{rawMarkdown}</code>
          </pre>
        )}
      </section>
    </DetailChassis>
  );
}
