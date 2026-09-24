<script setup lang="ts">
import { useRouter } from 'vue-router'
import { formatPrice } from '../../store'
import type { Product } from '../../types'

const props = defineProps<{ product: Product }>()
const router = useRouter()

function goToProduct() {
  router.push(`/product/${props.product.slug}`)
}

function discountPercent(price: number, original: number) {
  return Math.round(((original - price) / original) * 100)
}
</script>

<template>
  <router-link :to="`/product/${product.slug}`" class="product-card group cursor-pointer block">
    <div class="relative overflow-hidden bg-gray-50">
      <img
        :src="product.image"
        :alt="product.name"
        class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div class="absolute top-2 left-2 flex flex-col gap-1">
        <span v-if="product.badge === 'new'" class="badge-new">TÄZE</span>
        <span v-else-if="product.badge === 'sale'" class="badge-sale">
          -{{ discountPercent(product.price, product.originalPrice!) }}%
        </span>
        <span v-else-if="product.badge === 'hot'" class="badge-hot">GYZGYN</span>
      </div>
      <div v-if="!product.inStock" class="absolute inset-0 bg-black/50 flex items-center justify-center">
        <span class="text-white font-semibold text-sm bg-gray-800 px-3 py-1 rounded">Ammarda ýok</span>
      </div>
      <div class="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <!-- <button class="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors" @click.prevent>
          <el-icon class="text-sm"><Star /></el-icon>
        </button> -->
        <button 
          class="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors" 
          @click.prevent="goToProduct"
        >
          <el-icon class="text-sm"><View /></el-icon>
        </button>
      </div>
    </div>

    <div class="p-4">
      <div class="text-xs text-gray-400 mb-1">{{ product.brand }} · {{ product.category }}</div>
      <h3 class="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
        {{ product.name }}
      </h3>

      <div class="flex items-center justify-between mt-3">
        <div>
          <span class="text-lg font-bold text-red-600">{{ formatPrice(product.price) }}</span>
          <span v-if="product.originalPrice" class="text-xs text-gray-400 line-through ml-2">
            {{ formatPrice(product.originalPrice) }}
          </span>
        </div>
      </div>
    </div>
  </router-link>
</template>
