import { BaseRepository } from '../../utils/http'

export interface BlogMediaInput {
  kind: 'image' | 'video'
  url: string
}

export interface BlogPayload {
  title: string
  main_image: string
  content?: string
  date?: string
  media?: BlogMediaInput[]
}

export interface PaginatedBlogs {
  count: number
  page: number
  page_size: number
  results: any[]
}

export class BlogRepository extends BaseRepository {
  async list(page: number = 1, pageSize: number = 3): Promise<PaginatedBlogs> {
    const res = await this.client.get('blogs', { params: { page, page_size: pageSize } })
    return res.data
  }

  async detail(idOrSlug: number | string) {
    const res = await this.client.get(`blogs/${idOrSlug}`)
    return res.data
  }

  async create(payload: BlogPayload) {
    const res = await this.client.post('blogs', payload)
    return res.data
  }

  async update(idOrSlug: number | string, payload: Partial<BlogPayload>) {
    const res = await this.client.put(`blogs/${idOrSlug}`, payload)
    return res.data
  }

  async remove(idOrSlug: number | string) {
    const res = await this.client.delete(`blogs/${idOrSlug}`)
    return res.data
  }
}
