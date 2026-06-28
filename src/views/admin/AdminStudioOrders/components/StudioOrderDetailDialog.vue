<script setup lang="ts">
import { computed } from 'vue'
import type { StudioOrder } from '../../../../types'

const props = defineProps<{
  modelValue: boolean
  order: StudioOrder | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function formatDate(value: string) {
  if (!value) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('tk-TM')
}
</script>

<template>
  <el-dialog v-model="visible" :title="`Sargyt #${order?.id ?? ''}`" width="90%" class="studio-order-dialog" top="5vh">
    <div v-if="order" class="space-y-4">
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div><span class="text-gray-400">Müşderi:</span> <span class="font-bold text-slate-800">{{ order.customer_name }}</span></div>
        <div><span class="text-gray-400">Telefon:</span> <span class="font-bold text-slate-800">{{ order.customer_phone }}</span></div>
        <div><span class="text-gray-400">Jemi:</span> <span class="font-bold text-red-600">{{ order.total_amount }} TMT</span></div>
        <div><span class="text-gray-400">Tölenen:</span> <span class="font-bold text-green-600">{{ order.paid_amount }} TMT</span></div>
        <div><span class="text-gray-400">Galan:</span> <span class="font-bold text-amber-600">{{ order.remaining_amount }} TMT</span></div>
      </div>
      <div
        v-for="d in order.days"
        :key="d.id"
        class="border border-gray-100 rounded-xl p-3 bg-gray-50"
      >
        <div class="font-bold text-slate-800">{{ formatDate(d.date) }}<span v-if="d.time"> · {{ d.time }}</span></div>
        <div class="text-sm text-gray-600">{{ d.address }} · {{ d.daily_price }} TMT</div>

        <div v-if="d.services.length" class="text-xs text-gray-500">
          Hyzmatlar: {{ d.services.map((sv) => `${sv.service_name}×${sv.count}`).join(', ') }}
        </div>
      </div>
    </div>
  </el-dialog>
</template>
