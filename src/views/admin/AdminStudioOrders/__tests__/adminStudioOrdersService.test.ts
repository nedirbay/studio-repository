import { vi, describe, it, expect } from 'vitest'

const svc = vi.hoisted(() => ({
  listOrders: vi.fn().mockResolvedValue([{ id: 1 }]),
  getOrder: vi.fn().mockResolvedValue({ id: 1 }),
  updateOrder: vi.fn().mockResolvedValue({ updated: true }),
  deleteOrder: vi.fn().mockResolvedValue({ deleted: true }),
  setOrderStatus: vi.fn().mockResolvedValue({ id: 1, status: 'completed' }),
  approveOrder: vi.fn().mockResolvedValue({ id: 1, status: 'approved' }),
  rejectOrder: vi.fn().mockResolvedValue({ id: 1, status: 'rejected' }),
}))

vi.mock('../../../StudioOrderPage/studioOrderService', () => ({
  studioOrderService: svc,
  isOrderApproved: (o: { status?: string; is_approved?: boolean }) =>
    o.is_approved === true || o.status === 'approved',
}))

import { adminStudioOrdersService, isOrderApproved } from '../adminStudioOrdersService'

describe('adminStudioOrdersService', () => {
  it('list forwards to the shared service', async () => {
    expect((await adminStudioOrdersService.list()).length).toBe(1)
    expect(svc.listOrders).toHaveBeenCalled()
  })

  it('approve delegates to approveOrder', async () => {
    const res = await adminStudioOrdersService.approve(1)
    expect(svc.approveOrder).toHaveBeenCalledWith(1)
    expect(res.status).toBe('approved')
  })

  it('reject delegates to rejectOrder', async () => {
    await adminStudioOrdersService.reject(1)
    expect(svc.rejectOrder).toHaveBeenCalledWith(1)
  })

  it('setStatus passes the status through', async () => {
    await adminStudioOrdersService.setStatus(1, 'completed')
    expect(svc.setOrderStatus).toHaveBeenCalledWith(1, 'completed')
  })

  it('remove deletes by id', async () => {
    expect((await adminStudioOrdersService.remove(1)).deleted).toBe(true)
  })

  it('re-exports isOrderApproved', () => {
    expect(isOrderApproved({ status: 'approved' })).toBe(true)
    expect(isOrderApproved({ status: 'pending' })).toBe(false)
  })
})
