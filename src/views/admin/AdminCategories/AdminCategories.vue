<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { store, actions } from '../../../store'
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CategoryDialog from './components/CategoryDialog.vue'

const windowWidth = ref(window.innerWidth)
const updateWidth = () => { windowWidth.value = window.innerWidth }
onMounted(async () => {
  window.addEventListener('resize', updateWidth)
  await actions.fetchCategories()
})
onUnmounted(() => window.removeEventListener('resize', updateWidth))

const searchQuery = ref('')
const dialogVisible = ref(false)
const isEditing = ref(false)
const form = ref({
  id: 0,
  name: '',
  icon: '',
  count: 0
})

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10) // 10 categories per page

// Computed categories based on search
const searchedCategories = computed(() => {
  return store.categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Paginated categories for the table
const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return searchedCategories.value.slice(start, end)
})

// Reset to page 1 on search
watch(searchQuery, () => {
  currentPage.value = 1
})

const openAdd = () => {
  isEditing.value = false
  form.value = { id: 0, name: '', icon: '📁', count: 0 }
  dialogVisible.value = true
}

const openEdit = (category: any) => {
  isEditing.value = true
  form.value = { id: category.id, name: category.name, icon: category.icon || '📁', count: category.count || 0 }
  dialogVisible.value = true
}

const onCategorySave = async (savedForm: any) => {
  if (!savedForm.name) {
    ElMessage.warning('Kategoriýanyň adyny dolduryň')
    return
  }

  try {
    if (isEditing.value) {
      await actions.updateCategory(savedForm)
      ElMessage.success('Kategoriýa täzelendi')
    } else {
      await actions.addCategory(savedForm)
      ElMessage.success('Täze kategoriýa goşuldy')
    }
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error('Ýalňyşlyk ýüze çykdy')
  }
}

const handleDelete = (id: number) => {
  ElMessageBox.confirm(
    'Bu kategoriýany pozmak isleýärsiňizmi?',
    'Üns beriň',
    {
      confirmButtonText: 'Poz',
      cancelButtonText: 'Bes et',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await actions.deleteCategory(id)
      ElMessage.success('Kategoriýa pozuldy')
    } catch (error) {
      ElMessage.error('Kategoriýany pozup bolmady')
    }
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
        :data="paginatedCategories" 
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

    <!-- Pagination -->
    <div v-if="searchedCategories.length > pageSize" class="mt-6 flex justify-center">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        layout="prev, pager, next, jumper"
        :total="searchedCategories.length"
        background
      />
    </div>

    <!-- Edit/Add Dialog Component -->
    <CategoryDialog
      v-model:visible="dialogVisible"
      :is-editing="isEditing"
      :category="form"
      :window-width="windowWidth"
      @save="onCategorySave"
    />
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
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

</style>
