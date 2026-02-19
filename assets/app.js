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
  aiAnalysis: "aiAnalysisV1",
  savedNews: "savedNewsIdsV1",
  mutedKeywords: "mutedKeywordsV1",
  blockedSources: "blockedSourcesV1",
};

const el = {
  keywords: document.getElementById("keywords"),
  keywordTags: document.getElementById("keywordTags"),
  addKeywordInput: document.getElementById("addKeywordInput"),
  addKeywordBtn: document.getElementById("addKeywordBtn"),
  bannedWords: document.getElementById("bannedWords"),
  interval: document.getElementById("interval"),
  lang: document.getElementById("lang"),
  country: document.getElementById("country"),
  autoRefreshToggle: document.getElementById("autoRefreshToggle"),
  feedSearchInput: document.getElementById("feedSearchInput"),
  unreadCountBadge: document.getElementById("unreadCountBadge"),
  dailySummaryList: document.getElementById("dailySummaryList"),
  refreshNowBtn: document.getElementById("refreshNowBtn"),
  nextPollCountdown: document.getElementById("nextPollCountdown"),
  clearSeenBtn: document.getElementById("clearSeenBtn"),
  installAppBtn: document.getElementById("installAppBtn"),
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
let pollDelayTimer = null;
let countdownTimer = null;
let nextNewsPollAt = 0;
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
let serverConfigSyncTimer = null;
let deferredInstallPrompt = null;
let selectedCardIndex = -1;
let keyboardBound = false;

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

function formatCountdown(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function setNextPollAt(ts) {
  nextNewsPollAt = Number(ts || 0);
  updateCountdown();
}

function updateCountdown() {
  if (!el.nextPollCountdown) return;
  if (!nextNewsPollAt || nextNewsPollAt <= Date.now()) {
    el.nextPollCountdown.textContent = "Sonraki sorgu: 00:00";
    return;
  }
  el.nextPollCountdown.textContent = `Sonraki sorgu: ${formatCountdown(nextNewsPollAt - Date.now())}`;
}

function startCountdownTimer() {
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(updateCountdown, 1000);
  updateCountdown();
}

function stopCountdownTimer() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  setNextPollAt(0);
}

function getBasePath() {
  const p = typeof window.__BASE_PATH__ === "string" ? window.__BASE_PATH__ : "";
  return p.endsWith("/") ? p.slice(0, -1) : p;
}

function setupPwaInstall() {
  if (!("serviceWorker" in navigator)) return;
  const basePath = getBasePath();
  const swPath = `${basePath}/sw.js`;
  navigator.serviceWorker.register(swPath).catch(() => {
    // no-op
  });

  window.addEventListener("beforeinstallprompt", (ev) => {
    ev.preventDefault();
    deferredInstallPrompt = ev;
    if (el.installAppBtn) {
      el.installAppBtn.classList.remove("hidden");
    }
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    if (el.installAppBtn) {
      el.installAppBtn.classList.add("hidden");
    }
  });
}

function loadConfig() {
  const raw = localStorage.getItem(STORAGE_KEYS.config);
  if (!raw) return;
  try {
    const cfg = JSON.parse(raw);
    if (cfg.keywords) el.keywords.value = cfg.keywords;
    if (cfg.bannedWords && el.bannedWords) el.bannedWords.value = cfg.bannedWords;
    if (cfg.interval !== undefined) el.interval.value = String(cfg.interval);
    if (cfg.lang) el.lang.value = cfg.lang;
    if (cfg.country) el.country.value = cfg.country;
    if (el.autoRefreshToggle && cfg.autoRefresh !== undefined) el.autoRefreshToggle.checked = Boolean(cfg.autoRefresh);
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
    bannedWords: el.bannedWords ? el.bannedWords.value.trim() : "",
    interval: Number(el.interval.value || 120),
    lang: (el.lang.value || "tr").trim(),
    country: (el.country.value || "TR").trim(),
    autoRefresh: el.autoRefreshToggle ? Boolean(el.autoRefreshToggle.checked) : true,
    kapLinks: el.kapLinks ? el.kapLinks.value.trim() : "",
    kapJobs,
    kapDateRange: el.kapDateRange ? Number(el.kapDateRange.value || 365) : 365,
  };
  localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(cfg));
  queueServerConfigSync();
}

function getCurrentConfigPayload() {
  return {
    keywords: el.keywords.value.trim(),
    bannedWords: el.bannedWords ? el.bannedWords.value.trim() : "",
    interval: Number(el.interval.value || 120),
    lang: (el.lang.value || "tr").trim(),
    country: (el.country.value || "TR").trim(),
    autoRefresh: el.autoRefreshToggle ? Boolean(el.autoRefreshToggle.checked) : true,
    kapJobs: kapJobs.map((j) => ({
      id: String(j.id || ""),
      url: String(j.url || ""),
      minMinutes: Number(j.minMinutes || 2),
      maxMinutes: Number(j.maxMinutes || 5),
      range: Number(j.range || 30),
    })),
    kapDateRange: el.kapDateRange ? Number(el.kapDateRange.value || 30) : 30,
  };
}

async function syncServerConfigNow() {
  try {
    await fetch("server_config.php", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(getCurrentConfigPayload()),
    });
  } catch (_) {
    // background sync best-effort
  }
}

