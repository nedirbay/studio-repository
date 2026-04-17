import { reactive, watch } from 'vue'
import { allProducts as initialProducts, categories as initialCategories, banners as initialBanners, brands as initialBrands } from '../data/products'
import type { Product, Category, Banner, Brand } from '../types'

const STORAGE_KEY = 'doganlar_store_data'

interface StoreState {
  products: Product[]
  categories: Category[]
  banners: Banner[]
  brands: Brand[]
  initialized: boolean
}

// Load from local storage or use initial data
const savedData = localStorage.getItem(STORAGE_KEY)
const parsedData = savedData ? JSON.parse(savedData) : null

export const store = reactive<StoreState>({
  products: parsedData?.products || initialProducts,
  categories: parsedData?.categories || initialCategories,
  banners: parsedData?.banners || initialBanners,
  brands: parsedData?.brands || initialBrands,
  initialized: true
})

// Persistence
watch(
  () => ({
    products: store.products,
    categories: store.categories,
    banners: store.banners,
    brands: store.brands
  }),
  (state) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  },
  { deep: true }
)

// Actions
export const actions = {
  // Products
  addProduct(product: Omit<Product, 'id'>) {
    const id = Math.max(0, ...store.products.map(p => p.id)) + 1
    store.products.push({ ...product, id })
  },
  updateProduct(product: Product) {
    const index = store.products.findIndex(p => p.id === product.id)
    if (index !== -1) {
      store.products[index] = { ...product }
    }
  },
  deleteProduct(id: number) {
    store.products = store.products.filter(p => p.id !== id)
  },

  // Categories
  addCategory(category: Omit<Category, 'id'>) {
    const id = Math.max(0, ...store.categories.map(c => c.id)) + 1
    store.categories.push({ ...category, id })
  },
  updateCategory(category: Category) {
    const index = store.categories.findIndex(c => c.id === category.id)
    if (index !== -1) {
      store.categories[index] = { ...category }
    }
  },
  deleteCategory(id: number) {
    // Check if category has products
    const category = store.categories.find(c => c.id === id)
    if (category) {
      // Optional: Prevent deletion if products exist or just delete
      store.categories = store.categories.filter(c => c.id !== id)
    }
  }
}
