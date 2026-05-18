import { ProductRepository } from '../ProductsPage/productRepository'

const products = new ProductRepository()

export const newArrivalsService = {
  list() { return products.list() },
}
