/* 2027 나만의 부적 카드 — 화면 흐름, 공유 링크, 카드 PNG(1080×1350 · 1080×1080) */
(function () {
  'use strict';

  var D = window.TALISMAN;
  var $ = function (id) { return document.getElementById(id); };
  var IMG = 'assets/characters/';
  var PAGE_TITLE = document.title;

  var PIX = '"Galmuri", "Apple SD Gothic Neo", monospace';
  var TXT = '"Pretendard", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';

  var INK = '#241F33';
  var SOFT = '#6B6382';
  var FAINT = '#A49BB8';
  var PINK = '#FF7DA6';
  var PINK_DEEP = '#E9537F';
  var MINT = '#BFF0DC';
  var LILAC = '#DDD2FF';
  var BUTTER = '#FFEFB0';
  var PAPER = '#FFF6D8';

  var IN_APP = /KAKAOTALK|Instagram|FBAN|FBAV|NAVER\(inapp|Line\/\d|DaumApps|BAND\//i.test(navigator.userAgent)
    || /[?&]qa_inapp=1/.test(location.search || '');

  var state = {
    picks: [],
    idx: 0,
    year: '',
    type: null,
    mode: 'mine',
    busy: false
  };

  /* ───────── 화면 ───────── */
  var SCREENS = ['intro', 'quiz', 'result'];

  function show(id) {
    SCREENS.forEach(function (sid) {
      var el = $(sid);
      if (el) { el.classList.toggle('on', sid === id); }
    });
    try { window.scrollTo(0, 0); } catch (e) {}
  }

  /* ───────── 질문 ───────── */
  function renderQ() {
    var q = D.QUESTIONS[state.idx];
    $('axis').textContent = q.axis;
    $('qtext').textContent = q.q;
    $('stepTag').textContent = (state.idx + 1) + ' / ' + D.QUESTIONS.length;
    $('quiz').classList.toggle('wide', q.opts.length > 2);

    var bars = $('quiz').querySelectorAll('.steps i');
    Array.prototype.forEach.call(bars, function (b, i) {
      b.classList.toggle('on', i <= state.idx);
    });

    var box = $('opts');
    box.innerHTML = '';
    q.opts.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.setAttribute('aria-label', o.k + '. ' + o.t);
      if (o.wish) { b.setAttribute('data-wish', o.wish); }
      else { b.setAttribute('data-v', o.v); }

      var k = document.createElement('span');
      k.className = 'k';
      k.setAttribute('aria-hidden', 'true');
      k.textContent = o.k;

      var t = document.createElement('span');
      t.className = 't';
      t.textContent = o.t;

      b.appendChild(k);
      b.appendChild(t);
      box.appendChild(b);
    });
  }

  function answer(opt) {
    var q = D.QUESTIONS[state.idx];
    state.picks[state.idx] = q.opts.length > 2
      ? opt.getAttribute('data-wish')
      : parseInt(opt.getAttribute('data-v'), 10);

    if (state.idx < D.QUESTIONS.length - 1) {
      state.idx += 1;
      renderQ();
      return;
    }
    var t = D.matchType(state.picks) || D.FALLBACK;
    paint(t);
    setMode('mine');
  }

  /* ───────── 결과 ───────── */
  function paint(t) {
    state.type = t;
    $('cardImg').src = IMG + t.img;
    $('cardImg').alt = t.name + ' 캐릭터';
    $('cardNo').textContent = 'NO.' + t.no;
    $('cardKw').textContent = t.keyword;
    $('cardName').textContent = t.name;
    $('cardSpell').textContent = t.spell;
    $('cardRx').textContent = t.rx;

    paintZodiac();

    $('sharePanel').hidden = true;
    $('savePreview').hidden = true;
    $('bonusPanel').hidden = true;
    $('statusMsg').textContent = '';
    show('result');
  }

  /* 띠 배지(오행 파스텔) + 사주 도장 + 2027 사주 한 줄.
     태어난 해를 넣지 않으면 배지는 기본 톤이고 도장·한 줄은 감춘다. */
  function paintZodiac() {
    var y = state.year;
    var zod = D.validYear(y) ? D.zodiacOf(+y) : null;
    var saju = zod ? D.ZODIAC_SAJU[zod] : null;
    var chip = $('cardZodiac');
    var stamp = $('cardStamp');
    var line = $('cardZline');

    if (saju) {
      chip.textContent = y + ' · ' + zod;
      chip.classList.add('on');
      $('card').style.setProperty('--zc', saju.color);
      stamp.textContent = saju.hanja + ' · ' + saju.stamp;
      stamp.hidden = false;
      $('cardZlineText').textContent = saju.line;
      line.hidden = false;
    } else {
      chip.textContent = '丁未 · 정미년';
      chip.classList.remove('on');
      $('card').style.removeProperty('--zc');
      stamp.textContent = '';
      stamp.hidden = true;
      $('cardZlineText').textContent = '';
      line.hidden = true;
    }
  }

  function setMode(mode) {
    state.mode = mode;
    var friend = mode === 'friend';
    $('resultLead').innerHTML = friend
      ? '<span class="s">★</span> 친구가 뽑은 2027 부적 <span class="s">★</span>'
      : '<span class="s">★</span> 2027 한 해를 지켜줄 부적 <span class="s">★</span>';
    $('actions').hidden = friend;
    $('againBtn').hidden = friend;
    $('sharePanel').hidden = true;
    $('friendCta').hidden = !friend;
    $('topMode').textContent = friend ? '친구의 부적' : '내 부적';
    document.title = friend
      ? '친구의 2027 부적 카드 · ' + state.type.name
      : PAGE_TITLE;
  }

  function resetToIntro() {
    state.picks = [];
    state.idx = 0;
    state.type = null;
    state.mode = 'mine';
    $('yearInput').value = state.year || '';
    syncYearUI();
    $('sharePanel').hidden = true;
    $('savePreview').hidden = true;
    $('bonusPanel').hidden = true;
    $('statusMsg').textContent = '';
    document.title = PAGE_TITLE;
    show('intro');
  }

  function beginQuiz() {
    if (state.mode === 'friend') {
      state.mode = 'mine';
      state.year = '';
      $('yearInput').value = '';
      syncYearUI();
      try { history.replaceState(null, '', baseUrl()); } catch (e) {}
      document.title = PAGE_TITLE;
    }
    state.picks = [];
    state.idx = 0;
    state.type = null;
    renderQ();
    show('quiz');
  }

  /* ───────── 연도 ───────── */
  function syncYearUI() {
    var ok = D.validYear(state.year);
    $('zodiacNow').textContent = ok ? D.zodiacOf(+state.year) : '';
    $('yearHint').hidden = ok;
    $('yearSep').hidden = ok;
  }

  function onYearInput() {
    var el = $('yearInput');
    var v = (el.value || '').replace(/[^0-9]/g, '').slice(0, 4);
    if (el.value !== v) { el.value = v; }
    state.year = v;
    syncYearUI();
  }

  /* ───────── 공유 링크 ───────── */
  function baseUrl() {
    return String(location.href).split('#')[0].split('?')[0];
  }

  function shareUrl() {
    if (!state.type) { return baseUrl(); }
    var u = baseUrl() + '?type=' + encodeURIComponent(state.type.id);
    if (D.validYear(state.year)) { u += '&y=' + state.year; }
    return u;
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
      return navigator.clipboard.writeText(text).then(function () { return true; })
        .catch(function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function openShare() {
    if (!state.type) { return; }
    var url = shareUrl();
    var input = $('shareUrl');
    input.value = url;
    $('sharePanel').hidden = false;
    copyText(url).then(function (ok) {
      $('statusMsg').textContent = ok
        ? '공유 링크를 복사했어요. 친구가 열면 이 부적이 보여요.'
        : '링크가 길어서 그대로 두었어요. 위 칸을 길게 눌러 복사해 주세요.';
    });
    try { $('sharePanel').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
  }

  /* ───────── 카드 그리기 ───────── */
  function fontsReady() {
    if (!document.fonts || !document.fonts.load) { return Promise.resolve(); }
    var jobs = [
      '700 40px "Galmuri"',
      '400 20px "Galmuri"',
      '400 20px "Pretendard"',
      '500 20px "Pretendard"',
      '600 20px "Pretendard"'
    ].map(function (f) { return document.fonts.load(f).catch(function () {}); });
    return Promise.all(jobs).then(function () { return document.fonts.ready; }).catch(function () {});
  }

  function loadImg(src) {
    return new Promise(function (res) {
      var im = new Image();
      im.onload = function () { res(im); };
      im.onerror = function () { res(null); };
      im.src = src;
    });
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

  function wrap(ctx, text, maxW, maxLines) {
    var out = [], line = '';
    var words = String(text).split(' ');
    for (var w = 0; w < words.length; w += 1) {
      var word = words[w];
      if (ctx.measureText(word).width > maxW) {
        for (var i = 0; i < word.length; i += 1) {
          var t2 = line + word.charAt(i);
          if (ctx.measureText(t2).width > maxW && line) { out.push(line); line = word.charAt(i); }
          else { line = t2; }
        }
        continue;
      }
      var test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) { out.push(line); line = word; }
      else { line = test; }
      if (maxLines && out.length >= maxLines) { break; }
    }
    if (line && (!maxLines || out.length < maxLines)) { out.push(line); }
    if (maxLines) { out = out.slice(0, maxLines); }
    if (out.length > 1 && out[out.length - 1].length <= 2) {
      var prev = out[out.length - 2].split(' ');
      if (prev.length > 1) {
        var moved = prev.pop();
        out[out.length - 1] = moved + ' ' + out[out.length - 1];
        out[out.length - 2] = prev.join(' ');
      }
    }
    return out;
  }

  function letterSpacing(ctx, v) {
    if ('letterSpacing' in ctx) { ctx.letterSpacing = v; }
  }

  function paintBg(ctx, w, h) {
    ctx.fillStyle = '#FFFCF2';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(150, 128, 205, .22)';
    for (var x = 16; x < w; x += 30) {
      for (var y = 16; y < h; y += 30) {
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /* 1080×1350 기준 좌표로 그린다. 원형(프사)은 이 그림을 0.78로 줄여 가운데 놓는다. */
  function paintPanel(ctx, t, img, guardian) {
    var M = 60, PW = 960, PH = 1230;   /* 카드 60~1020 × 60~1290 */
    var L = M + 44;
    var hasZ = D.validYear(state.year);
    var saju = hasZ ? D.ZODIAC_SAJU[D.zodiacOf(+state.year)] : null;
    hasZ = !!saju;

    /* 그림자 + 종이 */
    ctx.fillStyle = 'rgba(36, 31, 51, .13)';
    roundRect(ctx, M + 14, M + 16, PW, PH, 56);
    ctx.fill();

    ctx.fillStyle = PAPER;
    roundRect(ctx, M, M, PW, PH, 56);
    ctx.fill();

    ctx.save();
    roundRect(ctx, M + 4, M + 4, PW - 8, PH - 8, 52);
    ctx.clip();
    ctx.fillStyle = 'rgba(220, 170, 90, .30)';
    for (var gx = M + 22; gx < M + PW - 10; gx += 28) {
      for (var gy = M + 22; gy < M + PH - 10; gy += 28) {
        ctx.beginPath();
        ctx.arc(gx, gy, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    roundRect(ctx, M + 3, M + 3, PW - 6, PH - 6, 53);
    ctx.stroke();

    /* ── 세로 배치: 효능 상자를 먼저 재고 아래에서 위로 잡는다 ── */
    var rxX = 128, rxW = 824;
    var labelW = 82, labelH = 42;
    var textX = rxX + 24 + labelW + 20;
    var textW = rxX + rxW - 24 - textX;
    ctx.font = '400 30px ' + TXT;
    var rxLines = wrap(ctx, t.rx, textW, 3);
    var rxH = rxLines.length === 1 ? 118 : 52 + rxLines.length * 44 + 34;

    var rxBottom = hasZ ? 1110 : 1240;
    var rxY = rxBottom - rxH;
    var spellY = rxY - 30;
    var nameY = spellY - 48;
    var kwH = 96;
    var kwTop = nameY - 116 - kwH;
    var figTop = 274;
    var figBottom = kwTop - 26;
    var figH = Math.min(hasZ ? 440 : 468, figBottom - figTop);

    var chipTop = 216, chipH = 52;

    /* ── 2027 배지 ── */
    var bh = 104;
    ctx.font = '700 78px ' + PIX;
    letterSpacing(ctx, '3px');
    var bw = ctx.measureText('2027').width + 44;
    ctx.save();
    ctx.translate(L + bw / 2, 92 + bh / 2);
    ctx.rotate(-1.5 * Math.PI / 180);
    ctx.fillStyle = BUTTER;
    roundRect(ctx, -bw / 2 + 9, -bh / 2 + 11, bw, bh, 14);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, -bw / 2, -bh / 2, bw, bh, 14);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    roundRect(ctx, -bw / 2, -bh / 2, bw, bh, 14);
    ctx.stroke();
    ctx.fillStyle = PINK_DEEP;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('2027', 1, 4);
    ctx.restore();
    letterSpacing(ctx, '0px');

    /* ── NO. 배지 ── */
    ctx.font = '400 32px ' + PIX;
    letterSpacing(ctx, '2px');
    var noTxt = 'NO.' + t.no;
    var nw = ctx.measureText(noTxt).width + 32;
    var nh = 56;
    ctx.save();
    ctx.translate(M + PW - 44 - nw / 2, 92 + nh / 2);
    ctx.rotate(2 * Math.PI / 180);
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, -nw / 2, -nh / 2, nw, nh, 9);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    roundRect(ctx, -nw / 2, -nh / 2, nw, nh, 9);
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(noTxt, 1, 2);
    ctx.restore();
    letterSpacing(ctx, '0px');

    /* ── 띠 칩 (띠 오행 파스텔) ── */
    var zodTxt = hasZ ? state.year + ' · ' + D.zodiacOf(+state.year) : '丁未 · 정미년';
    ctx.font = '500 29px ' + TXT;
    var zw = ctx.measureText(zodTxt).width + 40;
    ctx.fillStyle = saju ? saju.color : 'rgba(255, 255, 255, .92)';
    roundRect(ctx, L, chipTop, zw, chipH, 26);
    ctx.fill();
    ctx.save();
    ctx.setLineDash([9, 7]);
    ctx.strokeStyle = saju ? 'rgba(36, 31, 51, .20)' : '#C9BFE8';
    ctx.lineWidth = 3;
    roundRect(ctx, L, chipTop, zw, chipH, 26);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = saju ? INK : SOFT;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(zodTxt, L + 20, chipTop + chipH / 2 + 1);

    /* ── 사주 도장: 午 · 화(火) · 귀인·육합운 ── */
    if (saju) {
      var stampTxt = saju.hanja + ' · ' + saju.stamp;
      ctx.font = '400 25px ' + PIX;
      letterSpacing(ctx, '1px');
      var sw = ctx.measureText(stampTxt).width + 36;
      var sh = 56;
      var sx = M + PW - 44 - sw;
      ctx.save();
      ctx.translate(sx + sw / 2, chipTop + chipH / 2 + 1);
      ctx.rotate(2 * Math.PI / 180);
      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, -sw / 2, -sh / 2, sw, sh, 10);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      roundRect(ctx, -sw / 2, -sh / 2, sw, sh, 10);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(36, 31, 51, .22)';
      ctx.lineWidth = 1.5;
      roundRect(ctx, -sw / 2 + 7, -sh / 2 + 7, sw - 14, sh - 14, 5);
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stampTxt, 1, 2);
      ctx.restore();
      letterSpacing(ctx, '0px');
    }

    /* ── 캐릭터 ── */
    var cx = 540, cy = figTop + figH / 2;
    if (img && img.naturalWidth) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-2 * Math.PI / 180);
      ctx.shadowColor = 'rgba(36, 31, 51, .16)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 14;
      ctx.drawImage(img, -figH / 2, -figH / 2, figH, figH);
      ctx.restore();
    }

    /* ── 반짝임 ── */
    function spark(x, y, size, color) {
      ctx.save();
      ctx.font = '400 ' + size + 'px ' + PIX;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#FFFFFF';
      ctx.strokeText('✦', x, y);
      ctx.fillStyle = color;
      ctx.fillText('✦', x, y);
      ctx.restore();
    }
    spark(330, figTop + figH * 0.24, 44, PINK);
    spark(756, figTop + figH * 0.38, 32, '#C9B4FF');
    spark(348, figTop + figH * 0.78, 28, MINT);

    /* ── 수호 양 스티커 ── */
    if (guardian && guardian.naturalWidth) {
      var gy = figTop + figH - 92;
      ctx.save();
      ctx.translate(920, gy);
      ctx.rotate(5 * Math.PI / 180);
      ctx.shadowColor = 'rgba(36, 31, 51, .14)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 8;
      ctx.drawImage(guardian, -70, -70, 140, 140);
      ctx.restore();
      ctx.save();
      ctx.font = '400 19px ' + PIX;
      letterSpacing(ctx, '2px');
      ctx.fillStyle = FAINT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('수호 양', 920, gy + 88);
      ctx.restore();
      letterSpacing(ctx, '0px');
    }

    /* ── 키워드 태그 ── */
    ctx.save();
    ctx.translate(540, kwTop + kwH / 2);
    ctx.rotate(-1 * Math.PI / 180);
    ctx.font = '700 68px ' + PIX;
    var kwW = ctx.measureText(t.keyword).width + 56;
    ctx.fillStyle = PINK;
    roundRect(ctx, -kwW / 2 + 11, -kwH / 2 + 12, kwW, kwH, 12);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, -kwW / 2, -kwH / 2, kwW, kwH, 12);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    roundRect(ctx, -kwW / 2, -kwH / 2, kwW, kwH, 12);
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t.keyword, 0, 4);
    ctx.restore();

    /* ── 유형 이름 + 주문 ── */
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = INK;
    ctx.font = '700 42px ' + PIX;
    ctx.fillText(t.name, 540, nameY);

    ctx.fillStyle = SOFT;
    ctx.font = '400 30px ' + TXT;
    ctx.fillText(t.spell, 540, spellY);

    /* ── 효능 상자 ── */
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, rxX, rxY, rxW, rxH, 28);
    ctx.fill();
    ctx.save();
    ctx.setLineDash([12, 9]);
    ctx.strokeStyle = '#C9BFE8';
    ctx.lineWidth = 4;
    roundRect(ctx, rxX, rxY, rxW, rxH, 28);
    ctx.stroke();
    ctx.restore();

    var labelY = rxY + (rxH - labelH) / 2;
    ctx.fillStyle = PINK;
    roundRect(ctx, rxX + 24, labelY, labelW, labelH, 8);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    roundRect(ctx, rxX + 24, labelY, labelW, labelH, 8);
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '400 25px ' + PIX;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('효능', rxX + 24 + labelW / 2, labelY + labelH / 2 + 2);

    ctx.fillStyle = '#3B3550';
    ctx.font = '400 30px ' + TXT;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    var blockH = 30 + (rxLines.length - 1) * 44;
    var firstBaseline = rxY + (rxH - blockH) / 2 + 25;
    rxLines.forEach(function (ln, i) {
      ctx.fillText(ln, textX, firstBaseline + i * 44);
    });

    /* ── 사주 부적 한 줄 (띠 오행 파스텔 띠) ── */
    if (saju) {
      var bandH = 120;
      var bandY = 1256 - bandH;
      ctx.fillStyle = saju.color;
      roundRect(ctx, rxX, bandY, rxW, bandH, 22);
      ctx.fill();
      ctx.save();
      ctx.setLineDash([10, 8]);
      ctx.strokeStyle = 'rgba(36, 31, 51, .18)';
      ctx.lineWidth = 3;
      roundRect(ctx, rxX, bandY, rxW, bandH, 22);
      ctx.stroke();
      ctx.restore();

      /* 2027 사주 라벨 */
      ctx.font = '400 21px ' + PIX;
      letterSpacing(ctx, '2px');
      var labTxt = '2027 사주';
      var labW = ctx.measureText(labTxt).width + 26;
      ctx.fillStyle = INK;
      roundRect(ctx, 540 - labW / 2, bandY + 15, labW, 34, 6);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labTxt, 540, bandY + 15 + 18);
      letterSpacing(ctx, '0px');

      /* 띠 한 줄 — 824 폭에 들어가게 28px → 24px 폴백 */
      var zline = saju.line;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.font = '400 28px ' + TXT;
      if (ctx.measureText(zline).width > rxW - 56) {
        ctx.font = '400 26px ' + TXT;
      }
      if (ctx.measureText(zline).width > rxW - 56) {
        ctx.font = '400 24px ' + TXT;
      }
      ctx.fillStyle = '#2E2840';
      ctx.fillText(zline, 540, bandY + 100);
    }

    /* ── 하단 주소 ── */
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '400 22px ' + TXT;
    ctx.fillStyle = 'rgba(36, 31, 51, .42)';
    ctx.fillText('soosoosupernova.github.io/2027-talisman', 540, 1322);
  }

  function drawCard(kind, t, img, guardian) {
    var cv = $('cardCanvas');
    cv.width = 1080;
    cv.height = kind === 'square' ? 1080 : 1350;
    var ctx = cv.getContext('2d');
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    paintBg(ctx, cv.width, cv.height);

    ctx.save();
    if (kind === 'square') {
      var s = 0.78;
      ctx.translate(540, 540);
      ctx.scale(s, s);
      ctx.translate(-540, -675);
    }
    paintPanel(ctx, t, img, guardian);
    ctx.restore();

    return cv;
  }

  /* ── 모두의 보너스 부적(복실양) — 1080×1350 한 장 ── */
  function paintBonusPanel(ctx, img) {
    var B = D.BONUS;
    var M = 60, PW = 960, PH = 1230;
    var L = M + 44;

    /* 그림자 + 종이 */
    ctx.fillStyle = 'rgba(36, 31, 51, .13)';
    roundRect(ctx, M + 14, M + 16, PW, PH, 56);
    ctx.fill();

    ctx.fillStyle = PAPER;
    roundRect(ctx, M, M, PW, PH, 56);
    ctx.fill();

    ctx.save();
    roundRect(ctx, M + 4, M + 4, PW - 8, PH - 8, 52);
    ctx.clip();
    ctx.fillStyle = 'rgba(220, 170, 90, .30)';
    for (var gx = M + 22; gx < M + PW - 10; gx += 28) {
      for (var gy = M + 22; gy < M + PH - 10; gy += 28) {
        ctx.beginPath();
        ctx.arc(gx, gy, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    roundRect(ctx, M + 3, M + 3, PW - 6, PH - 6, 53);
    ctx.stroke();

    /* ── 2027 배지 ── */
    var bh = 104;
    ctx.font = '700 78px ' + PIX;
    letterSpacing(ctx, '3px');
    var bw = ctx.measureText('2027').width + 44;
    ctx.save();
    ctx.translate(L + bw / 2, 92 + bh / 2);
    ctx.rotate(-1.5 * Math.PI / 180);
    ctx.fillStyle = BUTTER;
    roundRect(ctx, -bw / 2 + 9, -bh / 2 + 11, bw, bh, 14);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, -bw / 2, -bh / 2, bw, bh, 14);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    roundRect(ctx, -bw / 2, -bh / 2, bw, bh, 14);
    ctx.stroke();
    ctx.fillStyle = PINK_DEEP;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('2027', 1, 4);
    ctx.restore();
    letterSpacing(ctx, '0px');

    /* ── BONUS 배지 ── */
    ctx.font = '400 30px ' + PIX;
    letterSpacing(ctx, '2px');
    var nw = ctx.measureText(B.no).width + 34;
    var nh = 56;
    ctx.save();
    ctx.translate(M + PW - 44 - nw / 2, 92 + nh / 2);
    ctx.rotate(2 * Math.PI / 180);
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, -nw / 2, -nh / 2, nw, nh, 9);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    roundRect(ctx, -nw / 2, -nh / 2, nw, nh, 9);
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(B.no, 1, 2);
    ctx.restore();
    letterSpacing(ctx, '0px');

    /* ── 丁未 · 정미년 칩 + 모두에게 도장 ── */
    var chipTop = 216, chipH = 52;
    ctx.font = '500 29px ' + TXT;
    var zw = ctx.measureText(B.label).width + 40;
    ctx.fillStyle = MINT;
    roundRect(ctx, L, chipTop, zw, chipH, 26);
    ctx.fill();
    ctx.save();
    ctx.setLineDash([9, 7]);
    ctx.strokeStyle = 'rgba(36, 31, 51, .20)';
    ctx.lineWidth = 3;
    roundRect(ctx, L, chipTop, zw, chipH, 26);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = INK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(B.label, L + 20, chipTop + chipH / 2 + 1);

    ctx.font = '400 25px ' + PIX;
    letterSpacing(ctx, '1px');
    var tw = ctx.measureText(B.tag).width + 36;
    var th = 56;
    var tx = M + PW - 44 - tw;
    ctx.save();
    ctx.translate(tx + tw / 2, chipTop + chipH / 2 + 1);
    ctx.rotate(2 * Math.PI / 180);
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, -tw / 2, -th / 2, tw, th, 10);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    roundRect(ctx, -tw / 2, -th / 2, tw, th, 10);
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(B.tag, 1, 2);
    ctx.restore();
    letterSpacing(ctx, '0px');

    /* ── 복실양 ── */
    var figTop = 284, figH = 446;
    var cy = figTop + figH / 2;
    if (img && img.naturalWidth) {
      ctx.save();
      ctx.translate(540, cy);
      ctx.rotate(-2 * Math.PI / 180);
      ctx.shadowColor = 'rgba(36, 31, 51, .16)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 14;
      ctx.drawImage(img, -figH / 2, -figH / 2, figH, figH);
      ctx.restore();
    }

    function spark(x, y, size, color) {
      ctx.save();
      ctx.font = '400 ' + size + 'px ' + PIX;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#FFFFFF';
      ctx.strokeText('✦', x, y);
      ctx.fillStyle = color;
      ctx.fillText('✦', x, y);
      ctx.restore();
    }
    spark(318, figTop + figH * 0.20, 44, PINK);
    spark(772, figTop + figH * 0.34, 32, '#C9B4FF');
    spark(340, figTop + figH * 0.80, 28, '#3FAE8B');

    /* ── 키워드 태그 ── */
    var kwH = 96, kwTop = 762;
    ctx.save();
    ctx.translate(540, kwTop + kwH / 2);
    ctx.rotate(-1 * Math.PI / 180);
    ctx.font = '700 68px ' + PIX;
    var kwW = ctx.measureText(B.keyword).width + 56;
    ctx.fillStyle = MINT;
    roundRect(ctx, -kwW / 2 + 11, -kwH / 2 + 12, kwW, kwH, 12);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, -kwW / 2, -kwH / 2, kwW, kwH, 12);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    roundRect(ctx, -kwW / 2, -kwH / 2, kwW, kwH, 12);
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(B.keyword, 0, 4);
    ctx.restore();

    /* ── 이름 + 주문 ── */
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = INK;
    ctx.font = '700 42px ' + PIX;
    ctx.fillText(B.name, 540, 950);

    ctx.fillStyle = SOFT;
    ctx.font = '400 29px ' + TXT;
    ctx.fillText(B.spell, 540, 1000);

    /* ── 효능 상자 ── */
    var rxX = 128, rxW = 824;
    var labelW = 82, labelH = 42;
    var textX = rxX + 24 + labelW + 20;
    var textW = rxX + rxW - 24 - textX;
    ctx.font = '400 30px ' + TXT;
    var rxLines = wrap(ctx, B.rx, textW, 2);
    var rxH = rxLines.length === 1 ? 118 : 52 + rxLines.length * 44 + 34;
    var rxBottom = 1200;
    var rxY = rxBottom - rxH;

    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, rxX, rxY, rxW, rxH, 28);
    ctx.fill();
    ctx.save();
    ctx.setLineDash([12, 9]);
    ctx.strokeStyle = '#C9BFE8';
    ctx.lineWidth = 4;
    roundRect(ctx, rxX, rxY, rxW, rxH, 28);
    ctx.stroke();
    ctx.restore();

    var labelY = rxY + (rxH - labelH) / 2;
    ctx.fillStyle = PINK;
    roundRect(ctx, rxX + 24, labelY, labelW, labelH, 8);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    roundRect(ctx, rxX + 24, labelY, labelW, labelH, 8);
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '400 25px ' + PIX;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('효능', rxX + 24 + labelW / 2, labelY + labelH / 2 + 2);

    ctx.fillStyle = '#3B3550';
    ctx.font = '400 30px ' + TXT;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    var blockH = 30 + (rxLines.length - 1) * 44;
    var firstBaseline = rxY + (rxH - blockH) / 2 + 25;
    rxLines.forEach(function (ln, i) {
      ctx.fillText(ln, textX, firstBaseline + i * 44);
    });

    /* ── 맨 아래 보너스 띠 ── */
    var bandY = 1216, bandH = 56, bandW = rxW;
    ctx.fillStyle = BUTTER;
    roundRect(ctx, rxX, bandY, bandW, bandH, 16);
    ctx.fill();
    ctx.save();
    ctx.setLineDash([9, 7]);
    ctx.strokeStyle = 'rgba(36, 31, 51, .16)';
    ctx.lineWidth = 3;
    roundRect(ctx, rxX, bandY, bandW, bandH, 16);
    ctx.stroke();
    ctx.restore();

    ctx.font = '400 20px ' + PIX;
    letterSpacing(ctx, '1px');
    var labTxt = '보너스';
    var labW2 = ctx.measureText(labTxt).width + 22;
    ctx.fillStyle = INK;
    roundRect(ctx, rxX + 16, bandY + 12, labW2, 32, 6);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labTxt, rxX + 16 + labW2 / 2, bandY + 29);
    letterSpacing(ctx, '0px');

    ctx.font = '400 23px ' + TXT;
    ctx.fillStyle = '#2E2840';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(B.line, rxX + 16 + labW2 + 14, bandY + 30);

    /* ── 하단 주소 ── */
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '400 22px ' + TXT;
    ctx.fillStyle = 'rgba(36, 31, 51, .42)';
    ctx.fillText('soosoosupernova.github.io/2027-talisman', 540, 1322);
  }

  function drawBonusCard(img) {
    var cv = $('cardCanvas');
    cv.width = 1080;
    cv.height = 1350;
    var ctx = cv.getContext('2d');
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    paintBg(ctx, cv.width, cv.height);
    paintBonusPanel(ctx, img);
    return cv;
  }

  function canvasToBlob(cv) {
    return new Promise(function (resolve, reject) {
      if (cv.toBlob) {
        cv.toBlob(function (b) { b ? resolve(b) : reject(new Error('blob')); }, 'image/png');
      } else {
        reject(new Error('no toBlob'));
      }
    });
  }

  var previewUrl = null;

  function showPreview(url, cap) {
    if (previewUrl && previewUrl.indexOf('blob:') === 0) { URL.revokeObjectURL(previewUrl); }
    previewUrl = url;
    $('savePreviewImg').src = url;
    $('savePreviewCap').textContent = cap;
    $('saveTip').hidden = !IN_APP;
    $('savePreview').hidden = false;
    try { $('savePreview').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
  }

  /* 카톡·인스타 인앱 웹뷰는 blob: 주소 그림을 길게 눌러도 저장을 못 한다.
     미리보기에는 그림을 통째로 품은 data: 주소를 넣어 웹뷰가 바로 저장하게 한다. */
  function toDataUrl(cv) {
    try {
      var u = cv.toDataURL('image/png');
      return u && u.indexOf('data:image/png') === 0 ? u : '';
    } catch (e) {
      return '';
    }
  }

  function downloadBlob(url, fname) {
    var a = document.createElement('a');
    a.href = url;
    a.download = fname;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /* 미리보기 이미지를 띄우는 같은 자리를 모든 저장 경로가 같이 쓴다. */
  function deliverCard(cv, fname, doneMsg) {
    if (IN_APP) {
      var dataUrl = toDataUrl(cv);
      if (dataUrl) {
        showPreview(dataUrl, '이미지를 길게 눌러 저장해주세요.');
        $('statusMsg').textContent = '';
        return Promise.resolve();
      }
      return canvasToBlob(cv).then(function (blob) {
        showPreview(URL.createObjectURL(blob), '이미지를 길게 눌러 저장해주세요.');
        $('statusMsg').textContent = '';
      });
    }

    return canvasToBlob(cv).then(function (blob) {
      var url = URL.createObjectURL(blob);
      try {
        downloadBlob(url, fname);
        $('statusMsg').textContent = doneMsg;
        setTimeout(function () { URL.revokeObjectURL(url); }, 20000);
      } catch (e) {
        showPreview(url, '저장이 막혔어요. 이미지를 길게 눌러 저장해주세요.');
        $('statusMsg').textContent = '';
      }
    });
  }

  function saveImage(kind) {
    if (state.busy) { return; }
    var bonus = kind === 'bonus';
    var t = bonus ? D.BONUS : state.type;
    if (!t) { return; }
    var btn = bonus ? $('bonusSaveBtn') : (kind === 'square' ? $('profileBtn') : $('saveBtn'));
    state.busy = true;
    btn.disabled = true;
    $('statusMsg').textContent = '카드를 만드는 중이에요.';
    $('savePreview').hidden = true;

    var fname = '2027-talisman-' + (bonus ? 'bonus' : t.id)
      + (kind === 'square' ? '-profile' : '') + '.png';
    var doneMsg = bonus
      ? '복실양 부적을 저장했어요. (1080×1350)'
      : (kind === 'square' ? '프사용 이미지를 저장했어요. (1080×1080)' : '카드를 저장했어요. (1080×1350)');

    var jobs = [loadImg(IMG + t.img), fontsReady()];
    if (!bonus) { jobs.push(loadImg(IMG + D.GUARDIAN.img)); }

    Promise.all(jobs)
      .then(function (res) {
        var cv = bonus ? drawBonusCard(res[0]) : drawCard(kind, t, res[0], res[2]);
        return deliverCard(cv, fname, doneMsg);
      })
      .catch(function () {
        $('statusMsg').textContent = '카드를 만들지 못했어요. 한 번 더 눌러주세요.';
      })
      .then(function () {
        state.busy = false;
        btn.disabled = false;
      });
  }

  /* ───────── 이벤트 ───────── */
  $('startBtn').addEventListener('click', beginQuiz);

  $('yearInput').addEventListener('input', onYearInput);
  $('yearInput').addEventListener('blur', onYearInput);

  $('opts').addEventListener('click', function (e) {
    var el = e.target;
    while (el && el !== this && !el.classList.contains('opt')) { el = el.parentNode; }
    if (!el || el === this || state.busy) { return; }
    state.busy = true;
    el.classList.add('chosen');
    setTimeout(function () {
      state.busy = false;
      answer(el);
    }, 120);
  });

  $('backBtn').addEventListener('click', function () {
    if (state.idx === 0) { resetToIntro(); return; }
    state.idx -= 1;
    renderQ();
  });

  $('restartBtn').addEventListener('click', resetToIntro);
  $('againBtn').addEventListener('click', resetToIntro);

  $('saveBtn').addEventListener('click', function () { saveImage('card'); });
  $('profileBtn').addEventListener('click', function () { saveImage('square'); });
  $('bonusSaveBtn').addEventListener('click', function () { saveImage('bonus'); });
  $('bonusBtn').addEventListener('click', function () {
    $('bonusPanel').hidden = false;
    $('bonusBtn').setAttribute('aria-expanded', 'true');
    $('savePreview').hidden = true;
    $('statusMsg').textContent = '';
    try { $('bonusPanel').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
  });
  $('bonusClose').addEventListener('click', function () {
    $('bonusPanel').hidden = true;
    $('bonusBtn').setAttribute('aria-expanded', 'false');
  });
  $('shareBtn').addEventListener('click', openShare);
  $('copyBtn').addEventListener('click', function () {
    copyText($('shareUrl').value).then(function (ok) {
      $('statusMsg').textContent = ok ? '공유 링크를 복사했어요.' : '위 칸을 길게 눌러 복사해 주세요.';
    });
  });
  $('closePreview').addEventListener('click', function () {
    $('savePreview').hidden = true;
  });

  $('mineBtn').addEventListener('click', beginQuiz);

  /* ───────── 시작 ───────── */
  function readLink() {
    var q;
    try { q = new URLSearchParams(location.search || ''); } catch (e) { return null; }
    var t = D.byId(q.get('type') || '');
    if (!t) { return null; }
    var y = String(q.get('y') || '').trim();
    return { type: t, year: D.validYear(y) ? y : '' };
  }

  (function init() {
    onYearInput();
    var link = readLink();
    if (link) {
      state.year = link.year;
      $('yearInput').value = link.year;
      onYearInput();
      paint(link.type);
      setMode('friend');
      return;
    }
    show('intro');
  })();
})();
