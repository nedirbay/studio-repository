import { BaseRepository } from '../../utils/http'

export interface ProductMediaInput {
  kind: 'image' | 'video'
  url: string
}

export interface ProductPayload {
  id?: number
  name: string
  price: number | string
  original_price?: number | string | null
  instock?: boolean
  marka?: string | null
  category: number
  media?: ProductMediaInput[]
  description?: string | null
  features?: any[]
  specifications?: Record<string, any>
  badge?: string | null
}

export class ProductRepository extends BaseRepository {
  async list(): Promise<any[]> {
    const res = await this.client.get('commerce/product-catalog')
    return res.data
  }

  async listLatest(): Promise<any[]> {
    const res = await this.client.get('commerce/latest-products')
    return res.data
  }

  async detail(id: number) {
    const res = await this.client.get(`commerce/products/${id}`)
    return res.data
  }

  async create(payload: ProductPayload) {
    const res = await this.client.post('commerce/products', payload)
    return res.data
  }

  async update(id: number, payload: Partial<ProductPayload>) {
    const res = await this.client.put(`commerce/products/${id}`, payload)
    return res.data
  }

  async remove(id: number) {
    const res = await this.client.delete(`commerce/products/${id}`)
    return res.data
  }
}
