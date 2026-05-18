import { repositories } from '../../../repositories'
import type { BannerPayload } from '../../../repositories'

export const adminBannersService = {
  list() { return repositories.banners.list() },
  create(payload: BannerPayload) { return repositories.banners.create(payload) },
  update(payload: BannerPayload & { id: number }) { return repositories.banners.update(payload) },
  remove(id: number) { return repositories.banners.remove(id) },
  upload(file: File) { return repositories.uploads.uploadImage(file) },
}
