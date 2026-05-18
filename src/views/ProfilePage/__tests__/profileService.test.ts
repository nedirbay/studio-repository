import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  auth: {
    me: vi.fn().mockResolvedValue({ id: 1, username: 'me' }),
    changePassword: vi.fn().mockResolvedValue({ ok: true }),
  },
  notifications: {
    list: vi.fn().mockResolvedValue([{ id: 1 }]),
    markAllRead: vi.fn().mockResolvedValue({ success: true }),
    remove: vi.fn().mockResolvedValue({ success: true }),
  },
}))
vi.mock('../../../repositories', () => ({
  repositories: { auth: m.auth, notifications: m.notifications },
}))

import { profileService } from '../profileService'

describe('profileService', () => {
  it('me returns current user', async () => {
    expect((await profileService.me()).username).toBe('me')
  })

  it('changePassword forwards payload', async () => {
    await profileService.changePassword({ old_password: 'a', new_password: 'b' })
    expect(m.auth.changePassword).toHaveBeenCalledWith({ old_password: 'a', new_password: 'b' })
  })

  it('listNotifications returns array', async () => {
    expect((await profileService.listNotifications()).length).toBe(1)
  })

  it('markNotificationsRead calls repo', async () => {
    await profileService.markNotificationsRead()
    expect(m.notifications.markAllRead).toHaveBeenCalled()
  })

  it('removeNotification passes id', async () => {
    await profileService.removeNotification(5)
    expect(m.notifications.remove).toHaveBeenCalledWith(5)
  })
})
