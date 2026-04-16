<script setup lang="ts">
import TopBar from './components/layout/TopBar.vue'
import Navbar from './components/layout/Navbar.vue'
import Footer from './components/layout/Footer.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <TopBar />
    <Navbar />
    <router-view />
    <Footer />
  </div>
</template>
