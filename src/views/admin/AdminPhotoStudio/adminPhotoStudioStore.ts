import { reactive } from 'vue'

export interface PhotoStudioVideo {
  id: number
  title: string
  description?: string
  thumbnail_image?: string
  thumbnail_image_url?: string
  video?: string
  video_url?: string
  hls_playlist?: string
  hls_url?: string
  hls_status?: string
  hls_error?: string
  create_at?: string
}

export interface PhotoStudioImage {
  id: number
  title: string
  description?: string
  thumbnail_image?: string
  thumbnail_image_url?: string
  image?: string
  image_url?: string
  create_at?: string
}

export const adminPhotoStudioStore = reactive({
  loading: false,
  tab: 'videos' as 'videos' | 'images',
  videos: [] as PhotoStudioVideo[],
  images: [] as PhotoStudioImage[],
  search: '',
  videosPage: 1,
  imagesPage: 1,
  videosTotal: 0,
  imagesTotal: 0,
  pageSize: 10,
})

export function resetAdminPhotoStudioStore() {
  adminPhotoStudioStore.loading = false
  adminPhotoStudioStore.tab = 'videos'
  adminPhotoStudioStore.videos = []
  adminPhotoStudioStore.images = []
  adminPhotoStudioStore.search = ''
  adminPhotoStudioStore.videosPage = 1
  adminPhotoStudioStore.imagesPage = 1
  adminPhotoStudioStore.videosTotal = 0
  adminPhotoStudioStore.imagesTotal = 0
}
