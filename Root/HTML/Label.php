<?php
declare(strict_types=1);

header('X-Content-Type-Options: nosniff');

function label_param(string $name, int $maxLen, bool $required = true): string {
	$value = $_GET[$name] ?? '';
	if(!is_string($value)) $value = '';
	$value = preg_replace('/[\x00-\x1F\x7F]/u', ' ', $value) ?? '';
	$value = trim(preg_replace('/\s+/u', ' ', $value) ?? '');
	if(mb_strlen($value, 'UTF-8') > $maxLen) {
		$value = mb_substr($value, 0, $maxLen, 'UTF-8');
	}
	if($required && $value === '') {
		http_response_code(400);
		header('Content-Type: text/plain; charset=UTF-8');
		echo 'Missing required label parameter: '.$name;
		exit;
	}
	return $value;
}

$payload = [
	'title' => label_param('title', 80, false),
	'slug' => 'dynamic-label',
	'variant' => 'minimalist',
	'section' => label_param('section', 64, true),
	'address1' => label_param('address1', 80, true),
	'address2' => label_param('address2', 96, true),
];

$code = label_param('code', 120, false);
if($code === '') {
	$url = label_param('url', 200, false);
	if($url !== '') {
		$path = parse_url($url, PHP_URL_PATH);
		$path = is_string($path) ? trim($path, '/') : '';
		$code = $path;
	}
}
if($code === '') {
	http_response_code(400);
	header('Content-Type: text/plain; charset=UTF-8');
	echo 'Missing required label parameter: code (or url with code path).';
	exit;
}
$payload['code'] = $code;

$repo_root = dirname(__DIR__, 3);
$renderer = $repo_root.'/tools/label-generator/render-label.mjs';

$mode = 'svg';
$format = strtolower((string)($_GET['format'] ?? 'svg'));
$download = (string)($_GET['download'] ?? '');
if($format === 'png' || $download === 'png') $mode = 'png';

$cmd = 'node '.escapeshellarg($renderer).' '.escapeshellarg($mode).' '.escapeshellarg(json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

$descriptor = [
	0 => ['pipe', 'r'],
	1 => ['pipe', 'w'],
	2 => ['pipe', 'w'],
];
$proc = proc_open($cmd, $descriptor, $pipes, $repo_root);
if(!is_resource($proc)) {
	http_response_code(500);
	header('Content-Type: text/plain; charset=UTF-8');
	echo 'Failed to start label renderer.';
	exit;
}

fclose($pipes[0]);
$output = stream_get_contents($pipes[1]);
$error = stream_get_contents($pipes[2]);
fclose($pipes[1]);
fclose($pipes[2]);
$status = proc_close($proc);

if($status !== 0 || $output === false || $output === '') {
	http_response_code(500);
	header('Content-Type: text/plain; charset=UTF-8');
	echo "Label renderer failed.\n";
	if($error) echo $error;
	exit;
}

if($mode === 'png') {
	header('Content-Type: image/png');
	if((string)($_GET['download'] ?? '') === '1') {
		header('Content-Disposition: attachment; filename="label.png"');
	}
	echo $output;
	exit;
}

header('Content-Type: image/svg+xml; charset=UTF-8');
if((string)($_GET['download'] ?? '') === '1') {
	header('Content-Disposition: attachment; filename="label.svg"');
}
echo $output;
