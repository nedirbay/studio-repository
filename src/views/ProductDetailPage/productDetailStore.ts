import { reactive } from 'vue'
import type { ProductReview } from '../../types'

export const productDetailPageStore = reactive({
  loading: false,
  product: null as any,
  reviews: [] as ProductReview[],
  selectedImageIndex: 0,
  quantity: 1,
  reviewForm: {
    rating: 5,
    title: '',
    content: '',
  },
})

export function resetProductDetailPageStore() {
  productDetailPageStore.loading = false
  productDetailPageStore.product = null
  productDetailPageStore.reviews = []
  productDetailPageStore.selectedImageIndex = 0
  productDetailPageStore.quantity = 1
  productDetailPageStore.reviewForm.rating = 5
  productDetailPageStore.reviewForm.title = ''
  productDetailPageStore.reviewForm.content = ''
}
