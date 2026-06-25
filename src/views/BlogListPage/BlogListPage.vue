<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  CaretTop,
  CaretBottom,
  ArrowLeft,
  Calendar,
  ArrowRight,
  Camera
} from '@element-plus/icons-vue'
import Hls from 'hls.js'
import ServiceGenerate, { baseMediaURL } from '../../utils/request'

const route = useRoute()
const router = useRouter()
const service = ServiceGenerate()

// Local state for pagination and list
const blogs = ref<any[]>([])
const blogTotalCount = ref(0)
const blogNextUrl = ref<string | null>(null)
const listLoading = ref(false)
const loadingMore = ref(false)
const currentPage = ref(1)
const pageSize = 9 // 9 items per page in grid view

// Fullscreen viewer states
const containerRef = ref<HTMLElement | null>(null)
const currentIndex = ref(0)
const videoRefs = ref<Record<number, HTMLVideoElement | null>>({})
const hlsInstances = ref<Record<number, Hls>>({})
const muted = ref(true)

const selectedMediaId = computed(() => {
  const raw = route.query.item
  if (typeof raw !== 'string') return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
})

const viewerItems = computed(() => blogs.value)
const showViewer = computed(() => selectedMediaId.value !== null)
const activeReel = computed(() => viewerItems.value[currentIndex.value])
const hasMoreItems = computed(() => Boolean(blogNextUrl.value))

async function fetchBlogsList(page = currentPage.value, append = false) {
  listLoading.value = !append
  try {
    const response = await service.get<any>('blogs', {
      params: { page, page_size: pageSize },
    })
    blogTotalCount.value = response.data.count
    blogNextUrl.value = response.data.next || null
    blogs.value = append ? [...blogs.value, ...response.data.results] : response.data.results
    currentPage.value = page
  } catch (_err) {
    ElMessage.error('Bloglar ýüklenmedi')
  } finally {
    listLoading.value = false
  }
}

async function loadNextItem() {
  if (loadingMore.value || !hasMoreItems.value) return
  loadingMore.value = true
  try {
    await fetchBlogsList(currentPage.value + 1, true)
  } finally {
    loadingMore.value = false
  }
}

function openBlog(blogId: number) {
  router.replace({ path: '/blog', query: { item: String(blogId) } })
}

function closeViewer() {
  router.replace({ path: '/blog' })
}

function setVideoRef(el: unknown, id: number) {
  videoRefs.value[id] = el as HTMLVideoElement | null
}

function syncViewerIndex() {
  const id = selectedMediaId.value
  const index = id == null ? -1 : viewerItems.value.findIndex(item => item.id === id)
  currentIndex.value = index >= 0 ? index : 0
}

async function initMediaViewer() {
  const id = selectedMediaId.value
  if (id == null) return
  syncViewerIndex()
  await nextTick()
  if (containerRef.value) {
    containerRef.value.scrollTop = currentIndex.value * containerRef.value.clientHeight
  }
  playCurrent()
}

async function playCurrent() {
  if (!showViewer.value) return
  await nextTick()
  for (const item of viewerItems.value) {
    const video = videoRefs.value[item.id]
    if (!video) continue
    if (item.id === activeReel.value?.id) {
      const src = resolveMedia(videoSource(item))
      if (src.endsWith('.m3u8')) {
        if (Hls.isSupported()) {
          let hls = hlsInstances.value[item.id]
          if (!hls) {
            hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
            })
            hls.attachMedia(video)
            hlsInstances.value[item.id] = hls
          }
          hls.loadSource(src)
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (video.src !== src) {
            video.src = src
          }
        }
      } else {
        if (video.src !== src) {
          video.src = src
        }
      }
      try {
        video.currentTime = 0
        video.muted = muted.value
        await video.play()
      } catch (_err) {
        /* autoplay blocked */
      }
    } else {
      video.pause()
    }
  }
}

function onScroll() {
  if (!showViewer.value || !containerRef.value) return
  const el = containerRef.value
  const idx = Math.round(el.scrollTop / el.clientHeight)
  if (idx !== currentIndex.value && idx >= 0 && idx < viewerItems.value.length) {
    currentIndex.value = idx
    playCurrent()
  }
  if (currentIndex.value >= viewerItems.value.length - 1 && hasMoreItems.value) {
    loadNextItem()
  }
}

// Media resolution helpers
function resolveMedia(url?: string | null) {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url
  return baseMediaURL + url
}

function hasVideo(blog: any) {
  return blog.media?.some((m: any) => m.kind === 'video')
}

function videoSource(blog: any) {
  const videoMedia = blog.media?.find((m: any) => m.kind === 'video')
  return videoMedia ? videoMedia.url : ''
}

