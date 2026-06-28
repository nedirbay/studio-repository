import { repositories } from '../../../repositories'

export const adminGiftsService = {
  fetchCampaigns(filters?: { type?: string; status?: string }) {
    return repositories.gifts.fetchCampaigns(filters)
  },
  createCampaign(data: any) {
    return repositories.gifts.createCampaign(data)
  },
  updateCampaign(id: number, data: any) {
    return repositories.gifts.updateCampaign(id, data)
  },
  deleteCampaign(id: number) {
    return repositories.gifts.deleteCampaign(id)
  },
  fetchCampaignParticipants(campaignId: number) {
    return repositories.gifts.fetchCampaignParticipants(campaignId)
  },
  updateParticipantStatus(id: number, status: string) {
    return repositories.gifts.updateParticipantStatus(id, status)
  }
}
