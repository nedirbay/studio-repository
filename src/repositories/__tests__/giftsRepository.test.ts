import { describe, it, expect, beforeEach } from 'vitest'
import { GiftsRepository } from '../giftsRepository'
import { makeTestClient } from './_testClient'

let repo: GiftsRepository
let mock: ReturnType<typeof makeTestClient>['mock']

beforeEach(() => {
  const t = makeTestClient()
  mock = t.mock
  repo = new GiftsRepository(t.client)
})

describe('GiftsRepository', () => {
  it('lists campaigns with filters', async () => {
    mock.onGet('gifts/campaigns/').reply((c) => {
      expect(c.params).toEqual({ type: 'giveaway', status: 'active' })
      return [200, [{ id: 1, type: 'giveaway' }]]
    })
    const res = await repo.listCampaigns({ type: 'giveaway', status: 'active' })
    expect(res).toHaveLength(1)
  })

  it('featured returns array', async () => {
    mock.onGet('gifts/campaigns/featured/').reply(200, [{ id: 2 }])
    expect((await repo.featured())[0].id).toBe(2)
  })

  it('join posts payload', async () => {
    mock.onPost('gifts/campaigns/9/join/').reply(201, { id: 7 })
    const res = await repo.join(9, { full_name: 'A', phone: '+9936' })
    expect(res.id).toBe(7)
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ full_name: 'A', phone: '+9936' })
  })

  it('join propagates 400 when campaign is inactive', async () => {
    mock.onPost('gifts/campaigns/9/join/').reply(400, { detail: 'inactive' })
    await expect(repo.join(9, { full_name: 'A', phone: '+9936' })).rejects.toThrow()
  })
})
