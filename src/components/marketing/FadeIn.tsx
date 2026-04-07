"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Reveals elements with class `.fi` by adding `.on`.
 *
 * Re-runs on every route change so client-side navigation between marketing
 * pages keeps the fade-in working (otherwise the layout-level observer would
 * never see the new page's elements).
 *
 * Also:
 *   - Immediately reveals elements that are already in the viewport (no wait
 *     for an intersection callback on above-the-fold content).
 *   - 1200ms safety timer: force-reveals anything still hidden, so a slow JS
 *     boot or a missed intersection never leaves a hero invisible.
 */
export function FadeInObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".fi"));
    if (els.length === 0) return;

    // 1. Reveal anything already in the viewport on this paint.
    const vh = window.innerHeight || document.documentElement.clientHeight;
    for (const el of els) {
      const rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.95 && rect.bottom > 0) {
        el.classList.add("on");
      }
    }

    // 2. Observe the rest as they scroll into view.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("on");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.08 },
    );
    for (const el of els) {
      if (!el.classList.contains("on")) io.observe(el);
    }

    // 3. Safety net — force reveal anything still hidden after 1.2s.
    const safety = window.setTimeout(() => {
      for (const el of els) el.classList.add("on");
    }, 1200);

    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, [pathname]);

  return null;
}
