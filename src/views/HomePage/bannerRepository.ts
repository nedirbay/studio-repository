import { BaseRepository } from '../../utils/http'
import type { Banner } from '../types'

export interface BannerPayload {
  id?: number
  title: string
  subtitle?: string
  description?: string
  image: string
  ctaText?: string
  bgColor?: string
  product_id?: number | null
}

export class BannerRepository extends BaseRepository {
  async list(): Promise<Banner[]> {
    const res = await this.client.get('banners')
    return res.data
  }

  async create(payload: BannerPayload) {
    const res = await this.client.post('banners', payload)
    return res.data
  }

  async update(payload: BannerPayload & { id: number }) {
    const res = await this.client.put('banners', payload)
    return res.data
  }

  async remove(id: number) {
    const res = await this.client.delete('banners', { data: { id } })
    return res.data
  }
}
