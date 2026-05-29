import { useRef, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'
import RadarChart from '../components/RadarChart'

const MODEL_RECOMMEND_URL = import.meta.env.VITE_MODEL_RECOMMEND_URL ?? ''

const RIASEC = {
  R: { label: '현실형', desc: '도구·기계 다루기', color: '#F59E0B', emoji: '🔧' },
  I: { label: '탐구형', desc: '분석·연구·과학', color: '#3B82F6', emoji: '🔬' },
  A: { label: '예술형', desc: '창의·표현·예술', color: '#EC4899', emoji: '🎨' },
  S: { label: '사회형', desc: '돕기·가르치기·상담', color: '#10B981', emoji: '🤝' },
  E: { label: '기업형', desc: '이끌기·기획·경영', color: '#8B5CF6', emoji: '📊' },
  C: { label: '관습형', desc: '정확·체계·사무', color: '#6366F1', emoji: '📋' },
}

const RIASEC_ORDER = ['R', 'I', 'A', 'S', 'E', 'C']
const RIASEC_LABELS = ['R\n현실형', 'I\n탐구형', 'A\n예술형', 'S\n사회형', 'E\n기업형', 'C\n관습형']

// 피처 순서: [성취/노력, 인내, 책임성과 진취성, 리더십, 혁신, 타인에 대한 배려]
const JOB_PROFILES = [
  { title: '소프트웨어 개발자', emoji: '💻', riasec: ['I', 'R'], desc: '알고리즘과 시스템을 논리적으로 설계하고 구현합니다.', features: [4.0, 3.8, 3.7, 2.8, 4.2, 2.5] },
  { title: '데이터사이언티스트', emoji: '📊', riasec: ['I', 'C'], desc: '데이터를 분석해 패턴과 인사이트를 발견합니다.', features: [4.2, 4.0, 3.8, 2.5, 4.5, 2.3] },
  { title: 'AI 연구원', emoji: '🤖', riasec: ['I', 'R'], desc: '인공지능 기술을 연구하고 새로운 모델을 개발합니다.', features: [4.5, 4.3, 4.0, 2.8, 4.8, 2.5] },
  { title: 'UX/UI 디자이너', emoji: '🎨', riasec: ['A', 'E'], desc: '시각적 언어로 정보를 표현하고 사용자 경험을 설계합니다.', features: [3.8, 3.5, 3.6, 3.0, 4.3, 3.6] },
  { title: '영상·콘텐츠 크리에이터', emoji: '🎬', riasec: ['A', 'E'], desc: '영상, 글, 음악 등으로 새로운 콘텐츠를 만들어냅니다.', features: [3.8, 3.5, 3.5, 2.8, 4.5, 3.0] },
  { title: '경영 컨설턴트', emoji: '💼', riasec: ['E', 'C'], desc: '조직의 전략과 운영을 분석해 개선 방향을 제시합니다.', features: [4.5, 3.7, 4.5, 4.5, 3.8, 3.2] },
  { title: '마케터', emoji: '📣', riasec: ['E', 'A'], desc: '브랜드와 제품을 알리고 고객과의 접점을 만들어냅니다.', features: [4.0, 3.3, 4.0, 3.8, 4.3, 3.5] },
  { title: '벤처 창업가', emoji: '🚀', riasec: ['E', 'I'], desc: '새로운 아이디어를 사업으로 만들어 가치를 창출합니다.', features: [4.8, 4.0, 4.8, 4.8, 4.8, 3.0] },
  { title: '교사', emoji: '✏️', riasec: ['S', 'A'], desc: '지식과 경험을 나누며 학생들의 성장을 이끕니다.', features: [3.5, 4.2, 4.0, 3.2, 3.0, 4.5] },
  { title: '심리상담사', emoji: '💬', riasec: ['S', 'I'], desc: '심리적 원리를 바탕으로 사람들의 마음을 이해하고 돕습니다.', features: [3.8, 4.5, 3.8, 2.8, 3.2, 4.8] },
  { title: '의사', emoji: '⚕️', riasec: ['I', 'S'], desc: '과학적 지식으로 사람의 건강을 진단하고 치료합니다.', features: [4.8, 4.8, 4.7, 3.5, 4.0, 4.2] },
  { title: '간호사', emoji: '💉', riasec: ['S', 'I'], desc: '환자를 돌보며 의료 현장에서 핵심 역할을 담당합니다.', features: [4.2, 4.5, 4.5, 2.8, 3.2, 4.8] },
  { title: '사회복지사', emoji: '🤲', riasec: ['S', 'E'], desc: '취약계층을 지원하고 더 나은 사회를 만들어갑니다.', features: [3.5, 4.3, 4.0, 3.0, 2.8, 4.8] },
  { title: '건축가', emoji: '🏗️', riasec: ['R', 'A'], desc: '공간을 구상하고 사람들의 삶을 담는 환경을 설계합니다.', features: [4.2, 4.0, 4.0, 3.3, 4.3, 2.8] },
  { title: '기계·전자공학자', emoji: '⚙️', riasec: ['R', 'I'], desc: '기계와 전자 시스템을 설계하고 제작합니다.', features: [4.0, 4.2, 4.0, 3.0, 4.0, 2.5] },
  { title: '변호사', emoji: '⚖️', riasec: ['E', 'C'], desc: '법과 제도를 통해 사회 질서를 유지하고 공익을 실현합니다.', features: [4.5, 4.5, 4.8, 3.8, 3.5, 3.2] },
  { title: '회계사·세무사', emoji: '🧾', riasec: ['C', 'E'], desc: '재무 정보를 정확히 분석하고 세금 및 회계를 관리합니다.', features: [4.2, 4.3, 4.5, 3.0, 2.8, 2.5] },
  { title: '공무원', emoji: '🏛️', riasec: ['C', 'S'], desc: '국가와 지역사회를 위해 공공 업무를 수행합니다.', features: [3.8, 4.3, 4.5, 3.2, 2.5, 3.3] },
  { title: '기자·언론인', emoji: '📰', riasec: ['E', 'I'], desc: '사실을 취재하고 정확한 정보를 대중에게 전달합니다.', features: [4.0, 3.5, 4.2, 3.5, 4.2, 3.0] },
  { title: '음악가', emoji: '🎵', riasec: ['A', 'I'], desc: '음악을 창작하고 연주하며 감동을 전달합니다.', features: [4.0, 4.5, 3.5, 2.5, 4.5, 3.2] },
  { title: '스포츠 코치', emoji: '🏆', riasec: ['S', 'E'], desc: '선수들을 훈련시키고 최고의 실력을 발휘하도록 이끕니다.', features: [4.5, 4.5, 4.3, 4.2, 3.5, 4.0] },
  { title: '환경공학자', emoji: '🌿', riasec: ['R', 'I'], desc: '환경 문제를 분석하고 지속 가능한 기술을 개발합니다.', features: [4.2, 4.0, 4.2, 3.0, 4.2, 3.5] },
  { title: '의약품 연구원', emoji: '🔬', riasec: ['I', 'R'], desc: '신약을 연구하고 사람들의 건강을 개선하는 의약품을 개발합니다.', features: [4.5, 4.8, 4.2, 2.8, 4.5, 3.0] },
  { title: '금융 애널리스트', emoji: '📈', riasec: ['C', 'E'], desc: '시장을 분석하고 투자 전략을 수립합니다.', features: [4.5, 4.0, 4.3, 3.2, 4.0, 2.5] },
  { title: '유아교육사', emoji: '🧸', riasec: ['S', 'A'], desc: '어린이의 건강한 성장과 발달을 돕습니다.', features: [3.5, 4.3, 3.8, 2.8, 3.3, 4.8] },
  { title: '물리치료사', emoji: '🦴', riasec: ['S', 'R'], desc: '신체 재활을 통해 환자의 건강 회복을 돕습니다.', features: [3.8, 4.5, 4.0, 2.8, 3.5, 4.5] },
  { title: '요리사·셰프', emoji: '🍳', riasec: ['R', 'A'], desc: '창의적인 요리로 사람들에게 즐거운 식경험을 제공합니다.', features: [4.0, 4.3, 3.8, 3.0, 4.2, 3.5] },
  { title: '경찰관', emoji: '👮', riasec: ['S', 'E'], desc: '사회 안전을 지키고 시민을 보호합니다.', features: [4.0, 4.5, 4.7, 3.7, 2.8, 3.5] },
]

// 피처 순서: [성취/노력, 인내, 책임성과 진취성, 리더십, 혁신, 타인에 대한 배려]
function mapScoresToFeatures(scores) {
  const n = v => Math.max(1, Math.min(5, (v ?? 50) / 100 * 4 + 1))
  const val = (key, fallback) => scores.values[key] ?? scores.values[fallback] ?? 50
  return [
    n(val('성취', '능력발휘')),
    n(scores.aptitude.자기관리능력 ?? 50),
    n(val('도전성', '자기계발')),
    n(scores.interest.E ?? 50),
    n(((scores.interest.I ?? 50) + (scores.aptitude.창의력 ?? 50)) / 2),
    n(((scores.aptitude.대인관계능력 ?? 50) + val('사회적기여', '사회봉사')) / 2),
  ]
}

function getJobEmoji(name) {
  if (/개발자|프로그래머|엔지니어|IT|소프트웨어|데이터베이스|시스템/.test(name)) return '💻'
  if (/의사|의료|간호|약사|치료|재활/.test(name)) return '⚕️'
  if (/교사|교수|강사|교육|유아/.test(name)) return '✏️'
  if (/디자인|UX|UI/.test(name)) return '🎨'
  if (/연구원|연구/.test(name)) return '🔬'
  if (/법|변호|검사|판사/.test(name)) return '⚖️'
  if (/금융|회계|세무|은행|투자|애널리스트/.test(name)) return '💰'
  if (/공무원|행정|공공/.test(name)) return '🏛️'
  if (/마케팅|홍보|광고/.test(name)) return '📣'
  if (/상담|심리|복지/.test(name)) return '💬'
  if (/음악|예술|공연/.test(name)) return '🎵'
  if (/건축|건설|토목/.test(name)) return '🏗️'
  if (/환경|생태|에너지/.test(name)) return '🌿'
  if (/경찰|소방|보안/.test(name)) return '👮'
  if (/요리|식품|셰프/.test(name)) return '🍳'
  if (/스포츠|운동|코치/.test(name)) return '🏆'
  if (/기자|언론|미디어|방송/.test(name)) return '📰'
  if (/창업|경영|컨설턴트/.test(name)) return '💼'
  if (/항공|파일럿/.test(name)) return '✈️'
  if (/의약|제약/.test(name)) return '💊'
  return '🎯'
}

function cosineSim(a, b) {
  const dot = a.reduce((s, ai, i) => s + ai * b[i], 0)
  const mag = v => Math.sqrt(v.reduce((s, x) => s + x * x, 0))
  const denom = mag(a) * mag(b)
  return denom ? dot / denom : 0
}

function getLocalCareerMatches(scores) {
  const user = mapScoresToFeatures(scores)
  return JOB_PROFILES
    .map(job => ({
      job_name: job.title,
      similarity_score: Math.round(cosineSim(user, job.features) * 100),
      schools: [],
      _emoji: job.emoji,
      _riasec: job.riasec,
      _desc: job.desc,
    }))
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, 4)
}

