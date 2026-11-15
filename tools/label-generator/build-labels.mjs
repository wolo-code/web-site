import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import * as fontkit from "fontkit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "../..");

const labelsConfigPath = resolve(repoRoot, "Config/Labels.json");
const outputDir = resolve(repoRoot, "Root/Resource/labels");
const testOutputDir = resolve(outputDir, "tests");

const SVG_WIDTH = 1200;
const SVG_HEIGHT = 630;
const PNG_SCALE = 2;
const BRAND_BLUE = "#69b7cf";
const FOOTER_TEXT = "Scan or enter at www.wolo.codes";
const DEFAULT_VARIANT = "minimalist";

const abelWoff = readFileSync(resolve(__dirname, "node_modules/@fontsource/abel/files/abel-latin-400-normal.woff"));
const abelFont = fontkit.create(abelWoff);

const logoFullSvg = readFileSync(resolve(repoRoot, "Root/Resource/logo_full.svg"), "utf8");
const logoFullDataUri = `data:image/svg+xml;base64,${Buffer.from(logoFullSvg).toString("base64")}`;

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function measureTextWidth(text, fontSize, letterSpacing = 0) {
  const glyphs = abelFont.layout(text).glyphs;
  const glyphAdvance = glyphs.reduce((sum, glyph) => sum + glyph.advanceWidth, 0);
  const pxAdvance = (glyphAdvance / abelFont.unitsPerEm) * fontSize;
  return pxAdvance + Math.max(0, text.length - 1) * letterSpacing;
}

function textPath(text, x, baselineY, fontSize, letterSpacing = 0, anchor = "middle") {
  const scale = fontSize / abelFont.unitsPerEm;
  const run = abelFont.layout(text);
  const totalWidth = measureTextWidth(text, fontSize, letterSpacing);
  let cursorX = anchor === "middle" ? x - totalWidth / 2 : x;
  const commands = [];

  for (const glyph of run.glyphs) {
    for (const cmd of glyph.path.commands) {
      const args = cmd.args ?? [];
      const p = (idx) => `${(cursorX + args[idx] * scale).toFixed(2)} ${(baselineY - args[idx + 1] * scale).toFixed(2)}`;
      if (cmd.command === "moveTo") commands.push(`M ${p(0)}`);
      else if (cmd.command === "lineTo") commands.push(`L ${p(0)}`);
      else if (cmd.command === "quadraticCurveTo") commands.push(`Q ${p(0)} ${p(2)}`);
      else if (cmd.command === "bezierCurveTo") commands.push(`C ${p(0)} ${p(2)} ${p(4)}`);
      else if (cmd.command === "closePath") commands.push("Z");
    }
    cursorX += glyph.advanceWidth * scale + letterSpacing;
  }

  return commands.join(" ");
}

function fitHero(words, maxWidth) {
  const baseSize = 94;
  const letterSpacing = 1;
  const minSingle = 54;
  const minDual = 46;
  const singleScale = Math.min(1, maxWidth / measureTextWidth(words, baseSize, letterSpacing));
  if (baseSize * singleScale >= minSingle) {
    return { lines: [words], size: baseSize * singleScale, letterSpacing };
  }

  const tokens = words.trim().split(/\s+/);
  let best = { lines: [words], size: minDual };
  for (let split = 1; split < tokens.length; split += 1) {
    const first = tokens.slice(0, split).join(" ");
    const second = tokens.slice(split).join(" ");
    const width = Math.max(measureTextWidth(first, baseSize, letterSpacing), measureTextWidth(second, baseSize, letterSpacing));
    const size = Math.min(baseSize, (maxWidth / width) * baseSize);
    if (size > best.size) best = { lines: [first, second], size };
  }
  best.size = Math.max(best.size, minDual);
  best.letterSpacing = letterSpacing;
  return best;
}

function filenameStem(label) {
  const variant = label.variant || DEFAULT_VARIANT;
  return `${label.slug}-${slugify(label.title)}-${variant}`;
}

