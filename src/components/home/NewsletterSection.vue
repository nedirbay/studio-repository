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
      <h2 class="text-2xl font-bold text-white mb-2">Stay Updated with Latest Deals</h2>
      <p class="text-gray-400 mb-6 text-sm">Subscribe to our newsletter and never miss exclusive offers and new arrivals.</p>
      <div class="flex max-w-lg mx-auto gap-0">
        <el-input
          v-model="email"
          placeholder="Enter your email address"
          size="large"
          class="flex-1 newsletter-input"
        />
        <button
          class="bg-red-600 text-white px-6 py-3 font-semibold text-sm hover:bg-red-700 transition-colors rounded-r-md shrink-0"
          @click="subscribe"
        >
          Subscribe
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
