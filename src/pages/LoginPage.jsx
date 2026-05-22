import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { login } from '../auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [form, setForm] = useState({ id: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(form)
      if (result.error) {
        setError(result.error)
      } else {
        navigate('/input-mode')
      }
    } catch {
      setError('서버에 연결할 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧭</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1F2937' }}>로그인</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 6 }}>AI 자기이해 기반 진로탐색</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="아이디">
            <input
              style={inputStyle}
              type="text"
              value={form.id}
              onChange={e => setForm({ ...form, id: e.target.value })}
              placeholder="아이디 입력"
              required
              disabled={loading}
            />
          </Field>
          <Field label="비밀번호">
            <input
              style={inputStyle}
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="비밀번호 입력"
              required
              disabled={loading}
            />
          </Field>

          {state?.registered && (
            <p style={{ color: '#10B981', fontSize: 13, textAlign: 'center', margin: 0, fontWeight: 600 }}>
              회원가입이 완료됐습니다. 로그인해주세요.
            </p>
          )}
          {error && (
            <p style={{ color: '#EF4444', fontSize: 13, textAlign: 'center', margin: 0 }}>{error}</p>
          )}

          <button className="btn-primary" type="submit" style={{ marginTop: 4 }} disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: '#6B7280' }}>
          계정이 없으신가요?{' '}
          <Link to="/signup" style={{ color: '#6366F1', fontWeight: 700, textDecoration: 'none' }}>
            회원가입
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
