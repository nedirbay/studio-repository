<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { store, actions } from '../../../store'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, ChatDotRound, Message } from '@element-plus/icons-vue'

onMounted(() => {
  actions.fetchAdminMessages()
})

const messages = computed(() => store.adminMessages)

const searchQuery = ref('')
const filterType = ref('Ählisi')

const filteredMessages = computed(() => {
  let result = messages.value
  
  if (filterType.value === 'Okalanlar') {
    result = result.filter(r => r.is_read)
  } else if (filterType.value === 'Täzeler') {
    result = result.filter(r => !r.is_read)
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r => 
      (r.username && r.username.toLowerCase().includes(q)) || 
      (r.subject && r.subject.toLowerCase().includes(q)) ||
      (r.product_name && r.product_name.toLowerCase().includes(q))
    )
  }
  
  return result
})

// Formatting Date
function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('tk-TM', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Reply Modal
const showReplyModal = ref(false)
const isReplying = ref(false)
const selectedMessage = ref<any>(null)
const replyForm = ref({ text: '' })

function openReply(msg: any) {
  selectedMessage.value = msg
  replyForm.value.text = msg.reply || ''
  showReplyModal.value = true
}

async function handleReply() {
  if (!replyForm.value.text) return
  isReplying.value = true
  try {
    await actions.replyToMessage(selectedMessage.value.id, replyForm.value.text)
    ElMessage.success('Jogap üstünlikli ugradyldy')
    showReplyModal.value = false
  } catch (error) {
    ElMessage.error('Jogap ugradylmady')
  } finally {
    isReplying.value = false
  }
}



async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm(
      'Bu haty pozmak isleyarsiňizmi? Bu yzyna gaýtaryp bolmaýan hereketdir.',
      'Üns beriň',
      { confirmButtonText: 'Hawa, poz', cancelButtonText: 'Goýbolsun', type: 'warning' }
    )
    await actions.deleteMessage(id)
    ElMessage.success('Hat üstünlikli pozuldy')
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('Hat pozulmady')
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header Controls -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <el-icon class="text-xl"><Message /></el-icon>
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-900">Müşderi Hatlary</h1>
          <p class="text-xs text-gray-500">Gelen hatlary we soraglary okaň we jogap beriň</p>
        </div>
      </div>
      
      <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto items-start md:items-center">
        <el-input 
          v-model="searchQuery" 
          placeholder="Gözleg (ady, temasy...)" 
          class="w-full md:w-64"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <div class="flex-shrink-0 w-full sm:w-auto overflow-x-auto">
          <el-radio-group v-model="filterType" size="large" class="flex flex-nowrap">
            <el-radio-button label="Ählisi" />
            <el-radio-button label="Täzeler" />
            <el-radio-button label="Okalanlar" />
          </el-radio-group>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <el-table :data="filteredMessages" style="width: 100%" class="custom-table" row-key="id">
        <el-table-column property="username" label="Ulanyjy" width="150" show-overflow-tooltip>
          <template #default="scope">
            <span class="font-semibold">{{ scope.row.username || 'Myhman' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column property="subject" label="Tema" width="180" show-overflow-tooltip></el-table-column>

        <el-table-column property="product_name" label="Haryt" width="150" show-overflow-tooltip>
            <template #default="scope">
              <span v-if="scope.row.product_name" class="text-blue-600 text-xs bg-blue-50 px-2 py-1 rounded">{{ scope.row.product_name }}</span>
              <span v-else class="text-gray-400 text-xs">Ähliumumy</span>
            </template>
        </el-table-column>
        
        <el-table-column property="message" label="Hat" show-overflow-tooltip>
            <template #default="scope">
              <span class="text-sm text-gray-600 leading-relaxed">{{ scope.row.message }}</span>
            </template>
        </el-table-column>
        
        <el-table-column property="is_read" label="Ýagdaý" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.is_read ? 'info' : 'warning'" :effect="scope.row.is_read ? 'plain' : 'light'" size="small">
              {{ scope.row.is_read ? 'Okaldy' : 'Täze' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column property="created_at" label="Sene" width="140">
          <template #default="scope">
            <span class="text-xs text-gray-500">{{ formatDate(scope.row.created_at) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="Hereketler" width="150" align="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              plain
              @click="openReply(scope.row)"
              :icon="ChatDotRound"
            >
              Jogap
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              circle
              @click="handleDelete(scope.row.id)"
              :icon="Delete"
              class="ml-1"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Reply Modal -->
    <el-dialog v-model="showReplyModal" title="Hata jogap bermek" width="90%" :style="{ maxWidth: '500px' }" append-to-body>
      <div v-if="selectedMessage" class="space-y-4">
        <div class="bg-gray-50 p-4 rounded-xl text-sm text-gray-700">
            <strong>Müşderi haty:</strong> {{ selectedMessage.message }}
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Jogabyňyz</label>
          <el-input 
            v-model="replyForm.text" 
            type="textarea" 
            :rows="5" 
            placeholder="Müşderä hat ýazyň..." 
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="showReplyModal = false">Ýap</el-button>
        <el-button type="primary" @click="handleReply" :loading="isReplying">Ugrat</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.custom-table :deep(.el-table__row) {
  cursor: default;
}
.custom-table :deep(.el-table__cell) {
  padding: 1rem 0;
}
</style>
