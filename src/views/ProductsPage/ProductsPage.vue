<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '../../components/shared/ProductCard.vue'
import FilterPanel from '../../components/products/FilterPanel.vue'
import { store, actions } from '../../store'

const route = useRoute()

onMounted(() => {
  void actions.fetchProductCatalogue()
})

// Search and filter state
const searchQuery = ref('')
const sortBy = ref('featured')
const viewMode = ref<'grid' | 'list'>('grid')
const showMobileFilter = ref(false)

// Filter state
const selectedCategories = ref<string[]>([])
const selectedBrands = ref<string[]>([])
const priceRange = ref<[number, number]>([0, 3000])
const priceMax = computed(() => Math.max(
  3000,
  ...store.products.map(product => Number(product.price) || 0)
))
watch(priceMax, (nextMax, previousMax) => {
  if (priceRange.value[1] >= previousMax) {
    priceRange.value = [priceRange.value[0], nextMax]
  }
})
const inStockOnly = ref(false)
const onSaleOnly = ref(false)

// Pagination
const currentPage = ref(1)
const itemsPerPage = 12

// Get all products from store
const allProducts = computed(() => store.products)

// Filtered products
const filteredProducts = computed(() => {
  let products = [...allProducts.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    products = products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    )
  }

  // Category filter
  if (selectedCategories.value.length > 0) {
    products = products.filter(p => 
      selectedCategories.value.includes(p.category)
    )
  }

  // Brand filter
  if (selectedBrands.value.length > 0) {
    products = products.filter(p => 
      selectedBrands.value.includes(p.brand)
    )
  }

  // Price filter
  products = products.filter(p => 
    p.price >= priceRange.value[0] && p.price <= priceRange.value[1]
  )

  // Stock filter
  if (inStockOnly.value) {
    products = products.filter(p => p.inStock)
  }

  // Sale filter
  if (onSaleOnly.value) {
    products = products.filter(p => p.badge === 'sale' || (p.originalPrice && p.originalPrice > p.price))
  }

  // Sort
  switch (sortBy.value) {
    case 'price-low':
      products.sort((a, b) => a.price - b.price)
      break
    case 'price-high':
      products.sort((a, b) => b.price - a.price)
      break
    case 'newest':
      products.sort((a, b) => (b.badge === 'new' ? 1 : 0) - (a.badge === 'new' ? 1 : 0))
      break
    case 'name':
      products.sort((a, b) => a.name.localeCompare(b.name))
      break
  }

  return products
})

// Paginated products
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredProducts.value.slice(start, end)
})

// Total pages
const totalPages = computed(() => 
  Math.ceil(filteredProducts.value.length / itemsPerPage)
)

// Active filters count
const activeFiltersCount = computed(() => {
  let count = 0
  count += selectedCategories.value.length
  count += selectedBrands.value.length
  if (priceRange.value[0] > 0 || priceRange.value[1] < priceMax.value) count++
  if (inStockOnly.value) count++
  if (onSaleOnly.value) count++
  return count
})

// Clear all filters
function clearAllFilters() {
  selectedCategories.value = []
  selectedBrands.value = []
  priceRange.value = [0, priceMax.value]
  inStockOnly.value = false
  onSaleOnly.value = false
  searchQuery.value = ''
  currentPage.value = 1
}

// Handle page change
function handlePageChange(page: number) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Handle filter updates from FilterPanel
function handleCategoryChange(categories: string[]) {
  selectedCategories.value = categories
  currentPage.value = 1
}

function handleBrandChange(brands: string[]) {
  selectedBrands.value = brands
  currentPage.value = 1
}

function handlePriceChange(range: [number, number]) {
  priceRange.value = range
  currentPage.value = 1
}

// Category from route
watch(() => route.params.category, (category) => {
  if (category) {
    const cat = store.categories.find(c => c.slug === category)
    if (cat) {
      selectedCategories.value = [cat.name]
    }
  }
}, { immediate: true })

// Reset page on search
watch(searchQuery, () => {
  currentPage.value = 1
})

// Brand from query
watch(() => route.query.brand, (brandName) => {
  if (brandName && typeof brandName === 'string') {
    // If brand is in query, ensure it's selected
    if (!selectedBrands.value.includes(brandName)) {
      selectedBrands.value = [brandName]
    }
  }
}, { immediate: true })
</script>

