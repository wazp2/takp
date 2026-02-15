const STORAGE_KEYS = {
  config: "newsTrackerConfigV1",
  seen: "newsTrackerSeenIdsV1",
  read: "newsTrackerReadIdsV1",
  feedCache: "newsTrackerFeedCacheV1",
  runtime: "newsTrackerRuntimeV1",
  kapCache: "kapTrackerCacheV1",
  kapSeen: "kapSeenIdsV1",
  kapRead: "kapReadIdsV1",
  kapJobState: "kapJobStateV1",
  kapLogs: "kapLogsV1",
  aiLogs: "aiLogsV1",
  aiSeen: "aiSeenV1",
  aiLevels: "aiLevelsV1",
};

const el = {
  keywords: document.getElementById("keywords"),
  interval: document.getElementById("interval"),
  lang: document.getElementById("lang"),
  country: document.getElementById("country"),
  startBtn: document.getElementById("startBtn"),
  stopBtn: document.getElementById("stopBtn"),
  clearSeenBtn: document.getElementById("clearSeenBtn"),
  status: document.getElementById("status"),
  newsList: document.getElementById("newsList"),
  aiLogsList: document.getElementById("aiLogsList"),
  scanAiBacklogBtn: document.getElementById("scanAiBacklogBtn"),
  clearAiLogsBtn: document.getElementById("clearAiLogsBtn"),
  tabUnread: document.getElementById("tabUnread"),
  tabRead: document.getElementById("tabRead"),
  markAllReadBtn: document.getElementById("markAllReadBtn"),
  mainTabNews: document.getElementById("mainTabNews"),
  mainTabKap: document.getElementById("mainTabKap"),
  newsPanel: document.getElementById("newsPanel"),
  kapPanel: document.getElementById("kapPanel"),
  kapLinks: document.getElementById("kapLinks"),
  kapLinkInput: document.getElementById("kapLinkInput"),
  kapMinInput: document.getElementById("kapMinInput"),
  kapMaxInput: document.getElementById("kapMaxInput"),
  kapRangeInput: document.getElementById("kapRangeInput"),
  kapAddJobBtn: document.getElementById("kapAddJobBtn"),
  kapJobsList: document.getElementById("kapJobsList"),
  kapDateRange: document.getElementById("kapDateRange"),
  kapStartBtn: document.getElementById("kapStartBtn"),
  kapStopBtn: document.getElementById("kapStopBtn"),
  kapFetchBtn: document.getElementById("kapFetchBtn"),
  kapClearBtn: document.getElementById("kapClearBtn"),
  kapStatus: document.getElementById("kapStatus"),
  kapList: document.getElementById("kapList"),
  kapTabUnread: document.getElementById("kapTabUnread"),
  kapTabRead: document.getElementById("kapTabRead"),
  kapMarkAllReadBtn: document.getElementById("kapMarkAllReadBtn"),
  kapClearLogsBtn: document.getElementById("kapClearLogsBtn"),
  kapLogsList: document.getElementById("kapLogsList"),
};

let pollTimer = null;
let firstRun = true;
let activeTab = "unread";
let latestItems = [];
let lastFetchedAt = 0;
let aiLogs = [];
let activeMainTab = "news";
let kapItems = [];
let kapRunning = false;
let kapStarting = false;
let kapJobTimers = {};
let kapJobState = {};
let kapJobs = [];
let kapActiveTab = "unread";
let kapLogs = [];

function formatDateTime(ts) {
  if (!ts) return "-";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}:${mi}:${ss}`;
}

function setStatus(text, isError = false) {
  el.status.textContent = text;
  el.status.classList.toggle("error", isError);
}

function loadConfig() {
  const raw = localStorage.getItem(STORAGE_KEYS.config);
  if (!raw) return;
  try {
    const cfg = JSON.parse(raw);
    if (cfg.keywords) el.keywords.value = cfg.keywords;
    if (cfg.interval !== undefined) el.interval.value = String(cfg.interval);
    if (cfg.lang) el.lang.value = cfg.lang;
    if (cfg.country) el.country.value = cfg.country;
    if (cfg.kapLinks && el.kapLinks) el.kapLinks.value = cfg.kapLinks;
    if (Array.isArray(cfg.kapJobs)) {
      kapJobs = cfg.kapJobs;
    }
    if (cfg.kapDateRange !== undefined && el.kapDateRange) el.kapDateRange.value = String(cfg.kapDateRange);
  } catch (_) {
    // ignore broken local state
  }
}

function saveConfig() {
  const cfg = {
    keywords: el.keywords.value.trim(),
    interval: Number(el.interval.value || 120),
    lang: (el.lang.value || "tr").trim(),
    country: (el.country.value || "TR").trim(),
    kapLinks: el.kapLinks ? el.kapLinks.value.trim() : "",
    kapJobs,
    kapDateRange: el.kapDateRange ? Number(el.kapDateRange.value || 365) : 365,
  };
  localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(cfg));
}

function getSet(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.map(String));
  } catch (_) {
    return new Set();
  }
}

function saveSet(key, setObj) {
  localStorage.setItem(key, JSON.stringify(Array.from(setObj)));
}

function loadAiLogs() {
  const raw = localStorage.getItem(STORAGE_KEYS.aiLogs);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (_) {
    return [];
  }
}

function saveAiLogs() {
  localStorage.setItem(STORAGE_KEYS.aiLogs, JSON.stringify(aiLogs));
}

function renderAiLogs() {
  if (!el.aiLogsList) return;
  el.aiLogsList.innerHTML = "";
  if (!aiLogs.length) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "AI log kaydi yok.";
    el.aiLogsList.appendChild(li);
    return;
  }
  for (const row of aiLogs.slice(0, 150)) {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="meta">
        <span>${escapeHtml(formatDateTime(row.ts || 0))}</span>
        <span>${escapeHtml(row.level || "INFO")}</span>
        <span>${escapeHtml(row.keyword || "")}</span>
        <span>${escapeHtml(row.notification_level || "-")}</span>
      </div>
      <div>${escapeHtml(row.title || "")}</div>
      <div>${escapeHtml(row.summary || row.message || "")}</div>
    `;
    el.aiLogsList.appendChild(li);
  }
}

