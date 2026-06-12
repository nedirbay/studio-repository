import { reactive } from 'vue'
import type {
  ManagementEquipment,
  ManagementOrderType,
  ManagementService,
  StudioOrder,
  StudioOrderDay,
} from '../../types'
import type { StudioOrderForm } from './studioOrderService'

export function emptyDay(): StudioOrderDay {
  return {
    date: '',
    time: '',
    address: '',
    daily_price: 0,
    equipments: [],
    services: [],
  }
}

function emptyForm(): StudioOrderForm {
  return {
    customer_name: '',
    customer_phone: '',
    order_type_id: null,
    days: [emptyDay()],
  }
}

export const studioOrderStore = reactive({
  loading: false,
  submitting: false,
  // Catalogs for building an order
  orderTypes: [] as ManagementOrderType[],
  equipments: [] as ManagementEquipment[],
  services: [] as ManagementService[],
  // The customer's existing studio orders
  orders: [] as StudioOrder[],
  // The order being composed / edited
  form: emptyForm(),
  // Create/edit dialog state. `editingId` is null for a new order, otherwise
  // the id of the order being edited.
  dialogVisible: false,
  editingId: null as number | null,
})

export function resetStudioOrderForm() {
  studioOrderStore.form = emptyForm()
  studioOrderStore.editingId = null
}

export function resetStudioOrderStore() {
  studioOrderStore.loading = false
  studioOrderStore.submitting = false
  studioOrderStore.orderTypes = []
  studioOrderStore.equipments = []
  studioOrderStore.services = []
  studioOrderStore.orders = []
  studioOrderStore.dialogVisible = false
  resetStudioOrderForm()
}
