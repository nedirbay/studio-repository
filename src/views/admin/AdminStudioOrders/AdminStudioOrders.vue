<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Check,
  Close,
  Delete,
  Document,
  InfoFilled,
  ShoppingCart,
} from '@element-plus/icons-vue'
import { adminStudioOrdersService, isOrderApproved } from './adminStudioOrdersService'
import { adminStudioOrdersStore } from './adminStudioOrdersStore'
import { openContractPrint } from '../../StudioOrderPage/studioContract'
import type { StudioOrder } from '../../../types'

const s = adminStudioOrdersStore
const detail = ref<StudioOrder | null>(null)
const detailVisible = ref(false)

async function load() {
  s.loading = true
  try {
    s.orders = await adminStudioOrdersService.list()
  } catch (e) {
    console.error('Failed to load studio orders', e)
    ElMessage.error('Sargytlary ýükläp bolmady')
  } finally {
    s.loading = false
  }
}

onMounted(load)

const filtered = computed(() => {
  const q = s.search.trim().toLowerCase()
  return s.orders
    .filter((o) => {
      if (s.statusFilter) {
        const matchesApproved = s.statusFilter === 'approved' && isOrderApproved(o)
        const matchesRaw = String(o.status ?? 'pending').toLowerCase() === s.statusFilter
        if (!matchesApproved && !matchesRaw) return false
      }
      if (!q) return true
      return (
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q) ||
        String(o.id).includes(q)
      )
    })
    .reverse()
})

const pendingCount = computed(
  () => s.orders.filter((o) => !isOrderApproved(o) && String(o.status ?? 'pending').toLowerCase() !== 'rejected').length,
)
const approvedCount = computed(() => s.orders.filter((o) => isOrderApproved(o)).length)

function statusTag(o: StudioOrder): { text: string; type: 'success' | 'warning' | 'danger' | 'info' } {
  if (isOrderApproved(o)) return { text: 'Tassyklandy', type: 'success' }
  const st = String(o.status ?? '').toLowerCase()
  if (st === 'rejected') return { text: 'Ret edildi', type: 'danger' }
  if (st === 'completed') return { text: 'Tamamlandy', type: 'info' }
  return { text: 'Garaşylýar', type: 'warning' }
}

/** Patch one order in place so the table reflects a status change instantly. */
function patchOrder(updated: StudioOrder) {
  const i = s.orders.findIndex((o) => o.id === updated.id)
  if (i !== -1) s.orders[i] = { ...s.orders[i], ...updated }
}

async function approve(o: StudioOrder) {
  try {
    const updated = await adminStudioOrdersService.approve(o.id)
    patchOrder(updated && updated.id ? updated : { ...o, status: 'approved', is_approved: true })
    ElMessage.success('Sargyt tassyklandy')
  } catch (e) {
    console.error('approve failed', e)
    ElMessage.error('Tassyklap bolmady')
  }
}

async function reject(o: StudioOrder) {
  try {
    const updated = await adminStudioOrdersService.reject(o.id)
    patchOrder(updated && updated.id ? updated : { ...o, status: 'rejected', is_approved: false })
    ElMessage.success('Sargyt ret edildi')
  } catch (e) {
    console.error('reject failed', e)
    ElMessage.error('Ret edip bolmady')
  }
}

