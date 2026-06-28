<script setup lang="ts">
import { computed } from 'vue'
import { Check, Close } from '@element-plus/icons-vue'

const props = defineProps<{
  visible: boolean
  order: any
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'approve', orderId: number): void
  (e: 'cancel', orderId: number): void
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

function statusTag(order: any) {
  if (!order) return { text: 'Garaşylýar', type: 'warning' }
  switch (order.status) {
    case 'completed':
      return { text: 'Tamamlandy', type: 'success' }
    case 'processing':
      return { text: 'Taýýarlanýar', type: 'primary' }
    case 'cancelled':
      return { text: 'Goýbolsun edildi', type: 'danger' }
    default:
      return { text: 'Garaşylýar', type: 'warning' }
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('tk-TM', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="Sargyt maglumaty"
    width="90%"
    destroy-on-close
    class="admin-order-detail-dialog"
  >
    <div v-if="order" class="space-y-4">
      <!-- Customer Info -->
      <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
        <p class="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none mb-1">Müşderi maglumaty</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
          <div><strong>Ady:</strong> <span class="font-semibold">{{ order.customer_name }}</span></div>
          <div><strong>Telefony:</strong> <span class="font-semibold">{{ order.customer_phone }}</span></div>
          <div><strong>Senesi:</strong> <span class="font-semibold">{{ formatDate(order.created_at) }}</span></div>
          <div class="flex items-center gap-1">
            <strong>Ýagdaýy:</strong>
            <el-tag :type="statusTag(order).type" size="small" class="!rounded-lg font-black uppercase tracking-widest text-[8px]">
              {{ statusTag(order).text }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div class="space-y-2">
        <p class="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none pl-1">Harytlar</p>
        <div class="overflow-x-auto rounded-2xl border border-gray-100">
          <el-table :data="order.items" style="width: 100%" class="admin-table">
            <el-table-column label="Haryt" prop="product_name" min-width="150" />
            <el-table-column label="Sany" prop="quantity" width="80" align="center" />
            <el-table-column label="Baha" width="90" align="right">
              <template #default="scope">
                <span class="font-bold text-gray-700">${{ scope.row.price }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Jemi" width="90" align="right">
              <template #default="scope">
                <span class="font-black text-slate-900">${{ (scope.row.quantity * scope.row.price).toLocaleString() }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- Total -->
      <div class="flex justify-between items-center bg-red-50 p-4 rounded-2xl border border-red-100">
        <span class="font-bold text-red-900">Umumy baha:</span>
        <span class="text-xl font-black text-red-600">${{ order.total_amount.toLocaleString() }}</span>
      </div>

      <!-- Actions -->
      <div v-if="order.status === 'pending'" class="flex gap-2 justify-end pt-4 border-t border-gray-100">
        <el-button 
          type="danger" 
          plain 
          class="!rounded-xl font-bold"
          @click="emit('cancel', order.id); dialogVisible = false"
        >
          Goýbolsun et
        </el-button>
        <el-button 
          type="success" 
          class="!rounded-xl font-bold"
          @click="emit('approve', order.id); dialogVisible = false"
        >
          Tassykla
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
:deep(.el-dialog) {
  max-width: 600px;
  border-radius: 1.5rem !important;
  overflow: hidden;
}
:deep(.el-dialog__header) {
  padding-bottom: 0.5rem;
}
:deep(.el-dialog__body) {
  padding-top: 1rem;
  padding-bottom: 1.5rem;
}
</style>
