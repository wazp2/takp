<?php
declare(strict_types=1);

$scriptName = (string)($_SERVER['SCRIPT_NAME'] ?? '/');
$basePath = rtrim(str_replace('\\', '/', dirname($scriptName)), '/');
if ($basePath === '/' || $basePath === '.') {
  $basePath = '';
}
$cssPath = __DIR__ . '/assets/style.css';
$jsPath = __DIR__ . '/assets/app.js';
$inlineCss = is_file($cssPath) ? (string)file_get_contents($cssPath) : '';
$inlineJs = is_file($jsPath) ? (string)file_get_contents($jsPath) : '';
?>
<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sirket Haber Takip</title>
  <meta name="theme-color" content="#0b6bcb">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="Sirket Haber Takip">
  <link rel="icon" type="image/png" href="<?= htmlspecialchars($basePath . '/icons/websiteicon.png', ENT_QUOTES, 'UTF-8') ?>">
  <link rel="apple-touch-icon" href="<?= htmlspecialchars($basePath . '/icons/icon-192.png', ENT_QUOTES, 'UTF-8') ?>">
  <link rel="manifest" href="<?= htmlspecialchars($basePath . '/site.webmanifest', ENT_QUOTES, 'UTF-8') ?>">
  <?php if ($inlineCss !== ''): ?>
  <style><?= $inlineCss ?></style>
  <?php endif; ?>
</head>
<body>
  <main class="container dashboard">
    <aside class="sidebar card">
      <h1>Sirket Haber Takip</h1>
      <p class="sub">AI destekli finansal haber takip paneli</p>

      <div class="section">
        <label>Keywordler</label>
        <div id="keywordTags" class="keyword-tags"></div>
        <div class="inline-row">
          <input id="addKeywordInput" type="text" placeholder="Yeni keyword ekle">
          <button id="addKeywordBtn" type="button">Ekle</button>
        </div>
        <textarea id="keywords" class="hidden" rows="6"></textarea>
      </div>

      <div class="section">
        <label for="bannedWords">Banned Words</label>
        <textarea id="bannedWords" rows="4" placeholder="vietnam&#10;gayrimenkul&#10;konser"></textarea>
      </div>

      <div class="section">
        <label>Kaynak</label>
        <div class="source-toggle">
          <button id="mainTabNews" type="button" class="tab active">Google News</button>
          <button id="mainTabKap" type="button" class="tab">KAP</button>
        </div>
      </div>

      <div class="section">
        <label>Filtreler</label>
        <div class="row">
          <div>
            <label for="interval">Yenileme (sn)</label>
            <input id="interval" type="number" min="30" value="120">
          </div>
          <div>
            <label for="lang">Dil</label>
            <input id="lang" type="text" value="tr">
          </div>
          <div>
            <label for="country">Ulke</label>
            <input id="country" type="text" value="TR">
          </div>
        </div>
        <label class="switch-row">
          <input id="autoRefreshToggle" type="checkbox" checked>
          <span>Otomatik yenile</span>
        </label>
      </div>

      <details class="section details-block">
        <summary>KAP Ayarlari</summary>
        <label for="kapLinkInput">KAP link ekle</label>
        <div class="kap-add-grid">
          <input id="kapLinkInput" type="text" placeholder="https://www.kap.org.tr/tr/sirket-bildirimleri/...">
          <input id="kapMinInput" type="number" min="1" value="2" title="Min dakika">
          <input id="kapMaxInput" type="number" min="1" value="5" title="Max dakika">
          <select id="kapRangeInput">
            <option value="0">Bugun</option>
            <option value="1">Dun</option>
            <option value="30" selected>Son 1 ay</option>
            <option value="365">Son 1 yil</option>
          </select>
          <button id="kapAddJobBtn" type="button">Ekle</button>
        </div>
        <ul id="kapJobsList" class="news-list compact"></ul>
        <textarea id="kapLinks" class="hidden" rows="2"></textarea>
        <div class="row">
          <div>
            <label for="kapDateRange">Varsayilan tarih filtresi</label>
            <select id="kapDateRange">
              <option value="0">Bugun</option>
              <option value="1">Dun</option>
              <option value="30">Son 1 ay</option>
              <option value="365" selected>Son 1 yil</option>
            </select>
          </div>
          <div></div>
          <div></div>
        </div>
        <div class="actions">
          <button id="kapStartBtn" type="button">Takibi Baslat</button>
          <button id="kapStopBtn" type="button">Takibi Durdur</button>
          <button id="kapFetchBtn" type="button" class="secondary">Manuel Cek</button>
          <button id="kapClearBtn" type="button" class="secondary">Temizle</button>
        </div>
      </details>

      <div class="actions">
        <button id="clearSeenBtn" type="button" class="secondary">Okuma Hafizasini Sifirla</button>
        <button id="installAppBtn" type="button" class="secondary hidden">Uygulamayi Yukle</button>
      </div>
      <p id="status" class="status">Hazir</p>
      <p id="kapStatus" class="status">Hazir</p>
    </aside>

    <section class="main-content">
      <div class="card toolbar-card">
        <div class="toolbar">
          <input id="feedSearchInput" type="text" placeholder="Haberde ara (baslik, kaynak, keyword)">
          <div class="toolbar-right">
            <button id="tabUnread" type="button" class="tab active">Okunmamis</button>
            <button id="tabRead" type="button" class="tab">Tum Kayitlar</button>
            <span id="unreadCountBadge" class="pill">Okunmamis: 0</span>
            <button id="refreshNowBtn" type="button" class="secondary">Yenile</button>
            <button id="markAllReadBtn" type="button" class="secondary">Tumunu Okundu Yap</button>
            <button id="kapMarkAllReadBtn" type="button" class="secondary hidden">KAP Tumunu Okundu</button>
          </div>
        </div>
        <p id="nextPollCountdown" class="status-line">Sonraki sorgu: 00:00</p>
      </div>

      <section class="card summary-card">
        <h2>Bugunun Piyasa Ozeti</h2>
        <ul id="dailySummaryList" class="summary-list"></ul>
      </section>

      <div id="newsPanel">
        <section class="card">
          <div id="newsList" class="group-list"></div>
        </section>

        <details id="newsLogsCard" class="card details-block">
          <summary>Google/DeepSeek Log</summary>
          <div class="tabs">
            <button id="scanAiBacklogBtn" type="button" class="secondary">AI Backlog Tara</button>
            <button id="clearAiLogsBtn" type="button" class="secondary">Log Temizle</button>
          </div>
          <ul id="aiLogsList" class="news-list"></ul>
        </details>
      </div>

      <div id="kapPanel" class="hidden">
        <section class="card">
          <div id="kapList" class="group-list"></div>
        </section>

        <details id="kapLogsCard" class="card details-block">
          <summary>KAP Log</summary>
          <div class="tabs">
            <button id="kapClearLogsBtn" type="button" class="secondary">Log Temizle</button>
          </div>
          <ul id="kapLogsList" class="news-list"></ul>
        </details>
      </div>
    </section>
  </main>

  <script>
    window.__BASE_PATH__ = <?= json_encode($basePath, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
  </script>
  <?php if ($inlineJs !== ''): ?>
  <script><?= $inlineJs ?></script>
  <?php endif; ?>
</body>
</html>
