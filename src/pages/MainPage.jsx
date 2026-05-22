import { useNavigate } from 'react-router-dom'
import { isLoggedIn } from '../auth'

export default function MainPage() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="badge">공공데이터 분석 대회 프로토타입</div>
        <div style={{ fontSize: 52, marginBottom: 18 }}>🧭</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.4, marginBottom: 16, color: '#1F2937' }}>
          AI 자기이해 기반 진로탐색
        </h1>
        <p style={{ color: '#6B7280', lineHeight: 1.9, marginBottom: 36, fontSize: 15 }}>
          학교생활 속 선택과 이유를 바탕으로<br />
          나의 흥미·적성·가치관을 분석하고<br />
          탐색해볼 만한 진로 방향을 제안합니다.
        </p>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
          {['Holland RIASEC 흥미', '8가지 적성', '9가지 가치관'].map(label => (
            <span key={label} style={{
              background: '#F5F3FF',
              color: '#7C3AED',
              padding: '6px 13px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              border: '1px solid #DDD6FE',
            }}>
              {label}
            </span>
          ))}
        </div>

        <button className="btn-primary" onClick={() => navigate(isLoggedIn() ? '/input-mode' : '/login')}>
          진로 탐색 시작하기
        </button>
      </div>
    </div>
  )
}
