// 유튜브 편집 툴 (베타, 관리자 전용): 링크/파일 → AI 하이라이트 → 세로 쇼츠 + 자막
(function () {
  let timer = null;
  window.viewYtEdit = async function () {
    clearInterval(timer);
    $("#main").innerHTML = `<div class="plan-toolbar"><div><h1 style="margin:0">유튜브 편집 툴 <span class="tag">베타 · 관리자</span></h1><div class="muted" style="margin-top:4px">긴 영상 링크나 파일을 넣으면 음성을 읽고, 터질 만한 30~60초 구간을 골라 세로 쇼츠로 잘라 제목·자막까지 입힙니다. 결과는 mp4와 자막 파일(srt)로 내려받습니다.</div></div></div>
      <section class="panel" style="margin-bottom:14px"><div class="two">
        <div><label class="wiz-label">유튜브 링크</label><input id="ye-url" class="wiz-input" placeholder="https://www.youtube.com/watch?v=..."><div class="muted" style="font-size:12px;margin-top:4px">또는 파일 업로드</div><input id="ye-file" type="file" accept="video/mp4,video/quicktime" style="margin-top:6px"></div>
        <div><div class="row" style="gap:8px;flex-wrap:wrap">
          <label class="wiz-label" style="width:100%">모드</label>
          <select id="ye-mode" class="chip" onchange="document.getElementById('ye-reelopts').style.display=this.value==='reel'?'block':'none'"><option value="highlight" selected>쇼츠 양산: 긴 영상에서 하이라이트 여러 개</option><option value="reel">릴스 만들기: 내가 찍은 원본 그대로 + 점프컷 + 자막</option></select>
          <div id="ye-reelopts" style="display:none;width:100%"><input id="ye-title-text" class="wiz-input" placeholder="상단 제목(훅 문장) — 기획안 첫 문장을 붙여 넣으세요" style="margin-top:6px"><label class="chip" style="display:inline-flex;align-items:center;gap:6px;margin-top:6px"><input id="ye-cut" type="checkbox" checked> 말 없는 구간 잘라내기(점프컷)</label></div>
          <label class="wiz-label" style="width:100%">화면 포맷</label>
          <select id="ye-format" class="chip" onchange="document.getElementById('ye-ecopts').style.display=this.value==='easycut'?'inline':'none'"><option value="easycut" selected>이지컷형: 검정 배경 · 2줄 제목 · 가운데 원본 · 댓글 카드 · 채널명</option><option value="simple">단순형: 제목 + 자막만</option></select>
          <span id="ye-ecopts"><select id="ye-template" class="chip"><option value="comment" selected>템플릿: 댓글 캡처(실제 인기 댓글)</option><option value="pop">템플릿: 자막 팝형(댓글 없이 큰 자막)</option><option value="minimal">템플릿: 다크 미니멀</option><option value="paper">템플릿: 페이퍼(흰 배경)</option></select>
          <select id="ye-accent" class="chip"><option value="yellow" selected>포인트색: 옐로</option><option value="red">레드</option><option value="coral">코랄</option><option value="aqua">아쿠아</option><option value="blue">블루</option><option value="purple">퍼플</option><option value="lime">라임</option></select></span>
          <label class="wiz-label" style="width:100%">옵션</label>
          <select id="ye-clips" class="chip"><option value="3">쇼츠 3개</option><option value="5" selected>쇼츠 5개</option><option value="8">쇼츠 8개</option></select>
          <select id="ye-len" class="chip"><option value="30,60" selected>30~60초</option><option value="20,40">20~40초</option><option value="45,90">45~90초</option></select>
          <select id="ye-style" class="chip"><option value="box" selected>자막: 검정 박스</option><option value="clean">자막: 흰 글씨 + 외곽선</option></select>
          <select id="ye-pos" class="chip"><option value="mid" selected>자막 위치: 가운데 아래(원본 자막 안 겹침)</option><option value="low">자막 위치: 맨 아래</option><option value="high">자막 위치: 가운데</option></select>
          <select id="ye-crop" class="chip"><option value="fit" selected>화면: 전체 화면 축소 + 블러 배경</option><option value="fitdark">화면: 전체 화면 축소 + 검정 배경</option><option value="zoom">화면: 크게(양옆 조금 잘림)</option><option value="center">화면: 가운데 꽉 채우기(많이 잘림)</option></select>
          <label class="chip" style="display:inline-flex;align-items:center;gap:6px"><input id="ye-title" type="checkbox" checked> 상단 제목 4초 표시</label>
        </div><button class="btn p big" style="margin-top:12px" onclick="yeStart()">쇼츠 만들기</button><div id="ye-msg" class="muted" style="margin-top:8px;font-size:12px"></div>
        <div class="muted" style="font-size:12px;margin-top:10px">본인이 찍었거나 사용 허락을 받은 영상만 넣으세요. 남의 영상을 잘라 올리는 것은 저작권 문제가 생길 수 있습니다.</div></div>
      </div></section>
      <section class="panel" style="margin-bottom:14px"><h2 style="margin:0 0 4px">재사용 허용(크리에이티브 커먼즈) 영상 찾기</h2><div class="muted" style="font-size:12px;margin-bottom:10px">올린 사람이 "저작자 표시만 하면 써도 된다"고 정한 영상만 유튜브 공식 API로 찾습니다. 골라서 바로 쇼츠로 만들 수 있고, 올릴 때 아래 출처 문구를 설명란에 붙이면 됩니다.</div>
        <div class="row" style="gap:8px;flex-wrap:wrap"><div class="search" style="flex:1;min-width:220px">🔍 <input id="cc-q" placeholder="검색어 (예: 카페 창업, 다이어트 식단, 강아지 훈련)" onkeydown="if(event.key==='Enter')ccSearch()"></div>
          <select id="cc-order" class="chip"><option value="viewCount">조회수순</option><option value="date">최신순</option><option value="relevance">관련도순</option></select>
          <select id="cc-days" class="chip"><option value="0">기간 전체</option><option value="30">최근 30일</option><option value="100">최근 100일</option><option value="365">최근 1년</option></select>
          <select id="cc-dur" class="chip"><option value="any">길이 전체</option><option value="medium">4~20분</option><option value="long">20분 이상</option><option value="short">4분 미만</option></select>
          <button class="btn p" onclick="ccSearch()">찾기</button></div>
        <div class="rcats" style="margin-top:8px">${["카페 창업","자영업 사장님 인터뷰","다이어트 식단","피부과 상담","강아지 훈련","요리 레시피","여행 브이로그","재테크 강의","운동 루틴","육아 꿀팁"].map(k => `<button class="rcat" onclick="$('#cc-q').value='${k}';ccSearch()">${k}</button>`).join("")}</div>
        <div id="cc-res" class="muted" style="margin-top:10px;font-size:13px">검색어를 넣고 찾기를 누르세요.</div></section>
      <div id="ye-jobs"></div>`;
    await yeRefresh(); timer = setInterval(() => { if (location.hash.startsWith("#/ytedit")) yeRefresh(); else clearInterval(timer); }, 4000);
  };
  window.ccSearch = async function () {
    const box = $("#cc-res"); box.innerHTML = "찾는 중…";
    try {
      const r = await api(`/api/edit/cc?q=${encodeURIComponent($("#cc-q").value.trim() || "브이로그")}&order=${$("#cc-order").value}&days=${$("#cc-days").value}&duration=${$("#cc-dur").value}`);
      if (r.error) throw new Error(r.error);
      if (!r.items.length) { box.innerHTML = "재사용 허용 영상이 없어요. 검색어를 바꿔보세요."; return; }
      const mm = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
      box.innerHTML = `<div class="refgrid" style="grid-template-columns:repeat(auto-fill,minmax(230px,1fr))">${r.items.map(v => `<div class="refcard" style="padding:10px"><a href="${esc(v.url)}" target="_blank" rel="noopener"><img src="${esc(v.thumb)}" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:10px"></a>
        <div style="font-weight:700;margin-top:8px;font-size:13px;line-height:1.4;max-height:2.8em;overflow:hidden">${esc(v.title)}</div><div class="muted" style="font-size:12px">${esc(v.channel)} · ${fmt(v.views)}회 · ${mm(v.duration)} · ${esc(v.posted_at)}</div>
        <span class="tag ok" style="margin-top:6px">CC BY 재사용 허용</span>
        <button class="btn p small" style="margin-top:8px;width:100%" onclick="ccUse('${esc(v.url)}', ${JSON.stringify(v.credit).replace(/"/g, "&quot;")})">이 영상으로 쇼츠 만들기</button></div>`).join("")}</div>`;
    } catch (e) { box.innerHTML = e.message; }
  };
  window.ccUse = (url, credit) => { $("#ye-url").value = url; window.__ccCredit = credit; window.scrollTo({ top: 0, behavior: "smooth" }); $("#ye-msg").textContent = "CC 영상이 선택됐어요. 옵션을 확인하고 '쇼츠 만들기'를 누르세요. 출처 문구: " + credit; };
  window.yeStart = async function () {
    const m = $("#ye-msg"); const url = $("#ye-url").value.trim(); const f = $("#ye-file").files[0];
    const [mn, mx] = $("#ye-len").value.split(",").map(Number);
    const opts = { clips: Number($("#ye-clips").value), min: mn, max: mx, style: $("#ye-style").value, crop: $("#ye-crop").value, title: $("#ye-title").checked, pos: $("#ye-pos").value, mode: $("#ye-mode").value, cut: $("#ye-cut").checked, format: $("#ye-format").value, template: $("#ye-template").value, accent: $("#ye-accent").value };
    let body = { url, opts, title_text: $("#ye-title-text").value, credit: url && window.__ccCredit && window.__ccCredit.includes(url.split("v=")[1] || "") ? window.__ccCredit : "" };
    try {
      if (!url && !f) { m.textContent = "링크나 파일을 넣어주세요"; return; }
      if (f && !url) {
        m.textContent = "업로드 중… " + (f.size / 1048576).toFixed(0) + "MB";
        const t = localStorage.getItem("hc_token"); const r = await fetch("/api/edit/upload?name=" + encodeURIComponent(f.name), { method: "PUT", body: f, headers: t ? { Authorization: "Bearer " + t } : {} }); const j = await r.json();
        if (j.error) throw new Error(j.error); body = { file: j.file, name: f.name, opts, title_text: $("#ye-title-text").value };
      }
      const r = await post("/api/edit/jobs", body); if (r.error) throw new Error(r.error);
      m.textContent = "시작했어요. 아래에서 진행 상황이 갱신됩니다."; $("#ye-url").value = ""; await yeRefresh();
    } catch (e) { m.textContent = e.message; }
  };
  window.yeRefresh = async function () {
    const jobs = await api("/api/edit/jobs").catch(() => []); const box = $("#ye-jobs"); if (!box) return;
    if (!jobs.length) { box.innerHTML = '<div class="empty"><b>아직 작업이 없어요</b>위에서 링크를 넣고 시작하세요.</div>'; return; }
    box.innerHTML = jobs.map(j => `<section class="panel" style="margin-bottom:12px"><div class="row" style="justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap">
      <div><b>${esc(j.title || j.url || j.file || j.id)}</b> <span class="tag ${j.status === "done" ? "ok" : ""}">${j.status === "done" ? "완료" : j.status === "error" ? "실패" : "진행 중"}</span><div class="muted" style="font-size:12px">${esc(j.created_at)} · ${j.duration ? Math.round(j.duration / 60) + "분" : ""} ${j.channel ? "· " + esc(j.channel) : ""}${(j.comments || []).length ? " · 실제 댓글 " + j.comments.length + "개 사용" : ""}</div></div>
      ${j.credit ? `<div class="muted" style="font-size:12px;width:100%">올릴 때 설명란에: <b>${esc(j.credit)}</b> <button class="btn small" onclick="navigator.clipboard.writeText('${esc(j.credit)}');toast('복사했어요')">복사</button></div>` : ""}
      <div class="row" style="gap:6px">${j.url ? `<a class="btn small" href="${esc(j.url)}" target="_blank" rel="noopener">원본</a>` : ""}<button class="btn small d" onclick="yeDelete('${j.id}')">삭제</button></div></div>
      ${j.status !== "done" ? `<div class="wiz-bar" style="margin-top:10px"><i style="width:${j.pct || 0}%"></i></div><div class="muted" style="font-size:12px;margin-top:4px">${esc(j.msg || "")}</div>` : ""}
      ${(j.clips || []).length ? `<div class="refgrid" style="margin-top:12px;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))">${j.clips.map(c => `<div class="refcard" style="padding:10px"><video src="${esc(c.mp4)}" poster="${esc(c.thumb)}" controls preload="none" style="width:100%;aspect-ratio:9/16;border-radius:10px;background:#000"></video>
        <div style="font-weight:700;margin-top:8px;line-height:1.35">${esc(c.title1 || c.title)}${c.title2 ? `<br><span style="color:var(--brand)">${esc(c.title2)}</span>` : ""}</div><div class="row" style="gap:6px;margin-top:4px;flex-wrap:wrap">${c.score ? `<span class="tag ok">터질 점수 ${c.score}/100</span>` : ""}<span class="tag">${c.len}초</span><span class="tag">원본 ${Math.floor(c.start / 60)}:${String(Math.floor(c.start % 60)).padStart(2, "0")}~${Math.floor(c.end / 60)}:${String(Math.floor(c.end % 60)).padStart(2, "0")}</span></div><div class="muted" style="font-size:12px;margin-top:4px">${esc(c.reason || "")}</div>${c.hook ? `<div style="font-size:13px;margin-top:4px">훅: ${esc(c.hook)}</div>` : ""}
        <div class="row" style="gap:6px;margin-top:8px"><a class="btn small" href="${esc(c.mp4)}" download>mp4</a><a class="btn small" href="${esc(c.srt)}" download>자막 srt</a></div></div>`).join("")}</div>` : ""}</section>`).join("");
  };
  window.yeDelete = async (id) => { if (!confirm("이 작업과 결과물을 지울까요?")) return; await api("/api/edit/jobs/" + id, { method: "DELETE" }); yeRefresh(); };
})();
