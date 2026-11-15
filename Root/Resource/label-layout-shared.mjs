export const SVG_WIDTH = 1200;
export const BRAND_BLUE = "#69b7cf";
export const SECTION_COLOR = "#333333";
export const FOOTER_TEXT = "Scan or enter at www.wolo.codes";

function boxFromMetrics(left, baseline, width, fontSize) {
  return {
    left,
    right: left + width,
    top: baseline - fontSize * 0.82,
    bottom: baseline + fontSize * 0.26
  };
}

function overlap(a, b, pad = 0) {
  return !(
    a.right + pad <= b.left ||
    b.right + pad <= a.left ||
    a.bottom + pad <= b.top ||
    b.bottom + pad <= a.top
  );
}

export function parseCodeWords(codeOrUrl) {
  const raw = String(codeOrUrl || "").trim();
  if (!raw) return "";
  let code = raw;
  try {
    const maybe = new URL(raw);
    code = (maybe.pathname || "").replace(/^\/+/, "");
  } catch {
    // keep raw when not a URL
  }
  const clean = code
    .toLowerCase()
    .replace(/[^a-z0-9.\-\s]/g, "")
    .replace(/\s+/g, "");
  const tokens = clean.split(".").filter(Boolean);
  if (tokens.length >= 3) return tokens.slice(-3).join(" ");
  return clean.replaceAll(".", " ");
}

function fitHero(words, maxWidth, measureText) {
  const baseSize = 78;
  const letterSpacing = 1;
  const minSingle = 44;
  const minDual = 38;
  const singleWidth = measureText(words, baseSize, letterSpacing);
  const singleScale = Math.min(1, maxWidth / Math.max(singleWidth, 1));
  if (baseSize * singleScale >= minSingle) {
    return { lines: [words], size: baseSize * singleScale, letterSpacing };
  }

  const tokens = words.trim().split(/\s+/);
  let best = { lines: [words], size: minDual, letterSpacing };
  for (let split = 1; split < tokens.length; split += 1) {
    const first = tokens.slice(0, split).join(" ");
    const second = tokens.slice(split).join(" ");
    const width = Math.max(
      measureText(first, baseSize, letterSpacing),
      measureText(second, baseSize, letterSpacing)
    );
    const size = Math.min(baseSize, (maxWidth / Math.max(width, 1)) * baseSize);
    if (size > best.size) best = { lines: [first, second], size, letterSpacing };
  }
  best.size = Math.max(best.size, minDual);
  return best;
}

