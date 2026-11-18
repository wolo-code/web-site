<?php
$labels_path = dirname(__DIR__, 3).'/Config/Labels.json';
$cached_labels = [];
if(file_exists($labels_path)) {
	$cached_labels_raw = file_get_contents($labels_path);
	$cached_labels = json_decode($cached_labels_raw, true);
	if(!is_array($cached_labels)) $cached_labels = [];
}

if(!function_exists('label_slugify')) {
	function label_slugify($value) {
		$value = strtolower(trim((string)$value));
		$value = preg_replace('/[^a-z0-9]+/', '-', $value);
		return trim($value ?? '', '-');
	}
}

if(!function_exists('label_asset_stem')) {
	function label_asset_stem($label) {
		$slug = (string)($label['slug'] ?? '');
		$title = label_slugify((string)($label['title'] ?? ''));
		if($title === '') $title = 'untitled';
		$variant = (string)($label['variant'] ?? 'minimalist');
		return $slug.'-'.$title.'-'.$variant;
	}
}

if(!function_exists('label_asset_stem_variant')) {
	function label_asset_stem_variant($label, $variant) {
		$copy = $label;
		$copy['variant'] = $variant;
		return label_asset_stem($copy);
	}
}

if(!function_exists('label_dynamic_url')) {
	function label_dynamic_url($label, $variant = null) {
		$params = [];
		$title = trim((string)($label['title'] ?? ''));
		if($title !== '') $params['title'] = $title;
		$city = trim((string)($label['city'] ?? ''));
		if($city !== '') $params['city'] = $city;
		$section = trim((string)($label['section'] ?? $label['segment'] ?? ''));
		if($section !== '') $params['section'] = $section;
		$address1 = trim((string)($label['address1'] ?? ''));
		if($address1 !== '') $params['address1'] = $address1;
		$address2 = trim((string)($label['address2'] ?? ''));
		if($address2 !== '') $params['address2'] = $address2;
		$code = trim((string)($label['code'] ?? ''));
		if($code !== '') $params['code'] = $code;
		$use_variant = $variant !== null ? $variant : (string)($label['variant'] ?? 'minimalist');
		if($use_variant !== '') $params['variant'] = $use_variant;
		return '/label?'.http_build_query($params);
	}
}
?>
<script>
(() => {
	const key = 'label-query:' + window.location.pathname;
	if(window.location.search) {
		window.__LABEL_QUERY__ = window.location.search;
		try { window.sessionStorage.setItem(key, window.location.search); } catch(e) {}
		return;
	}
	try {
		const saved = window.sessionStorage.getItem(key);
		if(saved) {
			window.__LABEL_QUERY__ = saved;
			window.history.replaceState(window.history.state || {}, '', window.location.pathname + saved + window.location.hash);
		}
	} catch(e) {}
})();
</script>
<div id='message'>
	<div class='label-live'>
		<div class='label-live-card'>
			<div id='label-capture'>
				<div id='label-preview' aria-live='polite'></div>
			</div>
			<div id='label-modal-overlay' class='label-modal-overlay hide' aria-hidden='true' role='dialog' aria-modal='true' aria-labelledby='label-modal-title'>
				<div class='label-modal message_dialog'>
					<div class='label-modal-header'>
						<h2 id='label-modal-title' class='message_dialog_label'>Label</h2>
						<button type='button' id='label-modal-close' class='message_dialog_close control' aria-label='Close'>
							<svg viewBox='0 0 24 24' width='18' height='18' aria-hidden='true'>
								<path d='M18 6L6 18M6 6l12 12' stroke='currentColor' stroke-width='2' stroke-linecap='round'/>
							</svg>
						</button>
					</div>
					<div class='label-modal-body'>
						<form id='label-edit-form' onsubmit='return false;'>
							<div class='label-form-row'>
								<div class='label-input-wrap'>
									<span class='label-hover-tag'>Title</span>
									<input id='label-input-title' type='text' placeholder='Title – e.g. Home' aria-label='Title'>
								</div>
								<div class='label-omit-wrap'>
									<label class='label-omit-check' title='Include title' aria-label='Include title'>
										<input type='checkbox' id='label-include-title' checked>
										<span class='label-omit-tip'>Include</span>
									</label>
								</div>
							</div>
							<div class='label-form-row'>
								<div class='label-input-wrap'>
									<span class='label-hover-tag'>Section</span>
									<input id='label-input-section' type='text' placeholder='Section – e.g. Main gate' aria-label='Section'>
								</div>
								<div class='label-omit-wrap'>
									<label class='label-omit-check' title='Include section' aria-label='Include section'>
										<input type='checkbox' id='label-include-section' checked>
										<span class='label-omit-tip'>Include</span>
									</label>
								</div>
							</div>
							<div class='label-form-row label-form-code'>
								<div class='label-input-wrap'>
									<span class='label-hover-tag'>Wolo code</span>
									<input id='label-input-code' type='text' placeholder='Wolo code – e.g. kathmandu.mask.net.soil' aria-label='Wolo code (required)' required>
								</div>
								<div class='label-omit-wrap label-omit-spacer' aria-hidden='true'></div>
							</div>
							<div class='label-form-row'>
								<div class='label-input-wrap'>
									<span class='label-hover-tag'>Address line 1</span>
									<input id='label-input-address1' type='text' placeholder='Address line 1 (optional)' aria-label='Address line 1'>
								</div>
								<div class='label-omit-wrap'>
									<label class='label-omit-check' title='Include address line 1' aria-label='Include address line 1'>
										<input type='checkbox' id='label-include-address1' checked>
										<span class='label-omit-tip'>Include</span>
									</label>
								</div>
							</div>
							<div class='label-form-row'>
								<div class='label-input-wrap'>
									<span class='label-hover-tag'>Address line 2</span>
									<input id='label-input-address2' type='text' placeholder='Address line 2 (optional)' aria-label='Address line 2'>
								</div>
								<div class='label-omit-wrap'>
									<label class='label-omit-check' title='Include address line 2' aria-label='Include address line 2'>
										<input type='checkbox' id='label-include-address2' checked>
										<span class='label-omit-tip'>Include</span>
									</label>
								</div>
							</div>
							<div class='label-form-row label-form-frame-row' id='label-row-frame-only'>
								<div class='label-input-wrap'>
									<span class='label-hover-tag'>Style</span>
									<span class='label-static-field'>Minimalist (frame only)</span>
								</div>
								<div class='label-omit-wrap'>
									<label class='label-omit-check' title='Minimalist (frame only): removes header and footer, leaving only the frame' aria-label='Minimalist (frame only)'>
										<input type='checkbox' id='label-toggle-frame-only'>
										<span class='label-omit-tip'>Enable</span>
									</label>
								</div>
							</div>
							<div class='label-modal-actions'>
								<button type='button' id='label-modal-cancel' class='border control'>Cancel</button>
								<button type='submit' id='label-modal-apply' class='border control primary'>Apply</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
		<div class='label-live-actions'>
			<button id='label-download-png' class='border control label-btn label-btn-icon' type='button' title='Download PNG' aria-label='Download PNG'>
				<svg class='btn-icon' viewBox='0 0 24 24' width='18' height='18' aria-hidden='true'>
					<path fill='currentColor' d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'/>
				</svg>
				<span id='label-download-text' class='visually-hidden'>Download PNG</span>
			</button>
			<button id='label-copy-text' class='border control label-btn label-btn-icon' type='button' title='Copy text' aria-label='Copy text'>
				<svg class='btn-icon' viewBox='0 0 24 24' width='18' height='18' aria-hidden='true'>
					<path fill='currentColor' d='M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z'/>
				</svg>
				<span id='label-copy-text-status' class='visually-hidden'>Copy text</span>
			</button>
			<button id='label-edit-btn' class='border control label-btn label-btn-icon' type='button' title='Edit label' aria-label='Edit label' aria-haspopup='dialog'>
				<svg class='btn-icon' viewBox='0 0 24 24' width='18' height='18' aria-hidden='true'>
					<path fill='currentColor' d='m14.06 9.02.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83a.996.996 0 0 0 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z'/>
				</svg>
				<span class='visually-hidden'>Edit</span>
			</button>
		</div>
	</div>
	<?php if(!empty($cached_labels)): ?>
	<div class='label-cached-section'>
		<h3 class='label-cached-heading'>Other cached labels</h3>
		<div class='label-cached-table-wrap'>
			<table class='label-cached-table'>
				<thead>
					<tr>
						<th>Title</th>
						<th>Section</th>
						<th>Wolo code</th>
						<th class='th-links th-full'>Full</th>
						<th class='th-links th-frame-only' title='Minimalist (frame only): removes header and footer, leaving only the frame'>Frame only</th>
					</tr>
				</thead>
				<tbody>
					<?php foreach($cached_labels as $label):
						$title = htmlspecialchars($label['title'] ?? '', ENT_QUOTES, 'UTF-8');
						$section = htmlspecialchars($label['section'] ?? $label['segment'] ?? '', ENT_QUOTES, 'UTF-8');
						$city = htmlspecialchars($label['city'] ?? '', ENT_QUOTES, 'UTF-8');
						$address1 = htmlspecialchars($label['address1'] ?? '', ENT_QUOTES, 'UTF-8');
						$address2 = htmlspecialchars($label['address2'] ?? '', ENT_QUOTES, 'UTF-8');
						$code = htmlspecialchars($label['code'] ?? '', ENT_QUOTES, 'UTF-8');
						$wolo_url = htmlspecialchars(!empty($label['url']) ? $label['url'] : '/'.$code, ENT_QUOTES, 'UTF-8');
						$label_url = htmlspecialchars(label_dynamic_url($label, 'minimalist'), ENT_QUOTES, 'UTF-8');
						$stripped_label_url = htmlspecialchars(label_dynamic_url($label, 'code'), ENT_QUOTES, 'UTF-8');
						$asset_stem = htmlspecialchars(label_asset_stem($label), ENT_QUOTES, 'UTF-8');
						$code_asset_stem = htmlspecialchars(label_asset_stem_variant($label, 'code'), ENT_QUOTES, 'UTF-8');
						$has_code_variant = !empty($label['extra_variants']) && is_array($label['extra_variants']) && in_array('code', $label['extra_variants'], true);
					?>
					<tr class='label-cached-row'
						data-href='<?php echo $label_url ?>'
						data-href-stripped='<?php echo $stripped_label_url ?>'
						data-title='<?php echo $title ?>'
						data-section='<?php echo $section ?>'
						data-city='<?php echo $city ?>'
						data-address1='<?php echo $address1 ?>'
						data-address2='<?php echo $address2 ?>'
						data-code='<?php echo $code ?>'
						tabindex='0'
						role='link'
						aria-label='Open label for <?php echo ($title !== '' ? $title : $code) ?>'
						title='Open label in editor'>
						<td class='td-title'><?php echo $title ?></td>
						<td class='td-section'><?php echo $section ?></td>
						<td class='td-code'>
							<?php if($code !== ''): ?>
							<a class='content-link label-code-link' href='<?php echo $wolo_url ?>' target='_blank' rel='noopener' title='Open <?php echo $code ?> in Wolo app'><code><?php echo $code ?></code></a>
							<?php endif; ?>
						</td>
						<td class='td-links td-full'>
							<button type='button' class='label-img-link label-toggle-preview' data-action='full' title='Preview full label' aria-label='Preview full label'><svg class='link-icon' viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='3' y='4' width='18' height='16' rx='1'/><path d='M8 8h8'/><path d='M3 16h18'/><path d='M7 12h10' stroke-width='2.4'/></svg></button>
							<a class='content-link label-img-link' href='/labels/<?php echo $asset_stem ?>.png' target='_blank' rel='noopener' title='Full label PNG' aria-label='Full label PNG'><svg class='link-icon' viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='3' y='4' width='18' height='16' rx='2'/><circle cx='9' cy='9.5' r='1.6'/><path d='M21 16l-5-5-9 9'/></svg></a>
							<a class='content-link label-img-link' href='/labels/<?php echo $asset_stem ?>.svg' target='_blank' rel='noopener' title='Full label SVG' aria-label='Full label SVG'><svg class='link-icon' viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M5 19C7 9 17 15 19 5'/><rect x='3' y='17' width='4' height='4' rx='0.5'/><rect x='17' y='3' width='4' height='4' rx='0.5'/><path d='M5 19L11 13'/></svg></a>
						</td>
						<td class='td-links td-frame-only'>
							<button type='button' class='label-img-link label-toggle-preview' data-action='frame' title='Preview minimalist (frame only)' aria-label='Preview minimalist (frame only)'><svg class='link-icon' viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M4 9V5h4M16 5h4v4M20 15v4h-4M8 19H4v-4'/><path d='M8 12h8' stroke-width='2.4'/></svg></button>
							<?php if($has_code_variant): ?>
							<a class='content-link label-img-link' href='/labels/<?php echo $code_asset_stem ?>.png' target='_blank' rel='noopener' title='Frame-only PNG' aria-label='Frame-only PNG'><svg class='link-icon' viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='3' y='4' width='18' height='16' rx='2'/><circle cx='9' cy='9.5' r='1.6'/><path d='M21 16l-5-5-9 9'/></svg></a>
							<a class='content-link label-img-link' href='/labels/<?php echo $code_asset_stem ?>.svg' target='_blank' rel='noopener' title='Frame-only SVG' aria-label='Frame-only SVG'><svg class='link-icon' viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M5 19C7 9 17 15 19 5'/><rect x='3' y='17' width='4' height='4' rx='0.5'/><rect x='17' y='3' width='4' height='4' rx='0.5'/><path d='M5 19L11 13'/></svg></a>
							<?php endif; ?>
						</td>
					</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		</div>
	</div>
	<?php endif; ?>
