import { reactive } from 'vue'

export const supportPageStore = reactive({
  sending: false,
  form: {
    subject: '',
    message: '',
  },
})

export function resetSupportStore() {
  supportPageStore.sending = false
  supportPageStore.form.subject = ''
  supportPageStore.form.message = ''
}
