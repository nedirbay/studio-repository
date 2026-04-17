<script setup lang="ts">
import { ref, computed } from 'vue'
import { categories, brands } from '../../data/products'

const props = defineProps<{
  selectedCategories: string[]
  selectedBrands: string[]
  priceRange: [number, number]
  selectedRatings: number[]
  inStockOnly: boolean
  onSaleOnly: boolean
  activeFiltersCount: number
}>()

const emit = defineEmits<{
  'update:categories': [value: string[]]
  'update:brands': [value: string[]]
  'update:price': [value: [number, number]]
  'update:ratings': [value: number[]]
  'update:inStock': [value: boolean]
  'update:onSale': [value: boolean]
  'clear-all': []
  'apply': []
}>()

// Local price range for slider
const localPriceRange = ref<[number, number]>(props.priceRange)

// Category options from data
const categoryOptions = computed(() => 
  categories.map(c => ({
    label: c.name,
    value: c.name,
    count: c.count,
    icon: c.icon
  }))
)

// Brand options
const brandOptions = computed(() => 
  brands.map(b => ({
    label: b.name,
    value: b.name
  }))
)

// Rating options
const ratingOptions = [
  { value: 4, label: '4 ýyldyz we ýokary' },
  { value: 3, label: '3 ýyldyz we ýokary' },
  { value: 2, label: '2 ýyldyz we ýokary' },
  { value: 1, label: '1 ýyldyz we ýokary' }
]

// Expanded sections
const expandedSections = ref({
  categories: true,
  brands: true,
  price: true,
  ratings: false,
  availability: false
})

function toggleSection(section: keyof typeof expandedSections.value) {
  expandedSections.value[section] = !expandedSections.value[section]
}

function handleCategoryChange(category: string) {
  const newCategories = props.selectedCategories.includes(category)
    ? props.selectedCategories.filter(c => c !== category)
    : [...props.selectedCategories, category]
  emit('update:categories', newCategories)
}

function handleBrandChange(brand: string) {
  const newBrands = props.selectedBrands.includes(brand)
    ? props.selectedBrands.filter(b => b !== brand)
    : [...props.selectedBrands, brand]
  emit('update:brands', newBrands)
}

function handlePriceChange() {
  emit('update:price', localPriceRange.value)
}

function handleRatingChange(rating: number) {
  const newRatings = props.selectedRatings.includes(rating)
    ? props.selectedRatings.filter(r => r !== rating)
    : [...props.selectedRatings, rating]
  emit('update:ratings', newRatings)
}
</script>

