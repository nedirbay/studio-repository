<script setup lang="ts">
import { ref, computed } from 'vue'
import { store, actions } from '../../store'
import type { Product } from '../../types'
import { 
  Plus, 
  Edit, 
  Delete, 
  Search, 
  Close
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchQuery = ref('')
const selectedCategory = ref('')
const dialogVisible = ref(false)
const isEditing = ref(false)

const initialForm: Omit<Product, 'id'> = {
  name: '',
  price: 0,
  originalPrice: 0,
  image: 'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=400',
  category: '',
  badge: undefined,
  rating: 5,
  reviews: 0,
  brand: '',
  inStock: true,
  description: '',
  features: [],
  specifications: {}
}

const form = ref<Product | Omit<Product, 'id'>>({ ...initialForm })

const filteredProducts = computed(() => {
  return store.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         p.brand?.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = !selectedCategory.value || p.category === selectedCategory.value
    return matchesSearch && matchesCategory
  }).reverse()
})

const openAdd = () => {
  isEditing.value = false
  form.value = { ...initialForm, features: [], specifications: {} }
  dialogVisible.value = true
}

const openEdit = (product: any) => {
  isEditing.value = true
  form.value = JSON.parse(JSON.stringify(product))
  dialogVisible.value = true
}

const handleSave = () => {
  if (!form.value.name || !form.value.category || !form.value.price) {
    ElMessage.warning('Adyny, kategoriýasyny we bahasyny dolduryň')
    return
  }

  if (isEditing.value) {
    actions.updateProduct(form.value as Product)
    ElMessage.success('Haryt täzelendi')
  } else {
    actions.addProduct(form.value as Omit<Product, 'id'>)
    ElMessage.success('Täze haryt goşuldy')
  }
  
  dialogVisible.value = false
}

const handleDelete = (id: number) => {
  ElMessageBox.confirm(
    'Bu harydy pozmak isleýärsiňizmi?',
    'Pozmak tassyklama',
    {
      confirmButtonText: 'Poz',
      cancelButtonText: 'Sakla',
      type: 'warning',
    }
  ).then(() => {
    actions.deleteProduct(id)
    ElMessage.success('Haryt pozuldy')
  })
}

// Helpers for features/specs
const newFeature = ref('')
const addFeature = () => {
  if (newFeature.value && form.value.features) {
    form.value.features.push(newFeature.value)
    newFeature.value = ''
  }
}
const removeFeature = (index: number) => {
  if (form.value.features) {
    form.value.features.splice(index, 1)
  }
}
</script>

