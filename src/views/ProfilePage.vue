<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  User, 
  Lock, 
  Check, 
  UserFilled, 
  InfoFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ServiceGenerate from '../utils/request'

const service = ServiceGenerate()
const router = useRouter()

// User state
const currentUser = computed(() => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
})

// Profile Form
const profileForm = reactive({
  username: currentUser.value?.username || '',
  email: currentUser.value?.email || '',
})

// Password Form
const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const passwordFormRef = ref()
const loading = ref(false)

const passwordRules = {
  old_password: [{ required: true, message: 'Köne paroluňyzy ýazyň', trigger: 'blur' }],
  new_password: [{ required: true, message: 'Täze paroly ýazyň', trigger: 'blur' }, { min: 6, message: 'Parol azyndan 6 simwoldan ybarat bolmaly', trigger: 'blur' }],
  confirm_password: [
    { required: true, message: 'Täze paroly gaýtadan ýazyň', trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (value !== passwordForm.new_password) {
          callback(new Error('Parollar gabat gelmedi!'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

async function handleChangePassword() {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        // This endpoint might need to be confirmed with backend, but it's a standard path
        await service.post('auth/change-password', {
          old_password: passwordForm.old_password,
          new_password: passwordForm.new_password
        })
        
        ElMessage.success('Paroluňyz üstünlikli çalşyldy!')
        // Reset form
        passwordForm.old_password = ''
        passwordForm.new_password = ''
        passwordForm.confirm_password = ''
      } catch (error: any) {
        // Error handling is managed by interceptor, but we can add specific logic here if needed
      } finally {
        loading.value = false
      }
    }
  })
}

function handleGoBack() {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in mb-20">
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Header Section -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Hasabym</h1>
          <p class="text-gray-400 font-bold mt-1 uppercase text-xs tracking-widest">Profil maglumatlary we howpsuzlyk</p>
        </div>
        <el-button @click="handleGoBack" class="!rounded-2xl !px-6 !py-6 !font-bold">
          Yza gaýt
        </el-button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar Info -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group">
            <div class="absolute -top-10 -right-10 w-32 h-32 bg-red-600/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            
            <div class="w-24 h-24 rounded-[32px] bg-red-600 flex items-center justify-center text-white shadow-2xl shadow-red-600/30 mb-6 relative z-10 transition-transform group-hover:scale-110">
              <el-icon class="text-4xl"><UserFilled /></el-icon>
            </div>
            
            <h3 class="text-xl font-black text-slate-900 leading-tight z-10">{{ currentUser?.username }}</h3>
            <p class="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1 z-10">{{ currentUser?.role_name || 'Ulanyjy' }}</p>
            
            <div class="mt-8 pt-8 border-t border-gray-100 w-full space-y-4">
              <div class="flex items-center gap-3 text-left">
                <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <el-icon><InfoFilled /></el-icon>
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Status</p>
                  <p class="text-sm font-bold text-slate-700 truncate">Işjeň</p>
                </div>
              </div>
              <div class="flex items-center gap-3 text-left">
                <div class="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <el-icon><User /></el-icon>
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">ID</p>
                  <p class="text-sm font-bold text-slate-700 truncate">#{{ currentUser?.id }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Forms -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Personal Info -->
          <div class="bg-white p-8 sm:p-10 rounded-[40px] shadow-sm border border-gray-100">
            <div class="flex items-center gap-4 mb-8">
              <div class="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-slate-900 border border-gray-100">
                <el-icon class="text-xl"><User /></el-icon>
              </div>
              <div>
                <h3 class="text-lg font-black text-slate-900 tracking-tight">Şahsy maglumatlar</h3>
                <p class="text-xs text-gray-400 font-bold mt-0.5">Esasy hasap maglumatlaryňyz</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ulanyjy ady</label>
                <el-input v-model="profileForm.username" disabled size="large" class="custom-input" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-poçta salgysy</label>
                <el-input v-model="profileForm.email" disabled size="large" class="custom-input" />
              </div>
            </div>
            
            <div class="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
              <el-icon class="text-xl text-amber-600 shrink-0"><InfoFilled /></el-icon>
              <p class="text-xs text-amber-800 leading-relaxed">
                <span class="font-black uppercase tracking-widest text-[10px] block mb-1">Bellik</span>
                Häzirki wagtda ulanyjy adyny we e-poçta salgysyny diňe administrator arkaly üýtgedip bolýar.
              </p>
            </div>
          </div>

          <!-- Security / Password Change -->
          <div class="bg-white p-8 sm:p-10 rounded-[40px] shadow-sm border border-gray-100 relative overflow-hidden">
            <div class="absolute -bottom-10 -right-10 w-48 h-48 bg-slate-900/5 rounded-full"></div>
            
            <div class="flex items-center gap-4 mb-8 relative z-10">
              <div class="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-slate-900 border border-gray-100">
                <el-icon class="text-xl"><Lock /></el-icon>
              </div>
              <div>
                <h3 class="text-lg font-black text-slate-900 tracking-tight">Howpsuzlyk</h3>
                <p class="text-xs text-gray-400 font-bold mt-0.5">Parolyňyzy üýtgediň</p>
              </div>
            </div>

            <el-form 
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              label-position="top"
              class="space-y-6 relative z-10"
            >
              <el-form-item label="Köne parol" prop="old_password" class="custom-form-item">
                <el-input 
                  v-model="passwordForm.old_password" 
                  type="password" 
                  show-password 
                  placeholder="Häzirki parolyňyz"
                  size="large"
                />
              </el-form-item>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <el-form-item label="Täze parol" prop="new_password" class="custom-form-item">
                  <el-input 
                    v-model="passwordForm.new_password" 
                    type="password" 
                    show-password 
                    placeholder="Minimal 6 simwol"
                    size="large"
                  />
                </el-form-item>
                <el-form-item label="Täze paroly tassyklamak" prop="confirm_password" class="custom-form-item">
                  <el-input 
                    v-model="passwordForm.confirm_password" 
                    type="password" 
                    show-password 
                    placeholder="Paroly gaýtadan ýazyň"
                    size="large"
                  />
                </el-form-item>
              </div>

              <div class="pt-4">
                <el-button 
                  type="primary" 
                  :loading="loading"
                  @click="handleChangePassword"
                  class="!w-full sm:!w-auto !bg-slate-900 !border-none !rounded-2xl !px-10 !py-6 !font-black !text-sm group hover:!scale-105 active:!scale-95 transition-all"
                >
                  <el-icon class="mr-2 text-lg"><Check /></el-icon>
                  Paroly sakla
                </el-button>
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-input :deep(.el-input__wrapper) {
  border-radius: 1rem;
  background-color: #f9fafb; /* bg-gray-50 */
  border: none;
  box-shadow: none;
  padding-left: 1rem;
  padding-right: 1rem;
}

.custom-form-item :deep(.el-form-item__label) {
  font-size: 10px;
  font-weight: 900;
  color: #9ca3af; /* text-gray-400 */
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
  margin-left: 0.25rem;
}

.custom-form-item :deep(.el-input__wrapper) {
  border-radius: 1rem;
  background-color: #f9fafb; /* bg-gray-50 */
  border: 1px solid #f3f4f6; /* border-gray-100 */
  box-shadow: none;
  padding-left: 1rem;
  padding-right: 1rem;
  height: 3rem;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-form-item :deep(.el-input__wrapper.is-focus) {
  background-color: #ffffff;
  border-color: #0f172a; /* border-slate-900 */
  box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.05); /* ring-2 ring-slate-900/5 */
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
