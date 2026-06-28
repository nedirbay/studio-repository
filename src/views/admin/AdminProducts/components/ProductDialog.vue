<script setup lang="ts">
import { ref, watch, toRaw, computed } from 'vue'
import { store, actions } from '../../../../store'
import { Plus, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { baseMediaURL } from '../../../../utils/request'

const props = defineProps<{
  visible: boolean
  isEditing: boolean
  product: any
  windowWidth: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'save', val: any): void
}>()

const dialogVisible = ref(props.visible)
const form = ref<any>({})
const fileList = ref<any[]>([])
const newSpecKey   = ref('')
const newSpecValue = ref('')
const loadingProduct = ref(false)

// ── Drag-and-drop image ordering ──────────────────────────────────────────
const draggingIdx  = ref<number | null>(null)
const dragoverIdx  = ref<number | null>(null)

const getAbsoluteUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return baseMediaURL + url
}

watch(() => props.visible, async (val) => {
  dialogVisible.value = val
  if (val && props.isEditing && props.product && props.product.slug) {
    loadingProduct.value = true
    try {
      const detailedProduct = await actions.fetchProductBySlug(props.product.slug)
      const mapped = JSON.parse(JSON.stringify(detailedProduct))
      form.value = {
        ...mapped,
        originalPrice: mapped.originalPrice ?? mapped.original_price ?? 0,
        inStock: mapped.inStock ?? mapped.instock ?? true,
        brand: mapped.brand ?? mapped.marka ?? '',
        category: mapped.category ?? mapped.category_name ?? '',
      }
      fileList.value = (detailedProduct.media || []).map((m: any) => ({
        name: m.url.split('/').pop(),
        url: getAbsoluteUrl(m.url),
        rawUrl: m.url
      }))
    } catch (error) {
      console.error('Failed to load detailed product:', error)
      ElMessage.error('Haryt maglumatlaryny ýüklemek başa barmady')
    } finally {
      loadingProduct.value = false
    }
  }
})

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

watch(() => props.product, (newVal) => {
  if (!newVal) return
  // Map backend snake_case fields to frontend camelCase for the form
  const mapped = JSON.parse(JSON.stringify(newVal))
  form.value = {
    ...mapped,
    // Normalize aliases: backend sends original_price / instock / marka / category_name
    originalPrice: mapped.originalPrice ?? mapped.original_price ?? 0,
    inStock: mapped.inStock ?? mapped.instock ?? true,
    brand: mapped.brand ?? mapped.marka ?? '',
    category: mapped.category ?? mapped.category_name ?? '',
  }
  fileList.value = (newVal.media || []).map((m: any) => ({
    name: m.url.split('/').pop(),
    url: getAbsoluteUrl(m.url),
    rawUrl: m.url
  }))
}, { deep: true, immediate: true })

const handleUpload = async (options: any) => {
  try {
    const url = await actions.uploadImage(options.file)
    fileList.value.push({
      name: options.file.name,
      url: getAbsoluteUrl(url),
      rawUrl: url
    })
    ElMessage.success('Surat ýüklendi')
  } catch (error) {
    ElMessage.error('Surat ýüklenmedi')
  }
}

const removeImage = (index: number) => {
  fileList.value.splice(index, 1)
}

