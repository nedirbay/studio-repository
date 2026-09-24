<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { store, actions } from '../../../store'
import type { User } from '../../../types'
import { 
  Plus, 
  Edit, 
  Delete, 
  Search
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import UserDialog from './components/UserDialog.vue'

const windowWidth = ref(window.innerWidth)
const updateWidth = () => { windowWidth.value = window.innerWidth }

const searchQuery = ref('')
const roleFilter = ref('')
const dialogVisible = ref(false)
const isEditing = ref(false)
const submitting = ref(false)

const loadingUsers = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

async function loadUsers() {
  loadingUsers.value = true
  try {
    await actions.fetchUsers(
      currentPage.value,
      pageSize.value,
      searchQuery.value,
      roleFilter.value
    )
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loadingUsers.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', updateWidth)
  loadUsers()
})
onUnmounted(() => window.removeEventListener('resize', updateWidth))

const selectedUser = ref<any>(null)

const filteredUsers = computed(() => store.users)

const selectedUserIds = ref<number[]>([])

const isAllSelected = computed(() => {
  const visibleUsers = filteredUsers.value
  if (visibleUsers.length === 0) return false
  
  // Filter out the current user who is disabled for selection
  const selectable = visibleUsers.filter(u => !store.user || store.user.id !== u.id)
  if (selectable.length === 0) return false
  
  return selectable.every(u => selectedUserIds.value.includes(u.id))
})

const isIndeterminate = computed(() => {
  const selectedCount = selectedUserIds.value.length
  const visibleUsers = filteredUsers.value
  const selectable = visibleUsers.filter(u => !store.user || store.user.id !== u.id)
  return selectedCount > 0 && selectedCount < selectable.length
})

function toggleSelectAll(val: boolean) {
  if (val) {
    const visibleUsers = filteredUsers.value
    const selectable = visibleUsers.filter(u => !store.user || store.user.id !== u.id)
    selectedUserIds.value = selectable.map(u => u.id)
  } else {
    selectedUserIds.value = []
  }
}

// Watch search and filter to reset page and reload
watch([searchQuery, roleFilter], () => {
  selectedUserIds.value = []
  if (currentPage.value === 1) {
    loadUsers()
  } else {
    currentPage.value = 1
  }
})

// Watch page to reload
watch(currentPage, () => {
  selectedUserIds.value = []
  loadUsers()
})

async function handleBulkDelete() {
  const idsToDelete = [...selectedUserIds.value]
  if (idsToDelete.length === 0) return

  const deleteCount = idsToDelete.length
  const msg = `Saýlanan ${deleteCount} ulanyjyny pozmak isleýärsiňizmi?`

  try {
    await ElMessageBox.confirm(
      msg,
      'Köpçülikleýin pozmak',
      {
        confirmButtonText: 'Hawa, poz',
        cancelButtonText: 'Bes et',
        type: 'warning',
        confirmButtonClass: '!bg-red-600 !border-red-600 !text-white !rounded-xl !px-6',
        cancelButtonClass: '!rounded-xl'
      }
    )

    await actions.deleteUsers(idsToDelete)
    ElMessage.success('Saýlanan ulanyjylar üstünlikli pozuldy')
    selectedUserIds.value = []
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Köpçülikleýin pozmakda näsazlyk ýüze çykdy')
    }
  }
}

function handleAdd() {
  isEditing.value = false
  selectedUser.value = null
  dialogVisible.value = true
}

function handleEdit(user: User) {
  isEditing.value = true
  selectedUser.value = user
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
    loadUsers()
    ElMessage.success('Ulanyjy üstünlikli pozuldy')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Ulanyjyny pozup bolmady, täzeden synanyşyň')
    }
  }
}

async function handleSave(payload: any) {
  submitting.value = true
  try {
    if (isEditing.value && selectedUser.value?.id) {
      await actions.updateUser(selectedUser.value.id, payload)
      ElMessage.success('Ulanyjy maglumatlary täzelendi')
    } else {
      await actions.addUser(payload)
      ElMessage.success('Täze ulanyjy goşuldy')
    }
    dialogVisible.value = false
    loadUsers()
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
      
      <div class="flex flex-col sm:flex-row gap-3">
        <el-button 
          v-if="selectedUserIds.length > 0"
          type="danger" 
          @click="handleBulkDelete"
          class="!rounded-xl !px-6 !py-5 transition-all font-bold w-full sm:w-auto"
        >
          <el-icon class="mr-2 text-lg"><Delete /></el-icon>
          Saýlananlary poz ({{ selectedUserIds.length }})
        </el-button>

        <el-button 
          type="primary" 
          @click="handleAdd"
          class="!bg-slate-900 !border-none !rounded-xl !px-6 !py-5 hover:!bg-slate-800 transition-all font-bold w-full sm:w-auto"
        >
          <el-icon class="mr-2 text-lg"><Plus /></el-icon>
          Täze ulanyjy
        </el-button>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-md border border-gray-200 flex flex-col sm:flex-row gap-4">
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
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" v-loading="loadingUsers">
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full min-w-[800px] text-left">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100">
              <th class="p-4 sm:p-5 w-12 text-center">
                <el-checkbox 
                  :model-value="isAllSelected" 
                  :indeterminate="isIndeterminate" 
                  @change="toggleSelectAll" 
                />
              </th>
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
              <td class="p-4 sm:p-5 w-12 text-center">
                <el-checkbox 
                  v-model="selectedUserIds" 
                  :value="user.id" 
                  :disabled="store.user && store.user.id === user.id" 
                />
              </td>
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
              <td colspan="6" class="p-10 text-center">
                <el-empty description="Ulanyjy tapylmady" :image-size="100" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="store.userTotalCount > pageSize" class="p-4 border-t border-gray-100 flex justify-center">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="store.userTotalCount"
          layout="prev, pager, next, jumper"
          background
        />
      </div>
    </div>

    <!-- Edit/Add Dialog -->
    <UserDialog 
      v-model:visible="dialogVisible" 
      :is-editing="isEditing" 
      :user="selectedUser" 
      :window-width="windowWidth" 
      :submitting="submitting"
      @save="handleSave"
    />
  </div>
</template>