function appendAiLog(entry) {
  aiLogs.unshift({
    ts: Date.now(),
    level: entry.level || "INFO",
    keyword: entry.keyword || "",
    title: entry.title || "",
    notification_level: entry.notification_level || "",
    summary: entry.summary || "",
    message: entry.message || "",
  });
  if (aiLogs.length > 500) {
    aiLogs = aiLogs.slice(0, 500);
  }
  saveAiLogs();
  renderAiLogs();
}

function loadKapJobState() {
  const raw = localStorage.getItem(STORAGE_KEYS.kapJobState);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed;
  } catch (_) {
    return {};
  }
}

function saveKapJobState() {
  localStorage.setItem(STORAGE_KEYS.kapJobState, JSON.stringify(kapJobState));
}

function loadKapLogs() {
  const raw = localStorage.getItem(STORAGE_KEYS.kapLogs);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (_) {
    return [];
  }
}

function saveKapLogs() {
  localStorage.setItem(STORAGE_KEYS.kapLogs, JSON.stringify(kapLogs));
}

function loadFeedCache() {
  const raw = localStorage.getItem(STORAGE_KEYS.feedCache);
  if (!raw) return;
  try {
    const cache = JSON.parse(raw);
    if (Array.isArray(cache.items)) {
      latestItems = cache.items;
    }
    if (typeof cache.fetchedAt === "number") {
      lastFetchedAt = cache.fetchedAt;
    }
  } catch (_) {
    // ignore broken cache
  }
}

function saveFeedCache(items) {
  lastFetchedAt = Date.now();
  localStorage.setItem(
    STORAGE_KEYS.feedCache,
    JSON.stringify({
      fetchedAt: lastFetchedAt,
      items,
    })
  );
}

function loadRuntime() {
  const raw = localStorage.getItem(STORAGE_KEYS.runtime);
  if (!raw) return { newsRunning: false, kapRunning: false };
  try {
    const rt = JSON.parse(raw);
    // Backward compatibility: old format {running:boolean}
    if (typeof rt.running === "boolean" && rt.newsRunning === undefined) {
      return { newsRunning: Boolean(rt.running), kapRunning: false };
    }
    return {
      newsRunning: Boolean(rt.newsRunning),
      kapRunning: Boolean(rt.kapRunning),
    };
  } catch (_) {
    return { newsRunning: false, kapRunning: false };
  }
}

function saveRuntimePatch(patch) {
  const prev = loadRuntime();
  const next = { ...prev, ...patch };
  localStorage.setItem(STORAGE_KEYS.runtime, JSON.stringify(next));
}

function setKapStatus(text, isError = false) {
  if (!el.kapStatus) return;
  el.kapStatus.textContent = text;
  el.kapStatus.classList.toggle("error", isError);
}

function appendKapLog(entry) {
  kapLogs.unshift({
    ts: Date.now(),
    level: entry.level || "info",
    url: entry.url || "-",
    message: entry.message || "",
    newCount: Number(entry.newCount || 0),
    fetchedCount: Number(entry.fetchedCount || 0),
    totalSaved: Number(entry.totalSaved || kapItems.length),
  });
  if (kapLogs.length > 300) {
    kapLogs = kapLogs.slice(0, 300);
  }
  saveKapLogs();
  renderKapLogs();
}

function renderKapLogs() {
  if (!el.kapLogsList) return;
  el.kapLogsList.innerHTML = "";
  if (!kapLogs.length) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "Henuz log yok.";
    el.kapLogsList.appendChild(li);
    return;
  }

  for (const log of kapLogs.slice(0, 120)) {
    const li = document.createElement("li");
    const levelText = log.level === "error" ? "HATA" : "OK";
    li.innerHTML = `
      <div class="meta">
        <span>${escapeHtml(formatDateTime(log.ts))}</span>
        <span>${escapeHtml(levelText)}</span>
        <span>yeni: ${escapeHtml(String(log.newCount))}</span>
        <span>cekilen: ${escapeHtml(String(log.fetchedCount))}</span>
        <span>kayitli-toplam: ${escapeHtml(String(log.totalSaved))}</span>
      </div>
      <div>${escapeHtml(log.url)}</div>
      <div>${escapeHtml(log.message)}</div>
    `;
    el.kapLogsList.appendChild(li);
  }
}

function setMainTab(tab) {
  activeMainTab = tab;
  if (!el.mainTabNews || !el.mainTabKap || !el.newsPanel || !el.kapPanel) return;
  el.mainTabNews.classList.toggle("active", tab === "news");
  el.mainTabKap.classList.toggle("active", tab === "kap");
  el.newsPanel.classList.toggle("hidden", tab !== "news");
  el.kapPanel.classList.toggle("hidden", tab !== "kap");
}

