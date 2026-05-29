import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ─────────────────────────────────────────────
// 테마별 진로검사 (CDSE-SF 기반, 학생 친화적 상황)
// ─────────────────────────────────────────────
const THEMES = [
  {
    id: 'academic',
    emoji: '😴',
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
    title: '공부 그런거 왜 하냐?',
    subtitle: '수업은 졸린데 취미엔 몰입하는 너에게',
    questions: [
      {
        // CDSE-SF: "Accurately assess your abilities"
        context: '수업 시간에 딴짓하다가 나도 모르게 집중하게 되는 순간이 있다.',
        question: '어떤 내용일 때 유독 빠져드는 편이야?',
        choices: [
          { id: '1', text: '직접 만들거나 분해하는 실습 시간', delta: { interest: { R: 25 }, aptitude: { 손재능: 20, 자기관리능력: 10 }, values: { 능력발휘: 20, 자기계발: 10 } } },
          { id: '2', text: '수학·과학 문제가 딱 맞아떨어질 때', delta: { interest: { I: 25 }, aptitude: { 수리논리력: 20, 자기관리능력: 10 }, values: { 자기계발: 20, 능력발휘: 10 } } },
          { id: '3', text: '미술·음악·글쓰기 같은 표현 활동', delta: { interest: { A: 25 }, aptitude: { 예술시각능력: 20, 창의력: 10 }, values: { 창의성: 20, 자율성: 10 } } },
          { id: '4', text: '친구들이랑 협력하거나 토론할 때', delta: { interest: { S: 25 }, aptitude: { 대인관계능력: 20, 언어능력: 10 }, values: { 사회봉사: 20, 사회적인정: 10 } } },
          { id: '5', text: '프로젝트 기획하거나 내 아이디어 낼 때', delta: { interest: { E: 25 }, aptitude: { 자기관리능력: 20, 대인관계능력: 10 }, values: { 능력발휘: 20, 사회적인정: 10 } } },
        ],
      },
      {
        // CDSE-SF: "Talk with a person already employed in the field"
        context: '게임으로 먹고 사는 사람들이 많아졌다. 나라면 게임 업계에서 어떤 일을 하고 싶어?',
        question: '가장 끌리는 역할은?',
        choices: [
          { id: '1', text: '게임 기기·하드웨어 만드는 개발자', delta: { interest: { R: 25 }, aptitude: { 손재능: 20, 공간지각력: 10 }, values: { 능력발휘: 20, 자기계발: 10 } } },
          { id: '2', text: '게임 밸런스·데이터 분석하는 기획자', delta: { interest: { I: 25 }, aptitude: { 수리논리력: 20, 자기관리능력: 10 }, values: { 자기계발: 20, 능력발휘: 10 } } },
          { id: '3', text: '캐릭터·배경 그리는 원화가·아티스트', delta: { interest: { A: 25 }, aptitude: { 예술시각능력: 20, 창의력: 10 }, values: { 창의성: 20, 자율성: 10 } } },
          { id: '4', text: '팬들과 소통하는 스트리머·커뮤니티 관리', delta: { interest: { S: 25 }, aptitude: { 대인관계능력: 20, 언어능력: 10 }, values: { 사회봉사: 20, 사회적인정: 10 } } },
          { id: '5', text: '팀 전체를 이끄는 게임 프로듀서·사업', delta: { interest: { C: 25 }, aptitude: { 자기관리능력: 20, 수리논리력: 10 }, values: { 안정성: 20, 자기계발: 10 } } },
        ],
      },
      {
        // CDSE-SF: "Choose a major or career that will fit your interests"
        context: '좋아하는 애니나 영화에서 제일 부러운 캐릭터 유형이 있다.',
        question: '어떤 포지션이 제일 끌려?',
        choices: [
          { id: '1', text: '손기술로 뭐든 만들고 고치는 장인 캐릭터', delta: { interest: { R: 25 }, aptitude: { 손재능: 20, 공간지각력: 10 }, values: { 능력발휘: 20, 자기계발: 10 } } },
          { id: '2', text: '데이터와 정보 분석으로 팀을 돕는 브레인', delta: { interest: { I: 25 }, aptitude: { 수리논리력: 20, 언어능력: 10 }, values: { 자기계발: 20, 능력발휘: 10 } } },
          { id: '3', text: '감성·창의력으로 돌파구를 찾는 예술가', delta: { interest: { A: 25 }, aptitude: { 창의력: 20, 예술시각능력: 10 }, values: { 창의성: 20, 자율성: 10 } } },
          { id: '4', text: '팀원 모두를 이해하고 이끌어주는 리더', delta: { interest: { E: 25 }, aptitude: { 자기관리능력: 20, 대인관계능력: 10 }, values: { 능력발휘: 20, 사회적인정: 10 } } },
          { id: '5', text: '체계적 전략으로 승리를 설계하는 전략가', delta: { interest: { C: 25 }, aptitude: { 자기관리능력: 20, 수리논리력: 10 }, values: { 안정성: 20, 자기계발: 10 } } },
        ],
      },
      {
        // CDSE-SF: "Determine the steps you need to take"
        context: '마감이 내일인 과제가 있다. 뭔가 하긴 해야 할 것 같다.',
        question: '나는 어떤 방식으로 시작할 것 같아?',
        choices: [
          { id: '1', text: '직접 만들거나 실험해보면서 감 잡기', delta: { interest: { R: 25 }, aptitude: { 손재능: 20, 자기관리능력: 10 }, values: { 능력발휘: 20, 자기계발: 10 } } },
          { id: '2', text: '관련 자료 싹 다 검색해서 먼저 정보 정리', delta: { interest: { I: 25 }, aptitude: { 수리논리력: 20, 언어능력: 10 }, values: { 자기계발: 20, 능력발휘: 10 } } },
          { id: '3', text: '독창적인 방향으로 아이디어부터 스케치', delta: { interest: { A: 25 }, aptitude: { 창의력: 20, 예술시각능력: 10 }, values: { 창의성: 20, 자율성: 10 } } },
          { id: '4', text: '친구한테 연락해서 같이 하거나 아이디어 얻기', delta: { interest: { S: 25 }, aptitude: { 대인관계능력: 20, 언어능력: 10 }, values: { 사회봉사: 20, 사회적인정: 10 } } },
          { id: '5', text: '할 일 목록 만들고 시간 배분해서 체계적으로 시작', delta: { interest: { E: 25 }, aptitude: { 자기관리능력: 20, 대인관계능력: 10 }, values: { 능력발휘: 20, 사회적인정: 10 } } },
        ],
      },
    ],
  },
  {
    id: 'talent',
    emoji: '🤷',
    color: '#3B82F6',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    title: '나 뭘 잘하는지 모르겠어',
    subtitle: '게임에서 빌드 다 외우면서 왜 모른대',
    questions: [
      {
        // CDSE-SF: "Accurately assess your abilities"
        context: '친구들이 나한테 부탁할 때 뭔가 패턴이 있다.',
        question: '제일 많이 받는 부탁이 어떤 유형이야?',
        choices: [
          { id: '1', text: '뭔가 고장났거나 만들어야 할 때 도움 요청', delta: { interest: { R: 25 }, aptitude: { 손재능: 20, 공간지각력: 10 }, values: { 능력발휘: 20, 자기계발: 10 } } },
          { id: '2', text: '모르는 거 설명해달라거나 같이 문제 풀자고', delta: { interest: { I: 25 }, aptitude: { 수리논리력: 20, 언어능력: 10 }, values: { 자기계발: 20, 능력발휘: 10 } } },
          { id: '3', text: '디자인·편집·글 써달라는 창작 요청', delta: { interest: { A: 25 }, aptitude: { 창의력: 20, 예술시각능력: 10 }, values: { 창의성: 20, 자율성: 10 } } },
          { id: '4', text: '고민 들어달라거나 갈등 해결해달라고', delta: { interest: { S: 25 }, aptitude: { 대인관계능력: 20, 언어능력: 10 }, values: { 사회봉사: 20, 사회적인정: 10 } } },
          { id: '5', text: '계획 세워달라거나 아이디어 달라고', delta: { interest: { E: 25 }, aptitude: { 자기관리능력: 20, 대인관계능력: 10 }, values: { 능력발휘: 20, 사회적인정: 10 } } },
        ],
      },
      {
        // CDSE-SF: "Determine what your ideal job would be"
        context: '내 유튜브 채널을 만든다고 상상해봐. 구독자 생길 것 같은 스타일이 있다.',
        question: '어떤 콘텐츠로 할 것 같아?',
        choices: [
          { id: '1', text: '공구·DIY·리뷰 - 직접 만들고 분해하는 채널', delta: { interest: { R: 25 }, aptitude: { 손재능: 20, 공간지각력: 10 }, values: { 능력발휘: 20, 자기계발: 10 } } },
          { id: '2', text: '게임 분석·공략 - 데이터와 전략 파고드는 채널', delta: { interest: { I: 25 }, aptitude: { 수리논리력: 20, 자기관리능력: 10 }, values: { 자기계발: 20, 능력발휘: 10 } } },
          { id: '3', text: '그림·애니·음악 - 내 감성 표현하는 채널', delta: { interest: { A: 25 }, aptitude: { 예술시각능력: 20, 창의력: 10 }, values: { 창의성: 20, 자율성: 10 } } },
          { id: '4', text: 'VLOG·상담·일상 - 사람들이랑 공감하는 채널', delta: { interest: { S: 25 }, aptitude: { 대인관계능력: 20, 언어능력: 10 }, values: { 사회봉사: 20, 사회적인정: 10 } } },
          { id: '5', text: '경제·정보 - 유용한 지식 체계적으로 정리하는 채널', delta: { interest: { C: 25 }, aptitude: { 자기관리능력: 20, 수리논리력: 10 }, values: { 안정성: 20, 자기계발: 10 } } },
        ],
      },
      {
        // CDSE-SF: "Select one occupation from a list"
        context: '게임에서 파티를 꾸렸다. 자연스럽게 어떤 포지션을 맡게 되는 편이야?',
        question: '내 자연스러운 역할은?',
        choices: [
          { id: '1', text: '탱커·딜러 - 직접 최전선에서 몸으로 부딪히는 역할', delta: { interest: { R: 25 }, aptitude: { 손재능: 20, 자기관리능력: 10 }, values: { 능력발휘: 20, 자기계발: 10 } } },
          { id: '2', text: '브레인 - 적 패턴 분석하고 공략법 알려주는 역할', delta: { interest: { I: 25 }, aptitude: { 수리논리력: 20, 언어능력: 10 }, values: { 자기계발: 20, 능력발휘: 10 } } },
          { id: '3', text: '서포터·힐러 - 팀원 살리고 뒤에서 돕는 역할', delta: { interest: { S: 25 }, aptitude: { 대인관계능력: 20, 언어능력: 10 }, values: { 사회봉사: 20, 사회적인정: 10 } } },
          { id: '4', text: '콜러·파티장 - 전략 짜고 팀 방향 이끄는 역할', delta: { interest: { E: 25 }, aptitude: { 자기관리능력: 20, 대인관계능력: 10 }, values: { 능력발휘: 20, 사회적인정: 10 } } },
          { id: '5', text: '솔로 - 내 페이스대로 혼자 하는 게 더 편함', delta: { interest: { C: 25 }, aptitude: { 자기관리능력: 20, 수리논리력: 10 }, values: { 안정성: 20, 자기계발: 10 } } },
        ],
      },
      {
        // CDSE-SF: "Identify employers, firms, institutions relevant to your career"
        context: '진로 준비를 해야 한다는 건 알겠다. 지금 뭐부터 시작하겠어?',
        question: '내 방식으로 첫 걸음을 뗀다면?',
        choices: [
          { id: '1', text: '일단 관련된 걸 직접 만들거나 해봄', delta: { interest: { R: 25 }, aptitude: { 손재능: 20, 공간지각력: 10 }, values: { 능력발휘: 20, 자기계발: 10 } } },
          { id: '2', text: '그 분야 자료를 파고들면서 탐구하고 공부함', delta: { interest: { I: 25 }, aptitude: { 수리논리력: 20, 자기관리능력: 10 }, values: { 자기계발: 20, 능력발휘: 10 } } },
          { id: '3', text: '포트폴리오 될 만한 창작물부터 하나 만들어봄', delta: { interest: { A: 25 }, aptitude: { 창의력: 20, 예술시각능력: 10 }, values: { 창의성: 20, 자율성: 10 } } },
          { id: '4', text: '그 분야 사람 찾아가서 어떻게 하는지 물어봄', delta: { interest: { S: 25 }, aptitude: { 대인관계능력: 20, 언어능력: 10 }, values: { 사회봉사: 20, 사회적인정: 10 } } },
          { id: '5', text: '로드맵 검색해서 단계별로 할 것들 정리함', delta: { interest: { E: 25 }, aptitude: { 자기관리능력: 20, 대인관계능력: 10 }, values: { 능력발휘: 20, 사회적인정: 10 } } },
        ],
      },
    ],
  },
  {
    id: 'future',
    emoji: '😮‍💨',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    title: '미래? 닥치면 어떻게 되겠지',
    subtitle: '근데 진짜 5년 뒤 생각해본 적 있어?',
    questions: [
      {
        // CDSE-SF: "Define the type of lifestyle you would like to live"
        context: '억지로라도 상상해봐. 10년 뒤 내가 일하고 있는 모습이 있다면?',
        question: '어떤 장면이 그나마 그려져?',
        choices: [
          { id: '1', text: '작업실·공방에서 뭔가 만들고 있는 모습', delta: { interest: { R: 25 }, aptitude: { 손재능: 20, 공간지각력: 10 }, values: { 능력발휘: 20, 자기계발: 10 } } },
          { id: '2', text: '연구실에서 데이터 분석하거나 탐구하는 모습', delta: { interest: { I: 25 }, aptitude: { 수리논리력: 20, 자기관리능력: 10 }, values: { 자기계발: 20, 능력발휘: 10 } } },
          { id: '3', text: '스튜디오에서 뭔가 창작하거나 표현하는 모습', delta: { interest: { A: 25 }, aptitude: { 창의력: 20, 예술시각능력: 10 }, values: { 창의성: 20, 자율성: 10 } } },
          { id: '4', text: '사람들 앞에서 가르치거나 상담하는 모습', delta: { interest: { S: 25 }, aptitude: { 대인관계능력: 20, 언어능력: 10 }, values: { 사회봉사: 20, 사회적인정: 10 } } },
          { id: '5', text: '팀을 이끌거나 뭔가 기획·운영하는 모습', delta: { interest: { E: 25 }, aptitude: { 자기관리능력: 20, 대인관계능력: 10 }, values: { 능력발휘: 20, 사회적인정: 10 } } },
        ],
      },
      {
        // CDSE-SF: "Select one occupation — choose a career that fits your interests"
        context: '직업을 딱 하나만 골라야 한다. 어떤 기준으로 고를지는 모르겠다.',
        question: '결국 내가 가장 중요하게 따질 것 같은 기준은?',
        choices: [
          { id: '1', text: '직접 만들고 다룰 수 있는 직업', delta: { interest: { R: 25 }, aptitude: { 손재능: 20, 공간지각력: 10 }, values: { 능력발휘: 20, 자기계발: 10 } } },
          { id: '2', text: '계속 공부하고 탐구하며 성장할 수 있는 직업', delta: { interest: { I: 25 }, aptitude: { 수리논리력: 20, 자기관리능력: 10 }, values: { 자기계발: 20, 능력발휘: 10 } } },
          { id: '3', text: '내 창의성과 감각을 마음껏 펼칠 수 있는 직업', delta: { interest: { A: 25 }, aptitude: { 창의력: 20, 예술시각능력: 10 }, values: { 창의성: 20, 자율성: 10 } } },
          { id: '4', text: '오래 안정적으로 다닐 수 있는 직업', delta: { interest: { C: 25 }, aptitude: { 자기관리능력: 20, 수리논리력: 10 }, values: { 안정성: 20, 자기계발: 10 } } },
          { id: '5', text: '사람들한테 인정받고 영향력을 발휘하는 직업', delta: { interest: { E: 25 }, aptitude: { 자기관리능력: 20, 대인관계능력: 10 }, values: { 능력발휘: 20, 사회적인정: 10 } } },
        ],
      },
      {
        // CDSE-SF: "Choose a career that will fit your preferred lifestyle" (RPG version)
        context: '인생을 RPG로 비유한다면, 나는 어떤 클래스를 키우고 싶어?',
        question: '가장 끌리는 클래스는?',
        choices: [
          { id: '1', text: '장인·메카닉 - 기술로 뭐든 만들고 고치는 클래스', delta: { interest: { R: 25 }, aptitude: { 손재능: 20, 공간지각력: 10 }, values: { 능력발휘: 20, 자기계발: 10 } } },
          { id: '2', text: '마법사·연구가 - 지식 쌓고 분석하는 클래스', delta: { interest: { I: 25 }, aptitude: { 수리논리력: 20, 자기관리능력: 10 }, values: { 자기계발: 20, 능력발휘: 10 } } },
          { id: '3', text: '음유시인·예술가 - 감성과 창의력으로 승부하는 클래스', delta: { interest: { A: 25 }, aptitude: { 창의력: 20, 예술시각능력: 10 }, values: { 창의성: 20, 자율성: 10 } } },
          { id: '4', text: '사제·치유사 - 사람들 돕고 팀을 살리는 클래스', delta: { interest: { S: 25 }, aptitude: { 대인관계능력: 20, 언어능력: 10 }, values: { 사회봉사: 20, 사회적인정: 10 } } },
          { id: '5', text: '지휘관·리더 - 전략 짜고 팀 이끄는 클래스', delta: { interest: { E: 25 }, aptitude: { 자기관리능력: 20, 대인관계능력: 10 }, values: { 능력발휘: 20, 사회적인정: 10 } } },
        ],
      },
      {
        // CDSE-SF: "Make a career decision and then not worry about whether it was right or wrong"
        context: '부모님이 "5년 뒤 계획이 뭐야?" 라고 진지하게 물어봤다.',
        question: '솔직하게 나는 어떻게 대답할 것 같아?',
        choices: [
          { id: '1', text: '"모르겠어요, 일단 해보면서 차근차근 찾아볼게요"', delta: { interest: { I: 25 }, aptitude: { 수리논리력: 20, 자기관리능력: 10 }, values: { 자기계발: 20, 능력발휘: 10 } } },
          { id: '2', text: '"제가 좋아하는 걸 직업으로 만들 거예요"', delta: { interest: { A: 25 }, aptitude: { 창의력: 20, 예술시각능력: 10 }, values: { 창의성: 20, 자율성: 10 } } },
          { id: '3', text: '"남들한테 도움 되는 일 하고 싶어요"', delta: { interest: { S: 25 }, aptitude: { 대인관계능력: 20, 언어능력: 10 }, values: { 사회봉사: 20, 사회적인정: 10 } } },
          { id: '4', text: '"1년씩 계획 세워서 하나씩 해나갈 거예요"', delta: { interest: { E: 25 }, aptitude: { 자기관리능력: 20, 대인관계능력: 10 }, values: { 능력발휘: 20, 사회적인정: 10 } } },
          { id: '5', text: '"안정적으로 잘 먹고 잘 살 수 있으면 좋겠어요"', delta: { interest: { C: 25 }, aptitude: { 자기관리능력: 20, 수리논리력: 10 }, values: { 안정성: 20, 보수: 10 } } },
        ],
      },
    ],
  },
  {
    id: 'dream',
    emoji: '😤',
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    title: '하고 싶은 건 있는데 현실이...',
    subtitle: '프로게이머, 유튜버 - 생각보다 길이 있다',
    questions: [
      {
        // CDSE-SF: "Persistently work at your career goal even when you get frustrated"
        context: '하고 싶은 게 있는데 현실적으로 어렵다는 말을 자주 듣는다.',
        question: '그럴 때 나는 어떻게 하는 편이야?',
        choices: [
          { id: '1', text: '일단 혼자 직접 해보면서 가능한지 테스트해봐', delta: { interest: { R: 25 }, aptitude: { 손재능: 20, 공간지각력: 10 }, values: { 능력발휘: 20, 자기계발: 10 } } },
          { id: '2', text: '그 꿈이 가능한 루트를 데이터로 찾아서 분석해봐', delta: { interest: { I: 25 }, aptitude: { 수리논리력: 20, 자기관리능력: 10 }, values: { 자기계발: 20, 능력발휘: 10 } } },
          { id: '3', text: '방향을 틀어서 비슷한 다른 길을 창의적으로 찾아봐', delta: { interest: { A: 25 }, aptitude: { 창의력: 20, 예술시각능력: 10 }, values: { 창의성: 20, 자율성: 10 } } },
          { id: '4', text: '같은 꿈 가진 사람 찾아서 함께 방법 모색해봐', delta: { interest: { S: 25 }, aptitude: { 대인관계능력: 20, 언어능력: 10 }, values: { 사회봉사: 20, 사회적인정: 10 } } },
          { id: '5', text: '포기 전에 장단점 따져서 전략적으로 판단해봐', delta: { interest: { E: 25 }, aptitude: { 자기관리능력: 20, 대인관계능력: 10 }, values: { 능력발휘: 20, 사회적인정: 10 } } },
        ],
      },
      {
        // CDSE-SF: "Change occupations if you are not satisfied"
        context: '"프로게이머나 유튜버 같은 건 현실적으로 힘들다"는 말을 자주 듣는다.',
        question: '그 말에 나는 어떻게 반응해?',
        choices: [
          { id: '1', text: '"그럼 그 기술로 할 수 있는 다른 직업 찾아볼게"', delta: { interest: { R: 25 }, aptitude: { 손재능: 20, 자기관리능력: 10 }, values: { 능력발휘: 20, 자기계발: 10 } } },
          { id: '2', text: '"실제 성공 케이스 데이터 찾아서 설득할게"', delta: { interest: { I: 25 }, aptitude: { 수리논리력: 20, 언어능력: 10 }, values: { 자기계발: 20, 능력발휘: 10 } } },
          { id: '3', text: '"포기 안 해. 다른 방식으로라도 해볼게"', delta: { interest: { A: 25 }, aptitude: { 창의력: 20, 예술시각능력: 10 }, values: { 창의성: 20, 자율성: 10 } } },
          { id: '4', text: '"그 분야 종사자 만나서 직접 물어볼게"', delta: { interest: { S: 25 }, aptitude: { 대인관계능력: 20, 언어능력: 10 }, values: { 사회봉사: 20, 사회적인정: 10 } } },
          { id: '5', text: '"현실적인 루트로 체계적으로 준비해볼게"', delta: { interest: { C: 25 }, aptitude: { 자기관리능력: 20, 수리논리력: 10 }, values: { 안정성: 20, 자기계발: 10 } } },
        ],
      },
      {
        // CDSE-SF: "Determine the steps to take if you are having academic trouble"
        context: '꿈을 향해 가다가 예상치 못한 장벽이 생겨서 막혔다.',
        question: '나는 어떻게 돌파할 것 같아?',
        choices: [
          { id: '1', text: '문제를 직접 분석하고 논리적으로 해결책 찾기', delta: { interest: { I: 25 }, aptitude: { 수리논리력: 20, 자기관리능력: 10 }, values: { 자기계발: 20, 능력발휘: 10 } } },
          { id: '2', text: '기존 방식 버리고 완전히 새로운 방향으로 전환', delta: { interest: { A: 25 }, aptitude: { 창의력: 20, 언어능력: 10 }, values: { 창의성: 20, 자율성: 10 } } },
          { id: '3', text: '주변 사람들한테 도움 구하거나 같이 해결하기', delta: { interest: { S: 25 }, aptitude: { 대인관계능력: 20, 언어능력: 10 }, values: { 사회봉사: 20, 사회적인정: 10 } } },
          { id: '4', text: '좌절해도 전략 수정해서 포기 않고 재도전', delta: { interest: { E: 25 }, aptitude: { 자기관리능력: 20, 대인관계능력: 10 }, values: { 능력발휘: 20, 사회적인정: 10 } } },
          { id: '5', text: '현실적 조건 꼼꼼히 따져서 최선의 선택 하기', delta: { interest: { C: 25 }, aptitude: { 자기관리능력: 20, 수리논리력: 10 }, values: { 안정성: 20, 자기계발: 10 } } },
        ],
      },
      {
        // CDSE-SF: "Figure out what you are and are not ready to sacrifice"
        context: '아무리 힘들어도 결국 포기 못 할 것 같은 게 있다.',
        question: '그게 어떤 유형이야?',
        choices: [
          { id: '1', text: '직접 만들거나 고치는 것 - 결과물이 눈에 보이는 일', delta: { interest: { R: 25 }, aptitude: { 손재능: 20, 공간지각력: 10 }, values: { 능력발휘: 20, 자기계발: 10 } } },
          { id: '2', text: '탐구하고 파고드는 것 - 원리를 이해하는 쾌감', delta: { interest: { I: 25 }, aptitude: { 수리논리력: 20, 자기관리능력: 10 }, values: { 자기계발: 20, 능력발휘: 10 } } },
          { id: '3', text: '창작하고 표현하는 것 - 내 것을 만드는 자유로움', delta: { interest: { A: 25 }, aptitude: { 창의력: 20, 예술시각능력: 10 }, values: { 창의성: 20, 자율성: 10 } } },
          { id: '4', text: '누군가 돕는 것 - 상대방이 좋아질 때 느끼는 보람', delta: { interest: { S: 25 }, aptitude: { 대인관계능력: 20, 언어능력: 10 }, values: { 사회봉사: 20, 사회적인정: 10 } } },
          { id: '5', text: '이끌고 기획하는 것 - 결과를 만들어내는 성취감', delta: { interest: { E: 25 }, aptitude: { 자기관리능력: 20, 대인관계능력: 10 }, values: { 능력발휘: 20, 사회적인정: 10 } } },
        ],
      },
    ],
  },
]

