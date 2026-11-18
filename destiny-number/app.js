/*!
 * app.js — 생년월일 수비학 + 타로 뽑기 (픽셀 도트 개편, 2026-11-18)
 * 계산: 운명 수(마스터 11·22·33 보존), 2027 개인년수, 탄생 카드
 * 뽑기: 뒤집힌 6장 중 3장을 골라 오늘 · 2027 · 조언으로 읽기
 * 저장: 의존성 없는 canvas PNG 생성 → 다운로드/공유
 */
(function (w, d) {
  'use strict';
  var N = w.NUM;
  var POS = ['오늘', '2027', '조언'];
  var MAX_PICK = 3;
  var ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
    'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];

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

  /* ---------------- 픽셀 글리프 ---------------- */
  function glyph(name, size, color, cls) {
    var g = N.GLYPH[name];
    if (!g) { return ''; }
    var rects = '', r, c;
    for (r = 0; r < g.length; r++) {
      for (c = 0; c < g[r].length; c++) {
        if (g[r].charAt(c) === '#') {
          rects += '<rect x="' + c + '" y="' + r + '" width="1" height="1"/>';
        }
      }
    }
    return '<svg class="' + (cls || '') + '" viewBox="0 0 12 12" width="' + size + '" height="' + size +
      '" fill="' + color + '" shape-rendering="crispEdges" aria-hidden="true">' + rects + '</svg>';
  }

  /* ---------------- 화면 도구 ---------------- */
  var $ = function (id) { return d.getElementById(id); };
  function pad(n) { return (n < 10 ? '0' : '') + n; }

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

  /* ---------------- 결과 렌더 ---------------- */
  var current = null;

  function render(r) {
    var L = N.LIFE[r.lp], PY = N.PY[r.py];
    var tarot = N.TAROT[r.card];

    $('num-big').innerHTML = r.lp + '<small>번</small>';
    $('out-date').textContent = r.y + '.' + pad(r.m) + '.' + pad(r.d) + ' 양력';
    $('num-nick').textContent = L.nick;
    $('num-tag').textContent = L.tag;

    var stamp = $('stamp');
    if (r.master) {
      stamp.hidden = false;
      stamp.innerHTML = 'MASTER<span>' + r.lp + '</span>';
    } else { stamp.hidden = true; }

    var chips = ['<span class="chip on">2027년 · ' + r.py + '의 해</span>',
      '<span class="chip">태어난 날 카드 · ' + tarot.name + '</span>'];
    r.hiddenMasters.forEach(function (v) {
      chips.push('<span class="chip">숨은 ' + v + ' 기운</span>');
    });
    $('num-chips').innerHTML = chips.join('');

    // 스탯
    var names = [['intuition', '직관력'], ['drive', '행동력'], ['love', '애정운'], ['money', '재물감각']];
    $('stat-rows').innerHTML = names.map(function (n) {
      var v = L.stats[n[0]], hearts = '';
      for (var k = 0; k < 5; k++) {
        hearts += glyph('heart', 13, k < v ? '#D96E97' : '#C6D5A4', 'heart');
      }
      return '<div class="stat-row"><span class="stat-name">' + n[1] + '</span>' +
        '<span class="hearts" aria-hidden="true">' + hearts + '</span>' +
        '<span class="stat-val2">' + v + '/5</span></div>';
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
    $('ic-work').innerHTML = glyph('brief', 18, '#4B3A52');
    $('ic-money').innerHTML = glyph('coin', 18, '#4B3A52');
    $('ic-love').innerHTML = glyph('heart', 18, '#D96E97');
    $('tr-work').textContent = L.work;
    $('tr-money').textContent = L.money;
    $('tr-love').textContent = L.love;
    $('match-row').innerHTML = L.match.map(function (n) {
      return '<span class="numdot">' + n + '</span>';
    }).join('') + '<span class="fine">이 숫자들과 특히 잘 통해요</span>';
    $('avoid').textContent = L.avoid;

    // 태어난 날 카드
    $('birth-card').innerHTML =
      '<span class="tc-num">' + ROMAN[tarot.n] + '</span>' +
      '<span class="tc-art">' + glyph(N.ART[r.card], 40, '#4B3A52') + '</span>' +
      '<span class="tc-name">' + tarot.name + '</span>';
    $('birth-card').style.background = N.TINT[r.card % N.TINT.length];
    $('tarot-rn').textContent = ROMAN[tarot.n];
    $('tarot-name').textContent = tarot.name;
    $('tarot-en').textContent = tarot.en;
    $('tarot-line').textContent = tarot.line;

    // 계산 과정
    var lines = [];
    function step(label, num, red) {
      if (isMaster(num)) {
        return '<div class="calc-line"><span class="calc-k">' + label + '</span><span>' + num +
          ' → 마스터 수라 줄이지 않아요 → <b>' + red.value + '</b></span></div>';
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
    lines.push('<div class="calc-line"><span class="calc-k">2027</span><span>2+0+2+7 = 11, 여기에 ' + r.m + '월(' +
      dsum(r.m) + ') + ' + r.d + '일(' + dsum(r.d) + ') = ' + r.pyRaw + ' → <b>' + r.py + '</b></span></div>');
    lines.push('<div class="calc-line"><span class="calc-k">카드</span><span>' + r.m + ' + ' + r.d + ' + ' + r.y +
      ' = ' + (r.m + r.d + r.y) + ' → 22 이하로 줄이면 <b>' + r.card + '번</b> (' + tarot.name + ')</span></div>');

    var notes = ['11·22·33이 나오면 더 줄이지 않고 그대로 둬요. 이걸 마스터 수라고 해요.',
      '2027년 개인년수는 1~9로만 봐요. 2027은 2+0+2+7 = 11이라 기준값이 2예요.'];
    r.hiddenMasters.forEach(function (v) {
      notes.push('태어난 ' + (v === r.ry.value ? '해' : v === r.rm.value ? '달' : '날') + '에 ' + v +
        '가 있어서 ' + r.lp + '의 기질 위에 ' + v + '의 기운이 살짝 얹혀 있어요.');
    });
    notes.push('태어난 날 카드는 0~21번 메이저 아르카나로 맞춰요. 22가 나오면 0번(바보)이 돼요.');
    $('calc-body').innerHTML = lines.join('') + '<p class="calc-note">' + notes.join(' ') + '</p>';
  }

  /* ---------------- 타로 뽑기 ---------------- */
  var deck = [];       // spread에 깔린 6장의 타로 번호
  var picks = [];      // [{slot:0..2, card:n}]

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function dealDeck() {
    var all = [], i;
    for (i = 0; i < N.TAROT.length; i++) { all.push(i); }
    shuffle(all);
    return all.slice(0, 6);
  }

  function cardFaceHTML(card) {
    var t = N.TAROT[card];
    return '<span class="tc-num">' + ROMAN[t.n] + '</span>' +
      '<span class="tc-art">' + glyph(N.ART[card], 34, '#4B3A52') + '</span>' +
      '<span class="tc-name">' + t.name + '</span>';
  }

  function buildSpread() {
    var box = $('spread'), html = '', i;
    for (i = 0; i < deck.length; i++) {
      html += '<button type="button" class="tcard" data-i="' + i + '" aria-label="' + (i + 1) + '번째 카드 뽑기">' +
        '<span class="tc-inner">' +
        '<span class="tc-face tc-back"><img src="assets/pixel-card-back.webp" width="176" height="292" alt=""></span>' +
        '<span class="tc-face tc-front" style="background:' + N.TINT[deck[i] % N.TINT.length] + '">' +
        cardFaceHTML(deck[i]) + '</span>' +
        '</span></button>';
    }
    box.innerHTML = html;
  }

  function resetSlots() {
    for (var p = 0; p < MAX_PICK; p++) {
      var li = $('slots').children[p];
      li.classList.remove('done');
      $('slot-' + p).textContent = '—';
    }
  }

  function renderReadings() {
    var html = '';
    picks.forEach(function (pick) {
      var t = N.TAROT[pick.card];
      var text = pick.slot === 2 ? N.ADV[pick.card] : t.line;
      html += '<div class="reading">' +
        '<div class="r-head"><span class="r-pos">' + POS[pick.slot] + '</span>' +
        '<span class="r-name">' + t.name + '</span>' +
        '<span class="r-kw">' + t.kw + '</span></div>' +
        '<p class="r-text">' + text + '</p></div>';
    });
    if (!html) {
      html = '<p class="r-empty">카드를 고르면 순서대로 해석이 나와요.</p>';
    }
    $('readings').innerHTML = html;
  }

  function pickCard(i, btn) {
    if (picks.length >= MAX_PICK || !btn) { return; }
    if (btn.classList.contains('picked') || btn.classList.contains('spent')) { return; }
    var slot = picks.length;
    picks.push({ slot: slot, card: deck[i] });
    btn.classList.add('picked');
    btn.setAttribute('aria-pressed', 'true');
    btn.disabled = true;
    var slotLi = $('slots').children[slot];
    slotLi.classList.add('done');
    $('slot-' + slot).textContent = N.TAROT[deck[i]].name;
    renderReadings();
    if (picks.length === MAX_PICK) {
      Array.prototype.forEach.call($('spread').children, function (el) {
        if (!el.classList.contains('picked')) { el.classList.add('spent'); }
        el.disabled = true;
      });
    }
  }

  function newDraw(preset) {
    deck = dealDeck();
    picks = [];
    buildSpread();
    resetSlots();
    renderReadings();
    if (preset) {
      preset.forEach(function (card, k) {
        if (k < MAX_PICK && deck.indexOf(card) > -1) {
          pickCard(deck.indexOf(card), $('spread').children[deck.indexOf(card)]);
        }
      });
    }
  }

  /* ---------------- 화면 전환 ---------------- */
  function show(r) {
    current = r;
    render(r);
    newDraw();
    $('screen-in').classList.remove('is-on');
    $('screen-out').classList.add('is-on');
    d.body.classList.add('is-result');
    w.scrollTo(0, 0);
    watchBar();
  }

  function back() {
    $('screen-out').classList.remove('is-on');
    $('screen-in').classList.add('is-on');
    d.body.classList.remove('is-result');
    w.scrollTo(0, 0);
  }

  /* ---------------- PNG 카드 ---------------- */
  var F_BODY = '"Pretendard Variable", Pretendard, -apple-system, sans-serif';
  var F_PX = '"Galmuri11", monospace';
  var INK = '#4B3A52', INK2 = '#63516B', MUTE = '#8E7C93', PAPER = '#FFFDF6',
    CREAM = '#FFF7E7', LINE = '#E3D3BA', LCD = '#E9F2D4', PINK = '#D96E97', SKY = '#4E93B4';

  function rect(ctx, x, y, ww, hh, color) { ctx.fillStyle = color; ctx.fillRect(x, y, ww, hh); }

  function pxFrame(ctx, x, y, ww, hh, bg, border) {
    rect(ctx, x + 10, y + 10, ww, hh, 'rgba(75,58,82,.13)');
    rect(ctx, x, y, ww, hh, bg);
    ctx.strokeStyle = border; ctx.lineWidth = 6;
    ctx.strokeRect(x + 3, y + 3, ww - 6, hh - 6);
  }

  function wrapText(ctx, text, maxW, maxLines) {
    var out = [], line = '', i;
    for (i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (ch === '\n') { out.push(line); line = ''; continue; }
      if (ctx.measureText(line + ch).width > maxW && line) { out.push(line); line = ch; }
      else { line += ch; }
    }
    if (line) { out.push(line); }
    if (maxLines && out.length > maxLines) {
      out = out.slice(0, maxLines);
      out[maxLines - 1] = out[maxLines - 1].replace(/.$/, '…');
    }
    return out;
  }

  function drawGlyphCanvas(ctx, name, x, y, size, color) {
    var g = N.GLYPH[name];
    if (!g) { return; }
    var cell = size / 12;
    ctx.fillStyle = color;
    for (var r = 0; r < g.length; r++) {
      for (var c = 0; c < g[r].length; c++) {
        if (g[r].charAt(c) === '#') { ctx.fillRect(x + c * cell, y + r * cell, cell, cell); }
      }
    }
  }

  var catImg = null;
  function loadCat() {
    if (!catImg) { catImg = new Image(); catImg.src = 'assets/pixel-cat.webp'; }
    if (catImg.complete && catImg.naturalWidth) { return Promise.resolve(catImg); }
    return new Promise(function (res) {
      catImg.onload = function () { res(catImg); };
      catImg.onerror = function () { res(null); };
    });
  }

  function makeCard() {
    var r = current, L = N.LIFE[r.lp], PY = N.PY[r.py], tarot = N.TAROT[r.card];
    var W = 1080;
    var cv = d.createElement('canvas');
    cv.width = W; cv.height = 2400;
    var ctx = cv.getContext('2d');
    ctx.textBaseline = 'alphabetic';

    // 배경 + 모눈
    rect(ctx, 0, 0, W, 2400, '#FFF9EC');
    ctx.fillStyle = 'rgba(126,158,116,.13)';
    for (var gx = 0; gx < W; gx += 36) { ctx.fillRect(gx, 0, 1, 2400); }
    for (var gy = 0; gy < 2400; gy += 36) { ctx.fillRect(0, gy, W, 1); }

    var M = 40, PW = W - M * 2, PX = M + 44, CW = PW - 96;
    var y = 90;

    // 패널
    rect(ctx, M, M, PW, 2200, PAPER);

    // 머리
    ctx.fillStyle = INK; ctx.font = '30px ' + F_PX; ctx.textAlign = 'left';
    ctx.fillText('수수수 웹툴', PX, y + 30);
    ctx.fillStyle = MUTE; ctx.font = '16px ' + F_PX; ctx.textAlign = 'right';
    ctx.fillText('MY LITTLE DESTINY', PX + CW, y + 26);
    ctx.textAlign = 'left';
    ctx.strokeStyle = INK; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(PX, y + 56); ctx.lineTo(PX + CW, y + 56); ctx.stroke();
    y += 100;

    // 운명 수
    ctx.fillStyle = PINK; ctx.font = '200px ' + F_PX;
    ctx.fillText(String(r.lp), PX, y + 168);
    var numW = ctx.measureText(String(r.lp)).width;
    ctx.fillStyle = INK2; ctx.font = '34px ' + F_PX;
    ctx.fillText('번', PX + numW + 12, y + 160);

    if (catImg) {
      var cw = 210, ch = cw * 152 / 136;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(catImg, PX + CW - cw, y + 10, cw, ch);
    }

    if (r.master) {
      var sx = PX + numW + 96, sy = y + 24;
      ctx.strokeStyle = PINK; ctx.lineWidth = 4; ctx.setLineDash([10, 8]);
      ctx.strokeRect(sx, sy, 132, 84);
      ctx.setLineDash([]);
      ctx.fillStyle = PINK; ctx.font = '16px ' + F_PX;
      ctx.fillText('MASTER', sx + 18, sy + 32);
      ctx.font = '36px ' + F_PX;
      ctx.fillText(String(r.lp), sx + 18, sy + 72);
    }

    y += 240;
    ctx.fillStyle = INK; ctx.font = '52px ' + F_PX;
    ctx.fillText(L.nick, PX, y);
    y += 52;
    ctx.fillStyle = INK2; ctx.font = '30px ' + F_BODY;
    wrapText(ctx, L.tag, CW - 20, 2).forEach(function (ln, i) { ctx.fillText(ln, PX, y + i * 44); });
    y += 44 * Math.min(2, wrapText(ctx, L.tag, CW - 20, 2).length) + 6;

    // 생일 칩
    var chipTxt = r.y + '.' + pad(r.m) + '.' + pad(r.d) + '  양력';
    ctx.font = '28px ' + F_PX;
    var chipW = ctx.measureText(chipTxt).width + 40;
    rect(ctx, PX, y, chipW, 52, CREAM);
    ctx.strokeStyle = LINE; ctx.lineWidth = 4; ctx.strokeRect(PX + 2, y + 2, chipW - 4, 48);
    ctx.fillStyle = INK2;
    ctx.fillText(chipTxt, PX + 20, y + 36);
    y += 84;

    // 스탯 패널
    var statH = 74 + 5 * 56;
    rect(ctx, PX, y, CW, statH, LCD);
    ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(PX + 2, y + 2, CW - 4, statH - 4);
    ctx.fillStyle = INK2; ctx.font = '18px ' + F_PX;
    ctx.fillText('MY STATS', PX + 26, y + 40);
    ctx.fillStyle = MUTE; ctx.font = '16px ' + F_PX; ctx.textAlign = 'right';
    ctx.fillText('5점 만점', PX + CW - 26, y + 40);
    ctx.textAlign = 'left';
    [['직관력', L.stats.intuition], ['행동력', L.stats.drive], ['애정운', L.stats.love], ['재물감각', L.stats.money]]
      .forEach(function (row, i) {
        var ry = y + 86 + i * 56;
        ctx.fillStyle = INK; ctx.font = '24px ' + F_BODY;
        ctx.fillText(row[0], PX + 26, ry + 14);
        for (var k = 0; k < 5; k++) {
          drawGlyphCanvas(ctx, 'heart', PX + 300 + k * 42, ry - 8, 30, k < row[1] ? PINK : '#C6D5A4');
        }
        ctx.fillStyle = INK2; ctx.font = '20px ' + F_PX; ctx.textAlign = 'right';
        ctx.fillText(row[1] + '/5', PX + CW - 26, ry + 12);
        ctx.textAlign = 'left';
      });
    y += statH + 50;

    // 2027
    rect(ctx, PX, y, CW, 8, PINK);
    y += 34;
    ctx.fillStyle = SKY; ctx.font = '26px ' + F_PX;
    ctx.fillText('2027 · ' + r.py + '의 해', PX, y);
    y += 46;
    ctx.fillStyle = INK; ctx.font = '38px ' + F_PX;
    ctx.fillText(PY.title, PX, y);
    y += 44;
    ctx.fillStyle = INK2; ctx.font = '28px ' + F_BODY;
    var pyLines = wrapText(ctx, PY.theme, CW, 2);
    pyLines.forEach(function (ln, i) { ctx.fillText(ln, PX, y + i * 42); });
    y += pyLines.length * 42 + 48;

    // 직접 뽑은 카드
    if (picks.length) {
      ctx.fillStyle = INK2; ctx.font = '18px ' + F_PX;
      ctx.fillText('TODAY · 2027 · ADVICE', PX, y);
      y += 22;
      var gap = 22, cw2 = (CW - gap * 2) / 3, ch2 = cw2 * 73 / 44;
      picks.forEach(function (pick, i) {
        var t = N.TAROT[pick.card], bx = PX + i * (cw2 + gap), by = y + 8;
        rect(ctx, bx, by, cw2, ch2, N.TINT[pick.card % N.TINT.length]);
        ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(bx + 2, by + 2, cw2 - 4, ch2 - 4);
        ctx.fillStyle = INK2; ctx.font = '18px ' + F_PX;
        ctx.fillText(POS[pick.slot], bx + 16, by + 34);
        drawGlyphCanvas(ctx, N.ART[pick.card], bx + cw2 / 2 - 45, by + ch2 / 2 - 62, 90, INK);
        ctx.fillStyle = INK; ctx.font = '26px ' + F_PX; ctx.textAlign = 'center';
        ctx.fillText(t.name, bx + cw2 / 2, by + ch2 - 42);
        ctx.fillStyle = INK2; ctx.font = '15px ' + F_PX;
        ctx.fillText(t.kw, bx + cw2 / 2, by + ch2 - 16);
        ctx.textAlign = 'left';
      });
      y += ch2 + 46;
    }

    // 태어난 날 카드
    ctx.fillStyle = MUTE; ctx.font = '18px ' + F_PX;
    ctx.fillText('BIRTH CARD', PX, y);
    y += 40;
    ctx.fillStyle = INK; ctx.font = '32px ' + F_PX;
    ctx.fillText(tarot.name + '  ·  ' + tarot.en, PX, y);
    y += 40;
    ctx.fillStyle = INK2; ctx.font = '26px ' + F_BODY;
    var tLines = wrapText(ctx, tarot.line, CW, 2);
    tLines.forEach(function (ln, i) { ctx.fillText(ln, PX, y + i * 40); });
    y += tLines.length * 40 + 40;

    // 푸터
    ctx.strokeStyle = LINE; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(PX, y); ctx.lineTo(PX + CW, y); ctx.stroke();
    y += 40;
    ctx.fillStyle = MUTE; ctx.font = '20px ' + F_PX;
    ctx.fillText('soosoosupernova.github.io/destiny-number', PX, y);
    y += 44;
    ctx.fillStyle = MUTE; ctx.font = '18px ' + F_BODY;
    ctx.fillText('수비학·타로는 재미로 보는 참고용이에요.', PX, y);

    var panelH = y + 60 - M;
    var bottom = M + panelH;
    if (bottom < 2400) {
      rect(ctx, 0, bottom, W, 2400 - bottom, '#FFF9EC');
      ctx.fillStyle = 'rgba(126,158,116,.13)';
      var gx2, gy2;
      for (gx2 = 0; gx2 < W; gx2 += 36) { ctx.fillRect(gx2, bottom, 1, 2400 - bottom); }
      for (gy2 = Math.ceil(bottom / 36) * 36; gy2 < 2400; gy2 += 36) { ctx.fillRect(0, gy2, W, 1); }
    }
    ctx.strokeStyle = INK; ctx.lineWidth = 6;
    ctx.strokeRect(M + 3, M + 3, PW - 6, panelH - 6);

    var H = Math.ceil(M + panelH + 40);
    var out = d.createElement('canvas');
    out.width = W; out.height = H;
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

  function fontsReady() {
    if (!d.fonts || !d.fonts.ready) { return Promise.resolve(); }
    var jobs = [];
    try {
      jobs.push(d.fonts.load('400 40px "Galmuri11"'));
      jobs.push(d.fonts.load('400 30px "Pretendard Variable"'));
      jobs.push(d.fonts.load('600 30px "Pretendard Variable"'));
    } catch (e) {}
    return Promise.all(jobs).then(function () { return d.fonts.ready; }).catch(function () {});
  }

  function savePng() {
    Promise.all([fontsReady(), loadCat()]).then(function () {
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

  function shareText() {
    var L = N.LIFE[current.lp], PY = N.PY[current.py];
    var lines = [];
    lines.push('내 운명 수는 ' + (current.master ? '마스터 수 ' : '') + current.lp + ' · ' + L.nick);
    lines.push('2027년은 ' + current.py + '의 해 (' + PY.title + ')');
    if (picks.length === MAX_PICK) {
      lines.push('뽑은 카드 — 오늘 ' + N.TAROT[picks[0].card].name +
        ' / 2027 ' + N.TAROT[picks[1].card].name +
        ' / 조언 ' + N.TAROT[picks[2].card].name);
    }
    lines.push('— 수수수 웹툴 수비학·타로');
    lines.push('https://soosoosupernova.github.io/destiny-number/');
    return lines.join('\n');
  }

  function share() {
    var txt = shareText();
    Promise.all([fontsReady(), loadCat()]).then(function () { return makeCard(); }).then(function (cv) {
      return canvasToBlob(cv).then(function (bin) {
        var file = bin ? new File([bin], fileName(), { type: 'image/png' }) : null;
        if (file && navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
          navigator.share({ files: [file], text: txt, title: '내 수비학·타로 리포트' }).catch(function () { copyText(txt); });
          return;
        }
        if (navigator.share) {
          navigator.share({ title: '내 수비학·타로 리포트', text: txt, url: 'https://soosoosupernova.github.io/destiny-number/' })
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

  /* ---------------- 고정 바 ---------------- */
  function watchBar() {
    var bar = $('actionbar');
    if (!bar || !d.body.classList.contains('is-result')) { return; }
    bar.classList.toggle('is-shown', (w.scrollY || 0) > 220);
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

    $('spread').addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.tcard') : null;
      if (!btn || !$('spread').contains(btn)) { return; }
      pickCard(+btn.getAttribute('data-i'), btn);
    });

    $('btn-redraw').addEventListener('click', function () {
      newDraw();
      toast('새로 섞었어요. 카드 3장을 골라 주세요.');
    });

    $('btn-back').addEventListener('click', back);
    $('btn-save').addEventListener('click', savePng);
    $('btn-share').addEventListener('click', share);
    $('btn-copy').addEventListener('click', function () { copyText(shareText()); });

    w.addEventListener('scroll', watchBar, { passive: true });

    // 확인용: ?d=1990-04-27 (주소에 남지 않게 지운다)
    var q = search.match(/[?&]d=(\d{4})-(\d{2})-(\d{2})/);
    if (q) {
      var yy = +q[1], mm = +q[2], dd = +q[3];
      if (daysIn(yy, mm) >= dd) {
        $('by').value = yy; fillDays(); $('bm').value = mm; fillDays(); $('bd').value = dd; sync();
        show(calc(yy, mm, dd));
        var cq = search.match(/[?&]cards=([\d,]+)/);
        if (cq) {
          var cs = cq[1].split(',').map(Number).slice(0, MAX_PICK);
          cs.forEach(function (card, k) {
            var idx = deck.indexOf(card);
            if (idx > -1) { pickCard(idx, $('spread').children[idx]); }
          });
          if (cs.length === MAX_PICK) { watchBar(); }
        }
        try { w.history.replaceState(null, d.title, w.location.pathname); } catch (err) {}
      }
    }

    // PNG 미리보기 (?pngprev=1) — 확인용
    if (/[?&]pngprev=1/.test(search) && current) {
      Promise.all([fontsReady(), loadCat()]).then(function () {
        var cv = makeCard();
        cv.style.cssText = 'width:100%;max-width:420px;height:auto;display:block;margin:16px auto;border:2px solid #4B3A52';
        $('screen-out').appendChild(cv);
      });
    }

    watchBar();
  }

  w.NUMCALC = calc;
  if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', init); } else { init(); }
})(window, document);
