import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  gifts: {
    listCampaigns: vi.fn().mockResolvedValue([{ id: 1, type: 'giveaway' }]),
    featured: vi.fn().mockResolvedValue([{ id: 2 }]),
    join: vi.fn().mockResolvedValue({ id: 5 }),
  },
}))
vi.mock('../../../repositories', () => ({ repositories: { gifts: m.gifts } }))

import { giftsService } from '../giftsService'

describe('giftsService', () => {
  it('list forwards filters', async () => {
    await giftsService.list({ type: 'giveaway', status: 'active' })
    expect(m.gifts.listCampaigns).toHaveBeenCalledWith({ type: 'giveaway', status: 'active' })
  })

  it('featured returns array', async () => {
    expect((await giftsService.featured())[0].id).toBe(2)
  })

  it('join forwards payload', async () => {
    await giftsService.join(9, { full_name: 'A', phone: '+9936' })
    expect(m.gifts.join).toHaveBeenCalledWith(9, { full_name: 'A', phone: '+9936' })
  })
})
