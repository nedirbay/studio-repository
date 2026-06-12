import { photoStudioService } from '../../PhotoStudioPage/photoStudioService'
import type { PhotoCollection, PhotoReel } from '../../../types'

/**
 * Admin operations for the PhotoStudio (reels + collections), reusing the same
 * `photoStudioService` the public page uses for reads.
 */
export const adminPhotoStudioService = {
  listCategories() {
    return photoStudioService.listCategories()
  },
  listReels() {
    return photoStudioService.listReels()
  },
  listCollections() {
    return photoStudioService.listCollections()
  },

  createReel(payload: Partial<PhotoReel>) {
    return photoStudioService.createReel(payload)
  },
  updateReel(id: number, payload: Partial<PhotoReel>) {
    return photoStudioService.updateReel(id, payload)
  },
  deleteReel(id: number) {
    return photoStudioService.deleteReel(id)
  },
  /** Toggle a reel's published flag without touching its other fields. */
  setReelPublished(id: number, isPublished: boolean) {
    return photoStudioService.updateReel(id, { is_published: isPublished })
  },

  createCollection(payload: Partial<PhotoCollection>) {
    return photoStudioService.createCollection(payload)
  },
  updateCollection(id: number, payload: Partial<PhotoCollection>) {
    return photoStudioService.updateCollection(id, payload)
  },
  deleteCollection(id: number) {
    return photoStudioService.deleteCollection(id)
  },
}
