import { UserRepository } from './userRepository'
import type { User } from '../../../types'

type UserPayload = Partial<User> & { password?: string; role_input?: string }

const users = new UserRepository()

export const adminUsersService = {
  list() { return users.list() },
  create(payload: UserPayload) { return users.create(payload) },
  update(id: number, payload: UserPayload) { return users.update(id, payload) },
  remove(id: number) { return users.remove(id) },
}
