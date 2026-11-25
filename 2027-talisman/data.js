/* 2027 나만의 부적 카드 — 질문·유형·띠 데이터
   문구를 고칠 때는 이 파일 한 곳만 고치면 화면·카드·공유 링크에 모두 반영된다. */
window.TALISMAN = (function () {
  'use strict';

  /* 질문 넷 — 장면 하나에 질문 하나.
     1~3번은 두 답이 1 / -1 로 갈려 성향 점수를 만들고,
     4번 소원은 고른 쪽 동물 둘에 4점을 더해 마지막 한 마리를 정한다. */
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

  /* 1~3번 답이 맞는 축마다 1점. 4번에서 고른 소원의 두 동물에는 4점을 더한다.
     소원 4점이 성향 3점보다 커서, 결과는 늘 고른 소원의 두 동물 안에서 나온다.
     두 동물이 갈리면 1번 → 2번 → 3번 축 순으로 맞는 쪽을 고른다(같은 답이면 늘 같은 결과). */
  var WISH_BONUS = 4;

  var TYPES = {
    '1,1,1': {
      id: 'magpie', no: '04', roman: 'IV', axes: [1, 1, 1], wish: 'people',
      name: '소식 물어오는 까치', word: '까치',
      img: 'type-1-magpie.webp',
      keyword: '좋은 소식 먼저',
      spell: '좋은 소식은 나부터 듣게 돼요',
      rx: '몇 달 조용하던 사람한테서 먼저 연락이 와요. 모임은 나 빼고 안 열려요.'
    },
    '1,1,-1': {
      id: 'carp', no: '02', roman: 'II', axes: [1, 1, -1], wish: 'flow',
      name: '물살 뚫는 잉어', word: '잉어',
      img: 'type-2-carp.webp',
      keyword: '막힘없이 통과',
      spell: '길은 어떻게든 열려요',
      rx: '미뤄둔 서류가 한 번에 통과돼요.'
    },
    '1,-1,1': {
      id: 'rabbit', no: '03', roman: 'III', axes: [1, -1, 1], wish: 'trip',
      name: '먼저 들어가는 토끼', word: '토끼',
      img: 'type-3-rabbit.webp',
      keyword: '어디서든 편해요',
      spell: '어색한 침묵은 옆사람 몫이에요',
      rx: '처음 간 자리에서도 제일 좋은 자리를 잡아요.'
    },
    '1,-1,-1': {
      id: 'swallow', no: '01', roman: 'I', axes: [1, -1, -1], wish: 'trip',
      name: '훌쩍 떠나는 제비', word: '제비',
      img: 'type-4-swallow.webp',
      keyword: '가고 싶은 곳으로',
      spell: '가고 싶던 곳은 결국 가게 돼요',
      rx: '원하는 날짜에 딱 자리가 생겨요.'
    },
    '-1,1,1': {
      id: 'squirrel', no: '05', roman: 'V', axes: [-1, 1, 1], wish: 'money',
      name: '곳간 채우는 다람쥐', word: '다람쥐',
      img: 'type-5-squirrel.webp',
      keyword: '잔고 두둑해져요',
      spell: '들어온 돈은 새지 않고 쌓여요',
      rx: '잊고 있던 돈이 들어와요.'
    },
    '-1,1,-1': {
      id: 'owl', no: '06', roman: 'VI', axes: [-1, 1, -1], wish: 'money',
      name: '밤새 지키는 부엉이', word: '부엉이',
      img: 'type-6-owl.webp',
      keyword: '지갑 지켜줘요',
      spell: '내가 잘 때 대신 지켜봐요',
      rx: '충동구매하려는 순간 딱 멈추게 돼요.'
    },
    '-1,-1,1': {
      id: 'dog', no: '07', roman: 'VII', axes: [-1, -1, 1], wish: 'people',
      name: '내 편인 강아지', word: '강아지',
      img: 'type-7-dog.webp',
      keyword: '내 편만 골라줘요',
      spell: '웃는 얼굴 뒤가 다 보여요',
      rx: '가짜 웃음 치는 사람을 먼저 알아봐요.'
    },
    '-1,-1,-1': {
      id: 'turtle', no: '08', roman: 'VIII', axes: [-1, -1, -1], wish: 'flow',
      name: '안 급한 거북이', word: '거북이',
      img: 'type-8-turtle.webp',
      keyword: '재촉이 안 통해요',
      spell: '급한 일도 내 앞에선 얌전해져요',
      rx: '재촉하던 사람이 먼저 포기하고 기다려요.'
    }
  };

  /* 점수 → 유형. picks 는 [1번 답, 2번 답, 3번 답, 4번 소원] */
  function matchType(picks) {
    var wish = picks[3];
    var keys = Object.keys(TYPES);
    var best = null;
    var bestRank = -1;

    for (var i = 0; i < keys.length; i += 1) {
      var t = TYPES[keys[i]];
      var score = t.wish === wish ? WISH_BONUS : 0;
      var tie = 0;
      for (var q = 0; q < 3; q += 1) {
        tie *= 2;
        if (picks[q] === t.axes[q]) { score += 1; tie += 1; }
      }
      var rank = score * 100 + tie;   /* 점수 먼저, 같으면 1번 축부터 겨룬다 */
      if (rank > bestRank) { bestRank = rank; best = t; }
    }
    return best;
  }

  /* 결과 유형이 아니라 카드마다 함께 놓이는 2027 정미년 수호 */
  var GUARDIAN = { img: 'sheep-mascot.webp', line: '정미년 수호 양' };

  var ZODIAC = ['쥐띠', '소띠', '호랑이띠', '토끼띠', '용띠', '뱀띠',
    '말띠', '양띠', '원숭이띠', '닭띠', '개띠', '돼지띠'];

  /* 연도를 넣었을 때 카드 아래에 붙는 한 줄 */
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

  var YEAR_MIN = 1930;
  var YEAR_MAX = 2026;

  function zodiacOf(year) {
    return ZODIAC[(((year - 4) % 12) + 12) % 12];
  }

  function validYear(v) {
    return /^\d{4}$/.test(v) && +v >= YEAR_MIN && +v <= YEAR_MAX;
  }

  /* 옛 3문항 축 조합으로도 유형을 찾을 수 있게 두어 둔다. */
  function typeOf(a, b, c) {
    return TYPES[a + ',' + b + ',' + c];
  }

  function byId(id) {
    var keys = Object.keys(TYPES);
    for (var i = 0; i < keys.length; i += 1) {
      if (TYPES[keys[i]].id === id) { return TYPES[keys[i]]; }
    }
    return null;
  }

  return {
    QUESTIONS: QUESTIONS, TYPES: TYPES, GUARDIAN: GUARDIAN,
    ZODIAC: ZODIAC, ZODIAC_LINE: ZODIAC_LINE,
    YEAR_MIN: YEAR_MIN, YEAR_MAX: YEAR_MAX,
    zodiacOf: zodiacOf, validYear: validYear, typeOf: typeOf, matchType: matchType, byId: byId
  };
})();
