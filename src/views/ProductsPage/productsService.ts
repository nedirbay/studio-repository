import { ProductRepository } from './productRepository'
import { CategoryRepository } from './categoryRepository'
import { BrandRepository } from './brandRepository'

const products = new ProductRepository()
const categories = new CategoryRepository()
const brands = new BrandRepository()

export const productsService = {
  list() { return products.list() },
  listCategories() { return categories.list() },
  listBrands() { return brands.list() },
}
