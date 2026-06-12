import { BaseRepository } from '../../utils/http'
import type { PhotoCollection, PhotoReel, PhotoReelComment } from '../../types'

export interface ReelListOptions {
  category?: number
  kind?: 'video' | 'image'
  collection?: number
}

export interface CollectionListOptions {
  kind?: 'video' | 'image'
  category?: number
}

export class PhotoStudioRepository extends BaseRepository {
  async listCategories() {
    const res = await this.client.get('photostudio/categories/')
    return res.data
  }

  async listCollections(opts: CollectionListOptions = {}): Promise<PhotoCollection[]> {
    const res = await this.client.get('photostudio/collections/', { params: opts })
    return Array.isArray(res.data) ? res.data : (res.data.results || [])
  }

  async fetchCollectionItems(collectionId: number, offset: number = 0, limit: number = 1) {
    const res = await this.client.get(`photostudio/collections/${collectionId}/items/`, {
      params: { offset, limit },
    })
    return res.data
  }

  async listReels(opts: ReelListOptions = {}): Promise<PhotoReel[]> {
    const res = await this.client.get('photostudio/reels/', { params: opts })
    return Array.isArray(res.data) ? res.data : (res.data.results || [])
  }

  async registerView(reelId: number) {
    const res = await this.client.post(`photostudio/reels/${reelId}/view/`)
    return res.data
  }

  async toggleLike(reelId: number): Promise<{ liked: boolean; likes_count: number }> {
    const res = await this.client.post(`photostudio/reels/${reelId}/like/`)
    return res.data
  }

  async listComments(reelId: number): Promise<PhotoReelComment[]> {
    const res = await this.client.get(`photostudio/reels/${reelId}/comments/`)
    return res.data
  }

  async addComment(reelId: number, text: string, parent: number | null = null) {
    const res = await this.client.post(`photostudio/reels/${reelId}/comments/`, { text, parent })
    return res.data
  }

  async shareReel(reelId: number, channel: string = '') {
    const res = await this.client.post(`photostudio/reels/${reelId}/share/`, { channel })
    return res.data
  }

  // --- Admin management (create / update / delete) -----------------------
  async createReel(payload: Partial<PhotoReel>): Promise<PhotoReel> {
    const res = await this.client.post('photostudio/reels/', payload)
    return res.data
  }

  async updateReel(reelId: number, payload: Partial<PhotoReel>): Promise<PhotoReel> {
    const res = await this.client.patch(`photostudio/reels/${reelId}/`, payload)
    return res.data
  }

  async deleteReel(reelId: number): Promise<void> {
    await this.client.delete(`photostudio/reels/${reelId}/`)
  }

  async createCollection(payload: Partial<PhotoCollection>): Promise<PhotoCollection> {
    const res = await this.client.post('photostudio/collections/', payload)
    return res.data
  }

  async updateCollection(
    collectionId: number,
    payload: Partial<PhotoCollection>,
  ): Promise<PhotoCollection> {
    const res = await this.client.patch(`photostudio/collections/${collectionId}/`, payload)
    return res.data
  }

  async deleteCollection(collectionId: number): Promise<void> {
    await this.client.delete(`photostudio/collections/${collectionId}/`)
  }
}
