<script setup lang="ts">
import { ref } from 'vue'
import { navItems } from '../../data/products'
import NotificationDropdown from '../shared/NotificationDropdown.vue'

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
</script>

<template>
  <header class="bg-white shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-center h-16 gap-4">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2 shrink-0">
          <div class="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
            <el-icon class="text-white text-lg"><Monitor /></el-icon>
          </div>
          <div class="leading-tight mr-5">
            <div class="text-lg font-bold text-gray-900">Sumbar</div>
            <div class="text-xs text-red-600 font-semibold -mt-0.5 tracking-widest uppercase">Computer</div>
          </div>
        </router-link>

        <!-- Search Bar -->
        <div class="flex-1 hidden md:flex max-w-2xl">
          <div class="search-wrapper flex w-full items-center">
            <el-select 
              v-model="searchCategory" 
              placeholder="All" 
              class="category-select"
              size="large"
            >
              <el-option label="All Categories" value="all" />
              <el-option label="Laptops" value="laptops" />
              <el-option label="Desktops" value="desktops" />
              <el-option label="Components" value="components" />
              <el-option label="Accessories" value="accessories" />
              <el-option label="Networking" value="networking" />
            </el-select>
            <el-input
              v-model="searchQuery"
              placeholder="Search for products, brands and more..."
              size="large"
              class="search-field"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon class="text-gray-400"><Search /></el-icon>
              </template>
            </el-input>
            <el-button 
              type="primary" 
              size="large"
              class="search-btn"
              @click="handleSearch"
            >
              <el-icon class="text-lg"><Search /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- Nav Actions -->
        <div class="flex items-center gap-3">
          <router-link to="/products" class="hidden md:flex items-center gap-1 text-sm text-gray-700 hover:text-red-600 transition-colors">
            <el-icon><Goods /></el-icon>
            <span>Products</span>
          </router-link>
          <NotificationDropdown />
          <button class="p-2 text-gray-600 hover:text-red-600 transition-colors">
            <el-icon class="text-xl"><User /></el-icon>
          </button>
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
              :class="{ 'bg-red-600 text-white': item.label === 'Home' }"
            >
              {{ item.label }}
              <el-icon v-if="item.children" class="text-xs ml-0.5"><ArrowDown /></el-icon>
            </router-link>
            <div
              v-if="item.children && activeDropdown === item.label"
              class="absolute top-full left-0 bg-white shadow-xl rounded-b-lg min-w-48 border-t-2 border-red-600 z-50"
            >
              <a
                v-for="child in item.children"
                :key="child.label"
                :href="child.href"
                class="block px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                {{ child.label }}
              </a>
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
          placeholder="Search products..."
          :prefix-icon="'Search'"
        />
      </div>
      <ul class="pb-3">
        <li v-for="item in navItems" :key="item.label">
          <a
            :href="item.href"
            class="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 border-b border-gray-100"
          >
            {{ item.label }}
          </a>
        </li>
      </ul>
    </div>
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
