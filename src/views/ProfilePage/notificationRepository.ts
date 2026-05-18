import { BaseRepository } from '../../utils/http'

export class NotificationRepository extends BaseRepository {
  async list(): Promise<any[]> {
    const res = await this.client.get('notifications')
    return res.data
  }

  async markAllRead() {
    const res = await this.client.put('notifications/read')
    return res.data
  }

  async remove(id: number) {
    const res = await this.client.delete(`notifications/${id}`)
    return res.data
  }
}
