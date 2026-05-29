
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'llama3.2-vision'

const PROMPT = `이 이미지는 진로/직업 검사 결과지입니다.
이미지에 표시된 각 항목의 점수를 읽어주세요. 바 차트, 숫자, 표 등 모든 형태의 점수를 확인하세요.
현실형은 R, 탐구형은 I, 예술형은 A, 사회형은 S, 기업형은 E, 관습형은 C에 해당합니다.

반드시 아래 JSON 형식만 응답하세요 (설명 없이):
{
  "interest": {"R": 숫자또는null, "I": 숫자또는null, "A": 숫자또는null, "S": 숫자또는null, "E": 숫자또는null, "C": 숫자또는null},
  "aptitude": {"언어능력": 숫자또는null, "수리논리력": 숫자또는null, "창의력": 숫자또는null, "대인관계능력": 숫자또는null, "자기관리능력": 숫자또는null, "공간지각력": 숫자또는null, "손재능": 숫자또는null, "예술시각능력": 숫자또는null},
  "values": {"안정성": 숫자또는null, "보수": 숫자또는null, "일과삶의균형": 숫자또는null, "즐거움": 숫자또는null, "자기계발": 숫자또는null, "도전성": 숫자또는null, "사회적기여": 숫자또는null, "자율성": 숫자또는null, "성취": 숫자또는null}
}

규칙:
- 항목을 이미지에서 찾을 수 없으면 null
- 모든 점수는 0~100 사이 숫자 (소수점 1자리 허용)
- JSON 외 다른 텍스트는 절대 출력 금지`

const SCORE_KEYS = {
  interest: ['R', 'I', 'A', 'S', 'E', 'C'],
  aptitude: ['언어능력', '수리논리력', '창의력', '대인관계능력', '자기관리능력', '공간지각력', '손재능', '예술시각능력'],
  values: ['안정성', '보수', '일과삶의균형', '즐거움', '자기계발', '도전성', '사회적기여', '자율성', '성취'],
}

// 이미지 리사이즈 → base64 JPEG 반환
function resizeToBase64(dataUrl, maxPx = 1600) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(maxPx / img.width, maxPx / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.9).split(',')[1])
    }
    img.src = dataUrl
  })
}

// PDF 텍스트 추출 (텍스트 기반 PDF)
async function extractTextFromPDF(dataUrl) {
  const binary = atob(dataUrl.split(',')[1])
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i)

  const pdf = await pdfjsLib.getDocument({ data: array }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map(item => item.str).join(' ') + '\n'
  }
  return text
}

// PDF 각 페이지를 이미지로 렌더링 → base64 배열 (스캔 PDF용)
async function renderPDFToImages(dataUrl, maxPages = 3) {
  const binary = atob(dataUrl.split(',')[1])
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i)

  const pdf = await pdfjsLib.getDocument({ data: array }).promise
  const images = []
  for (let i = 1; i <= Math.min(pdf.numPages, maxPages); i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
    images.push(canvas.toDataURL('image/jpeg', 0.9).split(',')[1])
  }
  return images
}

// Ollama Vision API 호출
async function callOllama(base64Images, onProgress) {
  onProgress?.('Ollama 분석 중...')

  let res
  try {
    res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: 'user', content: PROMPT, images: base64Images }],
        stream: false,
      }),
    })
  } catch {
    throw new Error(
      `Ollama에 연결할 수 없습니다.\n` +
      `① Ollama가 실행 중인지 확인: ollama serve\n` +
      `② CORS 설정: OLLAMA_ORIGINS=* ollama serve`
    )
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err.error || `상태 ${res.status}`
    throw new Error(
      `Ollama 오류: ${msg}\n` +
      `모델이 설치됐는지 확인: ollama pull ${OLLAMA_MODEL}`
    )
  }

  const data = await res.json()
  const text = data.message?.content || ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error(`모델 응답을 파싱할 수 없습니다.\n응답: ${text.slice(0, 200)}`)

  return JSON.parse(match[0])
}

// Ollama 응답 → 정규화된 scores 구조
function normalizeOllamaScores(raw) {
  const result = {}
  for (const [group, keys] of Object.entries(SCORE_KEYS)) {
    const vals = keys.map(k => {
      const v = raw?.[group]?.[k]
      if (v === null || v === undefined) return null
      const n = parseFloat(v)
      if (isNaN(n)) return null
      // 0~1 범위로 온 경우 100배
      if (n >= 0 && n <= 1 && n !== Math.round(n)) return Math.round(n * 100 * 10) / 10
      return Math.round(Math.min(100, Math.max(0, n)) * 10) / 10
    })
    const found = vals.filter(v => v !== null)
    const avg = found.length > 0
      ? Math.round(found.reduce((a, b) => a + b, 0) / found.length * 10) / 10
      : 50
    result[group] = Object.fromEntries(keys.map((k, i) => [k, vals[i] ?? avg]))
  }
  return result
}

