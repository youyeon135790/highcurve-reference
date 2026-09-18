// ✍️ 릴스 기획 — 5단계 고르기(직업 → 타깃 → 키워드 → 참고 릴스 → 주제) → 기획안. 레퍼런스 최대 3개, 캡컷 기준.
(function () {
  const W = { step: 1, mode: "own", job: "", target: [], keyword: "", subs: [], selSubs: [], refs: [], topic: "", topics: [], extra: {}, refsCache: [], urls: "" };
  // 작성 중인 기획은 계정별로 저장(같은 브라우저에서 계정을 바꿔도 섞이지 않게)
  const curUid = () => { try { return String(((window.authState && window.authState()) || {}).id || "0"); } catch (e) { return "0"; } };
  const WKEY = () => "planWiz:" + curUid();
  function syncUser() { const uid = curUid(); if (W.__uid === uid) return; const blank = { step: 1, mode: "own", job: "", target: [], keyword: "", subs: [], selSubs: [], refs: [], topic: "", topics: [], extra: {}, refsCache: [], urls: "", about: "", product: "", targetText: "", usp: "", sugg: null, profile: null, profileFor: "", mainRef: null, setTopics: [], autoOff: null, making: null, multi: false, moreOpen: false };
    for (const k of Object.keys(W)) delete W[k]; Object.assign(W, blank);
    try { const raw = localStorage.getItem(WKEY()) || (uid === "1" ? localStorage.getItem("planWiz") : null); if (raw) Object.assign(W, JSON.parse(raw)); } catch (e) {}
    W.__uid = uid; }
  if (!["own", "brand", "agency", "consign"].includes(W.mode)) { if (W.mode === "fast") W.speed = "fast"; W.mode = "own"; }
  const save = () => { try { localStorage.setItem(WKEY(), JSON.stringify({ ...W, refsCache: W.refsCache.slice(0, 48), refsX: undefined, topics: W.topics.slice(0, 32) })); } catch (e) {} };
  const JOBS = ["카페·베이커리", "식당·요식업", "뷰티샵·네일", "피부과·병원", "헬스·필라테스", "강사·코치", "인플루언서", "쇼핑몰·공동구매", "N잡러·프리랜서", "보험·금융", "부동산·공인중개사", "육아맘·주부", "개발자·IT", "여행·숙박업"];
  const AGES = ["10대", "20대", "30대", "40대", "50대+"]; const LIFE = ["직장인", "자영업 사장님", "학생", "주부", "육아맘", "자취생", "커플·신혼", "운동하는 사람", "창업 준비"];
  const HOOKS = ["질문형", "숫자형", "반전형", "고백형", "금지형", "발견형", "비교형", "경고형"];
  const HOOK_FORMULAS = ["금지명령형", "발견선언형", "소외공포형", "비밀누설형", "랭킹형", "조합공식형", "자가테스트형", "통념반전형", "공감저격형", "성과인증형", "시각증명형", "스토리형", "정리본형", "대조형", "비밀형", "지적형", "수치형", "원인찾기형", "경고형", "손해형", "비교형", "반전형", "도전형", "공감형", "증명형", "첫마디형", "질문형", "숫자형", "고백형"];
  // ---------- 기획 모드(대상별): 내 가게 / 브랜드·제품 / 대행사(클라이언트) / 커머스 위탁판매 — 준희 님 강의·클라이언트 기획안 노하우를 모드별로 질문·규칙·결과에 반영
  const MODES = [
    ["own", "🏪", "내 가게·내 계정", "자영업 사장님 · 강사 · 개인 브랜딩", "페르소나 한 문장 → 자영업 릴스 4종(과정·스토리·노출·트렌드) → 콕 집기·이득·손해 훅"],
    ["brand", "🏷", "브랜드·제품", "브랜드 계정 · 제품 홍보 · 공구", "이 편의 역할(인지·첫 구매·공구) → 소구점 축 하나 → 광고 티 없는 커머스 스토리텔링 → 신뢰 스택"],
    ["agency", "🎬", "숏폼 대행사", "클라이언트(사장님) 계정을 대신 기획", "컨셉안(손님·페인포인트) → 바이럴용/전환용 → PD 문답 → 제안 3줄 · 촬영 준비물 · 점검 5항목"],
    ["consign", "📦", "커머스 위탁판매", "재고 없이 스마트스토어·쿠팡에 파는 분", "실물 없을 때 촬영 대안 → 상세페이지·리뷰에서 소재 → 발견·손해·비교 훅 → 링크 CTA"]];
  const MODE_NAME = Object.fromEntries(MODES.map(m => [m[0], m[2]]));
  const JOBS_BY = { own: JOBS,
    brand: ["뷰티·화장품", "식품·건강식품", "리빙·생활용품", "패션·잡화", "유아·키즈", "반려동물", "디지털·가전", "취미·문구", "교육·서비스 브랜드", "F&B 프랜차이즈"],
    agency: ["카페·베이커리", "식당·요식업", "뷰티샵·네일·눈썹", "피부과·병원·한의원", "헬스·필라테스", "학원·강사·코치", "쇼핑몰·브랜드", "부동산·공인중개사", "꽃집·공방", "기타 자영업"],
    consign: ["리빙·주방", "뷰티·화장품", "식품·간식", "패션·잡화", "유아·키즈", "반려동물", "디지털·가전", "건강·운동용품", "계절·시즌템"] };
  const JOB_Q = { own: ["지금 어떤 일을 하고 계세요?", "대본의 말하는 사람(화자) 관점을 정하는 데 씁니다."], brand: ["어떤 제품·브랜드인가요?", "제품 카테고리를 고르고, 아래에 제품 한 줄과 이 편의 목적을 적어주세요."], agency: ["클라이언트는 어떤 업종인가요?", "대본의 화자는 클라이언트(사장님)입니다. 아래에 클라이언트 재료를 넣을수록 대본이 진짜가 됩니다."], consign: ["어떤 제품을 파세요?", "위탁이라 실물이 없어도 됩니다. 아래에서 실물 여부와 소싱 자료를 알려주세요."] };
  // 모드별 추가 질문: [key, label, chips|null, placeholder, multi]
  const MF = {
    own: [["reel_type", "이 편의 유형", ["과정(손이 움직이는 곳)", "스토리(실패담·손님 사연)", "자연스러운 노출(정보 안에 가게)", "트렌드·밈"]], ["pain", "손님의 속마음(막힌 것)", null, "예: 실패하면 어떡하지 / 돈만 날릴까 봐 / 뭐부터 할지 모르겠다"]],
    brand: [["product", "제품·서비스 한 줄", null, "예: 무향 섬유탈취제 500ml, 1만원 미만, 올리브영 입점"], ["goal", "이 편의 목적", ["인지(처음 알리기)", "첫 구매", "공구·이벤트", "재구매"]], ["axis", "소구점 축 (하나만)", ["구성", "가격", "상황", "성분·기능", "디자인", "후기"]], ["channel", "판매 채널", ["자사몰", "스마트스토어", "쿠팡", "올리브영·오프라인", "공구 링크"]], ["shoot", "찍을 수 있는 것", ["제품 실물", "사용 장면", "비포·애프터", "대표 얼굴", "직원·손님", "화면녹화"], "", true]],
    agency: [["client", "클라이언트(가게·원장님) 한 줄", null, "예: 수원 눈썹문신 샵 원장님, 10년차, 재시술 문의가 고민"], ["client_goal", "클라이언트 목표", ["문의·예약", "방문", "매출·판매", "팔로워", "브랜딩"]], ["role", "이 편의 역할", ["바이럴용(조회수·유입)", "전환용(문의·예약)"]], ["cast", "출연 형태", ["사장님 얼굴", "직원·손님", "손·과정만", "PD 문답", "나레이션(얼굴 없이)"]], ["materials", "클라이언트 재료", null, "예: 자주 받는 질문 3개 / 실패담 / 숫자(10년, 재시술 0건) / 손님 후기"]],
    consign: [["product", "파는 제품 한 줄", null, "예: 접이식 빨래건조대, 2만원대, 배송 2일"], ["platform", "판매 플랫폼", ["스마트스토어", "쿠팡", "공구", "기타"]], ["sample", "실물 보유", ["샘플 있음", "없음(공급사 영상·상세페이지로)", "곧 받을 예정"]], ["face", "얼굴 노출", ["가능", "손·제품만", "나레이션(얼굴 없이)"]], ["sources", "소싱 자료", null, "예: 상세페이지 링크, 리뷰 캡처 5개(칭찬·불만), 공급사 영상"]] };
  const TARGET_Q = { own: ["누구에게 보여주고 싶어요?", "나이와 상황을 같이 고를 수 있어요 (여러 개 가능)."], brand: ["누가 사나요?", "구매자를 좁힐수록 소구점이 날카로워집니다 (여러 개 가능)."], agency: ["클라이언트의 손님은 누구인가요?", "사장님 손님 기준으로 고르세요. 페인 포인트 하나가 릴스 주제 하나가 됩니다."], consign: ["누가 사나요?", "리뷰에 자주 보이는 구매자를 고르세요 (여러 개 가능)."] };
  const LIFE_BY = { own: LIFE, brand: ["직장인 여성", "직장인 남성", "육아맘", "자취생·1인 가구", "신혼·커플", "40~50대 부모님", "반려인", "선물 구매자", "운동하는 사람", "자영업 사장님"], agency: [...LIFE, "첫 방문 손님", "단골", "예약 망설이는 사람"], consign: ["직장인 여성", "직장인 남성", "육아맘", "자취생·1인 가구", "신혼·커플", "40~50대 부모님", "반려인", "선물 구매자", "캠핑·취미인", "학생"] };
  window.wizMode = (m) => { if (W.mode === m) return; W.mode = m; if (!JOBS_BY[m].includes(W.job)) W.job = ""; W.extra.mf = {}; W.topics = []; save(); renderWizard(); };
  window.wizMf = (k, el) => { W.extra.mf = W.extra.mf || {}; W.extra.mf[k] = el.value; save(); };
  window.wizMfPick = (k, v, multi) => { W.extra.mf = W.extra.mf || {}; const cur = W.extra.mf[k] || "";
    if (multi) { const a = cur ? cur.split(", ").filter(Boolean) : []; const i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else a.push(v); W.extra.mf[k] = a.join(", "); }
    else W.extra.mf[k] = cur === v ? "" : v;
    save(); renderWizard(); };
  const mfHtml = () => { const mf = W.extra.mf || {}; const rows = (MF[W.mode] || []).map(([k, label, chips, ph, multi]) => `<div class="mf-row"><small>${esc(label)}</small>${chips ? `<div class="pills small">${chips.map(v => pill(v, multi ? (mf[k] || "").split(", ").includes(v) : mf[k] === v, `wizMfPick('${k}','${esc(v)}',${multi ? "true" : "false"})`)).join("")}</div>` : `<input class="wiz-input" style="padding:8px 12px;font-size:13px" placeholder="${esc(ph || "")}" value="${esc(mf[k] || "")}" oninput="wizMf('${k}', this)">`}</div>`).join("");
    return rows ? `<div class="mf-box"><b>${esc(MODE_NAME[W.mode])} 모드에서 꼭 보는 것 <small class="muted">비워도 되지만, 채울수록 대본이 내 것이 됩니다</small></b>${rows}</div>` : ""; };
  const modeCards = () => `<div class="modes">${MODES.map(([k, ic, name, who, flow]) => `<button class="mode ${W.mode === k ? "on" : ""}" onclick="wizMode('${k}')"><span class="mode-ic">${ic}</span><b>${esc(name)}</b><small>${esc(who)}</small><em>${esc(flow)}</em></button>`).join("")}</div>`;
  const MP_LABEL = { persona_line: "페르소나 한 문장", reel_type: "릴스 유형", inner_problem: "건드리는 속마음", structure: "구조", funnel: "영상 끝에서 보내는 곳", next_3: "이어 찍을 3편", role: "이 편의 역할", appeal_axis: "소구점 축", trust_stack: "신뢰 근거", safety_line: "안전 소구", price_line: "가격 문장", cta_rule: "CTA 규칙", funnel_check: "올린 뒤 확인", content_ratio: "콘텐츠 비중 칸", variants: "같은 제품 다른 축", concept_line: "클라이언트 컨셉 한 줄", persona_pain: "손님 · 페인 포인트", owner_guide: "사장님이 채울 자리(가이드 질문)", proposal: "클라이언트에게 보낼 제안 3줄", client_prep: "사장님 준비물", review_checks: "대본 점검 5항목", batch: "촬영 회차", shoot_alt: "촬영 방식(실물 여부)", source_material: "상세페이지·리뷰에서 뽑은 소재", honest_line: "단점 한 줄", sell_path: "판매 경로 · CTA", search_keywords: "검색어", disclosure: "광고 표기", checks: "올리기 전 확인" };
  const mpVal = (v) => Array.isArray(v) ? `<ul>${v.map(x => `<li>${typeof x === "object" && x ? `${esc(x.persona || "")} — ${esc(x.pain || "")}${x.this_reel ? ' <span class="tag ok">이 편</span>' : ""}` : phHtml(String(x))}</li>`).join("")}</ul>` : (typeof v === "object" && v) ? esc(JSON.stringify(v)) : phHtml(String(v));
  function modePackHtml(plan, where) {
    const mp = plan && plan.mode_pack; if (!mp || typeof mp !== "object") return "";
    const name = MODE_NAME[mp.mode] || "모드"; const rows = Object.entries(mp).filter(([k, v]) => k !== "mode" && v && (!Array.isArray(v) || v.length)).map(([k, v]) => `<tr><th>${esc(MP_LABEL[k] || k)}</th><td>${mpVal(v)}</td></tr>`).join("");
    if (!rows) return "";
    return `<section class="pv-card"><div class="pv-h"><h2>${esc(name)} 체크</h2><span>이 모드에서 꼭 볼 것</span></div><table class="pv-kv">${rows}</table></section>`;
  }
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
  // 복사: 클립보드 API → 숨긴 글상자 복사 → 그래도 막히면 글을 띄워 직접 복사
  const copyText = async (t, msg) => { t = String(t == null ? "" : t);
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(t); toast(msg || "복사했어요"); return true; } } catch (e) {}
    try { const ta = document.createElement("textarea"); ta.value = t; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0"; document.body.appendChild(ta); ta.focus(); ta.select(); ta.setSelectionRange(0, t.length); const ok = document.execCommand("copy"); ta.remove(); if (ok) { toast(msg || "복사했어요"); return true; } } catch (e) {}
    try { $("#modal").className = "modal on"; $("#mask").classList.add("on"); $("#modal").innerHTML = `<button class="x" onclick="closeAll()">✕</button><h2 style="margin:0 0 6px">이 글을 복사해 주세요</h2><p class="muted" style="margin:0 0 10px">이 브라우저가 자동 복사를 막았어요. 아래 글을 전체 선택(⌘A)한 뒤 복사(⌘C)하세요.</p><textarea class="wiz-input mono" style="min-height:50vh;font-size:14px" onfocus="this.select()">${esc(t)}</textarea>`; const ta = $("#modal textarea"); if (ta) { ta.focus(); ta.select(); } } catch (e) {}
    return false; };
  window.copyText = copyText;
  const pill = (v, on, fn, extra = "") => `<button class="pill ${on ? "on" : ""}" onclick="${fn}" ${extra}>${esc(v)}</button>`;

  // ---------- 기다리는 화면: 퍼센트 + 준희 님 노하우 글귀
  const QUOTES = ["1은 비주얼 후킹, 2는 문제 제기, 3은 해결, 4는 정보와 CTA. 넷 다 이탈할 수 없어야 한다.", "구조가 좋으면 업종을 가리지 말고 대입해라. 구조만 가져와도 더 터진다.", "대본은 주 레퍼런스 하나에 고정한다. 섞으면 어색해진다.", "2.5초마다 화면이나 소리가 바뀌어야 한다.", "캐릭터를 보고 톤을 잡아라. 무뚝뚝한 사람에게 호들갑 대사를 주지 마라.", "훅에는 숫자가 있다. (3년차가 알려주는) 처럼 괄호로 자리를 잡아라.", "모든 영상은 기승전결. 정보형도 예외가 없다.", "뼈대는 레퍼런스 그대로, 소재만 내 가게로.", "첫 3초에 '이거 내 얘기잖아'가 나와야 한다.", "카페와 원장님은 감성과 공감, 커머스와 브랜드는 텐션.", "한 씬에 메시지 하나. 3~5초마다 컷.", "자막은 말과 동시에, 한 줄 열 자 안쪽.", "'하세요'보다 '하지 마세요'가 더 멈춘다.", "문장은 이어져야 한다. ~해서 ~했는데, 근데 ~하더라고요.", "어미를 섞어라. 요, 죠, 거든요, 습니다.", "반신반의로 시작해서 반전으로 끝내라.", "BGM은 목소리 뒤에서 35~55%.", "훅은 두 버전 찍어라. 본문은 한 번, 오프닝만 두 번.", "'안녕하세요'로 시작하는 순간 넘어간다.", "캡션 첫 줄이 두 번째 훅이다.", "지어낸 숫자는 [확인 필요]로 남겨라. 신뢰가 조회수다.", "비주얼 훅이 가장 세다. 첫 프레임에 보여줄 것을 두어라.", "댓글이 좋아요를 넘으면 퍼널을 열 때다.", "겉 고민 말고 속마음을 건드려라.", "터진 구조는 공용 패턴이다. 그대로 써도 된다.", "촬영은 정면, 눈높이, 손에 뭔가 들고.", "마지막 문장은 질문으로 끝내라. 댓글이 달린다.", "40대 사장님도 바로 읽을 수 있는 말로 써라.", "편집자가 못 알아듣는 지시는 없는 것과 같다.", "잘 팔리는 영상은 설명하지 않고 보여준다.", "레퍼런스 3개면 충분하다. 더 보면 흔들린다."];
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
    syncUser(); if (!arg) loadClients();
    if (arg) { if (sub && /^easy-(all|sum|script|prep|check)$/.test(sub)) { TAB = "easy"; EZSEC = sub.slice(5); } else if (sub && ["easy", "refs", "pro", "shoot"].includes(sub)) TAB = sub; else if (sub === "plan") TAB = "easy"; else if (!CUR || CUR.id !== arg) TAB = "easy";
      let p = null; try { p = await api("/api/plans/" + arg); } catch (e) { if (W.making === arg) { W.making = null; save(); }
        $("#main").innerHTML = `<div class="empty"><b>이 기획안을 찾을 수 없어요</b>만드는 도중에 끊겼거나 지워진 기획안이에요. 차감된 횟수가 있다면 문의에 남겨 주세요.<div class="row" style="justify-content:center;margin-top:12px;gap:8px"><a class="btn p" href="#/plan/new">다시 만들기</a><a class="btn" href="#/plan">기획 홈</a></div></div>`; return; }
      CUR = p; return renderPlan2(p); }
    // 릴스 상세창에서 담아둔 바구니 → 참고 릴스에 자동 반영
    const basket = (typeof PLANREFS === "function" ? PLANREFS() : []).slice(0, 3); W.basketSeen = W.basketSeen || [];
    for (const id of basket) if (!W.basketSeen.includes(id) && !W.refs.includes(id) && W.refs.length < 3) { W.refs.push(id); W.basketSeen.push(id); }
    if (W.refs.length > 1) W.multi = true; if (W.refs.length && !W.refs.includes(W.mainRef)) W.mainRef = W.refs[0];
    save(); renderWizard();
  };
  const STEPS = 3;
  window.wizGo = (n) => { W.step = Math.max(1, Math.min(STEPS, n)); save(); renderWizard(); };
  window.wizCh = (k, v) => { W.extra.ch = W.extra.ch || {}; W.extra.ch[k] = W.extra.ch[k] === v ? "" : v; save(); renderWizard(); };
  window.wizChIn = (k, el) => { W.extra.ch = W.extra.ch || {}; W.extra.ch[k] = el.value; save(); };
  const CHARS = [["차분한 전문가", "원장님·강사 · 단정하게 설명"], ["옆집 언니·형", "친근하게 공감하며"], ["텐션 높은 판매자", "커머스·공구 · 빠르고 신나게"], ["무뚝뚝한 장인", "말수 적고 손이 주인공"], ["솔직한 리뷰어", "팩폭·직설"]];
  const FUNNELS = ["댓글 키워드 → 자료 전송", "프로필 링크", "DM 문의", "예약", "무료라이브·세미나 신청", "구매 링크"];
  window.wizSet = (k, v) => { W[k] = v; save(); renderWizard(); };
  window.wizToggle = (k, v, max) => { const a = W[k]; const i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else { if (max && a.length >= max) return toast(`최대 ${max}개까지`); a.push(v); } save(); renderWizard(); };
  window.wizInput = (k, el) => { W[k] = el.value; save(); };
  window.wizExtra = (k, el) => { W.extra[k] = el.value; save(); };
  window.wizExtraSet = (k, v) => { W.extra[k] = v; save(); renderWizard(); };
  window.wizPref = (k, v) => { W.prefs = W.prefs || {}; W.prefs[k] = W.prefs[k] === v ? "" : v; save(); renderWizard(); };

  const ABOUT_EX = ["수원에서 1:1 필라테스 센터 해요", "동네 카페 사장이에요", "스마트스토어에서 리빙템 위탁판매해요", "뷰티 브랜드 마케터예요", "숏폼 대행사인데 클라이언트가 꽃집이에요"];
  async function renderWizard() {
    if (W.step > STEPS) W.step = STEPS;
    const s = W.step; const pct = (s / STEPS) * 100;
    const head = `<div class="wiz-head"><div class="wiz-top"><button class="btn ghost" onclick="wizGo(${s - 1})" ${s === 1 ? "disabled" : ""}>←</button><div class="wiz-step">STEP ${s} OF ${STEPS}</div><a class="btn ghost" href="#/plan" onclick="wizReset(event)">처음부터</a></div><div class="wiz-bar"><i style="width:${pct}%"></i></div></div>`;
    let body = "", next = "";
    if (s === 1) {
      const sg = W.sugg || {}; const cl = CLIENTS || [];
      const fld = (k, label, ph, hint) => `<div class="f-field"><label>${label}${hint ? ` <small>${hint}</small>` : ""}</label><input id="wf-${k}" class="wiz-input" placeholder="${esc(ph)}" value="${esc(W[k] || "")}" oninput="wizInput('${k}', this)" onkeydown="if(event.key==='Enter')wizQuick()"></div>`;
      const uq = W.uspQ || [];
      body = `<h1>네 가지만 알려주세요.</h1><p class="muted">이 네 줄이 기획의 알맹이예요. 말투·구조·길이는 다음 화면에서 고르는 릴스를 그대로 따라갑니다.</p>${connectBox()}
      ${cl.length ? `<div class="client-bar"><label for="wf-client">저장된 클라이언트 불러오기</label><select id="wf-client" class="wiz-input" onchange="wizClientPick(this.value)"><option value="">새로 적기</option>${cl.map(c => `<option value="${c.id}" ${String(W.clientId || "") === String(c.id) ? "selected" : ""}>${esc(c.name)}${c.updated_at ? " · " + esc(String(c.updated_at).slice(5, 10)) : ""}</option>`).join("")}</select></div>` : ""}
      <div class="s1-grid"><div class="s1-left"><div class="f-grid">
        ${fld("about", "① 나는 어떤 사람인가요?", "예: 수원에서 1:1 필라테스 센터를 운영해요", "")}
        ${fld("product", "② 주 상품·서비스", "예: 1:1 체형교정 필라테스, 첫 체험 3만원", "지금 제일 팔고 싶은 것 하나")}
        <div class="f-field"><label>③ 주 타깃 <small>누가 사나요? 좁을수록 좋아요</small></label><input id="wf-target" class="wiz-input" placeholder="예: 거북목·허리 통증으로 고민하는 30~40대 직장인 여성" value="${esc(W.targetText || "")}" oninput="wizInput('targetText', this)" onkeydown="if(event.key==='Enter')wizQuick()">${(sg.target || []).length ? `<div class="sugg"><span>AI 제안 — 눌러서 넣기</span>${sg.target.map((x, i) => `<button class="pill" onclick="wizSugg('targetText', ${i})">${esc(x)}</button>`).join("")}</div>` : ""}</div>
        <div class="f-field"><label>④ 소구점 <small>손님이 다른 데 말고 나를 고르는 이유 — 기능·성분·방법·숫자로 적을수록 좋아요</small></label><input id="wf-usp" class="wiz-input" placeholder="예: 향으로 덮는 게 아니라 탈취 성분이 땀냄새 자체를 없앰" value="${esc(W.usp || "")}" oninput="wizInput('usp', this)" onkeydown="if(event.key==='Enter')wizQuick()">${(sg.usp || []).length ? `<div class="sugg"><span>AI 제안 — 맞는 것만 눌러서 넣기 (예시는 내 사실로 고쳐 쓰세요)</span>${sg.usp.map((x, i) => `<button class="pill" onclick="wizSugg('usp', ${i})">${esc(x)}</button>`).join("")}</div>` : ""}</div>
      </div>
      <div class="row" style="gap:12px;margin-top:10px;flex-wrap:wrap;align-items:center"><button class="btn" onclick="wizQuick(true)">타깃·소구점을 잘 모르겠어요 — AI 제안 받기</button><label class="save-client"><input type="checkbox" ${W.saveClient === false ? "" : "checked"} onchange="wizSaveClient(this.checked)"> 이 네 줄을 클라이언트로 저장해 두기</label></div>
      </div>${uspPanelHtml()}</div>
      ${W.refs.length ? `<div class="panel soft" style="margin-top:14px">릴스 <b>${W.refs.length}개</b>가 담겨 있어요. 다음 화면에서 바로 그 릴스로 시작합니다.</div>` : ""}`;
      next = (uq.length && !W.uspDone) ? `<button class="btn p big" onclick="wizQuick(false, true)">답하고 참고 릴스 찾기 →</button>` : `<button class="btn p big" onclick="wizQuick()">참고 릴스 찾기 →</button>`;
      if (W.topicMemo) body = `<div class="append-note"><b>담아 둔 주제로 기획해요</b><span>${esc(W.topicMemo)}</span></div>` + body;
    } else if (s === 2) {
      body = await renderRefsStep();
      next = `<button class="btn p big" id="wiz-next4" onclick="wizNext2()">이 릴스로 주제 고르기 →</button>`;
    } else {
      body = renderTopicStep(); const adding = !!(W.appendSid || W.appendPlan);
      next = STATIC ? `<button class="btn p big" disabled title="체험판에서는 생성 불가">기획안 만들기 (서버 연결 필요)</button>`
        : `<button class="btn p big" id="wiz-make" onclick="wizMake()">${adding ? "기획안 하나 더 만들기" : "기획안 만들기"} <small style="font-weight:500">(${W.speed === "precise" ? "정밀 · 2회 차감 · 약 " + fmtDur(ETA.precise) : "1회 차감 · 약 " + fmtDur(ETA.fast)})</small></button>`;
    }
    $("#main").innerHTML = `<div class="wiz ${s === 1 ? "s1" : ""}">${head}<div class="wiz-body">${body}</div><div class="wiz-foot"><button class="btn big" onclick="wizGo(${s - 1})" ${s === 1 ? "disabled" : ""}>이전</button>${next}</div></div>`;
    if (s === 2 && !W.refsCache.length && (W.keyword || W.selSubs.length)) wizSearchRefs();
    if (window.restoreScrollOnce) restoreScrollOnce();
  }
  window.wizSugg = (k, i) => { const arr = ((W.sugg || {})[k === "usp" ? "usp" : "target"]) || []; const v = String(arr[i] || "").replace(/^예:\s*/, ""); if (!v) return; if (k === "usp") { const cur = (W.usp || "").split(/\s*,\s*/).filter(Boolean); if (!cur.includes(v)) cur.push(v); W.usp = cur.join(", "); } else W.targetText = v; save(); renderWizard(); };
  function applyProfile(r) { W.profile = r; W.mode = MODE_NAME[r.mode] ? r.mode : "own"; W.job = r.job || W.about; W.target = []; W.extra.target_free = W.targetText || r.target || ""; const kw = [...new Set((r.keywords || []).map(k => String(k).replace(/^#/, "").trim()).filter(Boolean))]; W.keyword = kw[0] || W.about; W.subs = kw.slice(1); W.selSubs = kw.slice(1, 10); W.kwAll = kw.slice(0, 10); W.kwOn = kw.slice(0, 10); W.kwMore = []; W.refsAi = false; W.refsAiOrder = []; W.extra.product = W.product || r.product || W.about; }
  let CLIENTS = null;
  function loadClients() { if (STATIC || CLIENTS !== null) return; CLIENTS = []; api("/api/clients").then(list => { CLIENTS = Array.isArray(list) ? list : []; if (W.step === 1 && location.hash.indexOf("#/plan/new") === 0 && CLIENTS.length) renderWizard(); }).catch(() => {}); }
  const step1Key = () => [W.about, W.product, W.targetText, W.usp].map(x => (x || "").trim()).join("|");
  function readStep1() { ["about", "product"].forEach(k => { const el = $("#wf-" + k); if (el) W[k] = el.value.trim(); }); const te = $("#wf-target"); if (te) W.targetText = te.value.trim(); const ue = $("#wf-usp"); if (ue) W.usp = ue.value.trim(); }
  window.wizSaveClient = (on) => { W.saveClient = !!on; save(); };
  // ---- 소구점 검사받기(오른쪽 칸): 릴스를 찾기 전에 소구점을 같이 찾는다. 답은 라운드마다 쌓인다(uspAns)
  const uspAllAns = () => { const seen = new Set(); return [...(W.uspAns || []), ...(W.uspQA || [])].filter(x => x && x.a && !seen.has(x.q) && seen.add(x.q)); };
  const uspBase = () => [(W.about || "").trim(), (W.product || "").trim()].join("|");
  function uspPanelHtml() {
    const uq = W.uspQ || []; const qa = W.uspQA || []; const prev = W.uspAns || [];
    const prevHtml = prev.length ? `<div class="usp-prev"><small>지금까지 받은 답 ${prev.length}개 — 기획에 들어가요</small><ul>${prev.map(x => `<li><span>${esc(x.q)}</span><b>${esc(x.a)}</b></li>`).join("")}</ul></div>` : "";
    const refined = (W.uspRefined && W.uspRefined !== (W.usp || "").trim()) ? `<div class="usp-refined"><small>답을 반영해 다듬은 소구점</small><b>${esc(W.uspRefined)}</b><button class="btn small p" onclick="wizUspApply()">④ 소구점에 넣기</button></div>` : "";
    let inner;
    if (W.uspBusy) inner = `<div class="usp-busy"><i></i>소구점을 검사하는 중이에요… (10~20초)</div>${prevHtml}`;
    else if (uq.length && !W.uspDone) inner = `<div class="usp-verdict bad"><b>조금만 더 구체적으로</b><span>${esc(W.uspWhy || "지금 소구점만으로는 기승전결의 '전'에서 무엇을 말할지 정하기 어려워요.")}</span></div>${refined}
        ${uq.map((q, i) => { const a = (qa[i] || {}).a || ""; return `<div class="usp-q-item"><div class="usp-q-q"><em>질문 ${i + 1}</em><span>${esc(q.q)}</span></div>${q.why ? `<div class="usp-q-why">${esc(q.why)}</div>` : ""}<div class="usp-q-opts">${(q.options || []).map((o, j) => `<button class="${a === o ? "on" : ""}" onclick="wizUspPick(${i}, ${j})">${esc(o)}</button>`).join("")}</div><input class="wiz-input" placeholder="보기에 없으면 직접 적어 주세요" value="${(q.options || []).includes(a) ? "" : esc(a)}" oninput="wizUspType(${i}, this)"></div>`; }).join("")}
        <div class="usp-q-foot"><button class="btn p" onclick="wizUspCheck()">답을 반영해서 다시 검사</button><button class="btn" onclick="wizQuick(false, true)">이대로 릴스 찾기</button><button class="btn" onclick="wizQuick(false, true, true)">건너뛰기</button></div>${prevHtml}`;
    else if (W.uspChecked) inner = `<div class="usp-verdict ${W.uspOk ? "ok" : "bad"}"><b>${W.uspOk ? "이 소구점이면 이야기가 서요" : "검사를 마쳤어요"}</b><span>${esc(W.uspWhy || "")}</span></div>${refined}${prevHtml}<div class="usp-q-foot"><button class="btn" onclick="wizUspCheck()">다시 검사받기</button>${prev.length ? `<button class="btn" onclick="wizUspReset()">답 지우고 처음부터</button>` : ""}</div>`;
    else inner = `<p class="usp-intro">릴스를 찾기 전에, 지금 소구점으로 <b>기승전결의 '전(해결)'</b>이 서는지 AI가 봐 드려요. 모자라면 누르기만 하면 되는 질문으로 같이 찾고, 답은 그대로 대본의 알맹이가 돼요.</p>${prevHtml}<button class="btn p big" onclick="wizUspCheck()">소구점 검사받기</button><small class="muted">10~20초 · 횟수 차감 없음</small>`;
    return `<aside class="usp-panel" id="usp-q"><div class="usp-panel-h"><b>소구점 검사받기</b><span>릴스 찾기 전에 미리</span></div>${inner}</aside>`;
  }
  window.wizUspPick = (i, j) => { const q = (W.uspQ || [])[i]; if (!q) return; W.uspQA = W.uspQA || []; const o = (q.options || [])[j]; const cur = (W.uspQA[i] || {}).a; W.uspQA[i] = { q: q.q, a: cur === o ? "" : o }; save();
    const item = document.querySelectorAll(".usp-q-item")[i]; if (item) { item.querySelectorAll(".usp-q-opts button").forEach((b, k) => b.classList.toggle("on", k === j && cur !== o)); const inp = item.querySelector("input"); if (inp) inp.value = ""; } };
  window.wizUspType = (i, el) => { const q = (W.uspQ || [])[i]; if (!q) return; W.uspQA = W.uspQA || []; W.uspQA[i] = { q: q.q, a: el.value }; save(); const item = el.closest(".usp-q-item"); if (item) item.querySelectorAll(".usp-q-opts button").forEach(b => b.classList.remove("on")); };
  window.wizUspReset = () => { W.uspQ = []; W.uspQA = []; W.uspAns = []; W.uspDone = false; W.uspChecked = false; W.uspOk = null; W.uspRefined = ""; W.uspFor = ""; save(); renderWizard(); };
  window.wizUspApply = () => { if (!W.uspRefined) return; readStep1(); W.usp = W.uspRefined; save(); renderWizard(); toast("④ 소구점에 넣었어요 — 사실과 다르면 고쳐 쓰세요"); };
  window.wizUspCheck = async () => { readStep1(); if (STATIC) return toast("체험판에서는 검사할 수 없어요");
    if (!W.about && !W.product) return toast("① 나 · ② 주 상품을 먼저 적어주세요"); if (!W.usp) return toast("④ 소구점을 먼저 적어주세요 — 모르겠으면 'AI 제안 받기'를 눌러요");
    if (W.uspBase && W.uspBase !== uspBase()) { W.uspAns = []; W.uspQA = []; W.uspQ = []; }
    W.uspAns = uspAllAns(); W.uspQA = []; W.uspQ = []; W.uspBusy = true; renderWizard();
    let r = null; try { r = await post("/api/plan/usp_questions", { about: W.about, product: W.product, target: W.targetText, usp: W.usp, answers: W.uspAns }); } catch (e) { r = { error: e.message }; }
    W.uspBusy = false;
    if (!r || r.error) { save(); renderWizard(); return toast("검사를 못 했어요 — 한 번만 더 눌러주세요" + (r && r.error ? " (" + r.error + ")" : "")); }
    W.uspQ = r.questions || []; W.uspQA = W.uspQ.map(q => ({ q: q.q, a: "" })); W.uspOk = !!r.usp_ok; W.uspWhy = r.why || ""; W.uspRefined = r.refined || ""; W.uspFor = step1Key(); W.uspBase = uspBase(); W.uspDone = !W.uspQ.length; W.uspChecked = true; save(); renderWizard();
    toast(W.uspQ.length ? "질문에 답하면 소구점이 또렷해져요 — 보기를 누르기만 하면 돼요" : "소구점 검사를 마쳤어요"); };
  window.wizClientPick = (id) => { if (!id) { W.clientId = null; save(); return renderWizard(); } const c = (CLIENTS || []).find(x => String(x.id) === String(id)); if (!c) return;
    const qa = (c.usp_qa || []).filter(x => x && x.a);
    Object.assign(W, { clientId: c.id, about: c.about || "", product: c.product || "", targetText: c.target || "", usp: c.usp || "", uspAns: qa, uspQA: [], uspQ: [], uspDone: qa.length > 0, uspChecked: false, uspOk: null, uspRefined: "", sugg: null, profile: null, profileFor: "" });
    W.uspFor = qa.length ? step1Key() : ""; W.uspBase = uspBase(); save(); renderWizard(); toast(`'${c.name}' 내용을 불러왔어요`); };
  window.wizQuick = async function (suggestOnly, answered, skipQ) {
    readStep1();
    if (!W.about) return toast("① 나는 어떤 사람인지 한 줄 적어주세요"); if (!W.product) return toast("② 주 상품·서비스를 적어주세요");
    const key = step1Key();
    if (W.uspBase && W.uspBase !== uspBase()) { W.uspQ = []; W.uspQA = []; W.uspAns = []; W.uspDone = false; W.uspChecked = false; W.uspRefined = ""; W.uspFor = ""; W.appendSid = null; W.appendPlan = null; W.madeTopics = []; }      // 나·주 상품이 바뀌면 소구점 질문을 다시(이어 만들기 묶음에서도 빠짐)
    W.uspBase = uspBase();
    const quickBody = (force) => ({ text: W.about, product: W.product, target: W.targetText || "", usp: W.usp || "", force: !!force });
    if (suggestOnly || !W.targetText || !W.usp) {
      showWait("타깃·소구점 후보를 찾는 중", 10, "적어주신 내용으로 AI가 후보를 만들고 있어요");
      let r = null, qerr = ""; try { r = STATIC ? null : await post("/api/plan/quick", quickBody(true)); } catch (e) { qerr = e.message; }
      hideWait();
      if (!r || r.error || !((r.target_suggest || []).length + (r.usp_suggest || []).length)) return toast("AI 제안을 못 가져왔어요" + (qerr ? " — " + qerr : "") + ". 한 번만 더 눌러주세요");
      W.sugg = { target: r.target_suggest || [], usp: r.usp_suggest || [] }; save(); renderWizard();
      setTimeout(() => { const el = document.querySelector(".sugg"); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 60);
      return toast(suggestOnly ? "파란 칸이 AI 제안이에요 — 눌러서 넣고 고쳐 쓰세요" : "③ 주 타깃과 ④ 소구점을 채워주세요 — 아래 AI 제안을 눌러도 돼요");
    }
    if ((W.uspQ || []).length && !W.uspDone && (answered || skipQ)) { if (skipQ) W.uspQA = []; W.uspAns = uspAllAns(); W.uspQ = []; W.uspQA = []; W.uspDone = true; W.uspFor = key; }
    if ((W.uspQ || []).length && !W.uspDone) { const el = document.getElementById("usp-q"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); return toast("아래 소구점 질문에 답하거나 '건너뛰고 진행'을 눌러주세요"); }
    let pr = null;
    if (!W.uspDone) {
      showWait("소구점을 확인하는 중", 16, "이야기의 '전'에서 말할 소구점이 충분히 구체적인지 보고 있어요");
      const [qr, pq] = await Promise.all([STATIC ? null : post("/api/plan/usp_questions", { about: W.about, product: W.product, target: W.targetText, usp: W.usp, answers: W.uspAns || [] }).catch(() => null), STATIC ? null : post("/api/plan/quick", quickBody(false)).catch(() => null)]);
      hideWait(); pr = pq; W.uspFor = key;
      if (qr && (qr.questions || []).length) {
        W.uspQ = qr.questions; W.uspWhy = qr.why || ""; W.uspRefined = qr.refined || ""; W.uspOk = false; W.uspChecked = true; W.uspQA = qr.questions.map(q => ({ q: q.q, a: "" })); W.uspDone = false; W.pendingProfile = pq; save(); renderWizard();
        setTimeout(() => { const el = document.getElementById("usp-q"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 80);
        return toast("소구점을 조금만 더 알려주세요 — 보기를 누르기만 하면 돼요");
      }
      W.uspQ = []; W.uspDone = true; if (qr && !qr.error) { W.uspChecked = true; W.uspOk = !!qr.usp_ok; W.uspWhy = qr.why || ""; W.uspRefined = qr.refined || ""; }
    }
    if (W.profile && W.profileFor === key && (W.kwOn || []).length) { save(); return wizGo(2); }
    showWait("내 일에 맞는 릴스를 찾는 중", 8, "업종·검색어를 정리하고 있어요");
    let r = pr || W.pendingProfile || null;
    if (!r || r.error) { try { r = STATIC ? null : await post("/api/plan/quick", quickBody(false)); } catch (e) { r = null; } }
    if (!r || r.error) r = { mode: "own", job: W.about, keywords: [W.product.split(/\s+/)[0] || W.about], product: W.product };
    applyProfile(r); W.pendingProfile = null; W.profileFor = key; W.refsCache = []; W.topics = [];
    if (W.saveClient !== false && !STATIC) {
      try { const c = await post("/api/clients", { id: W.clientId || null, about: W.about, product: W.product, target: W.targetText, usp: W.usp, usp_qa: uspAllAns() }); if (c && c.id) { W.clientId = c.id; CLIENTS = null; } } catch (e) {}
    }
    hideWait(); save(); wizGo(2);
  };
  window.wizProfileEdit = () => { W.profEdit = !W.profEdit; renderWizard(); };
  window.wizProfileSave = () => { const g = (id) => ($(id) || {}).value || ""; W.mode = g("#pf-mode") || W.mode; W.job = g("#pf-job"); W.extra.target_free = g("#pf-target"); const kw = g("#pf-kw").split(/[,#\s]+/).filter(Boolean); W.keyword = kw[0] || W.keyword; W.subs = kw.slice(1); W.selSubs = kw.slice(1); W.profEdit = false; W.refsCache = []; W.topics = []; save(); renderWizard(); };
  const profileLine = () => `<div class="pf-line"><span class="muted">AI가 파악한 내용</span> <span class="tag">${esc(MODE_NAME[W.mode] || "")}</span> <span class="tag">${esc(W.job || "")}</span>${W.extra.target_free ? ` <span class="tag">${esc(W.extra.target_free)}</span>` : ""} ${[W.keyword, ...W.selSubs].filter(Boolean).map(k => `<span class="pill on tiny">#${esc(k)}</span>`).join(" ")} <a href="#" onclick="event.preventDefault();wizProfileEdit()">${W.profEdit ? "닫기" : "틀렸으면 고치기"}</a></div>
    ${W.profEdit ? `<div class="mf-box" style="margin-top:6px"><div class="mf-row"><small>누구를 위한 기획</small><select id="pf-mode" class="chip">${MODES.map(m => `<option value="${m[0]}" ${W.mode === m[0] ? "selected" : ""}>${esc(m[2])} — ${esc(m[3])}</option>`).join("")}</select></div><div class="mf-row"><small>업종</small><input id="pf-job" class="wiz-input" style="padding:8px 12px;font-size:13px" value="${esc(W.job || "")}"></div><div class="mf-row"><small>보여줄 사람</small><input id="pf-target" class="wiz-input" style="padding:8px 12px;font-size:13px" value="${esc(W.extra.target_free || "")}"></div><div class="mf-row"><small>릴스 검색어 (쉼표로)</small><input id="pf-kw" class="wiz-input" style="padding:8px 12px;font-size:13px" value="${esc([W.keyword, ...W.selSubs].filter(Boolean).join(", "))}"></div><button class="btn small p" style="margin-top:8px" onclick="wizProfileSave()">이대로 다시 찾기</button></div>` : ""}`;
  window.wizReset = (e) => { e.preventDefault(); if (!confirm("처음부터 다시 적을까요? 지금까지 적은 내용이 지워집니다.")) return; Object.assign(W, WIZ_BLANK()); save(); renderWizard(); };

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
    const tab = W.refTab || "kw"; const XL = (W.refsX || {})[tab] || [];
    if (tab !== "kw" && !XL.length && !STATIC && !XLOAD) setTimeout(() => wizRefTabLoad(tab), 30);
    const mainL = tab === "kw" ? W.refsCache.filter(x => !x.fill && !x.cross) : XL, fillL = tab === "kw" ? W.refsCache.filter(x => x.fill) : [];
    const cards = mainL.map(x => refCard(x, sel.includes(x.id))).join("") + (fillL.length ? `<div class="ref-fill-sep"><b>키워드가 들어간 릴스가 ${mainL.length}개뿐이라, 같은 카테고리 인기 릴스를 아래에 붙였어요.</b> 내 상품과 안 맞으면 위에서 키워드를 바꿔 다시 찾아 보세요.</div>` + fillL.map(x => refCard(x, sel.includes(x.id))).join("") : "");
    if (W.mainRef && !sel.includes(W.mainRef)) W.mainRef = sel[0] || null; if (!W.mainRef && sel.length) W.mainRef = sel[0];
    return `<h1>따라 하고 싶은 릴스를 골라주세요. <small class="h1-sub">최대 3개</small></h1>${connectBox()}<p class="muted"><b>처음 고른 릴스가 주 레퍼런스</b>예요 — 대본의 구조·말투·길이는 이 릴스 하나만 그대로 따라가고, 나머지는 훅과 편집만 참고해요(구조를 섞으면 어색해져요). ★를 누르면 주 레퍼런스가 바뀝니다.</p>
    <div class="urlbox"><b>따라 하고 싶은 릴스 링크가 있나요?</b><span>인스타 릴스 주소를 붙여넣으면 그 영상을 뜯어서 바로 씁니다 (20~40초)</span><div class="row"><input id="wiz-url" class="wiz-input" placeholder="https://www.instagram.com/reel/..." value="${esc(W.urls || "")}" oninput="wizInput('urls', this)" onkeydown="if(event.key==='Enter')wizAddUrls()"><button class="btn p" onclick="wizAddUrls()">이 릴스로 하기</button></div><div id="wiz-url-msg" class="muted"></div></div>
    <div class="wiz-sub" style="margin-top:18px">또는 아래에서 고르세요</div>
    <nav class="reftabs">${[["kw", "내 업종 · 키워드", "내 키워드가 들어간 터진 릴스"], ["top", "업종 상관없이 터진 구조", "조회수 30만↑ · 구조만 가져와 내 업종에 대입"], ["hot", "요즘 뜨는 릴스", "최근 30일 · 10만↑"]].map(([k, l, d]) => `<button class="${tab === k ? "on" : ""}" onclick="wizRefTab('${k}')"><b>${l}</b><span>${d}</span></button>`).join("")}</nav>
    ${tab === "kw" ? kwBoxHtml() : `<div class="ref-fill-sep" style="margin:8px 0"><b>업종이 달라도 괜찮아요.</b> 이 릴스들은 구조(여는 방식·전개 순서·끝내는 법)가 검증된 영상이에요. 고르면 그 구조 그대로, 소재만 내 상품·소구점으로 바꿔서 기획합니다.</div>`}
    <div class="row" style="gap:8px;flex-wrap:wrap;margin:8px 0">${W.refsAi && (W.refsAiOrder || []).length ? `<button class="btn" onclick="wizRefsAiSort()">AI 추천순으로 다시 정렬</button>` : ""}</div>
    ${refSelHtml()}
    <div id="wiz-refs-note" class="muted" style="font-size:13px;margin:2px 0 8px">${W.refsCache.length ? (W.refsAi ? "카드의 파란 글은 AI가 내 상품·타깃에 맞춰 고른 이유예요 · 보던 목록 순서는 그대로 둡니다" : "AI가 내 상품·타깃에 맞는지 보는 중이에요(30초 안팎) · 목록 순서는 바뀌지 않아요") : ""}</div>
    <div class="refgrid" id="wiz-refs">${cards || `<div class="muted" style="padding:30px;text-align:center" id="wiz-refs-msg">${tab === "kw" ? "저장소에서 찾는 중… (1~2초)" : "터진 릴스를 불러오는 중…"}</div>`}</div>`;
  }
  function refSelHtml() { const sel = W.refs || [];
    return `<div class="wiz-sel">${sel.length ? `<b>고른 릴스 ${sel.length}/3</b>` + sel.map(id => `<span class="selchip ${W.mainRef === id ? "is-main" : ""}"><button onclick="wizMain(${id})" title="주 레퍼런스로 지정">${W.mainRef === id ? "★ 주 레퍼런스" : "☆ 주로 바꾸기"}</button><i>@${esc((refFind(id) || {}).account || id)}</i><button onclick="wizPick(${id})" aria-label="빼기">✕</button></span>`).join("") : "<b>아직 고른 릴스가 없어요</b><span class=\"muted\">아래에서 눌러 고르세요</span>"}</div>`; }
  function refreshRefs(ids) { ids.forEach(id => { const el = document.querySelector(`.refcard[data-id="${id}"]`); const x = refFind(id); if (el && x) el.outerHTML = refCard(x, W.refs.includes(id)); }); const sel = document.querySelector(".wiz-sel"); if (sel) sel.outerHTML = refSelHtml(); }
  let XLOAD = false;
  window.wizRefTab = (k) => { W.refTab = k; save(); renderWizard(); };
  window.wizRefTabLoad = async (k) => { if (XLOAD) return; XLOAD = true; try { const r = await api("/api/plan/refs?cross=1&limit=36" + (k === "hot" ? "&days=30" : "")); W.refsX = W.refsX || {}; W.refsX[k] = (r.items || []).slice(0, 36); if (!W.refsX[k].length) toast("보여줄 릴스가 아직 없어요"); } catch (e) { toast("불러오지 못했어요: " + e.message); } finally { XLOAD = false; if (W.step === 2) renderWizard(); } };
  const refFind = (id) => (W.refsCache || []).find(x => x.id === id) || [...((W.refsX || {}).top || []), ...((W.refsX || {}).hot || [])].find(x => x.id === id);
  window.wizNext2 = () => (W.refs || []).length ? wizAnalyzeThenTopics() : toast("따라 하고 싶은 릴스를 골라주세요");
  function refCard(x, on) {
    return `<div class="refcard ${on ? "on" : ""}" data-id="${x.id}" onclick="wizPick(${x.id})">
      <div class="rc-thumb">${x.thumbnail ? `<img src="${esc(x.thumbnail)}" loading="lazy" onerror="imgRetry(this)">` : ""}${x.label ? `<span class="rc-label">${esc(x.label)}</span>` : x.fill ? `<span class="rc-label soft">같은 카테고리</span>` : ""}<span class="rc-check">${on ? "✓" : ""}</span>${on ? `<span class="rc-on">${W.mainRef === x.id ? "★ 주 레퍼런스" : "선택됨"}</span>` : ""}</div>
      <div class="rc-body"><div class="rc-acc">@${esc(x.account || "")} ${x.frames ? '<span class="tag">분석됨</span>' : ""}</div><div class="rc-desc">${esc(x.description || (x.caption || "").slice(0, 60))}</div>${x.why ? `<div class="rc-why">${esc(x.why)}</div>` : ""}
      <div class="rc-meta">▶ ${fmt(x.views)} · ❤ ${fmt(x.likes)} · ${esc((x.posted_at || "").slice(0, 10))}</div>
      <div class="rc-actions"><a class="btn small" href="${esc(x.url || "https://www.instagram.com/reel/")}" target="_blank" onclick="event.stopPropagation()">원본 ↗</a><button class="btn small" onclick="event.stopPropagation();openReel(${x.id})">자세히</button></div></div></div>`;
  }

  // ---- 2단계 키워드(해시태그): 켜 둔 단어가 캡션·해시태그·대본에 들어간 릴스를 찾는다
  const kwList = () => [...new Set([...(W.kwOn || []), ...(W.kwAll || []), ...(W.kwMore || [])].map(k => String(k).replace(/^#/, "").trim()).filter(Boolean))];
  function kwBoxHtml() {
    if (!W.kwOn) { W.kwOn = [W.keyword, ...(W.selSubs || [])].filter(Boolean); W.kwAll = [W.keyword, ...(W.subs || [])].filter(Boolean); }
    const all = kwList();
    return `<section class="kw-box"><div class="kw-head"><b>이 키워드로 릴스를 찾아요</b><em>기본 ${(W.kwAll || []).length}개 · 추가 ${(W.kwMore || []).length}/15</em><span>내 상품·타깃에 맞는 단어만 켜 두세요. 캡션·해시태그·대사에 이 단어가 들어간 릴스를 찾습니다.</span></div>
      <div class="kw-chips">${all.map((k, i) => `<button class="kw ${W.kwOn.includes(k) ? "on" : ""}" onclick="wizKw(${i})">${W.kwOn.includes(k) ? "✓ " : ""}#${esc(k)}</button>`).join("")}${STATIC || (W.kwMore || []).length >= 15 ? "" : W.kwMoreLoading ? '<span class="muted">추천 해시태그 찾는 중… (10초)</span>' : `<button class="kw more" onclick="wizKwMore()">+ 추천 해시태그 더 보기 (15개까지)</button>`}</div>
      <div class="kw-add"><input id="kw-in" class="wiz-input" placeholder="직접 추가 (예: 땀냄새, 데오드란트) — 쉼표로 여러 개" onkeydown="if(event.key==='Enter')wizKwAdd()"><button class="btn" onclick="wizKwAdd()">추가</button><button class="btn p" onclick="wizKwSearch()">이 키워드로 다시 찾기</button></div></section>`;
  }
  window.wizKw = (i) => { const k = kwList()[i]; if (!k) return; const a = W.kwOn = W.kwOn || []; const j = a.indexOf(k); if (j >= 0) a.splice(j, 1); else a.push(k); save(); renderWizard(); };
  window.wizKwAdd = () => { const el = $("#kw-in"); const vs = String((el || {}).value || "").split(/[,#\s]+/).map(x => x.trim()).filter(Boolean); if (!vs.length) return toast("추가할 키워드를 적어주세요"); W.kwOn = W.kwOn || []; W.kwAll = W.kwAll || []; vs.forEach(v => { if (!W.kwOn.includes(v)) W.kwOn.push(v); if (!W.kwAll.includes(v)) W.kwAll.push(v); }); save(); renderWizard(); toast(`${vs.length}개 추가했어요 — '이 키워드로 다시 찾기'를 누르세요`); };
  window.wizKwMore = async () => { if (W.kwMoreLoading) return; W.kwMoreLoading = true; renderWizard(); const tgt = [...W.target, W.extra.target_free].filter(Boolean).join(", ");
    try { const r = await api("/api/plan/subkeywords?q=" + encodeURIComponent((W.kwOn || [])[0] || W.keyword || W.product || "") + "&job=" + encodeURIComponent(W.job || "") + "&target=" + encodeURIComponent(tgt)); const have = new Set(kwList()); W.kwMore = [...(W.kwMore || []), ...((r.keywords || []).map(k => String(k).replace(/^#/, "")).filter(k => k && !have.has(k)))].slice(0, 15); if (!(r.keywords || []).length) toast("더 찾은 해시태그가 없어요"); }
    catch (e) { toast("추천 해시태그를 못 가져왔어요: " + e.message); } finally { W.kwMoreLoading = false; save(); renderWizard(); } };
  window.wizKwSearch = () => { if (!(W.kwOn || []).length) return toast("키워드를 하나 이상 켜 주세요"); if ((W.refFetch || 0) >= 3 && !document.body.classList.contains("admin")) return toast("릴스 다시 찾기는 기획안 한 편에 3번까지예요"); W.refFetch = (W.refFetch || 0) + 1; W.keyword = W.kwOn[0]; W.selSubs = W.kwOn.slice(1); W.refsCache = []; W.refsAi = false; W.refsAiOrder = []; save(); renderWizard(); wizSearchRefs(); };
  window.wizRefsAiSort = () => { const rank = (x) => x.aiRank || 999; W.refsCache = [...W.refsCache].sort((a, b) => (a.fill ? 1 : 0) - (b.fill ? 1 : 0) || rank(a) - rank(b)); save(); renderWizard(); toast("AI 추천순으로 정렬했어요"); };
  window.wizPick = (id) => { const before = [...(W.refs || [])]; const i = W.refs.indexOf(id); W.multi = true;
    if (!(W.refsCache || []).find(x => x.id === id)) { const x = refFind(id); if (x) W.refsCache = [...W.refsCache, { ...x, cross: true }]; }     // 다른 탭에서 고른 릴스도 다음 단계에서 찾을 수 있게
    if (i >= 0) W.refs.splice(i, 1); else { if (W.refs.length >= 3) return toast("릴스는 3개까지 고를 수 있어요 — 하나를 빼고 골라주세요"); W.refs.push(id); }
    const oldMain = W.mainRef; if (!W.refs.includes(W.mainRef)) W.mainRef = W.refs[0] || null;
    if (oldMain !== W.mainRef || !before.length) { W.topics = []; W.extra.length = ""; W.appendSid = null; W.appendPlan = null; W.madeTopics = []; }     // 주 레퍼런스가 바뀌면 주제를 다시 뽑는다
    W.setTopics = []; save(); if (document.querySelector("#wiz-refs")) refreshRefs([...new Set([...before, id, ...W.refs])]); else renderWizard(); };
  window.wizMain = (id) => { if (W.mainRef === id) return; W.mainRef = id; W.topics = []; W.extra.length = ""; W.appendSid = null; W.appendPlan = null; W.madeTopics = []; save(); if (document.querySelector("#wiz-refs")) refreshRefs([...(W.refs || [])]); else renderWizard(); toast("이 릴스의 구조에 대본을 맞춥니다"); };
  window.wizCrossRefs = async function () {
    const cnt = {}; W.refsCache.forEach(x => { if (x.industry) cnt[x.industry] = (cnt[x.industry] || 0) + 1; }); const mine = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 1).map(x => x[0]).join(",");
    toast("다른 업종에서 터진 구조를 찾는 중…");
    try { const r = await api("/api/plan/refs?cross=1&limit=18&exclude=" + encodeURIComponent(mine)); const have = new Set(W.refsCache.map(x => x.id)); const add = (r.items || []).filter(x => !have.has(x.id)); W.refsCache = [...add, ...W.refsCache]; save(); renderWizard(); toast(add.length ? `다른 업종 릴스 ${add.length}개를 위에 올렸어요` : "새로 보여줄 릴스가 없어요"); }
    catch (e) { toast("실패: " + e.message); }
  };
  let REFS_SEQ = 0;
  window.wizSearchRefs = async function () {
    const seq = ++REFS_SEQ; const tgt = [...W.target, W.extra.target_free].filter(Boolean).join(", ");
    const on = (W.kwOn || []).length ? W.kwOn : [W.keyword, ...W.selSubs].filter(Boolean); W.keyword = on[0] || W.keyword || ""; W.selSubs = on.slice(1);
    const qsBase = "q=" + encodeURIComponent(W.keyword) + "&tags=" + encodeURIComponent(W.selSubs.join(",")) + "&job=" + encodeURIComponent(W.job || "") + "&target=" + encodeURIComponent(tgt) + "&about=" + encodeURIComponent(W.about || "") + "&product=" + encodeURIComponent(W.product || "") + "&usp=" + encodeURIComponent(W.usp || "") + "&limit=24";
    const keepSelected = async (items) => { for (const id of W.refs) if (!items.find(x => x.id === id)) { try { const full = await api("/api/items/" + id); items.unshift({ ...full, frames: !!full.frames }); } catch (e) {} } return items; };
    // 1단계: 저장소에서 바로 (1초)
    try {
      const r = await api("/api/plan/refs?fast=1&" + qsBase); if (seq !== REFS_SEQ) return;
      W.refsCache = await keepSelected(r.items || []); W.refsSource = "db"; W.refsAi = false; W.refsAiOrder = []; save(); renderWizard();
    } catch (e) {}
    if (STATIC) return;
    // 2단계: AI가 내 상품·타깃에 맞는지 보고 이유를 붙인다 — 보던 목록은 그대로 두고(순서 유지) 이유만 붙이고, 새로 찾은 것은 아래에
    try {
      const r = await api("/api/plan/refs?" + qsBase); if (seq !== REFS_SEQ) return;
      if ((r.items || []).length) {
        const byId = new Map(W.refsCache.map(x => [x.id, x])); const order = []; const add = [];
        r.items.forEach((x, i) => { const c = byId.get(x.id); if (c) { if (x.why) c.why = x.why; if (x.label && !c.label) c.label = x.label; c.aiRank = i + 1; } else add.push({ ...x, aiRank: i + 1 }); order.push(x.id); });
        const firstFill = W.refsCache.findIndex(x => x.fill); const addMain = add.filter(x => !x.fill), addFill = add.filter(x => x.fill);
        W.refsCache = firstFill >= 0 ? [...W.refsCache.slice(0, firstFill), ...addMain, ...W.refsCache.slice(firstFill), ...addFill] : [...W.refsCache, ...addMain, ...addFill];
        W.refsAiOrder = order; W.refsAi = true; W.refsSource = r.source || "ai"; save(); renderWizard();
      } else { W.refsAi = true; save(); const n = $("#wiz-refs-note"); if (n) n.textContent = "AI가 더 맞는 릴스를 못 찾았어요 — 키워드를 바꿔 보세요"; }
    } catch (e) { const n = $("#wiz-refs-note"); if (n) n.textContent = "AI 확인 실패: " + e.message; }
  };
  window.wizLiveSearch = async function () {
    toast("인스타에서 새로 찾는 중… (30초)");
    try { await post("/api/search/live", { q: W.keyword, pages: 4, top_accounts: 4 }); } catch (e) { return toast("실패: " + e.message); }
    wizSearchRefs();
  };
  window.wizAddUrls = async function () {
    const urls = (W.urls || "").split(/\s+/).filter(u => /instagram\.com/.test(u)).slice(0, Math.max(1, 3 - W.refs.length)); if (W.refs.length >= 3) return toast("릴스는 3개까지예요 — 고른 릴스 하나를 빼고 넣어주세요"); W.multi = true;
    if (!urls.length) return toast("인스타 릴스 링크를 붙여넣어 주세요");
    const m = $("#wiz-url-msg");
    for (let i = 0; i < urls.length; i++) {
      m.textContent = `분석 중 ${i + 1}/${urls.length} — 영상 받고, 컷·자막·대사·효과음 뽑는 중 (20~40초)`;
      try { const r = await post("/api/analyze", { url: urls[i] }); if (r.error) throw new Error(r.error); if (r.id) { if (!W.multi) W.refs = [r.id]; else if (!W.refs.includes(r.id)) W.refs.push(r.id); W.mainRef = W.multi ? (W.mainRef || r.id) : r.id; W.topics = []; W.setTopics = []; W.extra.length = ""; } const full = await api("/api/items/" + r.id); W.refsCache.unshift({ ...full, frames: true, label: "직접 추가" }); }
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
    hideWait(); save(); wizGo(3);
  };
  let TOPICS_LOADING = false;
  function renderTopicStep() {
    const t = W.topics || [];
    if (!t.length && !TOPICS_LOADING && W.refs.length && !STATIC) setTimeout(() => wizTopics(), 50);
    const LEN = ["15", "30", "45", "60", "90"]; const mr = W.refsCache.find(x => x.id === W.mainRef) || {};
    if (!W.extra.length) { const d = Number(mr.duration || 0); const near = d ? LEN.reduce((a, b) => Math.abs(Number(b) - d) < Math.abs(Number(a) - d) ? b : a) : "30"; W.extra.length = Number(near) < 30 ? "30" : near; }   // 기본은 30초 이상(15초는 너무 짧다는 피드백)
    W.setN = "1"; W.setTopics = []; const N = 1; const isSet = false; const ch = W.extra.ch || {};          // 한 번에 한 편씩(9/17 준희 님) — 이어서 만들면 같은 세트로 묶인다
    const made = W.madeTopics || []; const adding = !!(W.appendSid || W.appendPlan);
    if (!ETA_LOADED && !STATIC) { ETA_LOADED = true; api("/api/plan/eta").then(e => { if (e && e.fast) { ETA = e; if (W.step === 3 && location.hash.indexOf("#/plan/new") === 0) renderWizard(); } }).catch(() => {}); }
    const moreOpen = W.devOpen === false ? "" : "open";          // '그 밖의 디벨롭 설정'은 열어 둔다(닫으면 기억)
    if (W.topicMemo && !W.topic) { W.topic = W.topicMemo; W.topicMemo = ""; save(); }
    const tf = (k, label, ph, id) => `<label class="tell-f"><small>${label}</small><input ${id ? `id="${id}"` : ""} class="wiz-input" placeholder="${esc(ph)}" value="${esc(k === "direction" ? (W.direction || "") : (W.extra[k] || ""))}" oninput="${k === "direction" ? "wizInput('direction', this)" : `wizExtra('${k}', this)`}"></label>`;
    return `<h1>어떤 주제로 찍을까요?</h1>${connectBox()}<p class="muted">@${esc(mr.account || "고른 릴스")}의 구조에 그대로 끼워 넣을 수 있는 주제만, 준희즘 훅 템플릿으로 뽑았어요. 고르기 어렵다면 <b>알아서 골라줘</b>를 누르세요.</p>
    ${adding ? `<div class="append-note"><b>${made.length + 1}편째 기획안을 추가해요</b><span>앞에서 만든 편과 같은 릴스 구조로, 내용이 겹치지 않게 만들어요.${made.length ? " 이미 만든 주제 · " + esc(made.join(" / ")) : ""}</span><a href="#" onclick="event.preventDefault();wizFresh()">새 기획으로 시작</a></div>` : ""}
    <div class="setn-row">${t.length ? `<button class="btn p" onclick="wizAutoPick()">알아서 골라줘</button>` : ""}<span class="muted">한 번에 한 편씩 만들어요. 만든 뒤 <b>'하나 더 만들기'</b>로 같은 구조의 다음 편을 이어서 만들 수 있어요.</span></div>
    <section class="tell-box char-box"><div class="tell-head"><b>누가 말하나요?</b><span>출연자 캐릭터에 맞춰 말투를 잡아요. 안 고르면 고른 릴스의 말투를 그대로 따라가요.</span></div>
      <div class="char-grid">${CHARS.map(([n, d]) => `<button class="${ch.preset === n ? "on" : ""}" onclick="wizCh('preset','${n}')"><b>${n}</b><span>${d}</span></button>`).join("")}</div>
      <div class="char-speech">${["존댓말", "반말"].map(v => `<button class="${ch.speech === v ? "on" : ""}" onclick="wizCh('speech','${v}')">${v}</button>`).join("")}</div></section>
    <section class="tell-box"><div class="tell-head"><b>내 이야기를 조금 더 알려주세요</b><span>적을수록 주제와 대본이 내 것이 돼요. 비워 둬도 만들 수 있어요.</span></div>
      <div class="tell-grid">${tf("must", "이번 영상에서 꼭 말하고 싶은 것", "예: 향으로 덮는 게 아니라 탈취 성분이 땀냄새 자체를 없앤다")}${tf("scene", "내가 실제로 겪은 일 · 손님 반응 · 숫자", "예: 지하철에서 옆 사람이 자리를 옮긴 적이 있다 / 재구매율 40%")}${tf("offer", "가격 · 혜택 · 이벤트", "예: 첫 구매 20% 할인, 이번 주까지 1+1")}${tf("direction", "원하는 방향 · 빼고 싶은 것", "예: 실패담 위주로 / 가격 얘기는 빼고", "wiz-dir")}</div>
      <div class="tell-foot"><button class="btn p" onclick="wizTopics()">이 내용으로 주제 다시 뽑기</button><span class="muted">주제만 새로 뽑아요 (20초 안팎)</span></div></section>
    ${isSet ? `<div class="set-picked"><b>고른 주제 ${W.setTopics.length}/${N}</b>${W.setTopics.map((x, i) => `<span class="pill on tiny">${i + 1}. ${esc(x)} <span onclick="wizTopicDrop(${i})">✕</span></span>`).join("")}${W.setTopics.length ? "" : '<span class="muted" style="font-size:12px">아래에서 눌러 담으세요</span>'}</div>` : ""}
    <div class="topics">${t.map((x, i) => made.includes(x.title) ? `<div class="topic made"><b>${esc(x.title)}</b><div class="topic-why">이미 만든 주제예요</div></div>` : `<div class="topic ${W.topic === x.title ? "on" : ""}" onclick="wizTopicPick(${i})"><button class="topic-save" onclick="event.stopPropagation();boxSaveTopic(${i})" title="내 저장소에 담아 두고 나중에 기획해요">담기</button><b>${esc(x.title)}</b>${x.why ? `<div class="topic-why">${esc(x.why)}</div>` : ""}<div class="topic-tags">${x.hook_type ? `<span class="tag hk" title="${esc(x.hook_template || "")}">훅 · ${esc(x.hook_type)}</span>` : ""}${x.source && /터진|@/.test(x.source) ? `<span class="tag ok">${esc(x.source)}</span>` : ""}${x.angle ? `<span class="tag">${esc(x.angle)}</span>` : ""}</div></div>`).join("")}</div>
    <span id="wiz-topic-msg" class="muted" style="display:block;margin:4px 0 8px">${!t.length && !STATIC ? "릴스 구조와 훅 템플릿으로 주제를 뽑는 중… (20~30초)" : STATIC ? "체험판에서는 주제 추천이 안 돼요. 아래에 주제를 직접 적어주세요." : ""}</span>
    <div class="topic-own">${t.length ? `<button class="btn small" onclick="wizTopics(true)">다른 주제 8개 더</button>` : ""}<label><small>주제 직접 적기${isSet ? " (Enter로 세트에 추가)" : ""}</small>${isSet ? `<input id="wiz-topic-add" class="wiz-input" placeholder="예: 3개월 하고 그만두는 회원 이야기" onkeydown="if(event.key==='Enter'){wizTopicAdd(this.value);this.value=''}">` : `<input id="wiz-topic-own" class="wiz-input" placeholder="예: 조회수 800 나오던 카페 릴스, 첫 문장 바꿨더니 11만" value="${t.find(x => x.title === W.topic) ? "" : esc(W.topic)}" oninput="wizTopicOwn(this)">`}</label></div>
    <details class="wiz-more tune" ${moreOpen} ontoggle="wizDev(this.open)"><summary><b>그 밖의 디벨롭 설정</b><span>영상 길이 · 영상 끝에서 보낼 곳 — 비워두면 고른 릴스를 그대로 따릅니다</span><i>열기</i></summary>
      <div class="mf-row"><small>영상 길이 (기본: 30초, 고른 릴스가 더 길면 그 길이)</small><div class="pills small">${LEN.map(l => pill(l + "초", String(W.extra.length) === l, `wizExtraSet('length','${l}')`)).join("")}</div></div>
      <div class="mf-row"><small>영상 끝에서 보낼 곳 (기본: 댓글 남기면 자료 전송)</small><div class="pills small">${FUNNELS.map(v => pill(v, W.extra.funnel === v, `wizExtraSet('funnel','${esc(v)}')`)).join("")}</div></div>
      ${isSet ? `<div class="mf-row"><small>세트 공통 댓글 키워드</small><input class="wiz-input" style="padding:8px 12px;font-size:13px;max-width:240px" placeholder="예: 교정" value="${esc(W.extra.set_cta_keyword || "")}" oninput="wizExtra('set_cta_keyword', this)"></div>` : ""}
    </details>
    <div class="speed-row"><b>만드는 방식</b><div class="speed-opts"><button class="${W.speed !== "precise" ? "on" : ""}" onclick="wizSet('speed','fast')"><b>빠름 <em>1회 차감</em></b><span>약 ${fmtDur(ETA.fast)} · 기본</span></button><button class="${W.speed === "precise" ? "on" : ""}" onclick="wizSet('speed','precise')"><b>정밀 <em>2회 차감</em></b><span>약 ${fmtDur(ETA.precise)} · 장면·대사 디테일이 더 촘촘해요</span></button></div></div>
    <div class="wiz-summary"><b>정리</b> ${esc(W.about || W.job)} · 따라 할 릴스 @${esc(mr.account || "-")}${mr.views ? " ▶ " + fmt(mr.views) : ""} · ${esc(W.extra.length || 30)}초 · ${W.speed === "precise" ? "정밀" : "빠름"}${adding ? ` · ${made.length + 1}편째` : ""}</div>`;
  }
  let ETA = { fast: 90, precise: 160 }, ETA_LOADED = false;
  window.wizDev = (open) => { if ((W.devOpen !== false) === open) return; W.devOpen = open; save(); };
  window.wizTopicOwn = (el) => { W.topic = el.value; save(); document.querySelectorAll(".topics .topic.on").forEach(x => x.classList.remove("on")); };
  window.wizMore = (open) => { if (W.moreOpen === open) return; W.moreOpen = open; save(); };
  window.wizMulti = () => { W.multi = !W.multi; if (!W.multi && W.refs.length > 1) { W.refs = [W.mainRef || W.refs[0]]; } save(); renderWizard(); };
  window.wizAutoPick = async () => { const avail = () => (W.topics || []).filter(x => !(W.madeTopics || []).includes(x.title)); let t = avail(); if (!(W.topics || []).length) return toast("주제를 뽑는 중이에요");
    W.autoOff = (W.autoOff == null) ? 0 : W.autoOff + 1;
    if (W.autoOff >= t.length) { if ((W.topics || []).length < 24 && !STATIC) { toast("새 주제를 더 뽑아서 골라드릴게요"); await wizTopics(true); t = avail(); } if (W.autoOff >= t.length) W.autoOff = 0; }
    if (!t.length) return toast("고를 주제가 없어요 — '다른 주제 8개 더'를 눌러주세요");
    W.topic = t[W.autoOff].title; save(); renderWizard(); toast("주제를 골랐어요 — 한 번 더 누르면 다른 주제가 나와요"); };
  const brief = () => ({ about: W.about || "", usp: W.usp || "", usp_qa: uspAllAns(), client_id: W.clientId || null, main_ref: Math.max(1, W.refs.indexOf(W.mainRef) + 1), character: W.extra.ch || {}, funnel: W.extra.funnel || "", product: W.product || W.extra.product || ((W.extra.mf || {}).product) || "", set_cta_keyword: W.extra.set_cta_keyword || "", mode: W.mode || "own", mode_fields: Object.fromEntries(Object.entries(W.extra.mf || {}).filter(([k, v]) => v)), edit_prefs: Object.fromEntries(Object.entries(W.prefs || {}).filter(([k, v]) => v && v !== "레퍼런스대로" && v !== "auto")), job: W.job, target: [...W.target, W.extra.target_free].filter(Boolean).join(", "), keyword: [W.keyword, ...W.selSubs].filter(Boolean).join(", "), topic: W.topic, length: W.extra.length || 30, tone: W.extra.tone, scene: W.extra.scene, must: W.extra.must, offer: W.extra.offer, numbers: W.extra.numbers, cta: W.extra.cta, shooting: W.extra.shooting });
  window.wizSetN = (v) => { W.setN = v; if (Number(v) <= 1) W.setTopics = []; else W.setTopics = (W.setTopics || []).slice(0, Number(v)); save(); renderWizard(); };
  window.wizTopicPick = (i) => { const x = (W.topics || [])[i]; if (!x || (W.madeTopics || []).includes(x.title)) return; W.topic = (W.topic === x.title) ? "" : x.title; save();      // 화면을 통째로 다시 그리지 않고 제자리에서만 바꾼다(눌림이 씹히지 않게)
    const cards = document.querySelectorAll(".topics .topic"); if (!cards.length) return renderWizard(); cards.forEach((el, k) => el.classList.toggle("on", !!W.topic && k === i)); const inp = document.getElementById("wiz-topic-own"); if (inp) inp.value = ""; };
  window.wizTopicAdd = (v) => { v = (v || "").trim(); if (!v) return; const a = W.setTopics = W.setTopics || []; if (a.length >= Number(W.setN || 3)) return toast(`세트는 ${W.setN}편까지예요`); if (!a.includes(v)) a.push(v); save(); renderWizard(); };
  window.wizTopicDrop = (i) => { (W.setTopics || []).splice(i, 1); save(); renderWizard(); };
  window.wizMakeSet = async function () {
    const topics = [W.topic || ""];                                          // 한 번에 한 편(주제를 비우면 AI가 정해요)
    if (!W.refs.length) return toast("참고 릴스를 골라주세요");
    if (W.topic && (W.madeTopics || []).includes(W.topic)) return toast("이미 만든 주제예요 — 다른 주제를 골라주세요");
    const running = makingList().filter(m => !m.done && Date.now() - (m.t0 || 0) < 12 * 60000);          // 12분 넘은 기록은 끊긴 것으로 본다
    if (running.length >= 3) return toast("지금 3편을 만들고 있어요 — 하나가 끝나면 다시 눌러주세요");
    const b = $("#wiz-make"); if (b) b.disabled = true;
    for (const id of W.refs) { const c = W.refsCache.find(x => x.id === id); if (c && c.frames) continue;
      try { const it = await api("/api/items/" + id); if (it.frames) continue; showWait("참고 릴스 뜯는 중", 35, `@${it.account} 영상을 받아 컷·자막·대사를 뽑는 중`); await post("/api/analyze", { url: it.url }); hideWait(); } catch (e) { hideWait(); toast("분석 건너뜀: " + e.message); } }
    try { const r = await post("/api/plan/set", { ids: W.refs, brief: brief(), topics, mode: W.speed === "precise" ? "precise" : "fast", append_to: W.appendSid || undefined, append_plan: (!W.appendSid && W.appendPlan) || undefined }); if (r.error) throw new Error(r.error);
      makingAdd({ sid: r.id, n: 1, t0: Date.now(), title: W.topic || (W.product || W.about || "릴스 기획안") });
      W.topicFetch = 0; W.refFetch = 0;
      if (W.boxUsing) { post("/api/box/" + W.boxUsing + "/delete", {}).catch(() => {}); W.boxUsing = null; }
      W.madeTopics = [...(W.madeTopics || []), W.topic].filter(Boolean); W.appendSid = r.id; W.appendPlan = null; W.topic = ""; W.setTopics = []; W.autoOff = null; W.extra.must = ""; save(); delete SETC[r.id]; location.hash = "#/plan/set/" + r.id; }
    catch (e) { toast("실패: " + e.message); if (b) b.disabled = false; }
  };
  // 같은 구조로 하나 더: 만든 기획안의 네 줄·릴스·설정을 그대로 불러와 3단계(주제 고르기)로
  window.planMore = async (pid, pickK) => { let p = null; try { p = (CUR && CUR.id === pid && CUR.refs) ? CUR : await api("/api/plans/" + pid); } catch (e) { return toast("기획안을 불러오지 못했어요: " + e.message); }
    const b = p.brief || {}; const refs = p.refs || []; const ids = refs.map(r => r.id).filter(Boolean); if (!ids.length) return toast("이 기획안에는 참고 릴스 정보가 없어서 이어 만들 수 없어요");
    let st = p.set_id ? SETC[p.set_id] : null; if (p.set_id && !st) { try { st = await api("/api/plansets/" + p.set_id); if (st && st.error) st = null; } catch (e) { st = null; } }
    const made = st ? (st.videos || []).filter(v => v.status !== "deleted").map(v => plainT(v.title || v.topic)).filter(Boolean) : [plainT((p.plan || {}).title || b.topic || "")].filter(Boolean);
    const nt = ((((p.plan || {}).pro || {}).next_topics) || []).map(x => plainT(x)).filter(x => x && !made.includes(x));
    const pickT = (pickK != null && nt.length) ? plainT((((p.plan || {}).pro || {}).next_topics || [])[pickK] || "") : "";
    wizLoad(b, refs, { topic: (pickT && !made.includes(pickT)) ? pickT : "", appendSid: p.set_id || null, appendPlan: p.set_id ? null : p.id, madeTopics: made, topics: nt.map(t => ({ title: t, why: "앞 편과 같은 구조로 이어 찍기 좋은 주제예요", source: "이어 찍기 추천" })), speed: p.mode === "precise" ? "precise" : "fast" });
    if (location.hash !== "#/plan/new") location.hash = "#/plan/new"; else renderWizard(); };
  // 기획안·저장해 둔 주제의 네 줄·릴스·설정을 마법사에 그대로 불러온다(3단계에서 시작)
  function wizLoad(b, refs, opt) { b = b || {}; refs = refs || []; const ids = refs.map(r => r.id).filter(Boolean); const kws = String(b.keyword || "").split(/\s*,\s*/).filter(Boolean); const qa = (b.usp_qa || []).filter(x => x && x.a);
    Object.assign(W, WIZ_BLANK(), { step: 3, mode: b.mode || "own", job: b.job || "", about: b.about || "", product: b.product || "", targetText: b.target || "", usp: b.usp || "", uspAns: qa, uspQA: [], uspQ: [], uspDone: true, clientId: b.client_id || null,
      keyword: kws[0] || "", subs: kws.slice(1), selSubs: kws.slice(1), kwAll: kws.slice(0, 10), kwOn: kws, kwMore: [], refs: ids, mainRef: ids[Math.max(0, Number(b.main_ref || 1) - 1)] || ids[0], multi: true, refsAi: true,
      refsCache: refs.map(r => ({ id: r.id, account: r.account, thumbnail: r.thumbnail, views: r.views, likes: r.likes, description: r.description, posted_at: r.posted_at, url: r.url, frames: true, duration: r.duration || (r.analysis || {}).duration })),
      extra: { target_free: b.target || "", length: String(b.length || 30), ch: b.character || {}, funnel: b.funnel || "", scene: b.scene || "", offer: b.offer || "", must: "", mf: b.mode_fields || {}, set_cta_keyword: b.set_cta_keyword || "" },
      profile: { mode: b.mode || "own", job: b.job, keywords: kws }, saveClient: false }, opt || {});
    W.profileFor = step1Key(); W.uspFor = step1Key(); W.uspBase = uspBase(); save(); }
  window.setMore = async (sid) => { if (W.appendSid === sid && (W.refs || []).length) { W.step = 3; save(); location.hash = "#/plan/new"; return; }
    const st = SETC[sid] || await api("/api/plansets/" + sid).catch(() => null); const v = st && (st.videos || []).filter(x => x.status === "done").pop(); if (!v) return toast("첫 편이 완성되면 이어서 만들 수 있어요"); planMore(v.id); };
  window.wizFresh = () => { Object.assign(W, WIZ_BLANK()); save(); if (location.hash !== "#/plan/new") location.hash = "#/plan/new"; else renderWizard(); };
  window.wizTopics = async function (more) {
    if (TOPICS_LOADING) return;
    if ((W.topics || []).length && (W.topicFetch || 0) >= 3 && !document.body.classList.contains("admin")) return toast("주제 다시 뽑기는 기획안 한 편에 3번까지예요 — 지금 목록에서 고르거나 직접 적어주세요");
    W.topicFetch = (W.topicFetch || 0) + 1; TOPICS_LOADING = true;
    const dirEl = $("#wiz-dir"); if (dirEl) { W.direction = dirEl.value; save(); }
    const m = $("#wiz-topic-msg"); if (m) m.textContent = "주제 뽑는 중…"; showWait("주제 뽑는 중", 28, "참고 릴스 구조 + 훅 공식으로 8개를 만들고 있어요");
    try {
      const r = await post("/api/plan/topics", { ids: W.refs, brief: brief(), direction: W.direction || "", exclude: [...(W.madeTopics || []), ...(more ? (W.topics || []).map(x => x.title) : [])] });
      if (r.need_key) { if (m) m.textContent = "AI 엔진이 없어 추천은 건너뜁니다. 주제를 직접 적어주세요 (비워도 돼요)"; return; }
      if (r.error) throw new Error(r.error);
      W.topics = more ? [...(W.topics || []), ...(r.topics || [])] : (r.topics || []); save(); if (!W.topics.length && m) m.textContent = "추천이 비어 왔어요. 다시 뽑기를 눌러주세요";
    } catch (e) { if (m) m.textContent = "실패: " + e.message + " — 다시 뽑기를 눌러주세요"; }
    finally { TOPICS_LOADING = false; hideWait(); if (W.topics.length) renderWizard(); }
  };
  window.wizMake = () => wizMakeSet();   // 1편도 세트 흐름(기다리는 화면 통일)

  // ---------------- 결과 화면: [내 릴스 기획안] [레퍼런스 뜯어보기] [전문가용]
  let TAB = "easy"; let CUR = null;
  window.planJson = () => JSON.stringify((CUR && (CUR.plan || CUR)) || {}, null, 1);
  window.planTab = (t) => { TAB = t; renderPlan2(CUR); };
  let EXTRA_T = null; const EXTRA_DEAD = new Set(); let SK_PENDING = false;
  async function watchExtras(pid) {
    clearInterval(EXTRA_T);
    EXTRA_T = setInterval(async () => {
      try { const pr = await api("/api/plans/" + pid + "/progress"); if (pr.done || pr.stage === "unknown") { clearInterval(EXTRA_T); EXTRA_DEAD.add(pid); if (pr.done && CUR && CUR.id === pid) { CUR = await api("/api/plans/" + pid); renderPlan2(CUR); if ((((CUR.plan || {}).B_plan || {}).scenes || []).some(x => x.sketch)) toast("장면 그림이 완성됐어요"); } else if (CUR && CUR.id === pid) renderPlan2(CUR); } }
      catch (e) { clearInterval(EXTRA_T); }
    }, 4000);
  }
  const TABS = [["easy", "기획안", "요약 · 훅 · 대본 · 촬영 준비", 1], ["shoot", "촬영 외주용", "촬영하는 사람에게", 2], ["pro", "편집 외주용", "편집하는 사람에게", 3], ["refs", "레퍼런스 뜯어보기", "따라 한 릴스 컷별 분석", 0]];
  const secTxt = (v) => String(v == null ? "" : v).replace(/\.0(?=\D|$)/g, "").replace(/\s*[-~–]\s*/, "–");   // '11.0-13.0' → '11–13'
  const cLine = (label, html) => html ? `<div class="c-line"><i>${label}</i><span>${html}</span></div>` : "";
  const kvGrid = (rows, wide) => { const r = rows.filter(x => x[1]); let h = r.map(([k, v], i) => `<div class="k">${k}</div><div class="v${i === r.length - 1 && i % 2 === 0 ? " wide" : ""}">${v}</div>`).join("");
    (wide || []).filter(x => x[1]).forEach(([k, v]) => { h += `<div class="k">${k}</div><div class="v wide">${v}</div>`; }); return h ? `<div class="pv-kvg">${h}</div>` : ""; };
  const PARTROLE2 = { 기: "비주얼 후킹", 승: "문제 제기", 전: "해결", 결: "정보·CTA" };
  const STAGES7 = ["후킹", "상식 깨기", "근거", "진정성", "정보", "정리", "마지막 한 마디"];
  const noNum = (x) => String(x == null ? "" : x).replace(/^\s*(?:\d+[).]|[①-⑳])\s*/, "");
  const liList = (arr) => (arr || []).filter(Boolean).map(x => `<li>${phHtml(noNum(x))}</li>`).join("");
  const partOf = (x) => (x && x.part === "훅") ? "기" : ((x && x.part) || "");
  const breathLines = (say) => String(say || "").replace(/([.?!])\s+/g, "$1\n").split(/\n+/).map(x => x.trim()).filter(Boolean);
  const kvRows = (rows) => rows.filter(r => r[1]).map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("");
  function heroInfo(plan, p) {
    const B = plan.B_plan || {}; const S = plan.summary || {}; const sc = B.scenes || []; const mr = (p.refs || [])[(plan.main_ref || 1) - 1];
    const cells = [["형식", esc(plan.format || "")], ["길이", plan.length_sec ? `${esc(plan.length_sec)}초 · ${sc.length}장면` : ""], ["컷 비율", esc(S.cut_ratio || "")], ["마무리", esc(plan.ending_type || "")],
      ["따라 한 릴스", mr ? `@${esc(mr.account || "")}${mr.views ? ` <small>▶ ${fmt(mr.views)}</small>` : ""}` : ""], ["썸네일 문구", phHtml(String(plan.thumbnail_text || "").replace(/\n+/g, " / "))]];
    return cells.filter(c => c[1]).map(([k, v]) => `<div class="pv-cell"><span>${k}</span><b>${v}</b></div>`).join("");
  }
  window.copyScript = () => { const sc = ((CUR.plan || {}).B_plan || {}).scenes || []; const t = sc.map(x => breathLines(x.say).join("\n")).join("\n").replace(/\[확인\s*필요[:：]?\s*([^\]]*)\]/g, "$1");
    copyText(t, "대본을 복사했어요"); };
  function renderPlan2(p) {
    CUR = p;
    const hasBrief = !!(((p.plan || {}).pro || {}).edit_brief); const anySketch = ((((p.plan || {}).B_plan || {}).scenes) || []).some(s => s.sketch);
    const ageMin = (() => { const t = Date.parse(String(p.created_at || "").replace(" ", "T")); return isNaN(t) ? 9999 : (Date.now() - t) / 60000; })();
    const extrasPending = SK_PENDING = !!(p.plan && !anySketch && p.status === "done" && (p.engine === "cli" || p.engine === "api") && ageMin < 20 && !EXTRA_DEAD.has(p.id));
    if (extrasPending) watchExtras(p.id); else clearInterval(EXTRA_T);
    const plan = p.plan || null; const done = !!plan;
    const title = plan ? plan.title : ((p.brief || {}).topic || ((p.brief || {}).keyword || "기획 준비").split(",")[0]);
    if (!TABS.some(t => t[0] === TAB)) TAB = "easy";
    let body = "";
    if (TAB === "refs") body = renderRefsTab(p);
    else if (TAB === "easy") body = done ? renderEasyTab(plan, p) : promptBox(p);
    else if (TAB === "pro") body = done ? renderProTab(plan, p) : promptBox(p);
    else if (TAB === "shoot") body = done ? renderShootTab(plan, p) : promptBox(p);
    else body = done ? renderPlanTab(plan, p) : promptBox(p);
    $("#main").innerHTML = `<div class="pv">${setNavHtml(p)}
      <header class="pv-hero">
        <div class="pv-top"><a class="pv-btn" href="#/plan">← 기획 목록</a><span class="pv-date">${done ? "내 릴스 기획안" : "프롬프트 패키지"} · ${esc(p.created_at || "")}</span>
          <div class="pv-tools"><a class="pv-btn" href="/api/plans/${esc(p.id)}.csv">엑셀</a><button class="pv-btn" onclick="copyText(planJson(),'JSON을 복사했어요')">JSON</button><button class="pv-btn danger" onclick="planDelete('${esc(p.id)}')">휴지통으로</button></div></div>
        <h1 class="pv-title">${phHtml(title)}</h1>${plan && plan.one_line ? `<p class="pv-one">${phHtml(plan.one_line)}</p>` : ""}
        ${plan ? `<div class="pv-info">${heroInfo(plan, p)}</div>
        <div class="pv-actions"><button class="pv-btn primary" onclick="sharePlan('${esc(p.id)}')">사장님께 보내기</button><button class="pv-btn" onclick="copyScript()">대본 복사</button><button class="pv-btn" onclick="openPrompter()">크게 보기(프롬프터)</button><button class="pv-btn more" onclick="planMore('${esc(p.id)}')">+ 같은 구조로 하나 더 만들기</button></div>` : ""}
      </header>
      ${p.client_confirm ? `<div class="pv-note ${p.client_confirm.status === "ok" ? "ok" : ""}"><b>${p.client_confirm.status === "ok" ? "사장님이 확인했어요" : "사장님이 수정을 요청했어요"}</b> · ${esc(p.client_confirm.at || "")}${p.client_confirm.memo ? ` — “${esc(p.client_confirm.memo)}”` : ""}</div>` : ""}
      ${plan ? `<div class="pv-track"><label>촬영일<input type="date" value="${esc(p.shoot_date || "")}" onchange="setPlanMetaQuiet('${esc(p.id)}', {shoot_date: this.value})"></label><label>마감일<input type="date" value="${esc(p.due_date || "")}" onchange="setPlanMetaQuiet('${esc(p.id)}', {due_date: this.value})"></label><label class="w">촬영본 링크<input type="url" placeholder="드라이브·카톡 링크" value="${esc(p.raw_link || "")}" onchange="setPlanMetaQuiet('${esc(p.id)}', {raw_link: this.value})"></label><label class="w">완성본 링크<input type="url" placeholder="완성 영상·게시물 링크" value="${esc(p.final_link || "")}" onchange="setPlanMetaQuiet('${esc(p.id)}', {final_link: this.value})"></label><label>조회수<input type="text" placeholder="예: 3.2만" value="${esc(p.views_note || "")}" onchange="setPlanMetaQuiet('${esc(p.id)}', {views_note: this.value})"></label></div>` : ""}
      ${extrasPending ? `<div class="pv-note">기획안은 완성됐어요. 장면 그림(스케치)은 뒤에서 그리는 중이에요(1~2분). 끝나면 대본 표에 자동으로 채워집니다.</div>` : ""}
      <nav class="pv-tabs">${TABS.map(([k, v, d, n]) => `<button class="${TAB === k ? "on" : ""}" onclick="planTab('${k}')"><b>${n ? `<i class="pv-no">${n}</i>` : ""}${v}</b><span>${d}</span></button>`).join("")}</nav>
      <div class="pv-body">${body}</div></div>`;
  }
  window.sharePlan = async (pid) => { try { const r = await post("/api/plans/" + pid + "/share", {}); if (r.error) throw new Error(r.error); const url = location.origin + location.pathname + "#/share/" + r.token; await copyText(url, "사장님용 링크를 복사했어요 — 카톡에 붙여넣으세요 (로그인한 사람만 열 수 있어요)"); } catch (e) { toast("실패: " + e.message); } };
  window.planDelete = async (id) => { if (!confirm("이 기획안을 휴지통으로 옮길까요? 휴지통에서 다시 살릴 수 있어요.")) return; const sid0 = CUR && CUR.id === id ? CUR.set_id : null; const st0 = sid0 ? SETC[sid0] : null; const sid = st0 && (st0.videos || []).filter(v => v.status !== "deleted" && v.id !== id).length ? sid0 : null;
    try { const r = await post("/api/plans/" + id + "/delete", {}); if (r.error) throw new Error(r.error); if (sid) delete SETC[sid]; toast("휴지통으로 옮겼어요"); location.hash = sid ? "#/plan/set/" + sid : "#/plan"; } catch (e) { toast("실패: " + e.message); } };
  function promptBox(p) {
    return `<div class="panel warn">${esc(p.message || "AI 키가 없어 기획안 자동 생성은 건너뛰었어요.")}<br><small class="muted">.env 에 ANTHROPIC_API_KEY 를 넣으면 버튼 한 번으로 끝납니다. 지금은 아래 프롬프트를 클로드에 붙여넣고, 나온 JSON을 아래 칸에 넣어 저장하세요. "레퍼런스 뜯어보기" 탭은 키 없이도 바로 볼 수 있어요.</small></div>
      <div class="panel" style="margin-top:10px"><div class="row"><b>프롬프트</b><button class="btn small" onclick="copyText($('#plan-prompt').value,'프롬프트를 복사했어요')">복사</button></div><textarea id="plan-prompt" rows="10" class="wiz-input mono">${esc("[하이커브 기획 원칙]\n" + (p.principles || "") + "\n\n" + (p.prompt || "") + "\n\n위 원칙과 레퍼런스로 하이커브 양식(JSON) 기획안을 만들어줘.")}</textarea></div>
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
    const S = plan.summary || {}; add(S, "core_message", "핵심 메시지"); add(S, "cta", "CTA"); if (S.first3) { add(S.first3, "say", "첫 3초 말"); add(S.first3, "caption", "첫 3초 자막"); }
    (B.hooks || []).forEach((h, i) => add(h, "top_caption", `상단 자막 ${i + 1}`));
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
  // ---------------- 쉬운 기획안(기본 화면) — 9/17 개편: 요약 → 훅 3개 → 대본 통째(호흡 줄바꿈 + 옆에 기승전결·붙잡는 장치) → 장면 → 촬영 준비 → 올릴 때 → 주의사항 → 모드 체크 → 레퍼런스(맨 뒤)
  const PARTROLE = { 기: "비주얼 후킹", 승: "자막·문제 제기", 전: "해결 방법", 결: "정보 제공·CTA" };
  function thumbBlockHtml(plan, p) {
    const thumbLines = String(plan.thumbnail_text || "").split(/\n/).filter(Boolean); const cands = (plan.thumb_candidates || []).filter(Boolean);
    return `<div class="thumb-block"><div class="thumb-mock"><div class="tm-text">${thumbLines.length ? thumbLines.map(l => `<span>${tmLine(l)}</span>`).join("") : '<span class="muted">문구 없음</span>'}</div><div class="tm-cap">썸네일 미리보기</div></div>
      <div class="thumb-side"><div class="thumb-label">썸네일 문구 <small>= 메인 후킹 문구</small></div><textarea id="thumb-text" class="thumb-input" rows="2" placeholder="첫줄 (Enter) 둘째줄" oninput="thumbLive(this, '${esc(p.id)}')">${esc(plan.thumbnail_text || "")}</textarea>
        <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px"><button class="btn small" onclick="saveThumb('${esc(p.id)}')">저장</button><button class="btn small" onclick="thumbFromHook('${esc(p.id)}')">고른 훅에서 가져오기</button><button class="btn small" onclick="genThumbs('${esc(p.id)}')">AI로 후보 3개 뽑기</button></div>
        ${cands.length ? `<div class="thumb-cands">${cands.map(c => `<button class="tcand" onclick="pickThumb('${esc(p.id)}', ${JSON.stringify(c).replace(/"/g, "&quot;")})">${esc(c).replace(/\n/g, " / ")}</button>`).join("")}</div>` : ""}</div></div>`;
  }
  const EZ = [["all", "전체"], ["sum", "요약 · 첫 문장"], ["script", "대본 · 장면"], ["prep", "촬영 · 올리기"], ["check", "검수 · 레퍼런스"]];
  let EZSEC = (() => { try { const v = localStorage.getItem("ezsec4"); return EZ.some(x => x[0] === v) ? v : "script"; } catch (e) { return "script"; } })();
  window.ezSec = (k) => { EZSEC = k; try { localStorage.setItem("ezsec4", k); } catch (e) {} renderPlan2(CUR); const el = document.querySelector(".pv-tabs"); if (el && el.getBoundingClientRect().top < 0) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 12 }); };
  function renderEasyTab(plan, p) {
    const fns = { sum: ezSummary, script: ezScript, prep: ezPrep, check: ezCheck };
    const body = (EZSEC === "all" || !fns[EZSEC]) ? [ezSummary, ezScript, ezPrep, ezCheck].map(f => f(plan, p)).join("") : fns[EZSEC](plan, p);
    return `<div class="pv-ez"><nav class="pv-side">${EZ.map(([k, l]) => `<button class="${EZSEC === k ? "on" : ""}" onclick="ezSec('${k}')">${l}</button>`).join("")}</nav><div class="pv-main">${body}</div></div>`;
  }
  function ezSummary(plan, p) {
    const B = plan.B_plan || {}; const hooks = B.hooks || []; const rec = Math.max(1, Number(B.recommended_hook || 1)); const h = hooks[rec - 1] || {}; const sc = B.scenes || []; const s0 = sc[0] || {}; const S = plan.summary || {}; const brief = p.brief || {};
    const f3 = [["말", h.line || s0.say], ["화면", h.first_screen || s0.screen], ["자막", h.top_caption || h.first_caption || s0.caption]].filter(x => x[1]);
    const core = S.core_message || plan.one_line || "";
    const sumRows = kvRows([["핵심 메시지", core ? `<div class="pv-lead">${phHtml(core)}</div>` : ""], ["핵심 소구점", (S.key_usp || brief.usp) ? `<b>${phHtml(S.key_usp || brief.usp)}</b>` : ""],
      ["첫 3초", f3.length ? `<dl class="pv-dl">${f3.map(([k, v]) => `<dt>${k}</dt><dd>${phHtml(v)}</dd>`).join("")}</dl>` : ""], ["CTA", phHtml(S.cta || (B.cta || {}).say || "")],
      ["필수 인서트", (S.must_inserts || []).length ? `<ol>${liList(S.must_inserts)}</ol>` : ""], ["녹인 포인트", (S.melted_points || []).length ? `<ol>${liList(S.melted_points)}</ol>` : ""]]);
    const el2 = (x) => [["화면", x.first_screen], ["줌", x.zoom], ["자막", x.top_caption || x.first_caption], ["효과음", x.first_sfx], ["표정", x.face]].filter(y => y[1]).map(([k, v]) => cLine(k, phHtml(v))).join("");
    const hookRows = hooks.map((x, i) => `<tr class="${i + 1 === rec ? "on" : ""}"><td class="c-type"><b>${esc(x.type || "훅 " + (i + 1))}</b>${x.generated ? "<span>새로 뽑음</span>" : ""}</td><td><div class="pv-hookline">${phHtml(x.line || "")}</div>${x.pattern ? `<div class="pv-muted hk-pat">템플릿 · ${esc(x.pattern)}</div>` : ""}</td><td class="c-sub hk-el">${el2(x) || '<span class="pv-muted">-</span>'}</td><td class="c-act">${i + 1 === rec ? "<em>✓ 적용됨</em>" : `<button class="pv-btn small" onclick="applyHook('${esc(p.id)}', ${i + 1})">이걸로</button>`}<button class="pv-btn small keep" onclick="boxSaveHook(${i})" title="내 저장소에 담기${document.body.classList.contains("admin") ? " — 관리자가 담은 훅은 다음 기획안의 기준 예시가 돼요" : ""}">담기</button></td></tr>`).join("");
    const hookTable = hooks.length ? `<div class="pv-scroll"><table class="pv-grid pv-hooks2"><colgroup><col style="width:108px"><col style="width:34%"><col><col style="width:104px"></colgroup><thead><tr><th>유형</th><th>첫 문장</th><th>첫 2초에 넣을 것</th><th></th></tr></thead><tbody>${hookRows}</tbody></table></div>` : `<div class="pv-muted">훅 후보가 없어요.</div>`;
    if (!HOOKDB && !HOOKDB_LOADING && !STATIC) { HOOKDB_LOADING = true; api("/api/hooks").then(d => { HOOKDB = d; const names = (d.types || []).map(t => t.name); if (JSON.stringify(names) !== JSON.stringify(HOOK_TYPES12) && CUR && TAB === "easy") renderPlan2(CUR); }).catch(() => {}); }
    const types = (HOOKDB && (HOOKDB.types || []).length) ? HOOKDB.types.map(t => t.name) : HOOK_TYPES12; const admin = document.body.classList.contains("admin");
    return `<section class="pv-card"><div class="pv-h"><h2>요약</h2><span>이것만 봐도 영상이 그려지게</span></div><table class="pv-kv">${sumRows}</table></section>
      <section class="pv-card"><div class="pv-h"><h2>첫 문장 고르기</h2><span>'이걸로'를 누르면 1번 장면과 썸네일 문구가 같이 바뀝니다</span></div>${hookTable}
        <div class="hk-change"><div class="hk-change-h"><b>훅 바꾸기</b><span>유형을 누르면 그 유형의 준희즘 템플릿으로 첫 문장 3개를 새로 뽑아 위 표에 추가해요 (10초 안팎${admin ? "" : " · 기획안당 5번"})</span></div>
          <div class="hk-types">${(HOOK_MORE ? types : [...HOOK_TOP5.filter(t => types.includes(t)), ...types.filter(t => !HOOK_TOP5.includes(t))].slice(0, 5)).map(t => `<button class="${HOOKBUSY === t ? "busy" : ""}" ${HOOKBUSY ? "disabled" : ""} onclick="hookConvert('${esc(p.id)}', ${JSON.stringify(t).replace(/"/g, "&quot;")})">${HOOKBUSY === t ? "뽑는 중…" : esc(t)}</button>`).join("")}${types.length > 5 ? `<button class="more" onclick="hookMore()">${HOOK_MORE ? "접기" : "+ 나머지 " + (types.length - 5) + "개"}</button>` : ""}</div>
          <div class="pv-toolrow"><button class="pv-btn primary" onclick="openHookPicker('${esc(p.id)}')">훅 300개에서 직접 고르기</button><button class="pv-btn" onclick="rewriteOpening('${esc(p.id)}', ${rec})">첫 문장에 맞춰 1~2번 장면 다시 쓰기</button><span id="hook-msg" class="pv-muted"></span></div></div></section>`;
  }
  const HOOK_TOP5 = ["손해형", "공감형", "지적형", "수치형", "비밀형"]; let HOOK_MORE = false; window.hookMore = () => { HOOK_MORE = !HOOK_MORE; renderPlan2(CUR); };
  const HOOK_TYPES12 = ["비밀형", "지적형", "수치형", "원인찾기형", "경고형", "손해형", "비교형", "반전형", "도전형", "공감형", "증명형", "첫마디형"]; let HOOKBUSY = "", HOOKDB_LOADING = false;
  window.hookConvert = async (pid, type) => { if (HOOKBUSY) return; HOOKBUSY = type; renderPlan2(CUR);
    try { const r = await post("/api/plans/" + pid + "/hooks", { formula: type, n: 3 }); if (r.error) throw new Error(r.error); CUR = r; toast(`'${type}' 훅 3개를 추가했어요 — '이걸로'를 누르면 적용돼요`); } catch (e) { toast("실패: " + e.message); } finally { HOOKBUSY = ""; renderPlan2(CUR); } };
  // 장면 자세히(그림 크게 + 찍는 법·편집·팁) — 상세 기획안 탭 대신
  const skCell = (x) => x.sketch ? `<button class="sk-btn" onclick="openScene(${Number(x.no) || 0})" title="크게 보기"><img src="${esc(x.sketch)}" loading="lazy" alt="${esc(x.no)}번 장면 그림"></button>` : `<button class="sk-btn empty" onclick="openScene(${Number(x.no) || 0})">${SK_PENDING ? "그리는 중" : "자세히"}</button>`;
  window.openScene = (no) => { const plan = (CUR || {}).plan || {}; const sc = ((plan.B_plan || {}).scenes) || []; const i = sc.findIndex(x => Number(x.no) === Number(no)); if (i < 0) return; const x = sc[i]; const g = x.guide || {}; const f = x.framing || {}; const part = partOf(x);
    const rows = kvRows([["대사", `<b style="font-size:18px">${phHtml(x.say || "")}</b>`], ["자막", phHtml(x.caption || "")], ["화면", phHtml(x.screen || "")], ["찍는 법", esc(x.how || [g.composition || [f.shot, f.camera].filter(Boolean).join(" · "), g.action].filter(Boolean).join(" / "))], ["폰 세팅", esc(x.camera || g.camera || "")], ["붙잡는 장치", esc(x.hold || "")], ["캡컷 편집", x.edit ? esc(x.edit) : capcutText(x.capcut)],
      ["조명", esc(g.light || "")], ["소품", esc(g.props || "")], ["의상·배경", esc(g.wear || "")], ["표정·시선", esc(g.look || "")], ["테이크", esc(g.take || "")], ["팁", esc(x.tip || "")]]);
    $("#modal").className = "modal on hookmodal scenemodal"; $("#mask").classList.add("on");
    $("#modal").innerHTML = `<button class="x" onclick="closeAll()">✕</button><div class="sm"><div class="sm-img">${x.sketch ? `<img src="${esc(x.sketch)}" alt="${esc(x.no)}번 장면 그림">` : `<div class="sm-empty">${SK_PENDING ? "그림을 그리는 중이에요" : "그림이 아직 없어요"}</div>`}<button class="pv-btn small" onclick="closeAll();reSketch('${esc(CUR.id)}', ${Number(x.no) || 0})">이 장면 그림 다시 그리기</button></div>
      <div class="sm-body"><div class="sm-head"><b class="no">${esc(x.no)}</b><span>${esc(secTxt(x.sec))}초</span><span class="part">${esc(part)} · ${esc(x.stage || PARTROLE2[part] || "")}</span></div><table class="pv-kv">${rows}</table>
      <div class="pv-toolrow">${i > 0 ? `<button class="pv-btn" onclick="openScene(${Number(sc[i - 1].no) || 0})">← 이전 장면</button>` : ""}${i < sc.length - 1 ? `<button class="pv-btn" onclick="openScene(${Number(sc[i + 1].no) || 0})">다음 장면 →</button>` : ""}</div></div></div>`; };
  function ezScript(plan, p) {
    const B = plan.B_plan || {}; const sc = B.scenes || []; const groups = phGroups(plan); const pm = Object.fromEntries((plan.parts || []).map(x => [x.part, x]));
    const ctx = (g) => { const a0 = Math.max(0, g.start - 32), b1 = Math.min(g.text.length, g.end + 32); return `${a0 > 0 ? "…" : ""}${phHtml(g.text.slice(a0, g.start))}<span class="ph-slot">${esc(g.label)}</span>${phHtml(g.text.slice(g.end, b1))}${b1 < g.text.length ? "…" : ""}`; };
    const fill = groups.length ? `<div class="pv-fill"><div class="pv-fill-head"><b>빈칸 ${groups.length}곳</b> 내 숫자로 채우면 대본·자막·캡션에 한 번에 들어갑니다. 모르면 비워 두세요.</div>
      <table class="pv-kv">${groups.map((g, gi) => `<tr><td><div class="pv-muted">${esc(g.where.slice(0, 3).join(" · "))}${g.where.length > 3 ? ` 외 ${g.where.length - 3}곳` : ""}${g.occ.length > 1 ? ` · ${g.occ.length}곳 같이 바뀜` : ""}</div><div>${ctx(g)}</div></td><td class="pv-fill-in"><input class="fill-in" data-gi="${gi}" placeholder="${esc(phHint(g.label))}"></td></tr>`).join("")}</table>
      <button class="pv-btn primary" onclick="fillNumbers('${esc(p.id)}')">대본에 채우기</button></div>` : "";
    const seen = new Set();
    const rows = sc.map((x, si) => { const part = partOf(x); const firstOfPart = !seen.has(part); seen.add(part);
      const hold = x.hold || (firstOfPart ? ((pm[part] || {}).device || "") : ""); const stage = x.stage || PARTROLE2[part] || ""; const hasPh = /\[확인\s*필요/.test(x.say || "");
      return `<tr class="p-${esc(part)}"><td class="c-no"><b>${esc(x.no)}</b><span>${esc(secTxt(x.sec))}초</span></td><td class="c-sk">${skCell(x)}</td><td class="c-part"><b>${esc(part)}</b><span>${esc(stage)}</span></td><td class="c-say"><div>${hasPh ? phHtml(x.say) : ed("B_plan.scenes." + si + ".say", x.say, "inline", "span")}</div>${cLine("자막", phHtml(x.caption || ""))}${(x.alts || []).filter(Boolean).map(a => cLine("대안", phHtml(a))).join("")}</td><td class="c-sub">${phHtml(x.screen || "")}${cLine("장치", esc(hold))}${cLine("편집", esc(x.edit || ""))}${cLine("B컷", esc(x.bcut || ""))}</td></tr>`; }).join("");
    return `<section class="pv-card"><div class="pv-h"><h2>대본</h2><span>${esc(plan.length_sec)}초 · ${sc.length}장면 · 대사를 누르면 바로 고칠 수 있고, 그림을 누르면 찍는 법이 크게 보여요</span><div class="pv-h-right"><button class="pv-btn" onclick="copyScript()">대본 복사</button><button class="pv-btn" onclick="openPrompter()">크게 보기</button><button class="pv-btn" onclick="humanize('${esc(p.id)}')">내 말투로 다듬기</button><button class="pv-btn" onclick="reSketch('${esc(p.id)}')">장면 그림 다시 그리기</button><button class="pv-btn" onclick="boxSaveScript()">대본 담기</button>${document.body.classList.contains("admin") ? `<button class="pv-btn" onclick="likeScript('${esc(p.id)}')">좋은 대본으로 저장</button>` : ""}</div></div>
      ${fill}<div class="pv-scroll"><table class="pv-grid pv-script"><colgroup><col style="width:86px"><col style="width:118px"><col style="width:108px"><col style="width:39%"><col></colgroup>
      <thead><tr><th>#</th><th>그림</th><th>구간</th><th>대사 · 자막</th><th>화면 · 장치 · 편집</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }
  function ezPrep(plan, p) {
    const B = plan.B_plan || {}; const PP = plan.prep_pack || {}; const C = plan.cautions || {}; const items = (PP.items || []).length ? PP.items : (B.prep || []);
    const prep = kvRows([["준비물", items.length ? `<ul>${liList(items)}</ul>` : ""], ["의상", phHtml(PP.wear || "")], ["촬영 배경", phHtml(PP.location || "")], ["촬영 순서", (PP.order || []).length ? `<ol>${liList(PP.order)}</ol>` : ""], ["찍을 것 전체", (B.shot_list || []).length ? `<ul>${liList(B.shot_list)}</ul>` : ""]]);
    const up = kvRows([["캡션", B.caption_text ? `<div class="pv-pre">${phHtml(B.caption_text)}</div><button class="pv-btn small" onclick="copyText(CUR.plan.B_plan.caption_text||'','캡션을 복사했어요')">캡션 복사</button>` : ""], ["마지막 멘트", phHtml((B.cta || {}).say || "")], ["댓글 질문", phHtml((B.cta || {}).comment_question || "")], ["음악", esc(B.music || "")]]);
    const caution = kvRows([["사실 확인", (C.fact_check || []).length ? `<ul>${liList(C.fact_check)}</ul>` : ""], ["광고 심의", (C.ad_review || []).length ? `<ul>${liList(C.ad_review)}</ul>` : ""], ["메타 광고 순화", phHtml(C.meta_ads_version || "")]]);
    return `<div class="pv-two"><section class="pv-card"><div class="pv-h"><h2>촬영 준비</h2><span>사장님께 보내는 링크에도 나가요</span></div>${prep ? `<table class="pv-kv">${prep}</table>` : '<div class="pv-muted">준비물 정보가 없어요.</div>'}</section>
      <section class="pv-card"><div class="pv-h"><h2>올릴 때</h2></div>${up ? `<table class="pv-kv">${up}</table>` : ""}${thumbBlockHtml(plan, p)}</section></div>
      ${caution ? `<section class="pv-card warn"><div class="pv-h"><h2>주의사항</h2><span>올리기 전에 확인</span></div><table class="pv-kv">${caution}</table></section>` : ""}`;
  }
  function refSectionHtml(plan, p) {
    const mr = (p.refs || [])[(plan.main_ref || 1) - 1]; const flow = plan.ref_flow || []; const map = plan.ref_map || [];
    if (!mr && !flow.length) return "";
    return `<section class="pv-card"><div class="pv-h"><h2>이 기획안이 가져온 구조</h2><span>대본은 이 릴스의 흐름에 고정했어요</span></div>
      ${mr ? `<div class="pv-ref">${mr.thumbnail ? `<img src="${esc(mr.thumbnail)}" onerror="this.style.visibility='hidden'">` : ""}<div><div class="pv-ref-name">@${esc(mr.account || "")}${mr.views ? ` <span class="pv-muted">▶ ${fmt(mr.views)}</span>` : ""}${plan.format ? ` <span class="pv-muted">· ${esc(plan.format)}</span>` : ""}</div>${mr.description ? `<div class="pv-muted">${esc(mr.description)}</div>` : ""}<div class="pv-toolrow"><a class="pv-btn" href="${esc(mr.url || "#")}" target="_blank" rel="noopener">원본 영상 ↗</a><button class="pv-btn" onclick="planTab('refs')">컷별 분석 보기</button></div></div></div>` : ""}
      ${flow.length ? kvGrid(flow.map((x, i) => [`${i + 1}단계`, esc(String(x).replace(/^[①-⑳\d.)\s]+/, ""))])) : ""}
      ${map.length ? `<details class="pv-details"><summary>구간별로 레퍼런스 ↔ 내 대본 나란히 보기</summary><div class="pv-scroll"><table class="pv-grid"><colgroup><col style="width:80px"><col><col></colgroup><thead><tr><th>구간</th><th>레퍼런스</th><th>내 대본</th></tr></thead><tbody>${map.map(r => `<tr><td><b>${esc(r.part || "")}</b></td><td>${esc(r.ref || "")}</td><td>${phHtml(r.mine || "")}</td></tr>`).join("")}</tbody></table></div></details>` : ""}</section>`;
  }
  function ezCheck(plan, p) {
    const B = plan.B_plan || {}; const sc = B.scenes || []; const S = plan.summary || {}; const brief = p.brief || {}; const pm = Object.fromEntries((plan.parts || []).map(x => [x.part, x]));
    const norm = (t) => String(t || "").replace(/\[확인\s*필요[:：]?\s*([^\]]*)\]/g, "$1").replace(/[\s.,!?~'"“”‘’…]/g, "");
    const script = norm(sc.map(x => x.say || "").join(" "));
    const hk = (B.hooks || [])[Math.max(1, Number(B.recommended_hook || 1)) - 1] || {}; const firstLine = hk.line || (sc[0] || {}).say || "";
    const partRows = (firstLine ? `<tr><th>첫 문장</th><td><b>“${phHtml(firstLine)}”</b>${hk.type ? ` <span class="pv-muted">${esc(hk.type)}</span>` : ""}</td></tr>` : "") + ["기", "승", "전", "결"].map(k => { const first = sc.find(x => partOf(x) === k); const dev = (first && first.hold) || (pm[k] || {}).device || "";
      return `<tr><th>${k} · ${PARTROLE2[k]}</th><td>${!first ? '<span class="bad">이 구간 장면이 없어요</span>' : dev ? `<span class="ok">있음</span> ${esc(dev)}` : '<span class="bad">없음</span> 이 구간 첫 장면에 줌·자막 강조·효과음 중 하나를 넣으세요'}</td></tr>`; }).join("");
    const usp = S.key_usp || brief.usp || ""; const um = (S.usp_map || []).filter(x => x && x.sentence);
    const uspCell = usp ? `<div class="pv-lead-s">${phHtml(usp)}</div>${um.length ? `<ul class="pv-checks">${um.map(x => { const ok = script.includes(norm(x.sentence).slice(0, 14)); return `<li><span class="${ok ? "ok" : "bad"}">${ok ? "대본에 있음" : "대본에 안 보임"}</span> ${x.scene ? esc(x.scene) + "번 장면 · " : ""}“${phHtml(x.sentence)}”</li>`; }).join("")}</ul>` : `<div class="pv-muted">어느 대사에 소구점을 넣었는지 기록이 없는 예전 기획안이에요.</div>`}` : `<span class="bad">소구점 입력이 없어요</span>`;
    const have = new Set(sc.map(x => x.stage).filter(Boolean)); const must = ["후킹", "진정성", "정보", "마지막 한 마디"]; const miss = must.filter(n => !have.has(n));
    const stageCell = have.size ? `<div class="pv-stages">${STAGES7.map(n => `<span class="${have.has(n) ? "ok" : "no"}">${have.has(n) ? "✓" : "–"} ${n}</span>`).join("")}</div><div class="${miss.length ? "bad" : "ok"}" style="margin-top:6px">${miss.length ? "꼭 들어가야 하는 단계가 빠졌어요: " + miss.join(", ") : "꼭 필요한 4단계(후킹·진정성·정보·마지막 한 마디)가 다 들어갔어요"}</div>` : `<div class="pv-muted">7단계 표시가 없는 예전 기획안이에요. 새로 만들면 장면마다 7단계가 붙습니다.</div>`;
    const selfCheck = (plan.pro || {}).self_check || []; const qs = (plan.pro || {}).questions || [];
    const nextT = ((plan.pro || {}).next_topics || []).filter(Boolean).slice(0, 4);
    const nextCard = nextT.length ? `<section class="pv-card"><div class="pv-h"><h2>이어 찍기 좋은 주제</h2><span>같은 릴스 구조로 바로 하나 더 만들 수 있어요</span></div><table class="pv-kv">${nextT.map((t, k) => `<tr><td><b>${phHtml(t)}</b></td><td class="next-act"><button class="pv-btn small primary" onclick="planMore('${esc(p.id)}', ${k})">이 주제로 만들기</button><button class="pv-btn small" onclick="boxSaveNext(${k})">담기</button></td></tr>`).join("")}</table></section>` : "";
    return nextCard + `<section class="pv-card"><div class="pv-h"><h2>검수</h2><span>구간마다 후킹 포인트 · 소구점 · 맥락과 7단계</span></div><table class="pv-kv">
        <tr><th><i class="pv-no">1</i>구간별 후킹</th><td><table class="pv-mini">${partRows}</table></td></tr>
        <tr><th><i class="pv-no">2</i>소구점</th><td>${uspCell}</td></tr>
        <tr><th><i class="pv-no">3</i>맥락 · 7단계</th><td>${stageCell}</td></tr>
        ${selfCheck.length ? `<tr><th>AI 자가 점검</th><td><ul class="pv-checks">${selfCheck.map(c => `<li><span class="${c.ok ? "ok" : "bad"}">${c.ok ? "O" : "X"}</span> ${esc(c.q)}${c.why ? ` <span class="pv-muted">— ${esc(c.why)}</span>` : ""}</li>`).join("")}</ul></td></tr>` : ""}
        ${qs.length ? `<tr><th>확인해 주세요</th><td><ul>${liList(qs)}</ul></td></tr>` : ""}</table></section>
      ${modePackHtml(plan, "ez")}${refSectionHtml(plan, p)}`;
  }

  const capcutText = (c) => c ? [c.text_style && "텍스트 · " + c.text_style, c.transition && "전환 · " + c.transition, c.sfx && "효과음 · " + c.sfx, c.effect && "효과 · " + c.effect].filter(Boolean).map(esc).join("<br>") : "";
  function renderPlanTab(plan, p) {
    const B = plan.B_plan || {}; const sc = B.scenes || [];
    const tools = `<section class="pv-card slim"><div class="pv-toolrow" style="margin:0"><b style="font-size:15px;margin-right:6px">대본 손보기</b><button class="pv-btn" onclick="humanize('${esc(p.id)}')">내 말투로 다듬기</button><button class="pv-btn" onclick="likeScript('${esc(p.id)}')">이 대본 좋아요(다음 기획안이 이 수준을 따라감)</button><button class="pv-btn" onclick="reSketch('${esc(p.id)}')">장면 스케치 전부 다시 그리기</button></div></section>`;
    const scene = (x, si) => { const f = x.framing || {}; const g = x.guide || {}; const part = partOf(x);
      const c = x.capcut || {}; const capInl = [["텍스트", c.text_style], ["전환", c.transition], ["효과음", c.sfx], ["효과", c.effect]].filter(y => y[1]).map(([k, v]) => `<span><i>${k}</i>${esc(v)}</span>`).join("");
      const grid = kvGrid([["자막", x.caption ? ed("B_plan.scenes." + si + ".caption", x.caption, "inline", "span") : ""], ["화면", ed("B_plan.scenes." + si + ".screen", x.screen, "inline", "span")], ["붙잡는 장치", esc(x.hold || "")],
        ["폰", esc(g.camera || "")], ["구도", esc(g.composition || [f.shot, f.camera].filter(Boolean).join(" · "))], ["조명", esc(g.light || "")], ["소품", esc(g.props || "")], ["행동", esc(g.action || "")], ["의상·배경", esc(g.wear || "")], ["표정·시선", esc(g.look || "")], ["테이크", esc(g.take || "")], ["팁", x.tip ? ed("B_plan.scenes." + si + ".tip", x.tip, "inline", "span") : ""]],
        [["캡컷 편집", capInl ? `<div class="pv-inl">${capInl}</div>` : ""]]);
      return `<section class="pv-scene p-${esc(part)}"><div class="pv-scene-head"><b class="no">${esc(x.no)}</b><span>${esc(secTxt(x.sec))}초</span><span class="part">${esc(part)} · ${esc(x.stage || PARTROLE2[part] || "")}</span>${f.shot ? `<span class="pv-muted">${esc(f.shot)}${f.camera ? " · " + esc(f.camera) : ""}</span>` : ""}</div>
        <div class="pv-scene-body"><div class="pv-scene-img">${x.sketch ? `<img src="${esc(x.sketch)}" loading="lazy" alt="${esc(x.no)}번 장면 구도">` : sketch(f)}<a href="#" onclick="event.preventDefault();reSketch('${esc(p.id)}', ${Number(x.no) || 0})">이 장면 구도 다시 그리기</a></div>
        <div class="pv-scene-main"><div class="pv-say">${ed("B_plan.scenes." + si + ".say", x.say, "say")}</div>${grid}</div></div></section>`; };
    return `<div class="pv-detail">${refSectionHtml(plan, p)}${tools}${sc.map(scene).join("")}</div>`;
  }
  function shootData(plan, p) {
    const B = plan.B_plan || {}; const PP = plan.prep_pack || {}; const S = plan.summary || {}; const C = plan.cautions || {}; const sc = B.scenes || []; let lastG = {};
    const rows = sc.map(x => { const g = x.guide || {}; const f = x.framing || {}; const cam = g.camera || lastG.camera || ""; lastG = { ...lastG, ...Object.fromEntries(Object.entries(g).filter(([k, v]) => v)) };
      return { no: x.no, sec: x.sec, part: x.part, screen: x.screen || "", how: x.how || [g.composition || [f.shot, f.camera].filter(Boolean).join(" · "), g.action].filter(Boolean).join(" / "), camera: x.how ? (x.camera || "") : cam, say: x.say || "", caption: x.caption || "", hold: x.hold || "", sketch: x.sketch || "" }; });
    return { B, PP, S, C, rows, mainRef: (p.refs || [])[(plan.main_ref || 1) - 1] };
  }
  window.shootText = () => { const plan = CUR.plan; const d = shootData(plan, CUR); const L = [];
    L.push(`[촬영 외주서] ${plan.title}`, `형식 ${plan.format || "-"} · ${plan.length_sec}초 · ${d.rows.length}장면${d.S.cut_ratio ? " · " + d.S.cut_ratio : ""}`, "");
    L.push("■ 촬영 개요", `의상: ${d.PP.wear || "-"}`, `촬영 배경: ${d.PP.location || "-"}`, `준비물: ${(d.PP.items || d.B.prep || []).join(", ") || "-"}`, `필수 인서트: ${(d.S.must_inserts || []).join(" / ") || "-"}`, ...(d.PP.order || []).map((x, i) => `촬영 순서 ${i + 1}. ${x}`), "");
    L.push("■ 장면별 촬영표"); d.rows.forEach(r => L.push(...[`#${r.no} (${r.sec}초) ${r.screen}`, `   찍는 법: ${r.how || "-"}${r.camera ? " | 폰: " + r.camera : ""}`, `   대사: ${r.say}`, r.caption ? `   자막: ${r.caption}` : null, ""].filter(x => x != null)));
    L.push("", "■ 주의", ...((d.B.tips || []).map(x => "- " + x)), ...((d.C.fact_check || []).map(x => "- 확인: " + x))); if (d.mainRef) L.push("", "■ 레퍼런스(이 느낌으로)", d.mainRef.url || "");
    return L.filter(x => x != null).join("\n").replace(/\[확인\s*필요[:：]?\s*([^\]]*)\]/g, "($1)"); };
  function renderShootTab(plan, p) {
    const d = shootData(plan, p); const items = (d.PP.items || []).length ? d.PP.items : (d.B.prep || []);
    const head = kvRows([["이 영상은", phHtml(d.S.core_message || plan.one_line || plan.title || "")], ["의상", phHtml(d.PP.wear || "")], ["촬영 배경", phHtml(d.PP.location || "")], ["준비물", items.length ? `<ul class="${items.length >= 4 ? "pv-cols" : ""}">${liList(items)}</ul>` : ""], ["필수 인서트", (d.S.must_inserts || []).length ? `<ul class="${d.S.must_inserts.length >= 4 ? "pv-cols" : ""}">${liList(d.S.must_inserts)}</ul>` : ""], ["촬영 순서", (d.PP.order || []).length ? `<ol>${liList(d.PP.order)}</ol>` : ""]]);
    const rows = d.rows.map(r => `<tr class="p-${esc(r.part === "훅" ? "기" : (r.part || ""))}"><td class="c-no"><b>${esc(r.no)}</b><span>${esc(secTxt(r.sec))}초</span></td><td class="c-sk">${r.sketch ? `<img src="${esc(r.sketch)}" loading="lazy" alt="${esc(r.no)}번 장면 그림">` : ""}</td><td>${phHtml(r.screen)}</td><td class="c-sub">${esc(r.how)}${cLine("폰", esc(r.camera))}</td><td class="c-say"><div>${phHtml(r.say)}</div>${cLine("자막", phHtml(r.caption))}</td></tr>`).join("");
    const tips = [...(d.B.tips || []), ...((d.C.fact_check || []).map(x => "확인 · " + x))];
    return `<section class="pv-card"><div class="pv-h"><h2>촬영 외주서</h2><span>촬영하는 사람에게 이 화면을 그대로 보내세요</span><div class="pv-h-right"><button class="pv-btn primary" onclick="copyText(shootText(),'촬영 외주서를 복사했어요 — 촬영자에게 붙여넣으세요')">텍스트로 복사</button><button class="pv-btn" onclick="window.print()">인쇄·PDF</button></div></div><table class="pv-kv">${head}</table></section>
      <section class="pv-card"><div class="pv-h"><h2>장면별 촬영표</h2><span>장면마다 2번씩 · 대사는 출연자가 말하는 그대로</span></div>
        <div class="pv-scroll"><table class="pv-grid pv-shoot"><colgroup><col style="width:86px"><col style="width:108px"><col style="width:22%"><col style="width:33%"><col></colgroup><thead><tr><th>#</th><th>그림</th><th>화면</th><th>찍는 법 · 폰 세팅</th><th>대사 · 자막</th></tr></thead><tbody>${rows}</tbody></table></div></section>
      ${tips.length ? `<section class="pv-card warn"><div class="pv-h"><h2>촬영할 때 주의</h2></div><ul class="pv-list">${liList(tips)}</ul></section>` : ""}
      ${d.mainRef ? `<section class="pv-card"><div class="pv-h"><h2>레퍼런스</h2><span>이 영상의 느낌·구도로 찍어 주세요</span></div><div class="pv-ref">${d.mainRef.thumbnail ? `<img src="${esc(d.mainRef.thumbnail)}" onerror="this.style.visibility='hidden'">` : ""}<div><div class="pv-ref-name">@${esc(d.mainRef.account || "")}${d.mainRef.views ? ` <span class="pv-muted">▶ ${fmt(d.mainRef.views)}</span>` : ""}</div><div class="pv-toolrow"><a class="pv-btn" href="${esc(d.mainRef.url || "#")}" target="_blank" rel="noopener">원본 영상 ↗</a></div></div></div></section>` : ""}`;
  }

  // ---------- k) 내 훅 리스트에서 고르기 + (관리자) 훅 리스트 편집
  let HOOKDB = null, HOOKTYPE = 0;
  window.openHookPicker = async (pid) => { try { HOOKDB = await api("/api/hooks"); } catch (e) { return toast("훅 리스트를 못 불러왔어요: " + e.message); } HOOKTYPE = 0; drawHookPicker(pid); };
  function drawHookPicker(pid) {
    const T = (HOOKDB.types || []); const t = T[HOOKTYPE] || { groups: [] }; const admin = document.body.classList.contains("admin");
    $("#modal").className = "modal on hookmodal"; $("#mask").classList.add("on");
    $("#modal").innerHTML = `<button class="x" onclick="closeAll()">✕</button><div class="hp"><div class="hp-head"><h2>${esc(HOOKDB.title || "훅 리스트")} <small>${T.reduce((n, x) => n + x.groups.reduce((m, g) => m + g.items.length, 0), 0)}개</small></h2><p class="muted">${pid ? "템플릿을 누르면 [빈칸]을 이 기획안에 맞게 채워서 첫 문장으로 바로 적용합니다 (10초 안팎)." : "둘러보기 — 마음에 드는 템플릿을 누르면 복사돼요. 기획안이 나오면 '내 훅 리스트 300개에서 직접 고르기'로 바로 적용할 수 있어요."}</p>${admin ? `<button class="btn small" onclick="openHookEditor('${esc(pid)}')">훅 리스트 편집 (관리자)</button>` : ""}</div>
      <div class="hp-types">${T.map((x, i) => `<button class="${i === HOOKTYPE ? "on" : ""}" onclick="hookType(${i}, '${esc(pid)}')">${i + 1}. ${esc(x.name)}</button>`).join("")}</div>
      <div class="hp-desc"><b>${esc(t.name || "")}</b> — ${esc(t.tagline || "")}<div class="muted">${esc(t.desc || "")}</div></div>
      <div class="hp-groups">${(t.groups || []).map(g => `<div class="hp-group"><small>${esc(g.name)}</small>${g.items.map(x => `<button class="hp-item" onclick="${pid ? `pickHookTemplate('${esc(pid)}', ${JSON.stringify(t.name).replace(/"/g, "&quot;")}, ${JSON.stringify(x).replace(/"/g, "&quot;")})` : `copyText(${JSON.stringify(x).replace(/"/g, "&quot;")}, '훅 템플릿을 복사했어요')`}">${esc(x)}</button>`).join("")}</div>`).join("")}</div></div>`;
  }
  window.hookType = (i, pid) => { HOOKTYPE = i; drawHookPicker(pid); };
  window.pickHookTemplate = async (pid, type, tpl) => { closeAll(); showWait("훅을 내 기획안에 맞게 채우는 중", 12, tpl); try { const r = await post("/api/plans/" + pid + "/hook_from", { template: tpl, type }); if (r.error) throw new Error(r.error); CUR = r; renderPlan2(r); toast("새 첫 문장을 적용했어요"); } catch (e) { toast("실패: " + e.message); } finally { hideWait(); } };
  const hooksToText = (d) => (d.types || []).map((t, i) => `# ${i + 1}. ${t.name} — ${t.tagline || ""}\n> ${t.desc || ""}\n` + (t.groups || []).map(g => `◾ ${g.name}\n` + g.items.map(x => "- " + x).join("\n")).join("\n")).join("\n\n");
  const textToHooks = (txt) => { const types = []; let t = null, g = null;
    String(txt || "").split(/\n/).forEach(raw => { const ln = raw.trim(); if (!ln) return;
      if (ln.startsWith("#")) { const m = ln.replace(/^#+\s*/, "").replace(/^\d+\.\s*/, "").split(/\s+[—-]\s+/); t = { name: (m[0] || "").trim(), tagline: (m.slice(1).join(" — ") || "").trim(), desc: "", groups: [] }; types.push(t); g = null; }
      else if (ln.startsWith(">")) { if (t) t.desc = ln.replace(/^>\s*/, ""); }
      else if (/^[◾■▪️*]/.test(ln)) { if (!t) { t = { name: "내 훅", tagline: "", desc: "", groups: [] }; types.push(t); } g = { name: ln.replace(/^[◾■▪️*\s]+/, ""), items: [] }; t.groups.push(g); }
      else { if (!t) { t = { name: "내 훅", tagline: "", desc: "", groups: [] }; types.push(t); } if (!g) { g = { name: "기본", items: [] }; t.groups.push(g); } g.items.push(ln.replace(/^[-•\d.\s]+/, "")); } });
    return { title: "내 훅 리스트", types }; };
  window.openHookEditor = async (pid) => { if (!HOOKDB) HOOKDB = await api("/api/hooks");
    $("#modal").className = "modal on hookmodal"; $("#mask").classList.add("on");
    $("#modal").innerHTML = `<button class="x" onclick="closeAll()">✕</button><div class="hp"><div class="hp-head"><h2>훅 리스트 편집 <small>${HOOKDB.custom ? "내가 고친 목록" : "기본: 준희즘 훅 템플릿 300"}</small></h2><p class="muted">한 줄에 훅 하나. <b>#</b> 으로 시작하면 유형, <b>&gt;</b> 는 유형 설명, <b>◾</b> 는 묶음 이름, 나머지 줄은 훅입니다. 빈칸은 [주제] 처럼 대괄호로 적으세요. 저장하면 다음 기획안부터 이 목록에서 훅을 고릅니다.</p></div>
      <textarea id="hook-edit" class="wiz-input mono" style="min-height:52vh;font-size:14px;line-height:1.6">${esc(hooksToText(HOOKDB))}</textarea>
      <div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap"><button class="btn p" onclick="saveHookEditor('${esc(pid || "")}')">저장</button><button class="btn" onclick="resetHookEditor('${esc(pid || "")}')">기본 목록(준희즘 300)으로 되돌리기</button><button class="btn" onclick="${pid ? `openHookPicker('${esc(pid)}')` : "closeAll()"}">닫기</button><span id="hook-edit-msg" class="muted"></span></div></div>`; };
  window.saveHookEditor = async (pid) => { const d = textToHooks($("#hook-edit").value); const n = d.types.reduce((a, t) => a + t.groups.reduce((b, g) => b + g.items.length, 0), 0); if (!n) return toast("훅이 하나도 없어요");
    try { const r = await post("/api/hooks", d); if (r.error) throw new Error(r.error); HOOKDB = await api("/api/hooks"); toast(`훅 ${r.count}개를 저장했어요`); if (pid) drawHookPicker(pid); else closeAll(); } catch (e) { toast("저장 실패: " + e.message); } };
  window.resetHookEditor = async (pid) => { if (!confirm("내가 고친 목록을 지우고 기본 목록으로 되돌릴까요?")) return; try { await post("/api/hooks", { reset: true }); HOOKDB = await api("/api/hooks"); toast("기본 목록으로 되돌렸어요"); openHookEditor(pid); } catch (e) { toast(e.message); } };

  // ---------------- 레퍼런스 뜯어보기(9/17 개편): 요약 4칸 · 왜 터졌나 · 후킹 분석 · 컷별 표 · 더 자세히
  const INS = {}; let INS_T = null;
  const kv = (label, val) => val ? `<div class="kv2"><small>${esc(label)}</small><div>${val}</div></div>` : "";
  function insRerender(pid) { if (CUR && CUR.id === pid && TAB === "refs") renderPlan2(CUR); }
  function insWatch(pid) {
    if (INS_T) return;
    INS_T = setInterval(async () => {
      const ids = Object.keys(INS).filter(k => (INS[k] || {}).status === "making");
      if (!ids.length || TAB !== "refs" || !CUR || CUR.id !== pid) { clearInterval(INS_T); INS_T = null; return; }
      for (const id of ids) { try { const x = await api("/api/refs/" + id + "/insight"); if (x.status !== "making") { INS[id] = x; insRerender(pid); } else INS[id] = x; } catch (e) {} }
    }, 5000);
  }
  window.insStart = async (id) => { if (STATIC) return toast("체험판에서는 AI 분석이 안 돼요"); INS[id] = { status: "making", elapsed: 0 }; insRerender(CUR && CUR.id); try { const x = await post("/api/refs/" + id + "/insight", {}); INS[id] = x; } catch (e) { INS[id] = { status: "error", error: e.message }; } insRerender(CUR && CUR.id); insWatch(CUR && CUR.id); };
  const musicShort = (m) => { const t = String(m || "").replace(/\s*\(음원 미표기\)/, ""); if (!t) return "-"; if (/없음/.test(t) && !/있음/.test(t)) return "없음"; return t.replace(/^배경음악 있음\s*—?\s*/, "있음 · "); };
  const secR = (a, b) => `${Number(a || 0).toFixed(1).replace(/\.0$/, "")}~${Number(b || 0).toFixed(1).replace(/\.0$/, "")}초`;
  function renderRefsTab(p) {
    const refs = p.refs || []; if (!refs.length) return '<div class="pv-muted">레퍼런스가 없어요</div>';
    const mainIdx = Math.min(refs.length - 1, Math.max(0, Number((p.plan || {}).main_ref || 1) - 1));
    refs.forEach((r, i) => { if (!r.id || INS[r.id] !== undefined) return; INS[r.id] = { status: "loading" };
      api("/api/refs/" + r.id + "/insight").then(x => { INS[r.id] = x; if (x.status === "none" && i === mainIdx && !STATIC && ((r.analysis || {}).timeline || []).length) return insStart(r.id); if (x.status === "making") insWatch(p.id); insRerender(p.id); }).catch(() => { INS[r.id] = { status: "none" }; }); });
    const order = refs.map((r, i) => i).sort((a, b) => (a === mainIdx ? -1 : b === mainIdx ? 1 : a - b));
    return `<div class="rf">${order.map(i => refBlock(p, refs[i], i, i === mainIdx)).join("")}</div>`;
  }
  function refBlock(p, r, i, isMain) {
    const an = r.analysis || {}; const tl = an.timeline || []; const ins = INS[r.id] || {}; const done = ins.status === "done"; const A = (((p.plan || {}).A_refs) || []).find(x => x.ref === i + 1);
    const insCut = (no) => ((done && ins.cuts) || []).find(c => String(c.no) === String(no)) || {};
    const facts = [["길이", an.duration ? `${an.duration}초` : "-"], ["컷", an.shots ? `${an.shots}개 · 평균 ${an.avg_shot}초` : "-"], ["배경음악", esc(musicShort(an.music))], ["효과음", (an.sfx || []).length ? `${an.sfx.length}곳 · ${esc([...new Set(an.sfx.map(e => e.name).filter(Boolean))].slice(0, 3).join(", "))}` : "없음"]];
    const waitBox = (what) => ins.status === "making" || ins.status === "loading" ? `<div class="rf-wait"><b>AI가 이 릴스를 뜯어보는 중이에요</b> ${ins.elapsed ? `(${fmtDur(ins.elapsed)} 지남 · ` : "("}1분 안팎) — 다른 탭을 봐도 계속 만들어져요. ${what}</div>`
      : ins.status === "error" ? `<div class="rf-wait err"><b>분석하지 못했어요</b> ${esc(ins.error || "")} <button class="pv-btn small" onclick="insStart(${Number(r.id)})">다시 시도</button></div>`
      : !tl.length ? `<div class="rf-wait">아직 영상 분석(컷·자막) 전인 릴스예요. 기획안을 이 릴스로 만들면 자동으로 뜯어봐요.</div>`
      : `<div class="rf-wait"><button class="pv-btn primary small" onclick="insStart(${Number(r.id)})">AI로 자세히 뜯어보기 (1분 안팎)</button> ${what}</div>`;
    const why = done && (ins.why || []).length ? `<table class="pv-kv rf-why">${ins.why.map((w, k) => `<tr><th><i class="pv-no">${k + 1}</i>${esc(w.title)}</th><td>${esc(w.detail)}</td></tr>`).join("")}</table>`
      : (A && (A.why_it_worked || []).length ? `<ul class="pv-list">${A.why_it_worked.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "") + waitBox("왜 터졌는지 몇 초에 무엇을 했는지로 풀어 드려요.");
    const hk = ins.hook || {};
    const hook = done ? `<div class="rf-hook-sum">${hk.type ? `<span class="tag hk">훅 · ${esc(hk.type)}</span>` : ""}<b>${esc(hk.summary || "")}</b></div>
      ${(hk.elements || []).length ? `<div class="pv-scroll"><table class="pv-grid rf-hook"><colgroup><col style="width:96px"><col style="width:84px"><col><col style="width:38%"></colgroup><thead><tr><th>시간</th><th>요소</th><th>실제로 한 것</th><th>왜 멈추게 하나</th></tr></thead><tbody>${hk.elements.map(e => `<tr><td class="rf-t">${esc(e.t)}</td><td><b>${esc(e.kind)}</b></td><td>${esc(e.what)}</td><td class="c-sub">${esc(e.effect)}</td></tr>`).join("")}</tbody></table></div>` : ""}
      ${hk.apply || (ins.steal || []).length || (ins.avoid || []).length ? `<table class="pv-kv" style="margin-top:10px">${kvRows([["내 영상에 옮기기", esc(hk.apply || "")], ["가져올 것", (ins.steal || []).length ? `<ul>${ins.steal.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""], ["따라 하지 말 것", (ins.avoid || []).length ? `<ul>${ins.avoid.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""]])}</table>` : ""}`
      : (A && A.hook_line ? `<table class="pv-kv">${kvRows([["첫 문장", `<b>${esc(A.hook_line)}</b>`], ["구조", esc(A.structure || "")]])}</table>` : "") + (ins.status === "making" || ins.status === "loading" ? "" : "");
    const rows = tl.map(x => { const c = insCut(x.no); const caps = x.captions || []; const txt = caps.map(k => k.text).filter(Boolean).join(" / "); const look = [...new Set(caps.map(k => [k.pos, k.size].filter(Boolean).join("·")).filter(Boolean))].join(", ");
      const edit = c.edit || (x.transition && x.transition !== "컷" ? x.transition : "그냥 컷"); const sfx = (x.sfx || []).map(e => `${esc(e.name || "효과음")} <span class="pv-muted">${e.t}초</span>`).join("<br>");
      return `<tr><td class="c-no"><b>${esc(x.no)}</b><span>${secR(x.t0, x.t1)}</span></td><td class="rf-img">${(x.frames || [])[0] ? `<img src="${esc(x.frames[0])}" loading="lazy" onerror="this.style.visibility='hidden'">` : ""}</td><td>${esc(edit)}</td>
        <td>${txt ? `<div class="rf-txt">${esc(txt.length > 70 ? txt.slice(0, 70) + "…" : txt)}</div>` : '<span class="pv-muted">글자 없음</span>'}${c.text_look || look ? `<div class="pv-muted" style="margin-top:4px">${esc(c.text_look || look)}</div>` : ""}</td>
        <td>${c.font ? esc(c.font) : txt ? `<span class="pv-muted">${done ? "-" : "분석 중"}</span>` : ""}</td><td>${sfx || '<span class="pv-muted">-</span>'}</td></tr>`; }).join("");
    const cutTable = tl.length ? `<div class="pv-scroll"><table class="pv-grid rf-cuts"><colgroup><col style="width:92px"><col style="width:74px"><col style="width:17%"><col><col style="width:22%"><col style="width:13%"></colgroup><thead><tr><th>#</th><th>화면</th><th>컷 편집</th><th>텍스트 · 배치</th><th>폰트 <small>(비슷한 캡컷 폰트 추정)</small></th><th>효과음</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="pv-muted" style="margin:8px 0 0">컷 시간·자막 위치·효과음은 영상에서 자동으로 잰 값이에요. 폰트는 화면을 보고 비슷한 캡컷 폰트를 추정한 거라 이름이 다를 수 있어요.</p>` : `<div class="pv-muted">영상 분석 전이라 컷별 표가 없어요.</div>`;
    const frames = r.frames || []; const d = an.delivery || {};
    const more = `<details class="pv-details rf-more"><summary>더 자세히 보기 — 컷별 전체 자막 · 대사 받아쓰기 · 말투 · 프레임 전체</summary>
      ${tl.some(x => (x.captions || []).length || x.script) ? `<div class="pv-scroll" style="margin-top:8px"><table class="pv-grid"><colgroup><col style="width:92px"><col><col style="width:30%"></colgroup><thead><tr><th>#</th><th>화면 글자 전체</th><th>대사</th></tr></thead><tbody>${tl.map(x => `<tr><td class="c-no"><b>${esc(x.no)}</b><span>${secR(x.t0, x.t1)}</span></td><td>${(x.captions || []).map(k => `<div>${esc(k.text)} <span class="pv-muted">${esc([k.pos, k.size].filter(Boolean).join("·"))}</span></div>`).join("") || '<span class="pv-muted">-</span>'}</td><td>${esc(x.script || "") || '<span class="pv-muted">-</span>'}</td></tr>`).join("")}</tbody></table></div>` : ""}
      ${an.speech && an.speech.length ? `<div class="pv-scroll" style="margin-top:10px"><table class="pv-grid"><thead><tr><th>초</th><th>대사</th><th>속도</th><th>어미</th><th>앞 쉼</th><th>힘준 단어</th></tr></thead><tbody>${an.speech.map(sp => `<tr><td>${sp.t}</td><td>${esc(sp.text)}</td><td>${esc(sp.speed)}</td><td>${esc(sp.ending)}</td><td>${sp.pause_before}s</td><td>${(sp.emphasis || []).map(esc).join(", ")}</td></tr>`).join("")}</tbody></table></div>` : `<p class="pv-muted">말투: ${esc([d.tone, d.speed].filter(x => x && x !== "-").join(" · ") || "대사 없음")}</p>`}
      ${frames.length ? `<div class="filmstrip" style="margin-top:10px">${frames.map(f => `<img src="${esc(f.path)}" title="${f.t}s" loading="lazy">`).join("")}</div>` : ""}
      ${A ? `<table class="pv-kv" style="margin-top:10px">${kvRows([["구조", esc(A.structure || "")], ["말투", esc(A.speech_style || "")], ["편집", esc(A.edit_style || "")]])}</table>` : ""}</details>`;
    return `<section class="pv-card rf-card"><div class="rf-head">${r.thumbnail ? `<img src="${esc(r.thumbnail)}" onerror="imgRetry(this)">` : ""}<div class="rf-id"><div class="rf-kicker">${isMain ? "주 레퍼런스 · 대본을 이 릴스에 맞췄어요" : "보조 레퍼런스 · 훅·편집만 참고"}</div><div class="rf-name">@${esc(r.account || "")} <a class="pv-btn small" href="${esc(r.url || "#")}" target="_blank" rel="noopener">원본 ↗</a><button class="pv-btn small" onclick="boxSaveInsight(${Number(r.id)})">분석 담기</button></div>
        <div class="pv-muted">${[r.views ? "▶ 조회수 " + fmt(r.views) : "", r.likes ? "❤ " + fmt(r.likes) : "", r.posted_at || "", r.industry || ""].filter(Boolean).map(esc).join(" · ")}</div>${done && ins.one_line ? `<div class="rf-one">${esc(ins.one_line)}</div>` : ""}</div></div>
      <div class="pv-info">${facts.map(([k, v]) => `<div class="pv-cell"><span>${k}</span><b>${v}</b></div>`).join("")}</div>
      <div class="rf-sec"><h3>왜 터졌나</h3>${why}</div>
      ${done || A ? `<div class="rf-sec"><h3>후킹 분석 <small>첫 3초에 어떤 요소로 붙잡았나</small></h3>${hook}</div>` : ""}
      <div class="rf-sec"><h3>컷별로 뜯어보기 <small>${tl.length}컷</small></h3>${cutTable}</div>
      ${more}</section>`;
  }
  const BRIEF_ST = {}; let BRIEF_T = null;
  function briefWatch(pid) { if (BRIEF_T) return;
    BRIEF_T = setInterval(async () => { if (!CUR || CUR.id !== pid) { clearInterval(BRIEF_T); BRIEF_T = null; return; }
      try { const st = await api("/api/plans/" + pid + "/brief_status"); BRIEF_ST[pid] = st;
        if (st.status === "done") { clearInterval(BRIEF_T); BRIEF_T = null; delete BRIEF_ST[pid]; CUR = await api("/api/plans/" + pid); if (TAB === "pro") renderPlan2(CUR); else toast("편집 외주서가 완성됐어요 — '편집 외주용' 탭에서 보세요"); }
        else if (st.status !== "making") { clearInterval(BRIEF_T); BRIEF_T = null; if (TAB === "pro") renderPlan2(CUR); }
        else { const e = $("#brief-wait-sec"); if (e) e.textContent = fmtDur(st.elapsed || 0); } } catch (e) {} }, 3000); }
  window.briefStart = async (pid) => { BRIEF_ST[pid] = { status: "making", elapsed: 0 }; if (TAB === "pro") renderPlan2(CUR);
    try { const st = await post("/api/plans/" + pid + "/edit_brief", { async: true }); if (st.error && !st.status) throw new Error(st.error); BRIEF_ST[pid] = st; } catch (e) { BRIEF_ST[pid] = { status: "error", error: e.message }; }
    if (TAB === "pro") renderPlan2(CUR); if ((BRIEF_ST[pid] || {}).status === "making") briefWatch(pid); };
  function renderProTab(plan, p) {
    const eb = (plan.pro || {}).edit_brief; const pro = plan.pro || {}; const bs = BRIEF_ST[p.id];
    const waitBox = `<section class="pv-card brief-wait"><div class="pv-h"><h2>편집 외주서 만드는 중</h2><span>약 40초 · <b id="brief-wait-sec">${fmtDur((bs || {}).elapsed || 0)}</b> 지남</span></div><p>장면표를 바탕으로 폰트·효과음·컷·전환·색감·납품 규격까지, 편집자에게 그대로 넘길 문서를 쓰고 있어요. <b>다른 탭을 봐도 계속 만들어지고</b>, 다 되면 알려드려요.</p><div class="mk-bar"><i style="width:${Math.min(95, Math.round(100 * ((bs || {}).elapsed || 0) / 45) + 6)}%"></i></div></section>`;
    if (bs && bs.status === "making") { briefWatch(p.id); return waitBox; }
    if (!eb) {
      if (bs && bs.status === "error") return `<div class="panel warn"><b>편집 외주서를 만들지 못했어요.</b> ${esc(bs.error || "")}<div style="margin-top:8px"><button class="btn p" onclick="briefStart('${esc(p.id)}')">다시 시도</button></div></div>`;
      if (STATIC) return `<div class="panel warn">체험판에서는 편집 외주서를 만들 수 없어요.</div>`;
      BRIEF_ST[p.id] = { status: "making", elapsed: 0 }; setTimeout(() => briefStart(p.id), 0);          // 탭을 열면 바로 만들기 시작
      return waitBox; }
    const f = eb.fonts || {}; const m = f.main || {}; const ac = f.accent || {}; const sd = eb.sound || {}; const bg = sd.bgm || {}; const dv = eb.deliverable || {}; const col = eb.color || {}; const pc = eb.pacing || {}; const en = eb.ending || {};
    const stale = p.edited_at && eb.made_at && p.edited_at > eb.made_at;
    const tk = (() => { try { return localStorage.getItem("hc_token") || ""; } catch (e) { return ""; } })(); const q = tk ? "?t=" + encodeURIComponent(tk) : "";
    return `${stale ? `<div class="panel warn" style="margin-bottom:10px">기획안을 고친 뒤라 편집 외주서가 옛 내용일 수 있어요. <button class="btn small p" onclick="briefStart('${esc(p.id)}')">지금 기획안 기준으로 다시 만들기</button></div>` : ""}
      <div class="brief-bar"><div><div class="ph-kicker">편집 외주서 <small>편집자에게 이 문서를 그대로 보내면 됩니다</small></div><div class="brief-summary">${esc(eb.summary || "")}</div></div><div class="row" style="gap:6px;flex-wrap:wrap;justify-content:flex-end"><a class="btn p" href="/api/plans/${esc(p.id)}/brief.pdf${q}">PDF로 받기</a><button class="btn" onclick="copyText(briefText(),'편집 외주서를 복사했어요 — 편집자에게 붙여넣으세요')">텍스트 복사</button><button class="btn" onclick="if(confirm('편집 외주서를 지금 기획안 기준으로 다시 만들까요? (40초 안팎)'))briefStart('${esc(p.id)}')">다시 만들기</button></div></div>
      <iframe class="brief-doc" src="/api/plans/${esc(p.id)}/brief.html${q}${q ? "&" : "?"}v=${Date.now()}" onload="try{this.style.height=(this.contentDocument.documentElement.scrollHeight+24)+'px'}catch(e){}"></iframe>`;
  }
  window.briefText = () => { const eb = ((CUR.plan || {}).pro || {}).edit_brief || {}; const A = (v) => Array.isArray(v) ? v : (v ? [v] : []); const o = (v) => (v && typeof v === "object") ? v : {};
    const f = o(eb.fonts), sd = o(eb.sound), dv = o(eb.deliverable), bg = o(sd.bgm), mf = o(f.main), af = o(f.accent), col = o(eb.color), pc = o(eb.pacing);
    const L = [`[편집 외주서] ${(CUR.plan || {}).title || ""}`, eb.summary || "", "", `■ 납품: ${[dv.ratio, dv.fps && dv.fps + "fps", dv.length, dv.export, dv.safe_zone].filter(Boolean).join(" / ") || "-"}`,
      `■ 폰트: 메인 ${mf.name || "-"}${[mf.size, mf.color, mf.stroke && "외곽선 " + mf.stroke, mf.position].filter(Boolean).length ? " (" + [mf.size, mf.color, mf.stroke && "외곽선 " + mf.stroke, mf.position].filter(Boolean).join(", ") + ")" : ""} · 강조 ${af.name || "-"} ${af.color || ""}`, ...A(f.rules).map(x => " - " + x),
      `■ 배경음악: ${[bg.mood, A(bg.capcut_search).length ? "캡컷 검색 " + A(bg.capcut_search).join(", ") : "", bg.volume].filter(Boolean).join(" / ") || "-"}`];
    const sfx = A(sd.sfx).map(o).filter(x => x.name); if (sfx.length) { L.push("■ 효과음"); sfx.forEach(x => L.push(` - ${x.t != null && x.t !== "" ? x.t + "초 " : ""}${x.scene ? x.scene + "번 장면 " : ""}${x.name}${x.why ? " (" + x.why + ")" : ""}`)); }
    L.push(`■ 색감: ${[col.look, col.capcut].filter(Boolean).join(" / ") || "-"}`, `■ 속도: ${[pc.cut_rule, pc.transitions, pc.speed].filter(Boolean).join(" / ") || "-"}`, "", "■ 장면별 편집");
    A(eb.scenes).map(o).forEach(x => L.push(`${x.no || ""}) ${x.sec || ""}초` + [x.cut && " 컷: " + x.cut, x.text && " | 자막: " + x.text, x.transition && " | 전환: " + x.transition, x.sfx && " | 효과음: " + x.sfx, x.effect && " | 효과: " + x.effect, x.broll && " | 인서트: " + x.broll, x.note && " | 주의: " + x.note].filter(Boolean).join("")));
    if (A(eb.checklist).length) { L.push("", "■ 납품 전 확인"); A(eb.checklist).forEach(x => L.push(" - " + x)); }
    return L.join("\n").replace(/\[확인\s*필요[:：]?\s*([^\]]*)\]/g, "($1)"); };
  window.makeBrief = async (pid) => { showWait("편집 외주서 쓰는 중", 90, "폰트·효과음·컷·전환·색감·납품 규격을 정리하고 있어요"); try { const r = await post("/api/plans/" + pid + "/edit_brief", {}); if (r.error) throw new Error(r.error); CUR = r; TAB = "pro"; renderPlan2(r); } catch (e) { toast("실패: " + e.message); } finally { hideWait(); } };
  window.humanize = async (pid) => { const tone = prompt("내 말투를 적어주세요 (예: 존댓말, 담백하게, '아니 여러분'으로 가끔 시작 / 반말, 텐션 높게). 비워도 돼요", ((CUR.brief || {}).tone) || ""); if (tone === null) return; showWait("말투 다듬는 중", 60, "대사·훅·CTA·캡션을 사람 말로 바꾸고 있어요"); try { const r = await post("/api/plans/" + pid + "/humanize", { tone }); if (r.error) throw new Error(r.error); CUR = r; renderPlan2(r); toast("말투를 다듬었어요"); } catch (e) { toast("실패: " + e.message); } finally { hideWait(); } };

  window.savePlanJson = async function (pid) {
    let j; try { j = JSON.parse($("#plan-json").value); } catch (e) { return toast("JSON 형식이 아니에요"); }
    await post("/api/plans/" + pid + "/save", { plan: j }); CUR = await api("/api/plans/" + pid); TAB = "plan"; renderPlan2(CUR);
  };

  // ---------------- 기획 홈 (보관함 + 시작)
  const STAGES = ["기획 중", "촬영 예정", "촬영 완료", "편집 중", "올림"];
  let PF = { folder: "전체", stage: "", all: false }; let PSEL = false; const SEL = new Set(); let SHOWN = []; let TRASH_N = 0;
  function planListHtml(plans) {
    const folders = [...new Set(plans.map(p => p.folder).filter(Boolean))].sort(); const admin = document.body.classList.contains("admin");
    const clientsL = [...new Set(plans.map(p => p.client).filter(Boolean))].sort();
    const shown = SHOWN = plans.filter(p => (!PF.client || p.client === PF.client)).filter(p => (PF.folder === "전체" || (PF.folder === "(폴더 없음)" ? !p.folder : p.folder === PF.folder)) && (!PF.stage || (p.stage || "기획 중") === PF.stage));
    const cnt = (f) => plans.filter(p => f === "전체" ? true : f === "(폴더 없음)" ? !p.folder : p.folder === f).length;
    return `<div class="plan-toolbar" style="margin-bottom:10px"><h2 style="margin:0">내 기획 <small>${plans.length}개</small></h2><div class="row" style="gap:6px;flex-wrap:wrap">${clientsL.length > 1 ? `<select class="chip" onchange="PF_set('client', this.value)"><option value="">클라이언트: 전체</option>${clientsL.map(c => `<option ${PF.client === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select>` : ""}<select class="chip" onchange="PF_set('stage', this.value)"><option value="">진행 단계: 전체</option>${STAGES.map(s => `<option ${PF.stage === s ? "selected" : ""}>${s}</option>`).join("")}</select><button class="btn small" onclick="newFolder()">+ 새 폴더</button><button class="btn small ${PSEL ? "p" : ""}" onclick="planSelMode()">${PSEL ? "정리 끝내기" : "여러 개 정리하기"}</button><a class="btn small" href="#/plan/box">내 저장소</a><a class="btn small" href="#/plan/trash">휴지통${TRASH_N ? " " + TRASH_N : ""}</a>${admin ? `<button class="btn small" onclick="PF_set('all', ${PF.all ? "false" : "true"})">${PF.all ? "내 기획안만 보기" : "모든 사용자 기획안 보기"}</button>` : ""}</div></div>
      ${PSEL ? `<div class="sel-bar"><b>${SEL.size}개 선택</b><span class="muted">카드를 눌러 고르세요</span><button class="pv-btn small" onclick="planSelAll()">보이는 ${shown.length}개 전체 선택</button><button class="pv-btn small" onclick="planSelClear()">선택 해제</button><button class="pv-btn small danger" onclick="planSelTrash()" ${SEL.size ? "" : "disabled"}>선택한 ${SEL.size}개 휴지통으로</button></div>` : ""}
      <div class="rcats" style="margin-bottom:10px"><button class="rcat ${PF.folder === "전체" ? "on" : ""}" onclick="PF_set('folder','전체')">전체 ${cnt("전체")}</button>${folders.map(f => `<button class="rcat ${PF.folder === f ? "on" : ""}" onclick="PF_set('folder',${JSON.stringify(f).replace(/"/g, "&quot;")})">${esc(f)} ${cnt(f)}</button>`).join("")}${folders.length ? `<button class="rcat ${PF.folder === "(폴더 없음)" ? "on" : ""}" onclick="PF_set('folder','(폴더 없음)')">폴더 없음 ${cnt("(폴더 없음)")}</button>` : ""}</div>
      ${shown.length ? `<div class="plangrid">${shown.map(p => { const on = SEL.has(p.id); const open = PSEL ? `planSelToggle('${p.id}')` : `location.hash='#/plan/${p.id}'`; return `<div class="plancard ${PSEL ? "selmode" : ""} ${on ? "sel" : ""}"><div class="pc-cover" onclick="${open}">${PSEL ? `<span class="pc-check">${on ? "✓" : ""}</span>` : ""}${p.cover ? `<img src="${esc(p.cover)}" onerror="imgRetry(this)">` : ""}<span class="pc-state ${p.status === "done" ? "ok" : ""}">${p.status === "done" ? "완성" : "프롬프트만"}</span></div><div class="pc-body"><b onclick="${open}" style="cursor:pointer">${esc(p.title || "(제목 없음)")}</b><div class="muted">${p.set_id ? "세트 · " : ""}${esc(p.job || "")} · ${esc(p.created_at || "")}${PF.all && p.user_id ? ` · 사용자 ${p.user_id}` : ""}</div>
        ${PSEL ? "" : `<div class="pc-meta"><select class="chip stage-${STAGES.indexOf(p.stage || "기획 중")}" onchange="setPlanMeta('${p.id}', {stage: this.value})">${STAGES.map(s => `<option ${(p.stage || "기획 중") === s ? "selected" : ""}>${s}</option>`).join("")}</select><select class="chip" onchange="if(this.value==='__new'){newFolder('${p.id}')}else{setPlanMeta('${p.id}', {folder: this.value})}"><option value="" ${!p.folder ? "selected" : ""}>폴더 없음</option>${folders.map(f => `<option ${p.folder === f ? "selected" : ""}>${esc(f)}</option>`).join("")}<option value="__new">+ 새 폴더로…</option></select><button class="pc-trash" onclick="cardTrash('${p.id}')" title="휴지통으로 옮기기">휴지통</button></div>
          <div class="pc-dates"><label>촬영<input type="date" value="${esc(p.shoot_date || "")}" onchange="setPlanMetaQuiet('${p.id}', {shoot_date: this.value})"></label><label>마감<input type="date" value="${esc(p.due_date || "")}" onchange="setPlanMetaQuiet('${p.id}', {due_date: this.value})"></label>${p.confirm ? `<span class="pc-conf ${p.confirm === "ok" ? "ok" : "rv"}">${p.confirm === "ok" ? "사장님 확인" : "수정 요청"}</span>` : ""}</div>`}</div></div>`; }).join("")}</div>` : `<div class="empty"><b>${plans.length ? "이 조건에 맞는 기획이 없어요" : "아직 만든 기획이 없어요"}</b>${plans.length ? "" : "새 기획 만들기로 첫 기획안을 만들어보세요."}</div>`}`;
  }
  window.cardTrash = async (id) => { if (!confirm("이 기획안을 휴지통으로 옮길까요? 휴지통에서 다시 살릴 수 있어요.")) return; try { const r = await post("/api/plans/" + id + "/delete", {}); if (r.error) throw new Error(r.error); toast("휴지통으로 옮겼어요"); viewPlanHome(); } catch (e) { toast("실패: " + e.message); } };
  window.planSelMode = () => { PSEL = !PSEL; SEL.clear(); viewPlanHome(); };
  window.planSelToggle = (id) => { if (SEL.has(id)) SEL.delete(id); else SEL.add(id); viewPlanHome(true); };
  window.planSelAll = () => { SHOWN.forEach(p => SEL.add(p.id)); viewPlanHome(true); };
  window.planSelClear = () => { SEL.clear(); viewPlanHome(true); };
  window.planSelTrash = async () => { if (!SEL.size) return; if (!confirm(`선택한 ${SEL.size}개를 휴지통으로 옮길까요? 휴지통에서 다시 살릴 수 있어요.`)) return;
    try { const r = await post("/api/plans_bulk/delete", { ids: [...SEL] }); if (r.error) throw new Error(r.error); toast(`${(r.trashed || []).length}개를 휴지통으로 옮겼어요`); SEL.clear(); PSEL = false; viewPlanHome(); } catch (e) { toast("실패: " + e.message); } };
  const boxCtx = () => ({ brief: { ...brief(), topic: "" }, refs: (W.refs || []).map(id => { const x = (W.refsCache || []).find(y => y.id === id) || { id }; return { id: x.id, account: x.account, thumbnail: x.thumbnail, views: x.views, likes: x.likes, description: x.description, url: x.url, duration: x.duration }; }), speed: W.speed === "precise" ? "precise" : "fast" });
  window.boxSaveTopic = async (i) => { const x = (W.topics || [])[i]; if (!x) return; try { const r = await post("/api/box", { kind: "topic", title: x.title, data: { why: x.why || "", hook_type: x.hook_type || "", ctx: boxCtx() } }); if (r.error) throw new Error(r.error); toast(r.dup ? "이미 담아 둔 주제예요" : "내 저장소에 담았어요 — 콘텐츠 기획 › 내 저장소"); } catch (e) { toast("담지 못했어요: " + e.message); } };
  const boxPut = async (kind, title, data, msg) => { try { const r = await post("/api/box", { kind, title, data }); if (r.error) throw new Error(r.error); toast(r.dup ? "이미 담아 둔 거예요" : (msg || "내 저장소에 담았어요")); } catch (e) { toast("담지 못했어요: " + e.message); } };
  window.boxSaveHook = (i) => { const h = ((((CUR || {}).plan || {}).B_plan || {}).hooks || [])[i]; if (!h || !h.line) return; boxPut("hook", plainT(h.line), { type: h.type || "", pattern: h.pattern || "", first_screen: h.first_screen || "", pid: CUR.id, plan: plainT((CUR.plan || {}).title || "") }, "훅을 담았어요"); };
  window.boxSaveScript = () => { const pl = (CUR || {}).plan || {}; const sc = (pl.B_plan || {}).scenes || []; if (!sc.length) return; boxPut("script", plainT(pl.title || "대본"), { pid: CUR.id, script: sc.map(x => plainT(x.say || "")).join("\n"), format: pl.format || "", length: pl.length_sec || "" }, "대본을 담았어요"); };
  window.boxSaveInsight = (rid) => { const r = ((CUR || {}).refs || []).find(x => x.id === rid); const ins = INS[rid] || {}; if (!r) return; boxPut("insight", "@" + (r.account || rid) + " — " + (ins.one_line || r.description || "레퍼런스 분석").slice(0, 120), { pid: CUR.id, ref_id: rid, url: r.url || "", thumbnail: r.thumbnail || "", hook: (ins.hook || {}).summary || "", why: (ins.why || []).map(w => w.title) }, "레퍼런스 분석을 담았어요"); };
  window.boxSaveNext = async (k) => { const p = CUR || {}; const t = ((((p.plan || {}).pro || {}).next_topics) || [])[k]; if (!t) return; const refs = (p.refs || []).map(r => ({ id: r.id, account: r.account, thumbnail: r.thumbnail, views: r.views, likes: r.likes, description: r.description, url: r.url, duration: (r.analysis || {}).duration }));
    try { const r = await post("/api/box", { kind: "topic", title: plainT(t), data: { why: "'" + plainT((p.plan || {}).title || "") + "'에 이어 찍기 좋은 주제", ctx: { brief: { ...(p.brief || {}), topic: "", set_info: undefined }, refs, speed: p.mode === "precise" ? "precise" : "fast", append: p.set_id ? { sid: p.set_id } : { pid: p.id } } } }); if (r.error) throw new Error(r.error); toast(r.dup ? "이미 담아 둔 주제예요" : "내 저장소에 담았어요"); } catch (e) { toast("담지 못했어요: " + e.message); } };
  let BOX = { items: [], refs: [], clients: [] };
  window.viewPlanBox = async function () {
    syncUser(); const basket = (typeof PLANREFS === "function" ? PLANREFS() : []);
    const [items, clients, refs] = await Promise.all([api("/api/box").catch(() => []), api("/api/clients").catch(() => []), Promise.all(basket.map(id => api("/api/items/" + id).catch(() => null)))]);
    BOX = { items: Array.isArray(items) ? items : [], clients: Array.isArray(clients) ? clients : [], refs: refs.filter(Boolean) };
    const topics = BOX.items.filter(x => x.kind === "topic");
    $("#main").innerHTML = `<div class="box"><div class="trash-head"><a class="pv-btn" href="#/plan">← 기획 목록</a><div><h1>내 저장소</h1><p class="muted">나중에 기획할 주제·릴스·클라이언트를 모아 두는 곳이에요. <b>바로 기획하기</b>를 누르면 담아 둔 내용 그대로 기획을 시작합니다.</p></div></div>
      <section class="pv-card"><div class="pv-h"><h2>담아 둔 주제</h2><span>${topics.length}개 · 주제 고르는 화면의 '담기', 기획안의 '이어 찍기 좋은 주제'에서 담을 수 있어요</span></div>
        <div class="box-add"><input id="box-memo" class="wiz-input" placeholder="떠오른 주제를 메모해 두세요 (예: 단골이 제일 많이 묻는 질문 3가지)" onkeydown="if(event.key==='Enter')boxAddMemo()"><button class="pv-btn primary" onclick="boxAddMemo()">담기</button></div>
        ${topics.length ? `<div class="pv-scroll"><table class="pv-grid box-tbl"><colgroup><col><col style="width:30%"><col style="width:110px"><col style="width:210px"></colgroup><thead><tr><th>주제</th><th>어떤 기획에서</th><th>담은 날</th><th></th></tr></thead><tbody>${topics.map(x => { const c = (x.data || {}).ctx; const b = (c || {}).brief || {}; const r0 = ((c || {}).refs || [])[0];
          return `<tr><td><b>${esc(x.title)}</b>${(x.data || {}).why ? `<div class="pv-muted">${esc(x.data.why)}</div>` : ""}</td><td class="c-sub">${c ? `${esc(b.product || b.about || "")}${r0 ? ` · @${esc(r0.account || "")} 구조` : ""}` : '<span class="pv-muted">메모 — 기획할 때 네 줄·릴스를 골라요</span>'}</td><td class="c-sub">${esc(String(x.created_at || "").slice(5, 10))}</td><td><div class="trash-act"><button class="pv-btn small primary" onclick="boxUseTopic(${x.id})">바로 기획하기</button><button class="pv-btn small danger" onclick="boxDel(${x.id})">삭제</button></div></td></tr>`; }).join("")}</tbody></table></div>` : `<div class="pv-muted" style="margin-top:10px">아직 담아 둔 주제가 없어요.</div>`}</section>
      ${[["hook", "담아 둔 훅", "기획안의 '첫 문장 고르기' 표에서 담아요"], ["script", "담아 둔 대본", "대본 칸의 '대본 담기'"], ["insight", "담아 둔 레퍼런스 분석", "레퍼런스 뜯어보기의 '분석 담기'"]].map(([k, t, d]) => { const L = BOX.items.filter(x => x.kind === k); return `<section class="pv-card"><div class="pv-h"><h2>${t}</h2><span>${L.length}개 · ${d}</span></div>${L.length ? `<div class="pv-scroll"><table class="pv-grid box-tbl"><colgroup><col><col style="width:32%"><col style="width:250px"></colgroup><tbody>${L.map(x => { const D = x.data || {}; return `<tr><td><b>${esc(x.title)}</b>${k === "script" ? `<div class="pv-muted" style="white-space:pre-line">${esc(String(D.script || "").slice(0, 160))}${String(D.script || "").length > 160 ? "…" : ""}</div>` : ""}${k === "insight" && D.hook ? `<div class="pv-muted">${esc(D.hook)}</div>` : ""}</td><td class="c-sub">${k === "hook" ? esc([D.type, D.pattern && "템플릿 · " + D.pattern].filter(Boolean).join(" · ")) : k === "script" ? esc([D.format, D.length && D.length + "초"].filter(Boolean).join(" · ")) : esc((D.why || []).slice(0, 3).join(" / "))}</td><td><div class="trash-act"><button class="pv-btn small" onclick="copyText(${JSON.stringify(k === "script" ? (D.script || x.title) : x.title).replace(/"/g, "&quot;")}, '복사했어요')">복사</button>${D.pid ? `<a class="pv-btn small" href="#/plan/${esc(D.pid)}${k === "insight" ? "/refs" : ""}">기획안 열기</a>` : ""}<button class="pv-btn small danger" onclick="boxDel(${x.id})">삭제</button></div></td></tr>`; }).join("")}</tbody></table></div>` : `<div class="pv-muted">아직 없어요.</div>`}</section>`; }).join("")}
      <section class="pv-card"><div class="pv-h"><h2>담아 둔 릴스</h2><span>${BOX.refs.length}개 · 릴스 목록에서 '기획에 담기'를 누르면 여기에 모여요 (이 브라우저에 저장)</span><div class="pv-h-right"><a class="pv-btn" href="#/reels/instagram">릴스 보러 가기</a></div></div>
        ${BOX.refs.length ? `<div class="box-refs">${BOX.refs.map(r => `<div class="box-ref"><img src="${esc(r.thumbnail || "")}" loading="lazy" onerror="imgRetry(this)" onclick="openReel(${r.id})"><div class="box-ref-b"><b>@${esc(r.account || "")}</b><span>${r.views ? "▶ " + fmt(r.views) : ""}${r.industry ? " · " + esc(r.industry) : ""}</span><p>${esc((r.description || r.caption || "").slice(0, 60))}</p><div class="trash-act"><button class="pv-btn small primary" onclick="boxUseRef(${r.id})">이 릴스로 기획하기</button><button class="pv-btn small" onclick="boxDropRef(${r.id})">빼기</button></div></div></div>`).join("")}</div>` : `<div class="pv-muted">아직 담아 둔 릴스가 없어요. 인스타그램 릴스에서 마음에 드는 영상을 열고 '기획에 담기'를 눌러 보세요.</div>`}</section>
      <section class="pv-card"><div class="pv-h"><h2>저장된 클라이언트</h2><span>${BOX.clients.length}개 · 1단계에서 '클라이언트로 저장해 두기'를 켜 두면 자동으로 쌓여요</span></div>
        ${BOX.clients.length ? `<div class="pv-scroll"><table class="pv-grid box-tbl"><colgroup><col style="width:22%"><col style="width:22%"><col><col style="width:230px"></colgroup><thead><tr><th>이름</th><th>주 상품</th><th>소구점</th><th></th></tr></thead><tbody>${BOX.clients.map(c => `<tr><td><b>${esc(c.name || "")}</b><div class="pv-muted">${esc(c.about || "")}</div></td><td class="c-sub">${esc(c.product || "")}</td><td class="c-sub">${esc(c.usp || "")}${(c.usp_qa || []).length ? `<div class="pv-muted">소구점 답변 ${c.usp_qa.length}개</div>` : ""}</td><td><div class="trash-act"><button class="pv-btn small primary" onclick="boxUseClient(${c.id})">이 클라이언트로 기획하기</button><button class="pv-btn small danger" onclick="boxDelClient(${c.id})">삭제</button></div></td></tr>`).join("")}</tbody></table></div>` : `<div class="pv-muted">아직 저장된 클라이언트가 없어요.</div>`}</section></div>`;
  };
  window.boxAddMemo = async () => { const el = $("#box-memo"); const v = ((el || {}).value || "").trim(); if (!v) return toast("주제를 적어주세요"); try { const r = await post("/api/box", { kind: "topic", title: v, data: {} }); if (r.error) throw new Error(r.error); toast("담았어요"); viewPlanBox(); } catch (e) { toast("담지 못했어요: " + e.message); } };
  window.boxDel = async (id) => { try { await post("/api/box/" + id + "/delete", {}); viewPlanBox(); } catch (e) { toast("실패: " + e.message); } };
  window.boxDropRef = (id) => { if (typeof togglePlanRef === "function" && PLANREFS().includes(id)) togglePlanRef(id); viewPlanBox(); };
  window.boxDelClient = async (id) => { if (!confirm("이 클라이언트를 지울까요? 만든 기획안은 그대로 남아요.")) return; try { await post("/api/clients/" + id + "/delete", {}); CLIENTS = null; viewPlanBox(); } catch (e) { toast("실패: " + e.message); } };
  window.boxUseTopic = (id) => { const x = BOX.items.find(y => y.id === id); if (!x) return; const c = (x.data || {}).ctx;
    if (c && (c.refs || []).length) { const ap = c.append || {}; wizLoad(c.brief, c.refs, { topic: x.title, speed: c.speed || "fast", appendSid: ap.sid || null, appendPlan: ap.sid ? null : (ap.pid || null), topics: [{ title: x.title, why: (x.data || {}).why || "", hook_type: (x.data || {}).hook_type || "", source: "내 저장소" }] }); W.boxUsing = id; save(); location.hash = "#/plan/new"; return; }
    if ((W.refs || []).length && (W.about || W.product)) { W.topic = x.title; W.step = 3; W.boxUsing = id; save(); location.hash = "#/plan/new"; return toast("담아 둔 주제를 골랐어요 — 지금 작성 중인 기획(네 줄·릴스)에 이어서 만들어요"); }
    Object.assign(W, WIZ_BLANK(), { topicMemo: x.title, boxUsing: id }); save(); location.hash = "#/plan/new"; toast("네 줄과 릴스를 고르면 이 주제로 기획안을 만들어요"); };
  window.boxUseRef = (id) => { const r = BOX.refs.find(y => y.id === id); if (!r) return; const fresh = !(W.about || W.product) || !!(W.appendSid && (W.madeTopics || []).length); if (fresh) Object.assign(W, WIZ_BLANK());
    W.refs = [id]; W.mainRef = id; W.multi = true; W.topics = []; W.refsCache = [{ ...r, frames: !!r.frames, label: "담아 둔 릴스" }, ...(W.refsCache || []).filter(y => y.id !== id)]; W.basketSeen = [...new Set([...(W.basketSeen || []), id])]; W.step = (W.about && W.product && W.usp && W.profile) ? 2 : 1; save(); location.hash = "#/plan/new";
    toast(W.step === 1 ? "이 릴스를 골라 뒀어요 — 네 줄을 적으면 바로 이어집니다" : "이 릴스를 골랐어요"); };
  window.boxUseClient = async (id) => { if (!CLIENTS) { try { CLIENTS = await api("/api/clients"); } catch (e) { CLIENTS = []; } } Object.assign(W, WIZ_BLANK()); save(); wizClientPick(String(id)); location.hash = "#/plan/new"; };
  window.viewPlanTrash = async function () {
    const admin = document.body.classList.contains("admin"); let list = [];
    try { list = await api("/api/trash" + (admin && PF.all ? "?all=1" : "")); } catch (e) {}
    $("#main").innerHTML = `<div class="trash"><div class="trash-head"><a class="pv-btn" href="#/plan">← 기획 목록</a><div><h1>휴지통 <small>${list.length}개</small></h1><p class="muted">지운 기획안은 여기에 모여요. 복원하면 기획 목록으로 돌아가고, '완전히 삭제'하면 되살릴 수 없어요.</p></div>${list.length ? `<button class="pv-btn danger" onclick="trashEmpty(${list.length})">휴지통 비우기</button>` : ""}</div>
      ${list.length ? `<div class="pv-scroll"><table class="pv-grid trash-tbl"><colgroup><col><col style="width:150px"><col style="width:150px"><col style="width:230px"></colgroup><thead><tr><th>기획안</th><th>만든 날</th><th>지운 날</th><th></th></tr></thead><tbody>${list.map(x => `<tr><td><b>${esc(x.title || "")}</b>${x.kind === "set" && x.n > 1 ? ` <span class="tag">세트 ${x.n}편 한꺼번에</span>` : ""}${x.job ? `<div class="pv-muted">${esc(x.job)}</div>` : ""}</td><td>${esc(x.created_at || "")}</td><td>${esc(x.deleted_at || "")}</td><td><div class="trash-act"><button class="pv-btn small" onclick="trashRestore('${esc(x.id)}')">복원</button><button class="pv-btn small danger" onclick="trashPurge('${esc(x.id)}')">완전히 삭제</button></div></td></tr>`).join("")}</tbody></table></div>` : `<div class="empty"><b>휴지통이 비어 있어요</b>기획 목록에서 '여러 개 정리하기'로 한 번에 옮길 수 있어요.</div>`}</div>`;
  };
  window.trashRestore = async (id) => { try { const r = await post("/api/trash/" + id + "/restore", {}); if (r.error) throw new Error(r.error); toast("복원했어요 — 기획 목록에 다시 보여요"); viewPlanTrash(); } catch (e) { toast("실패: " + e.message); } };
  window.trashPurge = async (id) => { if (!confirm("완전히 삭제할까요? 되살릴 수 없어요.")) return; try { const r = await post("/api/trash/" + id + "/purge", {}); if (r.error) throw new Error(r.error); toast("완전히 삭제했어요"); viewPlanTrash(); } catch (e) { toast("실패: " + e.message); } };
  window.trashEmpty = async (n) => { if (!confirm(`휴지통의 ${n}개를 모두 완전히 삭제할까요? 되살릴 수 없어요.`)) return; try { const r = await post("/api/trash/empty", {}); if (r.error) throw new Error(r.error); toast(`${r.purged || 0}개를 완전히 삭제했어요`); viewPlanTrash(); } catch (e) { toast("실패: " + e.message); } };
  window.setPlanMetaQuiet = async (pid, d) => { try { await post("/api/plans/" + pid + "/meta", d); toast("저장됨"); if (HOME_CACHE) { const x = HOME_CACHE.plans.find(y => y.id === pid); if (x) Object.assign(x, d); } } catch (e) { toast(e.message); } };
  window.PF_set = (k, v) => { PF[k] = v; SEL.clear(); viewPlanHome(); };
  window.setPlanMeta = async (pid, d) => { try { await post("/api/plans/" + pid + "/meta", d); toast("저장됨"); viewPlanHome(); } catch (e) { toast(e.message); } };
  window.newFolder = async (pid) => { const name = (prompt("새 폴더 이름 (예: 9월 카페 시리즈)") || "").trim(); if (!name) return; if (pid) await setPlanMeta(pid, { folder: name }); else { PF.folder = "전체"; toast("폴더는 기획을 넣는 순간 생깁니다. 카드에서 '" + name + "'을 고르세요"); const plans = await api("/api/plans").catch(() => []); if (plans[0]) await setPlanMeta(plans[0].id, { folder: name }); } };
  let HOME_CACHE = null;
  window.viewPlanHome = async function (fast) {
    syncUser(); dockStart();
    const q = PF.all ? "?all=1" : "";
    let plans, sets;
    if (fast && HOME_CACHE && HOME_CACHE.q === q) { plans = HOME_CACHE.plans; sets = HOME_CACHE.sets; }
    else { [plans, sets] = await Promise.all([api("/api/plans" + q).catch(() => []), api("/api/plansets" + q).catch(() => [])]); api("/api/trash").then(t => { const n = (t || []).length; if (n !== TRASH_N) { TRASH_N = n; if (location.hash.replace(/\/$/, "") === "#/plan") viewPlanHome(true); } }).catch(() => {}); HOME_CACHE = { q, plans, sets }; }
    const multiSets = sets.filter(x => (x.n || 0) > 1);   // 1편짜리는 기획 목록에만(같은 흐름으로 만들어도 세트로 보이지 않게)
    const setsHtml = multiSets.length ? `<div class="plan-toolbar" style="margin:4px 0 8px"><h2 style="margin:0">촬영 세트 <small>${multiSets.length}개</small></h2></div><div class="set-list">${multiSets.slice(0, 8).map(x => `<a class="set-chip" href="#/plan/set/${esc(x.id)}"><b>${esc(x.job || "세트")} ${x.n}편</b><span class="muted">${esc((x.topics || []).join(" · ").slice(0, 70))}</span><span class="muted">${esc(x.created_at || "")}</span></a>`).join("")}</div>` : "";
    const mrH = (W.refsCache || []).find(x => x.id === W.mainRef);
    const resume = (W.about || W.product || (W.refs || []).length) ? `<div class="resume"><div class="rs-thumb">${mrH && mrH.thumbnail ? `<img src="${esc(mrH.thumbnail)}" onerror="this.style.visibility='hidden'">` : "✍️"}</div>
      <div class="rs-body"><span class="ph-kicker">${(W.appendSid && (W.madeTopics || []).length) ? `방금 만든 기획에 이어서 · 지금까지 ${W.madeTopics.length}편` : `작성 중인 기획이 있어요 · ${W.step || 1}/3 단계`}</span><b>${esc(W.about || W.product || "제목 없는 기획")}</b>
        <div class="rs-meta">${[W.product && "상품 · " + W.product, W.targetText && "타깃 · " + W.targetText, W.usp && "소구점 · " + W.usp, mrH && "따라 할 릴스 · @" + mrH.account, (W.setTopics || []).length && "고른 주제 " + W.setTopics.length + "개"].filter(Boolean).map(x => `<span>${esc(x)}</span>`).join("")}</div></div>
      <div class="rs-actions"><button class="btn p big" onclick="wizResume()">${(W.appendSid && (W.madeTopics || []).length) ? "같은 구조로 하나 더 →" : "이어서 하기 →"}</button><button class="btn" onclick="${(W.appendSid && (W.madeTopics || []).length) ? "wizFresh()" : "wizDiscard()"}">${(W.appendSid && (W.madeTopics || []).length) ? "새 기획 시작" : "지우고 새로 시작"}</button></div></div>` : "";
    $("#main").innerHTML = `<div class="plan-home">${resume}<div class="hero"><div><div class="ph-kicker">콘텐츠 기획</div><h1>네 줄 적고, 릴스 하나 고르면<br>그 구조 그대로 내 대본이 나옵니다.</h1><p>나 · 주 상품 · 주 타깃 · 소구점 → 따라 하고 싶은 릴스 1개 → 주제. 세 단계면 끝나요. 대본의 구조와 말투는 고른 릴스를 따라가고, 이야기의 알맹이는 내 소구점으로 채워요.</p><button class="btn p big" onclick="wizStart()">+ 새 기획 만들기</button> <a class="btn big ghost2" href="#/plan/box">내 저장소</a> ${W.job ? `<button class="btn big ghost2" onclick="wizResume()">이어서 하기 (STEP ${W.step})</button>` : ""}</div><div class="hero-art"><i></i><i></i><i></i></div></div>
    <div class="panel soft" style="margin-bottom:14px"><b>처음이세요? 이렇게 됩니다 (5분)</b><ol style="margin:6px 0 0 18px;line-height:1.8"><li>나 · 주 상품 · 주 타깃 · 소구점 네 줄을 적습니다. 잘 모르겠으면 AI 제안을 눌러요</li><li>키워드(해시태그)를 확인하고, 따라 하고 싶은 릴스를 하나 고릅니다</li><li>주제를 하나 고르면 기획안이 1분 안팎에 만들어져요. 다른 메뉴에 가 있어도 계속 만들어지고, '하나 더 만들기'로 같은 구조의 다음 편을 이어서 만들 수 있어요</li><li>사장님께는 "사장님께 보내기" 링크를, 편집자에게는 편집 외주용 탭을 넘기면 끝</ol></div>
    ${setsHtml}${planListHtml(plans)}</div>`;
  };
  let SET_T = null; const SETC = {};
  const fmtDur = (sec) => { sec = Math.max(0, Math.round(Number(sec) || 0)); if (sec < 60) return sec + "초"; const m = Math.floor(sec / 60), r = sec % 60; return m + "분" + (r >= 5 ? " " + r + "초" : ""); };
  const plainT = (t) => String(t || "").replace(/\[확인\s*필요[:：]?\s*([^\]]*)\]/g, "$1");
  // 만드는 중인 작업 목록(계정별 · 이 브라우저) — 다른 메뉴에 있어도 오른쪽 아래에서 진행을 보여준다
  const MKEY = () => "hcMaking:" + curUid();
  const makingList = () => { try { const v = JSON.parse(localStorage.getItem(MKEY()) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  const makingSave = (a) => { try { a.length ? localStorage.setItem(MKEY(), JSON.stringify(a.slice(-6))) : localStorage.removeItem(MKEY()); } catch (e) {} };
  const makingAdd = (m) => { makingSave([...makingList().filter(x => x.sid !== m.sid), m]); dockStart(); };
  window.makingDone = (sid) => { makingSave(makingList().filter(x => x.sid !== sid)); dockTick(); };
  let DOCK_T = null;
  function dockStart() { if (DOCK_T || !makingList().length) return; DOCK_T = setInterval(dockTick, 5000); dockTick(); }
  async function dockTick() {
    const list = makingList(); let el = document.getElementById("mk-dock");
    if (!list.length) { if (el) el.remove(); clearInterval(DOCK_T); DOCK_T = null; return; }
    const m = list[list.length - 1]; const onPage = location.hash.indexOf("#/plan/set/" + m.sid) === 0;
    let st = null; try { st = await api("/api/plansets/" + m.sid); } catch (e) { return; }
    if (!st || st.error) { makingSave(list.filter(x => x.sid !== m.sid)); return dockTick(); }
    SETC[m.sid] = st;
    const vids = (st.videos || []).filter(v => v.status !== "deleted"); const doneN = vids.filter(v => v.status === "done").length; const all = !!vids.length && vids.every(v => v.status === "done" || v.error);
    if (!vids.length) { makingSave(list.filter(x => x.sid !== m.sid)); if (el) el.remove(); return; }
    if (all && !doneN) { makingSave(list.filter(x => x.sid !== m.sid)); if (el) el.remove(); if (!onPage) toast("기획안을 만들지 못했어요 — 다시 만들어 주세요"); return; }
    if (all && !m.done) { m.done = true; makingSave(list.map(x => x.sid === m.sid ? m : x)); if (!onPage) toast(`기획안 ${vids.length > 1 ? vids.length + "편이 " : ""}완성됐어요 — 오른쪽 아래 '보기'를 누르세요`); }
    if (onPage) { if (el) el.remove(); if (all) makingDone(m.sid); return; }
    if (!el) { el = document.createElement("div"); el.id = "mk-dock"; document.body.appendChild(el); }
    const remain = Math.max(0, (st.eta_sec || 90) - (st.elapsed_sec || 0)); const more = list.filter(x => !x.done).length - (all ? 0 : 1);
    const href = all && vids.length === 1 ? "#/plan/" + vids[0].id : "#/plan/set/" + m.sid;
    el.className = "mk-dock" + (all ? " done" : "") + (document.querySelector(".wiz-foot") ? " up" : "");
    el.innerHTML = all ? `<div class="mk-dock-t"><b>기획안 ${vids.length > 1 ? vids.length + "편 " : ""}완성</b><span>${esc(plainT(m.title || ""))}</span></div><a class="pv-btn primary" href="${href}" onclick="makingDone('${esc(m.sid)}')">보기</a><button class="mk-x" onclick="makingDone('${esc(m.sid)}')" aria-label="닫기">✕</button>`
      : `<div class="mk-dock-t"><b>기획안 만드는 중${vids.length > 1 ? ` · ${doneN}/${vids.length}편 완성` : ""}${more > 0 ? ` · 대기 ${more}` : ""}</b><span>${remain > 0 ? "약 " + fmtDur(remain) + " 남음" : "거의 다 됐어요"} · 다른 메뉴에 있어도 계속 만들어져요</span><i class="mk-dock-bar"><i style="width:${Math.min(96, Math.max(6, 100 * (st.elapsed_sec || 0) / (st.eta_sec || 90)))}%"></i></i></div><a class="pv-btn" href="#/plan/set/${esc(m.sid)}">보기</a>`;
  }
  window.addEventListener("hashchange", () => { if (makingList().length) { dockStart(); dockTick(); } });
  setTimeout(dockStart, 1500); setTimeout(dockStart, 5000);

  // 결과 화면 위: 같은 세트의 1편 · 2편 · 3편 탭
  function setNavHtml(p) {
    const sid = p && p.set_id; if (!sid) return "";
    const st = SETC[sid];
    if (!st || (!st.done && Date.now() - (st._at || 0) > 8000)) { api("/api/plansets/" + sid).then(s => { if (s && !s.error) { s._at = Date.now(); const had = !!SETC[sid]; SETC[sid] = s; if (CUR && CUR.set_id === sid && (!had || !s.done || JSON.stringify((st || {}).videos) !== JSON.stringify(s.videos))) renderPlan2(CUR); } }).catch(() => {}); if (!st) return ""; }
    const vids = (st.videos || []).filter(v => v.status !== "deleted"); if (vids.length < 2) return "";
    return `<nav class="pv-set"><span class="pv-set-l">촬영 세트<b>${vids.length}편</b></span>${vids.map(v => `<a class="${v.id === p.id ? "on" : ""} ${v.status === "done" ? "" : "wait"}" href="${v.status === "done" ? "#/plan/" + esc(v.id) : "#/plan/set/" + esc(sid)}"><b>${v.no}편</b><span>${esc(plainT(v.title || v.topic || ""))}</span>${v.status === "done" ? "" : `<em>만드는 중 ${Math.round(v.pct || 0)}%</em>`}</a>`).join("")}<a class="pv-set-all" href="#/plan/set/${esc(sid)}">세트 한눈에</a><a class="pv-set-all add" href="#" onclick="event.preventDefault();planMore('${esc(p.id)}')">+ 하나 더</a></nav>`;
  }

  window.shareSet = async (sid) => { try { const r = await post("/api/plansets/" + sid + "/share", {}); if (r.error) throw new Error(r.error); const url = location.origin + location.pathname + "#/share/" + r.token; await copyText(url, "세트 링크를 복사했어요 — 카톡에 붙여넣으세요 (로그인한 사람만 열 수 있어요)"); } catch (e) { toast("실패: " + e.message); } };
  window.setDelete = async (sid) => { if (!confirm("이 세트의 기획안을 전부 휴지통으로 옮길까요? 휴지통에서 한꺼번에 다시 살릴 수 있어요.")) return; try { const r = await post("/api/plansets/" + sid + "/delete", {}); if (r.error) throw new Error(r.error); delete SETC[sid]; makingDone(sid); toast("세트를 휴지통으로 옮겼어요"); location.hash = "#/plan"; } catch (e) { toast("실패: " + e.message); } };
  window.openHookBrowse = async () => { if (!HOOKDB || !(HOOKDB.types || []).length) { for (let k = 0; k < 2; k++) { try { HOOKDB = await api("/api/hooks"); break; } catch (e) { if (k) return toast("훅 리스트를 못 불러왔어요 — 잠시 뒤 다시 눌러주세요"); await new Promise(r => setTimeout(r, 1500)); } } }
    if (!HOOKDB || !(HOOKDB.types || []).length) return toast("훅 리스트가 비어 있어요"); HOOKTYPE = 0; drawHookPicker(""); };
  const STAGE_TXT = { queued: "순서를 기다리는 중", unknown: "순서를 기다리는 중", plan: "대본 쓰는 중", polish: "대사 다듬는 중", extras: "완성", done: "완성", error: "실패" };
  window.viewPlanSet = async function (sid) {
    clearInterval(SET_T); let wasDone = null;
    const draw = async () => {
      const st = await api("/api/plansets/" + sid); if (st.error) { $("#main").innerHTML = `<div class="empty"><b>${esc(st.error)}</b><div class="row" style="justify-content:center;margin-top:12px"><a class="btn" href="#/plan">기획 목록</a></div></div>`; return true; }
      st._at = Date.now(); SETC[sid] = st; if (!HOOKDB && !HOOKDB_LOADING) { HOOKDB_LOADING = true; api("/api/hooks").then(d => { HOOKDB = d; }).catch(() => { HOOKDB_LOADING = false; }); }
      const vids = (st.videos || []).filter(v => v.status !== "deleted"); const doneN = vids.filter(v => v.status === "done").length; const b = st.brief || {};
      const all = !!vids.length && vids.every(v => v.status === "done" || v.error);
      if (!vids.length) { makingDone(sid); $("#main").innerHTML = `<div class="empty"><b>이 세트의 기획안은 모두 휴지통에 있어요</b><div class="row" style="justify-content:center;margin-top:12px;gap:8px"><a class="btn p" href="#/plan/trash">휴지통 열기</a><a class="btn" href="#/plan">기획 목록</a></div></div>`; return true; }
      if (location.hash.indexOf("#/plan/set/" + sid) !== 0) return true;
      const lastV = vids[vids.length - 1];
      if (all && wasDone === false && lastV && lastV.status === "done") toast("기획안이 완성됐어요 — '기획안 열기'를 누르세요");   // 자동으로 넘기지 않고 알림만(9/18 준희 님)
      wasDone = all;
      const mainRefId = (st.ids || [])[Math.max(0, Number(b.main_ref || 1) - 1)] || (st.ids || [])[0];
      const eta = st.eta_sec || 90, el = st.elapsed_sec; const remain = el == null ? null : Math.max(0, eta - el);
      const avg = vids.length ? vids.reduce((a, v) => a + (v.status === "done" ? 100 : (v.pct || 0)), 0) / vids.length : 0; const pct = Math.round(Math.max(avg, el == null ? 0 : Math.min(95, 100 * el / eta)));
      const title = vids.length > 1 ? `${esc(b.product || b.job || b.about || "")} ${vids.length}편 세트` : esc(plainT(vids[0] && (vids[0].title || vids[0].topic)) || b.product || "릴스 기획안");
      const rows = vids.map(v => { const ready = v.status === "done"; return `<div class="mk-row ${ready ? "ready" : v.error ? "err" : ""}"><b class="mk-no">${v.no}편</b><div class="mk-t"><b>${esc(plainT(v.title || v.topic) || "주제는 AI가 정해요")}</b>${ready && v.hook ? `<span class="mk-hook">“${esc(plainT(v.hook))}”</span>` : ""}<span class="mk-st">${v.error ? "실패: " + esc(v.error) : ready ? [v.format, v.length_sec ? v.length_sec + "초" : ""].filter(Boolean).map(esc).join(" · ") || "완성" : (STAGE_TXT[v.stage] || "만드는 중") + (v.pct ? ` ${Math.round(v.pct)}%` : "")}</span></div><div class="mk-p">${ready ? `<a class="pv-btn primary" href="#/plan/${esc(v.id)}">기획안 열기</a>` : v.error ? "" : `<i class="mk-mini"><i style="width:${Math.max(4, Math.round(v.pct || 0))}%"></i></i>`}</div></div>`; }).join("");
      const firstReady = vids.find(v => v.status === "done");
      if (!all) {
        $("#main").innerHTML = `<div class="mk"><header class="mk-head"><span class="mk-kicker">기획안 만드는 중 · ${vids.length}편</span><h1>${title}</h1>
          <div class="mk-eta"><span>예상 <b>약 ${fmtDur(eta)}</b></span>${el != null ? `<span>${fmtDur(el)} 지남</span><span>${remain > 0 ? `남은 시간 <b>약 ${fmtDur(remain)}</b>` : "<b>거의 다 됐어요 — 마무리하는 중</b>"}</span>` : ""}${vids.length > 1 ? `<span>${doneN}/${vids.length}편 완성</span>` : ""}</div>
          <div class="mk-bar"><i style="width:${pct}%"></i></div>
          <p class="mk-free"><b>다른 메뉴로 가도 기획안은 계속 만들어져요.</b> 인스타그램 릴스를 보거나 다른 일을 하다 오세요. 다 되면 화면 오른쪽 아래에 알려드려요.</p></header>
          <section class="mk-list">${rows}</section>
          <section class="mk-while"><h2>기다리는 동안 해 보세요</h2><div class="mk-grid">
            ${mainRefId ? `<button onclick="openReel(${Number(mainRefId)})"><b>따라 할 릴스 다시 보기</b><span>첫 3초에 뭘 보여주는지, 자막이 어디에 뜨는지 봐 두면 촬영이 쉬워요</span></button>` : ""}
            <button onclick="openHookBrowse()"><b>훅 리스트 300개 훑어보기</b><span>마음에 드는 첫 문장을 찾아 두면, 기획안에서 바로 바꿀 수 있어요</span></button>
            <button onclick="setMore('${esc(st.id)}')"><b>같은 구조로 다음 편도 만들기</b><span>기다리는 동안 다음 주제를 골라 하나 더 만들 수 있어요 (동시에 3편까지)</span></button>
            ${firstReady ? `<a href="#/plan/${esc(firstReady.id)}/easy-prep"><b>촬영 준비물 먼저 보기</b><span>${firstReady.no}편이 먼저 완성됐어요 — 준비물·의상·촬영 배경을 챙겨 두세요</span></a>` : `<div class="mk-off"><b>촬영 준비물 먼저 보기</b><span>첫 편이 완성되면 여기서 준비물·의상을 바로 볼 수 있어요</span></div>`}
          </div></section></div>`;
        return false;
      }
      makingDone(sid);
      const items = [...new Set(vids.flatMap(v => ((v.prep_pack || {}).items) || []))];
      const byLoc = {}; vids.forEach(v => { const k = ((v.prep_pack || {}).location || "배경 미정").trim(); (byLoc[k] = byLoc[k] || []).push(v); });
      $("#main").innerHTML = `<div class="mk done"><header class="mk-head"><span class="mk-kicker">${vids.length > 1 ? "촬영 세트 완성" : "기획안 완성"} · ${esc(st.created_at || "")}</span><h1>${title}</h1><p class="mk-free">${vids.length > 1 ? "전부 같은 주 레퍼런스 구조로, 주제만 다르게 만들었어요. 편을 눌러 기획안을 보세요." : "기획안이 완성됐어요."}</p>
          <div class="pv-actions">${firstReady ? `<a class="pv-btn primary" href="#/plan/${esc(firstReady.id)}">1편부터 보기</a>` : ""}<button class="pv-btn more" onclick="setMore('${esc(st.id)}')">+ 같은 구조로 하나 더 만들기</button>${doneN ? `<button class="pv-btn" onclick="shareSet('${esc(st.id)}')">사장님께 ${vids.length > 1 ? "세트 " : ""}링크 보내기</button>` : ""}<button class="pv-btn danger" onclick="setDelete('${esc(st.id)}')">세트 휴지통으로</button></div></header>
        <section class="mk-list">${rows}</section>
        ${doneN > 1 ? `<section class="pv-card"><div class="pv-h"><h2>촬영 당일</h2><span>같은 배경끼리 묶어서 찍으세요 · 의상은 편마다 바꿔 입기</span></div><table class="pv-kv">${kvRows([["촬영 순서(배경별)", `<ol>${Object.entries(byLoc).map(([k, arr]) => `<li><b>${esc(k)}</b> — ${arr.map(v => v.no + "편").join(", ")}</li>`).join("")}</ol>`], ["준비물 전체", items.length ? `<ul class="${items.length >= 4 ? "pv-cols" : ""}">${items.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""], ["의상", `<ul>${vids.filter(v => (v.prep_pack || {}).wear).map(v => `<li>${v.no}편 · ${esc(v.prep_pack.wear)}</li>`).join("")}</ul>`]])}</table></section>` : ""}</div>`;
      return true;
    };
    try { const fin = await draw(); if (!fin) SET_T = setInterval(async () => { if (location.hash.indexOf("#/plan/set/" + sid) !== 0) return clearInterval(SET_T); try { if (await draw()) clearInterval(SET_T); } catch (e) {} }, 4000); }
    catch (e) { $("#main").innerHTML = `<div class="empty"><b>세트를 불러오지 못했어요</b>${esc(e.message)}</div>`; }
  };
  window.shareConfirm = async (token, status) => { const memo = (($("#share-memo") || {}).value || "").trim(); if (status === "revise" && !memo) return toast("고치고 싶은 곳을 적어 주세요");
    try { const r = await post("/api/share/" + encodeURIComponent(token) + "/confirm", { status, memo }); if (r.error) throw new Error(r.error); toast(status === "ok" ? "확인을 보냈어요. 감사합니다" : "수정 요청을 보냈어요"); viewShare(token); } catch (e) { toast("보내지 못했어요: " + e.message); } };
  window.viewShare = async function (token) {
    try { const d = await api("/api/share/" + encodeURIComponent(token)); if (d.error) throw new Error(d.error);
      const PARTN = { 기: "시작", 승: "문제", 전: "해결", 결: "마무리" }; const cf = ((d.videos || [])[0] || {}).confirm;
      $("#main").innerHTML = `<div class="share"><div class="share-head"><span class="ph-kicker">하이커브 촬영 안내 · ${esc(d.created_at || "")}</span><h1>${esc(d.title || "촬영 대본")}</h1><p class="muted">촬영 전에 대본을 소리 내어 두세 번 읽어 보세요. 외우지 않아도 됩니다 — 한 줄씩 끊어서 찍어요.</p></div>
        ${(d.videos || []).map((v, i) => `<section class="share-card"><div class="share-no">${(d.videos || []).length > 1 ? (i + 1) + "편" : "대본"}</div><h2>${esc(v.title || "")}</h2><div class="muted" style="font-size:13px;margin-bottom:10px">${[v.format, v.length_sec ? v.length_sec + "초" : ""].filter(Boolean).map(esc).join(" · ")}</div>
          ${v.ready ? `<div class="share-script">${(v.lines || []).map((l, k, arr) => `${k === 0 || arr[k - 1].part !== l.part ? `<div class="share-part">${esc(PARTN[l.part] || "")}</div>` : ""}<p>${esc(l.text)}</p>`).join("")}</div>
          <div class="prep-grid" style="margin-top:14px">${(v.prep.items || []).length ? `<div><small>준비물</small><ul>${v.prep.items.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}${v.prep.wear ? `<div><small>의상</small><p>${esc(v.prep.wear)}</p></div>` : ""}${v.prep.location ? `<div><small>촬영 배경</small><p>${esc(v.prep.location)}</p></div>` : ""}${(v.prep.order || []).length ? `<div><small>촬영 순서</small><ol>${v.prep.order.map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>` : ""}</div>
          ${(v.scenes || []).some(x => x.sketch) ? `<h3 class="share-h3">장면 그림</h3><div class="share-sk">${v.scenes.filter(x => x.sketch).map(x => `<figure><img src="${esc(x.sketch)}" loading="lazy"><figcaption><b>${esc(x.no)}</b> ${esc(x.say || "")}</figcaption></figure>`).join("")}</div>` : ""}` : `<div class="muted">아직 만드는 중이에요. 잠시 뒤에 다시 열어 주세요.</div>`}</section>`).join("")}
        <section class="share-card share-confirm">${cf ? `<div class="share-cf ${cf.status === "ok" ? "ok" : "rv"}"><b>${cf.status === "ok" ? "확인해 주셨어요" : "수정 요청을 보냈어요"}</b> · ${esc(cf.at || "")}${cf.memo ? `<p>“${esc(cf.memo)}”</p>` : ""}</div>` : ""}<h2>이대로 촬영해도 될까요?</h2><textarea id="share-memo" class="wiz-input" rows="3" placeholder="고치고 싶은 곳이 있으면 적어 주세요 (예: 3번째 문장은 제 말투가 아니에요 / 가격 얘기는 빼 주세요)"></textarea>
          <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn p big" onclick="shareConfirm('${esc(token)}','ok')">네, 이대로 찍을게요</button><button class="btn big" onclick="shareConfirm('${esc(token)}','revise')">수정 요청 보내기</button></div></section></div>`;
    } catch (e) { $("#main").innerHTML = `<div class="empty"><b>열 수 없어요</b>${esc(e.message)}</div>`; }
  };
  const WIZ_BLANK = () => ({ direction: "", kwAll: [], kwOn: null, kwMore: [], madeTopics: [], appendSid: null, appendPlan: null, refsAi: false, refsAiOrder: [], speed: "fast", uspQ: [], uspQA: [], uspDone: false, uspFor: "", uspWhy: "", clientId: null, pendingProfile: null, step: 1, job: "", target: [], keyword: "", subs: [], selSubs: [], refs: [], topic: "", topics: [], extra: {}, refsCache: [], urls: "", about: "", product: "", targetText: "", usp: "", sugg: null, profile: null, profileFor: "", mainRef: null, setTopics: [], autoOff: null, making: null, multi: false, moreOpen: false });
  window.wizDiscard = () => { if (!confirm("작성 중이던 내용을 지우고 새로 시작할까요?")) return; Object.assign(W, WIZ_BLANK()); save(); viewPlanHome(); };
  window.wizStart = () => { if (W.appendSid && (W.madeTopics || []).length) Object.assign(W, WIZ_BLANK()); else if (!(W.about || W.product)) Object.assign(W, { step: 1, topic: "", topics: [] }); save(); if (location.hash !== "#/plan/new") location.hash = "#/plan/new"; else renderWizard(); };
  window.wizResume = () => { if (location.hash !== "#/plan/new") location.hash = "#/plan/new"; else renderWizard(); };
})();
