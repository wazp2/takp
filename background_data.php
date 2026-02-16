<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respondBg(int $status, array $data): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function loadJsonBg(string $path): array {
    if (!is_file($path)) return [];
    $raw = @file_get_contents($path);
    if (!is_string($raw) || $raw === '') return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

$dir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
$news = loadJsonBg($dir . DIRECTORY_SEPARATOR . 'background_news.json');
$kap = loadJsonBg($dir . DIRECTORY_SEPARATOR . 'background_kap.json');

respondBg(200, [
    'ok' => true,
    'news' => [
        'lastRunAt' => (int)($news['lastRunAt'] ?? 0),
        'items' => array_values(is_array($news['items'] ?? null) ? $news['items'] : []),
        'logs' => array_values(is_array($news['logs'] ?? null) ? $news['logs'] : []),
    ],
    'kap' => [
        'lastRunAt' => (int)($kap['lastRunAt'] ?? 0),
        'items' => array_values(is_array($kap['items'] ?? null) ? $kap['items'] : []),
        'jobsState' => is_array($kap['jobsState'] ?? null) ? $kap['jobsState'] : [],
        'logs' => array_values(is_array($kap['logs'] ?? null) ? $kap['logs'] : []),
    ],
]);

