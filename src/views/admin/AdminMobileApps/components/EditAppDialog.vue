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
    class="admin-dialog"
    append-to-body
  >
    <div v-loading="saving" element-loading-text="Wersiýa maglumatlary täzelenýär...">
      <div class="space-y-4 text-gray-900">
        <!-- Optional APK file replacement -->
        <div>
          <label class="block mb-2">APK faýlyny täzelemek (islege bagly)</label>
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
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block mb-2">Wersiýa ady</label>
            <el-input v-model="editForm.version_name" placeholder="Mysal üçin: 1.0.2" />
          </div>
          <div>
            <label class="block mb-2">Wersiýa kody</label>
            <el-input-number v-model="editForm.version_code" :min="1" placeholder="Mysal üçin: 3" class="w-full" />
          </div>
        </div>
        
        <div>
          <label class="block mb-2">Ýazgy / Täzelikler</label>
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="4"
            placeholder="Bu wersiýada girizilen üýtgeşmeler barada ýazyň..."
          ></el-input>
        </div>
        
        <div class="flex items-center justify-between gap-4 py-3 border-t border-gray-200">
          <div>
            <div class="text-sm font-medium text-gray-900">Işjeňleşdir</div>
            <div class="text-sm text-gray-600">Bu wersiýa ulanyjylar üçin elýeterli bolar.</div>
          </div>
          <el-switch v-model="editForm.is_active" active-color="#dc2626"></el-switch>
        </div>
      </div>
      
      <!-- Dialog Footer -->
      <div class="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-200">
        <el-button @click="dialogVisible = false">Ýatyr</el-button>
        <el-button type="primary" :loading="saving" @click="handleEditSubmit">Sakla</el-button>
      </div>
    </div>
  </el-dialog>
</template>
