<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Cellphone, 
  Plus, 
  Delete, 
  Check, 
  Download, 
  Document,
  Calendar,
  Edit
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { type MobileAppVersion } from '../../../repositories/mobileAppRepository'
import { adminMobileAppsService } from './adminMobileAppsService'
import UploadAppDialog from './components/UploadAppDialog.vue'
import EditAppDialog from './components/EditAppDialog.vue'

// State
const activeApp = ref<MobileAppVersion | null>(null)
const versions = ref<MobileAppVersion[]>([])
const loadingActive = ref(true)
const loadingList = ref(false)
const uploadDialogVisible = ref(false)
const uploading = ref(false)
const editDialogVisible = ref(false)
const editingVersion = ref<MobileAppVersion | null>(null)
const saving = ref(false)

// Formatting helpers
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('tk-TM', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Fetch APIs
const fetchActiveVersion = async () => {
  loadingActive.value = true
  try {
    const data = await adminMobileAppsService.getActive()
    activeApp.value = data
  } catch (err) {
    console.error('Error fetching active mobile app:', err)
  } finally {
    loadingActive.value = false
  }
}

const fetchVersions = async () => {
  loadingList.value = true
  try {
    const data = await adminMobileAppsService.listVersions()
    versions.value = data
  } catch (err) {
    console.error('Error fetching versions:', err)
    ElMessage.error('Wersiýalary ýüklemekde ýalňyşlyk ýüze çykdy.')
  } finally {
    loadingList.value = false
  }
}

// Actions
const onUploadSubmit = async (formData: FormData) => {
  uploading.value = true
  try {
    await adminMobileAppsService.uploadVersion(formData)
    ElMessage.success('Täze wersiýa üstünlikli ýüklendi!')
    uploadDialogVisible.value = false
    
    // Refresh Data
    await fetchActiveVersion()
    await fetchVersions()
  } catch (err: any) {
    console.error('Upload failed:', err)
    ElMessage.error(err.response?.data?.error || 'Wersiýany ýüklemek başartmady.')
  } finally {
    uploading.value = false
  }
}

const handleActivate = async (id: number) => {
  try {
    await adminMobileAppsService.activateVersion(id)
    ElMessage.success('Wersiýa üstünlikli işjeňleşdirildi!')
    await fetchActiveVersion()
    await fetchVersions()
  } catch (err) {
    console.error('Activation failed:', err)
    ElMessage.error('Wersiýany işjeňleşdirmek başartmady.')
  }
}

const handleDelete = (id: number) => {
  ElMessageBox.confirm(
    'Bu wersiýany we onuň degişli APK faýlyny serwerden doly öçürmek isleýärsiňizmi? Bu hereketi yza alyp bolmaz.',
    'Wersiýany öçürmek',
    {
      confirmButtonText: 'Öçür',
      cancelButtonText: 'Ýatyr',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      await adminMobileAppsService.deleteVersion(id)
      ElMessage.success('Wersiýa üstünlikli öçürildi.')
      await fetchActiveVersion()
      await fetchVersions()
    } catch (err) {
      console.error('Deletion failed:', err)
      ElMessage.error('Wersiýany öçürmek başartmady.')
    }
  }).catch(() => {})
}

const handleEdit = (row: MobileAppVersion) => {
  editingVersion.value = row
  editDialogVisible.value = true
}

const onEditSubmit = async (formData: FormData) => {
  if (!editingVersion.value) return
  saving.value = true
  try {
    await adminMobileAppsService.updateVersion(editingVersion.value.id, formData)
    ElMessage.success('Wersiýa maglumatlary üstünlikli täzelendi!')
    editDialogVisible.value = false
    
    // Refresh Data
    await fetchActiveVersion()
    await fetchVersions()
  } catch (err: any) {
    console.error('Update failed:', err)
    ElMessage.error(err.response?.data?.error || 'Wersiýany üýtgetmek başartmady.')
  } finally {
    saving.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await fetchActiveVersion()
  await fetchVersions()
})
</script>

