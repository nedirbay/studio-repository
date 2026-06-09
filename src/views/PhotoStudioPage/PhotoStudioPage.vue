<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  CaretTop,
  CaretBottom,
  Star,
  Share,
  VideoPause,
  VideoPlay,
  Microphone,
  ArrowLeft,
} from '@element-plus/icons-vue'
import ServiceGenerate, { baseMediaURL } from '../../utils/request'

type StudioTab = 'videos' | 'photos'
type HlsStatus = 'pending' | 'processing' | 'ready' | 'failed'

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

interface StudioMediaItem {
  id: number
  title: string
  description?: string
  thumbnail_image?: string
  thumbnail_image_url?: string | null
  video?: string
  video_url?: string | null
  hls_url?: string | null
  hls_status?: HlsStatus
  hls_error?: string
  image?: string
  image_url?: string | null
  create_at?: string
}

const route = useRoute()
const router = useRouter()
const service = ServiceGenerate()
const containerRef = ref<HTMLElement | null>(null)
const currentIndex = ref(0)
const currentListPage = ref(1)
const pageSize = 16
const videoRefs = ref<Record<number, HTMLVideoElement | null>>({})
const muted = ref(true)
const mediaItems = ref<StudioMediaItem[]>([])
const selectedMedia = ref<StudioMediaItem | null>(null)
const totalListItems = ref(0)
const listNextUrl = ref<string | null>(null)
const listLoading = ref(false)
const loadingMore = ref(false)

const activeTab = computed<StudioTab>(() => route.query.tab === 'photos' ? 'photos' : 'videos')
const activeEndpoint = computed(() => activeTab.value === 'videos' ? 'photostudio/videos/' : 'photostudio/images/')
const selectedMediaId = computed(() => {
  const raw = route.query.item
  if (typeof raw !== 'string') return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
})
const viewerItems = computed(() => mediaItems.value)
const showViewer = computed(() => selectedMediaId.value !== null)
const activeReel = computed(() => viewerItems.value[currentIndex.value] || selectedMedia.value)
const hasMoreItems = computed(() => Boolean(listNextUrl.value))

function selectTab(tab: StudioTab) {
  if (activeTab.value === tab) return
  router.replace({ path: '/studio', query: { tab } })
}

function resolveMedia(url?: string | null) {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url
  return baseMediaURL + url
}

function setVideoRef(el: unknown, id: number) {
  videoRefs.value[id] = el as HTMLVideoElement | null
}

function syncViewerIndex() {
  const id = selectedMediaId.value
  const index = id == null ? -1 : viewerItems.value.findIndex(item => item.id === id)
  currentIndex.value = index >= 0 ? index : 0
}

async function fetchMediaList(page = currentListPage.value, append = false) {
  listLoading.value = !append
  try {
    const response = await service.get<PaginatedResponse<StudioMediaItem>>(activeEndpoint.value, {
      params: { page, page_size: pageSize },
    })
    totalListItems.value = response.data.count
    listNextUrl.value = response.data.next
    mediaItems.value = append ? [...mediaItems.value, ...response.data.results] : response.data.results
    currentListPage.value = page
  } catch (_err) {
    ElMessage.error('Media sanawy ýüklenmedi')
  } finally {
    listLoading.value = false
  }
}

async function fetchMediaDetail(id: number) {
  const response = await service.get<StudioMediaItem>(`${activeEndpoint.value}${id}/`)
  selectedMedia.value = response.data
  const index = mediaItems.value.findIndex(item => item.id === id)
  if (index >= 0) {
    mediaItems.value[index] = response.data
  } else {
    mediaItems.value = [response.data, ...mediaItems.value]
  }
}

async function loadNextItem() {
  if (loadingMore.value || !hasMoreItems.value) return
  loadingMore.value = true
  try {
    await fetchMediaList(currentListPage.value + 1, true)
  } finally {
    loadingMore.value = false
  }
}

async function initMediaViewer() {
  const id = selectedMediaId.value
  if (id == null) return
  await fetchMediaDetail(id)
  syncViewerIndex()
  await nextTick()
  if (containerRef.value) {
    containerRef.value.scrollTop = currentIndex.value * containerRef.value.clientHeight
  }
  playCurrent()
}

