import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  products: { list: vi.fn().mockResolvedValue([{ id: 1 }]) },
  categories: { list: vi.fn().mockResolvedValue([{ id: 1, name: 'Cat' }]) },
  brands: { list: vi.fn().mockResolvedValue([{ id: 1, name: 'B' }]) },
}))
vi.mock('../../../repositories', () => ({
  repositories: { products: m.products, categories: m.categories, brands: m.brands },
}))

import { productsService } from '../productsService'

describe('productsService', () => {
  it('lists products', async () => {
    expect((await productsService.list()).length).toBe(1)
  })
  it('lists categories', async () => {
    expect((await productsService.listCategories()).length).toBe(1)
  })
  it('lists brands', async () => {
    expect((await productsService.listBrands())[0].name).toBe('B')
  })
})
