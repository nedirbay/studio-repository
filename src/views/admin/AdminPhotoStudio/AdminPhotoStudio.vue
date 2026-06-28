<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Refresh, Search, VideoCamera, Picture } from '@element-plus/icons-vue'
import { adminPhotoStudioService } from './adminPhotoStudioService'
import { adminPhotoStudioStore } from './adminPhotoStudioStore'

const s = adminPhotoStudioStore

const dialogVisible = ref(false)
const editingId = ref<number | null>(null)

function emptyVideo() {
  return {
    title: '',
    description: '',
    thumbnail_image_url: '',
    video_url: '',
  }
}
function emptyImage() {
  return {
    title: '',
    description: '',
    thumbnail_image_url: '',
    image_url: '',
  }
}

const videoForm = reactive(emptyVideo())
const imageForm = reactive(emptyImage())

const videoFile = ref<File | null>(null)
const videoThumbnailFile = ref<File | null>(null)
const imageFile = ref<File | null>(null)
const imageThumbnailFile = ref<File | null>(null)

const videoThumbnailFileUrl = ref('')
const videoFileUrl = ref('')
const imageThumbnailFileUrl = ref('')
const imageFileUrl = ref('')

function handleVideoThumbnailChange(file: any) {
  videoThumbnailFile.value = file.raw
  videoThumbnailFileUrl.value = URL.createObjectURL(file.raw)
}

function handleVideoFileChange(file: any) {
  videoFile.value = file.raw
  videoFileUrl.value = URL.createObjectURL(file.raw)
}

function handleImageThumbnailChange(file: any) {
  imageThumbnailFile.value = file.raw
  imageThumbnailFileUrl.value = URL.createObjectURL(file.raw)
}

function handleImageFileChange(file: any) {
  imageFile.value = file.raw
  imageFileUrl.value = URL.createObjectURL(file.raw)
}

function cleanupUrls() {
  if (videoThumbnailFileUrl.value) URL.revokeObjectURL(videoThumbnailFileUrl.value)
  if (videoFileUrl.value) URL.revokeObjectURL(videoFileUrl.value)
  if (imageThumbnailFileUrl.value) URL.revokeObjectURL(imageThumbnailFileUrl.value)
  if (imageFileUrl.value) URL.revokeObjectURL(imageFileUrl.value)
  videoThumbnailFileUrl.value = ''
  videoFileUrl.value = ''
  imageThumbnailFileUrl.value = ''
  imageFileUrl.value = ''
}

async function loadVideos(page = s.videosPage) {
  s.loading = true
  try {
    const res = await adminPhotoStudioService.listVideos(page, s.pageSize)
    s.videos = res.results
    s.videosTotal = res.count
    s.videosPage = page
  } catch (e) {
    console.error('Failed to load videos', e)
    ElMessage.error('Wideolar ýükläp bolmady')
  } finally {
    s.loading = false
  }
}

async function loadImages(page = s.imagesPage) {
  s.loading = true
  try {
    const res = await adminPhotoStudioService.listImages(page, s.pageSize)
    s.images = res.results
    s.imagesTotal = res.count
    s.imagesPage = page
  } catch (e) {
    console.error('Failed to load images', e)
    ElMessage.error('Suratlar ýükläp bolmady')
  } finally {
    s.loading = false
  }
}

async function load() {
  await Promise.all([loadVideos(1), loadImages(1)])
}

onMounted(load)

const filteredVideos = computed(() => {
  const q = s.search.trim().toLowerCase()
  if (!q) return s.videos
  return s.videos.filter((v) => (v.title ?? '').toLowerCase().includes(q))
})
const filteredImages = computed(() => {
  const q = s.search.trim().toLowerCase()
  if (!q) return s.images
  return s.images.filter((img) => (img.title ?? '').toLowerCase().includes(q))
})

function openCreate() {
  editingId.value = null
  cleanupUrls()
  if (s.tab === 'videos') {
    Object.assign(videoForm, emptyVideo())
    videoFile.value = null
    videoThumbnailFile.value = null
  } else {
    Object.assign(imageForm, emptyImage())
    imageFile.value = null
    imageThumbnailFile.value = null
  }
  dialogVisible.value = true
}

