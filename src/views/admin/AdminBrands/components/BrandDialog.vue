<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  isEditing: boolean
  brand: { id: number; name: string }
  windowWidth: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'save', val: typeof props.brand): void
}>()

const form = ref({ ...props.brand })

watch(() => props.brand, (newVal) => {
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
    :title="isEditing ? 'Brendi üýtgetmek' : 'Täze brend goşmak'"
    :width="windowWidth < 640 ? '90%' : '500px'"
    class="admin-dialog"
    align-center
  >
    <el-form :model="form" label-position="top" class="space-y-4">
      <el-form-item label="Brendiň ady">
        <el-input v-model="form.name" placeholder="Mysal üçin: Sony" />
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
