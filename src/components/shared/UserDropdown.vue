<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  User, 
  ArrowDown, 
  Monitor, 
  SwitchButton,
  UserFilled,
  ShoppingCart
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { store, actions, formatPrice } from '../../store'

const router = useRouter()

// Auth state
const isLoggedIn = computed(() => store.isAuthenticated)
const currentUser = computed(() => store.user)

const ordersDialogVisible = ref(false)
const loadingOrders = ref(false)

const userOrders = computed(() => {
  return store.orders.filter(o => o.user === currentUser.value?.id)
})

async function openOrdersModal() {
  ordersDialogVisible.value = true
  loadingOrders.value = true
  try {
    await actions.fetchOrders()
  } catch (error) {
    ElMessage.error('Sargytlaryňyzy ýükläp bolmady')
  } finally {
    loadingOrders.value = false
  }
}

function getStatusDetails(status: string) {
  switch (status) {
    case 'completed':
      return { text: 'Tamamlandy', type: 'success' }
    case 'processing':
      return { text: 'Taýýarlanýar', type: 'primary' }
    case 'cancelled':
      return { text: 'Goýbolsun edildi', type: 'danger' }
    default:
      return { text: 'Garaşylýar', type: 'warning' }
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('tk-TM', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function handleLogout() {
  actions.logout()
  ElMessage.success('Siz sistemadan üstünlikli çykdyňyz!')
  router.push('/login')
}
</script>

<template>
  <div class="user-menu-wrapper">
    <el-dropdown v-if="isLoggedIn" trigger="click" placement="bottom-end">
      <button class="flex items-center gap-2 p-1.5 pl-2 pr-4 bg-white/50 hover:bg-white rounded-xl border border-gray-200 hover:border-red-200 transition-all group shadow-sm">
        <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm shrink-0 overflow-hidden">
          <template v-if="currentUser?.username">
            {{ currentUser.username.charAt(0).toUpperCase() }}
          </template>
          <el-icon v-else class="text-xl"><UserFilled /></el-icon>
        </div>
        <div class="hidden lg:block text-left">
          <p class="text-[10px] text-gray-400 font-bold uppercase leading-none mb-0.5">Ulanyjy</p>
          <p class="text-sm font-bold text-gray-700 group-hover:text-red-600 truncate max-w-[100px] leading-none">{{ currentUser?.username }}</p>
        </div>
        <el-icon class="text-xl text-gray-400 group-hover:text-red-600 transition-colors"><ArrowDown /></el-icon>
      </button>
      
      <template #dropdown>
        <el-dropdown-menu class="min-w-[200px] !rounded-2xl !p-2 !border-none !shadow-2xl">
          <div class="px-4 py-4 border-b border-gray-100 mb-2">
            <p class="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1 leading-none">Hasap maglumatlary</p>
            <p class="text-sm font-black text-slate-900 truncate">{{ currentUser?.email }}</p>
          </div>
          
          <el-dropdown-item @click="router.push('/profile')">
            <div class="flex items-center gap-3 w-full py-1">
              <el-icon class="text-lg"><User /></el-icon>
              <span class="font-bold">Hasabym</span>
            </div>
          </el-dropdown-item>

          <el-dropdown-item @click="openOrdersModal">
            <div class="flex items-center gap-3 w-full py-1">
              <el-icon class="text-lg"><ShoppingCart /></el-icon>
              <span class="font-bold">Sargytlarym</span>
            </div>
          </el-dropdown-item>
          
          <el-dropdown-item 
            v-if="currentUser?.role_name === 'Admin' || currentUser?.is_superuser" 
            @click="router.push('/admin/dashboard')"
          >
            <div class="flex items-center gap-3 w-full py-1">
              <el-icon class="text-lg"><Monitor /></el-icon>
              <span class="font-bold">Dolandyryş paneli</span>
            </div>
          </el-dropdown-item>
          
          <div class="my-2 border-t border-gray-100"></div>
          
          <el-dropdown-item @click="handleLogout" class="!text-red-600 hover:!bg-red-50 !rounded-xl">
            <div class="flex items-center gap-3 w-full py-1">
              <el-icon class="text-lg"><SwitchButton /></el-icon>
              <span class="font-bold">Çykyş</span>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <router-link 
      v-else 
      to="/login"
      class="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-600/20 active:scale-95"
    >
      <el-icon class="text-2xl"><User /></el-icon>
      Giriş
    </router-link>

    <!-- User Orders Dialog -->
    <el-dialog
      v-model="ordersDialogVisible"
      title="Meniň Sargytlarym"
      width="600px"
      destroy-on-close
      class="orders-dialog"
    >
      <div v-loading="loadingOrders" class="py-2">
        <el-table v-if="userOrders.length > 0" :data="userOrders" style="width: 100%" class="user-orders-table">
          <el-table-column type="expand">
            <template #default="props">
              <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100 m-2 space-y-2">
                <p class="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none mb-2">Harytlar sanawy</p>
                <div v-for="item in props.row.items" :key="item.id" class="flex justify-between items-center text-sm py-1 border-b border-gray-100 last:border-0">
                  <div class="flex flex-col">
                    <span class="font-bold text-gray-800">{{ item.product_name }}</span>
                    <span class="text-xs text-gray-400">{{ item.quantity }} sany x {{ formatPrice(item.price) }}</span>
                  </div>
                  <span class="font-black text-slate-900">{{ formatPrice(item.quantity * item.price) }}</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Sargyt ID" width="100">
            <template #default="scope">
              <span class="font-bold text-gray-500">#{{ scope.row.id }}</span>
            </template>
          </el-table-column>

          <el-table-column label="Sene">
            <template #default="scope">
              <span class="text-xs text-gray-600 font-medium">{{ formatDate(scope.row.created_at) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="Jemi baha" width="120">
            <template #default="scope">
              <span class="font-black text-red-600">{{ formatPrice(scope.row.total_amount) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="Ýagdaýy" width="130" align="right">
            <template #default="scope">
              <el-tag
                :type="getStatusDetails(scope.row.status).type"
                size="small"
                class="!rounded-lg font-black uppercase tracking-wider text-[8px]"
              >
                {{ getStatusDetails(scope.row.status).text }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="text-center py-12 text-gray-400">
          <el-icon class="text-5xl mb-3"><ShoppingCart /></el-icon>
          <p class="font-bold">Siziň entek hiç hili sargydyňyz ýok.</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
:deep(.el-dropdown-menu__item) {
  border-radius: 0.75rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: 0.25rem;
  margin-right: 0.25rem;
}
:deep(.el-dropdown-menu__item:hover) {
  background-color: #fef2f2;
  color: #dc2626;
}
</style>
