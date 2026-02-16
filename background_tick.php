<?php
declare(strict_types=1);

require_once __DIR__ . '/env_loader.php';

header('Content-Type: application/json; charset=utf-8');

function respondTick(int $status, array $data): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function envTick(string $key, array $envFile, string $default = ''): string {
    $v = getenv($key);
    if (is_string($v) && $v !== '') return $v;
    if (isset($_ENV[$key]) && is_string($_ENV[$key]) && $_ENV[$key] !== '') return (string)$_ENV[$key];
    if (isset($_SERVER[$key]) && is_string($_SERVER[$key]) && $_SERVER[$key] !== '') return (string)$_SERVER[$key];
    if (isset($envFile[$key]) && is_string($envFile[$key]) && $envFile[$key] !== '') return (string)$envFile[$key];
    return $default;
}

function sendTelegramTick(string $token, string $chatId, string $text): bool {
    if ($token === '' || $chatId === '' || $text === '') return false;
    $url = 'https://api.telegram.org/bot' . rawurlencode($token) . '/sendMessage';
    $payload = http_build_query([
        'chat_id' => $chatId,
        'text' => $text,
        'disable_web_page_preview' => 'true',
    ]);
    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'timeout' => 15,
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => $payload,
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
        ],
    ]);
    $resp = @file_get_contents($url, false, $ctx);
    return is_string($resp) && $resp !== '';
}

function ensureDataDirTick(): string {
    $dir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
    if (!is_dir($dir)) {
        @mkdir($dir, 0777, true);
    }
    return $dir;
}

function loadJsonFileTick(string $path): array {
    if (!is_file($path)) return [];
    $raw = @file_get_contents($path);
    if (!is_string($raw) || $raw === '') return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function saveJsonFileTick(string $path, array $data): void {
    $payload = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if (!is_string($payload)) return;
    @file_put_contents($path, $payload, LOCK_EX);
}

function appendLogTick(array &$logs, string $message, string $level = 'info'): void {
    array_unshift($logs, [
        'ts' => time(),
        'level' => $level,
        'message' => $message,
    ]);
    if (count($logs) > 300) {
        $logs = array_slice($logs, 0, 300);
    }
}

function parseKeywordsTick(string $raw): array {
    $parts = preg_split('/[\r\n,]+/', $raw) ?: [];
    $out = [];
    $seen = [];
    foreach ($parts as $part) {
        $k = trim($part);
        if ($k === '') continue;
        $key = mb_strtolower($k);
        if (isset($seen[$key])) continue;
        $seen[$key] = true;
        $out[] = $k;
        if (count($out) >= 20) break;
    }
    return $out;
}

function buildRssUrlTick(string $keyword, string $lang, string $country): string {
    $q = rawurlencode($keyword);
    return "https://news.google.com/rss/search?q={$q}&hl={$lang}&gl={$country}&ceid={$country}:{$lang}";
}

function fetchUrlTick(string $url, int $timeout = 20): ?string {
    $ctx = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => $timeout,
            'header' => "User-Agent: Mozilla/5.0\r\nAccept-Language: tr\r\n",
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
        ],
    ]);
    $raw = @file_get_contents($url, false, $ctx);
    return is_string($raw) ? $raw : null;
}

function extractMemberOidTick(string $url): ?string {
    if (preg_match('#/sirket-bildirimleri/([a-f0-9]{32})#i', $url, $m) === 1) return strtolower($m[1]);
    if (preg_match('#([a-f0-9]{32})#i', $url, $m) === 1) return strtolower($m[1]);
    return null;
}

function randomMinutesTick(int $min, int $max): int {
    if ($min >= $max) return $min;
    return random_int($min, $max);
}

