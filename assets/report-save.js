/*!
 * report-save.js — 리포트 "인쇄 / PDF 저장" 공통 처리 (2026-11-17)
 *
 * 문제: 카카오톡·인스타그램·네이버 등 앱 안의 내부 브라우저(WebView)에서는
 *       window.print() 를 호출해도 아무 반응이 없다. 버튼이 고장 난 것처럼 보인다.
 * 해결: 1) 일반 브라우저(크롬·사파리·엣지·파이어폭스·삼성인터넷)는 그대로 인쇄 창을 연다.
 *          → 인쇄 미리보기에서 "PDF로 저장"을 고르면 글자가 살아 있는 PDF가 나온다.
 *       2) 앱 내부 브라우저는 인쇄 창이 없으므로, 안내 시트를 띄우고
 *          휴대폰 기본 브라우저로 한 번에 넘긴다. 이때 현재 응답(상태)을 주소 #해시에 담아
 *          넘겨서, 넘어간 브라우저에서 같은 리포트가 그대로 다시 그려지고 인쇄 창이 열린다.
 *       ※ #해시는 서버로 전송되지 않는다.
 *
 * 사용법
 *   ReportSave.bind(buttonEl, { title:'나의 관계 패턴 리포트', printUrl:function(){...} })
 *   ReportSave.save(opts)                       // 위임 이벤트 처리 등에서 직접 호출
 *   var a = ReportSave.arrival();               // 넘어온 페이지에서: {save:true, state:'...'}
 *   ReportSave.arrivalPrint(opts)               // 복원이 끝난 뒤 호출: 자동 인쇄 + 안내 바
 */
