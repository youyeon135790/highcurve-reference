// ✍️ 릴스 기획 — 5단계 고르기(직업 → 타깃 → 키워드 → 참고 릴스 → 주제) → 기획안. 레퍼런스 최대 3개, 캡컷 기준.
(function () {
  const W = { step: 1, job: "", target: [], keyword: "", subs: [], selSubs: [], refs: [], topic: "", topics: [], extra: {}, refsCache: [], urls: "" };
  try { Object.assign(W, JSON.parse(localStorage.getItem("planWiz") || "{}")); } catch (e) {}
  const save = () => { try { localStorage.setItem("planWiz", JSON.stringify({ ...W, refsCache: W.refsCache.slice(0, 24), topics: W.topics.slice(0, 10) })); } catch (e) {} };
  const JOBS = ["카페·베이커리", "식당·요식업", "뷰티샵·네일", "피부과·병원", "헬스·필라테스", "강사·코치", "인플루언서", "쇼핑몰·공동구매", "N잡러·프리랜서", "보험·금융", "부동산·공인중개사", "육아맘·주부", "개발자·IT", "여행·숙박업"];
  const AGES = ["10대", "20대", "30대", "40대", "50대+"]; const LIFE = ["직장인", "자영업 사장님", "학생", "주부", "육아맘", "자취생", "커플·신혼", "운동하는 사람", "창업 준비"];
  const HOOKS = ["질문형", "숫자형", "반전형", "고백형", "금지형", "발견형", "비교형", "경고형"];
  const STATIC = !!window.staticApi;
  const post = (p, body) => api(p, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const pill = (v, on, fn, extra = "") => `<button class="pill ${on ? "on" : ""}" onclick="${fn}" ${extra}>${esc(v)}</button>`;

  window.viewPlanWizard = async function (arg) {
    if (arg) { const p = await api("/api/plans/" + arg); CUR = p; return renderPlan2(p); }
    // 릴스 상세창에서 담아둔 바구니 → 참고 릴스에 자동 반영
    const basket = (window.PLANREFS ? PLANREFS() : []).slice(0, 3);
    for (const id of basket) if (!W.refs.includes(id) && W.refs.length < 3) W.refs.push(id);
    renderWizard();
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
      body = `<h1>핵심 키워드 하나만 적어주세요.</h1><p class="muted">이 키워드로 우리 저장소(릴스 ${fmt(META?.stats?.items || 9000)}개)에서 같이 쓰인 단어를 뽑고, 참고 릴스를 찾아요.</p>
      <div class="row"><input id="wiz-kw" class="wiz-input" placeholder="예: 카페 신메뉴, 릴스 만드는 법, 홈트" value="${esc(W.keyword)}" oninput="wizInput('keyword', this)" onkeydown="if(event.key==='Enter')wizSubs()"><button class="btn p" onclick="wizSubs()">✨ 서브 키워드 뽑기</button></div>
      <div class="wiz-sub">서브 키워드 <small class="muted">${W.subs.length ? `${W.selSubs.length}/${W.subs.length} 선택 · 눌러서 켜고 끄기` : "키워드를 넣고 뽑기를 누르세요"}</small></div>
      <div class="pills" id="wiz-subs">${W.subs.map(k => pill("#" + k, W.selSubs.includes(k), `wizToggle('selSubs','${esc(k)}')`)).join("")}</div>`;
      next = `<button class="btn p big" onclick="${W.keyword ? "wizGo(4)" : "toast('키워드를 적어주세요')"}">참고 릴스 고르기 →</button>`;
    } else if (s === 4) {
      body = await renderRefsStep();
      next = `<button class="btn p big" onclick="${W.refs.length ? "wizGo(5)" : "toast('참고 릴스를 1개 이상 골라주세요')"}">주제 고르기 →</button>`;
    } else {
      body = renderTopicStep();
      next = `<button class="btn p big" id="wiz-make" onclick="wizMake()">✨ 기획안 만들기</button>`;
    }
    $("#main").innerHTML = `<div class="wiz">${head}<div class="wiz-body">${body}</div><div class="wiz-foot"><button class="btn big" onclick="wizGo(${s - 1})" ${s === 1 ? "disabled" : ""}>이전</button>${next}</div></div>`;
    if (s === 4 && !W.refsCache.length && (W.keyword || W.selSubs.length)) wizSearchRefs();
  }
  window.wizReset = (e) => { e.preventDefault(); Object.assign(W, { step: 1, job: "", target: [], keyword: "", subs: [], selSubs: [], refs: [], topic: "", topics: [], extra: {}, refsCache: [], urls: "" }); save(); renderWizard(); };

  window.wizSubs = async function () {
    W.keyword = ($("#wiz-kw") || {}).value || W.keyword; if (!W.keyword) return toast("키워드를 적어주세요");
    const box = $("#wiz-subs"); if (box) box.innerHTML = '<span class="muted">뽑는 중…</span>';
    const r = await api("/api/plan/subkeywords?q=" + encodeURIComponent(W.keyword)).catch(() => ({ keywords: [] }));
    W.subs = r.keywords || []; W.selSubs = W.subs.slice(0, 5); W.refsCache = []; save(); renderWizard();
    if (!W.subs.length) toast("같이 쓰인 단어를 못 찾았어요. 키워드만으로 검색합니다");
  };

  async function renderRefsStep() {
    const sel = W.refs;
    const cards = W.refsCache.map(x => refCard(x, sel.includes(x.id))).join("");
    return `<h1>참고할 릴스를 골라주세요 <small class="muted">(최대 3개)</small></h1><p class="muted">키워드로 우리 저장소에서 찾은 인기 릴스예요. 고른 릴스의 컷·자막·대사·효과음을 뜯어서 내 기획안에 옮깁니다.</p>
    <div class="pills small">${[W.keyword, ...W.selSubs].filter(Boolean).map(k => `<span class="pill on">#${esc(k)}</span>`).join("")}<button class="btn small" onclick="wizSearchRefs()">↻ 다시 찾기</button>${STATIC ? "" : `<button class="btn small" onclick="wizLiveSearch()">🌐 인스타에서 새로 찾기</button>`}</div>
    <div class="wiz-sel">${sel.length ? `선택 ${sel.length}/3 · ` + sel.map(id => `<span class="pill on tiny" onclick="wizPick(${id})">@${esc((W.refsCache.find(x => x.id === id) || {}).account || id)} ✕</span>`).join(" ") : "아직 고른 릴스가 없어요"}</div>
    <div class="refgrid" id="wiz-refs">${cards || '<div class="muted" style="padding:30px;text-align:center" id="wiz-refs-msg">찾는 중…</div>'}</div>
    <div class="panel soft" style="margin-top:14px"><b>🔗 링크로 직접 넣기</b> <small class="muted">인스타 릴스 링크를 한 줄에 하나씩 (남은 자리 ${3 - sel.length}개)</small>
    <div class="row" style="margin-top:8px;align-items:flex-start"><textarea class="wiz-input" rows="2" placeholder="https://www.instagram.com/reel/..." oninput="wizInput('urls', this)">${esc(W.urls || "")}</textarea><button class="btn" onclick="wizAddUrls()">분석해서 담기</button></div><div id="wiz-url-msg" class="muted"></div></div>`;
  }
  function refCard(x, on) {
    return `<div class="refcard ${on ? "on" : ""}" onclick="wizPick(${x.id})">
      <div class="rc-thumb">${x.thumbnail ? `<img src="${esc(x.thumbnail)}" loading="lazy" onerror="this.remove()">` : ""}${x.label ? `<span class="rc-label">${esc(x.label)}</span>` : ""}<span class="rc-check">${on ? "✓" : ""}</span></div>
      <div class="rc-body"><div class="rc-acc">@${esc(x.account || "")} ${x.frames ? '<span class="tag">분석됨</span>' : ""}</div><div class="rc-desc">${esc(x.description || (x.caption || "").slice(0, 60))}</div>
      <div class="rc-meta">▶ ${fmt(x.views)} · ❤ ${fmt(x.likes)} · ${esc((x.posted_at || "").slice(0, 10))}</div>
      <div class="rc-actions"><a class="btn small" href="${esc(x.url || "https://www.instagram.com/reel/")}" target="_blank" onclick="event.stopPropagation()">원본 ↗</a><button class="btn small" onclick="event.stopPropagation();openReel(${x.id})">자세히</button></div></div></div>`;
  }
  window.wizPick = (id) => { const i = W.refs.indexOf(id); if (i >= 0) W.refs.splice(i, 1); else { if (W.refs.length >= 3) return toast("참고 릴스는 최대 3개예요"); W.refs.push(id); } save(); renderWizard(); };
  window.wizSearchRefs = async function () {
    const r = await api("/api/plan/refs?q=" + encodeURIComponent(W.keyword) + "&tags=" + encodeURIComponent(W.selSubs.join(",")) + "&limit=12").catch(() => ({ items: [] }));
    const items = r.items || [];
    for (const it of items) if (!it.url) { try { const full = await api("/api/items/" + it.id); it.url = full.url; } catch (e) {} }
    // 이미 고른 것(바구니 등)은 앞에 유지
    for (const id of W.refs) if (!items.find(x => x.id === id)) { try { const full = await api("/api/items/" + id); items.unshift({ ...full, frames: !!full.frames }); } catch (e) {} }
    W.refsCache = items; save(); renderWizard();
    if (!items.length) toast("맞는 릴스가 없어요. 키워드를 바꾸거나 링크를 직접 넣어주세요");
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

  function renderTopicStep() {
    const t = W.topics || [];
    return `<h1>어떤 주제로 찍을까요?</h1><p class="muted">고른 참고 릴스의 구조에서 뽑은 주제예요. 하나 고르거나 직접 적어주세요. 첫 문장(훅)은 ${HOOKS.join("·")} 중 골고루 나옵니다.</p>
    <div class="row" style="margin-bottom:10px"><button class="btn" onclick="wizTopics()">✨ 추천 주제 뽑기</button><span id="wiz-topic-msg" class="muted"></span></div>
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
    <div class="wiz-summary"><b>정리</b> ${esc(W.job)} → ${esc(W.target.join(", "))}${W.extra.target_free ? " · " + esc(W.extra.target_free) : ""} · #${esc(W.keyword)} ${W.selSubs.map(k => "#" + esc(k)).join(" ")} · 참고 릴스 ${W.refs.length}개</div>`;
  }
  const brief = () => ({ job: W.job, target: [...W.target, W.extra.target_free].filter(Boolean).join(", "), keyword: [W.keyword, ...W.selSubs].filter(Boolean).join(", "), topic: W.topic, length: W.extra.length || 30, tone: W.extra.tone, scene: W.extra.scene, numbers: W.extra.numbers, cta: W.extra.cta, shooting: W.extra.shooting });
  window.wizTopics = async function () {
    const m = $("#wiz-topic-msg"); m.textContent = "주제 뽑는 중… (10초)";
    try {
      const r = await post("/api/plan/topics", { ids: W.refs, brief: brief() });
      if (r.need_key) { m.textContent = "AI 키가 없어 추천은 건너뜁니다. 주제를 직접 적어주세요 (비워도 돼요)"; return; }
      W.topics = r.topics || []; save(); renderWizard();
    } catch (e) { m.textContent = "실패: " + e.message; }
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
    b.textContent = "기획안 쓰는 중… (1~2분)";
    try {
      const r = await post("/api/plan", { ids: W.refs, brief: brief() });
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
  const cc = (c) => c ? [c.text_style && "🔤 " + c.text_style, c.transition && "🔀 " + c.transition, c.sfx && "🔊 " + c.sfx, c.effect && "✨ " + c.effect].filter(Boolean).map(esc).join("<br>") : "";
  function renderPlanTab(plan, p) {
    const B = plan.B_plan || {}; const hooks = B.hooks || [];
    return `<section class="sec"><h2>1. 첫 문장 고르기 <small>3초 안에 멈추게 하는 한마디 — 추천 ${esc(B.recommended_hook)}번: ${esc(B.why || "")}</small></h2>
      <div class="hooks">${hooks.map((h, i) => `<div class="hook ${i + 1 == B.recommended_hook ? "on" : ""}"><span class="tag">${esc(h.type)}</span><b>${esc(h.line)}</b><div class="muted">첫 화면: ${esc(h.first_screen)} · 첫 자막: ${esc(h.first_caption)}</div></div>`).join("")}</div></section>
    <section class="sec"><h2>2. 씬표 <small>이 순서대로 찍고, 캡컷에서 이렇게 편집</small></h2>
      <div class="tablewrap"><table class="scenes"><tr><th>씬</th><th>초</th><th>화면에 보이는 것</th><th>말하는 것</th><th>자막</th><th>캡컷 편집</th><th>팁</th></tr>
      ${(B.scenes || []).map(s => `<tr><td><b>${s.no}</b></td><td>${esc(s.sec)}</td><td>${esc(s.screen)}</td><td class="say">${esc(s.say)}</td><td class="cap">${esc(s.caption)}</td><td class="capcut">${cc(s.capcut)}</td><td class="muted">${esc(s.tip)}</td></tr>`).join("")}</table></div></section>
    <div class="two">
      <section class="panel"><b>3. 마지막 멘트</b><div style="margin-top:6px"><b>${esc((B.cta || {}).say)}</b></div><div class="muted">자막: ${esc((B.cta || {}).caption)}<br>댓글 유도: ${esc((B.cta || {}).comment_question)}</div></section>
      <section class="panel"><b>4. 게시글 캡션</b><div style="white-space:pre-wrap;margin-top:6px">${esc(B.caption_text)}</div><div class="muted" style="margin-top:6px">🎵 음악: ${esc(B.music)}</div></section>
    </div>
    <div class="two" style="margin-top:12px">
      <section class="panel"><b>5. 찍어야 할 것</b><ul>${(B.shot_list || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul><b>준비물</b><ul>${(B.prep || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul></section>
      <section class="panel"><b>6. 초보가 자주 하는 실수</b><ul>${(B.tips || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul>${(plan.pro || {}).questions && plan.pro.questions.length ? `<b>❓ 확인해 주세요</b><ul>${plan.pro.questions.map(q => `<li>${esc(q)}</li>`).join("")}</ul>` : ""}</section>
    </div>`;
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
