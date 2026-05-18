import { reactive } from 'vue'

export const registerPageStore = reactive({
  loading: false,
  step: 'form' as 'form' | 'otp',
  email: '',
  form: {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
  otpCode: '',
})

export function resetRegisterPageStore() {
  registerPageStore.loading = false
  registerPageStore.step = 'form'
  registerPageStore.email = ''
  registerPageStore.otpCode = ''
  registerPageStore.form.username = ''
  registerPageStore.form.email = ''
  registerPageStore.form.password = ''
  registerPageStore.form.confirmPassword = ''
}