function normalizeKapJob(job) {
  const url = String(job.url || "").trim();
  let minMinutes = Number(job.minMinutes ?? 1);
  let maxMinutes = Number(job.maxMinutes ?? minMinutes);
  let range = Number(job.range ?? 365);
  if (!Number.isFinite(minMinutes) || minMinutes < 1) minMinutes = 1;
  if (!Number.isFinite(maxMinutes) || maxMinutes < 1) maxMinutes = minMinutes;
  if (minMinutes > maxMinutes) {
    const tmp = minMinutes;
    minMinutes = maxMinutes;
    maxMinutes = tmp;
  }
  if (![0, 1, 30, 365].includes(range)) {
    range = Number(el.kapDateRange ? el.kapDateRange.value || 365 : 365);
  }
  return {
    id: `${url}|${minMinutes}|${maxMinutes}|${range}`,
    url,
    minMinutes,
    maxMinutes,
    range,
  };
}

function syncHiddenKapText() {
  if (!el.kapLinks) return;
  el.kapLinks.value = kapJobs.map((j) => `${j.url}|${j.minMinutes}|${j.maxMinutes}|${j.range}`).join("\n");
}

function renderKapJobs() {
  if (!el.kapJobsList) return;
  el.kapJobsList.innerHTML = "";
  if (kapJobs.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "Henuz KAP takip linki eklenmedi.";
    el.kapJobsList.appendChild(li);
    syncHiddenKapText();
    return;
  }

  for (const job of kapJobs) {
    const state = kapJobState[job.id] || {};
    const lastChecked = formatDateTime(state.lastCheckedAt || 0);
    const nextRun = formatDateTime(state.nextRunAt || 0);
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="job-row">
        <a href="${escapeHtml(job.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(job.url)}</a>
        <span class="job-pill">${job.minMinutes}-${job.maxMinutes} dk</span>
        <span class="job-pill">range: ${job.range}</span>
        <span class="job-pill">son sorgu: ${escapeHtml(lastChecked)}</span>
        <span class="job-pill">sonraki: ${escapeHtml(nextRun)}</span>
        <button type="button" class="secondary kap-job-remove" data-id="${escapeHtml(job.id)}">Sil</button>
      </div>
    `;
    el.kapJobsList.appendChild(li);
  }
  syncHiddenKapText();
}

function parseKapLegacyLinesToJobs() {
  if (!el.kapLinks) return [];
  const lines = el.kapLinks.value
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
  const jobs = [];
  for (const line of lines) {
    const parts = line.split("|").map((x) => x.trim());
    const url = parts[0] || "";
    if (!url) continue;
    const job = normalizeKapJob({
      url,
      minMinutes: Number(parts[1] || 2),
      maxMinutes: Number(parts[2] || parts[1] || 2),
      range: Number(parts[3] || (el.kapDateRange ? el.kapDateRange.value || 365 : 365)),
    });
    jobs.push(job);
  }
  return jobs;
}

function addKapJobFromForm() {
  if (!el.kapLinkInput || !el.kapMinInput || !el.kapMaxInput || !el.kapRangeInput) return;
  const url = el.kapLinkInput.value.trim();
  if (!url) {
    setKapStatus("Link bos olamaz.", true);
    return;
  }
  const job = normalizeKapJob({
    url,
    minMinutes: Number(el.kapMinInput.value || 2),
    maxMinutes: Number(el.kapMaxInput.value || 5),
    range: Number(el.kapRangeInput.value || 30),
  });
  if (kapJobs.some((x) => x.id === job.id)) {
    setKapStatus("Bu parametrelerle ayni kayit zaten var.", true);
    return;
  }
  kapJobs.push(job);
  renderKapJobs();
  saveConfig();
  setKapStatus("KAP linki eklendi.");
  el.kapLinkInput.value = "";
}

function loadKapCache() {
  const raw = localStorage.getItem(STORAGE_KEYS.kapCache);
  if (!raw) return;
  try {
    const cache = JSON.parse(raw);
    if (Array.isArray(cache.items)) {
      kapItems = cache.items;
    }
  } catch (_) {
    // ignore
  }
}

function saveKapCache(items) {
  localStorage.setItem(
    STORAGE_KEYS.kapCache,
    JSON.stringify({
      fetchedAt: Date.now(),
      items,
    })
  );
}

function setKapActiveTab(tab) {
  kapActiveTab = tab;
  if (el.kapTabUnread) el.kapTabUnread.classList.toggle("active", tab === "unread");
  if (el.kapTabRead) el.kapTabRead.classList.toggle("active", tab === "read");
  renderKapItems(kapItems);
}

function getKapVisibleItems(items, kapReadSet) {
  if (kapActiveTab === "read") {
    return items.filter((x) => kapReadSet.has(x.id));
  }
  return items.filter((x) => !kapReadSet.has(x.id));
}

function getKapUnreadItems() {
  const kapReadSet = getSet(STORAGE_KEYS.kapRead);
  return kapItems.filter((x) => !kapReadSet.has(x.id));
}

function sendKapUnreadReminder() {
  const unread = getKapUnreadItems();
  if (unread.length === 0) return;
  const top = unread[0];
  notify(
    `KAP okunmamis bildirim: ${unread.length}`,
    `${top.stockCode || ""} ${top.title || "Yeni bildirim"}`,
    top.link || ""
  );
}

function renderKapItems(items) {
  if (!el.kapList) return;
  el.kapList.innerHTML = "";
  const kapReadSet = getSet(STORAGE_KEYS.kapRead);
  const visible = getKapVisibleItems(items || [], kapReadSet);
  if (!visible || visible.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = kapActiveTab === "read" ? "Okunan KAP bildirimi yok." : "Okunmamis KAP bildirimi yok.";
    el.kapList.appendChild(li);
    return;
  }

  for (const item of visible) {
    const isRead = kapReadSet.has(item.id);
    const li = document.createElement("li");
    li.className = isRead ? "seen" : "new";
    li.innerHTML = `
      <a href="${escapeHtml(item.link || "#")}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title || "(Baslik yok)")}</a>
      <div class="meta">
        <span>${escapeHtml(item.stockCode || "")}</span>
        <span>${escapeHtml(item.companyTitle || "")}</span>
        <span>${escapeHtml(item.publishDate || "")}</span>
        <span>${escapeHtml(item.type || "")}</span>
      </div>
      <div>${escapeHtml(item.summary || "")}</div>
      <div class="item-actions">
        <button type="button" class="secondary kap-mark-read-btn" data-id="${escapeHtml(item.id)}">
          ${isRead ? "Okunmamis Yap" : "Okundu Isaretle"}
        </button>
      </div>
    `;
    el.kapList.appendChild(li);
  }
}

function markKapItemRead(id, markRead) {
  const kapReadSet = getSet(STORAGE_KEYS.kapRead);
  if (markRead) {
    kapReadSet.add(id);
  } else {
    kapReadSet.delete(id);
  }
  saveSet(STORAGE_KEYS.kapRead, kapReadSet);
  renderKapItems(kapItems);
}

function markAllKapRead() {
  const kapReadSet = getSet(STORAGE_KEYS.kapRead);
  for (const item of kapItems) {
    kapReadSet.add(item.id);
  }
  saveSet(STORAGE_KEYS.kapRead, kapReadSet);
  renderKapItems(kapItems);
}

function parseKapJobLines() {
  const errors = [];
  const jobs = kapJobs
    .map((j) => normalizeKapJob(j))
    .filter((j) => {
      if (!j.url) {
        errors.push("Bos URL kaydi atlandi.");
        return false;
      }
      return true;
    });
  return { jobs, errors };
}

function randomMinutes(min, max) {
  if (min === max) return min;
  const raw = min + Math.random() * (max - min);
  return Math.max(1, Math.round(raw));
}

function mergeKapItems(incoming) {
  const byId = new Map();
  for (const item of kapItems) {
    byId.set(item.id, item);
  }
  for (const item of incoming) {
    byId.set(item.id, item);
  }
  kapItems = Array.from(byId.values()).sort((a, b) => (b.publishTs || 0) - (a.publishTs || 0));
  saveKapCache(kapItems);
  renderKapItems(kapItems);
}

function setKapTrackingButtons() {
  if (el.kapStartBtn) el.kapStartBtn.disabled = kapRunning || kapStarting;
  if (el.kapStopBtn) el.kapStopBtn.disabled = !kapRunning || kapStarting;
}

async function requestKapForJob(job) {
  const response = await fetch("kap_proxy.php", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      links: job.url,
      range: job.range,
    }),
  });
  return response.json();
}

async function fetchKapForJob(job, mode = "manual") {
  let data;
  try {
    data = await requestKapForJob(job);
  } catch (err) {
    const checkedTs = Date.now();
    if (!kapJobState[job.id]) kapJobState[job.id] = { initialized: false };
    kapJobState[job.id].lastCheckedAt = checkedTs;
    saveKapJobState();
    renderKapJobs();
    appendKapLog({
      level: "error",
      url: job.url,
      message: `Istek hatasi: ${String(err)}`,
      newCount: 0,
      fetchedCount: 0,
      totalSaved: kapItems.length,
    });
    setKapStatus(`KAP istek hatasi: ${String(err)}`, true);
    return { ok: false, newCount: 0, total: 0 };
  }

  if (!data.ok) {
    const checkedTs = Date.now();
    if (!kapJobState[job.id]) kapJobState[job.id] = { initialized: false };
    kapJobState[job.id].lastCheckedAt = checkedTs;
    saveKapJobState();
    renderKapJobs();
    appendKapLog({
      level: "error",
      url: job.url,
      message: data.error || "KAP verisi alinamadi",
      newCount: 0,
      fetchedCount: 0,
      totalSaved: kapItems.length,
    });
    setKapStatus(data.error || "KAP verisi alinamadi", true);
    return { ok: false, newCount: 0, total: 0 };
  }

  const incoming = data.items || [];
  mergeKapItems(incoming);

  const kapSeen = getSet(STORAGE_KEYS.kapSeen);
  const state = kapJobState[job.id] || { initialized: false };
  let newCount = 0;
  let notifyCount = 0;
  let firstNew = null;
  for (const item of incoming) {
    if (kapSeen.has(item.id)) continue;
    newCount += 1;
    kapSeen.add(item.id);
    if (state.initialized && mode === "auto") {
      notifyCount += 1;
      if (!firstNew) firstNew = item;
    }
  }
  saveSet(STORAGE_KEYS.kapSeen, kapSeen);
  state.initialized = true;
  state.lastCheckedAt = Date.now();
  kapJobState[job.id] = state;
  saveKapJobState();
  renderKapJobs();

  if (notifyCount > 0 && firstNew) {
    notify(
      `KAP yeni bildirim (${notifyCount})`,
      `${firstNew.stockCode || ""} ${firstNew.title || "Yeni bildirim"}`,
      firstNew.link || ""
    );
  }

  appendKapLog({
    level: "info",
    url: job.url,
    message: `Sorgu tamamlandi (${mode}).`,
    newCount,
    fetchedCount: incoming.length,
    totalSaved: kapItems.length,
  });

  return { ok: true, newCount, total: incoming.length, errors: data.errors || [] };
}

function clearKapTimers() {
  for (const key of Object.keys(kapJobTimers)) {
    clearTimeout(kapJobTimers[key]);
  }
  kapJobTimers = {};
}

function scheduleKapJob(job) {
  if (!kapRunning) return;
  const delayMinutes = randomMinutes(job.minMinutes, job.maxMinutes);
  const delayMs = delayMinutes * 60 * 1000;
  if (!kapJobState[job.id]) kapJobState[job.id] = { initialized: false };
  kapJobState[job.id].nextRunAt = Date.now() + delayMs;
  saveKapJobState();
  renderKapJobs();
  appendKapLog({
    level: "info",
    url: job.url,
    message: `Sonraki sorgu planlandi: ${delayMinutes} dk sonra.`,
    newCount: 0,
    fetchedCount: 0,
    totalSaved: kapItems.length,
  });

  kapJobTimers[job.id] = setTimeout(async () => {
    if (!kapRunning) return;
    const result = await fetchKapForJob(job, "auto");
    sendKapUnreadReminder();
    const unreadCount = getKapUnreadItems().length;
    const warn = result.errors && result.errors.length ? ` | Uyarilar: ${result.errors.join(" ; ")}` : "";
    setKapStatus(`${job.url} icin kontrol tamamlandi. Yeni: ${result.newCount} | Okunmamis: ${unreadCount}.${warn}`);
    scheduleKapJob(job);
  }, delayMs);
}

async function fetchKapItems() {
  const { jobs, errors } = parseKapJobLines();
  if (jobs.length === 0) {
    setKapStatus("En az bir gecerli satir girin.", true);
    return;
  }

  saveConfig();
  setKapStatus("KAP verileri cekiliyor...");
  let total = 0;
  let newTotal = 0;
  const warnList = [...errors];
  for (const job of jobs) {
    const result = await fetchKapForJob(job, "manual");
    total += result.total;
    newTotal += result.newCount;
    if (result.errors && result.errors.length) {
      warnList.push(...result.errors);
    }
  }
  const unreadCount = getKapUnreadItems().length;
  const warn = warnList.length ? ` | Uyarilar: ${warnList.join(" ; ")}` : "";
  setKapStatus(`Manuel cekim tamamlandi. Islenen kayit: ${total} | Yeni: ${newTotal} | Okunmamis: ${unreadCount}${warn}`);
}

async function startKapRandomTracking(isRestore = false) {
  if (kapStarting) {
    setKapStatus("KAP rastgele takip baslatiliyor, lutfen bekleyin.");
    return;
  }
  if (kapRunning) {
    setKapStatus("KAP rastgele takip zaten aktif.");
    return;
  }

  const { jobs, errors } = parseKapJobLines();
  if (jobs.length === 0) {
    setKapStatus("Takip icin gecerli en az bir satir girin.", true);
    return;
  }

  kapStarting = true;
  setKapTrackingButtons();
  try {
    saveConfig();
    if (!isRestore) {
      await requestNotificationPermission();
    }

    kapRunning = true;
    saveRuntimePatch({ kapRunning: true });
    clearKapTimers();

    const warn = errors.length ? ` | Uyarilar: ${errors.join(" ; ")}` : "";
    setKapStatus(`KAP rastgele takip basladi. Job sayisi: ${jobs.length}${warn}`);
    appendKapLog({
      level: "info",
      url: "-",
      message: `Rastgele takip basladi. Job sayisi: ${jobs.length}`,
      newCount: 0,
      fetchedCount: 0,
      totalSaved: kapItems.length,
    });

    for (const job of jobs) {
      if (!kapJobState[job.id]) {
        kapJobState[job.id] = { initialized: false };
      }
      appendKapLog({
        level: "info",
        url: job.url,
        message: "Ilk sorgu hemen baslatildi.",
        newCount: 0,
        fetchedCount: 0,
        totalSaved: kapItems.length,
      });
      (async () => {
        if (!kapRunning) return;
        const mode = kapJobState[job.id].initialized ? "auto" : "initial";
        const result = await fetchKapForJob(job, mode);
        if (mode === "auto") {
          sendKapUnreadReminder();
        }
        const unreadCount = getKapUnreadItems().length;
        const warn2 = result.errors && result.errors.length ? ` | Uyarilar: ${result.errors.join(" ; ")}` : "";
        setKapStatus(`${job.url} icin kontrol tamamlandi. Yeni: ${result.newCount} | Okunmamis: ${unreadCount}.${warn2}`);
        scheduleKapJob(job);
      })();
    }
  } finally {
    kapStarting = false;
    setKapTrackingButtons();
  }
}

function stopKapRandomTracking() {
  kapRunning = false;
  saveRuntimePatch({ kapRunning: false });
  clearKapTimers();
  setKapTrackingButtons();
  setKapStatus("KAP rastgele takip durduruldu.");
}

function parseKeywords() {
  return el.keywords.value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    setStatus("Bu tarayici Notification API desteklemiyor.", true);
    return false;
  }
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const permission = await Notification.requestPermission();
  return permission === "granted";
}

function notify(title, body, onClickUrl = "") {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const n = new Notification(title, { body });
  if (onClickUrl) {
    n.onclick = () => window.open(onClickUrl, "_blank");
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function setActiveTab(tab) {
  activeTab = tab;
  el.tabUnread.classList.toggle("active", tab === "unread");
  el.tabRead.classList.toggle("active", tab === "read");
  renderItems(latestItems);
}

function getVisibleItems(items, readSet) {
  if (activeTab === "read") {
    return items.filter((i) => readSet.has(i.id));
  }
  return items.filter((i) => !readSet.has(i.id));
}

function renderItems(items) {
  const readSet = getSet(STORAGE_KEYS.read);
  const visible = getVisibleItems(items, readSet);
  el.newsList.innerHTML = "";

  if (visible.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = activeTab === "read" ? "Okunan haber yok." : "Okunmamis haber yok.";
    el.newsList.appendChild(li);
    return;
  }

  for (const item of visible) {
    const isRead = readSet.has(item.id);
    const li = document.createElement("li");
    li.className = isRead ? "seen" : "new";
    li.innerHTML = `
      <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title || "(Baslik yok)")}</a>
      <div class="meta">
        <span>${escapeHtml(item.keyword)}</span>
        <span>${escapeHtml(item.pubDate || "")}</span>
      </div>
      <div class="item-actions">
        <button type="button" class="secondary mark-read-btn" data-id="${escapeHtml(item.id)}">
          ${isRead ? "Okunmamis Yap" : "Okundu Isaretle"}
        </button>
      </div>
    `;
    el.newsList.appendChild(li);
  }
}

function markItemRead(id, markRead) {
  const readSet = getSet(STORAGE_KEYS.read);
  if (markRead) {
    readSet.add(id);
  } else {
    readSet.delete(id);
  }
  saveSet(STORAGE_KEYS.read, readSet);
  renderItems(latestItems);
}

function updateStatusCounts(errorsText = "") {
  const readSet = getSet(STORAGE_KEYS.read);
  const unreadCount = latestItems.filter((i) => !readSet.has(i.id)).length;
  const readCount = latestItems.length - unreadCount;
  setStatus(`Toplam: ${latestItems.length} | Okunmamis: ${unreadCount} | Okunan: ${readCount}${errorsText}`);
}

function sendUnreadReminder() {
  const readSet = getSet(STORAGE_KEYS.read);
  const unreadItems = latestItems.filter((i) => !readSet.has(i.id));
  if (unreadItems.length === 0) return;
  const top = unreadItems[0];
  notify(
    `Okunmamis haber: ${unreadItems.length}`,
    `${top.keyword}: ${top.title || "Yeni haber var"}`,
    top.link || ""
  );
}

function loadJsonObject(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed;
  } catch (_) {
    return {};
  }
}

function saveJsonObject(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeNotificationLevel(analysis) {
  const level = String(analysis?.notification_level || "").toUpperCase();
  if (level === "VERY_IMPORTANT" || level === "IMPORTANT" || level === "NOT_IMPORTANT") {
    return level;
  }
  if (analysis?.send_push === true) return "VERY_IMPORTANT";
  return "NOT_IMPORTANT";
}

function applyAiImportanceRule(item, level) {
  const readSet = getSet(STORAGE_KEYS.read);
  if (level === "NOT_IMPORTANT") {
    readSet.add(item.id);
  } else {
    readSet.delete(item.id);
  }
  saveSet(STORAGE_KEYS.read, readSet);
}

function sendVeryImportantUnreadReminder() {
  const levels = loadJsonObject(STORAGE_KEYS.aiLevels);
  const readSet = getSet(STORAGE_KEYS.read);
  const veryImportantUnread = latestItems.filter((item) => levels[item.id] === "VERY_IMPORTANT" && !readSet.has(item.id));
  if (veryImportantUnread.length === 0) return 0;
  const top = veryImportantUnread[0];
  notify(
    `Cok Onemli Okunmamis Haber: ${veryImportantUnread.length}`,
    `${top.keyword || ""}: ${top.title || "Cok onemli haber var"}`,
    top.link || ""
  );
  return veryImportantUnread.length;
}

async function analyzeNewsWithDeepseek(item) {
  try {
    const response = await fetch("deepseek_analyze.php", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        keyword: item.keyword || "",
        title: item.title || "",
        link: item.link || "",
        pubDate: item.pub_date || item.pubDate || "",
      }),
    });
    const data = await response.json();
    if (!data.ok || !data.analysis) {
      appendAiLog({
        level: "ERROR",
        keyword: item.keyword || "",
        title: item.title || "",
        message: data.error || "DeepSeek yaniti gecersiz",
      });
      return null;
    }

    const analysis = data.analysis;
    appendAiLog({
      level: "INFO",
      keyword: item.keyword || "",
      title: item.title || "",
      notification_level: analysis.notification_level || "",
      summary: analysis.summary || "",
    });
    return analysis;
  } catch (err) {
    appendAiLog({
      level: "ERROR",
      keyword: item.keyword || "",
      title: item.title || "",
      message: String(err),
    });
    return null;
  }
}

async function runAiAnalysisForQueue(queue, firstRunGate) {
  const aiSeenSet = getSet(STORAGE_KEYS.aiSeen);
  const aiLevels = loadJsonObject(STORAGE_KEYS.aiLevels);
  let importantPushCount = 0;
  let analyzedCount = 0;
  let autoReadCount = 0;
  let forcedUnreadCount = 0;

  for (const item of queue) {
    if (aiSeenSet.has(item.id)) continue;
    aiSeenSet.add(item.id);
    analyzedCount += 1;
    const analysis = await analyzeNewsWithDeepseek(item);
    if (!analysis) continue;
    const level = normalizeNotificationLevel(analysis);
    aiLevels[item.id] = level;
    const readSetBefore = getSet(STORAGE_KEYS.read);
    const wasRead = readSetBefore.has(item.id);
    applyAiImportanceRule(item, level);
    const readSetAfter = getSet(STORAGE_KEYS.read);
    const isReadNow = readSetAfter.has(item.id);
    if (!wasRead && isReadNow && level === "NOT_IMPORTANT") autoReadCount += 1;
    if (wasRead && !isReadNow && (level === "IMPORTANT" || level === "VERY_IMPORTANT")) forcedUnreadCount += 1;
    const isVeryImportant = level === "VERY_IMPORTANT";
    if (isVeryImportant && !firstRunGate) {
      importantPushCount += 1;
      notify(
        `Cok Onemli Haber: ${item.keyword}`,
        analysis.summary || item.title || item.link,
        item.link || ""
      );
    }
  }

  saveSet(STORAGE_KEYS.aiSeen, aiSeenSet);
  saveJsonObject(STORAGE_KEYS.aiLevels, aiLevels);
  renderItems(latestItems);
  return { analyzedCount, importantPushCount, autoReadCount, forcedUnreadCount };
}

async function scanAiBacklogNow() {
  const readSet = getSet(STORAGE_KEYS.read);
  const aiSeenSet = getSet(STORAGE_KEYS.aiSeen);
  const backlog = latestItems.filter((item) => !readSet.has(item.id) && !aiSeenSet.has(item.id));
  if (backlog.length === 0) {
    setStatus("AI backlog bos. Analiz edilmemis okunmamis haber yok.");
    return;
  }
  setStatus(`AI backlog taraniyor... (${backlog.length} kayit)`);
  const result = await runAiAnalysisForQueue(backlog, false);
  const veryCount = sendVeryImportantUnreadReminder();
  setStatus(
    `AI backlog tamamladi. Analiz: ${result.analyzedCount} | Push: ${result.importantPushCount} | Auto-okundu: ${result.autoReadCount} | Okunmamis zorla: ${result.forcedUnreadCount}${veryCount > 0 ? ` | Cok Onemli Okunmamis: ${veryCount}` : ""}`
  );
}

async function fetchNews() {
  const keywords = parseKeywords();
  const interval = Number(el.interval.value || 120);
  const lang = (el.lang.value || "tr").trim();
  const country = (el.country.value || "TR").trim();

  if (keywords.length === 0) {
    setStatus("En az bir keyword girin.", true);
    return;
  }
  if (interval < 30) {
    setStatus("Kontrol suresi en az 30 saniye olmali.", true);
    return;
  }

  saveConfig();
  setStatus("Haberler kontrol ediliyor...");

  const query = new URLSearchParams({
    keywords: keywords.join("\n"),
    lang,
    country,
  });

  let data;
  try {
    const response = await fetch(`rss_proxy.php?${query.toString()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    data = await response.json();
  } catch (err) {
    setStatus(`Istek hatasi: ${String(err)}`, true);
    return;
  }

  if (!data.ok) {
    setStatus(data.error || "Bilinmeyen hata", true);
    return;
  }

  const seenSet = getSet(STORAGE_KEYS.seen);
  let newCount = 0;
  const candidates = [];
  for (const item of data.items) {
    if (!seenSet.has(item.id)) {
      if (!firstRun) {
        newCount += 1;
        candidates.push(item);
      }
      seenSet.add(item.id);
    }
  }
  saveSet(STORAGE_KEYS.seen, seenSet);

  latestItems = data.items;
  saveFeedCache(latestItems);
  renderItems(latestItems);

  let importantPushCount = 0;
  {
    const readSet = getSet(STORAGE_KEYS.read);
    const aiSeenSet = getSet(STORAGE_KEYS.aiSeen);
    const backlog = latestItems.filter((item) => !readSet.has(item.id) && !aiSeenSet.has(item.id));
    const analyzeQueue = [];
    const picked = new Set();

    for (const item of candidates) {
      if (aiSeenSet.has(item.id)) continue;
      analyzeQueue.push(item);
      picked.add(item.id);
    }

    for (const item of backlog) {
      if (picked.has(item.id)) continue;
      analyzeQueue.push(item);
      picked.add(item.id);
      if (analyzeQueue.length >= 8) break;
    }

    const result = await runAiAnalysisForQueue(analyzeQueue, firstRun);
    importantPushCount += result.importantPushCount;
  }
  const veryImportantUnreadCount = sendVeryImportantUnreadReminder();

  const errText = data.errors && data.errors.length ? ` | Uyarilar: ${data.errors.join(" ; ")}` : "";
  firstRun = false;
  updateStatusCounts(
    `${newCount > 0 ? ` | Yeni: ${newCount}` : ""}${importantPushCount > 0 ? ` | AI Push: ${importantPushCount}` : ""}${veryImportantUnreadCount > 0 ? ` | Cok Onemli Okunmamis: ${veryImportantUnreadCount}` : ""}${errText}`
  );
}

