<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Present,
  Trophy,
  PriceTag,
  Timer,
  CircleCheck,
  Close,
  Promotion,
  Calendar,
  InfoFilled
} from '@element-plus/icons-vue'
import { store, giftsActions } from '../../store'
import { baseMediaURL } from '../../utils/request'

const showJoinModal = ref(false)
const selectedId = ref<number | null>(null)
const submitting = ref(false)

const form = ref({
  full_name: '',
  phone: '',
  email: '',
  note: '',
})

function resolveMedia(url?: string) {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url
  return baseMediaURL + url
}

// Format duration range in Turkmen (e.g. "1-10 iýun 2026 aralyk dowam etýär")
function formatCampaignDuration(startsAt?: string, endsAt?: string | null) {
  if (!startsAt) return 'Möhletsiz'
  const months = [
    'ýanwar', 'fewral', 'mart', 'aprel', 'maý', 'iýun',
    'iýul', 'awgust', 'sentýabr', 'oktýabr', 'noýabr', 'dekabr'
  ]
  const startDate = new Date(startsAt)
  if (isNaN(startDate.getTime())) return 'Möhletsiz'
  
  if (!endsAt) {
    return `${startDate.getDate()} ${months[startDate.getMonth()]} ${startDate.getFullYear()} senesinden başlap`
  }
  
  const endDate = new Date(endsAt)
  if (isNaN(endDate.getTime())) {
    return `${startDate.getDate()} ${months[startDate.getMonth()]} ${startDate.getFullYear()} senesinden başlap`
  }

  // If same year and same month, say e.g. "1-10 iýun 2026 aralyk dowam etýär"
  if (startDate.getFullYear() === endDate.getFullYear() && startDate.getMonth() === endDate.getMonth()) {
    return `${startDate.getDate()}-${endDate.getDate()} ${months[startDate.getMonth()]} ${startDate.getFullYear()} aralyk dowam etýär`
  }
  
  // If same year but different months, say e.g. "25 maý - 5 iýun 2026 aralyk dowam etýär"
  if (startDate.getFullYear() === endDate.getFullYear()) {
    return `${startDate.getDate()} ${months[startDate.getMonth()]} - ${endDate.getDate()} ${months[endDate.getMonth()]} ${startDate.getFullYear()} aralyk dowam etýär`
  }
  
  // Otherwise, full dates
  return `${startDate.getDate()} ${months[startDate.getMonth()]} ${startDate.getFullYear()} - ${endDate.getDate()} ${months[endDate.getMonth()]} ${endDate.getFullYear()} aralyk dowam etýär`
}

// Format posted date as DD.MM.YYYY
function formatPostedDate(dateStr?: string) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

const typeMeta: Record<string, { label: string; color: string; icon: any }> = {
  giveaway: { label: 'Bäsleşik', color: '#dc2626', icon: Trophy },
  promotion: { label: 'Aksiýa', color: '#f59e0b', icon: PriceTag },
  gift: { label: 'Sowgat', color: '#7c3aed', icon: Present },
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
    ElMessage.success('Üstünlikli gatnaşdyňyz!')
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

const currentPage = ref(1)
const pageSize = ref(9)

const paginatedCampaigns = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return store.campaigns.slice(start, end)
})

function handlePageChange(page: number) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  giftsActions.fetchCampaigns()
})
</script>

