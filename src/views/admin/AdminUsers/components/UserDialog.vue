<script setup lang="ts">
import { ref, watch } from 'vue'
import { 
  User as UserIcon,
  Message,
  Key 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  visible: boolean
  isEditing: boolean
  user: any
  windowWidth: number
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'save', val: any): void
}>()

const dialogVisible = ref(props.visible)
const form = ref<any>({
  username: '',
  email: '',
  role_name: 'User',
  password: '',
  is_active: true
})

watch(() => props.visible, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

watch(() => props.user, (newVal) => {
  if (props.isEditing && newVal) {
    form.value = {
      id: newVal.id,
      username: newVal.username,
      email: newVal.email,
      role_name: newVal.role_name || 'User',
      is_active: newVal.is_active ?? true,
      password: ''
    }
  } else {
    form.value = {
      username: '',
      email: '',
      role_name: 'User',
      password: '',
      is_active: true
    }
  }
}, { deep: true, immediate: true })

function handleSave() {
  if (!form.value.username || !form.value.email || !form.value.role_name) {
    ElMessage.warning('Maglumatlary doly giriziň')
    return
  }
  
  if (!props.isEditing && !form.value.password) {
    ElMessage.warning('Täze ulanyjy üçin parol hökman gerek')
    return
  }

  const payload: any = {
    username: form.value.username,
    email: form.value.email,
    role_input: form.value.role_name, // Map role_name value to role_input for backend
    is_active: form.value.is_active
  }
  
  if (form.value.password) {
    payload.password = form.value.password
  }

  emit('save', payload)
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEditing ? 'Ulanyjyny üýtget' : 'Täze ulanyjy goş'"
    :width="windowWidth < 768 ? '95%' : '500px'"
    class="admin-dialog"
    align-center
  >
    <el-form :model="form" label-position="top" class="space-y-4">
      <el-form-item label="Ulanyjy ady">
        <el-input v-model="form.username" :prefix-icon="UserIcon" placeholder="Mysal üçin: merdan95" />
      </el-form-item>
      
      <el-form-item label="E-poçta salgysy">
        <el-input v-model="form.email" :prefix-icon="Message" placeholder="Mysal üçin: mysal@mysal.com" />
      </el-form-item>
      
      <el-form-item label="Parol (Üýtgetmek üçin täze parol)">
        <el-input 
          v-model="form.password" 
          type="password" 
          show-password
          :prefix-icon="Key" 
          :placeholder="isEditing ? 'Diňe üýtgetmek isleseňiz ýazyň' : 'Täze parol'" 
        />
      </el-form-item>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <el-form-item label="Roly">
          <el-select v-model="form.role_name" class="w-full">
            <el-option label="Ulanyjy (User)" value="User" />
            <el-option label="Admin" value="Admin" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Statusy">
          <div class="h-8 flex items-center mt-1">
            <el-switch v-model="form.is_active" active-text="Işjeň" inactive-text="Bloklanan" />
          </div>
        </el-form-item>
      </div>
    </el-form>
    
    <template #footer>
      <div class="flex gap-3 justify-end mt-4">
        <el-button @click="dialogVisible = false" :disabled="submitting">Ýatyr</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSave">
          Sakla
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