</div>

<style>
.visually-hidden {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
}
#message .label-live { margin-top: 4px; }
#message .label-live-card {
	position: relative;
	text-align: center;
	min-height: 440px;
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 8px;
	overflow: hidden;
}
#label-capture {
	display: inline-block;
	padding: 18px;
	background: #ffffff;
	border-radius: 8px;
	box-sizing: border-box;
}
#label-preview svg {
	width: auto;
	max-width: 100%;
	height: auto;
	display: block;
	margin: 0 auto;
}
#message .label-live-actions {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 16px;
	margin-top: 14px;
}
.label-btn-icon {
	width: 42px;
	height: 42px;
	padding: 0;
	border-radius: 50%;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: 1px solid #b8dbe8;
	background: #ffffff;
	color: #69b7cf;
	cursor: pointer;
	transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
}
.label-btn-icon .btn-icon {
	color: #69b7cf;
	fill: currentColor;
}
.label-btn-icon:hover {
	background: #f0f8fb;
	border-color: #69b7cf;
	color: #5aa6bc;
	transform: translateY(-1px);
}
.label-btn-icon:hover .btn-icon {
	color: #5aa6bc;
}
.label-btn-icon:active {
	transform: translateY(0);
}
.label-btn-icon:focus-visible {
	outline: 2px solid #69b7cf;
	outline-offset: 2px;
}
.label-btn-icon:disabled {
	opacity: 0.6;
	cursor: not-allowed;
	transform: none;
}
html.dark-mode .label-btn-icon {
	background: #1c2035;
	border-color: #384860;
	color: #69b7cf;
}
html.dark-mode .label-btn-icon .btn-icon {
	color: #69b7cf;
}
html.dark-mode .label-btn-icon:hover {
	background: #252e48;
	border-color: #69b7cf;
	color: #8ed0e4;
}
html.dark-mode .label-btn-icon:hover .btn-icon {
	color: #8ed0e4;
}

