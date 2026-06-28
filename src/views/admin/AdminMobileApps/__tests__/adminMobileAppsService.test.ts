import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  mobileApp: {
    getActive: vi.fn().mockResolvedValue({ id: 1, version_name: '1.0.0' }),
    listVersions: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
    uploadVersion: vi.fn().mockResolvedValue({ id: 3 }),
    activateVersion: vi.fn().mockResolvedValue({ id: 2, is_active: true }),
    deleteVersion: vi.fn().mockResolvedValue({ deleted: true })
  }
}))
vi.mock('../../../../repositories', () => ({
  repositories: {
    mobileApp: m.mobileApp
  }
}))

import { adminMobileAppsService } from '../adminMobileAppsService'

describe('adminMobileAppsService', () => {
  it('getActive', async () => {
    expect(await adminMobileAppsService.getActive()).toEqual({ id: 1, version_name: '1.0.0' })
    expect(m.mobileApp.getActive).toHaveBeenCalled()
  })
  it('listVersions', async () => {
    expect(await adminMobileAppsService.listVersions()).toEqual([{ id: 1 }, { id: 2 }])
    expect(m.mobileApp.listVersions).toHaveBeenCalled()
  })
  it('uploadVersion', async () => {
    const fd = new FormData()
    expect(await adminMobileAppsService.uploadVersion(fd)).toEqual({ id: 3 })
    expect(m.mobileApp.uploadVersion).toHaveBeenCalledWith(fd)
  })
  it('activateVersion', async () => {
    expect(await adminMobileAppsService.activateVersion(2)).toEqual({ id: 2, is_active: true })
    expect(m.mobileApp.activateVersion).toHaveBeenCalledWith(2)
  })
  it('deleteVersion', async () => {
    expect(await adminMobileAppsService.deleteVersion(2)).toEqual({ deleted: true })
    expect(m.mobileApp.deleteVersion).toHaveBeenCalledWith(2)
  })
})