function startPolling() {
  const interval = Number(el.interval.value || 120);
  if (interval < 30) {
    setStatus("Kontrol suresi en az 30 saniye olmali.", true);
    return;
  }
  stopPolling();
  firstRun = true;
  saveRuntimePatch({ newsRunning: true });

  const elapsed = Date.now() - lastFetchedAt;
  const intervalMs = interval * 1000;
  if (lastFetchedAt > 0 && elapsed < intervalMs) {
    const remaining = intervalMs - elapsed;
    setStatus(`Kayitli veriler yuklendi. ${Math.ceil(remaining / 1000)} sn sonra yeni kontrol.`);
    pollTimer = setTimeout(() => {
      fetchNews();
      pollTimer = setInterval(fetchNews, intervalMs);
    }, remaining);
  } else {
    fetchNews();
    pollTimer = setInterval(fetchNews, intervalMs);
  }
  el.startBtn.disabled = true;
  el.stopBtn.disabled = false;
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    clearTimeout(pollTimer);
    pollTimer = null;
  }
  saveRuntimePatch({ newsRunning: false });
  el.startBtn.disabled = false;
  el.stopBtn.disabled = true;
}

el.startBtn.addEventListener("click", async () => {
  await requestNotificationPermission();
  startPolling();
});

el.stopBtn.addEventListener("click", () => {
  stopPolling();
  setStatus("Takip durduruldu.");
});

