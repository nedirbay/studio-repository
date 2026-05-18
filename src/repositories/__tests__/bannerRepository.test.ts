import { describe, it, expect, beforeEach } from 'vitest'
import { BannerRepository } from '../bannerRepository'
import { makeTestClient } from './_testClient'

let repo: BannerRepository
let mock: ReturnType<typeof makeTestClient>['mock']

beforeEach(() => {
  const t = makeTestClient()
  mock = t.mock
  repo = new BannerRepository(t.client)
})

describe('BannerRepository', () => {
  it('lists banners', async () => {
    mock.onGet('banners').reply(200, [{ id: 1, title: 'B' }])
    const res = await repo.list()
    expect(res).toHaveLength(1)
  })

  it('creates banner', async () => {
    mock.onPost('banners').reply(201, { id: 5, title: 'New' })
    const res = await repo.create({ title: 'New', image: '/x.jpg' })
    expect(res.id).toBe(5)
  })

  it('updates banner via PUT', async () => {
    mock.onPut('banners').reply(200, { id: 5, title: 'Updated' })
    const res = await repo.update({ id: 5, title: 'Updated', image: '/x.jpg' })
    expect(res.title).toBe('Updated')
  })

  it('removes banner with id in body', async () => {
    mock.onDelete('banners').reply(200, { deleted: true })
    await repo.remove(5)
    // axios-mock-adapter exposes config.data as a string for DELETE bodies
    const sentData = mock.history.delete[0].data
    expect(JSON.parse(sentData)).toEqual({ id: 5 })
  })
})
