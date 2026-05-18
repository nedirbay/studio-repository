import { BaseRepository } from '../../../utils/http'
import type { User } from '../types'

export class UserRepository extends BaseRepository {
  async list(): Promise<User[]> {
    const res = await this.client.get('users/')
    return res.data
  }

  async create(payload: Partial<User> & { password?: string; role_input?: string }) {
    const res = await this.client.post('users/', payload)
    return res.data
  }

  async update(id: number, payload: Partial<User> & { password?: string; role_input?: string }) {
    const res = await this.client.put(`users/${id}/`, payload)
    return res.data
  }

  async remove(id: number) {
    const res = await this.client.delete(`users/${id}/`)
    return res.data
  }
}
