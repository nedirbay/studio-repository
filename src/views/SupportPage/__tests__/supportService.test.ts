import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  messages: { create: vi.fn().mockResolvedValue({ id: 1 }) },
}))
vi.mock('../../../repositories', () => ({ repositories: { messages: m.messages } }))

import { supportService } from '../supportService'

describe('supportService', () => {
  it('send forwards payload', async () => {
    await supportService.send({ subject: 'S', message: 'm' })
    expect(m.messages.create).toHaveBeenCalledWith({ subject: 'S', message: 'm' })
  })
})
