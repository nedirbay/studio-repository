<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { store, actions, formatPrice } from '../../../store'
import type { Product } from '../../../types'
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { baseMediaURL } from '../../../utils/request'
import ProductDialog from './components/ProductDialog.vue'

const windowWidth = ref(window.innerWidth)
const currentPage = ref(1)
const pageSize = ref(10)

const clearOrderAlert = () => {
  store.latestOrderAlert = null
}
const updateWidth = () => { windowWidth.value = window.innerWidth }
onMounted(async () => {
  window.addEventListener('resize', updateWidth)
  await Promise.all([
    actions.fetchProducts(),
    actions.fetchCategories(),
    actions.fetchBrands()
  ])
})
onUnmounted(() => window.removeEventListener('resize', updateWidth))

const searchQuery = ref('')
const selectedCategory = ref('')
const dialogVisible = ref(false)
const isEditing = ref(false)

const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return baseMediaURL + url
}

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
  specifications: {}
}

const form = ref<any>({ ...initialForm })

const filteredProducts = computed(() => {
  return store.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          (p.brand && p.brand.toLowerCase().includes(searchQuery.value.toLowerCase()))
    const matchesCategory = !selectedCategory.value || p.category === selectedCategory.value
    return matchesSearch && matchesCategory
  }).reverse()
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProducts.value.slice(start, end)
})

watch([searchQuery, selectedCategory], () => {
  currentPage.value = 1
})

const openAdd = () => {
  isEditing.value = false
  form.value = { ...initialForm, specifications: {} }
  dialogVisible.value = true
}

const openEdit = (product: any) => {
  isEditing.value = true
  form.value = JSON.parse(JSON.stringify(product))
  dialogVisible.value = true
}

const onProductSave = async (savedForm: any) => {
  // ProductDialog emits backend field names; only category still comes as name string
  // Resolve category name → ID before sending to store
  const categoryId = typeof savedForm.category === 'number'
    ? savedForm.category
    : store.categories.find(c => c.name === savedForm.category)?.id

  const payload = {
    ...savedForm,
    category: categoryId
  }

  try {
    if (isEditing.value) {
      await actions.updateProduct(payload)
      ElMessage.success('Haryt täzelendi')
    } else {
      await actions.addProduct(payload)
      ElMessage.success('Täze haryt goşuldy')
    }
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error('Sazlama wagtynda ýalňyşlyk ýüze çykdy')
  }
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
</script>

<template>
  <div class="space-y-6 animate-fade-in pb-20">
    <!-- Real-time Order Alert -->
    <el-alert
      v-if="store.latestOrderAlert"
      title="Täze Sargyt Geldi!"
      type="success"
      show-icon
      closable
      @close="clearOrderAlert"
      class="!rounded-3xl border border-green-200 shadow-sm p-4 animate-fade-in"
    >
      <div class="mt-2 text-xs font-semibold space-y-1 text-green-800">
        <div><strong>Müşderi:</strong> {{ store.latestOrderAlert.customer_name }}</div>
        <div><strong>Telefon:</strong> {{ store.latestOrderAlert.customer_phone }}</div>
        <div><strong>Jemi baha:</strong> {{ formatPrice(store.latestOrderAlert.total_amount) }}</div>
        <div class="mt-2">
          <router-link to="/admin/orders" class="text-green-600 hover:text-green-800 underline font-black">
            Sargytlara git →
          </router-link>
        </div>
      </div>
    </el-alert>

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
        :data="paginatedProducts" 
        style="width: 100%" 
        class="admin-table"
        header-cell-class-name="admin-table-header"
      >
        <el-table-column width="100" label="Suraty">
          <template #default="scope">
            <div class="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden">
              <img :src="getImageUrl(scope.row.image)" class="w-full h-full object-cover" />
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
              <span class="font-black text-red-600">{{ formatPrice(scope.row.price) }}</span>
              <span v-if="scope.row.originalPrice" class="text-[10px] text-gray-400 line-through font-bold">{{ formatPrice(scope.row.originalPrice) }}</span>
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

    <!-- Pagination -->
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
      <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">
        Jemi: {{ filteredProducts.length }} haryt
      </span>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="sizes, prev, pager, next, jumper"
        :total="filteredProducts.length"
        background
        class="admin-pagination"
      />
    </div>

    <!-- Edit/Add Dialog -->
    <ProductDialog
      v-model:visible="dialogVisible"
      :is-editing="isEditing"
      :product="form"
      :window-width="windowWidth"
      @save="onProductSave"
    />
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
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}


</style>
