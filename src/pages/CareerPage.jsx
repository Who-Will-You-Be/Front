import { useNavigate, useLocation } from 'react-router-dom'

const CAREERS = {
  L: {
    summary: '이끌고 기획하는 능력이 강점인 당신에게 어울리는 진로입니다.',
    list: [
      { title: '경영·경제학', emoji: '📊', desc: '조직을 운영하고 전략을 수립하는 역할에 뛰어난 적성을 보입니다.' },
      { title: '교육학', emoji: '🏫', desc: '사람들을 이끌고 가르치는 데서 보람을 느끼는 유형에 맞습니다.' },
      { title: '정치·행정학', emoji: '🏛️', desc: '공익을 위해 조직을 운영하고 방향을 제시하는 데 적합합니다.' },
      { title: '스타트업·창업', emoji: '🚀', desc: '아이디어를 직접 실행하고 팀을 이끌어가는 창업에 어울립니다.' },
    ],
  },
  R: {
    summary: '논리적 분석과 탐구를 즐기는 당신에게 어울리는 진로입니다.',
    list: [
      { title: '컴퓨터공학', emoji: '💻', desc: '논리적 사고로 복잡한 문제를 코드로 해결하는 분야입니다.' },
      { title: '데이터사이언스', emoji: '📈', desc: '데이터를 분석해 의미 있는 인사이트를 발견하는 분야입니다.' },
      { title: '자연과학', emoji: '🧪', desc: '자연 현상의 원리를 탐구하고 연구하는 데 강점을 발휘합니다.' },
      { title: '의학·약학', emoji: '⚕️', desc: '정밀한 지식과 분석력으로 사람을 치료하는 분야입니다.' },
    ],
  },
  C: {
    summary: '창의적 표현과 독창성이 강점인 당신에게 어울리는 진로입니다.',
    list: [
      { title: '시각디자인', emoji: '🎨', desc: '시각적 언어로 아이디어를 표현하고 사람들과 소통합니다.' },
      { title: '미디어·콘텐츠', emoji: '🎬', desc: '영상, 글, 음악 등으로 새로운 콘텐츠를 만들어냅니다.' },
      { title: '건축·인테리어', emoji: '🏗️', desc: '공간을 창의적으로 설계하고 사람들의 삶을 디자인합니다.' },
      { title: '예술·공연', emoji: '🎭', desc: '자신만의 감성으로 작품과 무대를 통해 세상과 소통합니다.' },
    ],
  },
  S: {
    summary: '공감과 소통 능력이 뛰어난 당신에게 어울리는 진로입니다.',
    list: [
      { title: '상담·심리학', emoji: '💬', desc: '타인의 마음을 이해하고 심리적으로 돕는 전문가가 됩니다.' },
      { title: '사회복지학', emoji: '🤲', desc: '사회적 약자를 지원하고 더 나은 사회를 만들어갑니다.' },
      { title: '간호·보건학', emoji: '🏥', desc: '환자 곁에서 신체적·정서적으로 돌보는 직업입니다.' },
      { title: '교육학', emoji: '✏️', desc: '학생의 성장을 곁에서 함께하며 지원하는 교사·교육자입니다.' },
    ],
  },
}

function getDominantType(answers) {
  const count = { L: 0, R: 0, C: 0, S: 0 }
  answers.forEach(a => { count[a.choice.type]++ })
  return Object.entries(count).sort((a, b) => b[1] - a[1])[0][0]
}

export default function CareerPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const dominantType = getDominantType(state.answers)
  const careers = CAREERS[dominantType]

  return (
    <div className="page">
      <div className="card">
        <div className="badge">추천 진로 방향</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1F2937', marginBottom: 8 }}>
          나에게 어울리는 진로
        </h2>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 24 }}>
          {careers.summary}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          {careers.list.map((career, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 16,
              padding: '16px 18px',
              border: '1.5px solid #E5E7EB',
              borderRadius: 12,
              alignItems: 'flex-start',
              transition: 'border-color 0.15s',
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#F5F3FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                flexShrink: 0,
              }}>
                {career.emoji}
              </div>
              <div>
                <p style={{ fontWeight: 700, color: '#1F2937', marginBottom: 4, fontSize: 15 }}>{career.title}</p>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{career.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          padding: '14px 16px',
          marginBottom: 24,
          fontSize: 13,
          color: '#6B7280',
          lineHeight: 1.6,
        }}>
          💡 이 결과는 선택 패턴 분석 모델이 제시한 방향입니다. 실제 진로는 다양한 요소를 함께 고려하세요.
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate('/')}
          style={{ background: '#6B7280' }}
        >
          ← 처음으로 돌아가기
        </button>
      </div>
    </div>
  )
}
