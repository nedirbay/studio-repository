<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { store, actions } from '../../store'
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
const mediaList = ref<any[]>([])

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
  mediaList.value = []
  drawerVisible.value = true
}

const openEdit = (blog: any) => {
  isEditing.value = true
  form.value = JSON.parse(JSON.stringify(blog))
  mediaList.value = [...(blog.media || [])]
  drawerVisible.value = true
}

const addMedia = () => {
  mediaList.value.push({ kind: 'image', url: '' })
}

const removeMedia = (index: number) => {
  mediaList.value.splice(index, 1)
}

const handleMainImageUpload = async (options: any) => {
  try {
    const url = await actions.uploadImage(options.file)
    form.value.main_image = url
    ElMessage.success('Esasy surat ýüklendi')
  } catch (error) {
    ElMessage.error('Surat ýüklenmedi')
  }
}

const handleMediaUpload = async (options: any, index: number) => {
  try {
    const url = await actions.uploadImage(options.file)
    mediaList.value[index].url = url
    ElMessage.success('Media faýl ýüklendi')
  } catch (error) {
    ElMessage.error('Faýl ýüklenmedi')
  }
}

const handleSave = async () => {
  if (!form.value.title || !form.value.content) {
    ElMessage.warning('Adyny we mazmunyny dolduryň')
    return
  }

  const payload = {
    ...form.value,
    media: mediaList.value.filter(m => m.url)
  }

  try {
    if (isEditing.value) {
      await actions.updateBlogPost(form.value.slug, payload)
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

    <!-- Edit/Add Drawer (Using Drawer for better content management) -->
    <el-drawer
      v-model="drawerVisible"
      :title="isEditing ? 'Makalany üýtgetmek' : 'Täze makala goşmak'"
      :size="drawerSize"
      direction="rtl"
      class="admin-drawer"
    >
      <el-form :model="form" label-position="top" class="p-4 space-y-6">
        <el-form-item label="Makalanyň ady">
          <el-input v-model="form.title" placeholder="Başlygy ýazyň..." class="!rounded-xl" />
        </el-form-item>
        
        <el-form-item label="Salgysy (Slug)" v-if="isEditing">
          <el-input v-model="form.slug" disabled />
        </el-form-item>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <el-form-item label="Sene">
            <el-date-picker
              v-model="form.date"
              type="date"
              placeholder="Sene saýlaň"
              value-format="YYYY-MM-DD"
              class="!w-full"
            />
          </el-form-item>
          <el-form-item label="Esasy surat">
            <el-upload
              action="#"
              :auto-upload="true"
              :http-request="handleMainImageUpload"
              :show-file-list="false"
              class="main-image-upload"
            >
              <div v-if="form.main_image" class="relative group cursor-pointer w-full aspect-video rounded-xl overflow-hidden border border-gray-100 mb-2">
                <img :src="form.main_image" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                  Suraty üýtget
                </div>
              </div>
              <el-button v-else type="primary" plain class="w-full !h-12 !rounded-xl">
                 <el-icon class="mr-2"><Plus /></el-icon> Surat ýükle
              </el-button>
            </el-upload>
          </el-form-item>
        </div>
        
        <el-form-item label="Mazmuny (Text)">
          <el-input 
            v-model="form.content" 
            type="textarea" 
            :rows="12" 
            placeholder="Makalanyň doly tekstini şu ýere ýazyň..." 
          />
        </el-form-item>

        <!-- Media Gallery Section -->
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b pb-2">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">Media Galereýasy</h3>
            <el-button type="primary" link @click="addMedia">
              <el-icon class="mr-1"><Plus /></el-icon> Media goş
            </el-button>
          </div>
          
          <div v-for="(media, idx) in mediaList" :key="idx" class="p-4 bg-gray-50 rounded-2xl space-y-3 relative">
            <button @click="removeMedia(idx)" class="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors">
              <el-icon><Close /></el-icon>
            </button>
            <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <el-radio-group v-model="media.kind" size="small" class="shrink-0 flex sm:block">
                <el-radio-button label="image"><el-icon class="mr-1"><Camera /></el-icon> Surat</el-radio-button>
                <el-radio-button label="video"><el-icon class="mr-1"><VideoCamera /></el-icon> Wideo</el-radio-button>
              </el-radio-group>
              
              <el-upload
                action="#"
                :auto-upload="true"
                :http-request="(opt: any) => handleMediaUpload(opt, idx)"
                :show-file-list="false"
                class="flex-1 w-full"
              >
                <el-button size="small" :type="media.url ? 'success' : 'primary'" plain class="w-full !rounded-lg">
                   <el-icon class="mr-1" v-if="!media.url"><Plus /></el-icon>
                   {{ media.url ? 'Täze faýl ýükle' : 'Faýl saýla' }}
                </el-button>
              </el-upload>
            </div>
            <div v-if="media.url && media.kind === 'image'" class="w-full aspect-video rounded-xl overflow-hidden border border-gray-100 bg-white">
               <img :src="media.url" class="w-full h-full object-contain" />
            </div>
            <div v-if="media.url && media.kind === 'video'" class="w-full aspect-video rounded-xl overflow-hidden border border-gray-100 bg-slate-900 flex items-center justify-center">
               <el-icon class="text-4xl text-white opacity-50"><VideoCamera /></el-icon>
               <span class="text-[10px] text-white ml-2">Wideo ýüklendi</span>
            </div>
          </div>
          <div v-if="mediaList.length === 0" class="text-center py-8 text-gray-400 italic text-sm">
            Hiç hili media ýok.
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="flex gap-3 justify-end p-6 border-t bg-gray-50/50">
          <el-button @click="drawerVisible = false" class="!rounded-xl">Bes et</el-button>
          <el-button type="primary" @click="handleSave" class="!rounded-xl !px-10 !font-black h-12 shadow-lg shadow-red-600/20">
            Makalany sakla
          </el-button>
        </div>
      </template>
    </el-drawer>
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
