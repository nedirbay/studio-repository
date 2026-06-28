import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  gifts: {
    fetchCampaigns: vi.fn().mockResolvedValue([{ id: 1 }]),
    createCampaign: vi.fn().mockResolvedValue({ id: 2 }),
    updateCampaign: vi.fn().mockResolvedValue({ id: 1 }),
    deleteCampaign: vi.fn().mockResolvedValue({ deleted: true }),
    fetchCampaignParticipants: vi.fn().mockResolvedValue([{ id: 3 }]),
    updateParticipantStatus: vi.fn().mockResolvedValue({ id: 3, status: 'won' })
  }
}))
vi.mock('../../../../repositories', () => ({
  repositories: {
    gifts: m.gifts
  }
}))

import { adminGiftsService } from '../adminGiftsService'

describe('adminGiftsService', () => {
  it('fetchCampaigns', async () => {
    const filters = { type: 'giveaway' }
    expect(await adminGiftsService.fetchCampaigns(filters)).toEqual([{ id: 1 }])
    expect(m.gifts.fetchCampaigns).toHaveBeenCalledWith(filters)
  })
  it('createCampaign', async () => {
    const payload = { title: 'New' }
    expect(await adminGiftsService.createCampaign(payload)).toEqual({ id: 2 })
    expect(m.gifts.createCampaign).toHaveBeenCalledWith(payload)
  })
  it('updateCampaign', async () => {
    const payload = { title: 'Updated' }
    expect(await adminGiftsService.updateCampaign(1, payload)).toEqual({ id: 1 })
    expect(m.gifts.updateCampaign).toHaveBeenCalledWith(1, payload)
  })
  it('deleteCampaign', async () => {
    expect(await adminGiftsService.deleteCampaign(1)).toEqual({ deleted: true })
    expect(m.gifts.deleteCampaign).toHaveBeenCalledWith(1)
  })
  it('fetchCampaignParticipants', async () => {
    expect(await adminGiftsService.fetchCampaignParticipants(1)).toEqual([{ id: 3 }])
    expect(m.gifts.fetchCampaignParticipants).toHaveBeenCalledWith(1)
  })
  it('updateParticipantStatus', async () => {
    expect(await adminGiftsService.updateParticipantStatus(3, 'won')).toEqual({ id: 3, status: 'won' })
    expect(m.gifts.updateParticipantStatus).toHaveBeenCalledWith(3, 'won')
  })
})