/* Modal overlay & card: covers only the display label area */
.label-modal-overlay {
	position: absolute;
	inset: 0;
	background: rgba(0, 0, 0, 0.45);
	backdrop-filter: blur(2px);
	-webkit-backdrop-filter: blur(2px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 100;
	padding: 16px;
	box-sizing: border-box;
	border-radius: 8px;
}
.label-modal-overlay.hide {
	display: none !important;
}
html.dark-mode .label-modal-overlay {
	background: rgba(0, 0, 0, 0.65);
}
.label-modal.message_dialog {
	position: relative;
	background: #ffffff;
	width: min(420px, 100%);
	max-height: calc(100% - 24px);
	overflow-y: auto;
	border-radius: 8px;
	border: 1px solid #d9d9d9;
	box-shadow: 0 12px 36px rgba(0, 0, 0, 0.22);
	font-family: 'Abel', sans-serif;
	box-sizing: border-box;
}
html.dark-mode .label-modal.message_dialog {
	background: #1c2035;
	border-color: #384860;
	color: #e0e0e0;
}
html.dark-mode .label-modal-body {
	background: #1c2035;
}
html.dark-mode .label-modal-header .message_dialog_close:hover {
	background: #252e48;
	color: #ffffff;
}
	overflow: hidden;
	box-sizing: border-box;
}
.label-modal-header {
	position: relative;
	padding: 14px 20px 12px;
	text-align: center;
}
.label-modal-header .message_dialog_label {
	margin: 0;
	font-size: 22px;
	color: #a6a6a6;
	font-weight: 400;
	letter-spacing: 0.5px;
}
.label-modal-header .message_dialog_close {
	position: absolute;
	right: 14px;
	top: 14px;
	width: 32px;
	height: 32px;
	border: none;
	background: transparent;
	color: #888888;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	padding: 0;
	transition: background-color 0.15s ease, color 0.15s ease;
}
.label-modal-header .message_dialog_close:hover {
	background: #f0f0f0;
	color: #222222;
}

