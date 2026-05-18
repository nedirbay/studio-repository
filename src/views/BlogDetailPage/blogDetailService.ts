import { BlogRepository } from '../BlogListPage/blogRepository'

const blogs = new BlogRepository()

export const blogDetailService = {
  get(slugOrId: string | number) {
    return blogs.detail(slugOrId)
  },
}
