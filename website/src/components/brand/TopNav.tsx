import { ThreeBarsIcon, XIcon } from "@primer/octicons-react";
import { clsx } from "clsx";
import { Button } from "@primer/react-brand";
import { useEffect, useRef } from "react";

import type { SearchItem } from "./searchIndex";
import mobileStyles from "./styles/TopNav.module.css";
import { TopNavSearch } from "./TopNavSearch";

const CONTRIBUTING_URL =
  "https://github.com/iromu/awesome-qwen/blob/main/CONTRIBUTING.md";

type NavLink = { label: string; href: string; current: boolean };

/**
 * The top navigation: a flat list of section links in the desktop bar, plus a
 * hamburger menu on small viewports that keeps search and the section links
 * reachable. Each page owns its own scoped CSS module, so the class map is
 * injected via `styles` to keep the existing look.
 */
export function TopNav({
  styles,
  links,
  searchIndex,
  searchAriaLabel = "Search the library",
}: {
  styles: Record<string, string | undefined>;
  links: NavLink[];
  searchIndex?: SearchItem[];
  searchAriaLabel?: string;
}) {
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const closeMenus = () => {
      if (mobileMenuRef.current) mobileMenuRef.current.open = false;
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const activeElement = document.activeElement;
      if (mobileMenuRef.current?.open && activeElement) {
        if (!mobileMenuRef.current.contains(activeElement)) return;
      }
      closeMenus();
      mobileMenuRef.current?.querySelector("summary")?.focus();
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!mobileMenuRef.current?.contains(event.target as Node)) {
        closeMenus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return (
    <>
      <ul className={styles.subNavList}>
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className={clsx(
                styles.subNavLink,
                link.current && styles.subNavLinkActive,
              )}
              aria-current={link.current ? "page" : undefined}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <details className={mobileStyles.mobileMenu} ref={mobileMenuRef}>
        <summary
          className={mobileStyles.mobileTrigger}
          aria-label="Open site sections menu"
        >
          <ThreeBarsIcon size={20} className={mobileStyles.triggerBars} />
          <XIcon size={20} className={mobileStyles.triggerClose} />
        </summary>
        <nav className={mobileStyles.mobileOverlay} aria-label="Site sections">
          <div className={mobileStyles.mobileSearch}>
            <TopNavSearch
              index={searchIndex}
              styles={styles}
              variant="inline"
              inputAriaLabel={searchAriaLabel}
            />
          </div>
          <span className={mobileStyles.overlayDivider} aria-hidden="true" />
          <span className={mobileStyles.overlayLabel}>Browse</span>
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={mobileStyles.mobileLink}
              aria-current={link.current ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
          <span className={mobileStyles.overlayDivider} aria-hidden="true" />
          <div className={mobileStyles.mobileActions}>
            <Button
              as="a"
              href={CONTRIBUTING_URL}
              variant="primary"
              size="medium"
            >
              Contribute
            </Button>
          </div>
        </nav>
      </details>
    </>
  );
}