async function playCurrent() {
  if (!showViewer.value || activeTab.value !== 'videos') return
  await nextTick()
  for (const item of viewerItems.value) {
    const video = videoRefs.value[item.id]
    if (!video) continue
    if (item.id === activeReel.value?.id) {
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
  if (!showViewer.value || activeTab.value !== 'videos') return
  const video = videoRefs.value[activeReel.value?.id || 0]
  if (!video) return
  if (video.paused) video.play()
  else video.pause()
}

async function share() {
  const item = activeReel.value
  if (!item) return
  const shareUrl = window.location.origin + `/studio?tab=${activeTab.value}&item=${item.id}`
  const nativeShareAvailable = typeof navigator.share === 'function'
  try {
    if (nativeShareAvailable) {
      await navigator.share({ title: item.title || 'Doganlar Studio', url: shareUrl })
    } else {
      await navigator.clipboard.writeText(shareUrl)
      ElMessage.success('Link kopirlendi')
    }
  } catch (_e) {
    /* ignore */
  }
}

function openMedia(itemId: number) {
  router.replace({ path: '/studio', query: { tab: activeTab.value, item: String(itemId) } })
}

function closeViewer() {
  selectedMedia.value = null
  router.replace({ path: '/studio', query: { tab: activeTab.value } })
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

function videoSource(item: StudioMediaItem) {
  if (item.hls_status === 'ready' && item.hls_url) return item.hls_url
  return item.video_url || item.video || ''
}

function imageSource(item: StudioMediaItem) {
  return item.image_url || item.image || item.thumbnail_image_url || item.thumbnail_image || ''
}

function thumbSource(item: StudioMediaItem) {
  return item.thumbnail_image_url || item.thumbnail_image || imageSource(item)
}

onMounted(async () => {
  await fetchMediaList(1)
  if (showViewer.value) {
    await initMediaViewer()
  }
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  Object.values(videoRefs.value).forEach(video => video?.pause())
})

watch(activeTab, async () => {
  currentListPage.value = 1
  selectedMedia.value = null
  await fetchMediaList(1)
})

watch(currentListPage, async (page) => {
  if (!showViewer.value) {
    await fetchMediaList(page)
  }
})

watch(selectedMediaId, async (id) => {
  if (id == null) {
    syncViewerIndex()
    return
  }
  await initMediaViewer()
})

</script>

<template>
  <div class="studio-page">
    <section v-if="!showViewer" class="studio-listing">
      <div class="listing-head">
        <p class="eyebrow">Doganlar FotoStudio</p>
        <div class="studio-tabs">
          <button
            class="studio-tab"
            :class="{ active: activeTab === 'videos' }"
            @click="selectTab('videos')"
          >
            Wideolar
          </button>
          <button
            class="studio-tab"
            :class="{ active: activeTab === 'photos' }"
            @click="selectTab('photos')"
          >
            Suratlar
          </button>
        </div>
        <h1 class="listing-title">{{ activeTab === 'videos' ? 'Wideolar' : 'Suratlar' }}</h1>
        <p class="listing-subtitle">
          {{ activeTab === 'videos'
            ? 'Wideolary saýlap uly ekranda görmek we öňki/indiki wideolara geçmek bolýar.'
            : 'Suratlary saýlap uly ekranda görmek we öňki/indiki surata geçmek bolýar.' }}
        </p>
      </div>

      <div class="media-grid">
        <button
          v-for="item in mediaItems"
          :key="item.id"
          class="media-card"
          @click="openMedia(item.id)"
        >
          <div class="media-thumb">
            <img
              :src="resolveMedia(thumbSource(item))"
              :alt="item.title"
              class="media-preview"
            />
            <div class="media-overlay">
              <span class="play-chip">{{ activeTab === 'videos' ? 'Wideo' : 'Surat' }}</span>
            </div>
          </div>
          <div class="media-meta">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description || 'Studio media' }}</p>
            <div class="meta-row">
              <span>{{ activeTab === 'videos' ? 'Video' : 'Image' }}</span>
              <span v-if="activeTab === 'videos' && item.hls_status">{{ item.hls_status }}</span>
              <span v-else>{{ item.create_at ? new Date(item.create_at).toLocaleDateString() : 'Täze' }}</span>
            </div>
          </div>
        </button>
        <div v-if="listLoading" class="empty-state light">
          <p>Ýüklenýär...</p>
        </div>
        <div v-else-if="!mediaItems.length" class="empty-state light">
          <p>{{ activeTab === 'videos' ? 'Häzirlikçe wideo ýok' : 'Häzirlikçe surat ýok' }}</p>
        </div>
      </div>

      <div v-if="totalListItems > pageSize && !listLoading" class="pagination-wrap">
        <el-pagination
          v-model:current-page="currentListPage"
          :page-size="pageSize"
          layout="prev, pager, next"
          :total="totalListItems"
          background
        />
      </div>
    </section>

    <section v-else class="viewer-shell">
      <header class="studio-topbar">
        <button class="back-btn" title="Yza gaýt" @click="closeViewer">
          <el-icon><ArrowLeft /></el-icon>
        </button>
        <div class="studio-title">
          <span class="brand">{{ activeReel?.title }}</span>
          <span class="brand-sub">{{ activeTab === 'videos' ? 'Video Collection' : 'Photo Collection' }}</span>
        </div>
        <button v-if="activeTab === 'videos'" class="mute-btn" @click="toggleMute" :title="muted ? 'Sesi aç' : 'Sesi öçür'">
          <el-icon><Microphone v-if="!muted" /><VideoPause v-else /></el-icon>
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
            <video
              v-if="activeTab === 'videos'"
              :ref="(el) => setVideoRef(el, reel.id)"
              :src="resolveMedia(videoSource(reel))"
              :poster="resolveMedia(thumbSource(reel))"
              :muted="muted"
              loop
              playsinline
              preload="metadata"
              class="reel-video"
            />
            <img
              v-else
              :src="resolveMedia(imageSource(reel))"
              :alt="reel.title"
              class="reel-image"
            />
            <div v-if="idx === currentIndex" class="play-overlay" />
          </div>

          <aside class="reel-actions">
            <button class="action-btn" @click="share">
              <div class="icon-circle">
                <el-icon><Share /></el-icon>
              </div>
              <span class="count">Paýlaş</span>
            </button>

            <button v-if="activeTab === 'videos'" class="action-btn" @click="toggleMute">
              <div class="icon-circle">
                <el-icon><VideoPlay v-if="muted" /><Microphone v-else /></el-icon>
              </div>
            </button>

            <button class="action-btn" disabled>
              <div class="icon-circle">
                <el-icon><Star /></el-icon>
              </div>
            </button>
          </aside>

          <div class="reel-info">
            <div class="author-row">
              <div class="avatar">
                <span>{{ (reel.title || 'D')[0].toUpperCase() }}</span>
              </div>
              <div class="author-meta">
                <div class="author-name">@doganlar_studio</div>
                <div class="author-cat">{{ activeTab === 'videos' ? 'Video' : 'Surat' }}</div>
              </div>
            </div>
            <h3 v-if="reel.title" class="reel-title">{{ reel.title }}</h3>
            <p v-if="reel.description" class="reel-desc">{{ reel.description }}</p>
            <div v-if="activeTab === 'videos' && reel.hls_status" class="reel-tags">
              <span>#{{ reel.hls_status }}</span>
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
.studio-page {
  min-height: calc(100vh - 144px);
  background:
    radial-gradient(circle at top left, rgba(220, 38, 38, 0.08), transparent 28%),
    linear-gradient(180deg, #fff 0%, #fff7ed 100%);
  color: #0f172a;
}
.studio-listing {
  max-width: 1360px;
  margin: 0 auto;
  padding: 32px 16px 56px;
}
.listing-head { margin-bottom: 28px; }
.eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #dc2626;
}
.studio-tabs {
  display: inline-flex;
  gap: 4px;
  margin: 0 0 16px;
  padding: 4px;
  background: #f1f5f9;
  border-radius: 12px;
}
.studio-tab {
  border: none;
  background: transparent;
  padding: 8px 20px;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}
.studio-tab:hover {
  color: #dc2626;
}
.studio-tab.active {
  background: #dc2626;
  color: #fff;
  box-shadow: 0 2px 6px rgba(220, 38, 38, 0.25);
}
.listing-title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.5rem);
  line-height: 1;
  font-weight: 900;
  color: #111827;
}
.listing-subtitle {
  margin: 12px 0 0;
  max-width: 760px;
  color: #475569;
  font-size: 1rem;
}
.media-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}
.media-card {
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  padding: 0;
  text-align: left;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.media-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 60px rgba(220, 38, 38, 0.14);
}
.media-thumb {
  position: relative;
  aspect-ratio: 5 / 4;
  background: #0f172a;
}
.media-preview,
.reel-video,
.reel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.media-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 18px;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.08));
}
.play-chip {
  display: inline-flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #111827;
  font-size: 13px;
  font-weight: 800;
}
.media-meta {
  padding: 18px 18px 20px;
  min-height: 152px;
  display: flex;
  flex-direction: column;
}
.media-meta h3 {
  margin: 0 0 8px;
  font-size: 1.1rem;
  font-weight: 800;
  color: #111827;
}
.media-meta p {
  margin: 0 0 12px;
  color: #475569;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #64748b;
  font-size: 0.9rem;
  margin-top: auto;
}
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
:deep(.pagination-wrap .el-pagination.is-background .btn-next),
:deep(.pagination-wrap .el-pagination.is-background .btn-prev),
:deep(.pagination-wrap .el-pagination.is-background .el-pager li) {
  min-width: 40px;
  height: 40px;
  border-radius: 999px;
  font-weight: 700;
}
:deep(.pagination-wrap .el-pagination.is-background .el-pager li.is-active) {
  background-color: #dc2626;
}
.viewer-shell {
  position: relative;
  height: calc(100vh - 144px);
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
.studio-topbar > * { pointer-events: auto; }
.back-btn,
.mute-btn {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border-radius: 999px;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
}
.studio-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}
.studio-title .brand { font-size: 14px; font-weight: 900; letter-spacing: 0.05em; }
.studio-title .brand-sub {
  margin-top: 4px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #ef4444;
}
.reels-feed {
  height: 100%;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
}
.reels-feed::-webkit-scrollbar { display: none; }
.reel-item {
  position: relative;
  height: calc(100vh - 144px);
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
.play-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.55) 100%);
  pointer-events: none;
}
.reel-actions {
  position: absolute;
  right: 14px;
  bottom: 110px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 22px;
  align-items: center;
}
.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
}
.icon-circle {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}
.icon-circle.liked {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: #fff;
}
.count { font-weight: 700; }
.reel-info {
  position: absolute;
  left: 16px;
  right: 90px;
  bottom: 28px;
  z-index: 10;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}
