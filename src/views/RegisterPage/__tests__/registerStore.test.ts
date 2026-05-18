import { describe, it, expect } from 'vitest'
import { registerPageStore, resetRegisterPageStore } from '../registerStore'

describe('registerPageStore', () => {
  it('starts in form step with empty values', () => {
    resetRegisterPageStore()
    expect(registerPageStore.step).toBe('form')
    expect(registerPageStore.form.username).toBe('')
  })

  it('reset clears partial progress', () => {
    registerPageStore.step = 'otp'
    registerPageStore.form.username = 'x'
    registerPageStore.otpCode = '123456'
    resetRegisterPageStore()
    expect(registerPageStore.step).toBe('form')
    expect(registerPageStore.form.username).toBe('')
    expect(registerPageStore.otpCode).toBe('')
  })
})
