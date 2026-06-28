<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { store, actions } from '../../store'
import { Calendar, ArrowLeft, Camera } from '@element-plus/icons-vue'
import BlogVideoPlayer from '../../components/shared/BlogVideoPlayer.vue'

const route = useRoute()
const blogSlug = computed(() => route.params.slug as string)

onMounted(() => {
  if (blogSlug.value) {
    actions.fetchBlogBySlug(blogSlug.value)
  }
})

const blog = computed(() => store.selectedBlog)

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('tk-TM', { day: 'numeric', month: 'long', year: 'numeric' })
}

const imageList = computed(() => {
  if (!blog.value?.media) return []
  return blog.value.media
    .filter((m: any) => m.kind === 'image')
    .map((m: any) => m.url)
})
</script>

<template>
  <div class="blog-detail-page pb-20">
    <div v-if="!blog && store.loading" class="max-w-4xl mx-auto px-4 py-20">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else-if="blog" class="animate-fadeIn">
      <!-- Header / Hero -->
      <section class="relative h-[60vh] min-h-[400px] flex items-end">
        <div class="absolute inset-0 z-0">
          <img :src="blog.main_image" :alt="blog.title" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent"></div>
        </div>

        <div class="relative z-10 max-w-5xl mx-auto px-4 pb-20 w-full">
          <router-link to="/blog" class="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors">
            <el-icon><ArrowLeft /></el-icon>
            Bloga dolan
          </router-link>
          
          <div class="flex items-center gap-4 text-red-500 font-bold uppercase tracking-widest text-xs mb-4">
            <span class="flex items-center gap-1">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(blog.date) }}
            </span>
          </div>
          
          <h1 class="text-4xl md:text-6xl font-black text-white uppercase leading-none tracking-tight max-w-4xl">
            {{ blog.title }}
          </h1>
        </div>
      </section>

      <!-- Content Section -->
      <section class="max-w-4xl mx-auto px-4 -mt-10 relative z-20">
        <div class="bg-white rounded-[40px] p-8 md:p-16 shadow-2xl border border-gray-100">
          <!-- Article Body -->
          <div class="prose prose-lg max-w-none mb-16">
            <p v-for="(paragraph, index) in blog.content?.split('\n')" :key="index" class="text-gray-700 leading-loose mb-6 last:mb-0">
              {{ paragraph }}
            </p>
          </div>


          <!-- Media Gallery -->
          <div v-if="blog.media && blog.media.length > 0" class="gallery-section">
            <h2 class="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tight">Media <span class="text-red-600">Galereýasy</span></h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(media, index) in blog.media" :key="index" class="media-item group">
                <div v-if="media.kind === 'image'" class="relative overflow-hidden rounded-2xl aspect-video cursor-pointer">
                  <el-image 
                    :src="media.url" 
                    :preview-src-list="imageList" 
                    :initial-index="imageList.indexOf(media.url)"
                    preview-teleported
                    fit="cover"
                    class="w-full h-full transition-transform duration-500 group-hover:scale-110"
                  >
                    <template #placeholder>
                      <div class="w-full h-full bg-gray-100 flex items-center justify-center">
                        <el-icon class="is-loading"><Camera /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div class="absolute inset-0 pointer-events-none bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <el-icon class="text-white text-3xl opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all"><Camera /></el-icon>
                  </div>
                </div>
                <div v-else-if="media.kind === 'video'" class="relative overflow-hidden rounded-2xl aspect-video bg-gray-100">
                  <BlogVideoPlayer :src="media.url" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Next Article Suggestion (Simple) -->
      <section class="max-w-4xl mx-auto px-4 mt-16 flex justify-center">
        <router-link to="/blog" class="bg-gray-950 text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-4 hover:bg-red-600 transition-all shadow-xl">
          Ähli makalalar
          <el-icon><ArrowLeft class="rotate-180" /></el-icon>
        </router-link>
      </section>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.blog-detail-page {
  animation: fadeIn 0.8s ease-out;
}


.media-item {
  @apply bg-gray-50 rounded-2xl overflow-hidden shadow-sm;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.prose p {
  @apply relative;
}

.prose p:first-of-type::first-letter {
  @apply text-5xl font-black text-red-600 float-left mr-3 mt-1;
}
</style>
