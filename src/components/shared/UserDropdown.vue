<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  User, 
  ArrowDown, 
  Monitor, 
  SwitchButton,
  UserFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { store, actions } from '../../store'

const router = useRouter()

// Auth state
const isLoggedIn = computed(() => store.isAuthenticated)
const currentUser = computed(() => store.user)

function handleLogout() {
  actions.logout()
  ElMessage.success('Siz sistemadan üstünlikli çykdyňyz!')
  router.push('/login')
}
</script>

<template>
  <div class="user-menu-wrapper">
    <el-dropdown v-if="isLoggedIn" trigger="click" placement="bottom-end">
      <button class="flex items-center gap-2 p-1.5 pl-2 pr-4 bg-white/50 hover:bg-white rounded-xl border border-gray-200 hover:border-red-200 transition-all group shadow-sm">
        <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm shrink-0 overflow-hidden">
          <template v-if="currentUser?.username">
            {{ currentUser.username.charAt(0).toUpperCase() }}
          </template>
          <el-icon v-else class="text-xl"><UserFilled /></el-icon>
        </div>
        <div class="hidden lg:block text-left">
          <p class="text-[10px] text-gray-400 font-bold uppercase leading-none mb-0.5">Ulanyjy</p>
          <p class="text-sm font-bold text-gray-700 group-hover:text-red-600 truncate max-w-[100px] leading-none">{{ currentUser?.username }}</p>
        </div>
        <el-icon class="text-xl text-gray-400 group-hover:text-red-600 transition-colors"><ArrowDown /></el-icon>
      </button>
      
      <template #dropdown>
        <el-dropdown-menu class="min-w-[200px] !rounded-2xl !p-2 !border-none !shadow-2xl">
          <div class="px-4 py-4 border-b border-gray-100 mb-2">
            <p class="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1 leading-none">Hasap maglumatlary</p>
            <p class="text-sm font-black text-slate-900 truncate">{{ currentUser?.email }}</p>
          </div>
          
          <el-dropdown-item @click="router.push('/profile')">
            <div class="flex items-center gap-3 w-full py-1">
              <el-icon class="text-lg"><User /></el-icon>
              <span class="font-bold">Hasabym</span>
            </div>
          </el-dropdown-item>
          
          <el-dropdown-item 
            v-if="currentUser?.role_name === 'Admin' || currentUser?.is_superuser" 
            @click="router.push('/admin/dashboard')"
          >
            <div class="flex items-center gap-3 w-full py-1">
              <el-icon class="text-lg"><Monitor /></el-icon>
              <span class="font-bold">Dolandyryş paneli</span>
            </div>
          </el-dropdown-item>
          
          <div class="my-2 border-t border-gray-100"></div>
          
          <el-dropdown-item @click="handleLogout" class="!text-red-600 hover:!bg-red-50 !rounded-xl">
            <div class="flex items-center gap-3 w-full py-1">
              <el-icon class="text-lg"><SwitchButton /></el-icon>
              <span class="font-bold">Çykyş</span>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <router-link 
      v-else 
      to="/login"
      class="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-600/20 active:scale-95"
    >
      <el-icon class="text-2xl"><User /></el-icon>
      Giriş
    </router-link>
  </div>
</template>

<style scoped>
:deep(.el-dropdown-menu__item) {
  border-radius: 0.75rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: 0.25rem;
  margin-right: 0.25rem;
}
:deep(.el-dropdown-menu__item:hover) {
  background-color: #fef2f2;
  color: #dc2626;
}
</style>