const RIASEC_KEYWORD = {
  R: '현실적', I: '탐구적', A: '창의적', S: '사회적', E: '리더형', C: '체계적',
}
const RIASEC_DO = {
  R: '직접 만들고 다루기',
  I: '분석하고 탐구하기',
  A: '창의적으로 표현하기',
  S: '사람을 돕고 함께하기',
  E: '기획하고 이끌기',
  C: '정확히 정리하고 관리하기',
}
const APT_SHORT = {
  언어능력: '언어 표현력', 수리논리력: '논리적 사고력', 창의력: '창의적 발상력',
  대인관계능력: '대인 소통력', 자기관리능력: '자기 주도성', 공간지각력: '공간 구성력',
  손재능: '손재주', 예술시각능력: '시각적 감수성',
}
const VAL_SHORT = {
  안정성: '안정감', 보수: '합당한 보상', 일과삶의균형: '일·삶 균형',
  즐거움: '즐거움', 자기계발: '지속 성장', 도전성: '도전 정신',
  사회적기여: '사회 기여', 자율성: '자율성', 성취: '성취감',
  능력발휘: '능력 발휘', 사회적인정: '사회적 인정', 사회봉사: '사회 봉사', 창의성: '창의적 사고',
}

function generateNarrative(scores) {
  const sorted = (obj) => Object.entries(obj).sort(([, a], [, b]) => b - a)
  const top2R = sorted(scores.interest).slice(0, 2).map(([k]) => k)
  const top3A = sorted(scores.aptitude).slice(0, 3).map(([k]) => k)
  const top2V = sorted(scores.values).slice(0, 2).map(([k]) => k)
  return {
    typeCode: top2R.join('·'),
    typeLabel: `${RIASEC_KEYWORD[top2R[0]]}·${RIASEC_KEYWORD[top2R[1]]} 성향`,
    doDesc: `${RIASEC_DO[top2R[0]]}를 즐깁니다.`,
    strengths: top3A.map(k => APT_SHORT[k]),
    coreValues: top2V.map(k => VAL_SHORT[k]),
  }
}

