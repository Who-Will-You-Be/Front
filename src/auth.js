const SESSION_KEY = 'app_session'
const USERS_KEY = 'app_registered_users'
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

function getRegisteredUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
}

function addRegisteredUser(userId, email) {
  const users = getRegisteredUsers()
  users.push({ userId, email })
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

async function parseError(res) {
  try {
    const data = await res.json()
    return data.message || data.error || '요청에 실패했습니다.'
  } catch {
    return '요청에 실패했습니다.'
  }
}

export async function signup({ id, password, name, school, grade, email }) {
  const users = getRegisteredUsers()
  if (users.some(u => u.userId === id)) return { error: '이미 사용 중인 아이디입니다.' }
  if (users.some(u => u.email === email)) return { error: '이미 가입된 이메일입니다.' }

  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: id, password, name, school, grade, email }),
  })
  if (!res.ok) {
    const error = await parseError(res)
    return { error }
  }
  addRegisteredUser(id, email)
  return { ok: true }
}

export async function login({ id, password }) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
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
    await fetch(`${API_BASE}/api/auth/logout`, {
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
