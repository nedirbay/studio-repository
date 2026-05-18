import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  users: {
    list: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
    create: vi.fn().mockResolvedValue({ id: 3 }),
    update: vi.fn().mockResolvedValue({ id: 3, username: 'updated' }),
    remove: vi.fn().mockResolvedValue({ deleted: true }),
  },
}))
vi.mock('../../../../repositories', () => ({ repositories: { users: m.users } }))

import { adminUsersService } from '../adminUsersService'

describe('adminUsersService', () => {
  it('lists users', async () => {
    expect((await adminUsersService.list()).length).toBe(2)
  })
  it('creates and updates a user', async () => {
    expect((await adminUsersService.create({ username: 'n', password: 'p' })).id).toBe(3)
    expect((await adminUsersService.update(3, { username: 'updated' })).username).toBe('updated')
  })
  it('removes a user', async () => {
    expect((await adminUsersService.remove(3)).deleted).toBe(true)
  })
})
