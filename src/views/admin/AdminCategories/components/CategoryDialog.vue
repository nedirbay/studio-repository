<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  isEditing: boolean
  category: { id: number; name: string; icon: string; slug: string; count: number }
  windowWidth: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'save', val: typeof props.category): void
}>()

const form = ref({ ...props.category })

watch(() => props.category, (newVal) => {
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
    :title="isEditing ? 'Kategoriýany üýtgetmek' : 'Täze kategoriýa goşmak'"
    :width="windowWidth < 640 ? '90%' : '400px'"
    class="admin-dialog"
    align-center
  >
    <el-form :model="form" label-position="top" class="space-y-4">
      <el-form-item label="Kategoriýa ady">
        <el-input v-model="form.name" placeholder="Mysal üçin: Noutbuklar" />
      </el-form-item>
      <el-form-item label="Slug (URL üçin)">
        <el-input v-model="form.slug" placeholder="Mysal üçin: laptops" />
      </el-form-item>
      <el-form-item label="Sekizburçluk / Ikonka">
        <el-input v-model="form.icon" placeholder="Emoji ýada şekil (💻)" />
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
