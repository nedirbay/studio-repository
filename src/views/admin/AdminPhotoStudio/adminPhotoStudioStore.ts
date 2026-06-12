import { reactive } from 'vue'
import type { PhotoCollection, PhotoReel } from '../../../types'

export const adminPhotoStudioStore = reactive({
  loading: false,
  tab: 'reels' as 'reels' | 'collections',
  reels: [] as PhotoReel[],
  collections: [] as PhotoCollection[],
  categories: [] as Array<{ id: number; name: string }>,
  search: '',
})

export function resetAdminPhotoStudioStore() {
  adminPhotoStudioStore.loading = false
  adminPhotoStudioStore.tab = 'reels'
  adminPhotoStudioStore.reels = []
  adminPhotoStudioStore.collections = []
  adminPhotoStudioStore.categories = []
  adminPhotoStudioStore.search = ''
}
