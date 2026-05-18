import { GiftsRepository, type CampaignFilters, type JoinCampaignPayload } from './giftsRepository'

const gifts = new GiftsRepository()

export const giftsService = {
  list(filters: CampaignFilters = {}) { return gifts.listCampaigns(filters) },
  featured() { return gifts.featured() },
  join(campaignId: number, payload: JoinCampaignPayload) { return gifts.join(campaignId, payload) },
}
