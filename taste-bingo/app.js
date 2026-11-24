/* 2026 나의 취향 빙고 — 제작 · 공유 · 친구 참여 · 카드 PNG */
(function () {
  'use strict';

  var CATS = window.TB_CATS || [];
  var MAX = 16;
  var MIN = 4;
  var SMALL_MAX = 9;    // 9개 이하 → 3×3, 10개 이상 → 4×4
  var PER_PAGE = 10;    // 카테고리마다 한 페이지에 보이는 칩 수
  var COLORS = ['#FCE2EC', '#EFE5FA', '#FFF5D1', '#DFF5EB', '#E2F2FC', '#FFE9E4', '#FFE2CE', '#E8F4D8', '#F2E3F7'];
  var HEART_ICON = '<svg class="i i-heart"><use href="#px-heart"/></svg>';
  var X_ICON = '<svg class="i i-x"><use href="#px-x"/></svg>';

  /* 칸 픽셀 아이콘 — 주제마다 전용 풀 (다른 주제 칸과 절대 겹치지 않음)
     ICON_MAP 은 work/taste_icon_map.json 에서 생성해 주입한다. */
  var ICON_MAP = {"cats":{"food":{"pool":["sp-cake","sp-berry","sp-donut","sp-soda","sp-pop"],"rules":[["도넛","sp-donut"],["라떼|커피|주스|요아정|음료","sp-soda"],["과일|후르츠|딸기|베리","sp-berry"],["산도|젤리|아이스|과자","sp-pop"],["떡|모찌|약과|카스테라|호떡|타르트|마카롱|푸딩|인절미|빵|붕|케이크","sp-cake"]]},"music":{"pool":["sp-cd-rose","sp-lp-sky","sp-cd-lav","sp-lp-rose","sp-cd-mint","sp-lp-lemon","sp-cd-lemon","sp-lp-lav","sp-cd-sky","sp-lp-mint"],"rules":[],"fix":{"최유리":"sp-cd-rose","A2O LITE":"sp-lp-sky","악동뮤지션":"sp-cd-lav","Cortis":"sp-lp-rose"}},"content":{"pool":["sp-tv","sp-film","sp-popcorn","sp-bubble"],"rules":[["웹툰|만화|참교육|꿀알바|들쥐","sp-bubble"],["쇼미|나는솔로|데블스|캠프|기안장|솔로지옥|커뮤니티|치이카와","sp-tv"],["요리|쿡방|먹방|흑백요리사","sp-popcorn"],["재혼|동궁|닥터|유미|통역|두아|전설|신세계|황후","sp-film"]]},"place":{"pool":["sp-pin","sp-mountain","sp-wave","sp-globe","sp-rainbow"],"rules":[["산|등산|관악","sp-mountain"],["한강|바다|캠핑|계곡","sp-wave"],["놀이공원|축제","sp-rainbow"],["포장마차|시장|카페|노래방|야구장|완구거리|만화방|사우나|찜질방|거리","sp-pin"],["박물관|국중박|미술관|전시|궁궐|봉은사|서점","sp-globe"]]},"hobby":{"pool":["sp-note","sp-book","sp-dumbbell","sp-palette","sp-gamepad"],"rules":[["러닝|요가|필라테스|수영|클라이밍|등산|산책|운동","sp-dumbbell"],["독서|사주|타로|명상","sp-book"],["베이킹|뜨개질|요리|그림|그리기","sp-palette"],["보드게임|인형뽑기|말랑이|게임","sp-gamepad"],["글쓰기|다꾸|사진|일기","sp-note"]]},"happy":{"pool":["sp-star","sp-sparkle","sp-cloud","sp-moon"],"rules":[["야호|럭키|반짝|빛","sp-sparkle"],["구름|쉬었음|명상|절","sp-cloud"],["달|밤|꿈","sp-moon"],["별|갓생","sp-star"]]},"delivery":{"pool":["sp-chicken","sp-pizza","sp-bowl","sp-sushi","sp-dumpling"],"rules":[["피자|햄버거","sp-pizza"],["치킨|돈까스|타코야키","sp-chicken"],["마라탕|쌀국수|우동|라면|찌개|쭈꾸미|곱창|떡","sp-bowl"],["초밥|회|육회|포케|샐러드","sp-sushi"],["족발|보쌈|타코|만두","sp-dumpling"]]},"shopping":{"pool":["sp-phones","sp-mug","sp-shopbag","sp-perfume","sp-hanger","sp-keyboard","sp-sneaker"],"rules":[["헤드폰|스피커|보조배터리","sp-phones"],["키보드|마우스","sp-keyboard"],["텀블러","sp-mug"],["향수|립밤|핸드크림|캔들","sp-perfume"],["패딩|잠옷|모자|머플러","sp-hanger"],["운동화","sp-sneaker"],["가방|파우치|키링|인형|다이어리","sp-shopbag"]]},"mood":{"pool":["sp-ribbon","sp-butterfly","sp-flower","sp-cassette","sp-glasses"],"rules":[["러블리","sp-ribbon"],["몽글|산책","sp-butterfly"],["내추럴|코지|따뜻","sp-flower"],["빈티지|레트로|Y2K","sp-cassette"],["미니멀|시크|쿨톤|너드|아카이브","sp-glasses"]]}},"head":{"food":"sp-cake","music":"sp-cd","content":"sp-tv","place":"sp-globe","hobby":"sp-note","happy":"sp-heart","delivery":"sp-chicken","shopping":"sp-shopbag","mood":"sp-butterfly"}};
  var CAT_ICONS = ICON_MAP.cats || {};
  /* 아코디언 머리 아이콘 */
  var SPRITE_CAT = ICON_MAP.head || {};
  var RE_CACHE = {};

  function catKey(cat) {
    var c = CATS[cat];
    return (c && c.id) || 'food';
  }

  function catSpec(cat) {
    return CAT_ICONS[catKey(cat)] || { pool: ['sp-heart'], rules: [] };
  }

  function ruleHit(pat, text) {
    var re = RE_CACHE[pat];
    if (!re) { re = RE_CACHE[pat] = new RegExp(pat); }
    return re.test(text);
  }

  function hashText(text) {
    var h = 2166136261;
    for (var i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h;
  }

  /* 키워드에 맞는 아이콘 (없으면 null) */
  function ruleFor(cat, label) {
    var rules = catSpec(cat).rules || [];
    var text = String(label || '');
    for (var i = 0; i < rules.length; i += 1) {
      if (ruleHit(rules[i][0], text)) { return rules[i][1]; }
    }
    return null;
  }

  /* 한 판 배정: 키워드가 정해 주는 아이콘은 그대로 쓰고,
     키워드가 없는 칸은 같은 주제 안에서 아직 안 쓴 아이콘부터 돌려 쓴다. */
  function assignIcons(cells) {
    var map = {};
    var usedBy = {};
    cells.forEach(function (cell, i) {
      if (cell.free) { return; }
      var key = catKey(cell.cat);
      var spec = catSpec(cell.cat);
      var pool = spec.pool || ['sp-heart'];
      var used = usedBy[key] || (usedBy[key] = {});
      var pick = (spec.fix && spec.fix[cell.label]) || ruleFor(cell.cat, cell.label);
      if (!pick) {
        var h = hashText(cell.label);
        for (var k = 0; k < pool.length; k += 1) {
          var id = pool[(h + k) % pool.length];
          if (!used[id]) { pick = id; break; }
        }
      }
      pick = pick || pool[hashText(cell.label) % pool.length];
      used[pick] = true;
      map[i] = pick;
    });
    return map;
  }

  function iconFor(cat, label, i) {
    if (state.iconOf && state.iconOf[i]) { return state.iconOf[i]; }
    return spriteFor(cat, label);
  }

  function spriteFor(cat, label) {
    var hit = ruleFor(cat, label);
    if (hit) { return hit; }
    var pool = catSpec(cat).pool || ['sp-heart'];
    return pool[hashText(label) % pool.length];
  }

  function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function iconSVG(id) {
    var sp = PXS[id];
    var vb = sp ? (sp.bx + ' ' + sp.by + ' ' + sp.bw + ' ' + sp.bh) : '0 0 16 16';
    return '<svg viewBox="' + vb + '" aria-hidden="true"><use href="#' + id + '"/></svg>';
  }

  /* 3×3은 가로·세로 3줄 + 대각선 2줄 = 8줄, 4×4는 10줄 */
  var LINE_CACHE = {};
  function linesFor(n) {
    if (LINE_CACHE[n]) { return LINE_CACHE[n]; }
    var L = [];
    var r, c, i, row, col;
    for (r = 0; r < n; r += 1) {
      row = [];
      for (c = 0; c < n; c += 1) { row.push(r * n + c); }
      L.push(row);
    }
    for (c = 0; c < n; c += 1) {
      col = [];
      for (r = 0; r < n; r += 1) { col.push(r * n + c); }
      L.push(col);
    }
    var d1 = [];
    var d2 = [];
    for (i = 0; i < n; i += 1) {
      d1.push(i * n + i);
      d2.push(i * n + (n - 1 - i));
    }
    L.push(d1);
    L.push(d2);
    LINE_CACHE[n] = L;
    return L;
  }

  function boardSizeFor(count) { return count <= SMALL_MAX ? 3 : 4; }

  function gridSize(cells) {
    var n = Math.round(Math.sqrt((cells || []).length));
    return (n === 3 || n === 4) ? n : 4;
  }

  function $(id) { return document.getElementById(id); }

  var state = {
    nick: '',
    sel: [],              // [{cat, label}] 고른 순서
    pool: CATS.map(function () { return 0; }),   // 카테고리별 칩 페이지 (0/1)
    custom: CATS.map(function () { return []; }),
    openCat: 0,
    cells: null,          // 내 빙고판 9칸 또는 16칸
    size: 4,              // 3 또는 4
    iconOf: {},           // 빙고판 칸별 아이콘 (플리 컬러 CD·LP)
    ownTapped: {},        // 내 판 FREE 칸 체크
    fnick: '',
    ftapped: {}           // 친구 참여 칸 (취향 칸 공감·FREE 칸 체크)
  };

  /* ================= 공통 ================= */

  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 2400);
  }

  function show(id) {
    ['s-maker', 's-board', 's-friend'].forEach(function (sid) {
      var el = $(sid);
      var on = sid === id;
      el.hidden = !on;
      el.classList.toggle('is-on', on);
    });
    $('topTag').textContent = id === 's-friend' ? '친구 참여' : (id === 's-board' ? '내 빙고판' : '취향 고르기');
    window.scrollTo(0, 0);
  }

  function clean(str) {
    return String(str || '').replace(/[|~<>\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function b64urlEncode(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    for (var i = 0; i < bytes.length; i += 1) { bin += String.fromCharCode(bytes[i]); }
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function b64urlDecode(s) {
    var t = String(s).replace(/-/g, '+').replace(/_/g, '/');
    while (t.length % 4) { t += '='; }
    var bin = atob(t);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i += 1) { bytes[i] = bin.charCodeAt(i); }
    return new TextDecoder().decode(bytes);
  }

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

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () {
        return legacyCopy(text);
      });
    }
    return Promise.resolve(legacyCopy(text));
  }

  /* ================= 아코디언 ================= */

  function renderAccs() {
    var wrap = $('accs');
    wrap.innerHTML = '';
    CATS.forEach(function (cat, ci) {
      var sec = document.createElement('section');
      sec.className = 'acc' + (state.openCat === ci ? ' open' : '');
      sec.innerHTML =
        '<div class="win-bar" aria-hidden="true" style="background:' + COLORS[ci % COLORS.length] + '">' +
          '<span class="win-hearts">' + HEART_ICON + HEART_ICON + HEART_ICON + '</span>' +
          '<span class="win-x">' + X_ICON + '</span>' +
        '</div>' +
        '<button class="acc-head" type="button" id="acc-head-' + ci + '" aria-expanded="' +
          (state.openCat === ci) + '" aria-controls="acc-body-' + ci + '">' +
          '<span class="acc-emoji" aria-hidden="true"><span class="acc-ico">' + iconSVG(SPRITE_CAT[cat.id]) + '</span></span>' +
          '<span class="acc-name">' + cat.name + '</span>' +
          '<span class="acc-count" id="acc-count-' + ci + '">0</span>' +
          '<span class="acc-arrow" aria-hidden="true">▾</span>' +
        '</button>' +
        '<div class="acc-body" id="acc-body-' + ci + '" role="region" aria-labelledby="acc-head-' + ci + '"' +
          (state.openCat === ci ? '' : ' hidden') + '>' +
          '<div class="chips" id="chips-' + ci + '"></div>' +
          '<div class="acc-tools">' +
            '<button class="more-btn" type="button" data-act="swap" data-cat="' + ci + '" id="swap-' + ci + '" aria-controls="chips-' + ci + '" aria-expanded="false">' +
              '<span class="more-badge" id="page-badge-' + ci + '">1/2</span>' +
              '<span class="more-txt" id="page-txt-' + ci + '">더 보기 <b>(+10개)</b></span>' +
              '<span class="more-arrow" aria-hidden="true">▾</span>' +
            '</button>' +
            '<button class="tool-btn" type="button" data-act="custom" data-cat="' + ci + '" id="custom-btn-' + ci + '" aria-expanded="false" aria-controls="custom-' + ci + '">＋ 직접 추가하기</button>' +
          '</div>' +
          '<div class="custom-box" id="custom-' + ci + '" hidden>' +
            '<label class="sr" for="custom-input-' + ci + '">나만의 취향 추가</label>' +
            '<div class="custom-row">' +
              '<input id="custom-input-' + ci + '" type="text" maxlength="12" placeholder="짧게 적어주세요 (12자까지)" autocomplete="off">' +
              '<button class="custom-add" type="button" data-act="customadd" data-cat="' + ci + '">추가</button>' +
            '</div>' +
            '<p class="custom-hint">12자까지, 한 번에 하나씩 담을 수 있어요.</p>' +
          '</div>' +
        '</div>';
      wrap.appendChild(sec);
      renderChips(ci);
    });
    syncSel();
  }

  function allChips(ci) {
    var p = CATS[ci].pools || [];
    return (p[0] || []).concat(p[1] || []);
  }

  function pageCount(ci) {
    return Math.max(1, Math.ceil(allChips(ci).length / PER_PAGE));
  }

  function renderChips(ci) {
    var box = $('chips-' + ci);
    if (!box) { return; }
    box.innerHTML = '';
    var pages = pageCount(ci);
    if (state.pool[ci] >= pages) { state.pool[ci] = 0; }
    var start = state.pool[ci] * PER_PAGE;
    var labels = allChips(ci).slice(start, start + PER_PAGE).concat(state.custom[ci]);
    labels.forEach(function (label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.dataset.cat = String(ci);
      b.dataset.label = label;
      b.textContent = label;
      b.setAttribute('aria-pressed', isSel(ci, label) ? 'true' : 'false');
      if (isSel(ci, label)) { b.classList.add('on'); }
      box.appendChild(b);
    });
    var badge = $('page-badge-' + ci);
    var txt = $('page-txt-' + ci);
    var swap = $('swap-' + ci);
    var atEnd = state.pool[ci] > 0;
    if (badge) { badge.textContent = (state.pool[ci] + 1) + '/' + pages; }
    if (txt) { txt.innerHTML = atEnd ? '처음 10개로' : '더 보기 <b>(+' + Math.min(PER_PAGE, allChips(ci).length - start - PER_PAGE) + '개)</b>'; }
    if (swap) {
      swap.classList.toggle('at-end', atEnd);
      swap.setAttribute('aria-expanded', atEnd ? 'true' : 'false');
      swap.setAttribute('aria-label', atEnd
        ? CATS[ci].name + ' 처음 10개 보기 (지금 ' + (state.pool[ci] + 1) + '/' + pages + ' 페이지)'
        : CATS[ci].name + ' 취향 ' + Math.min(PER_PAGE, allChips(ci).length - start - PER_PAGE) + '개 더 보기 (지금 ' + (state.pool[ci] + 1) + '/' + pages + ' 페이지)');
    }
    if (CATS[ci].customLabel) {
      var more = document.createElement('button');
      more.type = 'button';
      more.className = 'chip chip-more';
      more.dataset.cat = String(ci);
      more.dataset.act = 'askcustom';
      more.innerHTML = '<span class="chip-plus" aria-hidden="true">＋</span>' + CATS[ci].customLabel;
      more.setAttribute('aria-label', '목록에 없는 ' + CATS[ci].name + ' 직접 입력하기');
      box.appendChild(more);
    }
  }

  function openCustom(ci) {
    var panel = $('custom-' + ci);
    var btn = $('custom-btn-' + ci);
    if (!panel) { return; }
    panel.hidden = false;
    if (btn) { btn.setAttribute('aria-expanded', 'true'); }
    var input = $('custom-input-' + ci);
    if (input) {
      input.scrollIntoView({ block: 'center' });
      input.focus();
    }
  }

  function setAccOpen(ci) {
    state.openCat = (state.openCat === ci) ? -1 : ci;
    CATS.forEach(function (cat, i) {
      var sec = $('acc-head-' + i).closest('.acc');
      var body = $('acc-body-' + i);
      var head = $('acc-head-' + i);
      var on = state.openCat === i;
      sec.classList.toggle('open', on);
      body.hidden = !on;
      head.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
  }

  function isSel(ci, label) {
    for (var i = 0; i < state.sel.length; i += 1) {
      if (state.sel[i].cat === ci && state.sel[i].label === label) { return true; }
    }
    return false;
  }

  function findSel(ci, label) {
    for (var i = 0; i < state.sel.length; i += 1) {
      if (state.sel[i].cat === ci && state.sel[i].label === label) { return i; }
    }
    return -1;
  }

  function toggleChip(ci, label) {
    var idx = findSel(ci, label);
    if (idx >= 0) {
      state.sel.splice(idx, 1);
    } else {
      if (state.sel.length >= MAX) {
        toast('16칸이 다 찼어요. 하나를 빼고 담아주세요.');
        return;
      }
      state.sel.push({ cat: ci, label: label });
    }
    renderChips(ci);
    syncSel();
  }

  function syncSel() {
    var n = state.sel.length;
    CATS.forEach(function (cat, ci) {
      var mine = state.sel.filter(function (s) { return s.cat === ci; }).length;
      var badge = $('acc-count-' + ci);
      if (badge) {
        badge.textContent = String(mine);
        badge.classList.toggle('has', mine > 0);
      }
      var box = $('chips-' + ci);
      if (box) {
        Array.prototype.forEach.call(box.children, function (chip) {
          if (chip.dataset.act === 'askcustom') { return; }
          var on = isSel(ci, chip.dataset.label);
          chip.classList.toggle('on', on);
          chip.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      }
    });

    $('rosterCount').textContent = '담은 취향 ' + n + ' / ' + MAX;
    var hint = $('rosterHint');
    if (n < MIN) {
      hint.textContent = (MIN - n) + '개만 더 고르면 빙고판을 만들 수 있어요';
      hint.classList.add('warn');
    } else if (n <= SMALL_MAX) {
      var free3 = SMALL_MAX - n;
      hint.textContent = '3×3 판이에요 · ' + (free3 ? 'FREE ' + free3 + '칸' : '9칸 꽉 참') +
        (n < SMALL_MAX ? ' · ' + (SMALL_MAX + 1 - n) + '개 더 담으면 4×4' : '');
      hint.classList.remove('warn');
    } else if (n < MAX) {
      hint.textContent = '4×4 판이에요 · FREE ' + (MAX - n) + '칸을 눌러서 체크할 수 있어요';
      hint.classList.remove('warn');
    } else {
      hint.textContent = '16칸을 다 채웠어요. FREE 칸 없이 꽉 찬 판이에요';
      hint.classList.remove('warn');
    }
    var ok = n >= MIN;
    $('rosterMake').disabled = !ok;
    $('makeBtn').disabled = !ok;
    $('pickedCount').textContent = String(n);
    renderPicked();
  }

  function renderPicked() {
    var list = $('pickedList');
    list.innerHTML = '';
    if (!state.sel.length) {
      var p = document.createElement('p');
      p.className = 'picked-empty';
      p.textContent = '아직 비어 있어요. 위에서 마음에 드는 칩을 눌러보세요.';
      list.appendChild(p);
      return;
    }
    state.sel.forEach(function (s, i) {
      var chip = document.createElement('span');
      chip.className = 'picked-chip';
      chip.appendChild(document.createTextNode(s.label));
      var del = document.createElement('button');
      del.type = 'button';
      del.dataset.act = 'remove';
      del.dataset.idx = String(i);
      del.setAttribute('aria-label', s.label + ' 빼기');
      del.textContent = '×';
      chip.appendChild(del);
      list.appendChild(chip);
    });
  }

  function addCustom(ci, inputId) {
    var input = $(inputId);
    var raw = clean(input.value);
    if (!raw) { input.focus(); return; }
    if (raw.length > 12) { raw = raw.slice(0, 12); }
    var inP0 = CATS[ci].pools[0].indexOf(raw) >= 0;
    var inP1 = CATS[ci].pools[1].indexOf(raw) >= 0;
    var exists = inP0 || inP1 || state.custom[ci].indexOf(raw) >= 0;
    if (exists) {
      if (isSel(ci, raw)) {
        toast('이미 담은 취향이에요.');
      } else {
        if (inP0) { state.pool[ci] = 0; }
        if (inP1) { state.pool[ci] = 1; }
        renderChips(ci);
        toggleChip(ci, raw);
      }
      input.value = '';
      return;
    }
    if (state.sel.length >= MAX) {
      toast('16칸이 다 찼어요. 하나를 빼고 담아주세요.');
      return;
    }
    state.custom[ci].push(raw);
    state.sel.push({ cat: ci, label: raw });
    input.value = '';
    renderChips(ci);
    syncSel();
    toast('“' + raw + '”을 담았어요.');
    input.focus();
  }

  /* ================= 빙고판 ================= */

  /* 빈칸이 한 줄을 통째로 차지하면 판이 깨져 보여서, 그 줄의 빈칸 하나를 다른 칸과 맞바꿔 흩어지게 한다 */
  function breakFreeLines(cells, n) {
    var lines = linesFor(n);
    var guard, li, j, t, q, z;
    for (guard = 0; guard < n * n; guard += 1) {
      var bad = null;
      for (li = 0; li < lines.length; li += 1) {
        var L = lines[li];
        var allFree = true;
        for (j = 0; j < L.length; j += 1) {
          if (!cells[L[j]].free) { allFree = false; break; }
        }
        if (allFree) { bad = L; break; }
      }
      if (!bad) { break; }
      var from = bad[Math.floor(n / 2)];
      var to = -1;
      for (t = 0; t < cells.length; t += 1) {
        if (cells[t].free) { continue; }
        var ok = true;
        for (q = 0; q < lines.length; q += 1) {
          var L2 = lines[q];
          if (L2.indexOf(from) >= 0) { continue; }
          if (L2.indexOf(t) < 0) { continue; }
          var frees = 0;
          for (z = 0; z < L2.length; z += 1) { if (cells[L2[z]].free) { frees += 1; } }
          if (frees + 1 >= n) { ok = false; break; }
        }
        if (ok) { to = t; break; }
      }
      if (to < 0) { break; }
      var tmp = cells[from];
      cells[from] = cells[to];
      cells[to] = tmp;
    }
    return cells;
  }

  function makeCells(count) {
    var n = boardSizeFor(count);
    var total = n * n;
    var groups = CATS.map(function () { return []; });
    state.sel.forEach(function (s) { groups[s.cat].push(s.label); });
    var seq = [];
    var more = true;
    while (more) {
      more = false;
      for (var i = 0; i < groups.length; i += 1) {
        if (groups[i].length) {
          seq.push({ cat: i, label: groups[i].shift() });
          more = true;
        }
      }
    }
    var cells = [];
    var k;
    for (k = 0; k < total; k += 1) { cells.push({ free: true }); }
    if (seq.length >= total) {
      for (k = 0; k < total; k += 1) { cells[k] = { cat: seq[k].cat, label: seq[k].label }; }
      return cells;
    }
    var used = {};
    var m = seq.length;
    for (k = 0; k < m; k += 1) {
      var pos = Math.floor((k + 0.5) * total / m);
      if (pos > total - 1) { pos = total - 1; }
      while (used[pos]) { pos = (pos + 1) % total; }
      used[pos] = true;
      cells[pos] = { cat: seq[k].cat, label: seq[k].label };
    }
    return breakFreeLines(cells, n);
  }

  /* mode: 'own' | 'friend' — FREE 칸은 양쪽 모두 눌러서 체크(클리어) 표시를 토글한다 */
  function cellEl(cell, i, mode) {
    var friend = mode === 'friend';
    var el = document.createElement((friend || cell.free) ? 'button' : 'div');
    el.className = 'cell';
    if (cell.free) {
      var on = !!(friend ? state.ftapped[i] : state.ownTapped[i]);
      el.classList.add('free');
      if (on) { el.classList.add('clear'); }
      el.innerHTML = '<span class="cell-in"><span class="cell-free-wrap">' +
        '<svg class="i cell-star" aria-hidden="true"><use href="#px-happy"/></svg>' +
        '<span class="cell-free">FREE</span>' +
        '<span class="cell-free-hint">눌러서 체크</span>' +
        '</span></span>' +
        '<span class="tap-check"' + (on ? '' : ' hidden') + '><svg class="i"><use href="#px-check"/></svg></span>';
      el.type = 'button';
      el.dataset.idx = String(i);
      el.setAttribute('role', 'button');
      el.setAttribute('aria-pressed', on ? 'true' : 'false');
      el.setAttribute('aria-label', 'FREE 칸' + (on ? ' 체크함' : ' 눌러서 체크'));
      return el;
    }
    el.classList.add('k' + cell.cat);
    if (String(cell.label).length >= 9) { el.classList.add('tight'); }
    el.innerHTML = '<span class="cell-in">' +
      '<span class="cell-ico">' + iconSVG(iconFor(cell.cat, cell.label, i)) + '</span>' +
      '<span class="cell-txt">' + esc(cell.label) + '</span>' +
      '</span>';
    if (friend) {
      el.type = 'button';
      el.dataset.idx = String(i);
      el.setAttribute('aria-pressed', 'false');
      el.setAttribute('aria-label', cell.label);
    } else {
      el.setAttribute('role', 'listitem');
    }
    return el;
  }

  function renderOwnBoard() {
    var board = $('board');
    var n = state.size;
    var total = n * n;
    board.innerHTML = '';
    board.classList.toggle('cols3', n === 3);
    board.classList.toggle('cols4', n === 4);
    var filled = 0;
    state.cells.forEach(function (cell, i) {
      if (!cell.free) { filled += 1; }
      board.appendChild(cellEl(cell, i, 'own'));
    });
    $('boardTitle').textContent = state.nick ? state.nick + '님의 2026 취향 빙고' : '나의 2026 취향 빙고';
    $('boardMeta').innerHTML = '<span>' + n + '×' + n + ' 판</span><i class="dot" aria-hidden="true"></i>' +
      '<span>취향 ' + filled + '개</span>' +
      ((total - filled) ? '<i class="dot" aria-hidden="true"></i><span>FREE ' + (total - filled) + '칸</span>' : '');
  }

  function buildBoard() {
    if (state.sel.length < MIN) { return; }
    state.size = boardSizeFor(state.sel.length);
    state.cells = makeCells(state.sel.length);
    state.iconOf = assignIcons(state.cells);
    state.ownTapped = {};
    renderOwnBoard();
    $('sharebox').hidden = true;
    $('boardPreview').hidden = true;
    $('boardStatus').textContent = '';
    $('shareUrl').value = '';
    $('previewLink').href = shareUrl();
    show('s-board');
  }

  function boardCode() {
    var parts = state.cells.map(function (c) { return c.free ? '' : c.cat + '~' + c.label; }).join('|');
    return b64urlEncode('2|' + state.nick + '|' + state.size + '|' + parts);
  }

  function shareUrl() {
    return location.origin + location.pathname + '?b=' + boardCode();
  }

  /* 예전 4×4 링크(1|닉네임|칸...)도 계속 열린다 */
  function decodeBoard(raw) {
    var txt = b64urlDecode(raw);
    var seg = txt.split('|');
    if (seg.length < 3) { throw new Error('format'); }
    var n = 4;
    var nick = '';
    var rest = [];
    if (seg[0] === '2') {
      n = parseInt(seg[2], 10);
      if (n !== 3 && n !== 4) { throw new Error('size'); }
      nick = clean(seg[1] || '');
      rest = seg.slice(3);
    } else if (seg[0] === '1') {
      nick = clean(seg[1] || '');
      rest = seg.slice(2);
    } else {
      throw new Error('format');
    }
    if (nick.length > 12) { nick = nick.slice(0, 12); }
    var cells = [];
    for (var i = 0; i < rest.length; i += 1) {
      var p = rest[i];
      if (!p) { cells.push({ free: true }); continue; }
      var j = p.indexOf('~');
      if (j < 1) { throw new Error('cell'); }
      var ci = parseInt(p.slice(0, j), 10);
      var label = clean(p.slice(j + 1));
      if (!(ci >= 0 && ci < CATS.length) || !label || label.length > 14) { throw new Error('cell'); }
      cells.push({ cat: ci, label: label });
    }
    if (cells.length !== n * n) { throw new Error('count'); }
    var tasted = cells.filter(function (c) { return !c.free; }).length;
    if (tasted < MIN) { throw new Error('thin'); }
    return { nick: nick, size: n, cells: cells };
  }

  /* ================= 친구 참여 ================= */

  function calcStats(cells, tapped) {
    var n = gridSize(cells);
    var lines = linesFor(n);
    var tasteN = 0;
    var matched = 0;
    cells.forEach(function (c, i) {
      if (!c.free) {
        tasteN += 1;
        if (tapped[i]) { matched += 1; }
      }
    });
    var rate = tasteN ? Math.round((matched / tasteN) * 100) : 0;
    var done = [];
    lines.forEach(function (L) {
      var taps = 0;
      var filled = true;
      L.forEach(function (i) {
        if (cells[i].free) { return; }
        if (tapped[i]) { taps += 1; } else { filled = false; }
      });
      if (filled && taps >= 2) { done.push(L); }
    });
    return { tasteN: tasteN, matched: matched, rate: rate, lines: done };
  }

  function lineCopyFor(s) {
    if (!s.matched) { return '올 한 해, 우리는 얼마나 통했을까? 마음에 드는 칸을 톡톡 눌러보세요.'; }
    var base;
    if (s.rate >= 100) { base = '취향이 딱 맞았어요! 올 한 해 우리는 완전히 통했네요.'; }
    else if (s.rate >= 85) { base = '쌍둥이 수준! 취향이 거의 붙어 있어요.'; }
    else if (s.rate >= 65) { base = '은근 통하네! 겹치는 칸이 꽤 많아요.'; }
    else if (s.rate >= 45) { base = '반반이에요. 서로 알려줄 취향이 아직 있어요.'; }
    else if (s.rate >= 25) { base = '취향이 꽤 갈려요. 그래서 이야기할 거리가 많아요.'; }
    else { base = '정반대에 가까워요. 서로의 세계가 궁금해지는 조합이에요.'; }
    if (s.lines.length >= 1) { base += ' 빙고 ' + s.lines.length + '줄까지 완성했어요.'; }
    return base;
  }

  function renderFriend() {
    var board = $('friendBoard');
    var n = gridSize(state.cells);
    board.innerHTML = '';
    board.classList.toggle('cols3', n === 3);
    board.classList.toggle('cols4', n === 4);
    state.cells.forEach(function (cell, i) {
      var el = cellEl(cell, i, 'friend');
      if (!cell.free) {
        var st = document.createElement('span');
        st.className = 'bingo-star';
        st.innerHTML = '<svg class="i"><use href="#px-happy"/></svg>';
        st.hidden = true;
        el.appendChild(st);
        var th = document.createElement('span');
        th.className = 'tap-heart';
        th.innerHTML = '<svg class="i"><use href="#px-heart"/></svg>';
        th.hidden = true;
        el.appendChild(th);
      }
      board.appendChild(el);
    });
    state.lastLines = 0;
    var tasted = state.cells.filter(function (c) { return !c.free; }).length;
    $('friendTitle').textContent = (state.fnick ? state.fnick + '님의' : '친구의') + ' 2026 취향 빙고';
    $('friendSub').textContent = (state.fnick ? state.fnick + '님이' : '친구가') + ' 고른 2026 취향 ' + tasted +
      '칸(' + n + '×' + n + ' 판)이에요. 올 한 해, 우리는 얼마나 통했을까? 마음에 드는 칸을 톡톡 눌러보세요.';
    updateFriend();
    $('friendPreview').hidden = true;
    $('friendStatus').textContent = '';
    show('s-friend');
  }

  function updateFriend() {
    var s = calcStats(state.cells, state.ftapped);
    $('stTap').textContent = String(s.matched);
    $('stRate').textContent = String(s.rate);
    $('stBingo').textContent = String(s.lines.length);
    $('lineCopy').textContent = lineCopyFor(s);

    var inLine = {};
    s.lines.forEach(function (L) { L.forEach(function (i) { inLine[i] = true; }); });

    Array.prototype.forEach.call($('friendBoard').children, function (el, i) {
      var cell = state.cells[i];
      var on = !!state.ftapped[i];
      if (cell.free) {
        el.classList.toggle('clear', on);
        el.setAttribute('aria-pressed', on ? 'true' : 'false');
        el.setAttribute('aria-label', 'FREE 칸' + (on ? ' 체크함' : ' 눌러서 체크'));
        var ck = el.querySelector('.tap-check');
        if (ck) { ck.hidden = !on; }
        return;
      }
      el.classList.toggle('tap', on);
      el.classList.toggle('bingo', !!inLine[i]);
      var st = el.querySelector('.bingo-star');
      if (st) { st.hidden = !inLine[i]; }
      var th = el.querySelector('.tap-heart');
      if (th) { th.hidden = !on; }
      el.setAttribute('aria-pressed', on ? 'true' : 'false');
      el.setAttribute('aria-label', cell.label + (on ? ', 공감함' : ''));
    });

    if (s.lines.length > (state.lastLines || 0)) {
      confetti();
      toast('빙고 ' + s.lines.length + '줄 완성!');
    }
    state.lastLines = s.lines.length;
  }

  function confetti() {
    var box = $('confetti');
    var colors = ['#F7B0CC', '#FFD1E2', '#E8DDFB', '#D6F2E4', '#FFF3C8', '#D6ECFB'];
    for (var i = 0; i < 18; i += 1) {
      var bit = document.createElement('i');
      bit.style.left = (8 + Math.random() * 84) + '%';
      bit.style.top = (-6 - Math.random() * 12) + 'px';
      bit.style.background = colors[i % colors.length];
      bit.style.animationDelay = (Math.random() * 0.25).toFixed(2) + 's';
      bit.style.transform = 'rotate(' + Math.round(Math.random() * 180) + 'deg)';
      box.appendChild(bit);
      (function (el) { setTimeout(function () { el.remove(); }, 1700); }(bit));
    }
  }

  function tapCell(el) {
    var i = parseInt(el.dataset.idx, 10);
    if (isNaN(i) || !state.cells || !state.cells[i]) { return; }
    var cell = state.cells[i];
    if (cell.free) {
      if (state.ftapped[i]) { delete state.ftapped[i]; } else { state.ftapped[i] = true; }
      var on = !!state.ftapped[i];
      el.classList.remove('pop');
      void el.offsetWidth;
      if (on) { el.classList.add('pop'); }
      el.classList.toggle('clear', on);
      el.setAttribute('aria-pressed', on ? 'true' : 'false');
      el.setAttribute('aria-label', 'FREE 칸' + (on ? ' 체크함' : ' 눌러서 체크'));
      var ck = el.querySelector('.tap-check');
      if (ck) { ck.hidden = !on; }
      return;
    }
    if (state.ftapped[i]) { delete state.ftapped[i]; } else { state.ftapped[i] = true; }
    el.classList.remove('pop');
    void el.offsetWidth;
    if (state.ftapped[i]) { el.classList.add('pop'); }
    updateFriend();
  }

  /* 내 판 FREE 칸도 눌러서 체크 표시를 토글 */
  function tapOwnFree(el) {
    var i = parseInt(el.dataset.idx, 10);
    if (isNaN(i) || !state.cells || !state.cells[i] || !state.cells[i].free) { return; }
    if (state.ownTapped[i]) { delete state.ownTapped[i]; } else { state.ownTapped[i] = true; }
    var on = !!state.ownTapped[i];
    el.classList.toggle('clear', on);
    el.setAttribute('aria-pressed', on ? 'true' : 'false');
    el.setAttribute('aria-label', 'FREE 칸' + (on ? ' 체크함' : ' 눌러서 체크'));
    var ck = el.querySelector('.tap-check');
    if (ck) { ck.hidden = !on; }
    el.classList.remove('pop');
    void el.offsetWidth;
    if (on) { el.classList.add('pop'); }
  }

  /* ================= 카드 PNG (픽셀 도트) ================= */

  var W = 1080;
  var H = 1350;
  var EMOJI = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"';
  var FONT = 'Galmuri11, "Pretendard Variable", Pretendard, "Noto Sans CJK KR", ' + EMOJI + ', sans-serif';
  var BODYF = '"Pretendard Variable", Pretendard, "Noto Sans CJK KR", ' + EMOJI + ', sans-serif';

  var C = {
    bg: '#FDE8F0', panel: '#FFF7FB', ink: '#5A3446', ink2: '#7E5A6A', mute: '#A98F9C',
    line: '#C97A9B', line2: '#EBBFD2', bar: '#F7B0CC', mint: '#D6F2E4', lemon: '#FFF3C8',
    hot: '#E4678F', shadow: 'rgba(201,122,155,.28)',
    cols: ['#FFD1E2', '#E8DDFB', '#FFF3C8', '#D6F2E4', '#D6ECFB', '#FFE0D3', '#FFE2CE', '#E8F4D8', '#F2E3F7']
  };

  var PXS = {"sp-heart":{"w":16,"h":16,"bx":0,"by":1,"bw":15,"bh":13,"runs":[[2,1,3,"#C9506F"],[8,1,3,"#C9506F"],[1,2,1,"#C9506F"],[2,2,1,"#FFFFFF"],[3,2,2,"#F7A8C4"],[5,2,1,"#C9506F"],[7,2,1,"#C9506F"],[8,2,3,"#F7A8C4"],[11,2,1,"#C9506F"],[0,3,1,"#C9506F"],[1,3,1,"#F7A8C4"],[2,3,3,"#FFD1E2"],[5,3,1,"#F7A8C4"],[6,3,1,"#C9506F"],[7,3,2,"#F7A8C4"],[9,3,1,"#FFD1E2"],[10,3,2,"#F7A8C4"],[12,3,1,"#C9506F"],[0,4,1,"#C9506F"],[1,4,1,"#F7A8C4"],[2,4,3,"#FFD1E2"],[5,4,7,"#F7A8C4"],[12,4,1,"#C9506F"],[0,5,1,"#C9506F"],[1,5,12,"#F7A8C4"],[13,5,1,"#C9506F"],[0,6,1,"#C9506F"],[1,6,13,"#F7A8C4"],[14,6,1,"#C9506F"],[1,7,1,"#C9506F"],[2,7,11,"#F7A8C4"],[13,7,1,"#C9506F"],[2,8,1,"#C9506F"],[3,8,9,"#F7A8C4"],[12,8,1,"#C9506F"],[3,9,1,"#C9506F"],[4,9,7,"#F7A8C4"],[11,9,1,"#C9506F"],[4,10,1,"#C9506F"],[5,10,5,"#F7A8C4"],[10,10,1,"#C9506F"],[5,11,1,"#C9506F"],[6,11,3,"#F7A8C4"],[9,11,1,"#C9506F"],[6,12,1,"#C9506F"],[7,12,1,"#F7A8C4"],[8,12,1,"#C9506F"],[7,13,1,"#C9506F"]]},"sp-cd":{"w":16,"h":16,"bx":0,"by":0,"bw":16,"bh":16,"runs":[[4,0,3,"#8E7FB0"],[7,0,1,"#E4678F"],[8,0,1,"#5B9BE8"],[9,0,3,"#8E7FB0"],[3,1,1,"#8E7FB0"],[4,1,2,"#E4678F"],[6,1,2,"#F7A8C4"],[8,1,2,"#D6ECFB"],[10,1,2,"#5B9BE8"],[12,1,1,"#8E7FB0"],[2,2,1,"#8E7FB0"],[3,2,1,"#E4678F"],[4,2,2,"#FFFFFF"],[6,2,2,"#F7A8C4"],[8,2,4,"#D6ECFB"],[12,2,1,"#5B9BE8"],[13,2,1,"#8E7FB0"],[1,3,1,"#8E7FB0"],[2,3,1,"#E4678F"],[3,3,1,"#F7A8C4"],[4,3,1,"#FFFFFF"],[5,3,2,"#F7A8C4"],[7,3,2,"#E8DDFB"],[9,3,4,"#D6ECFB"],[13,3,1,"#5B9BE8"],[14,3,1,"#8E7FB0"],[0,4,1,"#8E7FB0"],[1,4,1,"#E4678F"],[2,4,1,"#F7A8C4"],[3,4,1,"#FFFFFF"],[4,4,1,"#F7A8C4"],[5,4,6,"#E8DDFB"],[11,4,3,"#D6ECFB"],[14,4,1,"#5B9BE8"],[15,4,1,"#8E7FB0"],[0,5,1,"#8E7FB0"],[1,5,1,"#E4678F"],[2,5,2,"#F7A8C4"],[4,5,2,"#E8DDFB"],[6,5,4,"#8B5C72"],[10,5,2,"#E8DDFB"],[12,5,2,"#D6ECFB"],[14,5,1,"#5B9BE8"],[15,5,1,"#8E7FB0"],[0,6,1,"#8E7FB0"],[1,6,3,"#F7A8C4"],[4,6,1,"#E8DDFB"],[5,6,1,"#8B5C72"],[6,6,4,"#FFFFFF"],[10,6,1,"#8B5C72"],[11,6,1,"#E8DDFB"],[12,6,3,"#D6ECFB"],[15,6,1,"#8E7FB0"],[0,7,1,"#E4678F"],[1,7,2,"#F7A8C4"],[3,7,2,"#E8DDFB"],[5,7,1,"#8B5C72"],[6,7,4,"#FFFFFF"],[10,7,1,"#8B5C72"],[11,7,2,"#E8DDFB"],[13,7,2,"#D6ECFB"],[15,7,1,"#5B9BE8"],[0,8,1,"#F7C95E"],[1,8,2,"#FFF3C8"],[3,8,2,"#E8DDFB"],[5,8,1,"#8B5C72"],[6,8,4,"#FFFFFF"],[10,8,1,"#8B5C72"],[11,8,2,"#E8DDFB"],[13,8,2,"#D6F2E4"],[15,8,1,"#7ED0C4"],[0,9,1,"#8E7FB0"],[1,9,3,"#FFF3C8"],[4,9,1,"#E8DDFB"],[5,9,1,"#8B5C72"],[6,9,4,"#FFFFFF"],[10,9,1,"#8B5C72"],[11,9,1,"#E8DDFB"],[12,9,3,"#D6F2E4"],[15,9,1,"#8E7FB0"],[0,10,1,"#8E7FB0"],[1,10,1,"#F7C95E"],[2,10,2,"#FFF3C8"],[4,10,2,"#E8DDFB"],[6,10,3,"#8B5C72"],[9,10,1,"#FFFFFF"],[10,10,2,"#E8DDFB"],[12,10,2,"#D6F2E4"],[14,10,1,"#7ED0C4"],[15,10,1,"#8E7FB0"],[0,11,1,"#8E7FB0"],[1,11,1,"#F7C95E"],[2,11,3,"#FFF3C8"],[5,11,6,"#E8DDFB"],[11,11,3,"#D6F2E4"],[14,11,1,"#7ED0C4"],[15,11,1,"#8E7FB0"],[1,12,1,"#8E7FB0"],[2,12,1,"#F7C95E"],[3,12,4,"#FFF3C8"],[7,12,2,"#E8DDFB"],[9,12,4,"#D6F2E4"],[13,12,1,"#7ED0C4"],[14,12,1,"#8E7FB0"],[2,13,1,"#8E7FB0"],[3,13,1,"#F7C95E"],[4,13,4,"#FFF3C8"],[8,13,4,"#D6F2E4"],[12,13,1,"#7ED0C4"],[13,13,1,"#8E7FB0"],[3,14,1,"#8E7FB0"],[4,14,2,"#F7C95E"],[6,14,2,"#FFF3C8"],[8,14,2,"#D6F2E4"],[10,14,2,"#7ED0C4"],[12,14,1,"#8E7FB0"],[4,15,3,"#8E7FB0"],[7,15,1,"#F7C95E"],[8,15,1,"#7ED0C4"],[9,15,3,"#8E7FB0"]]},"sp-note":{"w":16,"h":16,"bx":0,"by":1,"bw":14,"bh":14,"runs":[[3,1,10,"#3F7D74"],[1,2,2,"#3F7D74"],[3,2,10,"#7ED0C4"],[13,2,1,"#3F7D74"],[0,3,1,"#3F7D74"],[1,3,2,"#4A3242"],[3,3,1,"#7ED0C4"],[4,3,7,"#D6F2E4"],[11,3,2,"#FFFFFF"],[13,3,1,"#3F7D74"],[1,4,2,"#3F7D74"],[3,4,8,"#7ED0C4"],[11,4,2,"#FFFFFF"],[13,4,1,"#3F7D74"],[0,5,1,"#3F7D74"],[1,5,2,"#4A3242"],[3,5,1,"#E4678F"],[4,5,7,"#D6F2E4"],[11,5,2,"#FFFFFF"],[13,5,1,"#3F7D74"],[1,6,2,"#3F7D74"],[3,6,1,"#7ED0C4"],[4,6,1,"#D6F2E4"],[5,6,5,"#FFFFFF"],[10,6,1,"#D6F2E4"],[11,6,2,"#FFFFFF"],[13,6,1,"#3F7D74"],[0,7,1,"#3F7D74"],[1,7,2,"#4A3242"],[3,7,1,"#7ED0C4"],[4,7,7,"#D6F2E4"],[11,7,2,"#FFFFFF"],[13,7,1,"#3F7D74"],[1,8,2,"#3F7D74"],[3,8,1,"#7ED0C4"],[4,8,1,"#D6F2E4"],[5,8,4,"#FFFFFF"],[9,8,2,"#D6F2E4"],[11,8,2,"#FFFFFF"],[13,8,1,"#3F7D74"],[0,9,1,"#3F7D74"],[1,9,2,"#4A3242"],[3,9,1,"#7ED0C4"],[4,9,7,"#D6F2E4"],[11,9,2,"#FFFFFF"],[13,9,1,"#3F7D74"],[1,10,2,"#3F7D74"],[3,10,1,"#7ED0C4"],[4,10,1,"#D6F2E4"],[5,10,5,"#E4678F"],[10,10,1,"#D6F2E4"],[11,10,2,"#FFFFFF"],[13,10,1,"#3F7D74"],[0,11,1,"#3F7D74"],[1,11,2,"#4A3242"],[3,11,1,"#7ED0C4"],[4,11,7,"#D6F2E4"],[11,11,2,"#FFFFFF"],[13,11,1,"#3F7D74"],[1,12,2,"#3F7D74"],[3,12,1,"#7ED0C4"],[4,12,7,"#D6F2E4"],[11,12,2,"#FFFFFF"],[13,12,1,"#3F7D74"],[0,13,1,"#3F7D74"],[1,13,2,"#4A3242"],[3,13,10,"#7ED0C4"],[13,13,1,"#3F7D74"],[1,14,12,"#3F7D74"]]},"sp-tv":{"w":16,"h":16,"bx":1,"by":0,"bw":14,"bh":14,"runs":[[2,0,1,"#B5557A"],[3,0,1,"#4A3242"],[4,0,1,"#B5557A"],[11,0,1,"#B5557A"],[12,0,1,"#4A3242"],[13,0,1,"#B5557A"],[3,1,1,"#B5557A"],[4,1,1,"#4A3242"],[5,1,1,"#B5557A"],[10,1,1,"#B5557A"],[11,1,1,"#4A3242"],[12,1,1,"#B5557A"],[2,2,2,"#B5557A"],[4,2,1,"#4A3242"],[5,2,6,"#B5557A"],[11,2,1,"#4A3242"],[12,2,2,"#B5557A"],[1,3,1,"#B5557A"],[2,3,12,"#F7A8C4"],[14,3,1,"#B5557A"],[1,4,1,"#B5557A"],[2,4,1,"#F7A8C4"],[3,4,10,"#FFD1E2"],[13,4,1,"#F7A8C4"],[14,4,1,"#B5557A"],[1,5,1,"#B5557A"],[2,5,1,"#F7A8C4"],[3,5,1,"#FFD1E2"],[4,5,6,"#D6F2E4"],[10,5,3,"#FFD1E2"],[13,5,1,"#F7A8C4"],[14,5,1,"#B5557A"],[1,6,1,"#B5557A"],[2,6,1,"#F7A8C4"],[3,6,1,"#FFD1E2"],[4,6,2,"#7FD4E8"],[6,6,2,"#E4678F"],[8,6,2,"#7FD4E8"],[10,6,1,"#FFD1E2"],[11,6,1,"#E4678F"],[12,6,1,"#FFFFFF"],[13,6,1,"#F7A8C4"],[14,6,1,"#B5557A"],[1,7,1,"#B5557A"],[2,7,1,"#F7A8C4"],[3,7,1,"#FFD1E2"],[4,7,1,"#7FD4E8"],[5,7,1,"#E4678F"],[6,7,2,"#7FD4E8"],[8,7,1,"#E4678F"],[9,7,1,"#7FD4E8"],[10,7,3,"#FFD1E2"],[13,7,1,"#F7A8C4"],[14,7,1,"#B5557A"],[1,8,1,"#B5557A"],[2,8,1,"#F7A8C4"],[3,8,1,"#FFD1E2"],[4,8,2,"#7FD4E8"],[6,8,2,"#E4678F"],[8,8,2,"#7FD4E8"],[10,8,1,"#FFD1E2"],[11,8,1,"#F7C95E"],[12,8,1,"#FFD1E2"],[13,8,1,"#F7A8C4"],[14,8,1,"#B5557A"],[1,9,1,"#B5557A"],[2,9,1,"#F7A8C4"],[3,9,1,"#FFD1E2"],[4,9,6,"#7FD4E8"],[10,9,3,"#FFD1E2"],[13,9,1,"#F7A8C4"],[14,9,1,"#B5557A"],[1,10,1,"#B5557A"],[2,10,1,"#F7A8C4"],[3,10,8,"#FFD1E2"],[11,10,1,"#7ED0C4"],[12,10,1,"#FFD1E2"],[13,10,1,"#F7A8C4"],[14,10,1,"#B5557A"],[1,11,1,"#B5557A"],[2,11,1,"#F7A8C4"],[3,11,1,"#FFD1E2"],[4,11,4,"#E4678F"],[8,11,5,"#FFD1E2"],[13,11,1,"#F7A8C4"],[14,11,1,"#B5557A"],[1,12,1,"#B5557A"],[2,12,12,"#F7A8C4"],[14,12,1,"#B5557A"],[2,13,12,"#B5557A"]]},"sp-rainbow":{"w":16,"h":16,"bx":0,"by":1,"bw":16,"bh":15,"runs":[[4,1,8,"#9C8FCF"],[2,2,2,"#9C8FCF"],[4,2,8,"#E4678F"],[12,2,2,"#9C8FCF"],[0,3,2,"#9C8FCF"],[2,3,12,"#E4678F"],[14,3,2,"#9C8FCF"],[0,4,5,"#E4678F"],[5,4,6,"#F7C95E"],[11,4,5,"#E4678F"],[0,5,3,"#E4678F"],[3,5,10,"#F7C95E"],[13,5,3,"#E4678F"],[0,6,1,"#E4678F"],[1,6,1,"#9C8FCF"],[2,6,4,"#F7C95E"],[6,6,4,"#9C8FCF"],[10,6,4,"#F7C95E"],[14,6,1,"#9C8FCF"],[15,6,1,"#E4678F"],[0,7,1,"#E4678F"],[1,7,3,"#F7C95E"],[4,7,8,"#7ED0C4"],[12,7,3,"#F7C95E"],[15,7,1,"#E4678F"],[0,8,3,"#F7C95E"],[3,8,10,"#7ED0C4"],[13,8,3,"#F7C95E"],[0,9,2,"#F7C95E"],[2,9,3,"#7ED0C4"],[5,9,6,"#9C8FCF"],[11,9,3,"#7ED0C4"],[14,9,2,"#F7C95E"],[0,10,1,"#F7C95E"],[1,10,1,"#9C8FCF"],[2,10,1,"#7ED0C4"],[3,10,1,"#FFFFFF"],[4,10,1,"#9C8FCF"],[11,10,1,"#9C8FCF"],[12,10,1,"#FFFFFF"],[13,10,1,"#7ED0C4"],[14,10,1,"#9C8FCF"],[15,10,1,"#F7C95E"],[0,11,1,"#F7C95E"],[1,11,4,"#FFFFFF"],[5,11,1,"#9C8FCF"],[10,11,1,"#9C8FCF"],[11,11,4,"#FFFFFF"],[15,11,1,"#F7C95E"],[0,12,6,"#FFFFFF"],[6,12,1,"#9C8FCF"],[9,12,1,"#9C8FCF"],[10,12,6,"#FFFFFF"],[0,13,1,"#F7C95E"],[1,13,1,"#FFFFFF"],[2,13,1,"#FFD1E2"],[3,13,2,"#FFFFFF"],[5,13,1,"#9C8FCF"],[10,13,1,"#9C8FCF"],[11,13,1,"#FFFFFF"],[12,13,1,"#FFD1E2"],[13,13,2,"#FFFFFF"],[15,13,1,"#F7C95E"],[0,14,1,"#F7C95E"],[1,14,2,"#7ED0C4"],[3,14,2,"#9C8FCF"],[11,14,2,"#9C8FCF"],[13,14,2,"#7ED0C4"],[15,14,1,"#F7C95E"],[0,15,1,"#F7C95E"],[1,15,3,"#7ED0C4"],[4,15,1,"#9C8FCF"],[11,15,1,"#9C8FCF"],[12,15,3,"#7ED0C4"],[15,15,1,"#F7C95E"]]},"sp-cloud":{"w":16,"h":16,"bx":0,"by":0,"bw":16,"bh":14,"runs":[[7,0,1,"#C9A0B4"],[6,1,1,"#C9A0B4"],[7,1,1,"#F7C95E"],[8,1,2,"#C9A0B4"],[5,2,1,"#C9A0B4"],[6,2,1,"#F7C95E"],[7,2,1,"#FFF3C8"],[8,2,2,"#F7C95E"],[10,2,1,"#C9A0B4"],[6,3,1,"#C9A0B4"],[7,3,1,"#FFF3C8"],[8,3,1,"#F7C95E"],[9,3,1,"#C9A0B4"],[4,4,6,"#C9A0B4"],[2,5,2,"#C9A0B4"],[4,5,6,"#FFFFFF"],[10,5,2,"#C9A0B4"],[1,6,1,"#C9A0B4"],[2,6,10,"#FFFFFF"],[12,6,2,"#C9A0B4"],[0,7,1,"#C9A0B4"],[1,7,13,"#FFFFFF"],[14,7,2,"#C9A0B4"],[0,8,16,"#FFFFFF"],[0,9,16,"#FFFFFF"],[0,10,1,"#C9A0B4"],[1,10,3,"#FFFFFF"],[4,10,1,"#FFD1E2"],[5,10,4,"#FFFFFF"],[9,10,1,"#FFD1E2"],[10,10,5,"#FFFFFF"],[15,10,1,"#C9A0B4"],[1,11,1,"#C9A0B4"],[2,11,2,"#FFFFFF"],[4,11,8,"#D6ECFB"],[12,11,2,"#FFFFFF"],[14,11,1,"#C9A0B4"],[1,12,1,"#C9A0B4"],[2,12,12,"#D6ECFB"],[14,12,1,"#C9A0B4"],[2,13,12,"#C9A0B4"]]},"sp-pop":{"w":16,"h":16,"bx":3,"by":1,"bw":10,"bh":15,"runs":[[4,1,5,"#C9506F"],[3,2,1,"#C9506F"],[4,2,5,"#E4678F"],[9,2,1,"#C9506F"],[3,3,1,"#C9506F"],[4,3,1,"#F7A8C4"],[5,3,4,"#FFD1E2"],[9,3,1,"#C9506F"],[3,4,1,"#C9506F"],[4,4,1,"#F7A8C4"],[5,4,1,"#FFD1E2"],[6,4,2,"#FFFFFF"],[8,4,1,"#FFD1E2"],[9,4,3,"#C9506F"],[3,5,1,"#C9506F"],[4,5,1,"#F7A8C4"],[5,5,1,"#FFD1E2"],[6,5,2,"#FFFFFF"],[8,5,1,"#FFD1E2"],[9,5,1,"#F7A8C4"],[10,5,1,"#FFD1E2"],[11,5,1,"#F7A8C4"],[12,5,1,"#C9506F"],[3,6,1,"#C9506F"],[4,6,1,"#F7A8C4"],[5,6,1,"#FFD1E2"],[6,6,2,"#FFFFFF"],[8,6,3,"#FFD1E2"],[11,6,1,"#F7A8C4"],[12,6,1,"#C9506F"],[3,7,1,"#C9506F"],[4,7,1,"#F7A8C4"],[5,7,1,"#FFD1E2"],[6,7,2,"#FFFFFF"],[8,7,3,"#FFD1E2"],[11,7,1,"#F7A8C4"],[12,7,1,"#C9506F"],[3,8,1,"#C9506F"],[4,8,1,"#F7A8C4"],[5,8,1,"#FFD1E2"],[6,8,2,"#FFFFFF"],[8,8,3,"#FFD1E2"],[11,8,1,"#F7A8C4"],[12,8,1,"#C9506F"],[3,9,1,"#C9506F"],[4,9,8,"#E4678F"],[12,9,1,"#C9506F"],[3,10,1,"#C9506F"],[4,10,1,"#F7A8C4"],[5,10,6,"#FFD1E2"],[11,10,1,"#F7A8C4"],[12,10,1,"#C9506F"],[3,11,1,"#C9506F"],[4,11,1,"#F7A8C4"],[5,11,6,"#FFD1E2"],[11,11,1,"#F7A8C4"],[12,11,1,"#C9506F"],[3,12,1,"#C9506F"],[4,12,8,"#F7A8C4"],[12,12,1,"#C9506F"],[4,13,3,"#C9506F"],[7,13,1,"#C08A5E"],[8,13,1,"#F2DCA8"],[9,13,3,"#C9506F"],[6,14,1,"#C9506F"],[7,14,1,"#C08A5E"],[8,14,1,"#F2DCA8"],[9,14,1,"#C9506F"],[6,15,1,"#C9506F"],[7,15,1,"#C08A5E"],[8,15,1,"#F2DCA8"],[9,15,1,"#C9506F"]]},"sp-globe":{"w":16,"h":16,"bx":0,"by":0,"bw":16,"bh":16,"runs":[[4,0,3,"#4E7FB0"],[7,0,2,"#5B9BE8"],[9,0,3,"#4E7FB0"],[3,1,1,"#4E7FB0"],[4,1,8,"#5B9BE8"],[12,1,1,"#4E7FB0"],[2,2,1,"#4E7FB0"],[3,2,10,"#5B9BE8"],[13,2,1,"#4E7FB0"],[1,3,1,"#4E7FB0"],[2,3,2,"#5B9BE8"],[4,3,2,"#FFFFFF"],[6,3,4,"#5B9BE8"],[10,3,1,"#6FBF73"],[11,3,3,"#5B9BE8"],[14,3,1,"#4E7FB0"],[0,4,1,"#4E7FB0"],[1,4,2,"#5B9BE8"],[3,4,1,"#FFFFFF"],[4,4,1,"#5B9BE8"],[5,4,1,"#6FBF73"],[6,4,3,"#5B9BE8"],[9,4,3,"#6FBF73"],[12,4,3,"#5B9BE8"],[15,4,1,"#4E7FB0"],[0,5,1,"#4E7FB0"],[1,5,2,"#5B9BE8"],[3,5,5,"#6FBF73"],[8,5,2,"#5B9BE8"],[10,5,1,"#6FBF73"],[11,5,4,"#5B9BE8"],[15,5,1,"#4E7FB0"],[0,6,1,"#4E7FB0"],[1,6,2,"#5B9BE8"],[3,6,5,"#6FBF73"],[8,6,7,"#5B9BE8"],[15,6,1,"#4E7FB0"],[0,7,3,"#5B9BE8"],[3,7,5,"#6FBF73"],[8,7,8,"#5B9BE8"],[0,8,5,"#5B9BE8"],[5,8,1,"#6FBF73"],[6,8,3,"#5B9BE8"],[9,8,3,"#6FBF73"],[12,8,4,"#5B9BE8"],[0,9,1,"#4E7FB0"],[1,9,2,"#5B9BE8"],[3,9,1,"#6FBF73"],[4,9,4,"#5B9BE8"],[8,9,5,"#6FBF73"],[13,9,2,"#5B9BE8"],[15,9,1,"#4E7FB0"],[0,10,1,"#4E7FB0"],[1,10,7,"#5B9BE8"],[8,10,5,"#6FBF73"],[13,10,2,"#5B9BE8"],[15,10,1,"#4E7FB0"],[0,11,1,"#4E7FB0"],[1,11,5,"#5B9BE8"],[6,11,1,"#6FBF73"],[7,11,1,"#5B9BE8"],[8,11,5,"#6FBF73"],[13,11,2,"#5B9BE8"],[15,11,1,"#4E7FB0"],[1,12,1,"#4E7FB0"],[2,12,7,"#5B9BE8"],[9,12,2,"#6FBF73"],[11,12,1,"#7FD4E8"],[12,12,2,"#5B9BE8"],[14,12,1,"#4E7FB0"],[2,13,1,"#4E7FB0"],[3,13,10,"#5B9BE8"],[13,13,1,"#4E7FB0"],[3,14,1,"#4E7FB0"],[4,14,8,"#5B9BE8"],[12,14,1,"#4E7FB0"],[4,15,3,"#4E7FB0"],[7,15,2,"#5B9BE8"],[9,15,3,"#4E7FB0"]]},"sp-berry":{"w":16,"h":16,"bx":2,"by":0,"bw":12,"bh":16,"runs":[[7,0,2,"#B23A55"],[6,1,1,"#B23A55"],[7,1,2,"#3F7D57"],[9,1,1,"#B23A55"],[5,2,1,"#B23A55"],[6,2,4,"#6FBF73"],[10,2,1,"#B23A55"],[4,3,1,"#B23A55"],[5,3,1,"#6FBF73"],[6,3,1,"#B23A55"],[7,3,2,"#EE5A72"],[9,3,1,"#B23A55"],[10,3,1,"#6FBF73"],[11,3,1,"#B23A55"],[3,4,1,"#B23A55"],[4,4,1,"#6FBF73"],[5,4,1,"#B23A55"],[6,4,4,"#EE5A72"],[10,4,1,"#B23A55"],[11,4,1,"#6FBF73"],[12,4,1,"#B23A55"],[3,5,1,"#B23A55"],[4,5,1,"#EE5A72"],[5,5,1,"#FFFFFF"],[6,5,2,"#EE5A72"],[8,5,1,"#F2DCA8"],[9,5,3,"#EE5A72"],[12,5,1,"#B23A55"],[2,6,1,"#B23A55"],[3,6,1,"#EE5A72"],[4,6,1,"#FFFFFF"],[5,6,1,"#F2DCA8"],[6,6,7,"#EE5A72"],[13,6,1,"#B23A55"],[2,7,1,"#B23A55"],[3,7,7,"#EE5A72"],[10,7,1,"#F2DCA8"],[11,7,2,"#EE5A72"],[13,7,1,"#B23A55"],[2,8,1,"#B23A55"],[3,8,10,"#EE5A72"],[13,8,1,"#B23A55"],[2,9,1,"#B23A55"],[3,9,3,"#EE5A72"],[6,9,1,"#F2DCA8"],[7,9,2,"#EE5A72"],[9,9,1,"#F2DCA8"],[10,9,3,"#EE5A72"],[13,9,1,"#B23A55"],[2,10,1,"#B23A55"],[3,10,10,"#EE5A72"],[13,10,1,"#B23A55"],[2,11,1,"#B23A55"],[3,11,4,"#EE5A72"],[7,11,1,"#F2DCA8"],[8,11,2,"#EE5A72"],[10,11,1,"#F2DCA8"],[11,11,2,"#EE5A72"],[13,11,1,"#B23A55"],[3,12,1,"#B23A55"],[4,12,8,"#EE5A72"],[12,12,1,"#B23A55"],[4,13,1,"#B23A55"],[5,13,6,"#EE5A72"],[11,13,1,"#B23A55"],[5,14,1,"#B23A55"],[6,14,4,"#EE5A72"],[10,14,1,"#B23A55"],[6,15,1,"#B23A55"],[7,15,2,"#EE5A72"],[9,15,1,"#B23A55"]]},"sp-cake":{"w":16,"h":16,"bx":1,"by":0,"bw":14,"bh":15,"runs":[[7,0,2,"#C9809F"],[9,0,1,"#3F7D57"],[10,0,1,"#C9809F"],[6,1,1,"#C9809F"],[7,1,1,"#FFFFFF"],[8,1,1,"#3F7D57"],[9,1,1,"#C9809F"],[6,2,1,"#C9809F"],[7,2,2,"#EE5A72"],[9,2,1,"#C9809F"],[5,3,7,"#C9809F"],[4,4,1,"#C9809F"],[5,4,1,"#F7A8C4"],[6,4,4,"#FFD1E2"],[10,4,2,"#F7A8C4"],[12,4,1,"#C9809F"],[3,5,1,"#C9809F"],[4,5,1,"#F7A8C4"],[5,5,1,"#FFFFFF"],[6,5,5,"#FFD1E2"],[11,5,2,"#F7A8C4"],[13,5,1,"#C9809F"],[2,6,1,"#C9809F"],[3,6,1,"#F7A8C4"],[4,6,1,"#FFFFFF"],[5,6,1,"#F7A8C4"],[6,6,4,"#FFD1E2"],[10,6,3,"#F7A8C4"],[13,6,1,"#C9809F"],[1,7,1,"#C9809F"],[2,7,7,"#F7A8C4"],[9,7,1,"#FFFFFF"],[10,7,4,"#F7A8C4"],[14,7,1,"#C9809F"],[2,8,1,"#C9809F"],[3,8,10,"#F7A8C4"],[13,8,1,"#C9809F"],[2,9,1,"#C9809F"],[3,9,2,"#FFE0D3"],[5,9,6,"#F7A8C4"],[11,9,2,"#FFE0D3"],[13,9,1,"#C9809F"],[2,10,1,"#C9809F"],[3,10,1,"#FFF3E2"],[4,10,1,"#FFD1E2"],[5,10,6,"#FFF3E2"],[11,10,1,"#FFD1E2"],[12,10,1,"#FFF3E2"],[13,10,1,"#C9809F"],[2,11,1,"#C9809F"],[3,11,1,"#FFF3E2"],[4,11,1,"#FFD1E2"],[5,11,1,"#FFF3E2"],[6,11,4,"#FFD1E2"],[10,11,1,"#FFF3E2"],[11,11,1,"#FFD1E2"],[12,11,1,"#FFF3E2"],[13,11,1,"#C9809F"],[2,12,1,"#C9809F"],[3,12,1,"#FFF3E2"],[4,12,1,"#FFD1E2"],[5,12,6,"#FFF3E2"],[11,12,1,"#FFD1E2"],[12,12,1,"#FFF3E2"],[13,12,1,"#C9809F"],[2,13,1,"#C9809F"],[3,13,10,"#FFF3E2"],[13,13,1,"#C9809F"],[3,14,10,"#C9809F"]]},"sp-donut":{"w":16,"h":16,"bx":0,"by":0,"bw":16,"bh":16,"runs":[[7,0,2,"#C9506F"],[4,1,3,"#C9506F"],[7,1,2,"#F7A8C4"],[9,1,3,"#C9506F"],[3,2,1,"#C9506F"],[4,2,3,"#F7A8C4"],[7,2,2,"#FFD1E2"],[9,2,3,"#F7A8C4"],[12,2,1,"#C9506F"],[2,3,1,"#C9506F"],[3,3,2,"#F7A8C4"],[5,3,2,"#FFD1E2"],[7,3,1,"#5B9BE8"],[8,3,3,"#FFD1E2"],[11,3,2,"#F7A8C4"],[13,3,1,"#C9506F"],[1,4,1,"#C9506F"],[2,4,2,"#F7A8C4"],[4,4,5,"#FFD1E2"],[9,4,1,"#F7C95E"],[10,4,2,"#FFD1E2"],[12,4,2,"#F7A8C4"],[14,4,1,"#C9506F"],[1,5,1,"#C9506F"],[2,5,1,"#F7A8C4"],[3,5,1,"#FFD1E2"],[4,5,1,"#E4678F"],[5,5,8,"#FFD1E2"],[13,5,1,"#F7A8C4"],[14,5,1,"#C9506F"],[1,6,1,"#C9506F"],[2,6,1,"#F7A8C4"],[3,6,3,"#FFD1E2"],[6,6,4,"#C9506F"],[10,6,3,"#FFD1E2"],[13,6,1,"#F7A8C4"],[14,6,1,"#C9506F"],[0,7,1,"#C9506F"],[1,7,1,"#F7A8C4"],[2,7,4,"#FFD1E2"],[6,7,1,"#C9506F"],[9,7,1,"#C9506F"],[10,7,1,"#FFD1E2"],[11,7,1,"#7ED0C4"],[12,7,2,"#FFD1E2"],[14,7,1,"#F7A8C4"],[15,7,1,"#C9506F"],[0,8,1,"#C9506F"],[1,8,1,"#F7A8C4"],[2,8,4,"#FFD1E2"],[6,8,1,"#C9506F"],[9,8,1,"#C9506F"],[10,8,4,"#FFD1E2"],[14,8,1,"#F7A8C4"],[15,8,1,"#C9506F"],[1,9,1,"#C9506F"],[2,9,1,"#F7A8C4"],[3,9,1,"#FFD1E2"],[4,9,1,"#5B9BE8"],[5,9,1,"#FFD1E2"],[6,9,4,"#C9506F"],[10,9,3,"#FFD1E2"],[13,9,1,"#F7A8C4"],[14,9,1,"#C9506F"],[1,10,1,"#C9506F"],[2,10,1,"#F7A8C4"],[3,10,6,"#FFD1E2"],[9,10,1,"#E4678F"],[10,10,3,"#FFD1E2"],[13,10,1,"#F7A8C4"],[14,10,1,"#C9506F"],[1,11,1,"#C9506F"],[2,11,2,"#F7A8C4"],[4,11,8,"#FFD1E2"],[12,11,2,"#F7A8C4"],[14,11,1,"#C9506F"],[2,12,1,"#C9506F"],[3,12,2,"#F7A8C4"],[5,12,6,"#FFD1E2"],[11,12,2,"#F7A8C4"],[13,12,1,"#C9506F"],[3,13,1,"#C9506F"],[4,13,3,"#F7A8C4"],[7,13,2,"#FFD1E2"],[9,13,3,"#F7A8C4"],[12,13,1,"#C9506F"],[4,14,3,"#C9506F"],[7,14,2,"#F7A8C4"],[9,14,3,"#C9506F"],[7,15,2,"#C9506F"]]},"sp-soda":{"w":16,"h":16,"bx":2,"by":0,"bw":12,"bh":16,"runs":[[9,0,2,"#4E7FB0"],[8,1,1,"#4E7FB0"],[9,1,2,"#E4678F"],[11,1,1,"#4E7FB0"],[5,2,4,"#4E7FB0"],[9,2,1,"#E4678F"],[10,2,1,"#4E7FB0"],[3,3,2,"#4E7FB0"],[5,3,6,"#FFFFFF"],[11,3,2,"#4E7FB0"],[2,4,1,"#4E7FB0"],[3,4,10,"#FFFFFF"],[13,4,1,"#4E7FB0"],[2,5,1,"#4E7FB0"],[3,5,10,"#FFD1E2"],[13,5,1,"#4E7FB0"],[3,6,1,"#4E7FB0"],[4,6,1,"#D6ECFB"],[5,6,1,"#FFFFFF"],[6,6,6,"#D6ECFB"],[12,6,1,"#4E7FB0"],[3,7,1,"#4E7FB0"],[4,7,1,"#D6ECFB"],[5,7,1,"#FFFFFF"],[6,7,6,"#D6ECFB"],[12,7,1,"#4E7FB0"],[3,8,1,"#4E7FB0"],[4,8,1,"#D6ECFB"],[5,8,1,"#FFFFFF"],[6,8,6,"#D6ECFB"],[12,8,1,"#4E7FB0"],[3,9,1,"#4E7FB0"],[4,9,1,"#D6ECFB"],[5,9,6,"#7FD4E8"],[11,9,1,"#D6ECFB"],[12,9,1,"#4E7FB0"],[3,10,1,"#4E7FB0"],[4,10,1,"#D6ECFB"],[5,10,6,"#7FD4E8"],[11,10,1,"#D6ECFB"],[12,10,1,"#4E7FB0"],[4,11,1,"#4E7FB0"],[5,11,1,"#D6ECFB"],[6,11,1,"#FFFFFF"],[7,11,4,"#D6ECFB"],[11,11,1,"#4E7FB0"],[4,12,1,"#4E7FB0"],[5,12,1,"#D6ECFB"],[6,12,4,"#7FD4E8"],[10,12,1,"#D6ECFB"],[11,12,1,"#4E7FB0"],[4,13,1,"#4E7FB0"],[5,13,1,"#D6ECFB"],[6,13,1,"#FFFFFF"],[7,13,4,"#D6ECFB"],[11,13,1,"#4E7FB0"],[4,14,1,"#4E7FB0"],[5,14,1,"#D6ECFB"],[6,14,1,"#FFFFFF"],[7,14,4,"#D6ECFB"],[11,14,1,"#4E7FB0"],[5,15,6,"#4E7FB0"]]},"sp-film":{"w":16,"h":16,"bx":0,"by":3,"bw":16,"bh":10,"runs":[[1,3,14,"#4A3242"],[0,4,1,"#4A3242"],[1,4,14,"#8B5C72"],[15,4,1,"#4A3242"],[0,5,1,"#4A3242"],[1,5,1,"#8B5C72"],[2,5,1,"#FFFFFF"],[3,5,1,"#8B5C72"],[4,5,1,"#FFFFFF"],[5,5,1,"#8B5C72"],[6,5,1,"#FFFFFF"],[7,5,1,"#8B5C72"],[8,5,1,"#FFFFFF"],[9,5,1,"#8B5C72"],[10,5,1,"#FFFFFF"],[11,5,1,"#8B5C72"],[12,5,1,"#FFFFFF"],[13,5,1,"#8B5C72"],[14,5,1,"#FFFFFF"],[15,5,1,"#4A3242"],[0,6,1,"#4A3242"],[1,6,2,"#8B5C72"],[3,6,10,"#D6ECFB"],[13,6,2,"#8B5C72"],[15,6,1,"#4A3242"],[0,7,1,"#4A3242"],[1,7,2,"#8B5C72"],[3,7,1,"#D6ECFB"],[4,7,5,"#E4678F"],[9,7,1,"#D6ECFB"],[10,7,1,"#FFFFFF"],[11,7,2,"#D6ECFB"],[13,7,2,"#8B5C72"],[15,7,1,"#4A3242"],[0,8,1,"#4A3242"],[1,8,2,"#8B5C72"],[3,8,1,"#D6ECFB"],[4,8,5,"#E4678F"],[9,8,4,"#D6ECFB"],[13,8,2,"#8B5C72"],[15,8,1,"#4A3242"],[0,9,1,"#4A3242"],[1,9,2,"#8B5C72"],[3,9,10,"#D6ECFB"],[13,9,2,"#8B5C72"],[15,9,1,"#4A3242"],[0,10,1,"#4A3242"],[1,10,1,"#8B5C72"],[2,10,1,"#FFFFFF"],[3,10,1,"#8B5C72"],[4,10,1,"#FFFFFF"],[5,10,1,"#8B5C72"],[6,10,1,"#FFFFFF"],[7,10,1,"#8B5C72"],[8,10,1,"#FFFFFF"],[9,10,1,"#8B5C72"],[10,10,1,"#FFFFFF"],[11,10,1,"#8B5C72"],[12,10,1,"#FFFFFF"],[13,10,1,"#8B5C72"],[14,10,1,"#FFFFFF"],[15,10,1,"#4A3242"],[0,11,1,"#4A3242"],[1,11,14,"#8B5C72"],[15,11,1,"#4A3242"],[1,12,14,"#4A3242"]]},"sp-popcorn":{"w":16,"h":16,"bx":2,"by":3,"bw":12,"bh":13,"runs":[[6,3,4,"#C9506F"],[5,4,1,"#C9506F"],[6,4,1,"#F7C95E"],[7,4,2,"#FFFFFF"],[9,4,1,"#F7C95E"],[10,4,1,"#C9506F"],[3,5,2,"#C9506F"],[5,5,6,"#FFFFFF"],[11,5,2,"#C9506F"],[2,6,1,"#C9506F"],[3,6,1,"#F7C95E"],[4,6,8,"#FFFFFF"],[12,6,1,"#F7C95E"],[13,6,1,"#C9506F"],[2,7,1,"#C9506F"],[3,7,10,"#FFFFFF"],[13,7,1,"#C9506F"],[2,8,1,"#C9506F"],[3,8,4,"#FFFFFF"],[7,8,2,"#E4678F"],[9,8,4,"#FFFFFF"],[13,8,1,"#C9506F"],[3,9,1,"#C9506F"],[4,9,1,"#FFFFFF"],[5,9,2,"#E4678F"],[7,9,1,"#FFFFFF"],[8,9,2,"#E4678F"],[10,9,1,"#FFFFFF"],[11,9,1,"#E4678F"],[12,9,1,"#C9506F"],[3,10,1,"#C9506F"],[4,10,1,"#FFFFFF"],[5,10,2,"#E4678F"],[7,10,1,"#FFFFFF"],[8,10,2,"#E4678F"],[10,10,1,"#FFFFFF"],[11,10,1,"#E4678F"],[12,10,1,"#C9506F"],[3,11,1,"#C9506F"],[4,11,1,"#FFFFFF"],[5,11,2,"#E4678F"],[7,11,1,"#FFFFFF"],[8,11,2,"#E4678F"],[10,11,1,"#FFFFFF"],[11,11,1,"#E4678F"],[12,11,1,"#C9506F"],[2,12,1,"#C9506F"],[3,12,1,"#FFFFFF"],[4,12,2,"#E4678F"],[6,12,1,"#FFFFFF"],[7,12,2,"#E4678F"],[9,12,1,"#FFFFFF"],[10,12,2,"#E4678F"],[12,12,1,"#FFFFFF"],[13,12,1,"#C9506F"],[2,13,1,"#C9506F"],[3,13,1,"#FFFFFF"],[4,13,2,"#E4678F"],[6,13,1,"#FFFFFF"],[7,13,2,"#E4678F"],[9,13,1,"#FFFFFF"],[10,13,2,"#E4678F"],[12,13,1,"#FFFFFF"],[13,13,1,"#C9506F"],[2,14,1,"#C9506F"],[3,14,1,"#FFFFFF"],[4,14,2,"#E4678F"],[6,14,1,"#FFFFFF"],[7,14,2,"#E4678F"],[9,14,1,"#FFFFFF"],[10,14,2,"#E4678F"],[12,14,1,"#FFFFFF"],[13,14,1,"#C9506F"],[3,15,10,"#C9506F"]]},"sp-bubble":{"w":16,"h":16,"bx":1,"by":2,"bw":14,"bh":12,"runs":[[3,2,10,"#B5557A"],[2,3,1,"#B5557A"],[3,3,10,"#FFFFFF"],[13,3,1,"#B5557A"],[1,4,1,"#B5557A"],[2,4,12,"#FFFFFF"],[14,4,1,"#B5557A"],[1,5,1,"#B5557A"],[2,5,12,"#FFFFFF"],[14,5,1,"#B5557A"],[1,6,1,"#B5557A"],[2,6,2,"#FFFFFF"],[4,6,2,"#E4678F"],[6,6,1,"#FFFFFF"],[7,6,2,"#E4678F"],[9,6,1,"#FFFFFF"],[10,6,2,"#E4678F"],[12,6,2,"#FFFFFF"],[14,6,1,"#B5557A"],[1,7,1,"#B5557A"],[2,7,2,"#FFFFFF"],[4,7,2,"#E4678F"],[6,7,1,"#FFFFFF"],[7,7,2,"#E4678F"],[9,7,1,"#FFFFFF"],[10,7,2,"#E4678F"],[12,7,2,"#FFFFFF"],[14,7,1,"#B5557A"],[1,8,1,"#B5557A"],[2,8,12,"#FFFFFF"],[14,8,1,"#B5557A"],[1,9,1,"#B5557A"],[2,9,12,"#FFFFFF"],[14,9,1,"#B5557A"],[2,10,1,"#B5557A"],[3,10,10,"#FFFFFF"],[13,10,1,"#B5557A"],[3,11,1,"#B5557A"],[4,11,2,"#FFFFFF"],[6,11,7,"#B5557A"],[3,12,1,"#B5557A"],[4,12,1,"#FFFFFF"],[5,12,1,"#B5557A"],[4,13,1,"#B5557A"]]},"sp-pin":{"w":16,"h":16,"bx":2,"by":1,"bw":12,"bh":15,"runs":[[5,1,6,"#C9506F"],[4,2,1,"#C9506F"],[5,2,6,"#E4678F"],[11,2,1,"#C9506F"],[3,3,1,"#C9506F"],[4,3,2,"#E4678F"],[6,3,4,"#FFD1E2"],[10,3,2,"#E4678F"],[12,3,1,"#C9506F"],[2,4,1,"#C9506F"],[3,4,2,"#E4678F"],[5,4,6,"#FFD1E2"],[11,4,2,"#E4678F"],[13,4,1,"#C9506F"],[2,5,1,"#C9506F"],[3,5,2,"#E4678F"],[5,5,2,"#FFD1E2"],[7,5,2,"#FFFFFF"],[9,5,2,"#FFD1E2"],[11,5,2,"#E4678F"],[13,5,1,"#C9506F"],[2,6,1,"#C9506F"],[3,6,2,"#E4678F"],[5,6,1,"#FFD1E2"],[6,6,4,"#FFFFFF"],[10,6,1,"#FFD1E2"],[11,6,2,"#E4678F"],[13,6,1,"#C9506F"],[2,7,1,"#C9506F"],[3,7,2,"#E4678F"],[5,7,2,"#FFD1E2"],[7,7,2,"#FFFFFF"],[9,7,2,"#FFD1E2"],[11,7,2,"#E4678F"],[13,7,1,"#C9506F"],[2,8,1,"#C9506F"],[3,8,2,"#E4678F"],[5,8,6,"#FFD1E2"],[11,8,2,"#E4678F"],[13,8,1,"#C9506F"],[3,9,1,"#C9506F"],[4,9,2,"#E4678F"],[6,9,4,"#FFD1E2"],[10,9,2,"#E4678F"],[12,9,1,"#C9506F"],[2,10,1,"#C9506F"],[3,10,10,"#E4678F"],[13,10,1,"#C9506F"],[3,11,1,"#C9506F"],[4,11,8,"#E4678F"],[12,11,1,"#C9506F"],[4,12,1,"#C9506F"],[5,12,6,"#E4678F"],[11,12,1,"#C9506F"],[5,13,1,"#C9506F"],[6,13,4,"#E4678F"],[10,13,1,"#C9506F"],[6,14,1,"#C9506F"],[7,14,2,"#E4678F"],[9,14,1,"#C9506F"],[7,15,2,"#C9506F"]]},"sp-mountain":{"w":16,"h":16,"bx":0,"by":0,"bw":16,"bh":15,"runs":[[7,0,2,"#3F7D57"],[6,1,1,"#3F7D57"],[7,1,2,"#FFFFFF"],[9,1,1,"#3F7D57"],[6,2,1,"#3F7D57"],[7,2,3,"#FFFFFF"],[10,2,1,"#3F7D57"],[5,3,1,"#3F7D57"],[6,3,4,"#FFFFFF"],[10,3,1,"#3F7D57"],[5,4,1,"#3F7D57"],[6,4,1,"#6FBF73"],[7,4,3,"#FFFFFF"],[10,4,1,"#3F7D57"],[11,4,1,"#3F7D57"],[4,5,1,"#3F7D57"],[5,5,1,"#6FBF73"],[6,5,4,"#FFFFFF"],[10,5,1,"#3F7D57"],[11,5,1,"#3F7D57"],[4,6,1,"#3F7D57"],[5,6,5,"#6FBF73"],[10,6,2,"#3F7D57"],[12,6,1,"#3F7D57"],[3,7,1,"#3F7D57"],[4,7,7,"#6FBF73"],[11,7,2,"#3F7D57"],[13,7,1,"#3F7D57"],[2,8,1,"#3F7D57"],[3,8,8,"#6FBF73"],[11,8,2,"#3F7D57"],[13,8,1,"#3F7D57"],[2,9,1,"#3F7D57"],[3,9,9,"#6FBF73"],[12,9,2,"#3F7D57"],[14,9,1,"#3F7D57"],[1,10,1,"#3F7D57"],[2,10,10,"#6FBF73"],[12,10,2,"#3F7D57"],[14,10,1,"#3F7D57"],[1,11,1,"#3F7D57"],[2,11,11,"#6FBF73"],[13,11,2,"#3F7D57"],[15,11,1,"#3F7D57"],[0,12,1,"#3F7D57"],[1,12,12,"#6FBF73"],[13,12,2,"#3F7D57"],[15,12,1,"#3F7D57"],[0,13,1,"#3F7D57"],[1,13,14,"#3F7D57"],[15,13,1,"#3F7D57"],[1,14,14,"#3F7D57"]]},"sp-wave":{"w":16,"h":16,"bx":0,"by":2,"bw":16,"bh":14,"runs":[[3,2,4,"#4E7FB0"],[2,3,1,"#4E7FB0"],[3,3,4,"#FFFFFF"],[7,3,1,"#4E7FB0"],[1,4,1,"#4E7FB0"],[2,4,1,"#FFFFFF"],[3,4,4,"#4E7FB0"],[7,4,1,"#FFFFFF"],[8,4,1,"#4E7FB0"],[1,5,2,"#4E7FB0"],[4,5,2,"#4E7FB0"],[7,5,3,"#4E7FB0"],[12,5,2,"#4E7FB0"],[0,6,1,"#4E7FB0"],[1,6,1,"#7FD4E8"],[2,6,2,"#4E7FB0"],[4,6,2,"#7FD4E8"],[6,6,2,"#4E7FB0"],[8,6,2,"#7FD4E8"],[10,6,2,"#4E7FB0"],[12,6,2,"#7FD4E8"],[14,6,1,"#4E7FB0"],[0,7,1,"#4E7FB0"],[1,7,14,"#7FD4E8"],[15,7,1,"#4E7FB0"],[1,8,1,"#4E7FB0"],[2,8,2,"#7FD4E8"],[4,8,2,"#4E7FB0"],[6,8,2,"#7FD4E8"],[8,8,2,"#4E7FB0"],[10,8,2,"#7FD4E8"],[12,8,2,"#4E7FB0"],[14,8,1,"#7FD4E8"],[15,8,1,"#4E7FB0"],[0,9,1,"#4E7FB0"],[1,9,1,"#5B9BE8"],[2,9,2,"#4E7FB0"],[4,9,2,"#5B9BE8"],[6,9,2,"#4E7FB0"],[8,9,2,"#5B9BE8"],[10,9,2,"#4E7FB0"],[12,9,2,"#5B9BE8"],[14,9,1,"#4E7FB0"],[0,10,1,"#4E7FB0"],[1,10,14,"#5B9BE8"],[15,10,1,"#4E7FB0"],[1,11,1,"#4E7FB0"],[2,11,2,"#5B9BE8"],[4,11,2,"#4E7FB0"],[6,11,2,"#5B9BE8"],[8,11,2,"#4E7FB0"],[10,11,2,"#5B9BE8"],[12,11,2,"#4E7FB0"],[14,11,1,"#5B9BE8"],[15,11,1,"#4E7FB0"],[0,12,1,"#4E7FB0"],[1,12,1,"#D6ECFB"],[2,12,2,"#4E7FB0"],[4,12,2,"#D6ECFB"],[6,12,2,"#4E7FB0"],[8,12,2,"#D6ECFB"],[10,12,2,"#4E7FB0"],[12,12,2,"#D6ECFB"],[14,12,1,"#4E7FB0"],[0,13,1,"#4E7FB0"],[1,13,14,"#D6ECFB"],[15,13,1,"#4E7FB0"],[1,14,1,"#4E7FB0"],[2,14,2,"#D6ECFB"],[4,14,2,"#4E7FB0"],[6,14,2,"#D6ECFB"],[8,14,2,"#4E7FB0"],[10,14,2,"#D6ECFB"],[12,14,2,"#4E7FB0"],[14,14,1,"#D6ECFB"],[15,14,1,"#4E7FB0"],[2,15,2,"#4E7FB0"],[6,15,2,"#4E7FB0"],[10,15,2,"#4E7FB0"],[14,15,1,"#4E7FB0"]]},"sp-book":{"w":16,"h":16,"bx":1,"by":2,"bw":14,"bh":13,"runs":[[2,2,8,"#B5557A"],[1,3,1,"#B5557A"],[2,3,2,"#F7A8C4"],[4,3,6,"#E4678F"],[10,3,4,"#B5557A"],[1,4,1,"#B5557A"],[2,4,2,"#F7A8C4"],[4,4,5,"#E4678F"],[9,4,5,"#FFF3E2"],[14,4,1,"#B5557A"],[1,5,1,"#B5557A"],[2,5,2,"#F7A8C4"],[4,5,5,"#E4678F"],[9,5,1,"#FFF3E2"],[10,5,3,"#FFFFFF"],[13,5,1,"#FFF3E2"],[14,5,1,"#B5557A"],[1,6,1,"#B5557A"],[2,6,2,"#F7A8C4"],[4,6,4,"#FFD1E2"],[8,6,1,"#E4678F"],[9,6,1,"#FFF3E2"],[10,6,3,"#FFE0D3"],[13,6,1,"#FFF3E2"],[14,6,1,"#B5557A"],[1,7,1,"#B5557A"],[2,7,2,"#F7A8C4"],[4,7,5,"#E4678F"],[9,7,1,"#FFF3E2"],[10,7,3,"#FFFFFF"],[13,7,1,"#FFF3E2"],[14,7,1,"#B5557A"],[1,8,1,"#B5557A"],[2,8,2,"#F7A8C4"],[4,8,5,"#E4678F"],[9,8,1,"#FFF3E2"],[10,8,3,"#FFE0D3"],[13,8,1,"#FFF3E2"],[14,8,1,"#B5557A"],[1,9,1,"#B5557A"],[2,9,2,"#F7A8C4"],[4,9,4,"#FFD1E2"],[8,9,1,"#E4678F"],[9,9,1,"#FFF3E2"],[10,9,3,"#FFFFFF"],[13,9,1,"#FFF3E2"],[14,9,1,"#B5557A"],[1,10,1,"#B5557A"],[2,10,2,"#F7A8C4"],[4,10,5,"#E4678F"],[9,10,1,"#FFF3E2"],[10,10,3,"#FFE0D3"],[13,10,1,"#FFF3E2"],[14,10,1,"#B5557A"],[1,11,1,"#B5557A"],[2,11,2,"#F7A8C4"],[4,11,5,"#E4678F"],[9,11,1,"#FFF3E2"],[10,11,3,"#FFFFFF"],[13,11,1,"#FFF3E2"],[14,11,1,"#B5557A"],[1,12,1,"#B5557A"],[2,12,2,"#F7A8C4"],[4,12,5,"#E4678F"],[9,12,5,"#FFF3E2"],[14,12,1,"#B5557A"],[1,13,1,"#B5557A"],[2,13,2,"#F7A8C4"],[4,13,6,"#E4678F"],[10,13,4,"#B5557A"],[2,14,8,"#B5557A"]]},"sp-dumbbell":{"w":16,"h":16,"bx":0,"by":4,"bw":16,"bh":9,"runs":[[2,4,3,"#4E7FB0"],[11,4,3,"#4E7FB0"],[1,5,1,"#4E7FB0"],[2,5,3,"#5B9BE8"],[5,5,1,"#4E7FB0"],[10,5,1,"#4E7FB0"],[11,5,3,"#5B9BE8"],[14,5,1,"#4E7FB0"],[0,6,1,"#4E7FB0"],[1,6,1,"#D6ECFB"],[2,6,1,"#5B9BE8"],[3,6,1,"#FFFFFF"],[4,6,1,"#5B9BE8"],[5,6,6,"#4E7FB0"],[11,6,1,"#5B9BE8"],[12,6,1,"#FFFFFF"],[13,6,1,"#5B9BE8"],[14,6,1,"#D6ECFB"],[15,6,1,"#4E7FB0"],[0,7,1,"#4E7FB0"],[1,7,1,"#D6ECFB"],[2,7,3,"#5B9BE8"],[5,7,4,"#4A3242"],[9,7,1,"#FFFFFF"],[10,7,1,"#4A3242"],[11,7,3,"#5B9BE8"],[14,7,1,"#D6ECFB"],[15,7,1,"#4E7FB0"],[0,8,1,"#4E7FB0"],[1,8,1,"#D6ECFB"],[2,8,3,"#5B9BE8"],[5,8,6,"#4A3242"],[11,8,3,"#5B9BE8"],[14,8,1,"#D6ECFB"],[15,8,1,"#4E7FB0"],[0,9,1,"#4E7FB0"],[1,9,1,"#D6ECFB"],[2,9,3,"#5B9BE8"],[5,9,6,"#4A3242"],[11,9,3,"#5B9BE8"],[14,9,1,"#D6ECFB"],[15,9,1,"#4E7FB0"],[0,10,1,"#4E7FB0"],[1,10,1,"#D6ECFB"],[2,10,3,"#5B9BE8"],[5,10,6,"#4E7FB0"],[11,10,3,"#5B9BE8"],[14,10,1,"#D6ECFB"],[15,10,1,"#4E7FB0"],[1,11,1,"#4E7FB0"],[2,11,3,"#5B9BE8"],[5,11,1,"#4E7FB0"],[10,11,1,"#4E7FB0"],[11,11,3,"#5B9BE8"],[14,11,1,"#4E7FB0"],[2,12,3,"#4E7FB0"],[11,12,3,"#4E7FB0"]]},"sp-palette":{"w":16,"h":16,"bx":0,"by":1,"bw":16,"bh":15,"runs":[[7,1,2,"#C9A98A"],[4,2,3,"#C9A98A"],[7,2,2,"#FFF3E2"],[9,2,3,"#C9A98A"],[3,3,1,"#C9A98A"],[4,3,8,"#FFF3E2"],[12,3,1,"#C9A98A"],[2,4,1,"#C9A98A"],[3,4,4,"#FFF3E2"],[7,4,2,"#F7C95E"],[9,4,4,"#FFF3E2"],[13,4,1,"#C9A98A"],[1,5,1,"#C9A98A"],[2,5,2,"#FFF3E2"],[4,5,2,"#E4678F"],[6,5,1,"#FFF3E2"],[7,5,2,"#F7C95E"],[9,5,5,"#FFF3E2"],[14,5,1,"#C9A98A"],[1,6,1,"#C9A98A"],[2,6,2,"#FFF3E2"],[4,6,2,"#E4678F"],[6,6,1,"#FFF3E2"],[7,6,2,"#F7C95E"],[9,6,1,"#FFF3E2"],[10,6,2,"#7ED0C4"],[12,6,2,"#FFF3E2"],[14,6,1,"#C9A98A"],[0,7,1,"#C9A98A"],[1,7,3,"#FFF3E2"],[4,7,2,"#E4678F"],[6,7,4,"#FFF3E2"],[10,7,2,"#7ED0C4"],[12,7,3,"#FFF3E2"],[15,7,1,"#C9A98A"],[0,8,1,"#C9A98A"],[1,8,14,"#FFF3E2"],[15,8,1,"#C9A98A"],[0,9,1,"#C9A98A"],[1,9,3,"#FFF3E2"],[4,9,2,"#5B9BE8"],[6,9,9,"#FFF3E2"],[15,9,1,"#C9A98A"],[1,10,1,"#C9A98A"],[2,10,2,"#FFF3E2"],[4,10,2,"#5B9BE8"],[6,10,3,"#FFF3E2"],[9,10,1,"#FFE0D3"],[10,10,3,"#C9A98A"],[13,10,1,"#FFF3E2"],[14,10,1,"#C9A98A"],[1,11,1,"#C9A98A"],[2,11,7,"#FFF3E2"],[9,11,1,"#C9A98A"],[12,11,1,"#C9A98A"],[13,11,1,"#FFF3E2"],[14,11,1,"#C9A98A"],[2,12,1,"#C9A98A"],[3,12,6,"#FFF3E2"],[9,12,3,"#C9A98A"],[13,12,1,"#C9A98A"],[3,13,1,"#C9A98A"],[4,13,8,"#FFF3E2"],[12,13,1,"#C9A98A"],[4,14,3,"#C9A98A"],[7,14,2,"#FFF3E2"],[9,14,3,"#C9A98A"],[7,15,2,"#C9A98A"]]},"sp-gamepad":{"w":16,"h":16,"bx":0,"by":3,"bw":16,"bh":10,"runs":[[2,3,12,"#8E7FB0"],[1,4,1,"#8E7FB0"],[2,4,12,"#C9B4E8"],[14,4,1,"#8E7FB0"],[1,5,1,"#8E7FB0"],[2,5,12,"#C9B4E8"],[14,5,1,"#8E7FB0"],[0,6,1,"#8E7FB0"],[1,6,1,"#C9B4E8"],[2,6,12,"#B9A6D9"],[14,6,1,"#C9B4E8"],[15,6,1,"#8E7FB0"],[0,7,1,"#8E7FB0"],[1,7,1,"#C9B4E8"],[2,7,1,"#B9A6D9"],[3,7,1,"#4A3242"],[4,7,7,"#B9A6D9"],[11,7,1,"#E4678F"],[12,7,2,"#B9A6D9"],[14,7,1,"#C9B4E8"],[15,7,1,"#8E7FB0"],[0,8,1,"#8E7FB0"],[1,8,1,"#FFFFFF"],[2,8,3,"#4A3242"],[5,8,5,"#B9A6D9"],[10,8,1,"#F7C95E"],[11,8,1,"#B9A6D9"],[12,8,1,"#F7C95E"],[13,8,1,"#B9A6D9"],[14,8,1,"#FFFFFF"],[15,8,1,"#8E7FB0"],[0,9,1,"#8E7FB0"],[1,9,1,"#C9B4E8"],[2,9,1,"#B9A6D9"],[3,9,1,"#4A3242"],[4,9,7,"#B9A6D9"],[11,9,1,"#E4678F"],[12,9,2,"#B9A6D9"],[14,9,1,"#C9B4E8"],[15,9,1,"#8E7FB0"],[0,10,1,"#8E7FB0"],[1,10,14,"#C9B4E8"],[15,10,1,"#8E7FB0"],[0,11,1,"#8E7FB0"],[1,11,14,"#C9B4E8"],[15,11,1,"#8E7FB0"],[1,12,14,"#8E7FB0"]]},"sp-star":{"w":16,"h":16,"bx":1,"by":2,"bw":14,"bh":13,"runs":[[7,2,2,"#B08A2E"],[6,3,1,"#B08A2E"],[7,3,2,"#F7C95E"],[9,3,1,"#B08A2E"],[6,4,1,"#B08A2E"],[7,4,2,"#F7C95E"],[9,4,1,"#B08A2E"],[2,5,4,"#B08A2E"],[6,5,4,"#F7C95E"],[10,5,4,"#B08A2E"],[1,6,1,"#B08A2E"],[2,6,4,"#F7C95E"],[6,6,1,"#FFF3C8"],[7,6,1,"#F7C95E"],[8,6,1,"#FFF3C8"],[9,6,5,"#F7C95E"],[14,6,1,"#B08A2E"],[2,7,1,"#B08A2E"],[3,7,2,"#F7C95E"],[5,7,1,"#FFF3C8"],[6,7,7,"#F7C95E"],[13,7,1,"#B08A2E"],[3,8,1,"#B08A2E"],[4,8,8,"#F7C95E"],[12,8,1,"#B08A2E"],[4,9,1,"#B08A2E"],[5,9,2,"#F7C95E"],[7,9,1,"#FFF3C8"],[8,9,3,"#F7C95E"],[11,9,1,"#B08A2E"],[4,10,1,"#B08A2E"],[5,10,6,"#F7C95E"],[11,10,1,"#B08A2E"],[4,11,1,"#B08A2E"],[5,11,6,"#F7C95E"],[11,11,1,"#B08A2E"],[3,12,1,"#B08A2E"],[4,12,2,"#F7C95E"],[6,12,4,"#B08A2E"],[10,12,2,"#F7C95E"],[12,12,1,"#B08A2E"],[3,13,1,"#B08A2E"],[4,13,1,"#F7C95E"],[5,13,1,"#B08A2E"],[10,13,1,"#B08A2E"],[11,13,1,"#F7C95E"],[12,13,1,"#B08A2E"],[4,14,1,"#B08A2E"],[11,14,1,"#B08A2E"]]},"sp-sparkle":{"w":16,"h":16,"bx":2,"by":2,"bw":12,"bh":12,"runs":[[7,2,2,"#C9506F"],[6,3,1,"#C9506F"],[7,3,2,"#FFD1E2"],[9,3,1,"#C9506F"],[6,4,1,"#C9506F"],[7,4,2,"#FFD1E2"],[9,4,1,"#C9506F"],[5,5,1,"#C9506F"],[6,5,1,"#FFD1E2"],[7,5,1,"#F7A8C4"],[8,5,2,"#FFD1E2"],[10,5,1,"#C9506F"],[3,6,2,"#C9506F"],[5,6,6,"#FFD1E2"],[11,6,2,"#C9506F"],[2,7,1,"#C9506F"],[3,7,2,"#FFD1E2"],[5,7,1,"#F7A8C4"],[6,7,1,"#FFD1E2"],[7,7,2,"#FFFFFF"],[9,7,4,"#FFD1E2"],[13,7,1,"#C9506F"],[2,8,1,"#C9506F"],[3,8,4,"#FFD1E2"],[7,8,2,"#FFFFFF"],[9,8,4,"#FFD1E2"],[13,8,1,"#C9506F"],[3,9,2,"#C9506F"],[5,9,6,"#FFD1E2"],[11,9,2,"#C9506F"],[5,10,1,"#C9506F"],[6,10,4,"#FFD1E2"],[10,10,1,"#C9506F"],[6,11,1,"#C9506F"],[7,11,2,"#FFD1E2"],[9,11,1,"#C9506F"],[6,12,1,"#C9506F"],[7,12,2,"#FFD1E2"],[9,12,1,"#C9506F"],[7,13,2,"#C9506F"]]},"sp-moon":{"w":16,"h":16,"bx":0,"by":1,"bw":15,"bh":15,"runs":[[5,1,2,"#B08A2E"],[4,2,1,"#B08A2E"],[5,2,2,"#F7C95E"],[7,2,1,"#B08A2E"],[3,3,1,"#B08A2E"],[4,3,3,"#F7C95E"],[7,3,1,"#B08A2E"],[2,4,1,"#B08A2E"],[3,4,3,"#F7C95E"],[6,4,1,"#B08A2E"],[1,5,1,"#B08A2E"],[2,5,2,"#F7C95E"],[4,5,1,"#FFF3C8"],[5,5,1,"#F7C95E"],[6,5,1,"#B08A2E"],[1,6,1,"#B08A2E"],[2,6,1,"#F7C95E"],[3,6,1,"#FFF3C8"],[4,6,2,"#F7C95E"],[6,6,1,"#B08A2E"],[1,7,1,"#B08A2E"],[2,7,1,"#F7C95E"],[3,7,1,"#FFF3C8"],[4,7,3,"#F7C95E"],[7,7,1,"#B08A2E"],[0,8,1,"#B08A2E"],[1,8,4,"#F7C95E"],[5,8,1,"#FFF3C8"],[6,8,1,"#F7C95E"],[7,8,1,"#B08A2E"],[1,9,1,"#B08A2E"],[2,9,6,"#F7C95E"],[8,9,1,"#B08A2E"],[1,10,1,"#B08A2E"],[2,10,7,"#F7C95E"],[9,10,5,"#B08A2E"],[1,11,1,"#B08A2E"],[2,11,12,"#F7C95E"],[14,11,1,"#B08A2E"],[2,12,1,"#B08A2E"],[3,12,10,"#F7C95E"],[13,12,1,"#B08A2E"],[3,13,1,"#B08A2E"],[4,13,8,"#F7C95E"],[12,13,1,"#B08A2E"],[4,14,1,"#B08A2E"],[5,14,6,"#F7C95E"],[11,14,1,"#B08A2E"],[5,15,6,"#B08A2E"]]},"sp-cd-rose":{"w":16,"h":16,"bx":0,"by":0,"bw":16,"bh":16,"runs":[[4,0,8,"#C9506F"],[3,1,1,"#C9506F"],[4,1,3,"#E4678F"],[7,1,2,"#FFD1E2"],[9,1,3,"#E4678F"],[12,1,1,"#C9506F"],[2,2,1,"#C9506F"],[3,2,1,"#E4678F"],[4,2,1,"#FFFFFF"],[5,2,5,"#FFD1E2"],[10,2,2,"#F7A8C4"],[12,2,1,"#E4678F"],[13,2,1,"#C9506F"],[1,3,1,"#C9506F"],[2,3,1,"#E4678F"],[3,3,1,"#FFFFFF"],[4,3,5,"#FFD1E2"],[9,3,4,"#F7A8C4"],[13,3,1,"#E4678F"],[14,3,1,"#C9506F"],[0,4,1,"#C9506F"],[1,4,1,"#E4678F"],[2,4,1,"#FFFFFF"],[3,4,5,"#FFD1E2"],[8,4,6,"#F7A8C4"],[14,4,1,"#E4678F"],[15,4,1,"#C9506F"],[0,5,1,"#C9506F"],[1,5,1,"#E4678F"],[2,5,5,"#FFD1E2"],[7,5,2,"#E4678F"],[9,5,5,"#F7A8C4"],[14,5,1,"#E4678F"],[15,5,1,"#C9506F"],[0,6,1,"#C9506F"],[1,6,1,"#E4678F"],[2,6,4,"#FFD1E2"],[6,6,4,"#FFFFFF"],[10,6,4,"#F7A8C4"],[14,6,1,"#E4678F"],[15,6,1,"#C9506F"],[0,7,1,"#C9506F"],[1,7,4,"#FFD1E2"],[5,7,1,"#E4678F"],[6,7,1,"#FFFFFF"],[7,7,2,"#C9506F"],[9,7,1,"#FFFFFF"],[10,7,1,"#E4678F"],[11,7,4,"#F7A8C4"],[15,7,1,"#C9506F"],[0,8,1,"#C9506F"],[1,8,3,"#FFD1E2"],[4,8,1,"#F7A8C4"],[5,8,1,"#E4678F"],[6,8,1,"#FFFFFF"],[7,8,2,"#C9506F"],[9,8,1,"#FFFFFF"],[10,8,1,"#E4678F"],[11,8,4,"#F7A8C4"],[15,8,1,"#C9506F"],[0,9,1,"#C9506F"],[1,9,1,"#E4678F"],[2,9,1,"#FFD1E2"],[3,9,3,"#F7A8C4"],[6,9,4,"#FFFFFF"],[10,9,4,"#F7A8C4"],[14,9,1,"#E4678F"],[15,9,1,"#C9506F"],[0,10,1,"#C9506F"],[1,10,1,"#E4678F"],[2,10,5,"#F7A8C4"],[7,10,2,"#E4678F"],[9,10,5,"#F7A8C4"],[14,10,1,"#E4678F"],[15,10,1,"#C9506F"],[0,11,1,"#C9506F"],[1,11,1,"#E4678F"],[2,11,12,"#F7A8C4"],[14,11,1,"#E4678F"],[15,11,1,"#C9506F"],[1,12,1,"#C9506F"],[2,12,1,"#E4678F"],[3,12,10,"#F7A8C4"],[13,12,1,"#E4678F"],[14,12,1,"#C9506F"],[2,13,1,"#C9506F"],[3,13,1,"#E4678F"],[4,13,8,"#F7A8C4"],[12,13,1,"#E4678F"],[13,13,1,"#C9506F"],[3,14,1,"#C9506F"],[4,14,3,"#E4678F"],[7,14,2,"#F7A8C4"],[9,14,3,"#E4678F"],[12,14,1,"#C9506F"],[4,15,8,"#C9506F"]]},"sp-cd-lav":{"w":16,"h":16,"bx":0,"by":0,"bw":16,"bh":16,"runs":[[4,0,8,"#8E7FB0"],[3,1,1,"#8E7FB0"],[4,1,3,"#C9B4E8"],[7,1,2,"#E8DDFB"],[9,1,3,"#C9B4E8"],[12,1,1,"#8E7FB0"],[2,2,1,"#8E7FB0"],[3,2,1,"#C9B4E8"],[4,2,1,"#FFFFFF"],[5,2,5,"#E8DDFB"],[10,2,2,"#B9A6D9"],[12,2,1,"#C9B4E8"],[13,2,1,"#8E7FB0"],[1,3,1,"#8E7FB0"],[2,3,1,"#C9B4E8"],[3,3,1,"#FFFFFF"],[4,3,5,"#E8DDFB"],[9,3,4,"#B9A6D9"],[13,3,1,"#C9B4E8"],[14,3,1,"#8E7FB0"],[0,4,1,"#8E7FB0"],[1,4,1,"#C9B4E8"],[2,4,1,"#FFFFFF"],[3,4,5,"#E8DDFB"],[8,4,6,"#B9A6D9"],[14,4,1,"#C9B4E8"],[15,4,1,"#8E7FB0"],[0,5,1,"#8E7FB0"],[1,5,1,"#C9B4E8"],[2,5,5,"#E8DDFB"],[7,5,2,"#C9B4E8"],[9,5,5,"#B9A6D9"],[14,5,1,"#C9B4E8"],[15,5,1,"#8E7FB0"],[0,6,1,"#8E7FB0"],[1,6,1,"#C9B4E8"],[2,6,4,"#E8DDFB"],[6,6,4,"#FFFFFF"],[10,6,4,"#B9A6D9"],[14,6,1,"#C9B4E8"],[15,6,1,"#8E7FB0"],[0,7,1,"#8E7FB0"],[1,7,4,"#E8DDFB"],[5,7,1,"#C9B4E8"],[6,7,1,"#FFFFFF"],[7,7,2,"#8E7FB0"],[9,7,1,"#FFFFFF"],[10,7,1,"#C9B4E8"],[11,7,4,"#B9A6D9"],[15,7,1,"#8E7FB0"],[0,8,1,"#8E7FB0"],[1,8,3,"#E8DDFB"],[4,8,1,"#B9A6D9"],[5,8,1,"#C9B4E8"],[6,8,1,"#FFFFFF"],[7,8,2,"#8E7FB0"],[9,8,1,"#FFFFFF"],[10,8,1,"#C9B4E8"],[11,8,4,"#B9A6D9"],[15,8,1,"#8E7FB0"],[0,9,1,"#8E7FB0"],[1,9,1,"#C9B4E8"],[2,9,1,"#E8DDFB"],[3,9,3,"#B9A6D9"],[6,9,4,"#FFFFFF"],[10,9,4,"#B9A6D9"],[14,9,1,"#C9B4E8"],[15,9,1,"#8E7FB0"],[0,10,1,"#8E7FB0"],[1,10,1,"#C9B4E8"],[2,10,5,"#B9A6D9"],[7,10,2,"#C9B4E8"],[9,10,5,"#B9A6D9"],[14,10,1,"#C9B4E8"],[15,10,1,"#8E7FB0"],[0,11,1,"#8E7FB0"],[1,11,1,"#C9B4E8"],[2,11,12,"#B9A6D9"],[14,11,1,"#C9B4E8"],[15,11,1,"#8E7FB0"],[1,12,1,"#8E7FB0"],[2,12,1,"#C9B4E8"],[3,12,10,"#B9A6D9"],[13,12,1,"#C9B4E8"],[14,12,1,"#8E7FB0"],[2,13,1,"#8E7FB0"],[3,13,1,"#C9B4E8"],[4,13,8,"#B9A6D9"],[12,13,1,"#C9B4E8"],[13,13,1,"#8E7FB0"],[3,14,1,"#8E7FB0"],[4,14,3,"#C9B4E8"],[7,14,2,"#B9A6D9"],[9,14,3,"#C9B4E8"],[12,14,1,"#8E7FB0"],[4,15,8,"#8E7FB0"]]},"sp-cd-sky":{"w":16,"h":16,"bx":0,"by":0,"bw":16,"bh":16,"runs":[[4,0,8,"#4E7FB0"],[3,1,1,"#4E7FB0"],[4,1,3,"#5B9BE8"],[7,1,2,"#D6ECFB"],[9,1,3,"#5B9BE8"],[12,1,1,"#4E7FB0"],[2,2,1,"#4E7FB0"],[3,2,1,"#5B9BE8"],[4,2,1,"#FFFFFF"],[5,2,5,"#D6ECFB"],[10,2,2,"#7FD4E8"],[12,2,1,"#5B9BE8"],[13,2,1,"#4E7FB0"],[1,3,1,"#4E7FB0"],[2,3,1,"#5B9BE8"],[3,3,1,"#FFFFFF"],[4,3,5,"#D6ECFB"],[9,3,4,"#7FD4E8"],[13,3,1,"#5B9BE8"],[14,3,1,"#4E7FB0"],[0,4,1,"#4E7FB0"],[1,4,1,"#5B9BE8"],[2,4,1,"#FFFFFF"],[3,4,5,"#D6ECFB"],[8,4,6,"#7FD4E8"],[14,4,1,"#5B9BE8"],[15,4,1,"#4E7FB0"],[0,5,1,"#4E7FB0"],[1,5,1,"#5B9BE8"],[2,5,5,"#D6ECFB"],[7,5,2,"#5B9BE8"],[9,5,5,"#7FD4E8"],[14,5,1,"#5B9BE8"],[15,5,1,"#4E7FB0"],[0,6,1,"#4E7FB0"],[1,6,1,"#5B9BE8"],[2,6,4,"#D6ECFB"],[6,6,4,"#FFFFFF"],[10,6,4,"#7FD4E8"],[14,6,1,"#5B9BE8"],[15,6,1,"#4E7FB0"],[0,7,1,"#4E7FB0"],[1,7,4,"#D6ECFB"],[5,7,1,"#5B9BE8"],[6,7,1,"#FFFFFF"],[7,7,2,"#4E7FB0"],[9,7,1,"#FFFFFF"],[10,7,1,"#5B9BE8"],[11,7,4,"#7FD4E8"],[15,7,1,"#4E7FB0"],[0,8,1,"#4E7FB0"],[1,8,3,"#D6ECFB"],[4,8,1,"#7FD4E8"],[5,8,1,"#5B9BE8"],[6,8,1,"#FFFFFF"],[7,8,2,"#4E7FB0"],[9,8,1,"#FFFFFF"],[10,8,1,"#5B9BE8"],[11,8,4,"#7FD4E8"],[15,8,1,"#4E7FB0"],[0,9,1,"#4E7FB0"],[1,9,1,"#5B9BE8"],[2,9,1,"#D6ECFB"],[3,9,3,"#7FD4E8"],[6,9,4,"#FFFFFF"],[10,9,4,"#7FD4E8"],[14,9,1,"#5B9BE8"],[15,9,1,"#4E7FB0"],[0,10,1,"#4E7FB0"],[1,10,1,"#5B9BE8"],[2,10,5,"#7FD4E8"],[7,10,2,"#5B9BE8"],[9,10,5,"#7FD4E8"],[14,10,1,"#5B9BE8"],[15,10,1,"#4E7FB0"],[0,11,1,"#4E7FB0"],[1,11,1,"#5B9BE8"],[2,11,12,"#7FD4E8"],[14,11,1,"#5B9BE8"],[15,11,1,"#4E7FB0"],[1,12,1,"#4E7FB0"],[2,12,1,"#5B9BE8"],[3,12,10,"#7FD4E8"],[13,12,1,"#5B9BE8"],[14,12,1,"#4E7FB0"],[2,13,1,"#4E7FB0"],[3,13,1,"#5B9BE8"],[4,13,8,"#7FD4E8"],[12,13,1,"#5B9BE8"],[13,13,1,"#4E7FB0"],[3,14,1,"#4E7FB0"],[4,14,3,"#5B9BE8"],[7,14,2,"#7FD4E8"],[9,14,3,"#5B9BE8"],[12,14,1,"#4E7FB0"],[4,15,8,"#4E7FB0"]]},"sp-cd-mint":{"w":16,"h":16,"bx":0,"by":0,"bw":16,"bh":16,"runs":[[4,0,8,"#3F7D74"],[3,1,1,"#3F7D74"],[4,1,3,"#3F7D57"],[7,1,2,"#D6F2E4"],[9,1,3,"#3F7D57"],[12,1,1,"#3F7D74"],[2,2,1,"#3F7D74"],[3,2,1,"#3F7D57"],[4,2,1,"#FFFFFF"],[5,2,5,"#D6F2E4"],[10,2,2,"#7ED0C4"],[12,2,1,"#3F7D57"],[13,2,1,"#3F7D74"],[1,3,1,"#3F7D74"],[2,3,1,"#3F7D57"],[3,3,1,"#FFFFFF"],[4,3,5,"#D6F2E4"],[9,3,4,"#7ED0C4"],[13,3,1,"#3F7D57"],[14,3,1,"#3F7D74"],[0,4,1,"#3F7D74"],[1,4,1,"#3F7D57"],[2,4,1,"#FFFFFF"],[3,4,5,"#D6F2E4"],[8,4,6,"#7ED0C4"],[14,4,1,"#3F7D57"],[15,4,1,"#3F7D74"],[0,5,1,"#3F7D74"],[1,5,1,"#3F7D57"],[2,5,5,"#D6F2E4"],[7,5,2,"#3F7D57"],[9,5,5,"#7ED0C4"],[14,5,1,"#3F7D57"],[15,5,1,"#3F7D74"],[0,6,1,"#3F7D74"],[1,6,1,"#3F7D57"],[2,6,4,"#D6F2E4"],[6,6,4,"#FFFFFF"],[10,6,4,"#7ED0C4"],[14,6,1,"#3F7D57"],[15,6,1,"#3F7D74"],[0,7,1,"#3F7D74"],[1,7,4,"#D6F2E4"],[5,7,1,"#3F7D57"],[6,7,1,"#FFFFFF"],[7,7,2,"#3F7D74"],[9,7,1,"#FFFFFF"],[10,7,1,"#3F7D57"],[11,7,4,"#7ED0C4"],[15,7,1,"#3F7D74"],[0,8,1,"#3F7D74"],[1,8,3,"#D6F2E4"],[4,8,1,"#7ED0C4"],[5,8,1,"#3F7D57"],[6,8,1,"#FFFFFF"],[7,8,2,"#3F7D74"],[9,8,1,"#FFFFFF"],[10,8,1,"#3F7D57"],[11,8,4,"#7ED0C4"],[15,8,1,"#3F7D74"],[0,9,1,"#3F7D74"],[1,9,1,"#3F7D57"],[2,9,1,"#D6F2E4"],[3,9,3,"#7ED0C4"],[6,9,4,"#FFFFFF"],[10,9,4,"#7ED0C4"],[14,9,1,"#3F7D57"],[15,9,1,"#3F7D74"],[0,10,1,"#3F7D74"],[1,10,1,"#3F7D57"],[2,10,5,"#7ED0C4"],[7,10,2,"#3F7D57"],[9,10,5,"#7ED0C4"],[14,10,1,"#3F7D57"],[15,10,1,"#3F7D74"],[0,11,1,"#3F7D74"],[1,11,1,"#3F7D57"],[2,11,12,"#7ED0C4"],[14,11,1,"#3F7D57"],[15,11,1,"#3F7D74"],[1,12,1,"#3F7D74"],[2,12,1,"#3F7D57"],[3,12,10,"#7ED0C4"],[13,12,1,"#3F7D57"],[14,12,1,"#3F7D74"],[2,13,1,"#3F7D74"],[3,13,1,"#3F7D57"],[4,13,8,"#7ED0C4"],[12,13,1,"#3F7D57"],[13,13,1,"#3F7D74"],[3,14,1,"#3F7D74"],[4,14,3,"#3F7D57"],[7,14,2,"#7ED0C4"],[9,14,3,"#3F7D57"],[12,14,1,"#3F7D74"],[4,15,8,"#3F7D74"]]},"sp-cd-lemon":{"w":16,"h":16,"bx":0,"by":0,"bw":16,"bh":16,"runs":[[4,0,8,"#B08A2E"],[3,1,1,"#B08A2E"],[4,1,3,"#C08A5E"],[7,1,2,"#FFF3C8"],[9,1,3,"#C08A5E"],[12,1,1,"#B08A2E"],[2,2,1,"#B08A2E"],[3,2,1,"#C08A5E"],[4,2,1,"#FFFFFF"],[5,2,5,"#FFF3C8"],[10,2,2,"#F7C95E"],[12,2,1,"#C08A5E"],[13,2,1,"#B08A2E"],[1,3,1,"#B08A2E"],[2,3,1,"#C08A5E"],[3,3,1,"#FFFFFF"],[4,3,5,"#FFF3C8"],[9,3,4,"#F7C95E"],[13,3,1,"#C08A5E"],[14,3,1,"#B08A2E"],[0,4,1,"#B08A2E"],[1,4,1,"#C08A5E"],[2,4,1,"#FFFFFF"],[3,4,5,"#FFF3C8"],[8,4,6,"#F7C95E"],[14,4,1,"#C08A5E"],[15,4,1,"#B08A2E"],[0,5,1,"#B08A2E"],[1,5,1,"#C08A5E"],[2,5,5,"#FFF3C8"],[7,5,2,"#C08A5E"],[9,5,5,"#F7C95E"],[14,5,1,"#C08A5E"],[15,5,1,"#B08A2E"],[0,6,1,"#B08A2E"],[1,6,1,"#C08A5E"],[2,6,4,"#FFF3C8"],[6,6,4,"#FFFFFF"],[10,6,4,"#F7C95E"],[14,6,1,"#C08A5E"],[15,6,1,"#B08A2E"],[0,7,1,"#B08A2E"],[1,7,4,"#FFF3C8"],[5,7,1,"#C08A5E"],[6,7,1,"#FFFFFF"],[7,7,2,"#B08A2E"],[9,7,1,"#FFFFFF"],[10,7,1,"#C08A5E"],[11,7,4,"#F7C95E"],[15,7,1,"#B08A2E"],[0,8,1,"#B08A2E"],[1,8,3,"#FFF3C8"],[4,8,1,"#F7C95E"],[5,8,1,"#C08A5E"],[6,8,1,"#FFFFFF"],[7,8,2,"#B08A2E"],[9,8,1,"#FFFFFF"],[10,8,1,"#C08A5E"],[11,8,4,"#F7C95E"],[15,8,1,"#B08A2E"],[0,9,1,"#B08A2E"],[1,9,1,"#C08A5E"],[2,9,1,"#FFF3C8"],[3,9,3,"#F7C95E"],[6,9,4,"#FFFFFF"],[10,9,4,"#F7C95E"],[14,9,1,"#C08A5E"],[15,9,1,"#B08A2E"],[0,10,1,"#B08A2E"],[1,10,1,"#C08A5E"],[2,10,5,"#F7C95E"],[7,10,2,"#C08A5E"],[9,10,5,"#F7C95E"],[14,10,1,"#C08A5E"],[15,10,1,"#B08A2E"],[0,11,1,"#B08A2E"],[1,11,1,"#C08A5E"],[2,11,12,"#F7C95E"],[14,11,1,"#C08A5E"],[15,11,1,"#B08A2E"],[1,12,1,"#B08A2E"],[2,12,1,"#C08A5E"],[3,12,10,"#F7C95E"],[13,12,1,"#C08A5E"],[14,12,1,"#B08A2E"],[2,13,1,"#B08A2E"],[3,13,1,"#C08A5E"],[4,13,8,"#F7C95E"],[12,13,1,"#C08A5E"],[13,13,1,"#B08A2E"],[3,14,1,"#B08A2E"],[4,14,3,"#C08A5E"],[7,14,2,"#F7C95E"],[9,14,3,"#C08A5E"],[12,14,1,"#B08A2E"],[4,15,8,"#B08A2E"]]},"sp-lp-rose":{"w":16,"h":16,"bx":0,"by":0,"bw":16,"bh":16,"runs":[[4,0,8,"#C9506F"],[3,1,1,"#C9506F"],[4,1,2,"#E4678F"],[6,1,4,"#4A3242"],[10,1,2,"#E4678F"],[12,1,1,"#C9506F"],[2,2,1,"#C9506F"],[3,2,1,"#E4678F"],[4,2,1,"#FFFFFF"],[5,2,7,"#4A3242"],[12,2,1,"#E4678F"],[13,2,1,"#C9506F"],[1,3,1,"#C9506F"],[2,3,1,"#E4678F"],[3,3,1,"#FFFFFF"],[4,3,9,"#4A3242"],[13,3,1,"#E4678F"],[14,3,1,"#C9506F"],[0,4,1,"#C9506F"],[1,4,1,"#E4678F"],[2,4,1,"#FFFFFF"],[3,4,11,"#4A3242"],[14,4,1,"#E4678F"],[15,4,1,"#C9506F"],[0,5,1,"#C9506F"],[1,5,1,"#E4678F"],[2,5,4,"#4A3242"],[6,5,4,"#F7A8C4"],[10,5,4,"#4A3242"],[14,5,1,"#E4678F"],[15,5,1,"#C9506F"],[0,6,1,"#C9506F"],[1,6,4,"#4A3242"],[5,6,6,"#F7A8C4"],[11,6,4,"#4A3242"],[15,6,1,"#C9506F"],[0,7,1,"#C9506F"],[1,7,4,"#4A3242"],[5,7,6,"#F7A8C4"],[11,7,4,"#4A3242"],[15,7,1,"#C9506F"],[0,8,1,"#C9506F"],[1,8,4,"#4A3242"],[5,8,6,"#F7A8C4"],[11,8,4,"#4A3242"],[15,8,1,"#C9506F"],[0,9,1,"#C9506F"],[1,9,4,"#4A3242"],[5,9,6,"#F7A8C4"],[11,9,4,"#4A3242"],[15,9,1,"#C9506F"],[0,10,1,"#C9506F"],[1,10,1,"#E4678F"],[2,10,1,"#4A3242"],[3,10,1,"#8B5C72"],[4,10,2,"#4A3242"],[6,10,4,"#F7A8C4"],[10,10,4,"#4A3242"],[14,10,1,"#E4678F"],[15,10,1,"#C9506F"],[0,11,1,"#C9506F"],[1,11,1,"#E4678F"],[2,11,2,"#4A3242"],[4,11,1,"#8B5C72"],[5,11,9,"#4A3242"],[14,11,1,"#E4678F"],[15,11,1,"#C9506F"],[1,12,1,"#C9506F"],[2,12,1,"#E4678F"],[3,12,10,"#4A3242"],[13,12,1,"#E4678F"],[14,12,1,"#C9506F"],[2,13,1,"#C9506F"],[3,13,1,"#E4678F"],[4,13,8,"#4A3242"],[12,13,1,"#E4678F"],[13,13,1,"#C9506F"],[3,14,1,"#C9506F"],[4,14,2,"#E4678F"],[6,14,4,"#4A3242"],[10,14,2,"#E4678F"],[12,14,1,"#C9506F"],[4,15,8,"#C9506F"]]},"sp-lp-lav":{"w":16,"h":16,"bx":0,"by":0,"bw":16,"bh":16,"runs":[[4,0,8,"#8E7FB0"],[3,1,1,"#8E7FB0"],[4,1,2,"#C9B4E8"],[6,1,4,"#4A3242"],[10,1,2,"#C9B4E8"],[12,1,1,"#8E7FB0"],[2,2,1,"#8E7FB0"],[3,2,1,"#C9B4E8"],[4,2,1,"#FFFFFF"],[5,2,7,"#4A3242"],[12,2,1,"#C9B4E8"],[13,2,1,"#8E7FB0"],[1,3,1,"#8E7FB0"],[2,3,1,"#C9B4E8"],[3,3,1,"#FFFFFF"],[4,3,9,"#4A3242"],[13,3,1,"#C9B4E8"],[14,3,1,"#8E7FB0"],[0,4,1,"#8E7FB0"],[1,4,1,"#C9B4E8"],[2,4,1,"#FFFFFF"],[3,4,11,"#4A3242"],[14,4,1,"#C9B4E8"],[15,4,1,"#8E7FB0"],[0,5,1,"#8E7FB0"],[1,5,1,"#C9B4E8"],[2,5,4,"#4A3242"],[6,5,4,"#B9A6D9"],[10,5,4,"#4A3242"],[14,5,1,"#C9B4E8"],[15,5,1,"#8E7FB0"],[0,6,1,"#8E7FB0"],[1,6,4,"#4A3242"],[5,6,6,"#B9A6D9"],[11,6,4,"#4A3242"],[15,6,1,"#8E7FB0"],[0,7,1,"#8E7FB0"],[1,7,4,"#4A3242"],[5,7,6,"#B9A6D9"],[11,7,4,"#4A3242"],[15,7,1,"#8E7FB0"],[0,8,1,"#8E7FB0"],[1,8,4,"#4A3242"],[5,8,6,"#B9A6D9"],[11,8,4,"#4A3242"],[15,8,1,"#8E7FB0"],[0,9,1,"#8E7FB0"],[1,9,4,"#4A3242"],[5,9,6,"#B9A6D9"],[11,9,4,"#4A3242"],[15,9,1,"#8E7FB0"],[0,10,1,"#8E7FB0"],[1,10,1,"#C9B4E8"],[2,10,1,"#4A3242"],[3,10,1,"#8B5C72"],[4,10,2,"#4A3242"],[6,10,4,"#B9A6D9"],[10,10,4,"#4A3242"],[14,10,1,"#C9B4E8"],[15,10,1,"#8E7FB0"],[0,11,1,"#8E7FB0"],[1,11,1,"#C9B4E8"],[2,11,2,"#4A3242"],[4,11,1,"#8B5C72"],[5,11,9,"#4A3242"],[14,11,1,"#C9B4E8"],[15,11,1,"#8E7FB0"],[1,12,1,"#8E7FB0"],[2,12,1,"#C9B4E8"],[3,12,10,"#4A3242"],[13,12,1,"#C9B4E8"],[14,12,1,"#8E7FB0"],[2,13,1,"#8E7FB0"],[3,13,1,"#C9B4E8"],[4,13,8,"#4A3242"],[12,13,1,"#C9B4E8"],[13,13,1,"#8E7FB0"],[3,14,1,"#8E7FB0"],[4,14,2,"#C9B4E8"],[6,14,4,"#4A3242"],[10,14,2,"#C9B4E8"],[12,14,1,"#8E7FB0"],[4,15,8,"#8E7FB0"]]},"sp-lp-sky":{"w":16,"h":16,"bx":0,"by":0,"bw":16,"bh":16,"runs":[[4,0,8,"#4E7FB0"],[3,1,1,"#4E7FB0"],[4,1,2,"#5B9BE8"],[6,1,4,"#4A3242"],[10,1,2,"#5B9BE8"],[12,1,1,"#4E7FB0"],[2,2,1,"#4E7FB0"],[3,2,1,"#5B9BE8"],[4,2,1,"#FFFFFF"],[5,2,7,"#4A3242"],[12,2,1,"#5B9BE8"],[13,2,1,"#4E7FB0"],[1,3,1,"#4E7FB0"],[2,3,1,"#5B9BE8"],[3,3,1,"#FFFFFF"],[4,3,9,"#4A3242"],[13,3,1,"#5B9BE8"],[14,3,1,"#4E7FB0"],[0,4,1,"#4E7FB0"],[1,4,1,"#5B9BE8"],[2,4,1,"#FFFFFF"],[3,4,11,"#4A3242"],[14,4,1,"#5B9BE8"],[15,4,1,"#4E7FB0"],[0,5,1,"#4E7FB0"],[1,5,1,"#5B9BE8"],[2,5,4,"#4A3242"],[6,5,4,"#7FD4E8"],[10,5,4,"#4A3242"],[14,5,1,"#5B9BE8"],[15,5,1,"#4E7FB0"],[0,6,1,"#4E7FB0"],[1,6,4,"#4A3242"],[5,6,6,"#7FD4E8"],[11,6,4,"#4A3242"],[15,6,1,"#4E7FB0"],[0,7,1,"#4E7FB0"],[1,7,4,"#4A3242"],[5,7,6,"#7FD4E8"],[11,7,4,"#4A3242"],[15,7,1,"#4E7FB0"],[0,8,1,"#4E7FB0"],[1,8,4,"#4A3242"],[5,8,6,"#7FD4E8"],[11,8,4,"#4A3242"],[15,8,1,"#4E7FB0"],[0,9,1,"#4E7FB0"],[1,9,4,"#4A3242"],[5,9,6,"#7FD4E8"],[11,9,4,"#4A3242"],[15,9,1,"#4E7FB0"],[0,10,1,"#4E7FB0"],[1,10,1,"#5B9BE8"],[2,10,1,"#4A3242"],[3,10,1,"#8B5C72"],[4,10,2,"#4A3242"],[6,10,4,"#7FD4E8"],[10,10,4,"#4A3242"],[14,10,1,"#5B9BE8"],[15,10,1,"#4E7FB0"],[0,11,1,"#4E7FB0"],[1,11,1,"#5B9BE8"],[2,11,2,"#4A3242"],[4,11,1,"#8B5C72"],[5,11,9,"#4A3242"],[14,11,1,"#5B9BE8"],[15,11,1,"#4E7FB0"],[1,12,1,"#4E7FB0"],[2,12,1,"#5B9BE8"],[3,12,10,"#4A3242"],[13,12,1,"#5B9BE8"],[14,12,1,"#4E7FB0"],[2,13,1,"#4E7FB0"],[3,13,1,"#5B9BE8"],[4,13,8,"#4A3242"],[12,13,1,"#5B9BE8"],[13,13,1,"#4E7FB0"],[3,14,1,"#4E7FB0"],[4,14,2,"#5B9BE8"],[6,14,4,"#4A3242"],[10,14,2,"#5B9BE8"],[12,14,1,"#4E7FB0"],[4,15,8,"#4E7FB0"]]},"sp-lp-mint":{"w":16,"h":16,"bx":0,"by":0,"bw":16,"bh":16,"runs":[[4,0,8,"#3F7D74"],[3,1,1,"#3F7D74"],[4,1,2,"#3F7D57"],[6,1,4,"#4A3242"],[10,1,2,"#3F7D57"],[12,1,1,"#3F7D74"],[2,2,1,"#3F7D74"],[3,2,1,"#3F7D57"],[4,2,1,"#FFFFFF"],[5,2,7,"#4A3242"],[12,2,1,"#3F7D57"],[13,2,1,"#3F7D74"],[1,3,1,"#3F7D74"],[2,3,1,"#3F7D57"],[3,3,1,"#FFFFFF"],[4,3,9,"#4A3242"],[13,3,1,"#3F7D57"],[14,3,1,"#3F7D74"],[0,4,1,"#3F7D74"],[1,4,1,"#3F7D57"],[2,4,1,"#FFFFFF"],[3,4,11,"#4A3242"],[14,4,1,"#3F7D57"],[15,4,1,"#3F7D74"],[0,5,1,"#3F7D74"],[1,5,1,"#3F7D57"],[2,5,4,"#4A3242"],[6,5,4,"#7ED0C4"],[10,5,4,"#4A3242"],[14,5,1,"#3F7D57"],[15,5,1,"#3F7D74"],[0,6,1,"#3F7D74"],[1,6,4,"#4A3242"],[5,6,6,"#7ED0C4"],[11,6,4,"#4A3242"],[15,6,1,"#3F7D74"],[0,7,1,"#3F7D74"],[1,7,4,"#4A3242"],[5,7,6,"#7ED0C4"],[11,7,4,"#4A3242"],[15,7,1,"#3F7D74"],[0,8,1,"#3F7D74"],[1,8,4,"#4A3242"],[5,8,6,"#7ED0C4"],[11,8,4,"#4A3242"],[15,8,1,"#3F7D74"],[0,9,1,"#3F7D74"],[1,9,4,"#4A3242"],[5,9,6,"#7ED0C4"],[11,9,4,"#4A3242"],[15,9,1,"#3F7D74"],[0,10,1,"#3F7D74"],[1,10,1,"#3F7D57"],[2,10,1,"#4A3242"],[3,10,1,"#8B5C72"],[4,10,2,"#4A3242"],[6,10,4,"#7ED0C4"],[10,10,4,"#4A3242"],[14,10,1,"#3F7D57"],[15,10,1,"#3F7D74"],[0,11,1,"#3F7D74"],[1,11,1,"#3F7D57"],[2,11,2,"#4A3242"],[4,11,1,"#8B5C72"],[5,11,9,"#4A3242"],[14,11,1,"#3F7D57"],[15,11,1,"#3F7D74"],[1,12,1,"#3F7D74"],[2,12,1,"#3F7D57"],[3,12,10,"#4A3242"],[13,12,1,"#3F7D57"],[14,12,1,"#3F7D74"],[2,13,1,"#3F7D74"],[3,13,1,"#3F7D57"],[4,13,8,"#4A3242"],[12,13,1,"#3F7D57"],[13,13,1,"#3F7D74"],[3,14,1,"#3F7D74"],[4,14,2,"#3F7D57"],[6,14,4,"#4A3242"],[10,14,2,"#3F7D57"],[12,14,1,"#3F7D74"],[4,15,8,"#3F7D74"]]},"sp-lp-lemon":{"w":16,"h":16,"bx":0,"by":0,"bw":16,"bh":16,"runs":[[4,0,8,"#B08A2E"],[3,1,1,"#B08A2E"],[4,1,2,"#C08A5E"],[6,1,4,"#4A3242"],[10,1,2,"#C08A5E"],[12,1,1,"#B08A2E"],[2,2,1,"#B08A2E"],[3,2,1,"#C08A5E"],[4,2,1,"#FFFFFF"],[5,2,7,"#4A3242"],[12,2,1,"#C08A5E"],[13,2,1,"#B08A2E"],[1,3,1,"#B08A2E"],[2,3,1,"#C08A5E"],[3,3,1,"#FFFFFF"],[4,3,9,"#4A3242"],[13,3,1,"#C08A5E"],[14,3,1,"#B08A2E"],[0,4,1,"#B08A2E"],[1,4,1,"#C08A5E"],[2,4,1,"#FFFFFF"],[3,4,11,"#4A3242"],[14,4,1,"#C08A5E"],[15,4,1,"#B08A2E"],[0,5,1,"#B08A2E"],[1,5,1,"#C08A5E"],[2,5,4,"#4A3242"],[6,5,4,"#F7C95E"],[10,5,4,"#4A3242"],[14,5,1,"#C08A5E"],[15,5,1,"#B08A2E"],[0,6,1,"#B08A2E"],[1,6,4,"#4A3242"],[5,6,6,"#F7C95E"],[11,6,4,"#4A3242"],[15,6,1,"#B08A2E"],[0,7,1,"#B08A2E"],[1,7,4,"#4A3242"],[5,7,6,"#F7C95E"],[11,7,4,"#4A3242"],[15,7,1,"#B08A2E"],[0,8,1,"#B08A2E"],[1,8,4,"#4A3242"],[5,8,6,"#F7C95E"],[11,8,4,"#4A3242"],[15,8,1,"#B08A2E"],[0,9,1,"#B08A2E"],[1,9,4,"#4A3242"],[5,9,6,"#F7C95E"],[11,9,4,"#4A3242"],[15,9,1,"#B08A2E"],[0,10,1,"#B08A2E"],[1,10,1,"#C08A5E"],[2,10,1,"#4A3242"],[3,10,1,"#8B5C72"],[4,10,2,"#4A3242"],[6,10,4,"#F7C95E"],[10,10,4,"#4A3242"],[14,10,1,"#C08A5E"],[15,10,1,"#B08A2E"],[0,11,1,"#B08A2E"],[1,11,1,"#C08A5E"],[2,11,2,"#4A3242"],[4,11,1,"#8B5C72"],[5,11,9,"#4A3242"],[14,11,1,"#C08A5E"],[15,11,1,"#B08A2E"],[1,12,1,"#B08A2E"],[2,12,1,"#C08A5E"],[3,12,10,"#4A3242"],[13,12,1,"#C08A5E"],[14,12,1,"#B08A2E"],[2,13,1,"#B08A2E"],[3,13,1,"#C08A5E"],[4,13,8,"#4A3242"],[12,13,1,"#C08A5E"],[13,13,1,"#B08A2E"],[3,14,1,"#B08A2E"],[4,14,2,"#C08A5E"],[6,14,4,"#4A3242"],[10,14,2,"#C08A5E"],[12,14,1,"#B08A2E"],[4,15,8,"#B08A2E"]]},"sp-chicken":{"w":16,"h":16,"bx":1,"by":1,"bw":12,"bh":13,"runs":[[3,1,7,"#C08A5E"],[2,2,10,"#C08A5E"],[1,3,11,"#C08A5E"],[1,4,2,"#C08A5E"],[3,4,5,"#F2DCA8"],[8,4,4,"#C08A5E"],[1,5,2,"#C08A5E"],[3,5,5,"#F2DCA8"],[8,5,4,"#C08A5E"],[2,6,10,"#C08A5E"],[3,7,10,"#C08A5E"],[4,8,9,"#C08A5E"],[5,9,8,"#C08A5E"],[6,10,3,"#C08A5E"],[9,10,3,"#FFF3C8"],[8,11,4,"#FFF3C8"],[9,12,3,"#FFF3C8"],[10,13,2,"#FFF3C8"]]},"sp-pizza":{"w":16,"h":16,"bx":2,"by":1,"bw":12,"bh":14,"runs":[[2,1,12,"#C08A5E"],[2,2,12,"#C08A5E"],[2,3,12,"#F2DCA8"],[2,4,12,"#F7C95E"],[2,5,3,"#F7C95E"],[5,5,1,"#EE5A72"],[6,5,4,"#F7C95E"],[10,5,1,"#EE5A72"],[11,5,3,"#F7C95E"],[3,6,10,"#F7C95E"],[3,7,1,"#F7C95E"],[4,7,1,"#EE5A72"],[5,7,5,"#F7C95E"],[10,7,1,"#EE5A72"],[11,7,2,"#F7C95E"],[4,8,8,"#F7C95E"],[4,9,3,"#F7C95E"],[7,9,1,"#EE5A72"],[8,9,4,"#F7C95E"],[5,10,4,"#F7C95E"],[9,10,1,"#EE5A72"],[10,10,1,"#F7C95E"],[5,11,6,"#F7C95E"],[6,12,1,"#F7C95E"],[7,12,1,"#EE5A72"],[8,12,2,"#F7C95E"],[6,13,4,"#F7C95E"],[7,14,2,"#F7C95E"]]},"sp-bowl":{"w":16,"h":16,"bx":1,"by":1,"bw":14,"bh":11,"runs":[[5,1,1,"#7FD4E8"],[9,1,1,"#7FD4E8"],[4,2,1,"#7FD4E8"],[8,2,1,"#7FD4E8"],[3,4,10,"#F7C95E"],[1,5,14,"#E4678F"],[1,6,14,"#7FD4E8"],[2,7,12,"#7FD4E8"],[2,8,12,"#D6ECFB"],[3,9,10,"#7FD4E8"],[4,10,8,"#7FD4E8"],[5,11,6,"#7FD4E8"]]},"sp-sushi":{"w":16,"h":16,"bx":2,"by":2,"bw":12,"bh":12,"runs":[[4,2,8,"#F7A8C4"],[3,3,1,"#F7A8C4"],[4,3,1,"#FFD1E2"],[5,3,6,"#F7A8C4"],[11,3,1,"#FFD1E2"],[12,3,1,"#F7A8C4"],[3,4,10,"#F7A8C4"],[3,5,10,"#E4678F"],[2,6,5,"#FFF3E2"],[7,6,2,"#4A3242"],[9,6,5,"#FFF3E2"],[2,7,5,"#FFF3E2"],[7,7,2,"#4A3242"],[9,7,5,"#FFF3E2"],[2,8,5,"#FFF3E2"],[7,8,2,"#4A3242"],[9,8,5,"#FFF3E2"],[2,9,5,"#FFF3E2"],[7,9,2,"#4A3242"],[9,9,5,"#FFF3E2"],[2,10,5,"#FFF3E2"],[7,10,2,"#4A3242"],[9,10,5,"#FFF3E2"],[2,11,12,"#FFF3E2"],[3,12,10,"#FFF3E2"],[4,13,8,"#FFF3E2"]]},"sp-dumpling":{"w":16,"h":16,"bx":2,"by":2,"bw":12,"bh":10,"runs":[[5,2,6,"#C08A5E"],[4,3,8,"#C08A5E"],[3,4,1,"#C08A5E"],[4,4,8,"#FFF3E2"],[12,4,1,"#C08A5E"],[2,5,1,"#C08A5E"],[3,5,10,"#FFF3E2"],[13,5,1,"#C08A5E"],[2,6,12,"#FFF3E2"],[2,7,4,"#FFF3E2"],[6,7,4,"#C08A5E"],[10,7,4,"#FFF3E2"],[2,8,12,"#FFF3E2"],[3,9,10,"#FFF3E2"],[4,10,8,"#FFF3E2"],[5,11,6,"#FFF3E2"]]},"sp-phones":{"w":16,"h":16,"bx":1,"by":1,"bw":14,"bh":12,"runs":[[4,1,8,"#8B5C72"],[3,2,10,"#8B5C72"],[2,3,2,"#8B5C72"],[12,3,2,"#8B5C72"],[2,4,2,"#8B5C72"],[12,4,2,"#8B5C72"],[2,5,2,"#8B5C72"],[12,5,2,"#8B5C72"],[2,6,2,"#8B5C72"],[12,6,2,"#8B5C72"],[1,7,3,"#4A3242"],[12,7,3,"#4A3242"],[1,8,1,"#4A3242"],[2,8,2,"#F7A8C4"],[4,8,1,"#4A3242"],[11,8,1,"#4A3242"],[12,8,2,"#F7A8C4"],[14,8,1,"#4A3242"],[1,9,1,"#4A3242"],[2,9,2,"#F7A8C4"],[4,9,1,"#4A3242"],[11,9,1,"#4A3242"],[12,9,2,"#F7A8C4"],[14,9,1,"#4A3242"],[1,10,1,"#4A3242"],[2,10,2,"#F7A8C4"],[4,10,1,"#4A3242"],[11,10,1,"#4A3242"],[12,10,2,"#F7A8C4"],[14,10,1,"#4A3242"],[1,11,1,"#4A3242"],[2,11,2,"#F7A8C4"],[4,11,1,"#4A3242"],[11,11,1,"#4A3242"],[12,11,2,"#F7A8C4"],[14,11,1,"#4A3242"],[1,12,3,"#4A3242"],[12,12,3,"#4A3242"]]},"sp-mug":{"w":16,"h":16,"bx":3,"by":2,"bw":10,"bh":12,"runs":[[3,2,10,"#8B5C72"],[3,3,10,"#8B5C72"],[3,4,10,"#7FD4E8"],[3,5,1,"#7FD4E8"],[4,5,8,"#D6ECFB"],[12,5,1,"#7FD4E8"],[3,6,10,"#7FD4E8"],[3,7,10,"#7FD4E8"],[3,8,10,"#7FD4E8"],[3,9,10,"#7FD4E8"],[3,10,10,"#7FD4E8"],[3,11,10,"#7FD4E8"],[4,12,8,"#7FD4E8"],[5,13,6,"#7FD4E8"]]},"sp-shopbag":{"w":16,"h":16,"bx":2,"by":1,"bw":12,"bh":13,"runs":[[5,1,2,"#E4678F"],[9,1,2,"#E4678F"],[4,2,1,"#E4678F"],[11,2,1,"#E4678F"],[3,3,1,"#E4678F"],[12,3,1,"#E4678F"],[3,4,1,"#E4678F"],[12,4,1,"#E4678F"],[2,5,12,"#FFD1E2"],[2,6,12,"#FFD1E2"],[2,7,5,"#FFD1E2"],[7,7,2,"#E4678F"],[9,7,5,"#FFD1E2"],[2,8,4,"#FFD1E2"],[6,8,4,"#E4678F"],[10,8,4,"#FFD1E2"],[2,9,5,"#FFD1E2"],[7,9,2,"#E4678F"],[9,9,5,"#FFD1E2"],[2,10,12,"#FFD1E2"],[2,11,12,"#FFD1E2"],[2,12,12,"#FFD1E2"],[2,13,1,"#F7A8C4"],[3,13,10,"#FFD1E2"],[13,13,1,"#F7A8C4"]]},"sp-perfume":{"w":16,"h":16,"bx":3,"by":1,"bw":10,"bh":12,"runs":[[6,1,4,"#E4678F"],[6,2,4,"#E4678F"],[7,3,2,"#E4678F"],[6,4,4,"#E8DDFB"],[5,5,6,"#E8DDFB"],[4,6,1,"#C9B4E8"],[5,6,6,"#E8DDFB"],[11,6,1,"#C9B4E8"],[3,7,1,"#C9B4E8"],[4,7,8,"#E8DDFB"],[12,7,1,"#C9B4E8"],[3,8,1,"#C9B4E8"],[4,8,2,"#E8DDFB"],[6,8,2,"#F7C95E"],[8,8,4,"#E8DDFB"],[12,8,1,"#C9B4E8"],[3,9,1,"#C9B4E8"],[4,9,2,"#E8DDFB"],[6,9,2,"#F7C95E"],[8,9,4,"#E8DDFB"],[12,9,1,"#C9B4E8"],[3,10,1,"#C9B4E8"],[4,10,8,"#E8DDFB"],[12,10,1,"#C9B4E8"],[3,11,1,"#C9B4E8"],[4,11,8,"#E8DDFB"],[12,11,1,"#C9B4E8"],[4,12,1,"#C9B4E8"],[5,12,6,"#E8DDFB"],[11,12,1,"#C9B4E8"]]},"sp-hanger":{"w":16,"h":16,"bx":2,"by":1,"bw":11,"bh":11,"runs":[[7,1,2,"#8B5C72"],[6,2,1,"#8B5C72"],[9,2,1,"#8B5C72"],[6,3,1,"#8B5C72"],[9,3,1,"#8B5C72"],[7,4,2,"#8B5C72"],[7,5,1,"#C08A5E"],[6,6,1,"#C08A5E"],[8,6,1,"#C08A5E"],[5,7,1,"#C08A5E"],[9,7,1,"#C08A5E"],[4,8,1,"#C08A5E"],[10,8,1,"#C08A5E"],[3,9,1,"#C08A5E"],[11,9,1,"#C08A5E"],[2,10,11,"#C08A5E"],[2,11,1,"#C08A5E"],[12,11,1,"#C08A5E"]]},"sp-keyboard":{"w":16,"h":16,"bx":2,"by":3,"bw":12,"bh":8,"runs":[[2,3,12,"#4A3242"],[2,4,1,"#4A3242"],[3,4,1,"#FFFFFF"],[4,4,1,"#4A3242"],[5,4,1,"#FFFFFF"],[6,4,1,"#4A3242"],[7,4,1,"#FFFFFF"],[8,4,1,"#4A3242"],[9,4,1,"#FFFFFF"],[10,4,1,"#4A3242"],[11,4,1,"#FFFFFF"],[12,4,2,"#4A3242"],[2,5,12,"#4A3242"],[2,6,1,"#4A3242"],[3,6,1,"#FFFFFF"],[4,6,1,"#4A3242"],[5,6,1,"#FFFFFF"],[6,6,1,"#4A3242"],[7,6,1,"#FFFFFF"],[8,6,1,"#4A3242"],[9,6,1,"#FFFFFF"],[10,6,1,"#4A3242"],[11,6,1,"#FFFFFF"],[12,6,2,"#4A3242"],[2,7,12,"#4A3242"],[2,8,1,"#4A3242"],[3,8,1,"#FFFFFF"],[4,8,1,"#4A3242"],[5,8,1,"#FFFFFF"],[6,8,1,"#4A3242"],[7,8,1,"#FFFFFF"],[8,8,1,"#4A3242"],[9,8,1,"#FFFFFF"],[10,8,1,"#4A3242"],[11,8,1,"#FFFFFF"],[12,8,2,"#4A3242"],[2,9,1,"#4A3242"],[3,9,10,"#FFFFFF"],[13,9,1,"#4A3242"],[2,10,12,"#4A3242"]]},"sp-sneaker":{"w":16,"h":16,"bx":1,"by":3,"bw":14,"bh":8,"runs":[[10,3,3,"#D6ECFB"],[9,4,5,"#D6ECFB"],[2,5,13,"#D6ECFB"],[1,6,5,"#D6ECFB"],[6,6,2,"#FFFFFF"],[8,6,2,"#D6ECFB"],[10,6,2,"#FFFFFF"],[12,6,3,"#D6ECFB"],[1,7,5,"#D6ECFB"],[6,7,2,"#FFFFFF"],[8,7,2,"#D6ECFB"],[10,7,2,"#FFFFFF"],[12,7,3,"#D6ECFB"],[1,8,14,"#D6ECFB"],[1,9,14,"#FFF3C8"],[1,10,14,"#E4678F"]]},"sp-ribbon":{"w":16,"h":16,"bx":1,"by":2,"bw":14,"bh":11,"runs":[[2,2,3,"#F7A8C4"],[11,2,3,"#F7A8C4"],[1,3,5,"#F7A8C4"],[10,3,5,"#F7A8C4"],[1,4,2,"#F7A8C4"],[3,4,3,"#E4678F"],[6,4,1,"#F7A8C4"],[9,4,1,"#F7A8C4"],[10,4,3,"#E4678F"],[13,4,2,"#F7A8C4"],[1,5,3,"#F7A8C4"],[4,5,3,"#E4678F"],[7,5,2,"#F7A8C4"],[9,5,3,"#E4678F"],[12,5,3,"#F7A8C4"],[2,6,2,"#F7A8C4"],[4,6,8,"#E4678F"],[12,6,2,"#F7A8C4"],[3,7,1,"#F7A8C4"],[4,7,8,"#E4678F"],[12,7,1,"#F7A8C4"],[4,8,8,"#E4678F"],[5,9,1,"#F7A8C4"],[6,9,4,"#E4678F"],[10,9,1,"#F7A8C4"],[4,10,2,"#F7A8C4"],[7,10,2,"#E4678F"],[10,10,2,"#F7A8C4"],[3,11,3,"#F7A8C4"],[7,11,2,"#E4678F"],[10,11,3,"#F7A8C4"],[2,12,4,"#F7A8C4"],[10,12,4,"#F7A8C4"]]},"sp-butterfly":{"w":16,"h":16,"bx":2,"by":1,"bw":12,"bh":12,"runs":[[5,1,1,"#8B5C72"],[10,1,1,"#8B5C72"],[6,2,1,"#8B5C72"],[9,2,1,"#8B5C72"],[7,3,2,"#4A3242"],[3,4,3,"#B9A6D9"],[7,4,2,"#4A3242"],[10,4,3,"#B9A6D9"],[2,5,5,"#B9A6D9"],[7,5,2,"#4A3242"],[9,5,5,"#B9A6D9"],[2,6,5,"#B9A6D9"],[7,6,2,"#4A3242"],[9,6,5,"#B9A6D9"],[3,7,4,"#B9A6D9"],[7,7,2,"#4A3242"],[9,7,4,"#B9A6D9"],[4,8,3,"#B9A6D9"],[7,8,2,"#4A3242"],[9,8,3,"#B9A6D9"],[3,9,4,"#B9A6D9"],[7,9,2,"#4A3242"],[9,9,4,"#B9A6D9"],[2,10,5,"#B9A6D9"],[7,10,2,"#4A3242"],[9,10,5,"#B9A6D9"],[2,11,4,"#B9A6D9"],[8,11,2,"#4A3242"],[12,11,2,"#B9A6D9"],[3,12,2,"#B9A6D9"],[8,12,2,"#4A3242"],[13,12,1,"#B9A6D9"]]},"sp-flower":{"w":16,"h":16,"bx":2,"by":2,"bw":12,"bh":10,"runs":[[3,2,3,"#F7A8C4"],[10,2,3,"#F7A8C4"],[2,3,5,"#F7A8C4"],[9,3,5,"#F7A8C4"],[2,4,5,"#F7A8C4"],[9,4,5,"#F7A8C4"],[3,5,10,"#F7A8C4"],[3,6,3,"#F7A8C4"],[6,6,4,"#FFF3C8"],[10,6,3,"#F7A8C4"],[3,7,3,"#F7A8C4"],[6,7,4,"#FFF3C8"],[10,7,3,"#F7A8C4"],[3,8,10,"#F7A8C4"],[2,9,5,"#F7A8C4"],[9,9,5,"#F7A8C4"],[2,10,5,"#F7A8C4"],[9,10,5,"#F7A8C4"],[3,11,3,"#F7A8C4"],[10,11,3,"#F7A8C4"]]},"sp-cassette":{"w":16,"h":16,"bx":2,"by":2,"bw":12,"bh":10,"runs":[[2,2,12,"#B9A6D9"],[2,3,1,"#B9A6D9"],[3,3,10,"#4A3242"],[13,3,1,"#B9A6D9"],[2,4,1,"#B9A6D9"],[3,4,1,"#4A3242"],[4,4,2,"#FFFFFF"],[6,4,4,"#4A3242"],[10,4,2,"#FFFFFF"],[12,4,1,"#4A3242"],[13,4,1,"#B9A6D9"],[2,5,1,"#B9A6D9"],[3,5,1,"#4A3242"],[4,5,2,"#FFFFFF"],[6,5,4,"#4A3242"],[10,5,2,"#FFFFFF"],[12,5,1,"#4A3242"],[13,5,1,"#B9A6D9"],[2,6,1,"#B9A6D9"],[3,6,10,"#4A3242"],[13,6,1,"#B9A6D9"],[2,7,12,"#B9A6D9"],[2,8,1,"#B9A6D9"],[3,8,10,"#FFF3C8"],[13,8,1,"#B9A6D9"],[2,9,1,"#B9A6D9"],[3,9,10,"#FFF3C8"],[13,9,1,"#B9A6D9"],[2,10,12,"#B9A6D9"],[3,11,2,"#B9A6D9"],[11,11,2,"#B9A6D9"]]},"sp-glasses":{"w":16,"h":16,"bx":2,"by":5,"bw":14,"bh":6,"runs":[[2,5,6,"#4A3242"],[10,5,6,"#4A3242"],[2,6,1,"#4A3242"],[3,6,4,"#D6ECFB"],[7,6,1,"#4A3242"],[10,6,1,"#4A3242"],[11,6,4,"#D6ECFB"],[15,6,1,"#4A3242"],[2,7,1,"#4A3242"],[3,7,4,"#D6ECFB"],[7,7,1,"#4A3242"],[10,7,1,"#4A3242"],[11,7,4,"#D6ECFB"],[15,7,1,"#4A3242"],[2,8,1,"#4A3242"],[3,8,4,"#D6ECFB"],[7,8,4,"#4A3242"],[11,8,4,"#D6ECFB"],[15,8,1,"#4A3242"],[2,9,1,"#4A3242"],[3,9,4,"#D6ECFB"],[7,9,1,"#4A3242"],[10,9,1,"#4A3242"],[11,9,4,"#D6ECFB"],[15,9,1,"#4A3242"],[2,10,6,"#4A3242"],[10,10,6,"#4A3242"]]},"check":{"w":9,"h":8,"bx":0,"by":0,"bw":9,"bh":8,"runs":[[6,0,3,"#4E9E7B"],[6,1,3,"#4E9E7B"],[6,2,3,"#4E9E7B"],[4,3,2,"#4E9E7B"],[0,4,2,"#4E9E7B"],[4,4,2,"#4E9E7B"],[0,5,2,"#4E9E7B"],[4,5,2,"#4E9E7B"],[0,6,6,"#4E9E7B"],[2,7,2,"#4E9E7B"]]},"cat":{"w":18,"h":16,"bx":0,"by":0,"bw":16,"bh":14,"runs":[[4,0,2,"#8B5C72"],[10,0,2,"#8B5C72"],[3,1,1,"#8B5C72"],[4,1,2,"#F58FB8"],[6,1,1,"#8B5C72"],[9,1,1,"#8B5C72"],[10,1,2,"#F58FB8"],[12,1,1,"#8B5C72"],[2,2,1,"#8B5C72"],[3,2,10,"#FFD9E6"],[13,2,1,"#8B5C72"],[1,3,1,"#8B5C72"],[2,3,12,"#FFD9E6"],[14,3,1,"#8B5C72"],[1,4,1,"#8B5C72"],[2,4,12,"#FFD9E6"],[14,4,1,"#8B5C72"],[1,5,1,"#8B5C72"],[2,5,12,"#FFD9E6"],[14,5,1,"#8B5C72"],[0,6,2,"#8B5C72"],[2,6,2,"#FFD9E6"],[4,6,2,"#4A3242"],[6,6,4,"#FFD9E6"],[10,6,2,"#4A3242"],[12,6,2,"#FFD9E6"],[14,6,2,"#8B5C72"],[1,7,1,"#8B5C72"],[2,7,2,"#FFD9E6"],[4,7,2,"#4A3242"],[6,7,4,"#FFD9E6"],[10,7,2,"#4A3242"],[12,7,2,"#FFD9E6"],[14,7,1,"#8B5C72"],[0,8,2,"#8B5C72"],[2,8,5,"#FFD9E6"],[7,8,2,"#C9506F"],[9,8,5,"#FFD9E6"],[14,8,2,"#8B5C72"],[1,9,1,"#8B5C72"],[2,9,1,"#FFD9E6"],[3,9,2,"#F58FB8"],[5,9,1,"#FFD9E6"],[6,9,4,"#8B5C72"],[10,9,1,"#FFD9E6"],[11,9,2,"#F58FB8"],[13,9,1,"#FFD9E6"],[14,9,1,"#8B5C72"],[1,10,1,"#8B5C72"],[2,10,4,"#FFD9E6"],[6,10,1,"#8B5C72"],[7,10,2,"#FFD9E6"],[9,10,1,"#8B5C72"],[10,10,4,"#FFD9E6"],[14,10,1,"#8B5C72"],[1,11,1,"#8B5C72"],[2,11,12,"#FFD9E6"],[14,11,1,"#8B5C72"],[2,12,1,"#8B5C72"],[3,12,10,"#FFD9E6"],[13,12,1,"#8B5C72"],[3,13,10,"#8B5C72"]]},"heart":{"w":9,"h":8,"bx":0,"by":1,"bw":7,"bh":7,"runs":[[1,1,2,"currentColor"],[4,1,2,"currentColor"],[0,2,7,"currentColor"],[0,3,7,"currentColor"],[0,4,7,"currentColor"],[1,5,5,"currentColor"],[2,6,3,"currentColor"],[3,7,1,"currentColor"]]},"x":{"w":5,"h":5,"bx":0,"by":0,"bw":5,"bh":5,"runs":[[0,0,1,"currentColor"],[4,0,1,"currentColor"],[1,1,1,"currentColor"],[3,1,1,"currentColor"],[2,2,1,"currentColor"],[1,3,1,"currentColor"],[3,3,1,"currentColor"],[0,4,1,"currentColor"],[4,4,1,"currentColor"]]}};

  function fontsReady() {
    if (!document.fonts || !document.fonts.load) { return Promise.resolve(); }
    var jobs = ['400 33px Galmuri11', '700 33px Galmuri11', '700 66px Galmuri11', '400 30px "Pretendard Variable"',
      '600 30px "Pretendard Variable"', '700 30px "Pretendard Variable"'
    ].map(function (f) { return document.fonts.load(f).catch(function () {}); });
    return Promise.all(jobs).then(function () { return document.fonts.ready; }).catch(function () {});
  }

  /* 픽셀 사각형: fill + 두께 t 테두리 (모두 정수 좌표) */
  function box(ctx, x, y, w, h, fill, border, t) {
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fillRect(x, y, w, h);
    }
    if (border && t) {
      ctx.fillStyle = border;
      ctx.fillRect(x, y, w, t);
      ctx.fillRect(x, y + h - t, w, t);
      ctx.fillRect(x, y, t, h);
      ctx.fillRect(x + w - t, y, t, h);
    }
  }

  function dashedBox(ctx, x, y, w, h, color, t, dash, gap) {
    ctx.fillStyle = color;
    var step = dash + gap;
    var i;
    for (i = 0; i < w; i += step) {
      var dw = Math.min(dash, w - i);
      ctx.fillRect(x + i, y, dw, t);
      ctx.fillRect(x + i, y + h - t, dw, t);
    }
    for (i = 0; i < h; i += step) {
      var dh = Math.min(dash, h - i);
      ctx.fillRect(x, y + i, t, dh);
      ctx.fillRect(x + w - t, y + i, t, dh);
    }
  }

  function drawSprite(ctx, name, x, y, scale, color) {
    var sp = PXS[name];
    if (!sp) { return; }
    var runs = sp.runs;
    for (var i = 0; i < runs.length; i += 1) {
      ctx.fillStyle = color || runs[i][3];
      ctx.fillRect(Math.round(x + runs[i][0] * scale), Math.round(y + runs[i][1] * scale), runs[i][2] * scale, scale);
    }
  }

  /* 칸 아이콘: 그림 알맹이(bx·by·bw·bh)를 box 안에 꽉 차게 맞춘 크기를 먼저 구한다 */
  function spriteFit(name, boxW, boxH) {
    var sp = PXS[name] || { w: 16, h: 16 };
    var bw = sp.bw || sp.w;
    var bh = sp.bh || sp.h;
    var s = Math.max(1, Math.floor(Math.min(boxW / bw, boxH / bh)));
    return { s: s, bw: bw, bh: bh, w: bw * s, h: bh * s, bx: sp.bx || 0, by: sp.by || 0 };
  }

  /* 알맹이 좌상단을 (x, y)에 두고 s배로 그린다 (픽셀 정수 유지) */
  function drawSpriteFit(ctx, name, x, y, s) {
    var sp = PXS[name];
    if (!sp) { return; }
    var bx = sp.bx || 0;
    var by = sp.by || 0;
    var runs = sp.runs;
    for (var i = 0; i < runs.length; i += 1) {
      ctx.fillStyle = runs[i][3];
      ctx.fillRect(Math.round(x + (runs[i][0] - bx) * s), Math.round(y + (runs[i][1] - by) * s), runs[i][2] * s, s);
    }
  }

  function wrapLines(ctx, text, maxW) {
    var out = [];
    var line = '';
    var words = String(text).split(' ');
    for (var w = 0; w < words.length; w += 1) {
      var word = words[w];
      if (!word) { continue; }
      if (ctx.measureText(word).width > maxW) {
        for (var i = 0; i < word.length; i += 1) {
          var t2 = line + word[i];
          if (ctx.measureText(t2).width > maxW && line) { out.push(line); line = word[i]; }
          else { line = t2; }
        }
        continue;
      }
      var t3 = line ? line + ' ' + word : word;
      if (ctx.measureText(t3).width > maxW && line) { out.push(line); line = word; }
      else { line = t3; }
    }
    if (line) { out.push(line); }
    return out;
  }

  function wrapBalanced(ctx, text, maxW) {
    var lines = wrapLines(ctx, text, maxW);
    var t = String(text);
    if (lines.length === 2 && t.indexOf(' ') < 0 && lines[0].length - lines[1].length > 1) {
      var cut = Math.ceil(t.length / 2);
      if (ctx.measureText(t.slice(0, cut)).width <= maxW && ctx.measureText(t.slice(cut)).width <= maxW) {
        return [t.slice(0, cut), t.slice(cut)];
      }
    }
    return lines;
  }

  function fitTextSize(ctx, labels, maxW, maxH, base) {
    for (var s = base; s >= 18; s -= 1) {
      ctx.font = '700 ' + s + 'px ' + FONT;
      var lh = Math.round(s * 1.3);
      var ok = true;
      for (var i = 0; i < labels.length; i += 1) {
        var lines = wrapBalanced(ctx, labels[i], maxW);
        if (lines.length > 2 || lines.length * lh > maxH) { ok = false; break; }
      }
      if (ok) { return s; }
    }
    return 18;
  }

  function paperBG(ctx) {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    for (var y = 9; y < H; y += 33) {
      for (var x = 9; x < W; x += 33) {
        ctx.fillRect(x, y, 6, 6);
      }
    }
  }

  /* 카드 전체를 감싸는 픽셀 윈도우 (타이틀 바 + 하트 + 닫기 버튼) */
  function cardWindow(ctx, barColor) {
    var M = 30;
    var w = W - M * 2;
    var h = H - M * 2;
    ctx.fillStyle = C.shadow;
    ctx.fillRect(M + 14, M + 14, w, h);
    box(ctx, M, M, w, h, C.panel, C.line, 8);
    ctx.fillStyle = barColor;
    ctx.fillRect(M + 8, M + 8, w - 16, 66);
    ctx.fillStyle = C.line;
    ctx.fillRect(M + 8, M + 74, w - 16, 6);
    var i;
    for (i = 0; i < 3; i += 1) {
      drawSprite(ctx, 'heart', M + 26 + i * 39, M + 24, 3, '#FFFFFF');
    }
    var bx = M + w - 8 - 12 - 24;
    box(ctx, bx, M + 22, 24, 24, '#FFF7FB', C.line, 4);
    drawSprite(ctx, 'x', bx + 6, M + 28, 3, C.hot);
    return { x: M + 8, y: M + 80, w: w - 16, h: h - 88 };
  }

  function drawBoard(ctx, cells, x0, y0, size, gap, tapped, bingoSet, fontBase) {
    var n = gridSize(cells);
    var maxW = size * 0.84;
    var ico = Math.round(size * 0.26);
    var icoGap = Math.round(size * 0.05);
    var maxH = size - ico - icoGap - 14;
    var labels = [];
    cells.forEach(function (c) { if (!c.free) { labels.push(c.label); } });
    var ts = fitTextSize(ctx, labels, maxW, maxH, fontBase);
    var lh = Math.round(ts * 1.3);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    cells.forEach(function (cell, i) {
      var col = i % n;
      var row = Math.floor(i / n);
      var x = x0 + col * (size + gap);
      var y = y0 + row * (size + gap);
      ctx.fillStyle = C.shadow;
      ctx.fillRect(x + 8, y + 8, size, size);
      if (cell.free) {
        box(ctx, x, y, size, size, '#FFF7FB', null, 0);
        dashedBox(ctx, x, y, size, size, C.line2, 6, 15, 12);
        ctx.fillStyle = C.mute;
        ctx.font = '700 ' + Math.round(fontBase * 1.1) + 'px ' + FONT;
        ctx.fillText('FREE', x + size / 2, y + size / 2);
        if (tapped && tapped[i]) {
          drawSprite(ctx, 'check', x + size - 54, y + 10, 4, '#4E9E7B');
        }
        return;
      }
      box(ctx, x, y, size, size, C.cols[cell.cat % C.cols.length] || '#FFFFFF', C.line, 6);
      ctx.fillStyle = C.ink;
      ctx.font = '700 ' + ts + 'px ' + FONT;
      var lines = wrapBalanced(ctx, cell.label, maxW);
      /* [아이콘 알맹이 + 간격 + 글줄] 실제 높이를 셈해 칸 정중앙에 앉힌다 (글자 아래 여백은 반납) */
      var iconId = (state.iconOf && state.iconOf[i]) || spriteFor(cell.cat, cell.label);
      var fit = spriteFit(iconId, ico, ico);
      var nudge = Math.round((lh - ts) * 0.3);
      var blockH = fit.h + icoGap + lines.length * lh - Math.round((lh - ts) * 0.6);
      var top = y + Math.round((size - blockH) / 2) + nudge;
      drawSpriteFit(ctx, iconId, x + Math.round((size - fit.w) / 2), top, fit.s);
      ctx.fillStyle = C.ink;   /* 아이콘 마지막 색이 글자에 묻지 않도록 되돌린다 */
      ctx.font = '700 ' + ts + 'px ' + FONT;
      var textTop = top + fit.h + icoGap;
      lines.forEach(function (ln, k) { ctx.fillText(ln, x + size / 2, textTop + lh / 2 + k * lh); });

      if (bingoSet && bingoSet[i]) {
        box(ctx, x - 7, y - 7, size + 14, size + 14, null, '#F2C86A', 6);
      }
      if (tapped && tapped[i]) {
        drawSprite(ctx, 'heart', x + size - 52, y + 8, 4, C.hot);
      }
    });
  }

  function drawTitle(ctx, title, y, size, maxW, color) {
    ctx.fillStyle = color || C.ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var s;
    for (s = size; s >= 26; s -= 2) {
      ctx.font = '700 ' + s + 'px ' + FONT;
      if (ctx.measureText(title).width <= maxW) {
        ctx.fillText(title, W / 2, y);
        return;
      }
    }
    ctx.font = '700 30px ' + FONT;
    var lines = wrapLines(ctx, title, maxW).slice(0, 2);
    lines.forEach(function (ln, i) {
      ctx.fillText(ln, W / 2, y + (i - (lines.length - 1) / 2) * 40);
    });
  }

  function kicker(ctx, text, y, color) {
    ctx.fillStyle = color || C.hot;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 30px ' + FONT;
    ctx.fillText(text, W / 2, y);
  }

  function sign(ctx, y) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = C.mute;
    ctx.font = '400 22px ' + FONT;
    ctx.fillText('2026 연말 취향 결산 · soosoosupernova.github.io/taste-bingo', W / 2, y);
  }

  function drawOwnCard() {
    var cv = $('cardCanvas');
    var ctx = cv.getContext('2d');
    var n = state.size;
    var total = n * n;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);
    paperBG(ctx);
    cardWindow(ctx, C.bar);

    kicker(ctx, '2026 연말 결산 · 나의 취향 빙고', 150);
    drawSprite(ctx, 'cat', 866, 116, 8);

    var filled = state.cells.filter(function (c) { return !c.free; }).length;
    drawTitle(ctx, state.nick ? state.nick + '님의 2026 취향 빙고' : '2026 나의 취향 빙고', 298, 50, 900);

    ctx.fillStyle = C.ink2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '400 30px ' + FONT;
    ctx.fillText(n + '×' + n + ' 판 · 취향 ' + filled + '개' + ((total - filled) ? ' · FREE ' + (total - filled) + '칸' : ''), W / 2, 356);

    var size = n === 3 ? 252 : 186;
    var gap = n === 3 ? 18 : 16;
    var bw = size * n + gap * (n - 1);
    drawBoard(ctx, state.cells, (W - bw) / 2, 398, size, gap, state.ownTapped, null, n === 3 ? 42 : 33);

    ctx.fillStyle = C.ink2;
    ctx.font = '400 30px ' + FONT;
    ctx.fillText('링크를 보내면 친구와 취향 일치율을 볼 수 있어요.', W / 2, 1238);
    sign(ctx, 1282);
    return cv;
  }

  function drawFriendCard() {
    var cv = $('cardCanvas');
    var ctx = cv.getContext('2d');
    var s = calcStats(state.cells, state.ftapped);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);
    paperBG(ctx);
    cardWindow(ctx, C.mint);

    kicker(ctx, '2026 연말 결산 · 친구의 취향 빙고', 150, '#4E7D68');
    drawSprite(ctx, 'cat', 866, 116, 8);

    drawTitle(ctx, (state.fnick ? state.fnick + '님과 나의 취향 빙고' : '친구와 나의 취향 빙고'), 224, 48, 900);

    var stats = [
      { k: '공감한 칸', v: s.matched, u: '칸' },
      { k: '취향 일치율', v: s.rate, u: '%' },
      { k: '완성된 빙고', v: s.lines.length, u: '줄' }
    ];
    stats.forEach(function (st, i) {
      var cx = W / 2 + (i - 1) * 300;
      box(ctx, cx - 138 + 8, 284 + 8, 276, 112, C.shadow, null, 0);
      box(ctx, cx - 138, 284, 276, 112, C.panel, C.line, 6);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = C.ink2;
      ctx.font = '400 22px ' + FONT;
      ctx.fillText(st.k, cx, 314);
      ctx.fillStyle = C.ink;
      ctx.font = '700 50px ' + FONT;
      ctx.fillText(String(st.v), cx - 14, 358);
      var vw = ctx.measureText(String(st.v)).width;
      ctx.font = '400 24px ' + FONT;
      ctx.fillStyle = C.ink2;
      ctx.fillText(st.u, cx - 14 + vw / 2 + 16, 366);
    });

    var inLine = {};
    s.lines.forEach(function (L) { L.forEach(function (i) { inLine[i] = true; }); });

    var size = 164;
    var gap = 16;
    var bn = gridSize(state.cells);
    if (bn === 3) { size = 222; gap = 19; }
    var bw = size * bn + gap * (bn - 1);
    drawBoard(ctx, state.cells, (W - bw) / 2, 424, size, gap, state.ftapped, inLine, bn === 3 ? 38 : 30);

    var copy = lineCopyFor(s);
    var cw = W - 150;
    box(ctx, (W - cw) / 2 + 8, 1152 + 8, cw, 92, C.shadow, null, 0);
    box(ctx, (W - cw) / 2, 1152, cw, 92, C.lemon, '#D9C48A', 6);
    ctx.fillStyle = '#6B5B34';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 24px ' + FONT;
    var cl = wrapLines(ctx, copy, cw - 40).slice(0, 2);
    var cy = 1198 - ((cl.length - 1) * 30) / 2;
    cl.forEach(function (ln, i) { ctx.fillText(ln, W / 2, cy + i * 30); });

    sign(ctx, 1284);
    return cv;
  }

  var IN_APP = /KAKAOTALK|Instagram|FBAN|FBAV|NAVER|Line\/|DaumApps/i.test(navigator.userAgent);

  function canvasToBlob(cv) {
    return new Promise(function (resolve, reject) {
      if (cv.toBlob) { cv.toBlob(function (b) { b ? resolve(b) : reject(new Error('blob')); }, 'image/png'); }
      else { reject(new Error('no toBlob')); }
    });
  }

  function saveCard(kind) {
    var btn = kind === 'friend' ? $('friendCard') : $('cardBtn');
    var status = kind === 'friend' ? $('friendStatus') : $('boardStatus');
    var box = kind === 'friend' ? $('friendPreview') : $('boardPreview');
    var img = kind === 'friend' ? $('friendPreviewImg') : $('boardPreviewImg');
    btn.disabled = true;
    status.classList.remove('err');
    status.textContent = '카드를 만드는 중이에요.';
    fontsReady().then(function () {
      var cv = kind === 'friend' ? drawFriendCard() : drawOwnCard();
      return canvasToBlob(cv).then(function (blob) {
        var url = URL.createObjectURL(blob);
        var fname = 'taste-bingo-' + (kind === 'friend' ? 'match' : 'mine') + '-2026.png';
        if (IN_APP) {
          img.src = url;
          box.hidden = false;
          status.textContent = '이미지를 길게 눌러 저장해주세요.';
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
          status.textContent = '카드를 저장했어요.';
          setTimeout(function () { URL.revokeObjectURL(url); }, 20000);
        } catch (e) {
          img.src = url;
          box.hidden = false;
          status.textContent = '저장이 막혔어요. 아래 이미지를 길게 눌러 저장해주세요.';
        }
      });
    }).catch(function () {
      status.classList.add('err');
      status.textContent = '카드를 만들지 못했어요. 한 번 더 눌러주세요.';
    }).then(function () { btn.disabled = false; });
  }

  /* ================= 이벤트 ================= */

  $('accs').addEventListener('click', function (e) {
    var chip = e.target.closest('.chip');
    if (chip) {
      if (chip.dataset.act === 'askcustom') {
        openCustom(parseInt(chip.dataset.cat, 10));
        return;
      }
      toggleChip(parseInt(chip.dataset.cat, 10), chip.dataset.label);
      return;
    }
    var btn = e.target.closest('button');
    if (!btn) { return; }
    var head = btn.closest('.acc-head');
    if (head) {
      var hid = head.id.replace('acc-head-', '');
      setAccOpen(parseInt(hid, 10));
      return;
    }
    var act = btn.dataset.act;
    var ci = parseInt(btn.dataset.cat, 10);
    if (act === 'swap') {
      state.pool[ci] = (state.pool[ci] + 1) % pageCount(ci);
      renderChips(ci);
      return;
    }
    if (act === 'custom') {
      var box = $('custom-' + ci);
      box.hidden = !box.hidden;
      btn.setAttribute('aria-expanded', box.hidden ? 'false' : 'true');
      if (!box.hidden) { $('custom-input-' + ci).focus(); }
      return;
    }
    if (act === 'customadd') {
      addCustom(ci, 'custom-input-' + ci);
    }
  });

  $('accs').addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') { return; }
    var inp = e.target;
    if (inp && inp.id && inp.id.indexOf('custom-input-') === 0) {
      e.preventDefault();
      addCustom(parseInt(inp.id.replace('custom-input-', ''), 10), inp.id);
    }
  });

  $('pickedList').addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-act="remove"]');
    if (!btn) { return; }
    var i = parseInt(btn.dataset.idx, 10);
    if (isNaN(i) || !state.sel[i]) { return; }
    var gone = state.sel[i];
    state.sel.splice(i, 1);
    renderChips(gone.cat);
    syncSel();
  });

  $('nickInput').addEventListener('input', function () {
    state.nick = clean(this.value).slice(0, 12);
  });
  $('nickInput').addEventListener('change', function () {
    if (this.value !== state.nick) { this.value = state.nick; }
  });

  $('makeBtn').addEventListener('click', buildBoard);
  $('rosterMake').addEventListener('click', buildBoard);

  $('editBtn').addEventListener('click', function () {
    show('s-maker');
  });

  $('shareBtn').addEventListener('click', function () {
    var url = shareUrl();
    var box = $('sharebox');
    var input = $('shareUrl');
    input.value = url;
    copyText(url).then(function (ok) {
      box.hidden = false;
      $('shareHint').textContent = ok
        ? '링크를 복사했어요. 붙여넣기로 보내주세요. (길어서 잘려 보여도 끝까지 복사돼요)'
        : '복사가 막혔어요. 위 주소를 길게 눌러 직접 복사해주세요.';
      $('previewLink').href = url;
      if (ok) { toast('공유 링크를 복사했어요.'); }
    });
  });

  $('shareUrl').addEventListener('click', function () { this.select(); });

  $('cardBtn').addEventListener('click', function () { saveCard('own'); });
  $('friendCard').addEventListener('click', function () { saveCard('friend'); });

  $('friendBoard').addEventListener('click', function (e) {
    var el = e.target.closest('.cell');
    if (el) { tapCell(el); }
  });

  $('board').addEventListener('click', function (e) {
    var el = e.target.closest('.cell.free');
    if (el) { tapOwnFree(el); }
  });

  $('mineBtn').addEventListener('click', function () {
    state.fnick = '';
    state.cells = null;
    state.size = 4;
    state.ftapped = {};
    state.ownTapped = {};
    if (history.replaceState) { history.replaceState(null, '', location.pathname); }
    show('s-maker');
    setTimeout(function () { $('nickInput').focus(); }, 120);
  });

  /* ================= 시작 ================= */

  function boot() {
    renderAccs();
    syncSel();

    var raw = '';
    try { raw = new URLSearchParams(location.search).get('b') || ''; } catch (e) { raw = ''; }

    if (raw) {
      var data = null;
      try { data = decodeBoard(raw); } catch (e) { data = null; }
      if (data) {
        state.fnick = data.nick;
        state.size = data.size;
        state.cells = data.cells;
        state.iconOf = assignIcons(data.cells);
        state.ftapped = {};
        renderFriend();
        return;
      }
      var n = $('notice');
      n.hidden = false;
      n.textContent = '공유 링크가 조금 깨져 있어요. 취향을 다시 고르면 새 링크를 만들 수 있어요.';
    }
    show('s-maker');
  }

  boot();
})();