function createMinimalistLayout(label, measureText, heroWords) {
  const hasTitle = !!String(label.title || "").trim();
  const topRule = { x: 180, y: 28, w: 840, h: 5 };
  const logo = { w: 284, h: 284 / 4.56 };
  logo.x = (SVG_WIDTH - logo.w) / 2;
  logo.y = topRule.y + topRule.h + 18;

  const bracket = { x: 220, w: 760, h: 170, stroke: 3, arm: 22 };
  const textLeft = bracket.x + 30;
  const textRight = bracket.x + bracket.w - 30;
  const textCenter = (textLeft + textRight) / 2;

  const titleFont = 44;
  const sectionFont = 34;
  const addressFont = 42;
  const addressStep = Math.round(addressFont * 1.3);

  const titleBaseline = hasTitle ? logo.y + logo.h + 46 : null;
  const bracketTop = hasTitle ? titleBaseline + 20 : logo.y + logo.h + 24;
  const sectionBaseline = bracketTop + 42;

  const hero = fitHero(heroWords, textRight - textLeft - 40, measureText);
  const heroCenterY = bracketTop + 120;
  const heroLineHeight = hero.size * 1.12;
  const heroOneBaseline = hero.lines.length === 1 ? heroCenterY : heroCenterY - heroLineHeight / 2;
  const heroTwoBaseline = heroCenterY + heroLineHeight / 2;

  const address1Baseline = bracketTop + bracket.h + 52;
  const address2Baseline = address1Baseline + addressStep;
  const footer = { x: topRule.x, w: topRule.w, h: 58 };
  footer.y = Math.round(address2Baseline + 30);
  const svgHeight = footer.y + footer.h + 22;

  const sectionWidth = measureText(label.section, sectionFont, 0.6);
  const heroOneWidth = measureText(hero.lines[0], hero.size, hero.letterSpacing);
  const heroTwoWidth = hero.lines.length > 1 ? measureText(hero.lines[1], hero.size, hero.letterSpacing) : 0;
  const heroRight = Math.max(
    textCenter + heroOneWidth / 2,
    hero.lines.length > 1 ? textCenter + heroTwoWidth / 2 : -Infinity
  );

  const boxes = {
    title: hasTitle ? boxFromMetrics(textCenter - measureText(label.title, titleFont, 0.2) / 2, titleBaseline, measureText(label.title, titleFont, 0.2), titleFont) : null,
    section: boxFromMetrics(textLeft, sectionBaseline, sectionWidth, sectionFont),
    heroOne: boxFromMetrics(textCenter - heroOneWidth / 2, heroOneBaseline, heroOneWidth, hero.size),
    heroTwo: hero.lines.length > 1 ? boxFromMetrics(textCenter - heroTwoWidth / 2, heroTwoBaseline, heroTwoWidth, hero.size) : null,
    address1: boxFromMetrics(textCenter - measureText(label.address1, addressFont, 0.2) / 2, address1Baseline, measureText(label.address1, addressFont, 0.2), addressFont),
    address2: boxFromMetrics(textCenter - measureText(label.address2, addressFont, 0.2) / 2, address2Baseline, measureText(label.address2, addressFont, 0.2), addressFont),
    footer: boxFromMetrics(SVG_WIDTH / 2 - measureText(FOOTER_TEXT, 30, 0) / 2, footer.y + 39, measureText(FOOTER_TEXT, 30, 0), 30)
  };

  const bracketBounds = {
    left: bracket.x + 18,
    right: bracket.x + bracket.w - 18,
    top: bracketTop + 14,
    bottom: bracketTop + bracket.h - 14
  };
  const contentBounds = {
    left: 100,
    right: SVG_WIDTH - 100,
    top: topRule.y + topRule.h + 8,
    bottom: footer.y - 16
  };

  const checkInside = (name, box, bounds) => {
    if (!box) return;
    if (box.left < bounds.left || box.right > bounds.right || box.top < bounds.top || box.bottom > bounds.bottom) {
      throw new Error(`Layout overflow for "${name}"`);
    }
  };

  checkInside("section", boxes.section, bracketBounds);
  checkInside("hero line 1", boxes.heroOne, bracketBounds);
  checkInside("hero line 2", boxes.heroTwo, bracketBounds);
  checkInside("title", boxes.title, contentBounds);
  checkInside("address1", boxes.address1, contentBounds);
  checkInside("address2", boxes.address2, contentBounds);
  checkInside("footer", boxes.footer, {
    left: footer.x + 16,
    right: footer.x + footer.w - 16,
    top: footer.y + 4,
    bottom: footer.y + footer.h - 4
  });
  if (boxes.section.bottom + 4 > boxes.heroOne.top) throw new Error("Layout collision: section overlaps hero words");

  const allText = [boxes.title, boxes.section, boxes.heroOne, boxes.heroTwo, boxes.address1, boxes.address2, boxes.footer].filter(Boolean);
  for (let i = 0; i < allText.length; i += 1) {
    for (let j = i + 1; j < allText.length; j += 1) {
      if (overlap(allText[i], allText[j], 2)) throw new Error(`Text overlap detected between blocks ${i} and ${j}`);
    }
  }
  if (logo.y - (topRule.y + topRule.h) < 12) throw new Error("Logo must keep minimum gap under top rule");

  return {
    variant: "minimalist",
    canvasWidth: SVG_WIDTH,
    hasTitle,
    heroWords,
    hero,
    topRule,
    logo,
    bracket: { ...bracket, top: bracketTop },
    textLeft,
    textCenter,
    titleBaseline,
    sectionBaseline,
    heroOneBaseline,
    heroTwoBaseline,
    address1Baseline,
    address2Baseline,
    footer,
    svgHeight,
    sectionSlashX: boxes.section.left - 20,
    heroSlashX: heroRight + 12
  };
}

