<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { store, actions } from '../../../store'
import type { User } from '../../../types'
import { 
  Plus, 
  Edit, 
  Delete, 
  Search,
  User as UserIcon,
  Message,
  Key
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const windowWidth = ref(window.innerWidth)
const updateWidth = () => { windowWidth.value = window.innerWidth }
onMounted(() => {
  window.addEventListener('resize', updateWidth)
  actions.fetchUsers().catch(e => {
    console.warn("Could not fetch users directly on mount, ensure backend /users endpoint is correct", e)
  })
})
onUnmounted(() => window.removeEventListener('resize', updateWidth))

const searchQuery = ref('')
const roleFilter = ref('')
const dialogVisible = ref(false)
const isEditing = ref(false)
const submitting = ref(false)

const form = ref<{
  id?: number
  username: string
  email: string
  role_name: string
  password?: string
  is_active: boolean
}>({
  username: '',
  email: '',
  role_name: 'User',
  password: '',
  is_active: true
})

const filteredUsers = computed(() => {
  return store.users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesRole = roleFilter.value ? user.role_name === roleFilter.value : true
    return matchesSearch && matchesRole
  })
})

function handleAdd() {
  isEditing.value = false
  form.value = {
    username: '',
    email: '',
    role_name: 'User',
    password: '',
    is_active: true
  }
  dialogVisible.value = true
}

function handleEdit(user: User) {
  isEditing.value = true
  form.value = {
    id: user.id,
    username: user.username,
    email: user.email,
    role_name: user.role_name,
    is_active: user.is_active,
    // Password intentionally left empty when editing, unless they want to reset it
    password: ''
  }
  dialogVisible.value = true
}

async function handleDelete(user: User) {
  try {
    await ElMessageBox.confirm(
      `"${user.username}" atly ulanyjyny pozmak isleýärsiňizmi?`,
      'Üns beriň',
      {
        confirmButtonText: 'Hawa, poz',
        cancelButtonText: 'Ýok',
        type: 'warning',
        confirmButtonClass: '!bg-red-600 !border-red-600 !text-white !rounded-xl !px-6',
        cancelButtonClass: '!rounded-xl'
      }
    )
    
    await actions.deleteUser(user.id)
    ElMessage.success('Ulanyjy üstünlikli pozuldy')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Ulanyjyny pozup bolmady, täzeden synanyşyň')
    }
  }
}