<template>
  <div class="filter-panel">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
      <h3 class="font-semibold text-gray-900">Filtrler</h3>
      <button
        v-if="activeFiltersCount > 0"
        @click="$emit('clear-all')"
        class="text-sm text-red-600 hover:text-red-700 font-medium"
      >
        Ählisini arassala
      </button>
    </div>

    <!-- Categories -->
    <div class="filter-section">
      <button
        @click="toggleSection('categories')"
        class="filter-header"
      >
        <span class="font-medium text-gray-700">Kategoriýalar</span>
        <el-icon :class="['transition-transform', expandedSections.categories && 'rotate-180']">
          <ArrowDown />
        </el-icon>
      </button>
      <div v-show="expandedSections.categories" class="filter-content">
        <label
          v-for="option in categoryOptions"
          :key="option.value"
          class="filter-checkbox"
        >
          <el-checkbox
            :model-value="selectedCategories.includes(option.value)"
            @change="handleCategoryChange(option.value)"
          />
          <span class="flex items-center gap-2">
            <span class="text-sm">{{ option.icon }}</span>
            <span class="text-sm text-gray-700">{{ option.label }}</span>
          </span>
          <span class="text-xs text-gray-400 ml-auto">({{ option.count }})</span>
        </label>
      </div>
    </div>

    <!-- Brands -->
    <div class="filter-section">
      <button
        @click="toggleSection('brands')"
        class="filter-header"
      >
        <span class="font-medium text-gray-700">Brendler</span>
        <el-icon :class="['transition-transform', expandedSections.brands && 'rotate-180']">
          <ArrowDown />
        </el-icon>
      </button>
      <div v-show="expandedSections.brands" class="filter-content">
        <label
          v-for="option in brandOptions"
          :key="option.value"
          class="filter-checkbox"
        >
          <el-checkbox
            :model-value="selectedBrands.includes(option.value)"
            @change="handleBrandChange(option.value)"
          />
          <span class="text-sm text-gray-700">{{ option.label }}</span>
        </label>
      </div>
    </div>

    <!-- Price Range -->
    <div class="filter-section">
      <button
        @click="toggleSection('price')"
        class="filter-header"
      >
        <span class="font-medium text-gray-700">Baha aralygy</span>
        <el-icon :class="['transition-transform', expandedSections.price && 'rotate-180']">
          <ArrowDown />
        </el-icon>
      </button>
      <div v-show="expandedSections.price" class="filter-content">
        <div class="mb-4">
          <el-slider
            v-model="localPriceRange"
            range
            :min="0"
            :max="3000"
            :step="50"
            @change="handlePriceChange"
          />
        </div>
        <div class="flex items-center gap-2">
          <el-input
            :model-value="localPriceRange[0]"
            @input="(val: string) => localPriceRange[0] = Number(val)"
            @change="handlePriceChange"
            size="small"
            class="price-input"
          >
            <template #prepend>$</template>
          </el-input>
          <span class="text-gray-400">-</span>
          <el-input
            :model-value="localPriceRange[1]"
            @input="(val: string) => localPriceRange[1] = Number(val)"
            @change="handlePriceChange"
            size="small"
            class="price-input"
          >
            <template #prepend>$</template>
          </el-input>
        </div>
      </div>
    </div>

    <!-- Ratings -->
    <div class="filter-section">
      <button
        @click="toggleSection('ratings')"
        class="filter-header"
      >
        <span class="font-medium text-gray-700">Reýtingler</span>
        <el-icon :class="['transition-transform', expandedSections.ratings && 'rotate-180']">
          <ArrowDown />
        </el-icon>
      </button>
      <div v-show="expandedSections.ratings" class="filter-content">
        <label
          v-for="option in ratingOptions"
          :key="option.value"
          class="filter-checkbox"
        >
          <el-checkbox
            :model-value="selectedRatings.includes(option.value)"
            @change="handleRatingChange(option.value)"
          />
          <div class="flex items-center gap-1">
            <el-rate
              :model-value="option.value"
              disabled
              :colors="['#f59e0b', '#f59e0b', '#f59e0b']"
              size="small"
            />
            <span class="text-xs text-gray-500">we ýokary</span>
          </div>
        </label>
      </div>
    </div>

    <!-- Availability -->
    <div class="filter-section">
      <button
        @click="toggleSection('availability')"
        class="filter-header"
      >
        <span class="font-medium text-gray-700">Elýeterlilik</span>
        <el-icon :class="['transition-transform', expandedSections.availability && 'rotate-180']">
          <ArrowDown />
        </el-icon>
      </button>
      <div v-show="expandedSections.availability" class="filter-content">
        <label class="filter-checkbox">
          <el-checkbox
            :model-value="inStockOnly"
            @change="(val: boolean) => $emit('update:inStock', val)"
          />
          <span class="text-sm text-gray-700">Diňe ammarda barlar</span>
        </label>
        <label class="filter-checkbox">
          <el-checkbox
            :model-value="onSaleOnly"
            @change="(val: boolean) => $emit('update:onSale', val)"
          />
          <span class="text-sm text-gray-700">Arzanladyşda</span>
        </label>
      </div>
    </div>

    <!-- Apply Button (for mobile) -->
    <div class="mt-6 pt-4 border-t border-gray-200 lg:hidden">
      <button
        @click="$emit('apply')"
        class="w-full btn-primary py-3"
      >
        Filtrleri ulan
      </button>
    </div>
  </div>
</template>

<style scoped>
.filter-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-section {
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.filter-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.filter-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.filter-content {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 0;
}

.filter-checkbox:hover {
  color: #dc2626;
}

.price-input {
  width: 90px;
}

.price-input :deep(.el-input__wrapper) {
  border-radius: 6px;
}

.price-input :deep(.el-input-group__prepend) {
  border-radius: 6px 0 0 6px;
  background: #f9fafb;
}

:deep(.el-slider__bar) {
  background: linear-gradient(90deg, #dc2626, #b91c1c);
}

:deep(.el-slider__button) {
  border-color: #dc2626;
}
</style>
