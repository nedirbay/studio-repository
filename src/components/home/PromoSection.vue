<script setup lang="ts">
</script>

<template>
  <section class="py-8">
    <div class="max-w-7xl mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Promo 1 -->
        <div class="relative rounded-xl overflow-hidden h-44 group cursor-pointer">
          <img
            src="https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt="Gaming Laptops"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent" />
          <div class="absolute inset-0 flex flex-col justify-center px-6">
            <span class="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">Up to 25% off</span>
            <h3 class="text-white text-xl font-bold mb-3">Gaming<br/>Laptops</h3>
            <a href="#" class="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded w-fit transition-colors">
              Shop Now
            </a>
          </div>
        </div>

        <!-- Promo 2 -->
        <div class="relative rounded-xl overflow-hidden h-44 group cursor-pointer">
          <img
            src="https://images.pexels.com/photos/3520697/pexels-photo-3520697.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt="PC Components"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-gray-900/85 to-transparent" />
          <div class="absolute inset-0 flex flex-col justify-center px-6">
            <span class="text-xs font-bold text-yellow-300 uppercase tracking-wider mb-1">New Arrivals</span>
            <h3 class="text-white text-xl font-bold mb-3">PC<br/>Components</h3>
            <a href="#" class="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded w-fit transition-colors">
              Explore
            </a>
          </div>
        </div>

        <!-- Promo 3 -->
        <div class="relative rounded-xl overflow-hidden h-44 group cursor-pointer">
          <img
            src="https://images.pexels.com/photos/3394665/pexels-photo-3394665.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt="Accessories"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-red-900/85 to-transparent" />
          <div class="absolute inset-0 flex flex-col justify-center px-6">
            <span class="text-xs font-bold text-red-300 uppercase tracking-wider mb-1">Best Sellers</span>
            <h3 class="text-white text-xl font-bold mb-3">Premium<br/>Accessories</h3>
            <a href="#" class="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded w-fit transition-colors">
              View All
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
