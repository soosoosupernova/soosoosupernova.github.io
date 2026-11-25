/* 2027 나만의 부적 카드 — 질문·유형(16종)·띠 사주 데이터
   문구를 고칠 때는 이 파일 한 곳만 고치면 화면·카드·공유 링크에 모두 반영된다. */
window.TALISMAN = (function () {
  'use strict';

  /* 질문 넷 — 장면 하나에 질문 하나.
     1~3번은 두 답이 1 / -1 로 갈려 성향 축을 만들고,
     4번 소원은 어떤 동물 묶음 안에서 뽑을지를 정한다. */
  var QUESTIONS = [
    {
      axis: '1월',
      q: '1월 한 달이 통째로 비었다면 뭐부터?',
      opts: [
        { k: 'A', t: '새로운 일을 벌여본다', v: 1 },
        { k: 'B', t: '진행하던 일을 마무리한다', v: -1 }
      ]
    },
    {
      axis: '12월 31일',
      q: '12월 31일에 만난 친구가 올해 뭐 했냐고 물으면',
      opts: [
        { k: 'A', t: '제일 잘 해낸 것 하나 이야기하기', v: 1 },
        { k: 'B', t: '별일 없이 잘 보냈다고 하기', v: -1 }
      ]
    },
    {
      axis: '금요일 밤',
      q: '금요일 저녁, 약속이 다 취소됐다면?',
      opts: [
        { k: 'A', t: '누구든 불러 모은다', v: 1 },
        { k: 'B', t: '집에서 푹 쉰다', v: -1 }
      ]
    },
    {
      axis: '2027 소원',
      q: '2027년에 제일 바라는 것 하나만 고른다면?',
      opts: [
        { k: 'A', t: '통장에 돈이 차곡차곡 쌓였으면', wish: 'money' },
        { k: 'B', t: '하던 일·시험이 막힘없이 풀렸으면', wish: 'flow' },
        { k: 'C', t: '좋은 연락과 내 편이 많아졌으면', wish: 'people' },
        { k: 'D', t: '가벼운 마음으로 여기저기 잘 다녔으면', wish: 'trip' }
      ]
    }
  ];

  /* ── 16종 ────────────────────────────────────────────────
     소원마다 네 마리. axes 는 그 동물의 대표 답 조합이고,
     실제 매칭은 아래 SLOTS 표(32칸)로만 정한다. */
  var TYPE_LIST = [
    /* 여행 · 여유 */
    { id: 'swallow', no: '01', roman: 'I', axes: [1, -1, -1], wish: 'trip',
      name: '훌쩍 떠나는 제비', word: '제비', img: 'type-4-swallow.webp',
      keyword: '가고 싶은 곳으로', spell: '가고 싶던 곳은 결국 가게 돼요',
      rx: '원하는 날짜에 딱 자리가 생겨요.' },
    /* 일 · 합격 */
    { id: 'carp', no: '02', roman: 'II', axes: [1, 1, -1], wish: 'flow',
      name: '물살 뚫는 잉어', word: '잉어', img: 'type-2-carp.webp',
      keyword: '막힘없이 통과', spell: '길은 어떻게든 열려요',
      rx: '미뤄둔 서류가 한 번에 통과돼요.' },
    /* 여행 · 여유 */
    { id: 'rabbit', no: '03', roman: 'III', axes: [1, -1, 1], wish: 'trip',
      name: '먼저 들어가는 토끼', word: '토끼', img: 'type-3-rabbit.webp',
      keyword: '어디서든 편해요', spell: '어색한 침묵은 옆사람 몫이에요',
      rx: '처음 간 자리에서도 제일 좋은 자리를 잡아요.' },
    /* 사람 · 인연 */
    { id: 'magpie', no: '04', roman: 'IV', axes: [1, 1, 1], wish: 'people',
      name: '소식 물어오는 까치', word: '까치', img: 'type-1-magpie.webp',
      keyword: '좋은 소식 먼저', spell: '좋은 소식은 나부터 듣게 돼요',
      rx: '몇 달 조용하던 사람한테서 먼저 연락이 와요. 모임은 나 빼고 안 열려요.' },
    /* 돈 · 재물 */
    { id: 'squirrel', no: '05', roman: 'V', axes: [-1, 1, 1], wish: 'money',
      name: '곳간 채우는 다람쥐', word: '다람쥐', img: 'type-5-squirrel.webp',
      keyword: '잔고 두둑해져요', spell: '들어온 돈은 새지 않고 쌓여요',
      rx: '잊고 있던 돈이 들어와요.' },
    { id: 'owl', no: '06', roman: 'VI', axes: [-1, 1, -1], wish: 'money',
      name: '밤새 지키는 부엉이', word: '부엉이', img: 'type-6-owl.webp',
      keyword: '지갑 지켜줘요', spell: '내가 잘 때 대신 지켜봐요',
      rx: '충동구매하려는 순간 딱 멈추게 돼요.' },
    /* 사람 · 인연 */
    { id: 'dog', no: '07', roman: 'VII', axes: [-1, -1, 1], wish: 'people',
      name: '내 편인 강아지', word: '강아지', img: 'type-7-dog.webp',
      keyword: '내 편만 골라줘요', spell: '웃는 얼굴 뒤가 다 보여요',
      rx: '가짜 웃음 치는 사람을 먼저 알아봐요.' },
    /* 일 · 합격 */
    { id: 'turtle', no: '08', roman: 'VIII', axes: [-1, -1, -1], wish: 'flow',
      name: '안 급한 거북이', word: '거북이', img: 'type-8-turtle.webp',
      keyword: '재촉이 안 통해요', spell: '급한 일도 내 앞에선 얌전해져요',
      rx: '재촉하던 사람이 먼저 포기하고 기다려요.' },
    /* 돈 · 재물 */
    { id: 'cat', no: '09', roman: 'IX', axes: [1, 1, 1], wish: 'money',
      name: '손님 부르는 고양이', word: '고양이', img: 'type-9-cat.webp',
      keyword: '불러만 두면 와요', spell: '가만히 있어도 알아서 찾아와요',
      rx: '계산하려는 순간 쿠폰이 먼저 걸려요.' },
    /* 사람 · 인연 */
    { id: 'fox', no: '10', roman: 'X', axes: [1, 1, -1], wish: 'people',
      name: '눈치 빠른 여우', word: '여우', img: 'type-10-fox.webp',
      keyword: '분위기를 먼저 알아요', spell: '말 안 해도 다 알아들어요',
      rx: '어색해지기 전에 먼저 말을 꺼내요.' },
    /* 일 · 합격 */
    { id: 'deer', no: '11', roman: 'XI', axes: [1, 1, 1], wish: 'flow',
      name: '꽃길 걷는 사슴', word: '사슴', img: 'type-11-deer.webp',
      keyword: '한 번에 붙어요', spell: '준비한 만큼 그대로 나와요',
      rx: '시험장에 들어가는데 마음이 이상하게 편해요.' },
    /* 여행 · 여유 */
    { id: 'otter', no: '12', roman: 'XII', axes: [-1, 1, 1], wish: 'trip',
      name: '물길 따라 노는 수달', word: '수달', img: 'type-12-otter.webp',
      keyword: '급할 일이 없어요', spell: '밀린 일도 물 흐르듯 지나가요',
      rx: '떠나려던 날 날씨가 딱 맞아요.' },
    /* 돈 · 재물 */
    { id: 'toad', no: '13', roman: 'XIII', axes: [1, -1, 1], wish: 'money',
      name: '엽전 무는 두꺼비', word: '두꺼비', img: 'type-13-toad.webp',
      keyword: '돈이 붙어 있어요', spell: '한 번 들어온 돈은 안 나가요',
      rx: '지갑을 열 때마다 만 원이 한 장 더 있어요.' },
    /* 일 · 합격 */
    { id: 'crane', no: '14', roman: 'XIV', axes: [-1, 1, 1], wish: 'flow',
      name: '합격 부르는 학', word: '학', img: 'type-14-crane.webp',
      keyword: '첫 장부터 술술', spell: '외운 것만 정확히 나와요',
      rx: '답안지 첫 장이 생각보다 빨리 채워져요.' },
    /* 사람 · 인연 */
    { id: 'butterfly', no: '15', roman: 'XV', axes: [-1, 1, 1], wish: 'people',
      name: '사이 이어주는 나비', word: '나비', img: 'type-15-butterfly.webp',
      keyword: '끊긴 연락이 이어져요', spell: '잊고 지낸 얼굴이 다시 떠올라요',
      rx: '소개로 만난 사람과 두 번째 약속이 잡혀요.' },
    /* 여행 · 여유 */
    { id: 'panda', no: '16', roman: 'XVI', axes: [-1, -1, 1], wish: 'trip',
      name: '느긋한 판다', word: '판다', img: 'type-16-panda.webp',
      keyword: '누워 있어도 굴러가요', spell: '나를 재촉하는 소리가 안 들려요',
      rx: '여행 둘째 날 늦잠을 자고 나와도 하루가 아깝지 않아요.' }
  ];

  /* 32칸 매칭표 — 소원마다 앞선 세 답 조합 여덟 가지에 동물 넷을 두 칸씩.
     한 동물이 정확히 두 칸이라 16종이 32조합에 똑같이 두 번씩 나온다.
     소원마다 1번 답이 8/8, 2번·3번 답이 4/8씩 결과를 가른다. */
  var SLOTS = {
    money: {
      '1,1,1': 'cat', '1,1,-1': 'cat',
      '1,-1,1': 'toad', '1,-1,-1': 'toad',
      '-1,1,1': 'squirrel', '-1,1,-1': 'owl',
      '-1,-1,1': 'squirrel', '-1,-1,-1': 'owl'
    },
    flow: {
      '1,1,1': 'deer', '1,1,-1': 'carp',
      '1,-1,1': 'deer', '1,-1,-1': 'carp',
      '-1,1,1': 'crane', '-1,1,-1': 'crane',
      '-1,-1,1': 'turtle', '-1,-1,-1': 'turtle'
    },
    people: {
      '1,1,1': 'magpie', '1,1,-1': 'fox',
      '1,-1,1': 'magpie', '1,-1,-1': 'fox',
      '-1,1,1': 'butterfly', '-1,1,-1': 'butterfly',
      '-1,-1,1': 'dog', '-1,-1,-1': 'dog'
    },
    trip: {
      '1,1,1': 'rabbit', '1,1,-1': 'swallow',
      '1,-1,1': 'rabbit', '1,-1,-1': 'swallow',
      '-1,1,1': 'otter', '-1,1,-1': 'otter',
      '-1,-1,1': 'panda', '-1,-1,-1': 'panda'
    }
  };

  var BY_ID = {};
  TYPE_LIST.forEach(function (t) { BY_ID[t.id] = t; });

  /* '1,1,1#money' 키 32개 — 값은 TYPE_LIST 의 같은 객체를 가리킨다. */
  var TYPES = {};
  Object.keys(SLOTS).forEach(function (wish) {
    var row = SLOTS[wish];
    Object.keys(row).forEach(function (axes) {
      var t = BY_ID[row[axes]];
      if (t) { TYPES[axes + '#' + wish] = t; }
    });
  });

  /* 점수 → 유형. picks 는 [1번 답, 2번 답, 3번 답, 4번 소원].
     16종에서는 축 조합이 소원마다 겹쳐서 표를 그대로 찾는다. */
  function typeOf(a, b, c, wish) {
    return TYPES[Number(a) + ',' + Number(b) + ',' + Number(c) + '#' + wish] || null;
  }

  function matchType(picks) {
    if (!picks || picks.length < 4) { return null; }
    return typeOf(picks[0], picks[1], picks[2], picks[3]);
  }

  function byId(id) {
    return BY_ID[id] || null;
  }

  /* 결과 유형이 아니라 카드마다 함께 놓이는 2027 정미년 수호 */
  var GUARDIAN = { img: 'sheep-mascot.webp', line: '정미년 수호 양' };

  /* 2027 정미년 모두의 보너스 부적 — 열여섯 동물 밖에서 누구나 한 장 더 받는 카드 */
  var BONUS = {
    id: 'bonus-sheep', img: 'sheep-mascot.webp', no: 'BONUS',
    label: '丁未 · 정미년', tag: '모두에게',
    name: '복실양', keyword: '복이 복실복실',
    spell: '어느 부적을 뽑았든 이 한 장은 같이 와요',
    rx: '엉킨 일이 한 번에 풀리고, 만나고 싶던 사람이 먼저 연락해요.',
    line: '2027 정미년 · 열여섯 동물 밖에 한 장 더'
  };

  var ZODIAC = ['쥐띠', '소띠', '호랑이띠', '토끼띠', '용띠', '뱀띠',
    '말띠', '양띠', '원숭이띠', '닭띠', '개띠', '돼지띠'];

  /* 연도를 넣었을 때 카드 아래에 붙는 짧은 한 줄 (옛 문구, 남겨 둔다) */
  var ZODIAC_LINE = {
    '쥐띠': '잔돈이 자꾸 굴러들어와요.',
    '소띠': '묵묵히 하던 일이 결국 마무리돼요.',
    '호랑이띠': '나서지 않아도 제일 먼저 불려요.',
    '토끼띠': '모르는 사람이 먼저 말 걸어와요.',
    '용띠': '큰일 하나가 생각보다 쉽게 풀려요.',
    '뱀띠': '쉬는 날이 진짜 휴일이 돼요.',
    '말띠': '밀린 약속이 이번에 다 잡혀요.',
    '양띠': '갖고 싶던 게 생각보다 싸게 걸려요.',
    '원숭이띠': '줄 서면 내 줄만 빨리 빠져요.',
    '닭띠': '엘리베이터가 늘 먼저 기다려요.',
    '개띠': '강아지한테 유독 인기 많아요.',
    '돼지띠': '먹고 싶던 게 그날 저녁에 나와요.'
  };

  /* 2027 정미년 띠별 사주 — 한자·오행 / 사주 도장 / 부적 한 줄 / 오행 파스텔 */
  var ZODIAC_SAJU = {
    '쥐띠': { hanja: '子 · 수(水)', stamp: '원진·해소운', color: '#CDE9F4',
      line: '원진이 데려온 서운한 마음은 물에 흘러가고, 막힌 물길이 트여요' },
    '소띠': { hanja: '丑 · 토(土)', stamp: '변화·이동운', color: '#E3D7C8',
      line: '축미충이 흔들어 놓은 자리마다, 새 문이 하나씩 열려요' },
    '호랑이띠': { hanja: '寅 · 목(木)', stamp: '직감·반안운', color: '#CFE8BE',
      line: '인미 귀문이 직감을 깨우고, 반안이 자리를 올려줘요' },
    '토끼띠': { hanja: '卯 · 목(木)', stamp: '삼합·성취운', color: '#DDF0C6',
      line: '묘미 반합이 사람을 모아서, 벌여둔 일이 결과로 묶여요' },
    '용띠': { hanja: '辰 · 토(土)', stamp: '동반·실속운', color: '#D5DDCB',
      line: '같은 흙끼리 만나는 해라, 비슷한 사람 사이에서 실속이 굳어요' },
    '뱀띠': { hanja: '巳 · 화(火)', stamp: '방합·추진운', color: '#FFD8C4',
      line: '여름 화국 한 자리를 차지해서, 밀어둔 일이 달아올라요' },
    '말띠': { hanja: '午 · 화(火)', stamp: '귀인·육합운', color: '#FFC7C2',
      line: '오미 육합이 귀인을 붙여서, 부탁 한 번에 일이 풀려요' },
    '양띠': { hanja: '未 · 토(土)', stamp: '본명·창고운', color: '#F7E2C4',
      line: '내 띠 해는 창고가 열려서, 모아둔 것이 내 몫으로 쌓여요' },
    '원숭이띠': { hanja: '申 · 금(金)', stamp: '후원·수확운', color: '#DEE2EF',
      line: '미토가 신금을 낳아서, 준비해둔 것이 뒤에서 밀어줘요' },
    '닭띠': { hanja: '酉 · 금(金)', stamp: '실무·인정운', color: '#F5E9CF',
      line: '미토가 유금을 살려서, 손으로 한 일이 제값을 받아요' },
    '개띠': { hanja: '戌 · 토(土)', stamp: '반안·안착운', color: '#EFD8B9',
      line: '술미 형은 도장을 다시 찍게 해도, 그 한 장으로 자리가 굳어요' },
    '돼지띠': { hanja: '亥 · 수(水)', stamp: '결속·완성운', color: '#D8DFF7',
      line: '해미 반합에 물이 스며서, 미뤄둔 일이 여럿 손에서 끝나요' }
  };

  var YEAR_MIN = 1930;
  var YEAR_MAX = 2026;

  function zodiacOf(year) {
    return ZODIAC[(((year - 4) % 12) + 12) % 12];
  }

  function validYear(v) {
    return /^\d{4}$/.test(v) && +v >= YEAR_MIN && +v <= YEAR_MAX;
  }

  function sajuOf(year) {
    if (validYear(String(year))) { return ZODIAC_SAJU[zodiacOf(+year)] || null; }
    return null;
  }

  return {
    QUESTIONS: QUESTIONS, TYPES: TYPES, TYPE_LIST: TYPE_LIST, SLOTS: SLOTS,
    GUARDIAN: GUARDIAN, BONUS: BONUS, FALLBACK: BY_ID.turtle,
    ZODIAC: ZODIAC, ZODIAC_LINE: ZODIAC_LINE, ZODIAC_SAJU: ZODIAC_SAJU,
    YEAR_MIN: YEAR_MIN, YEAR_MAX: YEAR_MAX,
    zodiacOf: zodiacOf, validYear: validYear, sajuOf: sajuOf,
    typeOf: typeOf, matchType: matchType, byId: byId
  };
})();
