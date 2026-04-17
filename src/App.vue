<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TopBar from './components/layout/TopBar.vue'
import Navbar from './components/layout/Navbar.vue'
import Footer from './components/layout/Footer.vue'

const route = useRoute()
const isAdmin = computed(() => route.path.startsWith('/admin'))
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <TopBar v-if="!isAdmin" />
    <Navbar v-if="!isAdmin" />
    <router-view />
    <Footer v-if="!isAdmin" />
  </div>
</template>
