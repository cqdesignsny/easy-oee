import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="eo-nav">
      <Link href="/" className="nav-logo">
        Easy OEE
      </Link>
      <div className="nav-links">
        <Link href="/how-it-works">How It Works</Link>
        <Link href="/#features">Features</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/roi-calculator">ROI Calculator</Link>
        <Link href="/sign-in" className="nav-signin">
          Sign In
        </Link>
        <Link href="/contact" className="nav-cta">
          Book a Demo
        </Link>
      </div>
    </nav>
  );
}
