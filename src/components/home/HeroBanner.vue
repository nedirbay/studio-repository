<script setup lang="ts">
import { store } from '../../store'
import { baseMediaURL } from '../../utils/request'

const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return baseMediaURL + url
}
</script>

<template>
  <section class="w-full">
    <el-carousel height="550px" :interval="5000" arrow="always" indicator-position="outside">
      <el-carousel-item v-for="banner in store.banners" :key="banner.id">
        <div class="relative h-full overflow-hidden">
          <img
            :src="getImageUrl(banner.image)"
            :alt="banner.title"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-r" :class="banner.bgColor" style="opacity: 0.75;" />
          <div class="absolute inset-0 flex items-center">
            <div class="max-w-7xl mx-auto px-4 w-full">
              <div class="max-w-lg text-white">
                <span class="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded mb-3 uppercase tracking-wider">
                  {{ banner.subtitle }}
                </span>
                <h2 class="text-5xl md:text-7xl font-extrabold mb-4 leading-tight">
                  {{ banner.title }}
                </h2>
                <p class="text-base text-gray-200 mb-6 leading-relaxed">
                  {{ banner.description }}
                </p>
                <div class="flex gap-3">
                  <router-link 
                    v-if="banner.product_id"
                    :to="`/product/${banner.product_id}`"
                  >
                    <button class="btn-primary text-sm shadow-xl shadow-red-600/30">
                      {{ banner.ctaText }}
                    </button>
                  </router-link>
                  <button v-else class="btn-primary text-sm shadow-xl shadow-red-600/30">
                    {{ banner.ctaText }}
                  </button>
                  
                  <router-link to="/products">
                    <button class="btn-outline text-sm border-white text-white hover:bg-white hover:text-gray-900 transition-all font-bold">
                      Ählisini gör
                    </button>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </section>
</template>

<style scoped>
:deep(.el-carousel__indicators--outside) {
  margin-top: 8px;
}
:deep(.el-carousel__button) {
  background-color: #dc2626;
  width: 24px;
  height: 4px;
  border-radius: 2px;
}
:deep(.el-carousel__arrow) {
  background-color: rgba(0,0,0,0.4);
  width: 40px;
  height: 40px;
}
:deep(.el-carousel__arrow:hover) {
  background-color: #dc2626;
}
</style>
