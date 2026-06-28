import { BaseRepository } from './base'

export interface MobileAppVersion {
  id: number
  version_name: string
  version_code: number
  file_url: string | null
  is_active: boolean
  description: string
  created_at: string
  updated_at: string
}

export class MobileAppRepository extends BaseRepository {
  async getActive(): Promise<MobileAppVersion | null> {
    const res = await this.client.get('mobile-apps/active')
    return res.data
  }

  async listVersions(): Promise<MobileAppVersion[]> {
    const res = await this.client.get('mobile-apps/versions')
    return res.data
  }

  async uploadVersion(formData: FormData): Promise<MobileAppVersion> {
    const res = await this.client.post('mobile-apps/versions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  }

  async activateVersion(id: number): Promise<{ success: boolean; version: MobileAppVersion }> {
    const res = await this.client.post(`mobile-apps/versions/${id}/activate`)
    return res.data
  }

  async deleteVersion(id: number): Promise<{ success: boolean }> {
    const res = await this.client.delete(`mobile-apps/versions/${id}`)
    return res.data
  }
}
