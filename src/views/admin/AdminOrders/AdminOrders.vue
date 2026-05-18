<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { store, actions } from '../../../store'
import { 
  ShoppingCart, 
  Search, 
  Refresh,
  Calendar,
  Phone,
  Money,
  InfoFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const searchQuery = ref('')
const loading = ref(false)

async function loadOrders() {
  loading.value = true
  try {
    await actions.fetchOrders()
  } catch (error) {
    ElMessage.error('Sargytlary ýükläp bolmady')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrders()
})

const filteredOrders = computed(() => {
  return store.orders.filter(o => {
    return o.customer_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
           o.customer_phone.includes(searchQuery.value) ||
           o.id.toString().includes(searchQuery.value)
  }).reverse()
})

function formatDate(dateStr: string) {
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
  <div class="space-y-6 animate-fade-in pb-20">
    <!-- Header Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <div class="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
          <el-icon class="text-xl sm:text-2xl"><ShoppingCart /></el-icon>
        </div>
        <div>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Jemi sargytlar</p>
          <p class="text-xl sm:text-2xl font-black text-slate-900">{{ store.orders.length }}</p>
        </div>
      </div>
      
      <div class="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
          <el-icon class="text-xl sm:text-2xl"><Money /></el-icon>
        </div>
        <div>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Jemi söwda</p>
          <p class="text-xl sm:text-2xl font-black text-slate-900">
            ${{ store.orders.reduce((sum, o) => sum + Number(o.total_amount), 0).toLocaleString() }}
          </p>
        </div>
      </div>

      <div class="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 sm:col-span-2 lg:col-span-1">
        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
          <el-icon class="text-xl sm:text-2xl"><Calendar /></el-icon>
        </div>
        <div>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Bugün</p>
          <p class="text-xl sm:text-2xl font-black text-slate-900">
            {{ store.orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length }}
          </p>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
      <div class="relative w-full sm:w-80 group">
        <el-input
          v-model="searchQuery"
          placeholder="Sargyt belgisi, at ýa-da telefon..."
          class="admin-search-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      
      <el-button 
        type="primary" 
        plain
        size="large" 
        class="!rounded-2xl !px-6 !font-bold !h-12" 
        @click="loadOrders"
        :loading="loading"
      >
        <el-icon class="mr-2"><Refresh /></el-icon>
        Täzele
      </el-button>
    </div>

    <!-- Orders Table -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <el-table 
        :data="filteredOrders" 
        style="width: 100%" 
        class="admin-table"
        header-cell-class-name="admin-table-header"
        v-loading="loading"
      >
        <el-table-column label="#ID" width="100">
          <template #default="scope">
            <span class="font-black text-slate-400">#{{ scope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Müşderi" min-width="200">
          <template #default="scope">
            <div class="flex flex-col">
              <span class="font-black text-slate-900 leading-tight">{{ scope.row.customer_name }}</span>
              <div class="flex items-center gap-1 mt-1">
                <el-icon class="text-[10px] text-gray-400"><Phone /></el-icon>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ scope.row.customer_phone }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Jemi baha" width="150" sortable sort-by="total_amount">
          <template #default="scope">
            <span class="font-black text-red-600 text-lg">${{ Number(scope.row.total_amount).toLocaleString() }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Sene" width="200" sortable sort-by="created_at">
          <template #default="scope">
            <div class="flex items-center gap-2 text-gray-500">
              <el-icon><Calendar /></el-icon>
              <span class="text-sm font-medium">{{ formatDate(scope.row.created_at) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Ýagdaýy" width="150">
          <template #default>
            <el-tag type="warning" size="small" class="!rounded-lg font-black uppercase tracking-widest text-[8px] px-2">
              Garaşylýar
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Amallar" width="120" align="right">
          <template #default>
            <div class="flex gap-2 justify-end px-4">
              <el-tooltip content="Jikme-jik gör">
                <el-button 
                  circle 
                  :icon="InfoFilled" 
                  size="small"
                  class="!bg-slate-50 !text-slate-600 !border-none hover:!bg-slate-600 hover:!text-white transition-all"
                />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <!-- No Data Template -->
        <template #empty>
          <div class="py-20 flex flex-col items-center justify-center text-gray-400">
            <el-icon class="text-6xl mb-4"><ShoppingCart /></el-icon>
            <p class="font-bold">Entek hiç hili sargyt ýok</p>
          </div>
        </template>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.admin-table :deep(.admin-table-header) {
  background-color: rgba(249, 250, 251, 0.5);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #9ca3af;
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
}

.admin-search-input :deep(.el-input__wrapper) {
  border-radius: 1.25rem !important;
  height: 3.5rem;
  box-shadow: none;
  border: 1px solid #e5e7eb;
  background-color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding-left: 1.25rem;
}

.admin-search-input :deep(.el-input__wrapper:hover) {
  border-color: #fecaca;
  background-color: #fff;
}

.admin-search-input :deep(.el-input__wrapper.is-focus) {
  border-color: #dc2626;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.05);
}

.animate-fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

:deep(.el-table__row) {
  transition: all 0.2s;
}

:deep(.el-table__row:hover) {
  background-color: #f8fafc !important;
}
</style>
