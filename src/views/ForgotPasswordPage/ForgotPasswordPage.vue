<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <div class="mb-6">
        <button
          type="button"
          @click="handleBack"
          class="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-700 transition-colors"
        >
          <el-icon class="text-xl"><ArrowLeft /></el-icon>
          Yzyna
        </button>
      </div>

      <transition name="fade" mode="out-in">
        <!-- Step 1: Email Input -->
        <div v-if="step === 1" key="step1">
          <div class="header mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Paroly dikeltmek</h1>
            <p class="text-gray-500 mt-2">Hasabyňyza degişli e-poçta salgyňyzy giriziň</p>
          </div>

          <el-form label-position="top">
            <el-form-item label="E-poçta salgysy">
              <el-input 
                v-model="email" 
                placeholder="mysal@gmail.com"
                :prefix-icon="Message"
                size="large"
              />
            </el-form-item>
            
            <el-button 
              type="primary" 
              class="w-full py-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 border-none hover:shadow-lg transition-all"
              :loading="loading"
              @click="handleSendOTP"
            >
              Kod ugrat
            </el-button>
          </el-form>
        </div>

        <!-- Step 2: OTP Verification -->
        <div v-else-if="step === 2" key="step2">
          <div class="header mb-8 text-center">
            <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <el-icon class="text-3xl text-blue-600"><Promotion /></el-icon>
            </div>
            <h1 class="text-2xl font-bold text-gray-800">Kody tassyklaň</h1>
            <p class="text-gray-500 mt-2">
              Biler <span class="font-bold text-gray-800">{{ email }}</span> salgyňyza ugradylan 6 sanly kody giriziň
            </p>
          </div>

          <div class="space-y-6">
            <el-input 
              v-model="otpCode" 
              placeholder="000000" 
              size="large" 
              maxlength="6"
              class="otp-input text-center"
              style="font-size: 2rem; letter-spacing: 0.5rem;"
            />

            <el-button 
              type="primary" 
              class="w-full py-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 border-none hover:shadow-lg transition-all"
              @click="step = 3"
            >
              Indiki
            </el-button>

            <div class="text-center">
              <button 
                @click="handleSendOTP" 
                class="text-blue-600 text-sm font-medium hover:underline"
              >
                Kody täzeden ugrat
              </button>
            </div>
          </div>
        </div>

        <!-- Step 3: New Password -->
        <div v-else-if="step === 3" key="step3">
          <div class="header mb-8">
            <h1 class="text-2xl font-bold text-gray-800">Täze parol dörediň</h1>
            <p class="text-gray-500 mt-2">Indi ulanyp biljek täze parolyňyzy giriziň</p>
          </div>

          <el-form label-position="top">
            <el-form-item label="Täze parol">
              <el-input 
                v-model="newPassword" 
                type="password" 
                placeholder="Azyndan 6 simwol"
                :prefix-icon="Lock"
                show-password
                size="large"
              />
            </el-form-item>
            
            <el-form-item label="Täze paroly tassyklaň">
              <el-input 
                v-model="confirmPassword" 
                type="password" 
                placeholder="Paroly gaýtadan giriziň"
                :prefix-icon="Lock"
                show-password
                size="large"
              />
            </el-form-item>

            <el-button 
              type="success" 
              class="w-full py-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-green-600 to-teal-700 border-none hover:shadow-lg transition-all"
              :loading="loading"
              @click="handleResetPassword"
            >
              Paroly üýtget
            </el-button>
          </el-form>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Lock, ArrowLeft, Promotion } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { actions } from '../../store'

const router = useRouter()
const step = ref(1)
const loading = ref(false)
const email = ref('')
const otpCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

function handleBack() {
  if (step.value > 1) {
    step.value--
    return
  }
  router.back()
}

async function handleSendOTP() {
  if (!email.value) {
    ElMessage.warning('E-poçta salgyňyzy giriziň')
    return
  }
  
  loading.value = true
  try {
    await actions.forgotPassword(email.value)
    ElMessage.success('Tassyklama kody e-poçtaňyza ugradyldy')
    step.value = 2
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || 'Kod ugratmak başartmady')
  } finally {
    loading.value = false
  }
}

async function handleResetPassword() {
  if (newPassword.value.length < 6) {
    ElMessage.warning('Parol azyndan 6 simwol bolmaly')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    ElMessage.warning('Parollar gabat gelmedi')
    return
  }

  loading.value = true
  try {
    await actions.resetPassword({
      email: email.value,
      code: otpCode.value,
      new_password: newPassword.value
    })
    ElMessage.success('Parolyňyz üstünlikli çalşyldy!')
    router.push('/login')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || 'Parol üýtgetmek başartmady')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forgot-password-container {
  @apply min-h-screen;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.forgot-password-card {
  background: white;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 8px 12px;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}
</style>
