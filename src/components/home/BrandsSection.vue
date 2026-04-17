<script setup lang="ts">
import { brands } from '../../data/products'
</script>

<template>
  <section class="py-8 bg-white border-y border-gray-100">
    <div class="max-w-7xl mx-auto px-4">
      <h2 class="section-title mb-6">Esasy brendler</h2>
      <div class="grid grid-cols-4 md:grid-cols-8 gap-3">
        <router-link
          v-for="brand in brands"
          :key="brand.id"
          :to="{ path: '/products', query: { brand: brand.name } }"
          class="flex items-center justify-center h-14 bg-gray-50 rounded-lg border border-gray-100 hover:border-red-200 hover:bg-red-50 cursor-pointer transition-all duration-200 group no-underline"
        >
          <span class="text-sm font-bold text-gray-500 group-hover:text-red-600 transition-colors tracking-wide">
            {{ brand.name }}
          </span>
        </router-link>
      </div>
    </div>
  </section>
</template>
