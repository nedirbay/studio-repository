<script setup lang="ts">
import type { Product } from '../../types'

defineProps<{ product: Product }>()

function discountPercent(price: number, original: number) {
  return Math.round(((original - price) / original) * 100)
}
</script>

<template>
  <router-link :to="`/product/${product.id}`" class="product-card group cursor-pointer block">
    <div class="relative overflow-hidden bg-gray-50">
      <img
        :src="product.image"
        :alt="product.name"
        class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div class="absolute top-2 left-2 flex flex-col gap-1">
        <span v-if="product.badge === 'new'" class="badge-new">NEW</span>
        <span v-else-if="product.badge === 'sale'" class="badge-sale">
          -{{ discountPercent(product.price, product.originalPrice!) }}%
        </span>
        <span v-else-if="product.badge === 'hot'" class="badge-hot">HOT</span>
      </div>
      <div v-if="!product.inStock" class="absolute inset-0 bg-black/50 flex items-center justify-center">
        <span class="text-white font-semibold text-sm bg-gray-800 px-3 py-1 rounded">Out of Stock</span>
      </div>
      <div class="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button class="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors" @click.prevent>
          <el-icon class="text-sm"><Star /></el-icon>
        </button>
        <button class="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors" @click.prevent>
          <el-icon class="text-sm"><View /></el-icon>
        </button>
      </div>
    </div>

    <div class="p-4">
      <div class="text-xs text-gray-400 mb-1">{{ product.brand }} · {{ product.category }}</div>
      <h3 class="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
        {{ product.name }}
      </h3>

      <div class="flex items-center gap-1 mb-2">
        <el-rate
          :model-value="product.rating"
          disabled
          show-score
          text-color="#ff9900"
          score-template="{value}"
          size="small"
          style="--el-rate-fill-color: #f59e0b;"
        />
        <span class="text-xs text-gray-400">({{ product.reviews }})</span>
      </div>

      <div class="flex items-center justify-between mt-3">
        <div>
          <span class="text-lg font-bold text-red-600">${{ product.price.toLocaleString() }}</span>
          <span v-if="product.originalPrice" class="text-xs text-gray-400 line-through ml-2">
            ${{ product.originalPrice.toLocaleString() }}
          </span>
        </div>
        <button
          class="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!product.inStock"
          @click.prevent
        >
          <el-icon><ShoppingCart /></el-icon>
          Add
        </button>
      </div>
    </div>
  </router-link>
</template>
