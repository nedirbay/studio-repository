import { describe, it, expect, beforeEach } from 'vitest'
import { StudioOrderRepository } from '../studioOrderRepository'
import { buildPayload, computeTotal } from '../studioOrderService'
import { makeTestClient } from '../../../repositories/__tests__/_testClient'

let repo: StudioOrderRepository
let mock: ReturnType<typeof makeTestClient>['mock']

beforeEach(() => {
  const t = makeTestClient()
  mock = t.mock
  repo = new StudioOrderRepository(t.client)
})

describe('StudioOrderRepository', () => {
  it('lists orders from the management endpoint', async () => {
    mock.onGet('management/orders').reply(200, [{ id: 1 }])
    expect(await repo.listOrders()).toHaveLength(1)
  })

  it('creates an order', async () => {
    mock.onPost('management/orders').reply(201, { id: 7 })
    const res = await repo.createOrder({
      customer_name: 'A',
      customer_phone: '1',
      order_type_id: null,
      total_amount: 0,
      paid_amount: 0,
      days: [],
      staff: [],
    })
    expect(res.id).toBe(7)
  })

  it('deletes an order by id', async () => {
    mock.onDelete('management/orders/7').reply(200, { deleted: true })
    expect((await repo.deleteOrder(7)).deleted).toBe(true)
  })

  it('sets an order status via PATCH', async () => {
    mock.onPatch('management/orders/7').reply((c) => {
      expect(JSON.parse(c.data)).toEqual({ status: 'approved' })
      return [200, { id: 7, status: 'approved' }]
    })
    const res = await repo.setOrderStatus(7, 'approved')
    expect(res.status).toBe('approved')
  })

  it('loads catalogs', async () => {
    mock.onGet('management/equipments').reply(200, [{ id: 1, name: 'Kamera', count: 2 }])
    mock.onGet('management/services').reply(200, [{ id: 1, name: 'Montaž' }])
    mock.onGet('management/order-types').reply(200, [{ id: 1, name: 'Toý' }])
    expect(await repo.listEquipments()).toHaveLength(1)
    expect(await repo.listServices()).toHaveLength(1)
    expect(await repo.listOrderTypes()).toHaveLength(1)
  })
})

describe('studioOrderService payload', () => {
  it('computeTotal sums day prices', () => {
    expect(computeTotal([
      { date: '2026-07-01', address: 'x', daily_price: 500, equipments: [], services: [] },
      { date: '2026-07-02', address: 'y', daily_price: 300, equipments: [], services: [] },
    ])).toBe(800)
  })

  it('buildPayload shapes nested days like sync_service expects', () => {
    const payload = buildPayload({
      customer_name: ' Aman ',
      customer_phone: ' 123 ',
      order_type_id: 2,
      days: [
        {
          date: '2026-07-01',
          time: '10:00',
          address: 'Aşgabat',
          daily_price: 500,
          equipments: [{ equipment_id: 5, count: 2 }, { equipment_id: 0, count: 1 }],
          services: [{ service_id: 3, count: 1 }],
        },
      ],
    })
    expect(payload.customer_name).toBe('Aman')
    expect(payload.customer_phone).toBe('123')
    expect(payload.total_amount).toBe(500)
    expect(payload.paid_amount).toBe(0)
    expect(payload.staff).toEqual([])
    // the empty equipment row (id 0) is filtered out
    expect(payload.days[0].equipments).toEqual([{ equipment_id: 5, count: 2 }])
    expect(payload.days[0].services).toEqual([{ service_id: 3, count: 1 }])
  })
})
