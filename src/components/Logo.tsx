import Image from "next/image";

/**
 * Brand logo. Renders the white-ink variant by default and the dark-ink
 * variant when `data-theme="light"` is set on <html>. Both variants are
 * rendered, only one is visible — keeps the markup server-renderable
 * with no client JS and no layout shift on theme switch.
 *
 * Default height is 48px which fits most app surfaces. Override with the
 * `height` prop. Width auto-scales to preserve the SVG aspect ratio.
 */
export function Logo({
  height = 48,
  priority = false,
  className,
  style,
}: {
  height?: number;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  // Note: `display` is intentionally omitted from inline styles so the
  // .logo-swap-* CSS classes can hide the unused variant via `display: none`.
  const merged: React.CSSProperties = {
    height,
    width: "auto",
    ...style,
  };
  return (
    <span
      className={`logo-swap${className ? ` ${className}` : ""}`}
      style={{ display: "inline-flex", alignItems: "center", lineHeight: 0 }}
    >
      <Image
        src="/easy-oee-logo.svg"
        alt="Easy OEE"
        width={713}
        height={175}
        priority={priority}
        className="logo-swap-dark"
        style={merged}
      />
      <Image
        src="/easy-oee-logo-dark.svg"
        alt=""
        aria-hidden
        width={713}
        height={175}
        priority={priority}
        className="logo-swap-light"
        style={merged}
      />
    </span>
  );
}
