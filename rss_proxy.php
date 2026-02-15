<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(int $status, array $data): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function sanitizeKeywords(string $raw): array {
    $parts = preg_split('/[\r\n,]+/', $raw) ?: [];
    $keywords = [];
    foreach ($parts as $part) {
        $k = trim($part);
        if ($k === '') {
            continue;
        }
        if (mb_strlen($k) > 100) {
            continue;
        }
        $key = mb_strtolower($k);
        if (!isset($keywords[$key])) {
            $keywords[$key] = $k;
        }
    }
    return array_values($keywords);
}

function buildRssUrl(string $keyword, string $lang, string $country): string {
    $q = rawurlencode($keyword);
    return "https://news.google.com/rss/search?q={$q}&hl={$lang}&gl={$country}&ceid={$country}:{$lang}";
}

function fetchRss(string $url): ?string {
    $ctx = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 15,
            'header' => "User-Agent: Mozilla/5.0\r\n",
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
        ],
    ]);
    $xml = @file_get_contents($url, false, $ctx);
    return is_string($xml) ? $xml : null;
}

$rawKeywords = (string)($_GET['keywords'] ?? '');
$lang = strtolower(preg_replace('/[^a-z]/i', '', (string)($_GET['lang'] ?? 'tr')));
$country = strtoupper(preg_replace('/[^a-z]/i', '', (string)($_GET['country'] ?? 'TR')));

if ($lang === '') {
    $lang = 'tr';
}
if ($country === '') {
    $country = 'TR';
}

$keywords = sanitizeKeywords($rawKeywords);
if (count($keywords) === 0) {
    respond(400, ['ok' => false, 'error' => 'Keyword gerekli.']);
}
if (count($keywords) > 20) {
    respond(400, ['ok' => false, 'error' => 'En fazla 20 keyword girebilirsiniz.']);
}

$allItems = [];
$errors = [];
$minTs = time() - (3 * 24 * 60 * 60);

foreach ($keywords as $keyword) {
    $url = buildRssUrl($keyword, $lang, $country);
    $xml = fetchRss($url);
    if ($xml === null) {
        $errors[] = "RSS alinamadi: {$keyword}";
        continue;
    }

    $feed = @simplexml_load_string($xml);
    if ($feed === false || !isset($feed->channel->item)) {
        $errors[] = "RSS parse edilemedi: {$keyword}";
        continue;
    }

    $count = 0;
    foreach ($feed->channel->item as $item) {
        if ($count >= 30) {
            break;
        }
        $title = trim((string)$item->title);
        $link = trim((string)$item->link);
        $guid = trim((string)$item->guid);
        $pubDate = trim((string)$item->pubDate);
        if ($guid === '') {
            $guid = $link;
        }
        if ($guid === '') {
            continue;
        }

        $allItems[] = [
            'id' => hash('sha256', $keyword . '|' . $guid),
            'guid' => $guid,
            'keyword' => $keyword,
            'title' => $title,
            'link' => $link,
            'pubDate' => $pubDate,
            'pubTs' => strtotime($pubDate) ?: 0,
        ];
        $count++;
    }
}

$allItems = array_values(array_filter($allItems, static function (array $item) use ($minTs): bool {
    $ts = (int)($item['pubTs'] ?? 0);
    return $ts > 0 && $ts >= $minTs;
}));

usort($allItems, static function (array $a, array $b): int {
    return $b['pubTs'] <=> $a['pubTs'];
});

$dedup = [];
$seen = [];
foreach ($allItems as $item) {
    if (isset($seen[$item['id']])) {
        continue;
    }
    $seen[$item['id']] = true;
    $dedup[] = $item;
}

respond(200, [
    'ok' => true,
    'count' => count($dedup),
    'items' => array_slice($dedup, 0, 200),
    'errors' => $errors,
]);