export default function ResultPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { scores, reason } = state
  const resultRef = useRef(null)
  const [exporting, setExporting] = useState(null) // 'png' | 'pdf' | null
  const [careers, setCareers] = useState([])
  const [careersLoading, setCareersLoading] = useState(true)
  const [careersSource, setCareersSource] = useState('api') // 'api' | 'local'

  useEffect(() => {
    const features = mapScoresToFeatures(scores)
    fetch(MODEL_RECOMMEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_scores: features, top_n: 4 }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setCareers(data)
        setCareersSource('api')
      })
      .catch(() => {
        setCareers(getLocalCareerMatches(scores))
        setCareersSource('local')
      })
      .finally(() => setCareersLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function capture() {
    await toPng(resultRef.current, { pixelRatio: 2, backgroundColor: '#F5F3FF' })
    return toPng(resultRef.current, { pixelRatio: 2, backgroundColor: '#F5F3FF' })
  }

  async function handleSavePNG() {
    setExporting('png')
    try {
      const dataUrl = await capture()
      const link = document.createElement('a')
      link.download = '진로분석결과.png'
      link.href = dataUrl
      link.click()
    } finally {
      setExporting(null)
    }
  }

  async function handleSavePDF() {
    setExporting('pdf')
    try {
      const dataUrl = await capture()
      const el = resultRef.current
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageW = 210
      const pageH = 297
      const imgW = pageW
      const imgH = (el.offsetHeight / el.offsetWidth) * imgW

      let remaining = imgH
      let offset = 0
      pdf.addImage(dataUrl, 'PNG', 0, offset, imgW, imgH)
      remaining -= pageH

      while (remaining > 0) {
        offset -= pageH
        pdf.addPage()
        pdf.addImage(dataUrl, 'PNG', 0, offset, imgW, imgH)
        remaining -= pageH
      }

      pdf.save('진로분석결과.pdf')
    } finally {
      setExporting(null)
    }
  }

  const narrative = generateNarrative(scores)
  const top2RIASEC = Object.entries(scores.interest)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([k]) => k)
  const sortedAptitude = Object.entries(scores.aptitude).sort(([, a], [, b]) => b - a)
  const sortedValues = Object.entries(scores.values).sort(([, a], [, b]) => b - a)
  const radarData = RIASEC_ORDER.map(code => scores.interest[code] || 0)

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF', padding: '32px 16px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div ref={resultRef} style={{ background: '#F5F3FF', paddingBottom: 8 }}>

        {/* AI 자기이해 분석 요약 카드 */}
        <div className="card" style={{
          marginBottom: 14,
          background: 'linear-gradient(135deg, #F5F3FF 0%, #EEF2FF 100%)',
          border: '1.5px solid #DDD6FE',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 16 }}>✦</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED', letterSpacing: 0.5 }}>
              AI 자기이해 분석 요약
            </span>
          </div>

          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: '#7C3AED' }}>{narrative.typeCode}</span>
            <span style={{ fontSize: 14, color: '#7C3AED', marginLeft: 8, fontWeight: 600 }}>유형</span>
          </div>

          <div style={{
            background: 'white',
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 16,
            fontSize: 14,
            color: '#374151',
            lineHeight: 1.8,
            border: '1px solid #EDE9FE',
          }}>
            <strong style={{ color: '#7C3AED' }}>{narrative.typeLabel}입니다.</strong><br />
            {narrative.doDesc}
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, marginBottom: 8 }}>핵심 강점</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {narrative.strengths.map((s, i) => (
                  <span key={i} style={{
                    fontSize: 12, padding: '4px 10px', borderRadius: 100,
                    background: '#EEF2FF', color: '#6366F1', fontWeight: 600,
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, marginBottom: 8 }}>추구 가치</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {narrative.coreValues.map((v, i) => (
                  <span key={i} style={{
                    fontSize: 12, padding: '4px 10px', borderRadius: 100,
                    background: '#ECFDF5', color: '#059669', fontWeight: 600,
                  }}>
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 흥미 분석 — 레이더 차트 */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="badge">흥미 분석</div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: '#1F2937', marginBottom: 6 }}>
            Holland 흥미 유형
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20, lineHeight: 1.5 }}>
            상위 유형:{' '}
            {top2RIASEC.map((k, i) => (
              <strong key={k} style={{ color: RIASEC[k].color }}>
                {i > 0 ? ' · ' : ''}{k} {RIASEC[k].label}
              </strong>
            ))}
          </p>

          <RadarChart data={radarData} labels={RIASEC_LABELS} color="#6366F1" size={260} />

          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 16, flexWrap: 'wrap' }}>
            {[...RIASEC_ORDER]
              .sort((a, b) => (scores.interest[b] || 0) - (scores.interest[a] || 0))
              .map(code => {
                const isTop = top2RIASEC.includes(code)
                return (
                  <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                    <span style={{ fontSize: 13 }}>{RIASEC[code].emoji}</span>
                    <span style={{ fontWeight: 700, color: isTop ? RIASEC[code].color : '#9CA3AF' }}>{code}</span>
                    <span style={{ color: isTop ? '#374151' : '#C4C4C4', fontWeight: isTop ? 700 : 400 }}>
                      {scores.interest[code]}
                    </span>
                  </div>
                )
              })}
          </div>
        </div>

        {/* 적성 분석 */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="badge">적성 분석</div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: '#1F2937', marginBottom: 16 }}>주요 적성</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {sortedAptitude.map(([k], i) => (
              <span key={k} style={{
                padding: '7px 13px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                background: i < 3 ? '#EEF2FF' : '#F9FAFB',
                color: i < 3 ? '#6366F1' : '#9CA3AF',
                border: `1px solid ${i < 3 ? '#C7D2FE' : '#F3F4F6'}`,
              }}>
                {i < 3 ? '★ ' : ''}{k}
              </span>
            ))}
          </div>
        </div>

        {/* 가치관 분석 */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="badge">가치관 분석</div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: '#1F2937', marginBottom: 16 }}>핵심 가치관</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {sortedValues.map(([k], i) => (
              <span key={k} style={{
                padding: '7px 13px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                background: i < 3 ? '#ECFDF5' : '#F9FAFB',
                color: i < 3 ? '#059669' : '#9CA3AF',
                border: `1px solid ${i < 3 ? '#A7F3D0' : '#F3F4F6'}`,
              }}>
                {i < 3 ? '♥ ' : ''}{k}
              </span>
            ))}
          </div>

          {reason && (
            <div style={{
              marginTop: 20, padding: '12px 14px', background: '#F9FAFB',
              borderRadius: 10, borderLeft: '3px solid #10B981',
            }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                나의 선택 이유
              </p>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65 }}>"{reason}"</p>
            </div>
          )}
        </div>

        {/* 진로 추천 — 3축 종합 분석 */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="badge">추천 진로 방향</div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: '#1F2937', marginBottom: 6 }}>
            탐색해볼 만한 진로
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.55, marginBottom: 20 }}>
            흥미 · 적성 · 가치관 3축 종합 분석 기반 추천입니다.
          </p>

          {careersLoading ? (
            <div style={{
              padding: '32px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 14,
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
              직업 추천 모델 분석 중...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {careers.map((career, i) => {
                const emoji = career._emoji ?? getJobEmoji(career.job_name)
                const riasec = career._riasec ?? []
                const matchPct = career.similarity_score
                return (
                  <div key={i} style={{
                    padding: '14px 15px',
                    border: `1.5px solid ${i === 0 ? '#DDD6FE' : '#E5E7EB'}`,
                    borderRadius: 12,
                    background: i === 0 ? '#FAFAFF' : 'white',
                  }}>
                    <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, background: '#F5F3FF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, flexShrink: 0,
                      }}>
                        {emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                          <p style={{ fontWeight: 700, color: '#1F2937', fontSize: 14 }}>{career.job_name}</p>
                          <span style={{
                            fontSize: 12, fontWeight: 800, color: '#7C3AED',
                            background: '#F5F3FF', padding: '2px 9px', borderRadius: 100,
                            border: '1px solid #DDD6FE',
                          }}>
                            {matchPct}%
                          </span>
                        </div>
                        {career._desc && (
                          <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.55, marginBottom: 8 }}>
                            {career._desc}
                          </p>
                        )}
                        <div style={{ height: 4, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                          <div style={{
                            height: '100%',
                            width: `${matchPct}%`,
                            background: 'linear-gradient(90deg, #8B5CF6, #6366F1)',
                            borderRadius: 4,
                          }} />
                        </div>
                        {riasec.length > 0 && (
                          <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                            {riasec.map(code => (
                              <span key={code} style={{
                                fontSize: 11, padding: '2px 9px', borderRadius: 100,
                                background: RIASEC[code].color + '18', color: RIASEC[code].color,
                                fontWeight: 700, border: `1px solid ${RIASEC[code].color}30`,
                              }}>
                                {code} {RIASEC[code].label}
                              </span>
                            ))}
                          </div>
                        )}
                        {career.schools && career.schools.length > 0 && (
                          <div style={{
                            marginTop: 8, padding: '8px 10px',
                            background: '#F0FDF4', borderRadius: 8,
                            border: '1px solid #BBF7D0',
                          }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: '#059669', marginBottom: 5 }}>
                              📚 관련 대학/학과
                            </p>
                            {career.schools.map((s, si) => (
                              <p key={si} style={{ fontSize: 11, color: '#374151', lineHeight: 1.7 }}>
                                <span style={{ color: '#9CA3AF' }}>[{s['시도명']}]</span>{' '}
                                <strong>{s['학교명']}</strong> {s['학과명']}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{
            marginTop: 18, padding: '12px 14px', background: '#F9FAFB',
            border: '1px solid #E5E7EB', borderRadius: 10,
            fontSize: 12, color: '#9CA3AF', lineHeight: 1.65,
          }}>
            {careersSource === 'api'
              ? '💡 한국직업정보 재직자 데이터 기반 570개 직업 코사인 유사도 분석 결과입니다.'
              : '💡 로컬 데이터로 분석했습니다. 더 정확한 결과를 위해 추천 서버를 실행해주세요.'
            }
          </div>
        </div>

        </div>{/* resultRef 끝 */}

        {/* 내보내기 */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="badge">결과 저장 · 공유</div>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1F2937', marginBottom: 6 }}>
            분석 결과 내보내기
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 18, lineHeight: 1.6 }}>
            결과를 이미지나 PDF로 저장해 친구·선생님과 공유하세요.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleSavePNG}
              disabled={exporting !== null}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 10,
                border: '1.5px solid #6366F1',
                background: exporting === 'png' ? '#EEF2FF' : 'white',
                color: '#6366F1',
                fontWeight: 700,
                fontSize: 14,
                cursor: exporting !== null ? 'not-allowed' : 'pointer',
                opacity: exporting !== null && exporting !== 'png' ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
            >
              {exporting === 'png' ? '저장 중...' : '🖼 PNG 이미지'}
            </button>
            <button
              onClick={handleSavePDF}
              disabled={exporting !== null}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 10,
                border: 'none',
                background: exporting === 'pdf' ? '#7C3AED' : '#6366F1',
                color: 'white',
                fontWeight: 700,
                fontSize: 14,
                cursor: exporting !== null ? 'not-allowed' : 'pointer',
                opacity: exporting !== null && exporting !== 'pdf' ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
            >
              {exporting === 'pdf' ? '변환 중...' : '📄 PDF 저장'}
            </button>
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ background: '#6B7280', marginBottom: 40 }}
          onClick={() => navigate('/')}
        >
          ← 처음으로 돌아가기
        </button>
      </div>
    </div>
  )
}
