import { defaultHttpClient } from '../../../utils/http'

export interface PaginatedResult<T> {
  count: number
  results: T[]
}

export const adminPhotoStudioService = {
  listVideos(page = 1, pageSize = 10): Promise<PaginatedResult<any>> {
    return defaultHttpClient().get('photostudio/videos/', { params: { page, page_size: pageSize } }).then(res => {
      if (Array.isArray(res.data)) return { count: res.data.length, results: res.data }
      return { count: res.data.count ?? 0, results: res.data.results ?? [] }
    })
  },
  listImages(page = 1, pageSize = 10): Promise<PaginatedResult<any>> {
    return defaultHttpClient().get('photostudio/images/', { params: { page, page_size: pageSize } }).then(res => {
      if (Array.isArray(res.data)) return { count: res.data.length, results: res.data }
      return { count: res.data.count ?? 0, results: res.data.results ?? [] }
    })
  },

  createVideo(formData: FormData) {
    return defaultHttpClient().post('photostudio/videos/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data)
  },
  updateVideo(id: number, formData: FormData) {
    return defaultHttpClient().patch(`photostudio/videos/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data)
  },
  deleteVideo(id: number) {
    return defaultHttpClient().delete(`photostudio/videos/${id}/`).then(res => res.data)
  },

  createImage(formData: FormData) {
    return defaultHttpClient().post('photostudio/images/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data)
  },
  updateImage(id: number, formData: FormData) {
    return defaultHttpClient().patch(`photostudio/images/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data)
  },
  deleteImage(id: number) {
    return defaultHttpClient().delete(`photostudio/images/${id}/`).then(res => res.data)
  }
}
