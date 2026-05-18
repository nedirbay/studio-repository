import { repositories } from '../../../repositories'

export const adminMessagesService = {
  list() { return repositories.messages.list() },
  reply(id: number, replyText: string) { return repositories.messages.reply(id, replyText) },
  markRead(id: number, isRead = true) { return repositories.messages.markRead(id, isRead) },
  remove(id: number) { return repositories.messages.remove(id) },
}
