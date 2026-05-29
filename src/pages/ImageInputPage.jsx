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

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const OLLAMA_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'
const MAX_IMAGES = 3

const ANALYSIS_PROMPT = `이 이미지는 학생의 진로·직업 검사 결과지입니다.
이미지에 표시된 실제 점수를 읽어 0~100 범위로 변환하세요.
점수를 찾을 수 없는 항목은 50으로 설정하세요.
반드시 아래 JSON 형식만 응답하세요 (설명 없이):

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

async function resizeImage(dataUrl, maxDim = 1600) {
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
      resolve(canvas.toDataURL('image/png'))
    }
    img.src = dataUrl
  })
}

async function analyzeImage(dataUrl) {
  const resized = await resizeImage(dataUrl)
  const base64 = resized.split(',')[1]

  const res = await fetch(`${API_BASE}/api/ollama/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: ANALYSIS_PROMPT,
      images: [base64],
      stream: false,
    }),
  })

  if (!res.ok) throw new Error(`서버 오류 (${res.status}) — Spring Boot 서버가 실행 중인지 확인하세요.`)
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
      // 각 검사지는 측정하지 않은 항목을 50으로 채우므로, 최댓값을 사용해야
      // 흥미검사 I=88이 적성검사 I=50과 평균되어 희석되는 현상을 방지
      const vals = done.map(img => img.scores[section][key])
      result[section][key] = Math.max(...vals)
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
      </div>
    </div>
  )
}

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
      // 현재 images 클로저 + 새 result로 merged 계산 후, setImages/setEditedScores 각각 호출
      const wouldBeDone = images.map(i => i.id === id ? { ...i, status: 'done', scores: result } : i)
      const newMerged = mergeScores(wouldBeDone)
      setImages(prev => prev.map(i => i.id === id ? { ...i, status: 'done', scores: result } : i))
      if (newMerged) setEditedScores(deepClone(newMerged))
    } catch (e) {
      clearInterval(timers.current[id])
      setImages(prev => prev.map(i => i.id === id ? { ...i, status: 'error', errorMsg: e.message } : i))
    }
  }

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
      if (merged) {
        setEditedScores(deepClone(merged))
      } else if (!editedScores) {
        // 분석 전에 수동 입력을 원할 때 기본값 50으로 초기화
        setEditedScores({
          interest: Object.fromEntries(INTEREST_KEYS.map(k => [k, 50])),
          aptitude: Object.fromEntries(APTITUDE_ITEMS.map(k => [k, 50])),
          values: Object.fromEntries(VALUES_ITEMS.map(k => [k, 50])),
        })
      }
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
        <div className="card" style={{ marginBottom: 14 }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                {doneCount > 0
                  ? `${doneCount}개 분석 완료${doneCount > 1 ? ' · 점수 평균' : ''}${images.length > doneCount ? ` · ${images.length - doneCount}개 미분석` : ''}`
                  : '수치를 직접 설정하거나 이미지 분석 후 조정하세요'}
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
