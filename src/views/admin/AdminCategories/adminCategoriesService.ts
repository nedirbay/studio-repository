import { repositories } from '../../../repositories'

export const adminCategoriesService = {
  list() { return repositories.categories.list() },
  create(payload: { name: string; icon?: string }) {
    return repositories.categories.create(payload)
  },
}
