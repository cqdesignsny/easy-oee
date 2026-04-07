import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const dmSans = DM_Sans({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://easy-oee.com"),
  title: "Easy OEE | Real-Time OEE Tracking for Canadian Manufacturers",
  description:
    "Easy OEE helps plant managers track Overall Equipment Effectiveness in real time. Reduce downtime, increase throughput, and make data-driven decisions on the shop floor.",
  icons: {
    icon: "/easy-oee-logo.svg",
    shortcut: "/easy-oee-logo.svg",
    apple: "/easy-oee-logo.svg",
  },
  openGraph: {
    title: "Easy OEE",
    description:
      "Real-time OEE tracking for Canadian plant managers. No hardware. No IT. Up and running in one shift.",
    url: "https://easy-oee.com",
    siteName: "Easy OEE",
    locale: "en_CA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
