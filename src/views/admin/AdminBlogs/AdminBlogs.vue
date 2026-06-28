<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { store, actions } from '../../../store'
import { 
  Plus, 
  Edit, 
  Delete, 
  Search, 
  Close,
  Calendar,
  Camera,
  VideoCamera
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import BlogDrawer from './components/BlogDrawer.vue'

const windowWidth = ref(window.innerWidth)
const searchQuery = ref('')
const isEditing = ref(false)
const drawerVisible = ref(false)
const drawerSize = computed(() => windowWidth.value < 768 ? '100%' : '600px')

const updateWidth = () => { windowWidth.value = window.innerWidth }
onMounted(() => {
  window.addEventListener('resize', updateWidth)
  actions.fetchBlogs(1, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})

const initialForm = {
  title: '',
  slug: '',
  main_image: 'https://images.pexels.com/photos/1549000/pexels-photo-1549000.jpeg',
  content: '',
  date: new Date().toISOString().split('T')[0],
  media: [] as any[]
}

const form = ref({ ...initialForm })

const filteredBlogs = computed(() => {
  return store.blogs.filter(b => {
    return b.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  }).reverse()
})

onMounted(() => {
  actions.fetchBlogs(1, 100) // Fetch all for admin management
})

const openAdd = () => {
  isEditing.value = false
  form.value = { ...initialForm }
  drawerVisible.value = true
}

const openEdit = (blog: any) => {
  isEditing.value = true
  form.value = JSON.parse(JSON.stringify(blog))
  drawerVisible.value = true
}

const onBlogSave = async (payload: any) => {
  if (!payload.title || !payload.content) {
    ElMessage.warning('Adyny we mazmunyny dolduryň')
    return
  }

  try {
    if (isEditing.value) {
      await actions.updateBlogPost(payload.slug, payload)
      ElMessage.success('Makala täzelendi')
    } else {
      await actions.createBlogPost(payload)
      ElMessage.success('Täze makala goşuldy')
    }
    drawerVisible.value = false
  } catch (error) {
    ElMessage.error('Sazlama wagtynda ýalňyşlyk ýüze çykdy')
  }
}

const handleDelete = (slug: string) => {
  ElMessageBox.confirm(
    'Bu makalany pozmak isleýärsiňizmi?',
    'Pozmak tassyklama',
    {
      confirmButtonText: 'Poz',
      cancelButtonText: 'Sakla',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await actions.deleteBlogPost(slug)
      ElMessage.success('Makala pozuldy')
    } catch (error) {
      ElMessage.error('Pozmak wagtynda ýalňyşlyk ýüze çykdy')
    }
  })
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('tk-TM', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="space-y-6 animate-fade-in pb-20">
    <!-- Header Actions -->
    <div class="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
      <div class="relative w-full sm:w-80 group">
        <el-input
          v-model="searchQuery"
          placeholder="Makala gözle..."
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
        Täze makala
      </el-button>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <el-table 
        :data="filteredBlogs" 
        style="width: 100%" 
        class="admin-table"
        header-cell-class-name="admin-table-header"
      >
        <el-table-column width="100" label="Suraty">
          <template #default="scope">
            <div class="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden">
              <img :src="scope.row.main_image" class="w-full h-full object-cover" />
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="Makala" min-width="300">
          <template #default="scope">
            <div class="flex flex-col">
              <span class="font-black text-slate-900 leading-tight uppercase">{{ scope.row.title }}</span>
              <div class="flex items-center gap-2 mt-1">
                <el-icon class="text-red-500 text-[10px]"><Calendar /></el-icon>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ formatDate(scope.row.date) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="slug" label="Slug" width="200">
          <template #default="scope">
            <code class="text-xs bg-gray-50 px-2 py-1 rounded text-red-600 font-mono">{{ scope.row.slug }}</code>
          </template>
        </el-table-column>

        <el-table-column label="Media" width="100">
          <template #default="scope">
            <el-tag size="small" type="info" class="!rounded-lg font-black">
              {{ scope.row.media?.length || 0 }} faýl
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Amallar" width="150" align="right">
          <template #default="scope">
            <div class="flex gap-2 justify-end px-4">
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
                @click="handleDelete(scope.row.slug)"
                class="!bg-red-50 !text-red-600 !border-none hover:!bg-red-600 hover:!text-white transition-all"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Edit/Add Drawer Component -->
    <BlogDrawer
      v-model:visible="drawerVisible"
      :is-editing="isEditing"
      :blog="form"
      :drawer-size="drawerSize"
      @save="onBlogSave"
    />
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.admin-table :deep(.admin-table-header) {
  @apply bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400 py-4;
}

.admin-search-input :deep(.el-input__wrapper) {
  @apply rounded-2xl h-12 border-gray-100 shadow-none transition-all;
}

.admin-search-input :deep(.el-input__wrapper:hover) {
  @apply border-red-100;
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

:deep(.admin-drawer) {
  @apply rounded-l-[40px] overflow-hidden;
}

:deep(.admin-drawer .el-drawer__header) {
  @apply mt-6 px-10 mb-0;
}

:deep(.admin-drawer .el-drawer__title) {
  @apply text-2xl font-black text-slate-900 tracking-tight;
}

:deep(.admin-drawer .el-form-item__label) {
  @apply font-black text-[10px] uppercase tracking-widest text-gray-400 mb-2;
}

:deep(.admin-drawer .el-input__wrapper),
:deep(.admin-drawer .el-textarea__inner) {
  @apply rounded-xl border-gray-100 shadow-none bg-gray-50 p-3;
}
</style>
