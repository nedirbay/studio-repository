<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { store, actions, cartTotal } from '../../store'
import { User, Phone, ShoppingCart, Delete, Minus, Plus, Close, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const windowWidth = ref(window.innerWidth)
const customerName = ref('')
const customerPhone = ref('')
const isSubmitting = ref(false)
const checkoutStep = ref(1) // 1: Cart, 2: Info form

function updateWidth() {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})

const drawerSize = computed(() => {
  if (windowWidth.value < 640) return '100%'
  if (windowWidth.value < 1024) return '400px'
  return '450px'
})

function closeDrawer() {
  actions.toggleCartDrawer(false)
  // Reset step on close
  setTimeout(() => {
    checkoutStep.value = 1
  }, 300)
}

function nextStep() {
  if (store.cart.length === 0) return
  checkoutStep.value = 2
}

function prevStep() {
  checkoutStep.value = 1
}

async function handleCheckout() {
  if (!customerName.value || !customerPhone.value) {
    ElMessage.warning('Sargydy tamamlamak üçin adyňyzy we telefon belgiňizi giriziň')
    return
  }

  isSubmitting.value = true
  try {
    const res = await actions.submitOrder({
      customer_name: customerName.value,
      customer_phone: customerPhone.value
    })
    
    ElMessage.success(`Sargydyňyz üstünlikli kabul edildi! Sargyt belgisi: #${res.id}`)
    customerName.value = ''
    customerPhone.value = ''
    closeDrawer()
  } catch (error) {
    ElMessage.error('Sargyt ugradylanda ýalňyşlyk ýüze çykdy. Täzeden synanyşyň.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <el-drawer
    v-model="store.cartDrawerOpen"
    title="Sebedim"
    direction="rtl"
    :size="drawerSize"
    :with-header="false"
    class="cart-drawer"
    @close="closeDrawer"
  >
    <div class="flex flex-col h-full overflow-hidden">
      <!-- Header -->
      <div class="p-4 border-b flex items-center justify-between bg-gray-50 shrink-0">
        <div class="flex items-center gap-2">
          <button 
            v-if="checkoutStep === 2" 
            @click="prevStep"
            class="mr-2 p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <el-icon><ArrowLeft /></el-icon>
          </button>
          <el-icon class="text-xl text-red-600"><ShoppingCart /></el-icon>
          <span class="text-lg font-bold text-gray-900">
            {{ checkoutStep === 1 ? 'Sebedim' : 'Sargyt maglumatlary' }}
          </span>
          <span v-if="checkoutStep === 1" class="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">
            {{ store.cart.length }} haryt
          </span>
        </div>
        <button @click="closeDrawer" class="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <el-icon><Close /></el-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <transition name="fade-slide" mode="out-in">
          <!-- Step 1: Cart Items -->
          <div v-if="checkoutStep === 1" key="cart" class="p-4 space-y-4">
            <template v-if="store.cart.length > 0">
              <div 
                v-for="item in store.cart" 
                :key="item.product.id"
                class="flex gap-4 p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow"
              >
                <div class="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-50 border">
                  <img :src="item.product.image" :alt="item.product.name" class="w-full h-full object-cover" />
                </div>

                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-semibold text-gray-900 truncate mb-1">{{ item.product.name }}</h4>
                  <div class="text-xs text-gray-500 mb-2">{{ item.product.brand }}</div>
                  
                  <div class="flex items-center justify-between">
                    <div class="text-sm font-bold text-red-600">${{ item.product.price.toLocaleString() }}</div>
                    
                    <div class="flex items-center border border-gray-200 rounded-lg scale-90 origin-right">
                      <button @click="actions.updateQuantity(item.product.id, item.quantity - 1)" class="w-7 h-7 flex items-center justify-center hover:bg-gray-100 text-gray-500">
                        <el-icon><Minus /></el-icon>
                      </button>
                      <span class="w-8 h-7 flex items-center justify-center text-xs font-bold">{{ item.quantity }}</span>
                      <button @click="actions.updateQuantity(item.product.id, item.quantity + 1)" class="w-7 h-7 flex items-center justify-center hover:bg-gray-100 text-gray-500">
                        <el-icon><Plus /></el-icon>
                      </button>
                    </div>
                  </div>
                </div>

                <button @click="actions.removeFromCart(item.product.id)" class="text-gray-300 hover:text-red-500 transition-colors self-start">
                  <el-icon><Delete /></el-icon>
                </button>
              </div>
            </template>

            <!-- Empty State -->
            <div v-else class="h-[400px] flex flex-col items-center justify-center text-center px-6">
              <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <el-icon class="text-4xl text-gray-400"><ShoppingCart /></el-icon>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Sebediňiz boş</h3>
              <p class="text-gray-500 text-sm mb-6">Entek hiç haryt goşmadyňyz. Häzir söwda edip başlaň!</p>
              <el-button type="primary" round @click="closeDrawer">Söwda dowam et</el-button>
            </div>
          </div>

          <!-- Step 2: Customer Info -->
          <div v-else key="info" class="p-6 space-y-6">
            <div class="bg-red-50 p-4 rounded-2xl border border-red-100">
              <h3 class="text-sm font-bold text-red-900 mb-1">Sargyt etmek üçin maglumatlar</h3>
              <p class="text-xs text-red-600">Sargydyňyzy tassyklamak üçin aşakdaky maglumatlary dolduryň. Biz siziň bilen gysga wagtda habarlaşarys.</p>
            </div>

            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Doly adyňyz</label>
                <el-input 
                  v-model="customerName" 
                  placeholder="At-familiýaňyz" 
                  size="large"
                  class="custom-input"
                >
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                </el-input>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Telefon belgiňiz</label>
                <el-input 
                  v-model="customerPhone" 
                  placeholder="+993 6..." 
                  size="large"
                  class="custom-input"
                >
                  <template #prefix>
                    <el-icon><Phone /></el-icon>
                  </template>
                </el-input>
              </div>
            </div>

            <!-- Order Summary Preview -->
            <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div class="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-3">Sargyt jemlemesi</div>
              <div class="space-y-2">
                <div class="flex justify-between text-sm text-gray-600">
                  <span>Haryt sany:</span>
                  <span class="font-bold text-gray-900">{{ store.cart.length }} sany</span>
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span class="font-bold text-gray-900">Umumy baha:</span>
                  <span class="text-xl font-black text-red-600">${{ cartTotal.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Footer -->
      <div v-if="store.cart.length > 0" class="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] shrink-0">
        <div v-if="checkoutStep === 1" class="space-y-3 mb-6">
          <div class="flex justify-between text-sm text-gray-500">
            <span>Jemi harytlar:</span>
            <span>{{ store.cart.length }} sany</span>
          </div>
          <div class="flex justify-between items-end">
            <span class="text-gray-900 font-medium">Umumy baha:</span>
            <span class="text-2xl font-bold text-red-600">${{ cartTotal.toLocaleString() }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3">
          <!-- Step 1 Button -->
          <button 
            v-if="checkoutStep === 1"
            @click="nextStep"
            class="w-full bg-red-600 text-white font-bold py-3.5 rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-red-200"
          >
            Sargamak
            <el-icon class="group-hover:translate-x-1 transition-transform"><ArrowRight /></el-icon>
          </button>

          <!-- Step 2 Button -->
          <button 
            v-else
            @click="handleCheckout"
            :disabled="isSubmitting"
            class="w-full bg-red-600 text-white font-bold py-3.5 rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-red-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting">Ugradylýar...</span>
            <span v-else class="flex items-center gap-2">
              Sargyt etmek
              <el-icon class="group-hover:translate-x-1 transition-transform"><ShoppingCart /></el-icon>
            </span>
          </button>
          
          <button 
            v-if="checkoutStep === 1"
            @click="actions.clearCart"
            class="w-full text-gray-400 hover:text-red-500 text-xs font-bold py-2 transition-colors flex items-center justify-center gap-1 uppercase tracking-widest"
          >
            <el-icon><Delete /></el-icon>
            Sebedi arassala
          </button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
:deep(.el-drawer__body) {
  padding: 0;
}

.cart-drawer :deep(.el-drawer) {
  border-radius: 20px 0 0 20px;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
