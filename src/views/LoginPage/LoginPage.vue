<template>
  <div class="login-container">
    <div class="login-card">
      <div class="mb-4">
        <button
          type="button"
          @click="handleBack"
          class="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-700 transition-colors"
        >
          <el-icon class="text-xl"><ArrowLeft /></el-icon>
          Yzyna
        </button>
      </div>
      <div class="login-header">
        <h1 class="text-3xl font-bold text-gray-800">Hoş geldiňiz!</h1>
        <p class="text-gray-500 mt-2">Ulgama girmek üçin maglumatlaryňyzy giriziň</p>
      </div>
      
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-position="top" class="mt-8">
        <el-form-item label="Ulanyjy ady" prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="Ulanyjy adyňyzy giriziň"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        
        <el-form-item label="Parol" prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="Parolyňyzy giriziň"
            :prefix-icon="Lock"
            show-password
            size="large"
          />
        </el-form-item>
        
        <!-- <div class="flex items-center justify-between mb-6">
          <el-checkbox v-model="rememberMe">Meni ýatda sakla</el-checkbox>
          <router-link to="/forgot-password" class="text-sm text-blue-600 hover:text-blue-800 transition-colors">Paroly ýatdan çykardyňyzmy?</router-link>
        </div> -->
        
        <el-button 
          type="primary" 
          class="w-full py-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 border-none hover:shadow-lg transition-all"
          :loading="loading"
          @click="handleLogin"
        >
          Giriş
        </el-button>

        <div class="my-6 flex items-center gap-3">
          <div class="h-px bg-gray-200 flex-1"></div>
          <span class="text-xs text-gray-400 font-semibold">ýa-da</span>
          <div class="h-px bg-gray-200 flex-1"></div>
        </div>

        <div ref="googleBtnEl" class="w-full flex justify-center"></div>
        
        <!-- <div class="text-center mt-6">
          <p class="text-gray-600">
            Hasabyňyz ýokmy? 
            <router-link to="/register" class="text-blue-600 font-semibold hover:underline">Hasap açyň</router-link>
          </p>
        </div> -->
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { actions } from '../../store'
const router = useRouter()
const route = useRoute()
const loginFormRef = ref()
const loading = ref(false)
const rememberMe = ref(false)
const googleBtnEl = ref<HTMLElement | null>(null)

const loginForm = reactive({
  username: '',
  password: ''
})

function handleBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/')
}

const rules = {
  username: [{ required: true, message: 'Ulanyjy adyňyzy giriziň', trigger: 'blur' }],
  password: [{ required: true, message: 'Parolyňyzy giriziň', trigger: 'blur' }]
}

async function handleGoogleCredential(credential: string) {
  loading.value = true
  try {
    const data = await actions.googleLogin(credential)
    if (data.jwt) {
      ElMessage.success('Google arkaly üstünlikli girildi!')

      const redirectPath = (route.query.redirect as string) || '/'
      router.push(redirectPath)
    }
  } catch (error: any) {
    console.error('Google login error:', error)
    const errorMsg = error.response?.data?.error || 'Google arkaly girmek başartmady'
    ElMessage.error(errorMsg)
  } finally {
    loading.value = false
  }
}

function initGoogleButton(attempt = 0) {
  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim()
  if (!clientId) return

  const google = (window as any).google
  if (!google?.accounts?.id) {
    if (attempt < 30) setTimeout(() => initGoogleButton(attempt + 1), 200)
    return
  }

  if (!googleBtnEl.value) return
  googleBtnEl.value.innerHTML = ''

  google.accounts.id.initialize({
    client_id: clientId,
    callback: (resp: any) => resp?.credential && handleGoogleCredential(resp.credential),
  })

  google.accounts.id.renderButton(googleBtnEl.value, {
    theme: 'outline',
    size: 'large',
    width: 360,
    text: 'signin_with',
    shape: 'pill',
  })
}

onMounted(() => {
  initGoogleButton()
})

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const data = await actions.login(loginForm)
        if (data.jwt) {
          ElMessage.success('Hasabyňyz tassyklanyldy we aktiwleşdirildi!')
          
          const redirectPath = route.query.redirect as string || '/'
          router.push(redirectPath)
        }
      } catch (error: any) {
        console.error('Login error:', error)
        const errorMsg = error.response?.data?.error || 'Ulgama girmekde ýalňyşlyk ýüze çykdy'
        ElMessage.error(errorMsg)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  @apply min-h-screen;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  transition: transform 0.3s ease;
}

.login-card:hover {
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
