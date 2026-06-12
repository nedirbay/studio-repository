import { StudioOrderRepository } from './studioOrderRepository'
import type {
  StudioOrder,
  StudioOrderDay,
  StudioOrderPayload,
  StudioOrderStatus,
} from '../../types'

// Lazily built so importing the pure helpers (computeTotal/buildPayload) in
// tests doesn't require the app's HTTP client to be configured.
let _repo: StudioOrderRepository | undefined
const studioOrders = () => (_repo ?? (_repo = new StudioOrderRepository()))

export interface StudioOrderForm {
  customer_name: string
  customer_phone: string
  order_type_id: number | null
  days: StudioOrderDay[]
}

/**
 * Turn a saved order back into an editable form (the inverse of
 * `buildPayload`), so the "edit" dialog opens pre-filled.
 */
export function formFromOrder(order: StudioOrder): StudioOrderForm {
  return {
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    order_type_id: order.order_type_id,
    days: order.days.map((d) => ({
      date: d.date,
      time: d.time ?? '',
      address: d.address,
      daily_price: Number(d.daily_price) || 0,
      equipments: d.equipments.map((e) => ({
        equipment_id: e.equipment_id,
        count: Number(e.count) || 1,
      })),
      services: d.services.map((s) => ({
        service_id: s.service_id,
        count: Number(s.count) || 1,
      })),
    })),
  }
}

/**
 * Whether management has approved the order — the gate for turning it into a
 * contract. Accepts the explicit `is_approved` flag or a `status` string so it
 * works regardless of which the backend returns.
 */
export function isOrderApproved(order: Pick<StudioOrder, 'status' | 'is_approved'>): boolean {
  if (order.is_approved) return true
  const status = String(order.status ?? '').toLowerCase()
  return status === 'approved' || status === 'confirmed' || status === 'tassyklandy'
}

/** Sum of every day's price — the order total the customer commits to. */
export function computeTotal(days: StudioOrderDay[]): number {
  return days.reduce((sum, d) => sum + (Number(d.daily_price) || 0), 0)
}

/** Turn the UI form into the exact body the backend expects. */
export function buildPayload(form: StudioOrderForm): StudioOrderPayload {
  return {
    customer_name: form.customer_name.trim(),
    customer_phone: form.customer_phone.trim(),
    order_type_id: form.order_type_id,
    total_amount: computeTotal(form.days),
    paid_amount: 0,
    days: form.days.map((d) => ({
      date: d.date,
      time: d.time || null,
      address: d.address,
      daily_price: Number(d.daily_price) || 0,
      equipments: d.equipments.filter((e) => e.equipment_id).map((e) => ({
        equipment_id: e.equipment_id,
        count: Number(e.count) || 1,
      })),
      services: d.services.filter((s) => s.service_id).map((s) => ({
        service_id: s.service_id,
        count: Number(s.count) || 1,
      })),
    })),
    // Staff is assigned later by management; customers leave it empty.
    staff: [],
  }
}

export const studioOrderService = {
  listOrders() {
    return studioOrders().listOrders()
  },
  getOrder(id: number) {
    return studioOrders().getOrder(id)
  },
  createOrder(form: StudioOrderForm) {
    return studioOrders().createOrder(buildPayload(form))
  },
  updateOrder(id: number, form: StudioOrderForm) {
    return studioOrders().updateOrder(id, buildPayload(form))
  },
  deleteOrder(id: number) {
    return studioOrders().deleteOrder(id)
  },
  setOrderStatus(id: number, status: StudioOrderStatus) {
    return studioOrders().setOrderStatus(id, status)
  },
  approveOrder(id: number) {
    return studioOrders().setOrderStatus(id, 'approved')
  },
  rejectOrder(id: number) {
    return studioOrders().setOrderStatus(id, 'rejected')
  },
  loadCatalogs() {
    return Promise.all([
      studioOrders().listOrderTypes(),
      studioOrders().listEquipments(),
      studioOrders().listServices(),
    ])
  },
}
