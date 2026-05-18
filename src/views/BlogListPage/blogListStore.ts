import { reactive } from 'vue'

export const blogListPageStore = reactive({
  loading: false,
  page: 1,
  pageSize: 6,
  totalCount: 0,
  items: [] as any[],
})

export function resetBlogListStore() {
  blogListPageStore.loading = false
  blogListPageStore.page = 1
  blogListPageStore.totalCount = 0
  blogListPageStore.items = []
}
