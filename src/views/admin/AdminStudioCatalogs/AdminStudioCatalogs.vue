<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminStudioCatalogsService } from './adminStudioCatalogsService'
import type { ManagementService, ManagementOrderType } from '../../../types'

const activeTab = ref('orderTypes')

// Loading states
const loading = ref(false)

// Data lists
const orderTypes = ref<ManagementOrderType[]>([])
const services = ref<ManagementService[]>([])

// Fetch all data
async function fetchData() {
  loading.value = true
  try {
    const [typesRes, servicesRes] = await Promise.all([
      adminStudioCatalogsService.listOrderTypes(),
      adminStudioCatalogsService.listServices()
    ])
    orderTypes.value = typesRes
    services.value = servicesRes
  } catch (error) {
    console.error(error)
    ElMessage.error('Maglumatlary ýükläp bolmady')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

// Search & Pagination for Order Types
const orderTypeSearch = ref('')
const orderTypePage = ref(1)
const pageSize = ref(10)

const filteredOrderTypes = computed(() => {
  return orderTypes.value.filter(t => 
    t.name.toLowerCase().includes(orderTypeSearch.value.toLowerCase())
  )
})

const paginatedOrderTypes = computed(() => {
  const start = (orderTypePage.value - 1) * pageSize.value
  return filteredOrderTypes.value.slice(start, start + pageSize.value)
})

watch(orderTypeSearch, () => {
  orderTypePage.value = 1
})

// Search & Pagination for Services
const serviceSearch = ref('')
const servicePage = ref(1)

const filteredServices = computed(() => {
  return services.value.filter(s => 
    s.name.toLowerCase().includes(serviceSearch.value.toLowerCase())
  )
})

const paginatedServices = computed(() => {
  const start = (servicePage.value - 1) * pageSize.value
  return filteredServices.value.slice(start, start + pageSize.value)
})

watch(serviceSearch, () => {
  servicePage.value = 1
})

// Dialog Form State
const dialogVisible = ref(false)
const isEditing = ref(false)
const dialogType = ref<'orderType' | 'service'>('orderType')
const form = ref({
  id: 0,
  name: ''
})
const formRules = {
  name: [{ required: true, message: 'Ady hökmany meýdança', trigger: 'blur' }]
}
const formRef = ref()

function openAdd(type: 'orderType' | 'service') {
  isEditing.value = false
  dialogType.value = type
  form.value = { id: 0, name: '' }
  dialogVisible.value = true
}

function openEdit(type: 'orderType' | 'service', item: any) {
  isEditing.value = true
  dialogType.value = type
  form.value = { id: item.id, name: item.name }
  dialogVisible.value = true
}

async function handleSave() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    loading.value = true
    try {
      if (dialogType.value === 'orderType') {
        if (isEditing.value) {
          await adminStudioCatalogsService.updateOrderType(form.value.id, form.value.name)
          ElMessage.success('Sargyt görnüşi üstünlikli täzelendi')
        } else {
          await adminStudioCatalogsService.createOrderType(form.value.name)
          ElMessage.success('Täze sargyt görnüşi goşuldy')
        }
      } else {
        if (isEditing.value) {
          await adminStudioCatalogsService.updateService(form.value.id, form.value.name)
          ElMessage.success('Hyzmat üstünlikli täzelendi')
        } else {
          await adminStudioCatalogsService.createService(form.value.name)
          ElMessage.success('Täze hyzmat goşuldy')
        }
      }
      dialogVisible.value = false
      await fetchData()
    } catch (error) {
      console.error(error)
      ElMessage.error('Ýalňyşlyk ýüze çykdy')
    } finally {
      loading.value = false
    }
  })
}

