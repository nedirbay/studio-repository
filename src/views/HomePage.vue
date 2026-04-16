<script setup lang="ts">
import HeroBanner from '../components/home/HeroBanner.vue'
import CategoryGrid from '../components/home/CategoryGrid.vue'
import FeaturedProducts from '../components/home/FeaturedProducts.vue'
import PromoSection from '../components/home/PromoSection.vue'
import DealsSection from '../components/home/DealsSection.vue'
import BrandsSection from '../components/home/BrandsSection.vue'
import NewsletterSection from '../components/home/NewsletterSection.vue'
</script>

<template>
  <main>
    <HeroBanner />
    <CategoryGrid />
    <FeaturedProducts />
    <PromoSection />
    <DealsSection />
    <BrandsSection />
    <NewsletterSection />
  </main>
</template>
