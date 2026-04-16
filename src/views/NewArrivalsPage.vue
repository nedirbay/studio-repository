<script setup lang="ts">
import { computed } from 'vue'
import { allProducts } from '../data/products'
import ProductCard from '../components/shared/ProductCard.vue'

const newProducts = computed(() => 
  allProducts.filter(p => p.badge === 'new').sort((a, b) => b.id - a.id)
)
</script>

<template>
  <main class="bg-gray-50 min-h-screen">
    <!-- Hero Banner -->
    <div class="bg-blue-900 text-white py-20 relative overflow-hidden">
      <div class="absolute inset-0 opacity-40">
        <img 
          src="https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=1200" 
          class="w-full h-full object-cover"
        />
      </div>
      <div class="max-w-7xl mx-auto px-4 relative z-10">
        <div class="max-w-2xl">
          <span class="inline-block bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            Latest Tech
          </span>
          <h1 class="text-5xl md:text-7xl font-black mb-6 leading-tight">Täze Gelen Harytlar</h1>
          <p class="text-xl text-blue-100 mb-8">
            Dünýäniň iň soňky tehnologiýalaryny ilkinji bolup Sumbar Computer-da tapyň. Ýokary öndürijilik, täze dizaýn.
          </p>
          <div class="flex gap-4">
            <el-button type="primary" size="large" class="!rounded-xl px-8 font-bold">Explore All</el-button>
            <el-button size="large" class="!rounded-xl px-8 font-bold !bg-white/10 !text-white !border-white/20 backdrop-blur-md">Pre-orders</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 py-16">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <!-- Sidebar Info -->
        <aside class="lg:col-span-1">
          <div class="sticky top-24">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Näme üçin täze modeller?</h2>
            <div class="space-y-6">
              <div class="flex gap-4">
                <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                  <el-icon class="text-blue-600 text-xl"><Monitor /></el-icon>
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 text-sm mb-1">Soňky Nesil</h3>
                  <p class="text-xs text-gray-500 leading-relaxed">Iň täze prosessorlar we grafiki kartalar bilen üpjün edilen.</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
                  <el-icon class="text-green-600 text-xl"><Lightning /></el-icon>
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 text-sm mb-1">Energiýa Tygşytlylygy</h3>
                  <p class="text-xs text-gray-500 leading-relaxed">Täze arhitekturalar has az energiýa sarp edip, has köp iş bitirýär.</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center shrink-0">
                  <el-icon class="text-purple-600 text-xl"><Cpu /></el-icon>
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 text-sm mb-1">Garantyly Hil</h3>
                  <p class="text-xs text-gray-500 leading-relaxed">Ähli täze harytlarymyz resmi seriýa belgisi we garantiýasy bilen gelýär.</p>
                </div>
              </div>
            </div>
            
            <div class="mt-12 bg-gray-900 rounded-3xl p-6 text-white overflow-hidden relative">
              <div class="relative z-10">
                <h3 class="font-bold mb-2">Bize agza boluň!</h3>
                <p class="text-xs text-gray-400 mb-4">Täze harytlardan ilkinji bolup habardar boluň.</p>
                <el-input placeholder="Email ýazyň" class="new-entry-input mb-2" />
                <el-button type="primary" class="w-full !rounded-xl">Subscribe</el-button>
              </div>
              <el-icon class="absolute -bottom-6 -right-6 text-8xl text-white/5 rotate-12"><Pointer /></el-icon>
            </div>
          </div>
        </aside>

        <!-- Product Grid -->
        <div class="lg:col-span-3">
          <div class="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
            <h2 class="text-xl font-bold text-gray-900">Iň Soňky Gelenler</h2>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              Sort by: <span class="text-blue-600 font-bold cursor-pointer">Newest First</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductCard 
              v-for="product in newProducts" 
              :key="product.id" 
              :product="product"
            />
          </div>
          
          <div v-if="newProducts.length === 0" class="py-20 text-center bg-white rounded-3xl shadow-sm">
            <el-icon class="text-6xl text-gray-300 mb-4"><MagicStick /></el-icon>
            <h3 class="text-xl font-semibold text-gray-700">Täze harytlar ýolunda!</h3>
            <p class="text-gray-500 mt-2">Basym täze harytlarymyzy görkezeris.</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
@reference "../style.css";

:deep(.new-entry-input .el-input__wrapper) {
  @apply bg-white/10 border-white/20 shadow-none !text-white rounded-xl;
}
:deep(.new-entry-input .el-input__inner::placeholder) {
  @apply text-white/40;
}
</style>
