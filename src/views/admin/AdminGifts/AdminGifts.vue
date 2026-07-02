<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { store, giftsActions } from '../../../store'
import {
  Plus,
  Edit,
  Delete,
  Search,
  User,
  Trophy,
  Present,
  PriceTag,
  Tickets
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import GiftDialog from './components/GiftDialog.vue'
import ParticipantsDialog from './components/ParticipantsDialog.vue'

const windowWidth = ref(window.innerWidth)
const updateWidth = () => { windowWidth.value = window.innerWidth }

function onParticipationCreated(e: Event) {
  const p = (e as CustomEvent).detail
  if (participantsDialogVisible.value && selectedCampaign.value && selectedCampaign.value.id === p.campaign) {
    if (!participants.value.some(x => x.id === p.id)) {
      participants.value.unshift(p)
    }
  }
}

function onParticipationUpdated(e: Event) {
  const p = (e as CustomEvent).detail
  if (participantsDialogVisible.value && selectedCampaign.value && selectedCampaign.value.id === p.campaign) {
    const idx = participants.value.findIndex(x => x.id === p.id)
    if (idx !== -1) {
      participants.value[idx] = p
    }
  }
}

function onParticipationDeleted(e: Event) {
  const { id, campaign_id } = (e as CustomEvent).detail
  if (participantsDialogVisible.value && selectedCampaign.value && selectedCampaign.value.id === campaign_id) {
    participants.value = participants.value.filter(x => x.id !== id)
  }
}

onMounted(async () => {
  window.addEventListener('resize', updateWidth)
  window.addEventListener('participation-created', onParticipationCreated)
  window.addEventListener('participation-updated', onParticipationUpdated)
  window.addEventListener('participation-deleted', onParticipationDeleted)
  loading.value = true
  try {
    await giftsActions.fetchCampaigns({ status: 'all' })
  } catch (err) {
    ElMessage.error('Aksiýalary ýüklemek başartmady')
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
  window.removeEventListener('participation-created', onParticipationCreated)
  window.removeEventListener('participation-updated', onParticipationUpdated)
  window.removeEventListener('participation-deleted', onParticipationDeleted)
})

const loading = ref(false)
const searchQuery = ref('')

// Local filter by search query
const filteredCampaigns = computed(() => {
  if (!searchQuery.value.trim()) return store.campaigns
  const query = searchQuery.value.toLowerCase()
  return store.campaigns.filter(c => 
    c.title.toLowerCase().includes(query) || 
    (c.subtitle && c.subtitle.toLowerCase().includes(query)) ||
    c.type.toLowerCase().includes(query)
  )
})

const currentPage = ref(1)
const pageSize = ref(9)

const paginatedCampaigns = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCampaigns.value.slice(start, end)
})

function handlePageChange(page: number) {
  currentPage.value = page
}

// Reset page when searching
watch(searchQuery, () => {
  currentPage.value = 1
})

const dialogVisible = ref(false)
const isEditing = ref(false)
const currentCampaignId = ref<number | null>(null)
const submitting = ref(false)

const form = ref({
  type: 'giveaway',
  title: '',
  subtitle: '',
  description: '',
  image_url: '',
  banner_url: '',
  bg_gradient: 'from-red-600 to-orange-500',
  prize_title: '',
  prize_value: 0,
  starts_at: '',
  ends_at: '',
  rules: '',
  discount_percent: 0,
  promo_code: '',
  is_featured: false,
  status: 'active'
})

// Participant Dialog States
const participantsDialogVisible = ref(false)
const selectedCampaign = ref<any>(null)
const participants = ref<any[]>([])
const loadingParticipants = ref(false)

const typeMeta: Record<string, { label: string; type: string; icon: any }> = {
  giveaway: { label: 'Bäsleşik / Giveaway', type: 'danger', icon: Trophy },
  promotion: { label: 'Aksiýa', type: 'warning', icon: PriceTag },
  gift: { label: 'Sowgat', type: 'purple', icon: Present },
}

const statusMeta: Record<string, { label: string; type: string }> = {
  draft: { label: 'Garaşylýar', type: 'info' },
  active: { label: 'Işjeň', type: 'success' },
  finished: { label: 'Tamamlandy', type: 'warning' },
  cancelled: { label: 'Ýatyryldy', type: 'danger' },
}


