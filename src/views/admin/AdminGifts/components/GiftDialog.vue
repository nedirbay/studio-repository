<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { actions } from '../../../../store'
import { baseMediaURL } from '../../../../utils/request'

const props = defineProps<{
  visible: boolean
  isEditing: boolean
  campaign: {
    type: string
    title: string
    subtitle: string
    description: string
    image_url: string
    banner_url: string
    bg_gradient: string
    prize_title: string
    prize_value: number
    starts_at: string
    ends_at: string
    rules: string
    discount_percent: number
    promo_code: string
    is_featured: boolean
    status: string
  }
  windowWidth: number
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'save', val: typeof props.campaign): void
}>()

const form = ref({ ...props.campaign })

const colorStart = ref('#dc2626')
const colorEnd = ref('#f97316')

// Watch form.bg_gradient to update colorpickers
watch(() => form.value.bg_gradient, (val) => {
  if (val && val.includes(',')) {
    const parts = val.split(',')
    if (parts[0] && parts[0].startsWith('#')) colorStart.value = parts[0]
    if (parts[1] && parts[1].startsWith('#')) colorEnd.value = parts[1]
  } else if (val && val.startsWith('#')) {
    colorStart.value = val
    colorEnd.value = val
  } else {
    // Default fallback for Tailwind classes like "from-red-600 to-orange-500"
    colorStart.value = '#dc2626'
    colorEnd.value = '#f97316'
  }
}, { immediate: true })

// Watch colorpickers to update form.bg_gradient
watch([colorStart, colorEnd], ([start, end]) => {
  form.value.bg_gradient = `${start},${end}`
})

const getAbsoluteUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url
  }
  return baseMediaURL + url
}

const handleImageUpload = async (options: any, field: 'image_url' | 'banner_url') => {
  try {
    const url = await actions.uploadImage(options.file)
    form.value[field] = url
    ElMessage.success('Surat üstünlikli ýüklendi!')
  } catch (error) {
    ElMessage.error('Surat ýüklemek başa barmady')
  }
}

