// ✍️ 릴스 기획 — 5단계 고르기(직업 → 타깃 → 키워드 → 참고 릴스 → 주제) → 기획안. 레퍼런스 최대 3개, 캡컷 기준.
(function () {
  const W = { step: 1, job: "", target: [], keyword: "", subs: [], selSubs: [], refs: [], topic: "", topics: [], extra: {}, refsCache: [], urls: "" };
  try { Object.assign(W, JSON.parse(localStorage.getItem("planWiz") || "{}")); } catch (e) {}
  const save = () => { try { localStorage.setItem("planWiz", JSON.stringify({ ...W, refsCache: W.refsCache.slice(0, 24), topics: W.topics.slice(0, 10) })); } catch (e) {} };
  const JOBS = ["카페·베이커리", "식당·요식업", "뷰티샵·네일", "피부과·병원", "헬스·필라테스", "강사·코치", "인플루언서", "쇼핑몰·공동구매", "N잡러·프리랜서", "보험·금융", "부동산·공인중개사", "육아맘·주부", "개발자·IT", "여행·숙박업"];
  const AGES = ["10대", "20대", "30대", "40대", "50대+"]; const LIFE = ["직장인", "자영업 사장님", "학생", "주부", "육아맘", "자취생", "커플·신혼", "운동하는 사람", "창업 준비"];
  const HOOKS = ["질문형", "숫자형", "반전형", "고백형", "금지형", "발견형", "비교형", "경고형"];
  const STATIC = !!window.staticApi && !(window.apiBase && window.apiBase());
  const CONNECTED = !!(window.apiBase && window.apiBase());
  const connectBox = () => STATIC ? `<div class="panel warn" style="margin:8px 0"><b>체험판(배포본)이라 AI·영상 분석·기획안 생성이 안 돼요.</b><div class="muted" style="margin:4px 0 8px">이 맥에서 하이커브 서버(localhost:8787)가 켜져 있으면 아래 버튼으로 연결해 배포본에서도 전부 쓸 수 있어요. 다른 컴퓨터라면 서버 주소를 넣어주세요.</div><div class="row"><button class="btn p small" onclick="connectServer('http://localhost:8787')">🔌 이 맥의 서버 연결</button><input id="srv-url" class="wiz-input" style="max-width:280px;padding:6px 10px;font-size:13px" placeholder="서버 주소 (예: https://내서버:8787)"><button class="btn small" onclick="connectServer($('#srv-url').value)">연결</button></div></div>` : CONNECTED ? `<div class="muted" style="font-size:12px;margin:4px 0">🔌 서버 연결됨: ${esc(window.apiBase())} <a href="#" onclick="event.preventDefault();disconnectServer()">끊기</a></div>` : "";
  const post = (p, body) => api(p, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const pill = (v, on, fn, extra = "") => `<button class="pill ${on ? "on" : ""}" onclick="${fn}" ${extra}>${esc(v)}</button>`;

  window.viewPlanWizard = async function (arg) {
    if (arg) { const p = await api("/api/plans/" + arg); CUR = p; return renderPlan2(p); }
    // 릴스 상세창에서 담아둔 바구니 → 참고 릴스에 자동 반영
    const basket = (window.PLANREFS ? PLANREFS() : []).slice(0, 3); W.basketSeen = W.basketSeen || [];
    for (const id of basket) if (!W.basketSeen.includes(id) && !W.refs.includes(id) && W.refs.length < 3) { W.refs.push(id); W.basketSeen.push(id); }
    save(); renderWizard();
  };
  window.wizGo = (n) => { W.step = Math.max(1, Math.min(5, n)); save(); renderWizard(); };
  window.wizSet = (k, v) => { W[k] = v; save(); renderWizard(); };
  window.wizToggle = (k, v, max) => { const a = W[k]; const i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else { if (max && a.length >= max) return toast(`최대 ${max}개까지`); a.push(v); } save(); renderWizard(); };
  window.wizInput = (k, el) => { W[k] = el.value; save(); };
  window.wizExtra = (k, el) => { W.extra[k] = el.value; save(); };

  async function renderWizard() {
    const s = W.step; const pct = (s / 5) * 100;
    const head = `<div class="wiz-head"><div class="wiz-top"><button class="btn ghost" onclick="wizGo(${s - 1})" ${s === 1 ? "disabled" : ""}>←</button><div class="wiz-step">STEP ${s} OF 5</div><a class="btn ghost" href="#/plan" onclick="wizReset(event)">처음부터</a></div><div class="wiz-bar"><i style="width:${pct}%"></i></div></div>`;
    let body = "", next = "";
    if (s === 1) {
      body = `<h1>지금 어떤 일을 하고 계세요?</h1><p class="muted">대본의 말하는 사람(화자) 관점을 정하는 데 씁니다.</p>
      <div class="pills">${JOBS.map(j => pill(j, W.job === j, `wizSet('job','${esc(j)}')`)).join("")}</div>
      <label class="wiz-label">목록에 없으면 직접 적어주세요</label><input class="wiz-input" placeholder="예: 공인중개사, 꽃집 사장" value="${JOBS.includes(W.job) ? "" : esc(W.job)}" oninput="wizInput('job', this)">`;
      next = `<button class="btn p big" onclick="${W.job ? "wizGo(2)" : "toast('직업을 골라주세요')"}">다음</button>`;
    } else if (s === 2) {
      body = `<h1>누구에게 보여주고 싶어요?</h1><p class="muted">나이와 상황을 같이 고를 수 있어요 (여러 개 가능).</p>
      <div class="pills">${AGES.map(a => pill(a, W.target.includes(a), `wizToggle('target','${a}')`)).join("")}</div><div class="wiz-sub">라이프스타일</div>
      <div class="pills">${LIFE.map(a => pill(a, W.target.includes(a), `wizToggle('target','${a}')`)).join("")}</div>
      <label class="wiz-label">직접 적기</label><input class="wiz-input" placeholder="예: 릴스 올려도 조회수 300 나오는 사장님" value="${esc(W.extra.target_free || "")}" oninput="wizExtra('target_free', this)">`;
      next = `<button class="btn p big" onclick="${W.target.length || W.extra.target_free ? "wizGo(3)" : "toast('타깃을 하나 이상 골라주세요')"}">다음</button>`;
    } else if (s === 3) {
      body = `<h1>핵심 키워드 하나만 적어주세요.</h1>${connectBox()}<p class="muted">이 키워드로 우리 저장소(릴스 ${fmt(META?.stats?.items || 9000)}개)에서 같이 쓰인 단어를 뽑고, 참고 릴스를 찾아요.</p>
      <div class="row"><input id="wiz-kw" class="wiz-input" placeholder="예: 카페 신메뉴, 릴스 만드는 법, 홈트" value="${esc(W.keyword)}" oninput="wizInput('keyword', this)" onkeydown="if(event.key==='Enter')wizSubs()"><button class="btn p" onclick="wizSubs()">✨ 서브 키워드 뽑기</button></div>
      <div class="wiz-sub">서브 키워드 ${W.subs.length ? (W.subsSource === "cli" || W.subsSource === "api" ? '<span class="tag ok">🤖 AI가 뽑음</span>' : '<span class="tag">📊 저장소 통계</span>') : ""}<small class="muted">${W.subs.length ? `${W.selSubs.length}/${W.subs.length} 선택 · 눌러서 켜고 끄기` : "키워드를 넣고 뽑기를 누르세요 (AI가 5~10초)"}</small></div>
      <div class="pills" id="wiz-subs">${W.subs.map(k => pill("#" + k, W.selSubs.includes(k), `wizToggle('selSubs','${esc(k)}')`)).join("")}</div>`;
      next = `<button class="btn p big" onclick="${W.keyword ? "wizGo(4)" : "toast('키워드를 적어주세요')"}">참고 릴스 고르기 →</button>`;
    } else if (s === 4) {
      body = await renderRefsStep();
      next = `<button class="btn p big" id="wiz-next4" onclick="${W.refs.length ? "wizAnalyzeThenTopics()" : "toast('참고 릴스를 1개 이상 골라주세요')"}">주제 고르기 →</button>`;
    } else {
      body = renderTopicStep();
      next = STATIC ? `<button class="btn p big" disabled title="체험판에서는 생성 불가">✨ 기획안 만들기 (서버 연결 필요)</button>` : `<button class="btn p big" id="wiz-make" onclick="wizMake()">✨ 기획안 만들기</button>`;
    }
    $("#main").innerHTML = `<div class="wiz">${head}<div class="wiz-body">${body}</div><div class="wiz-foot"><button class="btn big" onclick="wizGo(${s - 1})" ${s === 1 ? "disabled" : ""}>이전</button>${next}</div></div>`;
    if (s === 4 && !W.refsCache.length && (W.keyword || W.selSubs.length)) wizSearchRefs();
  }
  window.wizReset = (e) => { e.preventDefault(); Object.assign(W, { step: 1, job: "", target: [], keyword: "", subs: [], selSubs: [], refs: [], topic: "", topics: [], extra: {}, refsCache: [], urls: "" }); save(); renderWizard(); };

  window.wizSubs = async function () {
    W.keyword = ($("#wiz-kw") || {}).value || W.keyword; if (!W.keyword) return toast("키워드를 적어주세요");
    const box = $("#wiz-subs"); if (box) box.innerHTML = '<span class="muted">뽑는 중…</span>';
    const tgt = [...W.target, W.extra.target_free].filter(Boolean).join(", ");
    const r = await api("/api/plan/subkeywords?q=" + encodeURIComponent(W.keyword) + "&job=" + encodeURIComponent(W.job) + "&target=" + encodeURIComponent(tgt)).catch(() => ({ keywords: [] }));
    W.subs = r.keywords || []; W.selSubs = W.subs.slice(0, 5); W.refsCache = []; W.subsSource = r.source || (STATIC ? "static" : "db"); save(); renderWizard();
    if (!W.subs.length) toast("같이 쓰인 단어를 못 찾았어요. 키워드만으로 검색합니다");
  };

  async function renderRefsStep() {
    const sel = W.refs;
    const cards = W.refsCache.map(x => refCard(x, sel.includes(x.id))).join("");
    return `<h1>참고할 릴스를 골라주세요 <small class="muted">(최대 3개)</small></h1>${connectBox()}<p class="muted">키워드로 우리 저장소에서 찾은 인기 릴스예요. 고른 릴스의 컷·자막·대사·효과음을 뜯어서 내 기획안에 옮깁니다.</p>
    <div class="pills small">${[W.keyword, ...W.selSubs].filter(Boolean).map(k => `<span class="pill on">#${esc(k)}</span>`).join("")}<button class="btn small" onclick="wizSearchRefs()">↻ 다시 찾기</button>${STATIC ? "" : `<button class="btn small" onclick="wizLiveSearch()">🌐 인스타에서 새로 찾기</button>`}</div>
    <div class="wiz-sel">${sel.length ? `선택 ${sel.length}/3 · ` + sel.map(id => `<span class="pill on tiny" onclick="wizPick(${id})">@${esc((W.refsCache.find(x => x.id === id) || {}).account || id)} ✕</span>`).join(" ") : "아직 고른 릴스가 없어요"}</div>
    <div id="wiz-refs-note" class="muted" style="font-size:12px;margin:2px 0 8px">${W.refsCache.length ? (W.refsSource && W.refsSource !== "db" ? "🤖 AI 추천순 · 카드의 파란 글은 고른 이유" : "📊 저장소 기본 순서 · AI가 곧 다시 정렬합니다") : ""}</div>
    <div class="refgrid" id="wiz-refs">${cards || '<div class="muted" style="padding:30px;text-align:center" id="wiz-refs-msg">저장소에서 찾는 중… (1~2초)</div>'}</div>
    <div class="panel soft" style="margin-top:14px"><b>🔗 링크로 직접 넣기</b> <small class="muted">인스타 릴스 링크를 한 줄에 하나씩 (남은 자리 ${3 - sel.length}개)</small>
    <div class="row" style="margin-top:8px;align-items:flex-start"><textarea class="wiz-input" rows="2" placeholder="https://www.instagram.com/reel/..." oninput="wizInput('urls', this)">${esc(W.urls || "")}</textarea><button class="btn" onclick="wizAddUrls()">분석해서 담기</button></div><div id="wiz-url-msg" class="muted"></div></div>`;
  }
  function refCard(x, on) {
    return `<div class="refcard ${on ? "on" : ""}" onclick="wizPick(${x.id})">
      <div class="rc-thumb">${x.thumbnail ? `<img src="${esc(x.thumbnail)}" loading="lazy" onerror="this.remove()">` : ""}${x.label ? `<span class="rc-label">${esc(x.label)}</span>` : x.fill ? `<span class="rc-label soft">같은 카테고리</span>` : ""}<span class="rc-check">${on ? "✓" : ""}</span>${on ? '<span class="rc-on">선택됨</span>' : ""}</div>
      <div class="rc-body"><div class="rc-acc">@${esc(x.account || "")} ${x.frames ? '<span class="tag">분석됨</span>' : ""}</div><div class="rc-desc">${esc(x.description || (x.caption || "").slice(0, 60))}</div>${x.why ? `<div class="rc-why">🤖 ${esc(x.why)}</div>` : ""}
      <div class="rc-meta">▶ ${fmt(x.views)} · ❤ ${fmt(x.likes)} · ${esc((x.posted_at || "").slice(0, 10))}</div>
      <div class="rc-actions"><a class="btn small" href="${esc(x.url || "https://www.instagram.com/reel/")}" target="_blank" onclick="event.stopPropagation()">원본 ↗</a><button class="btn small" onclick="event.stopPropagation();openReel(${x.id})">자세히</button></div></div></div>`;
  }
  window.wizPick = (id) => { const i = W.refs.indexOf(id); if (i >= 0) W.refs.splice(i, 1); else { if (W.refs.length >= 3) return toast("참고 릴스는 최대 3개예요"); W.refs.push(id); } save(); renderWizard(); };
  let REFS_SEQ = 0;
  window.wizSearchRefs = async function () {
    const seq = ++REFS_SEQ; const tgt = [...W.target, W.extra.target_free].filter(Boolean).join(", ");
    const qsBase = "q=" + encodeURIComponent(W.keyword) + "&tags=" + encodeURIComponent(W.selSubs.join(",")) + "&job=" + encodeURIComponent(W.job) + "&target=" + encodeURIComponent(tgt) + "&limit=24";
    const keepSelected = async (items) => { for (const id of W.refs) if (!items.find(x => x.id === id)) { try { const full = await api("/api/items/" + id); items.unshift({ ...full, frames: !!full.frames }); } catch (e) {} } return items; };
    // 1단계: 저장소에서 바로 (1초)
    try {
      const r = await api("/api/plan/refs?fast=1&" + qsBase); if (seq !== REFS_SEQ) return;
      W.refsCache = await keepSelected(r.items || []); W.refsSource = "db"; save(); renderWizard();
    } catch (e) {}
    if (STATIC) return;
    // 2단계: AI가 직업·타깃에 맞게 골라 이유 붙임 (30~40초) — 끝나면 교체
    const note = $("#wiz-refs-note"); if (note) note.textContent = "🤖 AI가 이 직업·타깃에 맞는 순서로 고르는 중… (30~40초, 먼저 뜬 목록은 저장소 기본 순서)";
    try {
      const r = await api("/api/plan/refs?" + qsBase); if (seq !== REFS_SEQ) return;
      if ((r.items || []).length) { W.refsCache = await keepSelected(r.items); W.refsSource = r.source || "ai"; save(); renderWizard(); }
    } catch (e) { const n = $("#wiz-refs-note"); if (n) n.textContent = "AI 정렬 실패: " + e.message; }
  };
  window.wizLiveSearch = async function () {
    toast("인스타에서 새로 찾는 중… (30초)");
    try { await post("/api/search/live", { q: W.keyword, pages: 4, top_accounts: 4 }); } catch (e) { return toast("실패: " + e.message); }
    wizSearchRefs();
  };
  window.wizAddUrls = async function () {
    const urls = (W.urls || "").split(/\s+/).filter(u => /instagram\.com/.test(u)).slice(0, 3 - W.refs.length);
    if (!urls.length) return toast("인스타 릴스 링크를 넣어주세요 (남은 자리 " + (3 - W.refs.length) + ")");
    const m = $("#wiz-url-msg");
    for (let i = 0; i < urls.length; i++) {
      m.textContent = `분석 중 ${i + 1}/${urls.length} — 영상 받고, 컷·자막·대사·효과음 뽑는 중 (20~40초)`;
      try { const r = await post("/api/analyze", { url: urls[i] }); if (r.error) throw new Error(r.error); if (r.id && !W.refs.includes(r.id)) W.refs.push(r.id); const full = await api("/api/items/" + r.id); W.refsCache.unshift({ ...full, frames: true, label: "직접 추가" }); }
      catch (e) { toast("분석 실패: " + e.message); }
    }
    W.urls = ""; save(); renderWizard();
  };

  // 4→5: 고른 릴스 중 아직 안 뜯은 것(대본·컷 분석 없음)은 먼저 분석해서 주제가 실제 대본·구조를 보고 나오게
  window.wizAnalyzeThenTopics = async function () {
    const b = $("#wiz-next4"); if (b) b.disabled = true;
    let n = 0;
    for (const id of W.refs) {
      const c = W.refsCache.find(x => x.id === id); if (c && c.frames) continue;
      try {
        const it = await api("/api/items/" + id); if (it.frames) { if (c) c.frames = true; continue; }
        n++; if (b) b.textContent = `@${it.account} 영상 뜯는 중… 대본·컷·자막 (20~40초)`;
        const r = await post("/api/analyze", { url: it.url }); if (r.error) throw new Error(r.error); if (c) c.frames = true;
      } catch (e) { toast("분석 건너뜀: " + e.message); }
    }
    W.topics = []; save(); wizGo(5);
  };
  let TOPICS_LOADING = false;
  function renderTopicStep() {
    const t = W.topics || [];
    if (!t.length && !TOPICS_LOADING && W.refs.length && !STATIC) setTimeout(() => wizTopics(), 50);
    return `<h1>어떤 주제로 찍을까요?</h1>${connectBox()}<p class="muted">고른 참고 릴스의 구조에서 뽑은 주제예요. 하나 고르거나 직접 적어주세요. 첫 문장(훅)은 ${HOOKS.join("·")} 중 골고루 나옵니다.</p>
    <div class="row" style="margin-bottom:10px"><button class="btn" onclick="wizTopics()">✨ 추천 주제 ${t.length ? "다시 뽑기" : "뽑기"}</button><span id="wiz-topic-msg" class="muted">${!t.length && !STATIC ? "준희 님 노하우(훅 공식·타깃 문제)를 적용해 주제 뽑는 중… (20~30초)" : STATIC ? "체험판에서는 주제 추천이 안 돼요. 직접 적어주세요." : ""}</span></div>
    <div class="topics">${t.map((x, i) => `<div class="topic ${W.topic === x.title ? "on" : ""}" onclick="wizSet('topic','${esc(x.title).replace(/'/g, "\\'")}')"><b>${esc(x.title)}</b><div class="muted">${esc(x.from || "")}${x.hook_type ? ` · <span class="tag">${esc(x.hook_type)}</span>` : ""}</div></div>`).join("")}</div>
    <label class="wiz-label">직접 적기 (비워두면 AI가 레퍼런스 구조에서 정합니다)</label><input class="wiz-input" placeholder="예: 조회수 800 나오던 카페 릴스, 첫 문장 바꿨더니 11만" value="${t.find(x => x.title === W.topic) ? "" : esc(W.topic)}" oninput="wizInput('topic', this)">
    <details class="wiz-more" ${Object.values(W.extra).some(Boolean) ? "open" : ""}><summary>더 좋은 결과를 원하면 (선택) — 내 재료 넣기</summary>
      <div class="two">
        <label>내 말투 <input class="wiz-input" placeholder="예: 존댓말, 담백하게 / 반말, 텐션 높게" value="${esc(W.extra.tone || "")}" oninput="wizExtra('tone', this)"></label>
        <label>내가 실제로 겪은 장면 1개 <input class="wiz-input" placeholder="예: 신메뉴 릴스 30개 올렸는데 최고 800" value="${esc(W.extra.scene || "")}" oninput="wizExtra('scene', this)"></label>
        <label>쓸 수 있는 숫자·사례 <input class="wiz-input" placeholder="예: 3년, 손님 1만 명, 조회수 11만" value="${esc(W.extra.numbers || "")}" oninput="wizExtra('numbers', this)"></label>
        <label>마지막에 시키고 싶은 것 <input class="wiz-input" placeholder="저장 / 댓글 / 팔로우 / DM / 프로필 링크" value="${esc(W.extra.cta || "")}" oninput="wizExtra('cta', this)"></label>
        <label>촬영 환경 <input class="wiz-input" placeholder="예: 얼굴 노출 OK, 매장, 화면녹화 가능" value="${esc(W.extra.shooting || "")}" oninput="wizExtra('shooting', this)"></label>
        <label>영상 길이(초) <input class="wiz-input" placeholder="30" value="${esc(W.extra.length || "")}" oninput="wizExtra('length', this)"></label>
      </div></details>
    <div class="row" style="margin:6px 0 10px;gap:8px;align-items:center"><span class="muted" style="font-size:12px">생성 모드</span>${pill("⚡ 빠름 (1~2분)", W.mode === "fast", "wizSet('mode','fast')")}${pill("🎯 정밀 (3~4분, 추천)", W.mode !== "fast", "wizSet('mode','precise')")}</div>
    <div class="wiz-summary"><b>정리</b> ${esc(W.job)} → ${esc(W.target.join(", "))}${W.extra.target_free ? " · " + esc(W.extra.target_free) : ""} · #${esc(W.keyword)} ${W.selSubs.map(k => "#" + esc(k)).join(" ")} · 참고 릴스 ${W.refs.length}개</div>`;
  }
  const brief = () => ({ job: W.job, target: [...W.target, W.extra.target_free].filter(Boolean).join(", "), keyword: [W.keyword, ...W.selSubs].filter(Boolean).join(", "), topic: W.topic, length: W.extra.length || 30, tone: W.extra.tone, scene: W.extra.scene, numbers: W.extra.numbers, cta: W.extra.cta, shooting: W.extra.shooting });
  window.wizTopics = async function () {
    if (TOPICS_LOADING) return; TOPICS_LOADING = true;
    const m = $("#wiz-topic-msg"); if (m) m.textContent = "준희 님 노하우(훅 공식·타깃 문제)를 적용해 주제 뽑는 중… (20~30초)";
    try {
      const r = await post("/api/plan/topics", { ids: W.refs, brief: brief() });
      if (r.need_key) { if (m) m.textContent = "AI 엔진이 없어 추천은 건너뜁니다. 주제를 직접 적어주세요 (비워도 돼요)"; return; }
      if (r.error) throw new Error(r.error);
      W.topics = r.topics || []; save(); if (!W.topics.length && m) m.textContent = "추천이 비어 왔어요. 다시 뽑기를 눌러주세요";
    } catch (e) { if (m) m.textContent = "실패: " + e.message + " — 다시 뽑기를 눌러주세요"; }
    finally { TOPICS_LOADING = false; if (W.topics.length) renderWizard(); }
  };
  window.wizMake = async function () {
    if (!W.refs.length) return toast("참고 릴스를 골라주세요");
    const b = $("#wiz-make"); b.disabled = true; b.textContent = "준비 중…";
    // 아직 분석 안 된 참고 릴스는 먼저 분석(컷·자막·대사·효과음)
    for (const id of W.refs) {
      const c = W.refsCache.find(x => x.id === id); if (c && c.frames) continue;
      try { const it = await api("/api/items/" + id); if (it.frames) continue; b.textContent = `@${it.account} 영상 뜯는 중… (20~40초)`; await post("/api/analyze", { url: it.url }); }
      catch (e) { toast("분석 건너뜀: " + e.message); }
    }
    b.textContent = "기획안 쓰는 중… (3~6분, 프레임을 하나씩 보고 씁니다)";
    try {
      const t0 = Date.now(); const tick = setInterval(() => { const el = $("#wiz-make"); if (el) el.textContent = `기획안 쓰는 중… ${Math.round((Date.now() - t0) / 1000)}초 (${W.mode === "fast" ? "보통 1~2분" : "보통 3~4분"})`; }, 1000);
      const r = await post("/api/plan", { ids: W.refs, brief: brief(), mode: W.mode || "precise" }).finally(() => clearInterval(tick));
      if (r.error) throw new Error(r.error);
      location.hash = "#/plan/" + r.id;
    } catch (e) { toast("실패: " + e.message); b.disabled = false; b.textContent = "✨ 기획안 만들기"; }
  };

  // ---------------- 결과 화면: [내 릴스 기획안] [레퍼런스 뜯어보기] [전문가용]
  let TAB = "plan"; let CUR = null;
  window.planJson = () => JSON.stringify((CUR && (CUR.plan || CUR)) || {}, null, 1);
  window.planTab = (t) => { TAB = t; renderPlan2(CUR); };
  function renderPlan2(p) {
    CUR = p;
    const plan = p.plan || null; const refs = p.refs || []; const done = !!plan;
    const title = plan ? plan.title : ((p.brief || {}).topic || ((p.brief || {}).keyword || "기획 준비").split(",")[0]);
    const tabs = [["plan", "✅ 내 릴스 기획안"], ["refs", "🔍 레퍼런스 뜯어보기"], ["pro", "🧠 전문가용"]];
    let body = "";
    if (TAB === "refs") body = renderRefsTab(p);
    else if (TAB === "pro") body = done ? renderProTab(plan, p) : promptBox(p);
    else body = done ? renderPlanTab(plan, p) : promptBox(p);
    $("#main").innerHTML = `<div class="plan-hero"><a class="btn ghost" href="#/plan">← 기획</a><div class="ph-title"><span class="ph-kicker">${done ? "내 릴스 기획안" : "프롬프트 패키지"} · ${esc(p.created_at || "")}</span><h1>${esc(title)}</h1>${plan && plan.one_line ? `<p>${esc(plan.one_line)}</p>` : ""}${plan && plan.thumbnail_text ? `<div class="ph-thumbtext">썸네일 문구 <b>${esc(plan.thumbnail_text)}</b></div>` : ""}</div>
      <div class="ph-actions"><a class="btn" href="/api/plans/${esc(p.id)}.csv">📊 엑셀</a><button class="btn" onclick="navigator.clipboard.writeText(planJson());toast('복사됨')">JSON</button><button class="btn d" onclick="planDelete('${esc(p.id)}')">삭제</button></div></div>
      <div class="tabs">${tabs.map(([k, v]) => `<button class="tab ${TAB === k ? "on" : ""}" onclick="planTab('${k}')">${v}</button>`).join("")}</div>${body}`;
  }
  window.planDelete = async (id) => { if (!confirm("이 기획안을 지울까요?")) return; await post("/api/plans/" + id + "/delete", {}); location.hash = "#/plan"; };
  function promptBox(p) {
    return `<div class="panel warn">${esc(p.message || "AI 키가 없어 기획안 자동 생성은 건너뛰었어요.")}<br><small class="muted">.env 에 ANTHROPIC_API_KEY 를 넣으면 버튼 한 번으로 끝납니다. 지금은 아래 프롬프트를 클로드에 붙여넣고, 나온 JSON을 아래 칸에 넣어 저장하세요. "레퍼런스 뜯어보기" 탭은 키 없이도 바로 볼 수 있어요.</small></div>
      <div class="panel" style="margin-top:10px"><div class="row"><b>프롬프트</b><button class="btn small" onclick="navigator.clipboard.writeText($('#plan-prompt').value);toast('복사됨')">복사</button></div><textarea id="plan-prompt" rows="10" class="wiz-input mono">${esc("[하이커브 기획 원칙]\n" + (p.principles || "") + "\n\n" + (p.prompt || "") + "\n\n위 원칙과 레퍼런스로 하이커브 양식(JSON) 기획안을 만들어줘.")}</textarea></div>
      <div class="panel" style="margin-top:10px"><b>클로드가 준 기획안 JSON 붙여넣기</b><textarea id="plan-json" rows="5" class="wiz-input mono" placeholder='{"title": ...}'></textarea><button class="btn p" style="margin-top:6px" onclick="savePlanJson('${esc(p.id)}')">저장</button></div>`;
  }
  // 구도 스케치(SVG): 9:16 프레임 + 피사체 실루엣 + 자막 위치
  function sketch(f) {
    f = f || {}; const shot = f.shot || "", subj = f.subject || "", pos = f.text_pos || "하단";
    const W = 90, H = 160; let body = "";
    if (/화면녹화/.test(shot)) body = `<rect x="14" y="26" width="62" height="100" rx="6" fill="#dfe3ee"/><rect x="20" y="34" width="50" height="8" rx="2" fill="#b9bfd2"/><rect x="20" y="48" width="36" height="6" rx="2" fill="#b9bfd2"/><rect x="20" y="60" width="44" height="6" rx="2" fill="#b9bfd2"/>`;
    else if (/손|제품|인서트/.test(shot) || /손|제품/.test(subj)) body = `<ellipse cx="45" cy="98" rx="26" ry="14" fill="#cfd4e3"/><rect x="30" y="58" width="30" height="42" rx="6" fill="#b9bfd2"/><path d="M8 130 q20 -30 40 -8 q10 12 30 0" stroke="#8b92a8" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    else if (/메뉴판|소품|글자/.test(shot + subj)) body = `<rect x="16" y="40" width="58" height="80" rx="4" fill="#dfe3ee"/><rect x="24" y="52" width="42" height="6" rx="2" fill="#8b92a8"/><rect x="24" y="66" width="34" height="5" rx="2" fill="#b9bfd2"/><rect x="24" y="78" width="38" height="5" rx="2" fill="#b9bfd2"/><rect x="24" y="90" width="30" height="5" rx="2" fill="#b9bfd2"/>`;
    else if (/탑뷰/.test(shot)) body = `<circle cx="45" cy="86" r="28" fill="#dfe3ee"/><circle cx="45" cy="86" r="16" fill="#b9bfd2"/>`;
    else if (/전신/.test(shot)) body = `<circle cx="45" cy="44" r="9" fill="#b9bfd2"/><rect x="36" y="54" width="18" height="34" rx="6" fill="#cfd4e3"/><rect x="37" y="88" width="7" height="34" rx="3" fill="#b9bfd2"/><rect x="46" y="88" width="7" height="34" rx="3" fill="#b9bfd2"/>`;
    else if (/클로즈업/.test(shot)) body = `<circle cx="45" cy="80" r="30" fill="#cfd4e3"/><circle cx="35" cy="74" r="3" fill="#8b92a8"/><circle cx="55" cy="74" r="3" fill="#8b92a8"/><path d="M36 92 q9 8 18 0" stroke="#8b92a8" stroke-width="2.5" fill="none"/>`;
    else body = `<circle cx="45" cy="62" r="14" fill="#b9bfd2"/><path d="M18 130 q27 -50 54 0z" fill="#cfd4e3"/>`;   // 상반신(기본)
    const ty = pos === "상단" ? 20 : pos === "중앙" ? 78 : 138;
    const grid = `<path d="M30 0v160M60 0v160M0 53h90M0 107h90" stroke="#eceef5" stroke-width="1"/>`;
    return `<svg viewBox="0 0 ${W} ${H}" class="sk"><rect width="${W}" height="${H}" rx="10" fill="#f6f7fb" stroke="#e6e8ef"/>${grid}${body}<rect x="10" y="${ty - 6}" width="70" height="12" rx="3" fill="#15171f"/><rect x="16" y="${ty - 2}" width="58" height="4" rx="2" fill="#bffe9e"/></svg>`;
  }
  function refFrameImg(p, rf) {
    if (!rf || !rf.ref) return "";
    const r = (p.refs || [])[rf.ref - 1]; if (!r) return "";
    const fr = (r.frames || [])[(rf.frame || 1) - 1] || (r.frames || [])[0];
    const src = fr ? fr.path : r.thumbnail; if (!src) return "";
    return `<figure class="sb-ref"><img src="${esc(src)}" loading="lazy"><figcaption>레퍼런스 ${rf.ref} · ${fr ? fr.t + "초" : "썸네일"}${rf.why ? "<br>" + esc(rf.why) : ""}</figcaption></figure>`;
  }
  const chips = (c) => c ? [c.text_style && ["🔤", c.text_style], c.transition && ["🔀", c.transition], c.sfx && ["🔊", c.sfx], c.effect && ["✨", c.effect]].filter(Boolean).map(([i, v]) => `<span class="cchip">${i} ${esc(v)}</span>`).join("") : "";
  let SB_TABLE = false; window.sbToggle = () => { SB_TABLE = !SB_TABLE; renderPlan2(CUR); };
  const cc = (c) => c ? [c.text_style && "🔤 " + c.text_style, c.transition && "🔀 " + c.transition, c.sfx && "🔊 " + c.sfx, c.effect && "✨ " + c.effect].filter(Boolean).map(esc).join("<br>") : "";
  function renderPlanTab(plan, p) {
    const B = plan.B_plan || {}; const hooks = B.hooks || []; const rec = B.recommended_hook || 1;
    const left = `<aside class="plan-side"><div class="title-card"><div class="ph-kicker">내 릴스 기획안</div><h2>${esc(plan.title)}</h2>${plan.thumbnail_text ? `<span class="ttag">썸네일: ${esc(plan.thumbnail_text)}</span>` : ""}${plan.one_line ? `<p>${esc(plan.one_line)}</p>` : ""}</div>
      <div class="side-sec"><h3>🎣 첫 문장(훅) <small>추천 ${rec}번</small></h3><ol class="hooklist">${hooks.map((h, i) => `<li class="${i + 1 == rec ? "on" : ""}"><span class="tag">${esc(h.type)}</span> ${esc(h.line)}</li>`).join("")}</ol><div class="muted" style="font-size:12px">${esc(B.why || "")}</div></div>
      <div class="side-sec"><h3>📝 캡션</h3><div class="capbox">${esc(B.caption_text)}</div></div>
      <div class="side-sec"><h3>🎵 음악</h3><div>${esc(B.music || "-")}</div></div>
      <div class="side-sec"><h3>🎬 마지막 멘트</h3><div><b>${esc((B.cta || {}).say)}</b></div><div class="muted">자막: ${esc((B.cta || {}).caption)}<br>댓글 유도: ${esc((B.cta || {}).comment_question)}</div></div>
      <div class="side-sec"><h3>📦 찍을 것·준비물</h3><ul>${(B.shot_list || []).map(x => `<li>${esc(x)}</li>`).join("")}${(B.prep || []).map(x => `<li class="muted">${esc(x)}</li>`).join("")}</ul></div>
      <div class="side-sec"><h3>⚠️ 초보 실수</h3><ul>${(B.tips || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
      ${(plan.pro || {}).questions && plan.pro.questions.length ? `<div class="side-sec warnbox"><h3>❓ 확인해 주세요</h3><ul>${plan.pro.questions.map(q => `<li>${esc(q)}</li>`).join("")}</ul></div>` : ""}</aside>`;
    const scenes = (B.scenes || []).map(s => { const f = s.framing || {}; const g = s.guide || {}; const h = hooks[0] || {};
      return `<div class="scene"><div class="scene-visual"><span class="scene-no">SCENE ${s.no} <small>${esc(s.sec)}초</small></span>${refFrameImg(p, s.ref_frame)}${sketch(f)}</div>
        <div class="scene-body"><div class="saybox"><span class="tag">${esc(s.part || (s.no === 1 ? "훅" : s.no === (B.scenes || []).length ? "마무리" : "본문 " + (s.no - 1)))}</span><div class="say">${esc(s.say)}</div><div class="cap">💬 ${esc(s.caption)}${f.text_pos ? ` <span class="muted">(${esc(f.text_pos)})</span>` : ""}</div></div>
        <div class="guidebox"><b>촬영 가이드</b><div><b>구도:</b> ${esc(g.composition || [f.shot, f.camera, s.screen].filter(Boolean).join(" · "))}</div>${g.light ? `<div><b>조명:</b> ${esc(g.light)}</div>` : ""}${g.props ? `<div><b>소품:</b> ${esc(g.props)}</div>` : ""}<div><b>행동:</b> ${esc(g.action || s.screen)}</div></div>
        <div class="editbox"><b>캡컷 편집</b><div class="cchips">${chips(s.capcut) || '<span class="muted">-</span>'}</div>${s.tip ? `<div class="sb-tip">💡 ${esc(s.tip)}</div>` : ""}</div></div></div>`; }).join("");
    return `<div class="plan-layout">${left}<div class="plan-main"><div class="row" style="justify-content:space-between;margin-bottom:8px"><h2 style="margin:0">🎬 스토리보드 <small>총 ${(B.scenes || []).length}컷 · ${esc(plan.length_sec)}초</small></h2><button class="btn small" onclick="sbToggle()">${SB_TABLE ? "카드로 보기" : "표로 보기"}</button></div>
      ${SB_TABLE ? `<div class="tablewrap"><table class="scenes"><tr><th>씬</th><th>초</th><th>화면에 보이는 것</th><th>말하는 것</th><th>자막</th><th>캡컷 편집</th><th>팁</th></tr>${(B.scenes || []).map(s => `<tr><td><b>${s.no}</b></td><td>${esc(s.sec)}</td><td>${esc(s.screen)}</td><td class="say">${esc(s.say)}</td><td class="cap">${esc(s.caption)}</td><td class="capcut">${cc(s.capcut)}</td><td class="muted">${esc(s.tip)}</td></tr>`).join("")}</table></div>` : `<div class="scenes-list">${scenes}</div>`}</div></div>`;
  }
  function renderRefsTab(p) {
    const refs = p.refs || []; const A = ((p.plan || {}).A_refs) || [];
    return refs.map((r, i) => {
      const a = A.find(x => x.ref === i + 1); const an = r.analysis || {}; const d = an.delivery || {};
      const frames = (r.frames || []);
      return `<section class="refsec"><div class="ref-head"><img src="${esc(r.thumbnail || "")}" onerror="this.remove()"><div><div class="ph-kicker">레퍼런스 ${i + 1}</div><b>@${esc(r.account)}</b> <span class="muted">${esc(r.industry || "")} · ▶ ${fmt(r.views)} · ❤ ${fmt(r.likes)} · ${esc(r.posted_at || "")}</span><div class="muted">${esc(r.description || "")}</div><a href="${esc(r.url)}" target="_blank" class="muted">원본 ↗</a></div></div>
      ${an.timeline ? `<div class="stats">${[["길이", an.duration + "초"], ["컷", an.shots + "개 (평균 " + an.avg_shot + "초)"], ["전환", "컷 " + (an.transitions || {})["컷"] + " · 부드러운 " + (an.transitions || {})["부드러운 전환"]], ["말투", d.tone + " · " + d.speed + (d.avg_rate ? " (" + d.avg_rate + "자/초)" : "")], ["어미", (d.endings || []).join(" / ")], ["쉼", d.pauses], ["음악", an.music], ["효과음 추정", (an.sfx || []).length + "곳"]].map(([k, v]) => `<div class="stat"><small>${k}</small><b>${esc(v)}</b></div>`).join("")}</div>` : `<div class="muted">아직 영상 분석이 없어요 (캡션·썸네일만 참고됨)</div>`}
      ${a ? `<div class="two" style="margin:10px 0"><div class="panel soft"><b>왜 터졌나</b><ul>${(a.why_it_worked || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul><b>첫 문장</b> ${esc(a.hook_line)}<br><b>구조</b> ${esc(a.structure)}</div><div class="panel soft"><b>말투</b> ${esc(a.speech_style)}<br><b>편집</b> ${esc(a.edit_style)}<br><b>가져올 것</b> <mark>${esc(a.steal)}</mark></div></div>` : ""}
      <div class="filmstrip">${frames.map(f => `<img src="${esc(f.path)}" title="${f.t}s" loading="lazy">`).join("")}</div>
      ${a && a.timeline ? `<div class="tablewrap"><table class="scenes"><tr><th>초</th><th>화면</th><th>대사</th><th>자막</th><th>캡컷 텍스트</th><th>트랜지션</th><th>효과음</th><th>효과</th><th>배울 점</th></tr>${a.timeline.map(x => `<tr><td>${esc(x.t)}</td><td>${esc(x.screen)}</td><td class="say">${esc(x.script)}</td><td class="cap">${esc(x.caption)}</td><td>${esc(x.text_style)}</td><td>${esc(x.transition)}</td><td>${esc(x.sfx)}</td><td>${esc(x.effect)}</td><td class="muted">${esc(x.point)}</td></tr>`).join("")}</table></div>`
        : an.timeline ? `<div class="tablewrap"><table class="scenes"><tr><th>컷</th><th>초</th><th>화면</th><th>대사</th><th>자막(OCR)</th><th>전환</th><th>효과음</th><th>캡컷에서</th></tr>${an.timeline.map(x => `<tr><td>${x.no}</td><td>${x.t0}~${x.t1}</td><td>${(x.frames || []).slice(0, 1).map(f => `<img class="tf" src="${esc(f)}" loading="lazy">`).join("")}</td><td class="say">${esc(x.script || "")}</td><td class="cap">${(x.captions || []).map(c => esc(c.text)).join("<br>")}</td><td>${esc(x.transition)}</td><td>${(x.sfx || []).map(e => e.t + "s").join(", ")}</td><td class="muted">${esc(x.capcut || "")}</td></tr>`).join("")}</table></div>` : ""}
      ${an.speech && an.speech.length ? `<details class="wiz-more"><summary>🎙 말한 그대로 (속도·어미·힘준 단어)</summary><table class="scenes"><tr><th>초</th><th>대사</th><th>속도</th><th>어미</th><th>앞 쉼</th><th>힘준 단어</th></tr>${an.speech.map(s => `<tr><td>${s.t}</td><td>${esc(s.text)}</td><td>${esc(s.speed)}</td><td>${esc(s.ending)}</td><td>${s.pause_before}s</td><td>${(s.emphasis || []).map(esc).join(", ")}</td></tr>`).join("")}</table></details>` : ""}
      </section>`;
    }).join("") || '<div class="muted">레퍼런스가 없어요</div>';
  }
  function renderProTab(plan, p) {
    const pro = plan.pro || {}; const t = pro.target || {};
    return `<div class="two"><section class="panel"><b>타깃(가상 인물)</b><div><b>${esc(t.persona)}</b></div><div class="muted">겉 고민: ${esc(t.surface_problem)}<br>속마음: ${esc(t.inner_problem)}</div></section>
    <section class="panel"><b>자가검증</b><table class="scenes">${(pro.self_check || []).map(c => `<tr><td>${c.ok ? "✅" : "❌"}</td><td>${esc(c.q)}</td><td class="muted">${esc(c.why)}</td></tr>`).join("")}</table></section></div>
    <div class="two" style="margin-top:12px"><section class="panel"><b>다음 소재</b><ul>${(pro.next_topics || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul></section><section class="panel"><b>편집자 메모</b><div>${esc(pro.notes || "")}</div><b style="display:block;margin-top:8px">입력값</b><div class="muted" style="font-size:12px">${esc(JSON.stringify(p.brief || {}))}</div></section></div>
    <details class="wiz-more"><summary>AI에 보낸 프롬프트 보기</summary><textarea rows="12" class="wiz-input mono">${esc(p.prompt || "")}</textarea></details>`;
  }
  window.savePlanJson = async function (pid) {
    let j; try { j = JSON.parse($("#plan-json").value); } catch (e) { return toast("JSON 형식이 아니에요"); }
    await post("/api/plans/" + pid + "/save", { plan: j }); CUR = await api("/api/plans/" + pid); TAB = "plan"; renderPlan2(CUR);
  };

  // ---------------- 기획 홈 (보관함 + 시작)
  window.viewPlanHome = async function () {
    const plans = await api("/api/plans").catch(() => []);
    $("#main").innerHTML = `<div class="plan-home"><div class="hero"><div><div class="ph-kicker">릴스 기획</div><h1>5단계만 고르면<br>씬별 대본과 캡컷 편집표까지.</h1><p>직업 → 타깃 → 키워드 → 참고 릴스(최대 3개) → 주제. 참고 릴스는 컷·자막·대사·효과음까지 뜯어서 내 기획안에 옮깁니다.</p><button class="btn p big" onclick="wizStart()">+ 새 기획 만들기</button> ${W.job ? `<button class="btn big ghost2" onclick="wizResume()">이어서 하기 (STEP ${W.step})</button>` : ""}</div><div class="hero-art"><i></i><i></i><i></i></div></div>
    <h2>내 기획 <small>${plans.length}개</small></h2>
    ${plans.length ? `<div class="plangrid">${plans.map(p => `<div class="plancard" onclick="location.hash='#/plan/${p.id}'"><div class="pc-cover">${p.cover ? `<img src="${esc(p.cover)}" onerror="this.remove()">` : ""}<span class="tag ${p.status === "done" ? "ok" : ""}">${p.status === "done" ? "완성" : "프롬프트만"}</span></div><div class="pc-body"><b>${esc(p.title || "(제목 없음)")}</b><div class="muted">${esc(p.job || "")} · 참고 ${p.refs}개 · ${esc(p.created_at || "")}</div></div></div>`).join("")}</div>` : `<div class="empty"><b>아직 만든 기획이 없어요</b>새 기획 만들기로 첫 기획안을 만들어보세요.</div>`}</div>`;
  };
  window.wizStart = () => { Object.assign(W, { step: 1, topic: "", topics: [] }); save(); if (location.hash !== "#/plan/new") location.hash = "#/plan/new"; else renderWizard(); };
  window.wizResume = () => { if (location.hash !== "#/plan/new") location.hash = "#/plan/new"; else renderWizard(); };
})();
