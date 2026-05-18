import { BaseRepository } from '../../utils/http'
import type { Brand } from '../types'

export class BrandRepository extends BaseRepository {
  async list(): Promise<Brand[]> {
    const res = await this.client.get('commerce/brands')
    return res.data
  }
}
