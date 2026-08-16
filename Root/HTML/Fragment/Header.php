<div id='header-wrapper' style='overflow: hidden'>
	<div id='header-title'>
	<div id='header-slogan'>
		<a id='header-slogan-href' class='content-link' href='/'>
			<span id='header-slogan-text'>simplest precise address</span>
		</a>
	</div>
	<div id='header-logo'>
		<a id='header-logo-image' class='header-logo image' href='/'>
			<?php includeSVG('', 'Logo_wolo'); ?>
		</a>
		<a id='header-logo-image_codes' class='header-logo image' href='/'>
			<?php includeSVG('', 'Logo_code'); ?>
		</a>
	</div>
	</div>
	<div id='header-bar'>
	<div><span class='toggle-push-left image grow' id='menu-button'><?php includeSVG('', 'Menu_icon'); ?></span></div>
	<div id='notification' class='hide'></div>
	<div id='header-right-list'>
		<span id='header_buttons_right'>
			<span id='header_button'>
				<span id='search-button' class='grow'><span class='image'><?php includeSVG('', 'Search'); ?></span></span>
				<span id='translate-button' class='grow'><span class='image'><?php includeSVG('', 'Translate'); ?></span></span>
				<span id='theme-selector'>
					<button id='darkmode-button' class='grow' type='button' aria-haspopup='menu' aria-expanded='false'>
						<span class='theme-current-icon image' data-theme-icon='light'><?php includeSVG('', 'Light_mode'); ?></span>
						<span class='theme-current-icon image' data-theme-icon='dark'><?php includeSVG('', 'Dark_mode'); ?></span>
					</button>
					<div id='theme-menu' role='menu' aria-label='Theme' hidden>
						<button class='theme-option' type='button' role='menuitemradio' data-theme='system'>
							<span class='theme-option-icon image'><?php includeSVG('', 'System_mode'); ?></span><span>System</span>
						</button>
						<button class='theme-option' type='button' role='menuitemradio' data-theme='light'>
							<span class='theme-option-icon image'><?php includeSVG('', 'Light_mode'); ?></span><span>Light</span>
						</button>
						<button class='theme-option' type='button' role='menuitemradio' data-theme='dark'>
							<span class='theme-option-icon image'><?php includeSVG('', 'Dark_mode'); ?></span><span>Dark</span>
						</button>
					</div>
				</span>
			</span>
		</span>
	</div>
	</div>
</div>
<div id='header-wrapper-divider'></div>
