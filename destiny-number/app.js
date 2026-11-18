/*!
 * app.js — 생년월일 수비학 리포트 (2026-11-18)
 * 계산: 라이프 패스(운명 수, 마스터 수 11·22·33 보존), 2027 개인년수, 탄생 타로 카드
 * 저장: 의존성 없는 canvas PNG 생성 → 다운로드/공유
 */
(function (w, d) {
  'use strict';
  var N = w.NUM;

  /* ---------------- 계산 ---------------- */
  function dsum(n) { return String(n).split('').reduce(function (a, c) { return a + (+c); }, 0); }
  function isMaster(n) { return n === 11 || n === 22 || n === 33; }
  function reduceMaster(n) {
    var steps = [];
    while (n > 9 && !isMaster(n)) { n = dsum(n); steps.push(n); }
    return { value: n, steps: steps, master: isMaster(n) };
  }
  function reduce9(n) { while (n > 9) { n = dsum(n); } return n; }

  function calc(y, m, day) {
    var ry = reduceMaster(y), rm = reduceMaster(m), rd = reduceMaster(day);
    var sum = ry.value + rm.value + rd.value;
    var lp = reduceMaster(sum);
    var pyRaw = dsum(2027) + dsum(m) + dsum(day);
    var py = reduce9(pyRaw);

    var cardSum = m + day + y;
    while (cardSum > 22) { cardSum = dsum(cardSum); }
    var cardN = cardSum === 22 ? 0 : cardSum;

    var hidden = [];
    if (!lp.master) {
      [['해', ry], ['달', rm], ['일', rd]].forEach(function (p) {
        if (p[1].master) { hidden.push(p[1].value); }
      });
    }
    return {
      y: y, m: m, d: day, ry: ry, rm: rm, rd: rd,
      sum: sum, lp: lp.value, master: lp.master,
      py: py, pyRaw: pyRaw, card: cardN, hiddenMasters: hidden
    };
  }

  /* ---------------- 화면 ---------------- */
  var $ = function (id) { return d.getElementById(id); };
  var R = {};

  function buildSelects() {
    var by = $('by'), bm = $('bm'), bd = $('bd');
    var i, y = new Date().getFullYear();
    by.innerHTML = '<option value="" selected disabled>----</option>';
    for (i = y; i >= 1930; i--) { by.insertAdjacentHTML('beforeend', '<option value="' + i + '">' + i + '년</option>'); }
    bm.innerHTML = '<option value="" selected disabled>--</option>';
    for (i = 1; i <= 12; i++) { bm.insertAdjacentHTML('beforeend', '<option value="' + i + '">' + i + '월</option>'); }
    fillDays();
    by.addEventListener('change', function () { fillDays(); sync(); });
    bm.addEventListener('change', function () { fillDays(); sync(); });
    bd.addEventListener('change', sync);
  }

  function daysIn(y, m) { return new Date(y || 2000, m, 0).getDate(); }

  function fillDays() {
    var bd = $('bd'), y = +$('by').value || 2000, m = +$('bm').value || 1;
    var keep = bd.value, n = daysIn(y, m), i;
    bd.innerHTML = '<option value="" selected disabled>--</option>';
    for (i = 1; i <= n; i++) { bd.insertAdjacentHTML('beforeend', '<option value="' + i + '">' + i + '일</option>'); }
    if (keep && +keep <= n) { bd.value = keep; }
  }

  function sync() {
    var ok = $('by').value && $('bm').value && $('bd').value;
    $('btn-go').disabled = !ok;
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function render(r) {
    var L = N.LIFE[r.lp], T = N.THEME[r.lp], PY = N.PY[r.py];
    var tarot = N.TAROT[r.card];

    // 카드
    $('num-big').innerHTML = r.lp + '<small>번</small>';
    $('out-date').textContent = r.y + '.' + pad(r.m) + '.' + pad(r.d) + ' 양력';
    $('num-nick').textContent = L.nick;
    $('num-tag').textContent = L.tag;

    var stamp = $('stamp');
    if (r.master) {
      stamp.hidden = false;
      stamp.innerHTML = 'MASTER<span>' + r.lp + '</span>';
    } else { stamp.hidden = true; }

    var chips = [];
    chips.push('<span class="chip on">2027년 · ' + r.py + '의 해</span>');
    chips.push('<span class="chip">탄생 카드 · ' + tarot.name + '</span>');
    r.hiddenMasters.forEach(function (v) {
      chips.push('<span class="chip">숨은 ' + v + ' 기운</span>');
    });
    $('num-chips').innerHTML = chips.join('');

    // 스탯
    var names = [['intuition', '직관력', 'INTUITION'], ['drive', '행동력', 'DRIVE'], ['love', '애정운', 'HEART'], ['money', '재물감각', 'MONEY']];
    $('stat-rows').innerHTML = names.map(function (n) {
      var v = L.stats[n[0]], hearts = '';
      for (var k = 0; k < 5; k++) {
        hearts += '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.2S4 15.1 4 9.9A4.5 4.5 0 0 1 12 6.7 4.5 4.5 0 0 1 20 9.9c0 5.2-8 10.3-8 10.3Z" fill="' + (k < v ? '#B93B3B' : '#E9DFCC') + '"/></svg>';
      }
      return '<div class="stat-row"><span class="stat-name" title="' + n[2] + '">' + n[1] + '</span><span class="hearts" aria-hidden="true">' + hearts + '</span><span class="stat-val">' + v + '/5</span></div>';
    }).join('');

    // 기질
    $('traits').innerHTML = L.traits.map(function (t) { return '<li>' + t + '</li>'; }).join('');
    $('shadow').innerHTML = L.shadow.map(function (t) { return '<li>' + t + '</li>'; }).join('');

    // 2027
    $('py-num').textContent = r.py;
    $('py-title').textContent = PY.title;
    $('py-theme').textContent = PY.theme;
    $('py-kw1').textContent = PY.kw1;
    $('py-h1').textContent = PY.h1;
    $('py-kw2').textContent = PY.kw2;
    $('py-h2').textContent = PY.h2;
    $('py-tip').textContent = PY.tip;

    // 일·돈·관계
    $('tr-work').textContent = L.work;
    $('tr-money').textContent = L.money;
    $('tr-love').textContent = L.love;
    $('match-row').innerHTML = L.match.map(function (n) {
      return '<span class="numdot best">' + n + '</span>';
    }).join('') + '<span class="fine" style="margin:0">이 숫자들과 특히 잘 통해요</span>';
    $('avoid').textContent = L.avoid;

    // 타로
    var roman = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
    $('tarot-rn').textContent = roman[tarot.n];
    $('tarot-name').textContent = tarot.name;
    $('tarot-en').textContent = tarot.en;
    $('tarot-line').textContent = tarot.line;

    // 계산 과정
    var lines = [];
    function step(label, num, red) {
      if (isMaster(num)) {
        return '<div class="calc-line"><span class="calc-k">' + label + '</span><span>' + num + ' → 마스터 수라 줄이지 않아요 → <b>' + red.value + '</b></span></div>';
      }
      var segs = [String(num)], cur = num;
      while (cur > 9 && !isMaster(cur)) {
        var nx = dsum(cur);
        segs.push(String(cur).split('').join(' + ') + ' = ' + nx);
        cur = nx;
      }
      var html = segs.map(function (s, i) {
        return i === segs.length - 1 ? '<b>' + s + '</b>' : s;
      }).join(' → ');
      return '<div class="calc-line"><span class="calc-k">' + label + '</span><span>' + html + '</span></div>';
    }
    lines.push(step('해', r.y, r.ry));
    lines.push(step('달', r.m, r.rm));
    lines.push(step('일', r.d, r.rd));
    lines.push((function () {
      var segs = [r.ry.value + ' + ' + r.rm.value + ' + ' + r.rd.value + ' = ' + r.sum], cur2 = r.sum;
      while (cur2 > 9 && !isMaster(cur2)) {
        var nx2 = dsum(cur2);
        segs.push(String(cur2).split('').join(' + ') + ' = ' + nx2 + (isMaster(nx2) ? ' (마스터 수)' : ''));
        cur2 = nx2;
      }
      var html2 = segs.map(function (s, i) { return i === segs.length - 1 ? '<b>' + s + '</b>' : s; }).join(' → ');
      return '<div class="calc-line"><span class="calc-k">합</span><span>' + html2 + '</span></div>';
    })());
    lines.push('<div class="calc-line"><span class="calc-k">2027</span><span>2+0+2+7 = 11, 여기에 ' + r.m + '월(' + dsum(r.m) + ') + ' + r.d + '일(' + dsum(r.d) + ') = ' + r.pyRaw + ' → <b>' + r.py + '</b></span></div>');
    lines.push('<div class="calc-line"><span class="calc-k">카드</span><span>' + r.m + ' + ' + r.d + ' + ' + r.y + ' = ' + (r.m + r.d + r.y) + ' → <b>' + r.card + '번</b></span></div>');

    var notes = ['11·22·33이 나오면 더 줄이지 않고 그대로 둬요. 이걸 마스터 수라고 해요.'];
    notes.push('2027년 개인년수는 1~9로만 봐요. 2027은 2+0+2+7 = 11이라 기준값이 2예요.');
    r.hiddenMasters.forEach(function (v) {
      notes.push('태어난 ' + (v === r.ry.value ? '해' : v === r.rm.value ? '달' : '날') + '에 ' + v + '가 있어서 ' + r.lp + '의 기질 위에 ' + v + '의 기운이 살짝 얹혀 있어요.');
    });
    notes.push('탄생 카드는 0~21번 메이저 아르카나로 맞춰요. 22가 나오면 0번(바보)이 돼요.');
    $('calc-body').innerHTML = lines.join('') + '<p class="calc-note">' + notes.join(' ') + '</p>';
  }

  var current = null;

  function show(r) {
    current = r;
    render(r);
    $('screen-in').classList.remove('is-on');
    $('screen-out').classList.add('is-on');
    d.body.classList.add('is-result');
    w.scrollTo({ top: 0, behavior: 'instant' in w ? 'instant' : 'auto' });
  }

  function back() {
    $('screen-out').classList.remove('is-on');
    $('screen-in').classList.add('is-on');
    d.body.classList.remove('is-result');
    w.scrollTo({ top: 0, behavior: 'auto' });
  }

  /* ---------------- PNG 카드 ---------------- */
  var F_BODY = '"Pretendard Variable", Pretendard, -apple-system, sans-serif';
  var F_SERIF = '"Gowun Dodum", "Pretendard Variable", Pretendard, sans-serif';
  var F_HAND = 'Caveat, "Gowun Dodum", cursive';
  var F_MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

  function rr(ctx, x, y, w2, h2, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w2, y, x + w2, y + h2, r);
    ctx.arcTo(x + w2, y + h2, x, y + h2, r);
    ctx.arcTo(x, y + h2, x, y, r);
    ctx.arcTo(x, y, x + w2, y, r);
    ctx.closePath();
  }

  function wrapText(ctx, text, maxW) {
    var out = [], line = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === '\n') { out.push(line); line = ''; continue; }
      if (ctx.measureText(line + ch).width > maxW && line) { out.push(line); line = ch; }
      else { line += ch; }
    }
    if (line) { out.push(line); }
    // 마지막 줄이 너무 짧으면(예: "요.") 두 줄 폭이 비슷해지도록 다시 나눈다
    if (out.length === 2 && ctx.measureText(out[1]).width < maxW * 0.28) {
      var mid = Math.floor(text.length / 2), best = null;
      for (var d = 0; d < text.length / 2; d++) {
        [mid + d, mid - d].forEach(function (k) {
          if (best || k < 4 || k > text.length - 4) { return; }
          var a = text.slice(0, k), b = text.slice(k);
          if (ctx.measureText(a).width <= maxW && ctx.measureText(b).width <= maxW) {
            if (text[k - 1] === ' ' || text[k] === ' ' || d > 6) { best = [a, b]; }
          }
        });
        if (best) { break; }
      }
      if (best) { out = best; }
    }
    return out;
  }

  function heartPath(ctx, x, y, s, filled, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s / 24, s / 24);
    ctx.beginPath();
    ctx.moveTo(12, 20.2);
    ctx.bezierCurveTo(9, 17.6, 4, 14.6, 4, 9.9);
    ctx.bezierCurveTo(4, 7.4, 6, 5.5, 8.4, 5.5);
    ctx.bezierCurveTo(10, 5.5, 11.3, 6.4, 12, 7.6);
    ctx.bezierCurveTo(12.7, 6.4, 14, 5.5, 15.6, 5.5);
    ctx.bezierCurveTo(18, 5.5, 20, 7.4, 20, 9.9);
    ctx.bezierCurveTo(20, 14.6, 15, 17.6, 12, 20.2);
    ctx.closePath();
    ctx.fillStyle = filled ? color : 'rgba(120,132,96,.22)';
    ctx.fill();
    ctx.restore();
  }

  /* 자간을 직접 벌려 그린다 (ctx.letterSpacing 미지원 브라우저 대비) */
  function spaced(ctx, text, x, y, gap) {
    var cur = x;
    for (var i = 0; i < text.length; i++) {
      ctx.fillText(text[i], cur, y);
      cur += ctx.measureText(text[i]).width + gap;
    }
    return cur - x;
  }
  function spacedW(ctx, text, gap) {
    var w = 0;
    for (var i = 0; i < text.length; i++) { w += ctx.measureText(text[i]).width + gap; }
    return w - gap;
  }

  var MASCOT_SRC = 'assets/cat-mascot.webp';
  var mascotImg = null;
  function loadMascot() {
    if (!mascotImg) { mascotImg = new Image(); mascotImg.src = MASCOT_SRC; }
    if (mascotImg.complete && mascotImg.naturalWidth) { return Promise.resolve(mascotImg); }
    return new Promise(function (res) {
      mascotImg.onload = function () { res(mascotImg); };
      mascotImg.onerror = function () { res(null); };
    });
  }

  function makeCard() {
    var r = current, L = N.LIFE[r.lp], PY = N.PY[r.py], tarot = N.TAROT[r.card];
    var W = 1080, H = 2000;
    var cv = d.createElement('canvas');
    cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');
    var M = 72, CW = W - M * 2;
    var INK = '#2D2724', INK2 = '#6A5A4E', MUTE = '#9A8A7B', LINE = '#E9DFCC',
      SKY = '#4C7E9B', SKY_SOFT = '#E3EEF5', CHERRY = '#B93B3B',
      PAPER = '#FFFDF7', BLOCK = '#F7F1E3';

    ctx.fillStyle = '#FAF6EC'; ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'alphabetic';

    // 헤더
    ctx.textAlign = 'left';
    ctx.fillStyle = INK; ctx.font = '34px ' + F_SERIF;
    ctx.fillText('수수수 웹툴', M, 102);
    ctx.font = '17px ' + F_BODY; ctx.fillStyle = MUTE;
    spaced(ctx, 'MY LITTLE DESTINY', W - M - spacedW(ctx, 'MY LITTLE DESTINY', 3.4), 100, 3.4);
    ctx.strokeStyle = LINE; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(M, 132); ctx.lineTo(W - M, 132); ctx.stroke();

    // 운명 수 카드
    var cy = 168, chh = 648;
    rr(ctx, M, cy, CW, chh, 44);
    ctx.fillStyle = PAPER; ctx.fill();
    ctx.strokeStyle = LINE; ctx.lineWidth = 2; ctx.stroke();

    ctx.fillStyle = MUTE; ctx.font = '17px ' + F_BODY;
    spaced(ctx, 'MY NUMBER', M + 44, cy + 66, 3.2);

    ctx.fillStyle = SKY; ctx.font = '182px ' + F_SERIF;
    ctx.fillText(String(r.lp), M + 40, cy + 244);
    var numW = ctx.measureText(String(r.lp)).width;

    // 고양이 (흰 배경은 multiply로 종이에 얹는다)
    var mw = 226;
    if (mascotImg && mascotImg.complete && mascotImg.naturalWidth) {
      var mh = mw * mascotImg.naturalHeight / mascotImg.naturalWidth;
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(mascotImg, M + CW - mw - 30, cy + 68, mw, mh);
      ctx.restore();
    }

    if (r.master) {
      var sx = M + 56 + numW + 56, sy = cy + 118;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(-0.13);
      ctx.beginPath(); ctx.arc(0, 0, 54, 0, Math.PI * 2);
      ctx.setLineDash([6, 6]); ctx.lineWidth = 2.5; ctx.strokeStyle = CHERRY; ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = CHERRY; ctx.textAlign = 'center';
      ctx.font = '13px ' + F_BODY; ctx.fillText('MASTER', 0, -4);
      ctx.font = '28px ' + F_SERIF; ctx.fillText(String(r.lp), 0, 30);
      ctx.textAlign = 'left';
      ctx.restore();
    }

    ctx.fillStyle = INK; ctx.font = '54px ' + F_SERIF;
    ctx.fillText(L.nick, M + 40, cy + 356);
    ctx.fillStyle = INK2; ctx.font = '29px ' + F_BODY;
    var tagLines = wrapText(ctx, L.tag, CW - 210).slice(0, 3);
    tagLines.forEach(function (ln, i) { ctx.fillText(ln, M + 44, cy + 416 + i * 46); });

    // 생일 칩
    var chipY = cy + chh - 78;
    rr(ctx, M + 44, chipY, 348, 48, 24);
    ctx.fillStyle = BLOCK; ctx.fill();
    ctx.fillStyle = INK2; ctx.font = '22px ' + F_BODY;
    ctx.fillText(r.y + '.' + pad(r.m) + '.' + pad(r.d) + '  양력', M + 70, chipY + 32);

    // 스탯
    var sty = cy + chh + 40, sh = 272;
    rr(ctx, M, sty, CW, sh, 36);
    ctx.fillStyle = BLOCK; ctx.fill();
    ctx.fillStyle = INK; ctx.font = '27px ' + F_SERIF;
    ctx.fillText('내 스탯', M + 44, sty + 58);
    ctx.fillStyle = MUTE; ctx.font = '16px ' + F_BODY;
    spaced(ctx, 'MY STATS', M + CW - 44 - spacedW(ctx, 'MY STATS', 2.6), sty + 54, 2.6);
    var rows = [['직관력', L.stats.intuition], ['행동력', L.stats.drive], ['애정운', L.stats.love], ['재물감각', L.stats.money]];
    rows.forEach(function (row, i) {
      var ry = sty + 116 + i * 38;
      ctx.fillStyle = INK2; ctx.font = '23px ' + F_BODY;
      ctx.fillText(row[0], M + 44, ry);
      for (var k = 0; k < 5; k++) {
        heartPath(ctx, M + 566 + k * 38, ry - 19, 27, k < row[1], CHERRY);
      }
      ctx.fillStyle = MUTE; ctx.font = '18px ' + F_BODY; ctx.textAlign = 'right';
      ctx.fillText(row[1] + '/5', M + CW - 44, ry);
      ctx.textAlign = 'left';
    });

    // 2027
    var py = sty + sh + 44;
    var pyChip = '2027 · ' + r.py + '의 해';
    ctx.font = '25px ' + F_SERIF;
    var chipW = ctx.measureText(pyChip).width + 58;
    rr(ctx, M, py, chipW, 54, 27);
    ctx.fillStyle = SKY_SOFT; ctx.fill();
    ctx.fillStyle = SKY;
    ctx.fillText(pyChip, M + 29, py + 36);
    ctx.fillStyle = INK; ctx.font = '36px ' + F_SERIF;
    ctx.fillText(PY.title, M + chipW + 32, py + 40);
    ctx.fillStyle = INK2; ctx.font = '26px ' + F_BODY;
    var pyLines = wrapText(ctx, PY.theme, CW).slice(0, 2);
    pyLines.forEach(function (ln, i) { ctx.fillText(ln, M, py + 108 + i * 42); });

    // 탄생 타로
    var ty = py + 108 + pyLines.length * 42 + 34;
    ctx.fillStyle = MUTE; ctx.font = '16px ' + F_BODY;
    spaced(ctx, 'BIRTH TAROT CARD', M, ty, 2.6);
    ctx.fillStyle = INK; ctx.font = '34px ' + F_SERIF;
    ctx.fillText(tarot.name + ' · ' + tarot.en, M, ty + 46);
    ctx.fillStyle = INK2; ctx.font = '26px ' + F_BODY;
    var tLines = wrapText(ctx, tarot.line, CW).slice(0, 2);
    tLines.forEach(function (ln, i) { ctx.fillText(ln, M, ty + 96 + i * 40); });

    // 푸터
    var fy = ty + 96 + tLines.length * 40 + 30;
    ctx.strokeStyle = LINE; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(M, fy); ctx.lineTo(W - M, fy); ctx.stroke();
    ctx.fillStyle = MUTE; ctx.font = '18px ' + F_BODY;
    ctx.fillText('soosoosupernova.github.io/destiny-number', M, fy + 40);
    ctx.fillStyle = CHERRY; ctx.font = '30px ' + F_HAND; ctx.textAlign = 'right';
    ctx.fillText('made with care', W - M, fy + 40);
    ctx.textAlign = 'left';

    var cropH = Math.min(H, fy + 80);
    var out = d.createElement('canvas');
    out.width = W; out.height = cropH;
    out.getContext('2d').drawImage(cv, 0, 0);
    return out;
  }

  function canvasToBlob(cv) {
    return new Promise(function (res) { cv.toBlob(res, 'image/png'); });
  }

  function fileName() { return 'destiny-number-' + current.lp + '.png'; }

  function toast(msg, ttl) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(t._tm);
    t._tm = setTimeout(function () { t.classList.remove('on'); }, ttl || 2600);
  }

  function savePng() {
    Promise.all([fontsReady(), loadMascot()]).then(function () {
      var cv = makeCard();
      canvasToBlob(cv).then(function (bin) {
        if (!bin) { toast('이미지를 만들지 못했어요. 화면을 캡처해 주세요.'); return; }
        var url = URL.createObjectURL(bin);
        var a = d.createElement('a');
        a.href = url; a.download = fileName();
        d.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        toast('PNG 저장했어요. 사진첩에서 확인해 보세요.');
      });
    });
  }

  function fontsReady() {
    if (!d.fonts || !d.fonts.ready) { return Promise.resolve(); }
    var jobs = [];
    try {
      jobs.push(d.fonts.load('400 100px "Gowun Dodum"'));
      jobs.push(d.fonts.load('600 30px Caveat'));
      jobs.push(d.fonts.load('400 30px "Pretendard Variable"'));
      jobs.push(d.fonts.load('650 30px "Pretendard Variable"'));
    } catch (e) {}
    return Promise.all(jobs).then(function () { return d.fonts.ready; }).catch(function () {});
  }

  function shareText() {
    var L = N.LIFE[current.lp], PY = N.PY[current.py], tarot = N.TAROT[current.card];
    var head = current.master ? '마스터 수 ' : '';
    return '내 운명 수는 ' + head + current.lp + ' · ' + L.nick + '\n'
      + '2027년은 ' + current.py + '의 해 (' + PY.title + ')\n'
      + '탄생 타로는 ' + tarot.name + '\n'
      + '— 수수수 웹툴 수비학 리포트\n'
      + 'https://soosoosupernova.github.io/destiny-number/';
  }

  function share() {
    var txt = shareText();
    Promise.all([fontsReady(), loadMascot()]).then(function () { return makeCard(); }).then(function (cv) {
      return canvasToBlob(cv).then(function (bin) {
        var file = bin ? new File([bin], fileName(), { type: 'image/png' }) : null;
        if (file && navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
          navigator.share({ files: [file], text: txt, title: '내 수비학 리포트' }).catch(function () { copyText(txt); });
          return;
        }
        if (navigator.share) {
          navigator.share({ title: '내 수비학 리포트', text: txt, url: 'https://soosoosupernova.github.io/destiny-number/' })
            .catch(function () { copyText(txt); });
          return;
        }
        savePng();
        toast('공유 기능이 없어 PNG로 저장했어요.');
      });
    });
  }

  function copyText(txt) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () { toast('결과 문구를 복사했어요.'); }, function () { fallbackCopy(txt); });
      return;
    }
    fallbackCopy(txt);
  }

  function fallbackCopy(txt) {
    var ta = d.createElement('textarea');
    ta.value = txt; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    d.body.appendChild(ta); ta.select();
    try { d.execCommand('copy'); toast('결과 문구를 복사했어요.'); }
    catch (e) { toast('복사가 안 됐어요. 길게 눌러 복사해 주세요.'); }
    ta.remove();
  }

  /* ---------------- 초기화 ---------------- */
  function init() {
    var search = w.location.search || '';
    buildSelects();
    sync();
    fontsReady();

    $('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var y = +$('by').value, m = +$('bm').value, day = +$('bd').value;
      if (!y || !m || !day) { return; }
      if (day > daysIn(y, m)) { toast('그 달에는 그 날이 없어요. 날짜를 다시 골라 주세요.'); return; }
      show(calc(y, m, day));
    });

    $('btn-back').addEventListener('click', back);
    $('btn-save').addEventListener('click', savePng);
    $('btn-share').addEventListener('click', share);
    $('btn-copy').addEventListener('click', function () { copyText(shareText()); });

    // 결과를 훑어보는 동안에는 저장 바가 시야를 가리지 않게, 첫 카드를 지나면 나타난다
    var bar = d.querySelector('.actions');
    function watchBar() {
      if (!bar) { return; }
      bar.classList.toggle('is-shown', (w.scrollY || 0) > 420);
    }
    w.addEventListener('scroll', watchBar, { passive: true });
    watchBar();

    // 테스트/확인용: ?d=1990-04-27 로 결과를 바로 열 수 있다 (주소에 남지 않게 지운다)
    var q = search.match(/[?&]d=(\d{4})-(\d{2})-(\d{2})/);
    if (q) {
      var yy = +q[1], mm = +q[2], dd = +q[3];
      if (daysIn(yy, mm) >= dd) {
        $('by').value = yy; fillDays(); $('bm').value = mm; fillDays(); $('bd').value = dd; sync();
        show(calc(yy, mm, dd));
        try { w.history.replaceState(null, d.title, w.location.pathname); } catch (err) {}
      }
    }

    // PNG 미리보기 (?pngprev=1) — 확인용
    if (/[?&]pngprev=1/.test(search) && current) {
      Promise.all([fontsReady(), loadMascot()]).then(function () {
        var cv = makeCard();
        cv.style.cssText = 'width:100%;max-width:420px;height:auto;display:block;margin:16px auto;border-radius:14px;box-shadow:0 8px 20px rgba(0,0,0,.15)';
        d.getElementById('screen-out').appendChild(cv);
      });
    }
  }

  w.NUMCALC = calc;
  if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', init); } else { init(); }
})(window, document);
