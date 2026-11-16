<div id='message'>
	<div class='label-live'>
		<p class='label-live-intro'>Dynamic minimalist label preview (query params: title, segment, address1, address2, code).</p>
		<div class='label-live-card'>
			<div id='label-capture'>
				<div id='label-preview' aria-live='polite'></div>
			</div>
		</div>
		<div class='label-live-actions'>
			<button id='label-edit-btn' class='border control label-btn' type='button' aria-haspopup='dialog'>
				<svg class='btn-icon' viewBox='0 0 24 24' width='16' height='16' aria-hidden='true'>
					<path fill='currentColor' d='m14.06 9.02.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83a.996.996 0 0 0 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z'/>
				</svg>
				<span>Edit</span>
			</button>
			<button id='label-download-png' class='border control label-btn label-btn-primary' type='button'>
				<svg class='btn-icon' viewBox='0 0 24 24' width='16' height='16' aria-hidden='true'>
					<path fill='currentColor' d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'/>
				</svg>
				<span id='label-download-text'>Download PNG</span>
			</button>
		</div>
	</div>
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
					<input id='label-input-title' type='text' placeholder='Title – e.g. Home' aria-label='Title'>
					<label class='label-omit-check' title='Leave title out of the generated image'>
						<input type='checkbox' id='label-omit-title'>
						<span>Leave out</span>
					</label>
				</div>
				<div class='label-form-row'>
					<input id='label-input-segment' type='text' placeholder='Segment – e.g. Main gate' aria-label='Segment'>
					<label class='label-omit-check' title='Leave segment out of the generated image'>
						<input type='checkbox' id='label-omit-segment'>
						<span>Leave out</span>
					</label>
				</div>
				<div class='label-form-row'>
					<input id='label-input-address1' type='text' placeholder='Address line 1 (optional)' aria-label='Address line 1'>
					<label class='label-omit-check' title='Leave address line 1 out of the generated image'>
						<input type='checkbox' id='label-omit-address1'>
						<span>Leave out</span>
					</label>
				</div>
				<div class='label-form-row'>
					<input id='label-input-address2' type='text' placeholder='Address line 2 (optional)' aria-label='Address line 2'>
					<label class='label-omit-check' title='Leave address line 2 out of the generated image'>
						<input type='checkbox' id='label-omit-address2'>
						<span>Leave out</span>
					</label>
				</div>
				<div class='label-form-row label-form-code'>
					<input id='label-input-code' type='text' placeholder='Code – e.g. kathmandu.mask.net.soil' aria-label='Code (required)' required>
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
#message .label-live-intro { margin-bottom: 16px; }
#message .label-live-card {
	border: 1px solid #d5e9ef;
	border-radius: 10px;
	padding: 12px;
	background: #fcfeff;
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
	gap: 12px;
	margin-top: 14px;
}
.label-btn {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 8px 18px;
	font-family: 'Abel', sans-serif;
	font-size: 16px;
	border-radius: 6px;
	cursor: pointer;
	border: 1px solid #b8dbe8;
	background: #ffffff;
	color: #333333;
	transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}
.label-btn:hover {
	background: #f3f9fb;
	border-color: #69b7cf;
}
.label-btn:focus-visible {
	outline: 2px solid #69b7cf;
	outline-offset: 2px;
}
.label-btn-primary {
	background: #69b7cf;
	border-color: #5aa6bc;
	color: #ffffff;
	font-weight: 500;
}
.label-btn-primary:hover {
	background: #5aa6bc;
	border-color: #4a94aa;
	color: #ffffff;
}
.label-btn:disabled {
	opacity: 0.65;
	cursor: not-allowed;
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
	padding: 14px 20px 10px;
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
.label-modal-body {
	border-top: 5px solid #69b7cf;
	padding: 18px 22px 22px;
	background: #ffffff;
}
.label-form-row {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 16px;
}
.label-form-row input[type='text'] {
	flex: 1 1 auto;
	min-width: 0;
	font-family: 'Abel', sans-serif;
	font-size: 16px;
	color: #444444;
	background: transparent;
	border: none;
	border-bottom: 1px solid #d8d8d8;
	padding: 6px 2px;
	outline: none;
	box-sizing: border-box;
	transition: border-color 0.2s ease, opacity 0.2s ease, color 0.2s ease;
}
.label-form-row input[type='text']:focus {
	border-bottom-color: #69b7cf;
	color: #111111;
}
.label-form-row input[type='text'].is-omitted {
	opacity: 0.42;
	text-decoration: line-through;
	color: #888888;
}
.label-omit-check {
	flex: 0 0 auto;
	display: flex;
	align-items: center;
	gap: 5px;
	font-size: 14px;
	color: #777777;
	cursor: pointer;
	user-select: none;
	white-space: nowrap;
}
.label-omit-check input[type='checkbox'] {
	cursor: pointer;
	accent-color: #69b7cf;
	width: 15px;
	height: 15px;
	margin: 0;
}
.label-omit-check:hover {
	color: #333333;
}
.label-modal-actions {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	margin-top: 22px;
	padding-top: 14px;
	border-top: 1px solid #eeeeee;
}
.label-modal-actions button {
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
</style>
<script type='module' src='/label-runtime.js'></script>
<?php require('../HTML/Fragment/Component_bottom_nav.php') ?>
