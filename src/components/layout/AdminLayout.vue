<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { connectAdminWebsocket } from '../../store'
import { 
  Menu, 
  Files, 
  Box, 
  ArrowLeft,
  User,
  Expand,
  ShoppingCart,
  Operation,
  ChatDotRound,
  Message,
  Picture,
  Document,
  Camera,
  VideoCamera,
  Present,
  Cellphone,
  Tools,
  Coin
} from '@element-plus/icons-vue'
import UserDropdown from '../shared/UserDropdown.vue'

const route = useRoute()
const isSidebarOpen = ref(false)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Close sidebar on route change (mobile)
watch(() => route.path, () => {
  isSidebarOpen.value = false
})


const menuItems = [
  { id: 'dashboard', label: 'Dolandyryş paneli', path: '/admin/dashboard', icon: Menu },
  { id: 'categories', label: 'Kategoriýalar', path: '/admin/categories', icon: Files },
  { id: 'brands', label: 'Brendler', path: '/admin/brands', icon: Operation },
  { id: 'products', label: 'Harytlar', path: '/admin/products', icon: Box },
  { id: 'users', label: 'Ulanyjylar', path: '/admin/users', icon: User },
  { id: 'reviews', label: 'Teswirler', path: '/admin/reviews', icon: ChatDotRound },
  { id: 'messages', label: 'Hatlar we Soraglar', path: '/admin/messages', icon: Message },
  { id: 'orders', label: 'Sargytlar', path: '/admin/orders', icon: ShoppingCart },
  { id: 'studio-orders', label: 'Studio Sargytlary', path: '/admin/studio-orders', icon: Camera },
  { id: 'studio-catalogs', label: 'Studio Kataloglary', path: '/admin/studio-catalogs', icon: Tools },
  { id: 'photo-studio', label: 'Foto Studiýa', path: '/admin/photo-studio', icon: VideoCamera },
  { id: 'banners', label: 'Bannerler', path: '/admin/banners', icon: Picture },
  { id: 'blogs', label: 'Bloglar', path: '/admin/blogs', icon: Document },
  { id: 'gifts', label: 'Sowgatlar & Aksiýalar', path: '/admin/gifts', icon: Present },
  { id: 'mobile-apps', label: 'Mobil Goşundy', path: '/admin/mobile-apps', icon: Cellphone },
  { id: 'currencies', label: 'Pul birlikleri', path: '/admin/currencies', icon: Coin },
]


const currentTitle = computed(() => {
  const item = menuItems.find(i => route.path.startsWith(i.path))
  return item ? item.label : 'Admin'
})

onMounted(() => {
  connectAdminWebsocket()
})
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden font-sans relative">
    <!-- Sidebar Overlay (Mobile) -->
    <div 
      v-if="isSidebarOpen" 
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
      @click="isSidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside 
      class="fixed lg:static inset-y-0 left-0 w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-50 transform transition-transform duration-300 lg:translate-x-0"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="p-8 border-b border-white/10 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
            <el-icon class="text-xl"><Expand /></el-icon>
          </div>
          <div>
            <h1 class="font-black text-xl tracking-tight leading-none">DOGANLAR</h1>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Admin Panel</p>
          </div>
        </div>
        <!-- Close button for mobile sidebar -->
        <button @click="isSidebarOpen = false" class="lg:hidden text-gray-400 hover:text-white p-2">
          <el-icon class="text-2xl"><Close /></el-icon>
        </button>
      </div>

      <nav class="flex-1 p-6 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
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
    <main class="flex-1 flex flex-col min-w-0 bg-gray-100 overflow-hidden relative">
      <!-- Topbar -->
      <header class="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 sm:px-10 sticky top-0 z-20">
        <div class="flex items-center gap-4">
          <!-- Hamburger Menu for Mobile -->
          <button @click="toggleSidebar" class="lg:hidden p-2 text-slate-900 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all">
            <el-icon class="text-2xl"><Operation /></el-icon>
          </button>
          <h2 class="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate">{{ currentTitle }}</h2>
        </div>
        
        <div class="flex items-center gap-3 sm:gap-6">
          <div class="hidden sm:flex items-center gap-2 text-gray-500 hover:text-slate-900 transition-colors cursor-pointer pr-2">
            <!-- <el-icon class="text-xl"><Setting /></el-icon> -->
          </div>
          <UserDropdown />
        </div>
      </header>

      <!-- View Area -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-10 custom-scrollbar">
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


</style>

<!-- Global: cap teleported dialog width on desktop, near-full on phones.
     Shared by the admin studio-orders / photo-studio management dialogs. -->
<style>
.studio-order-dialog {
  max-width: 900px;
}
@media (max-width: 640px) {
  .studio-order-dialog {
    width: 96% !important;
    --el-dialog-padding-primary: 14px;
  }
}
</style>
