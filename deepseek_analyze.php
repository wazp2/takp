<?php
declare(strict_types=1);

require_once __DIR__ . '/env_loader.php';

header('Content-Type: application/json; charset=utf-8');

function respondDs(int $status, array $data): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function readJsonInputDs(): array {
    $raw = file_get_contents('php://input');
    if (!is_string($raw) || trim($raw) === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function logDeepseek(array $entry): void {
    $dir = __DIR__ . DIRECTORY_SEPARATOR . 'logs';
    if (!is_dir($dir)) {
        @mkdir($dir, 0777, true);
    }
    $line = json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (!is_string($line)) {
        return;
    }
    @file_put_contents($dir . DIRECTORY_SEPARATOR . 'deepseek_news.log', $line . PHP_EOL, FILE_APPEND);
}

function cleanJsonContent(string $content): string {
    $content = trim($content);
    if (str_starts_with($content, '```')) {
        $content = preg_replace('/^```[a-zA-Z]*\s*/', '', $content) ?? $content;
        $content = preg_replace('/```$/', '', $content) ?? $content;
    }
    return trim($content);
}

function validatePayload(array $obj): array {
    $allowed = ['VERY_IMPORTANT', 'IMPORTANT', 'NOT_IMPORTANT'];
    $lvl = strtoupper((string)($obj['notification_level'] ?? 'NOT_IMPORTANT'));
    if (!in_array($lvl, $allowed, true)) {
        $lvl = 'NOT_IMPORTANT';
    }
    $sendPush = ($lvl === 'VERY_IMPORTANT');

    return [
        'notification_level' => $lvl,
        'send_push' => $sendPush,
        'summary' => (string)($obj['summary'] ?? ''),
        'market_impact' => [
            'short_term' => (string)($obj['market_impact']['short_term'] ?? 'neutral'),
            'mid_term' => (string)($obj['market_impact']['mid_term'] ?? 'neutral'),
        ],
        'impact_reasoning' => array_values(array_map('strval', is_array($obj['impact_reasoning'] ?? null) ? $obj['impact_reasoning'] : [])),
        'retail_investor_view' => [
            'position_effect' => (string)($obj['retail_investor_view']['position_effect'] ?? 'neutral'),
            'explanation' => (string)($obj['retail_investor_view']['explanation'] ?? ''),
        ],
        'risk_factors' => array_values(array_map('strval', is_array($obj['risk_factors'] ?? null) ? $obj['risk_factors'] : [])),
    ];
}

$env = loadEnvFile(__DIR__ . DIRECTORY_SEPARATOR . '.env');
$apiKey = (string)($env['DEEPSEEK_API_KEY'] ?? '');
$model = (string)($env['DEEPSEEK_MODEL'] ?? 'deepseek-chat');

if ($apiKey === '') {
    respondDs(500, ['ok' => false, 'error' => 'DEEPSEEK_API_KEY bulunamadi (.env).']);
}

$input = readJsonInputDs();
$title = trim((string)($input['title'] ?? ''));
$keyword = trim((string)($input['keyword'] ?? ''));
$link = trim((string)($input['link'] ?? ''));
$pubDate = trim((string)($input['pubDate'] ?? ''));

if ($title === '' && $link === '') {
    respondDs(400, ['ok' => false, 'error' => 'Analiz icin title veya link gerekli.']);
}

$prompt = <<<PROMPT
You are an experienced retail-market focused financial analyst AI.
You do NOT give investment advice.
You analyze company news strictly from market-impact perspective.

User will provide a company news article.

Your job:

1. Evaluate impact on stock price potential.
2. Classify importance level.
3. Estimate short and medium term effects.
4. Explain reasoning clearly but concisely.
5. Think like a cautious professional portfolio analyst.

Use following importance enum ONLY:

VERY_IMPORTANT
IMPORTANT
NOT_IMPORTANT

Return STRICT JSON ONLY.
NO extra text.

JSON schema:

{
  "notification_level": "VERY_IMPORTANT | IMPORTANT | NOT_IMPORTANT",
  "send_push": true | false,
  "summary": "brief 1–2 sentence explanation",
  "market_impact": {
      "short_term": "positive | negative | neutral",
      "mid_term": "positive | negative | neutral"
  },
  "impact_reasoning": [
      "reason 1",
      "reason 2"
  ],
  "retail_investor_view": {
      "position_effect": "strengthens | weakens | neutral",
      "explanation": "short rationale"
  },
  "risk_factors": [
      "risk 1",
      "risk 2"
  ]
}

Rules:

- VERY_IMPORTANT → send_push must be true
- IMPORTANT → send_push false
- NOT_IMPORTANT → send_push false

Evaluation criteria:

• Revenue / profit / cash flow impact
• Balance sheet changes
• Competitive advantage shift
• Macro sensitivity
• Does this change company narrative or is routine
• Retail investor positioning impact

Be conservative.
Avoid hype.
No speculation.
Professional tone.
PROMPT;

$newsPayload = [
    'keyword' => $keyword,
    'title' => $title,
    'link' => $link,
    'pubDate' => $pubDate,
];

$payload = [
    'model' => $model,
    'temperature' => 0.1,
    'messages' => [
        ['role' => 'system', 'content' => $prompt],
        ['role' => 'user', 'content' => json_encode($newsPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)],
    ],
];

$ch = curl_init('https://api.deepseek.com/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json',
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
$resp = curl_exec($ch);
$curlErr = curl_error($ch);
$httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if (!is_string($resp) || $resp === '') {
    logDeepseek([
        'ts' => time(),
        'ok' => false,
        'step' => 'http',
        'error' => $curlErr !== '' ? $curlErr : 'empty_response',
        'title' => $title,
        'keyword' => $keyword,
    ]);
    respondDs(502, ['ok' => false, 'error' => 'DeepSeek bos yanit dondu.']);
}

$decoded = json_decode($resp, true);
if (!is_array($decoded)) {
    logDeepseek([
        'ts' => time(),
        'ok' => false,
        'step' => 'json_decode',
        'httpCode' => $httpCode,
        'title' => $title,
        'keyword' => $keyword,
    ]);
    respondDs(502, ['ok' => false, 'error' => 'DeepSeek yaniti parse edilemedi.']);
}

$content = (string)($decoded['choices'][0]['message']['content'] ?? '');
$content = cleanJsonContent($content);
$obj = json_decode($content, true);
if (!is_array($obj)) {
    logDeepseek([
        'ts' => time(),
        'ok' => false,
        'step' => 'content_json_parse',
        'httpCode' => $httpCode,
        'content' => mb_substr($content, 0, 600),
        'title' => $title,
        'keyword' => $keyword,
    ]);
    respondDs(502, ['ok' => false, 'error' => 'DeepSeek content JSON parse hatasi.']);
}

$result = validatePayload($obj);
logDeepseek([
    'ts' => time(),
    'ok' => true,
    'notification_level' => $result['notification_level'],
    'send_push' => $result['send_push'],
    'title' => $title,
    'keyword' => $keyword,
    'link' => $link,
]);

respondDs(200, [
    'ok' => true,
    'analysis' => $result,
]);
