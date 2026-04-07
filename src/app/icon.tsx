import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  const svg = readFileSync(
    join(process.cwd(), "public", "easy-oee-logo.svg"),
    "utf-8",
  );
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#003038",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUri} width={420} height={103} alt="Easy OEE" />
      </div>
    ),
    { ...size },
  );
}
