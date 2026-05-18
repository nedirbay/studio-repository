import { ProductRepository } from '../ProductsPage/productRepository'

const products = new ProductRepository()

export const dealsService = {
  list() { return products.list() },
}
