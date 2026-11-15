<?php
$labels_path = dirname(__DIR__, 3).'/Config/Labels.json';
$labels_raw = file_get_contents($labels_path);
$labels = json_decode($labels_raw, true);
if(!is_array($labels)) $labels = [];
?>
<div id='message'>
	<p class='labels-intro'>
		Print-ready sample Wolo labels. Each block includes the code words, the traditional address, and the live code URL.
	</p>
	<?php foreach($labels as $label):
		$slug = htmlspecialchars($label['slug'] ?? '', ENT_QUOTES, 'UTF-8');
		$region = htmlspecialchars($label['region'] ?? '', ENT_QUOTES, 'UTF-8');
		$words = htmlspecialchars($label['words'] ?? '', ENT_QUOTES, 'UTF-8');
		$url = htmlspecialchars($label['url'] ?? '', ENT_QUOTES, 'UTF-8');
		$address = htmlspecialchars($label['address'] ?? '', ENT_QUOTES, 'UTF-8');
		$code = trim($region.' '.$words);
	?>
	<section class='label-card' id='<?php echo $slug ?>'>
		<h2 class='label-title'>
			<a class='content-link' href='#<?php echo $slug ?>'>#<?php echo $slug ?></a>
		</h2>
		<div class='label-image-wrap'>
			<img
				class='label-image'
				src='/labels/<?php echo $slug ?>.png'
				alt='Wolo label for <?php echo $code ?> at <?php echo $address ?>'
				loading='lazy'
			>
		</div>
		<div class='label-meta'>
			<p><strong>Code:</strong> <?php echo $code ?></p>
			<p><strong>Traditional address:</strong> <?php echo $address ?></p>
			<p><strong>Live code URL:</strong> <a class='content-link' href='<?php echo $url ?>'><?php echo $url ?></a></p>
		</div>
	</section>
	<?php endforeach; ?>
</div>
<?php require('../HTML/Fragment/Component_bottom_nav.php') ?>
