<script setup lang="ts">
import { store } from '../../store'
</script>

<template>
  <section class="py-10">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="section-title">Kategoriýalar boýunça</h2>
        <a href="#" class="text-sm text-red-600 font-semibold hover:text-red-700 flex items-center gap-1">
          Ählisini gör <el-icon><ArrowRight /></el-icon>
        </a>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <router-link
          v-for="category in store.categories"
          :key="category.id"
          :to="`/products/${category.slug}`"
          class="category-card group no-underline"
        >
          <div class="text-3xl group-hover:scale-110 transition-transform duration-300">
            {{ category.icon }}
          </div>
          <div class="text-center">
            <div class="text-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors">
              {{ category.name }}
            </div>
            <div class="text-xs text-gray-400 mt-0.5">{{ category.count }} sany</div>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>
