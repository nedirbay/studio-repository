<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { BaseRepository } from '../../../utils/http'
import { Search, Refresh, Clock, Timer, User, Connection, CopyDocument, Delete, Download, Calendar, Warning } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface LogEntry {
  level: string;
  timestamp: string;
  user?: string;
  method?: string;
  path?: string;
  status?: string;
  duration?: string;
}

class LogsRepository extends BaseRepository {
  async getLogs(): Promise<LogEntry[]> {
    const res = await this.client.get('admin/logs')
    return res.data
  }

  async deleteLogs(payload: { action: string; selected_logs?: LogEntry[]; start_date?: string; end_date?: string }): Promise<any> {
    const res = await this.client.delete('admin/logs', { data: payload })
    return res.data
  }

  async exportCSV(): Promise<any> {
    const res = await this.client.get('admin/logs?export=csv', { responseType: 'blob' })
    return res.data
  }
}

const logsRepository = new LogsRepository()

const logs = ref<LogEntry[]>([])
const loading = ref(false)
const searchQuery = ref('')
const methodFilter = ref('')
const statusFilter = ref('')
const autoRefresh = ref(false)
let autoRefreshTimer: any = null

const currentPage = ref(1)
const pageSize = ref(15)

const detailDialogVisible = ref(false)
const selectedLog = ref<LogEntry | null>(null)

const selectedRows = ref<LogEntry[]>([])
const tableRef = ref<any>(null)

const dateRangeDeleteVisible = ref(false)
const deleteDateRange = ref<[string, string] | null>(null)

async function fetchLogs() {
  loading.value = true
  try {
    logs.value = await logsRepository.getLogs()
  } catch (err) {
    console.error('Failed to load logs:', err)
  } finally {
    loading.value = false
  }
}

function getMethodType(method?: string) {
  if (!method) return 'info'
  const m = method.toUpperCase()
  if (m === 'POST') return 'success'
  if (m === 'PUT') return 'warning'
  if (m === 'DELETE') return 'danger'
  if (m === 'PATCH') return 'warning'
  return 'info'
}

function getStatusType(statusStr?: string) {
  if (!statusStr) return 'info'
  const s = parseInt(statusStr)
  if (s >= 200 && s < 300) return 'success'
  if (s >= 400 && s < 500) return 'warning'
  if (s >= 500) return 'danger'
  return 'info'
}

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    // Text search
    const matchesSearch = searchQuery.value === '' ||
      (log.user && log.user.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (log.path && log.path.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (log.method && log.method.toLowerCase().includes(searchQuery.value.toLowerCase()));
      
    // Method filter
    const matchesMethod = methodFilter.value === '' ||
      (log.method && log.method.toUpperCase() === methodFilter.value.toUpperCase());
      
    // Status filter
    let matchesStatus = true;
    if (statusFilter.value !== '') {
      const s = log.status ? parseInt(log.status) : 0;
      if (statusFilter.value === '2xx') {
        matchesStatus = s >= 200 && s < 300;
      } else if (statusFilter.value === '4xx') {
        matchesStatus = s >= 400 && s < 500;
      } else if (statusFilter.value === '5xx') {
        matchesStatus = s >= 500;
      }
    }
    
    return matchesSearch && matchesMethod && matchesStatus;
  });
});

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLogs.value.slice(start, end)
})

watch([searchQuery, methodFilter, statusFilter], () => {
  currentPage.value = 1
})

function copyToClipboard(text?: string) {
  if (!text) return
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('Süre we ýol göçürildi!')
  })
}

function showDetail(log: LogEntry) {
  selectedLog.value = log
  detailDialogVisible.value = true
}

function handleSelectionChange(val: LogEntry[]) {
  selectedRows.value = val
}

function clearSelection() {
  if (tableRef.value) {
    tableRef.value.clearSelection()
  }
}

async function exportCSV() {
  try {
    const res = await logsRepository.exportCSV()
    const blob = new Blob([res], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'sistem_loglary.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    ElMessage.error('CSV eksport edilmedi')
  }
}

async function deleteSingleLog(row: LogEntry) {
  ElMessageBox.confirm(
    'Bu log ýazgysyny pozmak isleýärsiňizmi?',
    'Pozmak tassyklama',
    {
      confirmButtonText: 'Poz',
      cancelButtonText: 'Sakla',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await logsRepository.deleteLogs({
        action: 'delete_selected',
        selected_logs: [row]
      })
      ElMessage.success('Ýazgy pozuldy')
      fetchLogs()
    } catch (err) {
      ElMessage.error('Pozmak başartmady')
    }
  })
}

