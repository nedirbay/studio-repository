<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { store, actions } from '../../../store'
import { Plus, Edit, Delete, Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const dialogVisible = ref(false)
const isEditing = ref(false)
const form = ref({
  id: 0,
  name: '',
  code: '',
  symbol: '',
  is_active: false
})

onMounted(async () => {
  loading.value = true
  try {
    await actions.fetchCurrencies()
  } finally {
    loading.value = false
  }
})

const openAdd = () => {
  isEditing.value = false
  form.value = { id: 0, name: '', code: '', symbol: '', is_active: false }
  dialogVisible.value = true
}

const openEdit = (currency: any) => {
  isEditing.value = true
  form.value = { ...currency }
  dialogVisible.value = true
}

const onSave = async () => {
  if (!form.value.name || !form.value.code || !form.value.symbol) {
    ElMessage.warning('Ähli meýdanlary dolduryň!')
    return
  }

  loading.value = true
  try {
    if (isEditing.value) {
      await actions.updateCurrency(form.value.id, form.value)
      ElMessage.success('Pul birligi üstünlikli täzelendi!')
    } else {
      await actions.addCurrency(form.value)
      ElMessage.success('Täze pul birligi goşuldy!')
    }
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error('Ýalňyşlyk ýüze çykdy')
  } finally {
    loading.value = false
  }
}

const handleDelete = (id: number) => {
  ElMessageBox.confirm(
    'Bu pul birligini öçürmek isleýärsiňizmi?',
    'Pul birligini öçürmek',
    {
      confirmButtonText: 'Öçür',
      cancelButtonText: 'Ýatyr',
      type: 'warning',
    }
  ).then(async () => {
    loading.value = true
    try {
      await actions.deleteCurrency(id)
      ElMessage.success('Pul birligi öçürildi.')
    } catch (error) {
      ElMessage.error('Pul birligini öçürmek başartmady.')
    } finally {
      loading.value = false
    }
  }).catch(() => {})
}

const handleActivate = async (id: number) => {
  loading.value = true
  try {
    await actions.activateCurrency(id)
    ElMessage.success('Pul birligi işjeňleşdirildi!')
  } catch (error) {
    ElMessage.error('Işjeňleşdirip bolmady.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="admin-currencies space-y-8 pb-10">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-xs text-gray-500 mt-0.5">Ulgamdaky pul birliklerini goşup, aýryp we haýsysynyň işjeň bolmalydygyny saýlap bilersiňiz.</p>
      </div>
      <button 
        @click="openAdd"
        class="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-600/20 cursor-pointer"
      >
        <el-icon><Plus /></el-icon>
        Täze pul birligini goş
      </button>
    </div>

    <!-- Active Overview Banner -->
    <div class="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 p-8 text-white shadow-xl border border-white/5">
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-red-600/15 rounded-full blur-[80px] pointer-events-none"></div>
      <div class="relative z-10">
        <h3 class="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Häzirki işjeň pul birligi</h3>
        <div v-if="store.activeCurrency" class="flex items-baseline gap-3">
          <span class="text-4xl font-black text-white">{{ store.activeCurrency.name }}</span>
          <span class="text-xl font-bold text-gray-400">({{ store.activeCurrency.code }} - "{{ store.activeCurrency.symbol }}")</span>
        </div>
        <div v-else class="text-xl font-bold text-gray-300">Işjeň pul birligi ýok (Manat fallback hökmünde ulanylýar)</div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
      <el-table 
        v-loading="loading"
        :data="store.currencies" 
        style="width: 100%"
        class="rounded-2xl border border-gray-100 overflow-hidden"
      >
        <el-table-column label="Ady" prop="name">
          <template #default="{ row }">
            <span class="font-bold text-slate-900">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Kody (Code)" prop="code" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="info" class="!rounded-md !font-bold">{{ row.code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Belgisi (Symbol)" prop="symbol" width="150">
          <template #default="{ row }">
            <span class="font-mono bg-slate-100 px-2.5 py-1 rounded-md text-xs font-bold">"{{ row.symbol }}"</span>
          </template>
        </el-table-column>
        <el-table-column label="Ýagdaýy" width="150">
          <template #default="{ row }">
            <span 
              v-if="row.is_active" 
              class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-200 text-xs font-black rounded-full"
            >
              <span class="w-1.5 h-1.5 bg-green-600 rounded-full animate-ping"></span>
              Işjeň
            </span>
            <span 
              v-else 
              class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 text-xs font-bold rounded-full"
            >
              Işjeň däl
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Hereketler" width="220" align="right">
          <template #default="{ row }">
            <div class="flex justify-end gap-2">
              <button 
                v-if="!row.is_active"
                @click="handleActivate(row.id)"
                class="p-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 hover:border-green-300 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                title="Işjeň et"
              >
                <el-icon class="text-sm"><Check /></el-icon>
              </button>
              <button 
                @click="openEdit(row)"
                class="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 hover:border-amber-300 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                title="Redaktirle"
              >
                <el-icon class="text-sm"><Edit /></el-icon>
              </button>
              <button 
                @click="handleDelete(row.id)"
                class="p-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                title="Öçür"
              >
                <el-icon class="text-sm"><Delete /></el-icon>
              </button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? 'Pul birligini redaktirlemek' : 'Täze pul birligi goşmak'"
      width="500px"
      class="!rounded-3xl"
      append-to-body
    >
      <div v-loading="loading" class="space-y-6 text-slate-900">
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Pul birliginiň ady</label>
          <el-input v-model="form.name" placeholder="Mysal üçin: Manat, Dollar" class="!rounded-xl"></el-input>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Kody (Code)</label>
            <el-input v-model="form.code" placeholder="Mysal üçin: TMT, USD" class="!rounded-xl"></el-input>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Belgisi (Symbol)</label>
            <el-input v-model="form.symbol" placeholder="Mysal üçin: m., $" class="!rounded-xl"></el-input>
          </div>
        </div>
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div>
            <div class="text-sm font-bold text-slate-850">Gönümel işjeňleşdir</div>
            <div class="text-xs text-gray-400">Bu pul birligini häzirki işjeň pul birligi hökmünde belle.</div>
          </div>
          <el-switch v-model="form.is_active" active-color="#dc2626"></el-switch>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button 
            type="button"
            @click="dialogVisible = false"
            class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors cursor-pointer"
          >
            Ýatyr
          </button>
          <button 
            type="button"
            @click="onSave"
            class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-red-600/10 cursor-pointer"
          >
            Sakla
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
:deep(.el-input__wrapper, .el-textarea__inner) {
  border-radius: 0.75rem !important;
}
</style>
