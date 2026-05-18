<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Present,
  Trophy,
  PriceTag,
  Timer,
  CircleCheck,
  Close,
  Promotion,
} from '@element-plus/icons-vue'
import { store, giftsActions } from '../../store'
import { baseMediaURL } from '../../utils/request'

const activeTab = ref<'all' | 'giveaway' | 'promotion' | 'gift'>('all')
const showJoinModal = ref(false)
const selectedId = ref<number | null>(null)
const submitting = ref(false)

const form = ref({
  full_name: '',
  phone: '',
  email: '',
  note: '',
})

const campaigns = computed(() => {
  if (activeTab.value === 'all') return store.campaigns
  return store.campaigns.filter(c => c.type === activeTab.value)
})

const featured = computed(() => store.campaigns.filter(c => c.is_featured && c.is_active).slice(0, 3))

const tabs = [
  { key: 'all', label: 'Ählisi' },
  { key: 'giveaway', label: 'Bäsleşikler' },
  { key: 'promotion', label: 'Aksiýalar' },
  { key: 'gift', label: 'Sowgatlar' },
] as const

const typeMeta: Record<string, { label: string; color: string; icon: any }> = {
  giveaway: { label: 'Bäsleşik', color: '#dc2626', icon: Trophy },
  promotion: { label: 'Aksiýa', color: '#f59e0b', icon: PriceTag },
  gift: { label: 'Sowgat', color: '#7c3aed', icon: Present },
}

function resolveMedia(url?: string) {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url
  return baseMediaURL + url
}

