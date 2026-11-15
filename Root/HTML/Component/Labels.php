<?php
$labels_path = dirname(__DIR__, 3).'/Config/Labels.json';
$labels_raw = file_get_contents($labels_path);
$labels = json_decode($labels_raw, true);
if(!is_array($labels)) $labels = [];

function label_slugify($value) {
	$value = strtolower(trim((string)$value));
	$value = preg_replace('/[^a-z0-9]+/', '-', $value);
	return trim($value ?? '', '-');
}

function label_asset_stem($label) {
	$slug = (string)($label['slug'] ?? '');
	$title = label_slugify((string)($label['title'] ?? ''));
	$variant = (string)($label['variant'] ?? 'minimalist');
	return $slug.'-'.$title.'-'.$variant;
}
?>
<div id='message'>
	<p class='labels-intro'>
		Print-ready sample Wolo labels (minimalist variant), data-driven from one list.
	</p>
	<?php foreach($labels as $label):
		$slug = htmlspecialchars($label['slug'] ?? '', ENT_QUOTES, 'UTF-8');
		$title = htmlspecialchars($label['title'] ?? '', ENT_QUOTES, 'UTF-8');
		$variant = htmlspecialchars($label['variant'] ?? 'minimalist', ENT_QUOTES, 'UTF-8');
		$region = htmlspecialchars($label['region'] ?? '', ENT_QUOTES, 'UTF-8');
		$words = htmlspecialchars($label['words'] ?? '', ENT_QUOTES, 'UTF-8');
		$url = htmlspecialchars($label['url'] ?? '', ENT_QUOTES, 'UTF-8');
		$address = htmlspecialchars($label['address'] ?? '', ENT_QUOTES, 'UTF-8');
		$asset_stem = htmlspecialchars(label_asset_stem($label), ENT_QUOTES, 'UTF-8');
		$code = trim($region.' '.$words);
	?>
	<section class='label-card' id='<?php echo $slug ?>'>
		<h2 class='label-title'>
			<a class='content-link' href='#<?php echo $slug ?>'>#<?php echo $slug ?></a> <span class='label-title-name'><?php echo $title ?></span>
		</h2>
		<div class='label-image-wrap'>
			<img
				class='label-image'
				src='/labels/<?php echo $asset_stem ?>.png'
				alt='Minimalist Wolo label for <?php echo $title ?>: <?php echo $code ?> at <?php echo $address ?>'
				loading='lazy'
			>
		</div>
		<div class='label-meta'>
			<p><strong>Title:</strong> <?php echo $title ?></p>
			<p><strong>Variant:</strong> <?php echo $variant ?></p>
			<p><strong>Code:</strong> <?php echo $code ?></p>
			<p><strong>Traditional address:</strong> <?php echo $address ?></p>
			<p><strong>Live code URL:</strong> <a class='content-link' href='<?php echo $url ?>'><?php echo $url ?></a></p>
		</div>
	</section>
	<?php endforeach; ?>
</div>
<?php require('../HTML/Fragment/Component_bottom_nav.php') ?>
