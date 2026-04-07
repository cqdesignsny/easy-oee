import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="eo-footer">
      <div className="fg">
        <div>
          <Image
            src="/easy-oee-logo.svg"
            alt="Easy OEE"
            width={713}
            height={175}
            style={{ height: 72, width: "auto", display: "block", marginBottom: 22 }}
          />
          <p className="fd">
            Real-time OEE tracking built for plant managers who want clarity on the shop floor.
            No hardware. No complexity.
          </p>
        </div>
        <div className="fc">
          <h4>Product</h4>
          <Link href="/how-it-works">How It Works</Link>
          <Link href="/#features">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/roi-calculator">ROI Calculator</Link>
        </div>
        <div className="fc">
          <h4>Company</h4>
          <Link href="/contact">Book a Demo</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </div>
      <div className="fb">
        <span>© {new Date().getFullYear()} Easy OEE Inc. All rights reserved.</span>
        <span>easy-oee.com</span>
      </div>
    </footer>
  );
}
