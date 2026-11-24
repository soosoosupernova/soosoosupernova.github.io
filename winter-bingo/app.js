/* 겨울취향표 — 체크 상태, 공유 링크, 카드 PNG */
(function () {
  'use strict';

  var D = window.WINTER_BINGO_DATA;
  var MISSIONS = D.MISSIONS;
  var LINES = D.LINES;
  var PALETTES = D.PALETTES;
  var FONT_BODY = '"Noto Sans KR", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  var FONT_DISPLAY = 'Jua, "Noto Sans KR", sans-serif';
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
      document.title = (friend.name ? friend.name + '님의 ' : '') + '겨울취향표 · 올 겨울 얼마나 즐겼지?';
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
      celebrate('빙고 한 줄! 겨울 미션 성공 🎉');
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
    var colors = ['#ff91ad', '#ffd978', '#91c9ec', '#9bdcc9', '#c5b3e9'];
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
      '400 40px Jua',
      '700 20px "Noto Sans KR"',
      '800 20px "Noto Sans KR"',
      '900 20px "Noto Sans KR"'
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
      '<ellipse cx="50" cy="77" rx="27" ry="3" fill="#dce3e5" opacity=".6"/>' + artBody(type) + '</svg>';
    var img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    ART_IMGS[type] = img;
    return img;
  }

  var MASCOT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="171" viewBox="0 0 140 120">' +
    '<ellipse cx="72" cy="103" rx="42" ry="8" fill="#e9f0f3"/><circle cx="72" cy="72" r="35" fill="#fff" stroke="#dceaf0" stroke-width="3"/><circle cx="72" cy="31" r="24" fill="#fff" stroke="#dceaf0" stroke-width="3"/><path d="M52 14 Q70 -2 91 14 L88 22 L54 22Z" fill="#ff91ad" stroke="#e77d9b" stroke-width="2"/><circle cx="64" cy="31" r="2.7" fill="#53647a"/><circle cx="80" cy="31" r="2.7" fill="#53647a"/><path d="M67 39 Q72 44 77 39" fill="none" stroke="#e88a9f" stroke-width="2.5" stroke-linecap="round"/><path d="M42 61 Q72 72 102 60 L101 73 Q72 84 43 74Z" fill="#8dc8e8" stroke="#72afd1" stroke-width="2"/><path d="M88 70 L98 99 Q88 105 81 98 L79 74Z" fill="#8dc8e8" stroke="#72afd1" stroke-width="2"/><circle cx="58" cy="66" r="3" fill="#f3a0b3"/><circle cx="87" cy="66" r="3" fill="#f3a0b3"/></svg>';
  var mascot = null;
  function mascotImg() {
    if (!mascot) {
      mascot = new Image();
      mascot.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(MASCOT_SVG);
    }
    return mascot;
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

  /* 카드 도장: 화면 `.clear-stamp`와 같은 비율(칸 폭 70.75 기준)로 그린다 */
  function drawClearStamp(ctx, cx, cy, bingo, tw) {
    var k = tw / 70.75;
    var w = tw * (bingo ? 0.772 : 0.683);
    var h = tw * (bingo ? 0.345 : 0.288);
    var fs = (bingo ? 7.4 : 6.8) * k;
    var hfs = 6.4 * k;
    var ls = fs * (bingo ? 0.06 : 0.07);
    var gap = 2 * k;
    var bw = (bingo ? 2 : 1.5) * k;
    var r = h / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-8 * Math.PI / 180);

    if (bingo) {
      ctx.save();
      ctx.shadowColor = 'rgba(217,154,43,.24)';
      ctx.shadowBlur = 10 * k;
      ctx.fillStyle = 'rgba(255,252,240,.95)';
      roundRect(ctx, -w / 2 - 2 * k, -h / 2 - 2 * k, w + 4 * k, h + 4 * k, r + 2 * k);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = 'rgba(232,122,158,.20)';
      roundRect(ctx, -w / 2 - 2.7 * k, -h / 2 - 2.7 * k, w + 5.4 * k, h + 5.4 * k, r + 2.7 * k);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,245,248,.90)';
      roundRect(ctx, -w / 2 - 2 * k, -h / 2 - 2 * k, w + 4 * k, h + 4 * k, r + 2 * k);
      ctx.fill();
    }

    ctx.fillStyle = bingo ? 'rgba(255,248,225,.92)' : 'rgba(255,245,248,.88)';
    roundRect(ctx, -w / 2, -h / 2, w, h, r);
    ctx.fill();
    ctx.strokeStyle = bingo ? '#D99A2B' : '#E87A9E';
    ctx.lineWidth = bw;
    roundRect(ctx, -w / 2 + bw / 2, -h / 2 + bw / 2, w - bw, h - bw, Math.max(r - bw / 2, 2));
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '900 ' + fs.toFixed(2) + 'px ' + FONT_BODY;
    if ('letterSpacing' in ctx) { ctx.letterSpacing = ls.toFixed(2) + 'px'; }
    var wordW = ctx.measureText('CLEAR').width - ls;
    ctx.font = '900 ' + hfs.toFixed(2) + 'px ' + FONT_BODY;
    if ('letterSpacing' in ctx) { ctx.letterSpacing = '0px'; }
    var heartW = ctx.measureText('\u2665').width;
    var tx = -(wordW + gap + heartW) / 2;

    ctx.font = '900 ' + fs.toFixed(2) + 'px ' + FONT_BODY;
    if ('letterSpacing' in ctx) { ctx.letterSpacing = ls.toFixed(2) + 'px'; }
    ctx.fillStyle = bingo ? '#BE8519' : '#E87A9E';
    ctx.fillText('CLEAR', tx, 0);
    if ('letterSpacing' in ctx) { ctx.letterSpacing = '0px'; }
    ctx.font = '900 ' + hfs.toFixed(2) + 'px ' + FONT_BODY;
    ctx.fillStyle = bingo ? '#D19A2E' : '#F09EBB';
    ctx.fillText('\u2665', tx + wordW + gap, -0.5 * k);

    ctx.restore();
    ctx.textBaseline = 'alphabetic';
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
    var bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#e9f5fd');
    bg.addColorStop(.5, '#f7f8fe');
    bg.addColorStop(1, '#fdeef4');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    function softCircle(cx, cy, r, color) {
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    softCircle(110, 90, 260, 'rgba(255,232,240,.95)');
    softCircle(990, 120, 280, 'rgba(206,235,253,.9)');
    softCircle(50, 1290, 260, 'rgba(220,246,238,.85)');

    var seed = 20261224;
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    for (var d = 0; d < 44; d++) {
      var dx = rnd() * W, dy = rnd() * H, dr = 1.6 + rnd() * 3.2;
      ctx.beginPath();
      ctx.arc(dx, dy, dr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + (0.5 + rnd() * 0.35).toFixed(2) + ')';
      ctx.fill();
    }

    ctx.save();
    ctx.shadowColor = 'rgba(120,150,175,.22)';
    ctx.shadowBlur = 44;
    ctx.shadowOffsetY = 16;
    ctx.fillStyle = '#FFFDFB';
    roundRect(ctx, 48, 48, 984, 1254, 56);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.95)';
    ctx.lineWidth = 4;
    roundRect(ctx, 48, 48, 984, 1254, 56);
    ctx.stroke();

    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.font = '800 19px ' + FONT_BODY;
    if ('letterSpacing' in ctx) { ctx.letterSpacing = '3.4px'; }
    ctx.fillStyle = '#C98CA0';
    var brandText = 'LITTLE WINTER CLUB · WINTER 2026';
    ctx.fillText(brandText, 124, 146);
    var brandW = ctx.measureText(brandText).width;
    if ('letterSpacing' in ctx) { ctx.letterSpacing = '0px'; }

    /* 태그 알약: 겨울취향표 */
    var tagW = 116, tagH = 34, tagX = 124 + brandW + 14, tagY = 118;
    ctx.fillStyle = '#EAF5FD';
    roundRect(ctx, tagX, tagY, tagW, tagH, tagH / 2);
    ctx.fill();
    ctx.strokeStyle = '#CBE7F8';
    ctx.lineWidth = 2;
    roundRect(ctx, tagX + 1, tagY + 1, tagW - 2, tagH - 2, (tagH - 2) / 2);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#3F7FA3';
    ctx.font = '800 17px ' + FONT_BODY;
    ctx.fillText('겨울취향표', tagX + tagW / 2, tagY + tagH / 2 + 1);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    var mi = mascotImg();
    if (mi.complete && mi.naturalWidth) { ctx.drawImage(mi, 770, 82, 196, 168); }

    var title = '올 겨울 얼마나 즐겼지?';
    var tSize = 66;
    ctx.font = '400 ' + tSize + 'px ' + FONT_DISPLAY;
    while (ctx.measureText(title).width > 610 && tSize > 40) {
      tSize -= 2;
      ctx.font = '400 ' + tSize + 'px ' + FONT_DISPLAY;
    }
    ctx.fillStyle = '#34445D';
    ctx.fillText(title, 124, 250);

    var nm = (myName ? myName + '님의 겨울취향표' : '나의 겨울취향표');
    var nSize = 28;
    ctx.font = '800 ' + nSize + 'px ' + FONT_BODY;
    while (ctx.measureText(nm).width > 700 && nSize > 18) {
      nSize -= 2;
      ctx.font = '800 ' + nSize + 'px ' + FONT_BODY;
    }
    ctx.fillStyle = '#B4556F';
    ctx.fillText(nm, 124, 294);

    var stats = [
      { k: '완료한 미션', v: n + ' / 16', bg: '#F5FAFE', bd: '#E7F1F7' },
      { k: '완성한 빙고', v: wins.length + '줄', bg: '#FFF6F9', bd: '#FBE4EB' },
      { k: '남은 미션', v: (16 - n) + '개', bg: '#F4FBF7', bd: '#E2F2EA' }
    ];
    stats.forEach(function (s, i) {
      var x = 124 + i * 282, y = 330, w = 264, h = 78;
      ctx.fillStyle = s.bg;
      roundRect(ctx, x, y, w, h, 20);
      ctx.fill();
      ctx.strokeStyle = s.bd;
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, w, h, 20);
      ctx.stroke();
      ctx.fillStyle = '#9AA6B4';
      ctx.font = '700 18px ' + FONT_BODY;
      ctx.fillText(s.k, x + 22, y + 31);
      ctx.fillStyle = '#35435B';
      ctx.font = '800 30px ' + FONT_BODY;
      ctx.fillText(s.v, x + 22, y + 66);
    });

    var gx = 124, gy = 452, tw = 198, th = 176, gap = 18;
    MISSIONS.forEach(function (m, i) {
      var col = i % 4, row = Math.floor(i / 4);
      var x = gx + col * (tw + gap), y = gy + row * (th + gap);
      var pal = PALETTES[m.art] || ['#e8a76a', '#fff4e4'];
      var on = state[i];
      var isWin = !!winning[i];

      ctx.fillStyle = on ? '#FFF3F6' : pal[1];
      roundRect(ctx, x, y, tw, th, 26);
      ctx.fill();

      ctx.strokeStyle = on ? '#F1DDE5' : '#F1EDE6';
      ctx.lineWidth = on ? 3 : 2;
      roundRect(ctx, x + 1.5, y + 1.5, tw - 3, th - 3, 25);
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = on ? '#DDBAC6' : '#AEB6C1';
      ctx.font = '800 15px ' + FONT_BODY;
      ctx.fillText(pad(i + 1), x + 16, y + 30);

      if (on) { ctx.globalAlpha = .48; }
      var im = artImg(m.art);
      if (im.complete && im.naturalWidth) {
        ctx.drawImage(im, x + tw / 2 - 39, y + 34, 78, 64);
      }

      ctx.textAlign = 'center';
      var fs = 21, lines = [];
      for (; fs >= 14; fs--) {
        ctx.font = '800 ' + fs + 'px ' + FONT_BODY;
        lines = wrapAll(ctx, m.label, tw - 40);
        if (lines.length <= 2) { break; }
      }
      if (fs < 14) { fs = 14; }
      if (lines.length > 2) { lines = lines.slice(0, 2); }
      ctx.font = '800 ' + fs + 'px ' + FONT_BODY;
      ctx.fillStyle = on ? '#9D8A93' : '#35435B';
      var lh = Math.round(fs * 1.3);
      ctx.textBaseline = 'middle';
      var startY = y + 136 - (lines.length - 1) * lh / 2;
      lines.forEach(function (ln, li) {
        ctx.fillText(ln, x + tw / 2, startY + li * lh);
      });
      ctx.textBaseline = 'alphabetic';
      ctx.globalAlpha = 1;

      if (on) {
        drawClearStamp(ctx, x + tw / 2, y + 66, isWin, tw);
      }
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(53,67,91,.45)';
    ctx.font = '700 19px ' + FONT_BODY;
    ctx.fillText('soosoosupernova.github.io/winter-bingo', W / 2, 1278);

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
    imgs.push(mascotImg());

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
