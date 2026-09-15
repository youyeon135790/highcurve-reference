// 🔬 레퍼런스 분석 — 영상을 0.5초마다 전부 뜯어 화면을 직접 보고 판독 (제작 방식·첫 3초·장면·편집). #/analyze · #/analyze/<id>
(function () {
  const CSS = `
.ra{max-width:1180px;margin:0 auto;padding:6px 0 64px;color:var(--ink)}
.ra-kicker{font-size:12px;font-weight:800;letter-spacing:.08em;color:#5E4BD6}
.ra-head h1{font-size:28px;line-height:1.3;margin:6px 0 8px;letter-spacing:-.02em;text-wrap:balance}
.ra-head p{margin:0;color:#5B5470;max-width:64ch;line-height:1.7;font-size:15px}
.ra-start{margin-top:18px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px}
.ra-url{display:flex;gap:8px}
.ra-url input{flex:1;min-width:0;font:inherit;font-size:15px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:#FCFBFF;color:var(--ink)}
.ra-url input:focus{outline:2px solid #B9A8FF;outline-offset:1px}
.ra-url.small input{padding:9px 12px;font-size:14px}
.ra-note{font-size:13px;color:#6B6382;margin-top:8px;line-height:1.6}
.ra-sub{font-size:13px;font-weight:700;color:#4B4460;margin:20px 0 8px}
.ra-picks{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px}
.ra-pick{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:10px;align-items:center;padding:8px 10px 8px 8px;border:1px solid var(--line);border-radius:12px;background:#fff}
.ra-pick img{width:44px;height:60px;object-fit:cover;border-radius:8px;background:#EEE8FF;display:block}
.ra-pick b{display:block;font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ra-pick span{display:block;font-size:12px;color:#6B6382;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ra-pick .ra-prod{margin-top:3px}
.ra-arch-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;margin:32px 0 12px}
.ra-arch-head h2{margin:0;font-size:20px}
.ra-arch-head h2 small{font-size:13px;color:#6B6382;font-weight:500;margin-left:4px}
.ra-filters{display:flex;gap:6px;flex-wrap:wrap}
.ra-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px;align-items:start}
.ra-card{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;transition:border-color .15s,box-shadow .15s}
.ra-card:hover{border-color:#D4C8FF;box-shadow:0 10px 26px rgba(138,108,255,.14)}
.ra-card:focus-visible{outline:2px solid #8E7CFF;outline-offset:2px}
.ra-cover{position:relative;aspect-ratio:4/5;background:#EEE8FF;overflow:hidden}
.ra-cover img{width:100%;height:100%;object-fit:cover;display:block}
.ra-cover .ra-prod{position:absolute;left:8px;top:8px}
.ra-cover .ra-dur{position:absolute;right:8px;bottom:8px;font-size:11.5px;font-weight:700;background:rgba(20,16,32,.75);color:#fff;border-radius:6px;padding:1px 6px;font-variant-numeric:tabular-nums}
.ra-cbody{padding:10px 12px 12px;display:flex;flex-direction:column;gap:4px}
.ra-cbody b{font-size:14px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.ra-cbody span{font-size:12px;color:#6B6382}
.ra-card.run{cursor:pointer}.ra-card.run .ra-cover,.ra-card.err .ra-cover{display:grid;place-items:center;text-align:center;padding:14px;color:#5E4BD6;font-weight:700;font-size:14px;aspect-ratio:auto;min-height:150px}
.ra-card.err .ra-cover{color:#AE3E1B;background:#FFF1EC}
.ra-mini{height:6px;background:#E3DBFF;border-radius:99px;overflow:hidden;margin-top:10px;width:100%}.ra-mini i{display:block;height:100%;background:linear-gradient(90deg,#B48CFF,#5FD0DD)}
.ra-prod{display:inline-flex;align-items:center;font-size:12px;font-weight:700;padding:3px 9px;border-radius:999px;background:#EEE8FF;color:#4F3DC7;white-space:nowrap}
.ra-prod.p-self{background:#E2F5E8;color:#1D7042}.ra-prod.p-reuse{background:#FFE8DF;color:#AE3E1B}.ra-prod.p-mix{background:#FFF1D1;color:#855400}.ra-prod.p-none{background:#EFEFF3;color:#555}
.ra-empty{grid-column:1/-1;border:1px dashed #D9CCFF;border-radius:14px;padding:26px;text-align:center;color:#6B6382;background:rgba(255,255,255,.7);font-size:14px;line-height:1.6}
.ra-top{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.ra-back{font-size:14px;color:#5E4BD6;text-decoration:none;font-weight:700}
.ra-actions{display:flex;gap:6px;flex-wrap:wrap}
.ra-layout{display:grid;grid-template-columns:290px minmax(0,1fr);gap:22px;align-items:start}
.ra-video{position:sticky;top:12px}
.ra-video video{width:100%;aspect-ratio:9/16;background:#000;border-radius:14px;display:block}
.ra-video.land video{aspect-ratio:16/9}
.ra-video small{display:block;font-size:12px;color:#6B6382;margin-top:8px;text-align:center;line-height:1.5}
.ra-body{display:flex;flex-direction:column;gap:14px;min-width:0}
.ra-sec{background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px 18px 20px}
.ra-meta{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:13px;color:#6B6382}
.ra-meta b{color:var(--ink);font-weight:700}
.ra-one{font-size:22px;line-height:1.45;font-weight:800;letter-spacing:-.015em;margin:10px 0 12px;text-wrap:balance}
.ra-badges{display:flex;flex-wrap:wrap;gap:6px}
.ra-badge{font-size:12.5px;padding:4px 10px;border-radius:999px;background:#F5F1FF;color:#4B4460}
.ra-h{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin:0 0 12px;font-size:17px}
.ra-h small{font-size:12.5px;color:#6B6382;font-weight:500}
.ra-ev{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.ra-ev li{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px;align-items:baseline;font-size:14px;line-height:1.6}
.ra-t{font:inherit;font-size:12px;font-weight:700;font-variant-numeric:tabular-nums;padding:2px 8px;border-radius:7px;border:1px solid #D9CCFF;background:#fff;color:#4F3DC7;cursor:pointer;white-space:nowrap}
.ra-t:hover{background:#EEE8FF}.ra-t:focus-visible{outline:2px solid #8E7CFF;outline-offset:1px}
.ra-kvs{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px;margin-top:14px}
.ra-kv{background:#FAF8FF;border-radius:10px;padding:9px 11px}
.ra-kv span{display:block;font-size:11.5px;color:#6B6382;font-weight:700}
.ra-kv div{font-size:14px;margin-top:2px;line-height:1.55}
.ra-kv.wide{grid-column:1/-1}
.ra-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:4px}
.ra-chips i{font-style:normal;font-size:12.5px;padding:2px 8px;border-radius:7px;background:#fff;border:1px solid var(--line)}
.ra-strip{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px}
.ra-fr{flex:none;position:relative;border:0;padding:0;background:none;cursor:pointer;border-radius:8px}
.ra-fr img{height:150px;aspect-ratio:9/16;object-fit:cover;border-radius:8px;display:block;background:#15121E}
.ra-fr.land img{aspect-ratio:16/9}
.ra-fr em{position:absolute;left:4px;top:4px;font-style:normal;font-size:11px;font-weight:700;background:rgba(20,16,32,.78);color:#fff;border-radius:5px;padding:1px 5px;font-variant-numeric:tabular-nums}
.ra-fr:focus-visible{outline:2px solid #8E7CFF;outline-offset:2px}
.ra-hook{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;margin-top:12px}
.ra-scene{display:grid;grid-template-columns:92px minmax(0,1fr);gap:14px;padding:16px 0;border-top:1px solid var(--line)}
.ra-scene:first-of-type{border-top:0;padding-top:2px}
.ra-stime{display:flex;flex-direction:column;gap:6px;align-items:flex-start}
.ra-role{font-size:12px;font-weight:800;color:#5E4BD6}
.ra-src{font-size:11.5px;color:#6B6382}
.ra-sframes{display:flex;gap:4px;margin-bottom:10px;overflow-x:auto}
.ra-sframes .ra-fr img{height:120px}
.ra-screen{font-size:15px;line-height:1.6;font-weight:600}
.ra-said{font-size:14px;line-height:1.6;margin-top:6px}
.ra-said .cap{color:#3B2BA8;font-weight:700}
.ra-sgrid{display:flex;flex-wrap:wrap;gap:4px 16px;margin-top:6px;font-size:13px;color:#4B4460}
.ra-sgrid span{color:#8A82A0;margin-right:4px}
.ra-tip{margin-top:8px;font-size:13px;background:#FFF4E8;color:#7A4A12;border-radius:8px;padding:6px 9px;line-height:1.5}
.ra-cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.ra-col{background:#FAF8FF;border-radius:12px;padding:12px 14px}
.ra-col.warn{background:#FFF4EF}
.ra-col h3{font-size:14px;margin:0 0 8px}
.ra-col ul{margin:0;padding-left:18px;font-size:14px;line-height:1.6}
.ra-col li+li{margin-top:5px}
.ra-shoot{margin:0;padding-left:22px;font-size:14px;line-height:1.75;columns:2;column-gap:28px}
.ra-shoot li{break-inside:avoid}
.ra-all{display:grid;grid-template-columns:repeat(auto-fill,minmax(82px,1fr));gap:6px}
.ra-all.land{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
.ra-all .ra-fr img{height:auto;width:100%}
.ra-wait{max-width:620px;margin:30px auto;background:#fff;border:1px solid var(--line);border-radius:16px;padding:24px}
.ra-wait h2{margin:6px 0 0;font-size:20px;line-height:1.4}
.ra-steps{list-style:none;margin:18px 0;padding:0;display:grid;gap:9px}
.ra-steps li{display:flex;align-items:center;gap:10px;font-size:14px;color:#8A82A0}
.ra-steps li::before{content:"";width:10px;height:10px;border-radius:50%;background:#E7E0F7;flex:none}
.ra-steps li.on{color:var(--ink);font-weight:700}.ra-steps li.on::before{background:#8E7CFF;box-shadow:0 0 0 4px #EEE8FF}
.ra-steps li.done{color:#4B4460}.ra-steps li.done::before{background:#1D7042}
.ra-bar{height:8px;border-radius:99px;background:#EEE8FF;overflow:hidden}.ra-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#B48CFF,#8E7CFF,#5FD0DD);transition:width .5s}
.ra-err{margin-top:14px;background:#FFF1EC;color:#8A2E12;border-radius:10px;padding:10px 12px;font-size:14px;line-height:1.6}
@media (max-width:900px){.ra-layout{grid-template-columns:1fr}.ra-video{position:static;max-width:300px;width:100%;margin:0 auto}.ra-video.land{max-width:none}.ra-cols{grid-template-columns:1fr}.ra-shoot{columns:1}.ra-scene{grid-template-columns:1fr;gap:8px}.ra-stime{flex-direction:row;align-items:center;flex-wrap:wrap}.ra-head h1{font-size:23px}.ra-one{font-size:19px}.ra-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.ra-cbody b{font-size:13px}.ra-url{flex-wrap:wrap}.ra-url .btn{flex:1 0 auto}}
@media (prefers-reduced-motion:reduce){.ra-bar i{transition:none}.ra-card{transition:none}}`;
  const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

  const RA = { filter: "", q: "", poll: null, cur: null };
  const PROD = ["직접 촬영", "재가공", "혼합", "화면 녹화", "사진 슬라이드", "그래픽·AI"];
  const STEPS = [["media", "영상 준비"], ["auto", "컷·자막·대사 뽑기"], ["frames", "0.5초마다 프레임 뜯기"], ["vision", "화면 판독"], ["done", "정리"]];
  const prodCls = (p) => p === "직접 촬영" ? "p-self" : p === "재가공" ? "p-reuse" : p === "혼합" ? "p-mix" : (!p || p === "판단 보류") ? "p-none" : "";
  const tt = (t) => { t = Number(t) || 0; const m = Math.floor(t / 60), s = t - m * 60; return m ? `${m}:${s.toFixed(1).padStart(4, "0")}` : `${s.toFixed(1)}초`; };
  const short = (s) => String(s || "").split(/\s*[(（—]/)[0].trim() || String(s || "");
  window.raImgFallback = (el) => { const a = el.dataset.alt; if (a && el.dataset.f !== "1") { el.dataset.f = "1"; el.src = a; } else el.style.visibility = "hidden"; };
  const stop = () => { if (RA.poll) { clearInterval(RA.poll); RA.poll = null; } };
  const here = (h) => location.hash === h || location.hash.startsWith(h + "/");

  window.viewAnalyze = async function (arg) {
    stop();
    if (arg) return viewResult(arg);
    return viewHome();
  };

  // ---------------- 홈: 시작 + 보관함
  async function viewHome() {
    const list = await api("/api/refan").catch(() => []);
    const basket = typeof PLANREFS === "function" ? PLANREFS() : [];
    const done = list.filter(x => x.status === "done").length;
    $("#main").innerHTML = `<div class="ra">
      <header class="ra-head"><div class="ra-kicker">레퍼런스 분석</div><h1>이 영상, 실제로는 어떻게 만들었을까요?</h1>
        <p>영상을 0.5초마다 한 장씩 전부 뜯어서 봅니다. 직접 찍었는지 남의 영상을 가져와 붙였는지, 첫 3초에 무엇을 보여줬는지, 장면이 어떻게 이어지는지 판독하고 기획에 그대로 넘깁니다.</p></header>
      <section class="ra-start" aria-label="분석 시작">
        <div class="ra-url"><input id="ra-url" type="url" placeholder="인스타 릴스나 유튜브 쇼츠 링크를 붙여 넣으세요" aria-label="분석할 링크" onkeydown="if(event.key==='Enter')raStartUrl()"><button class="btn p" onclick="raStartUrl()">분석 시작</button></div>
        <div class="ra-note">저장된 레퍼런스는 영상을 다시 받지 않아요. 처음 보는 인스타 링크는 수집 크레딧을 1개 씁니다. 한 편에 3~6분 걸리고, 화면을 떠나도 뒤에서 계속 돼요.</div>
        ${basket.length ? `<div class="ra-sub">기획 바구니에 담긴 릴스</div><div class="ra-picks" id="ra-basket"><div class="ra-note">불러오는 중…</div></div>` : ""}
        <div class="ra-sub">저장된 레퍼런스에서 찾기</div>
        <div class="ra-url small"><input id="ra-q" placeholder="계정이나 캡션 단어 (예: 카페, 필라테스, 추천템)" aria-label="레퍼런스 찾기" value="${esc(RA.q)}" onkeydown="if(event.key==='Enter')raSearch()"><button class="btn" onclick="raSearch()">찾기</button></div>
        <div class="ra-picks" id="ra-found" style="margin-top:8px"></div>
      </section>
      <section aria-label="분석 보관함">
        <div class="ra-arch-head"><h2>분석 보관함 <small>${done}개</small></h2><div class="ra-filters">${["", ...PROD].map(p => `<button class="rcat ${RA.filter === p ? "on" : ""}" onclick="raFilter('${p}')">${p || "전체"}</button>`).join("")}</div></div>
        <div class="ra-grid" id="ra-grid">${archiveHtml(list)}</div>
      </section></div>`;
    if (basket.length) loadPicks(basket, "#ra-basket");
    if (RA.q) raSearch();
    if (list.some(x => x.status === "running")) RA.poll = setInterval(refreshArchive, 4000);
  }
  function archiveHtml(list) {
    const busy = list.filter(x => x.status !== "done");
    const shown = list.filter(x => x.status === "done" && (!RA.filter || x.production === RA.filter));
    const busyHtml = busy.map(x => x.status === "running"
      ? `<div class="ra-card run" role="link" tabindex="0" onclick="location.hash='#/analyze/${esc(x.id)}'" onkeydown="if(event.key==='Enter')this.click()"><div class="ra-cover"><div>분석 중 ${x.pct || 0}%<div class="ra-mini"><i style="width:${x.pct || 0}%"></i></div></div></div><div class="ra-cbody"><b>${esc(x.message || "진행 중")}</b><span>${esc(x.label || "")}</span></div></div>`
      : `<div class="ra-card err"><div class="ra-cover">분석하지 못했어요</div><div class="ra-cbody"><b>${esc(x.error || "")}</b><span>${esc(x.label || "")}</span>${x.item_id || x.url ? `<button class="btn small" style="margin-top:6px" onclick="raStart(${esc(JSON.stringify(x.item_id ? { item_id: x.item_id } : { url: x.url }))})">다시 시도</button>` : ""}</div></div>`).join("");
    const doneHtml = shown.map(x => `<div class="ra-card" role="link" tabindex="0" onclick="location.hash='#/analyze/${esc(x.id)}'" onkeydown="if(event.key==='Enter')this.click()">
        <div class="ra-cover"><img src="${esc(x.cover || x.thumbnail || "")}" data-alt="${esc(x.thumbnail || "")}" loading="lazy" alt="" onerror="raImgFallback(this)"><span class="ra-prod ${prodCls(x.production)}">${esc(x.production || "판단 보류")}</span>${x.duration ? `<span class="ra-dur">${Math.round(x.duration)}초</span>` : ""}</div>
        <div class="ra-cbody"><b>${esc(x.one_line || "(한 줄 요약 없음)")}</b><span>@${esc(x.account || "-")} · ${esc(x.format || "")} · ${esc((x.created_at || "").slice(5))}</span></div></div>`).join("");
    if (!busyHtml && !doneHtml) return `<div class="ra-empty">${list.length ? "이 제작 방식으로 분석한 영상이 아직 없어요." : "아직 분석한 영상이 없어요. 위에 링크를 붙여 넣거나 저장된 레퍼런스를 골라 첫 분석을 시작해 보세요."}</div>`;
    return busyHtml + doneHtml;
  }
  async function refreshArchive() {
    if (location.hash !== "#/analyze") return stop();
    const list = await api("/api/refan").catch(() => null); if (!list) return;
    const g = $("#ra-grid"); if (g) g.innerHTML = archiveHtml(list);
    if (!list.some(x => x.status === "running")) stop();
  }
  window.raFilter = (p) => { RA.filter = p; viewHome(); };
  function pickHtml(it) {
    let v = null; try { v = it.visual ? (typeof it.visual === "string" ? JSON.parse(it.visual) : it.visual) : null; } catch (e) {}
    return `<div class="ra-pick"><img src="${esc(it.thumbnail || "")}" alt="" loading="lazy" onerror="imgRetry(this)"><div style="min-width:0"><b>${it.platform === "youtube" ? esc(it.account_name || it.account || "-") : "@" + esc(it.account || "-")}</b><span>${it.platform === "youtube" ? "쇼츠" : "릴스"} · ▶ ${fmt(it.views)} · ${esc((it.caption || "").split("\n")[0].slice(0, 30))}</span>${v ? `<span class="ra-prod ${prodCls(v.production)}">${esc(v.production || "")}</span>` : ""}</div>${v ? `<a class="btn small" href="#/analyze/${esc(v.aid)}">결과 보기</a>` : `<button class="btn small p" onclick="raStart({item_id:${Number(it.id)}})">분석</button>`}</div>`;
  }
  async function loadPicks(ids, sel) {
    const items = [];
    for (const id of ids.slice(0, 6)) { try { items.push(await api("/api/items/" + id)); } catch (e) {} }
    const box = $(sel); if (box) box.innerHTML = items.length ? items.map(pickHtml).join("") : '<div class="ra-note">바구니의 릴스를 불러오지 못했어요.</div>';
  }
  window.raSearch = async () => {
    const el = $("#ra-q"); RA.q = el ? el.value.trim() : RA.q; const box = $("#ra-found"); if (!box) return;
    if (!RA.q) { box.innerHTML = ""; return; }
    box.innerHTML = '<div class="ra-note">찾는 중…</div>';
    try { const r = await api(`/api/items?q=${encodeURIComponent(RA.q)}&sort=views&limit=24`); box.innerHTML = (r.items || []).length ? r.items.map(pickHtml).join("") : '<div class="ra-note">맞는 레퍼런스가 없어요. 다른 단어로 찾아보세요.</div>'; }
    catch (e) { box.innerHTML = `<div class="ra-note">찾지 못했어요: ${esc(e.message)}</div>`; }
  };
  window.raStart = async (body) => {
    try { const r = await post("/api/refan", body); if (r.error) throw new Error(r.error); if (r.dedup) toast("이미 분석 중인 영상이라 그 화면으로 갈게요"); location.hash = "#/analyze/" + r.id; }
    catch (e) { toast("시작하지 못했어요: " + e.message); }
  };
  window.raStartUrl = () => {
    const u = (($("#ra-url") || {}).value || "").trim();
    if (!/instagram\.com|youtube\.com|youtu\.be/.test(u)) return toast("인스타 릴스나 유튜브 쇼츠 링크를 넣어 주세요");
    raStart({ url: u });
  };

  // ---------------- 진행 화면
  async function viewResult(id) {
    let j = null; try { j = await api("/api/refan/" + id); } catch (e) {}
    if (j && j.status === "done") { RA.cur = j; return render(j); }
    viewProgress(id);
  }
  function viewProgress(id) {
    $("#main").innerHTML = `<div class="ra"><div class="ra-top"><a class="ra-back" href="#/analyze">← 분석 보관함</a></div>
      <div class="ra-wait" role="status" aria-live="polite"><div class="ra-kicker">분석 중</div><h2 id="ra-wmsg">준비하고 있어요</h2>
      <ol class="ra-steps" id="ra-steps">${STEPS.map(([k, l]) => `<li data-k="${k}">${l}</li>`).join("")}</ol>
      <div class="ra-bar"><i id="ra-bar"></i></div><div class="ra-note">화면을 떠나도 뒤에서 계속 돼요. 끝나면 분석 보관함에 올라옵니다.</div><div id="ra-werr"></div></div></div>`;
    const tick = async () => {
      if (!here("#/analyze/" + id)) return stop();
      let p; try { p = await api(`/api/refan/${id}/progress`); } catch (e) { return; }
      const idx = STEPS.findIndex(s => s[0] === p.stage);
      $$("#ra-steps li").forEach((li, i) => { li.classList.toggle("done", p.stage === "done" ? i < STEPS.length - 1 : i < idx); li.classList.toggle("on", i === idx && !p.error); });
      const bar = $("#ra-bar"); if (bar) bar.style.width = (p.pct || 0) + "%";
      const msg = $("#ra-wmsg"); if (msg) msg.textContent = p.error ? "분석하지 못했어요" : (p.message || "진행 중");
      if (p.error) { stop(); $("#ra-werr").innerHTML = `<div class="ra-err">${esc(p.error)}</div><div class="row" style="margin-top:12px;gap:6px"><a class="btn" href="#/analyze">보관함으로</a></div>`; }
      else if (p.done) { stop(); viewResult(id); }
    };
    stop(); RA.poll = setInterval(tick, 2000); tick();
  }

  // ---------------- 결과 화면
  function render(j) {
    const r = j.result || {}, pr = r.production || {}, pe = r.people || {}, hk = r.hook || {}, ed = r.editing || {}, df = r.difficulty || {}, au = j.auto || {}, it = j.item || {};
    const frames = j.frames || []; const land = j.portrait === false ? " land" : "";
    const framesIn = (t0, t1, n) => { const fs = frames.filter(f => f.t >= t0 - 0.01 && f.t < Math.max(t1, t0 + 0.02) - 0.01); if (fs.length <= n) return fs; const step = fs.length / n; return Array.from({ length: n }, (_, i) => fs[Math.floor(i * step)]); };
    const fr = (f) => `<button class="ra-fr${land}" onclick="raSeek(${f.t})" aria-label="${tt(f.t)}로 이동"><img src="${esc(f.path)}" alt="" loading="lazy"><em>${tt(f.t)}</em></button>`;
    const tb = (t) => `<button class="ra-t" onclick="raSeek(${Number(t) || 0})">${tt(t)}</button>`;
    const kv = (k, v) => v ? `<div class="ra-kv"><span>${esc(k)}</span><div>${v}</div></div>` : "";
    const list = (a) => (a || []).length ? `<ul>${a.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : '<div class="ra-note">없음</div>';
    const plat = j.platform === "youtube" ? "유튜브 쇼츠" : "인스타 릴스";
    const scenes = r.scenes || [];
    const autoChips = au && au.duration ? [`컷 ${au.shots}개 · 평균 ${au.avg_shot}초`, `끊는 컷 ${(au.transitions || {})["컷"] || 0} · 부드러운 전환 ${(au.transitions || {})["부드러운 전환"] || 0}`, (au.delivery || {}).speed ? `말 속도 ${(au.delivery || {}).speed}` : "", au.music ? String(au.music).slice(0, 40) : "", j.sfx_count ? `효과음 ${j.sfx_count}곳` : ""].filter(Boolean) : [];
    $("#main").innerHTML = `<div class="ra">
      <div class="ra-top"><a class="ra-back" href="#/analyze">← 분석 보관함</a>
        <div class="ra-actions"><a class="btn small" href="${esc(j.url)}" target="_blank" rel="noopener">원본 열기 ↗</a>${j.item_id ? `<button class="btn small p" onclick="raToPlan(${Number(j.item_id)})">✍️ 이 영상으로 기획하기</button><button class="btn small" onclick="raStart({item_id:${Number(j.item_id)}})">다시 분석</button>` : ""}<button class="btn small" onclick="raDelete('${esc(j.id)}')">삭제</button></div></div>
      <div class="ra-layout">
        <aside class="ra-video${land}"><video id="ra-video" src="${esc(j.mp4)}" poster="${esc(j.thumbnail || "")}" controls playsinline preload="metadata"></video><small>초 표시를 누르면 그 장면으로 이동해요</small></aside>
        <div class="ra-body">
          <section class="ra-sec">
            <div class="ra-meta"><span>${plat}</span><span><b>${j.platform === "youtube" ? esc(j.account_name || j.account || "-") : "@" + esc(j.account || "-")}</b></span>${it.views != null ? `<span>조회수 <b>${fmt(it.views)}</b></span>` : ""}${it.likes != null ? `<span>좋아요 <b>${fmt(it.likes)}</b></span>` : ""}${it.followers ? `<span>팔로워 <b>${fmt(it.followers)}</b></span>` : ""}${it.posted_at ? `<span>게시 ${esc(it.posted_at)}</span>` : ""}<span>길이 ${Math.round(j.duration || 0)}초 · 프레임 ${frames.length}장</span></div>
            <div class="ra-one">${esc(r.one_line || "")}</div>
            <div class="ra-badges"><span class="ra-prod ${prodCls(pr.type)}">${esc(pr.type || "판단 보류")}${pr.confidence ? ` · 확신 ${esc(pr.confidence)}` : ""}</span>${r.format ? `<span class="ra-badge">${esc(r.format)}</span>` : ""}${pe.face ? `<span class="ra-badge" title="${esc(pe.face)}">${esc(/얼굴/.test(short(pe.face)) ? short(pe.face) : "얼굴 " + short(pe.face))}</span>` : ""}${pe.voice ? `<span class="ra-badge" title="${esc(pe.voice)}">소리: ${esc(short(pe.voice))}</span>` : ""}${df.level ? `<span class="ra-badge">따라 만들기 ${esc(df.level)}</span>` : ""}</div>
            <div class="ra-kvs">${kv("노리는 행동", esc(r.purpose))}${kv("나오는 사람", esc(pe.on_screen))}${pe.voice && short(pe.voice) !== pe.voice ? kv("소리", esc(pe.voice)) : ""}${kv("장소", esc(r.setting))}${(r.things || []).length ? `<div class="ra-kv wide"><span>눈에 띄는 것</span><div class="ra-chips">${r.things.map(x => `<i>${esc(x)}</i>`).join("")}</div></div>` : ""}</div>
          </section>
          <section class="ra-sec"><h2 class="ra-h">왜 '${esc(pr.type || "이 방식")}'이라고 봤나 <small>근거마다 초를 누르면 그 장면이 나와요</small></h2>
            ${(pr.evidence || []).length ? `<ul class="ra-ev">${pr.evidence.map(e => `<li>${tb(e.t)}<span>${esc(e.text)}</span></li>`).join("")}</ul>` : '<div class="ra-note">근거가 기록되지 않았어요.</div>'}</section>
          <section class="ra-sec"><h2 class="ra-h">첫 ${esc(String(hk.t1 || 3))}초 <small>넘기지 않고 멈추게 만든 부분</small></h2>
            <div class="ra-strip">${framesIn(0, hk.t1 || 3, 8).map(fr).join("")}</div>
            <div class="ra-hook">${kv("화면", esc(hk.screen))}${kv("화면 글자", hk.text ? `<span class="ra-said"><span class="cap">${esc(hk.text)}</span></span>` : "")}${kv("첫마디", esc(hk.line))}${kv("멈추게 되는 이유", esc(hk.why))}</div></section>
          <section class="ra-sec"><h2 class="ra-h">장면 구성 <small>${scenes.length}장면 · 0초부터 끝까지</small></h2>
            ${scenes.map(s => `<div class="ra-scene"><div class="ra-stime">${tb(s.t0)}<span class="ra-role">${esc(s.role || "")}</span><span class="ra-src">${esc(s.source || "")}</span></div>
              <div><div class="ra-sframes">${framesIn(s.t0, s.t1, 4).map(fr).join("")}</div>
              <div class="ra-screen">${esc(s.screen || "")}</div>
              ${s.text || s.line ? `<div class="ra-said">${s.text ? `<span class="cap">${esc(s.text)}</span>` : ""}${s.text && s.line ? "<br>" : ""}${s.line ? `“${esc(s.line)}”` : ""}</div>` : ""}
              <div class="ra-sgrid">${s.shot ? `<div><span>구도</span>${esc(s.shot)}</div>` : ""}${s.camera ? `<div><span>카메라</span>${esc(s.camera)}</div>` : ""}${s.edit ? `<div><span>편집</span>${esc(s.edit)}</div>` : ""}<div><span>길이</span>${tt(s.t0)}~${tt(s.t1)}</div></div>
              ${s.note ? `<div class="ra-tip">${esc(s.note)}</div>` : ""}</div></div>`).join("") || '<div class="ra-note">장면 정보가 없어요.</div>'}</section>
          <section class="ra-sec"><h2 class="ra-h">편집 방식</h2>
            <div class="ra-kvs" style="margin-top:0">${kv("컷 속도", esc(ed.pace))}${kv("전환", esc(ed.transitions))}${kv("자막", esc(ed.captions))}${kv("효과", esc(ed.effects))}${kv("음악·효과음", esc(ed.sound))}${autoChips.length ? kv("자동 측정", `<div class="ra-chips">${autoChips.map(x => `<i>${esc(x)}</i>`).join("")}</div>`) : ""}</div></section>
          <section class="ra-sec"><div class="ra-cols"><div class="ra-col"><h3>왜 잘 됐나</h3>${list(r.why_it_worked)}</div><div class="ra-col"><h3>우리 영상에 가져올 것</h3>${list(r.steal)}</div><div class="ra-col warn"><h3>그대로 따라 하면 안 되는 것</h3>${list(r.avoid)}</div></div></section>
          <section class="ra-sec"><h2 class="ra-h">직접 찍어서 만든다면 <small>${df.level ? `난이도 ${esc(df.level)}${df.why ? " · " + esc(df.why) : ""}` : ""}</small></h2>
            ${(r.shoot_list || []).length ? `<ol class="ra-shoot">${r.shoot_list.map(x => `<li>${esc(x)}</li>`).join("")}</ol>` : '<div class="ra-note">없음</div>'}
            ${j.item_id ? `<div class="row" style="margin-top:14px"><button class="btn p" onclick="raToPlan(${Number(j.item_id)})">✍️ 이 분석을 참고해서 기획하기</button></div>` : ""}</section>
          <section class="ra-sec"><h2 class="ra-h">프레임 전체 <small>${frames.length}장 · ${esc(String(j.step || 0.5))}초 간격</small></h2>
            <div class="ra-all${land}">${frames.map(fr).join("")}</div>
            <div class="ra-note" style="margin-top:10px">${esc(j.engine || "")} · ${j.took_sec ? `판독 ${Math.round(j.took_sec / 60 * 10) / 10}분` : ""} · ${esc(j.created_at || "")}</div></section>
        </div></div></div>`;
    window.scrollTo(0, 0);
  }
  window.raSeek = (t) => { const v = $("#ra-video"); if (!v) return; try { v.currentTime = Math.max(0, Number(t) || 0); v.play().catch(() => {}); } catch (e) {} if (window.matchMedia("(max-width:900px)").matches) v.scrollIntoView({ block: "center", behavior: "smooth" }); };
  window.raToPlan = (id) => { const a = PLANREFS(); if (!a.includes(id)) { a.push(id); setPlanRefs(a); } toast("기획 바구니에 담았어요. 참고 릴스로 들어갑니다"); location.hash = "#/plan/new"; };
  window.raDelete = async (id) => { if (!confirm("이 분석 결과를 지울까요? (레퍼런스는 남아요)")) return; try { await post(`/api/refan/${id}/delete`, {}); toast("지웠어요"); location.hash = "#/analyze"; } catch (e) { toast(e.message); } };
})();
