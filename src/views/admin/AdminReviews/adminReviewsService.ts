import { repositories } from '../../../repositories'

export const adminReviewsService = {
  listAll() { return repositories.reviews.listAll() },
  remove(id: number) { return repositories.reviews.remove(id) },
}
