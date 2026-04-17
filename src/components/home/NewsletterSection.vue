<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')

function subscribe() {
  email.value = ''
}
</script>

<template>
  <section class="py-12 bg-gradient-to-r from-gray-900 to-gray-800">
    <div class="max-w-7xl mx-auto px-4 text-center">
      <h2 class="text-2xl font-bold text-white mb-2">Täzeliklerden habardar boluň</h2>
      <p class="text-gray-400 mb-6 text-sm">Biznesimize ýazylyň we täze harytlar hem-de ýörite arzanladyşlar barada maglumat alyň.</p>
      <div class="flex max-w-lg mx-auto gap-0">
        <el-input
          v-model="email"
          placeholder="Elektron poçtaňyzy giriziň"
          size="large"
          class="flex-1 newsletter-input"
        />
        <button
          class="bg-red-600 text-white px-6 py-3 font-semibold text-sm hover:bg-red-700 transition-colors rounded-r-md shrink-0"
          @click="subscribe"
        >
          Ýazyl
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
:deep(.newsletter-input .el-input__wrapper) {
  border-radius: 6px 0 0 6px !important;
}
</style>
