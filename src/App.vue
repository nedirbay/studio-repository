<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TopBar from './components/layout/TopBar.vue'
import Navbar from './components/layout/Navbar.vue'
import Footer from './components/layout/Footer.vue'

const route = useRoute()
const shouldShowLayout = computed(() => {
  // Hide layout for admin pages and routes with hideLayout meta
  const isAdmin = route.path.startsWith('/admin')
  const isAuthPage = route.meta.hideLayout === true
  return !isAdmin && !isAuthPage
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <TopBar v-if="shouldShowLayout" />
    <Navbar v-if="shouldShowLayout" />
    <router-view class="flex-1" />
    <Footer v-if="shouldShowLayout" />
  </div>
</template>
