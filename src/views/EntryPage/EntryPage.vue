<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ShoppingBag, VideoCamera, Present } from '@element-plus/icons-vue'

const router = useRouter()

interface Section {
  key: 'shop' | 'studio' | 'gifts'
  label: string
  description: string
  icon: any
  route: string
  gradient: string
  accent: string
  highlight: string
}

const sections: Section[] = [
  {
    key: 'shop',
    label: 'Harytlar',
    description: 'Fotoapparatlar, wideokameralar, obýektiwler, yşyklar we ähli zerur aksessuarlar',
    icon: ShoppingBag,
    route: '/home',
    gradient: 'from-red-600 via-red-500 to-orange-500',
    accent: '#dc2626',
    highlight: 'Söwda et',
  },
  {
    key: 'studio',
    label: 'FotoStudio',
    description: 'Studiomyzda alynýan suratlary we wideolary janly görnüşde tomaşa et',
    icon: VideoCamera,
    route: '/studio',
    gradient: 'from-slate-900 via-gray-800 to-red-700',
    accent: '#0f172a',
    highlight: 'Reels seret',
  },
  {
    key: 'gifts',
    label: 'Sowgatlar',
    description: 'Bäsleşikler, aksiýalar we gymmat bahaly sowgatlar üçin goşulyň',
    icon: Present,
    route: '/gifts',
    gradient: 'from-amber-500 via-red-500 to-rose-600',
    accent: '#f59e0b',
    highlight: 'Sowgat al',
  },
]

function go(section: Section) {
  localStorage.setItem('preferred_section', section.key)
  router.push(section.route)
}
</script>

<template>
  <div class="entry-page">
    <div class="bg-grid" />
    <div class="bg-blob blob-1" />
    <div class="bg-blob blob-2" />
    <div class="bg-blob blob-3" />

    <div class="relative z-10 max-w-7xl mx-auto px-4 py-10 md:py-16 flex flex-col min-h-screen">
      <header class="text-center mb-10 md:mb-16">
        <div class="inline-flex flex-col items-center">
          <div class="flex items-baseline gap-2 mb-4">
            <span class="text-xl md:text-3xl font-black text-red-600 tracking-[0.2em] uppercase">Doganlar</span>
            <span class="text-xs md:text-sm font-bold text-slate-400 tracking-[0.15em] uppercase">foto merkezi</span>
          </div>
          <h1 class="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
            Hoş geldiňiz
          </h1>
          <p class="mt-4 text-base md:text-lg text-slate-600 max-w-2xl">
            Doganlar foto merkezinde harytlar, fotostudio we sowgatlar bölümlerinden birini saýlaň
          </p>
        </div>
      </header>

      <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <button
          v-for="section in sections"
          :key="section.key"
          @click="go(section)"
          class="section-card group"
        >
          <div class="absolute inset-0 bg-gradient-to-br opacity-90 transition-opacity group-hover:opacity-100"
               :class="section.gradient" />
          <div class="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition" />

          <div class="relative h-full p-6 md:p-8 flex flex-col justify-between text-left">
            <div>
              <div class="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-6 ring-1 ring-white/20 transition-transform group-hover:scale-110 group-hover:rotate-3">
                <el-icon class="text-white text-4xl md:text-5xl">
                  <component :is="section.icon" />
                </el-icon>
              </div>
              <h2 class="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
                {{ section.label }}
              </h2>
              <p class="text-sm md:text-base text-white/85 leading-relaxed max-w-xs">
                {{ section.description }}
              </p>
            </div>

            <div class="mt-8 inline-flex items-center gap-2 self-start bg-white text-gray-900 font-bold px-5 py-2.5 rounded-full text-sm md:text-base shadow-lg transition group-hover:translate-x-1">
              {{ section.highlight }}
              <span class="inline-block">→</span>
            </div>
          </div>
        </button>
      </div>

      <footer class="mt-12 text-center text-slate-500 text-xs md:text-sm">
        © {{ new Date().getFullYear() }} Doganlar foto merkezi. Ähli hukuklar goragly.
      </footer>
    </div>
  </div>
</template>

<style scoped>
.entry-page {
  position: relative;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(220, 38, 38, 0.12), transparent 32%),
    radial-gradient(circle at bottom right, rgba(245, 158, 11, 0.16), transparent 30%),
    linear-gradient(180deg, #ffffff 0%, #fff7ed 100%);
  overflow: hidden;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.12) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
  pointer-events: none;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.4;
  pointer-events: none;
}
.blob-1 { width: 480px; height: 480px; background: #dc2626; top: -120px; left: -80px; }
.blob-2 { width: 520px; height: 520px; background: #f59e0b; bottom: -140px; right: -100px; }
.blob-3 { width: 380px; height: 380px; background: #fed7aa; top: 30%; left: 45%; opacity: 0.3; }

.section-card {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  min-height: 380px;
  cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.4s ease;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  text-align: left;
  background: #111;
}

.section-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 0 30px 80px rgba(220, 38, 38, 0.35);
}

.section-card:focus-visible {
  outline: 2px solid #dc2626;
  outline-offset: 4px;
}

@media (max-width: 768px) {
  .section-card { min-height: 260px; }
}
</style>
