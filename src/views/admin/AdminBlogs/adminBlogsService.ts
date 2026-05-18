import { repositories } from '../../../repositories'
import type { BlogPayload } from '../../../repositories'

export const adminBlogsService = {
  list(page = 1, pageSize = 20) { return repositories.blogs.list(page, pageSize) },
  create(payload: BlogPayload) { return repositories.blogs.create(payload) },
  update(idOrSlug: number | string, payload: Partial<BlogPayload>) {
    return repositories.blogs.update(idOrSlug, payload)
  },
  remove(idOrSlug: number | string) { return repositories.blogs.remove(idOrSlug) },
  upload(file: File) { return repositories.uploads.uploadImage(file) },
}
