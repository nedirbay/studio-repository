<script setup lang="ts">
import { onMounted, ref } from 'vue'

const show = ref(true)

onMounted(() => {
  // Automatically start fade out after 2 seconds
  setTimeout(() => {
    show.value = false
  }, 2000)
})
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="splash-screen">
      <div class="splash-content">
        <h1 class="brand-title">
          <span>Doganlar</span>
          <span class="highlight">foto merkezi</span>
        </h1>
        <p class="tagline">Ýokary hil, amatly baha</p>
        
        <div class="loader-line"></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.splash-screen {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: radial-gradient(circle at center, #111827 0%, #000000 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.splash-content {
  text-align: center;
  animation: scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.brand-title {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.brand-title span:first-child {
  font-size: 4rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  background: linear-gradient(to bottom, #ffffff, #9ca3af);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-title .highlight {
  font-size: 1.25rem;
  font-weight: 700;
  color: #dc2626;
  letter-spacing: 0.5em;
  text-transform: uppercase;
  margin-top: -0.5rem;
}

.tagline {
  font-size: 1.5rem;
  color: #9ca3af;
  font-weight: 300;
  letter-spacing: 0.1em;
  opacity: 0;
  animation: fadeIn 0.5s ease-out 0.5s forwards;
}

.loader-line {
  width: 0;
  height: 2px;
  background: #dc2626;
  margin-top: 2rem;
  border-radius: 1px;
  animation: load 2s linear forwards;
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes fadeIn {
  to { opacity: 1; }
}

@keyframes load {
  to { width: 100%; }
}

.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .brand-title span:first-child {
    font-size: 2.5rem;
  }
  .brand-title .highlight {
    font-size: 0.875rem;
  }
  .tagline {
    font-size: 1rem;
  }
}
</style>
