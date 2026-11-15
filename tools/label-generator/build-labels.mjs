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

const BRAND_BLUE = "#69b7cf";
const SVG_WIDTH = 1200;
const SVG_HEIGHT = 630;
const PNG_SCALE = 2;
const FOOTER_TEXT = "Scan or enter at www.wolo.codes";

function readBinary(relativePath) {
  const absolutePath = resolve(__dirname, "node_modules", relativePath);
  return readFileSync(absolutePath);
}

const abelWoff = readBinary("@fontsource/abel/files/abel-latin-400-normal.woff");
const robotoCondensedWoff = readBinary("@fontsource/roboto-condensed/files/roboto-condensed-latin-400-normal.woff");
const abelFont = fontkit.create(abelWoff);
const robotoCondensedFont = fontkit.create(robotoCondensedWoff);

function measureTextWidth(text, font, fontSize, letterSpacing = 0) {
  const glyphs = font.layout(text).glyphs;
  const glyphAdvance = glyphs.reduce((sum, glyph) => sum + glyph.advanceWidth, 0);
  const pxAdvance = (glyphAdvance / font.unitsPerEm) * fontSize;
  const spacing = Math.max(0, text.length - 1) * letterSpacing;
  return pxAdvance + spacing;
}

function fitHeroWords(words, availableWidth, baseSize = 94) {
  const letterSpacing = 1;
  const minSingleLineSize = 54;
  const minTwoLineSize = 48;

  const singleLineWidth = measureTextWidth(words, abelFont, baseSize, letterSpacing);
  const singleLineSize = Math.min(baseSize, baseSize * (availableWidth / singleLineWidth));
  if (singleLineSize >= minSingleLineSize) {
    return { lines: [words], fontSize: singleLineSize, letterSpacing };
  }

  const tokens = words.trim().split(/\s+/);
  if (tokens.length < 2) {
    return { lines: [words], fontSize: Math.max(singleLineSize, minTwoLineSize), letterSpacing };
  }

  let best = null;
  for (let i = 1; i < tokens.length; i += 1) {
    const lines = [tokens.slice(0, i).join(" "), tokens.slice(i).join(" ")];
    const widths = lines.map((line) => measureTextWidth(line, abelFont, baseSize, letterSpacing));
    const scale = availableWidth / Math.max(...widths);
    const size = Math.min(baseSize, baseSize * scale);
    if (!best || size > best.fontSize) {
      best = { lines, fontSize: size };
    }
  }

  if (best) {
    return {
      lines: best.lines,
      fontSize: Math.max(best.fontSize, minTwoLineSize),
      letterSpacing
    };
  }

  return { lines: [words], fontSize: minTwoLineSize, letterSpacing };
}

function glyphPathToSvg(font, text, x, baselineY, fontSize, letterSpacing = 0, anchor = "start") {
  const scale = fontSize / font.unitsPerEm;
  const run = font.layout(text);
  const glyphs = run.glyphs;
  const totalWidth = measureTextWidth(text, font, fontSize, letterSpacing);
  let cursorX = x;
  if (anchor === "middle") {
    cursorX = x - totalWidth / 2;
  } else if (anchor === "end") {
    cursorX = x - totalWidth;
  }

  const commands = [];
  for (const glyph of glyphs) {
    const path = glyph.path;
    for (const cmd of path.commands) {
      const args = cmd.args ?? [];
      const p = (idx) => `${(cursorX + args[idx] * scale).toFixed(2)} ${(baselineY - args[idx + 1] * scale).toFixed(2)}`;

      switch (cmd.command) {
        case "moveTo":
          commands.push(`M ${p(0)}`);
          break;
        case "lineTo":
          commands.push(`L ${p(0)}`);
          break;
        case "quadraticCurveTo":
          commands.push(`Q ${p(0)} ${p(2)}`);
          break;
        case "bezierCurveTo":
          commands.push(`C ${p(0)} ${p(2)} ${p(4)}`);
          break;
        case "closePath":
          commands.push("Z");
          break;
        default:
          throw new Error(`Unsupported path command: ${cmd.command}`);
      }
    }
    cursorX += glyph.advanceWidth * scale + letterSpacing;
  }
  return commands.join(" ");
}

