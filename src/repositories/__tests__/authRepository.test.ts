import { describe, it, expect, beforeEach } from 'vitest'
import { AuthRepository } from '../authRepository'
import { makeTestClient } from './_testClient'

let repo: AuthRepository
let mock: ReturnType<typeof makeTestClient>['mock']

beforeEach(() => {
  const t = makeTestClient()
  mock = t.mock
  repo = new AuthRepository(t.client)
})

describe('AuthRepository', () => {
  it('login posts username + password and returns tokens', async () => {
    mock.onPost('auth/login').reply(200, {
      jwt: 'A', refresh: 'B', user: { id: 1, username: 'x' },
    })
    const res = await repo.login({ username: 'x', password: 'y' })
    expect(res.jwt).toBe('A')
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ username: 'x', password: 'y' })
  })

  it('googleLogin sends credential', async () => {
    mock.onPost('auth/google').reply(200, { jwt: 'g', refresh: 'r', user: {} })
    await repo.googleLogin('id_token_xyz')
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ credential: 'id_token_xyz' })
  })

  it('register hits auth/register', async () => {
    mock.onPost('auth/register').reply(201, { email: 'e@x.tm' })
    const res = await repo.register({ username: 'u', email: 'e@x.tm', password: 'p' })
    expect(res.email).toBe('e@x.tm')
  })

  it('verifyOtp returns tokens', async () => {
    mock.onPost('auth/verify-otp').reply(200, { jwt: 'j', refresh: 'r', user: { id: 1 } })
    const res = await repo.verifyOtp({ email: 'e@x.tm', code: '111111' })
    expect(res.jwt).toBe('j')
  })

  it('resendOtp posts to auth/resend-otp', async () => {
    mock.onPost('auth/resend-otp').reply(200, { ok: true })
    await repo.resendOtp('e@x.tm')
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ email: 'e@x.tm' })
  })

  it('forgotPassword + resetPassword endpoints', async () => {
    mock.onPost('auth/forgot-password').reply(200, { sent: true })
    mock.onPost('auth/reset-password').reply(200, { ok: true })
    await repo.forgotPassword('e@x.tm')
    await repo.resetPassword({ email: 'e@x.tm', code: '111111', new_password: 'p' })
    expect(mock.history.post).toHaveLength(2)
  })

  it('me() GETs /auth/me', async () => {
    mock.onGet('auth/me').reply(200, { id: 5, username: 'me' })
    const res = await repo.me()
    expect(res.id).toBe(5)
  })

  it('propagates errors on bad credentials', async () => {
    mock.onPost('auth/login').reply(401, { error: 'bad creds' })
    await expect(repo.login({ username: 'x', password: 'y' })).rejects.toThrow()
  })
})
