import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const MAX_IMAGES = 3

const PROMPT = `이 이미지(들)는 진로·직업 검사 결과지입니다. 이미지에서 점수를 읽어 아래 JSON 형식으로만 응답하세요. 점수를 읽을 수 없는 항목은 50으로 채우세요. JSON 외에 다른 설명은 절대 출력하지 마세요.

{
  "interest": { "R": 숫자, "I": 숫자, "A": 숫자, "S": 숫자, "E": 숫자, "C": 숫자 },
  "aptitude": { "언어능력": 숫자, "수리논리력": 숫자, "창의력": 숫자, "대인관계능력": 숫자, "자기관리능력": 숫자, "공간지각력": 숫자, "손재능": 숫자, "예술시각능력": 숫자 },
  "values": { "능력발휘": 숫자, "자율성": 숫자, "보수": 숫자, "안정성": 숫자, "사회적인정": 숫자, "사회봉사": 숫자, "자기계발": 숫자, "창의성": 숫자 }
}

모든 숫자는 0~100 사이 정수입니다.`

function parseScores(text) {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('JSON 없음')
  return JSON.parse(match[0])
}

function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })
}

const RIASEC_LABEL = { R: '현실형', I: '탐구형', A: '예술형', S: '사회형', E: '기업형', C: '관습형' }
const RIASEC_COLOR = { R: '#F59E0B', I: '#3B82F6', A: '#EC4899', S: '#10B981', E: '#8B5CF6', C: '#6366F1' }

