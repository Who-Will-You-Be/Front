import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function ReasonPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [reason, setReason] = useState('')

  function handleSubmit() {
    navigate('/result', { state: { ...state, reason } })
  }

  return (
    <div className="page">
      <div className="card">
        <div className="badge">선택 이유 입력</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10, color: '#1F2937' }}>
          왜 그렇게 선택했나요?
        </h2>
        <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.75, marginBottom: 24 }}>
          각 상황에서 그런 선택을 한 이유를 자유롭게 적어주세요.<br />
          솔직하게 쓸수록 더 정확한 분석에 도움이 됩니다.
        </p>

        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="예) 저는 새로운 아이디어를 내는 것이 좋아서 창의적인 선택을 주로 했어요. 사람들이 제 아이디어에 반응할 때 뿌듯함을 느낍니다..."
        />

        <p style={{
          textAlign: 'right',
          marginTop: 6,
          marginBottom: 20,
          fontSize: 12,
          color: reason.trim().length < 10 ? '#EF4444' : '#10B981',
        }}>
          {reason.trim().length}자 {reason.trim().length < 10 ? '(최소 10자 필요)' : '✓'}
        </p>

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={reason.trim().length < 10}
        >
          분석 결과 보기 →
        </button>
      </div>
    </div>
  )
}