const APTITUDE_THEME = {
  emoji: '🎯',
  color: '#3B82F6',
  bg: '#EFF6FF',
  border: '#BFDBFE',
  title: '적성 검사',
}

const VALUES_THEME = {
  emoji: '💎',
  color: '#10B981',
  bg: '#ECFDF5',
  border: '#A7F3D0',
  title: '가치관 검사',
}

const APTITUDE_QUESTIONS = [
  {
    context: '학교 수업이나 생활에서 나도 모르게 잘한다고 느끼는 영역이 있다.',
    question: '친구들이 나에게 "이건 잘하네"라고 하는 게 어떤 유형이야?',
    choices: [
      { id: '1', text: '글쓰기·발표·상대방 설득하기', delta: { interest: { A: 10 }, aptitude: { 언어능력: 30, 창의력: 10 }, values: {} } },
      { id: '2', text: '수학 풀기·데이터 정리·논리 구조 잡기', delta: { interest: { I: 10 }, aptitude: { 수리논리력: 30, 자기관리능력: 10 }, values: {} } },
      { id: '3', text: '그림·영상·음악 같은 감각적인 표현', delta: { interest: { A: 10 }, aptitude: { 예술시각능력: 30, 창의력: 10 }, values: {} } },
      { id: '4', text: '아이디어 내고 새로운 방식 찾기', delta: { interest: { E: 10 }, aptitude: { 창의력: 30, 언어능력: 10 }, values: {} } },
      { id: '5', text: '친구 고민 듣고 갈등 해결해주기', delta: { interest: { S: 10 }, aptitude: { 대인관계능력: 30, 언어능력: 10 }, values: {} } },
    ],
  },
  {
    context: '모둠 과제를 할 때 자연스럽게 맡게 되는 역할이 있다.',
    question: '나는 보통 어떤 역할을 담당하게 돼?',
    choices: [
      { id: '1', text: '자료 수집·수치 분석·계산 담당', delta: { interest: { I: 10 }, aptitude: { 수리논리력: 30, 자기관리능력: 10 }, values: {} } },
      { id: '2', text: '발표 원고 쓰고 설명하는 담당', delta: { interest: { S: 10 }, aptitude: { 언어능력: 30, 대인관계능력: 10 }, values: {} } },
      { id: '3', text: '디자인·꾸미기·시각화 담당', delta: { interest: { A: 10 }, aptitude: { 예술시각능력: 30, 창의력: 10 }, values: {} } },
      { id: '4', text: '일정 관리·역할 분배·진행 담당', delta: { interest: { C: 10 }, aptitude: { 자기관리능력: 30, 수리논리력: 10 }, values: {} } },
      { id: '5', text: '손으로 직접 제작하거나 실험하는 담당', delta: { interest: { R: 10 }, aptitude: { 손재능: 30, 공간지각력: 10 }, values: {} } },
    ],
  },
  {
    context: '방과 후 취미나 특기활동을 생각해봐. 시간 가는 줄 모르고 몰입하는 활동이 있다.',
    question: '나도 모르게 집중하게 되는 활동 유형은?',
    choices: [
      { id: '1', text: '뭔가 조립하거나 만들거나 고치는 것', delta: { interest: { R: 10 }, aptitude: { 손재능: 30, 공간지각력: 10 }, values: {} } },
      { id: '2', text: '숫자·퍼즐·전략 게임처럼 논리가 필요한 것', delta: { interest: { I: 10 }, aptitude: { 수리논리력: 30, 자기관리능력: 10 }, values: {} } },
      { id: '3', text: '그림 그리기·영상 만들기·음악 활동', delta: { interest: { A: 10 }, aptitude: { 예술시각능력: 30, 창의력: 10 }, values: {} } },
      { id: '4', text: '글 쓰거나 스토리·시나리오 구상하기', delta: { interest: { A: 10 }, aptitude: { 언어능력: 30, 창의력: 10 }, values: {} } },
      { id: '5', text: '지도 보기·공간 배치·모형 설계하기', delta: { interest: { R: 10 }, aptitude: { 공간지각력: 30, 수리논리력: 10 }, values: {} } },
    ],
  },
  {
    context: '진로 관련 활동에서 "나 이거 잘하는 것 같다"고 느끼는 순간이 있다.',
    question: '어떤 상황에서 그런 자신감이 생겨?',
    choices: [
      { id: '1', text: '사람들 앞에서 발표하거나 설득할 때', delta: { interest: { E: 10 }, aptitude: { 언어능력: 30, 대인관계능력: 10 }, values: {} } },
      { id: '2', text: '복잡한 수식이나 코딩 문제를 풀 때', delta: { interest: { I: 10 }, aptitude: { 수리논리력: 30, 자기관리능력: 10 }, values: {} } },
      { id: '3', text: '아무도 생각 못 한 아이디어를 낼 때', delta: { interest: { A: 10 }, aptitude: { 창의력: 30, 언어능력: 10 }, values: {} } },
      { id: '4', text: '팀원 갈등을 중재하거나 분위기를 살릴 때', delta: { interest: { S: 10 }, aptitude: { 대인관계능력: 30, 언어능력: 10 }, values: {} } },
      { id: '5', text: '손을 써서 뭔가 정교하게 만들어낼 때', delta: { interest: { R: 10 }, aptitude: { 손재능: 30, 공간지각력: 10 }, values: {} } },
    ],
  },
]

