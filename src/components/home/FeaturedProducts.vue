<script setup lang="ts">
import { featuredProducts } from '../../data/products'
import ProductCard from '../shared/ProductCard.vue'
</script>

<template>
  <section class="py-10 bg-white">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="section-title">Featured Products</h2>
        <a href="#" class="text-sm text-red-600 font-semibold hover:text-red-700 flex items-center gap-1">
          View All <el-icon><ArrowRight /></el-icon>
        </a>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        <ProductCard
          v-for="product in featuredProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </section>
</template>
