import { repositories } from '../../repositories'

export const homeService = {
  listBanners() { return repositories.banners.list() },
  listPromos() { return repositories.promos.list() },
  listCategories() { return repositories.categories.list() },
  listProducts() { return repositories.products.list() },
  listLatestProducts() { return repositories.products.listLatest() },
  listBrands() { return repositories.brands.list() },
}
