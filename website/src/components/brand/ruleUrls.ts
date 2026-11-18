/**
 * URL/install affordances for a rule.
 *
 * A rule is one markdown file in the repo, so every URL derives from its
 * repo-relative path. Shared by the catalog cards, the detail route, and the
 * copy-to-clipboard command so the three can never disagree.
 */

const RAW_BASE = "https://raw.githubusercontent.com/iromu/awesome-qwen/main";
const BLOB_BASE = "https://github.com/iromu/awesome-qwen/blob/main";

export type RuleSource = {
  /** Repo-relative path of the rule file, e.g. `rules/python-conventions.md`. */
  path: string;
};

export const ruleRawUrl = (rule: RuleSource) => `${RAW_BASE}/${rule.path}`;

export const ruleSourceUrl = (rule: RuleSource) => `${BLOB_BASE}/${rule.path}`;

/**
 * A rule is one file, so installing it is fetching that file — the same
 * one-liner `rules/README.md` documents, not a skill installer.
 */
export const ruleInstallCommand = (rule: RuleSource & { id: string }) =>
  `mkdir -p .qwen/rules && curl -fsSL ${ruleRawUrl(rule)} -o .qwen/rules/${rule.id}.md`;