function formatDate(s?: string) {
  if (!s) return '-'
  try {
    return new Date(s).toLocaleDateString('tk-TM', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
  } catch { return s }
}

function countdownLabel(seconds: number | null | undefined): string {
  if (seconds == null) return 'Möhletsiz'
  if (seconds <= 0) return 'Tamamlandy'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d} gün ${h} sag galdy`
  if (h > 0) return `${h} sag ${m} min galdy`
  return `${m} min galdy`
}

function openJoin(id: number) {
  selectedId.value = id
  if (store.user) {
    form.value.full_name = store.user.username || ''
    form.value.email = store.user.email || ''
  }
  showJoinModal.value = true
}

async function submitJoin() {
  if (!selectedId.value) return
  if (!form.value.full_name.trim() || !form.value.phone.trim()) {
    ElMessage.warning('Adyňyzy we telefon belgisini giriziň')
    return
  }
  submitting.value = true
  try {
    await giftsActions.joinCampaign(selectedId.value, { ...form.value })
    ElMessage.success('Üstünlikli gatnaşdyňyz! Üstünlik!')
    showJoinModal.value = false
    form.value = { full_name: '', phone: '', email: '', note: '' }
    giftsActions.fetchCampaigns()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || 'Gatnaşmak başartmady')
  } finally {
    submitting.value = false
  }
}

function copyPromo(code: string) {
  navigator.clipboard.writeText(code).then(() => {
    ElMessage.success('Promo kod kopirlendi: ' + code)
  })
}

onMounted(() => {
  giftsActions.fetchCampaigns()
})
</script>

<template>
  <div class="gifts-page">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg">
        <div class="orb orb-1" />
        <div class="orb orb-2" />
        <div class="orb orb-3" />
      </div>
      <div class="hero-content max-w-7xl mx-auto px-4">
        <span class="hero-eyebrow">Sowgatlar we Aksiýalar</span>
        <h1 class="hero-title">
          Gatnaş, ýeň we <span class="accent">sowgat al</span>
        </h1>
        <p class="hero-desc">
          Wagtlaýyn bäsleşiklere we aksiýalara gatnaşyp, gymmat bahaly sowgatlary gazanyň
        </p>
        <div class="hero-stats">
          <div class="stat">
            <Trophy class="stat-icon" />
            <div>
              <div class="stat-num">{{ store.campaigns.filter(c => c.type === 'giveaway').length }}</div>
              <div class="stat-label">Bäsleşik</div>
            </div>
          </div>
          <div class="stat">
            <PriceTag class="stat-icon" />
            <div>
              <div class="stat-num">{{ store.campaigns.filter(c => c.type === 'promotion').length }}</div>
              <div class="stat-label">Aksiýa</div>
            </div>
          </div>
          <div class="stat">
            <Present class="stat-icon" />
            <div>
              <div class="stat-num">{{ store.campaigns.filter(c => c.type === 'gift').length }}</div>
              <div class="stat-label">Sowgat</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured -->
    <section v-if="featured.length" class="featured-section max-w-7xl mx-auto px-4 py-8">
      <h2 class="section-title">Tapawutly aksiýalar</h2>
      <div class="featured-grid">
        <article
          v-for="c in featured"
          :key="c.id"
          class="featured-card"
          :style="{ background: c.banner_url ? `url('${resolveMedia(c.banner_url)}') center/cover no-repeat` : undefined }"
          @click="openJoin(c.id)"
        >
          <div class="featured-overlay" :class="c.bg_gradient ? `bg-gradient-to-br ${c.bg_gradient}` : 'bg-gradient-to-br from-red-600 to-orange-500'" />
          <div class="featured-body">
            <span class="badge" :style="{ background: typeMeta[c.type].color }">
              {{ typeMeta[c.type].label }}
            </span>
            <h3>{{ c.title }}</h3>
            <p v-if="c.subtitle">{{ c.subtitle }}</p>
            <div class="featured-cta">
              <Timer class="icon" /> {{ countdownLabel(c.time_left_seconds) }}
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Filter tabs -->
    <section class="max-w-7xl mx-auto px-4">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </section>

    <!-- Campaign Grid -->
    <section class="max-w-7xl mx-auto px-4 pb-16">
      <div v-if="!campaigns.length" class="empty">
        <Present style="font-size: 60px; opacity: 0.4" />
        <p>Häzirlikçe açyk aksiýa ýok</p>
      </div>

      <div v-else class="campaign-grid">
        <article v-for="c in campaigns" :key="c.id" class="campaign-card">
          <div class="card-media">
            <img v-if="c.image_url" :src="resolveMedia(c.image_url)" :alt="c.title" />
            <div v-else class="placeholder" :class="`bg-gradient-to-br ${c.bg_gradient || 'from-red-600 to-orange-500'}`">
              <el-icon><component :is="typeMeta[c.type].icon" /></el-icon>
            </div>
            <span class="type-badge" :style="{ background: typeMeta[c.type].color }">
              <el-icon><component :is="typeMeta[c.type].icon" /></el-icon>
              {{ typeMeta[c.type].label }}
            </span>
            <span v-if="!c.is_active" class="status-badge ended">Tamamlandy</span>
            <span v-else-if="c.time_left_seconds && c.time_left_seconds < 86400" class="status-badge urgent">Tiz tamamlanýar</span>
          </div>

          <div class="card-body">
            <h3 class="card-title">{{ c.title }}</h3>
            <p v-if="c.subtitle" class="card-subtitle">{{ c.subtitle }}</p>

            <div v-if="c.prize_title" class="prize">
              <Trophy class="prize-icon" />
              <span>{{ c.prize_title }}</span>
              <span v-if="Number(c.prize_value) > 0" class="prize-value">{{ Number(c.prize_value).toLocaleString() }} TMT</span>
            </div>

            <div v-if="c.discount_percent" class="discount-row">
              <span class="discount">{{ c.discount_percent }}% arzanladyş</span>
              <button v-if="c.promo_code" class="promo-code" @click="copyPromo(c.promo_code)">
                <el-icon><Promotion /></el-icon> {{ c.promo_code }}
              </button>
            </div>

            <ul v-if="c.rules_list && c.rules_list.length" class="rules">
              <li v-for="r in c.rules_list.slice(0, 4)" :key="r.id">
                <CircleCheck class="rule-icon" /> {{ r.text }}
              </li>
            </ul>
            <p v-else-if="c.rules" class="rules-text">{{ c.rules }}</p>

            <div class="meta">
              <div class="meta-item">
                <Timer class="meta-icon" />
                <span>{{ countdownLabel(c.time_left_seconds) }}</span>
              </div>
              <div class="meta-item">
                <span class="dot" />
                <span>{{ c.participants_count }} gatnaşyjy</span>
              </div>
            </div>

            <div class="card-footer">
              <div class="dates">
                <small>Başlanýar: {{ formatDate(c.starts_at) }}</small>
                <small v-if="c.ends_at">Gutarýar: {{ formatDate(c.ends_at) }}</small>
              </div>
              <button
                v-if="c.joined_by_me"
                class="btn btn-joined"
                disabled
              >
                <CircleCheck /> Gatnaşdyňyz
              </button>
              <button
                v-else
                class="btn btn-primary"
                :disabled="!c.is_active"
                @click="openJoin(c.id)"
              >
                {{ c.is_active ? 'Gatnaş' : 'Tamamlandy' }}
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Join Modal -->
    <transition name="fade">
      <div v-if="showJoinModal" class="modal-overlay" @click.self="showJoinModal = false">
        <div class="modal">
          <header class="modal-header">
            <h3>Aksiýa gatnaşmak</h3>
            <button class="close-btn" @click="showJoinModal = false">
              <el-icon><Close /></el-icon>
            </button>
          </header>
          <form @submit.prevent="submitJoin" class="modal-body">
            <label>
              <span>Adyňyz <em>*</em></span>
              <input v-model="form.full_name" placeholder="Ady we familiýaňyz" required />
            </label>
            <label>
              <span>Telefon <em>*</em></span>
              <input v-model="form.phone" placeholder="+993 XX XXXXXX" required />
            </label>
            <label>
              <span>Email</span>
              <input v-model="form.email" type="email" placeholder="email@example.com" />
            </label>
            <label>
              <span>Bellik</span>
              <textarea v-model="form.note" placeholder="Goşmaça maglumat..." rows="3" />
            </label>
            <button type="submit" :disabled="submitting" class="btn btn-primary w-full">
              {{ submitting ? 'Iberilýär...' : 'Gatnaş' }}
            </button>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.gifts-page {
  background: #f5f5f5;
  min-height: 100vh;
}

/* Hero */
.hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #7f1d1d 60%, #b91c1c 100%);
  color: #fff;
  padding: 60px 0 80px;
}
.hero-bg { position: absolute; inset: 0; pointer-events: none; }
.orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.5; }
.orb-1 { width: 300px; height: 300px; background: #dc2626; top: -60px; left: 10%; }
.orb-2 { width: 400px; height: 400px; background: #f59e0b; bottom: -100px; right: 5%; }
.orb-3 { width: 250px; height: 250px; background: #be123c; top: 30%; right: 30%; opacity: 0.3; }

.hero-content { position: relative; z-index: 1; text-align: center; }
.hero-eyebrow {
  font-size: 12px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #fca5a5;
  font-weight: 700;
}
.hero-title { font-size: clamp(28px, 5vw, 52px); font-weight: 900; margin: 14px 0; line-height: 1.1; }
.hero-title .accent { color: #fbbf24; }
.hero-desc { font-size: 16px; opacity: 0.9; max-width: 600px; margin: 0 auto; }
.hero-stats {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
  flex-wrap: wrap;
}
.stat {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 14px;
  padding: 14px 22px;
}
.stat-icon { width: 28px; height: 28px; color: #fbbf24; }
.stat-num { font-size: 22px; font-weight: 900; line-height: 1; }
.stat-label { font-size: 12px; opacity: 0.8; }

/* Featured */
.section-title {
  font-size: 22px;
  font-weight: 800;
  color: #111;
  margin-bottom: 16px;
  position: relative;
  padding-bottom: 10px;
}
.section-title::after {
  content: '';
  position: absolute;
  left: 0; bottom: 0;
  width: 50px; height: 3px;
  background: #dc2626;
  border-radius: 2px;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}
.featured-card {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  min-height: 200px;
  cursor: pointer;
  color: #fff;
  background-color: #1f2937;
  background-size: cover;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.featured-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px rgba(220,38,38,0.3);
}
.featured-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.85;
}
.featured-body {
  position: relative;
  z-index: 1;
  padding: 22px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.featured-body h3 {
  font-size: 22px;
  font-weight: 800;
  margin: 8px 0 4px;
}
.featured-body p { opacity: 0.9; font-size: 14px; }
.featured-cta {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  background: rgba(0,0,0,0.4);
  padding: 6px 12px;
  border-radius: 999px;
  width: fit-content;
}
.featured-cta .icon { width: 14px; height: 14px; }
.badge {
  display: inline-block;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 8px;
  margin: 24px 0 18px;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
  scrollbar-width: none;
}
.tabs::-webkit-scrollbar { display: none; }
.tab {
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 700;
  color: #6b7280;
  padding: 10px 18px;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  transition: color 0.2s;
}
.tab:hover { color: #dc2626; }
.tab.active { color: #dc2626; }
.tab.active::after {
  content: '';
  position: absolute;
  left: 12px; right: 12px;
  bottom: -1px;
  height: 3px;
  background: #dc2626;
  border-radius: 2px 2px 0 0;
}

/* Grid */
.campaign-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 20px;
}
.campaign-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.campaign-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(220,38,38,0.12);
  border-color: #fecaca;
}
.card-media {
  position: relative;
  height: 180px;
  overflow: hidden;
  background: #f3f4f6;
}
.card-media img { width: 100%; height: 100%; object-fit: cover; }
.card-media .placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  font-size: 60px;
}

.type-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
}
.status-badge.ended { background: #6b7280; }
.status-badge.urgent { background: #f97316; animation: pulse 1.5s infinite; }
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.card-body {
  padding: 18px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.card-title {
  font-size: 17px;
  font-weight: 800;
  color: #111;
  line-height: 1.3;
}
.card-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin-top: -4px;
}
.prize {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #fef3c7, #fed7aa);
  color: #92400e;
  padding: 10px 12px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
}
.prize-icon { width: 18px; height: 18px; color: #d97706; }
.prize-value {
  margin-left: auto;
  font-weight: 900;
  color: #b45309;
}

.discount-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.discount {
  background: #dc2626;
  color: #fff;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
}
.promo-code {
  background: #f3f4f6;
  border: 1px dashed #9ca3af;
  color: #374151;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: background 0.2s;
}
.promo-code:hover { background: #fee2e2; border-color: #dc2626; color: #dc2626; }

.rules {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #4b5563;
}
.rules li { display: flex; align-items: center; gap: 6px; }
.rule-icon { width: 14px; height: 14px; color: #16a34a; flex-shrink: 0; }
.rules-text {
  font-size: 13px;
  color: #4b5563;
  white-space: pre-line;
}

.meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
}
.meta-item { display: flex; align-items: center; gap: 4px; }
.meta-icon { width: 14px; height: 14px; }
.dot { width: 6px; height: 6px; border-radius: 999px; background: #22c55e; }

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  gap: 8px;
}
.dates { display: flex; flex-direction: column; font-size: 11px; color: #9ca3af; }
.btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn-primary {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  transform: scale(1.03);
  box-shadow: 0 8px 16px rgba(220,38,38,0.3);
}
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-joined {
  background: #dcfce7;
  color: #16a34a;
  cursor: default;
}
.w-full { width: 100%; justify-content: center; }

.empty {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.modal {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 30px 60px rgba(0,0,0,0.3);
}
.modal-header {
  padding: 18px 22px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.modal-header h3 { font-weight: 800; font-size: 18px; color: #111; }
.close-btn {
  background: #f3f4f6;
  border: none;
  border-radius: 999px;
  width: 32px; height: 32px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.modal-body {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.modal-body label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #374151;
}
.modal-body label em { color: #dc2626; font-style: normal; }
.modal-body input, .modal-body textarea {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.modal-body input:focus, .modal-body textarea:focus { border-color: #dc2626; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
