<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Calendar, Edit, Document } from '@element-plus/icons-vue'
import {
  studioOrderService,
  computeTotal,
  formFromOrder,
  isOrderApproved,
} from './studioOrderService'
import { studioOrderStore, emptyDay, resetStudioOrderForm } from './studioOrderStore'
import { openContractPrint } from './studioContract'
import type { StudioOrder } from '../../types'

const s = studioOrderStore
const total = computed(() => computeTotal(s.form.days))

const rules = reactive({
  customer_name: [{ required: true, message: 'Ady hökman', trigger: 'blur' }],
  customer_phone: [{ required: true, message: 'Telefon hökman', trigger: 'blur' }],
})

async function loadAll() {
  s.loading = true
  try {
    const [types, equipments, services] = await studioOrderService.loadCatalogs()
    s.orderTypes = types
    s.equipments = equipments
    s.services = services
    s.orders = await studioOrderService.listOrders()
  } catch (e) {
    console.error('Failed to load studio order data', e)
  } finally {
    s.loading = false
  }
}

onMounted(loadAll)

function openCreate() {
  resetStudioOrderForm()
  s.dialogVisible = true
}

function openEdit(order: StudioOrder) {
  s.form = formFromOrder(order)
  s.editingId = order.id
  s.dialogVisible = true
}

function addDay() {
  s.form.days.push(emptyDay())
}

function removeDay(index: number) {
  s.form.days.splice(index, 1)
  if (s.form.days.length === 0) addDay()
}

function addEquipment(dayIndex: number) {
  s.form.days[dayIndex].equipments.push({ equipment_id: 0, count: 1 })
}

function removeEquipment(dayIndex: number, i: number) {
  s.form.days[dayIndex].equipments.splice(i, 1)
}

function addService(dayIndex: number) {
  s.form.days[dayIndex].services.push({ service_id: 0, count: 1 })
}

function removeService(dayIndex: number, i: number) {
  s.form.days[dayIndex].services.splice(i, 1)
}

function validate(): boolean {
  if (!s.form.customer_name.trim() || !s.form.customer_phone.trim()) {
    ElMessage.warning('Müşderiniň ady we telefony hökman')
    return false
  }
  for (const [i, d] of s.form.days.entries()) {
    if (!d.date || !d.address.trim()) {
      ElMessage.warning(`${i + 1}-nji günüň senesi we salgysy hökman`)
      return false
    }
  }
  return true
}

async function submit() {
  if (!validate()) return
  s.submitting = true
  try {
    if (s.editingId != null) {
      await studioOrderService.updateOrder(s.editingId, s.form)
      ElMessage.success('Sargyt täzelendi')
    } else {
      await studioOrderService.createOrder(s.form)
      ElMessage.success('Sargyt üstünlikli iberildi')
    }
    s.dialogVisible = false
    resetStudioOrderForm()
    s.orders = await studioOrderService.listOrders()
  } catch (e) {
    console.error('Failed to submit studio order', e)
  } finally {
    s.submitting = false
  }
}

