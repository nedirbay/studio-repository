<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Calendar } from '@element-plus/icons-vue'
import { adminStudioOrdersService } from '../adminStudioOrdersService'
import type { StudioOrder } from '../../../../types'

const props = defineProps<{
  modelValue: boolean
  order: StudioOrder | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'approved', order: StudioOrder): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const approveForm = ref<{
  days: Array<{ id: number; date: string; daily_price: number }>
  paid_amount: number
}>({ days: [], paid_amount: 0 })

const approveTotal = computed(() => {
  return approveForm.value.days.reduce((sum, d) => sum + (Number(d.daily_price) || 0), 0)
})

watch(
  () => props.order,
  (o) => {
    if (o) {
      approveForm.value = {
        days: o.days.map((d) => ({
          id: d.id,
          date: d.date,
          daily_price: Number(d.daily_price) || 0,
        })),
        paid_amount: Number(o.paid_amount) || 0,
      }
    } else {
      approveForm.value = { days: [], paid_amount: 0 }
    }
  },
  { immediate: true }
)

const submittingApproval = ref(false)

async function submitApproval() {
  if (!props.order) return
  submittingApproval.value = true
  try {
    const o = props.order
    const newPaid = Number(approveForm.value.paid_amount) || 0
    const newRemaining = Math.max(0, approveTotal.value - newPaid)
    const payload = {
      customer_name: o.customer_name,
      customer_phone: o.customer_phone,
      order_type_id: o.order_type_id,
      total_amount: approveTotal.value,
      paid_amount: newPaid,
      days: o.days.map((d) => {
        const updatedDay = approveForm.value.days.find((ad) => ad.id === d.id)
        return {
          date: d.date,
          time: d.time || null,
          address: d.address,
          daily_price: updatedDay ? updatedDay.daily_price : (Number(d.daily_price) || 0),
          equipments: [],
          services: d.services.map((s) => ({
            service_id: s.service_id,
            count: s.count,
          })),
        }
      }),
      staff: o.staff.map((st) => ({
        user_id: st.user_id,
        equipments: st.equipments.map((e) => ({
          equipment_id: e.equipment_id,
          count: e.count,
        })),
      })),
    }

    // Update order with new daily prices and paid amount
    await adminStudioOrdersService.update(o.id, payload as any)

    // Approve the order
    const updated = await adminStudioOrdersService.approve(o.id)

    // Emit approved event with updated order object
    emit(
      'approved',
      updated && updated.id
        ? { ...o, ...updated, total_amount: approveTotal.value, paid_amount: newPaid, remaining_amount: newRemaining }
        : { ...o, status: 'approved', is_approved: true, total_amount: approveTotal.value, paid_amount: newPaid, remaining_amount: newRemaining }
    )

    ElMessage.success('Sargyt bahalandyryldy we tassyklandy')
    visible.value = false
  } catch (e) {
    console.error('approve failed', e)
    ElMessage.error('Tassyklap bolmady')
  } finally {
    submittingApproval.value = false
  }
}

function formatDate(value: string) {
  if (!value) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('tk-TM')
}
</script>

<template>
  <el-dialog v-model="visible" title="Sargyt bahalandyrmak we tassyklamak" width="90%" class="studio-order-dialog" top="5vh">
    <div v-if="order" class="space-y-4">
      <div class="bg-gray-50 rounded-xl border border-gray-100 p-4 mb-4">
        <h3 class="font-bold text-gray-800 mb-2">Müşderi maglumatlary</h3>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div><span class="text-gray-400">Müşderi:</span> <span class="font-bold text-slate-800">{{ order.customer_name }}</span></div>
          <div><span class="text-gray-400">Telefon:</span> <span class="font-bold text-slate-800">{{ order.customer_phone }}</span></div>
        </div>
      </div>

      <h3 class="font-bold text-gray-800 mb-2">Günler boýunça baha kesgitlemek</h3>
      <div class="space-y-3">
        <div
          v-for="(day, di) in approveForm.days"
          :key="day.id"
          class="border border-gray-100 rounded-xl p-4 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div class="space-y-1">
            <div class="font-bold text-slate-800 flex items-center gap-1.5">
              <el-icon class="text-gray-400"><Calendar /></el-icon>
              {{ di + 1 }}-nji gun: {{ formatDate(day.date) }}
            </div>
            <div class="text-xs text-gray-500">
              <span class="font-semibold">Salgy:</span> {{ order.days[di]?.address }}

              <div v-if="order.days[di]?.services.length" class="mt-0.5">
                Hyzmatlar: {{ order.days[di].services.map((s) => `${s.service_name}×${s.count}`).join(', ') }}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 whitespace-nowrap">Bir günlük baha (TMT):</span>
            <el-input-number v-model="day.daily_price" :min="0" :step="100" class="w-32" controls-position="right" />
          </div>
        </div>
      </div>

      <!-- Payment details: paid and remaining amounts -->
      <div class="bg-gray-50 rounded-xl border border-gray-100 p-4 mt-4">
        <h3 class="font-bold text-gray-800 mb-3">Töleg maglumatlary</h3>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Öňünden tölenen (Alnan) töleg (TMT):</span>
            <el-input-number v-model="approveForm.paid_amount" :min="0" :max="approveTotal" :step="100" class="w-36" controls-position="right" />
          </div>
          <div class="text-sm text-gray-500 flex items-center gap-4">
            <span>Jemi baha: <strong class="text-red-600 font-black">{{ approveTotal }} TMT</strong></span>
            <span>Galan töleg: <strong class="text-slate-800 font-bold">{{ Math.max(0, approveTotal - approveForm.paid_amount) }} TMT</strong></span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="text-center sm:text-left">
          <span class="text-sm text-gray-500">Jemi baha:</span>
          <span class="text-xl font-black text-red-600 ml-2">{{ approveTotal }} TMT</span>
        </div>
        <div class="flex gap-2 justify-end">
          <el-button @click="visible = false">Goýbolsun</el-button>
          <el-button type="success" :loading="submittingApproval" @click="submitApproval">
            Tassykla
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>
