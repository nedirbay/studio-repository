<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Refresh, Search, VideoCamera, Picture } from '@element-plus/icons-vue'
import { adminPhotoStudioService } from './adminPhotoStudioService'
import { adminPhotoStudioStore } from './adminPhotoStudioStore'
import type { PhotoCollection, PhotoReel } from '../../../types'

const s = adminPhotoStudioStore

const dialogVisible = ref(false)
const editingId = ref<number | null>(null)

function emptyReel(): Partial<PhotoReel> {
  return {
    title: '',
    description: '',
    kind: 'video',
    media_url: '',
    thumbnail_url: '',
    music_title: '',
    category: null,
    is_published: true,
  }
}
function emptyCollection(): Partial<PhotoCollection> {
  return {
    title: '',
    description: '',
    kind: 'video',
    cover_url: '',
    category: null,
    is_published: true,
    sort_order: 0,
  }
}

const reelForm = reactive<Partial<PhotoReel>>(emptyReel())
const collectionForm = reactive<Partial<PhotoCollection>>(emptyCollection())

async function load() {
  s.loading = true
  try {
    const [reels, collections, categories] = await Promise.all([
      adminPhotoStudioService.listReels(),
      adminPhotoStudioService.listCollections(),
      adminPhotoStudioService.listCategories().catch(() => []),
    ])
    s.reels = reels
    s.collections = collections
    s.categories = Array.isArray(categories) ? categories : []
  } catch (e) {
    console.error('Failed to load photostudio data', e)
    ElMessage.error('Maglumatlary ýükläp bolmady')
  } finally {
    s.loading = false
  }
}

onMounted(load)

const filteredReels = computed(() => {
  const q = s.search.trim().toLowerCase()
  if (!q) return s.reels
  return s.reels.filter((r) => (r.title ?? '').toLowerCase().includes(q))
})
const filteredCollections = computed(() => {
  const q = s.search.trim().toLowerCase()
  if (!q) return s.collections
  return s.collections.filter((c) => c.title.toLowerCase().includes(q))
})

function openCreate() {
  editingId.value = null
  if (s.tab === 'reels') Object.assign(reelForm, emptyReel())
  else Object.assign(collectionForm, emptyCollection())
  dialogVisible.value = true
}

function openEditReel(r: PhotoReel) {
  editingId.value = r.id
  Object.assign(reelForm, emptyReel(), r)
  dialogVisible.value = true
}
function openEditCollection(c: PhotoCollection) {
  editingId.value = c.id
  Object.assign(collectionForm, emptyCollection(), c)
  dialogVisible.value = true
}

async function save() {
  try {
    if (s.tab === 'reels') {
      if (!reelForm.media_url?.trim()) {
        ElMessage.warning('Media URL hökman')
        return
      }
      if (editingId.value != null) {
        const updated = await adminPhotoStudioService.updateReel(editingId.value, reelForm)
        replaceReel(updated)
      } else {
        s.reels.unshift(await adminPhotoStudioService.createReel(reelForm))
      }
    } else {
      if (!collectionForm.title?.trim()) {
        ElMessage.warning('Ady hökman')
        return
      }
      if (editingId.value != null) {
        const updated = await adminPhotoStudioService.updateCollection(editingId.value, collectionForm)
        replaceCollection(updated)
      } else {
        s.collections.unshift(await adminPhotoStudioService.createCollection(collectionForm))
      }
    }
    ElMessage.success('Saklandy')
    dialogVisible.value = false
  } catch (e) {
    console.error('save failed', e)
    ElMessage.error('Saklap bolmady')
  }
}

function replaceReel(r: PhotoReel) {
  const i = s.reels.findIndex((x) => x.id === r.id)
  if (i !== -1) s.reels[i] = r
}
function replaceCollection(c: PhotoCollection) {
  const i = s.collections.findIndex((x) => x.id === c.id)
  if (i !== -1) s.collections[i] = c
}

async function togglePublish(r: PhotoReel) {
  try {
    const updated = await adminPhotoStudioService.setReelPublished(r.id, !r.is_published)
    replaceReel(updated && updated.id ? updated : { ...r, is_published: !r.is_published })
  } catch (e) {
    console.error('togglePublish failed', e)
    ElMessage.error('Üýtgedip bolmady')
  }
}

