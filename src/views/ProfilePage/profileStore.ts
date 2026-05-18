import { reactive } from 'vue'

export const profilePageStore = reactive({
  loading: false,
  changingPassword: false,
  notifications: [] as any[],
  unreadCount: 0,
})

export function resetProfilePageStore() {
  profilePageStore.loading = false
  profilePageStore.changingPassword = false
  profilePageStore.notifications = []
  profilePageStore.unreadCount = 0
}