<template>
  <div class="admin-mobile-apps space-y-8 pb-10">
    <!-- Active Version Overview Card -->
    <div v-loading="loadingActive" class="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 p-8 text-white shadow-xl border border-white/5">
      <!-- Glow background -->
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-red-600/15 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div class="space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
            <el-icon><cellphone /></el-icon>
            Işjeň wersiýa
          </div>
          
          <div v-if="activeApp">
            <h1 class="text-3xl font-black">w{{ activeApp.version_name }} <span class="text-sm font-light text-gray-400">#{{ activeApp.version_code }}</span></h1>
            <p class="text-gray-300 text-sm mt-1 max-w-xl">
              Häzirki wagtda ulanyjylar tarapyndan ýükläp alynýan resmi wersiýa.
            </p>
            <div class="flex flex-wrap gap-4 mt-4 text-xs text-gray-300">
              <span class="flex items-center gap-1"><el-icon><calendar /></el-icon> {{ formatDate(activeApp.created_at) }}</span>
              <span class="flex items-center gap-1"><el-icon><document /></el-icon> APK wersiýasy</span>
            </div>
          </div>
          <div v-else>
            <h1 class="text-2xl font-black text-gray-300">Işjeň wersiýa ýok</h1>
            <p class="text-gray-400 text-sm mt-1">Ulgamda häzirki wagtda aktiw ýükläp alynjak wersiýa ýokdur. Aşakdan täze goşup ýa-da işjeňleşdirip bilersiňiz.</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <a 
            v-if="activeApp?.file_url"
            :href="activeApp.file_url"
            target="_blank"
            class="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-600/20 no-underline cursor-pointer"
          >
            <el-icon><download /></el-icon>
            APK ýükle
          </a>
          <button 
            @click="uploadDialogVisible = true"
            class="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm border border-white/10 transition-all cursor-pointer"
          >
            <el-icon><plus /></el-icon>
            Täze wersiýa goş
          </button>
        </div>
      </div>
    </div>

    <!-- Main Versions Control Table Card -->
    <div class="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <h3 class="text-xl font-black text-slate-900 uppercase tracking-tight">Wersiýa taryhy</h3>
          <p class="text-xs text-gray-500 mt-0.5">Ulgamdaky ähli öňki ýüklenen goşundylaryň wersiýalarynyň sanawy.</p>
        </div>
      </div>

      <el-table 
        v-loading="loadingList"
        :data="versions" 
        style="width: 100%" 
        class="rounded-2xl border border-gray-100 overflow-hidden"
      >
        <el-table-column label="Wersiýa ady" width="140">
          <template #default="{ row }">
            <span class="font-black text-slate-900">w{{ row.version_name }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="Wersiýa kody" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="info" class="!rounded-md !font-bold">#{{ row.version_code }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="Ýagdaýy" width="130">
          <template #default="{ row }">
            <span 
              v-if="row.is_active" 
              class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-200 text-xs font-black rounded-full"
            >
              <span class="w-1.5 h-1.5 bg-green-600 rounded-full animate-ping"></span>
              Işjeň
            </span>
            <span 
              v-else 
              class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 text-xs font-bold rounded-full"
            >
              Işjeň däl
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="Wersiýa täzelikleri / Release Notes" min-width="250">
          <template #default="{ row }">
            <p class="text-xs text-gray-600 leading-relaxed whitespace-pre-line truncate max-w-sm" :title="row.description">{{ row.description || '-' }}</p>
          </template>
        </el-table-column>
        
        <el-table-column label="Ýüklenen senesi" width="180">
          <template #default="{ row }">
            <span class="text-xs text-gray-400 flex items-center gap-1"><el-icon><calendar /></el-icon> {{ formatDate(row.created_at) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="Hereketler" width="220" align="right">
          <template #default="{ row }">
            <div class="flex justify-end gap-2">
              <button 
                @click="handleEdit(row)"
                class="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 hover:border-amber-300 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                title="Redaktirle"
              >
                <el-icon class="text-sm"><edit /></el-icon>
              </button>
              <button 
                v-if="!row.is_active"
                @click="handleActivate(row.id)"
                class="p-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 hover:border-green-300 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                title="Işjeň et"
              >
                <el-icon class="text-sm"><check /></el-icon>
              </button>
              <a 
                v-if="row.file_url"
                :href="row.file_url"
                target="_blank"
                class="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg transition-colors inline-flex items-center justify-center"
                title="Ýükle"
              >
                <el-icon class="text-sm"><download /></el-icon>
              </a>
              <button 
                @click="handleDelete(row.id)"
                class="p-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                title="Öçür"
              >
                <el-icon class="text-sm"><delete /></el-icon>
              </button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Upload Version Dialog Component -->
    <UploadAppDialog
      v-model:visible="uploadDialogVisible"
      :uploading="uploading"
      @submit="onUploadSubmit"
    />

    <!-- Edit Version Dialog Component -->
    <EditAppDialog
      v-model:visible="editDialogVisible"
      :saving="saving"
      :version="editingVersion"
      @submit="onEditSubmit"
    />
  </div>
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
</style>
