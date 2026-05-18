import { AuthRepository } from '../LoginPage/authRepository'
import { NotificationRepository } from './notificationRepository'

const auth = new AuthRepository()
const notifications = new NotificationRepository()

export const profileService = {
  me() {
    return auth.me()
  },
  changePassword(payload: { old_password: string; new_password: string }) {
    return auth.changePassword(payload)
  },
  listNotifications() {
    return notifications.list()
  },
  markNotificationsRead() {
    return notifications.markAllRead()
  },
  removeNotification(id: number) {
    return notifications.remove(id)
  },
}
