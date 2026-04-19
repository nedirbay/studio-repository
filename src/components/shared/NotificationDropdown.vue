<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Bell, SuccessFilled, Warning, InfoFilled, Promotion, Close } from '@element-plus/icons-vue'
import { store, actions } from '../../store'

interface Notification {
  id: number
  title: string
  message: string
  created_at: string
  type: string
  is_read: boolean
}

const notifications = computed<Notification[]>(() => store.notifications)

const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length)

onMounted(() => {
  if (store.isAuthenticated) {
    actions.fetchNotifications()
  }
})

function markAllAsRead() {
  actions.markNotificationsRead()
}

function removeNotification(id: number) {
  actions.deleteNotification(id)
}

function getIcon(type: string) {
  switch (type) {
    case 'order': return SuccessFilled
    case 'system': return Warning
    case 'reply': return InfoFilled
    case 'promo': return Promotion
    default: return Bell
  }
}

function getIconBg(type: string) {
  switch (type) {
    case 'order': return 'bg-green-100 text-green-600'
    case 'system': return 'bg-red-100 text-red-600'
    case 'reply': return 'bg-blue-100 text-blue-600'
    case 'promo': return 'bg-purple-100 text-purple-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

// Format date
function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('tk-TM', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })
}
</script>

<template>
  <el-dropdown trigger="click" placement="bottom-end">
    <div class="relative cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors flex items-center group">
      <el-icon class="text-xl text-gray-700 group-hover:text-red-500 transition-colors">
        <Bell />
      </el-icon>
      <div 
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm"
      >
        {{ unreadCount }}
      </div>
    </div>

    <template #dropdown>
      <div class="w-80 md:w-96 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
        <!-- Header -->
        <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 class="font-bold text-gray-800">Bildirişler</h3>
          <button 
            v-if="unreadCount > 0"
            @click="markAllAsRead" 
            class="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
          >
            Ählisini okaldy hasapla
          </button>
        </div>

        <!-- Notification List -->
        <div class="custom-scrollbar max-h-[400px] overflow-y-auto">
          <div v-if="notifications.length === 0" class="px-6 py-8 text-center">
            <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <el-icon class="text-3xl text-gray-300"><Bell /></el-icon>
            </div>
            <p class="text-sm text-gray-500 font-medium">Täze bildiriş ýok</p>
          </div>
          
          <div v-else class="divide-y divide-gray-50">
            <div 
              v-for="notification in notifications" 
              :key="notification.id"
              :class="[
                'group/item p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 relative',
                !notification.is_read ? 'bg-red-50/30' : ''
              ]"
              @click="!notification.is_read && markAllAsRead()"
            >
              <div :class="['w-10 h-10 rounded-full flex items-center justify-center shrink-0', getIconBg(notification.type)]">
                <el-icon class="text-lg">
                  <component :is="getIcon(notification.type)" />
                </el-icon>
              </div>
              
              <div class="flex-1 min-w-0 pr-6 relative">
                <div class="flex justify-between items-start mb-1">
                  <h4 :class="['text-sm truncate font-bold', !notification.is_read ? 'text-gray-900' : 'text-gray-700']">
                    {{ notification.title }}
                  </h4>
                  <span class="text-[10px] text-gray-400 font-medium whitespace-nowrap shrink-0">{{ formatDate(notification.created_at) }}</span>
                </div>
                <p class="text-xs text-gray-500 line-clamp-2 leading-relaxed">{{ notification.message }}</p>
              </div>
              
              <div v-if="!notification.is_read" class="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
              <button 
                @click.stop="removeNotification(notification.id)"
                class="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 flex items-center justify-center p-1.5 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-full transition-all"
                title="Aýyr"
              >
                <el-icon><Close /></el-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="notifications.length > 0" class="p-3 border-t border-gray-100 bg-gray-50/50">
          <button class="w-full text-center text-sm text-gray-600 hover:text-red-600 font-semibold transition-colors">
            Ählisini gör
          </button>
        </div>
      </div>
    </template>
  </el-dropdown>
</template>

<style>
.notification-dropdown {
  padding: 0 !important;
  border-radius: 12px !important;
  border: none !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
  margin-top: 12px !important;
}

.notification-dropdown .el-scrollbar__wrap {
  overflow: visible !important;
}


</style>
