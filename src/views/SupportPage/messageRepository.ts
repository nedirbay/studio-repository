import { BaseRepository } from '../../utils/http'

export interface ContactMessagePayload {
  subject: string
  message: string
  product?: number | null
}

export class MessageRepository extends BaseRepository {
  async list(): Promise<any[]> {
    const res = await this.client.get('commerce/messages')
    return res.data
  }

  async create(payload: ContactMessagePayload) {
    const res = await this.client.post('commerce/messages', payload)
    return res.data
  }

  async reply(id: number, replyText: string) {
    const res = await this.client.put(`commerce/messages/${id}`, { reply: replyText })
    return res.data
  }

  async markRead(id: number, isRead: boolean = true) {
    const res = await this.client.put(`commerce/messages/${id}`, { is_read: isRead })
    return res.data
  }

  async remove(id: number) {
    const res = await this.client.delete(`commerce/messages/${id}`)
    return res.data
  }
}