function escapeXml(input) {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function viewfinderCorners(boxX, boxY, boxWidth, boxHeight) {
  const gap = 24;
  const corner = 64;
  const left = boxX - gap;
  const top = boxY - gap;
  const right = boxX + boxWidth + gap;
  const bottom = boxY + boxHeight + gap;

  return [
    `M ${left} ${top + corner} V ${top} H ${left + corner}`,
    `M ${right - corner} ${top} H ${right} V ${top + corner}`,
    `M ${left} ${bottom - corner} V ${bottom} H ${left + corner}`,
    `M ${right - corner} ${bottom} H ${right} V ${bottom - corner}`
  ].join(" ");
}

function renderSvg(label) {
  const code = escapeXml(`${label.region} ${label.words}`);

  const boxX = 120;
  const boxY = 162;
  const boxW = SVG_WIDTH - 240;
  const boxH = 250;
  const heroFit = fitHeroWords(label.words, boxW - 150);
  const heroLineHeight = heroFit.fontSize * 1.08;
  const heroCenterY = boxY + boxH / 2 + 8;
  const regionPath = glyphPathToSvg(robotoCondensedFont, label.region, SVG_WIDTH / 2, 88, 34, 0.5, "middle");
  const addressPath = glyphPathToSvg(robotoCondensedFont, label.address, SVG_WIDTH / 2, boxY + boxH + 72, 30, 0, "middle");
  const footerPath = glyphPathToSvg(robotoCondensedFont, FOOTER_TEXT, SVG_WIDTH / 2, SVG_HEIGHT - 54, 34, 0, "middle");
  const heroPathSingle = glyphPathToSvg(abelFont, label.words, SVG_WIDTH / 2, heroCenterY, heroFit.fontSize, heroFit.letterSpacing, "middle");
  const heroPathLineOne =
    heroFit.lines.length > 1
      ? glyphPathToSvg(abelFont, heroFit.lines[0], SVG_WIDTH / 2, heroCenterY - heroLineHeight / 2, heroFit.fontSize, heroFit.letterSpacing, "middle")
      : "";
  const heroPathLineTwo =
    heroFit.lines.length > 1
      ? glyphPathToSvg(abelFont, heroFit.lines[1], SVG_WIDTH / 2, heroCenterY + heroLineHeight / 2, heroFit.fontSize, heroFit.letterSpacing, "middle")
      : "";
  const heroText =
    heroFit.lines.length === 1
      ? `<path d="${heroPathSingle}" fill="#000000" />`
      : `<path d="${heroPathLineOne}" fill="#000000" />
  <path d="${heroPathLineTwo}" fill="#000000" />`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" role="img" aria-label="${code}">
  <rect x="0" y="0" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="#ffffff" />
  <path d="${regionPath}" fill="${BRAND_BLUE}" />
  <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="32" ry="32" fill="#ffffff" stroke="${BRAND_BLUE}" stroke-width="5" />
  <path d="${viewfinderCorners(boxX, boxY, boxW, boxH)}" fill="none" stroke="${BRAND_BLUE}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
  ${heroText}
  <path d="${addressPath}" fill="#1f1f1f" />
  <path d="${footerPath}" fill="${BRAND_BLUE}" />
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

  const longCase = {
    slug: "kathmandu-longest-words-test",
    region: "Kathmandu",
    words: "calculator chimpanzee helicopter",
    url: "https://wolo.codes/kathmandu.calculator.chimpanzee.helicopter",
    address: "Test render for long-word fit (not part of gallery)."
  };
  const testDir = resolve(outputDir, "tests");
  mkdirSync(testDir, { recursive: true });
  const testSvg = renderSvg(longCase);
  const testPng = renderPng(testSvg);
  writeFileSync(resolve(testDir, `${longCase.slug}.svg`), testSvg);
  writeFileSync(resolve(testDir, `${longCase.slug}.png`), testPng);
  console.log(`generated labels/tests/${longCase.slug}.svg + labels/tests/${longCase.slug}.png`);
}

run();
