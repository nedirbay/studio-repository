import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  banners: { list: vi.fn().mockResolvedValue([{ id: 1 }]) },
  promos: { list: vi.fn().mockResolvedValue([{ id: 2 }]) },
  categories: { list: vi.fn().mockResolvedValue([{ id: 3 }]) },
  products: { list: vi.fn().mockResolvedValue([{ id: 4 }]) },
  brands: { list: vi.fn().mockResolvedValue([{ id: 5 }]) },
}))
vi.mock('../../../repositories', () => ({
  repositories: {
    banners: m.banners, promos: m.promos, categories: m.categories,
    products: m.products, brands: m.brands,
  },
}))

import { homeService } from '../homeService'

describe('homeService', () => {
  it('aggregates home data', async () => {
    expect((await homeService.listBanners())[0].id).toBe(1)
    expect((await homeService.listPromos())[0].id).toBe(2)
    expect((await homeService.listCategories())[0].id).toBe(3)
    expect((await homeService.listProducts())[0].id).toBe(4)
    expect((await homeService.listBrands())[0].id).toBe(5)
  })
})
