type RulesIconProps = {
  size?: number;
};

/** Checklist-on-a-sheet mark, drawn on the same 96px grid and stroke tokens as `SkillsIcon`. */
export function RulesIcon({ size = 36 }: RulesIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      role="img"
      aria-label="Rules"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M30 10H66C70.4183 10 74 13.5817 74 18V78C74 82.4183 70.4183 86 66 86H30C25.5817 86 22 82.4183 22 78V18C22 13.5817 25.5817 10 30 10Z"
        stroke="var(--brand-color-text-default)"
        strokeWidth="4"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
      <path
        d="M32 30L37 35L47 25M32 50L37 55L47 45M32 70L37 75L47 65"
        stroke="var(--brand-color-text-default)"
        strokeWidth="4"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
      <path
        d="M56 32H64M56 52H64M56 72H64"
        stroke="var(--brand-color-text-muted)"
        strokeWidth="4"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
    </svg>
  );
}