watch(() => props.campaign, (newVal) => {
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
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEditing ? 'Aksiýany üýtgetmek' : 'Täze aksiýa / sowgat goşmak'"
    :width="windowWidth < 768 ? '94%' : '680px'"
    class="admin-dialog"
    align-center
  >
    <el-form :model="form" label-position="top" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      
      <el-form-item label="Aksiýanyň görnüşi" class="col-span-1">
        <el-select v-model="form.type" placeholder="Saýlaň" class="w-full">
          <el-option label="Bäsleşikler / Giveaway" value="giveaway" />
          <el-option label="Aksiýalar" value="promotion" />
          <el-option label="Sowgatlar" value="gift" />
        </el-select>
      </el-form-item>

      <el-form-item label="Aksiýa statusy" class="col-span-1">
        <el-select v-model="form.status" placeholder="Saýlaň" class="w-full">
          <el-option label="Garaşylýar (Draft)" value="draft" />
          <el-option label="Işjeň (Active)" value="active" />
          <el-option label="Tamamlandy (Finished)" value="finished" />
          <el-option label="Ýatyryldy (Cancelled)" value="cancelled" />
        </el-select>
      </el-form-item>

      <el-form-item label="Aksiýanyň ady" class="col-span-2">
        <el-input v-model="form.title" placeholder="Mysal üçin: Ulgama agza bolan ilkinji 10 müşderä sowgat!" />
      </el-form-item>

      <el-form-item label="Gysga düşündiriş (Subtitle)" class="col-span-2">
        <el-input v-model="form.subtitle" placeholder="Mysal üçin: Uly utuşly bäsleşik" />
      </el-form-item>

      <el-form-item label="Başlanýan wagty" class="col-span-1">
        <el-date-picker
          v-model="form.starts_at"
          type="datetime"
          placeholder="Gününi we sagadyny saýlaň"
          value-format="YYYY-MM-DDTHH:mm:ssZ"
          class="!w-full"
        />
      </el-form-item>

      <el-form-item label="Tamamlanýan wagty" class="col-span-1">
        <el-date-picker
          v-model="form.ends_at"
          type="datetime"
          placeholder="Gutaryş wagty (goýulmasa möhletsiz)"
          value-format="YYYY-MM-DDTHH:mm:ssZ"
          class="!w-full"
          clearable
        />
      </el-form-item>

      <el-form-item label="Sowgadyň ady (Prize)" class="col-span-1">
        <el-input v-model="form.prize_title" placeholder="Mysal üçin: Smartfon ýa-da Sowgat paketi" />
      </el-form-item>

      <el-form-item label="Sowgat bahasy (TMT)" class="col-span-1">
        <el-input-number v-model="form.prize_value" :min="0" class="!w-full" />
      </el-form-item>

      <el-form-item label="Arzanladyş göterimi (%)" class="col-span-1">
        <el-input-number v-model="form.discount_percent" :min="0" :max="100" class="!w-full" />
      </el-form-item>

      <el-form-item label="Promo Kod" class="col-span-1">
        <el-input v-model="form.promo_code" placeholder="Mysal üçin: DOGANLAR10" />
      </el-form-item>

      <el-form-item label="Aksiýanyň şertleri (Näme ýerine ýetirmeli - Her setirde ýekeje şert)" class="col-span-2">
        <el-input
          v-model="form.rules"
          type="textarea"
          :rows="4"
          placeholder="Mysal üçin:
1. Ulgama agza bolmaly.
2. Iň az 1 sargyt etmeli.
3. Profil maglumatlaryny doldurmaly."
        />
      </el-form-item>

      <el-form-item label="Giňişleýin maglumat (Description)" class="col-span-2">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="Aksiýa barada giňişleýin maglumat ýazyň..."
        />
      </el-form-item>

      <el-form-item label="Surat URL (Image)" class="col-span-1">
        <div class="flex flex-col gap-2 w-full">
          <div class="flex gap-2">
            <el-input v-model="form.image_url" placeholder="Surat URL goýuň ýa-da ýükläň" class="flex-1" />
            <el-upload
              action="#"
              :http-request="(opt) => handleImageUpload(opt, 'image_url')"
              :show-file-list="false"
              accept="image/*"
            >
              <el-button type="primary" plain class="!rounded-xl">Ýükle</el-button>
            </el-upload>
          </div>
          <div v-if="form.image_url" class="relative w-24 h-24 rounded-lg overflow-hidden border bg-gray-50 mt-1">
            <img :src="getAbsoluteUrl(form.image_url)" class="w-full h-full object-cover" />
            <button @click.prevent="form.image_url = ''" class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs border border-white">&times;</button>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="Banner Surat URL" class="col-span-1">
        <div class="flex flex-col gap-2 w-full">
          <div class="flex gap-2">
            <el-input v-model="form.banner_url" placeholder="Banner surat URL-y ýa-da ýükläň" class="flex-1" />
            <el-upload
              action="#"
              :http-request="(opt) => handleImageUpload(opt, 'banner_url')"
              :show-file-list="false"
              accept="image/*"
            >
              <el-button type="primary" plain class="!rounded-xl">Ýükle</el-button>
            </el-upload>
          </div>
          <div v-if="form.banner_url" class="relative w-24 h-24 rounded-lg overflow-hidden border bg-gray-50 mt-1">
            <img :src="getAbsoluteUrl(form.banner_url)" class="w-full h-full object-cover" />
            <button @click.prevent="form.banner_url = ''" class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs border border-white">&times;</button>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="Arka tarapyň reňkleri (bg_gradient)" class="col-span-1">
        <div class="flex flex-col gap-2 w-full">
          <div class="flex items-center gap-3">
            <div class="flex flex-col items-center">
              <span class="text-[10px] text-gray-400 font-bold uppercase mb-1">Başy</span>
              <el-color-picker v-model="colorStart" size="default" />
            </div>
            <div class="flex flex-col items-center">
              <span class="text-[10px] text-gray-400 font-bold uppercase mb-1">Soňy</span>
              <el-color-picker v-model="colorEnd" size="default" />
            </div>
            <div class="flex-1 h-10 rounded-xl border border-gray-100 self-end" :style="{ background: `linear-gradient(135deg, ${colorStart}, ${colorEnd})` }" title="Reňk görnüşi"></div>
          </div>
          <span class="text-[10px] text-gray-400 font-medium">Reňk saýlaň we sag tarapda görnüşini synlaň</span>
        </div>
      </el-form-item>

      <el-form-item label="Aýratynlyklar" class="col-span-1 flex items-center pt-6">
        <el-checkbox v-model="form.is_featured">Baş sahypada tapawutly görkez</el-checkbox>
      </el-form-item>

    </el-form>
    <template #footer>
      <div class="flex gap-3 justify-end mt-4 border-t border-gray-100 pt-4">
        <el-button @click="dialogVisible = false" class="!rounded-xl">Bes et</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSave" class="!rounded-xl !px-8 font-black">Sakla</el-button>
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
  padding: 2rem 2rem 1rem;
  margin-bottom: 0;
}
:deep(.admin-dialog .el-dialog__title) {
  font-size: 1.35rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;
}
:deep(.admin-dialog .el-dialog__body) {
  padding: 1.5rem 2rem 2rem;
}
:deep(.admin-dialog .el-form-item__label) {
  font-weight: 800;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  margin-bottom: 0.4rem;
}
:deep(.admin-dialog .el-input__wrapper),
:deep(.admin-dialog .el-textarea__inner) {
  border-radius: 0.75rem;
  border: 1.5px solid #f1f5f9;
  box-shadow: none;
  background-color: #f8fafc;
  transition: all 0.2s;
}
:deep(.admin-dialog .el-input__wrapper:hover),
:deep(.admin-dialog .el-textarea__inner:hover) {
  border-color: #fca5a5;
}
:deep(.admin-dialog .el-input__wrapper.is-focus),
:deep(.admin-dialog .el-textarea__inner:focus) {
  border-color: #dc2626;
  background-color: #ffffff;
}
.w-full {
  width: 100%;
}
</style>
