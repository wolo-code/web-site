import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "../..");

const labelsConfigPath = resolve(repoRoot, "Config/Labels.json");
const outputDir = resolve(repoRoot, "Root/Resource/labels");

const BRAND_BLUE = "#69b7cf";
const SVG_WIDTH = 1200;
const SVG_HEIGHT = 630;
const PNG_SCALE = 2;

function readFontBase64(relativePath) {
  const absolutePath = resolve(__dirname, "node_modules", relativePath);
  return readFileSync(absolutePath).toString("base64");
}

const abelWoff2 = readFontBase64("@fontsource/abel/files/abel-latin-400-normal.woff2");
const robotoWoff2 = readFontBase64("@fontsource/roboto/files/roboto-latin-400-normal.woff2");

function escapeXml(input) {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function viewfinderCorners(x, y, width, height) {
  const corner = 40;
  const gap = 14;
  const right = x + width;
  const bottom = y + height;

  return [
    `M ${x} ${y + corner} V ${y + gap} H ${x + corner}`,
    `M ${right - corner} ${y} H ${right - gap} V ${y + corner}`,
    `M ${x} ${bottom - corner} V ${bottom - gap} H ${x + corner}`,
    `M ${right - corner} ${bottom} H ${right - gap} V ${bottom - corner}`
  ].join(" ");
}

function renderSvg(label) {
  const region = escapeXml(label.region);
  const words = escapeXml(label.words);
  const address = escapeXml(label.address);
  const code = escapeXml(`${label.region} ${label.words}`);
  const liveUrl = escapeXml(label.url.replace(/^https?:\/\//, ""));
  const footer = "Scan or enter at www.wolo.codes";

  const boxX = 120;
  const boxY = 150;
  const boxW = SVG_WIDTH - 240;
  const boxH = 265;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" role="img" aria-label="${code}">
  <defs>
    <style>
      @font-face {
        font-family: "Abel";
        src: url(data:font/woff2;base64,${abelWoff2}) format("woff2");
        font-style: normal;
        font-weight: 400;
      }
      @font-face {
        font-family: "Roboto";
        src: url(data:font/woff2;base64,${robotoWoff2}) format("woff2");
        font-style: normal;
        font-weight: 400;
      }
      .region { fill: ${BRAND_BLUE}; font-family: "Roboto", Arial, sans-serif; font-size: 34px; letter-spacing: 0.6px; }
      .code { fill: ${BRAND_BLUE}; font-family: "Roboto", Arial, sans-serif; font-size: 28px; letter-spacing: 0.3px; }
      .words { fill: #000000; font-family: "Abel", Arial, sans-serif; font-size: 94px; letter-spacing: 1px; }
      .address { fill: #1f1f1f; font-family: "Roboto", Arial, sans-serif; font-size: 30px; }
      .footer { fill: ${BRAND_BLUE}; font-family: "Roboto", Arial, sans-serif; font-size: 34px; }
    </style>
  </defs>
  <rect x="0" y="0" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="#ffffff" />
  <text x="${SVG_WIDTH / 2}" y="88" class="region" text-anchor="middle">${region}</text>
  <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="30" ry="30" fill="#ffffff" stroke="${BRAND_BLUE}" stroke-width="5" />
  <path d="${viewfinderCorners(boxX - 24, boxY - 24, boxW + 48, boxH + 48)}" fill="none" stroke="${BRAND_BLUE}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
  <text x="${SVG_WIDTH / 2}" y="${boxY + 66}" class="code" text-anchor="middle">${liveUrl}</text>
  <text x="${SVG_WIDTH / 2}" y="${boxY + 187}" class="words" text-anchor="middle">${words}</text>
  <text x="${SVG_WIDTH / 2}" y="${boxY + boxH + 72}" class="address" text-anchor="middle">${address}</text>
  <text x="${SVG_WIDTH / 2}" y="${SVG_HEIGHT - 54}" class="footer" text-anchor="middle">${footer}</text>
</svg>`;
}

function renderPng(svgSource) {
  const resvg = new Resvg(svgSource, {
    fitTo: {
      mode: "width",
      value: SVG_WIDTH * PNG_SCALE
    }
  });

  return resvg.render().asPng();
}

function validateLabel(label) {
  const required = ["slug", "region", "words", "url", "address"];
  for (const key of required) {
    if (!label[key] || typeof label[key] !== "string") {
      throw new Error(`Label "${label.slug ?? "unknown"}" is missing required string key "${key}"`);
    }
  }
}

function run() {
  const labels = JSON.parse(readFileSync(labelsConfigPath, "utf8"));
  if (!Array.isArray(labels)) {
    throw new Error("Config/Labels.json must contain a JSON array");
  }

  mkdirSync(outputDir, { recursive: true });

  for (const label of labels) {
    validateLabel(label);
    const svg = renderSvg(label);
    const png = renderPng(svg);
    writeFileSync(resolve(outputDir, `${label.slug}.svg`), svg);
    writeFileSync(resolve(outputDir, `${label.slug}.png`), png);
    console.log(`generated labels/${label.slug}.svg + labels/${label.slug}.png`);
  }
}

run();
