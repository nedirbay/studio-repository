import { CategoryRepository } from '../../ProductsPage/categoryRepository'

const categories = new CategoryRepository()

export const adminCategoriesService = {
  list() { return categories.list() },
  create(payload: { name: string; icon?: string; slug?: string }) {
    return categories.create(payload)
  },
}
