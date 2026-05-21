const SESSION_KEY = 'app_session'

async function parseError(res) {
  try {
    const data = await res.json()
    return data.message || data.error || '요청에 실패했습니다.'
  } catch {
    return '요청에 실패했습니다.'
  }
}

export async function signup({ id, password, name, school, grade, email }) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: id, password, name, school, grade, email }),
  })
  if (!res.ok) {
    const error = await parseError(res)
    return { error }
  }
  return { ok: true }
}

export async function login({ id, password }) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: id, password }),
  })
  if (!res.ok) {
    return { error: '아이디 또는 비밀번호가 올바르지 않습니다.' }
  }
  const data = await res.json()
  localStorage.setItem(SESSION_KEY, JSON.stringify(data))
  return { user: data }
}

export async function logout() {
  const session = getSession()
  if (session?.sessionId) {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'X-Session-ID': session.sessionId },
    }).catch(() => {})
  }
  localStorage.removeItem(SESSION_KEY)
}

export function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
}

export function isLoggedIn() {
  const session = getSession()
  if (!session) return false
  if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
    localStorage.removeItem(SESSION_KEY)
    return false
  }
  return true
}

export function getSessionHeader() {
  const session = getSession()
  return session?.sessionId ? { 'X-Session-ID': session.sessionId } : {}
}