function formatDate(dateStr?: string) {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleString('tk-TM', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

function openAdd() {
  isEditing.value = false
  currentCampaignId.value = null
  const now = new Date()
  form.value = {
    type: 'giveaway',
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    banner_url: '',
    bg_gradient: 'from-red-600 to-orange-500',
    prize_title: '',
    prize_value: 0,
    starts_at: now.toISOString(),
    ends_at: '',
    rules: '',
    discount_percent: 0,
    promo_code: '',
    is_featured: false,
    status: 'active'
  }
  dialogVisible.value = true
}

function openEdit(campaign: any) {
  isEditing.value = true
  currentCampaignId.value = campaign.id
  form.value = {
    type: campaign.type,
    title: campaign.title,
    subtitle: campaign.subtitle || '',
    description: campaign.description || '',
    image_url: campaign.image_url || '',
    banner_url: campaign.banner_url || '',
    bg_gradient: campaign.bg_gradient || 'from-red-600 to-orange-500',
    prize_title: campaign.prize_title || '',
    prize_value: Number(campaign.prize_value) || 0,
    starts_at: campaign.starts_at ? new Date(campaign.starts_at).toISOString() : '',
    ends_at: campaign.ends_at ? new Date(campaign.ends_at).toISOString() : '',
    rules: campaign.rules || '',
    discount_percent: campaign.discount_percent || 0,
    promo_code: campaign.promo_code || '',
    is_featured: campaign.is_featured || false,
    status: campaign.status || 'active'
  }
  dialogVisible.value = true
}

async function onGiftSave(savedForm: any) {
  if (!savedForm.title) {
    ElMessage.warning('Aksiýanyň ady hökmanydyr')
    return
  }
  if (!savedForm.starts_at) {
    ElMessage.warning('Başlanýan wagty hökmanydyr')
    return
  }

  submitting.value = true
  try {
    const payload = {
      ...savedForm,
      starts_at: new Date(savedForm.starts_at).toISOString(),
      ends_at: savedForm.ends_at ? new Date(savedForm.ends_at).toISOString() : null,
      prize_value: Number(savedForm.prize_value) || 0,
      discount_percent: Number(savedForm.discount_percent) || 0
    }

    if (isEditing.value && currentCampaignId.value) {
      await giftsActions.updateCampaign(currentCampaignId.value, payload)
      ElMessage.success('Aksiýa üstünlikli täzelendi')
    } else {
      await giftsActions.createCampaign(payload)
      ElMessage.success('Täze aksiýa üstünlikli döredildi')
    }
    dialogVisible.value = false
  } catch (err: any) {
    console.error(err)
    ElMessage.error(err?.response?.data?.detail || 'Saklap bolmady')
  } finally {
    submitting.value = false
  }
}

function handleDelete(id: number) {
  ElMessageBox.confirm(
    'Bu aksiýany we onuň ähli gatnaşyjylaryny pozmak isleýärsiňizmi?',
    'Üns beriň!',
    {
      confirmButtonText: 'Poz',
      cancelButtonText: 'Bes et',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await giftsActions.deleteCampaign(id)
      ElMessage.success('Aksiýa üstünlikli pozuldy')
    } catch (err) {
      ElMessage.error('Pozmak başartmady')
    }
  })
}

// Participants Logic
async function openParticipants(campaign: any) {
  selectedCampaign.value = campaign
  participants.value = []
  participantsDialogVisible.value = true
  loadingParticipants.value = true
  try {
    const res = await giftsActions.fetchCampaignParticipants(campaign.id)
    participants.value = res
  } catch (err) {
    ElMessage.error('Gatnaşyjylary ýüklemek başartmady')
  } finally {
    loadingParticipants.value = false
  }
}

async function handleStatusChange(participationId: number, newStatus: string) {
  try {
    await giftsActions.updateParticipantStatus(participationId, newStatus)
    ElMessage.success('Status üstünlikli üýtgedildi')
    
    // Refresh participant list
    if (selectedCampaign.value) {
      const res = await giftsActions.fetchCampaignParticipants(selectedCampaign.value.id)
      participants.value = res
    }
    // Refresh campaigns to sync participant count / winner lists
    await giftsActions.fetchCampaigns({ status: 'all' })
  } catch (err: any) {
    ElMessage.error('Statusy üýtgedip bolmady: ' + (err?.response?.data?.detail || 'näbelli säwlik'))
  }
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Action Bar -->
    <div class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      <div class="relative w-full sm:w-80 group">
        <el-input
          v-model="searchQuery"
          placeholder="Aksiýalary gözle..."
          class="admin-search-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      
      <el-button 
        type="primary" 
        size="large" 
        class="!rounded-2xl !px-8 !font-black !h-12 shadow-lg shadow-red-600/20" 
        @click="openAdd"
      >
        <el-icon class="mr-2"><Plus /></el-icon>
        Täze Aksiýa / Sowgat
      </el-button>
    </div>

    <!-- Campaigns Table -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" v-loading="loading">
      <el-table 
        :data="paginatedCampaigns" 
        style="width: 100%" 
        class="admin-table"
        header-cell-class-name="admin-table-header"
      >
        <!-- Type Column -->
        <el-table-column width="140" label="Görnüşi">
          <template #default="scope">
            <el-tag 
              :type="typeMeta[scope.row.type]?.type || 'info'" 
              class="!rounded-xl font-bold"
              size="default"
            >
              <el-icon class="mr-1"><component :is="typeMeta[scope.row.type]?.icon || Present" /></el-icon>
              {{ typeMeta[scope.row.type]?.label || scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        
        <!-- Title & Subtitle -->
        <el-table-column prop="title" label="Aksiýanyň Ady" min-width="220" sortable>
          <template #default="scope">
            <div class="flex flex-col py-1">
              <span class="font-black text-slate-900 leading-snug">{{ scope.row.title }}</span>
              <span v-if="scope.row.subtitle" class="text-xs text-gray-400 mt-0.5">{{ scope.row.subtitle }}</span>
              <span v-if="scope.row.is_featured" class="mt-1">
                <el-tag size="small" type="warning" effect="dark" class="!rounded-lg font-black">Tapawutly</el-tag>
              </span>
            </div>
          </template>
        </el-table-column>
        
        <!-- Prize / Discount -->
        <el-table-column label="Sowgat / Arzanladyş" min-width="180">
          <template #default="scope">
            <div class="flex flex-col gap-1 text-xs">
              <div v-if="scope.row.prize_title" class="flex items-center gap-1 text-amber-700 font-bold">
                <el-icon><Trophy /></el-icon>
                <span>{{ scope.row.prize_title }}</span>
                <span v-if="Number(scope.row.prize_value) > 0" class="text-gray-400 font-normal">({{ Number(scope.row.prize_value) }} TMT)</span>
              </div>
              <div v-if="scope.row.discount_percent" class="flex items-center gap-1 text-red-600 font-black">
                <el-icon><PriceTag /></el-icon>
                <span>{{ scope.row.discount_percent }}% arzanladyş</span>
                <el-tag v-if="scope.row.promo_code" size="small" type="info" class="!rounded-lg font-bold ml-1">
                  {{ scope.row.promo_code }}
                </el-tag>
              </div>
              <span v-if="!scope.row.prize_title && !scope.row.discount_percent" class="text-gray-400 italic">Sowgat goşulmady</span>
            </div>
          </template>
        </el-table-column>

        <!-- Dates Range -->
        <el-table-column label="Dowamlylygy" min-width="180">
          <template #default="scope">
            <div class="flex flex-col text-xs text-slate-700 gap-0.5">
              <div class="flex items-center gap-1">
                <span class="text-gray-400 font-bold">Baş:</span>
                <span>{{ formatDate(scope.row.starts_at) }}</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-gray-400 font-bold">Gut:</span>
                <span>{{ scope.row.ends_at ? formatDate(scope.row.ends_at) : 'Möhletsiz' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- Status Column -->
        <el-table-column label="Status" width="120" align="center">
          <template #default="scope">
            <el-tag 
              :type="statusMeta[scope.row.status]?.type || 'info'" 
              class="!rounded-xl font-bold"
              effect="light"
            >
              {{ statusMeta[scope.row.status]?.label || scope.row.status }}
            </el-tag>
            <div class="mt-1">
              <span v-if="scope.row.is_active" class="text-[10px] text-green-600 font-black uppercase">Işjeň</span>
              <span v-else class="text-[10px] text-red-500 font-black uppercase">Wagty dolan / Ýapyk</span>
            </div>
          </template>
        </el-table-column>

        <!-- Participants Count -->
        <el-table-column label="Gatnaşyjylar" width="130" align="center">
          <template #default="scope">
            <el-button 
              type="info" 
              plain 
              size="small" 
              class="!rounded-2xl font-black !px-3"
              @click="openParticipants(scope.row)"
            >
              <el-icon class="mr-1"><User /></el-icon>
              {{ scope.row.participants_count || 0 }}
            </el-button>
            <div v-if="scope.row.winners && scope.row.winners.length" class="text-[10px] text-amber-600 font-black mt-1">
              {{ scope.row.winners.length }} Ýeňiji bar
            </div>
          </template>
        </el-table-column>
        
        <!-- Actions Column -->
        <el-table-column label="Amallar" width="140" align="right">
          <template #default="scope">
            <div class="flex gap-2 justify-end">
              <el-button 
                circle 
                :icon="Edit" 
                size="small"
                @click="openEdit(scope.row)"
                class="!bg-blue-50 !text-blue-600 !border-none hover:!bg-blue-600 hover:!text-white transition-all"
                title="Üýtgetmek"
              />
              <el-button 
                circle 
                :icon="Delete" 
                size="small"
                @click="handleDelete(scope.row.id)"
                class="!bg-red-50 !text-red-600 !border-none hover:!bg-red-600 hover:!text-white transition-all"
                title="Pozmak"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div v-if="filteredCampaigns.length > pageSize" class="flex justify-center py-6 border-t border-gray-100 bg-gray-50/50">
        <el-pagination 
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredCampaigns.length"
          layout="prev, pager, next"
          background
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- Create/Edit Dialog Component -->
    <GiftDialog
      v-model:visible="dialogVisible"
      :is-editing="isEditing"
      :campaign="form"
      :window-width="windowWidth"
      :submitting="submitting"
      @save="onGiftSave"
    />

    <!-- Participants Dialog Component -->
    <ParticipantsDialog
      v-model:visible="participantsDialogVisible"
      :selected-campaign="selectedCampaign"
      :participants="participants"
      :loading-participants="loadingParticipants"
      :window-width="windowWidth"
      @status-change="handleStatusChange"
    />
  </div>
</template>

<style scoped>
.admin-table :deep(.admin-table-header) {
  background-color: rgba(249, 250, 251, 0.6);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  padding-top: 1.2rem;
  padding-bottom: 1.2rem;
}
.admin-table :deep(.el-table__row) {
  transition: background-color 0.2s ease;
}
.admin-table :deep(.el-table__row:hover) {
  background-color: rgba(248, 250, 252, 0.8);
}

.admin-search-input :deep(.el-input__wrapper) {
  border-radius: 1rem !important;
  height: 3rem;
  box-shadow: none;
  border: 1px solid #e2e8f0;
  background-color: white;
  transition: all 0.2s;
}
.admin-search-input :deep(.el-input__wrapper:hover) {
  border-color: #fca5a5;
}
.admin-search-input :deep(.el-input__wrapper.is-focus) {
  border-color: #dc2626;
  box-shadow: 0 0 0 1px #dc2626 !important;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

:deep(.admin-dialog) {
  border-radius: 2rem;
  overflow: hidden;
}
:deep(.admin-dialog .el-dialog__header) {
  padding: 2rem 2rem 1rem;
  margin-bottom: 0;
}
:deep(.admin-dialog .el-dialog__title) {
  font-size: 1.35rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;
}
:deep(.admin-dialog .el-dialog__body) {
  padding: 1.5rem 2rem 2rem;
}
:deep(.admin-dialog .el-form-item__label) {
  font-weight: 800;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  margin-bottom: 0.4rem;
}
:deep(.admin-dialog .el-input__wrapper),
:deep(.admin-dialog .el-textarea__inner) {
  border-radius: 0.75rem;
  border: 1.5px solid #f1f5f9;
  box-shadow: none;
  background-color: #f8fafc;
  transition: all 0.2s;
}
:deep(.admin-dialog .el-input__wrapper:hover),
:deep(.admin-dialog .el-textarea__inner:hover) {
  border-color: #fca5a5;
}
:deep(.admin-dialog .el-input__wrapper.is-focus),
:deep(.admin-dialog .el-textarea__inner:focus) {
  border-color: #dc2626;
  background-color: #ffffff;
}

/* Custom layout classes for dialog */
.w-full {
  width: 100%;
}

.admin-sub-table :deep(th) {
  background: #f8fafc;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: #64748b;
  padding: 8px 0;
}
.admin-sub-table :deep(td) {
  padding: 6px 0;
}

.admin-status-select :deep(.el-input__wrapper) {
  border-radius: 8px !important;
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
}
</style>
