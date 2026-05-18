import { describe, it, expect, beforeEach } from 'vitest'
import { UploadRepository } from '../uploadRepository'
import { OrderRepository } from '../orderRepository'
import { NotificationRepository } from '../notificationRepository'
import { makeTestClient } from './_testClient'

let mock: ReturnType<typeof makeTestClient>['mock']
let client: ReturnType<typeof makeTestClient>['client']

beforeEach(() => {
  const t = makeTestClient()
  mock = t.mock
  client = t.client
})

describe('UploadRepository', () => {
  it('uploads an image as multipart and returns url', async () => {
    mock.onPost('commerce/upload').reply(201, { url: '/media/products/x.jpg' })
    const file = new File(['hello'], 'x.jpg', { type: 'image/jpeg' })
    const res = await new UploadRepository(client).uploadImage(file)
    expect(res.url).toBe('/media/products/x.jpg')
    expect(mock.history.post[0].headers?.['Content-Type']).toBe('multipart/form-data')
  })
})

describe('OrderRepository', () => {
  it('list / detail / create / update / remove / byStaff', async () => {
    mock.onGet('orders').reply(200, [{ id: 1 }])
    mock.onGet('orders/1').reply(200, { id: 1 })
    mock.onPost('orders').reply(201, { id: 9 })
    mock.onPut('orders/9').reply(200, { updated: true })
    mock.onDelete('orders/9').reply(200, { deleted: true })
    mock.onGet('orders/staff/3').reply(200, [{ id: 9 }])

    const repo = new OrderRepository(client)
    expect((await repo.list()).length).toBe(1)
    expect((await repo.detail(1)).id).toBe(1)
    expect((await repo.create({
      customer_name: 'A', customer_phone: '111', total_amount: 100, paid_amount: 0,
    })).id).toBe(9)
    expect((await repo.update(9, {
      customer_name: 'A', customer_phone: '111', total_amount: 100, paid_amount: 50,
    })).updated).toBe(true)
    expect((await repo.remove(9)).deleted).toBe(true)
    expect((await repo.byStaff(3))[0].id).toBe(9)
  })
})

describe('NotificationRepository', () => {
  it('lists, marks all read, removes', async () => {
    mock.onGet('notifications').reply(200, [{ id: 1, is_read: false }])
    mock.onPut('notifications/read').reply(200, { success: true })
    mock.onDelete('notifications/1').reply(200, { success: true })

    const repo = new NotificationRepository(client)
    expect((await repo.list()).length).toBe(1)
    expect((await repo.markAllRead()).success).toBe(true)
    expect((await repo.remove(1)).success).toBe(true)
  })
})
