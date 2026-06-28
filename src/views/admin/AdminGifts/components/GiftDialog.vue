<script setup lang="ts">
import { ref, watch } from 'vue'

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
        <el-input v-model="form.image_url" placeholder="Surat URL goýuň" />
      </el-form-item>

      <el-form-item label="Banner Surat URL" class="col-span-1">
        <el-input v-model="form.banner_url" placeholder="Tapawutly banner surat URL-y" />
      </el-form-item>

      <el-form-item label="Arka tarapyň reňki (bg_gradient)" class="col-span-1">
        <el-input v-model="form.bg_gradient" placeholder="from-red-600 to-orange-500" />
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
