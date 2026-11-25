/* 겨울취향표 — 체크 상태, 공유 링크, 카드 PNG */
(function () {
  'use strict';

  var D = window.WINTER_BINGO_DATA;
  var MISSIONS = D.MISSIONS;
  var LINES = D.LINES;
  var PALETTES = D.PALETTES;
  var FONT_BODY = '"Noto Sans KR", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  var FONT_DISPLAY = '"Gowun Batang", "Noto Serif KR", serif';
  var PAGE_TITLE = document.title;

  var state = new Array(16).fill(false);
  var mode = 'mine';
  var myName = '';
  var friend = null;

  function $(id) { return document.getElementById(id); }
  function pad(n) { return n < 10 ? '0' + n : String(n); }

  /* ---------------- 미션 그림 ---------------- */
  function artBody(type) {
    var common = 'stroke="#64758a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
    var face = '<circle cx="43" cy="38" r="2" fill="#4d5d70"/><circle cx="57" cy="38" r="2" fill="#4d5d70"/><path d="M46 45 Q50 49 54 45" fill="none" stroke="#df8197" stroke-width="2" stroke-linecap="round"/><ellipse cx="38" cy="43" rx="4" ry="2.5" fill="#f4a5b5"/><ellipse cx="62" cy="43" rx="4" ry="2.5" fill="#f4a5b5"/>';
    var body = '';
    switch (type) {
      case 'fish':
        body = '<path d="M23 28 Q50 9 77 28 L72 59 Q50 76 28 59Z" fill="#e9a35e" ' + common + '/><path d="M28 29 Q50 19 72 29" fill="none" stroke="#b87943" stroke-width="3"/><path d="M30 42 Q50 32 70 42" fill="none" stroke="#fff0d9" stroke-width="5"/>' + face + '<path d="M18 24 Q12 17 18 12 M82 22 Q89 15 84 10" fill="none" stroke="#e7b56c" stroke-width="3" stroke-linecap="round"/>';
        break;
      case 'snow':
        body = '<circle cx="50" cy="48" r="29" fill="#fff" stroke="#b9d8e7" stroke-width="2.5"/><circle cx="50" cy="24" r="18" fill="#fff" stroke="#b9d8e7" stroke-width="2.5"/><path d="M32 12 L67 12 L62 4 L39 4Z" fill="#f19bb0" ' + common + '/>' + face + '<path d="M25 46 L12 38 M75 46 L88 37" ' + common + ' fill="none"/>';
        break;
      case 'phone':
        body = '<rect x="29" y="8" width="42" height="65" rx="9" fill="#f3a4b8" ' + common + '/><rect x="34" y="15" width="32" height="47" rx="5" fill="#fff4f6"/><path d="M43 35 Q50 25 57 35 Q57 44 50 48 Q43 44 43 35" fill="#f18ca8"/>' + face;
        break;
      case 'warm':
        body = '<rect x="24" y="17" width="52" height="54" rx="15" fill="#f5b36f" ' + common + '/><path d="M36 17 Q33 8 42 7 Q50 7 47 17 M57 17 Q54 8 63 7 Q71 7 68 17" fill="none" stroke="#e7a15e" stroke-width="3"/>' + face + '<path d="M37 57 Q50 63 63 57" fill="none" stroke="#fff1d9" stroke-width="3"/>';
        break;
      case 'mug':
        body = '<rect x="25" y="27" width="47" height="39" rx="9" fill="#c7a0ca" ' + common + '/><path d="M72 35 Q91 30 86 48 Q83 57 72 54" fill="none" stroke="#64758a" stroke-width="4"/><path d="M36 21 Q30 12 38 8 M51 20 Q45 11 53 7 M64 20 Q58 11 66 8" fill="none" stroke="#b98fbd" stroke-width="3" stroke-linecap="round"/>' + face;
        break;
      case 'cake':
        body = '<path d="M21 40 L79 40 L73 68 L27 68Z" fill="#f4a6b7" ' + common + '/><path d="M21 40 Q29 29 38 40 Q48 28 57 40 Q68 28 79 40" fill="#fff4f5" ' + common + '/><path d="M50 28 L50 12" stroke="#e9a85e" stroke-width="3"/><path d="M50 11 Q43 5 50 0 Q57 5 50 11" fill="#ffd36d"/>' + face;
        break;
      case 'book':
        body = '<path d="M18 22 Q37 15 50 28 L50 70 Q34 57 18 64Z" fill="#a3cfb8" ' + common + '/><path d="M82 22 Q63 15 50 28 L50 70 Q66 57 82 64Z" fill="#e8b4c2" ' + common + '/><path d="M26 33 Q37 29 43 35 M26 43 Q37 39 43 45 M57 35 Q68 29 76 33 M57 45 Q68 39 76 43" fill="none" stroke="#fff" stroke-width="2"/>';
        break;
      case 'tangerine':
        body = '<circle cx="50" cy="43" r="27" fill="#f5a64f" ' + common + '/><path d="M50 17 Q47 8 57 7 Q64 9 59 17" fill="#80b68d" ' + common + '/><path d="M50 17 Q43 10 37 14" fill="none" stroke="#80b68d" stroke-width="4"/>' + face;
        break;
      case 'music':
        body = '<path d="M57 13 L57 57 Q57 69 44 68 Q32 67 37 57 Q40 49 53 52 L53 19 L78 13 L78 48 Q78 61 65 60 Q53 59 58 49 Q61 41 74 43 L74 17Z" fill="#9bbfe6" ' + common + '/><circle cx="27" cy="26" r="5" fill="#f2a5b6"/><circle cx="83" cy="70" r="4" fill="#f2a5b6"/>';
        break;
      case 'scarf':
        body = '<circle cx="50" cy="39" r="27" fill="#fff" stroke="#b9d8e7" stroke-width="2.5"/><path d="M24 43 Q50 55 77 42 L77 54 Q50 67 24 55Z" fill="#ed91ab" ' + common + '/><path d="M61 53 L69 76 L57 79 L52 57Z" fill="#ed91ab" ' + common + '/>' + face;
        break;
      case 'mittens':
        body = '<path d="M27 54 Q19 44 22 29 Q24 19 32 24 Q37 27 35 38 L39 18 Q42 8 50 13 Q56 16 52 27 L57 19 Q65 12 70 20 Q74 26 67 36 Q82 31 82 45 Q81 65 62 70 L40 70Z" fill="#9bcbb8" ' + common + '/><path d="M30 55 Q50 62 74 52" fill="none" stroke="#fff" stroke-width="4"/>';
        break;
      case 'drink':
        body = '<path d="M32 24 L68 24 L63 70 L37 70Z" fill="#aebce6" ' + common + '/><path d="M39 36 L65 36" stroke="#fff" stroke-width="4"/><path d="M57 22 L67 5" stroke="#e58da7" stroke-width="4" stroke-linecap="round"/><circle cx="49" cy="49" r="3" fill="#fff"/><circle cx="57" cy="58" r="3" fill="#fff"/>' + face;
        break;
      case 'letter':
        body = '<path d="M18 25 L82 25 L82 68 L18 68Z" fill="#fff3f5" ' + common + '/><path d="M19 27 L50 52 L81 27" fill="none" stroke="#e99ab0" stroke-width="3"/><path d="M50 39 Q39 27 34 38 Q32 47 50 58 Q68 47 66 38 Q61 27 50 39" fill="#f29bb1"/>';
        break;
      case 'odeng':
        body = '<path d="M48 13 L48 61" stroke="#c58b4d" stroke-width="5" stroke-linecap="round"/><path d="M29 26 Q50 12 71 26 L66 43 Q50 54 34 43Z" fill="#f2d09a" ' + common + '/><path d="M32 47 Q50 36 68 47 L65 62 Q50 73 35 62Z" fill="#e8b978" ' + common + '/>' + face;
        break;
      case 'snack':
        body = '<path d="M25 27 Q50 12 75 27 L70 69 L30 69Z" fill="#a9cfa9" ' + common + '/><path d="M25 27 Q50 39 75 27" fill="none" stroke="#fff" stroke-width="3"/><circle cx="42" cy="48" r="7" fill="#f5c26c"/><circle cx="60" cy="53" r="7" fill="#e99c78"/><circle cx="50" cy="61" r="5" fill="#f3d58c"/>';
        break;
      case 'photo':
        body = '<rect x="22" y="14" width="56" height="58" rx="7" fill="#fff" ' + common + '/><rect x="28" y="20" width="44" height="36" rx="4" fill="#d9eafa"/><circle cx="50" cy="37" r="9" fill="#fff" stroke="#a7c6dc" stroke-width="2"/><path d="M30 53 L43 42 L52 50 L61 40 L71 53" fill="#a5d2bc"/><circle cx="50" cy="64" r="2" fill="#e9a0b4"/>';
        break;
      default:
        body = '';
    }
    return body;
  }

  function art(type) {
    return '<svg viewBox="0 0 100 82" aria-hidden="true" focusable="false"><ellipse cx="50" cy="77" rx="27" ry="3" fill="#dce3e5" opacity=".6"/>' + artBody(type) + '</svg>';
  }

  /* ---------------- 상태 계산 ---------------- */
  function bingoLines() {
    return LINES.filter(function (line) {
      return line.every(function (i) { return state[i]; });
    });
  }

  /* 완성한 빙고 줄 수에 맞는 알림 문구 */
  function bingoDoneCopy(n) {
    if (n >= 10) { return '빙고 10줄! 겨울취향표를 다 채웠어요 🎉'; }
    return '빙고 ' + n + '줄 완성! 겨울 미션 성공 🎉';
  }

  function checkedCount() {
    var n = 0;
    for (var i = 0; i < state.length; i++) { if (state[i]) { n += 1; } }
    return n;
  }

  /* ---------------- 그리기 ---------------- */
  function render() {
    var wins = bingoLines();
    var winning = {};
    wins.forEach(function (line) { line.forEach(function (i) { winning[i] = true; }); });
    var n = checkedCount();

    $('progress').innerHTML = n + '<em>/16</em>';
    $('bingo').innerHTML = wins.length + '<em>줄</em>';
    $('left').innerHTML = (16 - n) + '<em>개</em>';

    var isFriend = mode === 'friend';
    var board = $('board');
    board.className = 'board' + (isFriend ? ' is-friend' : '');
    board.setAttribute('role', isFriend ? 'list' : 'group');
    board.innerHTML = '';

    MISSIONS.forEach(function (m, i) {
      var el = document.createElement(isFriend ? 'div' : 'button');
      if (isFriend) {
        el.setAttribute('role', 'listitem');
      } else {
        el.type = 'button';
        el.setAttribute('aria-pressed', state[i] ? 'true' : 'false');
        el.setAttribute('aria-label', m.label + (state[i] ? ' — 완료' : ' — 완료로 표시'));
      }
      el.className = 'tile' + (state[i] ? ' done' : '') + (winning[i] ? ' bingo-line' : '');
      el.innerHTML = '<span class="tile-no">' + pad(i + 1) + '</span>' +
        '<div class="art">' + art(m.art) + '</div>' +
        '<div class="tile-label">' + m.label + '</div>' +
        (state[i] ? '<span class="clear-stamp" aria-hidden="true">CLEAR<i>\u2665</i></span>' : '');
      if (!isFriend) {
        el.addEventListener('click', function () { toggle(i); });
      }
      board.appendChild(el);
    });

    $('friendNote').hidden = !isFriend;
    $('hero').hidden = isFriend;
    $('mineActions').hidden = isFriend;
    $('friendCta').hidden = !isFriend;
    $('boardHint').textContent = isFriend ? '친구가 체크한 칸이에요' : '칸을 톡 눌러 완료해요!';

    if (isFriend) {
      $('friendTitle').textContent = friend.name ? friend.name + '님의 겨울취향표' : '겨울취향표';
      $('friendMeta').textContent = n + '/16 완료 · ' + wins.length + '줄 빙고';
      document.title = (friend.name ? friend.name + '님의 ' : '') + '겨울취향표 · 올 겨울 찐하게 즐기고 있나요?';
    }
  }

  function toggle(i) {
    if (mode !== 'mine') { return; }
    var before = bingoLines().length;
    state[i] = !state[i];
    render();
    var el = $('board').children[i];
    if (el && state[i]) { el.classList.add('pop'); }
    var after = bingoLines().length;
    if (after > before) {
      celebrate(bingoDoneCopy(after));
    } else if (state[i]) {
      toast('한 칸 채웠어요 ♥');
    } else {
      toast('체크를 풀었어요');
    }
  }

  /* ---------------- 알림 ---------------- */
  var toastTimer;
  function toast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 1900);
  }

  function celebrate(msg) {
    toast(msg);
    var area = $('confetti');
    var colors = ['#B0893C', '#C6DFF1', '#C98A9E', '#8FA9B8', '#E3D9BC'];
    area.innerHTML = '';
    for (var i = 0; i < 55; i++) {
      var p = document.createElement('i');
      p.style.left = (Math.random() * 100) + '%';
      p.style.top = '-20px';
      p.style.background = colors[i % 5];
      p.style.animationDelay = (Math.random() * 0.35) + 's';
      p.style.transform = 'rotate(' + (Math.random() * 180) + 'deg)';
      area.appendChild(p);
    }
    setTimeout(function () { area.innerHTML = ''; }, 1900);
  }

  /* ---------------- 공유 ---------------- */
  function shareBase() {
    return String(location.href).split('#')[0].split('?')[0];
  }

  function maskHex() {
    var mask = 0;
    for (var i = 0; i < 16; i++) { if (state[i]) { mask |= (1 << i); } }
    return mask.toString(16);
  }

  function shareUrl() {
    var u = shareBase() + '?s=' + maskHex();
    if (myName) { u += '&n=' + encodeURIComponent(myName); }
    return u;
  }

  function readShare() {
    var q;
    try { q = new URLSearchParams(location.search || ''); } catch (e) { return null; }
    var s = q.get('s');
    if (!s || !/^[0-9a-fA-F]{1,4}$/.test(s)) { return null; }
    var mask = parseInt(s, 16) & 0xffff;
    var nm = String(q.get('n') || '').replace(/\s+/g, ' ').trim().slice(0, 12);
    return { mask: mask, name: nm };
  }

  function fallbackCopy(text) {
    var input = $('shareUrl');
    try {
      input.value = text;
      input.removeAttribute('readonly');
      input.focus();
      input.select();
      var ok = document.execCommand('copy');
      input.setAttribute('readonly', 'readonly');
      return !!ok;
    } catch (e) {
      input.setAttribute('readonly', 'readonly');
      return false;
    }
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  /* ---------------- 저장 ---------------- */
  function fontsReady() {
    if (!document.fonts || !document.fonts.load) { return Promise.resolve(); }
    var jobs = [
      '400 40px "Gowun Batang"',
      '400 20px "Noto Sans KR"',
      '500 20px "Noto Sans KR"',
      '600 20px "Noto Sans KR"'
    ].map(function (f) { return document.fonts.load(f).catch(function () {}); });
    return Promise.all(jobs).then(function () { return document.fonts.ready; }).catch(function () {});
  }

  function roundRect(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.arcTo(x + w, y, x + w, y + rr, rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
    ctx.lineTo(x + rr, y + h);
    ctx.arcTo(x, y + h, x, y + h - rr, rr);
    ctx.lineTo(x, y + rr);
    ctx.arcTo(x, y, x + rr, y, rr);
    ctx.closePath();
  }

  function wrapAll(ctx, text, maxW) {
    var out = [], line = '';
    var words = String(text).split(' ');
    for (var w = 0; w < words.length; w++) {
      var word = words[w];
      if (ctx.measureText(word).width > maxW) {
        for (var k = 0; k < word.length; k++) {
          var t2 = line + word.charAt(k);
          if (ctx.measureText(t2).width > maxW && line) { out.push(line); line = word.charAt(k); }
          else { line = t2; }
        }
        continue;
      }
      var test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) { out.push(line); line = word; }
      else { line = test; }
    }
    if (line) { out.push(line); }
    return out;
  }

  var ART_IMGS = {};
  function artImg(type) {
    if (ART_IMGS[type]) { return ART_IMGS[type]; }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="82" viewBox="0 0 100 82">' +
      '<defs><filter id="mute" x="-10%" y="-10%" width="120%" height="120%">' +
      '<feColorMatrix type="saturate" values="0.55"/>' +
      '<feComponentTransfer><feFuncR type="linear" slope="1.02" intercept="0.01"/>' +
      '<feFuncG type="linear" slope="1.02" intercept="0.01"/>' +
      '<feFuncB type="linear" slope="1.02" intercept="0.01"/></feComponentTransfer>' +
      '</filter></defs><g filter="url(#mute)">' +
      '<ellipse cx="50" cy="77" rx="27" ry="3" fill="#dce3e5" opacity=".6"/>' + artBody(type) + '</g></svg>';
    var img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    ART_IMGS[type] = img;
    return img;
  }

  function waitImg(img) {
    if (img.complete && img.naturalWidth) { return Promise.resolve(); }
    return new Promise(function (res) {
      var done = false;
      function fin() { if (!done) { done = true; res(); } }
      img.addEventListener('load', fin);
      img.addEventListener('error', fin);
      setTimeout(fin, 1500);
    });
  }

  /* 카드 도장: 화면 `.clear-stamp`와 같은 비율(칸 폭 72 기준)로 그린다 */
  function drawClearStamp(ctx, cx, cy, bingo, tw) {
    var k = tw / 72;
    var fs = 6 * k;
    var padX = 6 * k, padT = 2 * k, padB = 3 * k;
    var ls = fs * 0.2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-4 * Math.PI / 180);

    ctx.font = '600 ' + fs.toFixed(2) + 'px ' + FONT_BODY;
    if ('letterSpacing' in ctx) { ctx.letterSpacing = ls.toFixed(2) + 'px'; }
    var textW = ctx.measureText('CLEAR').width;
    if ('letterSpacing' in ctx) { ctx.letterSpacing = '0px'; }
    var w = textW + padX * 2;
    var h = fs * 1.2 + padT + padB;

    ctx.fillStyle = bingo ? '#FFFDF4' : 'rgba(255,255,255,.92)';
    ctx.fillRect(-w / 2, -h / 2, w, h);

    if (bingo) {
      ctx.strokeStyle = 'rgba(176,137,60,.18)';
      ctx.lineWidth = 1.5 * k;
      ctx.strokeRect(-w / 2 - 2.2 * k, -h / 2 - 2.2 * k, w + 4.4 * k, h + 4.4 * k);
    }

    ctx.strokeStyle = bingo ? '#B0893C' : '#CE93A5';
    ctx.lineWidth = 1 * k;
    ctx.strokeRect(-w / 2 + .5 * k, -h / 2 + .5 * k, w - 1 * k, h - 1 * k);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = bingo ? '#9A7726' : '#B2738A';
    ctx.font = '600 ' + fs.toFixed(2) + 'px ' + FONT_BODY;
    if ('letterSpacing' in ctx) { ctx.letterSpacing = ls.toFixed(2) + 'px'; }
    ctx.fillText('CLEAR', ls / 2, 0.5 * k);
    if ('letterSpacing' in ctx) { ctx.letterSpacing = '0px'; }

    ctx.restore();
    ctx.textBaseline = 'alphabetic';
  }

  function drawPine(ctx, x, baseY, h, color) {
    ctx.fillStyle = color;
    for (var t = 0; t < 3; t++) {
      var bw = h * 0.46 * (1 - t * 0.26);
      var by = baseY - t * h * 0.26;
      var ty = by - h * 0.48;
      ctx.beginPath();
      ctx.moveTo(x, ty);
      ctx.lineTo(x - bw / 2, by);
      ctx.lineTo(x + bw / 2, by);
      ctx.closePath();
      ctx.fill();
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x, baseY + 6);
    ctx.stroke();
  }

  function drawCard() {
    var cv = $('cardCanvas');
    var ctx = cv.getContext('2d');
    var W = 1080, H = 1350;
    var wins = bingoLines();
    var winning = {};
    wins.forEach(function (line) { line.forEach(function (i) { winning[i] = true; }); });
    var n = checkedCount();

    ctx.clearRect(0, 0, W, H);

    /* 겨울 하늘 */
    var sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#C6DFF1');
    sky.addColorStop(.40, '#DAEBF6');
    sky.addColorStop(.72, '#E9F4FB');
    sky.addColorStop(1, '#F5FBFE');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    /* 옅은 해 */
    ctx.beginPath();
    ctx.arc(872, 132, 46, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,.42)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.85)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    /* 눈 점 */
    var seed = 20261125;
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    for (var d = 0; d < 46; d++) {
      var dx = rnd() * W, dy = rnd() * H, dr = 1.4 + rnd() * 2.6;
      ctx.beginPath();
      ctx.arc(dx, dy, dr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + (0.35 + rnd() * 0.45).toFixed(2) + ')';
      ctx.fill();
    }

    /* 종이 */
    ctx.save();
    ctx.shadowColor = 'rgba(88,128,155,.18)';
    ctx.shadowBlur = 34;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, 40, 40, 1000, 1270, 6);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#D3E2EB';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 40, 40, 1000, 1270, 6);
    ctx.stroke();

    var L = 108, R = 972;

    /* 머리 */
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '600 15px ' + FONT_BODY;
    if ('letterSpacing' in ctx) { ctx.letterSpacing = '4.4px'; }
    ctx.fillStyle = '#5F7C8F';
    ctx.fillText('LITTLE WINTER CLUB', L, 118);
    if ('letterSpacing' in ctx) { ctx.letterSpacing = '0px'; }

    ctx.textAlign = 'right';
    ctx.font = '400 18px ' + FONT_DISPLAY;
    if ('letterSpacing' in ctx) { ctx.letterSpacing = '2.4px'; }
    ctx.fillStyle = '#3C5567';
    ctx.fillText('겨울취향표', R, 118);
    if ('letterSpacing' in ctx) { ctx.letterSpacing = '0px'; }

    /* 제목 */
    var title = '올 겨울 찐하게 즐기고 있나요?';
    var tSize = 62;
    ctx.textAlign = 'left';
    ctx.font = '400 ' + tSize + 'px ' + FONT_DISPLAY;
    while (ctx.measureText(title).width > 780 && tSize > 40) {
      tSize -= 2;
      ctx.font = '400 ' + tSize + 'px ' + FONT_DISPLAY;
    }
    ctx.fillStyle = '#23323E';
    ctx.fillText(title, L, 212);

    /* 이름 */
    var nm = (myName ? myName + '님의 겨울취향표' : '나의 겨울취향표');
    ctx.font = '500 21px ' + FONT_BODY;
    ctx.fillStyle = '#A87587';
    ctx.fillText(nm, L, 252);

    /* 현황 3열 */
    var stats = [
      { k: '완료한 미션', v: String(n), u: '/16' },
      { k: '완성한 빙고', v: String(wins.length), u: '줄' },
      { k: '남은 미션', v: String(16 - n), u: '개' }
    ];
    var sy = 292, sh = 84, colW = (R - L) / 3;
    ctx.strokeStyle = '#D3E2EB';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(L, sy); ctx.lineTo(R, sy);
    ctx.moveTo(L, sy + sh); ctx.lineTo(R, sy + sh);
    ctx.stroke();
    ctx.strokeStyle = '#E2EBF1';
    [1, 2].forEach(function (c) {
      var xx = L + colW * c;
      ctx.beginPath();
      ctx.moveTo(xx, sy + 10); ctx.lineTo(xx, sy + sh - 10);
      ctx.stroke();
    });
    stats.forEach(function (s, i) {
      var x = L + colW * i + (i ? 18 : 0);
      ctx.textAlign = 'left';
      ctx.font = '500 14px ' + FONT_BODY;
      if ('letterSpacing' in ctx) { ctx.letterSpacing = '2.1px'; }
      ctx.fillStyle = '#7B93A2';
      ctx.fillText(s.k, x, sy + 32);
      if ('letterSpacing' in ctx) { ctx.letterSpacing = '0px'; }
      ctx.font = '400 38px ' + FONT_DISPLAY;
      ctx.fillStyle = '#1F2E3A';
      ctx.fillText(s.v, x, sy + 72);
      var vw = ctx.measureText(s.v).width;
      ctx.font = '400 14px ' + FONT_BODY;
      ctx.fillStyle = '#8FA3B1';
      ctx.fillText(s.u, x + vw + 4, sy + 72);
    });

    /* 보드 라벨 */
    ctx.textAlign = 'left';
    ctx.font = '600 12px ' + FONT_BODY;
    if ('letterSpacing' in ctx) { ctx.letterSpacing = '3.1px'; }
    ctx.fillStyle = '#9AAEBB';
    ctx.fillText('SIXTEEN MOMENTS OF WINTER', L, 410);
    if ('letterSpacing' in ctx) { ctx.letterSpacing = '0px'; }

    /* 미션 칸 */
    var tw = 204, th = 166, gx = 16, gy = 14;
    var by0 = 432;
    MISSIONS.forEach(function (m, i) {
      var col = i % 4, row = Math.floor(i / 4);
      var x = L + col * (tw + gx), y = by0 + row * (th + gy);
      var on = state[i];
      var isWin = !!winning[i];

      ctx.fillStyle = on ? (isWin ? '#FBF6E9' : '#F2F7FA') : (isWin ? '#FDFBF5' : '#FFFFFF');
      ctx.fillRect(x, y, tw, th);
      ctx.strokeStyle = on ? (isWin ? '#DFCFA6' : '#D2E3EC') : (isWin ? '#DFD3B2' : '#E4EDF3');
      ctx.lineWidth = 1.4;
      ctx.strokeRect(x + .7, y + .7, tw - 1.4, th - 1.4);

      ctx.textAlign = 'left';
      ctx.font = '500 13px ' + FONT_BODY;
      if ('letterSpacing' in ctx) { ctx.letterSpacing = '1.4px'; }
      ctx.fillStyle = on ? '#C0D0D9' : '#A9BCC8';
      ctx.fillText(pad(i + 1), x + 14, y + 26);
      if ('letterSpacing' in ctx) { ctx.letterSpacing = '0px'; }

      if (on) { ctx.globalAlpha = .34; }
      var im = artImg(m.art);
      if (im.complete && im.naturalWidth) {
        ctx.drawImage(im, x + tw / 2 - 41, y + 34, 82, 67);
      }
      ctx.globalAlpha = 1;

      ctx.textAlign = 'center';
      var fs = 19, lines = [];
      for (; fs >= 13; fs--) {
        ctx.font = '500 ' + fs + 'px ' + FONT_BODY;
        lines = wrapAll(ctx, m.label, tw - 32);
        if (lines.length <= 2) { break; }
      }
      if (fs < 13) { fs = 13; }
      if (lines.length > 2) { lines = lines.slice(0, 2); }
      ctx.font = '500 ' + fs + 'px ' + FONT_BODY;
      ctx.fillStyle = on ? '#8A9DAA' : '#3B4C59';
      var lh = Math.round(fs * 1.42);
      ctx.textBaseline = 'middle';
      var startY = y + th - 30 - (lines.length - 1) * lh / 2;
      lines.forEach(function (ln, li) {
        ctx.fillText(ln, x + tw / 2, startY + li * lh);
      });
      ctx.textBaseline = 'alphabetic';

      if (on) { drawClearStamp(ctx, x + tw / 2, y + th * 0.30, isWin, tw); }
    });

    /* 지평선·소나무 */
    ctx.strokeStyle = '#D3E2EB';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(L, 1198);
    ctx.bezierCurveTo(360, 1192, 720, 1204, R, 1196);
    ctx.stroke();
    drawPine(ctx, 120, 1198, 34, '#A6BBC8');
    drawPine(ctx, 148, 1198, 26, '#B3C6D2');
    drawPine(ctx, 174, 1198, 30, '#A6BBC8');
    drawPine(ctx, 958, 1196, 30, '#A6BBC8');
    drawPine(ctx, 932, 1196, 24, '#B3C6D2');
    drawPine(ctx, 906, 1196, 32, '#A6BBC8');

    ctx.textAlign = 'center';
    ctx.font = '500 13px ' + FONT_BODY;
    if ('letterSpacing' in ctx) { ctx.letterSpacing = '1.1px'; }
    ctx.fillStyle = 'rgba(60,85,103,.55)';
    ctx.fillText('soosoosupernova.github.io/winter-bingo', W / 2, 1274);
    if ('letterSpacing' in ctx) { ctx.letterSpacing = '0px'; }

    return cv;
  }

  var IN_APP = /KAKAOTALK|Instagram|FBAN|FBAV|NAVER\(inapp|Line\/\d|DaumApps|BAND\//i.test(navigator.userAgent)
    || /[?&]qa_inapp=1/.test(location.search || '');

  $('saveBtn').addEventListener('click', function () {
    var btn = $('saveBtn');
    btn.disabled = true;
    $('statusMsg').textContent = '카드를 만드는 중이에요.';
    $('savePreview').hidden = true;

    var imgs = MISSIONS.map(function (m) { return artImg(m.art); });

    fontsReady()
      .then(function () { return Promise.all(imgs.map(waitImg)); })
      .then(function () {
        var cv = drawCard();
        return new Promise(function (res, rej) {
          if (cv.toBlob) {
            cv.toBlob(function (b) { if (b) { res(b); } else { rej(new Error('blob')); } }, 'image/png');
          } else {
            rej(new Error('no toBlob'));
          }
        });
      })
      .then(function (blob) {
        var url = URL.createObjectURL(blob);
        var fname = 'winter-bingo-' + checkedCount() + 'of16.png';
        if (IN_APP) {
          $('savePreviewImg').src = url;
          $('savePreview').hidden = false;
          $('statusMsg').textContent = '이미지를 길게 눌러 저장해주세요.';
          return;
        }
        try {
          var a = document.createElement('a');
          a.href = url;
          a.download = fname;
          a.rel = 'noopener';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          $('statusMsg').textContent = '카드를 저장했어요.';
          setTimeout(function () { URL.revokeObjectURL(url); }, 20000);
        } catch (e) {
          $('savePreviewImg').src = url;
          $('savePreview').hidden = false;
          $('statusMsg').textContent = '저장이 안 됐어요. 이미지를 길게 눌러 저장해주세요.';
        }
      })
      .catch(function () {
        $('statusMsg').textContent = '저장이 안 됐어요. 한 번 더 눌러주세요.';
      })
      .then(function () { btn.disabled = false; });
  });

  /* ---------------- 이벤트 ---------------- */
  $('resetBtn').addEventListener('click', function () {
    if (!confirm('체크한 미션을 모두 지울까요?')) { return; }
    state = new Array(16).fill(false);
    render();
    toast('빙고판을 새로 폈어요');
  });

  $('shareBtn').addEventListener('click', function () {
    myName = ($('nameInput').value || '').replace(/\s+/g, ' ').trim().slice(0, 12);
    $('nameInput').value = myName;
    $('shareUrl').value = shareUrl();
    $('sharePanel').hidden = false;
    copyText($('shareUrl').value).then(function (ok) {
      toast(ok ? '공유 링크를 복사했어요' : '링크를 길게 눌러 복사해 주세요');
    });
    try { $('sharePanel').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
  });

  $('copyBtn').addEventListener('click', function () {
    copyText($('shareUrl').value).then(function (ok) {
      toast(ok ? '공유 링크를 복사했어요' : '링크를 길게 눌러 복사해 주세요');
    });
  });

  $('nameInput').addEventListener('input', function () {
    myName = ($('nameInput').value || '').replace(/\s+/g, ' ').slice(0, 12);
    $('shareUrl').value = shareUrl();
  });

  $('mineBtn').addEventListener('click', function () {
    mode = 'mine';
    friend = null;
    state = new Array(16).fill(false);
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    document.title = PAGE_TITLE;
    $('sharePanel').hidden = true;
    $('statusMsg').textContent = '';
    $('savePreview').hidden = true;
    render();
    toast('내 빙고판을 새로 폈어요');
    window.scrollTo(0, 0);
  });

  /* ---------------- 시작 ---------------- */
  var shared = readShare();
  if (shared) {
    mode = 'friend';
    friend = shared;
    for (var i = 0; i < 16; i++) { state[i] = !!(shared.mask & (1 << i)); }
    $('sharePanel').hidden = true;
  }
  render();
})();