.author-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
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
  font-size: 18px;
  color: #fff;
  overflow: hidden;
}
.avatar.small { width: 36px; height: 36px; font-size: 14px; }
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.author-meta { line-height: 1.2; }
.author-name { font-weight: 800; font-size: 15px; }
.author-cat { font-size: 12px; color: #fca5a5; }
.reel-title { margin-bottom: 6px; font-weight: 700; font-size: 17px; }
.reel-desc { margin-bottom: 8px; font-size: 13px; opacity: 0.95; }
.reel-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.reel-tags span { color: #fca5a5; font-size: 13px; font-weight: 600; }
.reel-music {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 13px;
  background: rgba(0, 0, 0, 0.4);
  padding: 6px 12px;
  border-radius: 999px;
  width: fit-content;
  max-width: 100%;
  overflow: hidden;
}
.music-marquee { white-space: nowrap; }
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
.nav-arrow {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.nav-arrow:disabled { opacity: 0.3; cursor: not-allowed; }
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
.empty-state.light {
  min-height: 260px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px dashed rgba(148, 163, 184, 0.4);
  border-radius: 24px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
}
.comments-drawer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  height: 60vh;
  max-height: 600px;
  background: #18181b;
  border-radius: 18px 18px 0 0;
  display: flex;
  flex-direction: column;
}
.comments-header {
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: none;
  cursor: pointer;
}
.comments-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}
.comments-empty { color: #9ca3af; text-align: center; margin-top: 60px; }
.comment-item { display: flex; gap: 10px; padding: 10px 0; }
.bubble {
  background: rgba(255, 255, 255, 0.06);
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 80%;
}
.bubble .name { font-weight: 700; font-size: 13px; color: #fca5a5; }
.bubble .text { font-size: 14px; margin-top: 2px; }
.comments-input {
  padding: 12px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: 8px;
}
.comments-input input {
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 14px;
  outline: none;
}
.comments-input button {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 0 18px;
  font-weight: 700;
  cursor: pointer;
}
.slide-up-enter-active,
.slide-up-leave-active { transition: transform 0.3s ease; }
.slide-up-enter-from,
.slide-up-leave-to { transform: translateY(100%); }
@media (max-width: 1279px) {
  .media-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 1023px) {
  .media-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 768px) {
  .studio-page { min-height: calc(100vh - 128px); }
  .viewer-shell,
  .reel-item { height: calc(100vh - 128px); }
  .nav-arrows { display: none; }
  .media-grid { grid-template-columns: 1fr; }
}
</style>
