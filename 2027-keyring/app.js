/* 2027 행운 키링 & 포춘부적 — 플로우와 카드 PNG */
(function () {
  'use strict';

  var D = KEYRING_DATA;
  var FONT = '"Pretendard Variable", Pretendard, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';

  var state = { year: 0, preSeol: false, answers: [], qi: 0, taps: 0, type: null, zodiac: '' };

  function $(id) { return document.getElementById(id); }
  var SCREENS = ['s-intro', 's-year', 's-quiz', 's-cookie', 's-result'];

  function show(id) {
    SCREENS.forEach(function (sid) {
      var node = $(sid);
      if (!node) { return; }
      var on = sid === id;
      node.hidden = !on;
      node.classList.toggle('is-on', on);
    });
    try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch (e) { window.scrollTo(0, 0); }
    try { if (history.replaceState) { history.replaceState(null, '', '#' + id.slice(2)); } } catch (e) {}
  }

  /* ---------------- 인트로 ---------------- */
  $('introStart').addEventListener('click', function () {
    show('s-year');
    var input = $('yearInput');
    setTimeout(function () { try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); } }, 60);
  });

  /* ---------------- 태어난 해 ---------------- */
  var yearInput = $('yearInput');
  var preSeol = $('preSeol');
  var yearHint = $('yearHint');
  var yearErr = $('yearErr');
  var preText = $('preSeolText');
  var HINT_BASE = '1~2월생이라면 설날을 기준으로 띠가 달라져요. 설날 전에 태어났다면 아래를 켜주세요.';

  function readYear() {
    var raw = (yearInput.value || '').replace(/[^0-9]/g, '').slice(0, 4);
    if (raw !== yearInput.value) { yearInput.value = raw; }
    var n = raw ? parseInt(raw, 10) : 0;
    return (n >= D.YEAR_MIN && n <= D.YEAR_MAX) ? n : 0;
  }

  function maskYear() {
    var y = readYear();
    if (!y) {
      yearHint.innerHTML = HINT_BASE;
      preText.textContent = '해당 연도 설날 전에 태어났어요';
      yearInput.removeAttribute('aria-invalid');
      return;
    }
    var seol = D.seolLabel(y);
    var prev = D.zodiacOf(y - 1);
    if (seol) {
      yearHint.innerHTML = y + '년 설날은 <b>' + seol + '</b>이에요. 그 전에 태어났다면 띠는 ' + prev + '예요.';
      preText.textContent = y + '년 설날(' + seol + ') 전에 태어났어요';
    } else {
      yearHint.innerHTML = HINT_BASE;
      preText.textContent = y + '년 설날 전에 태어났어요';
    }
  }

  yearInput.addEventListener('input', function () { yearErr.textContent = ''; maskYear(); });
  preSeol.addEventListener('change', maskYear);

  $('yearBack').addEventListener('click', function () { show('s-intro'); });

  $('yearNext').addEventListener('click', function () {
    var y = readYear();
    if (!y) {
      yearInput.setAttribute('aria-invalid', 'true');
      yearErr.textContent = '태어난 해를 다시 확인해주세요. ' + D.YEAR_MIN + '년부터 ' + D.YEAR_MAX + '년까지 넣을 수 있어요.';
      yearInput.focus();
      return;
    }
    yearInput.removeAttribute('aria-invalid');
    state.year = y;
    state.preSeol = preSeol.checked;
    state.zodiac = D.zodiacOf(state.preSeol ? y - 1 : y);
    state.answers = [];
    state.qi = 0;
    renderQ();
    show('s-quiz');
  });

  /* ---------------- 질문 ---------------- */
  var qNext = document.createElement('button');
  qNext.type = 'button';
  qNext.className = 'btn primary';
  qNext.id = 'qNext';
  qNext.textContent = '쿠키 깨러 가기';
  qNext.hidden = true;
  $('s-quiz').appendChild(qNext);
  qNext.addEventListener('click', function () {
    state.taps = 0;
    renderCookie();
    show('s-cookie');
  });

  function renderQ() {
    var i = state.qi;
    var q = D.QUESTIONS[i];
    $('qText').textContent = q.q;
    $('qCount').textContent = (i + 1) + ' / 6';
    var bar = $('qBarWrap');
    bar.setAttribute('aria-valuenow', String(i + 1));
    $('qBar').style.width = Math.round(((i + 1) / 6) * 100) + '%';
    $('qPrev').disabled = false;
    qNext.hidden = true;

    var opts = $('qOpts');
    opts.innerHTML = '';
    [['a', q.a], ['b', q.b]].forEach(function (pair) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.setAttribute('data-choice', pair[0]);
      var mark = document.createElement('span');
      mark.className = 'dotmark';
      mark.setAttribute('aria-hidden', 'true');
      var txt = document.createElement('span');
      txt.textContent = pair[1];
      b.appendChild(mark);
      b.appendChild(txt);
      if (state.answers[i] === pair[0]) { b.classList.add('picked'); }
      b.addEventListener('click', function () { pick(pair[0]); });
      opts.appendChild(b);
    });
  }

  function pick(choice) {
    state.answers[state.qi] = choice;
    Array.prototype.forEach.call($('qOpts').children, function (b) {
      b.classList.toggle('picked', b.getAttribute('data-choice') === choice);
    });
    if (state.qi < 5) {
      setTimeout(function () {
        state.qi += 1;
        renderQ();
      }, 190);
    } else {
      qNext.hidden = false;
      qNext.focus({ preventScroll: true });
    }
  }

  $('qPrev').addEventListener('click', function () {
    if (state.qi === 0) { show('s-year'); return; }
    state.qi -= 1;
    renderQ();
  });

  /* ---------------- 점수 → 유형 ---------------- */
  function computeType() {
    var sums = [0, 0, 0];
    D.QUESTIONS.forEach(function (q, i) {
      var c = state.answers[i];
      var v = q.weight * (c === 'a' ? 1 : -1);
      sums[q.axis] += v;
    });
    var key = sums.map(function (s) { return s > 0 ? '1' : '-1'; }).join(',');
    return { key: key, sums: sums, type: D.TYPES[key] };
  }

  function axisLabels(sums) {
    return sums.map(function (s, i) { return D.AXIS_LABEL[i][s > 0 ? 0 : 1]; });
  }

  /* ---------------- 포춘쿠키 ---------------- */
  var cookieStage, cookieBtn, cookieHint, cookiePaper, cookieNext;

  function renderCookie() {
    cookieStage = $('cookieStage') || document.querySelector('.cookie-stage');
    cookieBtn = $('cookieBtn');
    cookieHint = $('cookieHint');
    cookiePaper = $('cookiePaper');
    cookieNext = $('cookieNext');
    cookieStage.className = 'cookie-stage';
    Array.prototype.forEach.call($('tapDots').children, function (d) { d.classList.remove('on'); });
    cookieHint.textContent = '쿠키를 세 번 톡톡 눌러주세요.';
    cookiePaper.hidden = true;
    cookieNext.hidden = true;
    cookieBtn.disabled = false;
    $('zodiacLine').textContent = '';
  }

  function tapCookie() {
    if (state.taps >= 3) { return; }
    state.taps += 1;
    var n = state.taps;
    cookieStage.classList.remove('shake1', 'shake2');
    void cookieStage.offsetWidth;
    if (n === 1) {
      cookieStage.classList.add('t1', 'shake1');
      cookieHint.textContent = '한 번 더!';
    } else if (n === 2) {
      cookieStage.classList.remove('t1');
      cookieStage.classList.add('t2', 'shake2');
      cookieHint.textContent = '마지막 한 번!';
    } else {
      cookieStage.classList.remove('t1', 't2');
      cookieStage.classList.add('t3');
      cookieHint.textContent = '쿠키가 딱 갈라졌어요. 안에서 종이 한 장이 나왔어요.';
      $('zodiacLine').textContent = D.ZODIAC_LINE[state.zodiac] || '';
      cookiePaper.hidden = false;
      cookieNext.hidden = false;
      cookieBtn.disabled = true;
      try { cookieNext.focus({ preventScroll: true }); } catch (e) {}
    }
    var dots = $('tapDots').children;
    for (var i = 0; i < dots.length; i += 1) { dots[i].classList.toggle('on', i < n); }
  }

  $('cookieBtn').addEventListener('click', tapCookie);

  $('cookieNext').addEventListener('click', function () {
    var btn = $('cookieNext');
    var res = computeType();
    state.type = res.type;
    state.sums = res.sums;
    btn.disabled = true;
    btn.textContent = '행운 키링을 만드는 중이에요';
    preload(state.type.img);
    setTimeout(function () {
      btn.disabled = false;
      btn.textContent = '내 키링 보기';
      fillResult();
      show('s-result');
    }, 480);
  });

  var preloaded = {};
  function preload(name) {
    if (preloaded[name]) { return preloaded[name]; }
    var img = new Image();
    img.src = 'assets/characters/' + name + '.webp';
    preloaded[name] = img;
    return img;
  }

  /* ---------------- 결과 ---------------- */
  function fillResult() {
    var t = state.type;
    var am = D.AMULETS[t.amulet];
    var labels = axisLabels(state.sums);

    $('resTypeName').textContent = t.name;
    $('resZodiac').textContent = state.zodiac;
    $('resImg').src = 'assets/characters/' + t.img + '.webp';
    $('resImg').alt = t.name + ' 캐릭터 — ' + t.head + '와 ' + t.charm + ' 참';
    $('resLine').textContent = t.line;
    $('resMeta').textContent = t.head + '를 쓴 캐릭터 · ' + t.charm + ' 참 · ' + t.strap + ' 스트랩';

    var chips = $('resChips');
    chips.innerHTML = '';
    labels.forEach(function (l) {
      var li = document.createElement('li');
      li.textContent = l;
      chips.appendChild(li);
    });

    $('resDesc').textContent = t.desc;
    $('resCharm').textContent = t.charm;
    $('resStrap').textContent = t.strap;
    $('resSwatch').style.background = t.strapHex;
    $('resFortune').textContent = D.ZODIAC_LINE[state.zodiac] || '';

    var card = $('amuletCard');
    card.style.setProperty('--abg', am.bg);
    card.style.setProperty('--aline', am.line);
    card.style.setProperty('--aink', am.ink);
    $('amuletName').textContent = am.name;
    $('amuletPrint').textContent = t.print;
    $('amuletTip').textContent = t.tip;

    $('statusMsg').textContent = '';
    $('savePreview').hidden = true;
  }

  function shareText() {
    var t = state.type;
    var am = D.AMULETS[t.amulet];
    return '2027 행운 키링 뽑았어요\n' +
      '나는 ' + t.name + ' · ' + state.zodiac + '\n\n' +
      t.name + ' — ' + t.line + '\n\n' +
      '포춘쿠키 한 마디\n' + (D.ZODIAC_LINE[state.zodiac] || '') + '\n\n' +
      '소원 부적: ' + am.name + ' — ' + t.print + '\n\n' +
      '나도 뽑기: soosoosupernova.github.io/2027-keyring';
  }

  /* ---------------- 복사 ---------------- */
  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  $('copyBtn').addEventListener('click', function () {
    var text = shareText();
    var done = function () { $('statusMsg').textContent = '문구를 복사했어요.'; };
    var fail = function () { $('statusMsg').textContent = '복사가 안 됐어요. 문구를 직접 골라 복사해주세요.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {
        if (legacyCopy(text)) { done(); } else { fail(); }
      });
    } else if (legacyCopy(text)) { done(); } else { fail(); }
  });

  /* ---------------- 카드 PNG ---------------- */
  var W = 1080, H = 1350;

  function fontsReady() {
    if (!document.fonts || !document.fonts.load) { return Promise.resolve(); }
    var jobs = [
      '400 30px "Pretendard Variable"',
      '600 30px "Pretendard Variable"',
      '700 40px "Pretendard Variable"',
      '800 40px "Pretendard Variable"'
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

  function wrap(ctx, text, maxW, maxLines) {
    /* 단어(띄어쓰기) 단위로 줄을 바꾸고, 단어가 한 줄보다 길 때만 글자로 자른다 */
    var out = [], line = '';
    var words = String(text).split(' ');
    for (var w = 0; w < words.length; w += 1) {
      var word = words[w];
      if (ctx.measureText(word).width > maxW) {
        for (var i = 0; i < word.length; i += 1) {
          var t2 = line + word[i];
          if (ctx.measureText(t2).width > maxW && line) { out.push(line); line = word[i]; }
          else { line = t2; }
        }
        continue;
      }
      var test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        out.push(line);
        line = word;
      } else {
        line = test;
      }
      if (maxLines && out.length >= maxLines) { break; }
    }
    if (line && (!maxLines || out.length < maxLines)) { out.push(line); }
    if (maxLines) { out = out.slice(0, maxLines); }
    /* 마지막 줄에 한 글자만 남으면 앞 줄에서 한 단어를 내려 균형을 맞춘다 */
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

  function drawCard(img) {
    var t = state.type;
    var am = D.AMULETS[t.amulet];
    var cv = $('cardCanvas');
    cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    /* 배경 */
    ctx.fillStyle = '#FFFBF3';
    ctx.fillRect(0, 0, W, H);
    function blob(cx, cy, r, color) {
      var g = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(255,251,243,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
    blob(70, -30, 520, 'rgba(255,214,226,.95)');
    blob(1050, 90, 460, 'rgba(226,216,255,.95)');
    blob(560, 1400, 620, 'rgba(206,232,255,.85)');
    ctx.fillStyle = 'rgba(46,43,72,.07)';
    for (var gx = 30; gx < W; gx += 36) {
      for (var gy = 30; gy < H; gy += 36) {
        ctx.beginPath(); ctx.arc(gx, gy, 1.6, 0, Math.PI * 2); ctx.fill();
      }
    }

    /* 카드 패널 */
    var M = 44, PW = W - M * 2, PH = H - M * 2;
    ctx.fillStyle = 'rgba(46,43,72,.12)';
    roundRect(ctx, M + 10, M + 12, PW, PH, 48); ctx.fill();
    ctx.fillStyle = '#FFFDFA';
    roundRect(ctx, M, M, PW, PH, 48); ctx.fill();
    ctx.strokeStyle = '#2E2B48'; ctx.lineWidth = 5;
    roundRect(ctx, M + 2.5, M + 2.5, PW - 5, PH - 5, 46); ctx.stroke();

    ctx.save();
    ctx.setLineDash([13, 11]);
    ctx.strokeStyle = am.line;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 3;
    roundRect(ctx, M + 20, M + 20, PW - 40, PH - 40, 34); ctx.stroke();
    ctx.restore();

    /* 마스킹 테이프 */
    function tape(x, y, w, h, color, angle) {
      ctx.save();
      ctx.translate(x, y); ctx.rotate(angle);
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,.75)';
      ctx.setLineDash([8, 7]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-w / 2 + 8, -h / 2 + 5); ctx.lineTo(w / 2 - 8, -h / 2 + 5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-w / 2 + 8, h / 2 - 5); ctx.lineTo(w / 2 - 8, h / 2 - 5); ctx.stroke();
      ctx.restore();
    }
    tape(M + 128, M + 4, 124, 34, 'rgba(255,190,209,.95)', -0.16);
    tape(W - M - 128, H - M - 4, 118, 32, 'rgba(189,222,255,.95)', 0.14);

    /* 상단 라벨 */
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(46,43,72,.55)';
    ctx.font = '700 25px ' + FONT;
    if ('letterSpacing' in ctx) { ctx.letterSpacing = '5px'; }
    ctx.fillText('2027 행운 키링', W / 2, M + 96);
    if ('letterSpacing' in ctx) { ctx.letterSpacing = '0px'; }

    /* 유형명 + 띠 */
    var nameTxt = t.name + ' · ' + state.zodiac;
    var size = 62;
    ctx.font = '800 ' + size + 'px ' + FONT;
    while (ctx.measureText(nameTxt).width > PW - 120 && size > 34) {
      size -= 2;
      ctx.font = '800 ' + size + 'px ' + FONT;
    }
    var nameW = ctx.measureText(t.name).width;
    var zodW = ctx.measureText(' · ' + state.zodiac).width;
    var startX = W / 2 - (nameW + zodW) / 2;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#2E2B48';
    ctx.fillText(t.name, startX, M + 178);
    ctx.fillStyle = '#C93E54';
    ctx.fillText(' · ' + state.zodiac, startX + nameW, M + 178);

    /* 캐릭터 */
    var cx = W / 2, cy = M + 470, r = 232;
    var bg = ctx.createRadialGradient(cx, cy - 30, 30, cx, cy, r);
    bg.addColorStop(0, '#FFF1F5');
    bg.addColorStop(0.65, '#FDEAF1');
    bg.addColorStop(1, '#F9EADF');
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 6; ctx.stroke();
    if (img && img.complete && img.naturalWidth) {
      var side = 492;
      ctx.save();
      ctx.shadowColor = 'rgba(46,43,72,.16)';
      ctx.shadowBlur = 26;
      ctx.shadowOffsetY = 12;
      ctx.drawImage(img, cx - side / 2, cy - side / 2 - 6, side, side);
      ctx.restore();
    }

    /* 한 줄 소개 */
    ctx.textAlign = 'center';
    ctx.font = '800 33px ' + FONT;
    ctx.fillStyle = '#2E2B48';
    var lines = wrap(ctx, t.line, PW - 170, 2);
    lines.forEach(function (ln, i) {
      ctx.fillText(ln, W / 2, M + 760 + i * 46);
    });

    /* 구분선 */
    var divY = M + 830 + (lines.length - 1) * 46;
    ctx.save();
    ctx.setLineDash([3, 9]);
    ctx.strokeStyle = 'rgba(46,43,72,.28)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(M + 96, divY); ctx.lineTo(W - M - 96, divY); ctx.stroke();
    ctx.restore();

    /* 부적 */
    var aw = 204, ah = 232, ax = M + 78, ay = divY + 72;
    ctx.fillStyle = 'rgba(46,43,72,.10)';
    roundRect(ctx, ax + 6, ay + 8, aw, ah, 16); ctx.fill();
    ctx.fillStyle = am.bg;
    roundRect(ctx, ax, ay, aw, ah, 16); ctx.fill();
    ctx.strokeStyle = am.line; ctx.lineWidth = 4;
    roundRect(ctx, ax + 2, ay + 2, aw - 4, ah - 4, 15); ctx.stroke();
    ctx.save();
    ctx.setLineDash([7, 6]);
    ctx.strokeStyle = am.ink; ctx.globalAlpha = 0.4; ctx.lineWidth = 2;
    roundRect(ctx, ax + 14, ay + 14, aw - 28, ah - 28, 9); ctx.stroke();
    ctx.restore();

    ctx.fillStyle = am.ink;
    ctx.textAlign = 'center';
    ctx.font = '800 20px ' + FONT;
    ctx.fillText(am.name, ax + aw / 2, ay + 52);
    ctx.font = '800 24px ' + FONT;
    var pLines = wrap(ctx, t.print, aw - 42, 3);
    pLines.forEach(function (ln, i) {
      ctx.fillText(ln, ax + aw / 2, ay + 96 + i * 36);
    });

    /* 포춘 한 마디 */
    var tx = ax + aw + 44, tw = W - M - 78 - tx;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#C93E54';
    ctx.font = '800 20px ' + FONT;
    if ('letterSpacing' in ctx) { ctx.letterSpacing = '2px'; }
    ctx.fillText('포춘쿠키 한 마디', tx, ay + 26);
    if ('letterSpacing' in ctx) { ctx.letterSpacing = '0px'; }
    ctx.fillStyle = '#2E2B48';
    ctx.font = '600 26px ' + FONT;
    var zLines = wrap(ctx, D.ZODIAC_LINE[state.zodiac] || '', tw, 7);
    zLines.forEach(function (ln, i) {
      ctx.fillText(ln, tx, ay + 76 + i * 40);
    });

    /* 푸터 */
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(46,43,72,.48)';
    ctx.font = '600 21px ' + FONT;
    ctx.fillText('수수수 웹툴 · soosoosupernova.github.io/2027-keyring', W / 2, H - M - 46);

    return cv;
  }

  var IN_APP = /KAKAOTALK|Instagram|FBAN|FBAV|NAVER\(inapp|Line\/\d|DaumApps|BAND\//i.test(navigator.userAgent)
    || /[?&]qa_inapp=1/.test(location.search || '');

  function canvasToBlob(cv) {
    return new Promise(function (resolve, reject) {
      if (cv.toBlob) { cv.toBlob(function (b) { b ? resolve(b) : reject(new Error('blob')); }, 'image/png'); }
      else { reject(new Error('no toBlob')); }
    });
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

  function showPreview(url, cap) {
    $('savePreviewImg').src = url;
    var p = $('savePreview').querySelector('p');
    if (p && cap) { p.textContent = cap; }
    var tip = $('saveTip');
    if (tip) { tip.hidden = !IN_APP; }
    $('savePreview').hidden = false;
    $('statusMsg').textContent = '';
    try { $('savePreview').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
  }

  /* 미리보기를 띄우는 같은 자리를 모든 저장 경로가 같이 쓴다. */
  function deliverCard(cv, fname, doneMsg) {
    if (IN_APP) {
      var dataUrl = toDataUrl(cv);
      if (dataUrl) {
        showPreview(dataUrl, '이미지를 길게 눌러 저장해주세요.');
        return Promise.resolve();
      }
      return canvasToBlob(cv).then(function (blob) {
        showPreview(URL.createObjectURL(blob), '이미지를 길게 눌러 저장해주세요.');
      });
    }

    return canvasToBlob(cv).then(function (blob) {
      var url = URL.createObjectURL(blob);
      try {
        var a = document.createElement('a');
        a.href = url;
        a.download = fname;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        $('statusMsg').textContent = doneMsg;
        setTimeout(function () { URL.revokeObjectURL(url); }, 20000);
      } catch (e) {
        showPreview(url, '저장이 막혔어요. 이미지를 길게 눌러 저장해주세요.');
      }
    });
  }

  $('saveBtn').addEventListener('click', function () {
    var btn = $('saveBtn');
    var t = state.type;
    if (!t) { return; }
    btn.disabled = true;
    $('statusMsg').textContent = '카드를 만드는 중이에요.';
    $('savePreview').hidden = true;
    var img = preload(t.img);
    var ready = (img.complete && img.naturalWidth) ? Promise.resolve() : new Promise(function (res) {
      img.onload = res; img.onerror = res;
    });
    fontsReady().then(function () { return ready; }).then(function () {
      return deliverCard(drawCard(img), '2027-keyring-' + t.id + '-' + state.zodiac + '.png', '카드를 저장했어요.');
    }).catch(function () {
      $('statusMsg').textContent = '저장이 안 됐어요. 한 번 더 눌러주세요.';
    }).then(function () { btn.disabled = false; });
  });

  $('restartBtn').addEventListener('click', function () {
    state = { year: 0, preSeol: false, answers: [], qi: 0, taps: 0, type: null, zodiac: '', sums: [0, 0, 0] };
    yearInput.value = '';
    preSeol.checked = false;
    yearErr.textContent = '';
    maskYear();
    show('s-intro');
  });

  /* ---------------- 시작 상태 ---------------- */
  maskYear();
  var hash = (location.hash || '').replace('#', '');
  if (hash === 'year') { show('s-year'); }
})();
