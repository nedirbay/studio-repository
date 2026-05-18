import { ProductRepository, type ProductPayload } from '../../ProductsPage/productRepository'
import { UploadRepository } from './uploadRepository'

const products = new ProductRepository()
const uploads = new UploadRepository()

export const adminProductsService = {
  list() { return products.list() },
  create(payload: ProductPayload) { return products.create(payload) },
  update(id: number, payload: Partial<ProductPayload>) { return products.update(id, payload) },
  remove(id: number) { return products.remove(id) },
  upload(file: File) { return uploads.uploadImage(file) },
}
