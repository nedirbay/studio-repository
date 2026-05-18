import { reactive } from 'vue'
import type { Campaign } from '../../types'

export const giftsPageStore = reactive({
  loading: false,
  filter: {
    type: '' as '' | 'giveaway' | 'promotion' | 'gift',
    status: '' as '' | 'draft' | 'active' | 'finished' | 'cancelled',
  },
  campaigns: [] as Campaign[],
  featured: [] as Campaign[],
  selectedCampaign: null as Campaign | null,
  joinForm: {
    full_name: '',
    phone: '',
    email: '',
    note: '',
  },
})

export function resetGiftsStore() {
  giftsPageStore.loading = false
  giftsPageStore.filter.type = ''
  giftsPageStore.filter.status = ''
  giftsPageStore.campaigns = []
  giftsPageStore.featured = []
  giftsPageStore.selectedCampaign = null
  giftsPageStore.joinForm.full_name = ''
  giftsPageStore.joinForm.phone = ''
  giftsPageStore.joinForm.email = ''
  giftsPageStore.joinForm.note = ''
}