el.clearSeenBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEYS.seen);
  localStorage.removeItem(STORAGE_KEYS.read);
  localStorage.removeItem(STORAGE_KEYS.aiSeen);
  localStorage.removeItem(STORAGE_KEYS.aiLevels);
  latestItems = [];
  renderItems(latestItems);
  setStatus("Gorulen ve okunan haber hafizasi temizlendi.");
});

el.tabUnread.addEventListener("click", () => setActiveTab("unread"));
el.tabRead.addEventListener("click", () => setActiveTab("read"));

el.markAllReadBtn.addEventListener("click", () => {
  const readSet = getSet(STORAGE_KEYS.read);
  for (const item of latestItems) {
    readSet.add(item.id);
  }
  saveSet(STORAGE_KEYS.read, readSet);
  renderItems(latestItems);
  updateStatusCounts();
});

el.newsList.addEventListener("click", (ev) => {
  const target = ev.target;
  if (!(target instanceof HTMLElement)) return;
  const button = target.closest(".mark-read-btn");
  if (!button) return;
  const id = button.getAttribute("data-id");
  if (!id) return;
  const readSet = getSet(STORAGE_KEYS.read);
  const isRead = readSet.has(id);
  markItemRead(id, !isRead);
  updateStatusCounts();
});

if (el.mainTabNews && el.mainTabKap) {
  el.mainTabNews.addEventListener("click", () => setMainTab("news"));
  el.mainTabKap.addEventListener("click", () => setMainTab("kap"));
}

