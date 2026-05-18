import { describe, it, expect, beforeEach } from 'vitest'
import { ReviewRepository } from '../reviewRepository'
import { makeTestClient } from './_testClient'

let repo: ReviewRepository
let mock: ReturnType<typeof makeTestClient>['mock']

beforeEach(() => {
  const t = makeTestClient()
  mock = t.mock
  repo = new ReviewRepository(t.client)
})

describe('ReviewRepository', () => {
  it('listByProduct returns array', async () => {
    mock.onGet('commerce/products/1/reviews').reply(200, [{ id: 1, rating: 5 }])
    const res = await repo.listByProduct(1)
    expect(res).toHaveLength(1)
  })

  it('create posts to product reviews endpoint', async () => {
    mock.onPost('commerce/products/1/reviews').reply(201, { id: 9 })
    const res = await repo.create(1, { rating: 4, content: 'Solid' })
    expect(res.id).toBe(9)
    const sent = JSON.parse(mock.history.post[0].data)
    expect(sent.rating).toBe(4)
  })

  it('create propagates 401 for unauthenticated user', async () => {
    mock.onPost('commerce/products/1/reviews').reply(401, { error: 'Login gerek' })
    await expect(repo.create(1, { rating: 5, content: 'x' })).rejects.toThrow()
  })

  it('listAll fetches all reviews for admin', async () => {
    mock.onGet('commerce/reviews').reply(200, [{ id: 1 }, { id: 2 }])
    expect(await repo.listAll()).toHaveLength(2)
  })

  it('remove DELETEs review by id', async () => {
    mock.onDelete('commerce/reviews/3').reply(200, { deleted: true })
    expect((await repo.remove(3)).deleted).toBe(true)
  })
})
