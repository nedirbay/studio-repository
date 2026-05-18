import { BlogRepository } from './blogRepository'

const blogs = new BlogRepository()

export const blogListService = {
  list(page: number = 1, pageSize: number = 6) {
    return blogs.list(page, pageSize)
  },
}
