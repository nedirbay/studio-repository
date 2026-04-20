<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { store, actions } from '../../store'
import { 
  Plus, 
  Edit, 
  Delete, 
  Picture as ImageIcon,
  Select
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const windowWidth = ref(window.innerWidth)
const updateWidth = () => { windowWidth.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', updateWidth))
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

const handleSave = async () => {
  if (!form.value.title || !form.value.image) {
    ElMessage.warning('Adyny we suratyny dolduryň')
    return
  }

  try {
    if (isEditing.value) {
      await actions.updateBanner(form.value)
      ElMessage.success('Banner täzelendi')
    } else {
      await actions.addBanner(form.value)
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

const handleUpload = async (options: any) => {
  try {
    const url = await actions.uploadImage(options.file)
    form.value.image = url
    ElMessage.success('Surat ýüklendi')
  } catch (error) {
    ElMessage.error('Surat ýüklenmedi')
  }
}

// Get product name for display
const getProductName = (id: number) => {
  return store.products.find(p => p.id === id)?.name || 'Nämälim haryt'
}

const colorOptions = [
  { label: 'Gök (Dark Blue)', value: 'from-blue-900/80' },
  { label: 'Gyzyl (Dark Red)', value: 'from-red-900/80' },
  { label: 'Ýaşyl (Dark Green)', value: 'from-emerald-900/80' },
  { label: 'Mawy (Cyan)', value: 'from-cyan-900/80' },
  { label: 'Gara (Black)', value: 'from-slate-900/80' },
  { label: 'Benewşe (Indigo)', value: 'from-indigo-900/80' },
]
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
          <img :src="banner.image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
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

    <!-- Edit/Add Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? 'Banneri üýtgetmek' : 'Täze banner goşmak'"
      :width="windowWidth < 768 ? '95%' : '600px'"
      class="admin-dialog"
      align-center
    >
      <div class="max-h-[70vh] overflow-y-auto px-4 custom-scrollbar">
        <el-form :model="form" label-position="top" class="space-y-4">
          <el-form-item label="Sözbaşy (Title)">
            <el-input v-model="form.title" placeholder="Esasy sözbaşy" />
          </el-form-item>
          
          <el-form-item label="Kiçi sözbaşy (Subtitle)">
            <el-input v-model="form.subtitle" placeholder="Gözüňe ilýän kiçi ýazgy" />
          </el-form-item>
          
          <el-form-item label="Düşündiriş">
            <el-input v-model="form.description" type="textarea" :rows="3" placeholder="Gysgaça düşündiriş..." />
          </el-form-item>

          <div class="grid grid-cols-2 gap-4">
            <el-form-item label="Düwmäniň ýazgysy">
              <el-input v-model="form.ctaText" />
            </el-form-item>
            <el-form-item label="Arka tarapyň reňki">
              <el-select v-model="form.bgColor" class="w-full">
                <el-option 
                  v-for="opt in colorOptions" 
                  :key="opt.value" 
                  :label="opt.label" 
                  :value="opt.value" 
                />
              </el-select>
            </el-form-item>
          </div>

          <el-form-item label="Baglanjak haryt (Product)">
            <el-select 
              v-model="form.product_id" 
              placeholder="Haryt saýlaň (hökman däl)" 
              clearable 
              filterable
              class="w-full"
            >
              <el-option
                v-for="product in store.products"
                :key="product.id"
                :label="product.name"
                :value="product.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="Banner suraty">
            <div class="space-y-4 w-full">
              <div v-if="form.image" class="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200">
                <img :src="form.image" class="w-full h-full object-cover" />
                <button 
                  @click="form.image = ''" 
                  class="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 transition-colors"
                >
                  <el-icon><Delete /></el-icon>
                </button>
              </div>
              <el-upload
                v-else
                drag
                action="#"
                :auto-upload="true"
                :http-request="handleUpload"
                class="w-full"
              >
                <el-icon class="el-icon--upload"><ImageIcon /></el-icon>
                <div class="el-upload__text">
                  Surat çekip goýuň ýa-da <em>saýlaň</em>
                </div>
              </el-upload>
            </div>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="flex gap-3 justify-end mt-4 px-4 pb-4">
          <el-button @click="dialogVisible = false" class="!rounded-lg">Bes et</el-button>
          <el-button type="primary" @click="handleSave" class="!rounded-lg !px-10 !font-black h-12 shadow-lg shadow-red-600/20">Banneri sakla</el-button>
        </div>
      </template>
    </el-dialog>
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
