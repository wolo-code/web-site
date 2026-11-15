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
	if($title === '') $title = 'untitled';
	$variant = (string)($label['variant'] ?? 'minimalist');
	return $slug.'-'.$title.'-'.$variant;
}

function label_dynamic_url($label) {
	$params = [];
	$title = trim((string)($label['title'] ?? ''));
	if($title !== '') $params['title'] = $title;
	$params['section'] = (string)($label['section'] ?? '');
	$params['address1'] = (string)($label['address1'] ?? '');
	$params['address2'] = (string)($label['address2'] ?? '');
	$params['code'] = (string)($label['code'] ?? '');
	return '/label?'.http_build_query($params);
}

function label_code_words($label) {
	$code = trim((string)($label['code'] ?? ''));
	if($code === '') {
		$source = (string)($label['url'] ?? '');
		$path = (string)parse_url($source, PHP_URL_PATH);
		$code = trim($path, '/');
	}
	$code = strtolower(preg_replace('/[^a-z0-9.\-\s]/', '', $code) ?? '');
	$code = preg_replace('/\s+/', '', $code) ?? '';
	$parts = array_values(array_filter(explode('.', $code), static fn($item) => $item !== ''));
	if(count($parts) >= 3) {
		return implode(' ', array_slice($parts, -3));
	}
	return trim(str_replace('.', ' ', $code));
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
		$section = htmlspecialchars($label['section'] ?? '', ENT_QUOTES, 'UTF-8');
		$address1 = htmlspecialchars($label['address1'] ?? '', ENT_QUOTES, 'UTF-8');
		$url = htmlspecialchars($label['url'] ?? '', ENT_QUOTES, 'UTF-8');
		$address2 = htmlspecialchars($label['address2'] ?? '', ENT_QUOTES, 'UTF-8');
		$code_words = htmlspecialchars(label_code_words($label), ENT_QUOTES, 'UTF-8');
		$live_label_url = htmlspecialchars(label_dynamic_url($label), ENT_QUOTES, 'UTF-8');
		$asset_stem = htmlspecialchars(label_asset_stem($label), ENT_QUOTES, 'UTF-8');
		$code = trim($section.' '.$code_words);
	?>
	<section class='label-card' id='<?php echo $slug ?>'>
		<h2 class='label-title'>
			<a class='content-link' href='#<?php echo $slug ?>'>#<?php echo $slug ?></a> <span class='label-title-name'><?php echo $title ?></span>
		</h2>
		<div class='label-image-wrap'>
			<img
				class='label-image'
				src='/labels/<?php echo $asset_stem ?>.png'
				alt='Minimalist Wolo label for <?php echo ($title ?: 'untitled sample') ?>: <?php echo $code ?> at <?php echo $address2 ?>'
				loading='lazy'
			>
		</div>
		<div class='label-meta'>
			<p><strong>Title:</strong> <?php echo ($title !== '' ? $title : '(none)') ?></p>
			<p><strong>Variant:</strong> <?php echo $variant ?></p>
			<p><strong>Section:</strong> <?php echo $section ?></p>
			<p><strong>Wolo words:</strong> <?php echo $code_words ?></p>
			<p><strong>Address line 1:</strong> <?php echo $address1 ?></p>
			<p><strong>Address line 2:</strong> <?php echo $address2 ?></p>
			<p><strong>Live code URL:</strong> <a class='content-link' href='<?php echo $url ?>'><?php echo $url ?></a></p>
			<p><strong>Dynamic label URL:</strong> <a class='content-link' href='<?php echo $live_label_url ?>'><?php echo $live_label_url ?></a></p>
		</div>
	</section>
	<?php endforeach; ?>
</div>
<?php require('../HTML/Fragment/Component_bottom_nav.php') ?>
