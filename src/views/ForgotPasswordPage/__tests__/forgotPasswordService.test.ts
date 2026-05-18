import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  auth: {
    forgotPassword: vi.fn().mockResolvedValue({ message: 'sent' }),
    resetPassword: vi.fn().mockResolvedValue({ message: 'ok' }),
  },
}))
vi.mock('../../../repositories', () => ({ repositories: { auth: m.auth } }))

import { forgotPasswordService } from '../forgotPasswordService'

describe('forgotPasswordService', () => {
  it('requestCode forwards email', async () => {
    await forgotPasswordService.requestCode('e@x.tm')
    expect(m.auth.forgotPassword).toHaveBeenCalledWith('e@x.tm')
  })

  it('resetPassword forwards payload', async () => {
    await forgotPasswordService.resetPassword({ email: 'e@x.tm', code: '1', new_password: 'p' })
    expect(m.auth.resetPassword).toHaveBeenCalledWith({ email: 'e@x.tm', code: '1', new_password: 'p' })
  })
})
