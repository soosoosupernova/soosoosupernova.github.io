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
    $('btn-go').classList.toggle('is-ready', !!ok);
  }

  /* ---------------- 결과 렌더 ---------------- */
  var current = null;

  function render(r) {
    var L = N.LIFE[r.lp], PY = N.PY[r.py];
    var tarot = N.TAROT[r.card];
    var cat = N.CAT[r.lp] || { name: '고양이', line: '' };

    $('num-big').innerHTML = r.lp + '<small>번</small>';
    $('out-date').textContent = r.y + '.' + pad(r.m) + '.' + pad(r.d) + ' 양력';
    $('num-nick').textContent = L.nick;
    $('num-tag').textContent = L.tag;

    var catEl = $('num-cat');
    catEl.src = 'assets/cats/cat-' + r.lp + '.png';
    catEl.alt = cat.name + ' 도트 고양이';
    $('cat-name').textContent = cat.name;
    $('cat-line').textContent = cat.line;
    $('draw-hint').innerHTML = '내 <b>' + r.lp + '의 ' + N.AURA[r.lp] +
      ' 기운</b>으로 오늘 · 2027 · 조언 카드 <b>3장</b>을 골라보세요.';

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
      '<span class="tc-art">' + glyph(N.ART[card], 46, '#4B3A52') + '</span>' +
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
    renderCombo();
  }

  /* ---------------- 수비학 × 타로 조합 ---------------- */
  function comboParts(r) {
    if (!r || picks.length < MAX_PICK) { return null; }
    var lp = r.lp, py = r.py;
    var c = picks.map(function (p) { return p.card; });
    var myFam = N.LFAM[lp];
    var pair = N.PAIR[myFam][N.CFAM[c[0]]];
    var punch = (r.master ? '마스터 ' : '') + lp + '의 ' + N.AURA[lp] + ' × 2027 ' + py + '의 ' +
      N.PYAURA[py] + ' — 오늘은 ' + N.CACT[c[0]] + ', 2027은 ' + N.CACT[c[1]] + ', 조언은 ' + N.CACT[c[2]] + '.';
    return {
      punch: punch,
      syn: N.SIG[lp] + ' ' + pair.syn,
      today: N.TAROT[c[0]].line,
      year: N.PYPAIR[py][N.CFAM[c[1]]] + ' ' + N.TAROT[c[1]].line,
      act: N.ADV[c[2]] + ' ' + N.FRAME[lp],
      watch: pair.watch,
      cards: c,
      color: N.PYCOLOR[py],
      luck: N.LUCKACT[lp]
    };
  }

  function renderCombo() {
    var box = $('combo-body');
    if (!box || !current) { return; }
    var r = current;
    var d = comboParts(r);
    if (!d) {
      box.innerHTML = '<p class="combo-empty">카드 3장을 다 고르면 <b>' + r.lp + '의 ' + N.AURA[r.lp] +
        ' 기운</b>과 뽑은 카드가 만났을 때의 해석이 여기에 나와요.</p>';
      return;
    }
    var t = function (i) { return N.TAROT[i]; };
    var rows = [
      ['내 숫자 × 오늘 카드', t(d.cards[0]).name + ' · ' + t(d.cards[0]).kw, d.syn + ' ' + d.today],
      ['2027 개인년수 × 2027 카드', t(d.cards[1]).name + ' · ' + t(d.cards[1]).kw, d.year],
      ['조언 카드로 2027 실행', t(d.cards[2]).name + ' · ' + t(d.cards[2]).kw, d.act]
    ];
    box.innerHTML =
      '<div class="combo-punch"><span class="cp-k">한 줄 총평</span><p>' + d.punch + '</p></div>' +
      rows.map(function (row) {
        return '<div class="combo-item"><span class="ci-k">' + row[0] + '</span>' +
          '<span class="ci-t">' + row[1] + '</span><p>' + row[2] + '</p></div>';
      }).join('') +
      '<div class="combo-watch"><span class="cw-k">주의할 점</span><p>' + d.watch + '</p></div>' +
      '<div class="combo-luck"><span class="cl-sw" style="background:' + d.color.hex + '"></span>' +
      '<div><span class="cl-k">2027 행운 컬러 · ' + d.color.name + '</span>' +
      '<p>' + d.luck + '</p></div></div>';
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
  var catCache = {};
  function loadCat(n) {
    var key = 'c' + n;
    if (!catCache[key]) {
      var im = new Image();
      im.src = 'assets/cats/cat-' + n + '.png';
      catCache[key] = im;
    }
    var img = catCache[key];
    if (img.complete && img.naturalWidth) { return Promise.resolve(img); }
    return new Promise(function (res) {
      img.onload = function () { res(img); };
      img.onerror = function () { res(null); };
    });
  }

  function pxLabel(ctx, txt, x, y, color, size) {
    ctx.fillStyle = color; ctx.font = (size || 18) + 'px ' + F_PX;
    ctx.textAlign = 'left';
    ctx.fillText(txt, x, y);
  }

  function pill(ctx, txt, x, y, bg, fg, border) {
    ctx.font = '24px ' + F_PX;
    var w = ctx.measureText(txt).width + 36;
    rect(ctx, x, y, w, 46, bg);
    if (border) { ctx.strokeStyle = border; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, 43); }
    ctx.fillStyle = fg; ctx.textAlign = 'left';
    ctx.fillText(txt, x + 18, y + 32);
    return w;
  }

  function rule(ctx, x, y, w) {
    ctx.strokeStyle = LINE; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
  }

  function makeCard() {
    var r = current, L = N.LIFE[r.lp], PY = N.PY[r.py], tarot = N.TAROT[r.card];
    var cat = N.CAT[r.lp] || { name: '고양이', line: '' };
    var d = comboParts(r);
    var W = 1080, HMAX = 3400;
    var cv = d.createElement('canvas');
    cv.width = W; cv.height = HMAX;
    var ctx = cv.getContext('2d');
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    // 배경 + 모눈
    rect(ctx, 0, 0, W, HMAX, '#FFF9EC');
    ctx.fillStyle = 'rgba(126,158,116,.13)';
    for (var gx = 0; gx < W; gx += 36) { ctx.fillRect(gx, 0, 1, HMAX); }
    for (var gy = 0; gy < HMAX; gy += 36) { ctx.fillRect(0, gy, W, 1); }

    var M = 36, PW = W - M * 2, PX = M + 48, CW = W - PX * 2;

    rect(ctx, M, M, PW, HMAX - M * 2, PAPER);

    // 창 제목바
    rect(ctx, M + 3, M + 3, PW - 6, 48, '#F8AFC8');
    rect(ctx, M + 3, M + 47, PW - 6, 4, INK);
    pxLabel(ctx, 'MY_NUMBER.EXE', M + 26, M + 32, INK);
    ['#F8DE9A', '#CFE79A', '#FFFDF6'].forEach(function (cc, i) {
      var cx = M + PW - 40 - i * 30;
      ctx.beginPath(); ctx.arc(cx, M + 27, 9, 0, Math.PI * 2);
      ctx.fillStyle = cc; ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.stroke();
    });

    var y = M + 51 + 58;

    // 머리
    pxLabel(ctx, '수수수 웹툴', PX, y + 26, INK, 30);
    ctx.fillStyle = MUTE; ctx.font = '16px ' + F_PX; ctx.textAlign = 'right';
    ctx.fillText('MY LITTLE DESTINY', PX + CW, y + 22);
    ctx.textAlign = 'left';
    rule(ctx, PX, y + 46, CW);
    y += 92;

    /* ---------- ② 운명 수 + ① 고양이 ---------- */
    ctx.fillStyle = PINK; ctx.font = '190px ' + F_PX;
    ctx.fillText(String(r.lp), PX, y + 160);
    var numW = ctx.measureText(String(r.lp)).width;
    ctx.fillStyle = INK2; ctx.font = '34px ' + F_PX;
    ctx.fillText('번', PX + numW + 14, y + 152);

    if (r.master) {
      var sx = PX + numW + 92, sy = y + 34;
      ctx.strokeStyle = PINK; ctx.lineWidth = 4; ctx.setLineDash([10, 8]);
      ctx.strokeRect(sx, sy, 132, 84);
      ctx.setLineDash([]);
      pxLabel(ctx, 'MASTER', sx + 18, sy + 32, PINK, 16);
      ctx.fillStyle = PINK; ctx.font = '36px ' + F_PX;
      ctx.fillText(String(r.lp), sx + 18, sy + 72);
    }

    if (catImg) {
      var cw = 208, ch = cw;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(catImg, PX + CW - cw, y + 4, cw, ch);
    }

    y += 196;
    ctx.fillStyle = INK; ctx.font = '50px ' + F_PX;
    ctx.fillText(L.nick, PX, y);
    y += 46;
    ctx.fillStyle = INK2; ctx.font = '28px ' + F_BODY;
    var tagLines = wrapText(ctx, L.tag, CW - 10, 2);
    tagLines.forEach(function (ln, i) { ctx.fillText(ln, PX, y + i * 40); });
    y += tagLines.length * 40 + 10;

    // 고양이 한 줄
    ctx.fillStyle = N.THEME[r.lp].accent; ctx.font = '24px ' + F_PX;
    ctx.fillText(cat.name, PX, y + 24);
    y += 44;
    ctx.fillStyle = MUTE; ctx.font = '24px ' + F_BODY;
    var catLines = wrapText(ctx, cat.line, CW, 2);
    catLines.forEach(function (ln, i) { ctx.fillText(ln, PX, y + i * 34); });
    y += catLines.length * 34 + 12;

    // 생일 칩
    var chipTxt = r.y + '.' + pad(r.m) + '.' + pad(r.d) + '  양력';
    ctx.font = '26px ' + F_PX;
    var chipW = ctx.measureText(chipTxt).width + 40;
    rect(ctx, PX, y, chipW, 50, CREAM);
    ctx.strokeStyle = LINE; ctx.lineWidth = 4; ctx.strokeRect(PX + 2, y + 2, chipW - 4, 46);
    ctx.fillStyle = INK2; ctx.fillText(chipTxt, PX + 20, y + 35);
    y += 86;

    /* ---------- ④ 성향 요약 ---------- */
    rule(ctx, PX, y, CW); y += 34;
    pxLabel(ctx, '성향 요약', PX, y, N.THEME[r.lp].accent, 20); y += 44;
    [L.traits[0], L.traits[1]].forEach(function (t) {
      ctx.fillStyle = N.THEME[r.lp].accent;
      ctx.fillRect(PX + 2, y - 16, 12, 12);
      ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
      ctx.strokeRect(PX + 2, y - 16, 12, 12);
      ctx.fillStyle = INK; ctx.font = '26px ' + F_BODY;
      var ls = wrapText(ctx, t, CW - 40, 2);
      ls.forEach(function (ln, i) { ctx.fillText(ln, PX + 34, y + i * 38); });
      y += ls.length * 38 + 16;
    });

    /* ---------- ③ 2027 개인년수 + 키워드 ---------- */
    y += 10;
    rule(ctx, PX, y, CW); y += 34;
    ctx.fillStyle = SKY; ctx.font = '116px ' + F_PX;
    ctx.fillText(String(r.py), PX, y + 92);
    var pyW = ctx.measureText(String(r.py)).width;
    var cx0 = PX + pyW + 28;
    pxLabel(ctx, '2027 개인년수', cx0, y + 20, SKY, 18);
    ctx.fillStyle = INK; ctx.font = '36px ' + F_PX;
    ctx.fillText(PY.title, cx0, y + 66);
    var kx = cx0;
    kx += pill(ctx, PY.kw1, kx, y + 84, CREAM, INK, LINE) + 10;
    pill(ctx, PY.kw2, kx, y + 84, CREAM, INK, LINE);
    y += 152;
    ctx.fillStyle = INK2; ctx.font = '28px ' + F_BODY;
    var pyLines = wrapText(ctx, PY.theme, CW, 2);
    pyLines.forEach(function (ln, i) { ctx.fillText(ln, PX, y + i * 40); });
    y += pyLines.length * 40 + 26;

    /* ---------- ⑤ 타로 3장 ---------- */
    rule(ctx, PX, y, CW); y += 34;
    pxLabel(ctx, 'TODAY · 2027 · ADVICE', PX, y, INK2, 18);
    y += 26;
    var gap = 20, tw = (CW - gap * 2) / 3, th = 300;
    for (var i = 0; i < 3; i++) {
      var bx = PX + i * (tw + gap), by = y;
      var pick = picks[i];
      var tint = pick ? N.TINT[pick.card % N.TINT.length] : '#F3EBDC';
      rect(ctx, bx, by, tw, th, tint);
      ctx.strokeStyle = INK; ctx.lineWidth = 4;
      ctx.strokeRect(bx + 2, by + 2, tw - 4, th - 4);
      ctx.fillStyle = INK2; ctx.font = '20px ' + F_PX;
      ctx.fillText(POS[i], bx + 18, by + 34);
      if (pick) {
        var tt = N.TAROT[pick.card];
        drawGlyphCanvas(ctx, N.ART[pick.card], bx + tw / 2 - 44, by + 92, 88, INK);
        ctx.fillStyle = INK; ctx.font = '28px ' + F_PX; ctx.textAlign = 'center';
        ctx.fillText(tt.name, bx + tw / 2, by + th - 64);
        ctx.fillStyle = INK2; ctx.font = '17px ' + F_PX;
        ctx.fillText(tt.kw, bx + tw / 2, by + th - 34);
        ctx.textAlign = 'left';
      } else {
        ctx.fillStyle = MUTE; ctx.font = '26px ' + F_PX; ctx.textAlign = 'center';
        ctx.fillText('—', bx + tw / 2, by + th / 2 + 10);
        ctx.textAlign = 'left';
      }
    }
    y += th + 26;

    // 한 줄 총평
    if (d) {
      var pbox = wrapText(ctx, d.punch, CW - 60, 3);
      var ph = 52 + pbox.length * 38 + 22;
      rect(ctx, PX, y, CW, ph, '#FDF0F5');
      rect(ctx, PX, y, 10, ph, PINK2);
      ctx.strokeStyle = LINE; ctx.lineWidth = 3;
      ctx.strokeRect(PX + 1.5, y + 1.5, CW - 3, ph - 3);
      pxLabel(ctx, '한 줄 총평', PX + 32, y + 36, PINK2, 18);
      ctx.fillStyle = INK; ctx.font = '26px ' + F_BODY;
      pbox.forEach(function (ln, i) { ctx.fillText(ln, PX + 32, y + 76 + i * 38); });
      y += ph + 30;
    }

    /* ---------- 조합 해석 ---------- */
    if (d) {
      pxLabel(ctx, '수비학 × 타로 조합', PX, y, N.THEME[r.lp].accent, 20); y += 40;
      ctx.fillStyle = INK; ctx.font = '26px ' + F_BODY;
      var sLines = wrapText(ctx, d.syn, CW, 3);
      sLines.forEach(function (ln, i) { ctx.fillText(ln, PX, y + i * 38); });
      y += sLines.length * 38 + 16;
      ctx.fillStyle = INK2; ctx.font = '26px ' + F_BODY;
      var yLines = wrapText(ctx, d.year, CW, 3);
      yLines.forEach(function (ln, i) { ctx.fillText(ln, PX, y + i * 38); });
      y += yLines.length * 38 + 16;
      var wLines = wrapText(ctx, d.watch, CW - 40, 2);
      var wh = 26 + wLines.length * 36 + 16;
      rect(ctx, PX, y, CW, wh, '#EAF4F8');
      ctx.strokeStyle = '#BFDCEA'; ctx.lineWidth = 3;
      ctx.strokeRect(PX + 1.5, y + 1.5, CW - 3, wh - 3);
      pxLabel(ctx, '주의', PX + 22, y + 30, SKY, 17);
      ctx.fillStyle = INK2; ctx.font = '25px ' + F_BODY;
      wLines.forEach(function (ln, i) { ctx.fillText(ln, PX + 82, y + 30 + i * 36); });
      y += wh + 28;
    }

    /* ---------- ⑥ 2027 행운 포인트 ---------- */
    rule(ctx, PX, y, CW); y += 34;
    pxLabel(ctx, '2027 행운 포인트', PX, y, SKY, 20); y += 30;
    rect(ctx, PX, y, 62, 62, N.PYCOLOR[r.py].hex);
    ctx.strokeStyle = INK; ctx.lineWidth = 3.5;
    ctx.strokeRect(PX + 1.5, y + 1.5, 59, 59);
    ctx.fillStyle = INK; ctx.font = '30px ' + F_PX;
    ctx.fillText(N.PYCOLOR[r.py].name, PX + 84, y + 40);
    pxLabel(ctx, '행운 컬러', PX + 84, y + 64, MUTE, 16);
    ctx.fillStyle = INK2; ctx.font = '26px ' + F_BODY;
    var lLines = wrapText(ctx, N.LUCKACT[r.lp], CW - 84, 2);
    lLines.forEach(function (ln, i) { ctx.fillText(ln, PX + 84, y + 100 + i * 34); });
    y += 62 + 18 + lLines.length * 34 + 24;

    /* ---------- 탄생 카드 ---------- */
    ctx.fillStyle = MUTE; ctx.font = '18px ' + F_PX;
    ctx.fillText('BIRTH CARD', PX, y);
    y += 34;
    ctx.fillStyle = INK; ctx.font = '28px ' + F_PX;
    ctx.fillText(tarot.name + '  ·  ' + tarot.en, PX, y);
    y += 44;

    // 푸터
    rule(ctx, PX, y, CW); y += 36;
    ctx.fillStyle = MUTE; ctx.font = '20px ' + F_PX;
    ctx.fillText('soosoosupernova.github.io/destiny-number', PX, y);
    y += 40;
    ctx.fillStyle = MUTE; ctx.font = '18px ' + F_BODY;
    ctx.fillText('수비학·타로는 재미로 보는 참고용이에요.', PX, y);

    var panelH = y + 56 - M;
    var bottom = M + panelH;
    if (bottom < HMAX) {
      rect(ctx, 0, bottom, W, HMAX - bottom, '#FFF9EC');
      ctx.fillStyle = 'rgba(126,158,116,.13)';
      var gx2, gy2;
      for (gx2 = 0; gx2 < W; gx2 += 36) { ctx.fillRect(gx2, bottom, 1, HMAX - bottom); }
      for (gy2 = Math.ceil(bottom / 36) * 36; gy2 < HMAX; gy2 += 36) { ctx.fillRect(0, gy2, W, 1); }
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
    Promise.all([fontsReady(), loadCat(current.lp)]).then(function (res) {
      catImg = res[1];
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
    var cat = N.CAT[current.lp] || {};
    var d = comboParts(current);
    var lines = [];
    lines.push('내 운명 수는 ' + (current.master ? '마스터 수 ' : '') + current.lp + ' · ' + L.nick);
    lines.push('내 고양이는 ' + cat.name + ' (' + cat.line + ')');
    lines.push('2027년은 ' + current.py + '의 해 (' + PY.title + ')');
    if (d) {
      lines.push('뽑은 카드 — 오늘 ' + N.TAROT[d.cards[0]].name +
        ' / 2027 ' + N.TAROT[d.cards[1]].name +
        ' / 조언 ' + N.TAROT[d.cards[2]].name);
      lines.push('한 줄 총평: ' + d.punch);
      lines.push('2027 행운 포인트: ' + d.color.name + ' · ' + d.luck);
    }
    lines.push('— 수수수 웹툴 수비학·타로');
    lines.push('https://soosoosupernova.github.io/destiny-number/');
    return lines.join('\n');
  }

  function share() {
    var txt = shareText();
    Promise.all([fontsReady(), loadCat(current.lp)]).then(function (res) {
      catImg = res[1];
      return makeCard();
    }).then(function (cv) {
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
      if (!y || !m || !day) {
        toast('생년월일을 먼저 골라 주세요.');
        $('by').focus();
        return;
      }
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
      Promise.all([fontsReady(), loadCat(current.lp)]).then(function (res) {
        catImg = res[1];
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
