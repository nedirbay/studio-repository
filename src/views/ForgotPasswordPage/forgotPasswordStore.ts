import { reactive } from 'vue'

export const forgotPasswordPageStore = reactive({
  loading: false,
  step: 'email' as 'email' | 'reset',
  email: '',
  code: '',
  newPassword: '',
})

export function resetForgotPasswordStore() {
  forgotPasswordPageStore.loading = false
  forgotPasswordPageStore.step = 'email'
  forgotPasswordPageStore.email = ''
  forgotPasswordPageStore.code = ''
  forgotPasswordPageStore.newPassword = ''
}
