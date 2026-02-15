<?php
declare(strict_types=1);

$scriptName = (string)($_SERVER['SCRIPT_NAME'] ?? '/');
$basePath = rtrim(str_replace('\\', '/', dirname($scriptName)), '/');
if ($basePath === '/' || $basePath === '.') {
  $basePath = '';
}
?>
<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sirket Haber Takip</title>
  <link rel="stylesheet" href="<?= htmlspecialchars($basePath . '/assets/style.css', ENT_QUOTES, 'UTF-8') ?>">
</head>
<body>
  <main class="container">
    <h1>Sirket Haber Takip</h1>
    <p class="sub">Google News RSS ile keyword bazli yeni haber takibi</p>

    <section class="card">
      <div class="tabs">
        <button id="mainTabNews" type="button" class="tab active">Google News</button>
        <button id="mainTabKap" type="button" class="tab">KAP Scraping</button>
      </div>
    </section>

    <div id="newsPanel">
      <section class="card">
        <label for="keywords">Keywordler (her satira bir tane)</label>
        <textarea id="keywords" rows="6" placeholder="Aselsan&#10;TUPRAS&#10;Microsoft"></textarea>

        <div class="row">
          <div>
            <label for="interval">Kontrol suresi (saniye)</label>
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

        <div class="actions">
          <button id="startBtn" type="button">Takibi Baslat</button>
          <button id="stopBtn" type="button" disabled>Duraklat</button>
          <button id="clearSeenBtn" type="button" class="secondary">Gorulenleri Sifirla</button>
        </div>

        <p id="status" class="status">Hazir</p>
      </section>

      <section class="card">
        <h2>Son Haberler</h2>
        <div class="tabs">
          <button id="tabUnread" type="button" class="tab active">Okunmamis</button>
          <button id="tabRead" type="button" class="tab">Okunan</button>
          <button id="markAllReadBtn" type="button" class="secondary">Tumunu Okundu Yap</button>
        </div>
        <ul id="newsList" class="news-list"></ul>
      </section>

      <section class="card">
        <div class="tabs">
          <h2>Google/DeepSeek Log</h2>
          <button id="scanAiBacklogBtn" type="button" class="secondary">AI Backlog Tara</button>
          <button id="clearAiLogsBtn" type="button" class="secondary">Log Temizle</button>
        </div>
        <ul id="aiLogsList" class="news-list"></ul>
      </section>
    </div>

    <div id="kapPanel" class="hidden">
      <section class="card">
        <label for="kapLinkInput">KAP link ekle</label>
        <div class="kap-add-grid">
          <input id="kapLinkInput" type="text" placeholder="https://www.kap.org.tr/tr/sirket-bildirimleri/4028e4a1413b7ef5014144f83882011f">
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
        <p class="sub">Her link icin dakika araligi ve tarih filtresi belirleyebilirsiniz.</p>
        <ul id="kapJobsList" class="news-list"></ul>
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
          <button id="kapStartBtn" type="button">Rastgele Takibi Baslat</button>
          <button id="kapStopBtn" type="button" disabled>Takibi Durdur</button>
          <button id="kapFetchBtn" type="button">Apply (Tum Bildirimler)</button>
          <button id="kapClearBtn" type="button" class="secondary">Listeyi Temizle</button>
        </div>

        <p id="kapStatus" class="status">Hazir</p>
      </section>

      <section class="card">
        <h2>KAP Sonuclari</h2>
        <div class="tabs">
          <button id="kapTabUnread" type="button" class="tab active">Okunmamis</button>
          <button id="kapTabRead" type="button" class="tab">Okunan</button>
          <button id="kapMarkAllReadBtn" type="button" class="secondary">Tumunu Okundu Yap</button>
        </div>
        <ul id="kapList" class="news-list"></ul>
      </section>

      <section class="card">
        <div class="tabs">
          <h2>KAP Log</h2>
          <button id="kapClearLogsBtn" type="button" class="secondary">Log Temizle</button>
        </div>
        <ul id="kapLogsList" class="news-list"></ul>
      </section>
    </div>
  </main>

  <script src="<?= htmlspecialchars($basePath . '/assets/app.js', ENT_QUOTES, 'UTF-8') ?>"></script>
</body>
</html>
