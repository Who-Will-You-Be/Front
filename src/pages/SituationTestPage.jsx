import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SITUATIONS = [
  {
    id: 1,
    context: '학교 축제 준비 중, 팀에서 역할을 분담할 때',
    question: '나는 어떤 역할을 선택할까?',
    choices: [
      {
        id: 'A', text: '팀장을 자처해 전체 일정과 방향을 이끈다',
        delta: { interest: { E: 25 }, aptitude: { 대인관계능력: 20, 자기관리능력: 10 }, values: { 성취: 20, 도전성: 10 } },
      },
      {
        id: 'B', text: '예산과 일정을 꼼꼼히 계획하고 정리한다',
        delta: { interest: { C: 25 }, aptitude: { 수리논리력: 20, 자기관리능력: 10 }, values: { 안정성: 20, 자기계발: 10 } },
      },
      {
        id: 'C', text: '공연·전시 아이디어를 직접 기획하고 만든다',
        delta: { interest: { A: 25 }, aptitude: { 창의력: 20, 예술시각능력: 10 }, values: { 즐거움: 20, 자율성: 10 } },
      },
      {
        id: 'D', text: '팀원 사이에서 의견을 모으고 갈등을 조율한다',
        delta: { interest: { S: 25 }, aptitude: { 대인관계능력: 20, 언어능력: 10 }, values: { 사회적기여: 20, 일과삶의균형: 10 } },
      },
    ],
  },
  {
    id: 2,
    context: "수업 시간, 선생님이 '자유 주제 발표'를 요청했을 때",
    question: '나는 어떤 주제를 선택할까?',
    choices: [
      {
        id: 'A', text: '잘 알려지지 않은 사회 문제를 조사해 발표한다',
        delta: { interest: { S: 25 }, aptitude: { 언어능력: 20, 대인관계능력: 10 }, values: { 사회적기여: 20, 자기계발: 10 } },
      },
      {
        id: 'B', text: '과학 원리나 데이터 분석 결과를 발표한다',
        delta: { interest: { I: 25 }, aptitude: { 수리논리력: 20, 자기관리능력: 10 }, values: { 자기계발: 20, 성취: 10 } },
      },
      {
        id: 'C', text: '영상·그림을 활용한 창의적인 발표를 만든다',
        delta: { interest: { A: 25 }, aptitude: { 예술시각능력: 20, 창의력: 10 }, values: { 즐거움: 20, 자율성: 10 } },
      },
      {
        id: 'D', text: '직접 기획한 아이디어 프로젝트를 발표한다',
        delta: { interest: { E: 25 }, aptitude: { 창의력: 20, 언어능력: 10 }, values: { 도전성: 20, 성취: 10 } },
      },
    ],
  },
  {
    id: 3,
    context: '방과 후, 갑자기 자유 시간이 생겼을 때',
    question: '나는 무엇을 할까?',
    choices: [
      {
        id: 'A', text: '친구들을 모아 함께 할 것을 먼저 제안한다',
        delta: { interest: { E: 25 }, aptitude: { 대인관계능력: 20, 언어능력: 10 }, values: { 즐거움: 20, 자율성: 10 } },
      },
      {
        id: 'B', text: '혼자 관심 분야를 조사하거나 공부한다',
        delta: { interest: { I: 25 }, aptitude: { 자기관리능력: 20, 수리논리력: 10 }, values: { 자기계발: 20, 성취: 10 } },
      },
      {
        id: 'C', text: '음악, 그림, 글쓰기 같은 창작 활동을 한다',
        delta: { interest: { A: 25 }, aptitude: { 창의력: 20, 예술시각능력: 10 }, values: { 즐거움: 20, 자율성: 10 } },
      },
      {
        id: 'D', text: '친구 고민을 들어주거나 누군가를 돕는다',
        delta: { interest: { S: 25 }, aptitude: { 대인관계능력: 20, 언어능력: 10 }, values: { 사회적기여: 20, 일과삶의균형: 10 } },
      },
    ],
  },
  {
    id: 4,
    context: '진로 체험 학습 날, 체험 분야를 선택할 때',
    question: '나는 어떤 체험을 선택할까?',
    choices: [
      {
        id: 'A', text: '기계·제작 실습 체험을 한다',
        delta: { interest: { R: 25 }, aptitude: { 손재능: 20, 공간지각력: 10 }, values: { 성취: 20, 즐거움: 10 } },
      },
      {
        id: 'B', text: '과학 연구소 또는 데이터 분석 체험을 한다',
        delta: { interest: { I: 25 }, aptitude: { 수리논리력: 20, 자기관리능력: 10 }, values: { 자기계발: 20, 성취: 10 } },
      },
      {
        id: 'C', text: '디자인·예술 창작 체험을 한다',
        delta: { interest: { A: 25 }, aptitude: { 예술시각능력: 20, 창의력: 10 }, values: { 즐거움: 20, 자율성: 10 } },
      },
      {
        id: 'D', text: '기업 행정·정보 처리 업무를 체험한다',
        delta: { interest: { C: 25 }, aptitude: { 자기관리능력: 20, 수리논리력: 10 }, values: { 안정성: 20, 자기계발: 10 } },
      },
    ],
  },
]

