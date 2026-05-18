import { BaseRepository } from '../../../utils/http'
import type { Order } from '../types'

export interface OrderDayInput {
  date: string
  address: string
  daily_price: number | string
  time?: string | null
}

export interface OrderStaffInput {
  user_id: number
  role?: string | null
}

export interface OrderPayload {
  customer_name: string
  customer_phone: string
  total_amount: number | string
  paid_amount: number | string
  order_type_id?: number | null
  days?: OrderDayInput[]
  staff?: OrderStaffInput[]
}

export class OrderRepository extends BaseRepository {
  async list(): Promise<Order[]> {
    const res = await this.client.get('orders')
    return res.data
  }

  async detail(id: number) {
    const res = await this.client.get(`orders/${id}`)
    return res.data
  }

  async create(payload: OrderPayload) {
    const res = await this.client.post('orders', payload)
    return res.data
  }

  async update(id: number, payload: OrderPayload) {
    const res = await this.client.put(`orders/${id}`, payload)
    return res.data
  }

  async remove(id: number) {
    const res = await this.client.delete(`orders/${id}`)
    return res.data
  }

  async byStaff(userId: number) {
    const res = await this.client.get(`orders/staff/${userId}`)
    return res.data
  }
}
