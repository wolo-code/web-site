import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderMinimalistSvg, renderPng, filenameStem, validateLabel } from "./render-label.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "../..");

const labelsConfigPath = resolve(repoRoot, "Config/Labels.json");
const outputDir = resolve(repoRoot, "Root/Resource/labels");
const testOutputDir = resolve(outputDir, "tests");

const DEFAULT_VARIANT = "minimalist";

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
    if (!("url" in label) || typeof label.url !== "string" || label.url.trim() === "") {
      throw new Error(`Label "${label.slug}" missing required field "url"`);
    }
    const variants = [label.variant || DEFAULT_VARIANT, ...((Array.isArray(label.extra_variants) ? label.extra_variants : []))];
    for (const variant of variants) {
      const variantLabel = { ...label, variant };
      validateLabel(variantLabel);
      const svg = renderMinimalistSvg(variantLabel);
      const png = renderPng(svg);
      const stem = filenameStem(variantLabel);
      writeOutputs(outputDir, stem, svg, png);
      if (variant === DEFAULT_VARIANT) writeOutputs(outputDir, label.slug, svg, png); // keep slug-only URL path working for default variant
      console.log(`generated labels/${stem}.svg + labels/${stem}.png${variant === DEFAULT_VARIANT ? " (+ slug aliases)" : ""}`);
    }
  }

  const longCase = {
    title: "Longest Words Test",
    slug: "kathmandu-longest-words-test",
    variant: DEFAULT_VARIANT,
    city: "Kathmandu",
    address1: "Longest Words Test",
    address2: "Test render for long-word fit (not part of gallery).",
    code: "kathmandu.calculator.chimpanzee.helicopter",
    url: "https://wolo.codes/kathmandu.calculator.chimpanzee.helicopter"
  };
  const testSvg = renderMinimalistSvg(longCase);
  const testPng = renderPng(testSvg);
  const testStem = filenameStem(longCase);
  writeOutputs(testOutputDir, testStem, testSvg, testPng);
  console.log(`generated labels/tests/${testStem}.svg + labels/tests/${testStem}.png`);
}

run();