<template>
  <div class="space-y-6 animate-fade-in pb-20">
    <!-- Header Actions -->
    <div class="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
      <div class="flex flex-wrap gap-4 w-full lg:w-auto">
        <div class="relative w-full sm:w-64 group">
          <el-input
            v-model="searchQuery"
            placeholder="Haryt gözle..."
            class="admin-search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <el-select 
          v-model="selectedCategory" 
          placeholder="Kategoriýa" 
          clearable 
          class="admin-select w-full sm:w-48"
        >
          <el-option
            v-for="cat in store.categories"
            :key="cat.slug"
            :label="cat.name"
            :value="cat.name"
          />
        </el-select>
      </div>
      
      <el-button 
        type="primary" 
        size="large" 
        class="!rounded-2xl !px-8 !font-black !h-12 shadow-lg shadow-red-600/20" 
        @click="openAdd"
      >
        <el-icon class="mr-2"><Plus /></el-icon>
        Täze haryt
      </el-button>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <el-table 
        :data="filteredProducts" 
        style="width: 100%" 
        class="admin-table"
        header-cell-class-name="admin-table-header"
      >
        <el-table-column width="100" label="Suraty">
          <template #default="scope">
            <div class="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden">
              <img :src="scope.row.image" class="w-full h-full object-cover" />
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="Harydyň ady" min-width="250">
          <template #default="scope">
            <div class="flex flex-col">
              <span class="font-black text-slate-900 leading-tight">{{ scope.row.name }}</span>
              <span class="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{{ scope.row.brand }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="category" label="Kategoriýa" width="150">
          <template #default="scope">
            <el-tag size="small" type="info" class="!rounded-lg !bg-gray-50 !border-gray-100 !text-gray-500 font-bold">
              {{ scope.row.category }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="Baha" width="120" sortable sort-by="price">
          <template #default="scope">
            <div class="flex flex-col">
              <span class="font-black text-red-600">${{ scope.row.price }}</span>
              <span v-if="scope.row.originalPrice" class="text-[10px] text-gray-400 line-through font-bold">${{ scope.row.originalPrice }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Ýagdaýy" width="120">
          <template #default="scope">
            <el-tag 
              :type="scope.row.inStock ? 'success' : 'danger'" 
              size="small"
              class="!rounded-lg font-black uppercase tracking-widest text-[8px] px-2"
            >
              {{ scope.row.inStock ? 'BAR' : 'ÝOK' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Amallar" width="150" align="right">
          <template #default="scope">
            <div class="flex gap-2 justify-end px-4">
              <el-button 
                circle 
                :icon="Edit" 
                size="small"
                @click="openEdit(scope.row)"
                class="!bg-blue-50 !text-blue-600 !border-none hover:!bg-blue-600 hover:!text-white transition-all"
              />
              <el-button 
                circle 
                :icon="Delete" 
                size="small"
                @click="handleDelete(scope.row.id)"
                class="!bg-red-50 !text-red-600 !border-none hover:!bg-red-600 hover:!text-white transition-all"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Edit/Add Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? 'Harydy üýtgetmek' : 'Täze haryt goşmak'"
      width="800px"
      class="admin-dialog"
      align-center
    >
      <div class="max-h-[70vh] overflow-y-auto px-4 custom-scrollbar">
        <el-form :model="form" label-position="top" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <el-form-item label="Haryt ady" class="md:col-span-2">
            <el-input v-model="form.name" placeholder="Harydyň doly ady" />
          </el-form-item>
          
          <el-form-item label="Kategoriýa">
            <el-select v-model="form.category" placeholder="Saýlaň" class="w-full">
              <el-option
                v-for="cat in store.categories"
                :key="cat.slug"
                :label="cat.name"
                :value="cat.name"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="Brend">
            <el-input v-model="form.brand" placeholder="Mysal üçin: ASUS" />
          </el-form-item>
          
          <el-form-item label="Baha ($)">
            <el-input-number v-model="form.price" :min="0" class="!w-full" />
          </el-form-item>
          
          <el-form-item label="Köne baha ($)">
            <el-input-number v-model="form.originalPrice" :min="0" class="!w-full" />
          </el-form-item>
          
          <el-form-item label="Surat URL">
            <el-input v-model="form.image" placeholder="Suratyň salgysy" />
          </el-form-item>
          
          <el-form-item label="Badge (Bellik)">
            <el-select v-model="form.badge" placeholder="Saýlamaly däl" clearable class="w-full">
              <el-option label="Sale (Arzanladyş)" value="sale" />
              <el-option label="New (Täze)" value="new" />
              <el-option label="Hot (Mäşhur)" value="hot" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="Galyndyda barmy?">
            <el-switch v-model="form.inStock" active-text="Bar" inactive-text="Ýok" />
          </el-form-item>
          
          <el-form-item label="Düşündiriş" class="md:col-span-2">
            <el-input v-model="form.description" type="textarea" :rows="3" placeholder="Haryt barada giňişleýin maglumat..." />
          </el-form-item>

          <!-- Dynamic Features -->
          <el-form-item label="Aýratynlyklar (Features)" class="md:col-span-2">
            <div class="space-y-2">
              <div v-for="(_, idx) in form.features" :key="idx" class="flex gap-2">
                <el-input v-model="form.features![idx]" />
                <el-button link type="danger" @click="removeFeature(idx)"><el-icon><Close /></el-icon></el-button>
              </div>
              <div class="flex gap-2">
                <el-input v-model="newFeature" placeholder="Täze aýratynlyk..." @keyup.enter="addFeature" />
                <el-button type="primary" plain @click="addFeature"><el-icon><Plus /></el-icon></el-button>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="flex gap-3 justify-end mt-4 px-4 pb-4">
          <el-button @click="dialogVisible = false" class="!rounded-xl">Bes et</el-button>
          <el-button type="primary" @click="handleSave" class="!rounded-xl !px-10 !font-black h-12">Harydy sakla</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin-table :deep(.admin-table-header) {
  background-color: rgba(249, 250, 251, 0.5);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #9ca3af;
  padding-top: 1rem;
  padding-bottom: 1rem;
}
.admin-search-input :deep(.el-input__wrapper),
.admin-select :deep(.el-input__wrapper) {
  border-radius: 1rem !important;
  height: 3rem;
  box-shadow: none;
  border: 1px solid #e5e7eb;
  background-color: white;
  transition: all 0.2s;
}
.admin-search-input :deep(.el-input__wrapper:hover),
.admin-select :deep(.el-input__wrapper:hover) {
  border-color: #fecaca;
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

:deep(.admin-dialog) {
  border-radius: 2.5rem; /* rounded-[40px] */
  overflow: hidden;
}
:deep(.admin-dialog .el-dialog__header) {
  padding-top: 2.5rem;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  margin-bottom: 0;
}
:deep(.admin-dialog .el-dialog__title) {
  font-size: 1.5rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.025em;
}
:deep(.admin-dialog .el-dialog__body) {
  padding-top: 1rem;
}
:deep(.admin-dialog .el-form-item__label) {
  font-weight: 900;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}
:deep(.admin-dialog .el-input__wrapper),
:deep(.admin-dialog .el-textarea__inner),
:deep(.admin-dialog .el-input-number) {
  border-radius: 0.75rem;
  border: 1px solid #f3f4f6;
  box-shadow: none;
  background-color: #f9fafb;
  padding: 0.5rem;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb; /* gray-200 */
  border-radius: 9999px;
}
</style>
