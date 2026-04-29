import type { MetadataRoute } from "next";

/**
 * PWA manifest. Lets operators "Add to Home Screen" the operator surface
 * on a shop floor tablet so it launches fullscreen with no browser chrome.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Easy OEE",
    short_name: "Easy OEE",
    description: "Real-time OEE tracking for the shop floor",
    start_url: "/pin",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#003038",
    theme_color: "#003038",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
