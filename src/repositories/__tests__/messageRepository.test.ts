import { describe, it, expect, beforeEach } from 'vitest'
import { MessageRepository } from '../messageRepository'
import { makeTestClient } from './_testClient'

let repo: MessageRepository
let mock: ReturnType<typeof makeTestClient>['mock']

beforeEach(() => {
  const t = makeTestClient()
  mock = t.mock
  repo = new MessageRepository(t.client)
})

describe('MessageRepository', () => {
  it('lists messages', async () => {
    mock.onGet('commerce/messages').reply(200, [{ id: 1 }])
    expect(await repo.list()).toHaveLength(1)
  })

  it('creates a contact message', async () => {
    mock.onPost('commerce/messages').reply(201, { id: 5 })
    const res = await repo.create({ subject: 'Q', message: 'Hi' })
    expect(res.id).toBe(5)
  })

  it('reply PUTs the reply field', async () => {
    mock.onPut('commerce/messages/5').reply(200, { id: 5, reply: 'Hawa' })
    const res = await repo.reply(5, 'Hawa')
    expect(JSON.parse(mock.history.put[0].data)).toEqual({ reply: 'Hawa' })
    expect(res.reply).toBe('Hawa')
  })

  it('markRead PUTs is_read', async () => {
    mock.onPut('commerce/messages/5').reply(200, { id: 5, is_read: true })
    await repo.markRead(5, true)
    expect(JSON.parse(mock.history.put[0].data)).toEqual({ is_read: true })
  })

  it('remove DELETEs message', async () => {
    mock.onDelete('commerce/messages/5').reply(200, { deleted: true })
    expect((await repo.remove(5)).deleted).toBe(true)
  })
})
