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
?>
<div id='message'>
	<div class='label-live'>
		<div class='label-live-card'>
			<div id='label-capture'>
				<div id='label-preview' aria-live='polite'></div>
			</div>
		</div>
		<div class='label-live-actions'>
			<button id='label-download-png' class='border control label-btn label-btn-icon' type='button' title='Download PNG' aria-label='Download PNG'>
				<svg class='btn-icon' viewBox='0 0 24 24' width='18' height='18' aria-hidden='true'>
					<path fill='currentColor' d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'/>
				</svg>
				<span id='label-download-text' class='visually-hidden'>Download PNG</span>
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
		<ul class='label-cached-list'>
			<?php foreach($cached_labels as $label):
				$slug = htmlspecialchars($label['slug'] ?? '', ENT_QUOTES, 'UTF-8');
				$title = htmlspecialchars($label['title'] ?? '', ENT_QUOTES, 'UTF-8');
				$code = htmlspecialchars($label['code'] ?? '', ENT_QUOTES, 'UTF-8');
				$asset_stem = htmlspecialchars(label_asset_stem($label), ENT_QUOTES, 'UTF-8');
				$code_asset_stem = htmlspecialchars(label_asset_stem_variant($label, 'code'), ENT_QUOTES, 'UTF-8');
				$has_code_variant = !empty($label['extra_variants']) && is_array($label['extra_variants']) && in_array('code', $label['extra_variants'], true);
				$display_name = $title !== '' ? $title : (!empty($label['address1']) ? htmlspecialchars($label['address1'], ENT_QUOTES, 'UTF-8') : 'Sample');
			?>
			<li class='label-cached-item'>
				<div class='label-cached-meta'>
					<a class='content-link label-cached-name' href='/labels/<?php echo $asset_stem ?>.png' target='_blank' rel='noopener'><?php echo $display_name ?></a>
					<span class='label-cached-code'><?php echo $code ?></span>
				</div>
				<div class='label-cached-links'>
					<a class='content-link label-img-link' href='/labels/<?php echo $asset_stem ?>.png' target='_blank' rel='noopener'>PNG</a>
					<span class='separator'>|</span>
					<a class='content-link label-img-link' href='/labels/<?php echo $asset_stem ?>.svg' target='_blank' rel='noopener'>SVG</a>
					<?php if($has_code_variant): ?>
					<span class='separator'>|</span>
					<span class='label-cached-sublabel'>Code:</span>
					<a class='content-link label-img-link' href='/labels/<?php echo $code_asset_stem ?>.png' target='_blank' rel='noopener'>PNG</a>
					<span class='separator'>|</span>
					<a class='content-link label-img-link' href='/labels/<?php echo $code_asset_stem ?>.svg' target='_blank' rel='noopener'>SVG</a>
					<?php endif; ?>
				</div>
			</li>
			<?php endforeach; ?>
		</ul>
	</div>
	<?php endif; ?>
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
						<span class='label-hover-tag'>Segment</span>
						<input id='label-input-segment' type='text' placeholder='Segment – e.g. Main gate' aria-label='Segment'>
					</div>
					<div class='label-omit-wrap'>
						<label class='label-omit-check' title='Include segment' aria-label='Include segment'>
							<input type='checkbox' id='label-include-segment' checked>
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
				<div class='label-modal-actions'>
					<button type='button' id='label-modal-cancel' class='border control'>Cancel</button>
					<button type='submit' id='label-modal-apply' class='border control primary'>Apply</button>
				</div>
			</form>
		</div>
	</div>
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
	text-align: center;
	overflow-x: auto;
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
	color: #555555;
	cursor: pointer;
	transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
}
.label-btn-icon:hover {
	background: #f0f8fb;
	border-color: #69b7cf;
	color: #69b7cf;
	transform: translateY(-1px);
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

/* Modal overlay & card */
.label-modal-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.45);
	backdrop-filter: blur(2px);
	-webkit-backdrop-filter: blur(2px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10000;
	padding: 16px;
	box-sizing: border-box;
}
.label-modal-overlay.hide {
	display: none !important;
}
.label-modal.message_dialog {
	position: relative;
	background: #ffffff;
	width: min(420px, 100%);
	border-radius: 8px;
	border: 1px solid #d9d9d9;
	box-shadow: 0 12px 36px rgba(0, 0, 0, 0.22);
	font-family: 'Abel', sans-serif;
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

/* Other cached labels list */
.label-cached-section {
	margin-top: 36px;
	padding-top: 20px;
	border-top: 1px solid #eef3f6;
}
html.dark-mode .label-cached-section {
	border-top-color: #2a2a4a;
}
.label-cached-heading {
	margin: 0 0 16px;
	font-size: 1.25rem;
	font-weight: 500;
	color: #69b7cf !important;
}
.label-cached-list {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.label-cached-item {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 8px 16px;
	padding: 10px 14px;
	background: #fbfdfe;
	border: 1px solid #dcebf0;
	border-radius: 8px;
	transition: border-color 0.15s ease, background-color 0.15s ease;
}
.label-cached-item:hover {
	background: #f5fafd;
	border-color: #69b7cf;
}
html.dark-mode .label-cached-item {
	background: #20203a;
	border-color: #2e2e50;
}
html.dark-mode .label-cached-item:hover {
	background: #262646;
	border-color: #69b7cf;
}
.label-cached-meta {
	display: flex;
	align-items: baseline;
	flex-wrap: wrap;
	gap: 8px;
}
.label-cached-name {
	font-weight: 600;
	font-size: 1.05rem;
	text-decoration: none;
	color: #333333 !important;
}
.label-cached-name:hover {
	color: #69b7cf !important;
}
html.dark-mode .label-cached-name {
	color: #e0e0e0 !important;
}
html.dark-mode .label-cached-name:hover {
	color: #69b7cf !important;
}
.label-cached-code {
	font-size: 0.9rem;
	color: #777777;
	font-family: 'Abel', sans-serif;
}
html.dark-mode .label-cached-code {
	color: #999999;
}
.label-cached-links {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 0.95rem;
}
.label-cached-links .separator {
	color: #cfcfcf !important;
}
html.dark-mode .label-cached-links .separator {
	color: #4a4a68 !important;
}
.label-cached-sublabel {
	color: #888888;
	font-size: 0.85rem;
	margin-left: 2px;
}
html.dark-mode .label-cached-sublabel {
	color: #aaaaaa;
}
.label-img-link {
	font-weight: 500;
	padding: 2px 4px;
	border-radius: 4px;
	transition: background-color 0.15s ease, color 0.15s ease;
}
.label-img-link:hover {
	background: rgba(105, 183, 207, 0.12);
}
</style>
<script type='module' src='/label-runtime.js'></script>
<?php require('../HTML/Fragment/Component_bottom_nav.php') ?>
