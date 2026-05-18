import { reactive } from 'vue'
import type { PhotoCollection, PhotoReel, PhotoReelComment } from '../../types'

export const photoStudioPageStore = reactive({
  loading: false,
  categories: [] as any[],
  collections: [] as PhotoCollection[],
  activeCollectionId: null as number | null,
  reels: [] as PhotoReel[],
  currentReelIndex: 0,
  comments: [] as PhotoReelComment[],
  commentDrawerOpen: false,
})

export function resetPhotoStudioStore() {
  photoStudioPageStore.loading = false
  photoStudioPageStore.categories = []
  photoStudioPageStore.collections = []
  photoStudioPageStore.activeCollectionId = null
  photoStudioPageStore.reels = []
  photoStudioPageStore.currentReelIndex = 0
  photoStudioPageStore.comments = []
  photoStudioPageStore.commentDrawerOpen = false
}
