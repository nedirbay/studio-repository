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
      <el-button type="primary" @click="openAdd">
        <el-icon><Plus /></el-icon>
        Täze pul birligini goş
      </el-button>
    </div>

    <!-- Active Overview Banner -->
    <div class="bg-white rounded-md border border-gray-200 p-5">
      <div>
        <h3 class="text-sm font-medium text-gray-600 mb-2">Häzirki işjeň pul birligi</h3>
        <div v-if="store.activeCurrency" class="flex items-baseline gap-3">
          <span class="text-2xl font-semibold text-gray-900">{{ store.activeCurrency.name }}</span>
          <span class="text-base text-gray-600">({{ store.activeCurrency.code }} - "{{ store.activeCurrency.symbol }}")</span>
        </div>
        <div v-else class="text-base text-gray-700">Işjeň pul birligi ýok (Manat ulanylýar)</div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white p-4 md:p-5 rounded-md border border-gray-200">
      <el-table 
        v-loading="loading"
        :data="store.currencies" 
        style="width: 100%"
      class="rounded-md border border-gray-200 overflow-hidden"
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
      class="admin-dialog"
      append-to-body
    >
      <el-form :model="form" label-position="top" v-loading="loading">
        <el-form-item label="Pul birliginiň ady">
          <el-input v-model="form.name" placeholder="Mysal üçin: Manat ýa-da Dollar" />
        </el-form-item>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <el-form-item label="Kody">
            <el-input v-model="form.code" placeholder="Mysal üçin: TMT ýa-da USD" />
          </el-form-item>
          <el-form-item label="Belgisi">
            <el-input v-model="form.symbol" placeholder="Mysal üçin: m. ýa-da $" />
          </el-form-item>
        </div>
        <div class="flex items-center justify-between py-3 border-t border-gray-200">
          <div>
            <div class="text-sm font-medium text-gray-900">Işjeň pul birligi edip belle</div>
            <div class="text-sm text-gray-600">Bu saýlaw öňki işjeň pul birligini çalyşar.</div>
          </div>
          <el-switch v-model="form.is_active" active-color="#dc2626"></el-switch>
        </div>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="dialogVisible = false">Ýatyr</el-button>
          <el-button type="primary" :loading="loading" @click="onSave">Sakla</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
