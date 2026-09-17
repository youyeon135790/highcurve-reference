// 회원·플랜·문의(CS)·관리자 화면. 토큰은 쿠키(같은 서버) + localStorage hc_token(배포본→서버 연결 시 Authorization 헤더)
(function () {
  const post = (p, body) => api(p, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  let ME = null, META_AUTH = { plans: {}, categories: [] };
  window.authState = () => ME;
  window.loadMe = async function () {
    try { const r = await api("/api/auth/me"); ME = r.user; META_AUTH = r; window.AUTH_OPEN = !!r.open; } catch (e) { ME = null; }
    renderAccountBox(); return ME;
  };
  function renderAccountBox() {
    const box = $("#acct"); if (!box) return;
    if (ME) box.innerHTML = `<a href="#/account" class="acct-card"><b>${esc(ME.name)}</b><span class="tag ${ME.role === "admin" ? "ok" : ""}">${esc(ME.role === "admin" ? "관리자" : ME.plan_name)}</span><div class="muted">${ME.quota == null ? "기획안 무제한" : `이번 달 기획안 ${ME.used}/${ME.quota}`}</div></a><div class="row" style="gap:4px;margin-top:6px"><a class="btn small" href="#/support">문의</a>${ME.role === "admin" ? '<a class="btn small" href="#/admin">관리</a>' : ""}<button class="btn small" onclick="doLogout()">로그아웃</button></div>`;
    else box.innerHTML = `<a class="btn p small" href="#/login">로그인 · 가입</a> <a class="btn small" href="#/pricing">요금제</a>`;
  }
  window.doLogout = async () => { try { await post("/api/auth/logout", {}); } catch (e) {} localStorage.removeItem("hc_token"); ME = null; renderAccountBox(); window.__meLoaded = false; location.hash = "#/landing"; toast("로그아웃했어요"); };
  window.requireLogin = (msg) => { if (ME) return true; toast(msg || "로그인이 필요해요"); location.hash = "#/login"; return false; };

  // ---------- 로그인/가입
  window.viewLogin = function (mode) {
    mode = mode || "login";
    $("#main").innerHTML = `<div class="auth-wrap"><div class="auth-card"><a href="#/landing" class="muted" style="font-size:12px">← 소개로 돌아가기</a><div class="ph-kicker" style="margin-top:8px">REELPD</div><h1>${mode === "login" ? "로그인" : "회원가입"}</h1>
      <div class="tabs" style="margin:10px 0 16px"><button class="tab ${mode === "login" ? "on" : ""}" onclick="viewLogin('login')">로그인</button><button class="tab ${mode === "signup" ? "on" : ""}" onclick="viewLogin('signup')">회원가입</button></div>
      ${mode === "signup" ? `<label class="wiz-label">이름</label><input id="au-name" class="wiz-input" placeholder="홍길동">` : ""}
      <label class="wiz-label">${mode === "login" ? "아이디 또는 이메일" : "이메일"}</label><input id="au-email" class="wiz-input" type="text" autocapitalize="off" placeholder="${mode === "login" ? "아이디 또는 이메일" : "you@example.com"}">
      <label class="wiz-label">비밀번호 ${mode === "signup" ? "(6자 이상)" : ""}</label><input id="au-pw" class="wiz-input" type="password" onkeydown="if(event.key==='Enter')authSubmit('${mode}')">
      ${mode === "signup" ? `<label class="wiz-label">수강생 초대 코드 (있으면)</label><input id="au-code" class="wiz-input" placeholder="강의에서 받은 코드 → 수강생 플랜(월 20건)"><div class="muted" style="font-size:12px;margin-top:4px">코드가 없으면 무료 체험(월 2건)으로 시작해요.</div>` : ""}
      <div id="au-msg" class="muted" style="margin:8px 0;min-height:18px"></div>
      <button class="btn p big" style="width:100%" onclick="authSubmit('${mode}')">${mode === "login" ? "로그인" : "가입하고 시작하기"}</button>
      <div class="muted" style="margin-top:14px;font-size:12px">가입하면 <a href="#/support">이용안내·문의</a>를 확인한 것으로 봅니다. 비밀번호를 잊으면 문의로 알려주세요.</div></div></div>`;
    setTimeout(() => { const e = $("#au-email"); if (e) e.focus(); }, 50);
  };
  window.authSubmit = async function (mode) {
    const m = $("#au-msg"); m.textContent = "…";
    const body = { email: $("#au-email").value, password: $("#au-pw").value };
    if (mode === "signup") { body.name = $("#au-name").value; body.code = $("#au-code").value; }
    try {
      const r = await post(mode === "signup" ? "/api/auth/signup" : "/api/auth/login", body);
      if (r.error) throw new Error(r.error);
      if (r.token) localStorage.setItem("hc_token", r.token);
      await loadMe(); window.__meLoaded = true; toast(mode === "signup" ? `환영해요, ${r.user.name}님` : `안녕하세요, ${r.user.name}님`); { let after = null; try { after = sessionStorage.getItem("hc_after"); sessionStorage.removeItem("hc_after"); } catch (e) {} location.hash = after || "#/reels"; }
    } catch (e) { m.textContent = e.message; }
  };

  // ---------- 내 계정
  window.viewAccount = async function () {
    await loadMe(); if (!ME) return viewLogin();
    const inq = await api("/api/inquiries").catch(() => []);
    const P = META_AUTH.plans || {};
    $("#main").innerHTML = `<h1>내 계정</h1><div class="two">
      <section class="panel"><b>${esc(ME.name)}</b> <span class="muted">${esc(ME.email)}</span><table class="kv" style="margin-top:8px"><tr><th>플랜</th><td><b>${esc(ME.plan_name)}</b> ${ME.role === "admin" ? '<span class="tag ok">관리자</span>' : ""}</td></tr><tr><th>이번 달</th><td>${ME.quota == null ? "무제한" : `기획안 ${ME.used} / ${ME.quota}건 (남은 ${ME.remaining}건)`}</td></tr><tr><th>가입</th><td>${esc(ME.created_at)}</td></tr></table>
        <div class="row" style="margin-top:10px"><a class="btn" href="#/pricing">플랜 올리기</a><a class="btn" href="#/plan">내 기획안</a></div></section>
      <section class="panel"><b>비밀번호 바꾸기</b><label class="wiz-label">현재 비밀번호</label><input id="pw-old" class="wiz-input" type="password"><label class="wiz-label">새 비밀번호</label><input id="pw-new" class="wiz-input" type="password"><button class="btn" style="margin-top:8px" onclick="changePw()">바꾸기</button></section></div>
      <h2 style="margin-top:18px">문의</h2><div class="panel"><b>고객센터와 톡으로 이야기해요</b><div class="muted" style="margin:4px 0 10px">남긴 문의와 답변이 한 대화방에 쌓여요. 예전에 남긴 문의도 거기서 볼 수 있어요.</div><a class="btn p" href="#/support">💬 문의 대화방 열기</a></div>`;
  };
  window.changePw = async () => { try { const r = await post("/api/auth/password", { old: $("#pw-old").value, new: $("#pw-new").value }); if (r.error) throw new Error(r.error); toast("바꿨어요"); } catch (e) { toast(e.message); } };
  const inqCard = (q) => `<div class="panel" style="margin-bottom:8px"><div class="row" style="justify-content:space-between"><b>[${esc(q.category)}] ${esc(q.title)}</b><span class="tag ${q.status === "answered" ? "ok" : ""}">${q.status === "open" ? "답변 대기" : q.status === "answered" ? "답변 완료" : "종료"}</span></div><div class="muted" style="font-size:12px">${esc(q.created_at)}</div><div style="white-space:pre-wrap;margin-top:6px">${esc(q.body)}</div>${q.reply ? `<div class="reply"><b>하이커브 답변</b> <span class="muted">${esc(q.replied_at || "")}</span><div style="white-space:pre-wrap">${esc(q.reply)}</div></div>` : ""}</div>`;

  // ---------- 고객센터 (FAQ + 문의)
  const FAQ = [
    ["기획안은 어떻게 만들어지나요?", "직업·타깃·키워드를 고르면 저장소에서 참고 릴스를 찾고, 고른 릴스의 영상을 실제로 뜯어(컷·자막·대사·효과음) 하이커브 기획 원칙으로 씬별 대본·촬영 가이드·캡컷 편집표·편집 외주서를 만듭니다. 3~5분 걸려요."],
    ["기획안 1회에 뭐가 나오나요?", "참고 릴스 최대 3개 영상 분석(컷·자막·대사·효과음) 주제 추천 8개(+더 뽑기) 첫 문장(훅) 5개 ④ 씬별 대본·촬영 가이드·캡컷 편집(기승전결, 고른 길이) ⑤ 전체 대본 ⑥ 씬 구도 스케치 ⑦ 편집 외주서 ⑧ 캡션·찍을 것·준비물. '기획안 만들기'를 누른 순간 1회 차감되고, 같은 조건으로 15분 안에 다시 누르면 새로 만들지 않고 그 기획안을 엽니다."],
    ["수정은 어디까지 되나요?", "기획안 하나당: 대사·자막·화면·캡션 직접 고치기 무제한 · 훅 적용(바꿔 끼우기) 무제한 · 다른 훅 공식으로 3개 더 뽑기 5회 · 훅에 맞춰 씬 1~2 다시 쓰기 3회 · 내 말투로 다듬기 3회 · 스케치 다시 그리기 3회 · 편집 외주서 다시 만들기 2회. 이 한도는 기획안 횟수에서 차감되지 않습니다. 주제나 참고 릴스를 바꾸려면 새 기획안(1회)입니다."],
    ["참고 릴스가 마음에 안 들어요", "4단계에서 '다시 찾기'를 누르거나 서브 키워드를 바꿔보세요. 인스타 릴스 링크를 직접 넣어도 됩니다(최대 3개)."],
    ["대본이 제 말투가 아니에요", "기획안 화면에서 '🗣 내 말투로 다듬기'에 말투를 적어주세요. 대사·자막·캡션은 화면에서 눌러 직접 고칠 수도 있어요."],
    ["[확인 필요] 표시는 뭔가요?", "AI가 지어내지 않기 위해 비워둔 자리예요. 내 실제 숫자·경험으로 채워주세요."],
    ["스케치에 사람이 로봇으로 나와요", "맥 내장 이미지 생성기의 제한이에요. 구도·거리·소품 안내용이고, 옆의 레퍼런스 실제 프레임을 같이 보시면 됩니다."],
    ["유튜브 쇼츠도 기획되나요?", "지금은 인스타 릴스만 기획합니다. 유튜브는 레퍼런스 보기만 돼요."],
    ["결제는 어떻게 하나요?", "요금제 페이지에서 플랜을 신청하면 안내 문의가 생성되고, 계좌 안내 후 확인되면 플랜이 바뀝니다. 카드 자동결제는 준비 중이에요."],
    ["환불은요?", "결제 후 기획안을 1건도 만들지 않았다면 7일 안에 전액 환불됩니다. 이후는 남은 기간 일할 계산해 문의로 처리해요."],
  ];
  window.viewSupport = async function () {
    await loadMe(); const cats = META_AUTH.categories || ["이용 문의", "결제·플랜", "오류 신고", "기획안 품질", "제휴·대행 의뢰", "기타"];
    const inq = ME ? await api("/api/inquiries").catch(() => []) : [];
    const sp = META_AUTH.support || {};
    $("#main").innerHTML = `<h1>고객센터</h1><p class="muted">자주 묻는 질문을 먼저 확인하고, 없으면 문의를 남겨주세요. 평일 24시간 안에 답합니다.</p>
      ${sp.url ? `<a class="btn p big kakao" href="${esc(sp.url)}" target="_blank" rel="noopener">${esc(sp.name || "하이커브 채널")}로 바로 문의</a>` : `<div class="panel warn">하이커브 채널 링크가 아직 설정되지 않았어요 (설정 → 문의 채널). 그동안은 아래 문의 폼으로 받습니다.</div>`}
      <div class="two"><section><h2>자주 묻는 질문</h2>${FAQ.map(([q, a]) => `<details class="faq"><summary>${esc(q)}</summary><div>${esc(a)}</div></details>`).join("")}</section>
      <section><h2>문의하기</h2><div class="panel">${ME ? `<div class="muted">${esc(ME.name)} · ${esc(ME.email)}</div>` : `<label class="wiz-label">이름</label><input id="iq-name" class="wiz-input"><label class="wiz-label">답변 받을 이메일</label><input id="iq-email" class="wiz-input" type="email">`}
        <label class="wiz-label">종류</label><select id="iq-cat" class="wiz-input">${cats.map(c => `<option>${esc(c)}</option>`).join("")}</select>
        <label class="wiz-label">제목</label><input id="iq-title" class="wiz-input" placeholder="예: 기획안이 5분 넘게 안 나와요">
        <label class="wiz-label">내용</label><textarea id="iq-body" class="wiz-input" rows="6" placeholder="어떤 화면에서, 무엇을 눌렀고, 어떻게 됐는지 적어주시면 빨라요. 기획안 제목이 있으면 같이요."></textarea>
        <div id="iq-msg" class="muted" style="margin:6px 0"></div><button class="btn p" onclick="sendInquiry()">보내기</button></div>
      ${inq.length ? `<h2 style="margin-top:16px">내 문의</h2>${inq.map(inqCard).join("")}` : ""}</section></div>`;
  };
  window.sendInquiry = async () => {
    const m = $("#iq-msg"); const body = { category: $("#iq-cat").value, title: $("#iq-title").value, body: $("#iq-body").value };
    if ($("#iq-name")) { body.name = $("#iq-name").value; body.email = $("#iq-email").value; }
    try { const r = await post("/api/inquiries", body); if (r.error) throw new Error(r.error); toast("접수됐어요. 답변은 이메일·내 계정·하이커브 채널로 드려요"); viewSupport(); } catch (e) { m.textContent = e.message; }
  };

  // ---------- 요금제
  window.viewPricing = async function () {
    await loadMe(); const P = META_AUTH.plans || {};
    const cards = [["student", "강의 수강생", "강의 포함 · 초대 코드로 가입", ["월 20건", "편집 외주서·스케치 포함", "수강 기간 + 1개월"]], ["lite", "라이트", "혼자 꾸준히 올리는 분", ["월 10건", "레퍼런스 무제한", "편집 외주서 포함"]], ["pro", "프로", "주 2회 이상 올리는 분", ["월 30건", "훅 다시 뽑기·말투 다듬기 무제한", "스케치·편집 외주서"]], ["team", "팀·대행사", "클라이언트 여러 곳", ["월 100건", "3계정", "클라이언트별 보관함"]]];
    $("#main").innerHTML = `<div class="plan-home"><div class="hero"><div><div class="ph-kicker">요금제</div><h1>레퍼런스 → 기획안까지<br>한 번에.</h1><p>남의 터진 릴스를 실제로 뜯어서(컷·자막·대사·효과음) 내 소재로 옮긴 씬별 대본과 캡컷 편집표까지. 인플로우·스니핏은 여기까지 안 옵니다.</p></div><div class="hero-art"><i></i><i></i><i></i></div></div>
      <div class="pricegrid">${cards.map(([k, n, who, feats]) => { const p = P[k] || {}; return `<div class="pricecard ${k === "pro" ? "hot" : ""}"><div class="ph-kicker">${esc(n)}</div><div class="price">${p.price ? p.price.toLocaleString() + "원<small>/월</small>" : "강의 포함"}</div><div class="muted">${esc(who)}</div><ul>${feats.map(f => `<li>${esc(f)}</li>`).join("")}</ul>${k === "student" ? `<a class="btn" href="#/login">초대 코드로 가입</a>` : `<button class="btn ${k === "pro" ? "p" : ""}" onclick="requestPlan('${k}','${esc(n)}')">${ME && ME.plan === k ? "이용 중" : "신청하기"}</button>`}</div>`; }).join("")}</div>
      <div class="panel soft" style="margin-top:14px"><b>체험</b> 무료 가입 시 기획안 2건. 추가는 건당 3,000원 또는 10건 25,000원(문의로 신청). 한도 초과 시 건당 2,000원.</div>
      <div class="panel" style="margin-top:10px"><b>기획안 → 제작까지</b> 기획안 화면의 편집 외주서를 그대로 하이커브 스튜디오에 맡기면 편집 건당 20만 원(촬영 별도). 문의에서 "제휴·대행 의뢰"로 남겨주세요.</div></div>`;
  };
  window.requestPlan = async (k, n) => { if (!requireLogin("플랜 신청은 로그인 후에")) return; try { const r = await post("/api/inquiries", { category: "결제·플랜", title: `[플랜 신청] ${n}`, body: `${n} 플랜을 신청합니다. 결제 안내 부탁드려요.` }); if (r.error) throw new Error(r.error); toast("신청됐어요. 문의 대화방에서 결제 안내를 드릴게요"); location.hash = "#/support"; } catch (e) { toast(e.message); } };

  // ---------- 관리자
  window.viewAdmin = async function () {
    await loadMe(); if (!ME || ME.role !== "admin") { toast("관리자만"); location.hash = "#/reels"; return; }
    const [st, users, inq, pub, use] = await Promise.all([api("/api/admin/stats"), api("/api/admin/users"), api("/api/admin/inquiries"), api("/api/admin/public_url").catch(() => ({})), api("/api/admin/usage").catch(() => ({ users: [], kinds: [], daily: [], total: {}, models: [] }))]);
    window.__pub = pub;
    const P = st.plan_defs || {};
    const KRW = use.usd_krw || 1400; const tk = (n) => n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "K" : String(n || 0); const usd = (v) => "$" + (v || 0).toFixed(2); const won = (v) => "약 " + Math.round((v || 0) * KRW).toLocaleString() + "원";
    const KIND = { plan: "기획안 본문", polish: "대사 다듬기", topics: "주제 추천", quick: "한 줄 파악·제안", edit_brief: "편집 외주서", hooks: "훅 새로 뽑기", hook_from: "훅 리스트에서 채우기", rewrite_opening: "첫 장면 다시 쓰기", humanize: "말투 다듬기", thumbs: "썸네일 문구", refs_rank: "참고 릴스 정렬", keywords: "서브 키워드", sketch: "스케치" };
    const T = use.total || {};
    const usageHtml = `<h2 style="margin-top:18px">AI 사용량 <small class="muted" style="font-weight:500">오늘 저녁부터 기록 · 비용은 API 환산 금액(구독으로 돌려도 같은 기준) · 1달러=${KRW.toLocaleString()}원으로 환산</small></h2>
      <div class="stats" style="margin-bottom:12px">${[["전체 호출", (T.calls || 0) + "회"], ["입력 토큰", tk(T.tin || 0)], ["출력 토큰", tk(T.tout || 0)], ["총 비용", usd(T.cost) + " · " + won(T.cost)]].map(([k, v]) => `<div class="stat"><small>${k}</small><b>${v}</b></div>`).join("")}</div>
      <div class="tablewrap"><table class="scenes"><tr><th>사용자</th><th>플랜</th><th>기획안</th><th>AI 호출</th><th>입력 토큰</th><th>출력 토큰</th><th>비용</th><th>기획안 1건당</th><th>최근 사용</th></tr>
        ${(use.users || []).map(u => `<tr><td><b>${esc(u.name)}</b><div class="muted" style="font-size:12px">${esc(u.email)}</div></td><td>${esc((P[u.plan] || {}).name || u.plan)}</td><td>${u.plans || 0}건</td><td>${u.calls}회</td><td>${tk(u.tin || 0)}</td><td>${tk(u.tout || 0)}</td><td><b>${usd(u.cost)}</b><div class="muted" style="font-size:12px">${won(u.cost)}</div></td><td>${u.plans ? usd(u.cost / u.plans) + " · " + won(u.cost / u.plans) : "-"}</td><td>${esc((u.last || "").slice(5, 16))}</td></tr>`).join("") || '<tr><td colspan="9" class="muted">아직 기록이 없어요. 기획안을 하나 만들면 여기에 쌓입니다.</td></tr>'}
        ${(use.users || []).length ? `<tr style="font-weight:800;background:#f7f8fb"><td>합계</td><td></td><td>${(use.users || []).reduce((a, u) => a + (u.plans || 0), 0)}건</td><td>${T.calls || 0}회</td><td>${tk(T.tin || 0)}</td><td>${tk(T.tout || 0)}</td><td>${usd(T.cost)}<div class="muted" style="font-size:12px;font-weight:500">${won(T.cost)}</div></td><td></td><td></td></tr>` : ""}</table></div>
      <details style="margin-top:10px"><summary class="muted" style="cursor:pointer">작업별·모델별 · 날짜별 보기</summary><div class="tablewrap" style="margin-top:8px"><table class="scenes"><tr><th>작업</th><th>모델</th><th>호출</th><th>입력</th><th>출력</th><th>비용</th><th>평균 시간</th></tr>${(use.kinds || []).map(k => `<tr><td>${esc(KIND[k.kind] || k.kind || "-")}</td><td>${esc(k.model || "-")}</td><td>${k.calls}</td><td>${tk(k.tin || 0)}</td><td>${tk(k.tout || 0)}</td><td>${usd(k.cost)}</td><td>${k.avg_sec || 0}초</td></tr>`).join("")}</table></div>
        <div class="tablewrap" style="margin-top:8px"><table class="scenes"><tr><th>날짜</th><th>호출</th><th>입력</th><th>출력</th><th>비용</th></tr>${(use.daily || []).map(d => `<tr><td>${esc(d.day)}</td><td>${d.calls}</td><td>${tk(d.tin || 0)}</td><td>${tk(d.tout || 0)}</td><td>${usd(d.cost)} · ${won(d.cost)}</td></tr>`).join("")}</table></div></details>
      <h2 style="margin-top:18px">지금 기획에 쓰는 모델</h2><div class="tablewrap"><table class="scenes"><tr><th>작업</th><th>모델</th><th>메모</th></tr>${(use.models || []).map(m => `<tr><td>${esc(m.task)}</td><td><b>${esc({ haiku: "Claude Haiku 4.5", sonnet: "Claude Sonnet 5", opus: "Claude Opus 5" }[m.model] || m.model)}</b></td><td class="muted">${esc(m.note || "")}</td></tr>`).join("")}</table></div>
      <div class="muted" style="margin-top:6px;font-size:12.5px">엔진은 이 맥의 클로드 코드 구독(CLI)으로 돌아갑니다. 위 "모델별 보기"의 모델 이름은 실제 응답에 찍힌 모델 ID입니다.</div>`;

    $("#main").innerHTML = `<h1>관리</h1><section class="panel" style="margin-bottom:12px"><b>서버 공개 · AI 연결</b>
      <table class="kv" style="margin-top:8px"><tr><th>외부 주소</th><td>${pub.url ? `<a href="${esc(pub.url)}" target="_blank" rel="noopener"><b>${esc(pub.url)}</b></a> <span class="tag ${pub.running ? "ok" : ""}">${pub.running ? "터널 켜짐" : "터널 꺼짐"}</span> <button class="btn small" onclick="navigator.clipboard.writeText('${esc(pub.url)}');toast('복사했어요')">복사</button><div class="muted" style="font-size:12px">무료 빠른 터널이라 맥을 재시작하면 주소가 바뀝니다. 바뀌면 여기서 다시 확인하세요.</div>` : '<span class="muted">터널이 꺼져 있어요. 맥 터미널에서 <code>bash data/tunnel_cf.sh</code></span>'}</td></tr>
      <tr><th>같은 와이파이</th><td>${esc(pub.lan || "")}</td></tr>
      <tr><th>AI 엔진</th><td><span class="tag ${pub.ai && pub.ai.engine === "api" ? "ok" : ""}">${pub.ai ? ({api: "Anthropic API (콘솔 결제분)", cli: "클로드 코드 구독(내 맥에서만)", none: "없음"}[pub.ai.engine] || pub.ai.engine) : "-"}</span>
        <div class="row" style="gap:6px;margin-top:6px"><input id="ai-key" class="wiz-input" type="password" placeholder="sk-ant-… (console.anthropic.com → API Keys)" style="max-width:420px"><button class="btn small" onclick="saveAiKey()">저장</button>${pub.ai && pub.ai.has_key ? '<button class="btn small d" onclick="saveAiKey(true)">키 제거</button>' : ""}</div>
        <div class="muted" style="font-size:12px;margin-top:4px">키를 넣으면 회원들의 기획안 생성이 콘솔 결제로 돌아갑니다(기획안 1건 약 1,500~2,500원 예상, 소네트 기준 300~600원). 키가 없으면 이 맥의 클로드 코드 구독으로만 돌아 외부 회원은 생성이 안 됩니다.</div></td></tr></table></section><div class="stats" style="margin-bottom:14px">${[["회원", st.users], ["이번 달 기획안", st.plans_this_month], ["답변 대기 문의", st.open_inquiries], ...Object.entries(st.by_plan || {}).map(([k, v]) => [(P[k] || {}).name || k, v])].map(([k, v]) => `<div class="stat"><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join("")}</div>
      <h2>문의</h2><div class="panel" style="margin-bottom:10px"><b>💬 문의 대화함</b> <span class="muted">회원이 남긴 문의는 이제 톡처럼 쌓여요. 안 읽은 대화 ${st.unread_chats || 0}개</span> <a class="btn p small" href="#/support" style="margin-left:8px">대화함 열기</a></div>
      <details><summary class="muted" style="cursor:pointer">예전 방식 문의 ${inq.length}건 (제목·답변)</summary>${inq.length ? inq.map(q => `<div class="panel" style="margin-bottom:8px"><div class="row" style="justify-content:space-between"><b>[${esc(q.category)}] ${esc(q.title)}</b><span class="tag ${q.status === "open" ? "" : "ok"}">${esc(q.status)}</span></div><div class="muted" style="font-size:12px">${esc(q.name || "")} · ${esc(q.email)} · ${esc(q.created_at)}</div><div style="white-space:pre-wrap;margin:6px 0">${esc(q.body)}</div>${q.reply ? `<div class="reply"><b>답변</b><div style="white-space:pre-wrap">${esc(q.reply)}</div></div>` : ""}<div class="row" style="margin-top:6px;align-items:flex-start"><textarea id="rp-${q.id}" class="wiz-input" rows="2" placeholder="답변">${esc(q.reply || "")}</textarea><button class="btn p small" onclick="adminReply(${q.id},'answered')">답변 저장</button><button class="btn small" onclick="adminReply(${q.id},'closed')">종료</button></div></div>`).join("") : '<div class="muted">문의 없음</div>'}</details>
      ${usageHtml}
      <h2 style="margin-top:18px">회원</h2><div class="tablewrap"><table class="scenes"><tr><th>이름</th><th>이메일</th><th>플랜</th><th>이번 달</th><th>상태</th><th>가입</th><th>최근 로그인</th><th>메모</th></tr>${users.map(u => `<tr><td><b>${esc(u.name)}</b> ${u.role === "admin" ? '<span class="tag ok">관리자</span>' : ""}</td><td>${esc(u.email)}</td><td><select class="chip" onchange="adminSet(${u.id},{plan:this.value})">${Object.entries(P).map(([k, v]) => `<option value="${k}" ${u.plan === k ? "selected" : ""}>${esc(v.name)}</option>`).join("")}</select></td><td>${u.quota == null ? "∞" : `${u.used}/${u.quota}`} <button class="btn small" onclick="adminSet(${u.id},{reset_used:1})">초기화</button></td><td><select class="chip" onchange="adminSet(${u.id},{status:this.value})"><option value="active" ${u.status === "active" ? "selected" : ""}>active</option><option value="blocked" ${u.status === "blocked" ? "selected" : ""}>blocked</option></select></td><td>${esc((u.created_at || "").slice(0, 10))}</td><td>${esc((u.last_login || "").slice(0, 16))}</td><td><input class="wiz-input" style="padding:4px 8px;font-size:12px" value="${esc(u.memo || "")}" onchange="adminSet(${u.id},{memo:this.value})"></td></tr>`).join("")}</table></div>
      <div class="muted" style="margin-top:10px">초대 코드는 data/config.json 의 invite_codes (기본 HIGHCURVE2026). 플랜 한도: ${Object.values(P).map(v => `${v.name} ${v.quota}건`).join(" · ")}</div>`;
  };
  window.adminSet = async (id, d) => { try { const r = await post("/api/admin/users/" + id, d); if (r.error) throw new Error(r.error); toast("저장"); } catch (e) { toast(e.message); } };
  window.adminReply = async (id, status) => { try { const r = await post("/api/admin/inquiries/" + id + "/reply", { reply: $("#rp-" + id).value, status }); if (r.error) throw new Error(r.error); toast("저장"); viewAdmin(); } catch (e) { toast(e.message); } };
})();

window.saveAiKey = async (remove) => { const key = remove ? "" : ($("#ai-key").value || "").trim(); if (!remove && !key) { toast("키를 넣어주세요"); return; } try { const r = await api("/api/admin/aikey", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key }) }); if (r.error) throw new Error(r.error); toast(remove ? "키를 지웠어요" : "저장했어요 · 엔진: " + r.engine); viewAdmin(); } catch (e) { toast(e.message); } };
