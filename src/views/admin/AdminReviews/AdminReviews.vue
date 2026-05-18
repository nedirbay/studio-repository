<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { store, actions } from '../../../store'
import { 
  Delete, 
  Search,
  StarFilled,
  User as UserIcon,
  Box
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

onMounted(() => {
  actions.fetchAdminReviews().catch(e => {
    console.warn("Could not fetch reviews:", e)
  })
})

const searchQuery = ref('')
const ratingFilter = ref<number | ''>('')

const filteredReviews = computed(() => {
  return store.adminReviews.filter(review => {
    const matchesSearch = 
      (review.userName && review.userName.toLowerCase().includes(searchQuery.value.toLowerCase())) || 
      (review.productName && review.productName.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (review.content && review.content.toLowerCase().includes(searchQuery.value.toLowerCase()))
      
    const matchesRating = ratingFilter.value ? review.rating === ratingFilter.value : true
    return matchesSearch && matchesRating
  })
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('tk-TM', { 
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute:'2-digit'
  }).format(date)
}

async function handleDelete(review: any) {
  try {
    await ElMessageBox.confirm(
      `Bu teswiri pozmak isleýärsiňizmi?`,
      'Üns beriň',
      {
        confirmButtonText: 'Hawa, poz',
        cancelButtonText: 'Ýok',
        type: 'warning',
        confirmButtonClass: '!bg-red-600 !border-red-600 !text-white !rounded-xl !px-6',
        cancelButtonClass: '!rounded-xl'
      }
    )
    
    await actions.deleteReview(review.id)
    ElMessage.success('Teswir pozuldy')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Teswiri pozup bolmady')
    }
  }
}
</script>

<template>
  <div class="space-y-6 sm:space-y-8 animate-fade-in pb-20">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Teswirler</h1>
        <p class="text-[10px] sm:text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Ulanyjylaryň harytlara ýazan teswirleri</p>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4">
      <el-input
        v-model="searchQuery"
        placeholder="Ulanyjy, haryt ýa-da söz boýunça gözleg..."
        :prefix-icon="Search"
        class="w-full sm:w-[350px] !rounded-xl search-input"
        clearable
      />
      <el-select 
        v-model="ratingFilter" 
        placeholder="Baha boýunça"
        class="w-full sm:w-[200px]"
        clearable
      >
        <el-option label="Ählisi" value="" />
        <el-option label="5 Ýyldyz" :value="5" />
        <el-option label="4 Ýyldyz" :value="4" />
        <el-option label="3 Ýyldyz" :value="3" />
        <el-option label="2 Ýyldyz" :value="2" />
        <el-option label="1 Ýyldyz" :value="1" />
      </el-select>
    </div>

    <!-- Reviews Table -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full min-w-[900px] text-left">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100">
              <th class="p-4 sm:p-5 text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest w-[20%]">Müşderi</th>
              <th class="p-4 sm:p-5 text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest w-[25%]">Haryt</th>
              <th class="p-4 sm:p-5 text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest w-[10%]">Baha</th>
              <th class="p-4 sm:p-5 text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest w-[35%]">Teswir</th>
              <th class="p-4 sm:p-5 text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest text-right w-[10%]">Sazlamalar</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="item in filteredReviews" 
              :key="item.id"
              class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
            >
              <!-- User -->
              <td class="p-4 sm:p-5 align-top">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-slate-400 shrink-0">
                    <el-icon><UserIcon /></el-icon>
                  </div>
                  <div>
                    <span class="font-bold text-sm text-slate-900 block">{{ item.userName }}</span>
                  </div>
                </div>
              </td>
              
              <!-- Product -->
              <td class="p-4 sm:p-5 align-top">
                <div class="flex items-start gap-2">
                  <el-icon class="text-gray-400 mt-1 shrink-0"><Box /></el-icon>
                  <div>
                    <span class="text-sm font-medium text-slate-700 line-clamp-2 leading-snug">{{ item.productName }}</span>
                    <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">
                      ID: #{{ item.productId }}
                    </span>
                  </div>
                </div>
              </td>
              
              <!-- Rating -->
              <td class="p-4 sm:p-5 align-top">
                <div class="flex items-center gap-1">
                  <el-icon 
                    v-for="star in 5" 
                    :key="star"
                    :class="star <= item.rating ? 'text-amber-400' : 'text-gray-200'"
                    class="text-sm"
                  >
                    <StarFilled />
                  </el-icon>
                </div>
              </td>
              
              <!-- Content -->
              <td class="p-4 sm:p-5 align-top">
                <div>
                  <h4 v-if="item.title" class="text-sm font-bold text-slate-900 mb-1">{{ item.title }}</h4>
                  <p class="text-xs text-gray-600 leading-relaxed">{{ item.content }}</p>
                  <p class="text-[10px] text-gray-400 mt-2 font-medium">{{ formatDate(item.createdAt) }}</p>
                </div>
              </td>
              
              <!-- Actions -->
              <td class="p-4 sm:p-5 align-top text-right">
                <div class="flex items-center justify-end opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <el-button 
                    circle 
                    :icon="Delete"
                    type="danger" 
                    plain
                    @click="handleDelete(item)"
                  />
                </div>
              </td>
            </tr>
            
            <tr v-if="filteredReviews.length === 0">
              <td colspan="5" class="p-10 text-center">
                <el-empty description="Teswir tapylmady" :image-size="100" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.search-input .el-input__wrapper) {
  border-radius: 0.75rem;
  background-color: #f9fafb;
  border: none;
  box-shadow: none;
}
:deep(.search-input .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #fee2e2;
}
</style>
