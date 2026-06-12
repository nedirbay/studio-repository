import { BaseRepository } from '../../utils/http'
import type {
  StudioOrder,
  StudioOrderPayload,
  StudioOrderStatus,
  ManagementEquipment,
  ManagementService,
  ManagementOrderType,
} from '../../types'

/**
 * Talks to the backend `management` app (`/api/management/...`) — the same
 * endpoints/data model the Flutter `news_app` uses in
 * `services/sync_service.dart` (orders carry nested days, each with selected
 * equipments and services, plus assigned staff).
 *
 * Paths are relative to the axios `baseURL` (`/api`).
 */
export class StudioOrderRepository extends BaseRepository {
  async listOrders(): Promise<StudioOrder[]> {
    const res = await this.client.get('management/orders')
    return Array.isArray(res.data) ? res.data : []
  }

  async getOrder(id: number): Promise<StudioOrder> {
    const res = await this.client.get(`management/orders/${id}`)
    return res.data
  }

  async createOrder(payload: StudioOrderPayload): Promise<{ id: number }> {
    const res = await this.client.post('management/orders', payload)
    return res.data
  }

  async updateOrder(id: number, payload: StudioOrderPayload): Promise<{ updated: boolean }> {
    const res = await this.client.put(`management/orders/${id}`, payload)
    return res.data
  }

  async deleteOrder(id: number): Promise<{ deleted: boolean }> {
    const res = await this.client.delete(`management/orders/${id}`)
    return res.data
  }

  /**
   * Admin-only: move an order through its approval lifecycle (e.g. approve so
   * the customer can download the contract, or reject it).
   */
  async setOrderStatus(id: number, status: StudioOrderStatus): Promise<StudioOrder> {
    const res = await this.client.patch(`management/orders/${id}`, { status })
    return res.data
  }

  // --- Catalogs used to build an order ----------------------------------
  async listEquipments(): Promise<ManagementEquipment[]> {
    const res = await this.client.get('management/equipments')
    return Array.isArray(res.data) ? res.data : []
  }

  async listServices(): Promise<ManagementService[]> {
    const res = await this.client.get('management/services')
    return Array.isArray(res.data) ? res.data : []
  }

  async listOrderTypes(): Promise<ManagementOrderType[]> {
    const res = await this.client.get('management/order-types')
    return Array.isArray(res.data) ? res.data : []
  }
}
