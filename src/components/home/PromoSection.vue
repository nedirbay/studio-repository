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
            alt="Oýun noutbuklary"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent" />
          <div class="absolute inset-0 flex flex-col justify-center px-6">
            <span class="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">25% çenli arzanladyş</span>
            <h3 class="text-white text-xl font-bold mb-3">Oýun<br/>noutbuklary</h3>
            <a href="#" class="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded w-fit transition-colors">
              Söwda et
            </a>
          </div>
        </div>

        <!-- Promo 2 -->
        <div class="relative rounded-xl overflow-hidden h-44 group cursor-pointer">
          <img
            src="https://images.pexels.com/photos/3520697/pexels-photo-3520697.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt="PK Komponentleri"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-gray-900/85 to-transparent" />
          <div class="absolute inset-0 flex flex-col justify-center px-6">
            <span class="text-xs font-bold text-yellow-300 uppercase tracking-wider mb-1">Täze gelenler</span>
            <h3 class="text-white text-xl font-bold mb-3">PK<br/>Komponentleri</h3>
            <a href="#" class="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded w-fit transition-colors">
              Gör we saýla
            </a>
          </div>
        </div>

        <!-- Promo 3 -->
        <div class="relative rounded-xl overflow-hidden h-44 group cursor-pointer">
          <img
            src="https://images.pexels.com/photos/3394665/pexels-photo-3394665.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt="Aksessuarlar"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-red-900/85 to-transparent" />
          <div class="absolute inset-0 flex flex-col justify-center px-6">
            <span class="text-xs font-bold text-red-300 uppercase tracking-wider mb-1">Iň köp satylanlar</span>
            <h3 class="text-white text-xl font-bold mb-3">Premium<br/>Aksessuarlar</h3>
            <a href="#" class="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded w-fit transition-colors">
              Ählisini gör
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
