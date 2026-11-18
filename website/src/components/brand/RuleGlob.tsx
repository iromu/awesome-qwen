import React from "react";

/**
 * A rule's `paths:` glob, wrapped so it never breaks mid-token.
 *
 * Card columns are narrow enough that a real glob has to wrap, and letting the
 * browser do it splits brace sets across lines — `{j2,jinja` on one line,
 * `jinja2}` on the next — which reads as a typo in a pattern you are meant to
 * copy. Splitting on the path separator gives the renderer legal break points
 * between segments instead.
 *
 * Styling comes from the `.cardGlob` class of whichever page owns the card, so
 * this renders a bare fragment rather than its own element.
 */
export function RuleGlob({ glob }: { glob: string }) {
  const segments = glob.split("/");
  return (
    <>
      {segments.map((segment, index) => (
        <React.Fragment key={`${segment}-${index}`}>
          {index > 0 ? (
            <>
              {"\u200B"}
              <wbr />
            </>
          ) : null}
          {segment}
        </React.Fragment>
      ))}
    </>
  );
}