function openEditVideo(v: any) {
  editingId.value = v.id
  cleanupUrls()
  Object.assign(videoForm, emptyVideo(), v)
  videoFile.value = null
  videoThumbnailFile.value = null
  dialogVisible.value = true
}
function openEditImage(img: any) {
  editingId.value = img.id
  cleanupUrls()
  Object.assign(imageForm, emptyImage(), img)
  imageFile.value = null
  imageThumbnailFile.value = null
  dialogVisible.value = true
}

async function save() {
  try {
    if (s.tab === 'videos') {
      if (!videoForm.title?.trim()) {
        ElMessage.warning('Sözbaşy hökman')
        return
      }
      if (editingId.value == null && !videoFile.value) {
        ElMessage.warning('Wideo faýl saýlaň')
        return
      }
      if (editingId.value == null && !videoThumbnailFile.value) {
        ElMessage.warning('Thumbnail surat saýlaň')
        return
      }

      const formData = new FormData()
      formData.append('title', videoForm.title.trim())
      formData.append('description', (videoForm.description || '').trim())
      if (videoFile.value) {
        formData.append('video', videoFile.value)
      }
      if (videoThumbnailFile.value) {
        formData.append('thumbnail_image', videoThumbnailFile.value)
      }

      if (editingId.value != null) {
        const updated = await adminPhotoStudioService.updateVideo(editingId.value, formData)
        replaceVideo(updated)
      } else {
        s.videos.unshift(await adminPhotoStudioService.createVideo(formData))
      }
    } else {
      if (!imageForm.title?.trim()) {
        ElMessage.warning('Sözbaşy hökman')
        return
      }
      if (editingId.value == null && !imageFile.value) {
        ElMessage.warning('Surat faýl saýlaň')
        return
      }
      if (editingId.value == null && !imageThumbnailFile.value) {
        ElMessage.warning('Thumbnail surat saýlaň')
        return
      }

      const formData = new FormData()
      formData.append('title', imageForm.title.trim())
      formData.append('description', (imageForm.description || '').trim())
      if (imageFile.value) {
        formData.append('image', imageFile.value)
      }
      if (imageThumbnailFile.value) {
        formData.append('thumbnail_image', imageThumbnailFile.value)
      }

      if (editingId.value != null) {
        const updated = await adminPhotoStudioService.updateImage(editingId.value, formData)
        replaceImage(updated)
      } else {
        s.images.unshift(await adminPhotoStudioService.createImage(formData))
      }
    }
    ElMessage.success('Saklandy')
    dialogVisible.value = false
    cleanupUrls()
  } catch (e) {
    console.error('save failed', e)
    ElMessage.error('Saklap bolmady')
  }
}

function replaceVideo(v: any) {
  const i = s.videos.findIndex((x) => x.id === v.id)
  if (i !== -1) s.videos[i] = v
}
function replaceImage(img: any) {
  const i = s.images.findIndex((x) => x.id === img.id)
  if (i !== -1) s.images[i] = img
}

async function removeVideo(v: any) {
  if (!(await confirmDelete())) return
  try {
    await adminPhotoStudioService.deleteVideo(v.id)
    s.videos = s.videos.filter((x) => x.id !== v.id)
    ElMessage.success('Pozuldy')
  } catch (e) {
    console.error('removeVideo failed', e)
    ElMessage.error('Pozup bolmady')
  }
}
async function removeImage(img: any) {
  if (!(await confirmDelete())) return
  try {
    await adminPhotoStudioService.deleteImage(img.id)
    s.images = s.images.filter((x) => x.id !== img.id)
    ElMessage.success('Pozuldy')
  } catch (e) {
    console.error('removeImage failed', e)
    ElMessage.error('Pozup bolmady')
  }
}

async function confirmDelete(): Promise<boolean> {
  try {
    await ElMessageBox.confirm('Hakykatdanam pozmakçymy?', 'Tassyklaň', {
      confirmButtonText: 'Hawa',
      cancelButtonText: 'Ýok',
      type: 'warning',
    })
    return true
  } catch {
    return false
  }
}
</script>