<template>
  <div class="gifts-page">
    <!-- Hero Header -->
    <section class="hero">
      <div class="hero-bg">
        <div class="orb orb-1" />
        <div class="orb orb-2" />
      </div>
      <div class="hero-content max-w-7xl mx-auto px-4">
        <span class="hero-eyebrow">Höweslendiriş Aksiýalary</span>
        <h1 class="hero-title">Sowgatlar we Mümkinçilikler</h1>
        <p class="hero-desc">
          Doganlar programmasyndan peýdalanyjylar üçin ýörite bäsleşikler, sowgatlar we aksiýalar
        </p>
      </div>
    </section>

    <!-- Campaign Grid -->
    <section class="max-w-7xl mx-auto px-4 py-12">
      <div v-if="!store.campaigns.length" class="empty">
        <el-icon class="empty-icon"><Present /></el-icon>
        <p>Häzirlikçe açyk aksiýa ýok</p>
      </div>

      <div v-else class="campaign-grid">
        <article v-for="c in paginatedCampaigns" :key="c.id" class="campaign-card">
          <!-- Card Media -->
          <div class="card-media">
            <img v-if="c.image_url" :src="resolveMedia(c.image_url)" :alt="c.title" loading="lazy" />
            <div v-else class="placeholder" :class="`bg-gradient-to-br ${c.bg_gradient || 'from-red-600 to-orange-500'}`">
              <el-icon><component :is="typeMeta[c.type]?.icon || Present" /></el-icon>
            </div>
            <span class="type-badge" :style="{ background: typeMeta[c.type]?.color || '#dc2626' }">
              <el-icon class="badge-icon"><component :is="typeMeta[c.type]?.icon || Present" /></el-icon>
              {{ typeMeta[c.type]?.label || 'Aksiýa' }}
            </span>
          </div>

          <!-- Card Body -->
          <div class="card-body">
            <h3 class="card-title">{{ c.title }}</h3>
            <p v-if="c.subtitle" class="card-subtitle">{{ c.subtitle }}</p>

            <!-- 1) Näme ýerine ýetirilse näme beriljegi (Prize & Description/Rules) -->
            <div class="info-section prize-section">
              <span class="section-label">Näme berilýär:</span>
              <div v-if="c.prize_title" class="prize-value-box">
                <el-icon class="prize-icon"><Trophy /></el-icon>
                <span class="prize-text">{{ c.prize_title }}</span>
                <span v-if="Number(c.prize_value) > 0" class="prize-amount">{{ Number(c.prize_value).toLocaleString() }} TMT</span>
              </div>
              <div v-if="c.discount_percent" class="discount-box">
                <span class="discount-tag">{{ c.discount_percent }}% arzanladyş</span>
                <button v-if="c.promo_code" class="promo-btn" @click="copyPromo(c.promo_code)" title="Kopirlemek üçin basyň">
                  <el-icon><Promotion /></el-icon> {{ c.promo_code }}
                </button>
              </div>
              <p v-if="c.description" class="prize-desc">{{ c.description }}</p>
            </div>

            <div class="info-section rules-section">
              <span class="section-label">Näme ýerine ýetirmeli:</span>
              <ul v-if="c.rules_list && c.rules_list.length" class="rules-list">
                <li v-for="r in c.rules_list" :key="r.id">
                  <el-icon class="rule-icon"><CircleCheck /></el-icon>
                  <span class="rule-text">{{ r.text }}</span>
                </li>
              </ul>
              <p v-else-if="c.rules" class="rules-text-fallback">{{ c.rules }}</p>
              <div v-else class="no-rules">
                <el-icon class="info-icon"><InfoFilled /></el-icon>
                <span>Programma agza bolup gatnaşmak ýeterlik.</span>
              </div>
            </div>

            <!-- 2) Haçana çenli dowam etýär we bildiriş haçan goýuldy -->
            <div class="card-meta-details">
              <div class="meta-row">
                <el-icon class="meta-icon duration-icon"><Calendar /></el-icon>
                <span class="meta-text duration-text">{{ formatCampaignDuration(c.starts_at, c.ends_at) }}</span>
              </div>
              <div class="meta-row">
                <el-icon class="meta-icon post-icon"><Timer /></el-icon>
                <span class="meta-text post-text">Bildiriş goýlan güni: {{ formatPostedDate(c.created_at) }}</span>
              </div>
            </div>

            <!-- Footer: Gatnaş / Gatnaşdyňyz -->
            <div class="card-action">
              <button
                v-if="c.joined_by_me"
                class="btn btn-joined"
                disabled
              >
                <el-icon class="btn-icon"><CircleCheck /></el-icon> Gatnaşdyňyz
              </button>
              <button
                v-else
                class="btn btn-primary w-full"
                :disabled="!c.is_active"
                @click="openJoin(c.id)"
              >
                {{ c.is_active ? 'Gatnaş' : 'Tamamlandy' }}
              </button>
            </div>
          </div>
        </article>
      </div>

      <!-- Pagination -->
      <div v-if="store.campaigns.length > pageSize" class="pagination-container">
        <el-pagination 
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="store.campaigns.length"
          layout="prev, pager, next"
          background
          @current-change="handlePageChange"
        />
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
            <label class="form-field">
              <span>Adyňyz we familiýaňyz <em>*</em></span>
              <input v-model="form.full_name" placeholder="Adyňyz we familiýaňyz" required />
            </label>
            <label class="form-field">
              <span>Telefon belgiňiz <em>*</em></span>
              <input v-model="form.phone" placeholder="+993 XX XXXXXX" required />
            </label>
            <label class="form-field">
              <span>Email</span>
              <input v-model="form.email" type="email" placeholder="mysal@gmail.com" />
            </label>
            <label class="form-field">
              <span>Goşmaça bellik</span>
              <textarea v-model="form.note" placeholder="Goşmaça maglumat bar bolsa ýazyň..." rows="3" />
            </label>
            <button type="submit" :disabled="submitting" class="btn btn-submit w-full">
              {{ submitting ? 'Iberilýär...' : 'Gatnaşmak' }}
            </button>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.gifts-page {
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1e293b;
}

