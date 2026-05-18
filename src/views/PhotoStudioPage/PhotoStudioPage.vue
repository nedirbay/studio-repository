<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  CaretTop,
  CaretBottom,
  Star,
  StarFilled,
  ChatDotRound,
  Share,
  VideoPause,
  VideoPlay,
  Microphone,
  ArrowLeft,
  Promotion,
} from '@element-plus/icons-vue'
import { store, photoStudioActions } from '../../store'
import type { PhotoCollection, PhotoReel } from '../../types'
import { baseMediaURL } from '../../utils/request'

const route = useRoute()
const router = useRouter()
const containerRef = ref<HTMLElement | null>(null)
const currentIndex = ref(0)
const currentListPage = ref(1)
const pageSize = 16
const videoRefs = ref<Record<number, HTMLVideoElement | null>>({})
const muted = ref(true)
const showComments = ref(false)
const commentText = ref('')
const sendingComment = ref(false)
const loadingMore = ref(false)

const activeTab = computed<'videos' | 'photos'>(() => route.query.tab === 'photos' ? 'photos' : 'videos')
const activeKind = computed<'video' | 'image'>(() => activeTab.value === 'videos' ? 'video' : 'image')
const selectedCollectionId = computed(() => {
  const raw = route.query.collection
  if (typeof raw !== 'string') return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
})
const collections = computed(() => store.studioCollections.filter(item => item.kind === activeKind.value))
const totalListItems = computed(() => collections.value.length)
const paginatedCollections = computed(() => {
  const start = (currentListPage.value - 1) * pageSize
  return collections.value.slice(start, start + pageSize)
})
const activeCollection = computed<PhotoCollection | null>(() =>
  collections.value.find(item => item.id === selectedCollectionId.value) || null
)
const viewerItems = computed<PhotoReel[]>(() => activeCollection.value?.items || [])
const showViewer = computed(() => activeCollection.value !== null)
const activeReel = computed(() => viewerItems.value[currentIndex.value])
const hasMoreItems = computed(() => {
  const col = activeCollection.value
  if (!col) return false
  return col.items.length < (col.items_count || 0)
})

function resolveMedia(url?: string) {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url
  return baseMediaURL + url
}

function setVideoRef(el: unknown, id: number) {
  videoRefs.value[id] = el as HTMLVideoElement | null
}

function syncViewerIndex() {
  currentIndex.value = 0
}

async function loadNextItem() {
  const collection = activeCollection.value
  if (!collection) return
  if (loadingMore.value) return
  if (!hasMoreItems.value) return
  loadingMore.value = true
  try {
    await photoStudioActions.fetchCollectionItem(collection.id, collection.items.length, 1)
  } finally {
    loadingMore.value = false
  }
}

async function initCollectionViewer() {
  const id = selectedCollectionId.value
  if (id == null) return
  photoStudioActions.resetCollectionItems(id)
  syncViewerIndex()
  await photoStudioActions.fetchCollectionItem(id, 0, 1)
  await nextTick()
  if (containerRef.value) containerRef.value.scrollTop = 0
  playCurrent()
  if (hasMoreItems.value) loadNextItem()
}