<template>
  <main class="bg-gray-50 min-h-screen">
    <!-- Page Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Ähli harytlar</h1>
            <p class="text-sm text-gray-500 mt-1">
              {{ filteredProducts.length }} harytdan {{ paginatedProducts.length }}-sy görkezilýär
            </p>
          </div>
          
          <!-- Search Bar -->
          <div class="flex-1 max-w-md">
            <el-input
              v-model="searchQuery"
              placeholder="Haryt gözle..."
              size="large"
              class="search-box"
              clearable
            >
              <template #prefix>
                <el-icon class="text-gray-400"><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex gap-6">
        <!-- Filter Panel - Desktop -->
        <aside class="hidden lg:block w-64 shrink-0">
          <FilterPanel
            :selected-categories="selectedCategories"
            :selected-brands="selectedBrands"
            :price-range="priceRange"
            :price-max="priceMax"
            :in-stock-only="inStockOnly"
            :on-sale-only="onSaleOnly"
            :active-filters-count="activeFiltersCount"
            @update:categories="handleCategoryChange"
            @update:brands="handleBrandChange"
            @update:price="handlePriceChange"
            @update:in-stock="(val: boolean) => inStockOnly = val"
            @update:on-sale="(val: boolean) => onSaleOnly = val"
            @clear-all="clearAllFilters"
          />
        </aside>

        <!-- Main Content -->
        <div class="flex-1">
          <!-- Toolbar -->
          <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <!-- Mobile Filter Button -->
              <button
                @click="showMobileFilter = true"
                class="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <el-icon><Filter /></el-icon>
                Filtrler
                <span v-if="activeFiltersCount > 0" class="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {{ activeFiltersCount }}
                </span>
              </button>

              <!-- Active Filters -->
              <div v-if="activeFiltersCount > 0" class="hidden lg:flex items-center gap-2 flex-wrap">
                <span class="text-sm text-gray-500">Aktiw filtrler:</span>
                <el-tag
                  v-for="cat in selectedCategories"
                  :key="cat"
                  closable
                  @close="selectedCategories = selectedCategories.filter(c => c !== cat)"
                  class="filter-tag"
                >
                  {{ cat }}
                </el-tag>
                <el-tag
                  v-for="brand in selectedBrands"
                  :key="brand"
                  closable
                  @close="selectedBrands = selectedBrands.filter(b => b !== brand)"
                  class="filter-tag"
                >
                  {{ brand }}
                </el-tag>
                <el-tag v-if="inStockOnly" closable @close="inStockOnly = false" class="filter-tag">
                  Ammarda bar
                </el-tag>
                <el-tag v-if="onSaleOnly" closable @close="onSaleOnly = false" class="filter-tag">
                  Arzanladyşda
                </el-tag>
                <button
                  @click="clearAllFilters"
                  class="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Ählisini arassala
                </button>
              </div>

              <div class="flex items-center gap-4 ml-auto">
                <!-- Sort -->
                <el-select v-model="sortBy" placeholder="Tertiplemek" size="default" class="sort-select">
                  <el-option label="Saýlama" value="featured" />
                  <el-option label="Täzeler" value="newest" />
                  <el-option label="Baha: Arzandan gymmada" value="price-low" />
                  <el-option label="Baha: Gymmatdan arzana" value="price-high" />
                  <el-option label="Ady boýunça (A-Z)" value="name" />
                </el-select>

                <!-- View Toggle -->
                <div class="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    @click="viewMode = 'grid'"
                    :class="['p-1.5 rounded transition-colors', viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200']"
                  >
                    <el-icon><Grid /></el-icon>
                  </button>
                  <button
                    @click="viewMode = 'list'"
                    :class="['p-1.5 rounded transition-colors', viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200']"
                  >
                    <el-icon><List /></el-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- No Results -->
          <div v-if="filteredProducts.length === 0" class="bg-white rounded-xl shadow-sm p-12 text-center">
            <el-icon class="text-6xl text-gray-300 mb-4"><Search /></el-icon>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Haryt tapylmady</h3>
            <p class="text-gray-500 mb-4">Gözlegiňizi ýa-da filtrleriňizi üýtgedip görüň</p>
            <button @click="clearAllFilters" class="btn-primary">
              Ähli filtrleri arassala
            </button>
          </div>

          <!-- Product Grid -->
          <div
            v-else
            :class="[
              'grid gap-5',
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            ]"
          >
            <ProductCard
              v-for="product in paginatedProducts"
              :key="product.id"
              :product="product"
              :class="viewMode === 'list' ? 'list-view' : ''"
            />
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-8 flex justify-center">
            <el-pagination
              v-model:current-page="currentPage"
              :page-count="totalPages"
              :page-size="itemsPerPage"
              layout="prev, pager, next, jumper"
              @current-change="handlePageChange"
              background
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Filter Drawer -->
    <el-drawer
      v-model="showMobileFilter"
      direction="ltr"
      size="300px"
      class="filter-drawer"
    >
      <template #header>
        <div class="flex items-center justify-between w-full">
          <span class="text-lg font-semibold">Filtrler</span>
          <button
            v-if="activeFiltersCount > 0"
            @click="clearAllFilters"
            class="text-sm text-red-600 hover:text-red-700"
          >
            Ählisini arassala
          </button>
        </div>
      </template>
      <FilterPanel
        :selected-categories="selectedCategories"
        :selected-brands="selectedBrands"
        :price-range="priceRange"
        :price-max="priceMax"
        :in-stock-only="inStockOnly"
        :on-sale-only="onSaleOnly"
        :active-filters-count="activeFiltersCount"
        @update:categories="handleCategoryChange"
        @update:brands="handleBrandChange"
        @update:price="handlePriceChange"
        @update:in-stock="(val: boolean) => inStockOnly = val"
        @update:on-sale="(val: boolean) => onSaleOnly = val"
        @clear-all="clearAllFilters"
        @apply="showMobileFilter = false"
      />
    </el-drawer>
  </main>
</template>

<style scoped>
.search-box :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-box :deep(.el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2);
}

.sort-select {
  width: 180px;
}

.sort-select :deep(.el-input__wrapper) {
  border-radius: 8px;
}

.filter-tag {
  background: #fee2e2;
  color: #dc2626;
  border: none;
}

.filter-tag :deep(.el-tag__close) {
  color: #dc2626;
}

:deep(.list-view) {
  display: flex;
  flex-direction: row;
}

:deep(.list-view .relative) {
  width: 200px;
  height: 150px;
  flex-shrink: 0;
}

:deep(.list-view .p-4) {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
