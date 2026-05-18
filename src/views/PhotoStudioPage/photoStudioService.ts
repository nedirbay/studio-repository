import { PhotoStudioRepository, type ReelListOptions, type CollectionListOptions } from './photoStudioRepository'

const photoStudio = new PhotoStudioRepository()

export const photoStudioService = {
  listCategories() { return photoStudio.listCategories() },
  listCollections(opts: CollectionListOptions = {}) { return photoStudio.listCollections(opts) },
  fetchCollectionItems(collectionId: number, offset = 0, limit = 1) {
    return photoStudio.fetchCollectionItems(collectionId, offset, limit)
  },
  listReels(opts: ReelListOptions = {}) { return photoStudio.listReels(opts) },
  registerView(reelId: number) { return photoStudio.registerView(reelId) },
  toggleLike(reelId: number) { return photoStudio.toggleLike(reelId) },
  listComments(reelId: number) { return photoStudio.listComments(reelId) },
  addComment(reelId: number, text: string, parent: number | null = null) {
    return photoStudio.addComment(reelId, text, parent)
  },
  shareReel(reelId: number, channel = '') { return photoStudio.shareReel(reelId, channel) },
}
