import { BaseRepository } from '../../utils/http'
import type { Brand } from '../../types'

export class BrandRepository extends BaseRepository {
  async list(): Promise<Brand[]> {
    const res = await this.client.get('commerce/brands')
    return res.data
  }

  async create(payload: { name: string; logo_url?: string }) {
    const res = await this.client.post('commerce/brands', payload)
    return res.data
  }

  async update(id: number, payload: { name?: string; logo_url?: string }) {
    const res = await this.client.put(`commerce/brands/${id}`, payload)
    return res.data
  }

  async remove(id: number) {
    const res = await this.client.delete(`commerce/brands/${id}`)
    return res.data
  }
}
