<div id='message'>
	<div>
		
		<div id='location_title'>
			<?php includeSVG($id, 'location_title'); ?>
		</div>

		<div id='location_solution_description' class='pagebreak'>
			<h2><span class='bullet'>•</span><span>Intro</span></h2>
			<?php $img_title='location_solution_description'; $ext='svg'; $extern='true'; $alt=''; $center='true'; require('Fragment\Component_image.php') ?>
		</div>

		<div id='location_problem_statement' class='pagebreak'>
			<h2><span class='bullet'>•</span>The address <span class='key'>Problem</span></h2>
			<?php $img_title='location_problem_statement'; $ext='svg'; $extern='true'; $alt=''; $center='true'; require('Fragment\Component_image.php') ?>
		</div>

		<div id='location_problem_description' class='pagebreak'>
			<?php $img_title='location_problem_description'; $ext='svg'; $extern='true'; $alt=''; $center='true'; require('Fragment\Component_image.php') ?>
		</div>

		<div id='location_solution_statement' class='pagebreak'>
			<h2><span class='bullet'>•</span>The words <span class='key'>Solution</span></h2>
			<?php $img_title='location_solution_statement'; $ext='svg'; $extern='true'; $alt=''; $center='true'; require('Fragment\Component_image.php') ?>
		</div>

		<div id='location_door' class='pagebreak'>
			<?php $img_title='location_door'; $ext='svg'; $extern='true'; $alt=''; $center='true'; require('Fragment\Component_image.php') ?>
		</div>

		<div id='location_qr' class='pagebreak'>
			<h2><span class='bullet'></span>Stickers <span class='key'>&amp;</span> QR</h2>
			<?php $img_title='location_qr'; $ext='svg'; $extern='true'; $alt=''; $center='true'; require('Fragment\Component_image.php') ?>
		</div>

		<div id='location_app_intro' class='pagebreak'>
			<h2><span class='bullet'></span><span class='key'>App</span></h2>
			
			<div id='location_app_demo_map'>
				<?php $img_title='location_demo_map'; $ext='svg'; $alt=''; $center='true'; require('Fragment\Component_image.php') ?>
			</div>
			
			<div id='location_app_demo_satellite' class='pagebreak'>
				<?php $img_title='location_demo_map_parking'; $ext='svg'; $alt=''; $center='true'; require('Fragment\Component_image.php') ?>
			</div>
			
			<div id='location_app_intro' class='pagebreak'>
				<?php $img_title='location_app_intro'; $ext='svg'; $extern='true'; $alt=''; $center='true'; require('Fragment\Component_image.php') ?>
			</div>
		</div>

		<div id='locaiton_appendix' class='pagebreak'>
			<h2><span class='bullet'></span><span class='key'>Appendix</span></h2>
			<ol id='locaiton_appendix_list'>
				<li>Each city can have over a billion unique addresses. <span>( 1bn 73mn &amp; 741,824 precisely )</span></li>
				<li>Ground address - within a city, with 2m resolution</li>
				<li>Words from a limited set of only 1024 words</li>
			</ol>
		</div>
		
	</div>
</div>
<?php require('..\HTML\Fragment\Component_bottom_nav.php') ?>
