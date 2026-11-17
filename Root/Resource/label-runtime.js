// --- Shared Label Layout Engine ---
const SVG_WIDTH = 1200;
const BRAND_BLUE = "#69b7cf";
const CITY_COLOR = "#333333";
const SECTION_COLOR = CITY_COLOR; // backward compatibility
const FOOTER_TEXT = "Scan or enter at www.wolo.codes";

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

function parseCodeWords(codeOrUrl) {
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

function formatCityFromCode(codeOrUrl) {
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
  const cityFromCode = formatCityFromCode(label.code || label.url);
  let resolvedCity = String(label.city || label.territory || "").trim();
  let resolvedSection = String(
    label.section !== undefined && label.section !== null ? label.section : label.segment || ""
  ).trim();

  // If section was provided, but city was not, and section matches the code's city prefix, treat it as legacy city
  if (!resolvedCity && resolvedSection && cityFromCode && resolvedSection.toLowerCase() === cityFromCode.toLowerCase() && !label.segment) {
    resolvedCity = resolvedSection;
    resolvedSection = "";
  }
  const city = resolvedCity || cityFromCode;
  const hasCity = !label.omitCity && !!city;
  const hasSection = !label.omitSection && !label.omitSegment && !!resolvedSection;
  const hasTitle = !label.omitTitle && !!String(label.title || "").trim();
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
  const sectionFont = 30;
  const cityFont = 34;
  const addressFont = 42;
  const addressStep = Math.round(addressFont * 1.3);

  let titleBaseline = null;
  let sectionBaseline = null;
  let bracketTop;

  if (hasTitle && hasSection) {
    titleBaseline = logo.y + logo.h + 44;
    sectionBaseline = titleBaseline + 40;
    bracketTop = sectionBaseline + 22;
  } else if (hasTitle) {
    titleBaseline = logo.y + logo.h + 46;
    bracketTop = titleBaseline + 20;
  } else if (hasSection) {
    sectionBaseline = logo.y + logo.h + 42;
    bracketTop = sectionBaseline + 22;
  } else {
    bracketTop = logo.y + logo.h + 24;
  }

  const bracketMid = bracketTop + bracket.h / 2;
  const hero = fitHero(heroWords, textRight - textLeft - 40, measureText);
  const heroLineHeight = hero.size * 1.12;

  let heroOneBaseline;
  let heroTwoBaseline;

  if (hero.lines.length === 1) {
    heroOneBaseline = Math.round(bracketMid + hero.size * 0.35);
    heroTwoBaseline = heroOneBaseline;
  } else {
    heroOneBaseline = Math.round(bracketMid - heroLineHeight / 2 + hero.size * 0.35);
    heroTwoBaseline = heroOneBaseline + heroLineHeight;
  }

  const heroOneTop = heroOneBaseline - hero.size * 0.82;
  const cityBaseline = hasCity
    ? Math.max(
        Math.round(bracketTop + 14 + cityFont * 0.82),
        Math.round(heroOneTop - 8 - cityFont * 0.26)
      )
    : null;

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

  const cityWidth = hasCity ? measureText(city, cityFont, 0.6) : 0;
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

  const cityBox = hasCity ? boxFromMetrics(textLeft, cityBaseline, cityWidth, cityFont) : null;
  const sectionBox = hasSection ? boxFromMetrics(textCenter - measureText(resolvedSection, sectionFont, 0.4) / 2, sectionBaseline, measureText(resolvedSection, sectionFont, 0.4), sectionFont) : null;

  const boxes = {
    title: hasTitle ? boxFromMetrics(textCenter - measureText(label.title, titleFont, 0.2) / 2, titleBaseline, measureText(label.title, titleFont, 0.2), titleFont) : null,
    section: sectionBox,
    city: cityBox,
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

  if (boxes.city) checkInside("city", boxes.city, bracketBounds);
  checkInside("hero line 1", boxes.heroOne, bracketBounds);
  if (boxes.heroTwo) checkInside("hero line 2", boxes.heroTwo, bracketBounds);
  if (boxes.title) checkInside("title", boxes.title, contentBounds);
  if (boxes.section) checkInside("section", boxes.section, contentBounds);
  if (boxes.address1) checkInside("address1", boxes.address1, contentBounds);
  if (boxes.address2) checkInside("address2", boxes.address2, contentBounds);
  checkInside("footer", boxes.footer, {
    left: footer.x + 16,
    right: footer.x + footer.w - 16,
    top: footer.y + 4,
    bottom: footer.y + footer.h - 4
  });
  if (boxes.city && boxes.city.bottom + 4 > boxes.heroOne.top) throw new Error("Layout collision: city overlaps hero words");
  if (overlap(slashBox, boxes.heroTwo || boxes.heroOne, 0)) throw new Error("Layout collision: closing slash overlaps words");

  const allText = [boxes.title, boxes.section, boxes.city, boxes.heroOne, boxes.heroTwo, boxes.address1, boxes.address2, boxes.footer].filter(Boolean);
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
    hasSection,
    hasCity,
    hasAddress1: !!address1Text,
    hasAddress2: !!address2Text,
    sectionText: resolvedSection,
    cityText: city,
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
    sectionBaseline,
    cityBaseline,
    heroOneBaseline,
    heroTwoBaseline,
    address1Baseline,
    address2Baseline,
    footer,
    svgHeight,
    citySlashX: cityBox ? cityBox.left - 20 : textLeft - 20,
    heroSlashX: slashBox.left,
    // Aliases for backward compatibility
    hasSegment: hasSection,
    segmentBaseline: sectionBaseline,
    segmentText: resolvedSection,
    sectionSlashX: cityBox ? cityBox.left - 20 : textLeft - 20
  };
}

function createCodeLayout(label, measureText, heroWords) {
  const cityFromCode = formatCityFromCode(label.code || label.url);
  let resolvedCity = String(label.city || label.territory || "").trim();
  let resolvedSection = String(
    label.section !== undefined && label.section !== null ? label.section : label.segment || ""
  ).trim();

  if (!resolvedCity && resolvedSection && cityFromCode && resolvedSection.toLowerCase() === cityFromCode.toLowerCase() && !label.segment) {
    resolvedCity = resolvedSection;
    resolvedSection = "";
  }
  const city = resolvedCity || cityFromCode;
  const hasCity = !label.omitCity && !!city;
  const canvasWidth = 760;
  const canvasHeight = 520;
  const bracket = { x: 76, top: 90, w: 608, h: 360, stroke: 3, arm: 22 };
  const textLeft = bracket.x + 30;
  const textRight = bracket.x + bracket.w - 30;
  const textCenter = (textLeft + textRight) / 2;
  const cityFont = 34;

  const hero = fitHero(heroWords, textRight - textLeft - 36, measureText);
  const bracketMid = bracket.top + bracket.h / 2;
  const heroLineHeight = hero.size * 1.12;

  let heroOneBaseline;
  let heroTwoBaseline;

  if (hero.lines.length === 1) {
    heroOneBaseline = Math.round(bracketMid + hero.size * 0.35);
    heroTwoBaseline = heroOneBaseline;
  } else {
    heroOneBaseline = Math.round(bracketMid - heroLineHeight / 2 + hero.size * 0.35);
    heroTwoBaseline = heroOneBaseline + heroLineHeight;
  }

  const heroOneTop = heroOneBaseline - hero.size * 0.82;
  const cityBaseline = hasCity
    ? Math.max(
        Math.round(bracket.top + 14 + cityFont * 0.82),
        Math.round(heroOneTop - 8 - cityFont * 0.26)
      )
    : null;

  const cityWidth = hasCity ? measureText(city, cityFont, 0.6) : 0;
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

  const cityBox = hasCity ? boxFromMetrics(textLeft, cityBaseline, cityWidth, cityFont) : null;

  const boxes = {
    city: cityBox,
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
  if (boxes.city) checkInside("city", boxes.city, bracketBounds);
  checkInside("hero line 1", boxes.heroOne, bracketBounds);
  if (boxes.heroTwo) checkInside("hero line 2", boxes.heroTwo, bracketBounds);
  if (boxes.city && boxes.city.bottom + 4 > boxes.heroOne.top) throw new Error("Layout collision: city overlaps hero words");
  if (overlap(slashBox, boxes.heroTwo || boxes.heroOne, 0)) throw new Error("Layout collision: closing slash overlaps words");

  const allText = [boxes.city, boxes.heroOne, boxes.heroTwo].filter(Boolean);
  for (let i = 0; i < allText.length; i += 1) {
    for (let j = i + 1; j < allText.length; j += 1) {
      if (overlap(allText[i], allText[j], 2)) throw new Error(`Text overlap detected between blocks ${i} and ${j}`);
    }
  }

  return {
    variant: "code",
    canvasWidth,
    hasTitle: false,
    hasSection: false,
    hasCity,
    hasAddress1: false,
    hasAddress2: false,
    sectionText: "",
    cityText: city,
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
    sectionBaseline: null,
    cityBaseline,
    heroOneBaseline,
    heroTwoBaseline,
    address1Baseline: null,
    address2Baseline: null,
    footer: null,
    svgHeight: canvasHeight,
    citySlashX: cityBox ? cityBox.left - 20 : textLeft - 20,
    heroSlashX: slashBox.left,
    // Aliases for backward compatibility
    hasSegment: false,
    segmentBaseline: null,
    segmentText: "",
    sectionSlashX: cityBox ? cityBox.left - 20 : textLeft - 20
  };
}

function createLabelLayout(label, measureText, variant = "minimalist") {
  const heroWords = parseCodeWords(label.code || label.url);
  if (!heroWords) throw new Error(`Label "${label.slug ?? "unknown"}" has invalid code`);
  if (variant === "code") return createCodeLayout(label, measureText, heroWords);
  return createMinimalistLayout(label, measureText, heroWords);
}


// --- Label Runtime Controller ---

const MAX_LEN = { title: 80, section: 64, address1: 80, address2: 96, code: 120 };
let logoDataUri = null;
let currentLabel = null;

const DEFAULT_LABEL = {
	title: "Boudhanath Stupa",
	section: "Boudha",
	city: "Kathmandu",
	address1: "Boudha Stupa Rd",
	address2: "Kathmandu 44600, Nepal",
	code: "kathmandu.mask.net.soil",
	variant: "minimalist",
	omitTitle: false,
	omitSection: false,
	omitAddress1: false,
	omitAddress2: false
};

function normalizeText(value, maxLen, required = true) {
	const raw = typeof value === "string" ? value : "";
	const cleaned = raw.replace(/[\x00-\x1F\x7F]/g, " ").replace(/\s+/g, " ").trim();
	const clipped = cleaned.slice(0, maxLen);
	if(required && clipped === "") throw new Error("Missing required label parameter.");
	return clipped;
}

function queryParams() {
	const raw = window.location.search.startsWith("?") ? window.location.search.slice(1) : window.location.search;
	return new URLSearchParams(raw.replace(/\+/g, "%20"));
}

function readLabelFromQuery() {
	const params = queryParams();
	const variantRaw = normalizeText(params.get("variant"), 24, false).toLowerCase();
	const variant = variantRaw === "code" ? "code" : "minimalist";
	const title = normalizeText(params.get("title"), MAX_LEN.title, false);
	const section = normalizeText(params.get("section") || params.get("segment"), MAX_LEN.section, false);
	const city = normalizeText(params.get("city"), MAX_LEN.section, false);
	const address1 = normalizeText(params.get("address1"), MAX_LEN.address1, false);
	const address2 = normalizeText(params.get("address2"), MAX_LEN.address2, false);
	const omitTitle = params.get("omit_title") === "1" || params.get("omit_title") === "true";
	const omitSection = params.get("omit_section") === "1" || params.get("omit_section") === "true" || params.get("omit_segment") === "1" || params.get("omit_segment") === "true";
	const omitAddress1 = params.get("omit_address1") === "1" || params.get("omit_address1") === "true";
	const omitAddress2 = params.get("omit_address2") === "1" || params.get("omit_address2") === "true";

	let code = normalizeText(params.get("code"), MAX_LEN.code, false);
	if(!code) {
		const url = normalizeText(params.get("url"), 200, false);
		if(url) {
			try {
				code = normalizeText(new URL(url, window.location.origin).pathname.replace(/^\/+/, ""), MAX_LEN.code, true);
			} catch {
				code = normalizeText(url.replace(/^\/+/, ""), MAX_LEN.code, true);
			}
		}
	}
	code = normalizeText(code, MAX_LEN.code, false);

	if(!code) {
		return { ...DEFAULT_LABEL, slug: "live" };
	}

	return {
		title,
		section,
		city,
		address1,
		address2,
		code,
		slug: "live",
		variant,
		omitTitle,
		omitSection,
		omitAddress1,
		omitAddress2
	};
}

function measureFactory() {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	return (text, fontSize, letterSpacing = 0) => {
		ctx.font = `${fontSize}px Abel, sans-serif`;
		const width = ctx.measureText(text).width;
		return width + Math.max(0, text.length - 1) * letterSpacing;
	};
}

function addPath(parent, d, attrs = {}) {
	const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	path.setAttribute("d", d);
	for (const [key, value] of Object.entries(attrs)) path.setAttribute(key, String(value));
	parent.appendChild(path);
}

function addText(parent, text, x, y, attrs = {}) {
	const node = document.createElementNS("http://www.w3.org/2000/svg", "text");
	node.textContent = text;
	node.setAttribute("x", String(x));
	node.setAttribute("y", String(y));
	for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
	parent.appendChild(node);
}

function buildLabelSvg(label, layout, logoHref) {
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	svg.setAttribute("width", String(layout.canvasWidth));
	svg.setAttribute("height", String(layout.svgHeight));
	svg.setAttribute("viewBox", `0 0 ${layout.canvasWidth} ${layout.svgHeight}`);

	const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
	style.textContent = ".abel{font-family:Abel,sans-serif} .hero{font-weight:700;letter-spacing:1px} .accent{fill:#69b7cf} .city{fill:#333333} .section{fill:#333333} .dark{fill:#111} .muted{fill:#3f3f3f} .subtitle{fill:#666666}";
	svg.appendChild(style);

	const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
	bg.setAttribute("width", String(layout.canvasWidth));
	bg.setAttribute("height", String(layout.svgHeight));
	bg.setAttribute("fill", "#fff");
	svg.appendChild(bg);

	if(layout.topRule) {
		const top = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		top.setAttribute("x", String(layout.topRule.x));
		top.setAttribute("y", String(layout.topRule.y));
		top.setAttribute("width", String(layout.topRule.w));
		top.setAttribute("height", String(layout.topRule.h));
		top.setAttribute("fill", BRAND_BLUE);
		svg.appendChild(top);
	}

	if(layout.logo) {
		const logo = document.createElementNS("http://www.w3.org/2000/svg", "image");
		logo.setAttribute("href", logoHref || "/logo_full.svg");
		logo.setAttribute("x", String(layout.logo.x));
		logo.setAttribute("y", String(layout.logo.y));
		logo.setAttribute("width", String(layout.logo.w));
		logo.setAttribute("height", String(layout.logo.h));
		svg.appendChild(logo);
	}

	if(layout.hasTitle) addText(svg, label.title, layout.textCenter, layout.titleBaseline, { class: "abel muted", "font-size": 44, "text-anchor": "middle" });
	if(layout.hasSection) addText(svg, layout.sectionText, layout.textCenter, layout.sectionBaseline, { class: "abel subtitle", "font-size": 30, "letter-spacing": 0.4, "text-anchor": "middle" });
	if(layout.hasCity) {
		addText(svg, "\\", layout.citySlashX, layout.cityBaseline, { class: "abel accent", "font-size": 30, "fill-opacity": 0.55, "text-anchor": "start" });
		addText(svg, layout.cityText, layout.textLeft, layout.cityBaseline, { class: "abel city", "font-size": 34, "letter-spacing": 0.6, "text-anchor": "start" });
	}

	const b = layout.bracket;
	addPath(svg, `M ${b.x} ${b.top + b.arm} L ${b.x} ${b.top} L ${b.x + b.arm} ${b.top}`, { stroke: BRAND_BLUE, "stroke-width": b.stroke, fill: "none" });
	addPath(svg, `M ${b.x + b.w - b.arm} ${b.top} L ${b.x + b.w} ${b.top} L ${b.x + b.w} ${b.top + b.arm}`, { stroke: BRAND_BLUE, "stroke-width": b.stroke, fill: "none" });
	addPath(svg, `M ${b.x} ${b.top + b.h - b.arm} L ${b.x} ${b.top + b.h} L ${b.x + b.arm} ${b.top + b.h}`, { stroke: BRAND_BLUE, "stroke-width": b.stroke, fill: "none" });
	addPath(svg, `M ${b.x + b.w - b.arm} ${b.top + b.h} L ${b.x + b.w} ${b.top + b.h} L ${b.x + b.w} ${b.top + b.h - b.arm}`, { stroke: BRAND_BLUE, "stroke-width": b.stroke, fill: "none" });

	addText(svg, layout.hero.lines[0], layout.textCenter, layout.heroOneBaseline, { class: "abel dark hero", "font-size": layout.hero.size, "text-anchor": "middle" });
	if(layout.hero.lines.length > 1) {
		addText(svg, layout.hero.lines[1], layout.textCenter, layout.heroTwoBaseline, { class: "abel dark hero", "font-size": layout.hero.size, "text-anchor": "middle" });
	}
	addText(svg, "/", layout.heroSlashX, layout.hero.lines.length === 1 ? layout.heroOneBaseline : layout.heroTwoBaseline, { class: "abel accent", "font-size": 30, "fill-opacity": 0.55, "text-anchor": "start" });

	if(layout.address1Baseline != null && layout.address1Text) addText(svg, layout.address1Text, layout.textCenter, layout.address1Baseline, { class: "abel muted", "font-size": 42, "text-anchor": "middle" });
	if(layout.address2Baseline != null && layout.address2Text) addText(svg, layout.address2Text, layout.textCenter, layout.address2Baseline, { class: "abel muted", "font-size": 42, "text-anchor": "middle" });

	if(layout.footer) {
		const footer = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		footer.setAttribute("x", String(layout.footer.x));
		footer.setAttribute("y", String(layout.footer.y));
		footer.setAttribute("width", String(layout.footer.w));
		footer.setAttribute("height", String(layout.footer.h));
		footer.setAttribute("fill", BRAND_BLUE);
		svg.appendChild(footer);
		addText(svg, FOOTER_TEXT, layout.canvasWidth / 2, layout.footer.y + 39, { class: "abel", fill: "#fff", "font-size": 30, "text-anchor": "middle" });
	}

	return svg;
}

function downloadURI(uri, name) {
	const link = document.createElement("a");
	link.download = name;
	link.href = uri;
	link.click();
}

function getInlineLogoDataUri() {
	if(logoDataUri) return Promise.resolve(logoDataUri);
	return fetch("/logo_full.svg")
		.then((response) => response.text())
		.then((svgText) => {
			logoDataUri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgText)))}`;
			return logoDataUri;
		})
		.catch(() => null);
}

function getDownloadFilename(label) {
	const parts = [];
	if(label && label.title && !label.omitTitle) {
		parts.push(label.title);
	} else if(label && label.code) {
		parts.push(label.code);
	} else {
		parts.push("label");
	}
	const clean = parts.join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
	return `wolo-label-${clean || "preview"}.png`;
}

function downloadLabelPng() {
	const capture = document.getElementById("label-capture");
	const svg = capture ? capture.querySelector("svg") : null;
	const downloadBtn = document.getElementById("label-download-png");
	const downloadText = document.getElementById("label-download-text");
	if(!capture || !svg || !downloadBtn) return;

	const originalTitle = downloadBtn.getAttribute("title") || "Download PNG";
	const originalText = downloadText ? downloadText.textContent : "Download PNG";
	downloadBtn.setAttribute("title", "Generating PNG...");
	if(downloadText) downloadText.textContent = "Generating...";
	downloadBtn.disabled = true;

	const serializer = new XMLSerializer();
	const svgMarkup = serializer.serializeToString(svg);
	const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
	const svgUrl = URL.createObjectURL(svgBlob);
	const image = new Image();

	image.onload = () => {
		try {
			const style = getComputedStyle(capture);
			const padX = parseFloat(style.paddingLeft || "0");
			const padY = parseFloat(style.paddingTop || "0");
			const scale = 2; // Crisp 2x print-ready resolution
			const svgW = svg.viewBox.baseVal.width;
			const svgH = svg.viewBox.baseVal.height;
			const width = Math.round((svgW + padX * 2) * scale);
			const height = Math.round((svgH + padY * 2) * scale);
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext("2d");
			ctx.fillStyle = "#ffffff";
			ctx.fillRect(0, 0, width, height);
			ctx.drawImage(image, Math.round(padX * scale), Math.round(padY * scale), Math.round(svgW * scale), Math.round(svgH * scale));
			URL.revokeObjectURL(svgUrl);
			const png = canvas.toDataURL("image/png");
			const filename = getDownloadFilename(currentLabel);
			downloadURI(png, filename);

			downloadBtn.setAttribute("title", "Downloaded! ✓");
			if(downloadText) downloadText.textContent = "Downloaded! ✓";
			setTimeout(() => {
				downloadBtn.setAttribute("title", originalTitle);
				if(downloadText) downloadText.textContent = originalText;
				downloadBtn.disabled = false;
			}, 1500);
		} catch (err) {
			console.error("PNG download failed:", err);
			URL.revokeObjectURL(svgUrl);
			downloadBtn.setAttribute("title", originalTitle);
			if(downloadText) downloadText.textContent = originalText;
			downloadBtn.disabled = false;
		}
	};

	image.onerror = (err) => {
		console.error("Failed to render SVG image for download:", err);
		URL.revokeObjectURL(svgUrl);
		downloadBtn.setAttribute("title", originalTitle);
		if(downloadText) downloadText.textContent = originalText;
		downloadBtn.disabled = false;
	};

	image.src = svgUrl;
}

function updateFieldOmittedClass(input, isIncluded, tipEl) {
	if(input) {
		input.classList.toggle("is-omitted", !isIncluded);
	}
	if(tipEl) {
		tipEl.textContent = isIncluded ? "Included" : "Include";
	}
}

function openEditModal() {
	const overlay = document.getElementById("label-modal-overlay");
	if(!overlay || !currentLabel) return;

	const titleInput = document.getElementById("label-input-title");
	const sectionInput = document.getElementById("label-input-section") || document.getElementById("label-input-segment");
	const address1Input = document.getElementById("label-input-address1");
	const address2Input = document.getElementById("label-input-address2");
	const codeInput = document.getElementById("label-input-code");

	const includeTitleCheck = document.getElementById("label-include-title");
	const includeSectionCheck = document.getElementById("label-include-section") || document.getElementById("label-include-segment");
	const includeAddress1Check = document.getElementById("label-include-address1");
	const includeAddress2Check = document.getElementById("label-include-address2");

	if(titleInput) titleInput.value = currentLabel.title || "";
	if(sectionInput) sectionInput.value = currentLabel.section || currentLabel.segment || "";
	if(address1Input) address1Input.value = currentLabel.address1 || "";
	if(address2Input) address2Input.value = currentLabel.address2 || "";
	if(codeInput) codeInput.value = currentLabel.code || "";

	const hasTitle = !currentLabel.omitTitle && !!(currentLabel.title || "").trim();
	const hasSection = !currentLabel.omitSection && !currentLabel.omitSegment && !!(currentLabel.section || currentLabel.segment || "").trim();
	const hasAddress1 = !currentLabel.omitAddress1 && !!(currentLabel.address1 || "").trim();
	const hasAddress2 = !currentLabel.omitAddress2 && !!(currentLabel.address2 || "").trim();

	if(includeTitleCheck) includeTitleCheck.checked = hasTitle;
	if(includeSectionCheck) includeSectionCheck.checked = hasSection;
	if(includeAddress1Check) includeAddress1Check.checked = hasAddress1;
	if(includeAddress2Check) includeAddress2Check.checked = hasAddress2;

	updateFieldOmittedClass(titleInput, hasTitle, includeTitleCheck?.parentElement?.querySelector(".label-omit-tip"));
	updateFieldOmittedClass(sectionInput, hasSection, includeSectionCheck?.parentElement?.querySelector(".label-omit-tip"));
	updateFieldOmittedClass(address1Input, hasAddress1, includeAddress1Check?.parentElement?.querySelector(".label-omit-tip"));
	updateFieldOmittedClass(address2Input, hasAddress2, includeAddress2Check?.parentElement?.querySelector(".label-omit-tip"));

	overlay.classList.remove("hide");
	overlay.setAttribute("aria-hidden", "false");
	if(titleInput) titleInput.focus();
}

function closeEditModal() {
	const overlay = document.getElementById("label-modal-overlay");
	if(!overlay) return;
	overlay.classList.add("hide");
	overlay.setAttribute("aria-hidden", "true");
}

function applyEditForm() {
	const codeInput = document.getElementById("label-input-code");
	const code = (codeInput?.value || "").trim();
	if(!code) {
		if(codeInput) {
			codeInput.focus();
			codeInput.reportValidity();
		}
		return;
	}

	const title = (document.getElementById("label-input-title")?.value || "").trim();
	const section = (
		document.getElementById("label-input-section")?.value ||
		document.getElementById("label-input-segment")?.value ||
		""
	).trim();
	const address1 = (document.getElementById("label-input-address1")?.value || "").trim();
	const address2 = (document.getElementById("label-input-address2")?.value || "").trim();

	const includeTitle = document.getElementById("label-include-title")?.checked || false;
	const includeSection = (
		document.getElementById("label-include-section") ||
		document.getElementById("label-include-segment")
	)?.checked || false;
	const includeAddress1 = document.getElementById("label-include-address1")?.checked || false;
	const includeAddress2 = document.getElementById("label-include-address2")?.checked || false;

	const omitTitle = !includeTitle;
	const omitSection = !includeSection;
	const omitAddress1 = !includeAddress1;
	const omitAddress2 = !includeAddress2;

	const updated = {
		...(currentLabel || {}),
		title,
		section,
		segment: section, // backward-compat alias
		address1,
		address2,
		code,
		omitTitle,
		omitSection,
		omitSegment: omitSection,
		omitAddress1,
		omitAddress2
	};

	// Update browser URL query params
	const params = new URLSearchParams();
	params.set("code", code);
	if(title) params.set("title", title);
	if(omitTitle) params.set("omit_title", "1");
	if(section) params.set("section", section);
	if(omitSection) params.set("omit_section", "1");
	if(currentLabel && currentLabel.city) params.set("city", currentLabel.city);
	if(address1) params.set("address1", address1);
	if(omitAddress1) params.set("omit_address1", "1");
	if(address2) params.set("address2", address2);
	if(omitAddress2) params.set("omit_address2", "1");
	if(updated.variant && updated.variant !== "minimalist") params.set("variant", updated.variant);

	const newUrl = window.location.pathname + "?" + params.toString();
	window.history.replaceState(null, "", newUrl);

	closeEditModal();
	renderLabel(updated);
}

function renderLabel(label) {
	const preview = document.getElementById("label-preview");
	if(!preview) return;

	currentLabel = label;
	try {
		getInlineLogoDataUri().finally(() => {
			const layout = createLabelLayout(label, measureFactory(), label.variant);
			const svg = buildLabelSvg(label, layout, logoDataUri);
			preview.replaceChildren(svg);
		});
	} catch (error) {
		const message = document.createElement("p");
		message.textContent = error instanceof Error ? error.message : "Unable to render label.";
		preview.replaceChildren(message);
	}
}

function initEventListeners() {
	const downloadBtn = document.getElementById("label-download-png");
	if(downloadBtn) {
		downloadBtn.addEventListener("click", downloadLabelPng);
	}

	const editBtn = document.getElementById("label-edit-btn");
	if(editBtn) {
		editBtn.addEventListener("click", openEditModal);
	}

	const closeBtn = document.getElementById("label-modal-close");
	if(closeBtn) {
		closeBtn.addEventListener("click", closeEditModal);
	}

	const cancelBtn = document.getElementById("label-modal-cancel");
	if(cancelBtn) {
		cancelBtn.addEventListener("click", closeEditModal);
	}

	const form = document.getElementById("label-edit-form");
	if(form) {
		form.addEventListener("submit", (e) => {
			e.preventDefault();
			applyEditForm();
		});
	}

	const overlay = document.getElementById("label-modal-overlay");
	if(overlay) {
		overlay.addEventListener("click", (e) => {
			if(e.target === overlay) closeEditModal();
		});
	}

	window.addEventListener("keydown", (e) => {
		if(e.key === "Escape") {
			const overlayEl = document.getElementById("label-modal-overlay");
			if(overlayEl && !overlayEl.classList.contains("hide")) {
				closeEditModal();
			}
		}
	});

	// Connect include checkboxes to their input elements for visual dimmed state
	[
		["label-include-title", "label-input-title"],
		["label-include-section", "label-input-section"],
		["label-include-segment", "label-input-segment"],
		["label-include-address1", "label-input-address1"],
		["label-include-address2", "label-input-address2"]
	].forEach(([checkId, inputId]) => {
		const check = document.getElementById(checkId);
		const input = document.getElementById(inputId);
		if(check && input) {
			const tip = check.parentElement?.querySelector(".label-omit-tip");
			check.addEventListener("change", () => {
				updateFieldOmittedClass(input, check.checked, tip);
			});
			input.addEventListener("input", () => {
				// If user explicitly types into an excluded field, automatically check to include
				if(input.value.trim() && !check.checked) {
					check.checked = true;
					updateFieldOmittedClass(input, true, tip);
				}
			});
		}
	});

	// Handle cached label table row clicks and code cell clicks
	const cachedRows = document.querySelectorAll(".label-cached-row");
	cachedRows.forEach(row => {
		const href = row.dataset.href;
		if(!href) return;
		row.addEventListener("click", (e) => {
			const codeCell = e.target.closest(".td-code");
			if(codeCell) {
				const codeLink = codeCell.querySelector("a.label-code-link");
				if(codeLink && e.target !== codeLink && !codeLink.contains(e.target)) {
					codeLink.click();
				}
				return;
			}
			if(e.target.closest("a, button")) return;
			if(e.metaKey || e.ctrlKey) {
				window.open(href, "_blank", "noopener");
			} else {
				window.location.href = href;
			}
		});
		row.addEventListener("keydown", (e) => {
			if(e.key === "Enter" || e.key === " ") {
				if(e.target.closest("a, button")) return;
				e.preventDefault();
				window.location.href = href;
			}
		});
	});
}

function mount() {
	initEventListeners();
	const label = readLabelFromQuery();
	renderLabel(label);
}

if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
else mount();