async function handleSave() {
  if (!form.value.username || !form.value.email || !form.value.role_name) {
    ElMessage.warning('Maglumatlary doly giriziň')
    return
  }
  
  if (!isEditing.value && !form.value.password) {
    ElMessage.warning('Täze ulanyjy üçin parol hökman gerek')
    return
  }

  submitting.value = true
  try {
    const payload: any = {
      username: form.value.username,
      email: form.value.email,
      role_name: form.value.role_name,
      is_active: form.value.is_active
    }
    
    // Only send password if it's provided (new user or changing existing)
    if (form.value.password) {
      payload.password = form.value.password
    }

    if (isEditing.value && form.value.id) {
      await actions.updateUser(form.value.id, payload)
      ElMessage.success('Ulanyjy maglumatlary täzelendi')
    } else {
      await actions.addUser(payload)
      ElMessage.success('Täze ulanyjy goşuldy')
    }
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error('Ýalňyşlyk ýüze çykdy')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6 sm:space-y-8 animate-fade-in pb-20">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Ulanyjylar</h1>
        <p class="text-[10px] sm:text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Sistemadaky ähli ulanyjylary dolandyryň</p>
      </div>
      
      <el-button 
        type="primary" 
        @click="handleAdd"
        class="!bg-slate-900 !border-none !rounded-xl !px-6 !py-5 hover:!bg-slate-800 transition-all font-bold w-full sm:w-auto"
      >
        <el-icon class="mr-2 text-lg"><Plus /></el-icon>
        Täze ulanyjy
      </el-button>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4">
      <el-input
        v-model="searchQuery"
        placeholder="Ulanyjy ady ýa-da e-poçta boýunça gözleg..."
        :prefix-icon="Search"
        class="w-full sm:w-[300px] !rounded-xl search-input"
        clearable
      />
      <el-select 
        v-model="roleFilter" 
        placeholder="Roly boýunça"
        class="w-full sm:w-[200px]"
        clearable
      >
        <el-option label="Ählisi" value="" />
        <el-option label="Admin" value="Admin" />
        <el-option label="User" value="User" />
      </el-select>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full min-w-[800px] text-left">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100">
              <th class="p-4 sm:p-5 text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">Ulanyjy</th>
              <th class="p-4 sm:p-5 text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">E-poçta</th>
              <th class="p-4 sm:p-5 text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">Roly</th>
              <th class="p-4 sm:p-5 text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">Statusy</th>
              <th class="p-4 sm:p-5 text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest text-right">Sazlamalar</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="user in filteredUsers" 
              :key="user.id"
              class="border-b border-gray-50 hover:bg-red-50/10 transition-colors group"
            >
              <td class="p-4 sm:p-5">
                <div class="flex items-center gap-3 sm:gap-4">
                  <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-slate-400 group-hover:bg-red-100 group-hover:text-red-600 transition-colors shrink-0">
                    <el-icon class="text-xl"><UserIcon /></el-icon>
                  </div>
                  <span class="font-bold text-sm text-slate-900">{{ user.username }}</span>
                </div>
              </td>
              <td class="p-4 sm:p-5">
                <span class="text-sm text-gray-600 font-medium">{{ user.email }}</span>
              </td>
              <td class="p-4 sm:p-5">
                <span 
                  class="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider"
                  :class="user.role_name === 'Admin' || user.is_superuser ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'"
                >
                  {{ user.role_name }}
                </span>
              </td>
              <td class="p-4 sm:p-5">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full" :class="user.is_active ? 'bg-green-500' : 'bg-red-500'"></div>
                  <span class="text-xs font-bold text-gray-600" :class="user.is_active ? 'text-green-600' : 'text-red-600'">
                    {{ user.is_active ? 'Işjeň' : 'Bloklanan' }}
                  </span>
                </div>
              </td>
              <td class="p-4 sm:p-5 text-right">
                <div class="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <el-button 
                    circle 
                    :icon="Edit"
                    class="hover:!text-blue-600 hover:!border-blue-200"
                    @click="handleEdit(user)"
                  />
                  <!-- Prevent self-deletion if needed (assuming user.id !== currentUser.id logic here if available, ignoring for now) -->
                  <el-button 
                    circle 
                    :icon="Delete"
                    type="danger" 
                    plain
                    @click="handleDelete(user)"
                  />
                </div>
              </td>
            </tr>
            
            <tr v-if="filteredUsers.length === 0">
              <td colspan="5" class="p-10 text-center">
                <el-empty description="Ulanyjy tapylmady" :image-size="100" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit/Add Dialog -->
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
        
        <div class="grid grid-cols-2 gap-4">
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
          <el-button @click="dialogVisible = false" class="!rounded-xl" :disabled="submitting">Bes et</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSave" class="!rounded-xl !px-6 !bg-slate-900 !border-slate-900 border-none hover:!bg-slate-800">
            Sakla
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>


:deep(.search-input .el-input__wrapper) {
  border-radius: 0.75rem;
  background-color: #f9fafb;
  border: none;
  box-shadow: none;
}
:deep(.search-input .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #fee2e2; /* approximate red-100 ring */
}

:deep(.admin-dialog) {
  border-radius: 24px;
  overflow: hidden;
}
:deep(.admin-dialog .el-dialog__header) {
  padding: 24px 24px 20px;
  margin: 0;
  border-bottom: 1px solid #f3f4f6;
}
:deep(.admin-dialog .el-dialog__title) {
  font-weight: 900;
  color: #0f172a;
}
:deep(.admin-dialog .el-dialog__body) {
  padding: 24px;
}
:deep(.admin-dialog .el-dialog__footer) {
  padding: 16px 24px;
  background-color: #f8fafc;
  border-top: 1px solid #f3f4f6;
}

/* Form Styles */
:deep(.el-form-item__label) {
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #9ca3af;
  margin-bottom: 8px;
}

:deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 0 0 1px #e5e7eb inset;
  padding: 0 16px;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #0f172a inset;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 12px;
}
</style>
