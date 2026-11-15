import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import * as fontkit from "fontkit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "../..");

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

export function slugify(value) {
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
  let cursorX = anchor === "middle" ? x - totalWidth / 2 : anchor === "end" ? x - totalWidth : x;
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
  const baseSize = 78;
  const letterSpacing = 1;
  const minSingle = 44;
  const minDual = 38;
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

function parseCodeWords(codeOrUrl) {
  const raw = String(codeOrUrl || "").trim();
  if (!raw) return "";
  let code = raw;
  try {
    const maybe = new URL(raw);
    code = (maybe.pathname || "").replace(/^\/+/, "");
  } catch {
    // keep raw as-is
  }
  const clean = code
    .toLowerCase()
    .replace(/[^a-z0-9.\-\s]/g, "")
    .replace(/\s+/g, "");
  const tokens = clean.split(".").filter(Boolean);
  if (tokens.length >= 3) return tokens.slice(-3).join(" ");
  return clean.replaceAll(".", " ");
}

function textBox(text, x, baselineY, fontSize, letterSpacing = 0, anchor = "middle") {
  const width = measureTextWidth(text, fontSize, letterSpacing);
  const left = anchor === "middle" ? x - width / 2 : anchor === "end" ? x - width : x;
  return {
    left,
    right: left + width,
    top: baselineY - fontSize * 0.82,
    bottom: baselineY + fontSize * 0.26
  };
}

function assertInsideBox(box, bounds, label) {
  if (box.left < bounds.left || box.right > bounds.right || box.top < bounds.top || box.bottom > bounds.bottom) {
    throw new Error(
      `Layout overflow for "${label}": ` +
      `box(${box.left.toFixed(1)},${box.top.toFixed(1)}→${box.right.toFixed(1)},${box.bottom.toFixed(1)}) ` +
      `outside bounds(${bounds.left.toFixed(1)},${bounds.top.toFixed(1)}→${bounds.right.toFixed(1)},${bounds.bottom.toFixed(1)})`
    );
  }
}

export function filenameStem(label) {
  const variant = label.variant || DEFAULT_VARIANT;
  const titlePart = slugify(label.title || "") || "untitled";
  return `${label.slug}-${titlePart}-${variant}`;
}

export function validateLabel(label) {
  for (const key of ["title", "slug", "variant", "section", "address1", "address2", "code"]) {
    if (!(key in label) || typeof label[key] !== "string") {
      throw new Error(`Label "${label.slug ?? "unknown"}" missing required string field "${key}"`);
    }
    if (key !== "title" && label[key].trim() === "") {
      throw new Error(`Label "${label.slug ?? "unknown"}" has empty required field "${key}"`);
    }
  }
}

export function renderMinimalistSvg(label) {
  validateLabel(label);
  const topRuleX = 180;
  const topRuleY = 66;
  const topRuleW = 840;
  const topRuleH = 5;

  const bracketX = 220;
  const bracketY = 124;
  const bracketW = 760;
  const bracketH = 198;
  const bracketStroke = 3;
  const bracketArm = 22;

  const footerBarW = topRuleW;
  const footerBarH = 58;
  const footerBarX = topRuleX;
  const footerBarY = 562;

  const hasTitle = !!String(label.title || "").trim();
  const yShift = 0;
  const heroWords = parseCodeWords(label.code || label.url);
  if (!heroWords.trim()) throw new Error(`Label "${label.slug}" has invalid code "${label.code}"`);
  const textLeftX = bracketX + 30;
  const textRightX = bracketX + bracketW - 30;
  const textCenterX = (textLeftX + textRightX) / 2;
  const hero = fitHero(heroWords, textRightX - textLeftX - 40);
  const heroCenterY = bracketY + 136;
  const heroLineHeight = hero.size * 1.12;
  const sectionBaseline = bracketY + 46;
  const heroOneBaseline = (hero.lines.length === 1 ? heroCenterY : heroCenterY - heroLineHeight / 2) + yShift;
  const heroTwoBaseline = heroCenterY + heroLineHeight / 2 + yShift;
  const slashLeftBaseline = sectionBaseline;
  const slashRightBaseline = hero.lines.length === 1 ? heroOneBaseline : heroTwoBaseline;

  const titleBaseline = bracketY + bracketH + 44;
  const address1Baseline = titleBaseline + (hasTitle ? 38 : 0);
  const address2Baseline = address1Baseline + 34;

  const titlePath = hasTitle ? textPath(label.title, textCenterX, titleBaseline, 49, 0.2) : "";
  const sectionPath = textPath(label.section, textLeftX, sectionBaseline, 34, 0.6, "start");
  const heroOne = textPath(hero.lines[0], textCenterX, heroOneBaseline, hero.size, hero.letterSpacing);
  const heroTwo = hero.lines.length > 1 ? textPath(hero.lines[1], textCenterX, heroTwoBaseline, hero.size, hero.letterSpacing) : "";
  const leftSlash = textPath("\\", textLeftX - 22, slashLeftBaseline, 30, 0, "start");
  const rightSlash = textPath("/", textRightX + 8, slashRightBaseline, 30, 0, "start");
  const address1 = textPath(label.address1, textCenterX, address1Baseline, 46, 0.2, "middle");
  const address2 = textPath(label.address2, textCenterX, address2Baseline, 46, 0.2, "middle");
  const footerFontSize = 30;
  const footer = textPath(FOOTER_TEXT, SVG_WIDTH / 2, footerBarY + 39, footerFontSize, 0);

  const logoW = 320;
  const logoH = logoW / 2.28;
  const logoX = (SVG_WIDTH - logoW) / 2;
  const logoY = 26;

  const codeAria = escapeXml(`${label.section} ${heroWords}`);
  const bracketTextBounds = {
    left: bracketX + 18,
    right: bracketX + bracketW - 18,
    top: bracketY + 14,
    bottom: bracketY + bracketH - 14
  };
  const contentBounds = {
    left: 100,
    right: SVG_WIDTH - 100,
    top: bracketY,
    bottom: footerBarY - 16
  };
  assertInsideBox(textBox(label.section, textLeftX, sectionBaseline, 34, 0.6, "start"), bracketTextBounds, "section");
  assertInsideBox(textBox(hero.lines[0], textCenterX, heroOneBaseline, hero.size, hero.letterSpacing, "middle"), bracketTextBounds, "hero line 1");
  if (heroTwo) assertInsideBox(textBox(hero.lines[1], textCenterX, heroTwoBaseline, hero.size, hero.letterSpacing, "middle"), bracketTextBounds, "hero line 2");
  if (textBox(label.section, textLeftX, sectionBaseline, 34, 0.6, "start").bottom + 8 > textBox(hero.lines[0], textCenterX, heroOneBaseline, hero.size, hero.letterSpacing, "middle").top) {
    throw new Error("Layout collision: section overlaps hero words");
  }
  if (hasTitle) assertInsideBox(textBox(label.title, textCenterX, titleBaseline, 49, 0.2, "middle"), contentBounds, "title");
  assertInsideBox(textBox(label.address1, textCenterX, address1Baseline, 46, 0.2, "middle"), contentBounds, "address1");
  assertInsideBox(textBox(label.address2, textCenterX, address2Baseline, 46, 0.2, "middle"), contentBounds, "address2");
  assertInsideBox(textBox(FOOTER_TEXT, SVG_WIDTH / 2, footerBarY + 39, footerFontSize, 0, "middle"), {
    left: footerBarX + 16,
    right: footerBarX + footerBarW - 16,
    top: footerBarY + 4,
    bottom: footerBarY + footerBarH - 4
  }, "footer");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" role="img" aria-label="${codeAria}">
  <rect width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="#ffffff" />
  <rect x="${topRuleX}" y="${topRuleY}" width="${topRuleW}" height="${topRuleH}" fill="${BRAND_BLUE}" />

  <g>
    <image href="${logoFullDataUri}" x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}" />
  </g>

  <path d="M ${bracketX} ${bracketY + bracketArm} L ${bracketX} ${bracketY} L ${bracketX + bracketArm} ${bracketY}" stroke="${BRAND_BLUE}" stroke-width="${bracketStroke}" fill="none" />
  <path d="M ${bracketX + bracketW - bracketArm} ${bracketY} L ${bracketX + bracketW} ${bracketY} L ${bracketX + bracketW} ${bracketY + bracketArm}" stroke="${BRAND_BLUE}" stroke-width="${bracketStroke}" fill="none" />
  <path d="M ${bracketX} ${bracketY + bracketH - bracketArm} L ${bracketX} ${bracketY + bracketH} L ${bracketX + bracketArm} ${bracketY + bracketH}" stroke="${BRAND_BLUE}" stroke-width="${bracketStroke}" fill="none" />
  <path d="M ${bracketX + bracketW - bracketArm} ${bracketY + bracketH} L ${bracketX + bracketW} ${bracketY + bracketH} L ${bracketX + bracketW} ${bracketY + bracketH - bracketArm}" stroke="${BRAND_BLUE}" stroke-width="${bracketStroke}" fill="none" />

  <path d="${sectionPath}" fill="${BRAND_BLUE}" />
  <path d="${leftSlash}" fill="${BRAND_BLUE}" fill-opacity="0.55" />
  <path d="${heroOne}" fill="#111111" stroke="#111111" stroke-width="1.5" stroke-linejoin="round" />
  ${heroTwo ? `<path d="${heroTwo}" fill="#111111" stroke="#111111" stroke-width="1.5" stroke-linejoin="round" />` : ""}
  <path d="${rightSlash}" fill="${BRAND_BLUE}" fill-opacity="0.55" />

  ${hasTitle ? `<path d="${titlePath}" fill="#3f3f3f" />` : ""}
  <path d="${address1}" fill="#3f3f3f" />
  <path d="${address2}" fill="#3f3f3f" />

  <rect x="${footerBarX}" y="${footerBarY}" width="${footerBarW}" height="${footerBarH}" fill="${BRAND_BLUE}" />
  <path d="${footer}" fill="#ffffff" />
</svg>`;
}

export function renderPng(svgSource) {
  const resvg = new Resvg(svgSource, {
    fitTo: { mode: "width", value: SVG_WIDTH * PNG_SCALE }
  });
  return resvg.render().asPng();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2] || "svg";
  const payload = process.argv[3] ? JSON.parse(process.argv[3]) : JSON.parse(readFileSync(0, "utf8"));
  const svg = renderMinimalistSvg(payload);
  if (mode === "png") {
    process.stdout.write(renderPng(svg));
  } else {
    process.stdout.write(svg);
  }
}