export default function ImageInputPage() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null) // 분석 완료 시 scores 저장

  async function handleFiles(files) {
    const remaining = MAX_IMAGES - images.length
    const selected = Array.from(files).slice(0, remaining)
    const newImages = await Promise.all(
      selected.map(async (file) => {
        const dataUrl = await fileToBase64(file)
        return { preview: dataUrl, base64: dataUrl.split(',')[1] }
      })
    )
    setImages(prev => [...prev, ...newImages])
    setError('')
  }

  function removeImage(idx) {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleAnalyze() {
    if (images.length === 0) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ollama/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          prompt: PROMPT,
          images: images.map(img => img.base64),
          stream: false,
        }),
      })
      if (!res.ok) throw new Error('서버 오류')
      const data = await res.json()
      const scores = parseScores(data.response)
      setResult(scores)
    } catch {
      setError('분석에 실패했습니다. 이미지를 확인하고 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  // 분석 완료 화면
  if (result) {
    const topInterest = Object.entries(result.interest)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
    const topAptitude = Object.entries(result.aptitude)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
    const topValues = Object.entries(result.values)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    return (
      <div className="page">
        <div className="card">
          {/* 완료 헤더 */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div className="badge" style={{ display: 'inline-block', background: '#D1FAE5', color: '#059669', border: '1px solid #A7F3D0' }}>
              분석 완료
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937', marginTop: 10, marginBottom: 4 }}>
              결과지 분석이 끝났습니다
            </h2>
            <p style={{ fontSize: 13, color: '#6B7280' }}>
              아래에서 추출된 점수를 확인하고 결과 페이지로 이동하세요.
            </p>
          </div>

          {/* 분석된 이미지 썸네일 */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img.preview}
                alt={`결과지 ${idx + 1}`}
                style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', border: '2px solid #A7F3D0' }}
              />
            ))}
          </div>

          {/* 추출된 점수 요약 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {/* 흥미 */}
            <div style={{ background: '#EEF2FF', borderRadius: 12, padding: '12px 14px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#6366F1', marginBottom: 8 }}>흥미 유형 (상위 3)</p>
              <div style={{ display: 'flex', gap: 6 }}>
                {topInterest.map(([code, val]) => (
                  <div key={code} style={{
                    flex: 1, textAlign: 'center', background: 'white',
                    borderRadius: 8, padding: '8px 4px',
                    border: `1.5px solid ${RIASEC_COLOR[code]}40`,
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: RIASEC_COLOR[code] }}>{code}</p>
                    <p style={{ fontSize: 10, color: '#6B7280', marginBottom: 2 }}>{RIASEC_LABEL[code]}</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 적성 */}
            <div style={{ background: '#F5F3FF', borderRadius: 12, padding: '12px 14px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#8B5CF6', marginBottom: 8 }}>적성 (상위 3)</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {topAptitude.map(([k, v]) => (
                  <span key={k} style={{
                    fontSize: 12, padding: '4px 10px', borderRadius: 100,
                    background: 'white', color: '#7C3AED', fontWeight: 600,
                    border: '1px solid #DDD6FE',
                  }}>
                    {k} <strong>{v}</strong>
                  </span>
                ))}
              </div>
            </div>

            {/* 가치관 */}
            <div style={{ background: '#ECFDF5', borderRadius: 12, padding: '12px 14px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#059669', marginBottom: 8 }}>가치관 (상위 3)</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {topValues.map(([k, v]) => (
                  <span key={k} style={{
                    fontSize: 12, padding: '4px 10px', borderRadius: 100,
                    background: 'white', color: '#059669', fontWeight: 600,
                    border: '1px solid #A7F3D0',
                  }}>
                    {k} <strong>{v}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={() => navigate('/result', { state: { inputMode: 'image', scores: result } })}
          >
            전체 분석 결과 보기 →
          </button>

          <button
            onClick={() => { setResult(null); setImages([]) }}
            style={{
              width: '100%', marginTop: 10, padding: '12px 0',
              background: 'none', border: '1.5px solid #E5E7EB',
              borderRadius: 10, color: '#9CA3AF', fontWeight: 600,
              fontSize: 14, cursor: 'pointer',
            }}
          >
            다시 분석하기
          </button>
        </div>
      </div>
    )
  }

  // 업로드 화면
  return (
    <div className="page">
      <div className="card">
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 18 }}
        >
          ← 뒤로
        </button>

        <div className="badge">이미지 분석</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937', marginBottom: 8 }}>
          검사 결과지 업로드
        </h2>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24, lineHeight: 1.65 }}>
          커리어넷 등 진로검사 결과지를 사진으로 찍어 올리면<br />
          AI가 점수를 자동으로 읽어 분석합니다. <strong style={{ color: '#7C3AED' }}>최대 3장</strong>까지 업로드할 수 있습니다.
        </p>

        {images.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {images.map((img, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                border: '1.5px solid #DDD6FE', borderRadius: 12, padding: '10px 14px',
                background: '#FAFAFF',
              }}>
                <img
                  src={img.preview}
                  alt={`이미지 ${idx + 1}`}
                  style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                />
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 600, flex: 1 }}>
                  결과지 {idx + 1}페이지
                </span>
                {!loading && (
                  <button
                    onClick={() => removeImage(idx)}
                    style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 18, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {images.length < MAX_IMAGES && (
          <div
            onClick={() => inputRef.current?.click()}
            style={{
              border: '2px dashed #DDD6FE', borderRadius: 14,
              padding: '24px 20px', textAlign: 'center',
              cursor: 'pointer', background: '#FAFAFF', marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
            <p style={{ fontSize: 14, color: '#7C3AED', fontWeight: 700, marginBottom: 4 }}>
              {images.length === 0 ? '클릭해서 이미지 선택' : `+ 이미지 추가 (${images.length}/${MAX_IMAGES})`}
            </p>
            <p style={{ fontSize: 12, color: '#9CA3AF' }}>JPG · PNG · WEBP 지원</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />

        {error && (
          <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 14 }}>{error}</p>
        )}

        <button
          className="btn-primary"
          onClick={handleAnalyze}
          disabled={images.length === 0 || loading}
          style={{ opacity: images.length === 0 ? 0.5 : 1 }}
        >
          {loading ? 'AI 분석 중...' : `AI 분석 시작 (${images.length}장) →`}
        </button>

        {loading && (
          <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 12 }}>
            이미지를 분석하고 있습니다. 15~30초 소요됩니다.
          </p>
        )}
      </div>
    </div>
  )
}