(function (w, d) {
  'use strict';
  if (w.ReportSave && w.ReportSave.version) { return; }

  var UA = navigator.userAgent || '';
  var isIOS = /iPad|iPhone|iPod/.test(UA) || (/Macintosh/.test(UA) && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(UA);
  var isMobile = isIOS || isAndroid || /Mobile|Tablet/i.test(UA);

  function env() {
    var kakao = /KAKAOTALK/i.test(UA);
    var insta = /Instagram/i.test(UA);
    var fb = /FBAN|FBAV|FB_IAB|FB4A/i.test(UA);
    var line = /Line\/\d/i.test(UA);
    var naver = /NAVER\(inapp/i.test(UA);
    var band = /BAND\//i.test(UA);
    var daum = /DaumApps|Daum\/\d/i.test(UA);
    var wv = isAndroid && /\bwv\b/i.test(UA);
    var label = kakao ? '카카오톡' : insta ? '인스타그램' : fb ? '페이스북' : line ? '라인'
      : naver ? '네이버 앱' : band ? '밴드' : daum ? '다음 앱' : (wv ? '앱 내부 브라우저' : '');
    var inApp = !!(kakao || insta || fb || line || naver || band || daum || wv);
    // 테스트용 강제 플래그: ?rs_test_inapp=1 로 앱 내부 브라우저 상황을 재현할 수 있다.
    if (/[?&]rs_test_inapp=1/.test(w.location.search || '')) { inApp = true; if (!label) label = '앱 내부 브라우저'; }
    return { inApp: inApp, label: label, kakao: kakao, insta: insta, fb: fb, android: isAndroid, ios: isIOS, mobile: isMobile };
  }

  /* ---------- 주소(#해시)로 상태 넘기기 ---------- */
  function baseUrl() {
    var href = String(w.location.href || '');
    return href.split('#')[0];
  }

  function url(save, state) {
    var u = baseUrl();
    if (save) {
      u += (u.indexOf('?') > -1 ? '&' : '?') + 'rs=1';
      if (state) { u += '#s=' + encodeURIComponent(state); }
    }
    return u;
  }

  function arrival() {
    var res = { save: false, state: null };
    var q = String(w.location.search || '');
    if (!/[?&]rs=1/.test(q) && String(w.location.hash || '').indexOf('rs=1') === -1) { return res; }
    res.save = true;
    var h = String(w.location.hash || '').replace(/^#/, '');
    var parts = h.split('&');
    for (var i = 0; i < parts.length; i++) {
      var kv = parts[i].split('=');
      if (kv[0] === 's') {
        try { res.state = decodeURIComponent(kv.slice(1).join('=')); } catch (e) { res.state = null; }
      }
    }
    if (!res.state && /[?&]s=/.test(q)) {
      try { res.state = decodeURIComponent((q.match(/[?&]s=([^&]*)/) || [])[1] || '') || null; } catch (e) { res.state = null; }
    }
    return res;
  }

  function clearHash() {
    try { w.history.replaceState(null, d.title, w.location.pathname + w.location.search); } catch (e) {}
  }

  /* ---------- 앱 내부 → 기본 브라우저로 넘기기 ---------- */
  function openExternal(target) {
    var e = env();
    try {
      if (e.kakao) { w.location.href = 'kakaotalk://openExternalBrowser?url=' + encodeURIComponent(target); return true; }
      if (e.insta) { w.location.href = 'instagram://extbrowser/?url=' + encodeURIComponent(target); return true; }
      if (e.android) {
        var m = String(target).match(/^https?:\/\/([^\/?#]+)([^?#]*)(\?[^#]*)?(#.*)?$/);
        if (m) {
          var intent = 'intent://' + m[1] + (m[2] || '/') + (m[3] || '') +
            '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent(target) + ';end';
          w.location.href = intent;
          return true;
        }
      }
    } catch (err) {}
    return false;
  }

  /* ---------- 스타일 ---------- */
  function injectStyle() {
    if (d.getElementById('rs-style')) { return; }
    var css = [
      '.rs-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(22,20,34,.5);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .18s ease;-webkit-tap-highlight-color:transparent}',
      '.rs-ov.on{opacity:1}',
      '.rs-sheet{width:100%;max-width:470px;margin:0 auto;background:#fff;border-radius:22px 22px 0 0;padding:24px 20px calc(22px + env(safe-area-inset-bottom));font-family:Pretendard,-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",system-ui,sans-serif;color:#242338;box-shadow:0 -10px 34px rgba(22,20,34,.18);transform:translateY(12px);transition:transform .2s ease;text-align:left;line-height:1.6}',
      '.rs-ov.on .rs-sheet{transform:none}',
      '.rs-kicker{font-size:11px;font-weight:800;letter-spacing:.06em;color:#7655e8;margin:0 0 6px}',
      '.rs-title{font-size:19px;font-weight:800;letter-spacing:-.03em;margin:0 0 8px}',
      '.rs-body{font-size:13.5px;color:#5b5870;margin:0 0 16px}',
      '.rs-body b{color:#242338}',
      '.rs-primary{display:block;width:100%;padding:15px 18px;border:0;border-radius:14px;background:#242338;color:#fff;font-size:15px;font-weight:800;letter-spacing:-.02em;cursor:pointer;font-family:inherit}',
      '.rs-primary:active{opacity:.88}',
      '.rs-hint{font-size:12px;color:#858197;margin:12px 0 0;line-height:1.65}',
      '.rs-close{display:block;width:100%;margin-top:10px;padding:12px;border:0;border-radius:12px;background:#f3f1f8;color:#5b5870;font-size:13.5px;font-weight:700;cursor:pointer;font-family:inherit}',
      '.rs-bar{position:fixed;left:0;right:0;top:0;z-index:2147482000;display:flex;gap:10px;align-items:center;justify-content:space-between;padding:10px 14px calc(10px) 16px;background:#242338;color:#fff;font-family:Pretendard,-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",system-ui,sans-serif;font-size:12.5px;line-height:1.45;box-shadow:0 4px 18px rgba(22,20,34,.22)}',
      '.rs-bar button{flex:none;padding:10px 14px;border:0;border-radius:10px;background:#fff;color:#242338;font-size:12.5px;font-weight:800;font-family:inherit;cursor:pointer}',
      '.rs-toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,10px);z-index:2147482500;max-width:92vw;display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:12px;background:#242338;color:#fff;font-family:Pretendard,-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",system-ui,sans-serif;font-size:12.5px;line-height:1.45;box-shadow:0 8px 24px rgba(22,20,34,.24);opacity:0;transition:opacity .2s ease,transform .2s ease}',
      '.rs-toast.on{opacity:1;transform:translate(-50%,0)}',
      '.rs-toast button{flex:none;padding:7px 10px;border:0;border-radius:8px;background:#fff;color:#242338;font-size:12px;font-weight:800;font-family:inherit;cursor:pointer}',
      '@media print{.rs-ov,.rs-bar,.rs-toast{display:none!important}}'
    ].join('');
    var st = d.createElement('style');
    st.id = 'rs-style';
    st.appendChild(d.createTextNode(css));
    (d.head || d.documentElement).appendChild(st);
  }

  function hideAll() {
    var nodes = d.querySelectorAll('.rs-ov,.rs-toast,.rs-bar');
    for (var i = 0; i < nodes.length; i++) { nodes[i].parentNode.removeChild(nodes[i]); }
  }

  /* ---------- 안내 시트 ---------- */
  var sheetOpen = false;
  function showSheet(opts) {
    injectStyle();
    if (sheetOpen) { return; }
    sheetOpen = true;
    var e = env();
    var where = e.label || '앱 내부 브라우저';

    var ov = d.createElement('div');
    ov.className = 'rs-ov';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');

    var sheet = d.createElement('div');
    sheet.className = 'rs-sheet';

    var html = '';
    html += '<p class="rs-kicker">PDF 저장</p>';
    html += '<p class="rs-title">여기서는 인쇄 창이 열리지 않아요</p>';
    html += '<p class="rs-body"><b>' + where + '</b> 안에서는 휴대폰 인쇄 기능이 막혀 있어서, 버튼을 눌러도 아무 일이 없어요. '
      + '휴대폰 기본 브라우저(크롬·사파리)로 열면 같은 화면이 그대로 나오고, 거기서 <b>PDF로 저장</b>할 수 있어요.</p>';
    html += '<button type="button" class="rs-primary" data-rs="open">브라우저에서 열고 PDF로 저장</button>';
    html += '<p class="rs-hint">버튼이 안 되면 오른쪽 위 <b>⋯</b>(또는 공유) → <b>다른 브라우저로 열기</b>를 눌러 주세요.</p>';
    html += '<button type="button" class="rs-close" data-rs="close">닫기</button>';
    sheet.innerHTML = html;
    ov.appendChild(sheet);

    function close() {
      sheetOpen = false;
      ov.classList.remove('on');
      setTimeout(function () { if (ov.parentNode) { ov.parentNode.removeChild(ov); } }, 200);
    }

    ov.addEventListener('click', function (ev) {
      var t = ev.target;
      if (t === ov) { close(); return; }
      var act = t.getAttribute && t.getAttribute('data-rs');
      if (act === 'close') { close(); return; }
      if (act === 'open') {
        var target = (typeof opts.printUrl === 'function') ? opts.printUrl() : (opts.printUrl || url(true, null));
        var ok = openExternal(target);
        if (!ok) {
          var hint = sheet.querySelector('.rs-hint');
          if (hint) { hint.innerHTML = '이 브라우저에서는 자동으로 열리지 않아요. 오른쪽 위 <b>⋯</b>(또는 공유) → <b>다른 브라우저로 열기</b>를 눌러 주세요.'; }
        }
      }
    });

    d.body.appendChild(ov);
    setTimeout(function () { ov.classList.add('on'); }, 10);
  }

  /* ---------- 인쇄 ---------- */
  var printed = false;
  var printListenerReady = false;
  function watchPrint() {
    if (printListenerReady) { return; }
    printListenerReady = true;
    try {
      w.addEventListener('beforeprint', function () { printed = true; });
      if (w.matchMedia) {
        var mq = w.matchMedia('print');
        var onChange = function (m) { if (m.matches) { printed = true; } };
        if (mq.addEventListener) { mq.addEventListener('change', onChange); }
        else if (mq.addListener) { mq.addListener(onChange); }
      }
    } catch (e) {}
  }

  function doPrint(opts) {
    watchPrint();
    printed = false;
    if (typeof w.print !== 'function') { showSheet(opts || {}); return; }
    try {
      w.print();
    } catch (e) {
      showSheet(opts || {});
      return;
    }
    // 인쇄 창이 실제로 열렸는지 확인할 수 없는 브라우저를 위한 안전장치
    setTimeout(function () {
      if (printed || d.hidden) { return; }
      var e = env();
      if (!e.mobile) { return; }
      toast('인쇄 창이 안 열렸나요?', '다른 방법', function () { showSheet(opts || {}); }, 12000);
    }, 1600);
  }

  function toast(msg, btnLabel, onClick, ttl) {
    injectStyle();
    var t = d.createElement('div');
    t.className = 'rs-toast';
    var span = d.createElement('span');
    span.textContent = msg;
    t.appendChild(span);
    if (btnLabel) {
      var b = d.createElement('button');
      b.type = 'button';
      b.textContent = btnLabel;
      b.addEventListener('click', function () { remove(); onClick(); });
      t.appendChild(b);
    }
    d.body.appendChild(t);
    setTimeout(function () { t.classList.add('on'); }, 10);
    var tm = setTimeout(remove, ttl || 3800);
    function remove() { clearTimeout(tm); if (t.parentNode) { t.parentNode.removeChild(t); } }
  }

  /* ---------- 진입점 ---------- */
  function save(opts) {
    opts = opts || {};
    var e = env();
    // 앱 내부 브라우저 = 인쇄 창 없음. 그 외에는 인쇄 창을 연다.
    if (e.inApp) { showSheet(opts); return; }
    doPrint(opts);
  }

  function bind(el, opts) {
    if (!el || el.__rsBound) { return; }
    el.__rsBound = true;
    el.addEventListener('click', function (ev) {
      if (ev && ev.preventDefault) { ev.preventDefault(); }
      save(opts || {});
    });
  }

  function showBar(opts) {
    injectStyle();
    if (d.getElementById('rs-bar')) { return; }
    var bar = d.createElement('div');
    bar.id = 'rs-bar';
    bar.className = 'rs-bar';
    var span = d.createElement('span');
    span.textContent = '브라우저로 열렸어요. 아래 버튼을 누르면 PDF로 저장할 수 있어요.';
    var btn = d.createElement('button');
    btn.type = 'button';
    btn.textContent = 'PDF로 저장';
    btn.addEventListener('click', function () { doPrint(opts || {}); });
    bar.appendChild(span);
    bar.appendChild(btn);
    d.body.appendChild(bar);
    d.body.style.paddingTop = '52px';
  }

  function arrivalPrint(opts) {
    var a = arrival();
    if (!a.save) { return false; }
    clearHash();
    showBar(opts || {});
    setTimeout(function () { doPrint(opts || {}); }, 450);
    return true;
  }

  w.ReportSave = {
    version: '1.0.0',
    env: env,
    url: url,
    arrival: arrival,
    arrivalPrint: arrivalPrint,
    save: save,
    bind: bind,
    sheet: showSheet,
    bar: showBar,
    toast: toast,
    hideAll: hideAll
  };
})(window, document);