function runNewsTick(array $config, string $dataDir, array $pushCfg): array {
    $path = $dataDir . DIRECTORY_SEPARATOR . 'background_news.json';
    $state = loadJsonFileTick($path);
    $logs = is_array($state['logs'] ?? null) ? $state['logs'] : [];
    $seen = [];
    foreach ((array)($state['seenIds'] ?? []) as $id) {
        $seen[(string)$id] = true;
    }
    $oldItems = is_array($state['items'] ?? null) ? $state['items'] : [];

    $keywords = parseKeywordsTick((string)($config['keywords'] ?? ''));
    $lang = preg_replace('/[^a-z]/i', '', strtolower((string)($config['lang'] ?? 'tr'))) ?: 'tr';
    $country = preg_replace('/[^a-z]/i', '', strtoupper((string)($config['country'] ?? 'TR'))) ?: 'TR';

    if (count($keywords) === 0) {
        appendLogTick($logs, 'News tick atlandi: keyword yok.', 'warn');
        $state['logs'] = $logs;
        $state['lastRunAt'] = time();
        saveJsonFileTick($path, $state);
        return ['newCount' => 0, 'total' => count($oldItems), 'checkedKeywords' => 0];
    }

    $all = [];
    $newCount = 0;
    $newItems = [];
    $minTs = time() - (3 * 24 * 60 * 60);
    $checkedKeywords = 0;
    foreach ($keywords as $keyword) {
        $checkedKeywords++;
        $xml = fetchUrlTick(buildRssUrlTick($keyword, $lang, $country), 15);
        if ($xml === null) {
            appendLogTick($logs, "RSS alinamadi: {$keyword}", 'error');
            continue;
        }
        $feed = @simplexml_load_string($xml);
        if ($feed === false || !isset($feed->channel->item)) {
            appendLogTick($logs, "RSS parse edilemedi: {$keyword}", 'error');
            continue;
        }
        $count = 0;
        foreach ($feed->channel->item as $item) {
            if ($count >= 30) break;
            $title = trim((string)$item->title);
            $link = trim((string)$item->link);
            $guid = trim((string)$item->guid);
            $pubDate = trim((string)$item->pubDate);
            if ($guid === '') $guid = $link;
            if ($guid === '') continue;
            $pubTs = strtotime($pubDate) ?: 0;
            if ($pubTs <= 0 || $pubTs < $minTs) continue;
            $id = hash('sha256', $keyword . '|' . $guid);
            $row = [
                'id' => $id,
                'guid' => $guid,
                'keyword' => $keyword,
                'title' => $title,
                'link' => $link,
                'pubDate' => $pubDate,
                'pubTs' => $pubTs,
            ];
            $all[] = $row;
            if (!isset($seen[$id])) {
                $seen[$id] = true;
                $newCount++;
                $newItems[] = $row;
            }
            $count++;
        }
    }

    usort($all, static function (array $a, array $b): int {
        return ((int)$b['pubTs']) <=> ((int)$a['pubTs']);
    });
    $dedup = [];
    $seenIds = [];
    foreach ($all as $item) {
        if (isset($seenIds[$item['id']])) continue;
        $seenIds[$item['id']] = true;
        $dedup[] = $item;
        if (count($dedup) >= 300) break;
    }

    appendLogTick($logs, "News tick tamamlandi. Keyword: {$checkedKeywords}, yeni: {$newCount}, cekilen: " . count($dedup), 'info');
    if ($newCount > 0 && ($pushCfg['telegramToken'] ?? '') !== '' && ($pushCfg['telegramChatId'] ?? '') !== '') {
        $first = $newItems[0] ?? null;
        if (is_array($first)) {
            $msg = "[Google News] Yeni haber: {$newCount}\n";
            $msg .= ($first['keyword'] ?? '') . " - " . ($first['title'] ?? 'Yeni haber') . "\n";
            $msg .= (string)($first['link'] ?? '');
            sendTelegramTick((string)$pushCfg['telegramToken'], (string)$pushCfg['telegramChatId'], trim($msg));
        }
    }

    $state = [
        'lastRunAt' => time(),
        'items' => $dedup,
        'seenIds' => array_keys($seen),
        'logs' => $logs,
    ];
    saveJsonFileTick($path, $state);
    return ['newCount' => $newCount, 'total' => count($dedup), 'checkedKeywords' => $checkedKeywords];
}

