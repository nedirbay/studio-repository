<script setup lang="ts">
import { store } from '../../store'
</script>

<template>
  <section class="py-8">
    <div class="max-w-7xl mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          v-for="promo in store.promos" 
          :key="promo.id"
          class="relative rounded-xl overflow-hidden h-44 group cursor-pointer"
        >
          <img
            :src="promo.image"
            :alt="promo.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-r" :class="promo.bgGradient" style="opacity: 0.8;" />
          <div class="absolute inset-0 flex flex-col justify-center px-6">
            <span v-if="promo.badge" class="text-xs font-bold text-white/90 uppercase tracking-wider mb-1">
              {{ promo.badge }}
            </span>
            <h3 class="text-white text-xl font-bold mb-3" v-html="promo.title.replace(' ', '<br/>')"></h3>
            <router-link 
              :to="promo.link" 
              class="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded w-fit transition-colors no-underline text-center"
            >
              Ählisini gör
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
