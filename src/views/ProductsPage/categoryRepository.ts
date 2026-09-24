import { BaseRepository } from '../../utils/http'
import type { Category } from '../types'

export class CategoryRepository extends BaseRepository {
  async list(): Promise<Category[]> {
    const res = await this.client.get('commerce/categories')
    return res.data
  }

  async create(payload: { name: string; icon?: string }) {
    const res = await this.client.post('commerce/categories', payload)
    return res.data
  }
}