if (el.kapFetchBtn) {
  el.kapFetchBtn.addEventListener("click", () => {
    fetchKapItems();
  });
}

if (el.kapAddJobBtn) {
  el.kapAddJobBtn.addEventListener("click", () => {
    addKapJobFromForm();
  });
}

if (el.kapJobsList) {
  el.kapJobsList.addEventListener("click", (ev) => {
    const target = ev.target;
    if (!(target instanceof HTMLElement)) return;
    const btn = target.closest(".kap-job-remove");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    if (!id) return;
    kapJobs = kapJobs.filter((j) => j.id !== id);
    delete kapJobState[id];
    saveKapJobState();
    renderKapJobs();
    saveConfig();
    setKapStatus("KAP kaydi silindi.");
  });
}

if (el.kapStartBtn) {
  el.kapStartBtn.addEventListener("click", () => {
    startKapRandomTracking(false);
  });
}

if (el.kapStopBtn) {
  el.kapStopBtn.addEventListener("click", () => {
    stopKapRandomTracking();
  });
}

if (el.kapTabUnread && el.kapTabRead) {
  el.kapTabUnread.addEventListener("click", () => setKapActiveTab("unread"));
  el.kapTabRead.addEventListener("click", () => setKapActiveTab("read"));
}

if (el.kapMarkAllReadBtn) {
  el.kapMarkAllReadBtn.addEventListener("click", () => {
    markAllKapRead();
    const unreadCount = getKapUnreadItems().length;
    setKapStatus(`Tum KAP bildirimleri okundu yapildi. Okunmamis: ${unreadCount}.`);
  });
}

