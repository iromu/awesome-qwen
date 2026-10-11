type ClayMarkProps = {
  size?: number;
};

/**
 * The library's own mark: a clay dial — two concentric rings, a seated centre
 * bead, and one indicator dot outside the ring at two o'clock.
 *
 * Drawn for this site rather than licensed from anyone. It deliberately imitates
 * neither the GitHub octocat it replaces in the wordmark nor the Qwen mark, so
 * the site can have a mark of its own without borrowing a trademark it has no
 * claim on. The concentric rings are the soft-clay art direction reduced to its
 * smallest legible form — a bead pressed into a surface — which is why it reads
 * as part of the page rather than as a sticker on it.
 *
 * Colours come from the theme's text tokens rather than fixed hexes, so the mark
 * re-tints between light and dark instead of carrying one palette's values into
 * the other.
 */
export function ClayMark({ size = 24 }: ClayMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="11.5"
        cy="12"
        r="9"
        stroke="var(--brand-color-text-default)"
        strokeWidth="1.5"
      />
      <circle
        cx="11.5"
        cy="12"
        r="4.75"
        stroke="var(--brand-color-text-default)"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <circle cx="11.5" cy="12" r="1.9" fill="var(--brand-color-text-default)" />
      <circle cx="20.5" cy="4.5" r="2" fill="var(--brand-color-text-muted)" />
    </svg>
  );
}
