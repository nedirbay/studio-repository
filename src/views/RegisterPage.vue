<template>
  <div class="register-container">
    <div class="register-card">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Message } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ServiceGenerate from '../utils/request'

const service = ServiceGenerate()
const router = useRouter()
const registerFormRef = ref()
const loading = ref(false)
const agreeTerms = ref(false)

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
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
        const res = await service.post('/auth/register', {
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password
        })
        if (res.data.jwt) {
          localStorage.setItem('token', res.data.jwt)
          localStorage.setItem('user', JSON.stringify(res.data.user))
          ElMessage.success('Hasabyňyz üstünlikli döredildi!')
          router.push('/')
        }
      } catch (error) {
        console.error('Registration error:', error)
      } finally {
        loading.value = false
      }
    }
  })
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
