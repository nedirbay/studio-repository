import { ProductRepository } from '../ProductsPage/productRepository'
import { ReviewRepository, type ReviewInput } from './reviewRepository'
import { MessageRepository, type ContactMessagePayload } from '../SupportPage/messageRepository'

const products = new ProductRepository()
const reviews = new ReviewRepository()
const messages = new MessageRepository()

export const productDetailService = {
  get(id: number) {
    return products.detail(id)
  },
  listReviews(productId: number) {
    return reviews.listByProduct(productId)
  },
  postReview(productId: number, payload: ReviewInput) {
    return reviews.create(productId, payload)
  },
  sendContactMessage(payload: ContactMessagePayload) {
    return messages.create(payload)
  },
}
