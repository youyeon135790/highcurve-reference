// ✍️ 릴스 기획 — 5단계 고르기(직업 → 타깃 → 키워드 → 참고 릴스 → 주제) → 기획안. 레퍼런스 최대 3개, 캡컷 기준.
(function () {
  const W = { step: 1, job: "", target: [], keyword: "", subs: [], selSubs: [], refs: [], topic: "", topics: [], extra: {}, refsCache: [], urls: "" };
  try { Object.assign(W, JSON.parse(localStorage.getItem("planWiz") || "{}")); } catch (e) {}
  const save = () => { try { localStorage.setItem("planWiz", JSON.stringify({ ...W, refsCache: W.refsCache.slice(0, 24), topics: W.topics.slice(0, 10) })); } catch (e) {} };
  const JOBS = ["카페·베이커리", "식당·요식업", "뷰티샵·네일", "피부과·병원", "헬스·필라테스", "강사·코치", "인플루언서", "쇼핑몰·공동구매", "N잡러·프리랜서", "보험·금융", "부동산·공인중개사", "육아맘·주부", "개발자·IT", "여행·숙박업"];
  const AGES = ["10대", "20대", "30대", "40대", "50대+"]; const LIFE = ["직장인", "자영업 사장님", "학생", "주부", "육아맘", "자취생", "커플·신혼", "운동하는 사람", "창업 준비"];
  const HOOKS = ["질문형", "숫자형", "반전형", "고백형", "금지형", "발견형", "비교형", "경고형"];
  const HOOK_FORMULAS = ["금지명령형", "발견선언형", "소외공포형", "비밀누설형", "랭킹형", "조합공식형", "자가테스트형", "통념반전형", "공감저격형", "성과인증형", "시각증명형", "스토리형", "정리본형", "대조형", "비밀형", "지적형", "수치형", "원인찾기형", "경고형", "손해형", "비교형", "반전형", "도전형", "공감형", "증명형", "첫마디형", "질문형", "숫자형", "고백형"];
  window.reSketch = async (pid, no) => { toast("스케치 그리는 중… (10초)"); const r = await post("/api/plans/" + pid + "/sketches", { only: no ? [no] : null }); if (r.error) return toast(r.error); CUR = r; renderPlan2(r); };
  window.likeScript = async (pid) => { const note = prompt("이 대본에서 특히 좋은 점을 한 줄 (비워도 됨)", ""); if (note === null) return; try { const r = await post("/api/plans/" + pid + "/like", { note }); if (r.error) throw new Error(r.error); toast(`예시로 저장했어요 (총 ${r.count}개). 다음 기획안부터 이 수준을 참고합니다`); } catch (e) { toast(e.message); } };
  let THUMB_T = null;
  const tmLine = (l) => esc(l).replace(/\[확인\s*필요[:：]?\s*([^\]]*)\]/g, (m, k) => `<em class="tm-ph">${(k || "").trim() || "숫자"}</em>`);
  window.thumbLive = (el, pid) => { const box = el.closest(".thumb-block").querySelector(".tm-text"); const lines = el.value.split(/\n/).map(x => x.trim()).filter(Boolean); box.innerHTML = lines.length ? lines.map(l => `<span>${tmLine(l)}</span>`).join("") : '<span class="muted">문구 없음</span>';
    clearTimeout(THUMB_T); THUMB_T = setTimeout(async () => { try { const r = await post("/api/plans/" + pid + "/thumb", { text: el.value.trim() }); if (!r.error && CUR && CUR.plan) CUR.plan.thumbnail_text = el.value.trim(); } catch (e) {} }, 900); };
  window.saveThumb = async (pid) => { const t = ($("#thumb-text").value || "").trim(); const r = await post("/api/plans/" + pid + "/thumb", { text: t }); if (r.error) return toast(r.error); CUR = r; renderPlan2(r); toast("썸네일 문구 저장"); };
  window.thumbFromHook = (pid) => { const B = (CUR.plan || {}).B_plan || {}; const h = (B.hooks || [])[(B.recommended_hook || 1) - 1] || {}; const t = h.thumb || (h.line || ""); $("#thumb-text").value = t; saveThumb(pid); };
  window.pickThumb = (pid, t) => { $("#thumb-text").value = t; saveThumb(pid); };
  window.genThumbs = async (pid) => { toast("AI가 썸네일 문구를 뽑는 중 (20~40초)"); const r = await post("/api/plans/" + pid + "/thumbs", {}); if (r.error) return toast(r.error); CUR = r; renderPlan2(r); toast("후보 3개를 뽑았어요"); };
  window.applyHook = async (pid, i) => { const r = await post("/api/plans/" + pid + "/hook", { index: i }); if (r.error) return toast(r.error); CUR = r; renderPlan2(r); toast(`${i}번 훅으로 씬 1을 바꿨어요`); };
  window.genHooks = async (pid) => { const f = $("#hook-formula").value; const m = $("#hook-msg"); m.textContent = `'${f}' 공식으로 뽑는 중… (10~20초)`; try { const r = await post("/api/plans/" + pid + "/hooks", { formula: f, n: 3 }); if (r.error) throw new Error(r.error); CUR = r; renderPlan2(r); toast("훅 3개 추가됨 — 눌러서 적용"); } catch (e) { m.textContent = "실패: " + e.message; } };
  window.rewriteOpening = async (pid, i) => { const m = $("#hook-msg"); m.textContent = "씬 1~2 다시 쓰는 중… (30~60초)"; try { const r = await post("/api/plans/" + pid + "/rewrite_opening", { index: i }); if (r.error) throw new Error(r.error); CUR = r; renderPlan2(r); toast("씬 1~2를 훅에 맞춰 다시 썼어요"); } catch (e) { m.textContent = "실패: " + e.message; } };
  const STATIC = !!window.staticApi && !(window.apiBase && window.apiBase());
  const CONNECTED = !!(window.apiBase && window.apiBase());
  const connectBox = () => STATIC ? `<div class="panel warn" style="margin:8px 0"><b>체험판(배포본)이라 AI·영상 분석·기획안 생성이 안 돼요.</b><div class="muted" style="margin:4px 0 8px">이 맥에서 하이커브 서버(localhost:8787)가 켜져 있으면 아래 버튼으로 연결해 배포본에서도 전부 쓸 수 있어요. 다른 컴퓨터라면 서버 주소를 넣어주세요.</div><div class="row"><button class="btn p small" onclick="connectServer('http://localhost:8787')">이 맥의 서버 연결</button><input id="srv-url" class="wiz-input" style="max-width:280px;padding:6px 10px;font-size:13px" placeholder="서버 주소 (예: https://내서버:8787)"><button class="btn small" onclick="connectServer($('#srv-url').value)">연결</button></div></div>` : CONNECTED ? `<div class="muted" style="font-size:12px;margin:4px 0">서버 연결됨: ${esc(window.apiBase())} <a href="#" onclick="event.preventDefault();disconnectServer()">끊기</a></div>` : "";
  const post = (p, body) => api(p, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const pill = (v, on, fn, extra = "") => `<button class="pill ${on ? "on" : ""}" onclick="${fn}" ${extra}>${esc(v)}</button>`;

  // ---------- 기다리는 화면: 퍼센트 + 준희 님 노하우 글귀
  const QUOTES = ["훅에는 숫자가 있다. (3년차가 알려주는) 처럼 괄호로 자리를 잡아라.", "모든 영상은 기승전결. 정보형도 예외가 없다.", "뼈대는 레퍼런스 그대로, 소재만 내 가게로.", "첫 3초에 '이거 내 얘기잖아'가 나와야 한다.", "카페와 원장님은 감성과 공감, 커머스와 브랜드는 텐션.", "한 씬에 메시지 하나. 3~5초마다 컷.", "자막은 말과 동시에, 한 줄 열 자 안쪽.", "'하세요'보다 '하지 마세요'가 더 멈춘다.", "문장은 이어져야 한다. ~해서 ~했는데, 근데 ~하더라고요.", "어미를 섞어라. 요, 죠, 거든요, 습니다.", "반신반의로 시작해서 반전으로 끝내라.", "BGM은 목소리 뒤에서 35~55%.", "훅은 두 버전 찍어라. 본문은 한 번, 오프닝만 두 번.", "'안녕하세요'로 시작하는 순간 넘어간다.", "캡션 첫 줄이 두 번째 훅이다.", "지어낸 숫자는 [확인 필요]로 남겨라. 신뢰가 조회수다.", "비주얼 훅이 가장 세다. 첫 프레임에 보여줄 것을 두어라.", "댓글이 좋아요를 넘으면 퍼널을 열 때다.", "겉 고민 말고 속마음을 건드려라.", "터진 구조는 공용 패턴이다. 그대로 써도 된다.", "촬영은 정면, 눈높이, 손에 뭔가 들고.", "마지막 문장은 질문으로 끝내라. 댓글이 달린다.", "40대 사장님도 바로 읽을 수 있는 말로 써라.", "편집자가 못 알아듣는 지시는 없는 것과 같다.", "잘 팔리는 영상은 설명하지 않고 보여준다.", "레퍼런스 3개면 충분하다. 더 보면 흔들린다."];
  let WAIT = null;
  window.showWait = (title, expectSec, sub) => {
    hideWait(); const t0 = Date.now(); let qi = Math.floor(Math.random() * QUOTES.length);
    const el = document.createElement("div"); el.className = "wait"; el.innerHTML = `<div class="wait-bg"><i></i><i></i></div><div class="wait-card"><canvas class="wait-canvas" width="480" height="480"></canvas><div class="wait-title">${esc(title)}</div><div class="wait-sub" id="wait-sub">${esc(sub || "")}</div><div class="wait-bar"><i id="wait-bar"></i></div><div class="wait-pct"><span id="wait-pct">0%</span><span id="wait-eta">예상 ${expectSec}초</span></div><div class="wait-quote" id="wait-quote">“${esc(QUOTES[qi])}”</div></div>`;
    document.body.appendChild(el);
    startOrb(el.querySelector(".wait-canvas"));
    WAIT = { el, t0, expectSec, real: null, timer: setInterval(() => {
      const elapsed = (Date.now() - t0) / 1000; const fake = Math.min(96, 100 * (1 - Math.exp(-elapsed / (expectSec * 0.9)))); const pct = WAIT.real != null ? Math.max(WAIT.real, Math.min(fake, WAIT.real + 8)) : fake;
      const b = $("#wait-bar"); if (b) b.style.width = pct.toFixed(0) + "%"; const pe = $("#wait-pct"); if (pe) pe.textContent = pct.toFixed(0) + "%";
      const eta = $("#wait-eta"); if (eta) eta.textContent = `${Math.round(elapsed)}초 지남 · 예상 ${expectSec}초`;
      if (Math.round(elapsed) % 7 === 0) { qi = (qi + 1) % QUOTES.length; const q = $("#wait-quote"); if (q) { q.style.opacity = 0; setTimeout(() => { q.textContent = "“" + QUOTES[qi] + "”"; q.style.opacity = 1; }, 300); } }
    }, 1000) };
    return WAIT;
  };
  // 구(球) 파티클: 모였다(구) → 흩어졌다(먼지) → 다시 모임. 잉크 점 + 라임 점 몇 개
  let ORB = null;
  function startOrb(cv) {
    if (!cv) return; const ctx = cv.getContext("2d"); const N = 760, R = 128, cx = 240, cy = 240;
    const pts = []; const gold = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = gold * i; pts.push({ x: Math.cos(th) * r, y, z: Math.sin(th) * r, sx: (Math.random() - .5) * 2.6, sy: (Math.random() - .5) * 2.6, sz: (Math.random() - .5) * 2.6, lime: Math.random() < 0.08, s: 0.8 + Math.random() * 1.4 }); }
    const ease = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    let start = performance.now(); ORB && cancelAnimationFrame(ORB);
    const frame = (now) => {
      const t = ((now - start) / 6000) % 1;            // 6초 주기
      const spread = t < .35 ? 0 : t < .5 ? ease((t - .35) / .15) : t < .7 ? 1 : t < .9 ? 1 - ease((t - .7) / .2) : 0;
      const rot = (now - start) / 4000, rot2 = (now - start) / 9000;
      ctx.clearRect(0, 0, 480, 480);
      const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, 230); g.addColorStop(0, "rgba(180,140,255,.30)"); g.addColorStop(.6, "rgba(95,208,221,.10)"); g.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, 480, 480);
      const order = [];
      for (const p of pts) {
        const x0 = p.x * (1 - spread) + p.sx * spread, y0 = p.y * (1 - spread) + p.sy * spread, z0 = p.z * (1 - spread) + p.sz * spread;
        const x1 = x0 * Math.cos(rot) - z0 * Math.sin(rot), z1 = x0 * Math.sin(rot) + z0 * Math.cos(rot);
        const y2 = y0 * Math.cos(rot2) - z1 * Math.sin(rot2), z2 = y0 * Math.sin(rot2) + z1 * Math.cos(rot2);
        const persp = 1 / (1.9 - z2 * 0.6); order.push({ X: cx + x1 * R * persp, Y: cy + y2 * R * persp, z: z2, p, persp });
      }
      order.sort((a, b) => a.z - b.z);
      for (const o of order) { const a = 0.25 + 0.75 * (o.z + 1) / 2; ctx.beginPath(); ctx.arc(o.X, o.Y, o.p.s * o.persp * (1 + spread * .4), 0, Math.PI * 2); ctx.fillStyle = o.p.lime ? `rgba(95,208,221,${a})` : `rgba(${Math.round(120 + 60 * (1 - a))},${Math.round(90 + 60 * (1 - a))},255,${a * (0.95 - spread * .3)})`; ctx.fill(); }
      ORB = requestAnimationFrame(frame);
    };
    ORB = requestAnimationFrame(frame);
  }
  window.setWait = (pct, sub) => { if (!WAIT) return; if (pct != null) WAIT.real = pct; if (sub) { const e = $("#wait-sub"); if (e) e.textContent = sub; } };
  window.hideWait = () => { if (WAIT) { clearInterval(WAIT.timer); WAIT.el.remove(); WAIT = null; } if (ORB) { cancelAnimationFrame(ORB); ORB = null; } };

  window.viewPlanWizard = async function (arg, sub) {
    if (arg) { if (sub && ["plan", "easy", "refs", "pro"].includes(sub)) TAB = sub; else if (!CUR || CUR.id !== arg) TAB = "easy"; const p = await api("/api/plans/" + arg); CUR = p; return renderPlan2(p); }
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
  window.wizExtraSet = (k, v) => { W.extra[k] = v; save(); renderWizard(); };
  window.wizPref = (k, v) => { W.prefs = W.prefs || {}; W.prefs[k] = W.prefs[k] === v ? "" : v; save(); renderWizard(); };

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
      <div class="row"><input id="wiz-kw" class="wiz-input" placeholder="예: 카페 신메뉴, 릴스 만드는 법, 홈트" value="${esc(W.keyword)}" oninput="wizInput('keyword', this)" onkeydown="if(event.key==='Enter')wizSubs()"><button class="btn p" onclick="wizSubs()">서브 키워드 뽑기</button></div>
      <div class="wiz-sub">서브 키워드 ${W.subs.length ? (W.subsSource === "cli" || W.subsSource === "api" ? '<span class="tag ok">AI가 뽑음</span>' : '<span class="tag">저장소 통계</span>') : ""}<small class="muted">${W.subs.length ? `${W.selSubs.length}/${W.subs.length} 선택 · 눌러서 켜고 끄기` : "키워드를 넣고 뽑기를 누르세요 (AI가 5~10초)"}</small></div>
      <div class="pills" id="wiz-subs">${W.subs.map(k => pill("#" + k, W.selSubs.includes(k), `wizToggle('selSubs','${esc(k)}')`)).join("")}</div>`;
      next = `<button class="btn p big" onclick="${W.keyword ? "wizGo(4)" : "toast('키워드를 적어주세요')"}">참고 릴스 고르기 →</button>`;
    } else if (s === 4) {
      body = await renderRefsStep();
      next = `<button class="btn p big" id="wiz-next4" onclick="${W.refs.length ? "wizAnalyzeThenTopics()" : "toast('참고 릴스를 1개 이상 골라주세요')"}">주제 고르기 →</button>`;
    } else {
      body = renderTopicStep();
      next = STATIC ? `<button class="btn p big" disabled title="체험판에서는 생성 불가">기획안 만들기 (서버 연결 필요)</button>` : W.making ? `<button class="btn p big" onclick="location.hash='#/plan/${esc(W.making)}'">만드는 중인 기획안 보기</button>` : `<button class="btn p big" id="wiz-make" onclick="wizMake()">기획안 만들기 <small style="font-weight:500">(1회 차감)</small></button>`;
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
    <div class="pills small">${[W.keyword, ...W.selSubs].filter(Boolean).map(k => `<span class="pill on">#${esc(k)}</span>`).join("")}<button class="btn small" onclick="wizSearchRefs()">다시 찾기</button>${STATIC ? "" : `<button class="btn small" onclick="wizLiveSearch()">인스타에서 새로 찾기</button>`}</div>
    <div class="wiz-sel">${sel.length ? `선택 ${sel.length}/3 · ` + sel.map(id => `<span class="pill on tiny" onclick="wizPick(${id})">@${esc((W.refsCache.find(x => x.id === id) || {}).account || id)} ✕</span>`).join(" ") : "아직 고른 릴스가 없어요"}</div>
    <div id="wiz-refs-note" class="muted" style="font-size:12px;margin:2px 0 8px">${W.refsCache.length ? (W.refsSource && W.refsSource !== "db" ? "AI 추천순 · 카드의 파란 글은 고른 이유" : "저장소 기본 순서 · AI가 곧 다시 정렬합니다") : ""}</div>
    <div class="refgrid" id="wiz-refs">${cards || '<div class="muted" style="padding:30px;text-align:center" id="wiz-refs-msg">저장소에서 찾는 중… (1~2초)</div>'}</div>
    <div class="panel soft" style="margin-top:14px"><b>🔗 링크로 직접 넣기</b> <small class="muted">인스타 릴스 링크를 한 줄에 하나씩 (남은 자리 ${3 - sel.length}개)</small>
    <div class="row" style="margin-top:8px;align-items:flex-start"><textarea class="wiz-input" rows="2" placeholder="https://www.instagram.com/reel/..." oninput="wizInput('urls', this)">${esc(W.urls || "")}</textarea><button class="btn" onclick="wizAddUrls()">분석해서 담기</button></div><div id="wiz-url-msg" class="muted"></div></div>`;
  }
  function refCard(x, on) {
    return `<div class="refcard ${on ? "on" : ""}" onclick="wizPick(${x.id})">
      <div class="rc-thumb">${x.thumbnail ? `<img src="${esc(x.thumbnail)}" loading="lazy" onerror="imgRetry(this)">` : ""}${x.label ? `<span class="rc-label">${esc(x.label)}</span>` : x.fill ? `<span class="rc-label soft">같은 카테고리</span>` : ""}<span class="rc-check">${on ? "✓" : ""}</span>${on ? '<span class="rc-on">선택됨</span>' : ""}</div>
      <div class="rc-body"><div class="rc-acc">@${esc(x.account || "")} ${x.frames ? '<span class="tag">분석됨</span>' : ""}</div><div class="rc-desc">${esc(x.description || (x.caption || "").slice(0, 60))}</div>${x.why ? `<div class="rc-why">${esc(x.why)}</div>` : ""}
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
    const note = $("#wiz-refs-note"); if (note) note.textContent = "AI가 이 직업·타깃에 맞는 순서로 고르는 중… (30~40초, 먼저 뜬 목록은 저장소 기본 순서)";
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
    const need = [];
    for (const id of W.refs) { const c = W.refsCache.find(x => x.id === id); if (!(c && c.frames)) need.push(id); }
    if (need.length) showWait("참고 릴스 뜯는 중", 30 * need.length, "영상을 받아서 컷·자막·대사·효과음을 뽑고 있어요");
    let i = 0;
    for (const id of need) {
      const c = W.refsCache.find(x => x.id === id);
      try {
        const it = await api("/api/items/" + id); if (it.frames) { if (c) c.frames = true; i++; continue; }
        setWait(Math.round(100 * i / need.length), `@${it.account} — 영상 받는 중 → 컷 감지 → 자막 읽기 → 대사 받아쓰기`);
        const r = await post("/api/analyze", { url: it.url }); if (r.error) throw new Error(r.error); if (c) c.frames = true;
      } catch (e) { toast("분석 건너뜀: " + e.message); }
      i++;
    }
    hideWait(); W.topics = []; save(); wizGo(5);
  };
  let TOPICS_LOADING = false;
  function renderTopicStep() {
    const t = W.topics || [];
    if (!t.length && !TOPICS_LOADING && W.refs.length && !STATIC) setTimeout(() => wizTopics(), 50);
    const LEN = ["15", "30", "45", "60", "90"]; if (!W.extra.length) W.extra.length = "30";
    return `<h1>어떤 주제로 찍을까요?</h1>${connectBox()}
    <div class="wiz-sub">영상 길이 <small class="muted">기승전결이 다 들어가는 기준으로 씬을 나눕니다</small></div>
    <div class="pills">${LEN.map(l => pill(l + "초", String(W.extra.length) === l, `wizExtraSet('length','${l}')`)).join("")}</div><p class="muted">고른 참고 릴스의 구조에서 뽑은 주제예요. 하나 고르거나 직접 적어주세요. 첫 문장(훅)은 ${HOOKS.join("·")} 중 골고루 나옵니다.</p>
    <div class="row" style="margin-bottom:10px;flex-wrap:wrap;gap:6px"><input id="wiz-dir" class="wiz-input" style="flex:1;min-width:220px;padding:8px 12px;font-size:13px" placeholder="원하는 방향이 있으면 (예: 실패담 위주 / 손님 반응 / 가격 얘기는 빼고)" value="${esc(W.direction || "")}" oninput="wizInput('direction', this)"><button class="btn" onclick="wizTopics()">${t.length ? "이 방향으로 다시 뽑기" : "추천 주제 뽑기"}</button>${t.length ? `<button class="btn" onclick="wizTopics(true)">+ 다른 주제 8개 더</button>` : ""}<span id="wiz-topic-msg" class="muted" style="width:100%">${!t.length && !STATIC ? "준희 님 노하우(훅 공식·타깃 문제)를 적용해 주제 뽑는 중… (20~30초)" : STATIC ? "체험판에서는 주제 추천이 안 돼요. 직접 적어주세요." : ""}</span></div>
    <div class="topics">${t.map((x, i) => `<div class="topic ${W.topic === x.title ? "on" : ""}" onclick="wizSet('topic','${esc(x.title).replace(/'/g, "\\'")}')"><b>${esc(x.title)}</b>${x.why ? `<div class="topic-why">${esc(x.why)}</div>` : ""}<div class="muted">${x.source && /터진/.test(x.source) ? `<span class="tag ok">${esc(x.source)}</span> ` : x.source ? `<span class="tag">${esc(x.source)}</span> ` : ""}${x.angle ? `<span class="tag">${esc(x.angle)}</span> ` : ""}${x.hook_type ? `<span class="tag">${esc(x.hook_type)}</span> ` : ""}${esc(x.from || "")}</div></div>`).join("")}</div>
    <label class="wiz-label">직접 적기 (비워두면 AI가 레퍼런스 구조에서 정합니다)</label><input class="wiz-input" placeholder="예: 조회수 800 나오던 카페 릴스, 첫 문장 바꿨더니 11만" value="${t.find(x => x.title === W.topic) ? "" : esc(W.topic)}" oninput="wizInput('topic', this)">
    <div class="wiz-sub">편집은 어떻게? <small class="muted">고른 대로 캡컷 편집표·편집 외주서에 반영</small></div>
    <div class="prefs">
      <div><small>자막 스타일</small><div class="pills small">${["레퍼런스대로", "굵은 고딕+외곽선", "노란 강조 단어", "검정 박스 자막", "타자기 애니", "자막 최소"].map(v => pill(v, (W.prefs || {}).caption_style === v, `wizPref('caption_style','${v}')`)).join("")}</div></div>
      <div><small>효과음</small><div class="pills small">${["레퍼런스대로", "많이", "포인트만", "없음"].map(v => pill(v, (W.prefs || {}).sfx === v, `wizPref('sfx','${v}')`)).join("")}</div></div>
      <div><small>속도</small><div class="pills small">${["레퍼런스대로", "빠르게(1~2초 컷)", "보통", "차분하게"].map(v => pill(v, (W.prefs || {}).pace === v, `wizPref('pace','${v}')`)).join("")}</div></div>
      <div><small>편집은 어느 레퍼런스를 따라갈까</small><div class="pills small">${[["가장 잘 맞는 것", "auto"], ...W.refs.map((id, i) => ["레퍼런스 " + (i + 1) + " @" + ((W.refsCache.find(x => x.id === id) || {}).account || id), String(i + 1)])].map(([l, v]) => pill(l, (W.prefs || {}).follow_ref === v, `wizPref('follow_ref','${v}')`)).join("")}</div></div>
      <input class="wiz-input" style="padding:8px 12px;font-size:13px" placeholder="편집에서 꼭 넣고 싶은 것 / 빼고 싶은 것 (예: 줌인 많이, 이모지 자막 금지)" value="${esc((W.prefs || {}).memo || "")}" oninput="W.prefs=W.prefs||{};W.prefs.memo=this.value;save()">
    </div>
    <details class="wiz-more" ${Object.values(W.extra).some(Boolean) ? "open" : ""}><summary>더 좋은 결과를 원하면 (선택) — 내 재료 넣기</summary>
      <div class="two">
        <label>내 말투 <input class="wiz-input" placeholder="예: 존댓말, 담백하게 / 반말, 텐션 높게" value="${esc(W.extra.tone || "")}" oninput="wizExtra('tone', this)"></label>
        <label>내가 실제로 겪은 장면 1개 <input class="wiz-input" placeholder="예: 신메뉴 릴스 30개 올렸는데 최고 800" value="${esc(W.extra.scene || "")}" oninput="wizExtra('scene', this)"></label>
        <label>쓸 수 있는 숫자·사례 <input class="wiz-input" placeholder="예: 3년, 손님 1만 명, 조회수 11만" value="${esc(W.extra.numbers || "")}" oninput="wizExtra('numbers', this)"></label>
        <label>마지막에 시키고 싶은 것 <input class="wiz-input" placeholder="저장 / 댓글 / 팔로우 / DM / 프로필 링크" value="${esc(W.extra.cta || "")}" oninput="wizExtra('cta', this)"></label>
        <label>촬영 환경 <input class="wiz-input" placeholder="예: 얼굴 노출 OK, 매장, 화면녹화 가능" value="${esc(W.extra.shooting || "")}" oninput="wizExtra('shooting', this)"></label>

      </div></details>
    <div class="row" style="margin:6px 0 10px;gap:8px;align-items:center"><span class="muted" style="font-size:12px">생성 모드</span>${pill("빠름 (1분 안팎)", W.mode === "fast", "wizSet('mode','fast')")}${pill("정밀 (2~3분)", W.mode !== "fast", "wizSet('mode','precise')")}</div>
    <div class="wiz-summary"><b>정리</b> ${esc(W.job)} → ${esc(W.target.join(", "))}${W.extra.target_free ? " · " + esc(W.extra.target_free) : ""} · #${esc(W.keyword)} ${W.selSubs.map(k => "#" + esc(k)).join(" ")} · 참고 릴스 ${W.refs.length}개 · ${esc(W.extra.length || 30)}초</div>`;
  }
  const brief = () => ({ edit_prefs: Object.fromEntries(Object.entries(W.prefs || {}).filter(([k, v]) => v && v !== "레퍼런스대로" && v !== "auto")), job: W.job, target: [...W.target, W.extra.target_free].filter(Boolean).join(", "), keyword: [W.keyword, ...W.selSubs].filter(Boolean).join(", "), topic: W.topic, length: W.extra.length || 30, tone: W.extra.tone, scene: W.extra.scene, numbers: W.extra.numbers, cta: W.extra.cta, shooting: W.extra.shooting });
  window.wizTopics = async function (more) {
    if (TOPICS_LOADING) return; TOPICS_LOADING = true;
    const dirEl = $("#wiz-dir"); if (dirEl) { W.direction = dirEl.value; save(); }
    const m = $("#wiz-topic-msg"); if (m) m.textContent = "주제 뽑는 중…"; showWait("주제 뽑는 중", 28, "참고 릴스 구조 + 훅 공식으로 8개를 만들고 있어요");
    try {
      const r = await post("/api/plan/topics", { ids: W.refs, brief: brief(), direction: W.direction || "", exclude: more ? (W.topics || []).map(x => x.title) : [] });
      if (r.need_key) { if (m) m.textContent = "AI 엔진이 없어 추천은 건너뜁니다. 주제를 직접 적어주세요 (비워도 돼요)"; return; }
      if (r.error) throw new Error(r.error);
      W.topics = more ? [...(W.topics || []), ...(r.topics || [])] : (r.topics || []); save(); if (!W.topics.length && m) m.textContent = "추천이 비어 왔어요. 다시 뽑기를 눌러주세요";
    } catch (e) { if (m) m.textContent = "실패: " + e.message + " — 다시 뽑기를 눌러주세요"; }
    finally { TOPICS_LOADING = false; hideWait(); if (W.topics.length) renderWizard(); }
  };
  window.wizMake = async function () {
    if (!W.refs.length) return toast("참고 릴스를 골라주세요");
    if (W.making) { try { const pr = await api("/api/plans/" + W.making + "/progress"); if (pr.stage !== "unknown" && !pr.done && !pr.plan_ready) { toast("이미 만드는 중이에요 — 잠시만요"); location.hash = "#/plan/" + W.making; return; } } catch (e) {} }
    const b = $("#wiz-make"); b.disabled = true;
    for (const id of W.refs) {
      const c = W.refsCache.find(x => x.id === id); if (c && c.frames) continue;
      try { const it = await api("/api/items/" + id); if (it.frames) continue; showWait("참고 릴스 뜯는 중", 35, `@${it.account} 영상을 받아 컷·자막·대사를 뽑는 중`); await post("/api/analyze", { url: it.url }); hideWait(); }
      catch (e) { hideWait(); toast("분석 건너뜀: " + e.message); }
    }
    const fast = W.mode === "fast"; const expect = fast ? 80 : 170;
    showWait("기획안 만드는 중", expect, "레퍼런스 프레임을 한 장씩 보면서 씬표를 쓰고 있어요");
    try {
      const r = await post("/api/plan", { ids: W.refs, brief: brief(), mode: W.mode || "precise" });
      if (r.error) throw new Error(r.error);
      const pid = r.id; W.making = pid; save();
      if (r.dedup) toast("방금 만든 기획안이 있어 그걸 열어요");
      if (!r.queued) { hideWait(); location.replace(location.pathname + location.search + "#/plan/" + pid); return; }
      const STAGES = { plan: "기획안 쓰는 중 — 훅·씬표·촬영 가이드", polish: "대사 완결·기승전결 다듬는 중", extras: "기획안 완성 — 스케치·편집 외주서는 뒤에서", done: "완성" };
      await new Promise((resolve, reject) => {
        const iv = setInterval(async () => {
          try {
            const pr = await api("/api/plans/" + pid + "/progress");
            setWait(pr.pct, STAGES[pr.stage] || pr.message || "");
            if (pr.error) { clearInterval(iv); reject(new Error(pr.error)); return; }
            if (pr.plan_ready || pr.done) { clearInterval(iv); resolve(); }
          } catch (e) {}
        }, 2000);
      });
      hideWait(); W.making = null; W.topic = ""; W.topics = []; W.step = 1; save();   // 완성 → 위저드 초기화(뒤로가기로 재생성 방지)
      location.replace(location.pathname + location.search + "#/plan/" + pid);
    } catch (e) { hideWait(); W.making = null; save(); toast("실패: " + e.message); b.disabled = false; b.textContent = "기획안 만들기"; }
  };

  // ---------------- 결과 화면: [내 릴스 기획안] [레퍼런스 뜯어보기] [전문가용]
  let TAB = "easy"; let CUR = null;
  window.planJson = () => JSON.stringify((CUR && (CUR.plan || CUR)) || {}, null, 1);
  window.planTab = (t) => { TAB = t; renderPlan2(CUR); };
  let EXTRA_T = null;
  async function watchExtras(pid) {
    clearInterval(EXTRA_T);
    EXTRA_T = setInterval(async () => {
      try { const pr = await api("/api/plans/" + pid + "/progress"); if (pr.done || pr.stage === "unknown") { clearInterval(EXTRA_T); if (pr.done) { CUR = await api("/api/plans/" + pid); renderPlan2(CUR); toast("스케치·편집 외주서 완성"); } } }
      catch (e) { clearInterval(EXTRA_T); }
    }, 4000);
  }
  function renderPlan2(p) {
    CUR = p;
    const hasBrief = !!(((p.plan || {}).pro || {}).edit_brief); const anySketch = ((((p.plan || {}).B_plan || {}).scenes) || []).some(s => s.sketch);
    const extrasPending = p.plan && (!hasBrief || !anySketch) && p.status === "done" && (p.engine === "cli" || p.engine === "api");
    if (extrasPending) watchExtras(p.id); else clearInterval(EXTRA_T);
    const plan = p.plan || null; const refs = p.refs || []; const done = !!plan;
    const title = plan ? plan.title : ((p.brief || {}).topic || ((p.brief || {}).keyword || "기획 준비").split(",")[0]);
    const tabs = [["easy", "쉬운 기획안"], ["plan", "상세 기획안"], ["refs", "레퍼런스 뜯어보기"], ["pro", "편집 외주용"]];
    let body = "";
    if (TAB === "refs") body = renderRefsTab(p);
    else if (TAB === "easy") body = done ? renderEasyTab(plan, p) : promptBox(p);
    else if (TAB === "pro") body = done ? renderProTab(plan, p) : promptBox(p);
    else body = done ? renderPlanTab(plan, p) : promptBox(p);
    $("#main").innerHTML = `<div class="plan-hero"><a class="btn ghost" href="#/plan">← 기획</a><div class="ph-title"><span class="ph-kicker">${done ? "내 릴스 기획안" : "프롬프트 패키지"} · ${esc(p.created_at || "")}</span><h1>${phHtml(title)}</h1>${plan && plan.one_line ? `<p>${esc(plan.one_line)}</p>` : ""}${plan && plan.thumbnail_text ? `<div class="ph-thumbtext">썸네일 문구 <b>${esc(plan.thumbnail_text)}</b></div>` : ""}</div>
      <div class="ph-actions"><a class="btn" href="/api/plans/${esc(p.id)}.csv">엑셀</a><button class="btn" onclick="navigator.clipboard.writeText(planJson());toast('복사됨')">JSON</button>${plan ? `<button class="btn" onclick="reSketch('${esc(p.id)}')" title="모든 씬 구도 스케치 생성 (씬당 3~5초)">스케치</button>` : ""}<button class="btn d" onclick="planDelete('${esc(p.id)}')">삭제</button></div></div>
      ${extrasPending ? `<div class="panel warn" style="margin:0 0 10px;padding:8px 14px;font-size:13px">기획안은 완성됐어요. 씬 스케치와 편집 외주서는 뒤에서 만드는 중 (1~2분) — 끝나면 자동으로 채워집니다.</div>` : ""}
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
  const chips = (c) => c ? [c.text_style && ["", c.text_style], c.transition && ["", c.transition], c.sfx && ["", c.sfx], c.effect && ["", c.effect]].filter(Boolean).map(([i, v]) => `<span class="cchip">${i} ${esc(v)}</span>`).join("") : "";
  let SB_TABLE = false; window.sbToggle = () => { SB_TABLE = !SB_TABLE; renderPlan2(CUR); };
  const cc = (c) => c ? [c.text_style && "" + c.text_style, c.transition && "" + c.transition, c.sfx && "" + c.sfx, c.effect && "" + c.effect].filter(Boolean).map(esc).join("<br>") : "";
  const ed = (path, val, cls = "", tag = "div") => `<${tag} class="edit ${cls}" contenteditable="true" spellcheck="false" data-path="${esc(path)}" onblur="editSave(this)" onkeydown="if(event.key==='Enter'&&!event.shiftKey&&this.tagName!=='DIV'){event.preventDefault();this.blur()}">${esc(val || "")}</${tag}>`;
  let SAVE_T = null;
  window.editSave = (el) => {
    const path = el.dataset.path.split("."); let o = CUR.plan; for (let i = 0; i < path.length - 1; i++) { const k = isNaN(path[i]) ? path[i] : Number(path[i]); o = o[k]; }
    const last = path[path.length - 1]; const v = el.innerText.replace(/\n+$/, ""); if (o[isNaN(last) ? last : Number(last)] === v) return; o[isNaN(last) ? last : Number(last)] = v;
    clearTimeout(SAVE_T); SAVE_T = setTimeout(async () => { try { await post("/api/plans/" + CUR.id + "/save", { plan: CUR.plan }); toast("저장됨"); } catch (e) { toast("저장 실패: " + e.message); } }, 400);
  };
  let VIEW = "guide"; window.planView = (v) => { VIEW = v; renderPlan2(CUR); };
  function titleCardHtml(plan, p, hooks, rec, scenesAll) {
    const thumbLines = String(plan.thumbnail_text || "").split(/\n/).filter(Boolean); const cands = (plan.thumb_candidates || []).filter(Boolean);
    return `<div class="title-card2"><div class="ph-kicker">내 릴스 기획안</div><h2>${phHtml(plan.title)}</h2>${plan.one_line ? `<p class="one">${phHtml(plan.one_line)}</p>` : ""}<div class="tc-chips"><span class="tag">${esc(plan.length_sec)}초</span><span class="tag">${scenesAll.length}씬</span>${(p.brief || {}).job ? `<span class="tag">${esc(p.brief.job)}</span>` : ""}</div>
        <div class="thumb-block"><div class="thumb-mock"><div class="tm-text">${thumbLines.length ? thumbLines.map(l => `<span>${tmLine(l)}</span>`).join("") : '<span class="muted">문구 없음</span>'}</div><div class="tm-cap">썸네일 미리보기</div></div>
          <div class="thumb-side"><div class="thumb-label">썸네일 문구 <small>= 메인 후킹 문구</small></div><textarea id="thumb-text" class="thumb-input" rows="2" placeholder="첫줄 (Enter) 둘째줄" oninput="thumbLive(this, '${esc(p.id)}')">${esc(plan.thumbnail_text || "")}</textarea>
            <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px"><button class="btn small" onclick="saveThumb('${esc(p.id)}')">저장</button><button class="btn small" onclick="thumbFromHook('${esc(p.id)}')" title="지금 고른 훅 문장을 썸네일 문구로">고른 훅에서 가져오기</button><button class="btn small" onclick="genThumbs('${esc(p.id)}')">AI로 후보 3개 뽑기</button></div>
            ${cands.length ? `<div class="thumb-cands">${cands.map(c => `<button class="tcand" onclick="pickThumb('${esc(p.id)}', ${JSON.stringify(c).replace(/"/g, "&quot;")})">${esc(c).replace(/\n/g, " / ")}</button>`).join("")}</div>` : ""}
            <div class="muted" style="font-size:11px;margin-top:6px">훅을 고르면 썸네일 문구도 그 훅으로 바뀝니다. 줄바꿈은 Enter.</div></div></div></div>`;
  }
  // ---------------- 쉬운 기획안: 빈칸 전부 미리 → 첫 문장(바로 교체) → 색 띠 대본(프롬프터) → 그림+대사 장면 → 올릴 때
  const PH_RE = /\[확인\s*필요[:：]?\s*([^\]]*)\]/g;
  const phHtml = (t) => esc(t || "").replace(/\[확인\s*필요[:：]?\s*([^\]]*)\]/g, (m, k) => `<span class="ph-blank">${(k || "").trim() || "숫자"}</span>`);
  function phSources(plan) {
    const B = plan.B_plan || {}; const L = []; const add = (obj, key, where) => { if (obj && typeof obj[key] === "string") L.push({ obj, key, where }); };
    (B.scenes || []).forEach(sc => { add(sc, "say", `${sc.no}번 장면 대사`); add(sc, "caption", `${sc.no}번 장면 자막`); add(sc, "screen", `${sc.no}번 장면 화면`); });
    (B.hooks || []).forEach((h, i) => { add(h, "line", `첫 문장 후보 ${i + 1}`); add(h, "thumb", `썸네일 후보 ${i + 1}`); });
    add(B, "caption_text", "캡션"); if (B.cta) { add(B.cta, "say", "마지막 멘트"); add(B.cta, "caption", "마지막 자막"); add(B.cta, "comment_question", "댓글 질문"); }
    add(plan, "thumbnail_text", "썸네일 문구"); (plan.thumb_candidates || []).forEach((t, i) => { if (typeof t === "string") L.push({ obj: plan.thumb_candidates, key: i, where: `썸네일 후보 ${i + 1}` }); });
    add(plan, "title", "제목"); add(plan, "one_line", "한 줄 요약");
    return L;
  }
  function phSecondary(plan) {   // 따로 줄을 만들지 않고, 같은 빈칸이 있으면 같이 채워지는 곳
    const L = []; if (typeof plan.script_full === "string") L.push({ obj: plan, key: "script_full", where: "전체 대본" });
    const walk = (o) => { if (!o || typeof o !== "object") return; for (const k of Object.keys(o)) { const v = o[k]; if (typeof v === "string") { if (v.indexOf("확인") >= 0) L.push({ obj: o, key: k, where: "편집 외주서" }); } else walk(v); } };
    walk((plan.pro || {}).edit_brief); return L;
  }
  function phGroups(plan) {
    const g = new Map();
    const scan = (src, primary) => { const t = src.obj[src.key] || ""; const re = new RegExp(PH_RE.source, "g"); let m, idx = 0;
      while ((m = re.exec(t))) { const label = (m[1] || "").trim() || "숫자"; const nxt = (t.slice(m.index + m[0].length).match(/^[가-힣]/) || [""])[0];
        let key = /^[\d.,]+$/.test(label) ? label + "|" + nxt : label;   // '3'+'줄' 은 제목·훅·썸네일·대본 어디서 나와도 같은 빈칸
        if (!g.has(key) && !primary) { const same = [...g.values()].filter(x => x.label === label); if (same.length === 1) key = same[0].key; }   // 외주서의 '(3)' 처럼 단위 없이 인용된 것
        if (!g.has(key)) { if (!primary) { idx++; continue; } g.set(key, { key, text: t, label, start: m.index, end: m.index + m[0].length, occ: [], where: [], texts: [] }); }
        const x = g.get(key); x.occ.push({ src, idx }); if (primary && !x.where.includes(src.where)) x.where.push(src.where); if (primary && !x.texts.includes(t)) x.texts.push(t); idx++; } };
    phSources(plan).forEach(src => scan(src, true)); phSecondary(plan).forEach(src => scan(src, false));
    return [...g.values()];
  }
  const phHint = (l) => /조회/.test(l) ? "예: 1.2만" : /잔|개/.test(l) ? "예: 3잔 / 7개" : /년|개월|일/.test(l) ? "예: 3년" : /원|가격/.test(l) ? "예: 9,900원" : /명|팔로워/.test(l) ? "예: 1,200명" : "숫자나 짧은 말";
  window.fillNumbers = async (pid) => {
    const plan = CUR.plan; const groups = phGroups(plan); const per = new Map(); let n = 0;
    $$(".fill-in").forEach(inp => { const v = inp.value.trim(); if (!v) return; const gr = groups[Number(inp.dataset.gi)]; if (!gr) return; n++; gr.occ.forEach(o => { if (!per.has(o.src)) per.set(o.src, {}); per.get(o.src)[o.idx] = v; }); });
    if (!n) return toast("한 곳이라도 채워주세요");
    const before = ((plan.B_plan || {}).scenes || []).map(x => x.say);
    per.forEach((vals, src) => { let k = 0; src.obj[src.key] = (src.obj[src.key] || "").replace(new RegExp(PH_RE.source, "g"), (m) => { const r = vals[k] != null ? vals[k] : m; k++; return r; }); });
    if (plan.script_full) ((plan.B_plan || {}).scenes || []).forEach((x, i) => { const old = before[i]; if (old && old !== x.say) plan.script_full = plan.script_full.split(old).join(x.say); });
    try { await post("/api/plans/" + pid + "/save", { plan }); CUR = await api("/api/plans/" + pid); renderPlan2(CUR); toast(`${n}곳을 채웠어요`); } catch (e) { toast("저장 실패: " + e.message); }
  };
  window.openPrompter = () => {
    const B = (CUR.plan || {}).B_plan || {}; const PART = { 기: "상황", 승: "전개", 전: "반전", 결: "마무리" };
    const parts = ["기", "승", "전", "결"].map(k => { const sc = (B.scenes || []).filter(x => x.part === k || (k === "기" && x.part === "훅")); return sc.length ? `<section class="pp-part part-${k}"><small>${PART[k]}</small><p>${phHtml(sc.map(x => x.say).join(" "))}</p></section>` : ""; }).join("");
    const el = document.createElement("div"); el.className = "prompter"; el.innerHTML = `<div class="pp-bar"><span>프롬프터 · 천천히 읽으세요</span><span><button class="btn small" onclick="ppZoom(-2)">작게</button><button class="btn small" onclick="ppZoom(2)">크게</button><button class="btn small" onclick="this.closest('.prompter').remove()">닫기</button></span></div><div class="pp-body" id="pp-body" style="font-size:30px">${parts}</div>`;
    document.body.appendChild(el);
  };
  window.ppZoom = (d) => { const b = $("#pp-body"); const cur = parseInt(b.style.fontSize) || 30; b.style.fontSize = Math.max(18, Math.min(60, cur + d)) + "px"; };
  function renderEasyTab(plan, p) {
    const B = plan.B_plan || {}; const hooks = B.hooks || []; const rec = B.recommended_hook || 1; const scenesAll = B.scenes || []; const h = hooks[rec - 1] || {};
    const groups = phGroups(plan); const PART = { 기: "상황", 승: "전개", 전: "반전", 결: "마무리" };
    const ctx = (g) => { const a0 = Math.max(0, g.start - 32), b1 = Math.min(g.text.length, g.end + 32); return `${a0 > 0 ? "…" : ""}${phHtml(g.text.slice(a0, g.start))}<span class="ph-slot">${esc(g.label)}</span>${phHtml(g.text.slice(g.end, b1))}${b1 < g.text.length ? "…" : ""}`; };
    const parts = ["기", "승", "전", "결"].map(k => { const sc = scenesAll.filter(x => x.part === k || (k === "기" && x.part === "훅")); return sc.length ? `<div class="ez-part part-${k}"><span class="ez-bar"></span><div><small>${PART[k]}</small><p>${sc.map(x => phHtml(x.say)).join(" ")}</p></div></div>` : ""; }).join("");
    const script = scenesAll.map(x => x.say || "").join(" ");
    const sceneCard = (sc, si) => { const g = sc.guide || {}; const f = sc.framing || {}; const img = sc.sketch ? `<img src="${esc(sc.sketch)}" loading="lazy">` : (refFrameImg(p, sc.ref_frame) || "");
      const how = [g.composition || [f.shot, f.camera].filter(Boolean).join(" · "), g.action].filter(Boolean); const hasPh = /\[확인\s*필요/.test(sc.say || "");
      return `<div class="ez-scene"><div class="ez-img">${img}<span class="ez-no">${sc.no}</span></div><div class="ez-body"><div class="ez-meta"><span class="tag part-${esc(sc.part || "")}">${esc(PART[sc.part] || (sc.part === "훅" ? "첫 문장" : sc.part) || "")}</span><span class="muted">${esc(sc.sec)}초</span></div>
        <div class="ez-say">${hasPh ? phHtml(sc.say) : ed("B_plan.scenes." + si + ".say", sc.say, "inline", "span")}</div>
        ${how.length ? `<div class="ez-how"><b>이렇게 찍기</b>${how.map(x => `<div>· ${esc(x)}</div>`).join("")}</div>` : ""}
        <details class="ez-more"><summary>자세히 (자막·화면·조명·소품·편집)</summary><table class="gtable"><tr><th>자막</th><td>${phHtml(sc.caption || "-")}</td></tr><tr><th>화면</th><td>${phHtml(sc.screen || "-")}</td></tr>${g.light ? `<tr><th>조명</th><td>${esc(g.light)}</td></tr>` : ""}${g.props ? `<tr><th>소품</th><td>${esc(g.props)}</td></tr>` : ""}${g.wear ? `<tr><th>의상·배경</th><td>${esc(g.wear)}</td></tr>` : ""}${g.look ? `<tr><th>표정·시선</th><td>${esc(g.look)}</td></tr>` : ""}${g.take ? `<tr><th>테이크</th><td>${esc(g.take)}</td></tr>` : ""}${g.camera ? `<tr><th>폰</th><td>${esc(g.camera)}</td></tr>` : ""}</table><div class="cchips">${chips(sc.capcut) || ""}</div>${sc.tip ? `<div class="sb-tip">${esc(sc.tip)}</div>` : ""}</details></div></div>`; };
    return `<div class="ez-wrap">
      <div class="ez-steps"><span class="${groups.length ? "" : "done"}">① 숫자 채우기</span><span>② 첫 문장 정하기</span><span>③ 순서대로 찍기</span><span>④ 올리기</span></div>
      <div class="ez-grid"><div class="ez-left">${titleCardHtml(plan, p, hooks, rec, scenesAll)}</div><div class="ez-right">
      ${groups.length ? `<section class="ez-sec ez-fill"><h3>① 빈칸 ${groups.length}곳을 채워 주세요 <small>빈칸이 들어간 문장을 전부 먼저 보여드려요 · 모르면 비워 두고 나중에 채워도 됩니다</small></h3><div class="fill-list">${groups.map((g, gi) => `<div class="fill-row"><div class="fr-ctx"><div class="fr-where">${esc(g.where.slice(0, 3).join(" · "))}${g.where.length > 3 ? ` 외 ${g.where.length - 3}곳` : ""}${g.occ.length > 1 ? ` <b class="fr-n">${g.occ.length}곳 같이 바뀜</b>` : ""}</div><div class="fr-text">${ctx(g)}</div></div><input class="fill-in" data-gi="${gi}" placeholder="${esc(phHint(g.label))}"></div>`).join("")}</div><button class="btn p" style="margin-top:12px" onclick="fillNumbers('${esc(p.id)}')">대본에 채우기</button></section>` : `<section class="ez-sec ez-fill done"><h3>① 숫자 채우기 <small>완료 · 대본에 빈칸이 없어요</small></h3></section>`}
      <section class="ez-sec"><h3>② 첫 문장 <small>3초 안에 멈춰 세우는 한마디 · 아래에서 바로 바꿀 수 있어요</small></h3><div class="ez-hook"><span class="tag htype">${esc(h.type || "")}</span><div class="ez-hook-line">${phHtml(h.line || "")}</div></div>
        ${hooks.length > 1 ? `<div class="ez-alt-label">다른 첫 문장 ${hooks.length - 1}개 · 누르면 1번 장면과 썸네일 문구가 같이 바뀝니다</div><ol class="hooklist">${hooks.map((x, i) => i + 1 == rec ? "" : `<li class="hook-row"><span class="tag htype">${esc(x.type)}</span><div class="hline">${phHtml(x.line)}</div><button class="hook-pick" onclick="applyHook('${esc(p.id)}', ${i + 1})">이걸로</button></li>`).join("")}</ol>` : ""}
        <div class="ez-newhook"><b>다른 훅 공식으로 새로 뽑기</b><div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px"><select id="hook-formula" class="chip" style="max-width:180px">${HOOK_FORMULAS.map(f => `<option>${f}</option>`).join("")}</select><button class="btn small" onclick="genHooks('${esc(p.id)}')">이 공식으로 3개 더</button><button class="btn small" onclick="rewriteOpening('${esc(p.id)}', ${rec})">첫 문장에 맞춰 1~2번 장면 다시 쓰기</button><span id="hook-msg" class="muted" style="font-size:12px"></span></div></div></section>
      <section class="ez-sec"><h3>대본 <small>${esc(plan.length_sec)}초 · 색 띠가 흐름입니다 · 이대로 읽으면 됩니다</small><span class="row" style="margin-left:auto;gap:6px"><button class="btn small" onclick="navigator.clipboard.writeText(${JSON.stringify(script).replace(/"/g, "&quot;")});toast('대본 복사됨')">복사</button><button class="btn small p" onclick="openPrompter()">크게 보기</button></span></h3><div class="ez-script">${parts}</div></section>
      <section class="ez-sec"><h3>③ 순서대로 찍기 <small>${scenesAll.length}장면 · 장면마다 2번씩</small></h3><div class="ez-scenes">${scenesAll.map(sceneCard).join("")}</div></section>
      <section class="ez-sec"><h3>④ 올릴 때</h3><table class="gtable"><tr><th>캡션</th><td><div style="white-space:pre-wrap">${phHtml(B.caption_text || "-")}</div><button class="btn small" style="margin-top:6px" onclick="navigator.clipboard.writeText(${JSON.stringify(B.caption_text || "").replace(/"/g, "&quot;")});toast('캡션 복사됨')">캡션 복사</button></td></tr><tr><th>마지막 멘트</th><td>${phHtml((B.cta || {}).say || "-")}</td></tr><tr><th>댓글 질문</th><td>${phHtml((B.cta || {}).comment_question || "-")}</td></tr>${B.music ? `<tr><th>음악</th><td>${esc(B.music)}</td></tr>` : ""}</table></section>
      </div></div></div>`;
  }

  function renderPlanTab(plan, p) {
    const B = plan.B_plan || {}; const hooks = B.hooks || []; const rec = B.recommended_hook || 1; const scenesAll = B.scenes || [];
    const PART = { 기: "기 · 상황", 승: "승 · 전개", 전: "전 · 반전", 결: "결 · 마무리" };
    // ---- 왼쪽: 훅 고르기(펼침) + 나머지는 접힌 카드(제목만 크게)
    const hookRows = hooks.map((h, i) => `<li class="hook-row ${i + 1 == rec ? "on" : ""}"><span class="tag htype">${esc(h.type)}</span><div class="hline">${ed("B_plan.hooks." + i + ".line", h.line, "inline", "span")}${h.generated ? ' <span class="tag ok">new</span>' : ""}</div><button class="hook-pick" onclick="applyHook('${esc(p.id)}', ${i + 1})">${i + 1 == rec ? "✓ 적용됨" : "이걸로"}</button></li>`).join("");
    const left = `<aside class="plan-side">${titleCardHtml(plan, p, hooks, rec, scenesAll)}
      <div class="side-sec"><h3>첫 문장(훅) 고르기 <small>누르면 씬 1에 바로 적용</small></h3><ol class="hooklist">${hookRows}</ol>
        <details class="wiz-more small"><summary>다른 훅 공식으로 더 뽑기 · 말투 다듬기</summary><div class="row" style="margin-top:8px;gap:6px;flex-wrap:wrap"><select id="hook-formula" class="chip" style="max-width:170px">${HOOK_FORMULAS.map(f => `<option>${f}</option>`).join("")}</select><button class="btn small" onclick="genHooks('${esc(p.id)}')">이 공식으로 3개 더</button><button class="btn small" onclick="rewriteOpening('${esc(p.id)}', ${rec})">훅에 맞춰 씬 1~2 다시 쓰기</button><button class="btn small" onclick="humanize('${esc(p.id)}')">내 말투로 다듬기</button><span id="hook-msg" class="muted" style="font-size:12px"></span></div></details></div>
      ${plan.script_full ? `<details class="side-sec fold"><summary><b>전체 대본</b><small>한 호흡으로 읽기 · 프롬프터용</small></summary>${ed("script_full", plan.script_full, "capbox script")}<div class="row" style="margin-top:6px;gap:6px"><button class="btn small" onclick="navigator.clipboard.writeText(CUR.plan.script_full);toast('대본 복사됨')">복사</button><button class="btn small" onclick="likeScript('${esc(p.id)}')" title="이 대본을 좋은 예시로 저장 → 다음 기획안이 이 수준을 따라감">이 대본 좋아요 (예시로 학습)</button></div></details>` : ""}
      <details class="side-sec fold"><summary><b>다음에 할 일</b><small>4단계</small></summary><ol class="todo"><li>[확인 필요] 자리를 내 숫자로 채우기</li><li>씬 순서대로 폰으로 촬영 (씬당 2번씩)</li><li>"편집 외주용" 탭을 편집자에게 보내거나 캡컷에서 그대로 따라 편집</li><li>캡션 복사해서 올리고 댓글 질문에 답하기</li></ol></details>
      <details class="side-sec fold"><summary><b>캡션 · 음악 · 마지막 멘트</b></summary>${ed("B_plan.caption_text", B.caption_text, "capbox")}<div class="muted" style="margin:8px 0 4px">${esc(B.music || "-")}</div><div><b>마지막 멘트</b> ${ed("B_plan.cta.say", (B.cta || {}).say, "inline", "span")}</div><div class="muted">자막: ${ed("B_plan.cta.caption", (B.cta || {}).caption, "inline", "span")} · 댓글 유도: ${ed("B_plan.cta.comment_question", (B.cta || {}).comment_question, "inline", "span")}</div></details>
      <details class="side-sec fold"><summary><b>찍을 것 · 준비물 · 초보 실수</b><small>${(B.shot_list || []).length + (B.prep || []).length}개</small></summary><ul>${(B.shot_list || []).map(x => `<li>${esc(x)}</li>`).join("")}${(B.prep || []).map(x => `<li class="muted">${esc(x)}</li>`).join("")}</ul><b>초보 실수</b><ul>${(B.tips || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul></details>
      ${(plan.pro || {}).questions && plan.pro.questions.length ? `<details class="side-sec fold warnbox" open><summary><b>확인해 주세요</b><small>${plan.pro.questions.length}개</small></summary><ul>${plan.pro.questions.map(q => `<li>${esc(q)}</li>`).join("")}</ul></details>` : ""}</aside>`;
    // ---- 오른쪽: 촬영 가이드(그림 가로 배치 + 표) / 대본(가로 표)
    const bestRef = (p.refs || []).reduce((a, b) => ((b.views || 0) > ((a || {}).views || 0) ? b : a), null); const bestIdx = bestRef ? (p.refs || []).indexOf(bestRef) : -1; const bestA = ((plan.A_refs) || []).find(x => x.ref === bestIdx + 1);
    const grow = (k, v) => v ? `<tr><th>${k}</th><td>${esc(v)}</td></tr>` : "";
    const scene = (s) => { const f = s.framing || {}; const g = s.guide || {}; const si = scenesAll.indexOf(s);
      const rf = s.ref_frame || {}; const rr = (p.refs || [])[(rf.ref || 0) - 1]; const rfr = rr ? ((rr.frames || [])[(rf.frame || 1) - 1] || {}) : {}; const cut = rr && rr.analysis && rr.analysis.timeline ? rr.analysis.timeline.find(c => rfr.t != null && c.t0 <= rfr.t && rfr.t < c.t1) : null;
      return `<div class="scene v-guide"><div class="scene-head"><span class="scene-no">${s.no}</span><span class="scene-sec">${esc(s.sec)}초</span><span class="tag part-${esc(s.part || "")}">${esc(PART[s.part] || s.part || "")}</span>${f.shot ? `<span class="muted">${esc(f.shot)}${f.camera ? " · " + esc(f.camera) : ""}</span>` : ""}</div>
        <div class="scene-body2">
          <div class="scene-visual2">${s.sketch ? `<figure class="sb-ref sk-img"><img src="${esc(s.sketch)}" loading="lazy" title="${esc(s.sketch_prompt || "")}"><figcaption>내 구도 <a href="#" onclick="event.preventDefault();reSketch('${esc(p.id)}', ${s.no})">다시 그리기</a></figcaption></figure>` : sketch(f)}${refFrameImg(p, s.ref_frame)}</div>
          ${cut || rf.why ? `<div class="ref-line"><b>이 장면의 레퍼런스${rr ? " · @" + esc(rr.account) + " ▶ " + fmt(rr.views) : ""}</b>${cut ? ` <span>${esc(cut.t0)}~${esc(cut.t1)}초 · ${esc(cut.transition)}${cut.script ? ` · "${esc(cut.script.slice(0, 40))}"` : ""}${(cut.captions || []).length ? ` · 자막 ${esc(cut.captions.map(c => c.text).join(" / ").slice(0, 30))}` : ""}${(cut.sfx || []).length ? ` · ${esc(cut.sfx.map(e => e.name || "").join(","))}` : ""}</span>` : ""}${rf.why ? `<span class="muted"> · ${esc(rf.why)}</span>` : ""}${s.ref_style ? `<span class="muted"> · ${esc(s.ref_style)}</span>` : ""}</div>` : ""}
          <div class="say-big">${ed("B_plan.scenes." + si + ".say", s.say, "say")}</div>
          <table class="gtable"><tr><th>자막</th><td>${ed("B_plan.scenes." + si + ".caption", s.caption, "inline", "span")}${f.text_pos ? ` <span class="muted">(${esc(f.text_pos)})</span>` : ""}</td></tr><tr><th>화면</th><td>${ed("B_plan.scenes." + si + ".screen", s.screen, "inline", "span")}</td></tr></table>
          <div class="glabel">이렇게 찍으세요</div>
          <table class="gtable">${grow("폰", g.camera)}${grow("구도", g.composition || [f.shot, f.camera].filter(Boolean).join(" · "))}${grow("조명", g.light)}${grow("소품", g.props)}${grow("행동", g.action)}${grow("의상·배경", g.wear)}${grow("표정·시선", g.look)}${grow("테이크", g.take)}</table>
          <div class="glabel">캡컷 편집</div><div class="cchips">${chips(s.capcut) || '<span class="muted">-</span>'}</div>${s.tip ? `<div class="sb-tip">${ed("B_plan.scenes." + si + ".tip", s.tip, "inline", "span")}</div>` : ""}
        </div></div>`; };
    const scriptTable = `<div class="tablewrap"><table class="scenes stable"><tr><th>씬</th><th>초</th><th>단계</th><th>대사 (말하는 것)</th><th>자막</th><th>화면에 보이는 것</th></tr>${scenesAll.map((s, si) => `<tr><td><b>${s.no}</b></td><td>${esc(s.sec)}</td><td><span class="tag part-${esc(s.part || "")}">${esc(PART[s.part] || s.part || "")}</span></td><td class="say">${ed("B_plan.scenes." + si + ".say", s.say, "inline", "span")}</td><td class="cap">${ed("B_plan.scenes." + si + ".caption", s.caption, "inline", "span")}</td><td>${esc(s.screen)}</td></tr>`).join("")}</table></div>`;
    const A0 = ((plan.A_refs) || [])[0]; const bestA2 = bestA || A0; const partsLine = ["기", "승", "전", "결"].map(k => { const sc = scenesAll.filter(x => x.part === k); return sc.length ? `<div class="bone"><span class="tag part-${k}">${esc(PART[k])}</span><div class="bone-text">${sc.map(x => phHtml(x.say)).join(" ")}</div></div>` : ""; }).join("");
    const turnSay = scenesAll.filter(x => x.part === "전").map(x => x.say).join(" ") || (scenesAll[Math.floor(scenesAll.length / 2)] || {}).say || ""; const teaseTxt = String(turnSay).replace(/\[확인\s*필요[:：]?\s*([^\]]*)\]/g, "○○").slice(0, 38);
    const bones = `<details class="bones fold2 teaser"><summary><span class="ph-kicker">이 기획안의 뼈대 — 레퍼런스가 터진 구조를 그대로 옮겼습니다</span><div class="bt-flow">${["기", "승", "전", "결"].map(k => `<span class="tag part-${k}">${esc(PART[k])}</span>`).join("<i>→</i>")}</div><div class="bt-tease"><span>반전 포인트</span> “${esc(teaseTxt)}…” <b class="bt-open">펼쳐서 전체 흐름 보기</b></div></summary>${bestA2 ? `<div class="bone-ref"><b>레퍼런스 구조</b> ${esc(bestA2.structure || "")}${bestA2.steal ? ` · <mark>${esc(bestA2.steal)}</mark>` : ""}</div>` : ""}${partsLine}</details>`;
    return `<div class="plan-layout">${left}<div class="plan-main">${bones}<div class="plan-toolbar"><h2 style="margin:0">씬별 ${VIEW === "script" ? "대본" : "촬영 가이드"} <small>${scenesAll.length}씬 · ${esc(plan.length_sec)}초 · 눌러서 바로 고치기</small></h2><div class="seg">${[["guide", "촬영 가이드"], ["script", "대본"]].map(([k, v]) => `<button class="${VIEW === k ? "on" : ""}" onclick="planView('${k}')">${v}</button>`).join("")}</div></div>
      ${VIEW === "script" ? scriptTable : `<div class="scenes-list2">${scenesAll.map(scene).join("")}</div>`}</div></div>`;
  }
  let REF_TABLE = false; window.refTable = () => { REF_TABLE = !REF_TABLE; renderPlan2(CUR); };
  const kv = (label, val) => val ? `<div class="kv2"><small>${esc(label)}</small><div>${val}</div></div>` : "";
  function renderRefsTab(p) {
    const refs = p.refs || []; const A = ((p.plan || {}).A_refs) || [];
    if (!refs.length) return '<div class="muted">레퍼런스가 없어요</div>';
    return `<div class="row" style="justify-content:flex-end;margin-bottom:8px"><button class="btn small" onclick="refTable()">${REF_TABLE ? "카드로 보기" : "표로 보기"}</button></div>` + refs.map((r, i) => {
      const a = A.find(x => x.ref === i + 1); const an = r.analysis || {}; const d = an.delivery || {}; const frames = r.frames || [];
      const chips = an.timeline ? [`⏱ ${an.duration}초`, `✂️ 컷 ${an.shots}개 · 평균 ${an.avg_shot}초`, `컷 ${(an.transitions || {})["컷"] || 0} · 부드러운 ${(an.transitions || {})["부드러운 전환"] || 0}`, `${d.tone || "-"} · ${d.speed || "-"}${d.avg_rate ? ` (${d.avg_rate}자/초)` : ""}`, `어미 ${(d.endings || []).join(" / ") || "-"}`, `쉼 ${d.pauses || "-"}`, `${an.music || "-"}`, `효과음 ${(an.sfx || []).length}곳`] : [];
      // 컷 카드: AI 분석표(a.timeline)가 있으면 그것, 없으면 자동 분석표(an.timeline)
      const rowsAI = (a && a.timeline) ? a.timeline.map(x => ({ t: x.t, frames: [], screen: x.screen, script: x.script, caption: x.caption, text_style: x.text_style, transition: x.transition, sfx: x.sfx, effect: x.effect, point: x.point })) : null;
      const rowsAuto = (an.timeline || []).map(x => ({ t: `${x.t0}~${x.t1}`, frames: x.frames || [], screen: "", script: x.script, caption: (x.captions || []).map(c => c.text).join(" / "), text_style: (x.captions || [])[0] ? `${x.captions[0].pos} · ${x.captions[0].size}` : "", transition: x.transition, sfx: (x.sfx || []).map(e => (e.name ? e.name + " " : "") + e.t + "s").join(", "), effect: "", point: x.capcut }));
      const rows = rowsAI || rowsAuto;
      const cards = rows.map((x, k) => `<div class="cutcard"><div class="cut-img">${x.frames[0] ? `<img src="${esc(x.frames[0])}" loading="lazy">` : (rowsAI && frames[k] ? `<img src="${esc(frames[k].path)}" loading="lazy">` : `<div class="cut-ph">${k + 1}</div>`)}</div>
        <div class="cut-body"><div class="cut-head"><b>${esc(x.t)}초</b>${x.transition && x.transition !== "시작" ? `<span class="tag">${esc(x.transition)}</span>` : ""}${x.sfx ? `<span class="tag">${esc(x.sfx)}</span>` : ""}${x.effect && x.effect !== "없음" ? `<span class="tag">${esc(x.effect)}</span>` : ""}</div>
        ${x.screen ? `<div class="cut-screen">${esc(x.screen)}</div>` : ""}${x.script ? `<div class="cut-say">${esc(x.script)}</div>` : '<div class="muted">(대사 없음)</div>'}
        ${x.caption ? `<div class="cut-cap">${esc(x.caption)}${x.text_style ? ` <span class="muted">· ${esc(x.text_style)}</span>` : ""}</div>` : ""}${x.point ? `<div class="cut-point">${esc(x.point)}</div>` : ""}</div></div>`).join("");
      const table = `<div class="tablewrap"><table class="scenes"><tr><th>초</th><th>화면</th><th>대사</th><th>자막</th><th>텍스트</th><th>전환</th><th>효과음</th><th>효과</th><th>배울 점</th></tr>${rows.map(x => `<tr><td>${esc(x.t)}</td><td>${esc(x.screen)}</td><td class="say">${esc(x.script)}</td><td class="cap">${esc(x.caption)}</td><td>${esc(x.text_style)}</td><td>${esc(x.transition)}</td><td>${esc(x.sfx)}</td><td>${esc(x.effect)}</td><td class="muted">${esc(x.point)}</td></tr>`).join("")}</table></div>`;
      return `<section class="refsec">
        <div class="ref-head"><img src="${esc(r.thumbnail || "")}" onerror="imgRetry(this)"><div><div class="ph-kicker">레퍼런스 ${i + 1}</div><div class="ref-name">@${esc(r.account)} <a href="${esc(r.url)}" target="_blank" class="btn small">원본 ↗</a></div><div class="ref-metrics"><span>${esc(r.industry || "")}</span><span>▶ ${fmt(r.views)}</span><span>❤ ${fmt(r.likes)}</span><span>${esc(r.posted_at || "")}</span></div><div class="ref-desc">${esc(r.description || "")}</div></div></div>
        ${chips.length ? `<div class="chiprow">${chips.map(c => `<span class="chip2">${esc(c)}</span>`).join("")}</div>` : '<div class="muted">영상 분석 전 (캡션·썸네일만 참고됨)</div>'}
        ${a ? `<div class="why-grid"><div class="whybox"><b>왜 터졌나</b><ul>${(a.why_it_worked || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul></div><div class="whybox">${kv("첫 문장", `<b>${esc(a.hook_line)}</b>`)}${kv("구조", esc(a.structure))}${kv("말투", esc(a.speech_style))}${kv("편집", esc(a.edit_style))}${kv("내 영상에 가져올 것", `<mark>${esc(a.steal)}</mark>`)}</div></div>` : ""}
        ${frames.length ? `<details class="wiz-more small"><summary>프레임 ${frames.length}장 한눈에</summary><div class="filmstrip">${frames.map(f => `<img src="${esc(f.path)}" title="${f.t}s" loading="lazy">`).join("")}</div></details>` : ""}
        <h3 class="sub">컷별로 뜯어보기 <small>${rows.length}컷 · ${rowsAI ? "AI 정리" : "자동 분석"}</small></h3>
        ${REF_TABLE ? table : `<div class="cutgrid">${cards}</div>`}
        ${an.speech && an.speech.length ? `<details class="wiz-more small"><summary>말한 그대로 (속도·어미·힘준 단어)</summary><div class="tablewrap"><table class="scenes" style="min-width:600px"><tr><th>초</th><th>대사</th><th>속도</th><th>어미</th><th>앞 쉼</th><th>힘준 단어</th></tr>${an.speech.map(sp => `<tr><td>${sp.t}</td><td>${esc(sp.text)}</td><td>${esc(sp.speed)}</td><td>${esc(sp.ending)}</td><td>${sp.pause_before}s</td><td>${(sp.emphasis || []).map(esc).join(", ")}</td></tr>`).join("")}</table></div></details>` : ""}
      </section>`;
    }).join("");
  }
  function renderProTab(plan, p) {
    const eb = (plan.pro || {}).edit_brief; const pro = plan.pro || {};
    if (!eb) return `<div class="panel warn"><b>편집 외주서가 아직 없어요.</b> 씬표를 바탕으로 폰트·효과음·컷·전환·색감·납품 규격까지 편집자에게 그대로 넘길 문서를 만듭니다 (1~2분).<div style="margin-top:8px"><button class="btn p" onclick="makeBrief('${esc(p.id)}')">편집 외주서 만들기</button></div></div>`;
    const f = eb.fonts || {}; const m = f.main || {}; const ac = f.accent || {}; const sd = eb.sound || {}; const bg = sd.bgm || {}; const dv = eb.deliverable || {}; const col = eb.color || {}; const pc = eb.pacing || {}; const en = eb.ending || {};
    const stale = p.edited_at && eb.made_at && p.edited_at > eb.made_at;
    const tk = (() => { try { return localStorage.getItem("hc_token") || ""; } catch (e) { return ""; } })(); const q = tk ? "?t=" + encodeURIComponent(tk) : "";
    return `${stale ? `<div class="panel warn" style="margin-bottom:10px">기획안을 고친 뒤라 편집 외주서가 옛 내용일 수 있어요. <button class="btn small p" onclick="makeBrief('${esc(p.id)}')">지금 기획안 기준으로 다시 만들기</button></div>` : ""}
      <div class="brief-bar"><div><div class="ph-kicker">편집 외주서 <small>편집자에게 이 문서를 그대로 보내면 됩니다</small></div><div class="brief-summary">${esc(eb.summary || "")}</div></div><div class="row" style="gap:6px;flex-wrap:wrap;justify-content:flex-end"><a class="btn p" href="/api/plans/${esc(p.id)}/brief.pdf${q}">PDF로 받기</a><button class="btn" onclick="navigator.clipboard.writeText(briefText());toast('복사됨')">텍스트 복사</button><button class="btn" onclick="makeBrief('${esc(p.id)}')">다시 만들기</button></div></div>
      <iframe class="brief-doc" src="/api/plans/${esc(p.id)}/brief.html${q}${q ? "&" : "?"}v=${Date.now()}" onload="try{this.style.height=(this.contentDocument.documentElement.scrollHeight+24)+'px'}catch(e){}"></iframe>`;
  }
  window.briefText = () => { const eb = ((CUR.plan || {}).pro || {}).edit_brief || {}; const f = eb.fonts || {}; const sd = eb.sound || {}; const dv = eb.deliverable || {};
    return [`[편집 외주서] ${CUR.plan.title}`, eb.summary, `납품: ${dv.ratio} / ${dv.fps}fps / ${dv.length} / ${dv.export} / ${dv.safe_zone}`, `폰트: 메인 ${(f.main || {}).name} (${(f.main || {}).size}, ${(f.main || {}).color}, 외곽선 ${(f.main || {}).stroke}, ${(f.main || {}).position}) · 강조 ${(f.accent || {}).name} ${(f.accent || {}).color}`, ...(f.rules || []).map(x => " - " + x), `BGM: ${(sd.bgm || {}).mood} / 검색 ${(sd.bgm || {}).capcut_search} / ${(sd.bgm || {}).volume}`, "효과음:", ...(sd.sfx || []).map(x => ` - ${x.t}s 씬${x.scene} ${x.name} (${x.why})`), `색감: ${(eb.color || {}).look} / ${(eb.color || {}).capcut}`, `속도: ${(eb.pacing || {}).cut_rule} / ${(eb.pacing || {}).transitions} / ${(eb.pacing || {}).speed}`, "씬별:", ...(eb.scenes || []).map(x => ` ${x.no}) ${x.sec}s 컷:${x.cut} | 자막:${x.text} | 전환:${x.transition} | 효과음:${x.sfx} | 효과:${x.effect} | B롤:${x.broll} | 주의:${x.note}`), "체크리스트:", ...(eb.checklist || []).map(x => " - " + x)].join("\n"); };
  window.makeBrief = async (pid) => { showWait("편집 외주서 쓰는 중", 90, "폰트·효과음·컷·전환·색감·납품 규격을 정리하고 있어요"); try { const r = await post("/api/plans/" + pid + "/edit_brief", {}); if (r.error) throw new Error(r.error); CUR = r; TAB = "pro"; renderPlan2(r); } catch (e) { toast("실패: " + e.message); } finally { hideWait(); } };
  window.humanize = async (pid) => { const tone = prompt("내 말투를 적어주세요 (예: 존댓말, 담백하게, '아니 여러분'으로 가끔 시작 / 반말, 텐션 높게). 비워도 돼요", ((CUR.brief || {}).tone) || ""); if (tone === null) return; showWait("말투 다듬는 중", 60, "대사·훅·CTA·캡션을 사람 말로 바꾸고 있어요"); try { const r = await post("/api/plans/" + pid + "/humanize", { tone }); if (r.error) throw new Error(r.error); CUR = r; renderPlan2(r); toast("말투를 다듬었어요"); } catch (e) { toast("실패: " + e.message); } finally { hideWait(); } };

  window.savePlanJson = async function (pid) {
    let j; try { j = JSON.parse($("#plan-json").value); } catch (e) { return toast("JSON 형식이 아니에요"); }
    await post("/api/plans/" + pid + "/save", { plan: j }); CUR = await api("/api/plans/" + pid); TAB = "plan"; renderPlan2(CUR);
  };

  // ---------------- 기획 홈 (보관함 + 시작)
  const STAGES = ["기획 중", "촬영 예정", "촬영 완료", "편집 중", "올림"];
  let PF = { folder: "전체", stage: "" };
  function planListHtml(plans) {
    const folders = [...new Set(plans.map(p => p.folder).filter(Boolean))].sort();
    const shown = plans.filter(p => (PF.folder === "전체" || (PF.folder === "(폴더 없음)" ? !p.folder : p.folder === PF.folder)) && (!PF.stage || (p.stage || "기획 중") === PF.stage));
    const cnt = (f) => plans.filter(p => f === "전체" ? true : f === "(폴더 없음)" ? !p.folder : p.folder === f).length;
    return `<div class="plan-toolbar" style="margin-bottom:10px"><h2 style="margin:0">내 기획 <small>${plans.length}개</small></h2><div class="row" style="gap:6px;flex-wrap:wrap"><select class="chip" onchange="PF_set('stage', this.value)"><option value="">진행 단계: 전체</option>${STAGES.map(s => `<option ${PF.stage === s ? "selected" : ""}>${s}</option>`).join("")}</select><button class="btn small" onclick="newFolder()">+ 새 폴더</button></div></div>
      <div class="rcats" style="margin-bottom:10px"><button class="rcat ${PF.folder === "전체" ? "on" : ""}" onclick="PF_set('folder','전체')">전체 ${cnt("전체")}</button>${folders.map(f => `<button class="rcat ${PF.folder === f ? "on" : ""}" onclick="PF_set('folder',${JSON.stringify(f).replace(/"/g, "&quot;")})">${esc(f)} ${cnt(f)}</button>`).join("")}${folders.length ? `<button class="rcat ${PF.folder === "(폴더 없음)" ? "on" : ""}" onclick="PF_set('folder','(폴더 없음)')">폴더 없음 ${cnt("(폴더 없음)")}</button>` : ""}</div>
      ${shown.length ? `<div class="plangrid">${shown.map(p => `<div class="plancard"><div class="pc-cover" onclick="location.hash='#/plan/${p.id}'">${p.cover ? `<img src="${esc(p.cover)}" onerror="imgRetry(this)">` : ""}<span class="tag ${p.status === "done" ? "ok" : ""}">${p.status === "done" ? "완성" : "프롬프트만"}</span></div><div class="pc-body"><b onclick="location.hash='#/plan/${p.id}'" style="cursor:pointer">${esc(p.title || "(제목 없음)")}</b><div class="muted">${esc(p.job || "")} · 참고 ${p.refs}개 · ${esc(p.created_at || "")}</div>
        <div class="pc-meta"><select class="chip stage-${STAGES.indexOf(p.stage || "기획 중")}" onchange="setPlanMeta('${p.id}', {stage: this.value})">${STAGES.map(s => `<option ${(p.stage || "기획 중") === s ? "selected" : ""}>${s}</option>`).join("")}</select><select class="chip" onchange="if(this.value==='__new'){newFolder('${p.id}')}else{setPlanMeta('${p.id}', {folder: this.value})}"><option value="" ${!p.folder ? "selected" : ""}>폴더 없음</option>${folders.map(f => `<option ${p.folder === f ? "selected" : ""}>${esc(f)}</option>`).join("")}<option value="__new">+ 새 폴더로…</option></select></div></div></div>`).join("")}</div>` : `<div class="empty"><b>${plans.length ? "이 조건에 맞는 기획이 없어요" : "아직 만든 기획이 없어요"}</b>${plans.length ? "" : "새 기획 만들기로 첫 기획안을 만들어보세요."}</div>`}`;
  }
  window.PF_set = (k, v) => { PF[k] = v; viewPlanHome(); };
  window.setPlanMeta = async (pid, d) => { try { await post("/api/plans/" + pid + "/meta", d); toast("저장됨"); viewPlanHome(); } catch (e) { toast(e.message); } };
  window.newFolder = async (pid) => { const name = (prompt("새 폴더 이름 (예: 9월 카페 시리즈)") || "").trim(); if (!name) return; if (pid) await setPlanMeta(pid, { folder: name }); else { PF.folder = "전체"; toast("폴더는 기획을 넣는 순간 생깁니다. 카드에서 '" + name + "'을 고르세요"); const plans = await api("/api/plans").catch(() => []); if (plans[0]) await setPlanMeta(plans[0].id, { folder: name }); } };
  window.viewPlanHome = async function () {
    const plans = await api("/api/plans").catch(() => []);
    $("#main").innerHTML = `<div class="plan-home"><div class="hero"><div><div class="ph-kicker">콘텐츠 기획</div><h1>5단계만 고르면<br>씬별 대본과 캡컷 편집표까지.</h1><p>직업 → 타깃 → 키워드 → 참고 릴스(최대 3개) → 주제. 참고 릴스는 컷·자막·대사·효과음까지 뜯어서 내 기획안에 옮깁니다.</p><button class="btn p big" onclick="wizStart()">+ 새 기획 만들기</button> ${W.job ? `<button class="btn big ghost2" onclick="wizResume()">이어서 하기 (STEP ${W.step})</button>` : ""}</div><div class="hero-art"><i></i><i></i><i></i></div></div>
    <div class="panel soft" style="margin-bottom:14px"><b>처음이세요? 이렇게 됩니다 (5분)</b><ol style="margin:6px 0 0 18px;line-height:1.8"><li>하는 일과 보여줄 사람을 버튼으로 고릅니다</li><li>키워드 하나 적으면 참고할 릴스가 뜹니다. 마음에 드는 걸 1~3개 누르세요</li><li>주제를 고르면 30초짜리 대본이 기·승·전·결로 나옵니다. 씬마다 무엇을 찍고 뭐라고 말할지 그림과 함께</li><li>마음에 안 드는 문장은 눌러서 고치고, 엑셀로 받아 편집자에게 넘기면 끝</li></ol></div>
    ${planListHtml(plans)}</div>`;
  };
  window.wizStart = () => { Object.assign(W, { step: 1, topic: "", topics: [] }); save(); if (location.hash !== "#/plan/new") location.hash = "#/plan/new"; else renderWizard(); };
  window.wizResume = () => { if (location.hash !== "#/plan/new") location.hash = "#/plan/new"; else renderWizard(); };
})();
