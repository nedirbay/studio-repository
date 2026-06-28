<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { store, actions } from '../../../store'
import { baseMediaURL } from '../../../utils/request'

const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return baseMediaURL + url
}

import { 
  Plus, 
  Edit, 
  Delete, 
  Picture as ImageIcon,
  Select
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import BannerDialog from './components/BannerDialog.vue'

const windowWidth = ref(window.innerWidth)
const updateWidth = () => { windowWidth.value = window.innerWidth }
onMounted(() => {
  window.addEventListener('resize', updateWidth)
  actions.fetchBanners()
  actions.fetchProducts()
})
onUnmounted(() => window.removeEventListener('resize', updateWidth))

const dialogVisible = ref(false)
const isEditing = ref(false)

const initialForm = {
  id: undefined,
  title: '',
  subtitle: '',
  description: '',
  image: '',
  ctaText: 'Söwda et',
  bgColor: 'from-blue-900/80',
  product_id: null as number | null
}

const form = ref({ ...initialForm })

const openAdd = () => {
  isEditing.value = false
  form.value = { ...initialForm }
  dialogVisible.value = true
}

const openEdit = (banner: any) => {
  isEditing.value = true
  form.value = { 
    ...banner,
    product_id: banner.product_id || null
  }
  dialogVisible.value = true
}

const onBannerSave = async (savedForm: any) => {
  if (!savedForm.title || !savedForm.image) {
    ElMessage.warning('Adyny we suratyny dolduryň')
    return
  }

  try {
    if (isEditing.value) {
      await actions.updateBanner(savedForm)
      ElMessage.success('Banner täzelendi')
    } else {
      await actions.addBanner(savedForm)
      ElMessage.success('Täze banner goşuldy')
    }
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error('Sazlama wagtynda ýalňyşlyk ýüze çykdy')
  }
}

const handleDelete = (id: number) => {
  ElMessageBox.confirm(
    'Bu banneri pozmak isleýärsiňizmi?',
    'Pozmak tassyklama',
    {
      confirmButtonText: 'Poz',
      cancelButtonText: 'Sakla',
      type: 'warning',
    }
  ).then(async () => {
    await actions.deleteBanner(id)
    ElMessage.success('Banner pozuldy')
  })
}

// Get product name for display
const getProductName = (id: number) => {
  return store.products.find(p => p.id === id)?.name || 'Nämälim haryt'
}
</script>

<template>
  <div class="space-y-6 animate-fade-in pb-20">
    <!-- Header Actions -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-black text-slate-900 tracking-tight">Bannerleri dolandyrmak</h2>
      <el-button 
        type="primary" 
        size="large" 
        class="!rounded-xl !px-8 !font-black !h-12 shadow-lg shadow-red-600/20" 
        @click="openAdd"
      >
        <el-icon class="mr-2"><Plus /></el-icon>
        Täze banner
      </el-button>
    </div>

    <!-- Banner List -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="banner in store.banners" 
        :key="banner.id"
        class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500"
      >
        <div class="relative h-48 overflow-hidden">
          <img :src="getImageUrl(banner.image)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div class="absolute inset-0 bg-gradient-to-r opacity-60" :class="banner.bgColor"></div>
          <div class="absolute inset-0 p-6 flex flex-col justify-end text-white">
            <span class="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md w-fit px-2 py-0.5 rounded-md mb-2">
              {{ banner.subtitle }}
            </span>
            <h3 class="text-xl font-black leading-tight">{{ banner.title }}</h3>
          </div>
        </div>
        
        <div class="p-6">
          <p class="text-sm text-gray-500 line-clamp-2 mb-4">{{ banner.description }}</p>
          
          <div v-if="banner.product_id" class="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <el-icon class="text-blue-600"><Select /></el-icon>
            <div class="min-w-0">
              <p class="text-[8px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Baglanan haryt</p>
              <p class="text-xs font-bold text-slate-700 truncate">{{ getProductName(banner.product_id) }}</p>
            </div>
          </div>
          <div v-else class="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-center gap-2">
            <el-icon class="text-amber-600"><ImageIcon /></el-icon>
            <p class="text-[10px] font-bold text-amber-800">Hiç haryt baglanmady</p>
          </div>

          <div class="flex justify-end gap-2">
            <el-button 
              circle 
              :icon="Edit" 
              @click="openEdit(banner)"
              class="!bg-blue-50 !text-blue-600 !border-none hover:!bg-blue-600 hover:!text-white transition-all"
            />
            <el-button 
              circle 
              :icon="Delete" 
              @click="handleDelete(banner.id)"
              class="!bg-red-50 !text-red-600 !border-none hover:!bg-red-600 hover:!text-white transition-all"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Edit/Add Dialog Component -->
    <BannerDialog
      v-model:visible="dialogVisible"
      :is-editing="isEditing"
      :banner="form"
      :window-width="windowWidth"
      :products="store.products"
      @save="onBannerSave"
    />
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

:deep(.admin-dialog) {
  border-radius: 1rem;
  overflow: hidden;
}
:deep(.admin-dialog .el-dialog__header) {
  padding-top: 2.5rem;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  margin-bottom: 0;
}
:deep(.admin-dialog .el-dialog__title) {
  font-size: 1.5rem;
  font-weight: 900;
  color: #0f172a;
}
:deep(.admin-dialog .el-form-item__label) {
  font-weight: 900;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}
:deep(.admin-dialog .el-input__wrapper),
:deep(.admin-dialog .el-textarea__inner) {
  border-radius: 0.5rem;
  border: 1px solid #f3f4f6;
  box-shadow: none;
  background-color: #f9fafb;
  padding: 0.5rem 1rem;
}
:deep(.admin-dialog .el-upload-dragger) {
  border-radius: 1rem;
  border: 2px dashed #e5e7eb;
  background-color: #f9fafb;
}
</style>
