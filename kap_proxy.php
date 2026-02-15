<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(int $status, array $data): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function requestBody(): array {
    $raw = file_get_contents('php://input');
    if (!is_string($raw) || trim($raw) === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function extractLinks(string $raw): array {
    $parts = preg_split('/[\r\n]+/', $raw) ?: [];
    $unique = [];
    foreach ($parts as $part) {
        $link = trim($part);
        if ($link === '') {
            continue;
        }
        if (!isset($unique[$link])) {
            $unique[$link] = true;
        }
    }
    return array_keys($unique);
}

function extractMemberOid(string $url): ?string {
    if (preg_match('#/sirket-bildirimleri/([a-f0-9]{32})#i', $url, $m) === 1) {
        return strtolower($m[1]);
    }
    if (preg_match('#([a-f0-9]{32})#i', $url, $m) === 1) {
        return strtolower($m[1]);
    }
    return null;
}

function fetchKapData(string $oid, int $range): ?array {
    $url = "https://www.kap.org.tr/tr/api/company-detail/sgbf-data/{$oid}/ALL/{$range}";
    $ctx = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 20,
            'header' => "User-Agent: Mozilla/5.0\r\nAccept-Language: tr\r\n",
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
        ],
    ]);
    $raw = @file_get_contents($url, false, $ctx);
    if (!is_string($raw)) {
        return null;
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : null;
}

function parseDateTs(string $date): int {
    $dt = DateTime::createFromFormat('d.m.Y H:i:s', $date);
    if ($dt instanceof DateTime) {
        return $dt->getTimestamp();
    }
    $ts = strtotime($date);
    return $ts !== false ? $ts : 0;
}

$input = requestBody();
$rawLinks = (string)($input['links'] ?? $_POST['links'] ?? $_GET['links'] ?? '');
$range = (int)($input['range'] ?? $_POST['range'] ?? $_GET['range'] ?? 365);

$allowedRanges = [0, 1, 30, 365];
if (!in_array($range, $allowedRanges, true)) {
    $range = 365;
}

$links = extractLinks($rawLinks);
if (count($links) === 0) {
    respond(400, ['ok' => false, 'error' => 'En az bir KAP linki girin.']);
}
if (count($links) > 50) {
    respond(400, ['ok' => false, 'error' => 'En fazla 50 link girebilirsiniz.']);
}

$oids = [];
$errors = [];
foreach ($links as $link) {
    $oid = extractMemberOid($link);
    if ($oid === null) {
        $errors[] = "OID bulunamadi: {$link}";
        continue;
    }
    $oids[$oid] = $link;
}

if (count($oids) === 0) {
    respond(400, ['ok' => false, 'error' => 'Gecerli KAP sirket linki bulunamadi.', 'errors' => $errors]);
}

$all = [];
foreach ($oids as $oid => $sourceLink) {
    $rows = fetchKapData($oid, $range);
    if ($rows === null) {
        $errors[] = "KAP verisi alinamadi: {$oid}";
        continue;
    }

    foreach ($rows as $row) {
        if (!is_array($row)) {
            continue;
        }
        $basic = isset($row['disclosureBasic']) && is_array($row['disclosureBasic']) ? $row['disclosureBasic'] : [];
        $index = (string)($basic['disclosureIndex'] ?? '');
        if ($index === '') {
            continue;
        }
        $publishDate = (string)($basic['publishDate'] ?? '');
        $all[] = [
            'id' => hash('sha256', $oid . '|' . $index),
            'oid' => $oid,
            'sourceLink' => $sourceLink,
            'disclosureIndex' => $index,
            'title' => (string)($basic['title'] ?? ''),
            'summary' => (string)($basic['summary'] ?? ''),
            'companyTitle' => (string)($basic['companyTitle'] ?? ''),
            'stockCode' => (string)($basic['stockCode'] ?? ''),
            'type' => (string)($basic['disclosureClass'] ?? ''),
            'publishDate' => $publishDate,
            'publishTs' => parseDateTs($publishDate),
            'link' => "https://www.kap.org.tr/tr/Bildirim/{$index}",
        ];
    }
}

usort($all, static function (array $a, array $b): int {
    return $b['publishTs'] <=> $a['publishTs'];
});

$dedup = [];
$seen = [];
foreach ($all as $item) {
    if (isset($seen[$item['id']])) {
        continue;
    }
    $seen[$item['id']] = true;
    $dedup[] = $item;
}

respond(200, [
    'ok' => true,
    'count' => count($dedup),
    'items' => array_slice($dedup, 0, 500),
    'errors' => $errors,
]);
