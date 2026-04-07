import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="eo-footer">
      <div className="fg">
        <div>
          <div className="fl">Easy OEE</div>
          <p className="fd">
            Real-time OEE tracking built for Canadian plant managers. No hardware. No
            complexity. Just clarity on the shop floor.
          </p>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 13 }}>
            Made in Canada 🍁
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
