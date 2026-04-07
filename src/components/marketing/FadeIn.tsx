"use client";

import { useEffect } from "react";

/**
 * Mounts a single IntersectionObserver that adds `.on` to any `.fi` element
 * once it scrolls into view. Mirrors the script in the original index.html.
 */
export function FadeInObserver() {
  useEffect(() => {
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
    document.querySelectorAll(".fi").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
