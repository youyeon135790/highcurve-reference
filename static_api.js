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
  const num = (v) => (v == null || v === "" ? null : Number(v));
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
    const toks = [...new Set(((it.caption || "") + " " + (it.tags || []).join(" ")).match(/[가-힣A-Za-z]{2,}/g) || [])].slice(0, 12);
    const score = (x) => { if (x.id === id || x.platform !== it.platform) return -1; const hay = (x.caption || "") + " " + (x.tags || []).join(" "); let s = toks.reduce((n, t) => n + (hay.includes(t) ? 1 : 0), 0); if (x.industry && x.industry === it.industry) s += 0.5; return s; };
    const out = STATIC.items.map(x => [score(x), x]).filter(([s]) => s > 0).sort((a, b) => b[0] - a[0] || (b[1].views || 0) - (a[1].views || 0)).map(([, x]) => x);
    const cnt = {}, res = [];
    for (const x of out) { const k = x.account; cnt[k] = (cnt[k] || 0) + 1; if (cnt[k] <= 2) res.push(x); if (res.length >= limit) break; }
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
  window.staticApi = async function (p, opt) {
    await load();
    const method = (opt && opt.method) || "GET";
    if (method !== "GET") throw new Error("읽기 전용 배포본입니다 (수집·저장은 원본 서버에서만 가능)");
    const u = new URL(p, location.href); const path = u.pathname.replace(/^.*\/api\//, "/api/"); const qs = u.searchParams;
    if (path === "/api/meta") return { ...STATIC.meta, adapters: {}, static: true };
    if (path === "/api/stats") return stats();
    if (path === "/api/items") return listItems(qs);
    let m = path.match(/^\/api\/items\/(\d+)\/similar$/); if (m) return similar(Number(m[1]), Number(qs.get("limit") || 12));
    m = path.match(/^\/api\/items\/(\d+)$/); if (m) { const it = STATIC.items.find(x => x.id === Number(m[1])); if (!it) throw new Error("없음"); return it; }
    if (path === "/api/accounts") return accounts(qs);
    if (path === "/api/brands") return STATIC.brands;
    if (path === "/api/boards") return [];
    if (path === "/api/trends2") return trends2(qs);
    if (path === "/api/config") return STATIC.meta.config || {};
    throw new Error("정적 배포본에서는 지원하지 않는 기능입니다");
  };
})();