const onDragStart = (index: number, event: DragEvent) => {
  draggingIdx.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

const onDragOver = (index: number, event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  dragoverIdx.value = index
}

const onDrop = (targetIndex: number) => {
  if (draggingIdx.value === null || draggingIdx.value === targetIndex) return
  const list = [...fileList.value]
  const [moved] = list.splice(draggingIdx.value, 1)
  list.splice(targetIndex, 0, moved)
  fileList.value = list
  draggingIdx.value = null
  dragoverIdx.value = null
}

const onDragEnd = () => {
  draggingIdx.value = null
  dragoverIdx.value = null
}

// Specifications (key-value dict)
const specEntries = computed(() =>
  Object.entries(form.value.specifications ?? {}) as [string, string][]
)

const addSpec = () => {
  const key = newSpecKey.value.trim()
  const val = newSpecValue.value.trim()
  if (!key || !val) {
    ElMessage.warning('Açar we gymmaty dolduryň')
    return
  }
  // Immutable update — Vue 3 reaktiwligini dogry işle
  form.value.specifications = {
    ...(form.value.specifications ?? {}),
    [key]: val
  }
  newSpecKey.value   = ''
  newSpecValue.value = ''
}

const removeSpec = (key: string) => {
  if (form.value.specifications) {
    delete form.value.specifications[key]
    // trigger reactivity
    form.value.specifications = { ...form.value.specifications }
  }
}

const updateSpecKey = (oldKey: string, newKey: string) => {
  if (!newKey.trim() || newKey === oldKey) return
  const val = form.value.specifications[oldKey]
  delete form.value.specifications[oldKey]
  form.value.specifications[newKey.trim()] = val
  form.value.specifications = { ...form.value.specifications }
}

const handleSave = () => {
  if (!form.value.name || !form.value.category || !form.value.price) {
    ElMessage.warning('Adyny, kategoriýasyny we bahasyny dolduryň')
    return
  }

  const media = fileList.value.map(file => ({
    kind: 'image',
    url: file.rawUrl || file.url
  }))

  // Emit using backend field names (snake_case).
  // toRaw() — Vue reaktiw proxy-ni arassa plain object-e öwürýär,
  // JSON serialyze edilende maglumat ýitmez.
  const specs = toRaw(form.value.specifications) ?? {}
  emit('save', {
    id: form.value.id,
    name: form.value.name,
    price: form.value.price,
    original_price: form.value.originalPrice ?? null,
    instock: form.value.inStock ?? true,
    marka: form.value.brand ?? '',
    badge: form.value.badge ?? null,
    description: form.value.description ?? '',
    specifications: { ...specs },
    category: form.value.category,
    media
  })
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEditing ? 'Harydy üýtgetmek' : 'Täze haryt goşmak'"
    :width="windowWidth < 768 ? '95%' : '800px'"
    class="admin-dialog"
    align-center
  >
    <div class="max-h-[70vh] overflow-y-auto px-4 custom-scrollbar" v-loading="loadingProduct">
      <el-form :model="form" label-position="top" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
        <el-form-item label="Haryt ady" class="md:col-span-2">
          <el-input v-model="form.name" placeholder="Harydyň doly ady" />
        </el-form-item>
        
        <el-form-item label="Kategoriýa">
          <el-select v-model="form.category" filterable clearable placeholder="Saýlaň" class="w-full">
            <el-option
              v-for="cat in store.categories"
              :key="cat.slug"
              :label="cat.name"
              :value="cat.name"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Brend">
          <el-select v-model="form.brand" filterable clearable placeholder="Saýlaň" class="w-full">
            <el-option
              v-for="brand in store.brands"
              :key="brand.slug"
              :label="brand.name"
              :value="brand.name"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Baha ($)">
          <el-input-number v-model="form.price" :min="0" class="!w-full" />
        </el-form-item>
        
        <el-form-item label="Köne baha ($)">
          <el-input-number v-model="form.originalPrice" :min="0" :precision="2" class="!w-full" />
        </el-form-item>
        
        <el-form-item label="Haryt suratlary" class="md:col-span-2">
          <div class="media-grid">
            <!-- Sortable image cards -->
            <div
              v-for="(file, idx) in fileList"
              :key="file.url"
              class="media-card"
              :class="{
                'media-card--dragging': draggingIdx === idx,
                'media-card--dragover': dragoverIdx === idx && draggingIdx !== idx,
                'media-card--first': idx === 0,
              }"
              draggable="true"
              @dragstart="onDragStart(idx, $event)"
              @dragover="onDragOver(idx, $event)"
              @drop="onDrop(idx)"
              @dragend="onDragEnd"
            >
              <img :src="file.url" :alt="file.name" class="media-card__img" />
              <!-- First badge -->
              <span v-if="idx === 0" class="media-card__badge">Esasy</span>
              <!-- Order number -->
              <span class="media-card__order">{{ idx + 1 }}</span>
              <!-- Drag handle icon -->
              <span class="media-card__drag-hint" title="Sürünji">&#x2630;</span>
              <!-- Remove button -->
              <button class="media-card__remove" @click.prevent="removeImage(idx)" title="Aý yr">
                &times;
              </button>
            </div>

            <!-- Upload trigger -->
            <el-upload
              class="media-upload-trigger"
              action="#"
              :auto-upload="true"
              :http-request="handleUpload"
              :show-file-list="false"
              accept="image/*"
              multiple
            >
              <div class="media-card media-card--add">
                <el-icon class="text-2xl text-slate-400"><Plus /></el-icon>
                <span class="text-xs text-slate-400 mt-1">Surat goş</span>
              </div>
            </el-upload>
          </div>
          <p v-if="fileList.length > 1" class="media-hint">
            ☰ Suratlary sürüklap tertipä getirersiňiz. Ilkinji surat esasy surat görnüşinde çykar.
          </p>
        </el-form-item>
        
        <el-form-item label="Badge (Bellik)">
          <el-select v-model="form.badge" placeholder="Saýlamaly däl" clearable class="w-full">
            <el-option label="Sale (Arzanladyş)" value="sale" />
            <el-option label="New (Täze)" value="new" />
            <el-option label="Hot (Mäşhur)" value="hot" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Satyşda barmy?">
          <el-switch v-model="form.inStock" active-text="Bar" inactive-text="Ýok" active-color="#22c55e" />
        </el-form-item>
        
        <el-form-item label="Düşündiriş" class="md:col-span-2">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="Haryt barada giňişleýin maglumat..." />
        </el-form-item>

        <!-- Specifications (key-value dict) -->
        <el-form-item label="Tehniki häsiýetnamalar (Specifications)" class="md:col-span-2">
          <div class="spec-block">
            <!-- existing entries -->
            <div
              v-for="([key, val]) in specEntries"
              :key="key"
              class="spec-row"
            >
              <el-input
                :model-value="key"
                placeholder="Açar"
                size="small"
                class="spec-key"
                @change="(newKey: string) => updateSpecKey(key, newKey)"
              />
              <span class="spec-sep">:</span>
              <el-input
                v-model="form.specifications[key]"
                placeholder="Gymmaty"
                size="small"
                class="flex-1"
              />
              <el-button link type="danger" @click="removeSpec(key)">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>

            <!-- add new row -->
            <div class="spec-add-row">
              <el-input
                v-model="newSpecKey"
                placeholder="Açar (meselem: Sensor)"
                size="small"
                class="spec-key"
                @keyup.enter="addSpec"
              />
              <span class="spec-sep">:</span>
              <el-input
                v-model="newSpecValue"
                placeholder="Gymmaty (meselem: Full-frame)"
                size="small"
                class="flex-1"
                @keyup.enter="addSpec"
              />
              <el-button type="primary" size="small" @click="addSpec">
                <el-icon><Plus /></el-icon> Goş
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
    
    <template #footer>
      <div class="flex gap-3 justify-end mt-4 px-4 pb-4">
        <el-button @click="dialogVisible = false" class="!rounded-xl">Bes et</el-button>
        <el-button type="primary" @click="handleSave" class="!rounded-xl !px-10 !font-black h-12">Harydy sakla</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
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

/* ── Spec / Feature block ───────────────────── */
.spec-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.spec-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: var(--el-fill-color-light, #f5f7fa);
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  transition: border-color 0.2s;
}
.spec-row:hover {
  border-color: var(--el-color-primary-light-5, #a0cfff);
}

.spec-key {
  width: 160px;
  flex-shrink: 0;
}

.spec-sep {
  font-weight: 700;
  color: var(--el-color-primary, #409eff);
  flex-shrink: 0;
  padding: 0 2px;
}

.spec-add-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border: 1px dashed var(--el-border-color, #dcdfe6);
  border-radius: 6px;
  background: transparent;
  transition: border-color 0.2s;
}
.spec-add-row:hover {
  border-color: var(--el-color-primary, #409eff);
}

/* ── Media Grid (drag-and-drop) ─────────────────── */
.media-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
}

.media-card {
  position: relative;
  width: 110px;
  height: 110px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid var(--el-border-color-lighter, #ebeef5);
  background: var(--el-fill-color-light, #f5f7fa);
  cursor: grab;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s, opacity 0.15s;
  user-select: none;
}
.media-card:hover {
  border-color: var(--el-color-primary-light-5, #a0cfff);
  box-shadow: 0 4px 16px rgba(64,158,255,.18);
}
.media-card:active {
  cursor: grabbing;
}

/* Currently being dragged */
.media-card--dragging {
  opacity: 0.4;
  transform: scale(0.93);
  border-color: var(--el-color-primary, #409eff) !important;
  border-style: dashed !important;
  box-shadow: none;
}

/* Drop target highlight */
.media-card--dragover {
  border-color: var(--el-color-success, #67c23a) !important;
  border-style: solid !important;
  box-shadow: 0 0 0 3px rgba(103,194,58,.25);
  transform: scale(1.04);
}

/* Primary image ring */
.media-card--first {
  border-color: var(--el-color-primary, #409eff);
  border-width: 2.5px;
}

.media-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  display: block;
}

/* "Esasy" badge */
.media-card__badge {
  position: absolute;
  top: 5px;
  left: 5px;
  background: var(--el-color-primary, #409eff);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 99px;
  pointer-events: none;
  letter-spacing: 0.3px;
}

/* Number badge */
.media-card__order {
  position: absolute;
  bottom: 5px;
  left: 5px;
  background: rgba(0,0,0,.45);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

/* Drag handle ≡ */
.media-card__drag-hint {
  position: absolute;
  bottom: 5px;
  right: 26px;
  color: rgba(255,255,255,.8);
  font-size: 14px;
  pointer-events: none;
  text-shadow: 0 1px 2px rgba(0,0,0,.4);
}

/* Remove × */
.media-card__remove {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: rgba(239,68,68,.85);
  color: #fff;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background 0.15s, transform 0.1s;
  z-index: 10;
}
.media-card__remove:hover {
  background: #dc2626;
  transform: scale(1.15);
}

/* Upload trigger card */
.media-upload-trigger .el-upload {
  display: block;
}
.media-upload-trigger .el-upload-dragger,
.media-upload-trigger .el-upload {
  width: 110px !important;
  height: 110px !important;
  border: none !important;
  padding: 0 !important;
}
.media-card--add {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-style: dashed !important;
  border-color: var(--el-border-color, #dcdfe6) !important;
  transition: border-color 0.2s, background 0.2s;
  background: transparent;
}
.media-card--add:hover {
  border-color: var(--el-color-primary, #409eff) !important;
  background: var(--el-color-primary-light-9, #ecf5ff) !important;
}

/* Hint text below grid */
.media-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-placeholder, #a8abb2);
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
