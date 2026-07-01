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

  async fetchCampaigns(filters: any = {}): Promise<Campaign[]> {
    return this.listCampaigns(filters)
  }

  async createCampaign(data: any): Promise<Campaign> {
    const res = await this.client.post('gifts/campaigns/', data)
    return res.data
  }

  async updateCampaign(id: number, data: any): Promise<Campaign> {
    const res = await this.client.put(`gifts/campaigns/${id}/`, data)
    return res.data
  }

  async deleteCampaign(id: number): Promise<void> {
    await this.client.delete(`gifts/campaigns/${id}/`)
  }

  async fetchCampaignParticipants(campaignId: number): Promise<any[]> {
    const res = await this.client.get(`gifts/campaigns/${campaignId}/join/`)
    return res.data
  }

  async updateParticipantStatus(id: number, status: string): Promise<any> {
    const res = await this.client.patch(`gifts/participations/${id}/`, { status })
    return res.data
  }
}
