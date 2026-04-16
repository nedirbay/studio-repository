<script setup lang="ts">
import { ref } from 'vue'

interface Notification {
  id: number
  title: string
  description: string
  time: string
  type: 'order' | 'system' | 'promo'
  unread: boolean
}

const notifications = ref<Notification[]>([
  {
    id: 1,
    title: 'New Order Received',
    description: 'Order #12345 has been placed successfully.',
    time: '2 mins ago',
    type: 'order',
    unread: true
  },
  {
    id: 2,
    title: 'System Update',
    description: 'Maintenance scheduled for tonight at 12:00 AM.',
    time: '1 hour ago',
    type: 'system',
    unread: true
  },
  {
    id: 3,
    title: 'Special Offer!',
    description: 'Get 20% off on all accessories this weekend.',
    time: '3 hours ago',
    type: 'promo',
    unread: false
  },
  {
    id: 4,
    title: 'Delivery Update',
    description: 'Your package for order #12340 is out for delivery.',
    time: '5 hours ago',
    type: 'order',
    unread: false
  }
])

const unreadCount = ref(notifications.value.filter(n => n.unread).length)

function markAllAsRead() {
  notifications.value.forEach(n => n.unread = false)
  unreadCount.value = 0
}

function getIcon(type: string) {
  switch (type) {
    case 'order': return 'Shop'
    case 'system': return 'Setting'
    case 'promo': return 'Present'
    default: return 'Bell'
  }
}

function getIconColor(type: string) {
  switch (type) {
    case 'order': return 'text-blue-500'
    case 'system': return 'text-orange-500'
    case 'promo': return 'text-purple-500'
    default: return 'text-gray-500'
  }
}
</script>

<template>
  <el-dropdown trigger="click" popper-class="notification-dropdown">
    <button class="relative p-2 text-gray-600 hover:text-red-600 transition-all duration-300 transform hover:scale-110">
      <el-icon class="text-2xl"><Bell /></el-icon>
      <span 
        v-if="unreadCount > 0" 
        class="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse"
      >
        {{ unreadCount }}
      </span>
    </button>

    <template #dropdown>
      <div class="w-80 overflow-hidden rounded-xl shadow-2xl border border-gray-100 bg-white/95 backdrop-blur-md">
        <!-- Header -->
        <div class="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-gray-900 text-sm">Notifications</h3>
          <button 
            @click="markAllAsRead"
            class="text-[11px] font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            Mark all as read
          </button>
        </div>

        <!-- List -->
        <div class="max-h-[360px] overflow-y-auto custom-scrollbar">
          <div v-if="notifications.length === 0" class="py-12 text-center text-gray-400">
            <el-icon class="text-4xl mb-2 opacity-20"><Bell /></el-icon>
            <p class="text-xs">No notifications yet</p>
          </div>
          
          <div 
            v-for="item in notifications" 
            :key="item.id"
            class="px-4 py-3 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer relative"
          >
            <div 
              class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              :class="getIconColor(item.type).replace('text-', 'bg-').replace('500', '50')"
            >
              <el-icon :class="getIconColor(item.type)" class="text-lg">
                <component :is="getIcon(item.type)" />
              </el-icon>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-1 mb-0.5">
                <p class="text-sm font-semibold text-gray-900 truncate">{{ item.title }}</p>
                <span v-if="item.unread" class="w-2 h-2 bg-red-500 rounded-full shrink-0 mt-1.5"></span>
              </div>
              <p class="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-1">
                {{ item.description }}
              </p>
              <span class="text-[10px] text-gray-400 font-medium">{{ item.time }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-2 border-t border-gray-100">
          <button class="w-full py-2 text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
            View all notifications
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

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
