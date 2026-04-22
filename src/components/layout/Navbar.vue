<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { navItems as staticNavItems } from '../../data/products'
import { store, actions, cartCount } from '../../store'
import NotificationDropdown from '../shared/NotificationDropdown.vue'
import CartDrawer from '../cart/CartDrawer.vue'
import logo from '../../assets/logo1.png'
import { Search, ShoppingCart, ArrowDown, Menu as MenuIcon, Close } from '@element-plus/icons-vue'
import UserDropdown from '../shared/UserDropdown.vue'

const navItems = computed(() => {
  // We can also make navItems dynamic in store later, but for now we'll match categories
  const items = [...staticNavItems]
  const catNav = items.find(i => i.label === 'Kategoriýalar')
  if (catNav) {
    catNav.children = store.categories.map(c => ({
      label: c.name,
      href: `/products/${c.slug}`
    }))
  }
  return items
})

const route = useRoute()

const searchQuery = ref('')
const searchCategory = ref('all')
const mobileMenuOpen = ref(false)
const activeDropdown = ref<string | null>(null)


function toggleDropdown(label: string) {
  activeDropdown.value = activeDropdown.value === label ? null : label
}

function closeDropdown() {
  activeDropdown.value = null
}

function handleSearch() {
  console.log('Searching:', searchQuery.value, 'in category:', searchCategory.value)
}

// Persist active route to localStorage
watch(() => route.path, (newPath) => {
  localStorage.setItem('last_active_page', newPath)
}, { immediate: true })
</script>

<template>
  <header class="bg-white shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-16 gap-4">
        <!-- Mobile Menu Toggle -->
        <button 
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 -ml-2 text-gray-600 hover:text-red-600 transition-colors"
        >
          <el-icon class="text-3xl">
            <component :is="mobileMenuOpen ? Close : MenuIcon" />
          </el-icon>
        </button>

        <!-- Logo/Branding -->
        <router-link to="/" class="flex items-center gap-2 group no-underline shrink-0">
          <img :src="logo" alt="Doganlar" class="w-9 h-9 object-contain shrink-0" />
          <div class="leading-tight">
            <div class="text-lg md:text-xl font-black text-gray-900 tracking-tight">Doganlar</div>
            <div class="text-[9px] md:text-[10px] text-red-600 font-bold -mt-0.5 tracking-[0.2em] uppercase">foto merkezi</div>
          </div>
        </router-link>

        <!-- Search Bar -->
        <div class="flex-1 hidden md:flex max-w-2xl">
          <div class="search-wrapper flex w-full items-center">
            <el-select 
              v-model="searchCategory" 
              placeholder="Hemmesi" 
              class="category-select"
              size="large"
            >
              <el-option label="Ählisi" value="all" />
              <el-option 
                v-for="cat in store.categories" 
                :key="cat.id" 
                :label="cat.name" 
                :value="cat.slug" 
              />
            </el-select>
            <el-input
              v-model="searchQuery"
              placeholder="Harytlary, markalary we başgalary gözläň..."
              size="large"
              class="search-field"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon class="text-gray-400 text-xl"><Search /></el-icon>
              </template>
            </el-input>
            <el-button 
              type="primary" 
              size="large"
              class="search-btn"
              @click="handleSearch"
            >
              <el-icon class="text-xl"><Search /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- Nav Actions -->
        <div class="flex items-center gap-3">
          <!-- Cart Icon -->
          <button 
            @click="actions.toggleCartDrawer(true)"
            class="relative p-2 text-gray-600 hover:text-red-600 transition-colors group"
          >
            <el-icon class="text-4xl"><ShoppingCart /></el-icon>
            <span 
              v-if="cartCount > 0"
              class="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white transform translate-x-1 -translate-y-1 shadow-sm group-hover:scale-110 transition-transform"
            >
              {{ cartCount }}
            </span>
          </button>

          <NotificationDropdown />
          
          <!-- User Menu -->
          <div class="user-menu-wrapper ml-1">
            <UserDropdown />
          </div>
        </div>
       
      </div>
    </div>

    <!-- Desktop Navigation -->
    <nav class="hidden md:block bg-gray-800 border-t border-gray-700">
      <div class="max-w-7xl mx-auto px-4">
        <ul class="flex items-center gap-0">
          <li
            v-for="item in navItems"
            :key="item.label"
            class="relative group"
            @mouseenter="item.children && toggleDropdown(item.label)"
            @mouseleave="closeDropdown"
          >
            <router-link
              :to="item.href"
              class="flex items-center gap-1 px-4 py-3 text-sm font-medium text-gray-200 hover:text-white hover:bg-red-600 transition-all duration-200"
              :active-class="item.href === '/' ? '' : 'bg-red-600 text-white'"
              :exact-active-class="item.href === '/' ? 'bg-red-600 text-white' : ''"
            >
              {{ item.label }}
              <el-icon v-if="item.children" class="text-xs ml-0.5"><ArrowDown /></el-icon>
            </router-link>
            <div
              v-if="item.children && activeDropdown === item.label"
              class="absolute top-full left-0 bg-white shadow-xl rounded-b-lg min-w-48 border-t-2 border-red-600 z-50"
            >
              <router-link
                v-for="child in item.children"
                :key="child.label"
                :to="child.href"
                class="block px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                active-class="text-red-600 bg-red-50 font-medium"
              >
                {{ child.label }}
              </router-link>
            </div>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Mobile Menu -->
    <div v-if="mobileMenuOpen" class="md:hidden bg-white border-t border-gray-200 shadow-lg">
      <div class="px-4 py-3">
        <el-input
          v-model="searchQuery"
          placeholder="Harytlary gözläň..."
          :prefix-icon="'Search'"
        />
      </div>
      <ul class="pb-3">
        <li v-for="item in navItems" :key="item.label">
          <router-link
            :to="item.href"
            class="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 border-b border-gray-100"
            active-class="text-red-600 bg-red-50"
          >
            {{ item.label }}
          </router-link>
        </li>
      </ul>
    </div>
    
    <!-- Cart Drawer -->
    <CartDrawer />
  </header>
</template>

<style scoped>
/* Search Wrapper - Modern Container */
.search-wrapper {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-wrapper:focus-within {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08);
  background: #fff;
}

/* Category Select Styling */
:deep(.category-select) {
  width: 140px;
}

:deep(.category-select .el-input__wrapper) {
  background: transparent;
  border: none;
  box-shadow: none;
  border-right: 1px solid #e2e8f0;
  border-radius: 0;
  padding: 0 12px;
  font-size: 14px;
}

:deep(.category-select .el-input__wrapper:hover) {
  background: rgba(220, 38, 38, 0.04);
}

:deep(.category-select .el-input__inner) {
  font-weight: 500;
  color: #475569;
}

/* Search Input Field */
:deep(.search-field .el-input__wrapper) {
  background: transparent;
  border: none;
  box-shadow: none;
  border-radius: 0;
  padding: 0 16px;
}

:deep(.search-field .el-input__inner) {
  font-size: 14px;
}

:deep(.search-field .el-input__inner::placeholder) {
  color: #94a3b8;
}

/* Search Button */
.search-btn {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border: none;
  border-radius: 0;
  padding: 0 20px;
  min-width: 56px;
  transition: all 0.2s ease;
}

.search-btn:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  transform: scale(1.02);
}

.search-btn:active {
  transform: scale(0.98);
}
</style>
