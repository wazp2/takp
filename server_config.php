<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respondCfg(int $status, array $data): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function readJsonCfg(): array {
    $raw = file_get_contents('php://input');
    if (!is_string($raw) || trim($raw) === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function ensureDataDir(): string {
    $dir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
    if (!is_dir($dir)) {
        @mkdir($dir, 0777, true);
    }
    return $dir;
}

function configPath(): string {
    return ensureDataDir() . DIRECTORY_SEPARATOR . 'server_config.json';
}

function loadConfig(): array {
    $path = configPath();
    if (!is_file($path)) {
        return [];
    }
    $raw = @file_get_contents($path);
    if (!is_string($raw) || $raw === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function saveConfig(array $config): bool {
    $path = configPath();
    $payload = json_encode($config, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if (!is_string($payload)) {
        return false;
    }
    return @file_put_contents($path, $payload, LOCK_EX) !== false;
}

function sanitizeKeywords(string $raw): string {
    $parts = preg_split('/[\r\n,]+/', $raw) ?: [];
    $out = [];
    $seen = [];
    foreach ($parts as $part) {
        $k = trim($part);
        if ($k === '' || mb_strlen($k) > 100) {
            continue;
        }
        $key = mb_strtolower($k);
        if (isset($seen[$key])) {
            continue;
        }
        $seen[$key] = true;
        $out[] = $k;
        if (count($out) >= 20) {
            break;
        }
    }
    return implode("\n", $out);
}

function sanitizeBannedWords(string $raw): string {
    $parts = preg_split('/[\r\n,]+/', $raw) ?: [];
    $out = [];
    $seen = [];
    foreach ($parts as $part) {
        $k = trim(mb_strtolower($part));
        if ($k === '' || mb_strlen($k) > 100) {
            continue;
        }
        if (isset($seen[$k])) {
            continue;
        }
        $seen[$k] = true;
        $out[] = $k;
        if (count($out) >= 200) {
            break;
        }
    }
    return implode("\n", $out);
}

function sanitizeJobs(array $jobs): array {
    $out = [];
    foreach ($jobs as $job) {
        if (!is_array($job)) {
            continue;
        }
        $url = trim((string)($job['url'] ?? ''));
        if ($url === '') {
            continue;
        }
        $min = (int)($job['minMinutes'] ?? 2);
        $max = (int)($job['maxMinutes'] ?? 5);
        if ($min < 1) {
            $min = 1;
        }
        if ($max < 1) {
            $max = $min;
        }
        if ($min > $max) {
            $tmp = $min;
            $min = $max;
            $max = $tmp;
        }
        $range = (int)($job['range'] ?? 30);
        if (!in_array($range, [0, 1, 30, 365], true)) {
            $range = 30;
        }
        $id = trim((string)($job['id'] ?? ''));
        if ($id === '') {
            $id = hash('sha256', $url . '|' . $min . '|' . $max . '|' . $range);
        }
        $out[] = [
            'id' => $id,
            'url' => $url,
            'minMinutes' => $min,
            'maxMinutes' => $max,
            'range' => $range,
        ];
        if (count($out) >= 100) {
            break;
        }
    }
    return $out;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    respondCfg(200, ['ok' => true, 'config' => loadConfig()]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondCfg(405, ['ok' => false, 'error' => 'Method not allowed']);
}

$input = readJsonCfg();
$config = [
    'keywords' => sanitizeKeywords((string)($input['keywords'] ?? '')),
    'bannedWords' => sanitizeBannedWords((string)($input['bannedWords'] ?? '')),
    'lang' => preg_replace('/[^a-z]/i', '', strtolower((string)($input['lang'] ?? 'tr'))) ?: 'tr',
    'country' => preg_replace('/[^a-z]/i', '', strtoupper((string)($input['country'] ?? 'TR'))) ?: 'TR',
    'interval' => max(30, (int)($input['interval'] ?? 120)),
    'kapDateRange' => in_array((int)($input['kapDateRange'] ?? 30), [0, 1, 30, 365], true) ? (int)$input['kapDateRange'] : 30,
    'kapJobs' => sanitizeJobs(is_array($input['kapJobs'] ?? null) ? $input['kapJobs'] : []),
    'updatedAt' => time(),
];

if (!saveConfig($config)) {
    respondCfg(500, ['ok' => false, 'error' => 'Config kaydedilemedi.']);
}

respondCfg(200, ['ok' => true, 'config' => $config]);
