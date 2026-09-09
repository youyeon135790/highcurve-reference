// 정적 배포본(서버 없음)용 API 대체 — data/items.json 을 브라우저에서 읽어 /api/* 를 흉내낸다. 읽기 전용.
(function () {
  const STATIC = { items: null, meta: null, brands: [], ready: null };
  const today = () => new Date();
  const dayDiff = (iso) => { if (!iso) return 99999; const d = new Date(iso.slice(0, 10) + "T00:00:00"); return Math.max(1, Math.floor((today() - d) / 86400000)); };
  async function load() {
    if (STATIC.ready) return STATIC.ready;
    STATIC.ready = (async () => {
      const [items, meta, brands] = await Promise.all([
        fetch("data/items.json").then(r => r.json()), fetch("data/meta.json").then(r => r.json()), fetch("data/brands.json").then(r => r.json()).catch(() => [])]);
      for (const it of items) { it.days_ago = dayDiff(it.posted_at); if (it.views) it.daily_views = Math.floor(it.views / it.days_ago); }
      STATIC.items = items; STATIC.meta = meta; STATIC.brands = brands;
    })();
    return STATIC.ready;
  }
  const num = (v) => { if (v == null || v === "") return null; const t = String(v).replace(/,/g, "").trim(); const m = t.match(/^([\d.]+)\s*(억|천만|백만|만|천|k|K|m|M)?$/); if (!m) return isNaN(Number(t)) ? null : Number(t); const mul = { "억": 1e8, "천만": 1e7, "백만": 1e6, "만": 1e4, "천": 1e3, k: 1e3, K: 1e3, m: 1e6, M: 1e6 }[m[2]] || 1; return Number(m[1]) * mul; };
  function listItems(qs) {
    let rows = STATIC.items;
    const g = (k) => qs.get(k) || "";
    if (g("platform")) rows = rows.filter(x => x.platform === g("platform"));
    if (g("kind")) { const ks = g("kind").split(","); rows = rows.filter(x => ks.includes(x.kind)); }
    if (g("creator")) rows = rows.filter(x => (x.creator_type || "creator") === g("creator"));
    if (g("paid") === "1") rows = rows.filter(x => x.paid);
    if (g("classified") === "1") rows = rows.filter(x => x.industry);
    if (g("industry")) { const inds = g("industry").split(","); rows = rows.filter(x => inds.includes(x.industry)); }
    if (g("source")) rows = rows.filter(x => x.source === g("source"));
    if (g("brand")) { const h = g("brand").replace(/^@/, "").toLowerCase(); rows = rows.filter(x => (x.account || "").toLowerCase() === h); }
    if (g("days")) { const d = Number(g("days")); rows = rows.filter(x => x.days_ago <= d); }
    for (const [col, lo, hi] of [["views", "min_views", "max_views"], ["likes", "min_likes", "max_likes"], ["comments", "min_comments", "max_comments"], ["followers", "min_followers", "max_followers"]]) {
      const a = num(g(lo)), b = num(g(hi));
      if (a != null) rows = rows.filter(x => x[col] != null && x[col] >= a);
      if (b != null) rows = rows.filter(x => x[col] != null && x[col] <= b);
    }
    if (g("q")) {
      const terms = g("q").toLowerCase().split(/\s+/).filter(Boolean);
      rows = rows.filter(x => { const hay = ((x.caption || "") + " " + (x.account || "") + " " + (x.account_name || "") + " " + (x.description || "") + " " + (x.tags || []).join(" ")).toLowerCase(); return terms.every(t => hay.includes(t)); });
    }
    const sort = g("sort") || "date";
    const key = { date: x => (x.posted_at || ""), views: x => x.views ?? -1, likes: x => x.likes ?? -1, ratio: x => (x.views && x.followers ? x.views / Math.max(x.followers, 1) : -1), daily: x => x.daily_views ?? -1, followers: x => x.followers ?? -1, golden: x => x.golden ?? -1 }[sort] || (x => (x.posted_at || ""));
    rows = rows.slice().sort((a, b) => { const ka = key(a), kb = key(b); return ka < kb ? 1 : ka > kb ? -1 : (b.id - a.id); });
    const cap = (STATIC.meta.config || {}).max_per_account || 0;
    if (cap && !g("brand") && !g("board")) { const seen = {}; rows = rows.filter(x => { const k = x.account || ""; seen[k] = (seen[k] || 0) + 1; return seen[k] <= cap; }); }
    const total = rows.length, limit = Number(g("limit") || 60), offset = Number(g("offset") || 0);
    return { items: rows.slice(offset, offset + limit), total };
  }
  function similar(id, limit) {
    const it = STATIC.items.find(x => x.id === id); if (!it) return [];
    const toks = [...new Set(((it.caption || "") + " " + (it.tags || []).join(" ")).match(/[가-힣A-Za-z]{2,}/g) || [])];
    const ham = (a, b) => { let n = 0; for (let i = 0; i < 16; i++) { let x = parseInt(a[i], 16) ^ parseInt(b[i], 16); while (x) { n += x & 1; x >>= 1; } } return n; };
    const out = STATIC.items.filter(x => x.id !== id && x.platform === it.platform && x.kind === it.kind && (it.industry ? x.industry === it.industry : !x.industry)).map(x => {
      const hay = (x.caption || "") + " " + (x.tags || []).join(" "); let s = toks.reduce((n, t) => n + (hay.includes(t) ? 1 : 0), 0);
      if (it.phash && x.phash) { const d = ham(it.phash, x.phash); s += d <= 8 ? 6 : d <= 14 ? 3 : 0; }
      return [s, x]; }).sort((a, b) => b[0] - a[0] || (b[1].views || 0) - (a[1].views || 0)).map(([, x]) => x);
    const cnt = {}, res = [];
    for (const x of out) { const k = x.account; cnt[k] = (cnt[k] || 0) + 1; if (cnt[k] <= 3) res.push(x); if (res.length >= limit) break; }
    return res;
  }
  function accounts(qs) {
    const q = (qs.get("q") || "").toLowerCase(), plat = qs.get("platform") || "instagram", limit = Number(qs.get("limit") || 10);
    const by = {};
    for (const x of STATIC.items) {
      if (x.platform !== plat || !x.account) continue;
      const hay = ((x.account || "") + " " + (x.account_name || "") + " " + (x.caption || "")).toLowerCase();
      if (!hay.includes(q)) continue;
      const a = by[x.account] || (by[x.account] = { handle: x.account, name: x.account_name, count: 0, max_views: 0, max_likes: 0, followers: x.followers, industry: x.industry, saved: STATIC.brands.some(b => b.handle === x.account) });
      a.count++; a.max_views = Math.max(a.max_views, x.views || 0); a.max_likes = Math.max(a.max_likes, x.likes || 0);
    }
    return Object.values(by).sort((a, b) => b.count - a.count || b.max_views - a.max_views).slice(0, limit);
  }
  function stats() {
    const cnt = (f) => { const m = {}; for (const x of STATIC.items) { const k = f(x); m[k] = (m[k] || 0) + 1; } return Object.entries(m).map(([k, n]) => ({ k, n })).sort((a, b) => b.n - a.n); };
    return { items: STATIC.items.length, brands: STATIC.brands.length, boards: 0, by_platform: cnt(x => x.platform), by_industry: cnt(x => x.industry || "미분류"), by_source: cnt(x => x.source) };
  }
  function trends2(qs) {
    const days = Number(qs.get("days") || 7), plat = qs.get("platform") || "", ind = qs.get("industry") || "";
    let rows = STATIC.items.filter(x => (!plat || x.platform === plat) && (!ind || x.industry === ind));
    const recent = rows.filter(x => x.days_ago <= days), prev = rows.filter(x => x.days_ago > days && x.days_ago <= days * 2), m30 = rows.filter(x => x.days_ago <= 30);
    const count = (arr, rx) => { const m = {}; for (const x of arr) for (const t of new Set(((x.caption || "").match(rx) || []).map(s => s.replace(/^#/, "")))) m[t] = (m[t] || 0) + 1; return m; };
    const kwR = count(recent, /[가-힣]{2,}/g), kwP = count(prev, /[가-힣]{2,}/g), tgR = count(recent, /#[^\s#]+/g);
    const keywords = Object.entries(kwR).filter(([k]) => k.length >= 2).map(([k, n]) => ({ k, n, up: n - (kwP[k] || 0) })).sort((a, b) => b.up - a.up || b.n - a.n).slice(0, 30);
    const hashtags = Object.entries(tgR).map(([k, n]) => ({ k, n })).sort((a, b) => b.n - a.n).slice(0, 30);
    const acc = {};
    for (const x of m30) { if (!x.account) continue; const a = acc[x.account] || (acc[x.account] = { k: x.account, name: x.account_name, platform: x.platform, n: 0, views: 0, likes: 0, followers: x.followers, cover: x.thumbnail }); a.n++; a.views += x.views || 0; a.likes += x.likes || 0; }
    const accounts = Object.values(acc).map(a => ({ ...a, eng: a.views ? (100 * a.likes / a.views).toFixed(1) : "0.0" })).sort((a, b) => b.views - a.views).slice(0, 20);
    const indm = {};
    for (const x of m30) { if (!x.industry) continue; const i = indm[x.industry] || (indm[x.industry] = { k: x.industry, n: 0, views: 0, likes: 0, nv: 0 }); i.n++; if (x.views) { i.views += x.views; i.nv++; } i.likes += x.likes || 0; }
    const industries = Object.values(indm).map(i => ({ k: i.k, n: i.n, avg_views: i.nv ? Math.round(i.views / i.nv) : 0, eng: i.views ? (100 * i.likes / i.views).toFixed(1) : "0.0" })).sort((a, b) => b.n - a.n);
    const bd = {};
    for (const x of rows.filter(x => x.days_ago <= Math.max(days, 14))) { const k = (x.posted_at || "").slice(0, 10); if (!k) continue; const d = bd[k] || (bd[k] = { k, views: 0, n: 0 }); d.views += x.views || 0; d.n++; }
    const by_day = Object.values(bd).sort((a, b) => a.k < b.k ? -1 : 1);
    const new_top = recent.filter(x => x.views).sort((a, b) => b.views - a.views).slice(0, 12);
    const golden = recent.filter(x => x.views && x.followers).sort((a, b) => (b.views / b.followers) - (a.views / a.followers)).slice(0, 12);
    return { keywords, hashtags, accounts, industries, by_day, new_top, golden, rising: [], snapshot_days: 0 };
  }
  // 배포본: 카드 '열기'/편집창 대신 릴스 상세창으로
  window.addEventListener("DOMContentLoaded", () => { window.openItem = (id) => window.openReel(id); });
  function planSubkeywords(q) {
    const toks = q.trim().split(/\s+/).filter(Boolean); if (!toks.length) return { keywords: [] };
    let rows = STATIC.items.filter(x => x.platform === "instagram" && toks.every(t => (x.caption || "").includes(t)));
    if (rows.length < 40) rows = rows.concat(STATIC.items.filter(x => x.platform === "instagram" && !rows.includes(x) && toks.some(t => (x.caption || "").includes(t))).slice(0, 300));
    const cnt = {}, docs = {};
    for (const x of rows.slice(0, 500)) {
      const cap = x.caption || ""; const tags = new Set((cap.match(/#([가-힣A-Za-z0-9_]{2,15})/g) || []).map(s => s.slice(1))); const words = new Set(cap.replace(/#\S+/g, "").match(/[가-힣]{2,6}/g) || []);
      for (const h of tags) { cnt[h] = (cnt[h] || 0) + 2; docs[h] = (docs[h] || 0) + 1; }
      for (const w of words) if (!tags.has(w)) { cnt[w] = (cnt[w] || 0) + 1; docs[w] = (docs[w] || 0) + 1; }
    }
    const stop = new Set([...toks, "그리고", "정말", "너무", "오늘", "이번", "여러분", "진짜", "그래서", "하지만", "있는", "없는", "합니다", "입니다", "해요", "있어요", "이거", "저희", "우리", "때문", "그냥", "이렇게", "하는", "되는", "제가", "저는", "그런", "이런", "모든", "많이", "같이", "함께", "위해", "대한", "통해", "다시", "지금", "바로", "여기", "하나", "사실", "혹시"]);
    const keywords = Object.entries(cnt).sort((a, b) => b[1] - a[1]).map(([k]) => k).filter(k => !stop.has(k) && docs[k] >= 2 && !toks.some(t => k.includes(t) || t.includes(k)) && !(k.length >= 3 && /[가이은는을를의에도만로과와]$/.test(k))).slice(0, 12);
    return { keywords, matched: rows.length };
  }
  function planRefs(q, tags, limit) {
    const terms = (q + " " + tags).split(/[\s,]+/).filter(Boolean).slice(0, 8); if (!terms.length) return { items: [] };
    const rows = STATIC.items.filter(x => x.platform === "instagram" && x.kind === "reel" && x.views >= 10000 && x.days_ago <= 365 && terms.some(t => (x.caption || "").includes(t)));
    rows.sort((a, b) => { const ha = terms.filter(t => (a.caption || "").includes(t)).length, hb = terms.filter(t => (b.caption || "").includes(t)).length; return hb - ha || (b.views || 0) - (a.views || 0); });
    const seen = new Set(), items = [];
    for (const r of rows) { if (seen.has(r.account)) continue; seen.add(r.account); items.push({ ...r, frames: !!r.frames, transcript: !!r.transcript }); if (items.length >= limit) break; }
    if (items.length) { items.reduce((a, b) => (b.views > a.views ? b : a)).label = "조회수 1위"; const eng = items.filter(x => x.views && x.likes); if (eng.length) { const e = eng.reduce((a, b) => (b.likes / b.views > a.likes / a.views ? b : a)); e.label = e.label || "참여율 1위"; } const n = items.reduce((a, b) => ((b.posted_at || "") > (a.posted_at || "") ? b : a)); n.label = n.label || "가장 최근"; }
    return { items, matched: rows.length };
  }
  // 서버 연결: localStorage.apiBase(또는 ?api=주소)가 있으면 배포본에서도 실제 서버 API를 쓴다 (같은 맥에서는 http://localhost:8787)
  try { const u = new URL(location.href); const a = u.searchParams.get("api"); if (a !== null) { if (a) localStorage.setItem("apiBase", a.replace(/\/$/, "")); else localStorage.removeItem("apiBase"); } } catch (e) {}
  window.apiBase = () => { try { return localStorage.getItem("apiBase") || ""; } catch (e) { return ""; } };
  window.connectServer = async (base) => {
    base = (base || "http://localhost:8787").replace(/\/$/, "");
    try { const r = await fetch(base + "/api/plans", { cache: "no-store" }); if (!r.ok) throw new Error(r.status); await r.json(); }
    catch (e) { alert("서버에 연결할 수 없어요: " + base + "\n(맥에서 하이커브 서버가 켜져 있어야 하고, 배포본은 같은 맥의 localhost 만 허용됩니다)"); return false; }
    localStorage.setItem("apiBase", base); location.reload(); return true;
  };
  window.disconnectServer = () => { localStorage.removeItem("apiBase"); location.reload(); };
  window.staticApi = async function (p, opt) {
    const base = window.apiBase();
    if (base) {
      const u = new URL(p, location.href); const path = u.pathname.replace(/^.*\/api\//, "/api/") + (u.search || "");
      const r = await fetch(base + path, opt); const j = await r.json();
      if (j && j.need_login) { if (typeof toast === "function") toast(j.error); location.hash = "#/login"; throw new Error(j.error); }
      if (j && j.error) throw new Error(j.error); return j;
    }
    await load();
    const method = (opt && opt.method) || "GET";
    if (method !== "GET") throw new Error("체험판(배포본)에서는 여기까지예요. 영상 분석·기획안 생성은 하이커브 서버에서만 됩니다");
    const u = new URL(p, location.href); const path = u.pathname.replace(/^.*\/api\//, "/api/"); const qs = u.searchParams;
    if (path === "/api/meta") return { ...STATIC.meta, adapters: {}, static: true };
    if (path === "/api/stats") return stats();
    if (path === "/api/items") return listItems(qs);
    let m = path.match(/^\/api\/items\/(\d+)\/similar$/); if (m) return similar(Number(m[1]), Number(qs.get("limit") || 12));
    m = path.match(/^\/api\/items\/(\d+)$/); if (m) { const it = STATIC.items.find(x => x.id === Number(m[1])); if (!it) throw new Error("없음"); return it; }
    if (path === "/api/accounts") return accounts(qs);
    if (path === "/api/brands") return STATIC.brands;
    if (path === "/api/boards") return [];
    if (path === "/api/plans") return [];
    if (path === "/api/auth/me") return { user: null, open: false, plans: {}, categories: [] };
    if (path === "/api/inquiries") return [];
    if (path === "/api/plan/subkeywords") return planSubkeywords(qs.get("q") || "");
    if (path === "/api/plan/refs") return planRefs(qs.get("q") || "", qs.get("tags") || "", Number(qs.get("limit") || 12));
    if (path === "/api/trends2") return trends2(qs);
    if (path === "/api/config") return STATIC.meta.config || {};
    throw new Error("정적 배포본에서는 지원하지 않는 기능입니다");
  };
})();
