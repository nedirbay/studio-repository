import { defaultHttpClient } from '../../../utils/http'
import type { ManagementService, ManagementOrderType } from '../../../types'

export const adminStudioCatalogsService = {
  // Services (Hyzmatlar) CRUD
  listServices(): Promise<ManagementService[]> {
    return defaultHttpClient().get('management/services').then(res => res.data)
  },
  createService(name: string): Promise<{ id: number }> {
    return defaultHttpClient().post('management/services', { name }).then(res => res.data)
  },
  updateService(id: number, name: string): Promise<{ updated: boolean }> {
    return defaultHttpClient().put(`management/services/${id}`, { name }).then(res => res.data)
  },
  deleteService(id: number): Promise<{ deleted: boolean }> {
    return defaultHttpClient().delete(`management/services/${id}`).then(res => res.data)
  },

  // Order Types (Sargyt görnüşleri) CRUD
  listOrderTypes(): Promise<ManagementOrderType[]> {
    return defaultHttpClient().get('management/order-types').then(res => res.data)
  },
  createOrderType(name: string): Promise<{ id: number }> {
    return defaultHttpClient().post('management/order-types', { name }).then(res => res.data)
  },
  updateOrderType(id: number, name: string): Promise<{ updated: boolean }> {
    return defaultHttpClient().put(`management/order-types/${id}`, { name }).then(res => res.data)
  },
  deleteOrderType(id: number): Promise<{ deleted: boolean }> {
    return defaultHttpClient().delete(`management/order-types/${id}`).then(res => res.data)
  }
}
