<script setup lang="ts">
import { ref, watch } from 'vue'
import { actions } from '../../../../store'
import { Delete, Picture as ImageIcon } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { baseMediaURL } from '../../../../utils/request'

const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return baseMediaURL + url
}


const props = defineProps<{
  visible: boolean
  isEditing: boolean
  banner: {
    id?: number
    title: string
    subtitle: string
    description: string
    image: string
    ctaText: string
    bgColor: string
    product_id: number | null
  }
  windowWidth: number
  products: any[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'save', val: typeof props.banner): void
}>()

const form = ref({ ...props.banner })

watch(() => props.banner, (newVal) => {
  form.value = { ...newVal }
}, { deep: true })

const dialogVisible = ref(props.visible)

watch(() => props.visible, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

const handleUpload = async (options: any) => {
  try {
    const url = await actions.uploadImage(options.file)
    form.value.image = url
    ElMessage.success('Surat ýüklendi')
  } catch (error) {
    ElMessage.error('Surat ýüklenmedi')
  }
}

const handleSave = () => {
  emit('save', form.value)
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
              v-for="product in products"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Banner suraty">
          <div class="space-y-4 w-full">
            <div v-if="form.image" class="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200">
              <img :src="getImageUrl(form.image)" class="w-full h-full object-cover" />
              <button 
                type="button"
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
</template>

<style scoped>
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
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
.w-full {
  width: 100%;
}
</style>
