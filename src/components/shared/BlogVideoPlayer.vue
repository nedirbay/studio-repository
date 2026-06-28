<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { VideoPlay, VideoPause, Mute, Bell, FullScreen } from '@element-plus/icons-vue'

defineProps<{
  src: string
  poster?: string
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const volume = ref(1.0)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)
const showControls = ref(true)
let controlsTimeout: number | null = null

const togglePlay = () => {
  if (!videoRef.value) return
  if (isPlaying.value) {
    videoRef.value.pause()
  } else {
    videoRef.value.play()
  }
}

const toggleMute = () => {
  if (!videoRef.value) return
  isMuted.value = !isMuted.value
  videoRef.value.muted = isMuted.value
}

const handleVolumeChange = (val: number) => {
  if (!videoRef.value) return
  volume.value = val
  videoRef.value.volume = val
  if (val === 0) {
    isMuted.value = true
    videoRef.value.muted = true
  } else {
    isMuted.value = false
    videoRef.value.muted = false
  }
}

const handleTimeUpdate = () => {
  if (!videoRef.value) return
  currentTime.value = videoRef.value.currentTime
  if (duration.value > 0) {
    progress.value = (currentTime.value / duration.value) * 100
  }
}

const handleLoadedMetadata = () => {
  if (!videoRef.value) return
  duration.value = videoRef.value.duration
}

const handleSeek = (val: number) => {
  if (!videoRef.value) return
  const seekTime = (val / 100) * duration.value
  videoRef.value.currentTime = seekTime
  currentTime.value = seekTime
}

const handlePlay = () => {
  isPlaying.value = true
}

const handlePause = () => {
  isPlaying.value = false
}

const toggleFullscreen = () => {
  if (!videoRef.value) return
  if (videoRef.value.requestFullscreen) {
    videoRef.value.requestFullscreen()
  } else if ((videoRef.value as any).webkitRequestFullscreen) {
    (videoRef.value as any).webkitRequestFullscreen()
  } else if ((videoRef.value as any).msRequestFullscreen) {
    (videoRef.value as any).msRequestFullscreen()
  }
}

const formatTime = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds)) return '0:00'
  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = Math.floor(timeInSeconds % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

const triggerControls = () => {
  showControls.value = true
  if (controlsTimeout) {
    clearTimeout(controlsTimeout)
  }
  controlsTimeout = window.setTimeout(() => {
    if (isPlaying.value) {
      showControls.value = false
    }
  }, 3000)
}

onMounted(() => {
  triggerControls()
})

onBeforeUnmount(() => {
  if (controlsTimeout) clearTimeout(controlsTimeout)
})
</script>

<template>
  <div 
    class="relative w-full h-full bg-black group overflow-hidden rounded-2xl aspect-video select-none"
    @mousemove="triggerControls"
    @mouseleave="showControls = false"
  >
    <video
      ref="videoRef"
      :src="src"
      :poster="poster"
      class="w-full h-full object-contain"
      playsinline
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @play="handlePlay"
      @pause="handlePause"
      @click="togglePlay"
    ></video>

    <!-- Controls Overlay -->
    <div 
      class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30 flex flex-col justify-between p-4 transition-opacity duration-300 pointer-events-none"
      :class="{ 'opacity-100': showControls, 'opacity-0': !showControls }"
    >
      <!-- Top header / badge -->
      <div class="flex justify-between items-center pointer-events-auto">
        <span class="text-xs font-bold text-white/80 bg-red-600/90 px-3 py-1 rounded-lg">Wideo</span>
      </div>

      <!-- Play center button -->
      <div class="flex justify-center items-center pointer-events-auto">
        <button 
          @click="togglePlay" 
          class="w-14 h-14 rounded-full bg-white/20 hover:bg-white/40 border border-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all transform hover:scale-105 active:scale-95"
        >
          <el-icon class="text-2xl">
            <VideoPause v-if="isPlaying" />
            <VideoPlay v-else />
          </el-icon>
        </button>
      </div>

      <!-- Bottom controls bar -->
      <div class="flex flex-col gap-2 pointer-events-auto w-full">
        <!-- Progress bar -->
        <div class="flex items-center gap-3 w-full">
          <span class="text-[10px] font-bold text-white/90 font-mono shrink-0">{{ formatTime(currentTime) }}</span>
          <el-slider 
            v-model="progress" 
            :show-tooltip="false" 
            @input="handleSeek"
            class="flex-1 !height-1 video-progress"
          />
          <span class="text-[10px] font-bold text-white/90 font-mono shrink-0">{{ formatTime(duration) }}</span>
        </div>

        <!-- Volume, Mute, Fullscreen, Play/Pause -->
        <div class="flex justify-between items-center mt-1">
          <div class="flex items-center gap-4">
            <button @click="togglePlay" class="text-white/80 hover:text-white transition-colors">
              <el-icon class="text-lg">
                <VideoPause v-if="isPlaying" />
                <VideoPlay v-else />
              </el-icon>
            </button>

            <!-- Volume / Mute Controls -->
            <div class="flex items-center gap-2 group/volume">
              <button @click="toggleMute" class="text-white/80 hover:text-white transition-colors">
                <el-icon class="text-lg">
                  <Mute v-if="isMuted" />
                  <Bell v-else />
                </el-icon>
              </button>
              <el-slider
                :model-value="isMuted ? 0 : volume"
                :min="0"
                :max="1"
                :step="0.05"
                :show-tooltip="false"
                @input="handleVolumeChange"
                class="w-16 md:w-20 transition-all video-volume-slider"
              />
            </div>
          </div>

          <button @click="toggleFullscreen" class="text-white/80 hover:text-white transition-colors">
            <el-icon class="text-lg"><FullScreen /></el-icon>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.video-progress .el-slider__runway) {
  background-color: rgba(255, 255, 255, 0.2) !important;
  height: 4px !important;
}
:deep(.video-progress .el-slider__bar) {
  background-color: #dc2626 !important;
  height: 4px !important;
}
:deep(.video-progress .el-slider__button) {
  width: 10px !important;
  height: 10px !important;
  background-color: #fff !important;
  border: 2px solid #dc2626 !important;
}

:deep(.video-volume-slider .el-slider__runway) {
  background-color: rgba(255, 255, 255, 0.2) !important;
  height: 3px !important;
}
:deep(.video-volume-slider .el-slider__bar) {
  background-color: #fff !important;
  height: 3px !important;
}
:deep(.video-volume-slider .el-slider__button) {
  width: 8px !important;
  height: 8px !important;
  background-color: #fff !important;
  border: none !important;
}
</style>
