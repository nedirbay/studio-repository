<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { featuredProducts, dealProducts } from '../../data/products'
import ProductCard from '../shared/ProductCard.vue'

const activeTab = ref<'featured' | 'deals'>('featured')

// Countdown logic for the deals tab
const hours = ref(11)
const minutes = ref(45)
const seconds = ref(30)
let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(() => {
    if (seconds.value > 0) {
      seconds.value--
    } else {
      if (minutes.value > 0) {
        minutes.value--
        seconds.value = 59
      } else {
        if (hours.value > 0) {
          hours.value--
          minutes.value = 59
          seconds.value = 59
        }
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
  <section class="py-16 bg-white overflow-hidden">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Tabs Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div class="space-y-4">
          <div class="inline-flex p-1.5 bg-gray-100 rounded-2xl">
            <button 
              @click="activeTab = 'featured'"
              class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2"
              :class="activeTab === 'featured' 
                ? 'bg-white text-gray-900 shadow-lg scale-105' 
                : 'text-gray-500 hover:text-gray-700'"
            >
              <el-icon><Star /></el-icon>
              Saýlama Harytlar
            </button>
            <button 
              @click="activeTab = 'deals'"
              class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2"
              :class="activeTab === 'deals' 
                ? 'bg-white text-gray-900 shadow-lg scale-105' 
                : 'text-gray-500 hover:text-gray-700'"
            >
              <el-icon><PriceTag /></el-icon>
              Arzanlaşykdaky Harytlar
            </button>
          </div>
          
          <div v-if="activeTab === 'deals'" class="flex items-center gap-3 animate-fade-in">
            <span class="text-xs font-bold text-red-600 uppercase tracking-widest">Wagt galýar:</span>
            <div class="flex gap-1.5">
              <span class="countdown-unit">{{ pad(hours) }}</span>
              <span class="font-bold text-gray-400">:</span>
              <span class="countdown-unit">{{ pad(minutes) }}</span>
              <span class="font-bold text-gray-400">:</span>
              <span class="countdown-unit text-red-600">{{ pad(seconds) }}</span>
            </div>
          </div>
        </div>

        <a 
          :href="activeTab === 'featured' ? '/products' : '/deals'" 
          class="group flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
        >
          Ählisini gör 
          <el-icon class="group-hover:translate-x-1 transition-transform"><ArrowRight /></el-icon>
        </a>
      </div>

      <!-- Tab Content -->
      <div class="relative min-h-[400px]">
        <Transition
          enter-active-class="transition duration-400 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition duration-200 ease-in absolute inset-0"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div :key="activeTab" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <ProductCard
              v-for="product in (activeTab === 'featured' ? featuredProducts : dealProducts)"
              :key="product.id"
              :product="product"
              class="hover-lift"
            />
          </div>
        </Transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference "../../style.css";

.countdown-unit {
  @apply bg-gray-900 text-white min-w-[32px] h-8 flex items-center justify-center rounded-lg font-mono text-sm font-bold shadow-inner;
}

.hover-lift {
  @apply transition-transform duration-300;
}
.hover-lift:hover {
  transform: translateY(-8px);
}
</style>
