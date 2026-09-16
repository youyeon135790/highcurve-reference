// 💬 문의 = 고객센터 톡. #/support (회원: 내 대화방 / 관리자: 대화 목록) · #/support/<id> (관리자: 그 회원과의 대화)
(function () {
  const CSS = `
.ct{--ct-me:#EEF0F5;--ct-them:#fff;--ct-bg:#FCFBFF;display:flex;flex-direction:column;max-width:720px;margin:0 auto;background:var(--ct-bg);border:1px solid var(--line);border-radius:22px;overflow:hidden;box-shadow:0 18px 50px rgba(60,40,120,.08);min-height:420px}
.ct-head{display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(255,255,255,.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);flex:none}
.ct-av{width:38px;height:38px;border-radius:50%;background:var(--grad);color:#fff;display:grid;place-items:center;font-family:"Plus Jakarta Sans","Pretendard",sans-serif;font-weight:800;font-size:16px;flex:none;letter-spacing:-.02em}
.ct-av.user{background:#E4DBFF;color:#3B2BA8}
.ct-title{min-width:0;flex:1}
.ct-title b{display:block;font-size:16px;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ct-status{display:flex;align-items:center;gap:6px;font-size:12px;color:#6B6382;margin-top:2px;line-height:1.35}
.ct-status i{width:7px;height:7px;border-radius:50%;background:#C6C0D6;flex:none}.ct-status i.on{background:#22A65B;box-shadow:0 0 0 3px rgba(34,166,91,.15)}
.ct-tools{display:flex;gap:4px;flex:none}
.ct-tools a,.ct-tools button{width:34px;height:34px;border-radius:10px;border:0;background:none;color:#4B4460;display:grid;place-items:center;cursor:pointer;text-decoration:none;font:inherit}
.ct-tools a:hover,.ct-tools button:hover{background:#F1ECFF;color:#3B2BA8}
.ct-tools svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.ct-tools .btn{width:auto;height:auto;padding:6px 10px;font-size:12px;border:1px solid var(--line);border-radius:10px;background:#fff;display:inline-flex;gap:4px;align-items:center}
.ct-body{flex:1;overflow-y:auto;padding:16px 14px 10px;display:flex;flex-direction:column;gap:6px;overscroll-behavior:contain}
.ct-date{align-self:center;font-size:11.5px;color:#8A82A0;background:#F1EEF8;border-radius:999px;padding:3px 10px;margin:10px 0 6px}
.ct-row{display:flex;gap:8px;align-items:flex-end;max-width:100%}
.ct-row.them{justify-content:flex-start}.ct-row.me{justify-content:flex-end}
.ct-row .ct-av{width:32px;height:32px;font-size:13px;align-self:flex-start;margin-top:22px}
.ct-row.cont .ct-av{visibility:hidden;margin-top:0}
.ct-col{display:flex;flex-direction:column;max-width:min(78%,520px);min-width:0}
.ct-row.me .ct-col{align-items:flex-end}
.ct-name{font-size:12px;color:#4B4460;font-weight:700;margin:0 0 4px 4px;display:flex;align-items:center;gap:6px}
.ct-row.cont .ct-name{display:none}
.ct-auto{font-style:normal;font-size:10.5px;font-weight:700;color:#5E4BD6;background:#EEE8FF;border-radius:999px;padding:1px 7px}
.ct-bub{background:var(--ct-them);border:1px solid var(--line);border-radius:4px 16px 16px 16px;padding:10px 13px;font-size:14.5px;line-height:1.6;white-space:pre-wrap;word-break:break-word;color:var(--ink)}
.ct-row.cont.them .ct-bub{border-radius:16px}
.ct-row.me .ct-bub{background:var(--ct-me);border-color:transparent;border-radius:16px 4px 16px 16px}
.ct-row.me.cont .ct-bub{border-radius:16px}
.ct-bub a{color:#4F3DC7;text-decoration:underline;word-break:break-all}
.ct-bub img{display:block;max-width:100%;max-height:320px;border-radius:10px;margin:2px 0 4px;background:#EEE8FF;cursor:zoom-in}
.ct-bub.img{padding:6px}
.ct-typing{display:inline-flex;gap:5px;align-items:center;padding:14px 16px;min-height:0}
.ct-typing i{width:7px;height:7px;border-radius:50%;background:#B9B2CC;animation:ctDot 1.1s infinite ease-in-out}
.ct-typing i:nth-child(2){animation-delay:.18s}.ct-typing i:nth-child(3){animation-delay:.36s}
@keyframes ctDot{0%,60%,100%{transform:translateY(0);opacity:.45}30%{transform:translateY(-4px);opacity:1}}
.ct-bub.typing::after{content:"";display:inline-block;width:2px;height:1em;background:#8E7CFF;margin-left:2px;vertical-align:-2px;animation:ctCaret .8s steps(1) infinite}
@keyframes ctCaret{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.ct-typing i{animation:none;opacity:.8}.ct-bub.typing::after{animation:none}}
.ct-meta{font-size:11px;color:#9B94B0;margin:3px 4px 0;display:flex;gap:5px;align-items:center}
.ct-meta b{color:#5E4BD6;font-weight:700}
.ct-chips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 2px}
.ct-chip{font:inherit;font-size:13px;font-weight:600;padding:7px 12px;border-radius:999px;border:1px solid #D9CCFF;background:#fff;color:#3B2BA8;cursor:pointer;text-align:left}
.ct-chip:hover{background:#F1ECFF}.ct-chip:focus-visible{outline:2px solid #8E7CFF;outline-offset:2px}
.ct-note{align-self:center;font-size:12px;color:#6B6382;background:#fff;border:1px dashed #D9CCFF;border-radius:12px;padding:6px 12px;margin:6px 0;text-align:center;line-height:1.5}
.ct-foot{flex:none;padding:10px 12px 12px;background:rgba(255,255,255,.92);border-top:1px solid var(--line);position:relative}
.ct-box{background:#F3F2F8;border-radius:18px;padding:10px 12px 8px}
.ct-box:focus-within{box-shadow:0 0 0 3px rgba(142,124,255,.18)}
.ct-box textarea{width:100%;border:0;background:none;resize:none;font:inherit;font-size:15px;line-height:1.5;color:var(--ink);outline:none;padding:2px 2px 6px;max-height:140px;display:block}
.ct-box textarea::placeholder{color:#9B94B0}
.ct-bar{display:flex;align-items:center;gap:2px}
.ct-bar button{width:34px;height:34px;border:0;background:none;border-radius:10px;color:#6B6382;display:grid;place-items:center;cursor:pointer;font:inherit}
.ct-bar button:hover{background:#E9E5F5;color:#3B2BA8}.ct-bar button:focus-visible{outline:2px solid #8E7CFF}
.ct-bar svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.ct-send{margin-left:auto;width:38px!important;height:38px!important;border-radius:50%!important;background:var(--grad)!important;color:#fff!important;transition:opacity .15s}
.ct-send:disabled{opacity:.35;cursor:default}
.ct-hint{font-size:11.5px;color:#9B94B0;margin:6px 4px 0;display:flex;align-items:center;gap:6px}
.ct-hint i{width:6px;height:6px;border-radius:50%;background:#22A65B}
.ct-emoji{position:absolute;left:12px;bottom:calc(100% - 4px);background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 12px 30px rgba(60,40,120,.15);padding:8px;display:grid;grid-template-columns:repeat(8,34px);gap:2px;z-index:5}
.ct-emoji button{width:34px;height:34px;border:0;background:none;border-radius:8px;font-size:20px;cursor:pointer}.ct-emoji button:hover{background:#F1ECFF}
.ct-new{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(100% + 8px);font:inherit;font-size:12.5px;font-weight:700;padding:6px 12px;border-radius:999px;border:0;background:#241E33;color:#fff;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.18)}
.ct-view{position:fixed;inset:0;background:rgba(10,8,20,.86);display:grid;place-items:center;z-index:200;cursor:zoom-out;padding:20px}
.ct-view img{max-width:100%;max-height:100%;border-radius:10px}
/* 관리자: 대화 목록 */
.ct-inbox{max-width:720px;margin:0 auto}
.ct-inbox h1{font-size:22px;margin:4px 0 4px}
.ct-inbox .sub{color:#6B6382;font-size:13.5px;margin-bottom:14px}
.ct-list{display:flex;flex-direction:column;gap:8px}
.ct-item{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:12px;align-items:center;background:#fff;border:1px solid var(--line);border-radius:16px;padding:12px 14px;cursor:pointer;text-decoration:none;color:var(--ink)}
.ct-item:hover{border-color:#D4C8FF;box-shadow:0 10px 26px rgba(138,108,255,.12)}
.ct-item .ct-av{width:44px;height:44px;font-size:16px}
.ct-item .who{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.ct-item .who b{font-size:14.5px}
.ct-item .snip{font-size:13px;color:#5B5470;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ct-item.unread .snip{color:var(--ink);font-weight:700}
.ct-item .right{display:flex;flex-direction:column;align-items:flex-end;gap:6px;font-size:11.5px;color:#9B94B0;white-space:nowrap}
.ct-badge{min-width:20px;height:20px;border-radius:999px;background:#F04E4E;color:#fff;font-size:11.5px;font-weight:800;display:grid;place-items:center;padding:0 6px}
.ct-closed{font-size:11px;color:#9B94B0;background:#F1EEF8;border-radius:999px;padding:2px 8px}
@media (max-width:800px){.ct{border-radius:16px;min-height:380px}.ct-col{max-width:84%}.ct-emoji{grid-template-columns:repeat(6,34px)}}`;
  const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

  const CT = { mode: "user", cid: null, lastId: 0, poll: null, support: null, chat: null, prev: null, prevDay: "", pending: 0 };
  const EMOJI = ["😊", "😄", "🙂", "😅", "🤔", "😢", "😮", "🙏", "👍", "👏", "🙌", "✅", "🔥", "✨", "🎬", "📸", "🎉", "📌", "⏰", "💡", "💬", "❓", "❗", "🙇"];
  const NAME = () => (CT.support || {}).name || "릴피디 고객센터";
  const ICON = { home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>', faq: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5"/><path d="M12 17h.01"/></svg>', list: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10"/></svg>', clip: '<svg viewBox="0 0 24 24"><path d="M21 12.5l-8.5 8.5a5.5 5.5 0 0 1-7.8-7.8l9-9a3.5 3.5 0 0 1 5 5l-9 9a1.5 1.5 0 0 1-2.1-2.1l8.3-8.3"/></svg>', smile: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0"/><path d="M9 10h.01M15 10h.01"/></svg>', up: '<svg viewBox="0 0 24 24"><path d="M12 19V5"/><path d="M6 11l6-6 6 6"/></svg>', back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>' };
  const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
  const stop = () => { if (CT.poll) { clearInterval(CT.poll); CT.poll = null; } };
  const here = () => location.hash.startsWith("#/support");
  const dt = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(s || ""); if (!m) return null; return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]); };
  const tFmt = (s) => { const d = dt(s); if (!d) return ""; const h = d.getHours(), mm = String(d.getMinutes()).padStart(2, "0"); return (h < 12 ? "오전 " : "오후 ") + ((h % 12) || 12) + ":" + mm; };
  const dayKey = (s) => (s || "").slice(0, 10);
  const dayFmt = (s) => { const d = dt(s); if (!d) return ""; const t = new Date(); const same = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); const y = new Date(t); y.setDate(t.getDate() - 1); if (same(d, t)) return "오늘"; if (same(d, y)) return "어제"; return `${d.getFullYear() !== t.getFullYear() ? d.getFullYear() + "년 " : ""}${d.getMonth() + 1}월 ${d.getDate()}일 (${DAYS[d.getDay()]})`; };
  const relFmt = (s) => { const d = dt(s); if (!d) return ""; const diff = (Date.now() - d.getTime()) / 60000; if (diff < 1) return "방금"; if (diff < 60) return Math.floor(diff) + "분 전"; if (diff < 60 * 24 && dayKey(s) === dayKey(new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString())) return tFmt(s); return dayFmt(s); };
  const rich = (t) => esc(t).replace(/(https?:\/\/[^\s<]+)/g, (u) => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);

  // ---------------- 진입
  window.viewSupport = async function (arg) {
    stop();
    const me = await loadMe();
    if (!me) return viewLogin();
    if (window.staticApi) { $("#main").innerHTML = '<div class="empty"><b>문의는 서버 버전에서 열려요</b>reelpd.high-curve.co.kr 에서 로그인한 뒤 이용해 주세요.</div>'; return; }
    if (me.role === "admin") return arg ? viewAdminChat(Number(arg)) : viewInbox();
    return viewMine();
  };

  // ---------------- 회원: 내 대화방
  async function viewMine() {
    let r; try { r = await api("/api/chat"); } catch (e) { $("#main").innerHTML = `<div class="empty"><b>대화방을 열지 못했어요</b>${esc(e.message)}</div>`; return; }
    Object.assign(CT, { mode: "user", cid: r.chat.id, lastId: 0, support: r.support, chat: r.chat, prev: null, prevDay: "" });
    shell({ title: NAME(), status: statusHtml(r.support), tools: `<button type="button" title="자주 묻는 질문" aria-label="자주 묻는 질문" onclick="ctQuick('faq')">${ICON.faq}</button><a href="#/reels" title="홈" aria-label="홈">${ICON.home}</a>`, av: `<span class="ct-av" aria-hidden="true">R</span>` });
    const body = $("#ct-body");
    body.insertAdjacentHTML("beforeend", `<div class="ct-date">기본 안내</div>` + bubbleHtml({ sender: "bot", kind: "greeting", body: r.support.greeting, created_at: "" }, true) + `<div class="ct-row them cont"><span class="ct-av" aria-hidden="true">R</span><div class="ct-col"><div class="ct-chips">${(r.support.quick || []).map(q => `<button class="ct-chip" type="button" onclick="ctQuick('${esc(q.key)}')">${esc(q.label)}</button>`).join("")}</div></div></div>`);
    CT.prev = null; CT.prevDay = "";
    appendMessages(r.messages, false);
    if (r.chat.status === "closed") body.insertAdjacentHTML("beforeend", `<div class="ct-note">이 상담은 마무리됐어요. 이어서 남기면 다시 열려요 🙂</div>`);
    scrollBottom(true); updateBadge(0);
    CT.poll = setInterval(pollMine, 4000);
  }
  async function pollMine() {
    if (!here() || CT.mode !== "user") return stop();
    let r; try { r = await api("/api/chat?after=" + CT.lastId); } catch (e) { return; }
    if (r.messages && r.messages.length) { appendMessages(r.messages, true); }
    if (r.support) { CT.support = r.support; const s = $("#ct-status"); if (s) s.innerHTML = statusHtml(r.support); }
    updateBadge(0);
  }
  const statusHtml = (sp) => sp.open ? `<i class="on"></i>운영 중 · 보통 1시간 안에 답해요` : `<i></i>운영시간 밖 · ${esc(sp.hours)} · 남기면 다음 영업일에 답해요`;

  // ---------------- 관리자: 대화 목록
  async function viewInbox() {
    const list = await api("/api/admin/chats").catch(() => []);
    const unread = list.reduce((n, c) => n + (c.unread || 0), 0);
    $("#main").innerHTML = `<div class="ct-inbox"><h1>문의 대화</h1><div class="sub">회원이 남긴 문의가 톡처럼 쌓여요. 안 읽은 대화 <b>${unread ? list.filter(c => c.unread).length : 0}개</b> · 전체 ${list.length}개</div>
      <div class="ct-list">${list.length ? list.map(c => `<a class="ct-item ${c.unread ? "unread" : ""}" href="#/support/${c.id}"><span class="ct-av user" aria-hidden="true">${esc((c.name || "?").slice(0, 1))}</span><div style="min-width:0"><div class="who"><b>${esc(c.name || "-")}</b><span class="tag">${esc(c.plan || "")}</span>${c.status === "closed" ? '<span class="ct-closed">마무리</span>' : ""}</div><div class="snip">${c.last_sender === "admin" ? "나: " : c.last_sender === "bot" ? "자동: " : ""}${esc(c.last_kind === "image" ? "📷 사진" : (c.last_body || "(아직 대화 없음)")).replace(/\n/g, " ")}</div></div><div class="right"><span>${esc(relFmt(c.last_at || c.updated_at))}</span>${c.unread ? `<span class="ct-badge">${c.unread}</span>` : ""}</div></a>`).join("") : '<div class="empty"><b>아직 들어온 문의가 없어요</b>회원이 문의를 남기면 여기에 쌓여요.</div>'}</div></div>`;
    CT.poll = setInterval(async () => { if (location.hash !== "#/support") return stop(); viewInbox(); }, 8000);
  }

  // ---------------- 관리자: 회원과의 대화
  async function viewAdminChat(cid) {
    let r; try { r = await api("/api/admin/chats/" + cid); } catch (e) { toast(e.message); location.hash = "#/support"; return; }
    Object.assign(CT, { mode: "admin", cid, lastId: 0, support: r.support, chat: r, prev: null, prevDay: "" });
    shell({ title: r.name || "회원", status: `<i class="on"></i>${esc(r.email || "")} · ${esc(r.plan || "")}${r.status === "closed" ? " · 마무리된 상담" : ""}`, av: `<span class="ct-av user" aria-hidden="true">${esc((r.name || "?").slice(0, 1))}</span>`,
      tools: `<a href="#/support" class="btn" title="대화 목록">${ICON.list} 목록</a><button type="button" class="btn" onclick="ctStatus('${r.status === "closed" ? "open" : "closed"}')">${r.status === "closed" ? "다시 열기" : "마무리"}</button>` });
    appendMessages(r.messages, false); scrollBottom(true); updateBadge(null);
    CT.poll = setInterval(pollAdmin, 4000);
  }
  async function pollAdmin() {
    if (!here() || CT.mode !== "admin") return stop();
    let r; try { r = await api(`/api/admin/chats/${CT.cid}?after=${CT.lastId}`); } catch (e) { return; }
    if (r.messages && r.messages.length) appendMessages(r.messages, true);
  }
  window.ctStatus = async (status) => { try { await post(`/api/admin/chats/${CT.cid}/status`, { status }); toast(status === "closed" ? "상담을 마무리했어요" : "다시 열었어요"); viewAdminChat(CT.cid); } catch (e) { toast(e.message); } };

  // ---------------- 공통 틀
  function shell({ title, status, tools, av }) {
    const mobile = window.matchMedia("(pointer:coarse)").matches;
    $("#main").innerHTML = `<div class="ct" id="ct" role="region" aria-label="문의 대화">
      <header class="ct-head">${av}<div class="ct-title"><b>${esc(title)}</b><span class="ct-status" id="ct-status">${status}</span></div><div class="ct-tools">${tools}</div></header>
      <div class="ct-body" id="ct-body" aria-live="polite"></div>
      <footer class="ct-foot"><button class="ct-new" id="ct-new" type="button" hidden onclick="scrollBottom(true)">새 메시지 ↓</button>
        <div class="ct-box"><textarea id="ct-text" rows="1" placeholder="${CT.mode === "admin" ? "답장을 입력하세요." : "메시지를 입력해주세요."}" aria-label="메시지" oninput="ctGrow(this)" onkeydown="ctKey(event)"></textarea>
        <div class="ct-bar">${CT.mode === "user" ? `<button type="button" title="사진 붙이기" aria-label="사진 붙이기" onclick="document.getElementById('ct-file').click()">${ICON.clip}</button><input id="ct-file" type="file" accept="image/*" hidden onchange="ctAttach(this)">` : ""}<button type="button" title="이모지" aria-label="이모지" onclick="ctEmoji()">${ICON.smile}</button><button type="button" class="ct-send" id="ct-send" title="보내기" aria-label="보내기" disabled onclick="ctSend()">${ICON.up}</button></div></div>
        <div class="ct-hint">${CT.mode === "user" ? ((CT.support || {}).open ? "<i></i>몇 분 안에 답변 받으실 수 있어요" : "운영시간 " + esc((CT.support || {}).hours || "") + " · 남겨 두시면 순서대로 답해요") : (mobile ? "보내기 버튼으로 전송돼요" : "Enter 보내기 · Shift+Enter 줄바꿈")}</div></footer></div>`;
    fit(); window.addEventListener("resize", fit);
    const body = $("#ct-body"); body.addEventListener("scroll", () => { CT.stick = nearBottom(); if (CT.stick) $("#ct-new").hidden = true; });
    if (!mobile) setTimeout(() => { const t = $("#ct-text"); if (t) t.focus(); }, 60);
  }
  function fit() { const el = $("#ct"); if (!el) return; const top = el.getBoundingClientRect().top + window.scrollY; const pb = parseFloat(getComputedStyle(el.parentElement).paddingBottom) || 0; el.style.height = Math.max(380, window.innerHeight - top - pb - 2) + "px"; }
  const nearBottom = () => { const b = $("#ct-body"); return !b || b.scrollHeight - b.scrollTop - b.clientHeight < 80; };
  window.scrollBottom = (force) => { const b = $("#ct-body"); if (!b) return; if (force || nearBottom()) { b.scrollTo({ top: b.scrollHeight, behavior: "auto" }); CT.stick = true; const n = $("#ct-new"); if (n) n.hidden = true; } };
  window.ctImg = () => { if (CT.stick) scrollBottom(true); };   // 사진이 늦게 뜨며 길어져도 맨 아래를 유지

  // ---------------- 말풍선
  function bubbleHtml(m, forceHead) {
    const mine = CT.mode === "admin" ? m.sender === "admin" : m.sender === "user";
    const cont = !forceHead && CT.prev && CT.prev.sender === m.sender && CT.prev.day === dayKey(m.created_at) && Math.abs((dt(m.created_at) || 0) - (dt(CT.prev.created_at) || 0)) < 5 * 60000;
    let inner;
    if (m.kind === "image" && m.file) inner = `<div class="ct-bub img"><img src="${esc(m.file)}" alt="첨부 사진" onload="ctImg()" onclick="ctView(this.src)">${m.body ? `<div style="padding:4px 6px 2px">${rich(m.body)}</div>` : ""}</div>`;
    else inner = `<div class="ct-bub">${rich(m.body || "")}</div>`;
    if (m.kind === "faq_list" && CT.mode === "user") inner += `<div class="ct-chips">${((CT.support || {}).faq || []).map(f => `<button class="ct-chip" type="button" onclick="ctFaq(${f.i})">${esc(f.q)}</button>`).join("")}</div>`;
    const who = CT.mode === "admin" ? (m.sender === "user" ? esc((CT.chat || {}).name || "회원") : NAME()) : NAME();
    const auto = m.sender === "bot" ? '<i class="ct-auto">자동 답변</i>' : "";
    const meta = m.created_at ? `<div class="ct-meta">${mine && m.read_at ? "<b>읽음</b>" : ""}${tFmt(m.created_at)}</div>` : "";
    const avatar = mine ? "" : (m.sender === "user" ? `<span class="ct-av user" aria-hidden="true">${esc(((CT.chat || {}).name || "?").slice(0, 1))}</span>` : `<span class="ct-av" aria-hidden="true">R</span>`);
    return `<div class="ct-row ${mine ? "me" : "them"} ${cont ? "cont" : ""}">${avatar}<div class="ct-col">${mine ? "" : `<div class="ct-name">${who}${auto}</div>`}${inner}${meta}</div></div>`;
  }
  const REDUCED = () => window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  function pushRow(body, m, animate) {
    const day = dayKey(m.created_at); let html = "";
    if (day && day !== CT.prevDay) { html += `<div class="ct-date">${esc(dayFmt(m.created_at))}</div>`; CT.prevDay = day; CT.prev = null; }
    html += bubbleHtml(m); CT.prev = { sender: m.sender, day, created_at: m.created_at }; CT.lastId = Math.max(CT.lastId, m.id || 0);
    body.insertAdjacentHTML("beforeend", html);
    return body.lastElementChild;
  }
  // 자동 답변: 고객센터가 '입력 중…' 점 세 개를 띄웠다가, 실제로 타자 치듯 한 글자씩 나온다
  async function typeOut(body, m) {
    const wait = Math.min(2400, 1100 + (m.body || "").length * 10);   // 점 세 개는 1.1~2.4초
    const t = document.createElement("div"); t.className = "ct-row them" + (CT.prev && CT.prev.sender === "bot" ? " cont" : ""); t.innerHTML = `<span class="ct-av" aria-hidden="true">R</span><div class="ct-col"><div class="ct-name">${NAME()}<i class="ct-auto">자동 답변</i></div><div class="ct-bub ct-typing" aria-label="입력 중"><i></i><i></i><i></i></div></div>`;
    body.appendChild(t); if (CT.stick) scrollBottom(true);
    await sleep(REDUCED() ? 400 : wait); t.remove();
    const row = pushRow(body, m, true); const bub = row.querySelector(".ct-bub"); const full = bub.innerHTML; const text = m.body || "";
    const chips = row.querySelector(".ct-chips"), meta = row.querySelector(".ct-meta");
    if (!REDUCED() && text.length > 1 && m.kind !== "image") {
      if (chips) chips.hidden = true; if (meta) meta.hidden = true;
      bub.classList.add("typing"); bub.textContent = "";
      const step = Math.max(12, Math.min(28, Math.round(2600 / text.length)));   // 긴 글도 3초 안에 끝난다
      for (let i = 1; i <= text.length; i++) { bub.textContent = text.slice(0, i); if (i % 3 === 0 && CT.stick) scrollBottom(true); await sleep(step); }
      bub.classList.remove("typing"); bub.innerHTML = full;
      if (chips) chips.hidden = false; if (meta) meta.hidden = false;
    }
    if (CT.stick) scrollBottom(true);
  }
  let QUEUE = Promise.resolve();
  function appendMessages(list, live) {
    const body = $("#ct-body"); if (!body) return;
    const stay = nearBottom();
    const note = body.querySelector(".ct-note"); if (note && live) note.remove();
    const animate = live && CT.mode === "user";
    for (const m of list) {
      if (animate && m.sender === "bot") { const msg = m; QUEUE = QUEUE.then(() => typeOut($("#ct-body") || body, msg)); }
      else QUEUE = QUEUE.then(() => { pushRow($("#ct-body") || body, m); if (!live || stay || CT.stick) scrollBottom(true); else { const n = $("#ct-new"); if (n) n.hidden = false; } });
    }
    return QUEUE;
  }

  // ---------------- 보내기
  window.ctGrow = (t) => { t.style.height = "auto"; t.style.height = Math.min(140, t.scrollHeight) + "px"; const b = $("#ct-send"); if (b) b.disabled = !t.value.trim(); };
  window.ctKey = (e) => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing && !window.matchMedia("(pointer:coarse)").matches) { e.preventDefault(); ctSend(); } };
  async function deliver(payload) {
    if (CT.pending) return; CT.pending = 1; const b = $("#ct-send"); if (b) b.disabled = true;
    try {
      if (CT.mode === "admin") { const r = await post(`/api/admin/chats/${CT.cid}/messages`, payload); if (r.error) throw new Error(r.error); await pollAdmin(); }
      else { const r = await post("/api/chat/messages", payload); if (r.error) throw new Error(r.error); CT.stick = true; await appendMessages(r.messages || [], true); scrollBottom(true); }
    } catch (e) { toast(e.message); }
    finally { CT.pending = 0; const t = $("#ct-text"); if (t) ctGrow(t); }
  }
  window.ctSend = async () => { const t = $("#ct-text"); const body = (t.value || "").trim(); if (!body) return; t.value = ""; ctGrow(t); await deliver({ body }); t.focus(); };
  window.ctQuick = (key) => { $("#ct-emo")?.remove(); deliver({ quick: key }); };
  window.ctFaq = (i) => deliver({ faq: i });
  window.ctAttach = (input) => {
    const f = input.files && input.files[0]; input.value = ""; if (!f) return;
    if (!/^image\//.test(f.type)) return toast("사진 파일만 붙일 수 있어요");
    if (f.size > 6 * 1024 * 1024) return toast("6MB 이하 사진만 붙일 수 있어요");
    const rd = new FileReader(); rd.onload = () => { const t = $("#ct-text"); const body = (t.value || "").trim(); t.value = ""; ctGrow(t); deliver({ image: rd.result, filename: f.name, body }); }; rd.readAsDataURL(f);
  };
  window.ctEmoji = () => {
    const old = $("#ct-emo"); if (old) return old.remove();
    const box = document.createElement("div"); box.className = "ct-emoji"; box.id = "ct-emo"; box.setAttribute("role", "listbox");
    box.innerHTML = EMOJI.map(e => `<button type="button" onclick="ctInsert('${e}')" aria-label="${e}">${e}</button>`).join("");
    $(".ct-foot").appendChild(box);
    setTimeout(() => document.addEventListener("click", (ev) => { if (!box.contains(ev.target) && !ev.target.closest('[title="이모지"]')) box.remove(); }, { once: true }), 0);
  };
  window.ctInsert = (e) => { const t = $("#ct-text"); const s = t.selectionStart ?? t.value.length; t.value = t.value.slice(0, s) + e + t.value.slice(t.selectionEnd ?? s); t.focus(); t.selectionStart = t.selectionEnd = s + e.length; ctGrow(t); };
  window.ctView = (src) => { const v = document.createElement("div"); v.className = "ct-view"; v.innerHTML = `<img src="${esc(src)}" alt="">`; v.onclick = () => v.remove(); document.body.appendChild(v); };

  // ---------------- 사이드바 배지 (안 읽은 답변·문의)
  function updateBadge(n) {
    const a = $('.nav a[data-r="support"]'); if (!a) return;
    let tag = a.querySelector(".ct-unread"); if (!tag) { tag = document.createElement("span"); tag.className = "tag ct-unread"; a.appendChild(tag); }
    if (n == null) { api("/api/auth/me").then(r => updateBadge(r.unread || 0)).catch(() => {}); return; }
    tag.textContent = n; tag.hidden = !n; tag.style.display = n ? "" : "none";
  }
  window.ctBadge = updateBadge;
  setTimeout(() => { if (window.authState && authState()) updateBadge(null); }, 1500);
  setInterval(() => { if (window.authState && authState() && !document.hidden) updateBadge(null); }, 30000);
})();
