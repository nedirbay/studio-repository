<script setup lang="ts">
import { ref } from 'vue'
import { navItems } from '../../data/products'

const searchQuery = ref('')
const cartCount = ref(3)
const mobileMenuOpen = ref(false)
const activeDropdown = ref<string | null>(null)

function toggleDropdown(label: string) {
  activeDropdown.value = activeDropdown.value === label ? null : label
}

function closeDropdown() {
  activeDropdown.value = null
}
</script>

<template>
  <header class="bg-white shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-16 gap-4">
        <!-- Logo -->
        <a href="#" class="flex items-center gap-2 shrink-0">
          <div class="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
            <el-icon class="text-white text-lg"><Monitor /></el-icon>
          </div>
          <div class="leading-tight">
            <div class="text-lg font-bold text-gray-900">Sumbar</div>
            <div class="text-xs text-red-600 font-semibold -mt-0.5 tracking-widest uppercase">Computer</div>
          </div>
        </a>

        <!-- Search Bar -->
        <div class="flex-1 hidden md:flex max-w-xl search-input">
          <el-input
            v-model="searchQuery"
            placeholder="Search products, brands, categories..."
            size="large"
            class="flex-1"
          >
            <template #prepend>
              <el-select placeholder="All" style="width: 110px" size="large">
                <el-option label="All" value="all" />
                <el-option label="Laptops" value="laptops" />
                <el-option label="Desktops" value="desktops" />
                <el-option label="Components" value="components" />
              </el-select>
            </template>
            <template #append>
              <el-button type="primary" :icon="'Search'" />
            </template>
          </el-input>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 shrink-0">
          <button class="hidden md:flex flex-col items-center p-2 hover:text-red-600 transition-colors text-gray-600">
            <el-icon class="text-xl"><User /></el-icon>
            <span class="text-xs mt-0.5">Account</span>
          </button>
          <button class="hidden md:flex flex-col items-center p-2 hover:text-red-600 transition-colors text-gray-600">
            <el-icon class="text-xl"><Star /></el-icon>
            <span class="text-xs mt-0.5">Wishlist</span>
          </button>
          <button class="flex flex-col items-center p-2 hover:text-red-600 transition-colors text-gray-600 relative">
            <el-badge :value="cartCount" class="cart-badge">
              <el-icon class="text-xl"><ShoppingCart /></el-icon>
            </el-badge>
            <span class="text-xs mt-0.5 hidden md:inline">Cart</span>
          </button>
          <button
            class="md:hidden p-2 text-gray-600 hover:text-red-600"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <el-icon class="text-2xl"><Menu /></el-icon>
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
            <a
              :href="item.href"
              class="flex items-center gap-1 px-4 py-3 text-sm font-medium text-gray-200 hover:text-white hover:bg-red-600 transition-all duration-200"
              :class="{ 'bg-red-600 text-white': item.label === 'Home' }"
            >
              {{ item.label }}
              <el-icon v-if="item.children" class="text-xs ml-0.5"><ArrowDown /></el-icon>
            </a>
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
:deep(.el-input-group__prepend) {
  padding: 0;
}
:deep(.el-input-group__append) {
  background-color: #dc2626;
  border-color: #dc2626;
  color: white;
  cursor: pointer;
}
:deep(.el-input-group__append:hover) {
  background-color: #b91c1c;
}
</style>
