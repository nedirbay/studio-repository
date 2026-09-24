<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { store } from '../../store'
import { homeService } from '../../views/HomePage/homeService'
import ProductCard from '../shared/ProductCard.vue'

const activeTab = ref<'featured' | 'deals'>('featured')
const latestProducts = ref<any[]>([])
const isLoadingLatest = ref(true)
const latestProductsFailed = ref(false)

async function loadLatestProducts() {
  try {
    const products = await homeService.listLatestProducts()
    latestProducts.value = products.map((product: any) => ({
      ...product,
      category: product.category_name,
      brand: product.marka,
      image: product.image || '',
      images: product.image ? [product.image] : [],
      inStock: product.instock,
      originalPrice: product.original_price,
    }))
  } catch (error) {
    latestProductsFailed.value = true
    console.error('Soňky goşulan harytlary ýüklemek başa barmady:', error)
  } finally {
    isLoadingLatest.value = false
  }
}

// Countdown logic for the deals tab
const hours = ref(11)
const minutes = ref(45)
const seconds = ref(30)
let timer: ReturnType<typeof setInterval>

onMounted(() => {
  void loadLatestProducts()
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
              <el-icon><Clock /></el-icon>
              Soňky goşulanlar
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
          
          <div v-if="activeTab === 'deals'" class="flex items-center gap-3 opacity-0 animate-[fade-in_0.4s_ease-out_forwards]">
            <span class="text-xs font-bold text-red-600 uppercase tracking-widest">Wagt galýar:</span>
            <div class="flex items-center gap-1">
              <div v-for="(unit, i) in [pad(hours), pad(minutes), pad(seconds)]" :key="i" class="flex items-center gap-1">
                <span class="bg-gray-900 text-white min-w-[32px] h-8 flex items-center justify-center rounded-lg font-mono text-sm font-bold shadow-inner">
                  {{ unit }}
                </span>
                <span v-if="i < 2" class="text-gray-900 font-bold">:</span>
              </div>
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
          <div :key="activeTab">
            <div v-if="activeTab === 'featured' && isLoadingLatest" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div v-for="item in 4" :key="item" class="rounded-xl border border-gray-100 p-4">
                <el-skeleton animated :rows="4" />
              </div>
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <ProductCard
                v-for="product in (activeTab === 'featured' ? latestProducts : store.products.filter(p => p.originalPrice || p.badge === 'sale').slice(0, 8))"
                :key="product.id"
                :product="product"
                class="transition-transform duration-300 hover:-translate-y-2"
              />
            </div>
            <p v-if="activeTab === 'featured' && !isLoadingLatest && latestProducts.length === 0" class="py-10 text-center text-gray-500">
              {{ latestProductsFailed ? 'Harytlary ýüklemek başa barmady.' : 'Häzirlikçe görkezmäge haryt ýok.' }}
            </p>
          </div>
        </Transition>
      </div>
    </div>
  </section>
</template>