<template>
  <div class="space-y-6 pb-20">
    <!-- Tabs + toolbar -->
    <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <el-radio-group v-model="s.tab">
        <el-radio-button label="videos">
          <el-icon class="mr-1"><VideoCamera /></el-icon> Wideolar ({{ s.videos.length }})
        </el-radio-button>
        <el-radio-button label="images">
          <el-icon class="mr-1"><Picture /></el-icon> Suratlar ({{ s.images.length }})
        </el-radio-button>
      </el-radio-group>

      <div class="flex gap-2">
        <el-input v-model="s.search" placeholder="Gözleg..." clearable class="w-44 sm:w-56">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button :icon="Refresh" :loading="s.loading" @click="load" />
        <el-button type="primary" :icon="Plus" @click="openCreate">Goş</el-button>
      </div>
    </div>

    <!-- Videos table -->
    <div v-show="s.tab === 'videos'" class="space-y-3">
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <el-table :data="filteredVideos" v-loading="s.loading" style="width: 100%">
          <el-table-column label="#" width="70">
            <template #default="{ row }"><span class="font-black text-gray-400">#{{ row.id }}</span></template>
          </el-table-column>
          <el-table-column label="Surat" width="90">
            <template #default="{ row }">
              <img
                v-if="row.thumbnail_image_url"
                :src="row.thumbnail_image_url"
                class="w-12 h-12 rounded-lg object-cover bg-gray-100"
              />
            </template>
          </el-table-column>
          <el-table-column label="Ady" min-width="180">
            <template #default="{ row }">
              <div class="font-bold text-slate-900 leading-tight">{{ row.title || '—' }}</div>
              <div class="text-xs text-gray-400 mt-1 max-w-sm truncate">{{ row.description || 'Beýan ýok' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="HLS Status" width="120" align="center">
            <template #default="{ row }">
              <el-tag
                size="small"
                :type="row.hls_status === 'ready' ? 'success' : row.hls_status === 'processing' ? 'warning' : row.hls_status === 'failed' ? 'danger' : 'info'"
              >
                {{ row.hls_status || 'Garaşylýar' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Amallar" width="120" align="right">
            <template #default="{ row }">
              <el-button type="primary" text :icon="Edit" @click="openEditVideo(row)" />
              <el-button type="danger" text :icon="Delete" @click="removeVideo(row)" />
            </template>
          </el-table-column>
          <template #empty><div class="py-12 text-center text-gray-400 font-bold">Wideo ýok</div></template>
        </el-table>
      </div>
      <div v-if="s.videosTotal > s.pageSize" class="flex justify-center">
        <el-pagination
          v-model:current-page="s.videosPage"
          :page-size="s.pageSize"
          :total="s.videosTotal"
          layout="prev, pager, next"
          background
          @current-change="loadVideos"
        />
      </div>
    </div>

    <!-- Images table -->
    <div v-show="s.tab === 'images'" class="space-y-3">
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <el-table :data="filteredImages" v-loading="s.loading" style="width: 100%">
          <el-table-column label="#" width="70">
            <template #default="{ row }"><span class="font-black text-gray-400">#{{ row.id }}</span></template>
          </el-table-column>
          <el-table-column label="Surat" width="90">
            <template #default="{ row }">
              <img v-if="row.thumbnail_image_url" :src="row.thumbnail_image_url" class="w-12 h-12 rounded-lg object-cover bg-gray-100" />
            </template>
          </el-table-column>
          <el-table-column label="Ady" min-width="180">
            <template #default="{ row }">
              <div class="font-bold text-slate-900 leading-tight">{{ row.title }}</div>
              <div class="text-xs text-gray-400 mt-1 max-w-sm truncate">{{ row.description || 'Beýan ýok' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="Amallar" width="120" align="right">
            <template #default="{ row }">
              <el-button type="primary" text :icon="Edit" @click="openEditImage(row)" />
              <el-button type="danger" text :icon="Delete" @click="removeImage(row)" />
            </template>
          </el-table-column>
          <template #empty><div class="py-12 text-center text-gray-400 font-bold">Surat ýok</div></template>
        </el-table>
      </div>
      <div v-if="s.imagesTotal > s.pageSize" class="flex justify-center">
        <el-pagination
          v-model:current-page="s.imagesPage"
          :page-size="s.pageSize"
          :total="s.imagesTotal"
          layout="prev, pager, next"
          background
          @current-change="loadImages"
        />
      </div>
    </div>

    <!-- Create / edit dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="(editingId != null ? 'Üýtgetmek' : 'Täze') + (s.tab === 'videos' ? ' — Wideo' : ' — Surat')"
      width="90%"
      class="studio-order-dialog"
      top="5vh"
    >
      <!-- Video form -->
      <el-form v-if="s.tab === 'videos'" :model="videoForm" label-position="top">
        <div class="grid grid-cols-1 gap-y-1">
          <el-form-item label="Ady">
            <el-input v-model="videoForm.title" placeholder="Sözbaşy" />
          </el-form-item>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <el-form-item label="Thumbnail Surat (Görk) ”.jpg, .png”">
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 rounded-xl bg-gray-50 border overflow-hidden flex items-center justify-center shadow-sm relative shrink-0">
                <img v-if="videoThumbnailFileUrl || videoForm.thumbnail_image_url" :src="videoThumbnailFileUrl || videoForm.thumbnail_image_url" class="w-full h-full object-cover" />
                <el-icon v-else class="text-gray-400 text-xl"><Picture /></el-icon>
              </div>
              <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                accept="image/*"
                @change="handleVideoThumbnailChange"
              >
                <el-button type="primary" plain size="small">Surat saýlaň</el-button>
              </el-upload>
            </div>
          </el-form-item>

          <el-form-item label="Wideo Faýl (.mp4)">
            <div class="flex flex-col gap-3">
              <div v-if="videoFileUrl || videoForm.video_url" class="w-64 aspect-video rounded-xl bg-black border overflow-hidden relative shadow-sm shrink-0">
                <video :src="videoFileUrl || videoForm.video_url" controls class="w-full h-full object-contain" />
              </div>
              <div class="flex items-center gap-4">
                <div class="text-xs text-gray-500 max-w-xs truncate font-medium">
                  {{ videoFile ? videoFile.name : (videoForm.video_url ? 'Häzirki wideo ýüklenen' : 'Faýl saýlanmady') }}
                </div>
                <el-upload
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  accept="video/*"
                  @change="handleVideoFileChange"
                >
                  <el-button type="primary" plain size="small">Wideo saýlaň</el-button>
                </el-upload>
              </div>
            </div>
          </el-form-item>
        </div>

        <el-form-item label="Beýany" class="mt-2">
          <el-input v-model="videoForm.description" type="textarea" :rows="3" resize="vertical" placeholder="Wideo barada..." />
        </el-form-item>
      </el-form>

      <!-- Image form -->
      <el-form v-else :model="imageForm" label-position="top">
        <div class="grid grid-cols-1 gap-y-1">
          <el-form-item label="Ady">
            <el-input v-model="imageForm.title" placeholder="Sözbaşy" />
          </el-form-item>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <el-form-item label="Thumbnail Surat (Görk) ”.jpg, .png”">
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 rounded-xl bg-gray-50 border overflow-hidden flex items-center justify-center shadow-sm relative shrink-0">
                <img v-if="imageThumbnailFileUrl || imageForm.thumbnail_image_url" :src="imageThumbnailFileUrl || imageForm.thumbnail_image_url" class="w-full h-full object-cover" />
                <el-icon v-else class="text-gray-400 text-xl"><Picture /></el-icon>
              </div>
              <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                accept="image/*"
                @change="handleImageThumbnailChange"
              >
                <el-button type="primary" plain size="small">Surat saýlaň</el-button>
              </el-upload>
            </div>
          </el-form-item>

          <el-form-item label="Uly Surat Faýly">
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 rounded-xl bg-gray-50 border overflow-hidden flex items-center justify-center shadow-sm relative shrink-0">
                <img v-if="imageFileUrl || imageForm.image_url" :src="imageFileUrl || imageForm.image_url" class="w-full h-full object-cover" />
                <el-icon v-else class="text-gray-400 text-xl"><Picture /></el-icon>
              </div>
              <div class="flex flex-col gap-2">
                <div class="text-xs text-gray-500 max-w-xs truncate font-medium">
                  {{ imageFile ? imageFile.name : (imageForm.image_url ? 'Häzirki surat ýüklenen' : 'Faýl saýlanmady') }}
                </div>
                <el-upload
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  accept="image/*"
                  @change="handleImageFileChange"
                >
                  <el-button type="primary" plain size="small">Surat saýlaň</el-button>
                </el-upload>
              </div>
            </div>
          </el-form-item>
        </div>

        <el-form-item label="Beýany" class="mt-2">
          <el-input v-model="imageForm.description" type="textarea" :rows="3" resize="vertical" placeholder="Surat barada..." />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">Goýbolsun</el-button>
        <el-button type="primary" @click="save">Sakla</el-button>
      </template>
    </el-dialog>
  </div>
</template>
