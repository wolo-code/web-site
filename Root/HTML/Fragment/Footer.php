<div id='footer-wrapper'>
	<div id='updated-container'>
		<div id='updated'>
			Updated:
			<span id='date'>
				<?php echo $date; ?>
			</span>
		</div>
	</div>
	<div class='shadow-scroll-bottom'></div>
	<div id='footer-wrapper-divider'></div>
	<div id='footer-wrapper-inside'>

		<div>
			<span id='download-bottom-url'>
				<span>app:</span> <a class='content-link' href="https://wolo.codes/get">wolo.codes/get</a>
			</span>
			<span id="download_button_bottom" class="grow"> <a href="/downloads"><span class="image"><?php includeSVG('', 'Download'); ?></span></a> </span>
			<span id='download-android-bottom' class="download active">
				<a href='https://play.google.com/store/apps/details?id=codes.wolo.droid' class='content-link'><span class='image'><?php includeSVG('', 'Google-Play-badge'); ?></span></a>
			</span>
		</div>
		
		<div id='social-links' class='center'>
			<span class='social grow'>
				<a href='https://twitter.com/wolocode' id='site-twitter' onclick="trackOutboundLink('wolo-twitter', 'https://twitter.com/wolocode')"><span class='image'><?php includeSVG('', 'Twitter'); ?></span></a>
			</span>
			<span class='social grow'>
				<a href='https://facebook.com/wolocode' id='site-facebook' onclick="trackOutboundLink('wolo-facebook', 'https://facebook.com/wolocode')"><span class='image'><?php includeSVG('', 'Facebook'); ?></span></a>
			</span>
			<span class='social grow'>
				<a href='https://www.youtube.com/channel/UCnKSws8Lro8U9Ewtf1Xi5jg' id='site-youtube' onclick="trackOutboundLink('wolo-youtube', 'https://www.youtube.com/channel/UCnKSws8Lro8U9Ewtf1Xi5jg')"><span class='image'><?php includeSVG('', 'YouTube'); ?></span></a>
			</span>
		</div>
		
		<div class='footer-content'>
			<a class="content-link-gray XURL" href='/license' data-target='license' data-title='License'>&copy; <?php echo date('Y'); ?></a>
			<a class="content-link XURL" href='/about' data-target='about' data-title='About'>Wolo Code</a><a class='content-link' target='_blank' href='/about'></a>
		</div>
		
	</div>
</div>
