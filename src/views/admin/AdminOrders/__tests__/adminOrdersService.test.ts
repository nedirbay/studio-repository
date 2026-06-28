import { vi, describe, it, expect } from 'vitest'

const m = vi.hoisted(() => ({
  orders: {
    list: vi.fn().mockResolvedValue([{ id: 1 }]),
    detail: vi.fn().mockResolvedValue({ id: 1, total_amount: 100 }),
    create: vi.fn().mockResolvedValue({ id: 2 }),
    update: vi.fn().mockResolvedValue({ id: 1 }),
    remove: vi.fn().mockResolvedValue({ deleted: true }),
    byStaff: vi.fn().mockResolvedValue([{ id: 1 }])
  }
}))
vi.mock('../../../../repositories', () => ({
  repositories: {
    orders: m.orders
  }
}))

import { adminOrdersService } from '../adminOrdersService'

describe('adminOrdersService', () => {
  it('list', async () => {
    expect(await adminOrdersService.list()).toEqual([{ id: 1 }])
    expect(m.orders.list).toHaveBeenCalled()
  })
  it('detail', async () => {
    expect(await adminOrdersService.detail(1)).toEqual({ id: 1, total_amount: 100 })
    expect(m.orders.detail).toHaveBeenCalledWith(1)
  })
  it('create', async () => {
    const payload = { customer_name: 'Name', customer_phone: '123', total_amount: 100, paid_amount: 50 }
    expect(await adminOrdersService.create(payload)).toEqual({ id: 2 })
    expect(m.orders.create).toHaveBeenCalledWith(payload)
  })
  it('update', async () => {
    const payload = { customer_name: 'Name', customer_phone: '123', total_amount: 100, paid_amount: 50 }
    expect(await adminOrdersService.update(1, payload)).toEqual({ id: 1 })
    expect(m.orders.update).toHaveBeenCalledWith(1, payload)
  })
  it('remove', async () => {
    expect(await adminOrdersService.remove(1)).toEqual({ deleted: true })
    expect(m.orders.remove).toHaveBeenCalledWith(1)
  })
  it('byStaff', async () => {
    expect(await adminOrdersService.byStaff(4)).toEqual([{ id: 1 }])
    expect(m.orders.byStaff).toHaveBeenCalledWith(4)
  })
})
