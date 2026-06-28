<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
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
import type { StudioOrder } from '../../../types'

import StudioOrderDetailDialog from './components/StudioOrderDetailDialog.vue'
import StudioOrderApproveDialog from './components/StudioOrderApproveDialog.vue'
import StudioOrderContractDialog from './components/StudioOrderContractDialog.vue'

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

let socket: WebSocket | null = null

function connectWebSocket() {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsHost = import.meta.env.PROD
    ? window.location.host
    : '127.0.0.1:8000'
  const token = localStorage.getItem('token')
  const wsUrl = `${wsProtocol}//${wsHost}/ws/orders/${token ? '?token=' + token : ''}`

  socket = new WebSocket(wsUrl)

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.type === 'order.created') {
        const exists = s.orders.some((o) => o.id === data.order.id)
        if (!exists) {
          s.orders.unshift(data.order)
        }
      } else if (data.type === 'order.updated') {
        patchOrder(data.order)
      } else if (data.type === 'order.deleted') {
        s.orders = s.orders.filter((o) => o.id !== data.order_id)
      }
    } catch (e) {
      console.error('Error parsing WebSocket message', e)
    }
  }

  socket.onclose = () => {
    console.log('Admin WebSocket connection closed, reconnecting in 5s...')
    setTimeout(connectWebSocket, 5000)
  }

  socket.onerror = (err) => {
    console.error('WebSocket error:', err)
  }
}

onMounted(() => {
  load()
  connectWebSocket()
})

onUnmounted(() => {
  if (socket) {
    socket.close()
  }
})

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

const approveDialogVisible = ref(false)
const orderToApprove = ref<StudioOrder | null>(null)

function openApproveDialog(o: StudioOrder) {
  orderToApprove.value = o
  approveDialogVisible.value = true
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

const contractDialogVisible = ref(false)
const selectedOrderForContract = ref<StudioOrder | null>(null)

function downloadContract(o: StudioOrder) {
  if (!isOrderApproved(o)) {
    ElMessage.warning('Şertnama diňe tassyklanan sargyt üçün elýeterli')
    return
  }
  selectedOrderForContract.value = o
  contractDialogVisible.value = true
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
        <el-table-column label="Amallar" width="300" align="right">
          <template #default="{ row }">
            <div class="flex items-center justify-end">
              <!-- Pending Actions -->
              <template v-if="!isOrderApproved(row) && String(row.status).toLowerCase() !== 'rejected' && String(row.status).toLowerCase() !== 'completed'">
                <el-button 
                  type="success" 
                  size="small" 
                  plain 
                  :icon="Check" 
                  @click="openApproveDialog(row)"
                >
                  Tassykla
                </el-button>
                <el-button 
                  type="warning" 
                  size="small" 
                  plain 
                  :icon="Close" 
                  @click="reject(row)"
                >
                  Ret et
                </el-button>
              </template>

              <!-- Approved Actions -->
              <template v-else-if="isOrderApproved(row)">
                <el-button 
                  type="primary" 
                  size="small" 
                  plain 
                  :icon="Document" 
                  @click="downloadContract(row)"
                >
                  Şertnama (PDF)
                </el-button>
              </template>

              <!-- Shared Actions -->
              <el-tooltip content="Jikme-jik">
                <el-button text :icon="InfoFilled" @click="openDetail(row)" class="p-1" />
              </el-tooltip>
              <el-tooltip content="Poz">
                <el-button type="danger" text :icon="Delete" @click="remove(row)" class="p-1" />
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
    <StudioOrderDetailDialog v-model="detailVisible" :order="detail" />

    <!-- Price setting & approval dialog -->
    <StudioOrderApproveDialog
      v-model="approveDialogVisible"
      :order="orderToApprove"
      @approved="patchOrder"
    />

    <!-- Contract Preview Dialog -->
    <StudioOrderContractDialog
      v-model="contractDialogVisible"
      :order="selectedOrderForContract"
    />
  </div>
</template>