if (el.kapList) {
  el.kapList.addEventListener("click", (ev) => {
    const target = ev.target;
    if (!(target instanceof HTMLElement)) return;
    const btn = target.closest(".kap-mark-read-btn");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    if (!id) return;
    const kapReadSet = getSet(STORAGE_KEYS.kapRead);
    const isRead = kapReadSet.has(id);
    markKapItemRead(id, !isRead);
    const unreadCount = getKapUnreadItems().length;
    setKapStatus(`KAP okuma durumu guncellendi. Okunmamis: ${unreadCount}.`);
  });
}

if (el.kapClearBtn) {
  el.kapClearBtn.addEventListener("click", () => {
    kapItems = [];
    kapJobState = {};
    kapJobs = [];
    stopKapRandomTracking();
    localStorage.removeItem(STORAGE_KEYS.kapCache);
    localStorage.removeItem(STORAGE_KEYS.kapSeen);
    localStorage.removeItem(STORAGE_KEYS.kapRead);
    localStorage.removeItem(STORAGE_KEYS.kapJobState);
    renderKapJobs();
    saveConfig();
    renderKapItems(kapItems);
    setKapStatus("KAP liste temizlendi.");
  });
}

if (el.kapClearLogsBtn) {
  el.kapClearLogsBtn.addEventListener("click", () => {
    kapLogs = [];
    localStorage.removeItem(STORAGE_KEYS.kapLogs);
    renderKapLogs();
    setKapStatus("KAP loglari temizlendi.");
  });
}

