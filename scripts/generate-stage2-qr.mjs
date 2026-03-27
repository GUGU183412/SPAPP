import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import QRCode from "qrcode";

const args = process.argv.slice(2);

function readArg(name) {
  const index = args.indexOf(name);
  if (index >= 0 && args[index + 1]) {
    return args[index + 1];
  }
  return null;
}

const stage2Url =
  readArg("--url") ||
  process.env.STAGE2_DEMO_URL ||
  "https://<github-username>.github.io/<repo>/?asin=B0BXJLTRSH&src=qr";
const outputDir = path.resolve(
  process.cwd(),
  readArg("--out-dir") || "docs/stages/stage-2/assets/qr"
);

fs.mkdirSync(outputDir, { recursive: true });

const pngPath = path.join(outputDir, "stage2-demo-qr.png");
const svgPath = path.join(outputDir, "stage2-demo-qr.svg");
const metaPath = path.join(outputDir, "stage2-demo-qr.txt");

await QRCode.toFile(pngPath, stage2Url, {
  type: "png",
  margin: 2,
  width: 960,
  color: {
    dark: "#000000",
    light: "#ffffff"
  }
});

const svg = await QRCode.toString(stage2Url, {
  type: "svg",
  margin: 2,
  color: {
    dark: "#000000",
    light: "#ffffff"
  }
});

fs.writeFileSync(svgPath, svg, "utf8");
fs.writeFileSync(
  metaPath,
  [
    "Stage 2 Demo QR Asset",
    `URL=${stage2Url}`,
    "PNG=stage2-demo-qr.png",
    "SVG=stage2-demo-qr.svg"
  ].join("\n"),
  "utf8"
);

console.log(
  JSON.stringify(
    {
      url: stage2Url,
      outputDir,
      files: [pngPath, svgPath, metaPath]
    },
    null,
    2
  )
);