function imageSource(blog: any) {
  const imageMedia = blog.media?.find((m: any) => m.kind === 'image')
  return imageMedia ? imageMedia.url : blog.main_image || ''
}

function thumbSource(blog: any) {
  return blog.main_image || imageSource(blog) || ''
}

function formatDate(dateStr: string) {
  if (!dateStr) return 'Täze'
  const date = new Date(dateStr)
  return date.toLocaleDateString('tk-TM', { day: 'numeric', month: 'long', year: 'numeric' })
}

function scrollTo(idx: number) {
  if (!containerRef.value) return
  const safeIdx = Math.max(0, Math.min(idx, viewerItems.value.length - 1))
  containerRef.value.scrollTo({
    top: safeIdx * containerRef.value.clientHeight,
    behavior: 'smooth',
  })
}

async function next() {
  if (currentIndex.value >= viewerItems.value.length - 1 && hasMoreItems.value) {
    await loadNextItem()
  }
  scrollTo(currentIndex.value + 1)
}

function prev() {
  scrollTo(currentIndex.value - 1)
}

function toggleMute() {
  muted.value = !muted.value
  Object.values(videoRefs.value).forEach(video => {
    if (video) video.muted = muted.value
  })
}

function togglePlay() {
  if (!showViewer.value) return
  const video = videoRefs.value[activeReel.value?.id || 0]
  if (!video) return
  if (video.paused) video.play()
  else video.pause()
}

function onKey(e: KeyboardEvent) {
  if (!showViewer.value) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    next()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    prev()
  } else if (e.key === ' ') {
    e.preventDefault()
    togglePlay()
  } else if (e.key.toLowerCase() === 'm') {
    toggleMute()
  } else if (e.key === 'Escape') {
    closeViewer()
  }
}

onMounted(async () => {
  await fetchBlogsList(1)
  if (showViewer.value) {
    await initMediaViewer()
  }
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  Object.values(videoRefs.value).forEach(video => video?.pause())
  Object.values(hlsInstances.value).forEach(hls => hls.destroy())
  hlsInstances.value = {}
})

// Watch page ref to fetch grid pages
watch(currentPage, async (page) => {
  if (!showViewer.value) {
    await fetchBlogsList(page)
  }
})

// Watch item query param to open/close/initialize the reels viewer
watch(selectedMediaId, async (id) => {
  if (id == null) {
    Object.values(hlsInstances.value).forEach(hls => hls.destroy())
    hlsInstances.value = {}
    syncViewerIndex()
    return
  }
  await initMediaViewer()
})

const handlePageChange = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="blog-list-page pb-20">
    <section v-if="!showViewer" class="grid-view-section">
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
        <div v-if="listLoading" class="flex justify-center py-20">
          <el-skeleton :rows="5" animated />
        </div>
        
        <div v-else-if="blogs.length === 0" class="text-center py-20 bg-white rounded-3xl shadow-xl border border-gray-100">
          <el-icon class="text-6xl text-gray-200 mb-4"><Calendar /></el-icon>
          <h2 class="text-2xl font-bold text-gray-900">Häzirlikçe makala ýok</h2>
          <p class="text-gray-500">Tiz wagtdan täze gyzykly maglumatlar goşular.</p>
        </div>

        <div v-else>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <button 
              v-for="blog in blogs" 
              :key="blog.id" 
              class="blog-card group text-left cursor-pointer border-0 p-0 w-full bg-transparent"
              @click="openBlog(blog.id)"
            >
              <div class="image-wrapper w-full">
                <img :src="resolveMedia(thumbSource(blog))" :alt="blog.title" class="blog-img" />
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
            </button>
          </div>

          <!-- Pagination -->
          <div class="flex justify-center mt-16 pagination-wrapper">
            <el-pagination 
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="blogTotalCount"
              layout="prev, pager, next"
              background
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Fullscreen Reels Viewer Shell -->
    <section v-else class="viewer-shell">
      <header class="studio-topbar">
        <button class="back-btn" title="Yza gaýt" @click="closeViewer">
          <el-icon><ArrowLeft /></el-icon>
        </button>
      </header>

      <div ref="containerRef" class="reels-feed" @scroll.passive="onScroll">
        <div v-if="!viewerItems.length" class="reel-loader">
          <div class="loader-spinner" />
          <span>Ýüklenýär...</span>
        </div>
        <div
          v-for="(reel, idx) in viewerItems"
          :key="reel.id"
          class="reel-item"
        >
          <div class="reel-media" @click="togglePlay">
            <!-- Video Background if blog has video -->
            <video
              v-if="hasVideo(reel)"
              :ref="(el) => setVideoRef(el, reel.id)"
              :poster="resolveMedia(thumbSource(reel))"
              :muted="muted"
              loop
              playsinline
              preload="metadata"
              class="reel-video"
            />
            <!-- Image Background otherwise -->
            <img
              v-else
              :src="resolveMedia(imageSource(reel))"
              :alt="reel.title"
              class="reel-image"
            />
            <div v-if="idx === currentIndex" class="play-overlay" />
          </div>

          <!-- Immersive Text Overlay at the Bottom -->
          <div class="reel-info">
            <div class="author-row">
              <div class="avatar small">
                <span class="avatar-letter">D</span>
              </div>
              <div class="author-meta">
                <span class="author-name">Doganlar Blog</span>
                <span class="author-cat">{{ formatDate(reel.date) }}</span>
              </div>
            </div>
            <h2 class="reel-title">{{ reel.title }}</h2>
            <div class="reel-desc-container">
              <p class="reel-desc">{{ reel.content || 'Makala mazmuny...' }}</p>
            </div>
          </div>
        </div>
        <div v-if="viewerItems.length && loadingMore" class="reel-item reel-loader">
          <div class="loader-spinner" />
          <span>Indiki ýüklenýär...</span>
        </div>
      </div>

      <div class="nav-arrows">
        <button class="nav-arrow" :disabled="currentIndex === 0" @click="prev">
          <el-icon><CaretTop /></el-icon>
        </button>
        <button class="nav-arrow" :disabled="currentIndex >= viewerItems.length - 1 && !hasMoreItems" @click="next">
          <el-icon><CaretBottom /></el-icon>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.blog-list-page {
  animation: fadeIn 0.8s ease-out;
}

