import { clsx } from "clsx";
import React from "react";

import {
  Box,
  Button,
  Card,
  CTABanner,
  Grid,
  Heading,
  Hero,
  Section,
  Stack,
  Text,
  Token,
} from "@primer/react-brand";

import styles from "./styles/styles.module.css";
import { PageShell } from "./PageShell";
import { SkillsIcon } from "./SkillsIcon";
import { pageHref } from "./pageHref";
import type { SearchItem } from "./searchIndex";

const REPO_URL = "https://github.com/iromu/awesome-qwen";
const CONTRIBUTING_URL =
  "https://github.com/iromu/awesome-qwen/blob/main/CONTRIBUTING.md";
const QWEN_CODE_URL = "https://github.com/QwenLM/Qwen";

/** A skill record as emitted into public/data/skills.json (subset used here). */
export type SkillSummary = {
  id: string;
  title: string;
  description: string;
  qualityScore?: {
    score: number;
    grade: string;
  } | null;
};

export type HomePageProps = {
  skills: SkillSummary[];
  searchIndex?: SearchItem[];
};

const FEATURED_COUNT = 6;

/** Highest-scoring skills first (unscored last, then alphabetical). */
function featuredSkills(skills: SkillSummary[]): SkillSummary[] {
  return [...skills]
    .sort((a, b) => {
      const left = a.qualityScore?.score ?? Number.NEGATIVE_INFINITY;
      const right = b.qualityScore?.score ?? Number.NEGATIVE_INFINITY;
      if (left !== right) return right - left;
      return a.title.localeCompare(b.title);
    })
    .slice(0, FEATURED_COUNT);
}

function summarize(description: string): string {
  const text = description.trim();
  return text.length <= 140 ? text : `${text.slice(0, 137).trimEnd()}…`;
}

/**
 * The site home: a hero that names the library, a grid of the highest-scoring
 * skills, and a closing banner that points back at Qwen Code itself. The
 * featured list is recomputed from `public/data/skills.json` at build time, so
 * it follows the latest SkillEvaluator reports without any manual upkeep.
 */
export function HomePage({
  skills,
  searchIndex = [],
}: HomePageProps) {
  const featured = featuredSkills(skills);

  return (
    <PageShell
      styles={styles}
      searchIndex={searchIndex}
      searchAriaLabel="Search the library"
    >
      <Box className={styles.heroFrame}>
        <Section paddingBlockStart="none" paddingBlockEnd="none">
          <Box className={styles.heroFrameInner}>
            <Stack
              direction="vertical"
              alignItems="center"
              gap="normal"
              padding="none"
            >
              <div className={styles.heroRiseIcon} aria-hidden="true">
                <SkillsIcon size={56} />
              </div>
              <Hero align="center">
                <Hero.Heading>The community skill library for Qwen Code</Hero.Heading>
                <Hero.Description>
                  Curated, battle-tested skills that bundle instructions,
                  references, and scripts — each one validated with a
                  SkillEvaluator quality score.
                </Hero.Description>
                <Hero.PrimaryAction href={REPO_URL}>
                  Explore repository
                </Hero.PrimaryAction>
                <Hero.SecondaryAction href={CONTRIBUTING_URL}>
                  Contribute a skill
                </Hero.SecondaryAction>
              </Hero>
            </Stack>
          </Box>
        </Section>
      </Box>

      {featured.length > 0 ? (
        <Box
          id="featured"
          className={styles.cardGridFrame}
          marginBlockEnd={{ narrow: 24, wide: 80 }}
        >
          <Box className={styles.cardGridContent}>
            <Stack
              direction="vertical"
              gap="condensed"
              padding="none"
              className={styles.sectionHead}
            >
              <Heading as="h2" size="3">
                Featured skills
              </Heading>
              <Text size="200" variant="muted">
                The highest-scoring skills in the library, ranked by their
                SkillEvaluator quality score.{" "}
                <a href={pageHref("skills")}>Browse all skills</a>.
              </Text>
              <Grid columnGap="none" rowGap="none" enableGutters={false}>
                {featured.map((skill) => (
                  <Grid.Column
                    key={skill.id}
                    span={{ xsmall: 12, small: 6, xlarge: 4 }}
                    className={clsx(
                      styles.cardGridColumn,
                      styles.cardGridColumnArrowHover,
                    )}
                  >
                    <Box className={styles.cardGridItem} id={skill.id}>
                      <Card
                        href={pageHref(`skill/${skill.id}`)}
                        fullWidth
                        ctaVariant="arrow"
                        ctaText="Open skill"
                        backgroundColor="none"
                        className={styles.resourceCard}
                      >
                        <Card.Heading as="h3" size="5">
                          <span className={styles.cardHeadingRow}>
                            <span>{skill.title}</span>
                            {skill.qualityScore ? (
                              <Token variant="default">
                                {`${skill.qualityScore.grade} · ${skill.qualityScore.score.toFixed(1)}`}
                              </Token>
                            ) : null}
                          </span>
                        </Card.Heading>
                        <Card.Description>
                          {summarize(skill.description)}
                        </Card.Description>
                      </Card>
                    </Box>
                  </Grid.Column>
                ))}
              </Grid>
            </Stack>
          </Box>
        </Box>
      ) : null}

      <Box className={styles.ctaFrame}>
        <Section paddingBlockStart="none" paddingBlockEnd="none">
          <Box className={styles.ctaFrameInner}>
            <CTABanner align="center" hasGridLines>
              <CTABanner.Heading as="h2" size="3">
                Not sure where to start?
              </CTABanner.Heading>
              <CTABanner.Description>
                Install Qwen Code, then run{" "}
                <code>
                  npx skills add iromu/awesome-qwen --skill &lt;skill&gt;
                  --agent qwen-code
                </code>{" "}
                from your project root, or copy a skill folder into your
                project&rsquo;s <code>.qwen/skills/</code> directory by hand.
                Either way, Qwen picks it up automatically.
              </CTABanner.Description>
              <CTABanner.ButtonGroup>
                <Button
                  as="a"
                  href={QWEN_CODE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Qwen Code
                </Button>
                <Button as="a" href={pageHref("skills")}>
                  Browse all skills
                </Button>
              </CTABanner.ButtonGroup>
            </CTABanner>
          </Box>
        </Section>
      </Box>
    </PageShell>
  );
}
