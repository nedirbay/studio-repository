import { repositories } from '../../../repositories'
import type { OrderPayload } from '../../../repositories'

export const adminOrdersService = {
  list() { return repositories.orders.list() },
  detail(id: number) { return repositories.orders.detail(id) },
  create(payload: OrderPayload) { return repositories.orders.create(payload) },
  update(id: number, payload: OrderPayload) { return repositories.orders.update(id, payload) },
  remove(id: number) { return repositories.orders.remove(id) },
  byStaff(userId: number) { return repositories.orders.byStaff(userId) },
}