const INIT_SCORES = {
  interest: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
  aptitude: { 언어능력: 0, 수리논리력: 0, 창의력: 0, 대인관계능력: 0, 자기관리능력: 0, 공간지각력: 0, 손재능: 0, 예술시각능력: 0 },
  values: { 안정성: 0, 보수: 0, 일과삶의균형: 0, 즐거움: 0, 자기계발: 0, 도전성: 0, 사회적기여: 0, 자율성: 0, 성취: 0 },
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

export default function SituationTestPage() {
  const navigate = useNavigate()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [acc, setAcc] = useState(INIT_SCORES)

  const situation = SITUATIONS[currentIdx]
  const progress = (currentIdx / SITUATIONS.length) * 100

  function handleNext() {
    if (!selected) return
    const newAcc = {
      interest: addDelta(acc.interest, selected.delta.interest),
      aptitude: addDelta(acc.aptitude, selected.delta.aptitude),
      values: addDelta(acc.values, selected.delta.values),
    }

    if (currentIdx < SITUATIONS.length - 1) {
      setAcc(newAcc)
      setCurrentIdx(currentIdx + 1)
      setSelected(null)
    } else {
      navigate('/reason', {
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
            상황 {currentIdx + 1} / {SITUATIONS.length}
          </span>
          <span className="badge" style={{ margin: 0 }}>상황 선택형 검사</span>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div style={{
          background: '#F5F3FF',
          borderRadius: 12,
          padding: '13px 16px',
          marginBottom: 16,
          borderLeft: '3px solid #8B5CF6',
        }}>
          <p style={{ fontSize: 10, color: '#8B5CF6', fontWeight: 700, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1.2 }}>
            상황
          </p>
          <p style={{ fontSize: 14, color: '#1F2937', fontWeight: 500, lineHeight: 1.55 }}>
            {situation.context}
          </p>
        </div>

        <p style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 16 }}>
          {situation.question}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 26 }}>
          {situation.choices.map(choice => (
            <button
              key={choice.id}
              className={`choice-btn${selected?.id === choice.id ? ' selected' : ''}`}
              onClick={() => setSelected(choice)}
            >
              <span className="choice-label">{choice.id}</span>
              <span className="choice-text">{choice.text}</span>
            </button>
          ))}
        </div>

        <button className="btn-primary" onClick={handleNext} disabled={!selected}>
          {currentIdx < SITUATIONS.length - 1 ? '다음 상황 →' : '이유 입력하기 →'}
        </button>
      </div>
    </div>
  )
}
