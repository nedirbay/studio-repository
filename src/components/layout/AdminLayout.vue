<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  Menu, 
  Files, 
  Box, 
  ArrowLeft,
  User,
  Setting,
  Expand
} from '@element-plus/icons-vue'

const route = useRoute()

const menuItems = [
  { id: 'dashboard', label: 'Dolandyryş paneli', path: '/admin/dashboard', icon: Menu },
  { id: 'categories', label: 'Kategoriýalar', path: '/admin/categories', icon: Files },
  { id: 'products', label: 'Harytlar', path: '/admin/products', icon: Box },
]

const currentTitle = computed(() => {
  const item = menuItems.find(i => route.path.startsWith(i.path))
  return item ? item.label : 'Admin'
})
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden font-sans">
    <!-- Sidebar -->
    <aside class="w-72 bg-slate-900 text-white flex flex-col shadow-2xl relative z-30">
      <div class="p-8 border-b border-white/10 flex items-center gap-3">
        <div class="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
          <el-icon class="text-xl"><Expand /></el-icon>
        </div>
        <div>
          <h1 class="font-black text-xl tracking-tight leading-none">DOGANLAR</h1>
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Admin Panel</p>
        </div>
      </div>

      <nav class="flex-1 p-6 space-y-2 mt-4">
        <router-link
          v-for="item in menuItems"
          :key="item.id"
          :to="item.path"
          class="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 no-underline group"
          :class="route.path.startsWith(item.path) 
            ? 'bg-red-600 text-white shadow-xl shadow-red-600/20 translate-x-1' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'"
        >
          <el-icon class="text-xl"><component :is="item.icon" /></el-icon>
          <span class="font-bold text-sm">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="p-6 border-t border-white/10">
        <router-link 
          to="/" 
          class="flex items-center gap-4 px-5 py-4 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-all no-underline font-bold text-sm"
        >
          <el-icon class="text-xl"><ArrowLeft /></el-icon>
          Dükana gaýt
        </router-link>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 bg-gray-100 overflow-hidden">
      <!-- Topbar -->
      <header class="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-10 sticky top-0 z-20">
        <div>
          <h2 class="text-xl font-black text-slate-900 tracking-tight">{{ currentTitle }}</h2>
        </div>
        
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2 text-gray-500 hover:text-slate-900 transition-colors cursor-pointer">
            <el-icon class="text-xl"><Setting /></el-icon>
          </div>
          <div class="h-8 w-[1px] bg-gray-200"></div>
          <div class="flex items-center gap-3 group cursor-pointer">
            <div class="text-right">
              <p class="text-xs font-black text-slate-900 leading-none">Admin Doganlar</p>
              <p class="text-[10px] text-gray-400 font-bold mt-1 uppercase">Administrator</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-600 transition-all">
              <el-icon class="text-xl"><User /></el-icon>
            </div>
          </div>
        </div>
      </header>

      <!-- View Area -->
      <div class="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div class="max-w-6xl mx-auto">
          <router-view v-slot="{ Component }">
            <transition name="fade-slide" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db; /* gray-300 */
  border-radius: 9999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af; /* gray-400 */
}
</style>
