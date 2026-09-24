import { repositories } from '../../../repositories'

export const adminBrandsService = {
  list() { 
    return repositories.brands.list() 
  },
  create(payload: { name: string; logo_url?: string }) {
    return repositories.brands.create(payload)
  },
  update(id: number, payload: { name?: string; logo_url?: string }) {
    return repositories.brands.update(id, payload)
  },
  remove(id: number) {
    return repositories.brands.remove(id)
  }
}