/* Modal body - without thick bar below header */
.label-modal-body {
	border-top: none;
	padding: 14px 24px 22px;
	background: #ffffff;
}

.label-form-row {
	display: flex;
	align-items: flex-end;
	gap: 12px;
	margin-bottom: 14px;
	position: relative;
}
.label-input-wrap {
	flex: 1 1 auto;
	min-width: 0;
	display: flex;
	flex-direction: column;
	position: relative;
}
.label-hover-tag {
	font-family: 'Abel', sans-serif;
	font-size: 11px;
	font-weight: 600;
	color: #69b7cf;
	text-transform: uppercase;
	letter-spacing: 0.6px;
	line-height: 1;
	margin-bottom: 3px;
	opacity: 0;
	transform: translateY(3px);
	pointer-events: none;
	transition: opacity 0.16s ease, transform 0.16s ease;
}
.label-form-row:hover .label-hover-tag,
.label-input-wrap:focus-within .label-hover-tag {
	opacity: 1;
	transform: translateY(0);
}

.label-form-row input[type='text'] {
	width: 100%;
	font-family: 'Abel', sans-serif;
	font-size: 16px;
	color: #444444;
	background: transparent;
	border: none;
	border-bottom: 1px solid #d8d8d8;
	padding: 4px 2px 6px;
	outline: none;
	box-sizing: border-box;
	transition: border-color 0.2s ease, opacity 0.2s ease, color 0.2s ease;
}
.label-form-row input[type='text']:focus {
	border-bottom-color: #69b7cf;
	color: #111111;
}
.label-form-row input[type='text'].is-omitted {
	opacity: 0.35;
	color: #999999;
}
.label-static-field {
	width: 100%;
	font-family: 'Abel', sans-serif;
	font-size: 16px;
	color: #444444;
	background: transparent;
	border-bottom: 1px solid #d8d8d8;
	padding: 4px 2px 6px;
	box-sizing: border-box;
	user-select: none;
	display: block;
	transition: border-color 0.2s ease, opacity 0.2s ease, color 0.2s ease;
}
.label-static-field.is-omitted,
.label-form-row.is-omitted .label-static-field {
	opacity: 0.35;
	color: #999999;
}
html.dark-mode .label-static-field {
	color: #d0d0d0;
	border-bottom-color: #383858;
}
html.dark-mode .label-static-field.is-omitted,
html.dark-mode .label-form-row.is-omitted .label-static-field {
	color: #777777;
}

