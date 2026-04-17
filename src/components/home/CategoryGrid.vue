<script setup lang="ts">
import { categories } from '../../data/products'
</script>

<template>
  <section class="py-10">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="section-title">Kategoriýalar boýunça söwda</h2>
        <a href="#" class="text-sm text-red-600 font-semibold hover:text-red-700 flex items-center gap-1">
          Ählisini gör <el-icon><ArrowRight /></el-icon>
        </a>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="category-card group"
        >
          <div class="text-3xl group-hover:scale-110 transition-transform duration-300">
            {{ cat.icon }}
          </div>
          <div class="text-center">
            <div class="text-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors">
              {{ cat.name }}
            </div>
            <div class="text-xs text-gray-400 mt-0.5">{{ cat.count }} sany</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
