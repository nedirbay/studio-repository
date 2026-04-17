<script setup lang="ts">
import { ref } from 'vue'
import { store, actions } from '../../store'
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchQuery = ref('')
const dialogVisible = ref(false)
const isEditing = ref(false)
const form = ref({
  id: 0,
  name: '',
  icon: '',
  slug: '',
  count: 0
})

const filteredCategories = ref(store.categories)

const handleSearch = () => {
  filteredCategories.value = store.categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
}

const openAdd = () => {
  isEditing.value = false
  form.value = { id: 0, name: '', icon: '📁', slug: '', count: 0 }
  dialogVisible.value = true
}

const openEdit = (category: any) => {
  isEditing.value = true
  form.value = { ...category }
  dialogVisible.value = true
}

const handleSave = () => {
  if (!form.value.name || !form.value.slug) {
    ElMessage.warning('Adyny we slug-y dolduryň')
    return
  }

  if (isEditing.value) {
    actions.updateCategory(form.value)
    ElMessage.success('Kategoriýa täzelendi')
  } else {
    actions.addCategory(form.value)
    ElMessage.success('Täze kategoriýa goşuldy')
  }
  
  dialogVisible.value = false
  handleSearch()
}

const handleDelete = (id: number) => {
  ElMessageBox.confirm(
    'Bu kategoriýany pozmak isleýärsiňizmi?',
    'Üns berin',
    {
      confirmButtonText: 'Poz',
      cancelButtonText: 'Bes et',
      type: 'warning',
    }
  ).then(() => {
    actions.deleteCategory(id)
    ElMessage.success('Kategoriýa pozuldy')
    handleSearch()
  })
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header Actions -->
    <div class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      <div class="relative w-full sm:w-80 group">
        <el-input
          v-model="searchQuery"
          placeholder="Kategoriýa gözle..."
          @input="handleSearch"
          class="admin-search-input"
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
        @click="openAdd"
      >
        <el-icon class="mr-2"><Plus /></el-icon>
        Täze kategoriýa
      </el-button>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <el-table 
        :data="filteredCategories" 
        style="width: 100%" 
        class="admin-table"
        header-cell-class-name="admin-table-header"
      >
        <el-table-column width="80" label="Sypat">
          <template #default="scope">
            <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">
              {{ scope.row.icon }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="name" label="Ady" min-width="150" sortable>
          <template #default="scope">
            <span class="font-black text-slate-900">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="slug" label="Slug" min-width="120">
          <template #default="scope">
            <el-tag size="small" type="info" class="!rounded-lg !bg-gray-50 !border-gray-100 !text-gray-500 font-bold">
              {{ scope.row.slug }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="count" label="Haryt sany" width="120" align="center" sortable>
          <template #default="scope">
            <span class="text-xs font-black text-gray-400">{{ scope.row.count }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Amallar" width="150" align="right">
          <template #default="scope">
            <div class="flex gap-2 justify-end">
              <el-button 
                circle 
                :icon="Edit" 
                size="small"
                @click="openEdit(scope.row)"
                class="!bg-blue-50 !text-blue-600 !border-none hover:!bg-blue-600 hover:!text-white transition-all"
              />
              <el-button 
                circle 
                :icon="Delete" 
                size="small"
                @click="handleDelete(scope.row.id)"
                class="!bg-red-50 !text-red-600 !border-none hover:!bg-red-600 hover:!text-white transition-all"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Edit/Add Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? 'Kategoriýany üýtgetmek' : 'Täze kategoriýa goşmak'"
      width="400px"
      class="admin-dialog"
      align-center
    >
      <el-form :model="form" label-position="top" class="space-y-4">
        <el-form-item label="Kategoriýa ady">
          <el-input v-model="form.name" placeholder="Mysal üçin: Noutbuklar" />
        </el-form-item>
        <el-form-item label="Slug (URL üçin)">
          <el-input v-model="form.slug" placeholder="Mysal üçin: laptops" />
        </el-form-item>
        <el-form-item label="Sekizburçluk / Ikonka">
          <el-input v-model="form.icon" placeholder="Emoji ýada şekil (💻)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex gap-3 justify-end mt-4">
          <el-button @click="dialogVisible = false" class="!rounded-xl">Bes et</el-button>
          <el-button type="primary" @click="handleSave" class="!rounded-xl !px-6">Sakla</el-button>
        </div>
      </template>
    </el-dialog>
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
  padding-top: 1rem;
  padding-bottom: 1rem;
}
.admin-table :deep(.el-table__row) {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
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