/* Omit checkbox with hover-only tooltip/label */
.label-omit-wrap {
	flex: 0 0 17px;
	width: 17px;
	display: flex;
	align-items: center;
	padding-bottom: 6px;
}
.label-omit-spacer {
	visibility: hidden;
	pointer-events: none;
}
.label-omit-check {
	position: relative;
	display: inline-flex;
	align-items: center;
	cursor: pointer;
	user-select: none;
}
.label-omit-check input[type='checkbox'] {
	cursor: pointer;
	accent-color: #69b7cf;
	width: 17px;
	height: 17px;
	margin: 0;
}
.label-omit-tip {
	position: absolute;
	right: 100%;
	top: 50%;
	transform: translateY(-50%) translateX(-6px);
	background: #333333;
	color: #ffffff;
	font-family: 'Abel', sans-serif;
	font-size: 11px;
	padding: 3px 8px;
	border-radius: 4px;
	white-space: nowrap;
	pointer-events: none;
	opacity: 0;
	transition: opacity 0.15s ease, transform 0.15s ease;
	z-index: 10;
}
.label-omit-tip::after {
	content: '';
	position: absolute;
	left: 100%;
	top: 50%;
	transform: translateY(-50%);
	border-width: 4px;
	border-style: solid;
	border-color: transparent transparent transparent #333333;
}
.label-omit-check:hover .label-omit-tip {
	opacity: 1;
	transform: translateY(-50%) translateX(-8px);
}

/* Centered modal action buttons without top separator line */
.label-modal-actions {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 14px;
	margin-top: 24px;
	padding-top: 8px;
}
.label-modal-actions button {
	min-width: 90px;
	padding: 7px 18px;
	font-family: 'Abel', sans-serif;
	font-size: 15px;
	border-radius: 5px;
	cursor: pointer;
	border: 1px solid #cccccc;
	background: #ffffff;
	color: #555555;
	transition: all 0.15s ease;
}
.label-modal-actions button:hover {
	background: #f7f7f7;
}
.label-modal-actions button.primary {
	background: #69b7cf;
	border-color: #5aa6bc;
	color: #ffffff;
}
.label-modal-actions button.primary:hover {
	background: #5aa6bc;
}

