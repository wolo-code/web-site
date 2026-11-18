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
		<p class='label-live-intro'>Dynamic minimalist label preview (query params: title, section, address1, address2, code).</p>
		<div class='label-live-card'>
			<div id='label-capture'>
				<div id='label-preview' aria-live='polite'></div>
			</div>
		</div>
		<div class='label-live-actions'>
			<button id='label-download-png' class='border control' type='button'>Download PNG</button>
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
#message .label-live-actions { margin-top: 12px; }
</style>
<script type='module' src='/label-runtime.js'></script>
<?php require('../HTML/Fragment/Component_bottom_nav.php') ?>
