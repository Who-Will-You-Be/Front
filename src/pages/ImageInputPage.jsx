<<<<<<< HEAD
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
=======
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const INTEREST_KEYS = ['R', 'I', 'A', 'S', 'E', 'C']
const INTEREST_LABELS = { R: '현실형', I: '탐구형', A: '예술형', S: '사회형', E: '기업형', C: '관습형' }
const APTITUDE_ITEMS = [
  '언어능력', '수리논리력', '창의력', '대인관계능력',
  '자기관리능력', '공간지각력', '손재능', '예술시각능력',
]
const VALUES_ITEMS = [
  '안정성', '보수', '일과삶의균형', '즐거움',
  '자기계발', '도전성', '사회적기여', '자율성', '성취',
]

const OLLAMA_MODEL = 'llama3.2-vision:latest'
const MAX_IMAGES = 3

const ANALYSIS_PROMPT = `This image is a student's career/vocational test result sheet.
Read the actual scores shown in the image and convert them to a 0-100 range.
If a score cannot be found, set it to 50.
Reply with ONLY the following JSON and nothing else:

{
  "interest":  {"R":0,"I":0,"A":0,"S":0,"E":0,"C":0},
  "aptitude":  {"언어능력":0,"수리논리력":0,"창의력":0,"대인관계능력":0,"자기관리능력":0,"공간지각력":0,"손재능":0,"예술시각능력":0},
  "values":    {"안정성":0,"보수":0,"일과삶의균형":0,"즐거움":0,"자기계발":0,"도전성":0,"사회적기여":0,"자율성":0,"성취":0}
}`

const LOADING_STEPS = [
  '이미지 전처리 중...',
  '흥미 유형(RIASEC) 파악 중...',
  '적성 점수 추출 중...',
  '가치관 점수 추출 중...',
  '점수 정규화 중...',
]

// 이미지를 최대 800px로 리사이즈 후 JPEG 압축 → 전송 속도 개선
async function resizeImage(dataUrl, maxDim = 800) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.src = dataUrl
  })
}

async function analyzeImage(dataUrl) {
  const resized = await resizeImage(dataUrl)
  const base64 = resized.split(',')[1]

  const res = await fetch('/api/ollama/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: ANALYSIS_PROMPT,
      images: [base64],
      stream: false,
      options: { temperature: 0, num_predict: 300, num_ctx: 2048 },
    }),
  })

  if (!res.ok) throw new Error(`Ollama 오류 (${res.status}) — 서버가 실행 중인지 확인하세요.`)
  const data = await res.json()

  const jsonMatch = data.response?.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('분석 결과를 파싱할 수 없습니다. 다시 시도해주세요.')
  return JSON.parse(jsonMatch[0])
}

function top3(obj) {
  return Object.entries(obj).sort(([, a], [, b]) => b - a).slice(0, 3)
}

function mergeScores(images) {
  const done = images.filter(img => img.status === 'done' && img.scores)
  if (done.length === 0) return null
  if (done.length === 1) return done[0].scores
  const result = { interest: {}, aptitude: {}, values: {} }
  for (const section of ['interest', 'aptitude', 'values']) {
    for (const key of Object.keys(done[0].scores[section])) {
      const avg = done.reduce((sum, img) => sum + img.scores[section][key], 0) / done.length
      result[section][key] = Math.round(avg)
    }
  }
  return result
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function ScoreSection({ title, color, keys, labels, section, scores, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 10, letterSpacing: 0.3 }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {keys.map(key => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#6B7280', width: 80, flexShrink: 0 }}>
              {labels ? `${key} ${labels[key]}` : key}
            </span>
            <input
              type="range"
              min={0} max={100}
              value={scores[section][key]}
              onChange={e => onChange(section, key, Number(e.target.value))}
              style={{ flex: 1, accentColor: color }}
            />
            <span style={{
              fontSize: 13, fontWeight: 700, color,
              width: 32, textAlign: 'right', flexShrink: 0,
            }}>
              {scores[section][key]}
            </span>
          </div>
        ))}
>>>>>>> c42df025a017331aba6fe69b38a2f6c37c23c874
      </div>
    </div>
  )
}
<<<<<<< HEAD
=======

