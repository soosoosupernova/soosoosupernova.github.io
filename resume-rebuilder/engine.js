(function () {
  'use strict';

  /* =========================================================
     0. 기본값
     ========================================================= */
  var SERVICE = '이력서 · 링크드인 한 줄 개조기';
  var SHARE_MAX_DOMAIN = 60;

  var TYPE_ORDER = ['architect', 'builder', 'domain', 'solver'];

  /* ---------- 직무 ---------- */
  var ROLES = {
    ux: {
      name: 'UX · 프로덕트 디자인', short: '프로덕트 디자인', noun: '프로덕트 디자이너',
      en: 'Product Designer', enHead: 'Product Designer',
      focus: '화면과 흐름을 설계하는 일',
      keys: ['프로덕트 디자인', 'UX 설계', '화면 설계', '프로토타이핑'],
      pairs: [
        { b: '신규 서비스 화면 설계 담당', a: '가입 3단계를 2단계로 줄여, 중간에 포기하던 지점 하나를 없앴습니다' },
        { b: '2023.03–2023.10 디자인팀 근무 (8개월)', a: '2023.03–2023.10 · 8개월 계약 프로젝트 — 신규 서비스 런칭 화면 설계 후 종료' },
        { b: 'Figma, Notion, Slack 활용', a: 'Figma 컴포넌트 30개를 정리해, 신규 화면 제작 시간을 절반으로 줄였습니다' }
      ]
    },
    strategy: {
      name: '서비스 · 전략 기획', short: '서비스 기획', noun: '서비스 기획자',
      en: 'Service Planner', enHead: 'Service Planner',
      focus: '서비스 구조와 요구사항을 정리하는 일',
      keys: ['서비스 기획', '요구사항 정의', '프로덕트 로드맵', '정책 설계'],
      pairs: [
        { b: '서비스 기획 및 요구사항 정의', a: '기획서 없이 진행되던 결제 개편을 요구사항 문서로 정리해, 개발 착수까지 2주를 줄였습니다' },
        { b: 'OO기업 기획팀 근무 (1년)', a: '1년 계약으로 신규 서비스 런칭 기획 전담 — 런칭 후 계약 종료' },
        { b: '문서 작성, 일정 관리, 커뮤니케이션', a: '3개 팀이 쓰던 용어를 하나로 맞춰, 같은 요구가 두 번 개발되는 일을 없앴습니다' }
      ]
    },
    data: {
      name: '데이터 · 마케팅', short: '데이터 마케팅', noun: '데이터 마케터',
      en: 'Data Marketer', enHead: 'Data Marketer',
      focus: '지표를 보고 채널과 메시지를 고르는 일',
      keys: ['데이터 분석', '퍼포먼스 마케팅', '전환 최적화', '그로스'],
      pairs: [
        { b: '마케팅 지표 관리 및 리포트 작성', a: '주간 리포트를 읽던 팀이 실제로 바꾼 결정 3건을 남겼습니다 — 예: 채널 예산 재배분' },
        { b: '퍼포먼스 마케팅 담당 (10개월)', a: '10개월 캠페인 운영 후 성과 기준을 문서로 남기고 종료' },
        { b: 'GA, SQL, 엑셀 사용', a: 'GA4 이벤트를 다시 설계해, 전환 측정이 누락되던 구간을 없앴습니다' }
      ]
    },
    dev: {
      name: '개발 · 엔지니어링', short: '개발', noun: '엔지니어',
      en: 'Engineer', enHead: 'Engineer',
      focus: '기능을 만들고 배포하는 일',
      keys: ['웹 개발', 'API 설계', '배포 자동화', '성능 개선'],
      pairs: [
        { b: '웹 서비스 개발 담당', a: '배포마다 수동이던 점검 7단계를 스크립트로 바꿔, 배포 시간을 40분에서 10분으로 줄였습니다' },
        { b: '스타트업 개발팀 근무 (7개월)', a: '7개월간 초기 제품 API 설계와 배포 자동화 담당 — 투자 유치 후 조직 개편으로 종료' },
        { b: 'Python, Django, AWS 사용', a: 'Python으로 반복 입력 업무를 자동화해, 주 5시간을 회수했습니다' }
      ]
    },
    ops: {
      name: '운영 · PM', short: '운영 · PM', noun: '프로젝트 매니저',
      en: 'Project Manager', enHead: 'Project Manager',
      focus: '일정과 사람 사이를 정리하는 일',
      keys: ['프로젝트 관리', '일정 관리', '이슈 관리', '프로세스 개선'],
      pairs: [
        { b: '프로젝트 일정 관리 및 진행', a: '일정이 두 번 밀린 프로젝트의 원인을 정리해, 오픈일을 한 번에 확정했습니다' },
        { b: '운영팀 근무 (1년 2개월)', a: '1년 2개월 운영 프로젝트 PM — 서비스 이관 후 종료' },
        { b: 'Notion, Jira, Slack 활용', a: 'Notion에 요청 창구를 하나로 모아, 요청 누락과 중복 처리를 없앴습니다' }
      ]
    },
    other: {
      name: '기타', short: '실무', noun: '실무자',
      en: 'Specialist', enHead: 'Specialist',
      focus: '맡은 업무를 끝까지 처리하는 일',
      keys: ['업무 개선', '문서화', '데이터 정리', '프로세스 정리'],
      pairs: [
        { b: '사무 업무 및 문서 관리', a: '손으로 하던 정산 확인을 표준 양식으로 바꿔, 월말 작업을 하루 줄였습니다' },
        { b: 'OO에서 근무 (11개월)', a: '11개월간 신규 업무 정리 담당 — 담당자 인수인계 후 종료' },
        { b: '엑셀, 한글, 문서 작성', a: '엑셀 자동화로 매월 반복되던 집계를 30분 안에 끝나게 했습니다' }
      ]
    }
  };

  /* ---------- 연차 ---------- */
  var YEARS = {
    y1: { name: '1~2년', short: '2년차', about: '2년 남짓', en: '1–2Y' },
    y3: { name: '3~5년', short: '3~5년차', about: '3~5년', en: '3–5Y' },
    y6: { name: '6~8년', short: '6~8년차', about: '6~8년', en: '6–8Y' },
    y9: { name: '9년 이상', short: '9년차 이상', about: '9년 넘게', en: '9Y+' }
  };

  /* ---------- 핵심 역량 ---------- */
  var COMPS = {
    analysis: {
      name: '데이터 · 지표 분석', adj: '지표로 판단하는', line: '지표로 확인하고 판단합니다',
      en: 'Data-informed', keyword: '데이터 기반 의사결정',
      proof: '숫자를 근거로 결정을 바꾼 기록',
      pitch: '지표가 안 움직이는 이유를 먼저 찾고, 화면과 문구를 함께 고칩니다.'
    },
    structure: {
      name: '복잡한 구조 · 플로우 설계', adj: '복잡한 흐름을 구조로 정리하는', line: '복잡한 흐름을 구조로 정리합니다',
      en: 'Structure-led', keyword: '정보 구조 설계',
      proof: '엉킨 요구를 순서로 바꾼 기록',
      pitch: '복잡한 요구사항을 화면 흐름으로 정리해, 개발 전에 확인할 수 있게 만듭니다.'
    },
    ai: {
      name: 'AI 툴 · 워크플로우 자동화', adj: 'AI로 반복 업무를 줄이는', line: 'AI로 반복 업무를 줄입니다',
      en: 'AI-assisted', keyword: 'AI 워크플로우',
      proof: '반복 작업을 줄인 기록',
      pitch: '반복되는 수작업을 AI 워크플로우로 바꿔, 같은 일을 짧은 시간에 끝내게 만듭니다.'
    },
    biz: {
      name: '사업 · 신규 기획', adj: '새 사업을 기획부터 붙이는', line: '새 사업을 기획부터 붙입니다',
      en: '0-to-1', keyword: '신규 서비스 기획',
      proof: '없던 것을 처음 붙인 기록',
      pitch: '아이디어 단계의 서비스를 기획서와 화면으로 붙여, 첫 사용자에게 보여줄 수 있게 만듭니다.'
    },
    lead: {
      name: '이해관계자 조율 · 리딩', adj: '여러 팀을 한 방향으로 묶는', line: '여러 팀을 한 방향으로 묶습니다',
      en: 'Cross-functional', keyword: '이해관계자 조율',
      proof: '서로 다른 팀의 기준을 맞춘 기록',
      pitch: '여러 팀이 섞인 프로젝트에서 결정을 정리하고, 일정까지 닫습니다.'
    },
    research: {
      name: '사용자 리서치 · 심리 이해', adj: '사용자의 말하지 않은 이유를 읽는', line: '사용자가 말하지 않은 이유를 읽습니다',
      en: 'Research-driven', keyword: '사용자 리서치',
      proof: '사용자의 말을 해석해 바꾼 기록',
      pitch: '인터뷰와 사용 기록을 읽어, 무엇을 먼저 고쳐야 하는지 정리합니다.'
    }
  };

  /* ---------- 툴 ---------- */
  var TOOLS = {
    figma: { name: 'Figma', en: 'Figma', keyword: 'Figma' },
    ai: { name: 'Claude · ChatGPT', en: 'AI Prototyping (Claude · ChatGPT)', keyword: 'Claude 활용' },
    python: { name: 'Python · SQL', en: 'Python · SQL', keyword: 'Python' },
    notion: { name: 'Notion · 자동화 툴', en: 'Notion · Automation', keyword: 'Notion 자동화' },
    ga: { name: 'GA · 데이터 툴', en: 'GA4 · Analytics', keyword: 'GA4' },
    etc: { name: '기타', en: '', keyword: '' }
  };

  /* ---------- 도메인 · 전공 칩 (한글 표기 ↔ 영문 표기) ---------- */
  var DOMAINS = {
    adtech: { name: '애드테크 · 데이터', en: 'AdTech & Data' },
    health: { name: '의료 · 헬스케어', en: 'Healthcare' },
    commerce: { name: '이커머스', en: 'E-Commerce' },
    saas: { name: 'B2B SaaS', en: 'B2B SaaS' },
    fintech: { name: '금융 · 핀테크', en: 'Fintech' },
    psych: { name: '심리학 · 행동 연구', en: 'Psychology & Behavioral Research' },
    edtech: { name: '교육 · 에듀테크', en: 'EdTech' }
  };
  var DOMAIN_ORDER = ['adtech', 'health', 'commerce', 'saas', 'fintech', 'psych', 'edtech'];

  /* ---------- 직무별 체크리스트 예시 (안 해본 툴 빼기) ---------- */
  var TOOL_CUT = {
    ux: { basis: '화면과 프로토타입을 Figma로 만들었다면', pads: ['python', 'ga', 'notion'] },
    strategy: { basis: '기획서와 요구사항을 문서로 정리했다면', pads: ['python', 'figma', 'ga'] },
    data: { basis: '지표와 캠페인을 GA로 봤다면', pads: ['figma', 'notion', 'python'] },
    dev: { basis: 'API와 배포를 코드로 다뤘다면', pads: ['figma', 'ga', 'notion'] },
    ops: { basis: '일정과 이슈를 Notion으로 관리했다면', pads: ['python', 'figma', 'ga'] },
    other: { basis: '문서와 표로 업무를 정리했다면', pads: ['figma', 'python', 'ga'] }
  };

  /* ---------- 피하고 싶은 오해 ---------- */
  var ILLUSIONS = {
    pretty: { name: '예쁜 시안만 그리는 사람처럼 보임' },
    chores: { name: '단순 잡무 · 운영 담당처럼 보임' },
    jobhop: { name: '잦은 이직 · 물경력처럼 보임' },
    overclaim: { name: '못 다루는 기술까지 아는 척 보일까 부담' }
  };

  var ILLUSION_READ = {
    architect: {
      pretty: {
        title: '첫 줄이 결과물 이름으로 시작해서 그렇습니다',
        body: '구조화 전략가의 강점은 화면 밖에 있습니다. 그런데 프로필 첫 줄이 툴과 결과물 이름으로 채워져 있으면, 읽는 사람은 마지막 단계인 시안만 기억합니다.',
        fix: '"무엇을 만들었다" 대신 "무엇이 엉켜 있던 것을 정리했다"를 첫 줄에 둡니다.'
      },
      chores: {
        title: '"운영·관리·지원"이 강점을 지우고 있습니다',
        body: '정리하는 일을 오래 하면 이력서에 운영·관리·지원이 많이 남습니다. 이 단어들은 읽는 사람에게 대신 처리해 주는 사람으로 먼저 읽히고, 구조를 설계했다는 정보는 그 뒤에 묻힙니다.',
        fix: '운영은 한 줄로 줄이고, 그 운영에서 무엇을 바꿨는지를 앞세웁니다.'
      },
      jobhop: {
        title: '기간이 먼저 보이면 구조는 보이지 않습니다',
        body: '짧은 근무가 여러 개면 읽는 사람은 각 회사에서 무엇을 했는지보다 왜 짧았는지를 먼저 봅니다. 구조화 전략가의 강점은 회사가 아니라 프로젝트 단위로 드러나는데, 지금 프로필은 회사 단위로만 적혀 있습니다.',
        fix: '회사 아래에 프로젝트를 한 줄씩 붙이고, 기간도 프로젝트 기준으로 다시 적습니다.'
      },
      overclaim: {
        title: '기술 나열이 판단을 가리고 있습니다',
        body: '못 다루는 기술을 적어두면 면접의 첫 질문이 거기서 나옵니다. 구조화 전략가는 기술의 폭이 아니라 판단의 근거로 평가받아야 하는데, 지금 프로필은 툴 목록이 앞에 있어 판단이 뒤로 밀립니다.',
        fix: '툴은 마지막 한 줄로 내리고, 어떤 판단을 해왔는지를 먼저 씁니다.'
      }
    },
    builder: {
      pretty: {
        title: '결과물이 앞에 있고 근거가 뒤에 있습니다',
        body: '데이터 기반 빌더의 강점은 무엇을 근거로 결정했는가입니다. 그런데 시안·화면·디자인 같은 결과물 단어가 앞에 있으면 근거는 사라지고 그림만 남습니다.',
        fix: '첫 줄에 판단의 근거를 넣습니다 — "지표를 먼저 열고 결정합니다".'
      },
      chores: {
        title: '분석이 보고서 작성으로만 남아 있습니다',
        body: '분석을 해도 리포트 작성, 지표 관리로 적히면 잡무로 읽힙니다. 같은 일을 이 지표를 보고 이 결정을 바꿨다로 적으면 판단하는 사람으로 읽힙니다.',
        fix: '업무명 대신 결정문으로 적습니다 — "A를 B로 바꿨다".'
      },
      jobhop: {
        title: '짧은 기간이 실험으로 읽히지 않습니다',
        body: '여러 조직을 짧게 거친 사람은 데이터 직무에서 오히려 유리한 조건입니다. 문제는 기간만 적혀 있으면 그게 실험이었는지 방황이었는지 읽는 사람이 판단할 수 없다는 점입니다.',
        fix: '각 근무에 무엇을 검증하고 무엇을 남겼는지 한 줄을 붙입니다.'
      },
      overclaim: {
        title: '다뤄본 적 없는 도구가 숫자의 신뢰를 깎습니다',
        body: '데이터 직무는 도구 검증이 빠릅니다. 목록에 있는 도구로 실제 질문을 던지면, 한 번 막히는 순간 나머지 숫자까지 의심받습니다.',
        fix: '실무에서 메인으로 쓴 것만 남기고, 나머지는 학습 중으로 따로 적습니다.'
      }
    },
    domain: {
      pretty: {
        title: '도메인이 학력란에만 남아 있습니다',
        body: '도메인 연결형 기획자의 값은 이 분야의 말이 통하는 사람이라는 점입니다. 그런데 프로필이 일반적인 기획 문구로 채워져 있으면, 희소한 배경은 맨 아래 학력란에만 남습니다.',
        fix: '도메인을 첫 줄로 올립니다. 직함 앞이나 바로 뒤에 한 단어로 넣으세요.'
      },
      chores: {
        title: '전문성이 잡무에 섞여 있습니다',
        body: '도메인을 안다는 건 그 분야에서만 생기는 예외를 안다는 뜻입니다. 그런데 이력서에 그 예외를 처리한 기록이 없고 관리 업무만 있으면, 읽는 사람은 그냥 오래 일한 사람으로 봅니다.',
        fix: '그 분야에서만 생기는 문제를 하나 골라, 어떻게 처리했는지 적습니다.'
      },
      jobhop: {
        title: '여러 분야가 한 방향으로 묶이지 않습니다',
        body: '도메인이 여러 개면 강점이 흩어집니다. 지금 프로필은 각 경험이 따로 있어서, 읽는 사람이 이 사람이 어디에 맞는지 스스로 조합해야 합니다.',
        fix: '공통 도메인 하나를 정해 맨 위에 쓰고, 나머지는 그 아래 근거로 붙입니다.'
      },
      overclaim: {
        title: '배경이 기술처럼 읽히고 있습니다',
        body: '전공이나 자격을 기술 스택처럼 나열하면, 실무 경험과 학습을 읽는 사람이 구분하지 못합니다. 그러면 가장 강한 카드인 배경이 오히려 의심을 만듭니다.',
        fix: '배경은 한 줄로만 쓰고, 그것으로 무엇을 할 수 있는지를 옆에 붙입니다.'
      }
    },
    solver: {
      pretty: {
        title: '해결한 일이 목록에 남아 있지 않습니다',
        body: '실행형 문제해결사는 닫힌 일로 평가받습니다. 그런데 프로필이 참여한 일의 목록이면 무엇이 끝났는지 알 수 없습니다. 문제는 여러 개인데 해결은 하나도 보이지 않습니다.',
        fix: '각 줄을 무엇이 막혀 있었고 어떻게 닫았는지로 바꿉니다.'
      },
      chores: {
        title: '조율이 잡무로 적혀 있습니다',
        body: '일정 관리, 커뮤니케이션, 지원은 조율의 결과가 아니라 도구입니다. 도구만 적으면 대체 가능한 사람으로 읽히고, 결정을 닫은 사람으로는 읽히지 않습니다.',
        fix: '도구 대신 결과를 적습니다 — "A팀과 B팀의 기준을 하나로 맞췄다".'
      },
      jobhop: {
        title: '짧은 근무가 신뢰를 깎고 있습니다',
        body: '실행형 문제해결사는 조직의 신뢰가 필요한 자리라 짧은 근무가 그대로 약점이 됩니다. 다만 그 기간에 무엇을 닫았는지가 있으면, 이야기는 짧게 일하고 크게 끝냈다로 바뀝니다.',
        fix: '근무 기간 옆에 닫은 일의 개수를 적습니다.'
      },
      overclaim: {
        title: '못 하는 기술이 조율의 신뢰를 깎습니다',
        body: '조율하는 사람이 모든 기술을 알 필요는 없습니다. 그런데 목록에 올린 기술을 못 하면, 조율할 때 판단 근거가 약해 보입니다.',
        fix: '아는 기술은 판단할 수 있는 수준으로 표현하고, 실제로 쓰는 것만 남깁니다.'
      }
    }
  };

  /* ---------- 목적 ---------- */
  var PURPOSES = {
    remote: {
      name: '원격 · 리모트 외주 일감', short: '원격 외주',
      line: '지금은 원격으로 진행할 수 있는 외주 일감을 찾고 있습니다.',
      tail: '지금은 원격 외주 일감을 찾고 있습니다.',
      key: '원격 근무',
      hlNote: '마지막에 "원격 근무 가능"을 붙입니다. 클라이언트가 먼저 찾는 조건입니다.'
    },
    move: {
      name: '이직 · 헤드헌터 스카우트', short: '이직',
      line: '지금은 정규직 이직을 준비하고 있습니다.',
      tail: '지금은 정규직 이직을 준비하고 있습니다.',
      key: '경력직',
      hlNote: '지원하는 공고의 직무명을 뒤에 그대로 붙이면 검색에도 걸립니다.'
    },
    transition: {
      name: '직무 전환 서사 정리', short: '직무 전환',
      line: '지금은 직무를 옮기는 중입니다. 이전 경력은 그 전환의 근거로 씁니다.',
      tail: '지금은 직무 전환 중이고, 이전 경력이 그 근거입니다.',
      key: '직무 전환',
      hlNote: '전환하려는 직무명을 앞에 두고, 이전 경력은 아래에서 받칩니다.'
    },
    builder: {
      name: '1인 빌더 · 프리랜서 명함', short: '1인 빌더',
      line: '지금은 1인 빌더로 작은 제품을 직접 만들고 있습니다.',
      tail: '지금은 작은 제품을 직접 만들고 있습니다.',
      key: '1인 개발',
      hlNote: '회사명 대신 직접 만든 것의 이름을 넣습니다.'
    }
  };

  /* ---------- 포지셔닝 유형 ---------- */
  var TYPES = {
    architect: {
      name: '구조화 전략가',
      tagline: '흩어진 요구를 구조로 바꿔, 다음 사람이 바로 일할 수 있게 만드는 유형',
      why: '이 유형의 강점은 결과물이 아니라 순서에 있습니다. 그런데 프로필은 대개 마지막 결과물만 적어서, 구조를 만든 사람이 아니라 마지막에 손댄 사람으로 읽힙니다.',
      firstLine: '첫 줄에는 만든 것보다 정리한 것을 씁니다.',
      hook: '화면을 예쁘게 만드는 일보다, 왜 이 순서여야 하는지를 먼저 정리합니다. 복잡한 요구가 들어오면 구조부터 그리고, 그 위에 화면을 올립니다.',
      watch: '정리한 일은 눈에 안 보여서, 기록이 없으면 한 일이 없는 사람이 됩니다.'
    },
    builder: {
      name: '데이터 기반 빌더',
      tagline: '감이 아니라 근거로 결정하고, 그 근거를 남기는 유형',
      why: '강점이 판단의 근거인데, 프로필에는 판단이 안 보이고 도구와 결과물만 남습니다. 그래서 분석을 하는 사람이 아니라 리포트를 만드는 사람으로 읽힙니다.',
      firstLine: '첫 줄에는 무엇을 근거로 결정하는지 씁니다.',
      hook: '감으로 결정하는 일을 줄이는 쪽으로 일해왔습니다. 지표를 먼저 열고, 숫자가 말하는 지점에서 다음 작업을 정합니다.',
      watch: '근거를 남기지 않으면, 좋은 판단도 운으로 읽힙니다.'
    },
    domain: {
      name: '도메인 연결형 기획자',
      tagline: '그 분야의 말이 통하기 때문에, 회의에서 놓치는 전제를 먼저 짚는 유형',
      why: '희소한 배경이 프로필 맨 아래 학력란에만 있습니다. 읽는 사람은 첫 세 줄에서 판단을 끝내기 때문에, 그 배경은 읽히지 않고 지나갑니다.',
      firstLine: '첫 줄에 도메인을 올립니다. 일반적인 기획 문구보다 먼저.',
      hook: '현장의 언어를 아는 것이 강점입니다. 도메인을 이해하고 있어서, 기획 단계에서 놓치는 전제를 먼저 짚습니다.',
      watch: '도메인이 여러 개면 강점이 흩어집니다. 하나를 골라 대표로 세워야 합니다.'
    },
    solver: {
      name: '실행형 문제해결사',
      tagline: '결정이 안 되는 자리에서 정리를 만들고, 그걸로 일을 닫는 유형',
      why: '닫은 일이 강점인데 프로필은 참여한 일의 목록입니다. 그래서 책임을 지는 사람이 아니라 옆에서 도운 사람으로 읽힙니다.',
      firstLine: '첫 줄에 닫은 일을 하나 씁니다.',
      hook: '회의에서 결정이 안 되면 그 자리에서 정리하는 쪽입니다. 누가 무엇을 언제까지 하는지 적어 두고, 그걸로 일을 닫습니다.',
      watch: '닫은 일은 시간이 지나면 당연해집니다. 기록해 두지 않으면 사라집니다.'
    }
  };

  /* =========================================================
     1. 도우미
     ========================================================= */
  function pad2(n) {
    var v = parseInt(n, 10);
    if (!isFinite(v)) { v = 0; }
    return v < 10 ? '0' + v : String(v);
  }

  /* 받침에 따라 조사를 고른다 */
  function josa(word, pair) {
    var w = String(word || '');
    var parts = String(pair).split('/');
    var code = w.length ? w.charCodeAt(w.length - 1) : 0;
    if (code < 0xAC00 || code > 0xD7A3) { return parts[0]; }
    var jong = (code - 0xAC00) % 28;
    if (parts[0] === '으로') { return (jong !== 0 && jong !== 8) ? '으로' : '로'; }
    return jong === 0 ? parts[1] : parts[0];
  }

  function esc(s) {
    var t = String(s === undefined || s === null ? '' : s);
    t = t.replace(/&/g, '&amp;');
    t = t.replace(/</g, '&lt;');
    t = t.replace(/>/g, '&gt;');
    t = t.replace(/"/g, '&quot;');
    return t;
  }

  function uniq(list) {
    var seen = {}, out = [];
    for (var i = 0; i < list.length; i++) {
      var v = String(list[i] || '').replace(/^\s+|\s+$/g, '');
      if (!v) { continue; }
      if (seen[v]) { continue; }
      seen[v] = 1;
      out.push(v);
    }
    return out;
  }

  function has(list, v) {
    if (!list) { return false; }
    for (var i = 0; i < list.length; i++) { if (list[i] === v) { return true; } }
    return false;
  }

  function pick(map, key, fallback) {
    return map && map[key] ? map[key] : map[fallback];
  }

  function hasHangul(s) {
    return /[\uAC00-\uD7A3]/.test(String(s === undefined || s === null ? '' : s));
  }

  /* 직접 입력한 도메인: 공백 정리 + 앞뒤 구분점 제거 (문장에 붙여도 깨지지 않게) */
  function cleanDomainText(s) {
    var t = String(s === undefined || s === null ? '' : s).replace(/\s+/g, ' ');
    t = t.replace(/^[\s,·\/]+/, '').replace(/[\s,·\/]+$/, '');
    return t.slice(0, SHARE_MAX_DOMAIN);
  }

  /* 도메인 영문 표기: 칩은 매핑값, 직접 입력은 영문만 통과 */
  function domainEnOf(a) {
    if (a && a.domainKey && DOMAINS[a.domainKey]) { return DOMAINS[a.domainKey].en; }
    var f = (a && a.domainFree) ? String(a.domainFree) : '';
    if (f && !hasHangul(f)) { return f; }
    return '';
  }

  function domainKoOf(a) {
    if (a && a.domainKey && DOMAINS[a.domainKey]) { return DOMAINS[a.domainKey].name; }
    return (a && a.domainFree) ? String(a.domainFree) : '';
  }

  /* =========================================================
     경력기술 문장 생성기 · 규칙 기반 데이터
     ========================================================= */
  var CAREER_WORKS = {
    W1: { label: '기존 업무 프로세스를 개선했어요', fallback: '기존 업무 프로세스를 점검하고 개선이 필요한 부분을 검토하는 업무를 수행했습니다.' },
    W2: { label: '가이드나 문서를 만들었어요', fallback: '업무 수행에 필요한 가이드와 문서를 제작하고 관련 정보를 정리했습니다.' },
    W3: { label: '문제를 발견하고 해결했어요', fallback: '업무 수행 과정에서 발생한 문제를 파악하고 해결 방안을 검토했습니다.' },
    W4: { label: '자료를 조사하고 분석했어요', fallback: '업무와 관련된 자료를 조사·분석하고 주요 내용을 정리했습니다.' },
    W5: { label: '프로젝트나 업무를 운영·관리했어요', fallback: '프로젝트의 일정과 진행 상황을 관리하고 업무 운영을 지원했습니다.' },
    W6: { label: '여러 사람이나 부서 사이에서 조율했어요', fallback: '여러 이해관계자 간 요구사항과 진행 상황을 조율하고 업무 협업을 지원했습니다.' },
    W7: { label: '새로운 제품·서비스·콘텐츠를 기획하거나 만들었어요', fallback: '제품·서비스·콘텐츠의 기획 및 제작 업무를 수행했습니다.' },
    W8: { label: '고객이나 사용자를 직접 응대하고 지원했어요', fallback: '고객 및 사용자의 문의와 요청 사항을 확인하고 필요한 지원을 제공했습니다.' },
    W9: { label: '다른 사람을 교육하거나 업무를 알려줬어요', fallback: '구성원의 업무 이해와 수행을 돕기 위한 교육 및 안내를 진행했습니다.' },
    W10: { label: '고객이나 거래처를 발굴하고 영업 활동을 했어요', fallback: '고객 및 거래처 발굴과 영업 관련 업무를 수행했습니다.' }
  };

  var CAREER_CHANGES = {
    R1: '업무 기준이나 절차가 명확해졌어요',
    R2: '협업이나 정보 공유가 쉬워졌어요',
    R3: '시간이나 반복 작업을 줄였어요',
    R4: '업무의 정확성이나 품질이 좋아졌어요',
    R5: '고객이나 사용자의 경험이 좋아졌어요',
    R6: '어떤 변화가 있었는지 잘 모르겠어요',
    R7: '업무 방식이나 결과에 특별한 변화는 없었어요'
  };

  var CAREER_RECALL = {
    W1: [{t:'업무 순서나 진행 방식이 정리됐어요',r:'R1'},{t:'불필요하거나 중복되는 작업이 줄었어요',r:'R3'},{t:'실수하거나 누락하는 일이 줄었어요',r:'R4'},{t:'다른 사람도 같은 방식으로 업무를 처리할 수 있게 됐어요',r:'R2'}],
    W2: [{t:'업무 처리 기준을 정리할 수 있었어요',r:'R1'},{t:'다른 사람과 필요한 정보를 공유하기 쉬워졌어요',r:'R2'},{t:'필요한 정보를 찾는 시간이 줄었어요',r:'R3'},{t:'업무 누락이나 해석 차이를 줄이는 데 도움이 됐어요',r:'R4'}],
    W3: [{t:'반복적으로 발생하던 문제가 줄었어요',r:'R3'},{t:'오류나 누락이 줄었어요',r:'R4'},{t:'비슷한 문제에 대응할 기준이 생겼어요',r:'R1'},{t:'고객이나 사용자의 불편이 줄었어요',r:'R5'}],
    W4: [{t:'업무 판단에 필요한 기준이나 근거가 명확해졌어요',r:'R1'},{t:'분석 결과를 공유하기 쉬워졌어요',r:'R2'},{t:'자료의 정확성이나 분석의 신뢰도가 높아졌어요',r:'R4'},{t:'고객이나 사용자의 요구를 파악하는 데 도움이 됐어요',r:'R5'}],
    W5: [{t:'일정이나 업무 진행 기준이 명확해졌어요',r:'R1'},{t:'참여자 간 진행 상황을 공유하기 쉬워졌어요',r:'R2'},{t:'일정 충돌이나 불필요한 조정이 줄었어요',r:'R3'},{t:'업무 누락이나 진행상 오류를 줄였어요',r:'R4'}],
    W6: [{t:'요구사항과 담당 범위가 명확해졌어요',r:'R1'},{t:'부서 간 정보 공유와 협업이 쉬워졌어요',r:'R2'},{t:'중복 업무나 일정 조율에 드는 시간이 줄었어요',r:'R3'},{t:'정보 전달 과정의 누락이나 혼선이 줄었어요',r:'R4'}],
    W7: [{t:'기획 방향이나 제작 기준이 명확해졌어요',r:'R1'},{t:'관련 구성원과 기획 내용을 공유하기 쉬워졌어요',r:'R2'},{t:'제작 과정의 반복 작업이 줄었어요',r:'R3'},{t:'결과물의 완성도나 품질이 좋아졌어요',r:'R4'},{t:'사용자 요구나 이용 맥락이 더 잘 반영됐어요',r:'R5'}],
    W8: [{t:'고객 문의에 대응하는 기준이 정리됐어요',r:'R1'},{t:'관련 부서와 고객 요청을 공유하기 쉬워졌어요',r:'R2'},{t:'반복 문의에 대응하는 시간이 줄었어요',r:'R3'},{t:'응대 과정의 누락이나 오류가 줄었어요',r:'R4'},{t:'고객이나 사용자의 불편이 줄었어요',r:'R5'}],
    W9: [{t:'업무 수행 절차와 기준을 이해하기 쉬워졌어요',r:'R1'},{t:'구성원 간 업무 지식 공유가 쉬워졌어요',r:'R2'},{t:'반복 설명에 드는 시간이 줄었어요',r:'R3'},{t:'업무 수행 중 실수나 누락을 줄이는 데 도움이 됐어요',r:'R4'}],
    W10: [{t:'영업 진행 절차와 고객 관리 기준이 정리됐어요',r:'R1'},{t:'고객 및 거래처 정보를 내부에서 공유하기 쉬워졌어요',r:'R2'},{t:'고객 발굴이나 영업 진행 과정이 효율적으로 바뀌었어요',r:'R3'},{t:'고객 정보나 영업 진행 현황을 더 정확하게 관리하게 됐어요',r:'R4'},{t:'고객 요구에 더 적합한 제안을 할 수 있었어요',r:'R5'}]
  };

  var CAREER_ROLES = {
    C1: '해당 업무를 직접 실행하고 적용했습니다.',
    C2: '기존 자료와 진행 방식을 점검하고 정리했습니다.',
    C3: '개선이 필요한 지점을 파악하고 실행 방안을 제안했습니다.',
    C4: '관련 구성원과 협업하여 업무를 진행했습니다.',
    C5: '실행 과정과 진행 상황을 관리했습니다.',
    C6: ''
  };
  var CAREER_ROLE_LABELS = {
    C1: '직접 실행하고 적용했어요', C2: '기존 내용이나 방식을 정리했어요',
    C3: '개선 필요성을 발견하고 제안했어요', C4: '다른 구성원과 함께 진행했어요',
    C5: '실행 과정이나 진행 상황을 관리했어요', C6: '정확히 어떤 역할이었는지 잘 모르겠어요'
  };

  var CAREER_TEMPLATES = {
    W1: {R1:'기존 업무 프로세스를 개선하여 업무 수행 절차와 기준을 명확하게 정리했습니다.',R2:'기존 업무 프로세스를 정비하고 관련 정보를 공유하여 구성원 간 업무 협업을 지원했습니다.',R3:'기존 업무 프로세스를 점검하고 불필요한 단계를 개선하여 반복 업무를 간소화했습니다.',R4:'기존 업무 프로세스에서 오류가 발생하는 구간을 파악하고 개선하여 업무 정확성을 높였습니다.',R5:'기존 업무 프로세스를 개선하여 고객의 요청과 이용 과정에서 발생하는 불편을 줄이는 데 기여했습니다.'},
    W2: {R1:'업무 수행에 필요한 가이드와 문서를 제작하여 업무 기준과 절차를 체계적으로 정리했습니다.',R2:'업무 가이드와 문서를 제작하여 구성원 간 정보 공유와 업무 이해를 지원했습니다.',R3:'주요 업무 정보와 참고 자료를 문서화하여 필요한 정보를 확인하는 과정을 효율화했습니다.',R4:'업무 가이드와 체크리스트를 제작하여 업무 누락을 방지하고 수행 과정의 일관성을 높였습니다.',R5:'고객 및 사용자 안내 자료를 제작하여 서비스 이용에 필요한 정보를 쉽게 전달할 수 있도록 지원했습니다.'},
    W3: {R1:'업무 과정에서 발생한 문제를 분석하고 대응 절차를 정리하여 유사 상황에 적용할 수 있는 기준을 마련했습니다.',R2:'문제 해결 과정과 관련 정보를 공유하여 유관 구성원 간 대응 방향을 조율했습니다.',R3:'반복적으로 발생하는 문제의 원인을 파악하고 개선 조치를 적용하여 재작업을 줄이는 데 기여했습니다.',R4:'업무 과정에서 발생한 오류의 원인을 파악하고 개선 조치를 적용하여 업무 정확성을 높였습니다.',R5:'고객 및 사용자의 불편 사항을 파악하고 해결 방안을 적용하여 이용 경험 개선에 기여했습니다.'},
    W4: {R1:'관련 자료와 현황을 조사·분석하여 업무 수행에 필요한 판단 기준을 구체화했습니다.',R2:'조사·분석 결과를 정리하고 공유하여 관련 구성원이 주요 현황과 시사점을 파악할 수 있도록 지원했습니다.',R3:'관련 자료를 수집·분석하고 핵심 정보를 정리하여 자료 검토와 확인 과정을 효율화했습니다.',R4:'데이터와 관련 자료를 교차 검토하여 분석 결과의 정확성과 신뢰성을 높였습니다.',R5:'고객 및 사용자 관련 자료를 조사·분석하여 주요 요구사항을 파악하고 서비스 개선 방향을 도출하는 데 기여했습니다.'},
    W5: {R1:'프로젝트의 일정과 업무 진행 절차를 정리하여 업무 수행 기준과 관리 체계를 명확히 했습니다.',R2:'프로젝트 진행 상황과 주요 이슈를 공유하여 참여 구성원 간 업무 연계를 지원했습니다.',R3:'업무 우선순위와 일정을 조정하여 프로젝트 운영 과정의 비효율을 줄이는 데 기여했습니다.',R4:'프로젝트 진행 상황과 주요 이슈를 점검하여 일정 및 업무 누락을 예방했습니다.',R5:'고객 요구사항과 프로젝트 진행 상황을 관리하여 관련 요구가 업무에 반영될 수 있도록 지원했습니다.'},
    W6: {R1:'관계자별 요구사항과 업무 범위를 정리하여 협업에 필요한 업무 기준을 명확히 했습니다.',R2:'여러 부서 및 이해관계자 간 정보를 공유하고 의견을 조율하여 원활한 협업을 지원했습니다.',R3:'부서 간 중복 업무와 일정 충돌을 조율하여 업무 진행 과정의 비효율을 줄였습니다.',R4:'관계자 간 전달 사항과 업무 진행 내용을 확인·조율하여 정보 누락과 업무 혼선을 방지했습니다.',R5:'고객 및 유관 부서의 요구사항을 조율하고 관련 내용을 업무에 반영하여 고객 요구에 대한 대응력을 높였습니다.'},
    W7: {R1:'신규 제품·서비스·콘텐츠의 기획 방향과 제작 기준을 정리하여 실행에 필요한 기준을 구체화했습니다.',R2:'기획 의도와 주요 내용을 관련 구성원과 공유하여 제작 및 실행 과정의 협업을 지원했습니다.',R3:'기획 및 제작 과정을 정리하고 반복 작업을 개선하여 결과물 제작 과정을 효율화했습니다.',R4:'결과물의 구성과 내용을 검토·보완하여 완성도와 품질을 높였습니다.',R5:'사용자 요구와 이용 맥락을 반영하여 제품·서비스·콘텐츠를 기획하고 사용자 경험 개선에 기여했습니다.'},
    W8: {R1:'고객 문의와 요청 사항을 유형별로 정리하여 응대 기준과 처리 절차를 명확히 했습니다.',R2:'고객 문의 및 대응 내용을 관련 부서와 공유하여 고객 요청에 대한 연계 대응을 지원했습니다.',R3:'반복 문의 유형과 응대 방식을 정리하여 고객 응대 업무의 효율성을 높였습니다.',R4:'고객 문의와 요청 사항을 확인하고 처리 내용을 점검하여 응대의 정확성을 높였습니다.',R5:'고객 및 사용자의 문의와 불편 사항을 파악하고 해결 방안을 안내하여 이용 경험 개선에 기여했습니다.'},
    W9: {R1:'업무 수행에 필요한 절차와 기준을 교육 자료로 정리하여 구성원의 업무 이해를 지원했습니다.',R2:'구성원 간 업무 지식과 경험을 공유하고 교육을 진행하여 업무 적응과 협업을 지원했습니다.',R3:'반복적으로 설명하던 업무 내용을 교육 자료로 정리하여 교육 및 안내 과정을 효율화했습니다.',R4:'업무 수행 시 주의사항과 확인 기준을 교육하여 업무 오류와 누락을 예방하는 데 기여했습니다.',R5:'고객 응대 및 사용자 지원에 필요한 내용을 구성원에게 교육하여 일관된 고객 경험 제공을 지원했습니다.'},
    W10: {R1:'영업 활동에 필요한 고객 관리 절차와 제안 자료를 정리하여 영업 수행 기준을 체계화했습니다.',R2:'고객 및 거래처 관련 정보를 내부 구성원과 공유하여 영업 기회와 대응 현황을 파악할 수 있도록 지원했습니다.',R3:'고객 발굴 및 영업 진행 과정을 정리하여 영업 활동의 효율성을 높이는 데 기여했습니다.',R4:'고객 정보와 영업 진행 현황을 점검하여 거래처 관리의 정확성을 높였습니다.',R5:'고객 및 거래처의 요구사항을 파악하고 맞춤형 제안을 진행하여 고객 니즈에 부합하는 영업 활동을 수행했습니다.'}
  };

  function careerSentenceData(a) {
    var c = a && a.career ? a.career : {};
    var works = (c.works || []).filter(function (id, i, arr) { return CAREER_WORKS[id] && arr.indexOf(id) === i; }).slice(0, 2);
    if (!works.length) { return { sentences: [], status: 'empty' }; }
    var sentences = [], details = [];
    for (var i = 0; i < works.length; i++) {
      var id = works[i];
      var change = c.change === 'R6' ? ((c.recall || {})[id] || 'R6') : c.change;
      var line = '';
      if (change === 'R7' || !change || change === 'R6') {
        line = CAREER_WORKS[id].fallback;
      } else if (CAREER_TEMPLATES[id] && CAREER_TEMPLATES[id][change]) {
        line = CAREER_TEMPLATES[id][change];
      } else {
        line = CAREER_WORKS[id].fallback;
      }
      var roleLine = CAREER_ROLES[c.role] || '';
      sentences.push(line);
      details.push({work:id, change:change || 'R7', sentence:line, role:roleLine});
    }
    return { sentences: sentences, details: details, status: 'ready' };
  }

  /* =========================================================
     2. 입력 정규화 · 유형 판정
     ========================================================= */
  function emptyAnswers() {
    return { role: null, years: null, comps: [], tools: [], illusion: null, purpose: null,
             domainKey: '', domainFree: '', domain: '', career: { works: [], change: '', recall: {}, role: 'C6' } };
  }

  function normalizeAnswers(raw) {
    var a = emptyAnswers();
    if (!raw || typeof raw !== 'object') { return a; }
    if (ROLES[raw.role]) { a.role = raw.role; }
    if (YEARS[raw.years]) { a.years = raw.years; }
    var i;
    if (raw.comps && raw.comps.length) {
      for (i = 0; i < raw.comps.length && a.comps.length < 2; i++) {
        if (COMPS[raw.comps[i]] && !has(a.comps, raw.comps[i])) { a.comps.push(raw.comps[i]); }
      }
    }
    if (raw.tools && raw.tools.length) {
      for (i = 0; i < raw.tools.length; i++) {
        if (TOOLS[raw.tools[i]] && !has(a.tools, raw.tools[i])) { a.tools.push(raw.tools[i]); }
      }
    }
    if (ILLUSIONS[raw.illusion]) { a.illusion = raw.illusion; }
    if (PURPOSES[raw.purpose]) { a.purpose = raw.purpose; }
    if (typeof raw.domainKey === 'string' && DOMAINS[raw.domainKey]) {
      a.domainKey = raw.domainKey;
    }
    var free = '';
    if (typeof raw.domainFree === 'string') { free = raw.domainFree; }
    else if (typeof raw.domain === 'string') { free = raw.domain; }
    a.domainFree = cleanDomainText(free);
    a.domain = a.domainKey ? DOMAINS[a.domainKey].name : a.domainFree;
    var cr = raw.career && typeof raw.career === 'object' ? raw.career : {};
    if (cr.works && cr.works.length) {
      for (i = 0; i < cr.works.length && a.career.works.length < 2; i++) {
        if (CAREER_WORKS[cr.works[i]] && !has(a.career.works, cr.works[i])) { a.career.works.push(cr.works[i]); }
      }
    }
    if (CAREER_CHANGES[cr.change]) { a.career.change = cr.change; }
    if (CAREER_ROLE_LABELS[cr.role]) { a.career.role = cr.role; }
    if (cr.recall && typeof cr.recall === 'object') {
      Object.keys(cr.recall).forEach(function (wk) {
        if (CAREER_WORKS[wk] && CAREER_CHANGES[cr.recall[wk]]) { a.career.recall[wk] = cr.recall[wk]; }
      });
    }
    return a;
  }

  function roleOf(a) { return ROLES[a.role] || ROLES.other; }
  function yearsOf(a) { return YEARS[a.years] || YEARS.y3; }
  function purposeOf(a) { return PURPOSES[a.purpose] || PURPOSES.move; }
  function compKey(a, i) {
    if (a.comps && a.comps[i] && COMPS[a.comps[i]]) { return a.comps[i]; }
    return i === 0 ? 'structure' : null;
  }
  function compOf(a, i) {
    var k = compKey(a, i);
    return k ? COMPS[k] : null;
  }

  /* 유형 점수: 선택 조합으로만 결정된다 */
  function scoreTypes(a) {
    var s = { architect: 0, builder: 0, domain: 0, solver: 0 };
    var c;

    if (has(a.comps, 'structure')) { s.architect += 3; }
    if (has(a.comps, 'lead')) { s.architect += 1; s.solver += 3; }
    if (has(a.comps, 'analysis')) { s.builder += 3; }
    if (has(a.comps, 'ai')) { s.builder += 2; }
    if (has(a.comps, 'biz')) { s.solver += 2; }
    if (has(a.comps, 'research')) { s.domain += 2; }

    if (a.role === 'ux' || a.role === 'strategy' || a.role === 'ops') { s.architect += 2; }
    if (a.role === 'data' || a.role === 'dev') { s.builder += 2; }
    if (a.role === 'ops' || a.role === 'other') { s.solver += 1; }
    if (a.role === 'other') { s.domain += 1; }

    if (has(a.tools, 'figma')) { s.architect += 1; }
    if (has(a.tools, 'python')) { s.builder += 1; }
    if (has(a.tools, 'ga')) { s.builder += 1; }
    if (a.domain) { s.domain += 3; }

    for (c = 0; c < TYPE_ORDER.length; c++) {
      if (s[TYPE_ORDER[c]] > 50) { s[TYPE_ORDER[c]] = 50; }
    }
    return s;
  }

  function classify(a) {
    var s = scoreTypes(a);
    var best = TYPE_ORDER[0];
    for (var i = 1; i < TYPE_ORDER.length; i++) {
      if (s[TYPE_ORDER[i]] > s[best]) { best = TYPE_ORDER[i]; }
    }
    return best;
  }

  function computeResult(raw) {
    var a = normalizeAnswers(raw);
    return {
      answers: a,
      role: a.role || 'other',
      years: a.years || 'y3',
      comps: a.comps.length ? a.comps.slice() : ['structure'],
      tools: a.tools.slice(),
      illusion: a.illusion || 'pretty',
      purpose: a.purpose || 'move',
      domain: a.domain,
      domainKey: a.domainKey,
      domainFree: a.domainFree,
      domainEn: domainEnOf(a),
      type: classify(a),
      shared: false
    };
  }

  /* =========================================================
     3. 무료 영역 문구
     ========================================================= */
  function freeHeadline(r) {
    var role = roleOf(r), y = yearsOf(r), c = compOf(r, 0);
    return role.noun + ' · ' + y.short + ' | ' + c.line;
  }

  function illusionOf(r) {
    var t = r.type, il = r.illusion;
    var table = ILLUSION_READ[t] || ILLUSION_READ.architect;
    return table[il] || table.pretty;
  }

  /* =========================================================
     4. 유료 1 · 헤드라인 3종
     ========================================================= */
  function toolList(r, joiner) {
    var names = [], i;
    for (i = 0; i < r.tools.length; i++) {
      if (r.tools[i] === 'etc') { continue; }
      if (TOOLS[r.tools[i]] && TOOLS[r.tools[i]].name) { names.push(TOOLS[r.tools[i]].name); }
    }
    names = uniq(names);
    if (!names.length) { return ''; }
    return names.join(joiner || ', ');
  }

  function toolListEn(r) {
    var names = [], i;
    for (i = 0; i < r.tools.length; i++) {
      if (TOOLS[r.tools[i]] && TOOLS[r.tools[i]].en) { names.push(TOOLS[r.tools[i]].en); }
    }
    return uniq(names);
  }

  function headlineKo(r) {
    var role = roleOf(r), y = yearsOf(r), c = compOf(r, 0);
    var line = c.adj + ' ' + role.noun + ' · ' + y.short;
    if (r.domain) { line += ' · ' + r.domain; }
    return line;
  }

  function headlineEn(r) {
    var role = roleOf(r), y = yearsOf(r), c = compOf(r, 0);
    var parts = toolListEn(r);
    var line = c.en + ' ' + role.enHead + ' | ' + y.en;
    if (parts.length) { line += ' · ' + parts.join(' · '); }
    var de = r.domainEn || '';
    if (de) { line += ' · ' + de; }
    return line;
  }

  function enHeadNote(r) {
    if (r.domainKey && DOMAINS[r.domainKey]) {
      return '도메인은 칩에서 고른 영문 표기(' + DOMAINS[r.domainKey].en + ')로 그대로 넣었습니다. 회사에서 쓰는 표기가 다르면 그 표기로 바꾸세요.';
    }
    if (r.domainEn) {
      return '직접 입력한 영문 표기를 그대로 넣었습니다. 대소문자와 띄어쓰기만 확인하세요.';
    }
    if (r.domain) {
      return '직접 입력한 한글은 영문 헤드라인에 넣지 않았습니다. 영문 표기가 필요하면 M.A. in Psychology처럼 영문으로 직접 붙이세요.';
    }
    return '한글 단어가 하나라도 섞이면 검색 노출이 갈립니다. 도메인을 넣지 않아 이 줄은 직무와 툴로만 끝냈습니다.';
  }

  function headlinePitch(r) {
    var role = roleOf(r), c = compOf(r, 0);
    var tools = toolList(r, ' · ');
    var line = c.pitch;
    if (!line) { line = '요구사항을 화면과 문서로 정리해, 개발 전에 확인할 수 있게 만듭니다.'; }
    line += ' 작업 범위와 기일은 첫 통화에서 정합니다.';
    if (tools) { line += ' ' + tools + ' 기반으로 진행합니다.'; }
    return line;
  }

  function sectionHeadHTML(r) {
    var p = purposeOf(r);
    var h = '';
    h += '<div class="hl-card">' +
      '<div class="card-head"><span class="hl-tag">국문 이력서 상단</span><span class="hint">한 줄</span></div>' +
      '<p class="hl-text">' + esc(headlineKo(r)) + '</p>' +
      '<p class="hl-note">' + esc(p.hlNote) + '</p>' +
      '</div>';
    h += '<div class="hl-card">' +
      '<div class="card-head"><span class="hl-tag">링크드인 영문 통일</span><span class="hint">한 줄</span></div>' +
      '<p class="hl-text">' + esc(headlineEn(r)) + '</p>' +
      '<p class="hl-note">' + esc(enHeadNote(r)) + '</p>' +
      '</div>';
    h += '<div class="hl-card">' +
      '<div class="card-head"><span class="hl-tag">외주 · 제안서 첫 줄</span><span class="hint">두 문장</span></div>' +
      '<p class="hl-text plain">' + esc(headlinePitch(r)) + '</p>' +
      '<p class="hl-note">상대가 고객일 때는 내 직함보다 내가 없애는 문제를 먼저 씁니다.</p>' +
      '</div>';
    return h;
  }

  /* =========================================================
     5. 유료 2 · 소개글
     ========================================================= */
  function aboutParagraphs(r) {
    var role = roleOf(r), y = yearsOf(r), t = TYPES[r.type];
    var c1 = compOf(r, 0), c2 = compOf(r, 1);
    var out = [];

    out.push(t.hook);

    var p2 = role.focus + josa(role.focus, '을/를') + ' ' + y.about + ' 해왔습니다. ';
    if (c2) { p2 += '강점은 ' + c1.name + ', ' + c2.name + '입니다.'; }
    else { p2 += '강점은 ' + c1.name + ' 하나입니다.'; }
    out.push(p2);

    var tools = toolList(r, ', ');
    var p3;
    if (tools) {
      p3 = '도구는 ' + tools + '입니다. ';
      if (has(r.tools, 'ai')) { p3 += 'AI 툴은 초안과 반복 작업을 줄이는 데 씁니다. '; }
      p3 += '툴을 많이 아는 것보다, 이 툴로 무엇을 끝냈는지를 먼저 봅니다.';
    } else {
      p3 = '도구는 일의 성격에 맞춰 고릅니다. 툴 이름보다 무엇을 끝냈는지를 먼저 봅니다.';
    }
    out.push(p3);

    if (r.domain) {
      out.push('전문 영역 및 배경: ' + r.domain + '. 이를 바탕으로 기획 단계의 전제를 짚습니다.');
    }
    out.push(purposeOf(r).line);
    return out;
  }

  function sectionAboutHTML(r) {
    var ps = aboutParagraphs(r);
    var h = '<div class="about-box">';
    h += '<div class="about-first"><span class="tag">1초 컷 · 첫 두 문장</span>' + esc(ps[0]) + '</div>';
    h += '<div class="about-body">';
    for (var i = 1; i < ps.length; i++) { h += '<p>' + esc(ps[i]) + '</p>'; }
    h += '</div></div>';
    h += '<p class="fine about-close">회사명은 한 번도 쓰지 않았습니다. 읽는 사람이 세 줄 안에 이 사람을 기억할 수 있게, 첫 두 문장만 남겨도 됩니다.</p>';
    return h;
  }

  /* =========================================================
     6. 유료 3 · 경력 리라이팅
     ========================================================= */
  function sectionExpHTML(r) {
    var role = roleOf(r);
    var pairs = role.pairs;
    var h = '';
    h += '<div class="formula">' +
      '<p><b>공식</b> — [무엇이 막혀 있었는지] → [내가 바꾼 것] → [그래서 무엇이 달라졌는지]</p>' +
      '<p>숫자가 있으면 숫자로, 없으면 없앴다 · 줄였다 · 닫았다 같은 동사로 끝냅니다. 숫자가 없어도 문장은 성립합니다.</p>' +
      '</div>';
    for (var i = 0; i < pairs.length; i++) {
      h += '<div class="pair">' +
        '<div class="pair-top"><span class="pair-idx">변환 ' + (i + 1) + '</span><span class="pair-tag">' + esc(pairTag(i)) + '</span></div>' +
        '<p class="pair-row before"><span class="k">Before</span>' + esc(pairs[i].b) + '</p>' +
        '<p class="pair-row after"><span class="k">After</span>' + esc(pairs[i].a) + '</p>' +
        '</div>';
    }
    h += personalDraftsHTML(r);
    h += careerDraftsHTML(r);
    h += '<div class="formula">' +
      '<p><b>주의</b> — 위 After의 숫자는 구조를 보여주기 위한 예시입니다. 본인 기록으로 바꿔 넣으세요. 없는 숫자를 쓰면 면접에서 한 번에 드러납니다.</p>' +
      (r.illusion === 'jobhop' ? '<p>짧은 근무에는 기간 옆에 <b>왜 끝났는지</b>를 꼭 붙이세요. 계약 만료, 조직 개편, 프로젝트 종료 — 이유가 있으면 방황이 아니라 이력이 됩니다.</p>' : '') +
      '</div>';
    return h;
  }

  /* 내 설정(직무 + 역량 2개 + 툴 + 목적) 기반 경력 한 줄 초안 2개 */
  function personalDrafts(r) {
    var role = roleOf(r), y = yearsOf(r), p = purposeOf(r);
    var c1 = compOf(r, 0);
    var c2 = compOf(r, 1);
    var c2p = c2 || c1;
    var tools = toolList(r, ' · ');
    var toolPhrase = tools ? tools + ' 기반으로 ' : '';
    var basis = c2 ? (c1.name + josa(c1.name, '과/와') + ' ' + c2.name) : c1.name;
    var basisTail = c2 ? c2.name : c1.name;

    var d1 = c1.adj + ' ' + role.noun + ' · ' + y.short + ' — ' +
      basis + josa(basisTail, '을/를') + ' 갖추고, ' +
      toolPhrase + c1.proof + josa(c1.proof, '을/를') + ' 남겼습니다. ' + p.tail;

    var d2 = p.short + josa(p.short, '을/를') + ' 목표로 ' + basis + josa(basisTail, '을/를') +
      ' 바탕으로 ' + role.focus + josa(role.focus, '을/를') + ' ' + y.about + ' 해온 ' +
      role.noun + josa(role.noun, '으로/로') + ', ' + toolPhrase + c2p.proof +
      josa(c2p.proof, '을/를') + ' 남겼습니다.';

    return [d1, d2];
  }

  function personalDraftsHTML(r) {
    var ds = personalDrafts(r);
    var tags = ['성과 축', '목적 축'];
    var h = '<div class="draft-box">' +
      '<div class="draft-head"><p class="label">내 설정 기반 바로 쓰는 초안</p><span class="draft-idx">2개</span></div>' +
      '<p class="draft-note">고르신 직무·역량 2개·툴·목적을 그대로 조합했습니다. 수치와 기간만 본인 기록으로 바꿔 쓰세요.</p>';
    for (var i = 0; i < ds.length; i++) {
      h += '<div class="draft-item">' +
        '<span class="draft-idx">초안 ' + (i + 1) + ' · ' + tags[i] + '</span>' +
        '<p class="draft-text">' + esc(ds[i]) + '</p>' +
        '</div>';
    }
    h += '</div>';
    return h;
  }

  function careerDraftsHTML(r) {
    var result = careerSentenceData(r.answers || {});
    if (!result.sentences.length) { return ''; }
    var h = '<div class="draft-box career-draft"><div class="draft-head"><p class="label">내 경험으로 만든 경력기술 문장</p><span class="draft-idx">선택 기반</span></div>';
    h += '<p class="draft-note">선택한 업무와 확인한 변화만 반영했습니다. 실제 경험과 다른 표현이 있다면 제출 전에 수정해 주세요.</p>';
    for (var i = 0; i < result.sentences.length; i++) {
      h += '<div class="draft-item"><span class="draft-idx">' + esc(CAREER_WORKS[result.details[i].work].label) + '</span><p class="draft-text">' + esc(result.sentences[i]) + '</p>' + (result.details[i].role ? '<p class="career-role-note">담당 역할 · ' + esc(result.details[i].role) + '</p>' : '') + '</div>';
    }
    h += '</div>';
    return h;
  }

  function pairTag(i) {
    if (i === 0) { return '담당 → 변화'; }
    if (i === 1) { return '기간 → 서사'; }
    return '툴 나열 → 산출물';
  }

  /* =========================================================
     7. 유료 4 · 체크리스트
     ========================================================= */
  /* 선택한 직무·툴에 맞춰 '안 해본 툴 빼기' 예시를 바꾼다 */
  function toolCutAdvice(r) {
    var rk = ROLES[r.role] ? r.role : 'other';
    var cut = TOOL_CUT[rk] || TOOL_CUT.other;
    var used = toolList(r, ' · ');
    var padKey = '';
    for (var i = 0; i < cut.pads.length; i++) {
      if (!has(r.tools, cut.pads[i])) { padKey = cut.pads[i]; break; }
    }
    var s = '실무에서 메인으로 써본 적 없는 툴은 경험이 아니라 학습 중으로 따로 적습니다. ';
    if (used) { s += '고르신 도구는 ' + used + '입니다. '; }
    if (padKey && TOOLS[padKey]) {
      s += cut.basis + ' ' + TOOLS[padKey].name + '까지 목록에 올리지 마세요.';
    } else {
      s += cut.basis + ' 다뤄본 적 없는 툴까지 목록에 올리지 마세요.';
    }
    s += ' 목록에 올리는 순간 그 도구가 첫 질문이 됩니다.';
    return s;
  }

  function sectionCheckHTML(r) {
    var il = illusionOf(r);
    var h = '';
    h += '<div class="check-group">' +
      '<p class="label">먼저 빼야 하는 것</p>' +
      '<ul>' +
      '<li class="check-li"><span class="box"></span><span><b>안 해본 툴</b> — ' + esc(toolCutAdvice(r)) + '</span></li>' +
      '<li class="check-li"><span class="box"></span><span><b>추상어</b> — 열정, 다양한, 소통 원활, 책임감, 성실. 이 다섯 단어는 지워도 내용이 달라지지 않습니다. 달라지지 않으면 그 단어는 정보가 아닙니다.</span></li>' +
      '<li class="check-li"><span class="box"></span><span><b>회사 자랑</b> — 회사 규모, 매출, 투자 유치는 내 성과가 아닙니다. 같은 문장에서 그래서 내가 무엇을 했는지가 없으면 지웁니다.</span></li>' +
      '</ul></div>';

    h += '<div class="check-group">' +
      '<p class="label">잦은 이직 서사 연결법</p>' +
      '<ul>' +
      '<li class="check-li"><span class="box"></span><span><b>기간의 단위를 바꿉니다.</b> 8개월을 계약 프로젝트로 적으면 짧음이 사라지고 역할이 남습니다.</span></li>' +
      '<li class="check-li"><span class="box"></span><span><b>왜 끝났는지를 한 구절 붙입니다.</b> 계약 만료, 조직 개편, 프로젝트 종료. 이유가 있으면 방황이 아니라 이력이 됩니다.</span></li>' +
      '<li class="check-li"><span class="box"></span><span><b>맨 위에 한 줄 서사를 둡니다.</b> "여러 조직에서 같은 일을 해왔고, 지금은 ' + esc(roleOf(r).short) + josa(roleOf(r).short, '으로/로') + ' 정착합니다." 방문자가 먼저 결론을 읽게 만듭니다.</span></li>' +
      '</ul></div>';

    h += '<div class="check-group">' +
      '<p class="label">내가 고른 오해 하나만 피하기</p>' +
      '<ul><li class="check-li"><span class="box"></span><span><b>' + esc(il.title) + '</b> ' + esc(il.fix) + '</span></li></ul>' +
      '</div>';

    h += '<div class="check-group">' +
      '<p class="label">마지막 점검 3가지</p>' +
      '<ul>' +
      '<li class="check-li"><span class="box"></span><span>첫 세 줄만 읽고 무슨 일을 하는 사람인지 답할 수 있는지 봅니다.</span></li>' +
      '<li class="check-li"><span class="box"></span><span>회사명을 지워도 문장이 성립하는지 봅니다.</span></li>' +
      '<li class="check-li"><span class="box"></span><span>링크드인 헤드라인과 이력서 첫 줄이 같은 문장인지 확인합니다.</span></li>' +
      '</ul></div>';
    return h;
  }

  /* =========================================================
     8. 유료 5 · 키워드 8
     ========================================================= */
  var KEY_POOL = ['프로토타이핑', '데이터 기반 의사결정', '협업 툴', '문서화', '프로세스 개선', '서비스 운영'];

  function keyList(r) {
    var role = roleOf(r), c1 = compOf(r, 0), c2 = compOf(r, 1);
    var list = [];
    list.push(role.keys[0]);
    list.push(c1.keyword);
    if (c2) { list.push(c2.keyword); }
    var i;
    for (i = 0; i < r.tools.length; i++) {
      if (TOOLS[r.tools[i]] && TOOLS[r.tools[i]].keyword) { list.push(TOOLS[r.tools[i]].keyword); }
    }
    if (r.domain) {
      var toks = r.domain.split(/[,·\/]/);
      for (i = 0; i < toks.length && i < 2; i++) { list.push(String(toks[i]).replace(/^\s+|\s+$/g, '')); }
    }
    list.push(purposeOf(r).key);
    list.push(role.keys[1]);
    list.push(role.keys[2]);
    list.push(role.keys[3]);

    list = uniq(list);
    var pool = uniq(KEY_POOL.concat(role.keys));
    var pi = 0;
    while (list.length < 8 && pi < pool.length) {
      if (!has(list, pool[pi])) { list.push(pool[pi]); }
      pi++;
    }
    return list.slice(0, 8);
  }

  function sectionKeysHTML(r) {
    var ks = keyList(r);
    var h = '<div class="keys">';
    for (var i = 0; i < ks.length; i++) { h += '<span class="key">' + esc(ks[i]) + '</span>'; }
    h += '</div>';
    h += '<p class="keys-note">링크드인 기술·스킬란과 이력서 하단에 같은 단어로 넣으세요. 검색은 동의어를 잘 못 잡기 때문에, 회사에서 쓰던 내부 용어는 빼고 업계 표기를 씁니다.</p>';
    return h;
  }

  /* =========================================================
     9. 리포트 조립
     ========================================================= */
  function paidHTML(r) {
    var h = '<div id="paid-start"></div>';

    h += '<section class="sec"><div class="sec-head"><span class="sec-num">01</span><h3>목적별 헤드라인 3종 세트</h3></div>';
    h += '<p class="sec-lead">같은 사람이라도 이력서 상단, 링크드인, 제안서에서 다르게 읽힙니다. 세 자리에 맞춰 세 문장을 만들었습니다.</p>';
    h += sectionHeadHTML(r);
    h += '<button type="button" class="btn btn-ghost btn-copy" data-copy="head">01 헤드라인 3종 복사하기</button>';
    h += '</section>';

    h += '<section class="sec"><div class="sec-head"><span class="sec-num">02</span><h3>1초 컷 소개글 완성본</h3></div>';
    h += '<p class="sec-lead">고른 직무·연차·역량·툴·도메인을 그대로 조합했습니다. 첫 두 문장만 남겨도 읽히도록 만들었습니다.</p>';
    h += sectionAboutHTML(r);
    h += '<button type="button" class="btn btn-ghost btn-copy" data-copy="about">02 소개글 복사하기</button>';
    h += '</section>';

    h += '<section class="sec"><div class="sec-head"><span class="sec-num">03</span><h3>물경력 탈출 경력 리라이팅</h3></div>';
    h += '<p class="sec-lead">경력을 지우지 않고 문장만 바꿉니다. 같은 일을 했어도 무엇이 달라졌는지가 앞에 오면 읽는 방식이 바뀝니다. 아래 초안 2개는 지금 고르신 조합으로 바로 만든 문장입니다.</p>';
    h += sectionExpHTML(r);
    h += '<button type="button" class="btn btn-ghost btn-copy" data-copy="exp">03 경력 문장 복사하기</button>';
    h += '</section>';

    h += '<section class="sec"><div class="sec-head"><span class="sec-num">04</span><h3>감점 피하는 제외·주의 체크리스트</h3></div>';
    h += '<p class="sec-lead">더하는 것보다 빼는 것이 점수를 지킵니다. 지금 프로필에서 내려야 하는 것부터 정리했습니다.</p>';
    h += sectionCheckHTML(r);
    h += '<button type="button" class="btn btn-ghost btn-copy" data-copy="check">04 체크리스트 복사하기</button>';
    h += '</section>';

    h += '<section class="sec"><div class="sec-head"><span class="sec-num">05</span><h3>검색용 핵심 키워드 8선</h3></div>';
    h += '<p class="sec-lead">헤드라인에 다 넣을 수 없으니, 나머지는 기술란에 둡니다. 아래 8개를 같은 표기로 쓰세요.</p>';
    h += sectionKeysHTML(r);
    h += '<button type="button" class="btn btn-ghost btn-copy" data-copy="keys">05 키워드 복사하기</button>';
    h += '</section>';

    h += '<section class="sec"><div class="sec-head"><span class="sec-num">06</span><h3>전체 텍스트 한 번에 복사</h3></div>';
    h += '<p class="sec-lead">위 다섯 섹션을 순서대로 붙여 넣을 수 있는 형태로 만듭니다. 메모장에 붙여 두고 하나씩 옮겨 쓰세요.</p>';
    h += '<div class="copy-box"><p>복사한 텍스트에는 입력한 도메인 키워드가 포함됩니다. 공유 링크에는 포함되지 않습니다.</p>';
    h += '<button type="button" class="btn btn-primary" data-copy="all">전체 텍스트 한 번에 복사하기</button></div>';
    h += '</section>';

    return h;
  }

  function buildFreeHTML(r, opts) {
    var t = TYPES[r.type];
    var h = '';
    if (opts && opts.shared) {
      h += '<div class="shared-chip">공유받은 결과 · <b>' + esc(t.name) + '</b></div>';
    }
    h += '<div class="report-head">' +
      '<div class="report-meta"><span class="badge-free">무료 리포트</span><span class="counter">' + esc(SERVICE) + '</span></div>' +
      '<h1 class="type-name">' + esc(t.name) + '</h1>' +
      '<p class="type-tagline">' + esc(t.tagline) + '</p>' +
      '</div>';

    h += '<div class="card read-card"><p class="label">이 유형이 프로필에서 안 보이는 이유</p>' +
      '<p class="body">' + esc(t.why) + '</p></div>';

    if (!(opts && opts.shared)) {
      var il = illusionOf(r);
      h += '<div class="card warn-card">' +
        '<p class="label">지금 프로필이 손해 보고 있는 착시 1가지</p>' +
        '<p class="warn-title">' + esc(il.title) + '</p>' +
        '<p class="body">' + esc(il.body) + '</p>' +
        '<p class="fix"><b>바꾸는 방법</b> — ' + esc(il.fix) + '</p>' +
        '</div>';

      h += '<div class="card sample-card">' +
        '<div class="card-head"><p class="label">무료 샘플</p><span class="hint">헤드라인 1안</span></div>' +
        '<p class="sample-lead">지금 그대로 복사해 쓸 수 있는 한 줄입니다.</p>' +
        '<p class="sample-line">' + esc(freeHeadline(r)) + '</p>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-copy="free">이 헤드라인 복사하기</button>' +
        '</div>';

      h += nextCardHTML();

      h += '<div class="report-foot">' +
        '<div class="foot-actions">' +
        '<button type="button" class="btn btn-ghost" data-action="share">링크 공유</button>' +
        '<button type="button" class="btn btn-ghost" data-action="restart">다시 진단하기</button>' +
        '</div>' +
        '<p class="fine">입력한 내용은 브라우저 밖으로 나가지 않습니다. 공유 링크에는 포지셔닝 유형 코드만 담깁니다.</p>' +
        '</div>';
    } else {
      h += '<div class="shared-card card">' +
        '<div class="toc-head"><h3>공유받은 결과입니다</h3>' +
        '<p>이 화면에는 유형만 담겨 있습니다. 직무·연차·역량 같은 입력 내용은 링크에 들어가지 않습니다.</p></div>' +
        '<button type="button" class="btn btn-primary" data-action="restart">나도 2분 진단하기</button>' +
        '</div>';
    }
    return h;
  }

      function nextCardHTML() {
      return '<div class="card next-card">' +
        '<p class="label">이어서 볼 것</p>' +
        '<p class="next-title">헤드라인 3종과 경력 문장까지</p>' +
        '<p class="fine">같은 입력으로 목적별 헤드라인 3종, 1초 컷 소개글, 경력 리라이팅 초안 2개, 체크리스트, 키워드 8선을 만들어 두었습니다.</p>' +
        '<button type="button" class="btn btn-primary btn-lg" data-action="detail">상세 개조 리포트 보기' +
        '<span class="next-sub">헤드라인 3종 · 경력 문장 · 키워드</span></button>' +
        '</div>';
    }

    function buildDetailHTML(r) {
      var t = TYPES[r.type];
      var h = '';
      h += '<div class="report-head">' +
        '<div class="report-meta"><span class="badge-free">상세 리포트</span><span class="counter">' + esc(SERVICE) + '</span></div>' +
        '<h1 class="type-name">' + esc(t.name) + '</h1>' +
        '<p class="type-tagline">' + esc(t.tagline) + '</p>' +
        '</div>';
      h += paidHTML(r);
      h += '<div class="report-foot">' +
        '<div class="foot-actions">' +
        '<button type="button" class="btn btn-ghost" data-action="share">링크 공유</button>' +
        '<button type="button" class="btn btn-ghost" data-action="restart">새로 진단하기</button>' +
        '</div>' +
        '<p class="fine">입력한 내용은 이 브라우저에만 저장되고, 2시간이 지나면 사라집니다. 공유 링크에는 포지셔닝 유형 코드만 담깁니다.</p>' +
        '<p class="fine">문구는 자체 제작한 템플릿으로 만들어지며, 채용이나 계약 결과를 보장하지 않습니다.</p>' +
        '</div>';
      return h;
    }

  /* =========================================================
     10. 텍스트 복사본
     ========================================================= */
  function headText(r) {
    var L = [];
    L.push('[01 목적별 헤드라인 3종]');
    L.push('· 국문 이력서 상단: ' + headlineKo(r));
    L.push('· 링크드인 영문: ' + headlineEn(r));
    L.push('· 외주 · 제안: ' + headlinePitch(r));
    return L.join('\n');
  }

  function aboutText(r) {
    return '[02 1초 컷 소개글]\n' + aboutParagraphs(r).join('\n\n');
  }

  function expText(r) {
    var pairs = roleOf(r).pairs;
    var L = ['[03 물경력 탈출 경력 리라이팅]'];
    L.push('공식: [무엇이 막혀 있었는지] → [내가 바꾼 것] → [그래서 무엇이 달라졌는지]');
    for (var i = 0; i < pairs.length; i++) {
      L.push('');
      L.push('변환 ' + (i + 1) + ' (' + pairTag(i) + ')');
      L.push('Before: ' + pairs[i].b);
      L.push('After: ' + pairs[i].a);
    }
    L.push('');
    var drafts = personalDrafts(r);
    L.push('내 설정 기반 초안 (직무·역량·툴·목적 조합)');
    L.push('초안 1 (성과 축): ' + drafts[0]);
    L.push('초안 2 (목적 축): ' + drafts[1]);
    var career = careerSentenceData(r.answers || {});
    if (career.sentences.length) {
      L.push('');
      L.push('내 경험 기반 경력기술 문장');
      for (var ci = 0; ci < career.sentences.length; ci++) { L.push('· ' + career.sentences[ci]); if (career.details[ci].role) { L.push('  담당 역할: ' + career.details[ci].role); } }
    }
    L.push('');
    L.push('위 After의 숫자는 예시입니다. 본인 기록으로 바꿔 넣으세요.');
    return L.join('\n');
  }

  function checkText(r) {
    var il = illusionOf(r);
    var L = ['[04 감점 피하는 제외·주의 체크리스트]'];
    L.push('· 안 해본 툴 — ' + toolCutAdvice(r));
    L.push('· 추상어 빼기 — 열정, 다양한, 소통 원활, 책임감, 성실');
    L.push('· 회사 자랑 빼기 — 회사 규모·매출·투자 유치');
    L.push('· 기간 단위 바꾸기 — 8개월을 계약 프로젝트로');
    L.push('· 왜 끝났는지 한 구절 붙이기 — 계약 만료, 조직 개편, 프로젝트 종료');
    L.push('· 맨 위에 한 줄 서사 두기 — 여러 조직에서 같은 일, 지금은 ' + roleOf(r).short + josa(roleOf(r).short, '으로/로') + ' 정착');
    L.push('· 내가 고른 오해: ' + il.title);
    L.push('· 첫 세 줄만 읽고 직무가 답해지는지, 회사명을 지워도 문장이 되는지 확인');
    return L.join('\n');
  }

  function keysText(r) {
    return '[05 검색용 핵심 키워드 8선]\n' + keyList(r).join(' · ');
  }

  function freeText(r) {
    return '[무료 샘플 헤드라인]\n' + freeHeadline(r);
  }

  function buildPlainText(r) {
    var L = [];
    L.push(SERVICE + ' — ' + TYPES[r.type].name);
    L.push('직무: ' + roleOf(r).name + ' · 경력 ' + yearsOf(r).name + ' · 목적: ' + purposeOf(r).name);
    L.push('');
    L.push(headText(r));
    L.push('');
    L.push(aboutText(r));
    L.push('');
    L.push(expText(r));
    L.push('');
    L.push(checkText(r));
    L.push('');
    L.push(keysText(r));
    L.push('');
    L.push('문구는 자체 제작한 템플릿으로 만들어졌습니다. 채용이나 계약 결과를 보장하지 않습니다.');
    return L.join('\n');
  }

  function sectionText(r, key) {
    if (key === 'free') { return freeText(r); }
    if (key === 'head') { return headText(r); }
    if (key === 'about') { return aboutText(r); }
    if (key === 'exp') { return expText(r); }
    if (key === 'check') { return checkText(r); }
    if (key === 'keys') { return keysText(r); }
    if (key === 'all') { return buildPlainText(r); }
    return '';
  }

  /* =========================================================
     11. 공유 링크 — 유형 코드만
     ========================================================= */
  function shareCode(r) {
    if (!r) { return ''; }
    var i = TYPE_ORDER.indexOf(r.type);
    return i < 0 ? '' : String(i);
  }

  function buildShareUrl(r, base) {
    var href = base;
    if (!href && typeof location !== 'undefined') { href = location.href; }
    if (!href) { return ''; }
    var code = shareCode(r);
    if (!code) { return ''; }
    var cut = String(href).split('#')[0].split('?')[0];
    return cut + '?r=' + code;
  }

  function parseShareParams(search) {
    var raw = String(search || '');
    if (raw.charAt(0) === '?') { raw = raw.slice(1); }
    if (!raw) { return null; }
    var pairs = raw.split('&');
    for (var i = 0; i < pairs.length; i++) {
      var kv = pairs[i].split('=');
      if (kv[0] === 'r') {
        var v = kv[1] || '';
        if (!/^[0-3]$/.test(v)) { return null; }
        return { type: TYPE_ORDER[parseInt(v, 10)] };
      }
    }
    return null;
  }

  function sharedResult(parsed) {
    var a = emptyAnswers();
    return {
      answers: a, role: 'other', years: 'y3', comps: ['structure'], tools: [],
      illusion: 'pretty', purpose: 'move', domain: '',
      domainKey: '', domainFree: '', domainEn: '',
      type: parsed.type, shared: true
    };
  }

  /* =========================================================
     12. 모달
     ========================================================= */
  /* =========================================================
     13. 단계 정의
     ========================================================= */
  var STEPS = [
    { id: 'basic', kicker: '지금 하는 일', mode: 'basic' },
    { id: 'comp', kicker: '강점', mode: 'multi', max: 2 },
    { id: 'tools', kicker: '무기', mode: 'multi', max: 0 },
    { id: 'illusion', kicker: '피하고 싶은 오해', mode: 'single' },
    { id: 'purpose', kicker: '이번 개조의 목적', mode: 'single' },
    { id: 'domain', kicker: '도메인 한 줄', mode: 'text' },
    { id: 'career', kicker: '경력 문장', mode: 'career' }
  ];

  var STEP_TITLES = {
    basic: '지금 하는 일과 총 경력을 골라주세요',
    comp: '실제로 성과를 낸 역량을 골라주세요',
    tools: '실무에서 다뤄본 툴과 무기를 골라주세요',
    illusion: '가장 피하고 싶은 오해는 무엇인가요',
    purpose: '이번 개조의 주 목적을 골라주세요',
    domain: '전공이나 도메인 키워드가 있나요',
    career: '실제로 맡았던 업무를 경력 문장으로 바꿔볼게요'
  };

  var STEP_HINTS = {
    basic: '지원하려는 직무가 아니라, 지금 실제로 하는 일을 고르면 됩니다.',
    comp: '최대 2개까지. 잘한다고 생각하는 것보다, 실제로 결과가 나온 것을 고르세요.',
    tools: '실무에서 직접 써본 것만 고르세요. 배우는 중인 툴은 넣지 않습니다.',
    illusion: '이 하나를 고르면, 그 오해가 생기는 이유를 짚어 드립니다.',
    purpose: '같은 경력도 목적에 따라 앞에 세우는 문장이 달라집니다.',
    domain: '칩을 고르면 영문 헤드라인까지 채워집니다. 비워두셔도 됩니다.',
    career: '최대 2개 업무를 고르고, 실제로 달라진 점을 선택해 주세요. 잘 모르거나 특별한 변화가 없어도 괜찮습니다.'
  };

  /* =========================================================
     10-B. 공통 UI · 두 페이지가 같이 쓴다
     ========================================================= */
  var toastEl = null, toastTimer = null;

  function toast(msg) {
    if (!toastEl) { toastEl = document.getElementById('toast'); }
    if (!toastEl) { return; }
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    if (toastTimer) { clearTimeout(toastTimer); }
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2600);
  }

  function copyClipboard(value, okMsg, failMsg) {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(function () {
        toast(okMsg);
      }).catch(function () {
        copyFallback(value, okMsg, failMsg);
      });
      return;
    }
    copyFallback(value, okMsg, failMsg);
  }

  function copyFallback(value, okMsg, failMsg) {
    var done = false;
    if (typeof document !== 'undefined' && document.body && document.body.appendChild) {
      try {
        var ta = document.createElement('textarea');
        ta.value = value;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        document.body.appendChild(ta);
        if (ta.select) { ta.select(); }
        if (document.execCommand && document.execCommand('copy')) { done = true; }
        document.body.removeChild(ta);
      } catch (e) { done = false; }
    }
    toast(done ? okMsg : failMsg);
  }

  function copySection(r, shared, key) {
    if (!r || shared) { return; }
    var text = sectionText(r, key);
    if (!text) { return; }
    var msg = key === 'all' ? '전체 리포트를 복사했어요' : '문구를 복사했어요';
    copyClipboard(text, msg, '복사가 지원되지 않는 브라우저입니다. 길게 눌러 직접 선택해 주세요.');
  }

  function shareResult(r, shared, base) {
    if (!r || shared) { return; }
    var t = TYPES[r.type];
    var isFile = (typeof location !== 'undefined' && location.protocol === 'file:');
    var summary = '나의 커리어 포지셔닝: ' + t.name + '\n' + t.tagline;

    if (isFile) {
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({ title: SERVICE, text: summary }).catch(function () {});
        return;
      }
      copyClipboard(summary, '결과 문장을 복사했어요', summary);
      return;
    }

    var url = buildShareUrl(r, base);
    if (!url) {
      copyClipboard(summary, '결과 문장을 복사했어요', summary);
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: SERVICE, text: summary, url: url }).catch(function () {});
      return;
    }
    copyClipboard(url, '결과 링크를 복사했어요 · 입력 내용은 담기지 않습니다', '링크를 복사하지 못했어요. 주소창의 URL을 복사해 주세요.');
  }

  function wantsNew(search) {
    var raw = String(search || '');
    if (raw.charAt(0) === '?') { raw = raw.slice(1); }
    if (!raw) { return false; }
    return raw.split('&').indexOf('new=1') >= 0;
  }

  /* =========================================================
     10-C. 페이지 사이 상태 (2시간)
     ========================================================= */
  var STORE_KEY = 'resumeRebuilderStateV1';
  var STORE_TTL = 2 * 60 * 60 * 1000;

  function saveState(answers) {
    var payload = JSON.stringify({ v: 1, ts: Date.now(), answers: answers });
    try {
      window.localStorage.setItem(STORE_KEY, payload);
      return true;
    } catch (e) { /* 사생활 보호 모드 등 */ }
    try {
      window.sessionStorage.setItem(STORE_KEY, payload);
      return true;
    } catch (e2) { /* 저장 불가 */ }
    return false;
  }

  function clearState() {
    try { window.localStorage.removeItem(STORE_KEY); } catch (e) {}
    try { window.sessionStorage.removeItem(STORE_KEY); } catch (e2) {}
  }

  function loadState() {
    var stores = [];
    try { stores.push(window.localStorage); } catch (e) {}
    try { stores.push(window.sessionStorage); } catch (e2) {}
    for (var i = 0; i < stores.length; i++) {
      var raw = null;
      try { raw = stores[i].getItem(STORE_KEY); } catch (e3) { raw = null; }
      if (!raw) { continue; }
      var o = null;
      try { o = JSON.parse(raw); } catch (e4) { o = null; }
      if (!o || o.v !== 1 || typeof o.ts !== 'number') { continue; }
      if (Date.now() - o.ts > STORE_TTL) {
        try { stores[i].removeItem(STORE_KEY); } catch (e5) {}
        continue;
      }
      return normalizeAnswers(o.answers);
    }
    return null;
  }

  function detailShareBase() {
    if (typeof location === 'undefined' || !location.href) { return ''; }
    var cut = String(location.href).split('#')[0].split('?')[0];
    var i = cut.lastIndexOf('/');
    return i >= 0 ? cut.slice(0, i + 1) : cut;
  }

  /* =========================================================
     14-B. detail.html 부팅
     ========================================================= */
  function bootDetail() {
    var root = document.getElementById('detail-body');
    if (!root) { return; }

    var answers = loadState();
    if (!answers) {
      if (typeof location !== 'undefined' && location.replace) { location.replace('index.html'); }
      return;
    }

    var r = computeResult(answers);
    root.innerHTML = buildDetailHTML(r);

    root.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-action], [data-copy]') : null;
      if (!el) { return; }
      var copy = el.getAttribute('data-copy');
      var action = el.getAttribute('data-action');
      if (copy) { copySection(r, false, copy); }
      else if (action === 'share') { shareResult(r, false, detailShareBase()); }
      else if (action === 'restart') {
        clearState();
        if (typeof location !== 'undefined') { location.href = 'index.html?new=1'; }
      }
    });
  }

  /* =========================================================
     14. 부팅
     ========================================================= */
  function boot() {
    var $ = function (id) { return document.getElementById(id); };

    var state = { index: 0, answers: emptyAnswers(), result: null, shared: false, advancing: false };
    var advanceTimer = null;

    var screens = { landing: $('screen-landing'), quiz: $('screen-quiz'), result: $('screen-result') };
    var qBody = $('q-body');
    var qText = $('q-text');
    var qKicker = $('q-kicker');
    var qCounter = $('q-counter');
    var qHint = $('q-hint');
    var qGroups = $('q-groups');
    var qActions = $('q-actions');
    var qFill = $('q-progress-fill');
    var backBtn = $('btn-back');
    var resultBody = $('result-body');

    function showScreen(name) {
      var keys = ['landing', 'quiz', 'result'], i;
      for (i = 0; i < keys.length; i++) {
        screens[keys[i]].classList.toggle('is-active', keys[i] === name);
      }
      if (typeof window !== 'undefined' && window.scrollTo) { window.scrollTo(0, 0); }
    }

    /* ---- 옵션 마크업 ---- */
    function optHTML(key, label, num, selected) {
      return '<button type="button" class="opt' + (selected ? ' is-selected' : '') + '" data-opt="' + esc(key) + '">' +
        '<span class="opt-num">' + num + '</span>' +
        '<span class="opt-text">' + esc(label) + '</span>' +
        '</button>';
    }

    function chipHTML(key, label, en, selected) {
      return '<button type="button" class="chip' + (selected ? ' is-selected' : '') + '" data-opt="' + esc(key) + '" ' +
        'aria-pressed="' + (selected ? 'true' : 'false') + '">' +
        '<span>' + esc(label) + '</span>' +
        '<span class="chip-en">' + esc(en) + '</span>' +
        '</button>';
    }

    function groupHTML(label, inner, countText) {
      var h = '<div class="group"><div class="group-head"><span class="group-label">' + esc(label) + '</span>';
      if (countText) { h += '<span class="group-count">' + esc(countText) + '</span>'; }
      h += '</div>' + inner + '</div>';
      return h;
    }

    /* ---- 단계 렌더 ---- */
    function renderStep() {
      var step = STEPS[state.index];
      var a = state.answers;
      qKicker.textContent = step.kicker;
      qCounter.textContent = pad2(state.index + 1) + ' / ' + pad2(STEPS.length);
      qFill.style.width = Math.round((state.index + 1) / STEPS.length * 100) + '%';
      qText.textContent = STEP_TITLES[step.id];
      qHint.textContent = STEP_HINTS[step.id];

      var h = '', i, inner;
      if (step.id === 'basic') {
        inner = '';
        var rk = ['ux', 'strategy', 'data', 'dev', 'ops', 'other'];
        for (i = 0; i < rk.length; i++) {
          inner += optHTML(rk[i], ROLES[rk[i]].name, i + 1, a.role === rk[i]);
        }
        h += groupHTML('직무', '<div class="opts" data-group="role">' + inner + '</div>', a.role ? '선택됨' : '1개 고르기');

        inner = '';
        var yk = ['y1', 'y3', 'y6', 'y9'];
        for (i = 0; i < yk.length; i++) {
          inner += optHTML(yk[i], YEARS[yk[i]].name, i + 1, a.years === yk[i]);
        }
        h += groupHTML('총 경력', '<div class="opts" data-group="years">' + inner + '</div>', a.years ? '선택됨' : '1개 고르기');

        qActions.innerHTML = '<button type="button" class="btn btn-primary" data-action="next"' +
          (a.role && a.years ? '' : ' disabled') + '>다음</button>';
      } else if (step.id === 'comp') {
        inner = '';
        var ck = ['analysis', 'structure', 'ai', 'biz', 'lead', 'research'];
        for (i = 0; i < ck.length; i++) {
          inner += optHTML(ck[i], COMPS[ck[i]].name, i + 1, has(a.comps, ck[i]));
        }
        h += groupHTML('핵심 역량', '<div class="opts" data-group="comp">' + inner + '</div>', a.comps.length + ' / 2 선택');
        qActions.innerHTML = '<button type="button" class="btn btn-primary" data-action="next"' +
          (a.comps.length ? '' : ' disabled') + '>다음</button>';
      } else if (step.id === 'tools') {
        inner = '';
        var tk = ['figma', 'ai', 'python', 'notion', 'ga', 'etc'];
        for (i = 0; i < tk.length; i++) {
          inner += optHTML(tk[i], TOOLS[tk[i]].name, i + 1, has(a.tools, tk[i]));
        }
        h += groupHTML('툴 · 무기', '<div class="opts" data-group="tools">' + inner + '</div>', a.tools.length + '개 선택');
        qActions.innerHTML = '<button type="button" class="btn btn-primary" data-action="next"' +
          (a.tools.length ? '' : ' disabled') + '>다음</button>';
      } else if (step.id === 'illusion') {
        inner = '';
        var ik = ['pretty', 'chores', 'jobhop', 'overclaim'];
        for (i = 0; i < ik.length; i++) {
          inner += optHTML(ik[i], ILLUSIONS[ik[i]].name, i + 1, a.illusion === ik[i]);
        }
        h += groupHTML('한 가지만', '<div class="opts" data-group="illusion">' + inner + '</div>', '고르면 바로 다음');
        qActions.innerHTML = '';
      } else if (step.id === 'purpose') {
        inner = '';
        var pk = ['remote', 'move', 'transition', 'builder'];
        for (i = 0; i < pk.length; i++) {
          inner += optHTML(pk[i], PURPOSES[pk[i]].name, i + 1, a.purpose === pk[i]);
        }
        h += groupHTML('한 가지만', '<div class="opts" data-group="purpose">' + inner + '</div>', '고르면 바로 다음');
        qActions.innerHTML = '';
      } else if (step.id === 'domain') {
        inner = '';
        for (i = 0; i < DOMAIN_ORDER.length; i++) {
          inner += chipHTML(DOMAIN_ORDER[i], DOMAINS[DOMAIN_ORDER[i]].name,
            DOMAINS[DOMAIN_ORDER[i]].en, a.domainKey === DOMAIN_ORDER[i]);
        }
        h += groupHTML('도메인 · 전공 칩', '<div class="chip-row" data-group="domain">' + inner + '</div>', '고르면 영문 표기까지');
        h += '<div class="group">' +
          '<div class="group-head"><span class="group-label">직접 입력</span>' +
          '<span class="group-count">칩을 고르면 칩이 우선</span></div>' +
          '<div class="text-wrap"><textarea id="q-text-input" rows="2" maxlength="' + SHARE_MAX_DOMAIN + '" ' +
          'placeholder="예: 심리학 석사 / M.A. in Psychology">' + esc(a.domainFree) + '</textarea>' +
          '<div class="text-meta"><span>선택 사항</span><span id="q-text-count">' + a.domainFree.length + ' / ' + SHARE_MAX_DOMAIN + '</span></div></div>' +
          '</div>' +
          '<p class="text-example">칩에 없는 분야는 직접 쓰세요. 한글로 쓰면 영문 헤드라인에서는 빠지고, 영문으로 쓰면 영문 헤드라인에도 들어갑니다.</p>';
        qActions.innerHTML = '<button type="button" class="btn btn-primary" data-action="next">다음</button>' +
          '<p class="q-skip"><button type="button" class="cmd-link" data-action="skip">건너뛰기</button></p>';
      } else if (step.id === 'career') {
        var cr = a.career;
        inner = '';
        var wk = Object.keys(CAREER_WORKS);
        for (i = 0; i < 6; i++) { inner += optHTML(wk[i], CAREER_WORKS[wk[i]].label, i + 1, has(cr.works, wk[i])); }
        h += groupHTML('어떤 업무를 했나요? · 최대 2개', '<div class="opts" data-group="careerWorks">' + inner + '</div>', cr.works.length + ' / 2 선택');
        var more = '';
        for (i = 6; i < wk.length; i++) { more += optHTML(wk[i], CAREER_WORKS[wk[i]].label, i + 1, has(cr.works, wk[i])); }
        h += '<details class="career-more"><summary>다른 업무도 있어요 · 4개 더 보기</summary><div class="opts" data-group="careerWorks">' + more + '</div></details>';
        if (cr.works.length) {
          inner = '';
          var ck2 = Object.keys(CAREER_CHANGES);
          for (i = 0; i < ck2.length; i++) { inner += optHTML(ck2[i], CAREER_CHANGES[ck2[i]], i + 1, cr.change === ck2[i]); }
          h += groupHTML('그 업무를 통해 어떤 변화가 있었나요?', '<div class="opts" data-group="careerChange">' + inner + '</div>', cr.change ? '선택됨' : '1개 선택');
        }
        if (cr.change === 'R6' && cr.works.length) {
          for (var wi = 0; wi < cr.works.length; wi++) {
            var wid = cr.works[wi], recallOpts = CAREER_RECALL[wid] || [];
            inner = '';
            for (i = 0; i < recallOpts.length; i++) { inner += optHTML(recallOpts[i].r, recallOpts[i].t, i + 1, (cr.recall[wid] || '') === recallOpts[i].r); }
            inner += optHTML('R6', '여전히 잘 모르겠어요', recallOpts.length + 1, (cr.recall[wid] || '') === 'R6');
            h += groupHTML('조금 더 떠올려 볼게요 · ' + CAREER_WORKS[wid].label, '<div class="opts" data-group="recall_' + wid + '">' + inner + '</div>', cr.recall[wid] ? '선택됨' : '선택 사항');
          }
        }
        var hasResolvedRecall = cr.change === 'R6' && cr.works.some(function (wid2) { return cr.recall[wid2] && cr.recall[wid2] !== 'R6'; });
        if ((cr.change && cr.change !== 'R6' && cr.change !== 'R7') || hasResolvedRecall) {
          inner = '';
          var rk2 = Object.keys(CAREER_ROLE_LABELS);
          for (i = 0; i < rk2.length; i++) { inner += optHTML(rk2[i], CAREER_ROLE_LABELS[rk2[i]], i + 1, cr.role === rk2[i]); }
          h += groupHTML('그 과정에서 본인은 어떤 역할을 했나요? · 선택 사항', '<div class="opts" data-group="careerRole">' + inner + '</div>', cr.role && cr.role !== 'C6' ? '선택됨' : '선택하지 않아도 됩니다');
        }
        h += '<p class="text-example">성과를 정확히 기억하지 못하면 업무 중심 문장을 만들어요. 실제로 하지 않은 일이나 확인되지 않은 효과는 추가하지 않습니다.</p>';
        qActions.innerHTML = '<button type="button" class="btn btn-primary" data-action="next">리포트 만들기</button>' +
          '<p class="q-skip"><button type="button" class="cmd-link" data-action="skipCareer">이 항목 건너뛰기</button></p>';
      }

      qGroups.innerHTML = h;

      qBody.classList.remove('is-in');
      void qBody.offsetWidth;
      qBody.classList.add('is-in');
    }

    /* ---- 선택 처리 ---- */
    function chooseOption(group, key) {
      var a = state.answers;
      if (group === 'careerWorks') {
        if (has(a.career.works, key)) { a.career.works = a.career.works.filter(function (v) { return v !== key; }); delete a.career.recall[key]; }
        else if (a.career.works.length < 2 && CAREER_WORKS[key]) { a.career.works.push(key); }
        renderStep(); return;
      }
      if (group === 'careerChange') {
        a.career.change = key; a.career.recall = {}; a.career.role = 'C6'; renderStep(); return;
      }
      if (group === 'careerRole') { a.career.role = key; renderStep(); return; }
      if (group.indexOf('recall_') === 0) {
        var recallWork = group.slice(7);
        if (CAREER_WORKS[recallWork] && (key === 'R6' || CAREER_CHANGES[key])) { a.career.recall[recallWork] = key; }
        renderStep(); return;
      }
      if (group === 'role') {
        a.role = key;
        renderStep();
        return;
      }
      if (group === 'years') {
        a.years = key;
        renderStep();
        return;
      }
      if (group === 'comp') {
        if (has(a.comps, key)) {
          a.comps = a.comps.filter(function (v) { return v !== key; });
        } else if (a.comps.length < 2) {
          a.comps.push(key);
        }
        renderStep();
        return;
      }
      if (group === 'tools') {
        if (has(a.tools, key)) {
          a.tools = a.tools.filter(function (v) { return v !== key; });
        } else {
          a.tools.push(key);
        }
        renderStep();
        return;
      }
      if (group === 'domain') {
        a.domainKey = (a.domainKey === key) ? '' : key;
        var chips = qGroups.querySelectorAll('.chip');
        for (var ci = 0; ci < chips.length; ci++) {
          var on = chips[ci].getAttribute('data-opt') === a.domainKey;
          chips[ci].classList.toggle('is-selected', on);
          chips[ci].setAttribute('aria-pressed', on ? 'true' : 'false');
        }
        syncDomain();
        return;
      }
      if (group === 'illusion' || group === 'purpose') {
        if (state.advancing) { return; }
        if (group === 'illusion') { a.illusion = key; } else { a.purpose = key; }
        renderStep();
        state.advancing = true;
        advanceTimer = setTimeout(function () {
          advanceTimer = null;
          state.advancing = false;
          goNext();
        }, 220);
        return;
      }
    }

    function syncDomain() {
      var a = state.answers;
      a.domain = (a.domainKey && DOMAINS[a.domainKey]) ? DOMAINS[a.domainKey].name : a.domainFree;
    }

    function readDomain() {
      var el = $('q-text-input');
      if (el) {
        var v = String(el.value === undefined || el.value === null ? '' : el.value);
        state.answers.domainFree = cleanDomainText(v);
      }
      syncDomain();
    }

    function goNext() {
      var step = STEPS[state.index];
      if (step.id === 'basic' && !(state.answers.role && state.answers.years)) { return; }
      if (step.id === 'comp' && !state.answers.comps.length) { return; }
      if (step.id === 'tools' && !state.answers.tools.length) { return; }
      if (step.id === 'career' && state.answers.career.works.length && !state.answers.career.change) { toast('변화 유형을 선택하거나 건너뛰어 주세요.'); return; }
      if (step.id === 'domain') { readDomain(); }
      if (state.index < STEPS.length - 1) {
        state.index += 1;
        renderStep();
      } else {
        finish();
      }
    }

    function goBack() {
      if (state.advancing) {
        if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
        state.advancing = false;
      }
      if (state.index === 0) { showScreen('landing'); return; }
      state.index -= 1;
      renderStep();
    }

    function render() {
      if (!state.result) { resultBody.innerHTML = ''; return; }
      resultBody.innerHTML = buildFreeHTML(state.result, { shared: state.shared });
    }

    function openDetail() {
      if (!state.result || state.shared) { return; }
      saveState(state.answers);
      if (typeof location !== 'undefined' && location.href) { location.href = 'detail.html'; }
    }

    function startQuiz() {
      clearState();
      state.index = 0;
      state.answers = emptyAnswers();
      state.result = null;
      state.shared = false;
      if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
      state.advancing = false;
      render();
      showScreen('quiz');
      renderStep();
    }

    function finish() {
      state.result = computeResult(state.answers);
      state.shared = false;
      saveState(state.answers);
      render();
      showScreen('result');
    }

    function restart() {
      try {
        history.replaceState(null, '', location.pathname + location.hash);
      } catch (e) {}
      startQuiz();
    }

    /* ---- 이벤트 ---- */
    $('btn-start').addEventListener('click', startQuiz);
    backBtn.addEventListener('click', goBack);

    qGroups.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-opt]') : null;
      if (!btn) { return; }
      var groupEl = btn.closest ? btn.closest('[data-group]') : null;
      var group = groupEl ? groupEl.getAttribute('data-group') : '';
      chooseOption(group, btn.getAttribute('data-opt'));
    });

    qGroups.addEventListener('input', function (e) {
      var t = e.target;
      if (!t || t.id !== 'q-text-input') { return; }
      var v = String(t.value || '');
      if (v.length > SHARE_MAX_DOMAIN) { t.value = v.slice(0, SHARE_MAX_DOMAIN); }
      var cnt = $('q-text-count');
      if (cnt) { cnt.textContent = String(t.value.length) + ' / ' + SHARE_MAX_DOMAIN; }
    });

    qActions.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-action]') : null;
      if (!el) { return; }
      var action = el.getAttribute('data-action');
      if (action === 'next') { goNext(); }
      else if (action === 'skip') {
        state.answers.domainKey = '';
        state.answers.domainFree = '';
        state.answers.domain = '';
        goNext();
      }
      else if (action === 'skipCareer') { state.answers.career = { works: [], change: '', recall: {}, role: 'C6' }; finish(); }
    });

    resultBody.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-action], [data-copy]') : null;
      if (!el) { return; }
      var action = el.getAttribute('data-action');
      var copy = el.getAttribute('data-copy');
      if (copy) { copySection(state.result, state.shared, copy); }
      else if (action === 'share') { shareResult(state.result, state.shared); }
      else if (action === 'restart') { restart(); }
      else if (action === 'detail') { openDetail(); }
    });

    document.addEventListener('keydown', function (e) {
      if (!screens.quiz.classList.contains('is-active')) { return; }
      if (e.key === 'ArrowLeft') { goBack(); return; }
      var step = STEPS[state.index];
      if (step.mode !== 'single') { return; }
      if (e.key >= '1' && e.key <= '6') {
        var list = qGroups.querySelectorAll('.opt');
        var idx = parseInt(e.key, 10) - 1;
        if (idx < list.length) {
          e.preventDefault();
          var grp = list[idx].closest ? list[idx].closest('[data-group]') : null;
          chooseOption(grp ? grp.getAttribute('data-group') : '', list[idx].getAttribute('data-opt'));
        }
      }
    });

    /* ---- 공유 링크 또는 랜딩 ---- */
    var shared = null;
    try {
      shared = parseShareParams(typeof location !== 'undefined' ? location.search : '');
    } catch (e) { shared = null; }

    if (shared) {
      state.shared = true;
      state.result = sharedResult(shared);
      render();
      showScreen('result');
    } else if (wantsNew(typeof location !== 'undefined' ? location.search : '')) {
      startQuiz();
    } else {
      showScreen('landing');
    }
  }

  if (typeof document !== 'undefined' && document.getElementById) {
    if (document.getElementById('screen-landing')) { boot(); }
    if (document.getElementById('detail-body')) { bootDetail(); }
  }

  var API = {
    SERVICE: SERVICE,
    ROLES: ROLES,
    YEARS: YEARS,
    COMPS: COMPS,
    CAREER_WORKS: CAREER_WORKS,
    CAREER_CHANGES: CAREER_CHANGES,
    CAREER_RECALL: CAREER_RECALL,
    CAREER_TEMPLATES: CAREER_TEMPLATES,
    careerSentenceData: careerSentenceData,
    TOOLS: TOOLS,
    ILLUSIONS: ILLUSIONS,
    ILLUSION_READ: ILLUSION_READ,
    PURPOSES: PURPOSES,
    TYPES: TYPES,
    TYPE_ORDER: TYPE_ORDER,
    STEPS: STEPS,
    DOMAINS: DOMAINS,
    DOMAIN_ORDER: DOMAIN_ORDER,
    TOOL_CUT: TOOL_CUT,
    personalDrafts: personalDrafts,
    toolCutAdvice: toolCutAdvice,
    domainEnOf: domainEnOf,
    josa: josa,
    normalizeAnswers: normalizeAnswers,
    computeResult: computeResult,
    scoreTypes: scoreTypes,
    classify: classify,
    freeHeadline: freeHeadline,
    illusionOf: illusionOf,
    headlineKo: headlineKo,
    headlineEn: headlineEn,
    headlinePitch: headlinePitch,
    aboutParagraphs: aboutParagraphs,
    keyList: keyList,
    buildFreeHTML: buildFreeHTML,
    buildDetailHTML: buildDetailHTML,
    buildPlainText: buildPlainText,
    sectionText: sectionText,
    shareCode: shareCode,
    buildShareUrl: buildShareUrl,
    parseShareParams: parseShareParams,
    sharedResult: sharedResult,
    saveState: saveState,
    loadState: loadState,
    clearState: clearState,
    detailShareBase: detailShareBase,
    wantsNew: wantsNew,
    bootDetail: bootDetail
  };

  if (typeof globalThis !== 'undefined') {
    globalThis.RR = API;
    globalThis.__ENGINE__ = API;
  }
})();