function queueServerConfigSync() {
  if (serverConfigSyncTimer) {
    clearTimeout(serverConfigSyncTimer);
  }
  serverConfigSyncTimer = setTimeout(() => {
    serverConfigSyncTimer = null;
    syncServerConfigNow();
  }, 500);
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

function mergeAiLogs(incoming) {
  if (!Array.isArray(incoming) || incoming.length === 0) return;
  const normalized = incoming.map((row) => ({
    ts: Number((row.ts || 0)) * 1000 || Date.now(),
    level: String(row.level || "INFO").toUpperCase(),
    keyword: row.keyword ? String(row.keyword) : "-",
    title: row.title ? String(row.title) : "Server Tick",
    notification_level: row.notification_level ? String(row.notification_level) : "",
    summary: row.summary ? String(row.summary) : "",
    message: row.message ? String(row.message) : "",
  }));
  const uniq = new Map();
  for (const row of [...normalized, ...aiLogs]) {
    const key = `${row.ts}|${row.level}|${row.title}|${row.message}`;
    if (!uniq.has(key)) uniq.set(key, row);
  }
  aiLogs = Array.from(uniq.values()).sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 500);
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

function mergeLatestItems(incoming) {
  if (!Array.isArray(incoming) || incoming.length === 0) return;
  const byId = new Map();
  for (const item of latestItems) {
    if (item && item.id) byId.set(item.id, item);
  }
  for (const item of incoming) {
    if (item && item.id) byId.set(item.id, item);
  }
  latestItems = Array.from(byId.values()).sort((a, b) => (Number(b.pubTs || 0) - Number(a.pubTs || 0))).slice(0, 300);
  saveFeedCache(latestItems);
  renderItems(latestItems);
  updateStatusCounts();
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

function mergeKapLogs(incoming) {
  if (!Array.isArray(incoming) || incoming.length === 0) return;
  const normalized = incoming.map((row) => ({
    ts: Number((row.ts || 0)) * 1000 || Date.now(),
    level: String(row.level || "info").toLowerCase(),
    url: String(row.url || "-"),
    message: String(row.message || ""),
    newCount: Number(row.newCount || 0),
    fetchedCount: Number(row.fetchedCount || 0),
    totalSaved: Number(row.totalSaved || kapItems.length),
  }));
  const uniq = new Map();
  for (const row of [...normalized, ...kapLogs]) {
    const key = `${row.ts}|${row.level}|${row.url}|${row.message}`;
    if (!uniq.has(key)) uniq.set(key, row);
  }
  kapLogs = Array.from(uniq.values()).sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 300);
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
    const rawUrl = String(log.url || "-");
    const shortUrl = rawUrl.length > 90 ? `${rawUrl.slice(0, 90)}...` : rawUrl;
    li.innerHTML = `
      <div class="meta">
        <span>${escapeHtml(formatDateTime(log.ts))}</span>
        <span>${escapeHtml(levelText)}</span>
        <span>Yeni: ${escapeHtml(String(log.newCount))}</span>
        <span>Cekilen: ${escapeHtml(String(log.fetchedCount))}</span>
        <span>Toplam Kayit: ${escapeHtml(String(log.totalSaved))}</span>
      </div>
      <div><strong>Kaynak:</strong> ${escapeHtml(shortUrl)}</div>
      <div><strong>Detay:</strong> ${escapeHtml(log.message)}</div>
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
  if (el.markAllReadBtn) el.markAllReadBtn.classList.toggle("hidden", tab !== "news");
  if (el.kapMarkAllReadBtn) el.kapMarkAllReadBtn.classList.toggle("hidden", tab !== "kap");

  // KAP paneline gecildiginde "okunmamis" filtresi bos kalirsa otomatik tum kayitlari goster.
  if (tab === "kap") {
    if (kapItems.length > 0 && activeTab === "unread" && getKapUnreadItems().length === 0) {
      setActiveTab("read");
    } else {
      renderKapItems(kapItems);
    }
    return;
  }
  renderItems(latestItems);
}

function setAccordionOpen(cardEl, bodyEl, open) {
  if (!cardEl || !bodyEl) return;
  if (open) {
    bodyEl.classList.remove("hidden");
    bodyEl.style.maxHeight = `${bodyEl.scrollHeight}px`;
    cardEl.classList.add("open");
  } else {
    bodyEl.style.maxHeight = `${bodyEl.scrollHeight}px`;
    requestAnimationFrame(() => {
      bodyEl.style.maxHeight = "0px";
      cardEl.classList.remove("open");
    });
    setTimeout(() => {
      if (!cardEl.classList.contains("open")) {
        bodyEl.classList.add("hidden");
      }
    }, 280);
  }
}

function setupAccordionToggle(cardEl, bodyEl, toggleBtn, openByDefault = false) {
  if (!cardEl || !bodyEl || !toggleBtn) return;
  bodyEl.classList.remove("hidden");
  bodyEl.style.overflow = "hidden";
  bodyEl.style.transition = "max-height 0.28s ease";
  if (openByDefault) {
    bodyEl.style.maxHeight = `${bodyEl.scrollHeight}px`;
    cardEl.classList.add("open");
  } else {
    bodyEl.style.maxHeight = "0px";
    cardEl.classList.remove("open");
  }
  toggleBtn.addEventListener("click", () => {
    const willOpen = !cardEl.classList.contains("open");
    setAccordionOpen(cardEl, bodyEl, willOpen);
  });
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
  renderKapItems(kapItems);
}

function getKapVisibleItems(items, kapReadSet) {
  if (activeTab === "read") return items;
  return items.filter((x) => !kapReadSet.has(x.id));
}

function markNewsIdsRead(ids, markRead) {
  const readSet = getSet(STORAGE_KEYS.read);
  for (const id of ids) {
    if (!id) continue;
    if (markRead) readSet.add(id);
    else readSet.delete(id);
  }
  saveSet(STORAGE_KEYS.read, readSet);
}

function markKapIdsRead(ids, markRead) {
  const kapReadSet = getSet(STORAGE_KEYS.kapRead);
  for (const id of ids) {
    if (!id) continue;
    if (markRead) kapReadSet.add(id);
    else kapReadSet.delete(id);
  }
  saveSet(STORAGE_KEYS.kapRead, kapReadSet);
}

function saveIds(ids) {
  const savedSet = getSet(STORAGE_KEYS.savedNews);
  for (const id of ids) {
    if (id) savedSet.add(id);
  }
  saveSet(STORAGE_KEYS.savedNews, savedSet);
}

function muteKeyword(keyword) {
  const normalized = String(keyword || "").trim().toLowerCase();
  if (!normalized) return false;
  const muted = getSet(STORAGE_KEYS.mutedKeywords);
  muted.add(normalized);
  saveSet(STORAGE_KEYS.mutedKeywords, muted);
  return true;
}

function blockSource(sourceOrUrl) {
  const raw = String(sourceOrUrl || "").trim();
  if (!raw) return false;
  let normalized = raw.toLowerCase();
  try {
    const u = new URL(raw);
    normalized = (u.hostname || "").replace(/^www\./, "").toLowerCase();
  } catch (_) {
    normalized = normalized.replace(/^www\./, "");
  }
  if (!normalized) return false;
  const blocked = getSet(STORAGE_KEYS.blockedSources);
  blocked.add(normalized);
  saveSet(STORAGE_KEYS.blockedSources, blocked);
  return true;
}

function parseIdList(raw) {
  return String(raw || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
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
  const searchQuery = (el.feedSearchInput?.value || "").trim().toLowerCase();
  const visibleRaw = getKapVisibleItems(items || [], kapReadSet).filter((item) => {
    if (!searchQuery) return true;
    const haystack = `${item.title || ""} ${item.stockCode || ""} ${item.companyTitle || ""} ${item.link || ""}`.toLowerCase();
    return haystack.includes(searchQuery);
  });
  const clusters = clusterKapItems(visibleRaw, kapReadSet);
  const groups = {
    VERY_IMPORTANT: [],
    IMPORTANT: [],
    NOT_IMPORTANT: [],
  };
  for (const c of clusters) groups[c.maxLevel || "NOT_IMPORTANT"].push(c);
  const defs = [
    { key: "VERY_IMPORTANT", label: "Cok Onemli", open: true },
    { key: "IMPORTANT", label: "Onemli", open: true },
    { key: "NOT_IMPORTANT", label: "Diger", open: false },
  ];
  let totalRendered = 0;
  for (const def of defs) {
    const arr = groups[def.key];
    totalRendered += arr.length;
    const section = document.createElement("section");
    section.className = "importance-group";
    section.innerHTML = `
      <button type="button" class="group-toggle" data-group="kap-${def.key}" aria-expanded="${def.open ? "true" : "false"}">
        <span>${escapeHtml(def.label)}</span>
        <span class="pill">${arr.length}</span>
      </button>
      <div class="group-body ${def.open ? "" : "hidden"}"></div>
    `;
    const body = section.querySelector(".group-body");
    if (body) {
      for (const c of arr) {
        const isRead = c.unreadCount === 0;
        const importanceClass =
          def.key === "VERY_IMPORTANT"
            ? "importance-very-important"
            : def.key === "IMPORTANT"
              ? "importance-important"
              : "";
        const ids = c.items.map((x) => String(x.id || "")).filter(Boolean);
        const mainItem = c.items[0] || {};
        const sourceLabel = Array.from(c.sources).join(" • ") || "KAP";
        const keywordLabel = Array.from(c.keywords).join(", ") || mainItem.stockCode || "-";
        const card = document.createElement("article");
        card.className = `news-card ${importanceClass} ${isRead ? "seen" : "new"}`.trim();
        card.setAttribute("data-kind", "kap");
        card.setAttribute("data-primary-id", String(mainItem.id || ""));
        card.setAttribute("data-ids", ids.join(","));
        card.setAttribute("data-item-link", String(c.link || ""));
        card.setAttribute("data-source", String(Array.from(c.sources)[0] || ""));
        card.innerHTML = `
          <div class="card-head">
            <a class="title" href="${escapeHtml(c.link || "#")}" target="_blank" rel="noopener noreferrer">${escapeHtml(c.title || "(Baslik yok)")}</a>
            <details class="card-menu">
              <summary>...</summary>
              <div class="menu-pop">
                <button type="button" class="kap-action-btn" data-action="toggleRead" data-ids="${escapeHtml(ids.join(","))}">${isRead ? "Okunmamis Yap" : "Okundu Yap"}</button>
                <button type="button" class="kap-action-btn" data-action="save" data-ids="${escapeHtml(ids.join(","))}">Kaydet</button>
                <button type="button" class="kap-action-btn" data-action="muteKeyword" data-keyword="${escapeHtml(String(mainItem.stockCode || ""))}">Keyword Sessize Al</button>
                <button type="button" class="kap-action-btn" data-action="blockSource" data-source="${escapeHtml(String(Array.from(c.sources)[0] || ""))}" data-link="${escapeHtml(c.link || "")}">Kaynagi Engelle</button>
              </div>
            </details>
          </div>
          <div class="meta">
            <span>${escapeHtml(sourceLabel)}</span>
            <span>${escapeHtml(c.pubDate || "")}</span>
            <span>${escapeHtml(keywordLabel)}</span>
            <span class="importance-badge ${escapeHtml(importanceClass)}">${def.key === "VERY_IMPORTANT" ? "Cok Onemli" : def.key === "IMPORTANT" ? "Onemli" : "Onemsiz"}</span>
          </div>
          <div class="score-row">
            <span class="score-text">Onem Skoru: ${Math.round(c.score)}/100</span>
            <div class="score-track"><div class="score-fill ${escapeHtml(importanceClass)}" style="width:${Math.max(2, Math.min(100, Math.round(c.score)))}%"></div></div>
          </div>
          <div class="insight">${escapeHtml(c.aiInsight || "KAP siniflandirmasi bildirim tipine gore yapildi.")}</div>
        `;
        body.appendChild(card);
      }
    }
    el.kapList.appendChild(section);
  }
  if (totalRendered === 0) {
    const div = document.createElement("div");
    div.className = "empty";
    if (kapJobs.length === 0) {
      div.textContent = "KAP kaydi yok. Sol panelden KAP linki ekleyin.";
    } else if ((items || []).length === 0) {
      div.textContent = "Henuz KAP verisi yok. Sol panelden 'Manuel Cek' veya takip baslatin.";
    } else {
      div.textContent = activeTab === "read" ? "Kayit yok." : "Okunmamis KAP bildirimi yok.";
    }
    el.kapList.appendChild(div);
  }
  const newsReadSet = getSet(STORAGE_KEYS.read);
  const newsVisible = getVisibleItems(latestItems, newsReadSet);
  const newsClusters = clusterNewsItems(newsVisible, newsReadSet);
  renderDailySummary(newsClusters, clusters);
  setupKeyboardNavigation();
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

function renderKeywordTags() {
  if (!el.keywordTags) return;
  const kws = parseKeywords();
  el.keywordTags.innerHTML = "";
  if (!kws.length) {
    const span = document.createElement("span");
    span.className = "tag muted";
    span.textContent = "Keyword yok";
    el.keywordTags.appendChild(span);
    return;
  }
  for (const kw of kws) {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.innerHTML = `${escapeHtml(kw)} <button type="button" class="tag-remove" data-keyword="${escapeHtml(kw)}">x</button>`;
    el.keywordTags.appendChild(tag);
  }
}

function addKeyword(keyword) {
  const k = String(keyword || "").trim();
  if (!k) return false;
  const kws = parseKeywords();
  if (kws.some((x) => x.toLowerCase() === k.toLowerCase())) return false;
  kws.push(k);
  el.keywords.value = kws.join("\n");
  renderKeywordTags();
  saveConfig();
  ensureAutoPolling();
  return true;
}

function removeKeyword(keyword) {
  const k = String(keyword || "").trim().toLowerCase();
  if (!k) return;
  const kws = parseKeywords().filter((x) => x.toLowerCase() !== k);
  el.keywords.value = kws.join("\n");
  renderKeywordTags();
  saveConfig();
  ensureAutoPolling();
}

function parseBannedWords() {
  if (!el.bannedWords) return [];
  const seen = new Set();
  return el.bannedWords.value
    .split(/\r?\n/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => {
      if (!s) return false;
      if (seen.has(s)) return false;
      seen.add(s);
      return true;
    });
}

function getMutedKeywordsSet() {
  return getSet(STORAGE_KEYS.mutedKeywords);
}

function getBlockedSourcesSet() {
  return getSet(STORAGE_KEYS.blockedSources);
}

function inferSourceName(item) {
  const title = String(item.title || "");
  const link = String(item.link || "");
  const m = title.match(/\s-\s([^-\n]+)$/);
  if (m && m[1]) return m[1].trim();
  try {
    const u = new URL(link);
    return (u.hostname || "").replace(/^www\./, "");
  } catch (_) {
    return "";
  }
}

function normalizeTitleForCluster(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/\s-\s[^-\n]{2,60}$/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFingerprint(title) {
  const normalized = normalizeTitleForCluster(title);
  const tokens = normalized.split(" ").filter(Boolean).slice(0, 8);
  return tokens.join(" ");
}

function getImportanceScoreFromLevel(level) {
  const l = String(level || "NOT_IMPORTANT").toUpperCase();
  if (l === "VERY_IMPORTANT") return 86;
  if (l === "IMPORTANT") return 68;
  return 35;
}

function normalizeImportanceScore(value, level = "NOT_IMPORTANT") {
  const num = Number(value);
  if (Number.isFinite(num)) {
    return Math.max(1, Math.min(100, Math.round(num)));
  }
  return getImportanceScoreFromLevel(level);
}

function scoreWithContext(base, sourceCount, unreadCount, ageMinutes) {
  let s = base;
  s += Math.min(10, Math.max(0, sourceCount - 1) * 3);
  s += Math.min(6, unreadCount);
  s -= Math.min(12, Math.floor(ageMinutes / 120));
  return Math.max(1, Math.min(100, s));
}

function getAiAnalysisMap() {
  return loadJsonObject(STORAGE_KEYS.aiAnalysis);
}

function saveAiAnalysisMap(mapObj) {
  saveJsonObject(STORAGE_KEYS.aiAnalysis, mapObj);
}

function clusterNewsItems(items, readSet) {
  const aiLevels = loadJsonObject(STORAGE_KEYS.aiLevels);
  const aiAnalysis = getAiAnalysisMap();
  const muted = getMutedKeywordsSet();
  const blocked = getBlockedSourcesSet();
  const byKey = new Map();
  const now = Date.now();

  for (const item of items) {
    const keyword = String(item.keyword || "").toLowerCase();
    const source = inferSourceName(item).toLowerCase();
    if (keyword && muted.has(keyword)) continue;
    if (source && blocked.has(source)) continue;

    const key = `${keyword}|${titleFingerprint(item.title || "")}`;
    if (!byKey.has(key)) {
      byKey.set(key, {
        key,
        title: item.title || "(Baslik yok)",
        link: item.link || "",
        pubTs: Number(item.pubTs || 0),
        pubDate: item.pubDate || "",
        items: [],
        sources: new Set(),
        keywords: new Set(),
        maxLevel: "NOT_IMPORTANT",
        score: 0,
        aiScore: null,
        unreadCount: 0,
        aiInsight: "",
      });
    }
    const cluster = byKey.get(key);
    cluster.items.push(item);
    const src = inferSourceName(item);
    if (src) cluster.sources.add(src);
    if (item.keyword) cluster.keywords.add(item.keyword);
    const level = String(aiLevels[item.id] || "NOT_IMPORTANT").toUpperCase();
    if (level === "VERY_IMPORTANT" || (level === "IMPORTANT" && cluster.maxLevel !== "VERY_IMPORTANT")) {
      cluster.maxLevel = level;
    }
    if (!readSet.has(item.id)) cluster.unreadCount += 1;
    if (Number(item.pubTs || 0) > cluster.pubTs) {
      cluster.pubTs = Number(item.pubTs || 0);
      cluster.pubDate = item.pubDate || "";
      cluster.title = item.title || cluster.title;
      cluster.link = item.link || cluster.link;
    }
    const a = aiAnalysis[item.id];
    if (!cluster.aiInsight && a && typeof a.summary === "string" && a.summary.trim() !== "") {
      cluster.aiInsight = a.summary.trim();
    }
    if (!cluster.aiInsight && a && Array.isArray(a.impact_reasoning) && a.impact_reasoning.length > 0) {
      cluster.aiInsight = String(a.impact_reasoning[0] || "").trim();
    }
    if (a) {
      const aiScore = normalizeImportanceScore(a.importance_score, level);
      if (cluster.aiScore === null || aiScore > cluster.aiScore) {
        cluster.aiScore = aiScore;
      }
    }
  }

  const clusters = Array.from(byKey.values()).map((c) => {
    const base = getImportanceScoreFromLevel(c.maxLevel);
    const ageMinutes = c.pubTs > 0 ? Math.floor((now - c.pubTs * 1000) / 60000) : 9999;
    c.score = c.aiScore !== null
      ? c.aiScore
      : scoreWithContext(base, c.sources.size, c.unreadCount, Math.max(0, ageMinutes));
    return c;
  });
  clusters.sort((a, b) => b.score - a.score);
  return clusters;
}

function clusterKapItems(items, readSet) {
  const byKey = new Map();
  const now = Date.now();
  const blocked = getBlockedSourcesSet();
  const muted = getMutedKeywordsSet();
  for (const item of items) {
    const keyword = String(item.stockCode || "").toLowerCase();
    if (keyword && muted.has(keyword)) continue;
    const source = inferSourceName(item).toLowerCase();
    if (source && blocked.has(source)) continue;
    const key = `${String(item.stockCode || "").toLowerCase()}|${titleFingerprint(item.title || "")}`;
    if (!byKey.has(key)) {
      byKey.set(key, {
        key,
        title: item.title || "(Baslik yok)",
        link: item.link || "",
        pubTs: Number(item.publishTs || 0),
        pubDate: item.publishDate || "",
        items: [],
        sources: new Set(),
        keywords: new Set(),
        maxLevel: "NOT_IMPORTANT",
        score: 0,
        unreadCount: 0,
        aiInsight: String(item.summary || "").trim(),
      });
    }
    const c = byKey.get(key);
    c.items.push(item);
    c.sources.add(inferSourceName(item) || "KAP");
    if (item.stockCode) c.keywords.add(item.stockCode);
    const level = getKapImportanceLevel(item);
    if (level === "VERY_IMPORTANT" || (level === "IMPORTANT" && c.maxLevel !== "VERY_IMPORTANT")) c.maxLevel = level;
    if (!readSet.has(item.id)) c.unreadCount += 1;
    if (Number(item.publishTs || 0) > c.pubTs) {
      c.pubTs = Number(item.publishTs || 0);
      c.pubDate = item.publishDate || "";
      c.title = item.title || c.title;
      c.link = item.link || c.link;
    }
  }
  const clusters = Array.from(byKey.values()).map((c) => {
    const base = getImportanceScoreFromLevel(c.maxLevel);
    const ageMinutes = c.pubTs > 0 ? Math.floor((now - c.pubTs * 1000) / 60000) : 9999;
    c.score = scoreWithContext(base, c.sources.size, c.unreadCount, Math.max(0, ageMinutes));
    return c;
  });
  clusters.sort((a, b) => b.score - a.score);
  return clusters;
}

function getMissingAiAnalysisItems(items) {
  const aiAnalysis = getAiAnalysisMap();
  const aiSeenSet = getSet(STORAGE_KEYS.aiSeen);
  return items.filter((item) => !aiSeenSet.has(item.id) || !aiAnalysis[item.id]);
}

function renderDailySummary(newsClusters, kapClusters) {
  if (!el.dailySummaryList) return;
  const lines = [];
  const all = [...(newsClusters || []), ...(kapClusters || [])].sort((a, b) => b.score - a.score);
  if (all.length > 0) {
    const top = all[0];
    lines.push(`${top.title} (${top.sources.size} kaynak)`);
  }
  const veryCount = all.filter((x) => x.maxLevel === "VERY_IMPORTANT").length;
  const impCount = all.filter((x) => x.maxLevel === "IMPORTANT").length;
  if (veryCount > 0) lines.push(`${veryCount} adet cok onemli gelisme tespit edildi.`);
  if (impCount > 0) lines.push(`${impCount} adet onemli gelisme izleniyor.`);
  const sectors = new Map();
  for (const c of all) {
    for (const k of c.keywords) {
      const kk = String(k).toUpperCase();
      sectors.set(kk, (sectors.get(kk) || 0) + 1);
    }
  }
  const topK = Array.from(sectors.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (topK.length) {
    lines.push(`Yuksek aktivite: ${topK.map(([k, v]) => `${k} (${v})`).join(", ")}`);
  }
  if (!lines.length) lines.push("Bugun icin ozetlenecek belirgin bir hareket yok.");
  el.dailySummaryList.innerHTML = lines.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
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
  if (activeTab === "read") return items;
  return items.filter((i) => !readSet.has(i.id));
}

function getNewsImportanceLevel(item) {
  const levels = loadJsonObject(STORAGE_KEYS.aiLevels);
  const level = String(levels[item.id] || "NOT_IMPORTANT").toUpperCase();
  if (level === "VERY_IMPORTANT" || level === "IMPORTANT") return level;
  return "NOT_IMPORTANT";
}

function getKapImportanceLevel(item) {
  const txt = `${String(item.type || "")} ${String(item.title || "")}`.toLowerCase();
  const veryKeywords = [
    "iflas",
    "konkordato",
    "birlesme",
    "devralma",
    "sermaye",
    "bedelli",
    "bedelsiz",
    "temettu",
    "finansal",
    "bilan",
    "kar",
    "zarar",
    "geri alim",
  ];
  const importantKeywords = ["genel kurul", "yatirim", "tesvik", "sozlesme", "ihale", "kredi", "borc", "faaliyet"];
  if (veryKeywords.some((k) => txt.includes(k))) return "VERY_IMPORTANT";
  if (importantKeywords.some((k) => txt.includes(k))) return "IMPORTANT";
  return "NOT_IMPORTANT";
}

function renderItems(items) {
  const readSet = getSet(STORAGE_KEYS.read);
  const searchQuery = (el.feedSearchInput?.value || "").trim().toLowerCase();
  const visibleRaw = getVisibleItems(items, readSet).filter((item) => {
    if (!searchQuery) return true;
    const haystack = `${item.title || ""} ${item.keyword || ""} ${item.link || ""}`.toLowerCase();
    return haystack.includes(searchQuery);
  });
  const clusters = clusterNewsItems(visibleRaw, readSet);
  el.newsList.innerHTML = "";

  const groups = { VERY_IMPORTANT: [], IMPORTANT: [], NOT_IMPORTANT: [] };
  for (const c of clusters) groups[c.maxLevel || "NOT_IMPORTANT"].push(c);

  const defs = [
    { key: "VERY_IMPORTANT", label: "Cok Onemli", open: true },
    { key: "IMPORTANT", label: "Onemli", open: true },
    { key: "NOT_IMPORTANT", label: "Diger", open: false },
  ];

  let totalRendered = 0;
  for (const def of defs) {
    const arr = groups[def.key];
    totalRendered += arr.length;
    const section = document.createElement("section");
    section.className = "importance-group";
    section.innerHTML = `
      <button type="button" class="group-toggle" data-group="${def.key}" aria-expanded="${def.open ? "true" : "false"}">
        <span>${escapeHtml(def.label)}</span>
        <span class="pill">${arr.length}</span>
      </button>
      <div class="group-body ${def.open ? "" : "hidden"}"></div>
    `;
    const body = section.querySelector(".group-body");
    if (body) {
      for (const c of arr) {
        const isRead = c.unreadCount === 0;
        const importanceClass = def.key === "VERY_IMPORTANT" ? "importance-very-important" : def.key === "IMPORTANT" ? "importance-important" : "";
        const mainItem = c.items[0] || {};
        const ids = c.items.map((x) => String(x.id || "")).filter(Boolean);
        const card = document.createElement("article");
        card.className = `news-card ${importanceClass} ${isRead ? "seen" : "new"}`.trim();
        card.setAttribute("data-item-link", String(c.link || ""));
        card.setAttribute("data-item-id", String(mainItem.id || ""));
        card.setAttribute("data-kind", "news");
        card.setAttribute("data-primary-id", String(mainItem.id || ""));
        card.setAttribute("data-ids", ids.join(","));
        card.setAttribute("data-source", String(Array.from(c.sources)[0] || ""));
        card.innerHTML = `
          <div class="card-head">
            <a class="title" href="${escapeHtml(c.link || "#")}" target="_blank" rel="noopener noreferrer">${escapeHtml(c.title || "(Baslik yok)")}</a>
            <details class="card-menu">
              <summary>...</summary>
              <div class="menu-pop">
                <button type="button" class="news-action-btn" data-action="toggleRead" data-ids="${escapeHtml(ids.join(","))}">${isRead ? "Okunmamis Yap" : "Okundu Yap"}</button>
                <button type="button" class="news-action-btn" data-action="save" data-ids="${escapeHtml(ids.join(","))}">Kaydet</button>
                <button type="button" class="news-action-btn" data-action="muteKeyword" data-keyword="${escapeHtml(String(mainItem.keyword || ""))}">Keyword Sessize Al</button>
                <button type="button" class="news-action-btn" data-action="blockSource" data-source="${escapeHtml(String(Array.from(c.sources)[0] || ""))}" data-link="${escapeHtml(c.link || "")}">Kaynagi Engelle</button>
              </div>
            </details>
          </div>
          <div class="meta">
            <span>${escapeHtml(Array.from(c.sources).join(" • ") || "-")}</span>
            <span>${escapeHtml(c.pubDate || "")}</span>
            <span>${escapeHtml(Array.from(c.keywords).join(", ") || "-")}</span>
            <span class="importance-badge ${escapeHtml(importanceClass)}">${def.key === "VERY_IMPORTANT" ? "Cok Onemli" : def.key === "IMPORTANT" ? "Onemli" : "Onemsiz"}</span>
          </div>
          <div class="score-row">
            <span class="score-text">Onem Skoru: ${Math.round(c.score)}/100</span>
            <div class="score-track"><div class="score-fill ${escapeHtml(importanceClass)}" style="width:${Math.max(2, Math.min(100, Math.round(c.score)))}%"></div></div>
          </div>
          <div class="insight">${escapeHtml(c.aiInsight || "AI Insight: Bu haber benzer akislara gore siniflandirildi.")}</div>
        `;
        body.appendChild(card);
      }
    }
    el.newsList.appendChild(section);
  }

  if (totalRendered === 0) {
    const div = document.createElement("div");
    div.className = "empty";
    div.textContent = activeTab === "read" ? "Kayit yok." : "Okunmamis haber yok.";
    el.newsList.appendChild(div);
  }
  const kapReadSet = getSet(STORAGE_KEYS.kapRead);
  const kapVisible = getKapVisibleItems(kapItems, kapReadSet);
  const kapClusters = clusterKapItems(kapVisible, kapReadSet);
  renderDailySummary(clusters, kapClusters);
  setupKeyboardNavigation();
}

function applyCardAction(kind, action, ids, keyword, source, link) {
  const list = ids.filter(Boolean);
  if (kind === "news") {
    const readSet = getSet(STORAGE_KEYS.read);
    if (action === "toggleRead" && list.length) {
      const shouldRead = list.some((id) => !readSet.has(id));
      markNewsIdsRead(list, shouldRead);
      renderItems(latestItems);
      updateStatusCounts();
      return;
    }
  }
  if (kind === "kap") {
    const kapReadSet = getSet(STORAGE_KEYS.kapRead);
    if (action === "toggleRead" && list.length) {
      const shouldRead = list.some((id) => !kapReadSet.has(id));
      markKapIdsRead(list, shouldRead);
      renderKapItems(kapItems);
      const unreadCount = getKapUnreadItems().length;
      setKapStatus(`KAP okuma durumu guncellendi. Okunmamis: ${unreadCount}.`);
      return;
    }
  }
  if (action === "save" && list.length) {
    saveIds(list);
    if (kind === "kap") setKapStatus("Kayit favorilere eklendi.");
    else setStatus("Kayit favorilere eklendi.");
    return;
  }
  if (action === "muteKeyword" && muteKeyword(keyword)) {
    if (kind === "kap") {
      renderKapItems(kapItems);
      setKapStatus(`Keyword sessize alindi: ${keyword}`);
    } else {
      renderItems(latestItems);
      setStatus(`Keyword sessize alindi: ${keyword}`);
    }
    return;
  }
  if (action === "blockSource" && blockSource(source || link)) {
    if (kind === "kap") {
      renderKapItems(kapItems);
      setKapStatus("Kaynak engellendi.");
    } else {
      renderItems(latestItems);
      setStatus("Kaynak engellendi.");
    }
    return;
  }
  if (kind === "kap") setKapStatus("Aksiyon kaydedildi.");
  else setStatus("Aksiyon kaydedildi.");
}

function getActiveCards() {
  const root = activeMainTab === "kap" ? el.kapList : el.newsList;
  if (!root) return [];
  return Array.from(root.querySelectorAll(".news-card"));
}

function highlightSelectedCard() {
  const cards = getActiveCards();
  if (cards.length === 0) {
    selectedCardIndex = -1;
    return;
  }
  if (selectedCardIndex < 0) selectedCardIndex = 0;
  if (selectedCardIndex >= cards.length) selectedCardIndex = cards.length - 1;
  for (const card of cards) card.classList.remove("selected");
  const selected = cards[selectedCardIndex];
  if (selected) {
    selected.classList.add("selected");
    selected.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function runKeyboardAction(action) {
  const cards = getActiveCards();
  if (!cards.length) return;
  if (selectedCardIndex < 0 || selectedCardIndex >= cards.length) selectedCardIndex = 0;
  const card = cards[selectedCardIndex];
  if (!card) return;
  const kind = String(card.getAttribute("data-kind") || "news");
  const ids = parseIdList(card.getAttribute("data-ids"));
  const source = String(card.getAttribute("data-source") || "");
  const link = String(card.getAttribute("data-item-link") || "");

  if (action === "open" && link) {
    window.open(link, "_blank");
    return;
  }
  if (action === "mark") {
    applyCardAction(kind, "toggleRead", ids, "", source, link);
    return;
  }
  if (action === "save") {
    applyCardAction(kind, "save", ids, "", source, link);
  }
}

function setupKeyboardNavigation() {
  selectedCardIndex = -1;
  highlightSelectedCard();
  if (keyboardBound) return;
  keyboardBound = true;
  document.addEventListener("keydown", (ev) => {
    const target = ev.target;
    if (target instanceof HTMLElement) {
      const tag = target.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable) return;
    }
    if (ev.key === "j" || ev.key === "J") {
      ev.preventDefault();
      selectedCardIndex += 1;
      highlightSelectedCard();
      return;
    }
    if (ev.key === "k" || ev.key === "K") {
      ev.preventDefault();
      selectedCardIndex -= 1;
      highlightSelectedCard();
      return;
    }
    if (ev.key === "o" || ev.key === "O") {
      ev.preventDefault();
      runKeyboardAction("open");
      return;
    }
    if (ev.key === "m" || ev.key === "M") {
      ev.preventDefault();
      runKeyboardAction("mark");
      return;
    }
    if (ev.key === "s" || ev.key === "S") {
      ev.preventDefault();
      runKeyboardAction("save");
    }
  });
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
  if (el.unreadCountBadge) {
    el.unreadCountBadge.textContent = `Okunmamis: ${unreadCount}`;
  }
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
    const raw = await response.text();
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch (_) {
      const shortRaw = String(raw || "").replace(/\s+/g, " ").slice(0, 220);
      appendAiLog({
        level: "ERROR",
        keyword: item.keyword || "",
        title: item.title || "",
        message: `DeepSeek JSON degil (HTTP ${response.status}). ${shortRaw}`,
      });
      return null;
    }
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
  const aiAnalysisMap = getAiAnalysisMap();
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
    analysis.importance_score = normalizeImportanceScore(analysis.importance_score, level);
    aiLevels[item.id] = level;
    aiAnalysisMap[item.id] = analysis;
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
  saveAiAnalysisMap(aiAnalysisMap);
  renderItems(latestItems);
  return { analyzedCount, importantPushCount, autoReadCount, forcedUnreadCount };
}

async function scanAiBacklogNow() {
  const readSet = getSet(STORAGE_KEYS.read);
  const missingAnalysis = getMissingAiAnalysisItems(latestItems);
  const backlog = latestItems.filter((item) => !readSet.has(item.id)).filter((item) => missingAnalysis.some((m) => m.id === item.id));
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

async function hydrateFromBackgroundData() {
  try {
    const response = await fetch("background_data.php", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const data = await response.json();
    if (!data || !data.ok) return;

    if (data.news && Array.isArray(data.news.items) && data.news.items.length) {
      mergeLatestItems(data.news.items);
    }
    if (data.news && Array.isArray(data.news.logs) && data.news.logs.length) {
      mergeAiLogs(data.news.logs);
    }
    if (data.kap && Array.isArray(data.kap.items) && data.kap.items.length) {
      mergeKapItems(data.kap.items);
    }
    if (data.kap && Array.isArray(data.kap.logs) && data.kap.logs.length) {
      mergeKapLogs(data.kap.logs);
    }
    if (data.kap && data.kap.jobsState && typeof data.kap.jobsState === "object") {
      for (const [jobId, st] of Object.entries(data.kap.jobsState)) {
        if (!st || typeof st !== "object") continue;
        if (!kapJobState[jobId]) kapJobState[jobId] = {};
        const lastCheckedAt = Number(st.lastCheckedAt || 0);
        const nextRunAt = Number(st.nextRunAt || 0);
        if (lastCheckedAt > 0) kapJobState[jobId].lastCheckedAt = lastCheckedAt * 1000;
        if (nextRunAt > 0) kapJobState[jobId].nextRunAt = nextRunAt * 1000;
      }
      saveKapJobState();
      renderKapJobs();
    }
  } catch (_) {
    // ignore background data errors
  }
}

async function fetchNews() {
  const keywords = parseKeywords();
  const bannedWords = parseBannedWords();
  const interval = Number(el.interval.value || 120);
  const lang = (el.lang.value || "tr").trim();
  const country = (el.country.value || "TR").trim();

  setNextPollAt(Date.now() + Math.max(30, interval) * 1000);

  if (keywords.length === 0) {
    setStatus("En az bir keyword girin.", true);
    appendAiLog({
      level: "WARN",
      keyword: "-",
      title: "Google News sorgusu atlandi",
      message: "Keyword yok.",
    });
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
    bannedWords: bannedWords.join("\n"),
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
    appendAiLog({
      level: "ERROR",
      keyword: "-",
      title: "Google News istek hatasi",
      message: String(err),
    });
    return;
  }

  if (!data.ok) {
    setStatus(data.error || "Bilinmeyen hata", true);
    appendAiLog({
      level: "ERROR",
      keyword: "-",
      title: "Google News API hatasi",
      message: data.error || "Bilinmeyen hata",
    });
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
    const aiAnalysisMap = getAiAnalysisMap();
    const backlog = latestItems.filter((item) => !readSet.has(item.id) && (!aiSeenSet.has(item.id) || !aiAnalysisMap[item.id]));
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
  const filteredText = Number(data.filteredCount || 0) > 0 ? ` | Filtrelenen: ${Number(data.filteredCount || 0)}` : "";
  firstRun = false;
  appendAiLog({
    level: "INFO",
    keyword: "-",
    title: "Google News sorgu raporu",
    message: `Sorgu yapildi (${formatDateTime(Date.now())}). Yeni: ${newCount}, Toplam: ${latestItems.length}${data.errors && data.errors.length ? `, Uyari: ${data.errors.length}` : ""}`,
  });
  updateStatusCounts(
    `${newCount > 0 ? ` | Yeni: ${newCount}` : ""}${importantPushCount > 0 ? ` | AI Push: ${importantPushCount}` : ""}${veryImportantUnreadCount > 0 ? ` | Cok Onemli Okunmamis: ${veryImportantUnreadCount}` : ""}${filteredText}${errText}`
  );
}

function startPolling() {
  if (el.autoRefreshToggle && !el.autoRefreshToggle.checked) {
    stopPolling();
    setStatus("Otomatik yenile kapali.");
    return;
  }
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
  startCountdownTimer();
  if (lastFetchedAt > 0 && elapsed < intervalMs) {
    const remaining = intervalMs - elapsed;
    setNextPollAt(Date.now() + remaining);
    setStatus(`Kayitli veriler yuklendi. ${Math.ceil(remaining / 1000)} sn sonra yeni kontrol.`);
    pollDelayTimer = setTimeout(() => {
      setNextPollAt(Date.now() + intervalMs);
      fetchNews();
      pollTimer = setInterval(fetchNews, intervalMs);
    }, remaining);
  } else {
    setNextPollAt(Date.now() + intervalMs);
    fetchNews();
    pollTimer = setInterval(fetchNews, intervalMs);
  }
}

function ensureAutoPolling() {
  if (el.autoRefreshToggle && !el.autoRefreshToggle.checked) {
    stopPolling();
    return;
  }
  const keywords = parseKeywords();
  if (keywords.length === 0) {
    stopPolling();
    setStatus("Keyword bekleniyor. En az bir keyword girin.");
    return;
  }
  if (!pollTimer && !pollDelayTimer) {
    startPolling();
  }
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  if (pollDelayTimer) {
    clearTimeout(pollDelayTimer);
    pollDelayTimer = null;
  }
  saveRuntimePatch({ newsRunning: false });
  stopCountdownTimer();
}

if (el.refreshNowBtn) {
  el.refreshNowBtn.addEventListener("click", async () => {
    const interval = Number(el.interval.value || 120);
    await fetchNews();
    setNextPollAt(Date.now() + Math.max(30, interval) * 1000);
    setStatus("Manuel yenileme tamamlandi.");
  });
}

if (el.installAppBtn) {
  el.installAppBtn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    try {
      await deferredInstallPrompt.userChoice;
    } catch (_) {
      // ignore
    }
    deferredInstallPrompt = null;
    el.installAppBtn.classList.add("hidden");
  });
}

el.clearSeenBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEYS.seen);
  localStorage.removeItem(STORAGE_KEYS.read);
  localStorage.removeItem(STORAGE_KEYS.aiSeen);
  localStorage.removeItem(STORAGE_KEYS.aiLevels);
  localStorage.removeItem(STORAGE_KEYS.aiAnalysis);
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
  const groupToggle = target.closest(".group-toggle");
  if (groupToggle instanceof HTMLElement) {
    const section = groupToggle.closest(".importance-group");
    const body = section ? section.querySelector(".group-body") : null;
    if (body instanceof HTMLElement) {
      const willOpen = body.classList.contains("hidden");
      body.classList.toggle("hidden", !willOpen);
      groupToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
    }
    return;
  }
  const btn = target.closest(".news-action-btn");
  if (!(btn instanceof HTMLElement)) return;
  const action = btn.getAttribute("data-action") || "";
  const ids = parseIdList(btn.getAttribute("data-ids"));
  const keyword = btn.getAttribute("data-keyword") || "";
  const source = btn.getAttribute("data-source") || "";
  const link = btn.getAttribute("data-link") || "";
  applyCardAction("news", action, ids, keyword, source, link);
});

if (el.keywordTags) {
  el.keywordTags.addEventListener("click", (ev) => {
    const target = ev.target;
    if (!(target instanceof HTMLElement)) return;
    const removeBtn = target.closest(".tag-remove");
    if (!(removeBtn instanceof HTMLElement)) return;
    const kw = removeBtn.getAttribute("data-keyword") || "";
    removeKeyword(kw);
  });
}

if (el.addKeywordBtn) {
  el.addKeywordBtn.addEventListener("click", () => {
    const value = el.addKeywordInput ? el.addKeywordInput.value : "";
    if (addKeyword(value) && el.addKeywordInput) {
      el.addKeywordInput.value = "";
    }
  });
}

if (el.addKeywordInput) {
  el.addKeywordInput.addEventListener("keydown", (ev) => {
    if (ev.key !== "Enter") return;
    ev.preventDefault();
    if (addKeyword(el.addKeywordInput.value)) {
      el.addKeywordInput.value = "";
    }
  });
}

for (const inputEl of [el.keywords, el.bannedWords, el.interval, el.lang, el.country]) {
  if (!inputEl) continue;
  inputEl.addEventListener("input", () => {
    saveConfig();
    ensureAutoPolling();
  });
  inputEl.addEventListener("change", () => {
    saveConfig();
    ensureAutoPolling();
  });
}

if (el.feedSearchInput) {
  el.feedSearchInput.addEventListener("input", () => {
    if (activeMainTab === "kap") {
      renderKapItems(kapItems);
    } else {
      renderItems(latestItems);
    }
  });
}

if (el.autoRefreshToggle) {
  el.autoRefreshToggle.addEventListener("change", () => {
    saveConfig();
    ensureAutoPolling();
  });
}

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
    const groupToggle = target.closest(".group-toggle");
    if (groupToggle instanceof HTMLElement) {
      const section = groupToggle.closest(".importance-group");
      const body = section ? section.querySelector(".group-body") : null;
      if (body instanceof HTMLElement) {
        const willOpen = body.classList.contains("hidden");
        body.classList.toggle("hidden", !willOpen);
        groupToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
      }
      return;
    }
    const btn = target.closest(".kap-action-btn");
    if (!(btn instanceof HTMLElement)) return;
    const action = btn.getAttribute("data-action") || "";
    const ids = parseIdList(btn.getAttribute("data-ids"));
    const keyword = btn.getAttribute("data-keyword") || "";
    const source = btn.getAttribute("data-source") || "";
    const link = btn.getAttribute("data-link") || "";
    applyCardAction("kap", action, ids, keyword, source, link);
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
queueServerConfigSync();
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
setupPwaInstall();
renderKeywordTags();

hydrateFromBackgroundData();

const runtime = loadRuntime();
ensureAutoPolling();
if (runtime.kapRunning || kapJobs.length > 0) {
  startKapRandomTracking(true);
}


