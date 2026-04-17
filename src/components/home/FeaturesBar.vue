<script setup lang="ts">
const features = [
  { icon: 'Van', title: 'Mugt eltip berme', desc: '500$ ýokary sargytlarda' },
  { icon: 'Refresh', title: 'Aňsat yzyna gaýtarmak', desc: '30 günüň içinde' },
  { icon: 'Shield', title: 'Kepillik', desc: 'Ähli harytlara resmi kepillik' },
  { icon: 'Service', title: 'Hünärmen goldawy', desc: '24/7 tehniki kömek' },
]
</script>

<template>
  <section class="bg-gray-800 py-6">
    <div class="max-w-7xl mx-auto px-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          v-for="f in features"
          :key="f.title"
          class="flex items-center gap-3 text-white"
        >
          <div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shrink-0">
            <el-icon class="text-xl"><component :is="f.icon" /></el-icon>
          </div>
          <div>
            <div class="text-sm font-semibold">{{ f.title }}</div>
            <div class="text-xs text-gray-400">{{ f.desc }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