.blog-card {
  @apply bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 transition-all duration-500 flex flex-col;
  font-family: inherit;
  color: inherit;
  line-height: inherit;
  text-align: left;
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

/* Fullscreen Viewer Shell Styles */
.viewer-shell {
  position: fixed;
  inset: 0;
  z-index: 9999;
  height: 100vh;
  width: 100vw;
  background: #000;
  color: #fff;
  overflow: hidden;
}

.studio-topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0));
  pointer-events: none;
}

.studio-topbar > * {
  pointer-events: auto;
}

.back-btn {
  width: 70px;
  height: 70px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(10px);
  border-radius: 999px;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.22);
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.28);
  border-color: rgba(255, 255, 255, 0.35);
  transform: scale(1.05);
}

.back-btn:active {
  transform: scale(0.95);
}

.reels-feed {
  height: 100%;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
}

.reels-feed::-webkit-scrollbar {
  display: none;
}

.reel-item {
  position: relative;
  height: 100vh;
  width: 100%;
  scroll-snap-align: start;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reel-media {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  cursor: pointer;
}

/* Immersive background media on mobile (cover), centered and contained on desktop */
.reel-video,
.reel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

@media (min-width: 769px) {
  .reel-video,
  .reel-image {
    object-fit: contain;
  }
}

.play-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.55) 100%);
  pointer-events: none;
}

/* Full-width text overlay on mobile, padded on desktop to avoid nav-arrows */
.reel-info {
  position: absolute;
  left: 16px;
  right: 80px;
  bottom: 40px;
  z-index: 10;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
  max-width: 650px;
}

@media (min-width: 769px) {
  .reel-info {
    right: 90px;
  }
}

.author-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: linear-gradient(135deg, #dc2626, #f59e0b);
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #fff;
}

.avatar.small {
  width: 36px;
  height: 36px;
}

.avatar-letter {
  font-size: 16px;
  font-weight: 900;
}

.author-meta {
  line-height: 1.2;
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 800;
  font-size: 14px;
}

.author-cat {
  font-size: 11px;
  color: #fca5a5;
}

.reel-title {
  margin-bottom: 10px;
  font-weight: 900;
  font-size: clamp(1.25rem, 3vw, 2rem);
  line-height: 1.2;
  text-transform: uppercase;
}

.reel-desc-container {
  max-height: 25vh;
  overflow-y: auto;
  padding-right: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.reel-desc-container::-webkit-scrollbar {
  width: 4px;
}

.reel-desc-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.reel-desc {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.9;
  font-weight: 300;
}

.nav-arrows {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 25;
}

@media (min-width: 769px) {
  .nav-arrows {
    right: auto;
    left: min(calc(83% + 280px), calc(100% - 32px));
    transform: translate(-50%, -50%);
  }
}

.nav-arrow {
  width: 80px;
  height: 80px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(8px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.22);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  transition: all 0.2s ease;
}

.nav-arrow:hover {
  background: rgba(255, 255, 255, 0.28);
  border-color: rgba(255, 255, 255, 0.35);
  transform: scale(1.05);
}

.nav-arrow:active {
  transform: scale(0.95);
}

.nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.reel-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #fff;
  font-size: 13px;
  opacity: 0.85;
}

.loader-spinner {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 3px solid rgba(255, 255, 255, 0.18);
  border-top-color: #dc2626;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
