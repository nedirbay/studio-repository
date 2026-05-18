import { describe, it, expect, beforeEach } from 'vitest'
import { UserRepository } from '../userRepository'
import { makeTestClient } from './_testClient'

let repo: UserRepository
let mock: ReturnType<typeof makeTestClient>['mock']

beforeEach(() => {
  const t = makeTestClient()
  mock = t.mock
  repo = new UserRepository(t.client)
})

describe('UserRepository', () => {
  it('list GETs users/', async () => {
    mock.onGet('users/').reply(200, [{ id: 1 }, { id: 2 }])
    const res = await repo.list()
    expect(res).toHaveLength(2)
  })

  it('create POSTs users/', async () => {
    mock.onPost('users/').reply(201, { id: 3 })
    const res = await repo.create({ username: 'new', email: 'n@x.tm', password: 'p', role_input: 'Staff' })
    expect(res.id).toBe(3)
  })

  it('update PUTs users/{id}/', async () => {
    mock.onPut('users/7/').reply(200, { id: 7, username: 'updated' })
    const res = await repo.update(7, { username: 'updated' })
    expect(res.username).toBe('updated')
  })

  it('remove DELETEs users/{id}/', async () => {
    mock.onDelete('users/9/').reply(200, { deleted: true })
    const res = await repo.remove(9)
    expect(res.deleted).toBe(true)
  })
})