async function playCurrent() {
  if (!showViewer.value || activeTab.value !== 'videos') return
  await nextTick()
  for (const reel of viewerItems.value) {
    const video = videoRefs.value[reel.id]
    if (!video) continue
    if (reel.id === activeReel.value?.id) {
      try {
        video.currentTime = 0
        video.muted = muted.value
        await video.play()
        photoStudioActions.registerView(reel.id)
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
  const video = videoRefs.value[activeReel.value?.id]
  if (!video) return
  if (video.paused) video.play()
  else video.pause()
}

async function toggleLike() {
  const reel = activeReel.value
  if (!reel) return
  if (!store.isAuthenticated) {
    ElMessage.warning('Like üçin ulgama giriň')
    return
  }
  await photoStudioActions.toggleLike(reel.id)
}

async function openComments() {
  showComments.value = true
  if (activeReel.value) {
    await photoStudioActions.fetchComments(activeReel.value.id)
  }
}

async function submitComment() {
  if (!commentText.value.trim() || !activeReel.value) return
  if (!store.isAuthenticated) {
    ElMessage.warning('Teswir ýazmak üçin ulgama giriň')
    return
  }
  sendingComment.value = true
  try {
    await photoStudioActions.addComment(activeReel.value.id, commentText.value.trim())
    commentText.value = ''
  } finally {
    sendingComment.value = false
  }
}

async function share() {
  const reel = activeReel.value
  if (!reel) return
  const shareUrl = window.location.origin + `/studio?tab=${activeTab.value}&collection=${activeCollection.value?.id}`
  const nativeShareAvailable = typeof navigator.share === 'function'
  try {
    if (nativeShareAvailable) {
      await navigator.share({ title: activeCollection.value?.title || 'Doganlar Studio', url: shareUrl })
    } else {
      await navigator.clipboard.writeText(shareUrl)
      ElMessage.success('Link kopirlendi')
    }
    photoStudioActions.shareReel(reel.id, nativeShareAvailable ? 'native' : 'clipboard')
  } catch (_e) {
    /* ignore */
  }
}

function openCollection(collectionId: number) {
  router.replace({ path: '/studio', query: { tab: activeTab.value, collection: String(collectionId) } })
}

function closeViewer() {
  showComments.value = false
  router.replace({ path: '/studio', query: { tab: activeTab.value } })
}

function onKey(e: KeyboardEvent) {
  if (!showViewer.value || showComments.value) return
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
  } else if (e.key.toLowerCase() === 'l') {
    toggleLike()
  } else if (e.key === 'Escape') {
    closeViewer()
  }
}

async function loadCollections() {
  await photoStudioActions.fetchCollections(activeKind.value)
}

onMounted(async () => {
  await loadCollections()
  if (showViewer.value) {
    await initCollectionViewer()
  }
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  Object.values(videoRefs.value).forEach(video => video?.pause())
})

watch(activeTab, async () => {
  currentListPage.value = 1
  await loadCollections()
})

watch(selectedCollectionId, async (id) => {
  if (id == null) {
    syncViewerIndex()
    return
  }
  await initCollectionViewer()
})

watch(currentIndex, () => {
  if (showComments.value) showComments.value = false
})

</script>

<template>
  <div class="studio-page">
    <section v-if="!showViewer" class="studio-listing">
      <div class="listing-head">
        <p class="eyebrow">Doganlar FotoStudio</p>
        <h1 class="listing-title">{{ activeTab === 'videos' ? 'Wideolar' : 'Suratlar' }}</h1>
        <p class="listing-subtitle">
          {{ activeTab === 'videos'
            ? 'Her kart bir bölüm. Içine girip şol bölümdäki ähli wideolary görmek bolýar.'
            : 'Her kart bir albom. Içine girip şol albomdaky ähli suratlary görmek bolýar.' }}
        </p>
      </div>

      <div class="media-grid">
        <button
          v-for="collection in paginatedCollections"
          :key="collection.id"
          class="media-card"
          @click="openCollection(collection.id)"
        >
          <div class="media-thumb">
            <img
              :src="resolveMedia(collection.cover_url || collection.items[0]?.thumbnail_url || collection.items[0]?.media_url)"
              :alt="collection.title"
              class="media-preview"
            />
            <div class="media-overlay">
              <span class="play-chip">{{ collection.items_count }} element</span>
            </div>
          </div>
          <div class="media-meta">
            <h3>{{ collection.title }}</h3>
            <p>{{ collection.description || 'Studio bölümi' }}</p>
            <div class="meta-row">
              <span v-if="collection.category_name">{{ collection.category_name }}</span>
              <span>{{ collection.items_count }} media</span>
            </div>
          </div>
        </button>
        <div v-if="!collections.length" class="empty-state light">
          <p>{{ activeTab === 'videos' ? 'Häzirlikçe bölüm ýok' : 'Häzirlikçe albom ýok' }}</p>
        </div>
      </div>

      <div v-if="totalListItems > pageSize" class="pagination-wrap">
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
          <span class="brand">{{ activeCollection?.title }}</span>
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
              :src="resolveMedia(reel.stream_url || reel.media_url)"
              :poster="resolveMedia(reel.thumbnail_url)"
              :muted="muted"
              loop
              playsinline
              preload="metadata"
              class="reel-video"
            />
            <img
              v-else
              :src="resolveMedia(reel.media_url)"
              :alt="reel.title"
              class="reel-image"
            />
            <div v-if="idx === currentIndex" class="play-overlay" />
          </div>

          <aside class="reel-actions">
            <button class="action-btn" @click="toggleLike">
              <div class="icon-circle" :class="{ liked: reel.liked_by_me }">
                <el-icon>
                  <StarFilled v-if="reel.liked_by_me" />
                  <Star v-else />
                </el-icon>
              </div>
              <span class="count">{{ reel.likes_count || 0 }}</span>
            </button>

            <button class="action-btn" @click="openComments">
              <div class="icon-circle">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <span class="count">{{ reel.comments_count || 0 }}</span>
            </button>

            <button class="action-btn" @click="share">
              <div class="icon-circle">
                <el-icon><Share /></el-icon>
              </div>
              <span class="count">{{ reel.shares_count || 0 }}</span>
            </button>

            <button v-if="activeTab === 'videos'" class="action-btn" @click="toggleMute">
              <div class="icon-circle">
                <el-icon><VideoPlay v-if="muted" /><Microphone v-else /></el-icon>
              </div>
            </button>
          </aside>

          <div class="reel-info">
            <div class="author-row">
              <div class="avatar">
                <img v-if="reel.author_avatar" :src="resolveMedia(reel.author_avatar)" />
                <span v-else>{{ (reel.author_name || 'D')[0].toUpperCase() }}</span>
              </div>
              <div class="author-meta">
                <div class="author-name">@{{ reel.author_name || 'doganlar_studio' }}</div>
                <div v-if="reel.category_name" class="author-cat">{{ reel.category_name }}</div>
              </div>
            </div>
            <h3 v-if="reel.title" class="reel-title">{{ reel.title }}</h3>
            <p v-if="reel.description" class="reel-desc">{{ reel.description }}</p>
            <div v-if="reel.tags?.length" class="reel-tags">
              <span v-for="t in reel.tags" :key="t.id">#{{ t.name }}</span>
            </div>
            <div v-if="reel.music_title" class="reel-music">
              <el-icon><Promotion /></el-icon>
              <span class="music-marquee">{{ reel.music_title }}</span>
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

      <transition name="slide-up">
        <div v-if="showComments" class="comments-drawer">
          <header class="comments-header">
            <div class="title">{{ store.studioComments.length }} teswir</div>
            <button class="close-btn" @click="showComments = false">
              <span>×</span>
            </button>
          </header>
          <div class="comments-list">
            <div v-if="!store.studioComments.length" class="comments-empty">
              Henizçe teswir ýok. Ilki teswir ýazyň!
            </div>
            <div v-for="c in store.studioComments" :key="c.id" class="comment-item">
              <div class="avatar small">{{ (c.user_name || 'U')[0].toUpperCase() }}</div>
              <div class="bubble">
                <div class="name">{{ c.user_name }}</div>
                <div class="text">{{ c.text }}</div>
              </div>
            </div>
          </div>
          <footer class="comments-input">
            <input v-model="commentText" placeholder="Teswir ýazyň..." @keyup.enter="submitComment" />
            <button :disabled="sendingComment || !commentText.trim()" @click="submitComment">Iber</button>
          </footer>
        </div>
      </transition>
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
