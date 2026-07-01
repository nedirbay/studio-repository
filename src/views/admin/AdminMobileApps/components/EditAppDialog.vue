<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { type MobileAppVersion } from '../../../../repositories/mobileAppRepository'

const props = defineProps<{
  visible: boolean
  saving: boolean
  version: MobileAppVersion | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'submit', val: FormData): void
}>()

const dialogVisible = ref(props.visible)

watch(() => props.visible, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

// Form state
const editForm = reactive({
  version_name: '',
  version_code: null as number | null,
  description: '',
  is_active: false
})
const selectedFile = ref<File | null>(null)

watch(() => props.version, (newVersion) => {
  if (newVersion) {
    editForm.version_name = newVersion.version_name
    editForm.version_code = newVersion.version_code
    editForm.description = newVersion.description || ''
    editForm.is_active = newVersion.is_active
    selectedFile.value = null
  }
}, { immediate: true })

// Actions
const handleFileChange = (file: any) => {
  selectedFile.value = file.raw
}

const handleFileRemove = () => {
  selectedFile.value = null
}

const handleEditSubmit = () => {
  if (!editForm.version_name) {
    ElMessage.warning('Haýyş, wersiýanyň adyny ýazyň.')
    return
  }
  if (editForm.version_code === null || editForm.version_code <= 0) {
    ElMessage.warning('Haýyş, dogry wersiýa koduny ýazyň.')
    return
  }

  const formData = new FormData()
  if (selectedFile.value) {
    formData.append('file', selectedFile.value)
  }
  formData.append('version_name', editForm.version_name)
  formData.append('version_code', editForm.version_code.toString())
  formData.append('description', editForm.description)
  formData.append('is_active', editForm.is_active.toString())

  emit('submit', formData)
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="Wersiýany redaktirlemek"
    width="550px"
    class="!rounded-3xl"
    append-to-body
  >
    <div v-loading="saving" element-loading-text="Wersiýa maglumatlary täzelenýär...">
      <div class="space-y-6 text-slate-900">
        <!-- Optional APK file replacement -->
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase mb-2">APK faýlyny täzelemek (Islege bagly)</label>
          <el-upload
            class="apk-uploader"
            drag
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            accept=".apk"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text text-slate-500">
              Täze APK faýlyny şu ýere çekip goýuň ýa-da <em class="text-red-600">saýlaň</em>
            </div>
            <template #tip>
              <div class="el-upload__tip text-center mt-2 text-slate-400">
                Öňki APK faýlyny saklamak üçin bu ýeri boş galdyryň.
              </div>
            </template>
          </el-upload>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Wersiýa ady (Version Name)</label>
            <el-input v-model="editForm.version_name" placeholder="Mysal üçin: 1.0.2" class="!rounded-xl"></el-input>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Wersiýa kody (Version Code)</label>
            <el-input-number v-model="editForm.version_code" :min="1" placeholder="Mysal üçin: 3" class="w-full"></el-input-number>
          </div>
        </div>
        
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Ýazgy / Täzelikler (Release Notes)</label>
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="4"
            placeholder="Bu wersiýada girizilen üýtgeşmeler barada ýazyň..."
            class="!rounded-xl"
          ></el-input>
        </div>
        
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div>
            <div class="text-sm font-bold text-slate-850">Işjeňleşdir</div>
            <div class="text-xs text-gray-400">Bu wersiýany ulanyjylar üçin aktiw et.</div>
          </div>
          <el-switch v-model="editForm.is_active" active-color="#dc2626"></el-switch>
        </div>
      </div>
      
      <!-- Dialog Footer -->
      <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
        <button 
          type="button"
          @click="dialogVisible = false"
          class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors cursor-pointer"
        >
          Ýatyr
        </button>
        <button 
          type="button"
          @click="handleEditSubmit"
          class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-red-600/10 cursor-pointer"
        >
          Sakla
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
/* Custom Upload Styling override */
:deep(.apk-uploader .el-upload-dragger) {
  border-radius: 1.5rem;
  border: 2px dashed #e2e8f0;
  background-color: #f8fafc;
  transition: all 0.3s ease;
  padding: 2rem;
}

:deep(.apk-uploader .el-upload-dragger:hover) {
  border-color: #dc2626;
  background-color: #fef2f2;
}

:deep(.el-input__wrapper, .el-textarea__inner, .el-input-number) {
  border-radius: 0.75rem !important;
}

:deep(.el-input-number .el-input-number__decrease),
:deep(.el-input-number .el-input-number__increase) {
  border-radius: 0.75rem !important;
}
.w-full {
  width: 100%;
}
</style>