function createCodeLayout(label, measureText, heroWords) {
  const canvasWidth = 760;
  const canvasHeight = 520;
  const bracket = { x: 76, top: 90, w: 608, h: 300, stroke: 3, arm: 22 };
  const textLeft = bracket.x + 30;
  const textRight = bracket.x + bracket.w - 30;
  const textCenter = (textLeft + textRight) / 2;
  const sectionFont = 34;

  const hero = fitHero(heroWords, textRight - textLeft - 36, measureText);
  const sectionBaseline = bracket.top + 44;
  const heroCenterY = bracket.top + 168;
  const heroLineHeight = hero.size * 1.12;
  const heroOneBaseline = hero.lines.length === 1 ? heroCenterY : heroCenterY - heroLineHeight / 2;
  const heroTwoBaseline = heroCenterY + heroLineHeight / 2;

  const sectionWidth = measureText(label.section, sectionFont, 0.6);
  const heroOneWidth = measureText(hero.lines[0], hero.size, hero.letterSpacing);
  const heroTwoWidth = hero.lines.length > 1 ? measureText(hero.lines[1], hero.size, hero.letterSpacing) : 0;
  const heroRight = Math.max(
    textCenter + heroOneWidth / 2,
    hero.lines.length > 1 ? textCenter + heroTwoWidth / 2 : -Infinity
  );

  const boxes = {
    section: boxFromMetrics(textLeft, sectionBaseline, sectionWidth, sectionFont),
    heroOne: boxFromMetrics(textCenter - heroOneWidth / 2, heroOneBaseline, heroOneWidth, hero.size),
    heroTwo: hero.lines.length > 1 ? boxFromMetrics(textCenter - heroTwoWidth / 2, heroTwoBaseline, heroTwoWidth, hero.size) : null
  };

  const bracketBounds = {
    left: bracket.x + 18,
    right: bracket.x + bracket.w - 18,
    top: bracket.top + 14,
    bottom: bracket.top + bracket.h - 14
  };
  const checkInside = (name, box, bounds) => {
    if (!box) return;
    if (box.left < bounds.left || box.right > bounds.right || box.top < bounds.top || box.bottom > bounds.bottom) {
      throw new Error(`Layout overflow for "${name}"`);
    }
  };
  checkInside("section", boxes.section, bracketBounds);
  checkInside("hero line 1", boxes.heroOne, bracketBounds);
  checkInside("hero line 2", boxes.heroTwo, bracketBounds);
  if (boxes.section.bottom + 4 > boxes.heroOne.top) throw new Error("Layout collision: section overlaps hero words");

  const allText = [boxes.section, boxes.heroOne, boxes.heroTwo].filter(Boolean);
  for (let i = 0; i < allText.length; i += 1) {
    for (let j = i + 1; j < allText.length; j += 1) {
      if (overlap(allText[i], allText[j], 2)) throw new Error(`Text overlap detected between blocks ${i} and ${j}`);
    }
  }

  return {
    variant: "code",
    canvasWidth,
    hasTitle: false,
    heroWords,
    hero,
    topRule: null,
    logo: null,
    bracket,
    textLeft,
    textCenter,
    titleBaseline: null,
    sectionBaseline,
    heroOneBaseline,
    heroTwoBaseline,
    address1Baseline: null,
    address2Baseline: null,
    footer: null,
    svgHeight: canvasHeight,
    sectionSlashX: boxes.section.left - 20,
    heroSlashX: heroRight + 12
  };
}

export function createLabelLayout(label, measureText, variant = "minimalist") {
  const heroWords = parseCodeWords(label.code || label.url);
  if (!heroWords) throw new Error(`Label "${label.slug ?? "unknown"}" has invalid code`);
  if (variant === "code") return createCodeLayout(label, measureText, heroWords);
  return createMinimalistLayout(label, measureText, heroWords);
}
