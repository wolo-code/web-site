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
const LABEL_FRAME_PATH = "m 19.840979,2.5671816 c -0.524583,-0.6903878 -1.398888,-1.1371095 -2.375197,-1.1371095 l -16.0289336,0.013538 c -1.60289296,0 -2.9143517,1.2047943 -2.9143517,2.693866 v 13.5370149 c 0,1.489072 1.31145874,2.693866 2.9143517,2.693866 l 16.0289336,0.01354 c 0.976309,0 1.850614,-0.446721 2.375197,-1.137109 l 6.367858,-8.338802 z";
const FRAME_MIN_X = -1.4775033;
const FRAME_MAX_X = 26.208837;
const FRAME_MIN_Y = 1.4300721;
const FRAME_MAX_Y = 20.381896;
const FRAME_BAR_LEFT = 1.4368484;
const FRAME_BAR_RIGHT = 17.465782;
const FRAME_ARROW_BASE = 19.840979;

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
  const frameX = 16;
  const frameY = 140;
  const frameW = SVG_WIDTH - 32;
  const frameH = 350;
  const frameScaleX = frameW / (FRAME_MAX_X - FRAME_MIN_X);
  const frameScaleY = frameH / (FRAME_MAX_Y - FRAME_MIN_Y);
  const frameTx = frameX - FRAME_MIN_X * frameScaleX;
  const frameTy = frameY - FRAME_MIN_Y * frameScaleY;
  const frameMapX = (value) => frameTx + value * frameScaleX;
  const frameMapY = (value) => frameTy + value * frameScaleY;

  const footerBarH = 58;
  const footerBarX = frameMapX(FRAME_BAR_LEFT);
  const footerBarW = frameMapX(FRAME_BAR_RIGHT) - footerBarX;
  const footerBarY = frameY + frameH - footerBarH - 2;

  const hasTitle = !!String(label.title || "").trim();
  const yShift = hasTitle ? 0 : -36;
  const heroWords = parseCodeWords(label.code || label.url);
  if (!heroWords.trim()) throw new Error(`Label "${label.slug}" has invalid code "${label.code}"`);
  const textLeftX = frameMapX(2.3);
  const textRightX = frameMapX(FRAME_ARROW_BASE - 0.8);
  const textCenterX = (textLeftX + textRightX) / 2;
  const hero = fitHero(heroWords, textRightX - textLeftX - 24);
  const heroCenterY = frameY + 145;
  const heroLineHeight = hero.size * 1.12;
  const titleBaseline = frameY + 46;
  const sectionBaseline = frameY + 86 + yShift;
  const heroOneBaseline = (hero.lines.length === 1 ? heroCenterY : heroCenterY - heroLineHeight / 2) + yShift;
  const heroTwoBaseline = heroCenterY + heroLineHeight / 2 + yShift;
  const address1Baseline = frameY + 238 + yShift;
  const address2Baseline = frameY + 274 + yShift;

  const titlePath = hasTitle ? textPath(label.title, textCenterX, titleBaseline, 30, 0.4) : "";
  const sectionPath = textPath(label.section, textLeftX, sectionBaseline, 34, 0.6, "start");
  const heroOne = textPath(hero.lines[0], textCenterX, heroOneBaseline, hero.size, hero.letterSpacing);
  const heroTwo = hero.lines.length > 1 ? textPath(hero.lines[1], textCenterX, heroTwoBaseline, hero.size, hero.letterSpacing) : "";
  const address1 = textPath(label.address1, textLeftX, address1Baseline, 30, 0.2, "start");
  const address2 = textPath(label.address2, textLeftX, address2Baseline, 30, 0.2, "start");
  const footerFontSize = 30;
  const footer = textPath(FOOTER_TEXT, SVG_WIDTH / 2, footerBarY + 39, footerFontSize, 0);

  const logoW = 320;
  const logoH = logoW / 2.28;
  const logoX = (SVG_WIDTH - logoW) / 2;
  const logoY = 16;

  const codeAria = escapeXml(`${label.section} ${heroWords}`);
  const textBounds = {
    left: textLeftX,
    right: textRightX,
    top: frameY + 20,
    bottom: footerBarY - 8
  };
  if (hasTitle) assertInsideBox(textBox(label.title, textCenterX, titleBaseline, 30, 0.4, "middle"), textBounds, "title");
  assertInsideBox(textBox(label.section, textLeftX, sectionBaseline, 34, 0.6, "start"), textBounds, "section");
  assertInsideBox(textBox(hero.lines[0], textCenterX, heroOneBaseline, hero.size, hero.letterSpacing, "middle"), textBounds, "hero line 1");
  if (heroTwo) assertInsideBox(textBox(hero.lines[1], textCenterX, heroTwoBaseline, hero.size, hero.letterSpacing, "middle"), textBounds, "hero line 2");
  assertInsideBox(textBox(label.address1, textLeftX, address1Baseline, 30, 0.2, "start"), textBounds, "address1");
  assertInsideBox(textBox(label.address2, textLeftX, address2Baseline, 30, 0.2, "start"), textBounds, "address2");
  assertInsideBox(textBox(FOOTER_TEXT, SVG_WIDTH / 2, footerBarY + 39, footerFontSize, 0, "middle"), {
    left: footerBarX + 16,
    right: footerBarX + footerBarW - 16,
    top: footerBarY + 4,
    bottom: footerBarY + footerBarH - 4
  }, "footer");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" role="img" aria-label="${codeAria}">
  <rect width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="#ffffff" />
  <path d="${LABEL_FRAME_PATH}" fill="none" stroke="${BRAND_BLUE}" stroke-width="0.11" transform="translate(${frameTx.toFixed(2)} ${frameTy.toFixed(2)}) scale(${frameScaleX.toFixed(6)} ${frameScaleY.toFixed(6)})" />

  <g>
    <image href="${logoFullDataUri}" x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}" />
  </g>

  ${hasTitle ? `<path d="${titlePath}" fill="${BRAND_BLUE}" />` : ""}
  <path d="${sectionPath}" fill="${BRAND_BLUE}" />
  <path d="${heroOne}" fill="#111111" stroke="#111111" stroke-width="1.1" stroke-linejoin="round" />
  ${heroTwo ? `<path d="${heroTwo}" fill="#111111" stroke="#111111" stroke-width="1.1" stroke-linejoin="round" />` : ""}
  <path d="${address1}" fill="#2a2a2a" />
  <path d="${address2}" fill="#2a2a2a" />

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
