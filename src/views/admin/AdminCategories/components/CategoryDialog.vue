<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  isEditing: boolean
  category: { id: number; name: string; icon: string; count: number }
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
      <el-form-item label="Ikonka (islege görä)">
        <el-input v-model="form.icon" placeholder="Emoji ýada şekil (💻)" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex gap-3 justify-end mt-4">
        <el-button @click="dialogVisible = false">Ýatyr</el-button>
        <el-button type="primary" @click="handleSave">Sakla</el-button>
      </div>
    </template>
  </el-dialog>
</template>