async function deleteSelectedLogs() {
  if (selectedRows.value.length === 0) return
  ElMessageBox.confirm(
    `Saýlanan ${selectedRows.value.length} sany log ýazgysyny pozmak isleýärsiňizmi?`,
    'Saýlananlary pozmak',
    {
      confirmButtonText: 'Poz',
      cancelButtonText: 'Sakla',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await logsRepository.deleteLogs({
        action: 'delete_selected',
        selected_logs: selectedRows.value
      })
      ElMessage.success('Saýlanan ýazgylar pozuldy')
      selectedRows.value = []
      fetchLogs()
    } catch (err) {
      ElMessage.error('Pozmak başartmady')
    }
  })
}

async function deleteAllLogs() {
  ElMessageBox.confirm(
    'Ähli log ýazgylaryny doly pozmak isleýärsiňizmi? Bu amaly yzyna gaýtaryp bolmaz.',
    'Ählisini pozmak',
    {
      confirmButtonText: 'Poz',
      cancelButtonText: 'Sakla',
      type: 'danger',
    }
  ).then(async () => {
    try {
      await logsRepository.deleteLogs({
        action: 'delete_all'
      })
      ElMessage.success('Ähli ýazgylar pozuldy')
      fetchLogs()
    } catch (err) {
      ElMessage.error('Pozmak başartmady')
    }
  })
}

async function deleteLogsByDateRange() {
  if (!deleteDateRange.value || deleteDateRange.value.length < 2) {
    ElMessage.warning('Sene aralygyny saýlaň')
    return
  }
  const [start, end] = deleteDateRange.value
  ElMessageBox.confirm(
    `${start} we ${end} seneleri aralygyndaky ähli loglary pozmak isleýärsiňizmi?`,
    'Sene boýunça pozmak',
    {
      confirmButtonText: 'Poz',
      cancelButtonText: 'Sakla',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await logsRepository.deleteLogs({
        action: 'delete_by_date',
        start_date: start,
        end_date: end
      })
      ElMessage.success('Sene aralygyndaky ýazgylar pozuldy')
      dateRangeDeleteVisible.value = false
      deleteDateRange.value = null
      fetchLogs()
    } catch (err) {
      ElMessage.error('Pozmak başartmady')
    }
  })
}

// Auto refresh logic
watch(autoRefresh, (newVal) => {
  if (newVal) {
    autoRefreshTimer = setInterval(() => {
      fetchLogs()
    }, 10000) // refresh every 10 seconds
  } else {
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer)
      autoRefreshTimer = null
    }
  }
})

onMounted(() => {
  fetchLogs()
})

onUnmounted(() => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
  }
})
</script>

