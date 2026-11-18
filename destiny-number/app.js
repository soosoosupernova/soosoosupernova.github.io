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
    $('card-body').style.setProperty('--nb', T.bg);
    $('card-body').style.setProperty('--na', T.accent);
    $('blob-mini').style.color = T.blob;
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
        hearts += '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.2S4 15.1 4 9.9A4.5 4.5 0 0 1 12 6.7 4.5 4.5 0 0 1 20 9.9c0 5.2-8 10.3-8 10.3Z" fill="' + (k < v ? '#E2748F' : '#CBD3B8') + '"/></svg>';
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
    $('tarot-nm').textContent = tarot.name;
    $('tarot-name').textContent = tarot.name;
    $('tarot-en').textContent = tarot.en;
    $('tarot-line').textContent = tarot.line;
    $('tarot-mot').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + N.MOTIF[tarot.motif] + '"/></svg>';

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
    w.scrollTo({ top: 0, behavior: 'instant' in w ? 'instant' : 'auto' });
  }

  function back() {
    $('screen-out').classList.remove('is-on');
    $('screen-in').classList.add('is-on');
    w.scrollTo({ top: 0, behavior: 'auto' });
  }

  /* ---------------- PNG 카드 ---------------- */
  var F_BODY = '"Pretendard Variable", Pretendard, -apple-system, sans-serif';
  var F_ROUND = 'Jua, "Pretendard Variable", Pretendard, sans-serif';
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

  function blob(ctx, cx, cy, size, color) {
    var s = size / 120;
    ctx.save();
    ctx.translate(cx - size / 2, cy - size / 2);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(62, 16);
    ctx.bezierCurveTo(85, 16, 103, 31, 103, 50);
    ctx.bezierCurveTo(103, 57, 101, 62, 97, 66);
    ctx.bezierCurveTo(100, 70, 101, 75, 101, 80);
    ctx.bezierCurveTo(101, 98, 84, 110, 62, 110);
    ctx.bezierCurveTo(40, 110, 23, 98, 23, 80);
    ctx.bezierCurveTo(23, 75, 24, 71, 27, 67);
    ctx.bezierCurveTo(23, 63, 21, 58, 21, 50);
    ctx.bezierCurveTo(21, 31, 39, 16, 62, 16);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 2.6; ctx.strokeStyle = 'rgba(58,48,43,.20)'; ctx.stroke();
    ctx.fillStyle = '#3A302B';
    ctx.beginPath(); ctx.ellipse(47, 60, 4.4, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(75, 60, 4.4, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(242,145,174,.55)';
    ctx.beginPath(); ctx.ellipse(35, 74, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(87, 74, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3A302B'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(55, 72); ctx.quadraticCurveTo(61, 79, 67, 72); ctx.stroke();
    ctx.restore();
  }

  function makeCard() {
    var r = current, L = N.LIFE[r.lp], T = N.THEME[r.lp], PY = N.PY[r.py], tarot = N.TAROT[r.card];
    var W = 1080, H = 1560;
    var cv = d.createElement('canvas');
    cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');

    // 배경
    ctx.fillStyle = '#FBF8F3'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(224,205,182,.36)'; ctx.lineWidth = 1;
    for (var gx = 0; gx <= W; gx += 36) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    for (var gy = 0; gy <= H; gy += 36) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
    var grad = ctx.createRadialGradient(140, 60, 10, 140, 60, 420);
    grad.addColorStop(0, 'rgba(255,233,174,.85)'); grad.addColorStop(1, 'rgba(255,233,174,0)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, 520);
    var grad2 = ctx.createRadialGradient(980, 120, 10, 980, 120, 380);
    grad2.addColorStop(0, 'rgba(255,219,230,.8)'); grad2.addColorStop(1, 'rgba(255,219,230,0)');
    ctx.fillStyle = grad2; ctx.fillRect(0, 0, W, 520);

    // 헤더
    ctx.fillStyle = '#3A302B';
    ctx.font = '34px ' + F_ROUND; ctx.textBaseline = 'alphabetic';
    ctx.fillText('수수수 웹툴', 72, 92);
    ctx.font = '20px ' + F_MONO; ctx.fillStyle = '#7A6A5F'; ctx.textAlign = 'right';
    ctx.fillText('NUMEROLOGY REPORT', W - 72, 90);
    ctx.textAlign = 'left';

    // 카드 창
    var cx = 72, cy = 120, cw = W - 144, chH = 650;
    ctx.save();
    ctx.shadowColor = 'rgba(94,70,48,.10)'; ctx.shadowBlur = 28; ctx.shadowOffsetY = 12;
    rr(ctx, cx, cy, cw, chH, 40); ctx.fillStyle = '#FFFDF9'; ctx.fill();
    ctx.restore();
    ctx.save(); rr(ctx, cx, cy, cw, chH, 40); ctx.clip();
    ctx.fillStyle = T.bg; ctx.fillRect(cx, cy, cw, 78);
    ctx.restore();
    rr(ctx, cx, cy, cw, chH, 40); ctx.strokeStyle = '#EFE3D4'; ctx.lineWidth = 4; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + 78); ctx.lineTo(cx + cw, cy + 78); ctx.strokeStyle = '#EFE3D4'; ctx.lineWidth = 3; ctx.stroke();

    ['#F291AE', '#FFD06A', '#74C7A8'].forEach(function (c, i) {
      ctx.beginPath(); ctx.arc(cx + 42 + i * 30, cy + 39, 10, 0, Math.PI * 2);
      ctx.fillStyle = c; ctx.fill();
      ctx.strokeStyle = 'rgba(58,48,43,.12)'; ctx.lineWidth = 1.5; ctx.stroke();
    });
    ctx.fillStyle = 'rgba(58,48,43,.62)'; ctx.font = '20px ' + F_MONO;
    ctx.fillText('MY NUMBER.EXE', cx + 138, cy + 47);

    // 숫자 + 블롭
    ctx.fillStyle = '#6B5D54'; ctx.font = '22px ' + F_MONO;
    ctx.fillText('운명 수 · DESTINY NUMBER', cx + 56, cy + 168);
    ctx.fillStyle = T.accent; ctx.font = '200px ' + F_ROUND;
    ctx.fillText(String(r.lp), cx + 52, cy + 348);
    var numW = ctx.measureText(String(r.lp)).width;
    ctx.font = '32px ' + F_MONO; ctx.fillStyle = '#7A6A5F';
    ctx.fillText('번', cx + 68 + numW, cy + 296);

    var blobSize = r.master ? 176 : 200;
    var blobCx = r.master ? cx + cw - 126 : cx + cw - 150;
    blob(ctx, blobCx, cy + 258, blobSize, T.blob);

    if (r.master) {
      ctx.save();
      ctx.translate(cx + cw - 320, cy + 252);
      ctx.rotate(-0.19);
      ctx.beginPath(); ctx.arc(0, 0, 74, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,253,249,.82)'; ctx.fill();
      ctx.setLineDash([8, 7]); ctx.lineWidth = 4; ctx.strokeStyle = '#EE88A6'; ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#C4466C'; ctx.textAlign = 'center';
      ctx.font = '30px Gaegu, sans-serif';
      ctx.fillText('MASTER', 0, -4);
      ctx.font = '32px ' + F_ROUND;
      ctx.fillText(String(r.lp), 0, 34);
      ctx.textAlign = 'left';
      ctx.restore();
    }

    // 별명 + 한 줄
    ctx.fillStyle = '#3A302B'; ctx.font = '54px ' + F_ROUND;
    ctx.fillText(L.nick, cx + 52, cy + 432);
    ctx.fillStyle = '#6B5D54'; ctx.font = '30px ' + F_BODY;
    var tagLines = wrapText(ctx, L.tag, cw - 110);
    tagLines.forEach(function (ln, i) { ctx.fillText(ln, cx + 54, cy + 492 + i * 46); });

    // 생일 칩
    var chipY = cy + chH - 46;
    ctx.fillStyle = '#FFF9EF'; rr(ctx, cx + 52, chipY - 30, 330, 48, 24); ctx.fill();
    ctx.strokeStyle = '#E3D3BF'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#6B5D54'; ctx.font = '22px ' + F_MONO;
    ctx.fillText(r.y + '.' + pad(r.m) + '.' + pad(r.d) + '  양력', cx + 74, chipY + 1);

    // 스탯 패널
    var sy = cy + chH + 34, sh = 236;
    rr(ctx, cx, sy, cw, sh, 34);
    ctx.fillStyle = '#E9EEDA'; ctx.fill();
    ctx.strokeStyle = '#D3DDBB'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#46512F'; ctx.font = '30px ' + F_ROUND;
    ctx.fillText('내 스탯', cx + 44, sy + 56);
    ctx.fillStyle = '#6C7A4F'; ctx.font = '16px ' + F_MONO; ctx.textAlign = 'right';
    ctx.fillText('STAT', cx + cw - 44, sy + 54); ctx.textAlign = 'left';
    var rows = [['직관력', L.stats.intuition], ['행동력', L.stats.drive], ['애정운', L.stats.love], ['재물감각', L.stats.money]];
    rows.forEach(function (row, i) {
      var ry2 = sy + 104 + i * 42;
      ctx.fillStyle = '#4E5B3B'; ctx.font = '22px ' + F_MONO;
      ctx.fillText(row[0], cx + 44, ry2);
      for (var k = 0; k < 5; k++) { heartPath(ctx, cx + 612 + k * 42, ry2 - 22, 30, k < row[1], '#E2748F'); }
      ctx.fillStyle = '#6C7A4F'; ctx.textAlign = 'right'; ctx.font = '18px ' + F_MONO;
      ctx.fillText(row[1] + '/5', cx + cw - 44, ry2); ctx.textAlign = 'left';
    });

    // 2027
    var py2 = sy + sh + 44;
    rr(ctx, cx, py2, 300, 56, 28); ctx.fillStyle = '#D5F1E4'; ctx.fill();
    ctx.strokeStyle = '#B7E2D0'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#21705A'; ctx.font = '26px ' + F_ROUND;
    ctx.fillText('2027 · ' + r.py + '의 해', cx + 30, py2 + 38);
    ctx.fillStyle = '#3A302B'; ctx.font = '38px ' + F_ROUND;
    ctx.fillText(PY.title, cx + 320, py2 + 42);

    ctx.fillStyle = '#6B5D54'; ctx.font = '26px ' + F_BODY;
    var pyLines = wrapText(ctx, PY.theme, cw - 20).slice(0, 2);
    pyLines.forEach(function (ln, i) { ctx.fillText(ln, cx, py2 + 106 + i * 40); });

    // 타로
    var ty = py2 + 106 + pyLines.length * 40 + 26;
    ctx.fillStyle = '#6B5D54'; ctx.font = '20px ' + F_MONO;
    ctx.fillText('탄생 타로 카드', cx, ty + 4);
    ctx.fillStyle = '#3A302B'; ctx.font = '34px ' + F_ROUND;
    ctx.fillText(tarot.name + ' · ' + tarot.en, cx, ty + 48);

    // 푸터
    var footY = ty + 66 + 76;
    ctx.fillStyle = '#7A6A5F'; ctx.font = '20px ' + F_MONO;
    ctx.fillText('soosoosupernova.github.io/destiny-number', cx, footY);
    ctx.textAlign = 'right';
    ctx.fillText('재미로 보는 참고용', cx + cw, footY);
    ctx.textAlign = 'left';

    // 실제 사용 높이로 자르기
    var cropH = Math.min(H, footY + 56);
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
    fontsReady().then(function () {
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
      jobs.push(d.fonts.load('400 100px Jua'));
      jobs.push(d.fonts.load('700 30px Gaegu'));
      jobs.push(d.fonts.load('400 30px "Pretendard Variable"'));
      jobs.push(d.fonts.load('700 30px "Pretendard Variable"'));
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
    fontsReady().then(function () { return makeCard(); }).then(function (cv) {
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
      fontsReady().then(function () {
        var cv = makeCard();
        cv.style.cssText = 'width:100%;max-width:420px;height:auto;display:block;margin:16px auto;border-radius:14px;box-shadow:0 8px 20px rgba(0,0,0,.15)';
        d.getElementById('screen-out').appendChild(cv);
      });
    }
  }

  w.NUMCALC = calc;
  if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', init); } else { init(); }
})(window, document);
