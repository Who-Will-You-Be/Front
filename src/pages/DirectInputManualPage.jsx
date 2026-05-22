import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const INTEREST_ITEMS = [
  { key: 'R', label: 'R 현실형', desc: '도구·기계를 다루고 직접 만드는 활동' },
  { key: 'I', label: 'I 탐구형', desc: '과학적 분석·연구·탐구 활동' },
  { key: 'A', label: 'A 예술형', desc: '창의적 표현·음악·미술·글쓰기' },
  { key: 'S', label: 'S 사회형', desc: '사람을 돕고 가르치고 상담하는 활동' },
  { key: 'E', label: 'E 기업형', desc: '이끌고 설득하고 기획·경영하는 활동' },
  { key: 'C', label: 'C 관습형', desc: '정확하고 체계적인 데이터·사무 처리' },
]
const APTITUDE_ITEMS = [
  '언어능력', '수리논리력', '창의력', '대인관계능력',
  '자기관리능력', '공간지각력', '손재능', '예술시각능력',
]
const VALUES_ITEMS = [
<<<<<<< HEAD
  '능력발휘', '자율성', '보수', '안정성',
  '사회적인정', '사회봉사', '자기계발', '창의성',
=======
  '안정성', '보수', '일과삶의균형', '즐거움',
  '자기계발', '도전성', '사회적기여', '자율성', '성취',
>>>>>>> c42df025a017331aba6fe69b38a2f6c37c23c874
]

const sectionTitle = {
  fontSize: 15, fontWeight: 700, color: '#1F2937',
  marginBottom: 18, paddingBottom: 12, borderBottom: '1.5px solid #F3F4F6',
}

function ScoreSlider({ label, desc, value, onChange }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{label}</span>
          {desc && <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 7 }}>{desc}</span>}
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#6366F1', minWidth: 28, textAlign: 'right' }}>
          {value}
        </span>
      </div>
      <input
        type="range" min={0} max={100} value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  )
}

export default function DirectInputManualPage() {
  const navigate = useNavigate()

  const [interest, setInterest] = useState(
    Object.fromEntries(['R','I','A','S','E','C'].map(k => [k, 50]))
  )
  const [aptitude, setAptitude] = useState(
    Object.fromEntries(APTITUDE_ITEMS.map(k => [k, 50]))
  )
  const [values, setValues] = useState(
    Object.fromEntries(VALUES_ITEMS.map(k => [k, 50]))
  )

  function handleSubmit() {
    navigate('/result', {
      state: { inputMode: 'direct', scores: { interest, aptitude, values } },
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF', padding: '32px 16px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        <div className="card" style={{ marginBottom: 14 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 18 }}
          >
            ← 뒤로
          </button>
          <div className="badge">수치 직접 조정</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937', marginBottom: 8 }}>
            점수를 조정해주세요
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>
            커리어넷 검사 결과를 참고해 슬라이더로 조절하세요.<br />
            잘 모르겠다면 직관적으로 느끼는 수준을 입력해도 됩니다.
          </p>
        </div>

        <div className="card" style={{ marginBottom: 14 }}>
          <h3 style={sectionTitle}>
            📌 흥미
            <span style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', marginLeft: 6 }}>Holland RIASEC</span>
          </h3>
          {INTEREST_ITEMS.map(item => (
            <ScoreSlider
              key={item.key}
              label={item.label}
              desc={item.desc}
              value={interest[item.key]}
              onChange={v => setInterest(p => ({ ...p, [item.key]: v }))}
            />
          ))}
        </div>

        <div className="card" style={{ marginBottom: 14 }}>
          <h3 style={sectionTitle}>🎯 적성</h3>
          {APTITUDE_ITEMS.map(key => (
            <ScoreSlider
              key={key}
              label={key}
              value={aptitude[key]}
              onChange={v => setAptitude(p => ({ ...p, [key]: v }))}
            />
          ))}
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={sectionTitle}>💎 가치관</h3>
          {VALUES_ITEMS.map(key => (
            <ScoreSlider
              key={key}
              label={key}
              value={values[key]}
              onChange={v => setValues(p => ({ ...p, [key]: v }))}
            />
          ))}
        </div>

        <button className="btn-primary" onClick={handleSubmit} style={{ marginBottom: 40 }}>
          분석 결과 보기 →
        </button>
      </div>
    </div>
  )
}
