<script setup lang="ts">
import { ref, watch } from 'vue'
import { actions } from '../../../../store'
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
  brand: { id: number; name: string; slug: string; logo_url: string }
  windowWidth: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'save', val: typeof props.brand): void
}>()

const form = ref({ ...props.brand })

watch(() => props.brand, (newVal) => {
  form.value = { ...newVal }
}, { deep: true })

const dialogVisible = ref(props.visible)

watch(() => props.visible, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

const handleSave = () => {
  emit('save', form.value)
}

const handleUpload = async (options: any) => {
  try {
    const url = await actions.uploadImage(options.file)
    form.value.logo_url = url
    ElMessage.success('Logo suraty ýüklendi')
  } catch (error) {
    ElMessage.error('Surat ýüklemekde ýalňyşlyk ýüze çykdy')
  }
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEditing ? 'Brendi üýtgetmek' : 'Täze brend goşmak'"
    :width="windowWidth < 640 ? '90%' : '500px'"
    class="admin-dialog"
    align-center
  >
    <el-form :model="form" label-position="top" class="space-y-4">
      <el-form-item label="Brendiň ady">
        <el-input v-model="form.name" placeholder="Mysal üçin: Sony" />
      </el-form-item>
      <el-form-item label="Slug (URL üçin)">
        <el-input v-model="form.slug" placeholder="Mysal üçin: sony" />
      </el-form-item>
      
      <el-form-item label="Logo suraty">
        <div class="flex gap-4 items-center">
          <div class="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center shadow-sm relative shrink-0">
            <img v-if="form.logo_url" :src="getImageUrl(form.logo_url)" class="w-full h-full object-contain" />
            <span v-else class="text-[10px] text-gray-400 font-bold uppercase">LOGO</span>
          </div>
          <el-upload
            action="#"
            :auto-upload="true"
            :show-file-list="false"
            :http-request="handleUpload"
            class="flex-1"
          >
            <el-button type="primary" plain class="!rounded-xl">Ýükle</el-button>
          </el-upload>
        </div>
      </el-form-item>
      
      <el-form-item label="Ugradyş logo salgysy (Gönümel URL)">
        <el-input v-model="form.logo_url" placeholder="https://mysite.com/logo.png" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex gap-3 justify-end mt-4">
        <el-button @click="dialogVisible = false" class="!rounded-xl">Bes et</el-button>
        <el-button type="primary" @click="handleSave" class="!rounded-xl !px-6">Sakla</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
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