export default function ImageInputPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const idCounter = useRef(0)
  const timers = useRef({})

  const [images, setImages] = useState([])
  const [showEdit, setShowEdit] = useState(false)
  const [editedScores, setEditedScores] = useState(null)

  function addFiles(fileList) {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'))
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        setImages(prev => {
          if (prev.length >= MAX_IMAGES) return prev
          return [...prev, {
            id: idCounter.current++,
            dataUrl: e.target.result,
            status: 'idle',
            scores: null,
            errorMsg: '',
            loadStep: 0,
          }]
        })
      }
      reader.readAsDataURL(file)
    })
  }

  function removeImage(id) {
    clearInterval(timers.current[id])
    setImages(prev => prev.filter(img => img.id !== id))
  }

  async function handleAnalyze(id) {
    const img = images.find(i => i.id === id)
    if (!img) return

    setImages(prev => prev.map(i => i.id === id ? { ...i, status: 'loading', loadStep: 0, errorMsg: '' } : i))

    let step = 0
    timers.current[id] = setInterval(() => {
      step = (step + 1) % LOADING_STEPS.length
      setImages(prev => prev.map(i => i.id === id ? { ...i, loadStep: step } : i))
    }, 700)

    try {
      const result = await analyzeImage(img.dataUrl)
      clearInterval(timers.current[id])
      setImages(prev => {
        const updated = prev.map(i => i.id === id ? { ...i, status: 'done', scores: result } : i)
        const merged = mergeScores(updated)
        if (merged) setEditedScores(deepClone(merged))
        return updated
      })
    } catch (e) {
      clearInterval(timers.current[id])
      setImages(prev => prev.map(i => i.id === id ? { ...i, status: 'error', errorMsg: e.message } : i))
    }
  }

  // 미분석 이미지 전체를 병렬로 동시 분석
  function handleAnalyzeAll() {
    images.filter(i => i.status === 'idle').forEach(img => handleAnalyze(img.id))
  }

  function handleScoreChange(section, key, value) {
    setEditedScores(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }))
  }

  function toggleEdit() {
    if (!showEdit) {
      const merged = mergeScores(images)
      if (merged && !editedScores) setEditedScores(deepClone(merged))
    }
    setShowEdit(s => !s)
  }

  function resetToAnalyzed() {
    const merged = mergeScores(images)
    if (merged) setEditedScores(deepClone(merged))
  }

  function handleConfirm() {
    const scores = editedScores || mergeScores(images)
    navigate('/result', { state: { inputMode: 'image', scores } })
  }

  const doneCount = images.filter(i => i.status === 'done').length
  const hasLoading = images.some(i => i.status === 'loading')
  const idleCount = images.filter(i => i.status === 'idle').length
  const canAddMore = images.length < MAX_IMAGES

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF', padding: '32px 16px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* 헤더 */}
        <div className="card" style={{ marginBottom: 14 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 18 }}
          >
            ← 뒤로
          </button>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            <div className="badge" style={{ background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' }}>
              이미지 업로드 분석
            </div>
            <div className="badge" style={{ background: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA' }}>
              최대 3장 동시 분석
            </div>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937', marginBottom: 8 }}>
            결과지 사진을 올려주세요
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>
            커리어넷 등 진로검사 결과지를 캡처하거나 촬영해서 올리면<br />
            AI가 점수를 자동으로 읽어 분석합니다. 최대 3장을 동시에 분석할 수 있습니다.
          </p>
        </div>

        {/* 이미지 목록 카드 */}
        <div className="card" style={{ marginBottom: 14 }}>

          {images.length === 0 && (
            <div
              onClick={() => fileInputRef.current.click()}
              onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
              onDragOver={e => e.preventDefault()}
              style={{
                border: '2px dashed #C4B5FD', borderRadius: 14,
                padding: '48px 24px', textAlign: 'center',
                cursor: 'pointer', background: '#FAFAFF', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#7C3AED'; e.currentTarget.style.background = '#F5F3FF' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#C4B5FD'; e.currentTarget.style.background = '#FAFAFF' }}
            >
              <div style={{ fontSize: 44, marginBottom: 14 }}>📸</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#7C3AED', marginBottom: 6 }}>
                클릭하거나 이미지를 드래그하세요
              </p>
              <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.7 }}>
                최대 3장을 한 번에 선택해 동시 분석할 수 있습니다<br />
                커리어넷 직업흥미검사 / 적성검사 결과지 · PNG, JPG, WEBP
              </p>
            </div>
          )}

          {images.map((img, idx) => (
            <div key={img.id} style={{ border: '1.5px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 12, padding: '12px 14px', alignItems: 'flex-start' }}>
                <img
                  src={img.dataUrl} alt={`이미지 ${idx + 1}`}
                  style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #E5E7EB', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>이미지 {idx + 1}</span>
                    {img.status !== 'loading' && (
                      <button onClick={() => removeImage(img.id)}
                        style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 15, padding: '0 2px' }}>
                        ✕
                      </button>
                    )}
                  </div>

                  {img.status === 'idle' && (
                    <button onClick={() => handleAnalyze(img.id)} style={{
                      padding: '7px 16px', borderRadius: 8, border: 'none',
                      background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
                      color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                    }}>🔍 AI 분석 시작</button>
                  )}

                  {img.status === 'loading' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%',
                        border: '2px solid #EEF2FF', borderTop: '2px solid #7C3AED',
                        animation: 'spin 0.85s linear infinite', flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 12, color: '#7C3AED' }}>{LOADING_STEPS[img.loadStep]}</span>
                    </div>
                  )}

                  {img.status === 'error' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: '#EF4444' }}>⚠️ {img.errorMsg}</span>
                      <button onClick={() => handleAnalyze(img.id)} style={{
                        padding: '4px 10px', borderRadius: 6, border: '1px solid #EF4444',
                        background: 'white', color: '#EF4444', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                      }}>다시 시도</button>
                    </div>
                  )}

                  {img.status === 'done' && img.scores && (
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#D1FAE5', padding: '2px 9px', borderRadius: 100 }}>
                        ✦ 분석 완료
                      </span>
                      <div style={{ marginTop: 7, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {top3(img.scores.interest).map(([k, v]) => (
                          <span key={k} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, fontWeight: 600, background: '#EEF2FF', color: '#6366F1' }}>
                            {k} {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* 이미지 추가 버튼 */}
          {images.length > 0 && canAddMore && (
            <button
              onClick={() => fileInputRef.current.click()}
              style={{
                width: '100%', padding: '11px', borderRadius: 10,
                border: '2px dashed #C4B5FD', background: '#FAFAFF',
                color: '#7C3AED', fontWeight: 600, fontSize: 14,
                cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', marginBottom: 10,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#7C3AED'; e.currentTarget.style.background = '#F5F3FF' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#C4B5FD'; e.currentTarget.style.background = '#FAFAFF' }}
            >
              + 이미지 추가 ({images.length}/{MAX_IMAGES})
            </button>
          )}

          {/* 전체 동시 분석 버튼 — idle이 2개 이상일 때만 표시 */}
          {idleCount >= 2 && (
            <button
              onClick={handleAnalyzeAll}
              disabled={hasLoading}
              style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                background: hasLoading ? '#D1D5DB' : 'linear-gradient(135deg, #7C3AED, #6366F1)',
                color: 'white', fontWeight: 700, fontSize: 14,
                cursor: hasLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              }}
            >
              ⚡ {idleCount}개 동시 분석 시작
            </button>
          )}

          {/* multiple로 한번에 여러 장 선택 가능 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={e => { addFiles(e.target.files); e.target.value = '' }}
          />
        </div>

        {/* 수치 조정 + 분석 시작 카드 */}
        {doneCount > 0 && editedScores && (
          <div className="card" style={{ marginBottom: 14 }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                {doneCount}개 분석 완료{doneCount > 1 && ' · 점수 평균'}
                {images.length > doneCount && ` · ${images.length - doneCount}개 미분석`}
              </p>
              <button
                onClick={toggleEdit}
                style={{
                  padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: '1.5px solid #6366F1', background: showEdit ? '#6366F1' : 'white',
                  color: showEdit ? 'white' : '#6366F1', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {showEdit ? '접기' : '수치 조정'}
              </button>
            </div>

            {showEdit && (
              <div style={{ borderTop: '1.5px solid #F3F4F6', paddingTop: 18, marginBottom: 16 }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
                    AI가 인식하지 못한 항목(50)은 직접 조정해주세요
                  </p>
                  <button
                    onClick={resetToAnalyzed}
                    style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      border: '1px solid #E5E7EB', background: 'white',
                      color: '#9CA3AF', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    초기화
                  </button>
                </div>

                <ScoreSection title="흥미 (Holland RIASEC)" color="#6366F1" keys={INTEREST_KEYS} labels={INTEREST_LABELS} section="interest" scores={editedScores} onChange={handleScoreChange} />
                <ScoreSection title="적성" color="#8B5CF6" keys={APTITUDE_ITEMS} section="aptitude" scores={editedScores} onChange={handleScoreChange} />
                <ScoreSection title="가치관" color="#10B981" keys={VALUES_ITEMS} section="values" scores={editedScores} onChange={handleScoreChange} />
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={hasLoading}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 11, border: 'none',
                background: hasLoading ? '#D1D5DB' : 'linear-gradient(135deg, #059669, #10B981)',
                color: 'white', fontWeight: 700, fontSize: 15,
                cursor: hasLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              }}
            >
              이 점수로 분석 시작 →
            </button>
          </div>
        )}

        <div style={{
          padding: '12px 16px', borderRadius: 10, background: 'white',
          border: '1px solid #E5E7EB', fontSize: 12, color: '#9CA3AF', lineHeight: 1.7, marginBottom: 40,
        }}>
          💡 업로드한 이미지는 서버에 저장되지 않으며 분석에만 사용됩니다.
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
>>>>>>> c42df025a017331aba6fe69b38a2f6c37c23c874
