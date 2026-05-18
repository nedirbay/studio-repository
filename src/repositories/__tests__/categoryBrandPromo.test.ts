import { describe, it, expect, beforeEach } from 'vitest'
import { CategoryRepository } from '../categoryRepository'
import { BrandRepository } from '../brandRepository'
import { PromoRepository } from '../promoRepository'
import { makeTestClient } from './_testClient'

let mock: ReturnType<typeof makeTestClient>['mock']
let client: ReturnType<typeof makeTestClient>['client']

beforeEach(() => {
  const t = makeTestClient()
  mock = t.mock
  client = t.client
})

describe('CategoryRepository', () => {
  it('lists categories', async () => {
    mock.onGet('commerce/categories').reply(200, [{ id: 1, name: 'Cam' }])
    const res = await new CategoryRepository(client).list()
    expect(res[0].name).toBe('Cam')
  })
  it('creates category', async () => {
    mock.onPost('commerce/categories').reply(201, { id: 2 })
    const res = await new CategoryRepository(client).create({ name: 'Lens' })
    expect(res.id).toBe(2)
  })
})

describe('BrandRepository', () => {
  it('lists brands', async () => {
    mock.onGet('commerce/brands').reply(200, [{ id: 1, name: 'Canon' }])
    const res = await new BrandRepository(client).list()
    expect(res).toHaveLength(1)
  })
})

describe('PromoRepository', () => {
  it('lists promos', async () => {
    mock.onGet('promos').reply(200, [{ id: 1, title: 'Promo' }])
    const res = await new PromoRepository(client).list()
    expect(res[0].title).toBe('Promo')
  })
})