// PDF 텍스트용 키워드 점수 파싱 (텍스트 기반 PDF 전용)
function findScoreInText(text, keywords) {
  const numPat = '(\\d+(?:[.,]\\d+)?)'
  const gap = '[^\\d\\n]{0,30}'
  for (const kw of keywords) {
    const m1 = text.match(new RegExp(`${kw}${gap}${numPat}`, 'i'))
    if (m1) {
      const v = parseFloat(m1[1].replace(',', '.'))
      if (v >= 0 && v <= 100) return Math.round(v * 10) / 10
    }
    const m2 = text.match(new RegExp(`${numPat}${gap}${kw}`, 'i'))
    if (m2) {
      const v = parseFloat(m2[1].replace(',', '.'))
      if (v >= 0 && v <= 100) return Math.round(v * 10) / 10
    }
  }
  return null
}

function parseTextScores(text) {
  const t = text.replace(/[ \t]+/g, ' ')
  const raw = {
    interest: {
      R: findScoreInText(t, ['현실형', 'R형']),
      I: findScoreInText(t, ['탐구형', 'I형']),
      A: findScoreInText(t, ['예술형', 'A형']),
      S: findScoreInText(t, ['사회형', 'S형']),
      E: findScoreInText(t, ['기업형', 'E형', '진취형']),
      C: findScoreInText(t, ['관습형', 'C형']),
    },
    aptitude: {
      언어능력: findScoreInText(t, ['언어능력']),
      수리논리력: findScoreInText(t, ['수리논리력', '수리논리']),
      창의력: findScoreInText(t, ['창의력']),
      대인관계능력: findScoreInText(t, ['대인관계능력', '대인관계']),
      자기관리능력: findScoreInText(t, ['자기관리능력', '자기관리']),
      공간지각력: findScoreInText(t, ['공간지각력', '공간지각']),
      손재능: findScoreInText(t, ['손재능']),
      예술시각능력: findScoreInText(t, ['예술시각능력', '예술시각']),
    },
    values: {
      안정성: findScoreInText(t, ['안정성']),
      보수: findScoreInText(t, ['보수']),
      일과삶의균형: findScoreInText(t, ['일과삶', '워라밸']),
      즐거움: findScoreInText(t, ['즐거움']),
      자기계발: findScoreInText(t, ['자기계발']),
      도전성: findScoreInText(t, ['도전성']),
      사회적기여: findScoreInText(t, ['사회적기여', '사회적 기여']),
      자율성: findScoreInText(t, ['자율성']),
      성취: findScoreInText(t, ['성취']),
    },
  }
  return normalizeOllamaScores(raw) // 같은 정규화 함수 재활용
}

// 메인 - 파일 배열 분석
export async function analyzeFiles(files, onProgress) {
  const scoresPerFile = []

  for (let i = 0; i < files.length; i++) {
    const { dataUrl, fileType } = files[i]
    const prefix = files.length > 1 ? `[${i + 1}/${files.length}] ` : ''

    if (fileType === 'application/pdf') {
      onProgress?.({ stage: `${prefix}PDF 텍스트 추출 중...`, pct: Math.round((i / files.length) * 60) + 10 })
      const text = await extractTextFromPDF(dataUrl)

      if (text.trim().length > 100) {
        // 텍스트 기반 PDF
        onProgress?.({ stage: `${prefix}텍스트 분석 중...`, pct: Math.round((i / files.length) * 60) + 40 })
        scoresPerFile.push(parseTextScores(text))
      } else {
        // 스캔 PDF → 이미지로 변환 후 Ollama
        onProgress?.({ stage: `${prefix}스캔 PDF 이미지 변환 중...`, pct: Math.round((i / files.length) * 60) + 20 })
        const images = await renderPDFToImages(dataUrl)
        onProgress?.({ stage: `${prefix}Ollama 분석 중...`, pct: Math.round((i / files.length) * 60) + 40 })
        const raw = await callOllama(images, msg => onProgress?.({ stage: `${prefix}${msg}`, pct: 70 }))
        scoresPerFile.push(normalizeOllamaScores(raw))
      }
    } else {
      // 이미지 → Ollama
      onProgress?.({ stage: `${prefix}이미지 준비 중...`, pct: Math.round((i / files.length) * 30) + 5 })
      const b64 = await resizeToBase64(dataUrl)
      onProgress?.({ stage: `${prefix}Ollama 분석 중...`, pct: Math.round((i / files.length) * 30) + 20 })
      const raw = await callOllama([b64], msg => onProgress?.({ stage: `${prefix}${msg}`, pct: 60 }))
      scoresPerFile.push(normalizeOllamaScores(raw))
    }
  }

  onProgress?.({ stage: '점수 병합 중...', pct: 92 })

  // 여러 파일 결과 병합 (평균)
  const merged = {}
  for (const group of Object.keys(SCORE_KEYS)) {
    merged[group] = {}
    for (const key of SCORE_KEYS[group]) {
      const vals = scoresPerFile.map(s => s[group]?.[key]).filter(v => v != null && !isNaN(v))
      merged[group][key] = vals.length > 0
        ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10
        : 50
    }
  }

  onProgress?.({ stage: '완료', pct: 100 })
  return merged
}

export async function analyzeFile(dataUrl, fileType, onProgress) {
  return analyzeFiles([{ dataUrl, fileType }], onProgress)
}
