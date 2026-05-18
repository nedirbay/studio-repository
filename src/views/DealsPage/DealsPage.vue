<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { store } from '../../store'
import ProductCard from '../../components/shared/ProductCard.vue'

const hours = ref(8)
const minutes = ref(24)
const seconds = ref(56)
let timer: any

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

const dealProducts = computed(() => 
  store.products.filter(p => p.originalPrice || p.badge === 'sale')
)

function pad(n: number) {
  return String(n).padStart(2, '0')
}
</script>

<template>
  <main class="bg-gray-50 min-h-screen">
    <!-- Hero Banner -->
    <div class="bg-gray-900 text-white py-16 relative overflow-hidden">
      <div class="absolute inset-0 opacity-30">
        <img 
          src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1200" 
          class="w-full h-full object-cover"
        />
      </div>
      <div class="max-w-7xl mx-auto px-4 relative z-10 text-center">
        <span class="inline-block bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest animate-bounce">
          Uly arzanladyş
        </span>
        <h1 class="text-4xl md:text-6xl font-black mb-6">Arzanlaşykdaky Harytlar</h1>
        <p class="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Iň soňky tehnologiýalar iň amatly bahalardan. Çäklidir ümşürilen wagty sypdyrmaň!
        </p>
        
        <!-- Countdown Container -->
        <div class="flex items-center justify-center gap-4 md:gap-8">
          <div class="text-center">
            <div class="bg-white/10 backdrop-blur-md rounded-2xl w-20 h-20 md:w-24 md:h-24 flex items-center justify-center text-3xl md:text-4xl font-bold border border-white/20 mb-2">
              {{ pad(hours) }}
            </div>
            <span class="text-xs uppercase tracking-widest text-gray-400">Sagat</span>
          </div>
          <div class="text-3xl font-bold mb-8">:</div>
          <div class="text-center">
            <div class="bg-white/10 backdrop-blur-md rounded-2xl w-20 h-20 md:w-24 md:h-24 flex items-center justify-center text-3xl md:text-4xl font-bold border border-white/20 mb-2">
              {{ pad(minutes) }}
            </div>
            <span class="text-xs uppercase tracking-widest text-gray-400">Minut</span>
          </div>
          <div class="text-3xl font-bold mb-8">:</div>
          <div class="text-center">
            <div class="bg-white/10 backdrop-blur-md rounded-2xl w-20 h-20 md:w-24 md:h-24 flex items-center justify-center text-3xl md:text-4xl font-bold border border-white/20 mb-2 text-red-500">
              {{ pad(seconds) }}
            </div>
            <span class="text-xs uppercase tracking-widest text-gray-400">Sekunt</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Grid -->
    <div class="max-w-7xl mx-auto px-4 py-12">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-3xl font-bold text-gray-900">Ähli Arzanlaşyklar</h2>
            <p class="text-gray-500 text-sm mt-1">Söwdada {{ dealProducts.length }} sany haryt tapyldy</p>
          </div>
        <div class="flex gap-2">
          <!-- Filters (simplified for now) -->
          <el-button round>Baha: Arzandan gymmada</el-button>
          <el-button round type="primary" plain>Iň uly arzanladyş</el-button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <ProductCard 
          v-for="product in dealProducts" 
          :key="product.id" 
          :product="product"
        />
      </div>

      <!-- Empty State -->
      <div v-if="dealProducts.length === 0" class="py-20 text-center">
        <el-icon class="text-6xl text-gray-300 mb-4"><Present /></el-icon>
        <h3 class="text-xl font-semibold text-gray-700">Şu wagt arzanlaşykda haryt ýok</h3>
        <p class="text-gray-500 mt-2">Täze arzanlaşyklar üçin bize agza boluň!</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
</style>
