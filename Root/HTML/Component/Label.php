<div id='message'>
	<div class='label-live'>
		<p class='label-live-intro'>Dynamic minimalist label preview (query params: title, section, address1, address2, code).</p>
		<div class='label-live-card'>
			<div id='label-preview' aria-live='polite'></div>
		</div>
		<div class='label-live-actions'>
			<button id='label-download-png' class='border control' type='button'>Download PNG</button>
		</div>
	</div>
</div>
<style>
#message .label-live-intro { margin-bottom: 16px; }
#message .label-live-card { border: 1px solid #d5e9ef; border-radius: 10px; padding: 12px; background: #fcfeff; }
#label-preview svg { width: 100%; height: auto; display: block; }
#message .label-live-actions { margin-top: 12px; }
</style>
<script type='module' src='/label-runtime.js'></script>
<?php require('../HTML/Fragment/Component_bottom_nav.php') ?>
