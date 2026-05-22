import { useNavigate } from 'react-router-dom'

const modeCard = {
  border: '1.5px solid #E5E7EB',
  borderRadius: 16,
  padding: '22px 20px',
  background: '#FAFAFA',
}

export default function InputModePage() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="card">
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 18 }}
        >
          ← 뒤로
        </button>
        <div className="badge">입력 방식 선택</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937', marginBottom: 8 }}>
          어떻게 시작할까요?
        </h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28, lineHeight: 1.65 }}>
          이미 검사 결과가 있다면 직접 입력하고,<br />
          없다면 상황 검사를 통해 파악할 수 있어요.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={modeCard}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>📋</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 8 }}>
              검사 결과 직접 입력
            </h3>
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65, marginBottom: 16 }}>
              이미 커리어넷 또는 다른 진로검사 결과를 알고 있다면 직접 입력합니다.
            </p>
            <button className="btn-primary" onClick={() => navigate('/direct-input')}>
              직접 입력하기
            </button>
          </div>

          <div style={modeCard}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>🎭</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 8 }}>
              상황 선택형 검사
            </h3>
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65, marginBottom: 16 }}>
              아직 검사 결과를 모르거나 자기이해가 부족하다면 학교생활 상황을 통해 알아봅니다.
            </p>
            <button
              className="btn-primary"
              style={{ background: '#8B5CF6' }}
              onClick={() => navigate('/situation-test')}
            >
              상황 검사 시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
