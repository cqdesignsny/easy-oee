import Image from "next/image";

/**
 * Brand logo. Use this anywhere the Easy OEE wordmark belongs.
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
  return (
    <Image
      src="/easy-oee-logo.svg"
      alt="Easy OEE"
      width={713}
      height={175}
      priority={priority}
      className={className}
      style={{ height, width: "auto", display: "block", ...style }}
    />
  );
}
