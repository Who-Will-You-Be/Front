import { useNavigate } from 'react-router-dom'

const modeCard = {
  border: '1.5px solid #E5E7EB',
  borderRadius: 16,
  padding: '22px 20px',
  background: '#FAFAFA',
}

export default function DirectInputPage() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="card">
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 18 }}
        >
          ← 뒤로
        </button>

        <div className="badge">검사 결과 직접 입력</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937', marginBottom: 8 }}>
          어떻게 입력할까요?
        </h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28, lineHeight: 1.65 }}>
          이미 검사 결과가 있다면 직접 수치를 조정하거나,<br />
          결과지 사진을 올려 AI가 자동으로 읽게 할 수 있어요.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 수치 직접 조정 */}
          <div style={modeCard}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>🎚</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 8 }}>
              수치 직접 조정
            </h3>
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65, marginBottom: 16 }}>
              슬라이더로 흥미·적성·가치관 점수를 직접 조정합니다.
              검사 결과지를 보면서 항목별로 입력하세요.
            </p>
            <button className="btn-primary" onClick={() => navigate('/direct-input-manual')}>
              수치 입력하기
            </button>
          </div>

          {/* 이미지 업로드 분석 */}
          <div style={modeCard}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>📸</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 8 }}>
              이미지 업로드 분석
            </h3>
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65, marginBottom: 16 }}>
              검사 결과지 사진을 올리면 AI가 자동으로 점수를 읽어
              분석 결과를 바로 제공합니다.
            </p>
            <button
              className="btn-primary"
              style={{ background: '#7C3AED' }}
              onClick={() => navigate('/image-input')}
            >
              이미지 업로드
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