/* Hero Section */
.hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #4c0519 100%);
  color: #fff;
  padding: 80px 0;
  text-align: center;
}
.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.4;
}
.orb-1 {
  width: 400px;
  height: 400px;
  background: #dc2626;
  top: -100px;
  left: -50px;
}
.orb-2 {
  width: 500px;
  height: 500px;
  background: #6366f1;
  bottom: -200px;
  right: -50px;
}
.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}
.hero-eyebrow {
  display: inline-block;
  font-size: 13px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #fda4af;
  font-weight: 700;
  margin-bottom: 12px;
}
.hero-title {
  font-size: clamp(32px, 5vw, 54px);
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 18px;
}
.hero-desc {
  font-size: clamp(15px, 2vw, 18px);
  opacity: 0.85;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

/* Responsive Grid */
.campaign-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 28px;
}
@media (max-width: 640px) {
  .campaign-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

/* Campaign Card */
.campaign-card {
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s;
}
.campaign-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: #fca5a5;
}

/* Card Media */
.card-media {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: #f1f5f9;
}
.card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.campaign-card:hover .card-media img {
  transform: scale(1.05);
}
.card-media .placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 64px;
}
.type-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  padding: 6px 14px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
}
.badge-icon {
  font-size: 13px;
}

/* Card Body */
.card-body {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.card-title {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.3;
}
.card-subtitle {
  font-size: 14px;
  color: #64748b;
  margin-top: -10px;
}

/* Sections */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e2e8f0;
}
.section-label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

/* Prize Box */
.prize-value-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%);
  color: #92400e;
  padding: 12px 14px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  border: 1px solid #fde68a;
}
.prize-icon {
  font-size: 20px;
  color: #d97706;
}
.prize-text {
  flex: 1;
  font-weight: 800;
  color: #78350f;
}
.prize-amount {
  font-weight: 900;
  color: #b45309;
  background: #ffffff;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
}
.prize-desc {
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
}

/* Discount & Promo */
.discount-box {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.discount-tag {
  background: #ef4444;
  color: #ffffff;
  font-weight: 800;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}
.promo-btn {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  color: #334155;
  font-weight: 800;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.promo-btn:hover {
  background: #fee2e2;
  border-color: #ef4444;
  color: #b91c1c;
}

/* Rules Section */
.rules-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.rules-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.rule-icon {
  font-size: 16px;
  color: #10b981;
  flex-shrink: 0;
  margin-top: 2px;
}
.rule-text {
  font-size: 13.5px;
  color: #334155;
  line-height: 1.4;
}
.rules-text-fallback {
  font-size: 13.5px;
  color: #334155;
  line-height: 1.5;
  white-space: pre-line;
}
.no-rules {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 8px;
}
.info-icon {
  font-size: 16px;
  color: #64748b;
}

/* Meta details */
.card-meta-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #f8fafc;
  padding: 12px 14px;
  border-radius: 12px;
  margin-top: auto;
  border: 1px solid #f1f5f9;
}
.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.meta-icon {
  font-size: 16px;
  flex-shrink: 0;
}
.duration-icon {
  color: #3b82f6;
}
.post-icon {
  color: #64748b;
}
.meta-text {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}
.duration-text {
  color: #1d4ed8;
}
.post-text {
  color: #64748b;
}

/* Buttons */
.card-action {
  margin-top: 8px;
}
.btn {
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-primary {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2);
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.3);
}
.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-joined {
  background: #dcfce7;
  color: #15803d;
  cursor: default;
  border: 1px solid #bbf7d0;
  width: 100%;
}
.btn-icon {
  font-size: 16px;
}

.empty {
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.empty-icon {
  font-size: 64px;
  color: #cbd5e1;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal {
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 460px;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #f1f5f9;
  animation: modalScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes modalScale {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.modal-header h3 {
  font-weight: 900;
  font-size: 20px;
  color: #0f172a;
  letter-spacing: -0.01em;
}
.close-btn {
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  transition: all 0.2s;
}
.close-btn:hover {
  background: #cbd5e1;
  color: #0f172a;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-field span {
  font-size: 12.5px;
  font-weight: 700;
  color: #475569;
}
.form-field em {
  color: #ef4444;
  font-style: normal;
}
.form-field input,
.form-field textarea {
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  background: #f8fafc;
  transition: all 0.2s;
}
.form-field input:focus,
.form-field textarea:focus {
  border-color: #dc2626;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}
.btn-submit {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: #ffffff;
  padding: 14px;
  box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2);
}
.btn-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.25);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 48px;
}
:deep(.pagination-container .el-pagination.is-background .el-pager li:not(.is-active)) {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  color: #475569;
  border-radius: 8px;
  font-weight: 700;
}
:deep(.pagination-container .el-pagination.is-background .el-pager li.is-active) {
  background-color: #dc2626;
  color: #ffffff;
  border-radius: 8px;
  font-weight: 900;
  box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2);
}
:deep(.pagination-container .el-pagination.is-background .btn-next),
:deep(.pagination-container .el-pagination.is-background .btn-prev) {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
}
:deep(.pagination-container .el-pagination.is-background .btn-next:disabled),
:deep(.pagination-container .el-pagination.is-background .btn-prev:disabled) {
  background-color: #f1f5f9;
  border-color: #e2e8f0;
  color: #cbd5e1;
}
</style>