if (el.clearAiLogsBtn) {
  el.clearAiLogsBtn.addEventListener("click", () => {
    aiLogs = [];
    localStorage.removeItem(STORAGE_KEYS.aiLogs);
    renderAiLogs();
    setStatus("Google/DeepSeek loglari temizlendi.");
  });
}

if (el.scanAiBacklogBtn) {
  el.scanAiBacklogBtn.addEventListener("click", async () => {
    await scanAiBacklogNow();
  });
}

loadConfig();
aiLogs = loadAiLogs();
kapJobState = loadKapJobState();
kapLogs = loadKapLogs();
loadFeedCache();
loadKapCache();
if (kapJobs.length === 0) {
  kapJobs = parseKapLegacyLinesToJobs();
}
kapJobs = kapJobs.map((j) => normalizeKapJob(j)).filter((j) => Boolean(j.url));
{
  const valid = new Set(kapJobs.map((j) => j.id));
  const nextState = {};
  for (const [id, state] of Object.entries(kapJobState)) {
    if (valid.has(id)) nextState[id] = state;
  }
  kapJobState = nextState;
  saveKapJobState();
}
renderKapJobs();
setActiveTab("unread");
setKapActiveTab("unread");
setMainTab("news");
renderItems(latestItems);
updateStatusCounts();
renderAiLogs();
renderKapItems(kapItems);
renderKapLogs();
setKapTrackingButtons();

const runtime = loadRuntime();
if (runtime.newsRunning) {
  startPolling();
}
if (runtime.kapRunning) {
  startKapRandomTracking(true);
}
