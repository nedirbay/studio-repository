<script setup lang="ts">
import { ref, watch } from 'vue'
import { Trophy, Tickets } from '@element-plus/icons-vue'

const props = defineProps<{
  visible: boolean
  selectedCampaign: any
  participants: any[]
  loadingParticipants: boolean
  windowWidth: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'status-change', participationId: number, newStatus: string): void
}>()

const dialogVisible = ref(props.visible)

watch(() => props.visible, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

function formatDate(dateStr?: string) {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleString('tk-TM', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

const handleStatusChange = (id: number, status: string) => {
  emit('status-change', id, status)
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="selectedCampaign ? `Gatnaşyjylar: ${selectedCampaign.title}` : 'Aksiýa Gatnaşyjylary'"
    :width="windowWidth < 768 ? '96%' : '760px'"
    class="admin-dialog"
    align-center
  >
    <div v-loading="loadingParticipants" class="min-h-[250px]">
      <div v-if="!participants.length" class="flex flex-col items-center justify-center py-12 text-gray-400">
        <el-icon class="text-4xl mb-2"><Tickets /></el-icon>
        <p class="font-bold">Bu aksiýa heniz gatnaşyjy ýok</p>
      </div>
      
      <div v-else class="space-y-4 text-slate-900">
        <!-- Quick Winners Summary -->
        <div 
          v-if="participants.some(p => p.status === 'won')" 
          class="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl text-xs font-bold"
        >
          <el-icon class="text-base text-amber-500"><Trophy /></el-icon>
          <div>
            Sowgat berlen müşderiler: 
            <span class="text-slate-900 font-black">
              {{ participants.filter(p => p.status === 'won').map(p => p.full_name).join(', ') }}
            </span>
          </div>
        </div>

        <!-- Participants Table -->
        <div class="border border-gray-100 rounded-2xl overflow-hidden shadow-inner bg-white">
          <el-table :data="participants" style="width: 100%" class="admin-sub-table">
            <el-table-column prop="full_name" label="Müşderi" min-width="160">
              <template #default="scope">
                <div class="flex flex-col py-1">
                  <span class="font-black text-slate-800 leading-none">{{ scope.row.full_name }}</span>
                  <span v-if="scope.row.user_name && scope.row.user_name !== scope.row.full_name" class="text-[10px] text-gray-400 mt-1">
                    Ulanyjy: {{ scope.row.user_name }}
                  </span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="phone" label="Telefon" width="140" />
            
            <el-table-column prop="created_at" label="Gatnaşan wagty" width="130">
              <template #default="scope">
                <span class="text-[11px] text-gray-500">{{ formatDate(scope.row.created_at) }}</span>
              </template>
            </el-table-column>

            <!-- Status Dropdown / Actions -->
            <el-table-column label="Status / Sowgat Alany" width="190" align="right">
              <template #default="scope">
                <el-select 
                  v-model="scope.row.status" 
                  size="small" 
                  @change="handleStatusChange(scope.row.id, $event)"
                  class="admin-status-select"
                >
                  <el-option label="Garaşylýar" value="pending" />
                  <el-option label="Tassykla" value="approved" />
                  <el-option label="Sowgat Berildi (Ýeňiji)" value="won" />
                  <el-option label="Ret et" value="rejected" />
                </el-select>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end pt-2">
        <el-button type="primary" @click="dialogVisible = false" class="!rounded-xl !px-6">Ýap</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
:deep(.admin-dialog) {
  border-radius: 2rem;
  overflow: hidden;
}
:deep(.admin-dialog .el-dialog__header) {
  padding: 2rem 2rem 1rem;
  margin-bottom: 0;
}
:deep(.admin-dialog .el-dialog__title) {
  font-size: 1.35rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;
}
:deep(.admin-dialog .el-dialog__body) {
  padding: 1.5rem 2rem 2rem;
}
.admin-sub-table :deep(th) {
  background: #f8fafc;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: #64748b;
  padding: 8px 0;
}
.admin-sub-table :deep(td) {
  padding: 6px 0;
}
.admin-status-select :deep(.el-input__wrapper) {
  border-radius: 8px !important;
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
}
</style>
