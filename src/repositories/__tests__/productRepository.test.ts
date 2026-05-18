import { describe, it, expect, beforeEach } from 'vitest'
import { ProductRepository } from '../productRepository'
import { makeTestClient } from './_testClient'

let repo: ProductRepository
let mock: ReturnType<typeof makeTestClient>['mock']

beforeEach(() => {
  const t = makeTestClient()
  mock = t.mock
  repo = new ProductRepository(t.client)
})

describe('ProductRepository', () => {
  it('lists products', async () => {
    mock.onGet('commerce/products').reply(200, [{ id: 1, name: 'P' }])
    expect((await repo.list())[0].name).toBe('P')
  })

  it('detail GETs by id', async () => {
    mock.onGet('commerce/products/42').reply(200, { id: 42 })
    expect((await repo.detail(42)).id).toBe(42)
  })

  it('detail propagates 404', async () => {
    mock.onGet('commerce/products/999').reply(404, { error: 'not found' })
    await expect(repo.detail(999)).rejects.toThrow()
  })

  it('create POSTs the payload', async () => {
    mock.onPost('commerce/products').reply(201, { id: 10 })
    const res = await repo.create({
      name: 'Lens',
      price: '50.00',
      category: 1,
      media: [{ kind: 'image', url: '/a.jpg' }],
    })
    expect(res.id).toBe(10)
    const sent = JSON.parse(mock.history.post[0].data)
    expect(sent.media[0].kind).toBe('image')
  })

  it('update PUTs to /commerce/products/{id}', async () => {
    mock.onPut('commerce/products/7').reply(200, { updated: true })
    const res = await repo.update(7, { instock: false })
    expect(res.updated).toBe(true)
  })

  it('remove DELETEs /commerce/products/{id}', async () => {
    mock.onDelete('commerce/products/7').reply(200, { deleted: true })
    expect((await repo.remove(7)).deleted).toBe(true)
  })
})
