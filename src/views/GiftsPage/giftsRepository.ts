import { BaseRepository } from '../../utils/http'
import type { Campaign } from '../types'

export interface CampaignFilters {
  type?: 'giveaway' | 'promotion' | 'gift'
  status?: 'draft' | 'active' | 'finished' | 'cancelled'
}

export interface JoinCampaignPayload {
  full_name: string
  phone: string
  email?: string
  note?: string
}

export class GiftsRepository extends BaseRepository {
  async listCampaigns(filters: CampaignFilters = {}): Promise<Campaign[]> {
    const res = await this.client.get('gifts/campaigns/', { params: filters })
    return Array.isArray(res.data) ? res.data : (res.data.results || [])
  }

  async featured(): Promise<Campaign[]> {
    const res = await this.client.get('gifts/campaigns/featured/')
    return Array.isArray(res.data) ? res.data : (res.data.results || [])
  }

  async join(campaignId: number, payload: JoinCampaignPayload) {
    const res = await this.client.post(`gifts/campaigns/${campaignId}/join/`, payload)
    return res.data
  }
}
