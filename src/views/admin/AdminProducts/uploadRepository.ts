import { BaseRepository } from '../../../utils/http'

export class UploadRepository extends BaseRepository {
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await this.client.post('commerce/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  }
}
