import { reactive } from 'vue'

export const blogDetailPageStore = reactive({
  loading: false,
  post: null as any,
})

export function resetBlogDetailStore() {
  blogDetailPageStore.loading = false
  blogDetailPageStore.post = null
}
