import { BRAND_BLUE, FOOTER_TEXT, createLabelLayout } from "/label-layout-shared.js";

const MAX_LEN = { title: 80, section: 64, address1: 80, address2: 96, code: 120 };

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
	const section = normalizeText(params.get("section"), MAX_LEN.section, false);
	const address1 = normalizeText(params.get("address1"), MAX_LEN.address1, false);
	const address2 = normalizeText(params.get("address2"), MAX_LEN.address2, false);
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
	const missing = [];
	if(!section) missing.push("section");
	if(!code) missing.push("code");
	if(missing.length) throw new Error(`Missing required label parameter: ${missing.join(", ")}`);
	return { title, section, address1, address2, code, slug: "live", variant };
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

function buildLabelSvg(label, layout) {
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	svg.setAttribute("width", String(layout.canvasWidth));
	svg.setAttribute("height", String(layout.svgHeight));
	svg.setAttribute("viewBox", `0 0 ${layout.canvasWidth} ${layout.svgHeight}`);

	const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
	style.textContent = ".abel{font-family:Abel,sans-serif} .hero{font-weight:700;letter-spacing:1px} .accent{fill:#69b7cf} .section{fill:#333333} .dark{fill:#111} .muted{fill:#3f3f3f}";
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
		logo.setAttribute("href", "/logo_full.svg");
		logo.setAttribute("x", String(layout.logo.x));
		logo.setAttribute("y", String(layout.logo.y));
		logo.setAttribute("width", String(layout.logo.w));
		logo.setAttribute("height", String(layout.logo.h));
		svg.appendChild(logo);
	}

	if(layout.hasTitle) addText(svg, label.title, layout.textCenter, layout.titleBaseline, { class: "abel muted", "font-size": 44, "text-anchor": "middle" });
	addText(svg, "\\", layout.sectionSlashX, layout.sectionBaseline, { class: "abel accent", "font-size": 30, "fill-opacity": 0.55, "text-anchor": "start" });
	addText(svg, label.section, layout.textLeft, layout.sectionBaseline, { class: "abel section", "font-size": 34, "letter-spacing": 0.6, "text-anchor": "start" });

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

	if(layout.address1Baseline != null) addText(svg, label.address1, layout.textCenter, layout.address1Baseline, { class: "abel muted", "font-size": 42, "text-anchor": "middle" });
	if(layout.address2Baseline != null) addText(svg, label.address2, layout.textCenter, layout.address2Baseline, { class: "abel muted", "font-size": 42, "text-anchor": "middle" });

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

function downloadLabelPng() {
	const qrBody = document.getElementById("label-preview");
	if(!qrBody || typeof window.html2canvas !== "function") return;
	window.html2canvas(qrBody, {
		scale: 1,
		onclone: function(clonedDocument) {
			clonedDocument.querySelectorAll("#label-preview svg image").forEach(function(logo) {
				const style = clonedDocument.defaultView.getComputedStyle(logo);
				logo.setAttribute("width", style.width);
				logo.setAttribute("height", style.height);
			});
		}
	}).then((canvas) => {
		const qrImage = canvas.toDataURL("image/png");
		downloadURI(qrImage, "Wolo Label.png");
	});
}

function mount() {
	const preview = document.getElementById("label-preview");
	const download = document.getElementById("label-download-png");
	if(!preview || !download) return;

	try {
		const label = readLabelFromQuery();
		const layout = createLabelLayout(label, measureFactory(), label.variant);
		const svg = buildLabelSvg(label, layout);
		preview.replaceChildren(svg);
		download.addEventListener("click", downloadLabelPng);
	} catch (error) {
		const message = document.createElement("p");
		message.textContent = error instanceof Error ? error.message : "Unable to render label.";
		preview.replaceChildren(message);
	}
}

if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
else mount();
