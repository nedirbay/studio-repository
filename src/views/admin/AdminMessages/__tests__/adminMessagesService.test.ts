import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  messages: {
    list: vi.fn().mockResolvedValue([{ id: 1 }]),
    reply: vi.fn().mockResolvedValue({ id: 1, reply: 'OK' }),
    markRead: vi.fn().mockResolvedValue({ id: 1, is_read: true }),
    remove: vi.fn().mockResolvedValue({ deleted: true }),
  },
}))
vi.mock('../../../../repositories', () => ({ repositories: { messages: m.messages } }))

import { adminMessagesService } from '../adminMessagesService'

describe('adminMessagesService', () => {
  it('list', async () => {
    expect((await adminMessagesService.list()).length).toBe(1)
  })
  it('reply forwards text', async () => {
    await adminMessagesService.reply(1, 'Hawa')
    expect(m.messages.reply).toHaveBeenCalledWith(1, 'Hawa')
  })
  it('markRead defaults to true', async () => {
    await adminMessagesService.markRead(1)
    expect(m.messages.markRead).toHaveBeenCalledWith(1, true)
  })
  it('remove passes id', async () => {
    expect((await adminMessagesService.remove(1)).deleted).toBe(true)
  })
})