async function deleteOrder(id: number) {
  try {
    await ElMessageBox.confirm('Bu sargydy pozmakçymy?', 'Tassyklaň', {
      confirmButtonText: 'Hawa',
      cancelButtonText: 'Ýok',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await studioOrderService.deleteOrder(id)
    s.orders = s.orders.filter((o) => o.id !== id)
    ElMessage.success('Sargyt pozuldy')
  } catch (e) {
    console.error('Failed to delete order', e)
  }
}

function downloadContract(order: StudioOrder) {
  if (!isOrderApproved(order)) {
    ElMessage.warning('Şertnama diňe tassyklanan sargyt üçin elýeterli')
    return
  }
  if (!openContractPrint(order)) {
    ElMessage.error('Penjire açylmady — açylýan penjireleri (popup) rugsat ediň')
  }
}

function statusLabel(order: StudioOrder): { text: string; type: 'success' | 'warning' | 'danger' | 'info' } {
  if (isOrderApproved(order)) return { text: 'Tassyklandy', type: 'success' }
  const status = String(order.status ?? '').toLowerCase()
  if (status === 'rejected') return { text: 'Ret edildi', type: 'danger' }
  if (status === 'completed') return { text: 'Tamamlandy', type: 'info' }
  return { text: 'Garaşylýar', type: 'warning' }
}

function formatDate(value: string) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('tk-TM')
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl md:text-3xl font-black text-gray-900">Studio Sargyt</h1>
        <p class="text-gray-500 text-sm mt-1">Sargytlaryňyz we olaryň ýagdaýy.</p>
      </div>
      <el-button type="primary" size="large" :icon="Plus" @click="openCreate">Sargyt et</el-button>
    </div>

    <!-- Orders table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <el-table :data="s.orders" v-loading="s.loading" style="width: 100%">
        <el-table-column label="#" width="80">
          <template #default="{ row }">
            <span class="font-black text-gray-400">#{{ row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Müşderi" min-width="180">
          <template #default="{ row }">
            <div class="font-bold text-gray-800 leading-tight">{{ row.customer_name }}</div>
            <div class="text-xs text-gray-400">{{ row.customer_phone }}</div>
          </template>
        </el-table-column>

        <el-table-column label="Günler" width="90" align="center">
          <template #default="{ row }">{{ row.days.length }}</template>
        </el-table-column>

        <el-table-column label="Sene" width="130">
          <template #default="{ row }">
            <span class="text-sm text-gray-600">{{ formatDate(row.created_at) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Jemi" width="120" align="right">
          <template #default="{ row }">
            <span class="font-black text-red-600">{{ row.total_amount }} TMT</span>
          </template>
        </el-table-column>

        <el-table-column label="Galan" width="120" align="right">
          <template #default="{ row }">
            <span class="text-sm text-gray-500">{{ row.remaining_amount }} TMT</span>
          </template>
        </el-table-column>

        <el-table-column label="Ýagdaýy" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="statusLabel(row).type" size="small" class="font-bold">
              {{ statusLabel(row).text }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Amallar" width="200" align="right">
          <template #default="{ row }">
            <div class="flex items-center justify-end gap-1">
              <el-tooltip content="Şertnama (PDF)">
                <el-button
                  type="success"
                  text
                  :icon="Document"
                  :disabled="!isOrderApproved(row)"
                  @click="downloadContract(row)"
                />
              </el-tooltip>
              <el-tooltip content="Üýtget">
                <el-button type="primary" text :icon="Edit" @click="openEdit(row)" />
              </el-tooltip>
              <el-tooltip content="Poz">
                <el-button type="danger" text :icon="Delete" @click="deleteOrder(row.id)" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <div class="py-16 text-center text-gray-400">
            <p class="font-bold mb-3">Heniz sargyt ýok</p>
            <el-button type="primary" :icon="Plus" @click="openCreate">Sargyt et</el-button>
          </div>
        </template>
      </el-table>
    </div>

    <!-- Create / edit dialog -->
    <el-dialog
      v-model="s.dialogVisible"
      :title="s.editingId != null ? 'Sargyt üýtgetmek' : 'Täze sargyt'"
      class="studio-order-dialog"
      width="90%"
      top="4vh"
      :close-on-click-modal="false"
    >
      <el-form :model="s.form" :rules="rules" label-position="top" class="studio-form">
        <!-- Customer block -->
        <div class="bg-gray-50 rounded-xl border border-gray-100 p-4 md:p-5 mb-4">
          <h2 class="font-bold text-gray-800 mb-3">Müşderi maglumatlary</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
            <el-form-item label="Ady" prop="customer_name">
              <el-input v-model="s.form.customer_name" placeholder="Ady Familiýasy" />
            </el-form-item>
            <el-form-item label="Telefon" prop="customer_phone">
              <el-input v-model="s.form.customer_phone" placeholder="+993 6X XX XX XX" />
            </el-form-item>
            <el-form-item label="Sargyt görnüşi" class="sm:col-span-2 md:col-span-1">
              <el-select v-model="s.form.order_type_id" placeholder="Saýlaň" clearable class="w-full">
                <el-option v-for="t in s.orderTypes" :key="t.id" :label="t.name" :value="t.id" />
              </el-select>
            </el-form-item>
          </div>
        </div>

        <!-- Days block -->
        <div
          v-for="(day, di) in s.form.days"
          :key="di"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5 mb-4"
        >
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-bold text-gray-800 flex items-center gap-2">
              <el-icon><Calendar /></el-icon> {{ di + 1 }}-nji gün
            </h2>
            <el-button
              v-if="s.form.days.length > 1"
              type="danger"
              text
              :icon="Delete"
              @click="removeDay(di)"
            >
              Aýyr
            </el-button>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
            <el-form-item label="Sene">
              <el-date-picker
                v-model="day.date"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Sene"
                class="w-full"
              />
            </el-form-item>
            <el-form-item label="Wagt">
              <el-time-picker
                v-model="day.time"
                value-format="HH:mm"
                format="HH:mm"
                placeholder="Wagt"
                class="w-full"
              />
            </el-form-item>
            <el-form-item label="Bir günlük baha (TMT)" class="col-span-2 md:col-span-1">
              <el-input-number v-model="day.daily_price" :min="0" :step="50" class="w-full" controls-position="right" />
            </el-form-item>
          </div>

          <el-form-item label="Salgy">
            <el-input
              v-model="day.address"
              type="textarea"
              :rows="3"
              resize="vertical"
              placeholder="Salgy / mekan"
            />
          </el-form-item>

          <!-- Equipments -->
          <div class="mt-1">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold text-gray-700">Enjamlar</span>
              <el-button size="small" :icon="Plus" @click="addEquipment(di)">Enjam goş</el-button>
            </div>
            <div v-for="(eq, ei) in day.equipments" :key="ei" class="flex items-center gap-2 mb-2">
              <el-select v-model="eq.equipment_id" placeholder="Enjam saýlaň" class="flex-1 min-w-0" filterable>
                <el-option
                  v-for="opt in s.equipments"
                  :key="opt.id"
                  :label="`${opt.name} (bar: ${opt.count})`"
                  :value="opt.id"
                />
              </el-select>
              <el-input-number v-model="eq.count" :min="1" class="w-24 sm:w-32 shrink-0" controls-position="right" />
              <el-button type="danger" text :icon="Delete" class="shrink-0" @click="removeEquipment(di, ei)" />
            </div>
          </div>

          <!-- Services -->
          <div class="mt-2">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold text-gray-700">Hyzmatlar</span>
              <el-button size="small" :icon="Plus" @click="addService(di)">Hyzmat goş</el-button>
            </div>
            <div v-for="(sv, si) in day.services" :key="si" class="flex items-center gap-2 mb-2">
              <el-select v-model="sv.service_id" placeholder="Hyzmat saýlaň" class="flex-1 min-w-0" filterable>
                <el-option v-for="opt in s.services" :key="opt.id" :label="opt.name" :value="opt.id" />
              </el-select>
              <el-input-number v-model="sv.count" :min="1" class="w-24 sm:w-32 shrink-0" controls-position="right" />
              <el-button type="danger" text :icon="Delete" class="shrink-0" @click="removeService(di, si)" />
            </div>
          </div>
        </div>

        <el-button :icon="Plus" @click="addDay">Ýene gün goş</el-button>
      </el-form>

      <template #footer>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="text-center sm:text-left">
            <span class="text-sm text-gray-500">Jemi baha:</span>
            <span class="text-xl font-black text-red-600 ml-2">{{ total }} TMT</span>
          </div>
          <div class="flex gap-2 justify-end">
            <el-button @click="s.dialogVisible = false">Goýbolsun</el-button>
            <el-button type="primary" :loading="s.submitting" @click="submit">
              {{ s.editingId != null ? 'Ýatda sakla' : 'Sargyt ber' }}
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<!-- Scoped: tighten vertical rhythm so form fields sit close together. -->
<style scoped>
.studio-form :deep(.el-form-item) {
  margin-bottom: 12px;
}
.studio-form :deep(.el-form-item__label) {
  padding-bottom: 2px;
  line-height: 1.3;
}
</style>

<!-- Global: the dialog is teleported to <body>, so it can't be reached by
     scoped styles. Cap its width on desktop and let it go near-full on phones. -->
<style>
.studio-order-dialog {
  max-width: 900px;
}
@media (max-width: 640px) {
  .studio-order-dialog {
    width: 96% !important;
    --el-dialog-padding-primary: 14px;
  }
  .studio-order-dialog .el-dialog__body {
    padding-top: 8px;
  }
}
</style>
