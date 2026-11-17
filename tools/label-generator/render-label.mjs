import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import * as fontkit from "fontkit";
import { SVG_WIDTH, BRAND_BLUE, CITY_COLOR, FOOTER_TEXT, createLabelLayout } from "../../Root/Resource/label-layout-shared.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "../..");
const PNG_SCALE = 2;
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

export function filenameStem(label) {
  const variant = label.variant || DEFAULT_VARIANT;
  const titlePart = slugify(label.title || "") || "untitled";
  return `${label.slug}-${titlePart}-${variant}`;
}

export function validateLabel(label) {
  for (const key of ["slug", "variant", "code"]) {
    if (!(key in label) || typeof label[key] !== "string") {
      throw new Error(`Label "${label.slug ?? "unknown"}" missing required string field "${key}"`);
    }
    if (label[key].trim() === "") {
      throw new Error(`Label "${label.slug ?? "unknown"}" has empty required field "${key}"`);
    }
  }
  const variant = label.variant || DEFAULT_VARIANT;
  if (!["minimalist", "code"].includes(variant)) {
    throw new Error(`Label "${label.slug ?? "unknown"}" has unsupported variant "${variant}"`);
  }
}

export function renderMinimalistSvg(label) {
  validateLabel(label);
  const variant = label.variant || DEFAULT_VARIANT;
  const layout = createLabelLayout(label, measureTextWidth, variant);
  const titlePath = layout.hasTitle ? textPath(label.title, layout.textCenter, layout.titleBaseline, 44, 0.2) : "";
  const sectionPath = layout.hasSection ? textPath(layout.sectionText, layout.textCenter, layout.sectionBaseline, 30, 0.4) : "";
  const cityPath = layout.hasCity ? textPath(layout.cityText, layout.textLeft, layout.cityBaseline, 34, 0.6, "start") : "";
  const heroOne = textPath(layout.hero.lines[0], layout.textCenter, layout.heroOneBaseline, layout.hero.size, layout.hero.letterSpacing);
  const heroTwo = layout.hero.lines.length > 1 ? textPath(layout.hero.lines[1], layout.textCenter, layout.heroTwoBaseline, layout.hero.size, layout.hero.letterSpacing) : "";
  const leftSlash = layout.hasCity ? textPath("\\", layout.citySlashX, layout.cityBaseline, 30, 0, "start") : "";
  const rightSlash = textPath("/", layout.heroSlashX, layout.hero.lines.length === 1 ? layout.heroOneBaseline : layout.heroTwoBaseline, 30, 0, "start");
  const address1 = layout.address1Baseline && layout.address1Text ? textPath(layout.address1Text, layout.textCenter, layout.address1Baseline, 42, 0.2, "middle") : "";
  const address2 = layout.address2Baseline && layout.address2Text ? textPath(layout.address2Text, layout.textCenter, layout.address2Baseline, 42, 0.2, "middle") : "";
  const footer = layout.footer ? textPath(FOOTER_TEXT, layout.canvasWidth / 2, layout.footer.y + 39, 30, 0) : "";
  const codeAria = escapeXml(`${layout.hasCity ? layout.cityText + " " : ""}${layout.heroWords}`);

  const rawSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${layout.canvasWidth}" height="${layout.svgHeight}" viewBox="0 0 ${layout.canvasWidth} ${layout.svgHeight}" role="img" aria-label="${codeAria}">
  <rect width="${layout.canvasWidth}" height="${layout.svgHeight}" fill="#ffffff" />
  ${layout.topRule ? `<rect x="${layout.topRule.x}" y="${layout.topRule.y}" width="${layout.topRule.w}" height="${layout.topRule.h}" fill="${BRAND_BLUE}" />` : ""}

  <g>
    ${layout.logo ? `<image href="${logoFullDataUri}" x="${layout.logo.x}" y="${layout.logo.y}" width="${layout.logo.w}" height="${layout.logo.h}" />` : ""}
  </g>

  ${layout.hasTitle ? `<path d="${titlePath}" fill="#3f3f3f" />` : ""}
  ${layout.hasSection ? `<path d="${sectionPath}" fill="#666666" />` : ""}
  ${leftSlash ? `<path d="${leftSlash}" fill="${BRAND_BLUE}" fill-opacity="0.55" />` : ""}
  ${cityPath ? `<path d="${cityPath}" fill="${CITY_COLOR}" />` : ""}

  <path d="M ${layout.bracket.x} ${layout.bracket.top + layout.bracket.arm} L ${layout.bracket.x} ${layout.bracket.top} L ${layout.bracket.x + layout.bracket.arm} ${layout.bracket.top}" stroke="${BRAND_BLUE}" stroke-width="${layout.bracket.stroke}" fill="none" />
  <path d="M ${layout.bracket.x + layout.bracket.w - layout.bracket.arm} ${layout.bracket.top} L ${layout.bracket.x + layout.bracket.w} ${layout.bracket.top} L ${layout.bracket.x + layout.bracket.w} ${layout.bracket.top + layout.bracket.arm}" stroke="${BRAND_BLUE}" stroke-width="${layout.bracket.stroke}" fill="none" />
  <path d="M ${layout.bracket.x} ${layout.bracket.top + layout.bracket.h - layout.bracket.arm} L ${layout.bracket.x} ${layout.bracket.top + layout.bracket.h} L ${layout.bracket.x + layout.bracket.arm} ${layout.bracket.top + layout.bracket.h}" stroke="${BRAND_BLUE}" stroke-width="${layout.bracket.stroke}" fill="none" />
  <path d="M ${layout.bracket.x + layout.bracket.w - layout.bracket.arm} ${layout.bracket.top + layout.bracket.h} L ${layout.bracket.x + layout.bracket.w} ${layout.bracket.top + layout.bracket.h} L ${layout.bracket.x + layout.bracket.w} ${layout.bracket.top + layout.bracket.h - layout.bracket.arm}" stroke="${BRAND_BLUE}" stroke-width="${layout.bracket.stroke}" fill="none" />

  <path d="${heroOne}" fill="#111111" stroke="#111111" stroke-width="2.6" stroke-linejoin="round" />
  ${heroTwo ? `<path d="${heroTwo}" fill="#111111" stroke="#111111" stroke-width="2.6" stroke-linejoin="round" />` : ""}
  <path d="${rightSlash}" fill="${BRAND_BLUE}" fill-opacity="0.55" />

  ${address1 ? `<path d="${address1}" fill="#3f3f3f" />` : ""}
  ${address2 ? `<path d="${address2}" fill="#3f3f3f" />` : ""}

  ${layout.footer ? `<rect x="${layout.footer.x}" y="${layout.footer.y}" width="${layout.footer.w}" height="${layout.footer.h}" fill="${BRAND_BLUE}" />` : ""}
  ${footer ? `<path d="${footer}" fill="#ffffff" />` : ""}
</svg>`;

  return rawSvg
    .split("\n")
    .map(line => line.trimEnd())
    .filter(line => line.length > 0)
    .join("\n") + "\n";
}

export function renderPng(svgSource) {
  const widthMatch = svgSource.match(/width="(\d+(?:\.\d+)?)"/);
  const sourceWidth = widthMatch ? Number(widthMatch[1]) : SVG_WIDTH;
  const resvg = new Resvg(svgSource, {
    fitTo: { mode: "width", value: Math.round(sourceWidth * PNG_SCALE) }
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
