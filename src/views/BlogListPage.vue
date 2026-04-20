<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { store, actions } from '../store'
import { Calendar, ArrowRight, Camera } from '@element-plus/icons-vue'

const currentPage = ref(1)
const pageSize = ref(9)

onMounted(() => {
  actions.fetchBlogs(currentPage.value, pageSize.value)
})

const handlePageChange = (page: number) => {
  currentPage.value = page
  actions.fetchBlogs(page, pageSize.value)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('tk-TM', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="blog-list-page pb-20">
    <!-- Hero Section -->
    <section class="bg-gray-950 text-white py-20 relative overflow-hidden">
      <div class="absolute inset-0 opacity-20">
        <img src="https://images.pexels.com/photos/1549000/pexels-photo-1549000.jpeg?auto=compress&cs=tinysrgb&w=1260" alt="Blog background" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-r from-gray-950 to-transparent"></div>
      </div>
      
      <div class="max-w-7xl mx-auto px-4 relative z-10">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-600/30 text-red-500 text-xs font-bold uppercase tracking-widest mb-6">
          <el-icon><Camera /></el-icon>
          Fotografiýa we Sanly dünýä
        </div>
        <h1 class="text-5xl md:text-7xl font-black mb-6 tracking-tight uppercase">
          Biziň <span class="text-red-600">Täzeliklerimiz</span>
        </h1>
        <p class="text-xl text-gray-400 max-w-2xl font-light">
          Täze harytlar, tejribeli fotograf-hünärmenleriň maslahatlary we Mary şäherindäki iň soňky täzelikler barada okaň.
        </p>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 py-12 relative z-20">
      <div v-if="store.loading" class="flex justify-center py-20">
        <el-skeleton :rows="5" animated />
      </div>
      
      <div v-else-if="store.blogs.length === 0" class="text-center py-20 bg-white rounded-3xl shadow-xl border border-gray-100">
        <el-icon class="text-6xl text-gray-200 mb-4"><Calendar /></el-icon>
        <h2 class="text-2xl font-bold text-gray-900">Häzirlikçe makala ýok</h2>
        <p class="text-gray-500">Tiz wagtdan täze gyzykly maglumatlar goşular.</p>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <router-link 
            v-for="blog in store.blogs" 
            :key="blog.id" 
            :to="`/blog/${blog.slug}`"
            class="blog-card group"
          >
          <div class="image-wrapper">
            <img :src="blog.main_image" :alt="blog.title" class="blog-img" />
            <div class="date-badge">
              <span class="day">{{ new Date(blog.date).getDate() }}</span>
              <span class="month">{{ new Date(blog.date).toLocaleDateString('tk-TM', { month: 'short' }) }}</span>
            </div>
          </div>
          
          <div class="content">
            <div class="flex items-center gap-2 text-red-600 text-[10px] font-bold uppercase tracking-widest mb-3">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(blog.date) }}
            </div>
            <h3 class="text-xl font-black text-gray-900 group-hover:text-red-600 transition-colors uppercase leading-tight mb-4">
              {{ blog.title }}
            </h3>
            <p class="text-gray-500 text-sm line-clamp-3 mb-6 font-light leading-relaxed">
              {{ blog.content || 'Bu makala barada has giňişleýin öwrenmek üçin okaň...' }}
            </p>
            <div class="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider group-hover:gap-4 transition-all">
              Dowamyny oka 
              <el-icon class="text-red-600"><ArrowRight /></el-icon>
            </div>
          </div>
        </router-link>
        </div>

        <!-- Pagination -->
        <div class="flex justify-center mt-16 pagination-wrapper">
          <el-pagination 
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="store.blogTotalCount"
            layout="prev, pager, next"
            background
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.blog-list-page {
  animation: fadeIn 0.8s ease-out;
}

.blog-card {
  @apply bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 transition-all duration-500 flex flex-col;
}

.blog-card:hover {
  @apply shadow-2xl -translate-y-2 border-red-100;
}

.image-wrapper {
  @apply relative overflow-hidden aspect-[16/10];
}

.blog-img {
  @apply w-full h-full object-cover transition-transform duration-700;
}

.blog-card:hover .blog-img {
  @apply scale-110;
}

.date-badge {
  @apply absolute top-5 left-5 bg-white rounded-2xl p-3 flex flex-col items-center justify-center min-w-[60px] shadow-lg;
}

.date-badge .day {
  @apply text-xl font-black text-gray-950 leading-none;
}

.date-badge .month {
  @apply text-[10px] font-bold text-red-600 uppercase tracking-wider mt-1;
}

.content {
  @apply p-8 flex-grow flex flex-col;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
