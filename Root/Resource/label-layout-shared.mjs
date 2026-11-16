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

export function formatCityFromCode(codeOrUrl) {
  const raw = String(codeOrUrl || "").trim();
  if (!raw) return "";
  let code = raw;
  try {
    const maybe = new URL(raw);
    code = (maybe.pathname || "").replace(/^\/+/, "");
  } catch {}
  const clean = code
    .toLowerCase()
    .replace(/[^a-z0-9.\-\s]/g, "")
    .replace(/\s+/g, "");
  const tokens = clean.split(".").filter(Boolean);
  if (tokens.length >= 4) {
    const cityTokens = tokens.slice(0, -3);
    return cityTokens
      .map(t =>
        t
          .split("-")
          .map(w => (w ? w[0].toUpperCase() + w.slice(1) : ""))
          .join(" ")
      )
      .join(" ");
  }
  return "";
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
  const hasTitle = !label.omitTitle && !!String(label.title || "").trim();
  const hasSegment = !label.omitSegment && !!String(label.segment || "").trim();
  const rawCity = String(label.city || label.section || "").trim();
  const city = rawCity || formatCityFromCode(label.code || label.url);
  const hasSection = !label.omitCity && !label.omitSection && !!city;
  const hasAddress1 = !label.omitAddress1 && !!String(label.address1 || "").trim();
  const hasAddress2 = !label.omitAddress2 && !!String(label.address2 || "").trim();

  const topRule = { x: 180, y: 28, w: 840, h: 5 };
  const logo = { w: 284, h: 284 / 4.56 };
  logo.x = (SVG_WIDTH - logo.w) / 2;
  logo.y = topRule.y + topRule.h + 18;

  const bracket = { x: 220, w: 760, h: 230, stroke: 3, arm: 22 };
  const textLeft = bracket.x + 30;
  const textRight = bracket.x + bracket.w - 30;
  const textCenter = (textLeft + textRight) / 2;

  const titleFont = 44;
  const segmentFont = 30;
  const sectionFont = 34;
  const addressFont = 42;
  const addressStep = Math.round(addressFont * 1.3);

  let titleBaseline = null;
  let segmentBaseline = null;
  let bracketTop;

  if (hasTitle && hasSegment) {
    titleBaseline = logo.y + logo.h + 44;
    segmentBaseline = titleBaseline + 40;
    bracketTop = segmentBaseline + 22;
  } else if (hasTitle) {
    titleBaseline = logo.y + logo.h + 46;
    bracketTop = titleBaseline + 20;
  } else if (hasSegment) {
    segmentBaseline = logo.y + logo.h + 42;
    bracketTop = segmentBaseline + 22;
  } else {
    bracketTop = logo.y + logo.h + 24;
  }

  const bracketMid = bracketTop + bracket.h / 2;
  const hero = fitHero(heroWords, textRight - textLeft - 40, measureText);
  const heroLineHeight = hero.size * 1.12;

  let sectionBaseline = null;
  let heroOneBaseline;
  let heroTwoBaseline;

  if (hasSection) {
    sectionBaseline = bracketMid - 10;
    heroOneBaseline = bracketMid + hero.size * 0.82 + 4;
    heroTwoBaseline = hero.lines.length > 1 ? heroOneBaseline + heroLineHeight : heroOneBaseline;
  } else {
    if (hero.lines.length === 1) {
      heroOneBaseline = Math.round(bracketMid + hero.size * 0.35);
      heroTwoBaseline = heroOneBaseline;
    } else {
      heroOneBaseline = Math.round(bracketMid - heroLineHeight / 2 + hero.size * 0.35);
      heroTwoBaseline = heroOneBaseline + heroLineHeight;
    }
  }

  const addressItems = [];
  if (hasAddress1) addressItems.push({ key: "address1", text: label.address1 });
  if (hasAddress2) addressItems.push({ key: "address2", text: label.address2 });

  let address1Baseline = null;
  let address2Baseline = null;
  let address1Text = "";
  let address2Text = "";

  if (addressItems.length === 1) {
    address1Baseline = bracketTop + bracket.h + 52;
    address1Text = addressItems[0].text;
  } else if (addressItems.length >= 2) {
    address1Baseline = bracketTop + bracket.h + 52;
    address2Baseline = address1Baseline + addressStep;
    address1Text = addressItems[0].text;
    address2Text = addressItems[1].text;
  }

  const footer = { x: topRule.x, w: topRule.w, h: 58 };
  if (addressItems.length === 2) {
    footer.y = Math.round(address2Baseline + 30);
  } else if (addressItems.length === 1) {
    footer.y = Math.round(address1Baseline + 32);
  } else {
    footer.y = Math.round(bracketTop + bracket.h + 30);
  }
  const svgHeight = footer.y + footer.h + 22;

  const sectionWidth = hasSection ? measureText(city, sectionFont, 0.6) : 0;
  const heroOneWidth = measureText(hero.lines[0], hero.size, hero.letterSpacing);
  const heroTwoWidth = hero.lines.length > 1 ? measureText(hero.lines[1], hero.size, hero.letterSpacing) : 0;
  const heroRight = Math.max(
    textCenter + heroOneWidth / 2,
    hero.lines.length > 1 ? textCenter + heroTwoWidth / 2 : -Infinity
  );
  const slashFont = 30;
  const slashGap = 18;
  const slashWidth = measureText("/", slashFont, 0);
  const slashBaseline = hero.lines.length > 1 ? heroTwoBaseline : heroOneBaseline;
  const slashBox = boxFromMetrics(heroRight + slashGap, slashBaseline, slashWidth, slashFont);

  const sectionBox = hasSection ? boxFromMetrics(textLeft, sectionBaseline, sectionWidth, sectionFont) : null;

  const boxes = {
    title: hasTitle ? boxFromMetrics(textCenter - measureText(label.title, titleFont, 0.2) / 2, titleBaseline, measureText(label.title, titleFont, 0.2), titleFont) : null,
    segment: hasSegment ? boxFromMetrics(textCenter - measureText(label.segment, segmentFont, 0.4) / 2, segmentBaseline, measureText(label.segment, segmentFont, 0.4), segmentFont) : null,
    section: sectionBox,
    heroOne: boxFromMetrics(textCenter - heroOneWidth / 2, heroOneBaseline, heroOneWidth, hero.size),
    heroTwo: hero.lines.length > 1 ? boxFromMetrics(textCenter - heroTwoWidth / 2, heroTwoBaseline, heroTwoWidth, hero.size) : null,
    address1: address1Baseline ? boxFromMetrics(textCenter - measureText(address1Text, addressFont, 0.2) / 2, address1Baseline, measureText(address1Text, addressFont, 0.2), addressFont) : null,
    address2: address2Baseline ? boxFromMetrics(textCenter - measureText(address2Text, addressFont, 0.2) / 2, address2Baseline, measureText(address2Text, addressFont, 0.2), addressFont) : null,
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

  if (boxes.section) checkInside("section", boxes.section, bracketBounds);
  checkInside("hero line 1", boxes.heroOne, bracketBounds);
  if (boxes.heroTwo) checkInside("hero line 2", boxes.heroTwo, bracketBounds);
  if (boxes.title) checkInside("title", boxes.title, contentBounds);
  if (boxes.segment) checkInside("segment", boxes.segment, contentBounds);
  if (boxes.address1) checkInside("address1", boxes.address1, contentBounds);
  if (boxes.address2) checkInside("address2", boxes.address2, contentBounds);
  checkInside("footer", boxes.footer, {
    left: footer.x + 16,
    right: footer.x + footer.w - 16,
    top: footer.y + 4,
    bottom: footer.y + footer.h - 4
  });
  if (boxes.section && boxes.section.bottom + 4 > boxes.heroOne.top) throw new Error("Layout collision: section overlaps hero words");
  if (overlap(slashBox, boxes.heroTwo || boxes.heroOne, 0)) throw new Error("Layout collision: closing slash overlaps words");

  const allText = [boxes.title, boxes.segment, boxes.section, boxes.heroOne, boxes.heroTwo, boxes.address1, boxes.address2, boxes.footer].filter(Boolean);
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
    hasSegment,
    hasSection,
    hasAddress1: !!address1Text,
    hasAddress2: !!address2Text,
    sectionText: city,
    address1Text,
    address2Text,
    heroWords,
    hero,
    topRule,
    logo,
    bracket: { ...bracket, top: bracketTop },
    textLeft,
    textCenter,
    titleBaseline,
    segmentBaseline,
    sectionBaseline,
    heroOneBaseline,
    heroTwoBaseline,
    address1Baseline,
    address2Baseline,
    footer,
    svgHeight,
    sectionSlashX: sectionBox ? sectionBox.left - 20 : textLeft - 20,
    heroSlashX: slashBox.left
  };
}

