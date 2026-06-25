<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TopBar from './components/layout/TopBar.vue'
import Navbar from './components/layout/Navbar.vue'
import Footer from './components/layout/Footer.vue'
import SplashScreen from './components/shared/SplashScreen.vue'
import { ref, onMounted } from 'vue'

const showSplash = ref(true)

onMounted(() => {
  // We keep it in DOM for the full 2.5s (2s + 0.5s fade out)
  setTimeout(() => {
    showSplash.value = false
  }, 2500)
})

const route = useRoute()
const shouldShowLayout = computed(() => {
  // Hide layout for admin pages and routes with hideLayout meta
  const isAdmin = route.path.startsWith('/admin')
  const isAuthPage = route.meta.hideLayout === true
  const isStudioCollectionView = route.path.startsWith('/studio') && typeof route.query.collection === 'string'
  
  // Hide layout when fullscreen player/reels view is open on studio or blog pages
  const isFullscreenReel = (route.path.startsWith('/studio') || route.path.startsWith('/blog')) && route.query.item !== undefined
  
  return !isAdmin && !isAuthPage && !isStudioCollectionView && !isFullscreenReel
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <SplashScreen v-if="showSplash" />
    <TopBar v-if="shouldShowLayout" />
    <Navbar v-if="shouldShowLayout" />
    <router-view class="flex-1" />
    <Footer v-if="shouldShowLayout" />
  </div>
</template>
