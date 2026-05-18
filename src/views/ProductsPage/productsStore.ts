import { reactive } from 'vue'
import type { Product } from '../../types'

export const productsPageStore = reactive({
  loading: false,
  filter: {
    category: null as string | null,
    brand: null as string | null,
    inStockOnly: false,
    minPrice: 0,
    maxPrice: 0,
    sort: 'popular' as 'popular' | 'price-asc' | 'price-desc' | 'rating',
  },
  visibleProducts: [] as Product[],
})

export function resetProductsPageStore() {
  productsPageStore.loading = false
  productsPageStore.filter.category = null
  productsPageStore.filter.brand = null
  productsPageStore.filter.inStockOnly = false
  productsPageStore.filter.minPrice = 0
  productsPageStore.filter.maxPrice = 0
  productsPageStore.filter.sort = 'popular'
  productsPageStore.visibleProducts = []
}