const VALUES_QUESTIONS = [
  {
    context: '직업을 고르는 건 인생의 큰 선택이다. 무엇을 기준으로 할지 막막하지만 중요한 건 있다.',
    question: '직업을 선택할 때 나에게 가장 중요한 기준은?',
    choices: [
      { id: '1', text: '오래 안정적으로 다닐 수 있는가', delta: { interest: { C: 10 }, aptitude: {}, values: { 안정성: 30, 보수: 10 } } },
      { id: '2', text: '급여·보상이 충분한가', delta: { interest: { E: 10 }, aptitude: {}, values: { 보수: 30, 안정성: 10 } } },
      { id: '3', text: '내 능력을 최대한 발휘할 수 있는가', delta: { interest: { E: 10 }, aptitude: {}, values: { 능력발휘: 30, 자기계발: 10 } } },
      { id: '4', text: '사람들에게 도움이 되고 봉사할 수 있는가', delta: { interest: { S: 10 }, aptitude: {}, values: { 사회봉사: 30, 사회적인정: 10 } } },
      { id: '5', text: '내가 계속 성장하고 배울 수 있는가', delta: { interest: { I: 10 }, aptitude: {}, values: { 자기계발: 30, 능력발휘: 10 } } },
    ],
  },
  {
    context: '일하는 환경도 중요하다. 같은 직업이라도 분위기에 따라 다르게 느껴진다.',
    question: '어떤 일 환경이 나한테 제일 맞을 것 같아?',
    choices: [
      { id: '1', text: '내 방식대로 자유롭게 결정할 수 있는 환경', delta: { interest: { A: 10 }, aptitude: {}, values: { 자율성: 30, 창의성: 10 } } },
      { id: '2', text: '창의적인 아이디어가 환영받는 환경', delta: { interest: { A: 10 }, aptitude: {}, values: { 창의성: 30, 자율성: 10 } } },
      { id: '3', text: '내 성과를 주변에서 인정해주는 환경', delta: { interest: { E: 10 }, aptitude: {}, values: { 사회적인정: 30, 능력발휘: 10 } } },
      { id: '4', text: '규칙적이고 안정적으로 운영되는 환경', delta: { interest: { C: 10 }, aptitude: {}, values: { 안정성: 30, 보수: 10 } } },
      { id: '5', text: '급여와 복지가 확실히 보장되는 환경', delta: { interest: { C: 10 }, aptitude: {}, values: { 보수: 30, 안정성: 10 } } },
    ],
  },
  {
    context: '열심히 일하다 보면 "이래서 일하는 거구나" 싶은 순간이 있다.',
    question: '나는 어떤 순간에 가장 보람을 느낄 것 같아?',
    choices: [
      { id: '1', text: '내 아이디어가 실제로 구현되는 걸 볼 때', delta: { interest: { A: 10 }, aptitude: {}, values: { 창의성: 30, 능력발휘: 10 } } },
      { id: '2', text: '주변 사람들이 나를 인정하고 칭찬할 때', delta: { interest: { E: 10 }, aptitude: {}, values: { 사회적인정: 30, 능력발휘: 10 } } },
      { id: '3', text: '어려운 사람에게 실질적 도움이 됐을 때', delta: { interest: { S: 10 }, aptitude: {}, values: { 사회봉사: 30, 사회적인정: 10 } } },
      { id: '4', text: '목표를 완벽하게 달성하고 뿌듯할 때', delta: { interest: { E: 10 }, aptitude: {}, values: { 능력발휘: 30, 자기계발: 10 } } },
      { id: '5', text: '이 경험이 나를 성장시켰다고 느낄 때', delta: { interest: { I: 10 }, aptitude: {}, values: { 자기계발: 30, 능력발휘: 10 } } },
    ],
  },
  {
    context: '10년 후 내 직업 생활을 상상해봤을 때 원하는 모습이 있다.',
    question: '가장 바라는 미래 직업 생활의 모습은?',
    choices: [
      { id: '1', text: '전문가로 인정받으며 영향력 있게 일하는 모습', delta: { interest: { E: 10 }, aptitude: {}, values: { 사회적인정: 30, 능력발휘: 10 } } },
      { id: '2', text: '좋아하는 분야에서 창의적으로 만들어가는 모습', delta: { interest: { A: 10 }, aptitude: {}, values: { 창의성: 30, 자율성: 10 } } },
      { id: '3', text: '꾸준히 공부하며 전문성을 쌓아가는 모습', delta: { interest: { I: 10 }, aptitude: {}, values: { 자기계발: 30, 능력발휘: 10 } } },
      { id: '4', text: '사람들을 돕고 사회에 기여하는 모습', delta: { interest: { S: 10 }, aptitude: {}, values: { 사회봉사: 30, 사회적인정: 10 } } },
      { id: '5', text: '안정적이고 여유 있는 생활을 유지하는 모습', delta: { interest: { C: 10 }, aptitude: {}, values: { 안정성: 30, 보수: 10 } } },
    ],
  },
]