function renderMinimalistSvg(label) {
  const borderX = 70;
  const borderY = 120;
  const borderW = SVG_WIDTH - borderX * 2;
  const borderH = 430;
  const footerBarH = 58;
  const footerBarX = borderX + 2;
  const footerBarY = borderY + borderH - footerBarH - 2;
  const footerBarW = borderW - 4;

  const hero = fitHero(label.words, borderW - 150);
  const heroCenterY = 302;
  const heroLineHeight = hero.size * 1.12;

  const region = textPath(label.region, SVG_WIDTH / 2, 196, 34, 0.6);
  const heroOne = textPath(hero.lines[0], SVG_WIDTH / 2, hero.lines.length === 1 ? heroCenterY : heroCenterY - heroLineHeight / 2, hero.size, hero.letterSpacing);
  const heroTwo = hero.lines.length > 1 ? textPath(hero.lines[1], SVG_WIDTH / 2, heroCenterY + heroLineHeight / 2, hero.size, hero.letterSpacing) : "";
  const address = textPath(label.address, SVG_WIDTH / 2, 438, 30, 0);
  const footer = textPath(FOOTER_TEXT, SVG_WIDTH / 2, footerBarY + 40, 32, 0);

  const logoW = 340;
  const logoH = 74;
  const logoX = (SVG_WIDTH - logoW) / 2;
  const logoY = 18;

  const codeAria = escapeXml(`${label.region} ${label.words}`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" role="img" aria-label="${codeAria}">
  <rect width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="#ffffff" />
  <rect x="${borderX}" y="${borderY}" width="${borderW}" height="${borderH}" fill="none" stroke="${BRAND_BLUE}" stroke-width="4" />

  <g>
    <image href="${logoFullDataUri}" x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}" />
  </g>

  <path d="${region}" fill="${BRAND_BLUE}" />
  <path d="${heroOne}" fill="#111111" stroke="#111111" stroke-width="1.1" stroke-linejoin="round" />
  ${heroTwo ? `<path d="${heroTwo}" fill="#111111" stroke="#111111" stroke-width="1.1" stroke-linejoin="round" />` : ""}
  <path d="${address}" fill="#2a2a2a" />

  <rect x="${footerBarX}" y="${footerBarY}" width="${footerBarW}" height="${footerBarH}" fill="${BRAND_BLUE}" />
  <path d="${footer}" fill="#ffffff" />
</svg>`;
}

function renderPng(svgSource) {
  const resvg = new Resvg(svgSource, {
    fitTo: { mode: "width", value: SVG_WIDTH * PNG_SCALE }
  });
  return resvg.render().asPng();
}

function validateLabel(label) {
  for (const key of ["title", "slug", "variant", "region", "words", "url", "address"]) {
    if (!label[key] || typeof label[key] !== "string") {
      throw new Error(`Label "${label.slug ?? "unknown"}" missing required string field "${key}"`);
    }
  }
}

function writeOutputs(baseDir, baseName, svg, png) {
  writeFileSync(resolve(baseDir, `${baseName}.svg`), svg);
  writeFileSync(resolve(baseDir, `${baseName}.png`), png);
}

function run() {
  const labels = JSON.parse(readFileSync(labelsConfigPath, "utf8"));
  if (!Array.isArray(labels)) throw new Error("Config/Labels.json must be an array");

  mkdirSync(outputDir, { recursive: true });
  mkdirSync(testOutputDir, { recursive: true });

  for (const label of labels) {
    validateLabel(label);
    const variant = label.variant || DEFAULT_VARIANT;
    if (variant !== DEFAULT_VARIANT) throw new Error(`Unsupported variant "${variant}" for label "${label.slug}"`);

    const svg = renderMinimalistSvg(label);
    const png = renderPng(svg);
    const stem = filenameStem(label);
    writeOutputs(outputDir, stem, svg, png);
    writeOutputs(outputDir, label.slug, svg, png); // keep existing slug-only URL path working
    console.log(`generated labels/${stem}.svg + labels/${stem}.png (+ slug aliases)`);
  }

  const longCase = {
    title: "Longest Words Test",
    slug: "kathmandu-longest-words-test",
    variant: DEFAULT_VARIANT,
    region: "Kathmandu",
    words: "calculator chimpanzee helicopter",
    url: "https://wolo.codes/kathmandu.calculator.chimpanzee.helicopter",
    address: "Test render for long-word fit (not part of gallery)."
  };
  const testSvg = renderMinimalistSvg(longCase);
  const testPng = renderPng(testSvg);
  const testStem = filenameStem(longCase);
  writeOutputs(testOutputDir, testStem, testSvg, testPng);
  console.log(`generated labels/tests/${testStem}.svg + labels/tests/${testStem}.png`);
}

run();
