import { BaseRepository } from '../../utils/http'
import type { Promo } from '../types'

export class PromoRepository extends BaseRepository {
  async list(): Promise<Promo[]> {
    const res = await this.client.get('promos')
    return res.data
  }
}
