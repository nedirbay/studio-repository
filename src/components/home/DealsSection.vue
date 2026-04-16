<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { dealProducts } from '../../data/products'
import ProductCard from '../shared/ProductCard.vue'

const hours = ref(11)
const minutes = ref(45)
const seconds = ref(30)

let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(() => {
    seconds.value--
    if (seconds.value < 0) {
      seconds.value = 59
      minutes.value--
      if (minutes.value < 0) {
        minutes.value = 59
        hours.value--
        if (hours.value < 0) hours.value = 23
      }
    }
  }, 1000)
})

onUnmounted(() => clearInterval(timer))

function pad(n: number) {
  return String(n).padStart(2, '0')
}
</script>

<template>
  <section class="py-10">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <h2 class="section-title">Arzanlaşykdaky Harytlar</h2>
          <div class="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
            <el-icon class="mr-1"><Clock /></el-icon>
            {{ pad(hours) }}:{{ pad(minutes) }}:{{ pad(seconds) }}
          </div>
        </div>
        <a href="#" class="text-sm text-red-600 font-semibold hover:text-red-700 flex items-center gap-1">
          View All <el-icon><ArrowRight /></el-icon>
        </a>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <ProductCard
          v-for="product in dealProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </section>
</template>
