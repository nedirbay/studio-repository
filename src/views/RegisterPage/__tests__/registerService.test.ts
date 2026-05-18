import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  auth: {
    register: vi.fn().mockResolvedValue({ email: 'e@x.tm' }),
    verifyOtp: vi.fn().mockResolvedValue({ jwt: 'J', refresh: 'R', user: { id: 1 } }),
    resendOtp: vi.fn().mockResolvedValue({ message: 'sent' }),
  },
}))
vi.mock('../../../repositories', () => ({ repositories: { auth: m.auth } }))

import { registerService } from '../registerService'

describe('registerService', () => {
  it('register delegates to repositories.auth.register', async () => {
    await registerService.register({ username: 'u', email: 'e@x.tm', password: 'p' })
    expect(m.auth.register).toHaveBeenCalledWith({ username: 'u', email: 'e@x.tm', password: 'p' })
  })

  it('verifyOtp returns tokens', async () => {
    const res = await registerService.verifyOtp({ email: 'e@x.tm', code: '111111' })
    expect(res.jwt).toBe('J')
  })

  it('resendOtp passes email', async () => {
    await registerService.resendOtp('e@x.tm')
    expect(m.auth.resendOtp).toHaveBeenCalledWith('e@x.tm')
  })
})
