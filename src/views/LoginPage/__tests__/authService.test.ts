import { describe, it, expect, beforeEach } from 'vitest'
import { AuthService, type TokenStorage } from '../authService'
import { AuthRepository } from '../../repositories'
import { makeTestClient } from '../../repositories/__tests__/_testClient'

function memStorage(): TokenStorage {
  const map = new Map<string, string>()
  return {
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    setItem: (k, v) => { map.set(k, v) },
    removeItem: (k) => { map.delete(k) },
  }
}

let service: AuthService
let storage: TokenStorage
let mock: ReturnType<typeof makeTestClient>['mock']

beforeEach(() => {
  const t = makeTestClient()
  mock = t.mock
  storage = memStorage()
  service = new AuthService(new AuthRepository(t.client), storage)
})

describe('AuthService', () => {
  it('login persists jwt + user', async () => {
    mock.onPost('auth/login').reply(200, {
      jwt: 'token-A', refresh: 'r', user: { id: 1, username: 'x' },
    })
    const res = await service.login({ username: 'x', password: 'y' })
    expect(res.jwt).toBe('token-A')
    expect(storage.getItem('token')).toBe('token-A')
    expect(JSON.parse(storage.getItem('user')!)).toEqual({ id: 1, username: 'x' })
    expect(service.isAuthenticated()).toBe(true)
  })

  it('login does not persist when backend omits jwt', async () => {
    mock.onPost('auth/login').reply(200, {})
    await service.login({ username: 'x', password: 'y' })
    expect(service.isAuthenticated()).toBe(false)
  })

  it('verifyOtp persists tokens', async () => {
    mock.onPost('auth/verify-otp').reply(200, {
      jwt: 'J', refresh: 'R', user: { id: 5 },
    })
    await service.verifyOtp({ email: 'e@x.tm', code: '123456' })
    expect(storage.getItem('token')).toBe('J')
  })

  it('logout clears storage', async () => {
    mock.onPost('auth/login').reply(200, { jwt: 'A', refresh: 'B', user: { id: 1 } })
    await service.login({ username: 'x', password: 'y' })
    service.logout()
    expect(service.isAuthenticated()).toBe(false)
    expect(service.currentUser()).toBeNull()
  })

  it('currentUser returns parsed user object', async () => {
    mock.onPost('auth/login').reply(200, { jwt: 'A', refresh: 'B', user: { id: 7, username: 'u' } })
    await service.login({ username: 'u', password: 'p' })
    expect(service.currentUser<{ id: number }>()?.id).toBe(7)
  })

  it('currentUser returns null on malformed json', () => {
    storage.setItem('user', '{not-json')
    expect(service.currentUser()).toBeNull()
  })

  it('forgotPassword does not persist anything', async () => {
    mock.onPost('auth/forgot-password').reply(200, { sent: true })
    const res = await service.forgotPassword('e@x.tm')
    expect(res.sent).toBe(true)
    expect(storage.getItem('token')).toBeNull()
  })
})