function handleDelete(type: 'orderType' | 'service', item: any) {
  const title = type === 'orderType' ? 'Sargyt görnüşini pozmak' : 'Hyzmaty pozmak'
  const message = type === 'orderType' 
    ? `"${item.name}" sargyt görnüşini pozmak isleýärsiňizmi?` 
    : `"${item.name}" hyzmatyny pozmak isleýärsiňizmi?`
    
  ElMessageBox.confirm(message, title, {
    confirmButtonText: 'Poz',
    cancelButtonText: 'Bes et',
    type: 'warning'
  }).then(async () => {
    loading.value = true
    try {
      if (type === 'orderType') {
        await adminStudioCatalogsService.deleteOrderType(item.id)
        ElMessage.success('Sargyt görnüşi pozuldy')
      } else {
        await adminStudioCatalogsService.deleteService(item.id)
        ElMessage.success('Hyzmat pozuldy')
      }
      await fetchData()
    } catch (error) {
      console.error(error)
      ElMessage.error('Pozup bolmady')
    } finally {
      loading.value = false
    }
  })
}
</script>

<template>
  <div class="space-y-6 animate-fade-in" v-loading="loading">
    <el-tabs v-model="activeTab" class="admin-tabs custom-tabs">
      <!-- Order Types Tab -->
      <el-tab-pane label="Sargyt görnüşleri" name="orderTypes">
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div class="relative w-full sm:w-80 group">
              <el-input
                v-model="orderTypeSearch"
                placeholder="Sargyt görnüşini gözle..."
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
              size="large" 
              class="!rounded-2xl !px-8 !font-black !h-12 shadow-lg shadow-red-600/20" 
              @click="openAdd('orderType')"
            >
              <el-icon class="mr-2"><Plus /></el-icon>
              Täze sargyt görnüşi
            </el-button>
          </div>

          <!-- Data Table -->
          <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <el-table 
              :data="paginatedOrderTypes" 
              style="width: 100%" 
              class="admin-table"
              header-cell-class-name="admin-table-header"
            >
              <el-table-column prop="id" label="ID" width="100">
                <template #default="scope">
                  <span class="font-black text-gray-400">#{{ scope.row.id }}</span>
                </template>
              </el-table-column>
              
              <el-table-column prop="name" label="Ady" min-width="250" sortable>
                <template #default="scope">
                  <span class="font-black text-slate-900">{{ scope.row.name }}</span>
                </template>
              </el-table-column>

              <el-table-column label="Amallar" width="150" align="right">
                <template #default="scope">
                  <div class="flex gap-2 justify-end">
                    <el-button 
                      circle 
                      :icon="Edit" 
                      size="small"
                      @click="openEdit('orderType', scope.row)"
                      class="!bg-blue-50 !text-blue-600 !border-none hover:!bg-blue-600 hover:!text-white transition-all"
                    />
                    <el-button 
                      circle 
                      :icon="Delete" 
                      size="small"
                      @click="handleDelete('orderType', scope.row)"
                      class="!bg-red-50 !text-red-600 !border-none hover:!bg-red-600 hover:!text-white transition-all"
                    />
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- Pagination -->
          <div v-if="filteredOrderTypes.length > pageSize" class="mt-6 flex justify-center">
            <el-pagination
              v-model:current-page="orderTypePage"
              :page-size="pageSize"
              layout="prev, pager, next, jumper"
              :total="filteredOrderTypes.length"
              background
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- Services Tab -->
      <el-tab-pane label="Hyzmatlar" name="services">
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div class="relative w-full sm:w-80 group">
              <el-input
                v-model="serviceSearch"
                placeholder="Hyzmaty gözle..."
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
              size="large" 
              class="!rounded-2xl !px-8 !font-black !h-12 shadow-lg shadow-red-600/20" 
              @click="openAdd('service')"
            >
              <el-icon class="mr-2"><Plus /></el-icon>
              Täze hyzmat
            </el-button>
          </div>

          <!-- Data Table -->
          <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <el-table 
              :data="paginatedServices" 
              style="width: 100%" 
              class="admin-table"
              header-cell-class-name="admin-table-header"
            >
              <el-table-column prop="id" label="ID" width="100">
                <template #default="scope">
                  <span class="font-black text-gray-400">#{{ scope.row.id }}</span>
                </template>
              </el-table-column>
              
              <el-table-column prop="name" label="Ady" min-width="250" sortable>
                <template #default="scope">
                  <span class="font-black text-slate-900">{{ scope.row.name }}</span>
                </template>
              </el-table-column>

              <el-table-column label="Amallar" width="150" align="right">
                <template #default="scope">
                  <div class="flex gap-2 justify-end">
                    <el-button 
                      circle 
                      :icon="Edit" 
                      size="small"
                      @click="openEdit('service', scope.row)"
                      class="!bg-blue-50 !text-blue-600 !border-none hover:!bg-blue-600 hover:!text-white transition-all"
                    />
                    <el-button 
                      circle 
                      :icon="Delete" 
                      size="small"
                      @click="handleDelete('service', scope.row)"
                      class="!bg-red-50 !text-red-600 !border-none hover:!bg-red-600 hover:!text-white transition-all"
                    />
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- Pagination -->
          <div v-if="filteredServices.length > pageSize" class="mt-6 flex justify-center">
            <el-pagination
              v-model:current-page="servicePage"
              :page-size="pageSize"
              layout="prev, pager, next, jumper"
              :total="filteredServices.length"
              background
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? (dialogType === 'orderType' ? 'Sargyt görnüşini üýtgetmek' : 'Hyzmaty üýtgetmek') : (dialogType === 'orderType' ? 'Täze sargyt görnüşi' : 'Täze hyzmat')"
      width="500px"
      class="admin-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="formRules" ref="formRef" label-position="top">
        <el-form-item label="Ady" prop="name">
          <el-input v-model="form.name" placeholder="Adyny ýazyň" maxLength="150" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <el-button @click="dialogVisible = false">Goýbolsun</el-button>
          <el-button type="primary" @click="handleSave">Ýatda sakla</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin-tabs :deep(.el-tabs__item) {
  font-weight: 900;
  font-size: 1rem;
  padding: 1.5rem 1rem;
  color: #64748b;
  transition: all 0.3s;
}
.admin-tabs :deep(.el-tabs__item:hover) {
  color: #dc2626;
}
.admin-tabs :deep(.el-tabs__item.is-active) {
  color: #dc2626;
}
.admin-tabs :deep(.el-tabs__active-bar) {
  background-color: #dc2626;
  height: 3px;
  border-radius: 3px;
}
.admin-tabs :deep(.el-tabs__nav-wrap::after) {
  background-color: #f1f5f9;
}

