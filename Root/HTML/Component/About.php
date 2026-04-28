<div id='message'>
	<div class='h_faded_bar'>
		
		<div id='location_title'>
			<?php includeSVG($id, 'location_title'); ?>
		</div>

		<div id='location_solution_description' class='pagebreak'>
			<h2><span class='bullet'>•</span><span>Intro</span></h2>
			<p class='indent-b'>
				<strong>Wolo Code</strong> is a location app by <em>Wolo</em> that converts map locations into short, word based address codes and converts those codes back into map locations.<br>
				The app helps users search for a place, select a point on a map, generate a <em>Wolo Code</em> for that point, decode an existing <em>Wolo Code</em>, and share or save useful addresses
			</p>
			<?php $img_title='location_solution_description'; $ext='svg'; $extern='true'; $alt=''; $center='true'; require('Fragment/Component_image.php') ?>
		</div>

		<div id='location_problem_statement' class='pagebreak'>
			<h2><span class='bullet'>•</span>The address <span class='key'>Problem</span></h2>
			<?php $img_title='location_problem_statement'; $ext='svg'; $extern='true'; $alt=''; $center='true'; require('Fragment/Component_image.php') ?>
		</div>

		<div id='location_problem_description' class='pagebreak'>
			<?php $img_title='location_problem_description'; $ext='svg'; $extern='true'; $alt=''; $center='true'; require('Fragment/Component_image.php') ?>
		</div>

		<div id='location_solution_statement' class='pagebreak'>
			<h2><span class='bullet'>•</span>The words <span class='key'>Solution</span></h2>
			<?php $img_title='location_solution_statement'; $ext='svg'; $extern='true'; $alt=''; $center='true'; require('Fragment/Component_image.php') ?>
		</div>

		<div id='location_door' class='pagebreak'>
			<?php $img_title='location_door'; $ext='svg'; $extern='true'; $alt=''; $center='true'; require('Fragment/Component_image.php') ?>
		</div>
		
		<div id='location_simplification' class='pagebreak'>
			<?php $img_title='location_simplification'; $ext='svg'; $extern='true'; $alt=''; $center='true'; require('Fragment/Component_image.php') ?>
		</div>
						
		<div id='location_qr' class='pagebreak'>
			<h2><span class='bullet'></span>Wolo Code <span class='key'>Labels</span></h2>
			<?php $img_title='location_label'; $ext='svg'; $extern='true'; $alt=''; $center='true'; require('Fragment/Component_image.php') ?>
		</div>

		<div id='location_app_intro' class='pagebreak'>
			<h2><span class='bullet'></span><span class='key'>App</span></h2>
			
			<div id='location_app_demo_map'>
				<?php $img_title='location_demo_map'; $ext='svg'; $alt=''; $center='true'; require('Fragment/Component_image.php') ?>
			</div>
			
			<div id='location_app_intro' class='pagebreak'>
				<?php $img_title='location_app_intro'; $ext='svg'; $extern='true'; $alt=''; $center='true'; require('Fragment/Component_image.php') ?>
			</div>
		</div>

		<div id='app_homepage_summary' class='pagebreak'>
			<h2><span class='bullet'>•</span><span>Data use</span></h2>
			<p class='indent-b'>
				You can use the public location tools without signing in.
				Signing in with <em>Google</em> or <em>Facebook</em> is optional and is used only when you choose account features, such as viewing your account profile in the app or saving and opening your saved Wolo Code addresses.
			</p>
			<p class='indent-b'>
				When you sign in with Google or Facebook, Wolo Code requests basic profile information such as your name and email address so the app can identify your account, show your signed-in profile, and associate saved addresses with you.
				Wolo Code does <strong>not</strong> request account access to read your <em>Gmail</em>, <em>contacts</em>, <em>calendar</em>, <em>Drive</em> files, Facebook posts, friends list, messages, or other unrelated Google or Facebook data.
			</p>
			<p class='indent-b'>
				For details on how user information is collected, used, and protected, read the
				<a href='/policy' data-target='policy' class='content-link XURL'>Wolo Code Privacy Policy</a>.<br>
				For details on the terms of use of the app, read the
				<a href='/terms' data-target='terms' class='content-link XURL'>Wolo Code Terms of Use</a>.
			</p>
			<p class='indent-b'>
				<small>Google and Facebook are trademarks of their respective owners. Wolo Code is not affiliated with, endorsed by, or sponsored by Google or Facebook and their parent organizations: Alphabet and Meta</small>
			</p>
		</div>

		<div id='locaiton_appendix' class='pagebreak'>
			<h2><span class='bullet'></span><span class='key'>Appendix</span></h2>
			<ol id='locaiton_appendix_list'>
				<li>Each city can have over a billion unique addresses. <span>( 1bn 73mn &amp; 741,824 precisely )</span></li>
				<li>Ground address - within a city, with 2m resolution</li>
				<li>Words from a limited <a class='link' href='https://wcodes.org/wordlist'>list</a> of only 1024 words</li>
			</ol>
		</div>
		
	</div>
</div>
<?php require('../HTML/Fragment/Component_bottom_nav.php') ?>
