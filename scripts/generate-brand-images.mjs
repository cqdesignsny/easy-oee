// Generate the branded favicon, Apple touch icon, and Open Graph image.
// Run with: node scripts/generate-brand-images.mjs
//
// Reads public/easy-oee-logo.svg, composites it centered on the site's
// teal background (#003038), writes static PNGs that Next.js will serve
// via the metadata file convention (icon.png, apple-icon.png,
// opengraph-image.png in src/app/).

import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..");
const BG = { r: 0, g: 48, b: 56, alpha: 1 }; // #003038
const SVG_PATH = join(REPO, "public", "easy-oee-logo.svg");
const APP_DIR = join(REPO, "src", "app");

const svgBuffer = readFileSync(SVG_PATH);

// Logo native viewBox is 713.38 × 175.25 → aspect ratio 4.07:1
const LOGO_ASPECT = 713.38 / 175.25;

async function renderLogo(targetWidthPx) {
  const targetHeightPx = Math.round(targetWidthPx / LOGO_ASPECT);
  // High DPI render: ask sharp for a 2x density so the rasterization is crisp.
  return sharp(svgBuffer, { density: 600 })
    .resize({
      width: targetWidthPx,
      height: targetHeightPx,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function makeImage({ width, height, logoFraction, outFile }) {
  const logoWidth = Math.round(width * logoFraction);
  const logoBuffer = await renderLogo(logoWidth);

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: logoBuffer, gravity: "center" }])
    .png()
    .toFile(outFile);

  console.log(`✓ wrote ${outFile.replace(REPO + "/", "")} (${width}×${height})`);
}

async function main() {
  mkdirSync(APP_DIR, { recursive: true });

  // Browser favicon — square, logo at ~78% width
  await makeImage({
    width: 512,
    height: 512,
    logoFraction: 0.82,
    outFile: join(APP_DIR, "icon.png"),
  });

  // iOS home screen — square, logo at ~80% width
  await makeImage({
    width: 180,
    height: 180,
    logoFraction: 0.82,
    outFile: join(APP_DIR, "apple-icon.png"),
  });

  // Open Graph (Slack/iMessage/Twitter/LinkedIn) — 1.91:1 wide, logo at ~70%
  await makeImage({
    width: 1200,
    height: 630,
    logoFraction: 0.7,
    outFile: join(APP_DIR, "opengraph-image.png"),
  });

  // Twitter card uses the same image
  await makeImage({
    width: 1200,
    height: 630,
    logoFraction: 0.7,
    outFile: join(APP_DIR, "twitter-image.png"),
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
