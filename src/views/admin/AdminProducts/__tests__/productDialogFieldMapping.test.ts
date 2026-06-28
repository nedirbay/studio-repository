import { describe, it, expect } from 'vitest'

/**
 * Tests for ProductDialog field mapping & addSpec immutable logic.
 *
 * Frontend form field  →  backend API field
 * ─────────────────────────────────────────
 * form.name            → name
 * form.price           → price
 * form.originalPrice   → original_price
 * form.inStock         → instock
 * form.brand           → marka
 * form.category        → category (name string, resolved to ID by parent)
 * form.badge           → badge
 * form.description     → description
 * form.specifications  → specifications (JSONField dict)
 * fileList             → media (array of {kind, url})
 */

// ── Inline helpers from ProductDialog ──────────────────────────────────────

interface FormData {
  id?: number
  name: string
  price: number
  originalPrice?: number | null
  inStock?: boolean
  brand?: string
  badge?: string | null
  description?: string
  specifications?: Record<string, string>
  category?: string
}

interface FileEntry {
  url: string
  rawUrl?: string
}

/** Mirrors handleSave logic (after toRaw + immutable spread fix) */
function mapFormToPayload(form: FormData, fileList: FileEntry[]) {
  const media = fileList.map(f => ({
    kind: 'image',
    url: f.rawUrl || f.url
  }))
  const specs = { ...(form.specifications ?? {}) }   // toRaw equivalent in plain TS
  return {
    id: form.id,
    name: form.name,
    price: form.price,
    original_price: form.originalPrice ?? null,
    instock: form.inStock ?? true,
    marka: form.brand ?? '',
    badge: form.badge ?? null,
    description: form.description ?? '',
    specifications: specs,
    category: form.category,
    media
  }
}

/** Mirrors addSpec immutable update logic */
function addSpec(
  current: Record<string, string>,
  key: string,
  val: string
): Record<string, string> {
  return {
    ...current,
    [key]: val,
  }
}

/** Mirrors removeSpec logic */
function removeSpec(
  current: Record<string, string>,
  key: string
): Record<string, string> {
  const copy = { ...current }
  delete copy[key]
  return copy
}

