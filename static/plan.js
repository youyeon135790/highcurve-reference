// ✍️ 릴스 기획 — 5단계 고르기(직업 → 타깃 → 키워드 → 참고 릴스 → 주제) → 기획안. 레퍼런스 최대 3개, 캡컷 기준.
(function () {
  const W = { step: 1, mode: "own", job: "", target: [], keyword: "", subs: [], selSubs: [], refs: [], topic: "", topics: [], extra: {}, refsCache: [], urls: "" };
  try { Object.assign(W, JSON.parse(localStorage.getItem("planWiz") || "{}")); } catch (e) {}
  if (!["own", "brand", "agency", "consign"].includes(W.mode)) { if (W.mode === "fast") W.speed = "fast"; W.mode = "own"; }
  const save = () => { try { localStorage.setItem("planWiz", JSON.stringify({ ...W, refsCache: W.refsCache.slice(0, 24), topics: W.topics.slice(0, 10) })); } catch (e) {} };
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
    return where === "side" ? `<details class="side-sec fold mp" open><summary><b>${esc(name)} 체크</b><small>이 모드에서 꼭 볼 것</small></summary><table class="gtable mp-table">${rows}</table></details>`
      : `<section class="ez-sec mp"><h3>⑤ ${esc(name)} 체크 <small>준희 님 노하우로 이 편에서 꼭 볼 것만 뽑았어요</small></h3><table class="gtable mp-table">${rows}</table></section>`;
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
    if (arg) { if (sub && ["plan", "easy", "refs", "pro"].includes(sub)) TAB = sub; else if (!CUR || CUR.id !== arg) TAB = "easy"; const p = await api("/api/plans/" + arg); CUR = p; return renderPlan2(p); }
    // 릴스 상세창에서 담아둔 바구니 → 참고 릴스에 자동 반영
    const basket = (typeof PLANREFS === "function" ? PLANREFS() : []).slice(0, 3); W.basketSeen = W.basketSeen || [];
    for (const id of basket) if (!W.basketSeen.includes(id) && !W.refs.includes(id) && W.refs.length < 3) { W.refs.push(id); W.basketSeen.push(id); }
    save(); renderWizard();
  };
  const STEPS = 6;
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

  async function renderWizard() {
    if (W.step > STEPS) W.step = STEPS;
    const s = W.step; const pct = (s / STEPS) * 100;
    const head = `<div class="wiz-head"><div class="wiz-top"><button class="btn ghost" onclick="wizGo(${s - 1})" ${s === 1 ? "disabled" : ""}>←</button><div class="wiz-step">STEP ${s} OF ${STEPS} <span class="tag" style="margin-left:6px">${esc(MODE_NAME[W.mode] || "")}</span></div><a class="btn ghost" href="#/plan" onclick="wizReset(event)">처음부터</a></div><div class="wiz-bar"><i style="width:${pct}%"></i></div></div>`;
    let body = "", next = "";
    if (s === 1) {
      const jobs = JOBS_BY[W.mode] || JOBS; const [q1, q1s] = JOB_Q[W.mode] || JOB_Q.own;
      body = `<div class="wiz-sub" style="margin-top:0">누구를 위한 기획인가요? <small class="muted">모드에 따라 질문·규칙·결과가 달라집니다</small></div>${modeCards()}
      <h1 style="margin-top:18px">${esc(q1)}</h1><p class="muted">${esc(q1s)}</p>
      <div class="pills">${jobs.map(j => pill(j, W.job === j, `wizSet('job','${esc(j)}')`)).join("")}</div>
      <label class="wiz-label">목록에 없으면 직접 적어주세요</label><input class="wiz-input" placeholder="${W.mode === "agency" ? "예: 세차장, 꽃집, 공인중개사" : W.mode === "own" ? "예: 공인중개사, 꽃집 사장" : "예: 종이꽃 포토존, 무향 탈취제"}" value="${jobs.includes(W.job) ? "" : esc(W.job)}" oninput="wizInput('job', this)">
      ${mfHtml()}`;
      next = `<button class="btn p big" onclick="${W.job ? "wizGo(2)" : "toast('직업을 골라주세요')"}">다음</button>`;
    } else if (s === 2) {
      const [q2, q2s] = TARGET_Q[W.mode] || TARGET_Q.own; const life = LIFE_BY[W.mode] || LIFE;
      body = `<h1>${esc(q2)}</h1><p class="muted">${esc(q2s)}</p>
      <div class="pills">${AGES.map(a => pill(a, W.target.includes(a), `wizToggle('target','${a}')`)).join("")}</div><div class="wiz-sub">${W.mode === "brand" || W.mode === "consign" ? "구매자 상황" : "라이프스타일"}</div>
      <div class="pills">${life.map(a => pill(a, W.target.includes(a), `wizToggle('target','${a}')`)).join("")}</div>
      <label class="wiz-label">직접 적기</label><input class="wiz-input" placeholder="예: 릴스 올려도 조회수 300 나오는 사장님" value="${esc(W.extra.target_free || "")}" oninput="wizExtra('target_free', this)">`;
      next = `<button class="btn p big" onclick="${W.target.length || W.extra.target_free ? "wizGo(3)" : "toast('타깃을 하나 이상 골라주세요')"}">다음</button>`;
    } else if (s === 3) {
      const ch = W.extra.ch || {}; const hasProduct = (MF[W.mode] || []).some(x => x[0] === "product");
      body = `<h1>카메라 앞에 서는 사람은 어떤 캐릭터인가요?</h1><p class="muted">대본의 말투는 캐릭터에 맞춥니다. 무뚝뚝한 분께 호들갑 대사를 드리지 않으려고요.</p>
      <div class="modes">${CHARS.map(([n, d]) => `<button class="mode ${ch.preset === n ? "on" : ""}" onclick="wizCh('preset','${n}')"><b>${esc(n)}</b><small>${esc(d)}</small></button>`).join("")}</div>
      <div class="mf-box"><div class="mf-row"><small>텐션</small><div class="pills small">${["차분", "보통", "높음"].map(v => pill(v, ch.tension === v, `wizCh('tension','${v}')`)).join("")}</div></div>
        <div class="mf-row"><small>말투</small><div class="pills small">${["존댓말", "반말", "섞어서"].map(v => pill(v, ch.speech === v, `wizCh('speech','${v}')`)).join("")}</div></div>
        <div class="mf-row"><small>웃음기·유머</small><div class="pills small">${["적음", "보통", "많음"].map(v => pill(v, ch.humor === v, `wizCh('humor','${v}')`)).join("")}</div></div>
        <div class="mf-row"><small>외모·분위기 한 줄 (선택)</small><input class="wiz-input" style="padding:8px 12px;font-size:13px" placeholder="예: 단정한 운동복, 조용한 센터 / 앞치마, 시끌벅적한 주방" value="${esc(ch.vibe || "")}" oninput="wizChIn('vibe', this)"></div>
        <div class="mf-row"><small>기존 영상 링크 (선택 — 말투를 파악할 영상)</small><input class="wiz-input" style="padding:8px 12px;font-size:13px" placeholder="https://www.instagram.com/reel/..." value="${esc(ch.sample || "")}" oninput="wizChIn('sample', this)"></div></div>
      <h1 style="margin-top:22px;font-size:22px">영상 끝에서 어디로 보낼까요?</h1><p class="muted">CTA는 퍼널에 맞춥니다.</p>
      <div class="pills">${FUNNELS.map(v => pill(v, W.extra.funnel === v, `wizExtraSet('funnel','${esc(v)}')`)).join("")}</div>
      <input class="wiz-input" style="margin-top:8px" placeholder="직접 적기 (예: 댓글 '교정' → 체형 체크표 → 첫 체험 예약)" value="${FUNNELS.includes(W.extra.funnel) ? "" : esc(W.extra.funnel || "")}" oninput="wizExtra('funnel', this)">
      <div class="mf-box"><b>내 재료 <small class="muted">채울수록 지어낸 말이 줄어듭니다</small></b>
        ${hasProduct ? "" : `<div class="mf-row"><small>제품·서비스 한 줄</small><input class="wiz-input" style="padding:8px 12px;font-size:13px" placeholder="예: 1:1 체형교정 필라테스, 첫 체험 3만원" value="${esc(W.extra.product || "")}" oninput="wizExtra('product', this)"></div>`}
        <div class="mf-row"><small>내가 실제로 겪은 장면 1개</small><input class="wiz-input" style="padding:8px 12px;font-size:13px" placeholder="예: 목이 아프다고 온 회원인데 골반이 틀어져 있었다" value="${esc(W.extra.scene || "")}" oninput="wizExtra('scene', this)"></div>
        <div class="mf-row"><small>쓸 수 있는 숫자·사례</small><input class="wiz-input" style="padding:8px 12px;font-size:13px" placeholder="예: 8년차, 회원 300명, 재등록률은 모름" value="${esc(W.extra.numbers || "")}" oninput="wizExtra('numbers', this)"></div>
        <div class="mf-row"><small>촬영 가능 환경</small><input class="wiz-input" style="padding:8px 12px;font-size:13px" placeholder="예: 얼굴 노출 OK, 매장 촬영 가능, 손님 뒷모습만" value="${esc(W.extra.shooting || "")}" oninput="wizExtra('shooting', this)"></div></div>`;
      next = `<button class="btn p big" onclick="${ch.preset ? "wizGo(4)" : "toast('캐릭터를 하나 골라주세요')"}">다음</button>`;
    } else if (s === 4) {
      body = `<h1>핵심 키워드 하나만 적어주세요.</h1>${connectBox()}<p class="muted">이 키워드로 우리 저장소(릴스 ${fmt(META?.stats?.items || 9000)}개)에서 같이 쓰인 단어를 뽑고, 참고 릴스를 찾아요.</p>
      <div class="row"><input id="wiz-kw" class="wiz-input" placeholder="예: 카페 신메뉴, 릴스 만드는 법, 홈트" value="${esc(W.keyword)}" oninput="wizInput('keyword', this)" onkeydown="if(event.key==='Enter')wizSubs()"><button class="btn p" onclick="wizSubs()">서브 키워드 뽑기</button></div>
      <div class="wiz-sub">서브 키워드 ${W.subs.length ? (W.subsSource === "cli" || W.subsSource === "api" ? '<span class="tag ok">AI가 뽑음</span>' : '<span class="tag">저장소 통계</span>') : ""}<small class="muted">${W.subs.length ? `${W.selSubs.length}/${W.subs.length} 선택 · 눌러서 켜고 끄기` : "키워드를 넣고 뽑기를 누르세요 (AI가 5~10초)"}</small></div>
      <div class="pills" id="wiz-subs">${W.subs.map(k => pill("#" + k, W.selSubs.includes(k), `wizToggle('selSubs','${esc(k)}')`)).join("")}</div>`;
      next = `<button class="btn p big" onclick="${W.keyword ? "wizGo(5)" : "toast('키워드를 적어주세요')"}">참고 릴스 고르기 →</button>`;
    } else if (s === 5) {
      body = await renderRefsStep();
      next = `<button class="btn p big" id="wiz-next4" onclick="${W.refs.length ? "wizAnalyzeThenTopics()" : "toast('참고 릴스를 1개 이상 골라주세요')"}">주제 고르기 →</button>`;
    } else {
      body = renderTopicStep(); const n = Number(W.setN || 3);
      next = STATIC ? `<button class="btn p big" disabled title="체험판에서는 생성 불가">기획안 만들기 (서버 연결 필요)</button>` : W.making ? `<button class="btn p big" onclick="location.hash='#/plan/${esc(W.making)}'">만드는 중인 기획안 보기</button>`
        : n > 1 ? `<button class="btn p big" id="wiz-make" onclick="wizMakeSet()">촬영 1회차 세트 만들기 <small style="font-weight:500">(${(W.setTopics || []).length}편 · ${(W.setTopics || []).length}회 차감)</small></button>`
        : `<button class="btn p big" id="wiz-make" onclick="wizMake()">기획안 만들기 <small style="font-weight:500">(1회 차감)</small></button>`;
    }
    $("#main").innerHTML = `<div class="wiz">${head}<div class="wiz-body">${body}</div><div class="wiz-foot"><button class="btn big" onclick="wizGo(${s - 1})" ${s === 1 ? "disabled" : ""}>이전</button>${next}</div></div>`;
    if (s === 5 && !W.refsCache.length && (W.keyword || W.selSubs.length)) wizSearchRefs();
  }
  window.wizReset = (e) => { e.preventDefault(); Object.assign(W, { step: 1, job: "", target: [], keyword: "", subs: [], selSubs: [], refs: [], topic: "", topics: [], extra: {}, refsCache: [], urls: "" }); save(); renderWizard(); };   // 모드는 유지

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
    if (W.mainRef && !sel.includes(W.mainRef)) W.mainRef = sel[0] || null; if (!W.mainRef && sel.length) W.mainRef = sel[0];
    return `<h1>참고할 릴스를 골라주세요 <small class="muted">(최대 3개)</small></h1>${connectBox()}<p class="muted"><b>대본은 ★ 주 레퍼런스 1개의 형식·느낌·말투에 고정</b>하고, 나머지는 훅과 편집만 참고합니다. 처음 고른 릴스가 주 레퍼런스가 되고, 아래에서 바꿀 수 있어요. 세트(3~4편)도 같은 주 레퍼런스 구조로 주제만 다르게 만듭니다.</p>
    <div class="pills small">${[W.keyword, ...W.selSubs].filter(Boolean).map(k => `<span class="pill on">#${esc(k)}</span>`).join("")}<button class="btn small" onclick="wizSearchRefs()">다시 찾기</button>${STATIC ? "" : `<button class="btn small" onclick="wizCrossRefs()" title="업종은 달라도 구조가 좋으면 대입해 봅니다">다른 업종에서 터진 구조 보기</button>`}</div>
    <div class="wiz-sel">${sel.length ? `선택 ${sel.length}/3 · ` + sel.map(id => `<span class="pill on tiny ${W.mainRef === id ? "main" : ""}"><span onclick="wizMain(${id})" title="주 레퍼런스로 지정">${W.mainRef === id ? "★ 주 레퍼런스" : "☆ 주로"}</span> @${esc((W.refsCache.find(x => x.id === id) || {}).account || id)} <span onclick="wizPick(${id})">✕</span></span>`).join(" ") : "아직 고른 릴스가 없어요"}</div>
    <div id="wiz-refs-note" class="muted" style="font-size:12px;margin:2px 0 8px">${W.refsCache.length ? (W.refsSource && W.refsSource !== "db" ? "AI 추천순 · 카드의 파란 글은 고른 이유" : "저장소 기본 순서 · AI가 곧 다시 정렬합니다") : ""}</div>
    <div class="refgrid" id="wiz-refs">${cards || '<div class="muted" style="padding:30px;text-align:center" id="wiz-refs-msg">저장소에서 찾는 중… (1~2초)</div>'}</div>
    <div class="panel soft" style="margin-top:14px"><b>🔗 링크로 직접 넣기</b> <small class="muted">인스타 릴스 링크를 한 줄에 하나씩 (남은 자리 ${3 - sel.length}개)</small>
    <div class="row" style="margin-top:8px;align-items:flex-start"><textarea class="wiz-input" rows="2" placeholder="https://www.instagram.com/reel/..." oninput="wizInput('urls', this)">${esc(W.urls || "")}</textarea><button class="btn" onclick="wizAddUrls()">분석해서 담기</button></div><div id="wiz-url-msg" class="muted"></div></div>`;
  }
  function refCard(x, on) {
    return `<div class="refcard ${on ? "on" : ""}" onclick="wizPick(${x.id})">
      <div class="rc-thumb">${x.thumbnail ? `<img src="${esc(x.thumbnail)}" loading="lazy" onerror="imgRetry(this)">` : ""}${x.label ? `<span class="rc-label">${esc(x.label)}</span>` : x.fill ? `<span class="rc-label soft">같은 카테고리</span>` : ""}<span class="rc-check">${on ? "✓" : ""}</span>${on ? `<span class="rc-on">${W.mainRef === x.id ? "★ 주 레퍼런스" : "선택됨"}</span>` : ""}</div>
      <div class="rc-body"><div class="rc-acc">@${esc(x.account || "")} ${x.frames ? '<span class="tag">분석됨</span>' : ""}</div><div class="rc-desc">${esc(x.description || (x.caption || "").slice(0, 60))}</div>${x.why ? `<div class="rc-why">${esc(x.why)}</div>` : ""}
      <div class="rc-meta">▶ ${fmt(x.views)} · ❤ ${fmt(x.likes)} · ${esc((x.posted_at || "").slice(0, 10))}</div>
      <div class="rc-actions"><a class="btn small" href="${esc(x.url || "https://www.instagram.com/reel/")}" target="_blank" onclick="event.stopPropagation()">원본 ↗</a><button class="btn small" onclick="event.stopPropagation();openReel(${x.id})">자세히</button></div></div></div>`;
  }
  window.wizPick = (id) => { const i = W.refs.indexOf(id); if (i >= 0) W.refs.splice(i, 1); else { if (W.refs.length >= 3) return toast("참고 릴스는 최대 3개예요"); W.refs.push(id); } if (!W.refs.includes(W.mainRef)) W.mainRef = W.refs[0] || null; W.topics = []; save(); renderWizard(); };
  window.wizMain = (id) => { W.mainRef = id; W.topics = []; save(); renderWizard(); toast("이 릴스에 대본을 고정합니다"); };
  window.wizCrossRefs = async function () {
    const cnt = {}; W.refsCache.forEach(x => { if (x.industry) cnt[x.industry] = (cnt[x.industry] || 0) + 1; }); const mine = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 1).map(x => x[0]).join(",");
    toast("다른 업종에서 터진 구조를 찾는 중…");
    try { const r = await api("/api/plan/refs?cross=1&limit=18&exclude=" + encodeURIComponent(mine)); const have = new Set(W.refsCache.map(x => x.id)); const add = (r.items || []).filter(x => !have.has(x.id)); W.refsCache = [...add, ...W.refsCache]; save(); renderWizard(); toast(add.length ? `다른 업종 릴스 ${add.length}개를 위에 올렸어요` : "새로 보여줄 릴스가 없어요"); }
    catch (e) { toast("실패: " + e.message); }
  };
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
    hideWait(); W.topics = []; save(); wizGo(6);
  };
  let TOPICS_LOADING = false;
  function renderTopicStep() {
    const t = W.topics || [];
    if (!t.length && !TOPICS_LOADING && W.refs.length && !STATIC) setTimeout(() => wizTopics(), 50);
    const LEN = ["15", "30", "45", "60", "90"]; if (!W.extra.length) W.extra.length = "30";
    if (!W.setN) W.setN = "3"; W.setTopics = W.setTopics || []; const N = Number(W.setN); const isSet = N > 1;
    return `<h1>어떤 주제로 찍을까요?</h1>${connectBox()}
    <div class="wiz-sub">영상 길이 <small class="muted">기승전결이 다 들어가는 기준으로 씬을 나눕니다</small></div>
    <div class="pills">${LEN.map(l => pill(l + "초", String(W.extra.length) === l, `wizExtraSet('length','${l}')`)).join("")}</div>
    <div class="wiz-sub">몇 편을 한 번에 찍을까요? <small class="muted">촬영 1회차 세트 — 전부 같은 주 레퍼런스 구조로, 주제만 다르게 만듭니다</small></div>
    <div class="pills">${[["1", "1편만"], ["3", "3편 세트"], ["4", "4편 세트"]].map(([v, l]) => pill(l, String(W.setN) === v, `wizSetN('${v}')`)).join("")}</div>
    ${isSet ? `<div class="set-picked"><b>고른 주제 ${W.setTopics.length}/${N}</b>${W.setTopics.map((t, i) => `<span class="pill on tiny">${i + 1}. ${esc(t)} <span onclick="wizTopicDrop(${i})">✕</span></span>`).join("")}<div class="row" style="margin-top:6px;gap:6px"><input id="wiz-topic-add" class="wiz-input" style="padding:8px 12px;font-size:13px" placeholder="주제 직접 추가 (Enter)" onkeydown="if(event.key==='Enter'){wizTopicAdd(this.value);this.value=''}"><input class="wiz-input" style="padding:8px 12px;font-size:13px;max-width:220px" placeholder="세트 공통 댓글 키워드 (예: 교정)" value="${esc(W.extra.set_cta_keyword || "")}" oninput="wizExtra('set_cta_keyword', this)"></div></div>` : ""}<p class="muted">고른 참고 릴스의 구조에서 뽑은 주제예요. 하나 고르거나 직접 적어주세요. 주제는 전부 주 레퍼런스의 형식에 그대로 끼워 넣을 수 있게 나옵니다. 첫 문장(훅)은 콕 집기·이득·손해 3개로 뽑아요.</p>
    <div class="row" style="margin-bottom:10px;flex-wrap:wrap;gap:6px"><input id="wiz-dir" class="wiz-input" style="flex:1;min-width:220px;padding:8px 12px;font-size:13px" placeholder="원하는 방향이 있으면 (예: 실패담 위주 / 손님 반응 / 가격 얘기는 빼고)" value="${esc(W.direction || "")}" oninput="wizInput('direction', this)"><button class="btn" onclick="wizTopics()">${t.length ? "이 방향으로 다시 뽑기" : "추천 주제 뽑기"}</button>${t.length ? `<button class="btn" onclick="wizTopics(true)">+ 다른 주제 8개 더</button>` : ""}<span id="wiz-topic-msg" class="muted" style="width:100%">${!t.length && !STATIC ? "준희 님 노하우(훅 공식·타깃 문제)를 적용해 주제 뽑는 중… (20~30초)" : STATIC ? "체험판에서는 주제 추천이 안 돼요. 직접 적어주세요." : ""}</span></div>
    <div class="topics">${t.map((x, i) => `<div class="topic ${(isSet ? W.setTopics.includes(x.title) : W.topic === x.title) ? "on" : ""}" onclick="wizTopicPick(${i})"><b>${esc(x.title)}</b>${x.why ? `<div class="topic-why">${esc(x.why)}</div>` : ""}<div class="muted">${x.source && /터진/.test(x.source) ? `<span class="tag ok">${esc(x.source)}</span> ` : x.source ? `<span class="tag">${esc(x.source)}</span> ` : ""}${x.angle ? `<span class="tag">${esc(x.angle)}</span> ` : ""}${x.hook_type ? `<span class="tag">${esc(x.hook_type)}</span> ` : ""}${esc(x.from || "")}</div></div>`).join("")}</div>
    ${isSet ? "" : `<label class="wiz-label">직접 적기 (비워두면 AI가 레퍼런스 구조에서 정합니다)</label><input class="wiz-input" placeholder="예: 조회수 800 나오던 카페 릴스, 첫 문장 바꿨더니 11만" value="${t.find(x => x.title === W.topic) ? "" : esc(W.topic)}" oninput="wizInput('topic', this)">`}
    <div class="wiz-sub">편집은 어떻게? <small class="muted">고른 대로 캡컷 편집표·편집 외주서에 반영</small></div>
    <div class="prefs">
      <div><small>자막 스타일</small><div class="pills small">${["레퍼런스대로", "굵은 고딕+외곽선", "노란 강조 단어", "검정 박스 자막", "타자기 애니", "자막 최소"].map(v => pill(v, (W.prefs || {}).caption_style === v, `wizPref('caption_style','${v}')`)).join("")}</div></div>
      <div><small>효과음</small><div class="pills small">${["레퍼런스대로", "많이", "포인트만", "없음"].map(v => pill(v, (W.prefs || {}).sfx === v, `wizPref('sfx','${v}')`)).join("")}</div></div>
      <div><small>속도</small><div class="pills small">${["레퍼런스대로", "빠르게(1~2초 컷)", "보통", "차분하게"].map(v => pill(v, (W.prefs || {}).pace === v, `wizPref('pace','${v}')`)).join("")}</div></div>
      <div><small>편집은 어느 레퍼런스를 따라갈까</small><div class="pills small">${[["가장 잘 맞는 것", "auto"], ...W.refs.map((id, i) => ["레퍼런스 " + (i + 1) + " @" + ((W.refsCache.find(x => x.id === id) || {}).account || id), String(i + 1)])].map(([l, v]) => pill(l, (W.prefs || {}).follow_ref === v, `wizPref('follow_ref','${v}')`)).join("")}</div></div>
      <input class="wiz-input" style="padding:8px 12px;font-size:13px" placeholder="편집에서 꼭 넣고 싶은 것 / 빼고 싶은 것 (예: 줌인 많이, 이모지 자막 금지)" value="${esc((W.prefs || {}).memo || "")}" oninput="W.prefs=W.prefs||{};W.prefs.memo=this.value;save()">
    </div>
    <div class="row" style="margin:6px 0 10px;gap:8px;align-items:center"><span class="muted" style="font-size:12px">생성 모드</span>${pill("빠름 (1~2분)", W.speed === "fast", "wizSet('speed','fast')")}${pill("정밀 (3~4분)", W.speed !== "fast", "wizSet('speed','precise')")}</div>
    <div class="wiz-summary"><b>정리</b> <span class="tag">${esc(MODE_NAME[W.mode] || "")}</span> ${esc(W.job)}${Object.values(W.extra.mf || {}).filter(Boolean).length ? " · " + esc(Object.values(W.extra.mf || {}).filter(Boolean).join(" / ")) : ""} → ${esc(W.target.join(", "))}${W.extra.target_free ? " · " + esc(W.extra.target_free) : ""} · #${esc(W.keyword)} ${W.selSubs.map(k => "#" + esc(k)).join(" ")} · 참고 릴스 ${W.refs.length}개 · ${esc(W.extra.length || 30)}초</div>`;
  }
  const brief = () => ({ main_ref: Math.max(1, W.refs.indexOf(W.mainRef) + 1), character: W.extra.ch || {}, funnel: W.extra.funnel || "", product: W.extra.product || ((W.extra.mf || {}).product) || "", set_cta_keyword: W.extra.set_cta_keyword || "", mode: W.mode || "own", mode_fields: Object.fromEntries(Object.entries(W.extra.mf || {}).filter(([k, v]) => v)), edit_prefs: Object.fromEntries(Object.entries(W.prefs || {}).filter(([k, v]) => v && v !== "레퍼런스대로" && v !== "auto")), job: W.job, target: [...W.target, W.extra.target_free].filter(Boolean).join(", "), keyword: [W.keyword, ...W.selSubs].filter(Boolean).join(", "), topic: W.topic, length: W.extra.length || 30, tone: W.extra.tone, scene: W.extra.scene, numbers: W.extra.numbers, cta: W.extra.cta, shooting: W.extra.shooting });
  window.wizSetN = (v) => { W.setN = v; if (Number(v) <= 1) W.setTopics = []; else W.setTopics = (W.setTopics || []).slice(0, Number(v)); save(); renderWizard(); };
  window.wizTopicPick = (i) => { const x = (W.topics || [])[i]; if (!x) return; if (Number(W.setN || 3) > 1) { const a = W.setTopics = W.setTopics || []; const k = a.indexOf(x.title); if (k >= 0) a.splice(k, 1); else { if (a.length >= Number(W.setN)) return toast(`세트는 ${W.setN}편까지예요`); a.push(x.title); } } else W.topic = x.title; save(); renderWizard(); };
  window.wizTopicAdd = (v) => { v = (v || "").trim(); if (!v) return; const a = W.setTopics = W.setTopics || []; if (a.length >= Number(W.setN || 3)) return toast(`세트는 ${W.setN}편까지예요`); if (!a.includes(v)) a.push(v); save(); renderWizard(); };
  window.wizTopicDrop = (i) => { (W.setTopics || []).splice(i, 1); save(); renderWizard(); };
  window.wizMakeSet = async function () {
    const topics = (W.setTopics || []).slice(0, Number(W.setN || 3)); if (topics.length < 2) return toast("세트는 주제를 2개 이상 골라주세요");
    if (!W.refs.length) return toast("참고 릴스를 골라주세요");
    const b = $("#wiz-make"); if (b) b.disabled = true;
    for (const id of W.refs) { const c = W.refsCache.find(x => x.id === id); if (c && c.frames) continue;
      try { const it = await api("/api/items/" + id); if (it.frames) continue; showWait("참고 릴스 뜯는 중", 35, `@${it.account} 영상을 받아 컷·자막·대사를 뽑는 중`); await post("/api/analyze", { url: it.url }); hideWait(); } catch (e) { hideWait(); toast("분석 건너뜀: " + e.message); } }
    try { const r = await post("/api/plan/set", { ids: W.refs, brief: brief(), topics, mode: W.speed === "fast" ? "fast" : "precise" }); if (r.error) throw new Error(r.error);
      W.topic = ""; W.topics = []; W.setTopics = []; W.step = 1; save(); location.hash = "#/plan/set/" + r.id; }
    catch (e) { toast("실패: " + e.message); if (b) b.disabled = false; }
  };
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
    const fast = W.speed === "fast"; const expect = fast ? 150 : 240;
    showWait("기획안 만드는 중", expect, "레퍼런스 프레임을 한 장씩 보면서 씬표를 쓰고 있어요");
    try {
      const r = await post("/api/plan", { ids: W.refs, brief: brief(), mode: fast ? "fast" : "precise" });
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
  window.sharePlan = async (pid) => { try { const r = await post("/api/plans/" + pid + "/share", {}); if (r.error) throw new Error(r.error); const url = location.origin + location.pathname + "#/share/" + r.token; await navigator.clipboard.writeText(url).catch(() => {}); toast("사장님용 링크를 복사했어요 — 카톡에 붙여넣으세요 (로그인한 사람만 열 수 있어요)"); prompt("사장님께 보낼 링크 (복사됨)", url); } catch (e) { toast("실패: " + e.message); } };
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
  const breathLines = (say) => String(say || "").replace(/([.?!])\s+/g, "$1\n").split(/\n+/).map(x => x.trim()).filter(Boolean);
  function thumbBlockHtml(plan, p) {
    const thumbLines = String(plan.thumbnail_text || "").split(/\n/).filter(Boolean); const cands = (plan.thumb_candidates || []).filter(Boolean);
    return `<div class="thumb-block"><div class="thumb-mock"><div class="tm-text">${thumbLines.length ? thumbLines.map(l => `<span>${tmLine(l)}</span>`).join("") : '<span class="muted">문구 없음</span>'}</div><div class="tm-cap">썸네일 미리보기</div></div>
      <div class="thumb-side"><div class="thumb-label">썸네일 문구 <small>= 메인 후킹 문구</small></div><textarea id="thumb-text" class="thumb-input" rows="2" placeholder="첫줄 (Enter) 둘째줄" oninput="thumbLive(this, '${esc(p.id)}')">${esc(plan.thumbnail_text || "")}</textarea>
        <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px"><button class="btn small" onclick="saveThumb('${esc(p.id)}')">저장</button><button class="btn small" onclick="thumbFromHook('${esc(p.id)}')">고른 훅에서 가져오기</button><button class="btn small" onclick="genThumbs('${esc(p.id)}')">AI로 후보 3개 뽑기</button></div>
        ${cands.length ? `<div class="thumb-cands">${cands.map(c => `<button class="tcand" onclick="pickThumb('${esc(p.id)}', ${JSON.stringify(c).replace(/"/g, "&quot;")})">${esc(c).replace(/\n/g, " / ")}</button>`).join("")}</div>` : ""}</div></div>`;
  }
  function renderEasyTab(plan, p) {
    const B = plan.B_plan || {}; const hooks = B.hooks || []; const rec = B.recommended_hook || 1; const scenesAll = B.scenes || []; const h = hooks[rec - 1] || {};
    const S = plan.summary || {}; const F3 = S.first3 || {}; const PP = plan.prep_pack || {}; const C = plan.cautions || {}; const groups = phGroups(plan);
    const partsMeta = Object.fromEntries((plan.parts || []).map(x => [x.part, x])); const mainRef = (p.refs || [])[(plan.main_ref || 1) - 1];
    const core = S.core_message || plan.one_line || ""; const s0 = scenesAll[0] || {};
    const f3 = [["말", F3.say || h.line || s0.say], ["화면", F3.screen || h.first_screen || s0.screen], ["자막", F3.caption || h.top_caption || h.first_caption || s0.caption]];
    const cta = S.cta || (B.cta || {}).say || ""; const inserts = (S.must_inserts || []).length ? S.must_inserts : (B.shot_list || []).slice(0, 4); const melted = S.melted_points || [];
    const script = scenesAll.map(x => x.say || "").join(" ");
    const blocks = []; scenesAll.forEach(sc => { const k = sc.part === "훅" ? "기" : (sc.part || ""); const last = blocks[blocks.length - 1]; if (last && last.part === k) last.scenes.push(sc); else blocks.push({ part: k, scenes: [sc] }); });
    const scriptHtml = blocks.map(bk => { const m = partsMeta[bk.part] || {};
      return `<div class="sx-row part-${esc(bk.part)}"><div class="sx-side"><b>${esc(bk.part)}</b><span>${esc(m.role || PARTROLE[bk.part] || "")}</span>${m.device ? `<em title="${esc(m.how || "")}">${esc(m.device)}</em>` : ""}</div><div class="sx-lines">${bk.scenes.map(sc => breathLines(sc.say).map(l => `<p>${phHtml(l)}</p>`).join("")).join("")}</div></div>`; }).join("");
    const ctx = (g) => { const a0 = Math.max(0, g.start - 32), b1 = Math.min(g.text.length, g.end + 32); return `${a0 > 0 ? "…" : ""}${phHtml(g.text.slice(a0, g.start))}<span class="ph-slot">${esc(g.label)}</span>${phHtml(g.text.slice(g.end, b1))}${b1 < g.text.length ? "…" : ""}`; };
    const PART = { 기: "기", 승: "승", 전: "전", 결: "결" };
    const sceneCard = (sc, si) => { const g = sc.guide || {}; const f = sc.framing || {}; const img = sc.sketch ? `<img src="${esc(sc.sketch)}" loading="lazy">` : (refFrameImg(p, sc.ref_frame) || "");
      const how = [g.composition || [f.shot, f.camera].filter(Boolean).join(" · "), g.action].filter(Boolean); const hasPh = /\[확인\s*필요/.test(sc.say || "");
      return `<div class="ez-scene"><div class="ez-img">${img}<span class="ez-no">${sc.no}</span></div><div class="ez-body"><div class="ez-meta"><span class="tag part-${esc(sc.part || "")}">${esc(PART[sc.part] || (sc.part === "훅" ? "기" : sc.part) || "")}</span><span class="muted">${esc(sc.sec)}초</span>${sc.hold ? `<span class="ez-hold" title="이 장면에서 붙잡는 장치">${esc(sc.hold)}</span>` : ""}</div>
        <div class="ez-say">${hasPh ? phHtml(sc.say) : ed("B_plan.scenes." + si + ".say", sc.say, "inline", "span")}</div>
        ${sc.caption ? `<div class="ez-cap">자막 <b>${phHtml(sc.caption)}</b></div>` : ""}
        ${how.length ? `<div class="ez-how">${how.map(x => `<div>${esc(x)}</div>`).join("")}</div>` : ""}
        <details class="ez-more"><summary>자세히 (화면·조명·소품·의상·편집)</summary><dl class="ez-dl"><dt>화면</dt><dd>${phHtml(sc.screen || "-")}</dd>${g.camera ? `<dt>폰</dt><dd>${esc(g.camera)}</dd>` : ""}${g.light ? `<dt>조명</dt><dd>${esc(g.light)}</dd>` : ""}${g.props ? `<dt>소품</dt><dd>${esc(g.props)}</dd>` : ""}${g.wear ? `<dt>의상·배경</dt><dd>${esc(g.wear)}</dd>` : ""}${g.look ? `<dt>표정·시선</dt><dd>${esc(g.look)}</dd>` : ""}${g.take ? `<dt>테이크</dt><dd>${esc(g.take)}</dd>` : ""}</dl><div class="cchips">${chips(sc.capcut) || ""}</div>${sc.tip ? `<div class="sb-tip">${esc(sc.tip)}</div>` : ""}</details></div></div>`; };
    const hookCard = (x, i) => `<div class="hk ${i + 1 == rec ? "on" : ""}"><div class="hk-top"><span class="tag htype">${esc(x.type || "")}</span>${i + 1 == rec ? '<span class="tag ok">적용됨</span>' : `<button class="hook-pick" onclick="applyHook('${esc(p.id)}', ${i + 1})">이걸로</button>`}</div><div class="hk-line">${phHtml(x.line || "")}</div>
      <dl class="hk-dl">${x.first_screen ? `<dt>첫 화면</dt><dd>${esc(x.first_screen)}</dd>` : ""}${x.zoom ? `<dt>줌</dt><dd>${esc(x.zoom)}</dd>` : ""}${x.top_caption || x.first_caption ? `<dt>상단 자막</dt><dd>${phHtml(x.top_caption || x.first_caption)}</dd>` : ""}${x.first_sfx ? `<dt>효과음</dt><dd>${esc(x.first_sfx)}</dd>` : ""}${x.face ? `<dt>표정</dt><dd>${esc(x.face)}</dd>` : ""}${x.pattern ? `<dt>훅 패턴</dt><dd class="muted">${esc(x.pattern)}</dd>` : ""}</dl></div>`;
    const list = (arr) => (arr || []).filter(Boolean).map(x => `<li>${phHtml(String(x))}</li>`).join("");
    const prepItems = (PP.items || []).length ? PP.items : (B.prep || []); const order = (PP.order || []).length ? PP.order : [];
    const hasCaution = (C.fact_check || []).length || (C.ad_review || []).length || C.meta_ads_version;
    return `<div class="ez2">
      <section class="sum-card">
        <div class="sum-head"><div class="sum-tags">${plan.format ? `<span class="tag fmt">${esc(plan.format)}</span>` : ""}<span class="tag">${esc(plan.length_sec)}초 · ${scenesAll.length}장면</span>${S.cut_ratio ? `<span class="tag">${esc(S.cut_ratio)}</span>` : ""}${plan.ending_type ? `<span class="tag">끝: ${esc(plan.ending_type)}</span>` : ""}${mainRef ? `<span class="tag ref">주 레퍼런스 @${esc(mainRef.account || "")} ▶ ${fmt(mainRef.views)}</span>` : ""}</div>
          <div class="sum-actions"><button class="btn small p" onclick="sharePlan('${esc(p.id)}')">사장님께 보내기</button><button class="btn small" onclick="navigator.clipboard.writeText(${JSON.stringify(scenesAll.map(x => breathLines(x.say).join("\n")).join("\n")).replace(/"/g, "&quot;")});toast('대본 복사됨')">대본 복사</button><button class="btn small" onclick="openPrompter()">크게 보기</button></div></div>
        <div class="sum-core"><small>핵심 메시지</small><p>${phHtml(core)}</p></div>
        <div class="f3"><div class="f3-title">첫 3초</div>${f3.map(([k, v]) => `<div class="f3-cell"><small>${k}</small><div>${phHtml(v || "-")}</div></div>`).join("")}</div>
        <div class="sum-grid">${cta ? `<div><small>CTA</small><div>${phHtml(cta)}</div></div>` : ""}${inserts.length ? `<div><small>필수 인서트</small><ul>${list(inserts)}</ul></div>` : ""}${melted.length ? `<div><small>녹인 포인트</small><ul>${list(melted)}</ul></div>` : ""}</div>
      </section>
      <section class="ez-sec"><h3>첫 문장 고르기 <small>콕 집기 · 이득 · 손해 — 누르면 1번 장면과 썸네일 문구가 같이 바뀝니다</small></h3><div class="hks">${hooks.map(hookCard).join("")}</div>
        <details class="ez-more" style="margin-top:8px"><summary>다른 훅 공식으로 더 뽑기 · 첫 장면 다시 쓰기</summary><div class="row" style="gap:6px;flex-wrap:wrap;margin-top:8px"><select id="hook-formula" class="chip" style="max-width:180px">${HOOK_FORMULAS.map(f => `<option>${f}</option>`).join("")}</select><button class="btn small" onclick="genHooks('${esc(p.id)}')">이 공식으로 3개 더</button><button class="btn small" onclick="rewriteOpening('${esc(p.id)}', ${rec})">첫 문장에 맞춰 1~2번 장면 다시 쓰기</button><span id="hook-msg" class="muted" style="font-size:12px"></span></div></details></section>
      <section class="ez-sec"><h3>대본 <small>${esc(plan.length_sec)}초 · 한 줄이 한 호흡 · 왼쪽은 구간과 붙잡는 장치</small></h3><div class="sx">${scriptHtml}</div>
        ${groups.length ? `<details class="ez-fill2" open><summary><b>빈칸 ${groups.length}곳</b> — 내 숫자로 채우면 대본·자막·캡션에 한 번에 들어갑니다 (모르면 비워 두세요)</summary><div class="fill-list">${groups.map((g, gi) => `<div class="fill-row"><div class="fr-ctx"><div class="fr-where">${esc(g.where.slice(0, 3).join(" · "))}${g.where.length > 3 ? ` 외 ${g.where.length - 3}곳` : ""}${g.occ.length > 1 ? ` <b class="fr-n">${g.occ.length}곳 같이 바뀜</b>` : ""}</div><div class="fr-text">${ctx(g)}</div></div><input class="fill-in" data-gi="${gi}" placeholder="${esc(phHint(g.label))}"></div>`).join("")}</div><button class="btn p" style="margin-top:10px" onclick="fillNumbers('${esc(p.id)}')">대본에 채우기</button></details>` : ""}</section>
      <section class="ez-sec"><h3>장면 <small>${scenesAll.length}장면 · 장면마다 2번씩 찍으세요 · 대사는 눌러서 바로 고칠 수 있어요</small></h3><div class="ez-scenes">${scenesAll.map(sceneCard).join("")}</div></section>
      <section class="ez-sec"><h3>촬영 준비 <small>사장님께 보내는 화면에도 이 내용이 나갑니다</small></h3><div class="prep-grid">
        ${prepItems.length ? `<div><small>준비물</small><ul>${list(prepItems)}</ul></div>` : ""}${PP.wear ? `<div><small>의상</small><p>${esc(PP.wear)}</p></div>` : ""}${PP.location ? `<div><small>촬영 배경</small><p>${esc(PP.location)}</p></div>` : ""}${order.length ? `<div><small>촬영 순서</small><ol>${list(order)}</ol></div>` : ""}${(B.shot_list || []).length ? `<div><small>찍을 것 전체</small><ul>${list(B.shot_list)}</ul></div>` : ""}</div></section>
      <section class="ez-sec"><h3>올릴 때</h3><div class="up-grid"><div><small>캡션</small><div class="up-cap">${phHtml(B.caption_text || "-")}</div><button class="btn small" style="margin-top:6px" onclick="navigator.clipboard.writeText(${JSON.stringify(B.caption_text || "").replace(/"/g, "&quot;")});toast('캡션 복사됨')">캡션 복사</button></div>
        <div><small>마지막 멘트</small><p>${phHtml((B.cta || {}).say || "-")}</p><small>댓글 질문</small><p>${phHtml((B.cta || {}).comment_question || "-")}</p>${B.music ? `<small>음악</small><p>${esc(B.music)}</p>` : ""}</div></div>${thumbBlockHtml(plan, p)}</section>
      ${hasCaution ? `<section class="ez-sec caution"><h3>주의사항 <small>올리기 전에 확인</small></h3><div class="prep-grid">${(C.fact_check || []).length ? `<div><small>사실 확인이 필요한 숫자·주장</small><ul>${list(C.fact_check)}</ul></div>` : ""}${(C.ad_review || []).length ? `<div><small>광고 심의 표현</small><ul>${list(C.ad_review)}</ul></div>` : ""}${C.meta_ads_version ? `<div><small>메타 광고로 돌릴 때 순화 버전</small><p>${phHtml(C.meta_ads_version)}</p></div>` : ""}</div></section>` : ""}
      ${modePackHtml(plan, "ez")}
      <section class="ez-sec"><h3>레퍼런스 <small>대본은 주 레퍼런스 1개에 고정했어요</small></h3>${mainRef ? `<div class="ref-mini"><img src="${esc(mainRef.thumbnail || "")}" onerror="this.style.visibility='hidden'"><div><b>@${esc(mainRef.account || "")}</b> <span class="muted">▶ ${fmt(mainRef.views)} · ${esc(mainRef.industry || "")}</span><div class="muted" style="font-size:13px">${esc(mainRef.description || "")}</div><div class="row" style="gap:6px;margin-top:6px"><a class="btn small" href="${esc(mainRef.url || "#")}" target="_blank" rel="noopener">원본 ↗</a><button class="btn small" onclick="planTab('refs')">레퍼런스 뜯어보기</button></div></div></div>` : ""}
        ${(plan.ref_flow || []).length ? `<div class="ref-flow"><small>주 레퍼런스의 흐름 — 이 순서 그대로 내 소재를 넣었어요</small><ol>${plan.ref_flow.map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>` : ""}
        ${(plan.ref_map || []).length ? `<details class="ez-more" style="margin-top:8px"><summary>레퍼런스 ↔ 내 대본 나란히 보기</summary><div class="refmap">${plan.ref_map.map(r => `<div class="rm-row"><span class="tag part-${esc(r.part || "")}">${esc(r.part || "")}</span><div><small>레퍼런스</small><p>${esc(r.ref || "")}</p></div><div><small>내 대본</small><p>${phHtml(r.mine || "")}</p></div></div>`).join("")}</div></details>` : ""}</section>
    </div>`;
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
      ${modePackHtml(plan, "side")}
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
    const plans = await api("/api/plans").catch(() => []); const sets = await api("/api/plansets").catch(() => []);
    const setsHtml = sets.length ? `<div class="plan-toolbar" style="margin:4px 0 8px"><h2 style="margin:0">촬영 세트 <small>${sets.length}개</small></h2></div><div class="set-list">${sets.slice(0, 8).map(x => `<a class="set-chip" href="#/plan/set/${esc(x.id)}"><b>${esc(x.job || "세트")} ${x.n}편</b><span class="muted">${esc((x.topics || []).join(" · ").slice(0, 70))}</span><span class="muted">${esc(x.created_at || "")}</span></a>`).join("")}</div>` : "";
    $("#main").innerHTML = `<div class="plan-home"><div class="hero"><div><div class="ph-kicker">콘텐츠 기획</div><h1>누구를 위한 기획인지 고르면<br>씬별 대본과 캡컷 편집표까지.</h1><p>내 가게 · 브랜드·제품 · 대행사(클라이언트) · 커머스 위탁판매 — 모드를 고르고 타깃 → 키워드 → 참고 릴스(최대 3개) → 주제만 정하면 됩니다. 모드마다 준희 님 강의 노하우(훅 3종·자영업 릴스 4종·소구점 축·PD 문답·촬영 대안)가 대본과 체크리스트에 들어갑니다.</p><button class="btn p big" onclick="wizStart()">+ 새 기획 만들기</button> ${W.job ? `<button class="btn big ghost2" onclick="wizResume()">이어서 하기 (STEP ${W.step})</button>` : ""}</div><div class="hero-art"><i></i><i></i><i></i></div></div>
    <div class="panel soft" style="margin-bottom:14px"><b>처음이세요? 이렇게 됩니다 (5분)</b><ol style="margin:6px 0 0 18px;line-height:1.8"><li>누구를 위한 기획인지(내 가게 / 브랜드·제품 / 대행사 / 위탁판매)와 보여줄 사람을 버튼으로 고릅니다</li><li>카메라 앞에 서는 사람의 캐릭터, 영상 끝에서 보낼 곳, 내 경험과 숫자를 적습니다</li><li>키워드 하나 적으면 참고할 릴스가 뜹니다. ★ 주 레퍼런스 1개에 대본을 고정하고, 다른 업종에서 터진 구조도 버튼으로 볼 수 있어요</li><li>주제를 3~4개 고르면 촬영 1회차 세트가 같은 구조로 한 번에 나옵니다. 맨 위 요약 → 첫 문장 3개 → 대본 통째 → 장면 → 촬영 준비 순서예요</li><li>사장님께는 "사장님께 보내기" 링크로 대본·준비물·의상·촬영 배경만 보내고, 편집자에게는 편집 외주용 탭을 넘기면 끝</ol></div>
    ${setsHtml}${planListHtml(plans)}</div>`;
  };
  let SET_T = null;
  window.shareSet = async (sid) => { try { const r = await post("/api/plansets/" + sid + "/share", {}); if (r.error) throw new Error(r.error); const url = location.origin + location.pathname + "#/share/" + r.token; await navigator.clipboard.writeText(url).catch(() => {}); toast("세트 링크를 복사했어요 — 카톡에 붙여넣으세요 (로그인한 사람만 열 수 있어요)"); prompt("사장님께 보낼 세트 링크 (복사됨)", url); } catch (e) { toast("실패: " + e.message); } };
  window.viewPlanSet = async function (sid) {
    clearInterval(SET_T);
    const draw = async () => {
      const st = await api("/api/plansets/" + sid); if (st.error) { $("#main").innerHTML = `<div class="empty"><b>${esc(st.error)}</b></div>`; return true; }
      const vids = st.videos || []; const doneN = vids.filter(v => v.status === "done").length; const b = st.brief || {};
      const items = [...new Set(vids.flatMap(v => ((v.prep_pack || {}).items) || []))];
      const byLoc = {}; vids.forEach(v => { const k = ((v.prep_pack || {}).location || "배경 미정").trim(); (byLoc[k] = byLoc[k] || []).push(v); });
      $("#main").innerHTML = `<div class="plan-hero"><a class="btn ghost" href="#/plan">← 기획</a><div class="ph-title"><span class="ph-kicker">촬영 1회차 세트 · ${esc(st.created_at || "")}</span><h1>${esc(b.job || "")} ${vids.length}편</h1><p>전부 같은 주 레퍼런스 구조로, 주제만 다르게 만들었어요. ${doneN < vids.length ? `만드는 중 ${doneN}/${vids.length} — 한 편에 3~4분, 두 편씩 동시에 돌아갑니다.` : "전부 완성됐어요."}</p></div>
        <div class="ph-actions"><button class="btn p" onclick="shareSet('${esc(st.id)}')" ${doneN ? "" : "disabled"}>사장님께 세트 링크 보내기</button></div></div>
        <div class="set-grid">${vids.map(v => `<div class="set-card ${v.status === "done" ? "done" : ""}" ${v.status === "done" ? `onclick="location.hash='#/plan/${esc(v.id)}'"` : ""}><div class="set-no">${v.no}</div><div class="set-body"><b>${esc(v.title || v.topic || "")}</b>${v.title && v.topic && v.title !== v.topic ? `<div class="muted" style="font-size:12.5px">주제: ${esc(v.topic)}</div>` : ""}
          ${v.status === "done" ? `<div class="set-meta">${v.format ? `<span class="tag">${esc(v.format)}</span>` : ""}${v.length_sec ? `<span class="tag">${esc(v.length_sec)}초</span>` : ""}</div>${v.hook ? `<div class="set-hook">“${phHtml(v.hook)}”</div>` : ""}${(v.summary || {}).core_message ? `<div class="muted" style="font-size:13px">${esc(v.summary.core_message)}</div>` : ""}<div class="set-prep">${(v.prep_pack || {}).wear ? `<span>의상 · ${esc(v.prep_pack.wear)}</span>` : ""}${(v.prep_pack || {}).location ? `<span>배경 · ${esc(v.prep_pack.location)}</span>` : ""}</div><span class="btn small" style="align-self:flex-start">기획안 열기 →</span>`
            : v.error ? `<div class="muted" style="color:#b91c1c">실패: ${esc(v.error)}</div>` : `<div class="wait-bar" style="margin-top:8px"><i style="width:${Math.max(4, v.pct || 0)}%"></i></div><div class="muted" style="font-size:12px">${v.stage === "unknown" || !v.stage ? "순서를 기다리는 중" : "쓰는 중 " + Math.round(v.pct || 0) + "%"}</div>`}</div></div>`).join("")}</div>
        ${doneN ? `<div class="ez2" style="margin-top:16px"><section class="ez-sec"><h3>촬영 당일 <small>같은 배경끼리 묶어서 찍으세요 · 의상은 편마다 바꿔 입기</small></h3><div class="prep-grid"><div><small>촬영 순서(배경별)</small><ol>${Object.entries(byLoc).map(([k, arr]) => `<li><b>${esc(k)}</b> — ${arr.map(v => v.no + "편").join(", ")}</li>`).join("")}</ol></div>${items.length ? `<div><small>준비물 전체</small><ul>${items.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}<div><small>의상</small><ul>${vids.filter(v => (v.prep_pack || {}).wear).map(v => `<li>${v.no}편 · ${esc(v.prep_pack.wear)}</li>`).join("")}</ul></div></div></section></div>` : ""}`;
      return !!st.done;
    };
    try { const fin = await draw(); if (!fin) SET_T = setInterval(async () => { if (location.hash.indexOf("#/plan/set/" + sid) !== 0) return clearInterval(SET_T); try { if (await draw()) clearInterval(SET_T); } catch (e) {} }, 6000); } catch (e) { $("#main").innerHTML = `<div class="empty"><b>세트를 불러오지 못했어요</b>${esc(e.message)}</div>`; }
  };
  window.viewShare = async function (token) {
    try { const d = await api("/api/share/" + encodeURIComponent(token)); if (d.error) throw new Error(d.error);
      const PARTN = { 기: "시작", 승: "문제", 전: "해결", 결: "마무리" };
      $("#main").innerHTML = `<div class="share"><div class="share-head"><span class="ph-kicker">하이커브 촬영 안내 · ${esc(d.created_at || "")}</span><h1>${esc(d.title || "촬영 대본")}</h1><p class="muted">촬영 전에 대본을 소리 내어 두세 번 읽어 보세요. 외우지 않아도 됩니다 — 한 줄씩 끊어서 찍어요.</p></div>
        ${(d.videos || []).map((v, i) => `<section class="share-card"><div class="share-no">${(d.videos || []).length > 1 ? (i + 1) + "편" : "대본"}</div><h2>${esc(v.title || "")}</h2><div class="muted" style="font-size:13px;margin-bottom:10px">${[v.format, v.length_sec ? v.length_sec + "초" : ""].filter(Boolean).map(esc).join(" · ")}</div>
          ${v.ready ? `<div class="share-script">${(v.lines || []).map((l, k, arr) => `${k === 0 || arr[k - 1].part !== l.part ? `<div class="share-part">${esc(PARTN[l.part] || "")}</div>` : ""}<p>${esc(l.text)}</p>`).join("")}</div>
          <div class="prep-grid" style="margin-top:14px">${(v.prep.items || []).length ? `<div><small>준비물</small><ul>${v.prep.items.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}${v.prep.wear ? `<div><small>의상</small><p>${esc(v.prep.wear)}</p></div>` : ""}${v.prep.location ? `<div><small>촬영 배경</small><p>${esc(v.prep.location)}</p></div>` : ""}${(v.prep.order || []).length ? `<div><small>촬영 순서</small><ol>${v.prep.order.map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>` : ""}</div>` : `<div class="muted">아직 만드는 중이에요. 잠시 뒤에 다시 열어 주세요.</div>`}</section>`).join("")}</div>`;
    } catch (e) { $("#main").innerHTML = `<div class="empty"><b>열 수 없어요</b>${esc(e.message)}</div>`; }
  };
  window.wizStart = () => { Object.assign(W, { step: 1, topic: "", topics: [] }); save(); if (location.hash !== "#/plan/new") location.hash = "#/plan/new"; else renderWizard(); };
  window.wizResume = () => { if (location.hash !== "#/plan/new") location.hash = "#/plan/new"; else renderWizard(); };
})();
