import {
  studioOrderService,
  isOrderApproved,
  type StudioOrderForm,
} from '../../StudioOrderPage/studioOrderService'
import type { StudioOrder, StudioOrderStatus } from '../../../types'

/**
 * Admin-facing operations over studio orders. Thin wrapper around the shared
 * `studioOrderService` so the management table and the customer page talk to
 * the exact same backend endpoints.
 */
export const adminStudioOrdersService = {
  list(): Promise<StudioOrder[]> {
    return studioOrderService.listOrders()
  },
  get(id: number): Promise<StudioOrder> {
    return studioOrderService.getOrder(id)
  },
  update(id: number, form: StudioOrderForm) {
    return studioOrderService.updateOrder(id, form)
  },
  remove(id: number) {
    return studioOrderService.deleteOrder(id)
  },
  setStatus(id: number, status: StudioOrderStatus) {
    return studioOrderService.setOrderStatus(id, status)
  },
  approve(id: number) {
    return studioOrderService.approveOrder(id)
  },
  reject(id: number) {
    return studioOrderService.rejectOrder(id)
  },
}

export { isOrderApproved }