async function remove(o: StudioOrder) {
  try {
    await ElMessageBox.confirm(`#${o.id} sargydy pozmakçymy?`, 'Tassyklaň', {
      confirmButtonText: 'Hawa',
      cancelButtonText: 'Ýok',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await adminStudioOrdersService.remove(o.id)
    s.orders = s.orders.filter((x) => x.id !== o.id)
    ElMessage.success('Sargyt pozuldy')
  } catch (e) {
    console.error('delete failed', e)
    ElMessage.error('Pozup bolmady')
  }
}

function downloadContract(o: StudioOrder) {
  if (!isOrderApproved(o)) {
    ElMessage.warning('Şertnama diňe tassyklanan sargyt üçin elýeterli')
    return
  }
  if (!openContractPrint(o)) {
    ElMessage.error('Açylýan penjirä (popup) rugsat ediň')
  }
}

function openDetail(o: StudioOrder) {
  detail.value = o
  detailVisible.value = true
}

function formatDate(value: string) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('tk-TM')
}
</script>

<template>
  <div class="space-y-6 pb-20">
    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Jemi sargyt</p>
        <p class="text-2xl font-black text-slate-900">{{ s.orders.length }}</p>
      </div>
      <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Garaşýan</p>
        <p class="text-2xl font-black text-amber-500">{{ pendingCount }}</p>
      </div>
      <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tassyklanan</p>
        <p class="text-2xl font-black text-green-600">{{ approvedCount }}</p>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <div class="flex flex-col sm:flex-row gap-3 flex-1">
        <el-input
          v-model="s.search"
          placeholder="At, telefon ýa-da #ID..."
          clearable
          class="sm:max-w-xs"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="s.statusFilter" placeholder="Ähli ýagdaýlar" clearable class="sm:w-48">
          <el-option label="Garaşylýar" value="pending" />
          <el-option label="Tassyklandy" value="approved" />
          <el-option label="Ret edildi" value="rejected" />
          <el-option label="Tamamlandy" value="completed" />
        </el-select>
      </div>
      <el-button :icon="Refresh" :loading="s.loading" @click="load">Täzele</el-button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <el-table :data="filtered" v-loading="s.loading" style="width: 100%">
        <el-table-column label="#" width="70">
          <template #default="{ row }"><span class="font-black text-gray-400">#{{ row.id }}</span></template>
        </el-table-column>
        <el-table-column label="Müşderi" min-width="180">
          <template #default="{ row }">
            <div class="font-bold text-slate-900 leading-tight">{{ row.customer_name }}</div>
            <div class="text-xs text-gray-400">{{ row.customer_phone }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Günler" width="80" align="center">
          <template #default="{ row }">{{ row.days.length }}</template>
        </el-table-column>
        <el-table-column label="Jemi" width="120" align="right">
          <template #default="{ row }"><span class="font-black text-red-600">{{ row.total_amount }} TMT</span></template>
        </el-table-column>
        <el-table-column label="Sene" width="120">
          <template #default="{ row }"><span class="text-sm text-gray-500">{{ formatDate(row.created_at) }}</span></template>
        </el-table-column>
        <el-table-column label="Ýagdaýy" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row).type" size="small" class="font-bold">{{ statusTag(row).text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Amallar" width="230" align="right">
          <template #default="{ row }">
            <div class="flex items-center justify-end gap-1">
              <el-tooltip content="Tassykla">
                <el-button type="success" text :icon="Check" :disabled="isOrderApproved(row)" @click="approve(row)" />
              </el-tooltip>
              <el-tooltip content="Ret et">
                <el-button type="warning" text :icon="Close" @click="reject(row)" />
              </el-tooltip>
              <el-tooltip content="Şertnama (PDF)">
                <el-button type="primary" text :icon="Document" :disabled="!isOrderApproved(row)" @click="downloadContract(row)" />
              </el-tooltip>
              <el-tooltip content="Jikme-jik">
                <el-button text :icon="InfoFilled" @click="openDetail(row)" />
              </el-tooltip>
              <el-tooltip content="Poz">
                <el-button type="danger" text :icon="Delete" @click="remove(row)" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <template #empty>
          <div class="py-16 text-center text-gray-400">
            <el-icon class="text-5xl mb-3"><ShoppingCart /></el-icon>
            <p class="font-bold">Sargyt ýok</p>
          </div>
        </template>
      </el-table>
    </div>

    <!-- Detail dialog -->
    <el-dialog v-model="detailVisible" :title="`Sargyt #${detail?.id ?? ''}`" width="90%" class="studio-order-dialog" top="5vh">
      <div v-if="detail" class="space-y-4">
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div><span class="text-gray-400">Müşderi:</span> <span class="font-bold">{{ detail.customer_name }}</span></div>
          <div><span class="text-gray-400">Telefon:</span> <span class="font-bold">{{ detail.customer_phone }}</span></div>
          <div><span class="text-gray-400">Jemi:</span> <span class="font-bold text-red-600">{{ detail.total_amount }} TMT</span></div>
          <div><span class="text-gray-400">Galan:</span> <span class="font-bold">{{ detail.remaining_amount }} TMT</span></div>
        </div>
        <div
          v-for="d in detail.days"
          :key="d.id"
          class="border border-gray-100 rounded-xl p-3 bg-gray-50"
        >
          <div class="font-bold text-slate-800">{{ formatDate(d.date) }}<span v-if="d.time"> · {{ d.time }}</span></div>
          <div class="text-sm text-gray-600">{{ d.address }} · {{ d.daily_price }} TMT</div>
          <div v-if="d.equipments.length" class="text-xs text-gray-500 mt-1">
            Enjamlar: {{ d.equipments.map((e) => `${e.equipment_name}×${e.count}`).join(', ') }}
          </div>
          <div v-if="d.services.length" class="text-xs text-gray-500">
            Hyzmatlar: {{ d.services.map((sv) => `${sv.service_name}×${sv.count}`).join(', ') }}
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