<template>
  <div class="space-y-6 sm:space-y-8 animate-fade-in pb-20">
    <!-- Header -->
    <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Ulgam loglary</h1>
        <p class="text-[10px] sm:text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">
          Sistemadaky GET bolmadyk API ýüzlenmeleriniň ýazgylary
        </p>
      </div>
      
      <div class="flex flex-wrap items-center gap-3">
        <!-- CSV Export Button -->
        <el-button 
          type="success"
          plain
          @click="exportCSV"
          class="!rounded-xl !px-4 !py-4 font-bold"
        >
          <el-icon class="mr-2"><Download /></el-icon>
          CSV Eksport
        </el-button>

        <!-- Delete Options Dropdown -->
        <el-dropdown trigger="click">
          <el-button 
            type="danger" 
            plain
            class="!rounded-xl !px-4 !py-4 font-bold"
          >
            <el-icon class="mr-2"><Delete /></el-icon>
            Loglary arassala
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="dateRangeDeleteVisible = true">
                <el-icon class="mr-1"><Calendar /></el-icon> Sene aralygy boýunça poz
              </el-dropdown-item>
              <el-dropdown-item @click="deleteAllLogs" class="!text-red-600">
                <el-icon class="mr-1 text-red-600"><Delete /></el-icon> Ählisini doly arassala
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- Auto Refresh Switch -->
        <div class="flex items-center justify-between gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm">
          <span class="text-xs font-bold text-gray-500">Awto-täzelemek (10s)</span>
          <el-switch v-model="autoRefresh" size="small" active-color="#ef4444" />
        </div>

        <el-button 
          type="primary" 
          @click="fetchLogs"
          :loading="loading"
          class="!bg-slate-900 !border-none !rounded-xl !px-6 !py-5 hover:!bg-slate-800 transition-all font-bold"
        >
          <el-icon class="mr-2 text-lg"><Refresh /></el-icon>
          Täzele
        </el-button>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-md border border-gray-200 flex flex-col sm:flex-row gap-4">
      <el-input
        v-model="searchQuery"
        placeholder="Ulanyjy ady ýa-da API ýoly boýunça..."
        :prefix-icon="Search"
        class="w-full sm:w-[300px] !rounded-xl search-input"
        clearable
      />
      <el-select 
        v-model="methodFilter" 
        placeholder="Metod boýunça"
        class="w-full sm:w-[180px]"
        clearable
      >
        <el-option label="Ähli metodlar" value="" />
        <el-option label="POST" value="POST" />
        <el-option label="PUT" value="PUT" />
        <el-option label="DELETE" value="DELETE" />
        <el-option label="PATCH" value="PATCH" />
      </el-select>
      <el-select 
        v-model="statusFilter" 
        placeholder="Statusy boýunça"
        class="w-full sm:w-[180px]"
        clearable
      >
        <el-option label="Ähli statuslar" value="" />
        <el-option label="2xx (Şowly)" value="2xx" />
        <el-option label="4xx (Müşderi hatasy)" value="4xx" />
        <el-option label="5xx (Serwer hatasy)" value="5xx" />
      </el-select>
    </div>

    <!-- Batch Operations Banner -->
    <div 
      v-if="selectedRows.length > 0"
      class="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center justify-between animate-fade-in shadow-sm"
    >
      <div class="flex items-center gap-2">
        <el-icon class="text-red-600 text-lg"><Warning /></el-icon>
        <span class="text-sm font-bold text-red-800">
          {{ selectedRows.length }} sany ýazgy saýlandy
        </span>
      </div>
      <div class="flex gap-2">
        <el-button 
          type="danger" 
          size="small" 
          @click="deleteSelectedLogs"
          class="!rounded-xl font-bold"
        >
          Saýlananlary poz
        </el-button>
        <el-button 
          size="small" 
          @click="clearSelection"
          class="!rounded-xl font-bold"
        >
          Saýlamany arassala
        </el-button>
      </div>
    </div>

    <!-- Logs Table -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" v-loading="loading">
      <el-table
        ref="tableRef"
        :data="paginatedLogs"
        style="width: 100%"
        class="admin-table"
        header-cell-class-name="admin-table-header"
        @selection-change="handleSelectionChange"
        @row-click="showDetail"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column label="Wagty" width="180">
          <template #default="scope">
            <div class="flex items-center gap-2 text-slate-700">
              <el-icon class="text-gray-400"><Clock /></el-icon>
              <span class="text-xs sm:text-sm font-semibold whitespace-nowrap">{{ scope.row.timestamp }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Metod" width="100">
          <template #default="scope">
            <span 
              class="px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider"
              :class="{
                'bg-green-50 text-green-600 border border-green-100': getMethodType(scope.row.method) === 'success',
                'bg-blue-50 text-blue-600 border border-blue-100': getMethodType(scope.row.method) === 'info',
                'bg-amber-50 text-amber-600 border border-amber-100': getMethodType(scope.row.method) === 'warning',
                'bg-red-50 text-red-600 border border-red-100': getMethodType(scope.row.method) === 'danger',
              }"
            >
              {{ scope.row.method }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="Ulanyjy" width="140" class-name="hidden sm:table-cell">
          <template #default="scope">
            <div class="flex items-center gap-2">
              <el-icon class="text-gray-400 text-xs"><User /></el-icon>
              <span class="text-xs sm:text-sm font-bold" :class="scope.row.user === 'Anonymous' ? 'text-gray-400' : 'text-slate-900'">
                {{ scope.row.user }}
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="API ýoly" min-width="200">
          <template #default="scope">
            <span class="text-xs sm:text-sm font-mono text-slate-600 break-all">{{ scope.row.path }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="100">
          <template #default="scope">
            <span 
              class="px-2 py-0.5 rounded-full text-xs font-black"
              :class="{
                'bg-green-100 text-green-800': getStatusType(scope.row.status) === 'success',
                'bg-amber-100 text-amber-800': getStatusType(scope.row.status) === 'warning',
                'bg-red-100 text-red-800': getStatusType(scope.row.status) === 'danger',
              }"
            >
              {{ scope.row.status }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="Möhleti" width="100" class-name="hidden md:table-cell">
          <template #default="scope">
            <div class="flex items-center gap-1 text-gray-500">
              <el-icon class="text-xs"><Timer /></el-icon>
              <span class="text-xs font-medium">{{ scope.row.duration }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Amallar" width="80" align="right">
          <template #default="scope">
            <div class="flex gap-2 justify-end px-2">
              <el-button 
                circle 
                :icon="Delete" 
                size="small"
                @click.stop="deleteSingleLog(scope.row)"
                class="!bg-red-50 !text-red-600 !border-none hover:!bg-red-600 hover:!text-white transition-all"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div v-if="filteredLogs.length > pageSize" class="p-4 border-t border-gray-100 flex justify-center">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredLogs.length"
          layout="prev, pager, next, jumper"
          background
        />
      </div>
    </div>

    <!-- Delete by Date Dialog -->
    <el-dialog
      v-model="dateRangeDeleteVisible"
      title="Sene aralygy boýunça pozmak"
      width="90%"
      class="admin-dialog"
      destroy-on-close
    >
      <div class="space-y-4">
        <p class="text-sm text-gray-700">Pozulmaly sene aralygyny saýlaň:</p>
        <el-date-picker
          v-model="deleteDateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="Başlangyç sene"
          end-placeholder="Ahyrky sene"
          value-format="YYYY-MM-DD"
          class="!w-full"
        />
      </div>
      <template #footer>
        <span class="dialog-footer flex gap-3 justify-end">
          <el-button @click="dateRangeDeleteVisible = false">Ýatyr</el-button>
          <el-button type="danger" @click="deleteLogsByDateRange">Loglary poz</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Detail Dialog -->
    <el-dialog
      v-model="detailDialogVisible"
      title="Ulgam ýazgysynyň jikme-jikleri"
      width="90%"
      class="admin-dialog log-detail-dialog"
      destroy-on-close
    >
      <div v-if="selectedLog" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
            <el-icon class="text-xl text-slate-500 mt-0.5"><Clock /></el-icon>
            <div>
              <p class="text-[10px] font-black uppercase text-gray-400 tracking-wider">Hasaba alnan wagty</p>
              <p class="text-sm font-bold text-slate-900 mt-1">{{ selectedLog.timestamp }}</p>
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
            <el-icon class="text-xl text-slate-500 mt-0.5"><Timer /></el-icon>
            <div>
              <p class="text-[10px] font-black uppercase text-gray-400 tracking-wider">Işleme möhleti</p>
              <p class="text-sm font-bold text-slate-900 mt-1">{{ selectedLog.duration || 'Bilinmeýär' }}</p>
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
            <el-icon class="text-xl text-slate-500 mt-0.5"><User /></el-icon>
            <div>
              <p class="text-[10px] font-black uppercase text-gray-400 tracking-wider">Gatnaşyjy ulanyjy</p>
              <p class="text-sm font-bold text-slate-900 mt-1">{{ selectedLog.user }}</p>
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
            <el-icon class="text-xl text-slate-500 mt-0.5"><Connection /></el-icon>
            <div>
              <p class="text-[10px] font-black uppercase text-gray-400 tracking-wider">Hereket / Metod</p>
              <span 
                class="inline-block px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider mt-1"
                :class="{
                  'bg-green-100 text-green-800': getMethodType(selectedLog.method) === 'success',
                  'bg-blue-100 text-blue-800': getMethodType(selectedLog.method) === 'info',
                  'bg-amber-100 text-amber-800': getMethodType(selectedLog.method) === 'warning',
                  'bg-red-100 text-red-800': getMethodType(selectedLog.method) === 'danger',
                }"
              >
                {{ selectedLog.method }}
              </span>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black uppercase text-gray-400 tracking-wider">API Sorag ýoly (Path)</p>
            <el-button 
              type="info" 
              link 
              :icon="CopyDocument" 
              @click="copyToClipboard(selectedLog.path)"
              class="hover:text-slate-900"
            >
              Göçür
            </el-button>
          </div>
          <p class="text-sm font-mono text-slate-800 break-all select-all mt-2 p-3 bg-white rounded-xl border border-gray-100">
            {{ selectedLog.path }}
          </p>
        </div>

        <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
          <div class="mt-0.5">
            <div class="w-3 h-3 rounded-full mt-1" :class="{
              'bg-green-500': getStatusType(selectedLog.status) === 'success',
              'bg-amber-500': getStatusType(selectedLog.status) === 'warning',
              'bg-red-500': getStatusType(selectedLog.status) === 'danger',
            }"></div>
          </div>
          <div>
            <p class="text-[10px] font-black uppercase text-gray-400 tracking-wider">Jogap statusy (Response Status)</p>
            <p class="text-sm font-bold text-slate-900 mt-1">{{ selectedLog.status }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer flex gap-3 justify-end">
          <el-button @click="detailDialogVisible = false" class="!rounded-xl !px-6">Ýap</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin-table :deep(.admin-table-header) {
  background-color: #f8fafc !important;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding-top: 1rem;
  padding-bottom: 1rem;
}
</style>
