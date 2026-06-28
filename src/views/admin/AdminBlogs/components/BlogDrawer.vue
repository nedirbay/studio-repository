<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { actions } from '../../../../store'
import { 
  Plus, 
  Close, 
  Camera, 
  VideoCamera 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  visible: boolean
  isEditing: boolean
  blog: {
    title: string
    slug: string
    main_image: string
    content: string
    date: string
    media: any[]
  }
  drawerSize: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'save', val: typeof props.blog): void
}>()

const form = ref({ ...props.blog })
const mediaList = ref<any[]>([...(props.blog.media || [])])

watch(() => props.blog, (newVal) => {
  form.value = JSON.parse(JSON.stringify(newVal))
  mediaList.value = [...(newVal.media || [])]
}, { deep: true })

const drawerVisible = ref(props.visible)

watch(() => props.visible, (val) => {
  drawerVisible.value = val
})

watch(drawerVisible, (val) => {
  emit('update:visible', val)
})

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

const addMedia = () => {
  mediaList.value.push({ kind: 'image', url: '' })
}

const removeMedia = (index: number) => {
  mediaList.value.splice(index, 1)
}

const handleSave = () => {
  emit('save', {
    ...form.value,
    media: mediaList.value.filter(m => m.url)
  })
}
</script>

<template>
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
          <button type="button" @click="removeMedia(idx)" class="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors">
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
      <div class="flex gap-3 justify-end px-4 pb-4">
        <el-button @click="drawerVisible = false" class="!rounded-xl">Bes et</el-button>
        <el-button type="primary" @click="handleSave" class="!rounded-xl !px-10 !font-black h-12 shadow-lg shadow-red-600/20">Makalany sakla</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<style scoped>
:deep(.admin-drawer) {
  border-top-left-radius: 40px;
  border-bottom-left-radius: 40px;
  overflow: hidden;
}

:deep(.admin-drawer .el-drawer__header) {
  margin-top: 1.5rem;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  margin-bottom: 0;
}

:deep(.admin-drawer .el-drawer__title) {
  font-size: 1.5rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;
}

:deep(.admin-drawer .el-form-item__label) {
  font-weight: 900;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}

:deep(.admin-drawer .el-input__wrapper),
:deep(.admin-drawer .el-textarea__inner) {
  border-radius: 0.75rem;
  border: 1px solid #f3f4f6;
  box-shadow: none;
  background-color: #f9fafb;
  padding: 0.5rem 1rem;
}
.w-full {
  width: 100%;
}
</style>