/* Other cached labels table */
.label-cached-section {
	margin-top: 36px;
	padding-top: 20px;
	border-top: 1px solid #eef3f6;
}
html.dark-mode .label-cached-section {
	border-top-color: #2a2a4a;
}
.label-cached-heading {
	margin: 0 0 14px;
	font-size: 1.25rem;
	font-weight: 500;
	color: #69b7cf !important;
}
.label-cached-table-wrap {
	overflow-x: auto;
	-webkit-overflow-scrolling: touch;
}
.label-cached-table {
	width: 100%;
	border-collapse: collapse;
	font-size: 0.95rem;
	text-align: left;
}
.label-cached-table th,
.label-cached-table td {
	padding: 8px 12px;
	border-bottom: 1px solid #edf2f5;
	vertical-align: middle;
}
.label-cached-table th {
	font-weight: 600;
	color: #69b7cf;
	border-bottom: 2px solid #b8dbe8;
	white-space: nowrap;
	font-size: 0.9rem;
	letter-spacing: 0.3px;
}
html.dark-mode .label-cached-table th {
	color: #69b7cf;
	border-bottom-color: #384860;
}
html.dark-mode .label-cached-table td {
	border-bottom-color: #252542;
	color: #d0d0d0;
}
.label-cached-row {
	cursor: pointer;
	transition: background-color 0.12s ease;
}
.label-cached-table tr:hover td {
	background-color: #f7fcfe;
}
html.dark-mode .label-cached-table tr:hover td {
	background-color: #222242;
}
.label-cached-table .td-title {
	font-weight: 500;
	color: #333333;
	white-space: nowrap;
}
html.dark-mode .label-cached-table .td-title {
	color: #e0e0e0;
}
.label-cached-table .td-section {
	color: #555555;
	white-space: nowrap;
}
html.dark-mode .label-cached-table .td-section {
	color: #b0b0b0;
}
.label-cached-table .td-code {
	white-space: nowrap;
}
.label-cached-table .td-code .label-code-link {
	display: inline-block;
	text-decoration: none;
	padding: 2px 4px;
	border-radius: 4px;
	transition: background-color 0.15s ease, color 0.15s ease;
}
.label-cached-table .td-code .label-code-link:hover {
	background: #eef6f9;
}
.label-cached-table .td-code .label-code-link code {
	font-family: consolas, ui-monospace, monospace !important;
	font-size: 0.9em;
	color: #69b7cf;
	background: transparent;
	padding: 0;
	transition: color 0.15s ease;
}
.label-cached-table .td-code .label-code-link:hover code {
	color: #5aa6bc;
	text-decoration: underline;
}
html.dark-mode .label-cached-table .td-code .label-code-link:hover {
	background: #252848;
}
html.dark-mode .label-cached-table .td-code .label-code-link code {
	color: #69b7cf;
}
html.dark-mode .label-cached-table .td-code .label-code-link:hover code {
	color: #8ed0e4;
}
.label-cached-table .th-links,
.label-cached-table .td-links {
	text-align: center;
	white-space: nowrap;
}
.label-cached-table .td-links .label-img-link {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 26px;
	height: 26px;
	padding: 0;
	margin: 0 1px;
	vertical-align: middle;
	font-size: 0.85rem;
	font-weight: 600;
	border-radius: 4px;
	text-decoration: none;
	color: #69b7cf !important;
	background: #f0f7fa;
	border: 1px solid #d4e8f0;
	transition: all 0.15s ease;
}
.label-cached-table .td-links .link-icon {
	display: block;
	pointer-events: none;
}
.label-cached-table .td-links button.label-img-link {
	font-family: inherit;
	cursor: pointer;
	line-height: inherit;
}
.label-cached-table .td-links .label-img-link:hover {
	background: #69b7cf;
	color: #ffffff !important;
	border-color: #5aa6bc;
}
html.dark-mode .label-cached-table .td-links .label-img-link {
	background: #252848;
	border-color: #3a3e68;
	color: #69b7cf !important;
}
html.dark-mode .label-cached-table .td-links .label-img-link:hover {
	background: #69b7cf;
	color: #ffffff !important;
	border-color: #5aa6bc;
}
</style>
<script type='module' src='/label-runtime.js'></script>
<?php require('../HTML/Fragment/Component_bottom_nav.php') ?>