.admin-table :deep(.admin-table-header) {
  background-color: rgba(249, 250, 251, 0.5);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #9ca3af;
  padding-top: 1rem;
  padding-bottom: 1rem;
}
.admin-table :deep(.el-table__row) {
  transition: all 150ms;
}
.admin-table :deep(.el-table__row:hover) {
  background-color: rgba(249, 250, 251, 0.5);
  cursor: default;
}
.admin-search-input :deep(.el-input__wrapper) {
  border-radius: 1rem !important;
  height: 3rem;
  box-shadow: none;
  border: 1px solid #e5e7eb;
  background-color: white;
  transition: all 0.2s;
}
.admin-search-input :deep(.el-input__wrapper:hover) {
  border-color: #fecaca;
}
.admin-search-input :deep(.el-input__wrapper.is-focus) {
  border-color: #dc2626;
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

:deep(.admin-dialog) {
  border-radius: 2rem;
  overflow: hidden;
}
:deep(.admin-dialog .el-dialog__header) {
  padding-top: 2rem;
  padding-left: 2rem;
  padding-right: 2rem;
  margin-bottom: 0;
}
:deep(.admin-dialog .el-dialog__title) {
  font-size: 1.25rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.025em;
}
:deep(.admin-dialog .el-dialog__body) {
  padding: 2rem;
}
:deep(.admin-dialog .el-form-item__label) {
  font-weight: 900;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}
:deep(.admin-dialog .el-input__wrapper) {
  border-radius: 0.75rem;
  border: 1px solid #f3f4f6;
  box-shadow: none;
  background-color: #f9fafb;
}
</style>