/** Mirrors updateSpecKey logic */
function updateSpecKey(
  current: Record<string, string>,
  oldKey: string,
  newKey: string
): Record<string, string> {
  if (!newKey.trim() || newKey === oldKey) return current
  const copy = { ...current }
  const val = copy[oldKey]
  delete copy[oldKey]
  copy[newKey.trim()] = val
  return copy
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('ProductDialog — form field → backend field mapping', () => {
  it('maps name, price, description correctly', () => {
    const payload = mapFormToPayload(
      { name: 'Sony A7 IV', price: 1299.99, description: 'Great camera' },
      []
    )
    expect(payload.name).toBe('Sony A7 IV')
    expect(payload.price).toBe(1299.99)
    expect(payload.description).toBe('Great camera')
  })

  it('maps originalPrice (camelCase) → original_price (snake_case)', () => {
    const payload = mapFormToPayload({ name: 'X', price: 100, originalPrice: 150 }, [])
    expect(payload.original_price).toBe(150)
    expect((payload as any).originalPrice).toBeUndefined()
  })

  it('maps inStock (camelCase) → instock (snake_case)', () => {
    expect(mapFormToPayload({ name: 'X', price: 1, inStock: true }, []).instock).toBe(true)
    expect(mapFormToPayload({ name: 'X', price: 1, inStock: false }, []).instock).toBe(false)
    expect((mapFormToPayload({ name: 'X', price: 1, inStock: true }, []) as any).inStock).toBeUndefined()
  })

  it('maps brand → marka', () => {
    const payload = mapFormToPayload({ name: 'X', price: 1, brand: 'Sony' }, [])
    expect(payload.marka).toBe('Sony')
    expect((payload as any).brand).toBeUndefined()
  })

  it('maps badge correctly', () => {
    expect(mapFormToPayload({ name: 'X', price: 1, badge: 'new' }, []).badge).toBe('new')
    expect(mapFormToPayload({ name: 'X', price: 1 }, []).badge).toBeNull()
  })

  it('maps specifications (object) correctly', () => {
    const payload = mapFormToPayload(
      { name: 'X', price: 1, specifications: { Sensor: 'Full-frame', Weight: '659g' } },
      []
    )
    expect(payload.specifications).toEqual({ Sensor: 'Full-frame', Weight: '659g' })
  })

  it('maps category name unchanged (parent resolves to ID)', () => {
    const payload = mapFormToPayload({ name: 'X', price: 1, category: 'Kameralar' }, [])
    expect(payload.category).toBe('Kameralar')
  })

  it('builds media array from fileList using rawUrl when available', () => {
    const fileList = [
      { url: 'http://127.0.0.1:8000/media/products/img.jpg', rawUrl: '/media/products/img.jpg' },
      { url: 'https://external.com/vid.mp4' }
    ]
    const payload = mapFormToPayload({ name: 'X', price: 1 }, fileList)
    expect(payload.media).toEqual([
      { kind: 'image', url: '/media/products/img.jpg' },
      { kind: 'image', url: 'https://external.com/vid.mp4' }
    ])
  })

  it('defaults original_price to null', () => {
    expect(mapFormToPayload({ name: 'X', price: 1 }, []).original_price).toBeNull()
  })

  it('defaults instock to true', () => {
    expect(mapFormToPayload({ name: 'X', price: 1 }, []).instock).toBe(true)
  })

  it('defaults specifications to {}', () => {
    expect(mapFormToPayload({ name: 'X', price: 1 }, []).specifications).toEqual({})
  })

  it('specifications is a plain object (not reactive proxy)', () => {
    const specs = { Sensor: 'APS-C' }
    const payload = mapFormToPayload({ name: 'X', price: 1, specifications: specs }, [])
    // Spread creates a new plain object — not the same reference
    expect(payload.specifications).not.toBe(specs)
    expect(payload.specifications).toEqual({ Sensor: 'APS-C' })
  })

  it('full form payload contains no camelCase field names', () => {
    const payload = mapFormToPayload(
      {
        id: 1,
        name: 'Full Test',
        price: 500,
        originalPrice: 600,
        inStock: true,
        brand: 'Canon',
        badge: 'hot',
        description: 'Desc',
        specifications: { k: 'v' },
        category: 'Kameralar',
      },
      [{ url: 'http://host/img.jpg', rawUrl: '/media/img.jpg' }]
    )
    expect((payload as any).originalPrice).toBeUndefined()
    expect((payload as any).inStock).toBeUndefined()
    expect((payload as any).brand).toBeUndefined()
    expect(payload.original_price).toBe(600)
    expect(payload.instock).toBe(true)
    expect(payload.marka).toBe('Canon')
    expect(payload.media[0].url).toBe('/media/img.jpg')
  })
})

// ── addSpec immutable update tests ─────────────────────────────────────────

describe('addSpec — immutable update (specifications never mutated in place)', () => {
  it('adds a new key-value pair', () => {
    const before = { Sensor: 'Full-frame' }
    const after = addSpec(before, 'Weight', '659g')
    expect(after).toEqual({ Sensor: 'Full-frame', Weight: '659g' })
  })

  it('returns a NEW object (not same reference)', () => {
    const before = {}
    const after = addSpec(before, 'Color', 'Black')
    expect(after).not.toBe(before)
  })

  it('overwrites existing key', () => {
    const before = { Sensor: 'APS-C' }
    const after = addSpec(before, 'Sensor', 'Full-frame')
    expect(after.Sensor).toBe('Full-frame')
  })

  it('works on empty object', () => {
    const after = addSpec({}, 'ISO', '100-51200')
    expect(after).toEqual({ ISO: '100-51200' })
  })

  it('original object is NOT mutated', () => {
    const before: Record<string, string> = { A: '1' }
    addSpec(before, 'B', '2')
    expect(before).toEqual({ A: '1' })   // unchanged
  })
})

// ── removeSpec tests ────────────────────────────────────────────────────────

describe('removeSpec — removes key immutably', () => {
  it('removes an existing key', () => {
    const after = removeSpec({ A: '1', B: '2' }, 'A')
    expect(after).toEqual({ B: '2' })
  })

  it('returns new object', () => {
    const before = { A: '1' }
    expect(removeSpec(before, 'A')).not.toBe(before)
  })

  it('handles removing non-existent key gracefully', () => {
    const after = removeSpec({ A: '1' }, 'Z')
    expect(after).toEqual({ A: '1' })
  })
})

// ── updateSpecKey tests ─────────────────────────────────────────────────────

describe('updateSpecKey — renames a key immutably', () => {
  it('renames an existing key', () => {
    const after = updateSpecKey({ OldKey: 'value' }, 'OldKey', 'NewKey')
    expect(after).toEqual({ NewKey: 'value' })
    expect(after).not.toHaveProperty('OldKey')
  })

  it('returns same object if key unchanged', () => {
    const before = { A: '1' }
    const after = updateSpecKey(before, 'A', 'A')
    expect(after).toBe(before)
  })

  it('trims whitespace from new key', () => {
    const after = updateSpecKey({ A: '1' }, 'A', '  B  ')
    expect(after).toHaveProperty('B')
  })
})
