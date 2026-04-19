<template>
  <div class="register-container">
    <div class="register-card">
      <transition name="fade" mode="out-in">
        <div v-if="!otpSent" key="form">
          <div class="register-header">
            <h1 class="text-3xl font-bold text-gray-800">Hasap açyň</h1>
            <p class="text-gray-500 mt-2">Ulgama goşulmak üçin formany dolduryň</p>
          </div>
          
          <el-form :model="registerForm" :rules="rules" ref="registerFormRef" label-position="top" class="mt-8">
            <el-form-item label="Ulanyjy ady" prop="username">
              <el-input 
                v-model="registerForm.username" 
                placeholder="Ulanyjy adyňyzy saýlaň"
                :prefix-icon="User"
                size="large"
              />
            </el-form-item>
            
            <el-form-item label="E-poçta" prop="email">
              <el-input 
                v-model="registerForm.email" 
                placeholder="E-poçta salgyňyzy giriziň"
                :prefix-icon="Message"
                size="large"
              />
            </el-form-item>
            
            <el-form-item label="Parol" prop="password">
              <el-input 
                v-model="registerForm.password" 
                type="password" 
                placeholder="Güçli parol dörediň"
                :prefix-icon="Lock"
                show-password
                size="large"
              />
            </el-form-item>
            
            <el-form-item label="Paroly tassyklaň" prop="confirmPassword">
              <el-input 
                v-model="registerForm.confirmPassword" 
                type="password" 
                placeholder="Paroly gaýtadan giriziň"
                :prefix-icon="Lock"
                show-password
                size="large"
              />
            </el-form-item>
            
            <div class="mb-6">
              <el-checkbox v-model="agreeTerms">
                Menziliň <a href="#" class="text-blue-600 hover:underline">şertlerini we düzgünlerini</a> kabul edýärin
              </el-checkbox>
            </div>
            
            <el-button 
              type="success" 
              class="w-full py-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-green-600 to-teal-700 border-none hover:shadow-lg transition-all"
              :loading="loading"
              @click="handleRegister"
            >
              Hasap aç
            </el-button>
            
            <div class="text-center mt-6">
              <p class="text-gray-600">
                Eýýäm hasabyňyz barmy? 
                <router-link to="/login" class="text-blue-600 font-semibold hover:underline">Giriş ediň</router-link>
              </p>
            </div>
          </el-form>
        </div>

        <!-- OTP Verification Mode -->
        <div v-else key="otp" class="otp-section">
          <div class="register-header mb-8">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <el-icon class="text-4xl text-green-600"><CircleCheck /></el-icon>
            </div>
            <h1 class="text-3xl font-bold text-gray-800">E-poçtaňyzy tassyklaň</h1>
            <p class="text-gray-500 mt-2">
              Biler size 6 sanly tassyklama koduny <span class="font-bold text-gray-800">{{ registerForm.email }}</span> salgyňyza ugratdyk.
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
              :loading="loading"
              @click="handleVerifyOTP"
            >
              Tassyklamak
            </el-button>

            <div class="text-center space-y-4">
              <p class="text-sm text-gray-500">
                Kod gelmedimi? 
                <button 
                  @click="handleResendOTP" 
                  :disabled="resendTimer > 0"
                  class="text-blue-600 font-semibold hover:underline disabled:text-gray-400 disabled:no-underline"
                >
                  Täzeden ugrat <span v-if="resendTimer > 0">({{ resendTimer }}s)</span>
                </button>
              </p>
              <button @click="otpSent = false" class="text-blue-600 text-sm font-medium hover:underline">
                E-poçtany üýtgetmek
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock, Message, CircleCheck } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { actions } from '../store'

const router = useRouter()
const route = useRoute()
const registerFormRef = ref()
const loading = ref(false)
const agreeTerms = ref(false)
const otpSent = ref(false)
const otpCode = ref('')
const resendTimer = ref(0)
let timerInterval: any = null

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

function startTimer() {
  resendTimer.value = 60
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--
    } else {
      clearInterval(timerInterval)
    }
  }, 1000)
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const validatePass2 = (_rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('Paroly gaýtadan giriziň'))
  } else if (value !== registerForm.password) {
    callback(new Error("Parollar gabat gelmedi!"))
  } else {
    callback()
  }
}

const rules = {
  username: [{ required: true, message: 'Ulanyjy adyňyzy giriziň', trigger: 'blur' }],
  email: [
    { required: true, message: 'E-poçta salgyňyzy giriziň', trigger: 'blur' },
    { type: 'email', message: 'Dogry e-poçta salgyňyzy giriziň', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, message: 'Parolyňyzy giriziň', trigger: 'blur' },
    { min: 6, message: 'Parol azyndan 6 simwoldan ybarat bolmaly', trigger: 'blur' }
  ],
  confirmPassword: [{ validator: validatePass2, trigger: 'blur' }]
}

const handleRegister = async () => {
  if (!agreeTerms.value) {
    ElMessage.warning('Şertleri kabul etmegiňiz zerur!')
    return
  }
  
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        await actions.register({
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password
        })
        ElMessage.success('Tassyklama kody ugradyldy!')
        otpSent.value = true
        startTimer()
      } catch (error: any) {
        ElMessage.error(error.response?.data?.error || 'Hasap açmak başartmady')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleVerifyOTP = async () => {
  if (otpCode.value.length !== 6) {
    ElMessage.warning('6 sanly kody giriziň')
    return
  }

  loading.value = true
  try {
    await actions.verifyOtp({
      email: registerForm.email,
      code: otpCode.value
    })
    ElMessage.success('Siziň hasabyňyz üstünlikli tassyklanyldy!')
    
    // Check role from the returned response (res is res.data from store)
    const redirectPath = route.query.redirect as string || '/'
    router.push(redirectPath)
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || 'Kod nädogry ýa-da möwriti öten')
  } finally {
    loading.value = false
  }
}

const handleResendOTP = async () => {
  loading.value = true
  try {
    await actions.resendOtp(registerForm.email)
    ElMessage.success('Täze kod ugradyldy!')
    startTimer()
  } catch (error: any) {
    ElMessage.error('Kod ugratmak başartmady')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  @apply min-h-screen;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 20px;
}

.register-card {
  background: white;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  transition: transform 0.3s ease;
}

.register-card:hover {
  transform: translateY(-5px);
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
