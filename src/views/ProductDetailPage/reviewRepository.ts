import { BaseRepository } from '../../utils/http'
import type { ProductReview } from '../types'

export interface ReviewInput {
  rating: number
  title?: string
  content: string
}

export class ReviewRepository extends BaseRepository {
  async listByProduct(productId: number): Promise<ProductReview[]> {
    const res = await this.client.get(`commerce/products/${productId}/reviews`)
    return res.data
  }

  async create(productId: number, payload: ReviewInput) {
    const res = await this.client.post(`commerce/products/${productId}/reviews`, payload)
    return res.data
  }

  async listAll(): Promise<any[]> {
    const res = await this.client.get('commerce/reviews')
    return res.data
  }

  async remove(reviewId: number) {
    const res = await this.client.delete(`commerce/reviews/${reviewId}`)
    return res.data
  }
}