function createCodeLayout(label, measureText, heroWords) {
  const rawCity = String(label.city || label.section || "").trim();
  const city = rawCity || formatCityFromCode(label.code || label.url);
  const hasSection = !label.omitCity && !label.omitSection && !!city;
  const canvasWidth = 760;
  const canvasHeight = 520;
  const bracket = { x: 76, top: 90, w: 608, h: 360, stroke: 3, arm: 22 };
  const textLeft = bracket.x + 30;
  const textRight = bracket.x + bracket.w - 30;
  const textCenter = (textLeft + textRight) / 2;
  const sectionFont = 34;

  const hero = fitHero(heroWords, textRight - textLeft - 36, measureText);
  const bracketMid = bracket.top + bracket.h / 2;
  const heroLineHeight = hero.size * 1.12;

  let sectionBaseline = null;
  let heroOneBaseline;
  let heroTwoBaseline;

  if (hasSection) {
    sectionBaseline = bracketMid - 10;
    heroOneBaseline = bracketMid + hero.size * 0.82 + 4;
    heroTwoBaseline = hero.lines.length > 1 ? heroOneBaseline + heroLineHeight : heroOneBaseline;
  } else {
    if (hero.lines.length === 1) {
      heroOneBaseline = Math.round(bracketMid + hero.size * 0.35);
      heroTwoBaseline = heroOneBaseline;
    } else {
      heroOneBaseline = Math.round(bracketMid - heroLineHeight / 2 + hero.size * 0.35);
      heroTwoBaseline = heroOneBaseline + heroLineHeight;
    }
  }

  const sectionWidth = hasSection ? measureText(city, sectionFont, 0.6) : 0;
  const heroOneWidth = measureText(hero.lines[0], hero.size, hero.letterSpacing);
  const heroTwoWidth = hero.lines.length > 1 ? measureText(hero.lines[1], hero.size, hero.letterSpacing) : 0;
  const heroRight = Math.max(
    textCenter + heroOneWidth / 2,
    hero.lines.length > 1 ? textCenter + heroTwoWidth / 2 : -Infinity
  );
  const slashFont = 30;
  const slashGap = 18;
  const slashWidth = measureText("/", slashFont, 0);
  const slashBaseline = hero.lines.length > 1 ? heroTwoBaseline : heroOneBaseline;
  const slashBox = boxFromMetrics(heroRight + slashGap, slashBaseline, slashWidth, slashFont);

  const sectionBox = hasSection ? boxFromMetrics(textLeft, sectionBaseline, sectionWidth, sectionFont) : null;

  const boxes = {
    section: sectionBox,
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
  if (boxes.section) checkInside("section", boxes.section, bracketBounds);
  checkInside("hero line 1", boxes.heroOne, bracketBounds);
  if (boxes.heroTwo) checkInside("hero line 2", boxes.heroTwo, bracketBounds);
  if (boxes.section && boxes.section.bottom + 4 > boxes.heroOne.top) throw new Error("Layout collision: section overlaps hero words");
  if (overlap(slashBox, boxes.heroTwo || boxes.heroOne, 0)) throw new Error("Layout collision: closing slash overlaps words");

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
    hasSegment: false,
    hasSection,
    hasAddress1: false,
    hasAddress2: false,
    sectionText: city,
    address1Text: "",
    address2Text: "",
    heroWords,
    hero,
    topRule: null,
    logo: null,
    bracket,
    textLeft,
    textCenter,
    titleBaseline: null,
    segmentBaseline: null,
    sectionBaseline,
    heroOneBaseline,
    heroTwoBaseline,
    address1Baseline: null,
    address2Baseline: null,
    footer: null,
    svgHeight: canvasHeight,
    sectionSlashX: sectionBox ? sectionBox.left - 20 : textLeft - 20,
    heroSlashX: slashBox.left
  };
}

export function createLabelLayout(label, measureText, variant = "minimalist") {
  const heroWords = parseCodeWords(label.code || label.url);
  if (!heroWords) throw new Error(`Label "${label.slug ?? "unknown"}" has invalid code`);
  if (variant === "code") return createCodeLayout(label, measureText, heroWords);
  return createMinimalistLayout(label, measureText, heroWords);
}
