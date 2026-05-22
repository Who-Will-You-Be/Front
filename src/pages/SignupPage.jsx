import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup } from '../auth'

const GRADES = ['초4', '초5', '초6', '중1', '중2', '중3', '고1', '고2']

async function searchSchools(query) {
  if (!query.trim()) return []
  const res = await fetch(
    `/api/neis/hub/schoolInfo?Type=json&pSize=10&SCHUL_NM=${encodeURIComponent(query)}`
  )
  const data = await res.json()
  if (!data.schoolInfo) return []
  return data.schoolInfo[1]?.row ?? []
}

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', school: '', grade: '', email: '', id: '', password: '', passwordConfirm: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [schoolQuery, setSchoolQuery] = useState('')
  const [schoolResults, setSchoolResults] = useState([])
  const [schoolSelected, setSchoolSelected] = useState(false)
  const [schoolLoading, setSchoolLoading] = useState(false)
  const debounceRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (schoolSelected) return
    clearTimeout(debounceRef.current)
    if (!schoolQuery.trim()) { setSchoolResults([]); return }

    debounceRef.current = setTimeout(async () => {
      setSchoolLoading(true)
      try {
        const rows = await searchSchools(schoolQuery)
        setSchoolResults(rows)
      } finally {
        setSchoolLoading(false)
      }
    }, 350)

    return () => clearTimeout(debounceRef.current)
  }, [schoolQuery, schoolSelected])

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSchoolResults([])
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function selectSchool(row) {
    const name = row.SCHUL_NM
    setSchoolQuery(name)
    setForm(f => ({ ...f, school: name }))
    setSchoolSelected(true)
    setSchoolResults([])
  }

  function set(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.school) { setError('학교를 선택해주세요.'); return }
    if (form.password !== form.passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return }
    if (form.password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return }
    setError('')
    setLoading(true)
    try {
      const result = await signup(form)
      if (result.error) { setError(result.error) } else { navigate('/login', { state: { registered: true } }) }
    } catch {
      setError('서버에 연결할 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧭</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1F2937' }}>회원가입</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 6 }}>AI 자기이해 기반 진로탐색</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="이름">
              <input style={inputStyle} type="text" value={form.name} onChange={set('name')} placeholder="이름" required />
            </Field>
            <Field label="학년">
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.grade} onChange={set('grade')} required>
                <option value="">선택</option>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
          </div>

          <Field label="학교">
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <input
                style={{ ...inputStyle, paddingRight: 36 }}
                type="text"
                value={schoolQuery}
                onChange={e => {
                  setSchoolQuery(e.target.value)
                  setSchoolSelected(false)
                  setForm(f => ({ ...f, school: '' }))
                }}
                placeholder="학교명 검색"
                autoComplete="off"
              />
              {schoolLoading && (
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9CA3AF' }}>
                  검색중…
                </span>
              )}
              {schoolResults.length > 0 && (
                <ul style={dropdownStyle}>
                  {schoolResults.map((row, i) => (
                    <li
                      key={i}
                      onMouseDown={() => selectSchool(row)}
                      style={dropdownItemStyle}
                      onMouseEnter={e => e.currentTarget.style.background = '#F5F3FF'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                      <span style={{ fontWeight: 600, fontSize: 14, color: '#1F2937' }}>{row.SCHUL_NM}</span>
                      <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 6 }}>{row.ORG_RDNMA}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Field>

          <Field label="이메일">
            <input style={inputStyle} type="email" value={form.email} onChange={set('email')} placeholder="이메일 입력" required />
          </Field>

          <Field label="아이디">
            <input style={inputStyle} type="text" value={form.id} onChange={set('id')} placeholder="아이디 입력" required />
          </Field>

          <Field label="비밀번호">
            <input style={inputStyle} type="password" value={form.password} onChange={set('password')} placeholder="6자 이상" required />
          </Field>

          <Field label="비밀번호 확인">
            <input style={inputStyle} type="password" value={form.passwordConfirm} onChange={set('passwordConfirm')} placeholder="비밀번호 재입력" required />
          </Field>

          {error && (
            <p style={{ color: '#EF4444', fontSize: 13, textAlign: 'center', margin: 0 }}>{error}</p>
          )}

          <button className="btn-primary" type="submit" style={{ marginTop: 4 }} disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: '#6B7280' }}>
          이미 계정이 있으신가요?{' '}
          <Link to="/login" style={{ color: '#6366F1', fontWeight: 700, textDecoration: 'none' }}>
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '11px 13px',
  border: '2px solid #E5E7EB',
  borderRadius: 10,
  fontSize: 14,
  color: '#1F2937',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  background: 'white',
}

const dropdownStyle = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  background: 'white',
  border: '2px solid #E5E7EB',
  borderRadius: 10,
  marginTop: 4,
  zIndex: 100,
  listStyle: 'none',
  padding: '4px 0',
  boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
  maxHeight: 220,
  overflowY: 'auto',
}

const dropdownItemStyle = {
  padding: '9px 13px',
  cursor: 'pointer',
  background: 'white',
  transition: 'background 0.1s',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  gap: 4,
}
