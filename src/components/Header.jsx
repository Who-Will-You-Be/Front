import { useNavigate, useLocation } from 'react-router-dom'
import { getSession, logout } from '../auth'

const PUBLIC_PATHS = ['/', '/login', '/signup']

export default function Header() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const session = getSession()

  if (PUBLIC_PATHS.includes(pathname) || !session) return null

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{
      position: 'fixed',
      top: 16,
      left: 20,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'white',
      borderRadius: 12,
      padding: '8px 14px',
      boxShadow: '0 2px 12px rgba(99,102,241,0.13)',
      border: '1px solid #EEF2FF',
    }}>
      <span style={{ fontSize: 13, color: '#4B5563', fontWeight: 600 }}>
        {session.name}
      </span>
      <div style={{ width: 1, height: 14, background: '#E5E7EB' }} />
      <button
        onClick={handleLogout}
        style={{
          background: 'none',
          border: 'none',
          fontSize: 13,
          color: '#6366F1',
          fontWeight: 600,
          cursor: 'pointer',
          padding: 0,
          fontFamily: 'inherit',
        }}
      >
        로그아웃
      </button>
    </div>
  )
}