const INIT_SCORES = {
  interest: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
  aptitude: { 언어능력: 0, 수리논리력: 0, 창의력: 0, 대인관계능력: 0, 자기관리능력: 0, 공간지각력: 0, 손재능: 0, 예술시각능력: 0 },
  values: { 능력발휘: 0, 자율성: 0, 보수: 0, 안정성: 0, 사회적인정: 0, 사회봉사: 0, 자기계발: 0, 창의성: 0 },
}

function addDelta(acc, delta) {
  const result = { ...acc }
  for (const [k, v] of Object.entries(delta)) result[k] = (result[k] || 0) + v
  return result
}

function normalizeGroup(obj) {
  const max = Math.max(...Object.values(obj), 1)
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, Math.round((v / max) * 100)]))
}

const TOTAL_Q = 12 // 테마 4 + 적성 4 + 가치관 4
const SECTION_THEMES = [null, APTITUDE_THEME, VALUES_THEME]

export default function SituationTestPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('select') // 'select' | 'quiz'
  const [selectedThemeIdx, setSelectedThemeIdx] = useState(0)
  const [section, setSection] = useState(0) // 0=테마, 1=적성, 2=가치관
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [acc, setAcc] = useState(INIT_SCORES)

  function startQuiz(idx) {
    setSelectedThemeIdx(idx)
    setSection(0)
    setQIdx(0)
    setSelected(null)
    setAcc(INIT_SCORES)
    setPhase('quiz')
  }

  function backToSelect() {
    setPhase('select')
    setSection(0)
    setQIdx(0)
    setSelected(null)
    setAcc(INIT_SCORES)
  }

  // ── 테마 선택 화면 ───────────────────────────
  if (phase === 'select') {
    return (
      <div className="page">
        <div className="card">
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 20 }}
          >
            ← 뒤로
          </button>

          <div className="badge">상황 선택형 검사</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937', marginTop: 8, marginBottom: 6 }}>
            지금 나랑 제일 비슷한 게 뭐야?
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24, lineHeight: 1.65 }}>
            고른 주제로 딱 12문제만 풀면 끝. 솔직하게 선택할수록 정확해져.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {THEMES.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => startQuiz(idx)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 18px', borderRadius: 14, cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'inherit', border: `1.5px solid ${t.border}`,
                  background: t.bg, transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >
                <span style={{ fontSize: 32, flexShrink: 0 }}>{t.emoji}</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#1F2937', marginBottom: 3 }}>
                    {t.title}
                  </p>
                  <p style={{ fontSize: 12, color: '#6B7280' }}>{t.subtitle}</p>
                </div>
                <span style={{ marginLeft: 'auto', color: t.color, fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                  →
                </span>
              </button>
            ))}

            <button
              onClick={() => navigate('/image-input')}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 18px', borderRadius: 14, cursor: 'pointer',
                textAlign: 'left', fontFamily: 'inherit',
                border: '1.5px solid #E5E7EB',
                background: '#F9FAFB', transition: 'all 0.15s',
                marginTop: 4,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >
              <span style={{ fontSize: 32, flexShrink: 0 }}>✏️</span>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#1F2937', marginBottom: 3 }}>
                  직접 입력
                </p>
                <p style={{ fontSize: 12, color: '#6B7280' }}>검사 결과지 사진 업로드 또는 수치 직접 설정</p>
              </div>
              <span style={{ marginLeft: 'auto', color: '#6B7280', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                →
              </span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── 퀴즈 화면 ────────────────────────────────
  const sectionQuestions = section === 0
    ? THEMES[selectedThemeIdx].questions
    : section === 1
      ? APTITUDE_QUESTIONS
      : VALUES_QUESTIONS

  const theme = section === 0 ? THEMES[selectedThemeIdx] : SECTION_THEMES[section]
  const questions = sectionQuestions
  const q = questions[qIdx]
  const currentOverall = section * 4 + qIdx
  const isLastQ = qIdx === questions.length - 1
  const isLastSection = section === 2
  const isVeryLast = isLastQ && isLastSection

  function handleNext() {
    if (!selected) return
    const newAcc = {
      interest: addDelta(acc.interest, selected.delta.interest),
      aptitude: addDelta(acc.aptitude, selected.delta.aptitude),
      values: addDelta(acc.values, selected.delta.values),
    }

    if (!isLastQ) {
      setAcc(newAcc)
      setQIdx(qIdx + 1)
      setSelected(null)
    } else if (!isLastSection) {
      setAcc(newAcc)
      setSection(section + 1)
      setQIdx(0)
      setSelected(null)
    } else {
      navigate('/result', {
        state: {
          inputMode: 'situation',
          scores: {
            interest: newAcc.interest,
            aptitude: normalizeGroup(newAcc.aptitude),
            values: normalizeGroup(newAcc.values),
          },
        },
      })
    }
  }

  return (
    <div className="page">
      <div className="card">

        {/* 전체 진행 바 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <button
            onClick={backToSelect}
            style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', padding: 0, flexShrink: 0 }}
          >
            ←
          </button>
          <div style={{ flex: 1, height: 5, borderRadius: 4, background: '#E5E7EB', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${((currentOverall + 1) / TOTAL_Q) * 100}%`,
              background: theme.color,
              borderRadius: 4,
              transition: 'width 0.3s',
            }} />
          </div>
          <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {currentOverall + 1}/{TOTAL_Q}
          </span>
        </div>

        {/* 테마 태그 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 20 }}>{theme.emoji}</span>
          <span style={{
            fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
            background: theme.bg, color: theme.color, border: `1px solid ${theme.border}`,
          }}>
            {theme.title}
          </span>
        </div>

        {/* 상황 */}
        <div style={{
          background: '#F9FAFB', borderRadius: 12, padding: '13px 15px',
          marginBottom: 16, borderLeft: `3px solid ${theme.color}`,
        }}>
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65 }}>
            {q.context}
          </p>
        </div>

        {/* 질문 */}
        <p style={{ fontSize: 16, fontWeight: 800, color: '#1F2937', marginBottom: 14 }}>
          {q.question}
        </p>

        {/* 선택지 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {q.choices.map(choice => {
            const on = selected?.id === choice.id
            return (
              <button
                key={choice.id}
                onClick={() => setSelected(choice)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 14px', borderRadius: 12, cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'inherit', fontSize: 13,
                  lineHeight: 1.5,
                  fontWeight: on ? 700 : 500,
                  color: on ? theme.color : '#374151',
                  background: on ? theme.bg : '#F9FAFB',
                  border: `1.5px solid ${on ? theme.color : '#E5E7EB'}`,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800,
                  background: on ? theme.color : 'white',
                  color: on ? 'white' : '#9CA3AF',
                  border: `1.5px solid ${on ? theme.color : '#E5E7EB'}`,
                }}>
                  {choice.id}
                </span>
                <span>{choice.text}</span>
              </button>
            )
          })}
        </div>

        {/* 다음 버튼 */}
        <button
          onClick={handleNext}
          disabled={!selected}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
            background: selected ? theme.color : '#E5E7EB',
            color: selected ? 'white' : '#9CA3AF',
            fontWeight: 700, fontSize: 15,
            cursor: selected ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit', transition: 'all 0.2s',
          }}
        >
          {isVeryLast ? '결과 보기 →' : '다음 →'}
        </button>
      </div>
    </div>
  )
}
