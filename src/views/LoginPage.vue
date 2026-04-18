<template>
  <div class="login-container">
    <div class="login-card">
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
        
        <div class="flex items-center justify-between mb-6">
          <el-checkbox v-model="rememberMe">Meni ýatda sakla</el-checkbox>
          <a href="#" class="text-sm text-blue-600 hover:text-blue-800 transition-colors">Paroly ýatdan çykardyňyzmy?</a>
        </div>
        
        <el-button 
          type="primary" 
          class="w-full py-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 border-none hover:shadow-lg transition-all"
          :loading="loading"
          @click="handleLogin"
        >
          Giriş
        </el-button>
        
        <div class="text-center mt-6">
          <p class="text-gray-600">
            Hasabyňyz ýokmy? 
            <router-link to="/register" class="text-blue-600 font-semibold hover:underline">Hasap açyň</router-link>
          </p>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ServiceGenerate from '../utils/request'

const service = ServiceGenerate()
const router = useRouter()
const loginFormRef = ref()
const loading = ref(false)
const rememberMe = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: 'Ulanyjy adyňyzy giriziň', trigger: 'blur' }],
  password: [{ required: true, message: 'Parolyňyzy giriziň', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const res = await service.post('/auth/login', loginForm)
        if (res.data.jwt) {
          localStorage.setItem('token', res.data.jwt)
          localStorage.setItem('user', JSON.stringify(res.data.user))
          ElMessage.success('Hasabyňyz tassyklanyldy we aktiwleşdirildi!')
          
          if (res.data.user.role_name === 'Admin' || res.data.user.is_superuser) {
            router.push('/admin/dashboard')
          } else {
            router.push('/')
          }
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