function runKapTick(array $config, string $dataDir, array $pushCfg): array {
    $path = $dataDir . DIRECTORY_SEPARATOR . 'background_kap.json';
    $state = loadJsonFileTick($path);
    $logs = is_array($state['logs'] ?? null) ? $state['logs'] : [];
    $items = is_array($state['items'] ?? null) ? $state['items'] : [];
    $seen = [];
    foreach ((array)($state['seenIds'] ?? []) as $id) {
        $seen[(string)$id] = true;
    }
    $jobsState = is_array($state['jobsState'] ?? null) ? $state['jobsState'] : [];

    $jobs = is_array($config['kapJobs'] ?? null) ? $config['kapJobs'] : [];
    if (count($jobs) === 0) {
        appendLogTick($logs, 'KAP tick atlandi: job yok.', 'warn');
        $state['logs'] = $logs;
        $state['lastRunAt'] = time();
        saveJsonFileTick($path, $state);
        return ['newCount' => 0, 'total' => count($items), 'checkedJobs' => 0];
    }

    $now = time();
    $byId = [];
    foreach ($items as $it) {
        if (!is_array($it) || !isset($it['id'])) continue;
        $byId[(string)$it['id']] = $it;
    }

    $newCount = 0;
    $checkedJobs = 0;
    $pendingJobs = 0;
    $newItems = [];

    foreach ($jobs as $job) {
        if (!is_array($job)) continue;
        $url = trim((string)($job['url'] ?? ''));
        $id = trim((string)($job['id'] ?? ''));
        if ($url === '' || $id === '') continue;

        $min = max(1, (int)($job['minMinutes'] ?? 2));
        $max = max($min, (int)($job['maxMinutes'] ?? 5));
        $range = (int)($job['range'] ?? 30);
        if (!in_array($range, [0, 1, 30, 365], true)) $range = 30;

        $js = is_array($jobsState[$id] ?? null) ? $jobsState[$id] : [];
        $nextRunAt = (int)($js['nextRunAt'] ?? 0);
        if ($nextRunAt > 0 && $now < $nextRunAt) {
            $pendingJobs++;
            continue;
        }

        $oid = extractMemberOidTick($url);
        if ($oid === null) {
            appendLogTick($logs, "KAP OID bulunamadi: {$url}", 'error');
            $jobsState[$id] = [
                'lastCheckedAt' => $now,
                'nextRunAt' => $now + (randomMinutesTick($min, $max) * 60),
            ];
            continue;
        }

        $apiUrl = "https://www.kap.org.tr/tr/api/company-detail/sgbf-data/{$oid}/ALL/{$range}";
        $raw = fetchUrlTick($apiUrl, 20);
        if ($raw === null) {
            appendLogTick($logs, "KAP API hatasi: {$url}", 'error');
            $jobsState[$id] = [
                'lastCheckedAt' => $now,
                'nextRunAt' => $now + (randomMinutesTick($min, $max) * 60),
            ];
            continue;
        }

        $rows = json_decode($raw, true);
        if (!is_array($rows)) {
            appendLogTick($logs, "KAP JSON parse hatasi: {$url}", 'error');
            $jobsState[$id] = [
                'lastCheckedAt' => $now,
                'nextRunAt' => $now + (randomMinutesTick($min, $max) * 60),
            ];
            continue;
        }

        $checkedJobs++;
        $jobNew = 0;
        foreach ($rows as $row) {
            if (!is_array($row)) continue;
            $basic = isset($row['disclosureBasic']) && is_array($row['disclosureBasic']) ? $row['disclosureBasic'] : [];
            $index = (string)($basic['disclosureIndex'] ?? '');
            if ($index === '') continue;
            $publishDate = (string)($basic['publishDate'] ?? '');
            $itemId = hash('sha256', $oid . '|' . $index);
            $entry = [
                'id' => $itemId,
                'oid' => $oid,
                'sourceLink' => $url,
                'disclosureIndex' => $index,
                'title' => (string)($basic['title'] ?? ''),
                'summary' => (string)($basic['summary'] ?? ''),
                'companyTitle' => (string)($basic['companyTitle'] ?? ''),
                'stockCode' => (string)($basic['stockCode'] ?? ''),
                'type' => (string)($basic['disclosureClass'] ?? ''),
                'publishDate' => $publishDate,
                'publishTs' => strtotime($publishDate) ?: 0,
                'link' => "https://www.kap.org.tr/tr/Bildirim/{$index}",
            ];
            $byId[$itemId] = $entry;
            if (!isset($seen[$itemId])) {
                $seen[$itemId] = true;
                $newCount++;
                $jobNew++;
                $newItems[] = $entry;
            }
        }

        $nextMinutes = randomMinutesTick($min, $max);
        $jobsState[$id] = [
            'lastCheckedAt' => $now,
            'nextRunAt' => $now + ($nextMinutes * 60),
        ];
        appendLogTick($logs, "KAP tick: {$url} | yeni: {$jobNew} | sonraki: {$nextMinutes} dk", 'info');
    }

    $items = array_values($byId);
    usort($items, static function (array $a, array $b): int {
        return ((int)$b['publishTs']) <=> ((int)$a['publishTs']);
    });
    if (count($items) > 500) {
        $items = array_slice($items, 0, 500);
    }
    appendLogTick($logs, "KAP tick tamamlandi. Job: " . count($jobs) . ", calisan: {$checkedJobs}, bekleyen: {$pendingJobs}, yeni: {$newCount}, toplam: " . count($items), 'info');
    if ($newCount > 0 && ($pushCfg['telegramToken'] ?? '') !== '' && ($pushCfg['telegramChatId'] ?? '') !== '') {
        $first = $newItems[0] ?? null;
        if (is_array($first)) {
            $msg = "[KAP] Yeni bildirim: {$newCount}\n";
            $msg .= ($first['stockCode'] ?? '') . " - " . ($first['title'] ?? 'Yeni bildirim') . "\n";
            $msg .= (string)($first['link'] ?? '');
            sendTelegramTick((string)$pushCfg['telegramToken'], (string)$pushCfg['telegramChatId'], trim($msg));
        }
    }

    $state = [
        'lastRunAt' => $now,
        'items' => $items,
        'seenIds' => array_keys($seen),
        'jobsState' => $jobsState,
        'logs' => $logs,
    ];
    saveJsonFileTick($path, $state);
    return ['newCount' => $newCount, 'total' => count($items), 'checkedJobs' => $checkedJobs, 'pendingJobs' => $pendingJobs];
}

$envFile = loadEnvFile(__DIR__ . DIRECTORY_SEPARATOR . '.env');
$tokenEnv = envTick('CRON_TOKEN', $envFile, '');
$tokenReq = (string)($_GET['token'] ?? '');
if ($tokenEnv !== '' && !hash_equals($tokenEnv, $tokenReq)) {
    respondTick(401, ['ok' => false, 'error' => 'Unauthorized']);
}

$pushCfg = [
    'telegramToken' => envTick('TELEGRAM_BOT_TOKEN', $envFile, ''),
    'telegramChatId' => envTick('TELEGRAM_CHAT_ID', $envFile, ''),
];

$dataDir = ensureDataDirTick();
$config = loadJsonFileTick($dataDir . DIRECTORY_SEPARATOR . 'server_config.json');
if (!is_array($config)) $config = [];

$newsResult = runNewsTick($config, $dataDir, $pushCfg);
$kapResult = runKapTick($config, $dataDir, $pushCfg);

respondTick(200, [
    'ok' => true,
    'ts' => time(),
    'news' => $newsResult,
    'kap' => $kapResult,
]);