async function removeReel(r: PhotoReel) {
  if (!(await confirmDelete())) return
  try {
    await adminPhotoStudioService.deleteReel(r.id)
    s.reels = s.reels.filter((x) => x.id !== r.id)
    ElMessage.success('Pozuldy')
  } catch (e) {
    console.error('removeReel failed', e)
    ElMessage.error('Pozup bolmady')
  }
}
async function removeCollection(c: PhotoCollection) {
  if (!(await confirmDelete())) return
  try {
    await adminPhotoStudioService.deleteCollection(c.id)
    s.collections = s.collections.filter((x) => x.id !== c.id)
    ElMessage.success('Pozuldy')
  } catch (e) {
    console.error('removeCollection failed', e)
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
        <el-radio-button label="reels">
          <el-icon class="mr-1"><VideoCamera /></el-icon> Reels ({{ s.reels.length }})
        </el-radio-button>
        <el-radio-button label="collections">
          <el-icon class="mr-1"><Picture /></el-icon> Toplumlar ({{ s.collections.length }})
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

    <!-- Reels table -->
    <div v-show="s.tab === 'reels'" class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <el-table :data="filteredReels" v-loading="s.loading" style="width: 100%">
        <el-table-column label="#" width="70">
          <template #default="{ row }"><span class="font-black text-gray-400">#{{ row.id }}</span></template>
        </el-table-column>
        <el-table-column label="Surat" width="90">
          <template #default="{ row }">
            <img
              v-if="row.thumbnail_url || row.media_url"
              :src="row.thumbnail_url || row.media_url"
              class="w-12 h-12 rounded-lg object-cover bg-gray-100"
            />
          </template>
        </el-table-column>
        <el-table-column label="Ady" min-width="180">
          <template #default="{ row }">
            <div class="font-bold text-slate-900 leading-tight">{{ row.title || '—' }}</div>
            <div class="text-xs text-gray-400">{{ row.category_name || 'Kategoriýasyz' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Görnüş" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.kind === 'video' ? 'danger' : 'info'">{{ row.kind }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Görkezilen" width="110" align="center">
          <template #default="{ row }">
            <el-switch :model-value="!!row.is_published" @change="togglePublish(row)" />
          </template>
        </el-table-column>
        <el-table-column label="Amallar" width="120" align="right">
          <template #default="{ row }">
            <el-button type="primary" text :icon="Edit" @click="openEditReel(row)" />
            <el-button type="danger" text :icon="Delete" @click="removeReel(row)" />
          </template>
        </el-table-column>
        <template #empty><div class="py-12 text-center text-gray-400 font-bold">Reel ýok</div></template>
      </el-table>
    </div>

    <!-- Collections table -->
    <div v-show="s.tab === 'collections'" class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <el-table :data="filteredCollections" v-loading="s.loading" style="width: 100%">
        <el-table-column label="#" width="70">
          <template #default="{ row }"><span class="font-black text-gray-400">#{{ row.id }}</span></template>
        </el-table-column>
        <el-table-column label="Jlt" width="90">
          <template #default="{ row }">
            <img v-if="row.cover_url" :src="row.cover_url" class="w-12 h-12 rounded-lg object-cover bg-gray-100" />
          </template>
        </el-table-column>
        <el-table-column label="Ady" min-width="180">
          <template #default="{ row }">
            <div class="font-bold text-slate-900 leading-tight">{{ row.title }}</div>
            <div class="text-xs text-gray-400">{{ row.items_count }} sany element</div>
          </template>
        </el-table-column>
        <el-table-column label="Görnüş" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.kind === 'video' ? 'danger' : 'info'">{{ row.kind }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Amallar" width="120" align="right">
          <template #default="{ row }">
            <el-button type="primary" text :icon="Edit" @click="openEditCollection(row)" />
            <el-button type="danger" text :icon="Delete" @click="removeCollection(row)" />
          </template>
        </el-table-column>
        <template #empty><div class="py-12 text-center text-gray-400 font-bold">Toplum ýok</div></template>
      </el-table>
    </div>

    <!-- Create / edit dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="(editingId != null ? 'Üýtgetmek' : 'Täze') + (s.tab === 'reels' ? ' — Reel' : ' — Toplum')"
      width="90%"
      class="studio-order-dialog"
      top="5vh"
    >
      <!-- Reel form -->
      <el-form v-if="s.tab === 'reels'" :model="reelForm" label-position="top">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
          <el-form-item label="Ady">
            <el-input v-model="reelForm.title" placeholder="Sözbaşy" />
          </el-form-item>
          <el-form-item label="Görnüş">
            <el-select v-model="reelForm.kind" class="w-full">
              <el-option label="Wideo" value="video" />
              <el-option label="Surat" value="image" />
            </el-select>
          </el-form-item>
          <el-form-item label="Kategoriýa">
            <el-select v-model="reelForm.category" clearable class="w-full" placeholder="Saýlaň">
              <el-option v-for="c in s.categories" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="Aýdym (music)">
            <el-input v-model="reelForm.music_title" placeholder="Music title" />
          </el-form-item>
        </div>
        <el-form-item label="Media URL">
          <el-input v-model="reelForm.media_url" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="Thumbnail URL">
          <el-input v-model="reelForm.thumbnail_url" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="Beýany">
          <el-input v-model="reelForm.description" type="textarea" :rows="3" resize="vertical" />
        </el-form-item>
        <el-form-item label="Görkezilsin (published)">
          <el-switch v-model="reelForm.is_published" />
        </el-form-item>
      </el-form>

      <!-- Collection form -->
      <el-form v-else :model="collectionForm" label-position="top">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
          <el-form-item label="Ady">
            <el-input v-model="collectionForm.title" placeholder="Toplumyň ady" />
          </el-form-item>
          <el-form-item label="Görnüş">
            <el-select v-model="collectionForm.kind" class="w-full">
              <el-option label="Wideo" value="video" />
              <el-option label="Surat" value="image" />
            </el-select>
          </el-form-item>
          <el-form-item label="Kategoriýa">
            <el-select v-model="collectionForm.category" clearable class="w-full" placeholder="Saýlaň">
              <el-option v-for="c in s.categories" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="Tertip (sort)">
            <el-input-number v-model="collectionForm.sort_order" :min="0" class="w-full" controls-position="right" />
          </el-form-item>
        </div>
        <el-form-item label="Cover URL">
          <el-input v-model="collectionForm.cover_url" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="Beýany">
          <el-input v-model="collectionForm.description" type="textarea" :rows="3" resize="vertical" />
        </el-form-item>
        <el-form-item label="Görkezilsin (published)">
          <el-switch v-model="collectionForm.is_published" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">Goýbolsun</el-button>
        <el-button type="primary" @click="save">Sakla</el-button>
      </template>
    </el-dialog>
  </div>
</template>
