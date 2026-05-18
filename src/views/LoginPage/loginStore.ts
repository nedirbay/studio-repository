import { reactive } from 'vue'

export const loginPageStore = reactive({
  loading: false,
  rememberMe: false,
  form: {
    username: '',
    password: '',
  },
})

export function resetLoginPageStore() {
  loginPageStore.loading = false
  loginPageStore.rememberMe = false
  loginPageStore.form.username = ''
  loginPageStore.form.password = ''
}
