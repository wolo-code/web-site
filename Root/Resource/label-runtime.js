import { BRAND_BLUE, FOOTER_TEXT, createLabelLayout } from "/label-layout-shared.js";

const MAX_LEN = { title: 80, section: 64, address1: 80, address2: 96, code: 120 };
let logoDataUri = null;
let currentLabel = null;

const DEFAULT_LABEL = {
	title: "Boudhanath Stupa",
	segment: "Boudha",
	section: "Kathmandu",
	address1: "Boudha Stupa Rd",
	address2: "Kathmandu 44600, Nepal",
	code: "kathmandu.mask.net.soil",
	variant: "minimalist",
	omitTitle: false,
	omitSegment: false,
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
	const segment = normalizeText(params.get("segment"), MAX_LEN.section, false);
	const section = normalizeText(params.get("city") || params.get("section"), MAX_LEN.section, false);
	const address1 = normalizeText(params.get("address1"), MAX_LEN.address1, false);
	const address2 = normalizeText(params.get("address2"), MAX_LEN.address2, false);
	const omitTitle = params.get("omit_title") === "1" || params.get("omit_title") === "true";
	const omitSegment = params.get("omit_segment") === "1" || params.get("omit_segment") === "true";
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
		segment,
		section,
		address1,
		address2,
		code,
		slug: "live",
		variant,
		omitTitle,
		omitSegment,
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
	style.textContent = ".abel{font-family:Abel,sans-serif} .hero{font-weight:700;letter-spacing:1px} .accent{fill:#69b7cf} .section{fill:#333333} .dark{fill:#111} .muted{fill:#3f3f3f} .subtitle{fill:#666666}";
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
	if(layout.hasSegment) addText(svg, label.segment, layout.textCenter, layout.segmentBaseline, { class: "abel subtitle", "font-size": 30, "letter-spacing": 0.4, "text-anchor": "middle" });
	if(layout.hasSection) {
		addText(svg, "\\", layout.sectionSlashX, layout.sectionBaseline, { class: "abel accent", "font-size": 30, "fill-opacity": 0.55, "text-anchor": "start" });
		addText(svg, layout.sectionText, layout.textLeft, layout.sectionBaseline, { class: "abel section", "font-size": 34, "letter-spacing": 0.6, "text-anchor": "start" });
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
	const segmentInput = document.getElementById("label-input-segment");
	const address1Input = document.getElementById("label-input-address1");
	const address2Input = document.getElementById("label-input-address2");
	const codeInput = document.getElementById("label-input-code");

	const includeTitleCheck = document.getElementById("label-include-title");
	const includeSegmentCheck = document.getElementById("label-include-segment");
	const includeAddress1Check = document.getElementById("label-include-address1");
	const includeAddress2Check = document.getElementById("label-include-address2");

	if(titleInput) titleInput.value = currentLabel.title || "";
	if(segmentInput) segmentInput.value = currentLabel.segment || "";
	if(address1Input) address1Input.value = currentLabel.address1 || "";
	if(address2Input) address2Input.value = currentLabel.address2 || "";
	if(codeInput) codeInput.value = currentLabel.code || "";

	const hasTitle = !currentLabel.omitTitle && !!(currentLabel.title || "").trim();
	const hasSegment = !currentLabel.omitSegment && !!(currentLabel.segment || "").trim();
	const hasAddress1 = !currentLabel.omitAddress1 && !!(currentLabel.address1 || "").trim();
	const hasAddress2 = !currentLabel.omitAddress2 && !!(currentLabel.address2 || "").trim();

	if(includeTitleCheck) includeTitleCheck.checked = hasTitle;
	if(includeSegmentCheck) includeSegmentCheck.checked = hasSegment;
	if(includeAddress1Check) includeAddress1Check.checked = hasAddress1;
	if(includeAddress2Check) includeAddress2Check.checked = hasAddress2;

	updateFieldOmittedClass(titleInput, hasTitle, includeTitleCheck?.parentElement?.querySelector(".label-omit-tip"));
	updateFieldOmittedClass(segmentInput, hasSegment, includeSegmentCheck?.parentElement?.querySelector(".label-omit-tip"));
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
	const segment = (document.getElementById("label-input-segment")?.value || "").trim();
	const address1 = (document.getElementById("label-input-address1")?.value || "").trim();
	const address2 = (document.getElementById("label-input-address2")?.value || "").trim();

	const includeTitle = document.getElementById("label-include-title")?.checked || false;
	const includeSegment = document.getElementById("label-include-segment")?.checked || false;
	const includeAddress1 = document.getElementById("label-include-address1")?.checked || false;
	const includeAddress2 = document.getElementById("label-include-address2")?.checked || false;

	const omitTitle = !includeTitle;
	const omitSegment = !includeSegment;
	const omitAddress1 = !includeAddress1;
	const omitAddress2 = !includeAddress2;

	const updated = {
		...(currentLabel || {}),
		title,
		segment,
		address1,
		address2,
		code,
		omitTitle,
		omitSegment,
		omitAddress1,
		omitAddress2
	};

	// Update browser URL query params
	const params = new URLSearchParams();
	params.set("code", code);
	if(title) params.set("title", title);
	if(omitTitle) params.set("omit_title", "1");
	if(segment) params.set("segment", segment);
	if(omitSegment) params.set("omit_segment", "1");
	if(currentLabel && currentLabel.section) params.set("section", currentLabel.section);
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
}

function mount() {
	initEventListeners();
	const label = readLabelFromQuery();
	renderLabel(label);
}

if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
else mount();
