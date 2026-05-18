import { repositories } from '../../../repositories'

export const adminDashboardService = {
  loadSummary() {
    return Promise.all([
      repositories.products.list(),
      repositories.users.list(),
      repositories.orders.list(),
      repositories.reviews.listAll(),
    ]).then(([products, users, orders, reviews]) => ({ products, users, orders, reviews }))
  },
}
