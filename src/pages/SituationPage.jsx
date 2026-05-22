import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SITUATIONS = [
  {
    id: 1,
    context: '학교 축제 준비 중, 팀에서 역할을 분담할 때',
    question: '나는 어떤 역할을 선택할까?',
    choices: [
      { id: 'A', text: '팀장을 자처해 전체 일정과 방향을 이끈다', type: 'L' },
      { id: 'B', text: '예산과 일정을 꼼꼼히 계획하고 정리한다', type: 'R' },
      { id: 'C', text: '공연·전시 아이디어를 직접 기획하고 만든다', type: 'C' },
      { id: 'D', text: '팀원 사이에서 의견을 모으고 갈등을 조율한다', type: 'S' },
    ],
  },
  {
    id: 2,
    context: "수업 시간, 선생님이 '자유 주제 발표'를 요청했을 때",
    question: '나는 어떤 주제를 선택할까?',
    choices: [
      { id: 'A', text: '잘 알려지지 않은 사회 문제를 조사해 발표한다', type: 'S' },
      { id: 'B', text: '과학 원리나 데이터 분석 결과를 발표한다', type: 'R' },
      { id: 'C', text: '영상·그림을 활용한 창의적인 발표를 만든다', type: 'C' },
      { id: 'D', text: '직접 기획한 아이디어 프로젝트를 발표한다', type: 'L' },
    ],
  },
  {
    id: 3,
    context: '방과 후, 갑자기 자유 시간이 생겼을 때',
    question: '나는 무엇을 할까?',
    choices: [
      { id: 'A', text: '친구들을 모아 함께 할 것을 먼저 제안한다', type: 'L' },
      { id: 'B', text: '혼자 관심 분야를 조사하거나 공부한다', type: 'R' },
      { id: 'C', text: '음악, 그림, 글쓰기 같은 창작 활동을 한다', type: 'C' },
      { id: 'D', text: '친구 고민을 들어주거나 누군가를 돕는다', type: 'S' },
    ],
  },
]

export default function SituationPage() {
  const navigate = useNavigate()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selected, setSelected] = useState(null)

  const situation = SITUATIONS[currentIdx]
  const progress = (currentIdx / SITUATIONS.length) * 100

  function handleNext() {
    if (!selected) return
    const newAnswers = [...answers, { situationId: situation.id, choice: selected }]
    if (currentIdx < SITUATIONS.length - 1) {
      setAnswers(newAnswers)
      setCurrentIdx(currentIdx + 1)
      setSelected(null)
    } else {
      navigate('/reason', { state: { answers: newAnswers } })
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
          padding: '14px 18px',
          marginBottom: 16,
          borderLeft: '3px solid #8B5CF6',
        }}>
          <p style={{ fontSize: 11, color: '#8B5CF6', fontWeight: 700, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }}>
            상황
          </p>
          <p style={{ fontSize: 14, color: '#1F2937', fontWeight: 500, lineHeight: 1.5 }}>
            {situation.context}
          </p>
        </div>

        <p style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 18 }}>
          {situation.question}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
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
