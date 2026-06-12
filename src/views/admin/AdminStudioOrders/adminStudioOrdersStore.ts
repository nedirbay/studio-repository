import { reactive } from 'vue'
import type { StudioOrder } from '../../../types'

export const adminStudioOrdersStore = reactive({
  loading: false,
  orders: [] as StudioOrder[],
  search: '',
  statusFilter: '' as '' | 'pending' | 'approved' | 'rejected' | 'completed',
})

export function resetAdminStudioOrdersStore() {
  adminStudioOrdersStore.loading = false
  adminStudioOrdersStore.orders = []
  adminStudioOrdersStore.search = ''
  adminStudioOrdersStore.statusFilter = ''
}
