import { describe, it, expect } from 'vitest'
import { formFromOrder, isOrderApproved } from '../studioOrderService'
import { buildContractHtml, contractNumber } from '../studioContract'
import type { StudioOrder } from '../../../types'

function makeOrder(overrides: Partial<StudioOrder> = {}): StudioOrder {
  return {
    id: 12,
    customer_name: 'Aman <Test>',
    customer_phone: '+993 65 00 00 00',
    total_amount: 800,
    paid_amount: 300,
    remaining_amount: 500,
    order_type_id: 2,
    created_at: '2026-06-01T10:00:00Z',
    days: [
      {
        id: 1,
        date: '2026-07-01',
        time: '10:00',
        address: 'Aşgabat, Görogly köç.',
        daily_price: 500,
        equipments: [{ id: 9, equipment_id: 5, equipment_name: 'Kamera', count: 2 }],
        services: [{ id: 8, service_id: 3, service_name: 'Montaž', count: 1 }],
      },
    ],
    staff: [],
    ...overrides,
  }
}

describe('isOrderApproved', () => {
  it('is true for the is_approved flag', () => {
    expect(isOrderApproved(makeOrder({ is_approved: true }))).toBe(true)
  })
  it('is true for an approved status string', () => {
    expect(isOrderApproved(makeOrder({ status: 'approved' }))).toBe(true)
    expect(isOrderApproved(makeOrder({ status: 'confirmed' }))).toBe(true)
  })
  it('is false when pending or missing', () => {
    expect(isOrderApproved(makeOrder({ status: 'pending' }))).toBe(false)
    expect(isOrderApproved(makeOrder({}))).toBe(false)
  })
})

describe('formFromOrder', () => {
  it('maps a saved order back into an editable form', () => {
    const form = formFromOrder(makeOrder())
    expect(form.customer_name).toBe('Aman <Test>')
    expect(form.order_type_id).toBe(2)
    expect(form.days).toHaveLength(1)
    expect(form.days[0].address).toBe('Aşgabat, Görogly köç.')
    expect(form.days[0].equipments).toEqual([{ equipment_id: 5, count: 2 }])
    expect(form.days[0].services).toEqual([{ service_id: 3, count: 1 }])
  })
})

describe('buildContractHtml', () => {
  it('numbers the contract from the order id', () => {
    expect(contractNumber(makeOrder())).toBe('ŞZ-00012')
  })

  it('includes customer, totals and day details', () => {
    const html = buildContractHtml(makeOrder())
    expect(html).toContain('ŞZ-00012')
    expect(html).toContain('+993 65 00 00 00')
    expect(html).toContain('Kamera ×2')
    expect(html).toContain('Montaž ×1')
    expect(html).toContain('Aşgabat, Görogly köç.')
  })

  it('escapes HTML in user-supplied fields', () => {
    const html = buildContractHtml(makeOrder())
    expect(html).toContain('Aman &lt;Test&gt;')
    expect(html).not.toContain('Aman <Test>')
  })
})
