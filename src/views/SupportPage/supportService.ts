import { MessageRepository, type ContactMessagePayload } from './messageRepository'

const messages = new MessageRepository()

export const supportService = {
  send(payload: ContactMessagePayload) {
    return messages.create(payload)
  },
}
