import { BannerRepository } from './bannerRepository'
import { PromoRepository } from './promoRepository'
import { CategoryRepository } from '../ProductsPage/categoryRepository'
import { ProductRepository } from '../ProductsPage/productRepository'
import { BrandRepository } from '../ProductsPage/brandRepository'

const banners = new BannerRepository()
const promos = new PromoRepository()
const categories = new CategoryRepository()
const products = new ProductRepository()
const brands = new BrandRepository()

export const homeService = {
  listBanners() { return banners.list() },
  listPromos() { return promos.list() },
  listCategories() { return categories.list() },
  listProducts() { return products.list() },
  listBrands() { return brands.list() },
}
